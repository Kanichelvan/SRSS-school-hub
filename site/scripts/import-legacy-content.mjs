// One-time move of the public website content from the retired JSON prototype (data/srss-db.json)
// into the Firestore CMS collections the public site now reads (src/lib/publicContent.js):
//   newsPosts/*, events/* (publicListing), pages/homepage, pages/about, pages/faqs
//
// Local emulator (also run by `npm run seed`):  node scripts/import-legacy-content.mjs
// Real project (needs `gcloud auth application-default login`):
//   node scripts/import-legacy-content.mjs --project <project-id> [--overwrite]
// Existing documents are skipped unless --overwrite is given, so live edits are never replaced by accident.
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { FieldValue } from "firebase-admin/firestore";
import { defaultFaqs } from "../src/data/faqs.js";

const source = new URL("../data/srss-db.json", import.meta.url);
const stamp = { createdBy: "legacy-import", updatedBy: "legacy-import", createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() };
const status = (item) => (item.published ? "published" : "draft");

export async function legacyContentWrites() {
  const legacy = JSON.parse(await readFile(source, "utf8"));
  const writes = [];
  for (const item of legacy.news || []) {
    const { id, published, ...fields } = item;
    writes.push([`newsPosts/${id}`, { ...fields, status: status(item), ownerRole: "contentEditor", ...(item.published ? { publishedAt: FieldValue.serverTimestamp() } : {}) }]);
  }
  for (const item of legacy.events || []) {
    const { id, published, ...fields } = item;
    writes.push([`events/${id}`, { ...fields, status: status(item), publicListing: true, audienceKeys: ["school"] }]);
  }
  const page = (content) => ({ status: "published", content, publishedAt: FieldValue.serverTimestamp() });
  if (legacy.homepage && Object.keys(legacy.homepage).length) writes.push(["pages/homepage", page(legacy.homepage)]);
  if (legacy.about && Object.keys(legacy.about).length) writes.push(["pages/about", page(legacy.about)]);
  writes.push(["pages/faqs", page({ items: legacy.faqs?.length ? legacy.faqs : defaultFaqs })]);
  return writes;
}

export async function importLegacyContent(db, { overwrite = false } = {}) {
  let written = 0;
  let skipped = 0;
  for (const [path, data] of await legacyContentWrites()) {
    const ref = db.doc(path);
    if (!overwrite && (await ref.get()).exists) { skipped += 1; continue; }
    await ref.set({ ...data, ...stamp });
    written += 1;
  }
  return { written, skipped };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { initializeApp } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");
  const arg = (name) => { const index = process.argv.indexOf(`--${name}`); return index > -1 ? process.argv[index + 1] : undefined; };
  const projectId = arg("project");
  if (!projectId) process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";
  initializeApp({ projectId: projectId || "demo-srss" });
  const result = await importLegacyContent(getFirestore(), { overwrite: process.argv.includes("--overwrite") });
  console.log(`Imported ${result.written} content documents into ${projectId || "the demo-srss emulator"}; skipped ${result.skipped} that already exist.`);
}
