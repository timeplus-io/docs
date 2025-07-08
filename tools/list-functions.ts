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
 *   bun run tools/list-functions.ts --missing # Show functions not documented
 *   bun run tools/list-functions.ts --stats  # Show documentation statistics
 *   bun run tools/list-functions.ts --sample [N] # Show N random missing functions (default 10)
 *   bun run tools/list-functions.ts --help   # Show help
 */

import { readdir, readFile } from "fs/promises";
import { join } from "path";

interface FunctionInfo {
  name: string;
  file: string;
  category: string;
}

interface CSVFunctionInfo {
  name: string;
  is_aggregate: boolean;
  case_insensitive: boolean;
  alias_to: string;
  create_query: string;
  origin: string;
  syntax: string;
  arguments: string;
  returned_value: string;
  categories: string;
}

function showHelp() {
  console.log(`
🔧 Timeplus Functions Lister

Usage:
  bun run tools/list-functions.ts [options]

Options:
  --plain    Output function names only (one per line)
  --json     Output as JSON array with function metadata
  --missing  Show functions from CSV that are not documented
  --stats    Show documentation coverage statistics
  --sample   Show random sample of missing functions (default 10)
  --help     Show this help message

Examples:
  bun run tools/list-functions.ts                    # Formatted output with categories
  bun run tools/list-functions.ts --plain           # Plain text list
  bun run tools/list-functions.ts --json            # JSON format
  bun run tools/list-functions.ts --missing         # Show undocumented functions
  bun run tools/list-functions.ts --stats           # Show coverage statistics
  bun run tools/list-functions.ts --sample 5        # Show 5 random missing functions
  bun run tools/list-functions.ts --plain | wc -l   # Count functions
`);
}

function parseCSV(content: string): CSVFunctionInfo[] {
  const lines = content.trim().split("\n");
  const headers = lines[0].split(",");
  const functions: CSVFunctionInfo[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    if (values.length >= 10) {
      functions.push({
        name: values[0],
        is_aggregate: values[1] === "1",
        case_insensitive: values[2] === "1",
        alias_to: values[3],
        create_query: values[4],
        origin: values[5],
        syntax: values[6],
        arguments: values[7],
        returned_value: values[8],
        categories: values[9],
      });
    }
  }

  return functions;
}

async function loadCSVFunctions(toolsPath: string): Promise<CSVFunctionInfo[]> {
  try {
    const csvPath = join(toolsPath, "functions.csv");
    const content = await readFile(csvPath, "utf-8");
    return parseCSV(content);
  } catch (error) {
    console.error("Error loading functions.csv:", error);
    return [];
  }
}

function filterCSVFunctions(csvFunctions: CSVFunctionInfo[]): string[] {
  return csvFunctions
    .filter((func) => {
      // Skip internal functions (starting with __)
      if (func.name.startsWith("__")) return false;

      // Skip if it's an alias to another function
      if (func.alias_to && func.alias_to.trim() !== "") return false;

      // Skip certain origins or categories if needed
      if (func.origin === "PythonUserDefined") return false;

      return true;
    })
    .map((func) => func.name.toLowerCase())
    .sort();
}

async function main() {
  const docsPath = join(__dirname, "../docs");
  const toolsPath = join(__dirname, ".");
  const plainOutput = process.argv.includes("--plain");
  const jsonOutput = process.argv.includes("--json");
  const showMissing = process.argv.includes("--missing");
  const showStats = process.argv.includes("--stats");
  const showSample = process.argv.includes("--sample");
  const showHelpFlag = process.argv.includes("--help");

  // Get sample size from --sample argument
  const sampleSize = (() => {
    const sampleIndex = process.argv.indexOf("--sample");
    if (sampleIndex !== -1 && sampleIndex + 1 < process.argv.length) {
      const size = parseInt(process.argv[sampleIndex + 1], 10);
      return !isNaN(size) ? size : 10;
    }
    return 10;
  })();

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

    if (showStats) {
      // Load CSV functions for comparison
      const csvFunctions = await loadCSVFunctions(toolsPath);
      const csvFunctionNames = filterCSVFunctions(csvFunctions);
      const documentedFunctionNames = allFunctions.map((f) =>
        f.name.toLowerCase(),
      );

      // Show coverage statistics
      const missingCount = csvFunctionNames.filter(
        (csvFunc) => !documentedFunctionNames.includes(csvFunc),
      ).length;

      console.log("📊 Documentation Coverage Statistics\n");
      console.log("=".repeat(50));
      console.log(`📚 Total SQL functions: ${csvFunctionNames.length}`);
      console.log(`✅ Documented functions: ${documentedFunctionNames.length}`);
      console.log(`❌ Missing documentation: ${missingCount}`);
      console.log(
        `📈 Coverage: ${((documentedFunctionNames.length / csvFunctionNames.length) * 100).toFixed(1)}%`,
      );

      // Show breakdown by category
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

      console.log("\n📂 Documented functions by category:");
      Object.keys(byCategory)
        .sort()
        .forEach((category) => {
          console.log(
            `  ${category}: ${byCategory[category].length} functions`,
          );
        });
    } else if (showSample) {
      // Show random sample of missing functions
      const csvFunctions = await loadCSVFunctions(toolsPath);
      const csvFunctionNames = filterCSVFunctions(csvFunctions);
      const documentedFunctionNames = allFunctions.map((f) =>
        f.name.toLowerCase(),
      );

      const missingFunctions = csvFunctionNames.filter(
        (csvFunc) => !documentedFunctionNames.includes(csvFunc),
      );

      // Get random sample
      const shuffled = missingFunctions.sort(() => 0.5 - Math.random());
      const sample = shuffled.slice(
        0,
        Math.min(sampleSize, missingFunctions.length),
      );

      console.log(`🎲 Random sample of ${sample.length} missing functions:\n`);
      console.log("=".repeat(50));

      sample.forEach((func, index) => {
        console.log(`${index + 1}. ${func}`);
      });

      console.log("\n" + "=".repeat(50));
      console.log(`Total missing: ${missingFunctions.length} functions`);
      console.log(`Sample size: ${sample.length} functions`);
    } else if (showMissing) {
      // Find functions in CSV that are not documented
      const csvFunctions = await loadCSVFunctions(toolsPath);
      const csvFunctionNames = filterCSVFunctions(csvFunctions);
      const documentedFunctionNames = allFunctions.map((f) =>
        f.name.toLowerCase(),
      );
      const missingFunctions = csvFunctionNames.filter(
        (csvFunc) => !documentedFunctionNames.includes(csvFunc),
      );

      console.log("🚫 Functions in SQL engine but not documented:\n");
      console.log("=".repeat(60));

      if (missingFunctions.length === 0) {
        console.log("\n✅ All SQL functions are documented!");
      } else {
        let currentLetter = "";

        for (const funcName of missingFunctions) {
          const firstLetter = funcName[0].toUpperCase();

          if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            console.log(`\n--- ${currentLetter} ---`);
          }

          console.log(`  ${funcName}`);
        }

        console.log("\n" + "=".repeat(60));
        console.log(`📊 Summary:`);
        console.log(`  Total SQL functions: ${csvFunctionNames.length}`);
        console.log(
          `  Documented functions: ${documentedFunctionNames.length}`,
        );
        console.log(`  Missing documentation: ${missingFunctions.length}`);
        console.log(
          `  Coverage: ${((documentedFunctionNames.length / csvFunctionNames.length) * 100).toFixed(1)}%`,
        );
      }
    } else if (jsonOutput) {
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
