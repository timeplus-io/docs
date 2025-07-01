// A script to find markdown files in the 'docs' folder that are not referenced in 'sidebars.js'.
//
// USAGE:
// 1. Place this file in the root of your Docusaurus project.
// 2. Run it from your terminal using `node ./mising.js` or `bun ./mising.js`
//
// It will print the list of unreferenced files to the console.

const fs = require("fs/promises");
const path = require("path");

// --- Configuration ---
// Adjust these paths if your project structure is different.
const SIDEBARS_PATH = path.join(process.cwd(), "sidebars.js");
const DOCS_PATH = path.join(process.cwd(), "docs");
// --- End Configuration ---

/**
 * Recursively traverses the sidebar object/array to find all doc IDs.
 * @param {any} item - The current item in the sidebar structure.
 * @param {Set<string>} ids - The set to store the found IDs.
 */
function findReferencedIds(item, ids) {
  if (!item) {
    return;
  }

  // Case 1: Item is an array (e.g., 'items' array or a whole sidebar)
  if (Array.isArray(item)) {
    item.forEach((subItem) => findReferencedIds(subItem, ids));
    return;
  }

  // Case 2: Item is a string shorthand for a doc
  // e.g., 'my-doc-id'
  if (typeof item === "string") {
    ids.add(item);
    return;
  }

  // Case 3: Item is an object
  if (typeof item === "object") {
    // Check for a doc type: { type: 'doc', id: '...' }
    if (item.type === "doc" && item.id) {
      ids.add(item.id);
    }
    // Check for a category's own link: { type: 'category', link: { type: 'doc', id: '...' } }
    if (item.link && item.link.type === "doc" && item.link.id) {
      ids.add(item.link.id);
    }
    // Recurse into 'items' array if it exists
    if (item.items) {
      findReferencedIds(item.items, ids);
    }
  }
}

/**
 * Main function to run the script.
 */
async function main() {
  console.log("🔍 Starting analysis...");

  // --- Step 1: Get all referenced doc IDs from sidebars.js ---
  const referencedIds = new Set();
  try {
    // Using require() is a simple way to load and execute the JS config file.
    const sidebarsConfig = require(SIDEBARS_PATH);
    console.log(`✅ Successfully loaded ${SIDEBARS_PATH}`);

    // Iterate over each sidebar defined in the config (e.g., 'docSidebar', 'tutorialSidebar')
    for (const sidebarName in sidebarsConfig) {
      findReferencedIds(sidebarsConfig[sidebarName], referencedIds);
    }
    console.log(
      `Found ${referencedIds.size} unique doc IDs referenced in sidebars.`,
    );
  } catch (error) {
    console.error(
      `❌ Error reading or parsing ${SIDEBARS_PATH}:`,
      error.message,
    );
    process.exit(1);
  }

  // --- Step 2: Get all file IDs from the docs folder ---
  const diskFileIds = new Set();
  try {
    const files = await fs.readdir(DOCS_PATH);
    console.log(`✅ Successfully scanned ${DOCS_PATH}`);

    files.forEach((file) => {
      // We only care about .md and .mdx files
      if (file.endsWith(".md") || file.endsWith(".mdx")) {
        // The ID is the filename without the extension
        const id = path.basename(file, path.extname(file));
        diskFileIds.add(id);
      }
    });
    console.log(`Found ${diskFileIds.size} markdown files in the docs folder.`);
  } catch (error) {
    console.error(
      `❌ Error reading docs directory at ${DOCS_PATH}:`,
      error.message,
    );
    process.exit(1);
  }

  // --- Step 3: Compare the two sets and find the difference ---
  const unreferencedFiles = [];
  for (const fileId of diskFileIds) {
    if (!referencedIds.has(fileId)) {
      unreferencedFiles.push(fileId);
    }
  }

  // --- Step 4: Report the results ---
  console.log("\n--- Analysis Complete ---");
  if (unreferencedFiles.length === 0) {
    console.log(
      "🎉 Excellent! All markdown files in the docs folder are referenced in sidebars.js.",
    );
  } else {
    console.log(
      `⚠️ Found ${unreferencedFiles.length} unreferenced markdown file(s):`,
    );
    unreferencedFiles.sort().forEach((file) => {
      // Try to find the original extension for a more accurate filename
      const ext =
        [".md", ".mdx"].find((ext) => {
          try {
            fs.access(path.join(DOCS_PATH, file + ext));
            return true;
          } catch {
            return false;
          }
        }) || ".md"; // Default to .md if check fails
      console.log(`  - ${file + ext}`);
    });
    console.log("\nThese files can either be removed or added to sidebars.js.");
  }
  console.log("-------------------------");
}

// Run the main function
main();
