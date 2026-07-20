import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const distDir = resolve("dist");
const indexPath = resolve(distDir, "index.html");
let html = await readFile(indexPath, "utf8");

const cssMatch = html.match(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"[^>]*>/);
const scriptMatch = html.match(/<script type="module"[^>]*src="\.\/(assets\/[^"]+\.js)"><\/script>/);

if (!cssMatch || !scriptMatch) {
  throw new Error("Could not locate the built CSS and JavaScript assets.");
}

const css = await readFile(resolve(distDir, cssMatch[1]), "utf8");
const javascript = (await readFile(resolve(distDir, scriptMatch[1]), "utf8")).replaceAll("</script", "<\\/script");

html = html
  .replace(cssMatch[0], () => `<style>${css}</style>`)
  .replace(scriptMatch[0], () => `<script>${javascript}</script>`);

await writeFile(indexPath, html);
