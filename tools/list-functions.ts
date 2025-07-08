#!/usr/bin/env bun

/**
 * Bun.js script to list function names from Timeplus documentation files
 *
 * This script scans all files starting with "functions_for" in the docs folder
 * and extracts function names from h3 headings (###) sorted alphabetically.
 *
 * Usage:
 *   bun run tools/list-functions.ts          # Default formatted output
 *   bun run tools/list-functions.ts --plain  # Plain list output
 *   bun run tools/list-functions.ts --json   # JSON output
 *   bun run tools/list-functions.ts --help   # Show help
 */

import { readdir, readFile } from "fs/promises";
import { join } from "path";

interface FunctionInfo {
  name: string;
  file: string;
  category: string;
}

function showHelp() {
  console.log(`
🔧 Timeplus Functions Lister

Usage:
  bun run tools/list-functions.ts [options]

Options:
  --plain    Output function names only (one per line)
  --json     Output as JSON array with function metadata
  --help     Show this help message

Examples:
  bun run tools/list-functions.ts                    # Formatted output with categories
  bun run tools/list-functions.ts --plain           # Plain text list
  bun run tools/list-functions.ts --json            # JSON format
  bun run tools/list-functions.ts --plain | wc -l   # Count functions
`);
}

async function main() {
  const docsPath = join(__dirname, "../docs");
  const plainOutput = process.argv.includes("--plain");
  const jsonOutput = process.argv.includes("--json");
  const showHelpFlag = process.argv.includes("--help");

  if (showHelpFlag) {
    showHelp();
    return;
  }

  try {
    // Get all files in the docs directory
    const files = await readdir(docsPath);

    // Filter files that start with "functions_for"
    const functionFiles = files.filter(
      (file) => file.startsWith("functions_for") && file.endsWith(".md"),
    );

    const allFunctions: FunctionInfo[] = [];

    // Process each function file
    for (const file of functionFiles) {
      const filePath = join(docsPath, file);
      const content = await readFile(filePath, "utf-8");

      // Extract category from filename (remove "functions_for_" prefix and ".md" suffix)
      const category = file.replace("functions_for_", "").replace(".md", "");

      // Find all h3 headings that represent function names
      const h3Regex = /^### (.+)$/gm;
      let match;

      while ((match = h3Regex.exec(content)) !== null) {
        const functionName = match[1].trim();

        // Skip if it's not a function name (contains spaces or special chars that aren't typical for function names)
        // But allow underscores and numbers which are common in function names
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(functionName)) {
          continue;
        }

        allFunctions.push({
          name: functionName,
          file: file,
          category: category,
        });
      }
    }

    // Sort functions alphabetically by name
    allFunctions.sort((a, b) => a.name.localeCompare(b.name));

    if (jsonOutput) {
      // JSON output with full metadata
      console.log(JSON.stringify(allFunctions, null, 2));
    } else if (plainOutput) {
      // Plain output - just function names, one per line
      for (const func of allFunctions) {
        console.log(func.name);
      }
    } else {
      // Formatted output with categories and grouping
      console.log("🔧 Timeplus Functions (A-Z)\n");
      console.log("=".repeat(50));

      let currentLetter = "";

      for (const func of allFunctions) {
        const firstLetter = func.name[0].toUpperCase();

        if (firstLetter !== currentLetter) {
          currentLetter = firstLetter;
          console.log(`\n--- ${currentLetter} ---`);
        }

        console.log(`  ${func.name} (${func.category})`);
      }

      console.log("\n" + "=".repeat(50));
      console.log(`Total functions found: ${allFunctions.length}`);

      // Group by category
      const byCategory = allFunctions.reduce(
        (acc, func) => {
          if (!acc[func.category]) {
            acc[func.category] = [];
          }
          acc[func.category].push(func.name);
          return acc;
        },
        {} as Record<string, string[]>,
      );

      console.log("\n📊 Functions by Category:");
      Object.keys(byCategory)
        .sort()
        .forEach((category) => {
          console.log(
            `  ${category}: ${byCategory[category].length} functions`,
          );
        });
    }
  } catch (error) {
    console.error("Error processing files:", error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
