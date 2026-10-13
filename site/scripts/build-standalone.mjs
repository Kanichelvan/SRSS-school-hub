import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";

const siteDir = resolve(".");
const distDir = resolve(siteDir, "dist");
const exportDir = resolve(siteDir, "exports");
const indexPath = resolve(distDir, "index.html");
const outputPath = resolve(exportDir, "SRSS-homepage.html");
const previewPath = resolve(distDir, "SRSS-homepage.html");
// Snapshot of public content for the offline single-file copy (the same data is imported into Firestore
// by scripts/import-legacy-content.mjs).
const contentPath = resolve(siteDir, "data", "srss-db.json");

const mimeTypes = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : path;
  }));
  return files.flat();
}

function replaceAssetReferences(source, assetPath, dataUrl) {
  const references = [`./${assetPath}`, `/${assetPath}`, assetPath];
  return references.reduce((result, reference) => result.replaceAll(reference, dataUrl), source);
}

let html = await readFile(indexPath, "utf8");
const cssMatch = html.match(/<link rel="stylesheet"[^>]*href="(?:\.\/|\/)(assets\/[^"]+\.css)"[^>]*>/);
const scriptMatch = html.match(/<script type="module"[^>]*src="(?:\.\/|\/)(assets\/[^"]+\.js)"><\/script>/);

if (!cssMatch || !scriptMatch) {
  throw new Error("Could not locate the built CSS and JavaScript assets.");
}

let css = await readFile(resolve(distDir, cssMatch[1]), "utf8");
let javascript = await readFile(resolve(distDir, scriptMatch[1]), "utf8");
const assetDataUrls = new Map();

for (const file of await listFiles(resolve(distDir, "assets"))) {
  const extension = extname(file).toLowerCase();
  const mimeType = mimeTypes[extension];
  if (!mimeType) continue;

  const assetPath = relative(distDir, file).split("\\").join("/");
  const dataUrl = `data:${mimeType};base64,${(await readFile(file)).toString("base64")}`;
  assetDataUrls.set(assetPath, dataUrl);
  css = replaceAssetReferences(css, assetPath, dataUrl);
  javascript = replaceAssetReferences(javascript, assetPath, dataUrl);
  if (assetPath.startsWith("assets/photos/processed/")) {
    const filename = assetPath.split("/").at(-1);
    javascript = javascript.replaceAll(`"${filename}"`, `"${dataUrl}"`);
  }
}

javascript = javascript.replace(/`\.\/assets\/photos\/processed\/\$\{([^}]+)\}`/g, "$1");

// Keep a downloaded homepage self-contained: its navigation stays on this file
// and About Us lands on the homepage's About SRSS introduction.
javascript = javascript
  .replaceAll('"/about#top"', '"#about-preview"')
  .replaceAll('"/faq"', '"#faq"')
  .replaceAll('"/#', '"#')
  .replaceAll('href:"/"', 'href:"#top"')
  .replaceAll("</script", "<\\/script");

const database = JSON.parse(await readFile(contentPath, "utf8"));
const publicContent = {
  news: database.news.filter((item) => item.published),
  events: database.events.filter((item) => item.published),
  assets: database.assets,
  about: database.about || {},
  homepage: database.homepage || {},
  faqs: database.faqs?.length ? database.faqs : [],
};
let publicContentJson = JSON.stringify(publicContent);
for (const [assetPath, dataUrl] of assetDataUrls) {
  publicContentJson = replaceAssetReferences(publicContentJson, assetPath, dataUrl);
}

// The app reads this snapshot instead of Firestore (src/lib/publicContent.js); forms explain that
// the downloaded copy is read-only.
const contentShim = `<script>
  window.__SRSS_EXPORTED_CONTENT__ = ${publicContentJson.replaceAll("</script", "<\\/script")};
</script>`;

html = html
  .replace(cssMatch[0], () => `<style>${css}</style>`)
  .replace(scriptMatch[0], () => `${contentShim}\n<script type="module">${javascript}</script>`)
  .replace("</head>", "  <meta name=\"generator\" content=\"SRSS standalone homepage export\" />\n  </head>");

await mkdir(exportDir, { recursive: true });
await Promise.all([writeFile(outputPath, html), writeFile(previewPath, html)]);

console.log(`Standalone homepage written to ${outputPath}`);
