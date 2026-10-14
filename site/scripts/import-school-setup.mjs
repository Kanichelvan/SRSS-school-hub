// Enters the School's real set-up for a year (scripts/school-data/*.mjs) on a Firebase project — the same
// records the School Setup Wizard creates: school information and hours, the academic year and terms,
// Standards 1–6, classes, subjects, the year's breaks and holidays, the standard category lists, and a
// staff-only draft of the Learning › Curriculum page. Staff, pupils and families are not part of it.
//
//   node scripts/import-school-setup.mjs --project srssdigitalhub --actor kani@ssiomya.com            (dry run)
//   node scripts/import-school-setup.mjs --project srssdigitalhub --actor kani@ssiomya.com --apply    (write)
//
// Re-running is safe: records are matched by their stable IDs; existing records keep their creation stamp
// and anything the School has since changed in the hub is only overwritten for the fields listed here.
// Needs Application Default Credentials (gcloud auth application-default login).
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import * as data from "./school-data/srss-2027.mjs";

const arg = (name) => { const index = process.argv.indexOf(`--${name}`); return index > -1 ? process.argv[index + 1] : undefined; };
const projectId = arg("project");
const actorEmail = arg("actor");
const apply = process.argv.includes("--apply");
if (!projectId || !actorEmail) { console.error("Usage: node scripts/import-school-setup.mjs --project <id> --actor <super admin email> [--apply]"); process.exit(1); }

initializeApp({ projectId });
const db = getFirestore();
const actor = await getAuth().getUserByEmail(actorEmail);
const now = FieldValue.serverTimestamp();
const writes = [];
const put = (path, record, { merge = false } = {}) => writes.push({ path, record, merge });

const { SCHOOL, YEAR } = data;
put("settings/school", { ...SCHOOL, currentAcademicYearId: YEAR.id, currentTermId: data.TERMS[0].id }, { merge: true });
put(`academicYears/${YEAR.id}`, { name: YEAR.name, startDate: YEAR.startDate, endDate: YEAR.endDate, status: "active" });
for (const term of data.TERMS) put(`terms/${term.id}`, { academicYearId: YEAR.id, name: term.name, startDate: term.startDate, endDate: term.endDate, status: "active" });
for (let level = 1; level <= 6; level++) put(`standards/std${level}`, { level, order: level, name: `Standard ${level}`, status: "active" });
for (const cls of data.CLASSES) put(`classes/${cls.id}`, { name: cls.name, standard: cls.standard, academicYearId: YEAR.id, room: null, capacity: null, status: "active" }, { merge: true });
for (const subject of data.SUBJECTS) put(`subjects/${subject.code}`, { ...subject, status: "active" });
for (const event of data.EVENTS) put(`events/${event.id}`, { title: event.title, date: event.date, endDate: event.endDate, allDay: true, startTime: null, endTime: null, location: null, description: event.description, category: event.category, schoolClosed: event.closed, audienceKeys: ["school"], publicListing: true, attachments: [], academicYearId: YEAR.id, status: "published" });
data.ANNOUNCEMENT_CATEGORIES.forEach(([id, name], index) => put(`announcementCategories/${id}`, { name, order: index + 1, description: null, status: "active" }));
data.PORTFOLIO_CATEGORIES.forEach(([id, name], index) => put(`portfolioCategories/${id}`, { name, order: index + 1, description: null, status: "active" }));

// Learning › Curriculum: a staff draft only — Leadership reviews and publishes it in Content › Website pages.
const curriculumDraft = await db.doc("pageDrafts/site-learning-curriculum").get();
if (!curriculumDraft.exists) put("pageDrafts/site-learning-curriculum", { content: { ...data.CURRICULUM_DRAFT, heroImage: "", heroImageAlt: "", timeline: [], people: [], documents: [] }, status: "review" });

console.log(`${apply ? "Writing" : "Dry run —"} ${writes.length} records to ${projectId} as ${actorEmail}:`);
for (const { path } of writes) console.log(`  ${path}`);
if (!apply) { console.log("\nNothing written. Add --apply to write these records."); process.exit(0); }

for (let i = 0; i < writes.length; i += 400) {
  const batch = db.batch();
  for (const { path, record, merge } of writes.slice(i, i + 400)) {
    const existing = await db.doc(path).get();
    const stamp = { updatedAt: now, updatedBy: actor.uid, ...(existing.exists ? {} : { createdAt: now, createdBy: actor.uid }) };
    batch.set(db.doc(path), { ...record, ...stamp }, { merge: merge || existing.exists });
  }
  await batch.commit();
}
await db.collection("auditLogs").add({ type: "schoolSetup.imported", year: YEAR.id, records: writes.length, actorUid: actor.uid, source: "scripts/import-school-setup.mjs", at: now });
console.log(`\nDone. Open Admin › School setup wizard to check the year, then add staff, pupils and families.`);
