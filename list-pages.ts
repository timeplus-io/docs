import path from 'path';

// --- CONFIGURATION ---
const SIDEBARS_FILE_PATH = './sidebars.js';
const DOCS_FOLDER_PATH = './docs';
// -------------------

// Define types for better code analysis and safety.
// These types represent the structure of Docusaurus sidebar items.
type SidebarItemDoc = {
  type: 'doc';
  id: string;
  label?: string;
};

type SidebarItemLink = {
    type: 'link';
    label: string;
    href: string;
}

type SidebarItemCategory = {
  type: 'category';
  label: string;
  items: SidebarItem[];
  link?: { type: 'doc' | 'generated-index', id?: string };
};

// A sidebar item can be one of the above types, or a string shorthand for a doc.
type SidebarItem = SidebarItemDoc | SidebarItemCategory | SidebarItemLink | string;

// The sidebars file exports an object where keys are sidebar names.
type SidebarsConfig = {
  [sidebarName: string]: SidebarItem[];
};

/**
 * Scans a markdown/mdx file to find the first H1 header (e.g., "# Title").
 * This is more robust than checking only the first line, as MDX files can have
 * imports or frontmatter before the title.
 * @param docId The ID of the doc, which corresponds to the filename (without extension).
 * @returns The extracted header title, or the original docId if not found.
 */
async function getTitleFromMarkdown(docId: string): Promise<string> {
  const mdxPath = path.resolve(DOCS_FOLDER_PATH, `${docId}.mdx`);
  const mdPath = path.resolve(DOCS_FOLDER_PATH, `${docId}.md`);

  let filePath: string | null = null;

  if (await Bun.file(mdxPath).exists()) {
    filePath = mdxPath;
  } else if (await Bun.file(mdPath).exists()) {
    filePath = mdPath;
  }

  if (!filePath) {
    return docId; // File not found, return ID as fallback.
  }

  try {
    const file = Bun.file(filePath);
    const content = await file.text();
    
    // Use a multiline regex to find the first H1 header anywhere in the file.
    // The 'm' flag makes '^' match the beginning of a line, not just the string.
    const match = content.match(/^#\s+(.*)/m);
    
    if (match && match[1]) {
      // match[1] is the captured group (the text after '# ').
      return match[1].trim(); 
    }

  } catch (error) {
    console.warn(`Could not read file for docId: ${docId}`, error);
  }

  // Fallback to the id if no H1 header is found in the file.
  return docId;
}

/**
 * Determines the display name for a sidebar item.
 * It prioritizes the explicit 'label'. If not present, it parses the doc file.
 * @param item The sidebar item object.
 * @returns The resolved display name.
 */
async function getItemName(item: SidebarItem): Promise<string> {
  // Handle string shorthand, e.g., 'my-doc-id'
  if (typeof item === 'string') {
    return getTitleFromMarkdown(item);
  }

  // For object types, the label is always the primary source of truth.
  if ('label' in item && item.label) {
    // For links, add an indicator to show it's an external URL.
    if (item.type === 'link') {
        return `${item.label} ↗`;
    }
    return item.label;
  }
  
  // If it's a doc without a label, parse the markdown file.
  if (item.type === 'doc' && 'id' in item) {
    return getTitleFromMarkdown(item.id);
  }

  // Fallback for categories without a label (unlikely but possible).
  return 'Untitled Category';
}

/**
 * Recursively processes and prints the sidebar items in a tree-like format.
 * @param items The array of sidebar items to process.
 * @param prefix The string prefix for drawing tree lines (e.g., "│   ").
 */
async function printTree(items: SidebarItem[], prefix: string): Promise<void> {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isLast = i === items.length - 1;

    const connector = isLast ? '└──' : '├──';
    const name = await getItemName(item);
    
    console.log(`${prefix}${connector} ${name}`);

    if (typeof item === 'object' && item.type === 'category' && item.items) {
      const childPrefix = prefix + (isLast ? '    ' : '│   ');
      await printTree(item.items, childPrefix);
    }
  }
}

/**
 * Main function to load the sidebars and start the parsing process.
 */
async function main() {
  console.log(`Parsing documentation structure from ${SIDEBARS_FILE_PATH}...\n`);

  try {
    const sidebars: SidebarsConfig = require(path.resolve(SIDEBARS_FILE_PATH));

    for (const [sidebarName, items] of Object.entries(sidebars)) {
      console.log(sidebarName);
      await printTree(items, '');
      console.log('');
    }
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'MODULE_NOT_FOUND') {
        console.error(`Error: Could not find the sidebars file at '${SIDEBARS_FILE_PATH}'.`);
        console.error('Please make sure the path is correct and you are running the script from your project root.');
    } else {
        console.error('An unexpected error occurred:', error);
    }
    process.exit(1);
  }
}

// Run the script
main();