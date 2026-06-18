import { readdirSync, readFileSync, statSync } from "fs";
import { join, extname, basename } from "path";

const ROOT = join(import.meta.dir, "..");
const DOCS = join(ROOT, "docs");
const STATIC = join(ROOT, "static");

// 1. Build valid slug set from doc files (id frontmatter overrides filename stem)
const valid = new Set<string>();
function walk(dir: string) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    const ext = extname(p);
    if (ext !== ".md" && ext !== ".mdx") continue;
    const src = readFileSync(p, "utf8");
    const fm = src.match(/^---\n([\s\S]*?)\n---/);
    let slug = basename(p, ext);
    if (fm) {
      const idm = fm[1].match(/^id:\s*(.+)$/m);
      const sm = fm[1].match(/^slug:\s*(.+)$/m);
      if (sm) slug = sm[1].trim().replace(/^\/+/, "");
      else if (idm) slug = idm[1].trim();
    }
    valid.add("/" + slug);
  }
}
walk(DOCS);

// 2. Redirects from config
const cfg = readFileSync(join(ROOT, "docusaurus.config.js"), "utf8");
for (const m of cfg.matchAll(/from:\s*['"]([^'"]+)['"]/g)) valid.add(m[1]);
// 3. Static files
function walkStatic(dir: string, prefix = "") {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const rel = prefix + "/" + e;
    if (statSync(p).isDirectory()) walkStatic(p, rel);
    else valid.add(rel);
  }
}
walkStatic(STATIC);
// Known dynamic/category routes
valid.add("/search");

// 4. Scan docs for internal links
const dangling: Record<string, string[]> = {};
function scan(dir: string) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) { scan(p); continue; }
    const ext = extname(p);
    if (ext !== ".md" && ext !== ".mdx") continue;
    const src = readFileSync(p, "utf8");
    const links = new Set<string>();
    for (const m of src.matchAll(/\]\((\/[^)\s]*)\)/g)) links.add(m[1]);
    for (const m of src.matchAll(/href=["'](\/[^"']*)["']/g)) links.add(m[1]);
    for (let link of links) {
      // strip anchor and query
      let target = link.split("#")[0].split("?")[0];
      if (target === "") continue; // pure anchor on same page
      target = target.replace(/\/$/, ""); // trailing slash
      if (target === "") continue;
      if (valid.has(target)) continue;
      if (valid.has(target + "/")) continue;
      (dangling[basename(p)] ??= []).push(link);
    }
  }
}
scan(DOCS);

const files = Object.keys(dangling).sort();
let total = 0;
for (const f of files) {
  console.log(`\n${f}`);
  for (const l of dangling[f]) { console.log(`  ${l}`); total++; }
}
console.log(`\n=== ${total} dangling links in ${files.length} files ===`);
