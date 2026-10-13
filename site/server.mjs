// Local preview of the production build (`npm run build && npm run serve`). It only serves files from
// dist/ with an SPA fallback. Content, enquiries and contact messages go to Firestore (see
// src/lib/publicContent.js and docs/architecture.md); Firebase Hosting serves the site in production.
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

const distDir = resolve(import.meta.dirname, "dist");
const port = Number(process.env.PORT || 8787);
const contentTypes = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif", ".svg": "image/svg+xml; charset=utf-8", ".pdf": "application/pdf", ".woff2": "font/woff2", ".ico": "image/x-icon" };

async function serveFile(res, filePath) {
  try {
    if (!(await stat(filePath)).isFile()) return false;
    res.writeHead(200, { "content-type": contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream" });
    createReadStream(filePath).pipe(res);
    return true;
  } catch { return false; }
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  const filePath = normalize(join(distDir, decodeURIComponent(pathname)));
  if (filePath.startsWith(distDir + sep) && (await serveFile(res, filePath))) return;
  if (await serveFile(res, join(distDir, "index.html"))) return;
  res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  res.end("Run `npm run build` before serving the site.");
}).listen(port, () => console.log(`SRSS preview at http://localhost:${port}`));
