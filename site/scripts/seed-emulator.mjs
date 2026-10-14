// Seeds the LOCAL EMULATORS with the fictional development school in scripts/demo-data/school-2027.mjs.
//   npm run emulators                 (terminal 1)
//   npm run seed                      (terminal 2) — repeatable: fixed IDs, so running it again restores the same data
//   npm run seed -- --reset           wipes the emulator's Firestore and Auth first (removes anything added by hand)
// It refuses to run unless both Firestore and Auth point at a local emulator and the project is a demo-* project,
// so it can never write to the real SRSSDigitalHub project. Never run it in CI against production credentials.
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { recomputeConsentStatus, recomputeUserScope, refreshGuardianClasses } from "../functions/scope.js";
import { CONSENT_FORM_VERSION, CONSENT_ITEMS } from "../src/hub/consentForm.js";
import { importLegacyContent } from "./import-legacy-content.mjs";
import * as demo from "./demo-data/school-2027.mjs";
import { seedQuest } from "./seed-quest-emulator.mjs";

const PROJECT = "demo-srss";
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";
const local = (host) => /^(127\.0\.0\.1|localhost|\[::1\]):\d+$/.test(host);
if (!local(process.env.FIRESTORE_EMULATOR_HOST) || !local(process.env.FIREBASE_AUTH_EMULATOR_HOST) || !PROJECT.startsWith("demo-") || process.argv.includes("--project")) {
  throw new Error("Refusing to seed: demo data may only be written to the local emulators (demo-* project).");
}
initializeApp({ projectId: PROJECT });
const auth = getAuth();
const db = getFirestore();

if (process.argv.includes("--reset")) {
  await fetch(`http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: "DELETE" });
  await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/emulator/v1/projects/${PROJECT}/accounts`, { method: "DELETE" });
  console.log("Emulator Firestore and Auth cleared.");
}

export const DEMO_PASSWORD = demo.DEMO_PASSWORD;
const { YEAR, PREVIOUS_YEAR } = demo;
const SYSTEM = "seed-script";
const now = Timestamp.now();
const stamp = { createdAt: now, createdBy: SYSTEM, updatedAt: now, updatedBy: SYSTEM };
const meta = (extra = {}) => ({ status: "active", ...stamp, academicYearId: YEAR.id, ...extra });
// Local calendar dates (Malaysia), not UTC.
const localDate = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const day = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return localDate(d); };
const schoolDays = (count) => { const days = []; for (let i = 1; days.length < count; i++) { const d = new Date(); d.setDate(d.getDate() - i); if (d.getDay() % 6) days.push(localDate(d)); } return days.reverse(); };

const writes = [];
const put = (path, data) => writes.push([path, data]);

// ---------- accounts ----------
const uid = {};
for (const account of demo.ACCOUNTS) {
  const email = `${account.key}@demo.srss.test`;
  let user;
  try { user = await auth.getUserByEmail(email); await auth.updateUser(user.uid, { disabled: false, displayName: account.name, password: DEMO_PASSWORD }); }
  catch { user = await auth.createUser({ email, password: DEMO_PASSWORD, displayName: account.name, emailVerified: true }); }
  uid[account.key] = user.uid;
  await auth.setCustomUserClaims(user.uid, { roles: account.roles, ...(account.roles.includes("superAdmin") ? { accessAdmin: true } : {}) });
  const personType = account.staff ? "staff" : account.key.startsWith("parent") ? "guardian" : account.key === "student" ? "student" : null;
  put(`users/${user.uid}`, { email, displayName: account.name, roles: account.roles, status: "active", personType, personId: personType === "staff" ? `staff-${account.key}` : personType === "guardian" ? `g-${account.key}` : null });
  if (account.staff) put(`staff/staff-${account.key}`, meta({ uid: user.uid, name: account.name, position: account.staff, email, phone: null, directoryVisible: true, academicYearId: null }));
}
for (const [id, name, position] of demo.STAFF_WITHOUT_ACCOUNT) put(`staff/${id}`, meta({ uid: null, name, position, email: null, directoryVisible: true, academicYearId: null }));

// ---------- school settings and academic structure ----------
put("settings/school", { name: "Sekolah Rendah Sathya Sai (demo data)", motto: "Human Excellence | Kecemerlangan Insan", phone: "+60 3-0000 0000", email: "office@demo.srss.test", address: "Fictional demo address, Kuala Lumpur", currentAcademicYearId: YEAR.id, currentTermId: `${YEAR.id}-t3`, timezone: "Asia/Kuala_Lumpur", attendanceDueTime: "09:00", ...stamp });
for (const year of [PREVIOUS_YEAR, YEAR]) put(`academicYears/${year.id}`, { name: year.name, startDate: year.startDate, endDate: year.endDate, status: "active", ...stamp });
demo.TERMS.forEach(([id, name, start, end]) => put(`terms/${YEAR.id}-${id}`, meta({ name, startDate: start, endDate: end })));
for (let s = 1; s <= 6; s++) {
  put(`standards/std${s}`, { level: s, order: s, name: `Standard ${s}`, status: "active", ...stamp });
  for (const year of [PREVIOUS_YEAR, YEAR]) {
    const teacherKey = year === YEAR ? demo.CLASS_TEACHERS[s] : null;
    put(`classes/${demo.classId(year.id, s)}`, { ...meta({ academicYearId: year.id }), name: `${s} ${demo.CLASS_NAMES[s - 1]}`, standard: s, classTeacherUid: teacherKey ? uid[teacherKey] : null, room: `Block A · Room ${s}`, capacity: 30 });
  }
}
demo.SUBJECTS.forEach(([id, name]) => put(`subjects/${id}`, { name, code: id, standards: [], status: "active", ...stamp }));
// teacherAssignments carry weekly slots ({ day: 1–5, time }) until the timetable module exists.
for (const [id, teacherKey, standard, subjectId, slots] of demo.ASSIGNMENTS) {
  const assignment = { teacherUid: uid[teacherKey], staffId: `staff-${teacherKey}`, subjectId, slots: slots.map(([d, time]) => ({ day: d, time })) };
  put(`teacherAssignments/ta-${YEAR.id}-${id}`, meta({ ...assignment, classId: demo.classId(YEAR.id, standard), startDate: YEAR.startDate }));
  // Last year's assignment for the same subject — ended, kept as history.
  put(`teacherAssignments/ta-${PREVIOUS_YEAR.id}-${id}`, { ...meta({ academicYearId: PREVIOUS_YEAR.id }), ...assignment, classId: demo.classId(PREVIOUS_YEAR.id, standard), startDate: PREVIOUS_YEAR.startDate, endDate: PREVIOUS_YEAR.endDate, status: "archived", archivedAt: now, archivedBy: SYSTEM });
}

// ---------- pupils, enrolments (this year active, last year completed), guardians, links ----------
const studentIds = {};
let n = 1;
for (const [standard, names] of Object.entries(demo.ROSTER)) {
  for (const name of names) {
    const id = `stu-${String(n).padStart(4, "0")}`;
    studentIds[name] = id;
    const level = Number(standard);
    const cls = demo.classId(YEAR.id, level);
    const complete = n % 7 !== 0;
    put(`students/${id}`, meta({ studentNumber: `DEMO-${String(n).padStart(4, "0")}`, name, preferredName: name.split(" ")[0], dateOfBirth: `${2027 - 6 - level}-0${(n % 9) + 1}-1${n % 9}`, admissionDate: `${2027 - level + 1}-01-11`, currentClassId: cls, currentStandard: level, uid: name === "Aarav Raman" ? uid.student : null, academicYearId: null, completeness: { emergencyContact: complete, medical: n % 5 !== 0, photoConsent: n % 4 !== 0, birthCertificate: true } }));
    put(`enrollments/enr-${id}-${YEAR.id}`, meta({ studentId: id, classId: cls, standard: level, startDate: YEAR.startDate }));
    if (level > 1) put(`enrollments/enr-${id}-${PREVIOUS_YEAR.id}`, { ...meta({ academicYearId: PREVIOUS_YEAR.id }), studentId: id, classId: demo.classId(PREVIOUS_YEAR.id, level - 1), standard: level - 1, startDate: PREVIOUS_YEAR.startDate, endDate: PREVIOUS_YEAR.endDate, status: "completed" });
    n++;
  }
}
const classOfStudent = (name) => demo.classId(YEAR.id, Number(Object.entries(demo.ROSTER).find(([, names]) => names.includes(name))[0]));
const guardian = (id, data) => put(`guardians/${id}`, meta({ academicYearId: null, phone: null, preferredLanguage: "English", ...data }));
const link = (id, studentName, guardianId, guardianUid, relationship, portal = true) => put(`studentGuardianLinks/${id}`, meta({ academicYearId: null, studentId: studentIds[studentName], guardianId, guardianUid, relationship, hasPortalAccess: portal, isEmergencyContact: true, canCollect: true, classId: classOfStudent(studentName) }));
// The Ramans have two children (Standard 4 and Standard 2) to exercise the child switcher; the Tans are a second family with an account.
guardian("g-parent", { name: "Priya Raman (demo)", email: "parent@demo.srss.test", phone: "+60 12-000 0101", uid: uid.parent });
guardian("g-raman-2", { name: "Vijay Raman (demo)", email: "vijay.demo@example.com", phone: "+60 12-000 0102", uid: null });
guardian("g-parent2", { name: "Jason Tan (demo)", email: "parent2@demo.srss.test", phone: "+60 12-000 0201", uid: uid.parent2 });
link("lnk-aarav-priya", "Aarav Raman", "g-parent", uid.parent, "mother");
link("lnk-anika-priya", "Anika Raman", "g-parent", uid.parent, "mother");
link("lnk-aarav-vijay", "Aarav Raman", "g-raman-2", null, "father");
link("lnk-anika-vijay", "Anika Raman", "g-raman-2", null, "father");
link("lnk-marcus-jason", "Marcus Tan", "g-parent2", uid.parent2, "father");
let g = 1;
for (const names of Object.values(demo.ROSTER)) for (const name of names) {
  if (["Aarav Raman", "Anika Raman", "Marcus Tan"].includes(name)) continue;
  const gid = `g-${String(g).padStart(4, "0")}`;
  guardian(gid, { name: `Parent of ${name.split(" ")[0]} (demo)`, email: `family${g}.demo@example.com`, uid: null });
  link(`lnk-${gid}`, name, gid, null, g % 2 ? "mother" : "father");
  g++;
}
put(`students/${studentIds["Aarav Raman"]}/restricted/medical`, { allergies: "Peanuts (mild) — fictional", medication: null, updatedAt: now, updatedBy: SYSTEM });
put("studentSupportPlans/sp-danish", meta({ studentId: studentIds["Danish Hakim"], classId: classOfStudent("Danish Hakim"), focus: "Reading fluency", goal: "Read Standard 2 texts aloud with confidence", assignedStaffUids: [uid.specialist], reviewDate: day(21), familyVisible: true }));

// ---------- attendance: five submitted school days; one correction; today taken for Standard 1 only ----------
const statuses = ["present", "present", "present", "present", "present", "present", "present", "present", "absent", "late"];
for (const [i, date] of schoolDays(5).entries()) {
  for (let s = 1; s <= 6; s++) {
    const cls = demo.classId(YEAR.id, s);
    const sessionId = `${cls}_${date}_am`;
    const by = uid[demo.CLASS_TEACHERS[s] || "office"];
    put(`attendanceSessions/${sessionId}`, meta({ classId: cls, date, sessionType: "am", status: "submitted", openedBy: by, submittedBy: by, submittedAt: now, studentCount: 6 }));
    demo.ROSTER[s].forEach((name, j) => {
      const status = statuses[(i * 7 + j * 3 + s) % statuses.length];
      const coded = status === "absent" ? { code: "M", status: "medical", note: "Unwell — parent phoned" } : status === "late" ? { code: "L", status: "late", minutesLate: 10, note: "Traffic" } : { code: "/", status: "present", note: null };
      const record = { sessionId, classId: cls, date, studentId: studentIds[name], ...coded, reason: null, markedBy: by, markedAt: now };
      if (i === 4 && s === 4 && j === 1) Object.assign(record, { code: "L", status: "late", minutesLate: 30, note: "Arrived 8:10", previousStatus: "absent", previousCode: "O", correctionReason: "Arrived after the register was taken", correctedBy: by, correctedAt: now });
      put(`attendanceRecords/${sessionId}_${studentIds[name]}`, meta(record));
    });
  }
}
// A parent's absence report for today (shown on the register and in First-day response).
put("absenceReports/ar-anika", { studentId: studentIds["Anika Raman"], classId: classOfStudent("Anika Raman"), reporterUid: uid.parent, from: day(0), to: day(1), reason: "illness", note: "Fever since last night", evidenceUrl: null, status: "reported", createdAt: now });
put(`attendanceSessions/${demo.classId(YEAR.id, 1)}_${day(0)}_am`, meta({ classId: demo.classId(YEAR.id, 1), date: day(0), sessionType: "am", status: "submitted", openedBy: uid.office, submittedBy: uid.office, submittedAt: now, studentCount: 6 }));

// ---------- configuration lists ----------
for (const [collection, items] of [["announcementCategories", demo.ANNOUNCEMENT_CATEGORIES], ["portfolioCategories", demo.PORTFOLIO_CATEGORIES], ["portfolioTags", demo.PORTFOLIO_TAGS], ["downloadCategories", demo.DOWNLOAD_CATEGORIES]]) {
  for (const [id, name, order] of items) put(`${collection}/${id}`, { name, order, description: null, status: "active", ...stamp });
}

// ---------- consent (questions are built into src/hub/consentForm.js; these keep a dated, editable copy) ----------
CONSENT_ITEMS.forEach(({ type, title, question, detail, policy }, index) => put(`consentDefinitions/${type}`, { type, title, question, detail, policy, order: index + 1, version: CONSENT_FORM_VERSION, policyText: `${question} ${detail}`, effectiveFrom: "2026-11-23", status: "active", ...stamp }));
const consent = (id, studentName, guardianUid, type, response) => put(`consentRecords/${id}`, { studentId: studentIds[studentName], classId: classOfStudent(studentName), guardianUid, consentType: type, definitionId: type, definitionVersion: 1, response, choice: null, source: "parentPortal", effectiveFrom: YEAR.startDate, createdAt: now, createdBy: guardianUid });
consent("cr-aarav-photo", "Aarav Raman", uid.parent, "photoVideo", "granted");
consent("cr-aarav-website", "Aarav Raman", uid.parent, "websiteIdentification", "granted");
consent("cr-aarav-showcase", "Aarav Raman", uid.parent, "publicShowcase", "granted");
consent("cr-meiling-photo", "Mei Ling Tan", "demo-guardian", "photoVideo", "declined");
consent("cr-meiling-showcase", "Mei Ling Tan", "demo-guardian", "publicShowcase", "declined");

// ---------- portfolio & Human Excellence ----------
const entry = (id, studentName, data) => put(`portfolioEntries/${id}`, meta({ studentId: studentIds[studentName], classId: classOfStudent(studentName), createdBy: uid.teacher, moderationStatus: null, mediaReferences: [], humanValues: [], achievementTags: [], ...data }));
entry("pe-aarav-1", "Aarav Raman", { date: day(-20), subjectId: "math", category: "academic", title: "Fractions with paper folding", description: "Folded and labelled halves, quarters and eighths, then explained equivalent fractions to the group.", learningObjective: "Recognise equivalent fractions", mediaReferences: [{ label: "Photo of the folded strips", url: "https://drive.google.com/demo-fractions" }], teacherObservation: "Explained his reasoning clearly and patiently helped a friend.", studentReflection: "I learned that 2/4 is the same as 1/2.", humanValues: ["love"], visibility: "family", consentStatus: "granted" });
entry("pe-aarav-2", "Aarav Raman", { date: day(-9), subjectId: "ehv", category: "humanValues", title: "Recycling corner service project", description: "Organised the class recycling corner for two weeks.", learningObjective: "Care for the environment", teacherObservation: "Took responsibility without being reminded.", studentReflection: "Small jobs done every day make a difference.", humanValues: ["rightConduct", "love"], achievementTags: ["service-project", "leadership"], visibility: "publicShowcase", moderationStatus: "approved", consentStatus: "granted" });
entry("pe-aarav-3", "Aarav Raman", { date: day(-30), subjectId: "math", category: "achievements", title: "Zone Mathematics Olympiad — Merit", description: "Represented the school at the zone Mathematics Olympiad.", humanValues: ["truth"], achievementTags: ["competition-award"], visibility: "showcaseCandidate", moderationStatus: "pending", consentStatus: "granted" });
entry("pe-meiling-1", "Mei Ling Tan", { date: day(-6), subjectId: "math", category: "cocurricular", title: "Batik-inspired pattern work", description: "Repeating patterns using traditional batik motifs.", learningObjective: "Use pattern and symmetry", teacherObservation: "Careful, patient work.", humanValues: ["peace"], visibility: "showcaseCandidate", moderationStatus: "pending", consentStatus: "declined" });
entry("pe-ishaan-int", "Ishaan Kumar", { date: day(-4), subjectId: "math", category: "reflections", title: "Note on times-tables confidence", description: "Teacher's private note for planning support.", visibility: "internal" });
entry("pe-anika-1", "Anika Raman", { createdBy: uid.moderator, date: day(-12), subjectId: "bi", category: "academic", title: "My first book review", description: "Wrote and read aloud a review of a picture book.", learningObjective: "Express opinions in writing", teacherObservation: "Confident reading voice.", humanValues: ["truth"], visibility: "family", consentStatus: "missing" });
entry("pe-marcus-1", "Marcus Tan", { createdBy: uid.teacher2, date: day(-8), subjectId: "bi", category: "academic", title: "Persuasive letter to the principal", description: "Argued for a reading corner in every classroom.", humanValues: ["truth", "rightConduct"], visibility: "family", consentStatus: "missing" });
// The public-safe copy the showcaseOnModeration function keeps (no media, first name only).
put("showcaseItems/pe-aarav-2", { status: "published", entryId: "pe-aarav-2", title: "Recycling corner service project", description: "Organised the class recycling corner for two weeks.", category: "humanValues", humanValues: ["rightConduct", "love"], firstName: "Aarav", standard: 4, date: day(-9), publishedAt: now });
const hv = (id, studentName, value, observation, context) => put(`humanValuesObservations/${id}`, { studentId: studentIds[studentName], classId: classOfStudent(studentName), academicYearId: YEAR.id, value, observation, context, type: "positive", familyVisible: true, status: "active", createdAt: now, createdBy: uid.teacher, updatedAt: now, updatedBy: uid.teacher });
hv("hv-aarav-1", "Aarav Raman", "rightConduct", "Helped organise classroom materials without being asked.", "Classroom");
hv("hv-aarav-2", "Aarav Raman", "love", "Comforted a younger pupil who was upset at dismissal.", "Dismissal");
hv("hv-ishaan-1", "Ishaan Kumar", "truth", "Owned up to a mistake in group work and fixed it.", "Group project");
put("studentAchievements/ach-aarav-1", meta({ studentId: studentIds["Aarav Raman"], classId: classOfStudent("Aarav Raman"), title: "Zone Mathematics Olympiad — Merit", date: day(-30), category: "academic", visibility: "family", createdBy: uid.teacher }));

// ---------- announcements (internal; public news is newsPosts) ----------
const notice = (id, data) => put(`announcements/${id}`, meta({ academicYearId: null, body: "", category: "school", pinned: false, attachments: [], status: "published", publishedAt: now, publishAt: null, expiresAt: null, createdBy: uid.office, ...data }));
notice("an-welcome", { title: "Welcome to the SRSS Digital Hub", body: "Notices, attendance and your child's portfolio now live here.", audienceKeys: ["school"], pinned: true });
notice("an-parents-ptm", { title: "Parent–teacher meetings next month", body: "Booking opens soon. Look out for the request in Actions Required.", audienceKeys: ["role:parents"], category: "event" });
notice("an-class4", { title: "Standard 4: bring a recycled item on Friday", body: "For our Human Values project on caring for the earth.", audienceKeys: [`class:${demo.classId(YEAR.id, 4)}`], category: "class", createdBy: uid.teacher });
notice("an-class5", { title: "Standard 5: library books due Monday", body: "Please return your library books.", audienceKeys: [`class:${demo.classId(YEAR.id, 5)}`], category: "reminder", createdBy: uid.teacher2 });
notice("an-staff", { title: "Staff briefing: SRSS25 launch roles", body: "Please review your launch-week responsibilities.", audienceKeys: ["role:staff"], category: "school" });
notice("an-std6-exams", { title: "Standard 6 revision timetable", body: "The revision timetable is attached.", audienceKeys: ["standard:6"], category: "academic", attachments: [{ label: "Revision timetable", url: "https://drive.google.com/demo-revision" }] });
notice("an-urgent", { title: "Heavy rain: dismissal moved to the hall", body: "Please collect children from the school hall today.", audienceKeys: ["role:parents"], category: "urgent", expiresAt: day(1) });
notice("an-scheduled", { title: "Sports Day volunteers needed", body: "Sign up with the office.", audienceKeys: ["role:parents"], category: "event", status: "scheduled", publishedAt: null, publishAt: Timestamp.fromDate(new Date(Date.now() + 3 * 864e5)) });
notice("an-draft", { title: "Draft: term 3 newsletter", body: "Draft text.", audienceKeys: ["school"], status: "draft", publishedAt: null });
notice("an-expired", { title: "Book fair this week", body: "Expired notice — hidden from lists.", audienceKeys: ["school"], category: "event", expiresAt: day(-2) });

// ---------- calendar ----------
const event = (id, data) => put(`events/${id}`, meta({ academicYearId: null, description: null, endDate: null, allDay: false, startTime: null, endTime: null, location: null, attachments: [], publicListing: false, status: "published", createdBy: uid.office, ...data }));
event("ev-sports", { title: "Sports Day", date: day(12), startTime: "07:30", endTime: "12:30", location: "School field", audienceKeys: ["school"], category: "school", publicListing: true, consentRequired: "eventMedia" });
event("ev-ptm", { title: "Parent–Teacher Meetings", date: day(26), startTime: "08:00", location: "Classrooms / Google Meet", audienceKeys: ["role:parents", "role:teachers"], category: "meeting" });
event("ev-holiday", { title: "Deepavali school holiday", date: day(18), endDate: day(19), allDay: true, audienceKeys: ["school"], category: "holiday", publicListing: true });
event("ev-assessment", { title: "Standard 6 mid-term assessment", date: day(9), startTime: "08:00", endTime: "11:00", audienceKeys: ["standard:6"], category: "academic" });
event("ev-class4-trip", { title: "Standard 4 visit to the recycling centre", date: day(6), startTime: "09:00", endTime: "12:00", location: "Kuala Lumpur", audienceKeys: [`class:${demo.classId(YEAR.id, 4)}`], category: "class", createdBy: uid.teacher, description: "Bring a hat and a water bottle." });
event("ev-staff", { title: "Staff development day", date: day(15), allDay: true, audienceKeys: ["role:staff"], category: "meeting" });
event("ev-srss25", { title: "SRSS25 Silver Jubilee launch", date: "2027-01-23", startTime: "09:00", location: "School hall", audienceKeys: ["school"], category: "school", publicListing: true });
put("notificationRecords/nt-1", { recipientUid: uid.parent, category: "actionRequired", title: "Emergency contact details need confirming", body: "Please confirm Aarav's emergency contacts.", link: "/hub/forms", critical: true, createdAt: now, readAt: null });

// ---------- forms, admissions, fees-lite, public CMS ----------
put("formDefinitions/fd-emergency", meta({ title: "Emergency contact & collection update", purpose: "Keep emergency and authorised-collection contacts current", ownerRole: "schoolAdmin", audienceKeys: ["role:parents"], fields: ["primaryContact", "secondaryContact", "authorisedCollection"], approvalRequired: true, status: "published" }));
put("formSubmissions/fs-raman-emergency", { formId: "fd-emergency", formTitle: "Emergency contact & collection update", studentId: studentIds["Aarav Raman"], requestedFromUid: uid.parent, status: "pending", dueDate: day(5), createdAt: now, createdBy: uid.office, updatedAt: now, updatedBy: uid.office });
put("admissionEnquiries/enq-1", { parentName: "Farah Aziz (demo)", email: "farah.demo@example.com", phone: "+60 13-000 2222", childName: "Zara", childDateOfBirth: "2021-03-14", enteringStandard: 1, message: "We'd like to visit before applying.", source: "website", status: "new", createdAt: now, consentToContact: true });
put("admissionEnquiries/enq-2", { parentName: "Kevin Ong (demo)", email: "kevin.demo@example.com", childName: "Ethan", enteringStandard: 3, source: "website", status: "visitBooked", createdAt: now, consentToContact: true });
put("applications/app-1", meta({ applicantUid: null, status: "underReview", child: { name: "Zara Aziz", dateOfBirth: "2021-03-14" }, guardians: [{ name: "Farah Aziz (demo)", email: "farah.demo@example.com", relationship: "mother" }], enteringStandard: 1, submittedAt: now, createdBy: uid.admissions }));
put("applications/app-2", meta({ applicantUid: null, status: "accepted", child: { name: "Hannah Lee", dateOfBirth: "2020-07-02" }, guardians: [{ name: "Grace Lee (demo)", email: "grace.demo@example.com", relationship: "mother" }], enteringStandard: 2, startDate: YEAR.startDate, submittedAt: now, createdBy: uid.admissions }));
put("feeStructures/fs-2027", meta({ name: "2027 tuition (demo)", amount: 1800, currency: "MYR", instalments: 3 }));
put("studentFeeAssignments/sfa-aarav", meta({ studentId: studentIds["Aarav Raman"], feeStructureId: "fs-2027", amountDue: 1800, amountPaid: 1200, outstanding: 600, nextDueDate: day(14) }));
put("studentFeeAssignments/sfa-anika", meta({ studentId: studentIds["Anika Raman"], feeStructureId: "fs-2027", amountDue: 1800, amountPaid: 1800, outstanding: 0 }));
put("newsPosts/np-1", meta({ title: "Standard 4 recycling corner wins zone award", category: "Achievements", date: day(-3), image: "/assets/photos/processed/sports-day-podium-1600.jpg", excerpt: "Our Standard 4 pupils turned a quiet corner into a working recycling station.", status: "published", ownerRole: "contentEditor", reviewDate: day(60), publishedAt: now }));
put("newsPosts/np-2", meta({ title: "SRSS25: call for alumni stories", category: "School News", date: day(2), excerpt: "Share how SRSS shaped your journey.", status: "review", ownerRole: "contentEditor", reviewDate: day(30) }));

// ---------- commit, then derive what the Cloud Functions would ----------
for (let i = 0; i < writes.length; i += 400) {
  const batch = db.batch();
  for (const [path, data] of writes.slice(i, i + 400)) batch.set(db.doc(path), data);
  await batch.commit();
}
for (const studentId of new Set(Object.values(studentIds))) await recomputeConsentStatus(db, studentId);
for (const account of demo.ACCOUNTS) await recomputeUserScope(db, uid[account.key], account.roles);
for (const guardianId of writes.filter(([path]) => path.startsWith("guardians/")).map(([path]) => path.split("/")[1])) await refreshGuardianClasses(db, guardianId);
const content = await importLegacyContent(db, { overwrite: true });
await seedQuest(db);

console.log(`Seeded the fictional ${YEAR.name} demo school: ${demo.ACCOUNTS.length} accounts (password "${DEMO_PASSWORD}", emulator only), ${Object.keys(studentIds).length} pupils, ${writes.length} records and ${content.written} public content documents.`);
