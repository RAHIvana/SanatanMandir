// Prepares a copy of the built site for the claude.ai Artifact preview:
// the artifact host wraps the main page in its own <html>/<head>/<body>, so index.html
// is reduced to a fragment (title + stylesheet links + body content). Every other file
// is copied unchanged. Also writes preview/files.json (published path -> source path).
import { cp, readFile, writeFile, rm, readdir, stat } from "node:fs/promises";
import path from "node:path";

const SITE = path.resolve("_site");
const OUT = path.resolve("preview");
await rm(OUT, { recursive: true, force: true });
await cp(SITE, OUT, { recursive: true });

const html = await readFile(path.join(OUT, "index.html"), "utf8");
const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [, "Shri Sanatan Mandir"])[1];
const headLinks = [...html.matchAll(/<link[^>]+rel="(?:stylesheet|preconnect)"[^>]*>/g)].map((m) => m[0]).join("\n");
const body = html.replace(/^[\s\S]*?<body[^>]*>/, "").replace(/<\/body>[\s\S]*$/, "");
const fragment = `<title>${title}</title>\n${headLinks}\n${body}`;
await writeFile(path.join(OUT, "index.html"), fragment);

async function walk(dir, base = "") {
  const out = {};
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) Object.assign(out, await walk(full, rel));
    else if (rel !== "index.html" && !entry.name.startsWith(".") && !entry.name.endsWith(".md")) out[rel] = rel;
  }
  return out;
}
const files = await walk(OUT);
await writeFile(path.join(OUT, "files.json"), JSON.stringify(files, null, 2));
let total = 0;
for (const f of Object.keys(files)) total += (await stat(path.join(OUT, f))).size;
console.log(`preview ready: ${Object.keys(files).length} supporting files, ${(total / 1024 / 1024).toFixed(2)} MB`);
