# Tools for docs

This folder contains a set of tools to automate the routine docs work. You should run the command from `docs` root folder not in the tools folder.

- `yarn run spellcheck` to run spell spellcheck
- `sh tools/autogenerate-downloads.sh` to generate release-downloads.md based on file list in S3
- `bun tools/list-pages.ts` to show nav tree based on sidebars.js and titles in markdown files
- `bun tools/missing.js` to list which markdown files are not mounted in sidebars.js
- `bun tools/list-functions.ts` to list all function names from function documentation files (functions_for_*.md)
  - `bun tools/list-functions.ts --plain` for plain text output (one function per line)
  - `bun tools/list-functions.ts --json` for JSON output with metadata
  - `bun tools/list-functions.ts --stats` for documentation coverage statistics
  - `bun tools/list-functions.ts --missing` to show functions from CSV that are not documented
  - `bun tools/list-functions.ts --sample [N]` to show N random missing functions (default 10)

Other files probably are outdated.
