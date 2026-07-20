import { createServer } from "node:http";
import { readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";

const root = resolve(import.meta.dirname);
const dbPath = join(root, "data", "srss-db.json");
const uploadDir = join(root, "public", "uploads");
const distDir = join(root, "dist");
const port = Number(process.env.PORT || 8787);
const adminKey = process.env.SRSS_ADMIN_KEY || "srss-local-admin";

const contentTypes = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".pdf": "application/pdf" };
const send = (res, status, data) => { res.writeHead(status, { "content-type": "application/json; charset=utf-8" }); res.end(JSON.stringify(data)); };
const readBody = async (req) => new Promise((resolveBody, reject) => { let body = ""; req.on("data", (part) => { body += part; if (body.length > 6_000_000) reject(new Error("Request too large")); }); req.on("end", () => { try { resolveBody(body ? JSON.parse(body) : {}); } catch { reject(new Error("Invalid JSON")); } }); req.on("error", reject); });
const readDb = async () => JSON.parse(await readFile(dbPath, "utf8"));
const writeDb = async (db) => writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`);
const isAdmin = (req) => req.headers["x-srss-admin-key"] === adminKey;
const publicData = (db) => ({ news: db.news.filter((item) => item.published), events: db.events.filter((item) => item.published), assets: db.assets });
const safeName = (name) => basename(name).replace(/[^a-zA-Z0-9._-]/g, "-");

async function staticFile(res, filePath) {
  try { const info = await stat(filePath); if (!info.isFile()) return false; res.writeHead(200, { "content-type": contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream" }); createReadStream(filePath).pipe(res); return true; } catch { return false; }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname === "/api/health") return send(res, 200, { ok: true });
    if (url.pathname === "/api/content" && req.method === "GET") return send(res, 200, publicData(await readDb()));
    if (url.pathname === "/api/enquiries" && req.method === "POST") {
      const body = await readBody(req); if (!body.parentName || !body.email || !body.childName || !body.childAge) return send(res, 422, { error: "Please complete the required fields." });
      const db = await readDb(); db.enquiries.unshift({ id: randomUUID(), type: "admissions", status: "new", createdAt: new Date().toISOString(), ...body }); await writeDb(db); return send(res, 201, { ok: true });
    }
    if (url.pathname === "/api/messages" && req.method === "POST") {
      const body = await readBody(req); if (!body.name || !body.email || !body.subject || !body.message) return send(res, 422, { error: "Please complete the required fields." });
      const db = await readDb(); db.messages.unshift({ id: randomUUID(), status: "new", createdAt: new Date().toISOString(), ...body }); await writeDb(db); return send(res, 201, { ok: true });
    }
    if (url.pathname === "/api/admin/content" && req.method === "GET") { if (!isAdmin(req)) return send(res, 401, { error: "Admin authorisation required." }); return send(res, 200, await readDb()); }
    if (url.pathname === "/api/admin/content" && req.method === "PUT") {
      if (!isAdmin(req)) return send(res, 401, { error: "Admin authorisation required." }); const body = await readBody(req);
      const db = await readDb(); for (const key of ["news", "events"]) if (Array.isArray(body[key])) db[key] = body[key]; await writeDb(db); return send(res, 200, db);
    }
    if (url.pathname.startsWith("/api/admin/enquiries/") && req.method === "PATCH") {
      if (!isAdmin(req)) return send(res, 401, { error: "Admin authorisation required." }); const id = url.pathname.split("/").pop(); const body = await readBody(req); const db = await readDb(); const item = db.enquiries.find((entry) => entry.id === id); if (!item) return send(res, 404, { error: "Enquiry not found." }); item.status = body.status || item.status; await writeDb(db); return send(res, 200, item);
    }
    if (url.pathname === "/api/admin/assets" && req.method === "POST") {
      if (!isAdmin(req)) return send(res, 401, { error: "Admin authorisation required." }); const body = await readBody(req); if (!/^image\/(jpeg|png|webp)$/.test(body.mimeType || "") || !body.base64 || !body.filename) return send(res, 422, { error: "Use a JPEG, PNG or WebP image." });
      const bytes = Buffer.from(body.base64.replace(/^data:[^;]+;base64,/, ""), "base64"); if (bytes.length > 5_000_000) return send(res, 413, { error: "Images must be 5 MB or smaller." }); await mkdir(uploadDir, { recursive: true }); const filename = `${Date.now()}-${safeName(body.filename)}`; await writeFile(join(uploadDir, filename), bytes);
      const db = await readDb(); const asset = { id: randomUUID(), filename, url: `/uploads/${filename}`, mimeType: body.mimeType, alt: body.alt || "", createdAt: new Date().toISOString() }; db.assets.unshift(asset); await writeDb(db); return send(res, 201, asset);
    }
    if (url.pathname.startsWith("/uploads/")) { if (await staticFile(res, join(uploadDir, safeName(url.pathname.slice(9))))) return; return send(res, 404, { error: "Asset not found." }); }
    const requested = url.pathname === "/" ? "index.html" : url.pathname.slice(1); if (await staticFile(res, join(distDir, requested))) return; if (await staticFile(res, join(distDir, "index.html"))) return; return send(res, 404, { error: "Build the site before serving it." });
  } catch (error) { send(res, 500, { error: error.message || "Unexpected server error." }); }
});
server.listen(port, () => console.log(`SRSS server ready at http://localhost:${port}`));
