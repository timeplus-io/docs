# Tools for docs

This folder contains a set of tools to automate the routine docs work. You should run the command from `docs` root folder not in the tools folder.

- `yarn run spellcheck` to run spell spellcheck
- `sh tools/autogenerate-downloads.sh` to generate release-downloads.md based on file list in S3
- `bun tools/list-pages.ts` to show nav tree based on sidebars.js and titles in markdown files
- `bun tools/missing.js` to list which markdown files are not mounted in sidebars.js

Other files probably are outdated.
