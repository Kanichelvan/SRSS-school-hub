// Firestore security rules tests mapped to PRD acceptance criteria. Run with `npm run test:rules`.
import { readFile } from "node:fs/promises";
import { after, before, beforeEach, describe, test } from "node:test";
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";

let env;
const [firestoreHost, firestorePort = "8080"] = (process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080").split(":");
// Scope documents mirror what functions/scope.js derives.
const people = {
  parent: { roles: ["parent"], childIds: ["stu-a"], familyClassIds: ["c4"], audienceKeys: ["school", "role:parents", "class:c4", "standard:4", "user:parent"] },
  otherParent: { roles: ["parent"], childIds: ["stu-b"], familyClassIds: ["c5"], audienceKeys: ["school", "role:parents", "class:c5", "user:otherParent"] },
  student: { roles: ["student"], studentId: "stu-a", familyClassIds: ["c4"], audienceKeys: ["school", "role:students", "class:c4", "user:student"] },
  teacher: { roles: ["teacher", "classTeacher"], classIds: ["c4"], homeroomClassIds: ["c4"], publishKeys: ["class:c4"], audienceKeys: ["school", "role:staff", "role:teachers", "class:c4"] },
  specialist: { roles: ["specialistTeacher"], classIds: [], assignedStudentIds: ["stu-b"], audienceKeys: ["school", "role:staff", "role:teachers"] },
  admin: { roles: ["schoolAdmin"], audienceKeys: ["school", "role:staff"] },
  admissions: { roles: ["admissionsOfficer"], audienceKeys: ["school", "role:staff"] },
  editor: { roles: ["contentEditor"], audienceKeys: ["school", "role:staff"] },
  moderator: { roles: ["portfolioModerator"], audienceKeys: ["school", "role:staff"] },
  finance: { roles: ["financeOfficer"], audienceKeys: ["school", "role:staff"] },
  welfare: { roles: ["safeguardingLead"], audienceKeys: ["school", "role:staff"] },
  principal: { roles: ["leadership"], audienceKeys: ["school", "role:staff"] },
  superadmin: { roles: ["superAdmin"], audienceKeys: ["school", "role:staff"] },
  // A subject teacher (not the class teacher) assigned English in class c5 only.
  teacher2: { roles: ["teacher"], classIds: ["c5"], homeroomClassIds: [], assignmentKeys: ["c5:bi"], publishKeys: ["class:c5"], audienceKeys: ["school", "role:staff", "role:teachers", "class:c5"] },
  coordinator: { roles: ["academicCoordinator", "teacher"], audienceKeys: ["school", "role:staff"] },
  privacy: { roles: ["privacySteward"], audienceKeys: ["school", "role:staff"] },
};
const as = (name) => env.authenticatedContext(name, { roles: people[name].roles }).firestore();
const anon = () => env.unauthenticatedContext().firestore();
const seed = (path, data) => env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), path), data));

before(async () => {
  env = await initializeTestEnvironment({ projectId: "demo-srss-tests", firestore: { rules: await readFile(new URL("../../firestore.rules", import.meta.url), "utf8"), host: firestoreHost, port: Number(firestorePort) } });
});
after(() => env?.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  for (const [uid, scope] of Object.entries(people)) await seed(`users/${uid}`, scope);
  await seed("students/stu-a", { name: "A", currentClassId: "c4", status: "active" });
  await seed("students/stu-b", { name: "B", currentClassId: "c5", status: "active" });
  await seed("students/stu-a/restricted/medical", { allergies: "Peanuts" });
  await seed("attendanceRecords/r-a", { studentId: "stu-a", classId: "c4", date: "2026-10-01", status: "absent", markedBy: "teacher" });
  await seed("attendanceRecords/r-b", { studentId: "stu-b", classId: "c5", date: "2026-10-01", status: "present", markedBy: "x" });
  await seed("portfolioEntries/p-int", { title: "Internal", studentId: "stu-a", classId: "c4", visibility: "internal", createdBy: "teacher" });
  await seed("portfolioEntries/p-fam", { title: "Family", studentId: "stu-a", classId: "c4", visibility: "family", createdBy: "teacher" });
  await seed("portfolioEntries/p-cand-b", { title: "B", studentId: "stu-b", classId: "c5", visibility: "showcaseCandidate", createdBy: "x" });
  await seed("studentConsentStatus/stu-a", { classId: "c4", types: { publicShowcase: { response: "granted" } } });
  await seed("studentConsentStatus/stu-b", { classId: "c5", types: { publicShowcase: { response: "declined" } } });
  await seed("consentRecords/cr-1", { studentId: "stu-a", classId: "c4", guardianUid: "parent", consentType: "photoVideo", response: "granted", definitionVersion: 1 });
  await seed("announcements/an-school", { title: "All", audienceKeys: ["school"], status: "published", createdBy: "admin" });
  await seed("announcements/an-c5", { title: "Class 5", audienceKeys: ["class:c5"], status: "published", createdBy: "admin" });
  await seed("announcements/an-staff", { title: "Staff", audienceKeys: ["role:staff"], status: "published", createdBy: "admin" });
  await seed("studentIncidents/inc-r", { studentId: "stu-a", classId: "c4", classification: "restricted", reporterUid: "teacher", status: "reported", allowedUids: [] });
  await seed("studentFeeAssignments/f-a", { studentId: "stu-a", outstanding: 600 });
});

describe("AUTH-002 guardian ↔ student contextual access", () => {
  test("a parent reads a linked child but not an unlinked one", async () => {
    await assertSucceeds(getDoc(doc(as("parent"), "students/stu-a")));
    await assertFails(getDoc(doc(as("parent"), "students/stu-b")));
  });
  test("a parent's query for their child's attendance succeeds; for another child it fails", async () => {
    await assertSucceeds(getDocs(query(collection(as("parent"), "attendanceRecords"), where("studentId", "==", "stu-a"))));
    await assertFails(getDocs(query(collection(as("parent"), "attendanceRecords"), where("studentId", "==", "stu-b"))));
  });
  test("nobody can write their own scope document", async () => {
    await assertFails(updateDoc(doc(as("parent"), "users/parent"), { childIds: ["stu-a", "stu-b"] }));
    await assertFails(updateDoc(doc(as("admin"), "users/parent"), { childIds: ["stu-b"] }));
  });
});

describe("Contextual RBAC for staff (PRD §44)", () => {
  test("a class teacher queries their class; not another class", async () => {
    await assertSucceeds(getDocs(query(collection(as("teacher"), "students"), where("currentClassId", "in", ["c4"]))));
    await assertFails(getDocs(query(collection(as("teacher"), "students"), where("currentClassId", "==", "c5"))));
    await assertSucceeds(getDocs(query(collection(as("teacher"), "attendanceRecords"), where("studentId", "==", "stu-a"), where("classId", "==", "c4"))));
  });
  test("a specialist sees only assigned pupils", async () => {
    await assertSucceeds(getDoc(doc(as("specialist"), "students/stu-b")));
    await assertFails(getDoc(doc(as("specialist"), "students/stu-a")));
  });
  test("admissions officers and content editors cannot open enrolled student records", async () => {
    await assertFails(getDoc(doc(as("admissions"), "students/stu-a")));
    await assertFails(getDoc(doc(as("editor"), "students/stu-a")));
  });
  test("restricted medical data is limited to admin, welfare and leadership", async () => {
    await assertFails(getDoc(doc(as("teacher"), "students/stu-a/restricted/medical")));
    await assertSucceeds(getDoc(doc(as("welfare"), "students/stu-a/restricted/medical")));
  });
  test("teachers never see fees; finance and the child's parent do (PRD §17/§36)", async () => {
    await assertFails(getDoc(doc(as("teacher"), "studentFeeAssignments/f-a")));
    await assertSucceeds(getDoc(doc(as("finance"), "studentFeeAssignments/f-a")));
    await assertSucceeds(getDoc(doc(as("parent"), "studentFeeAssignments/f-a")));
  });
  test("restricted incidents are closed to the reporting teacher and leadership", async () => {
    await assertSucceeds(getDoc(doc(as("welfare"), "studentIncidents/inc-r")));
    await assertFails(getDoc(doc(as("teacher"), "studentIncidents/inc-r")));
    await assertFails(getDoc(doc(as("principal"), "studentIncidents/inc-r")));
  });
});

describe("ATT-001 / ATT-002 attendance", () => {
  test("a teacher records attendance for their class only", async () => {
    await assertSucceeds(setDoc(doc(as("teacher"), "attendanceSessions/c4_2026-10-02_am"), { classId: "c4", date: "2026-10-02", sessionType: "am", status: "submitted", openedBy: "teacher", submittedBy: "teacher" }));
    await assertSucceeds(setDoc(doc(as("teacher"), "attendanceRecords/c4_2026-10-02_am_stu-a"), { sessionId: "c4_2026-10-02_am", classId: "c4", date: "2026-10-02", studentId: "stu-a", status: "late", markedBy: "teacher" }));
    await assertFails(setDoc(doc(as("teacher"), "attendanceSessions/c5_2026-10-02_am"), { classId: "c5", date: "2026-10-02", sessionType: "am", status: "open", openedBy: "teacher" }));
  });
  test("attendance status must be a known value and markedBy must be the teacher", async () => {
    await assertFails(setDoc(doc(as("teacher"), "attendanceRecords/x"), { classId: "c4", studentId: "stu-a", status: "skipped", markedBy: "teacher" }));
    await assertFails(setDoc(doc(as("teacher"), "attendanceRecords/y"), { classId: "c4", studentId: "stu-a", status: "present", markedBy: "someone-else" }));
  });
  test("attendance identity and class membership cannot be rewritten", async () => {
    await seed("attendanceRecords/stable", { sessionId: "c4_2026-10-01_am", classId: "c4", date: "2026-10-01", studentId: "stu-a", status: "present", markedBy: "teacher" });
    await assertFails(updateDoc(doc(as("teacher"), "attendanceRecords/stable"), { status: "late", markedBy: "teacher" }));
    await assertSucceeds(updateDoc(doc(as("teacher"), "attendanceRecords/stable"), { status: "late", markedBy: "teacher", correctionReason: "Arrived after the register", correctedBy: "teacher", correctedAt: serverTimestamp() }));
    await assertFails(updateDoc(doc(as("teacher"), "attendanceRecords/stable"), { studentId: "stu-b", markedBy: "teacher" }));
    await assertFails(updateDoc(doc(as("teacher"), "attendanceRecords/stable"), { classId: "c5", markedBy: "teacher" }));
    await assertFails(setDoc(doc(as("teacher"), "attendanceRecords/unrelated"), { sessionId: "c4_2026-10-02_am", classId: "c4", date: "2026-10-02", studentId: "stu-b", status: "present", markedBy: "teacher" }));
  });
});

describe("POR-001 / CON-002 portfolio visibility and consent", () => {
  test("families see family-visible entries, never internal ones", async () => {
    await assertSucceeds(getDocs(query(collection(as("parent"), "portfolioEntries"), where("studentId", "==", "stu-a"), where("visibility", "in", ["family", "showcaseCandidate", "publicShowcase"]))));
    await assertFails(getDoc(doc(as("parent"), "portfolioEntries/p-int")));
  });
  test("new entries default to internal or family; a teacher cannot publish publicly", async () => {
    await assertSucceeds(setDoc(doc(as("teacher"), "portfolioEntries/new"), { title: "Work", studentId: "stu-a", classId: "c4", visibility: "internal", createdBy: "teacher" }));
    await assertFails(setDoc(doc(as("teacher"), "portfolioEntries/new2"), { title: "Work", studentId: "stu-a", classId: "c4", visibility: "publicShowcase", createdBy: "teacher" }));
    await assertFails(updateDoc(doc(as("teacher"), "portfolioEntries/p-fam"), { visibility: "publicShowcase" }));
  });
  test("a moderator publishes only when public-showcase consent is granted", async () => {
    await seed("portfolioEntries/p-cand-a", { title: "Candidate", studentId: "stu-a", classId: "c4", visibility: "showcaseCandidate", createdBy: "teacher" });
    await assertSucceeds(updateDoc(doc(as("moderator"), "portfolioEntries/p-cand-a"), { visibility: "publicShowcase", moderationStatus: "approved" }));
    await assertFails(updateDoc(doc(as("moderator"), "portfolioEntries/p-cand-b"), { visibility: "publicShowcase", moderationStatus: "approved" }));
  });
  test("Human Values observations reject numeric scores", async () => {
    const base = { studentId: "stu-a", classId: "c4", value: "love", observation: "Comforted a friend.", type: "positive", createdBy: "teacher" };
    await assertSucceeds(setDoc(doc(as("teacher"), "humanValuesObservations/ok"), base));
    await assertFails(setDoc(doc(as("teacher"), "humanValuesObservations/score"), { ...base, score: 8 }));
    await assertFails(setDoc(doc(as("teacher"), "humanValuesObservations/bad"), { ...base, value: "8/10 love" }));
  });
});

describe("CON-001 / CON-006 consent", () => {
  test("a guardian records consent for their own child only", async () => {
    const record = { studentId: "stu-a", classId: "c4", guardianUid: "parent", consentType: "eventMedia", response: "granted", definitionVersion: 1, createdAt: serverTimestamp() };
    await assertSucceeds(setDoc(doc(as("parent"), "consentRecords/new"), record));
    await assertFails(setDoc(doc(as("parent"), "consentRecords/new2"), { ...record, studentId: "stu-b" }));
  });
  test("the office enters answers only from a signed paper form, naming the guardian", async () => {
    const paper = { studentId: "stu-b", classId: "c5", guardianUid: null, guardianName: "Mrs Tan", recordedBy: "admin", source: "paperForm", consentType: "socialMedia", response: "declined", definitionVersion: 1, createdAt: serverTimestamp() };
    await assertSucceeds(setDoc(doc(as("admin"), "consentRecords/paper-1"), paper));
    await assertFails(setDoc(doc(as("admin"), "consentRecords/paper-2"), { ...paper, source: "parentPortal" }));
    await assertFails(setDoc(doc(as("teacher"), "consentRecords/paper-3"), { ...paper, recordedBy: "teacher" }));
  });
  test("consent records are never overwritten", async () => {
    await assertFails(updateDoc(doc(as("parent"), "consentRecords/cr-1"), { response: "withdrawn" }));
    await assertFails(updateDoc(doc(as("admin"), "consentRecords/cr-1"), { response: "withdrawn" }));
  });
  test("only the office and leadership see reminder history, and only the server writes it", async () => {
    await assertSucceeds(getDoc(doc(as("admin"), "consentReminders/stu-a")));
    await assertFails(getDoc(doc(as("parent"), "consentReminders/stu-a")));
    await assertFails(setDoc(doc(as("admin"), "consentReminders/stu-a"), { studentId: "stu-a" }));
  });
  test("staff acknowledge the confidentiality terms for themselves, once per version", async () => {
    const ack = (who, version) => ({ uid: who, version, acknowledgedAt: serverTimestamp() });
    await assertSucceeds(setDoc(doc(as("teacher"), "policyAcknowledgements/teacher"), ack("teacher", 1)));
    await assertFails(setDoc(doc(as("teacher"), "policyAcknowledgements/admin"), ack("admin", 1)));
    await assertFails(setDoc(doc(as("teacher"), "policyAcknowledgements/teacher"), ack("teacher", 1)));
    await assertSucceeds(setDoc(doc(as("teacher"), "policyAcknowledgements/teacher"), ack("teacher", 2)));
    await assertSucceeds(getDoc(doc(as("admin"), "policyAcknowledgements/teacher")));
    await assertFails(getDoc(doc(as("parent"), "policyAcknowledgements/teacher")));
  });
});

describe("DASH-001 / DASH-002 dashboards and targeting", () => {
  test("announcement queries return only the user's audiences", async () => {
    await assertSucceeds(getDocs(query(collection(as("parent"), "announcements"), where("status", "==", "published"), where("audienceKeys", "array-contains-any", people.parent.audienceKeys))));
    await assertFails(getDoc(doc(as("parent"), "announcements/an-c5")));
    await assertFails(getDoc(doc(as("parent"), "announcements/an-staff")));
  });
  test("a teacher may publish to their own class but not school-wide", async () => {
    await assertSucceeds(setDoc(doc(as("teacher"), "announcements/t1"), { title: "c4", audienceKeys: ["class:c4"], status: "published", createdBy: "teacher" }));
    await assertFails(setDoc(doc(as("teacher"), "announcements/t2"), { title: "all", audienceKeys: ["school"], status: "published", createdBy: "teacher" }));
  });
  test("a parent's Actions Required query reads only requests addressed to them", async () => {
    await seed("formSubmissions/fs-1", { formId: "f", requestedFromUid: "parent", status: "pending", studentId: "stu-a" });
    await assertSucceeds(getDocs(query(collection(as("parent"), "formSubmissions"), where("requestedFromUid", "==", "parent"), where("status", "==", "pending"))));
    await assertFails(getDocs(query(collection(as("otherParent"), "formSubmissions"), where("status", "==", "pending"))));
  });
});

describe("PUB-002 CMS and public admissions", () => {
  test("only published posts are public; editors cannot publish", async () => {
    await seed("newsPosts/pub", { title: "Live", status: "published" });
    await seed("newsPosts/draft", { title: "Draft", status: "draft" });
    await assertSucceeds(getDoc(doc(anon(), "newsPosts/pub")));
    await assertFails(getDoc(doc(anon(), "newsPosts/draft")));
    await assertSucceeds(setDoc(doc(as("editor"), "newsPosts/n1"), { title: "x", status: "review" }));
    await assertFails(setDoc(doc(as("editor"), "newsPosts/n2"), { title: "x", status: "published" }));
  });
  test("the public may submit a well-formed enquiry but cannot read enquiries", async () => {
    await assertSucceeds(setDoc(doc(anon(), "admissionEnquiries/e1"), { parentName: "P", email: "p@example.com", childName: "C", status: "new", createdAt: serverTimestamp() }));
    await assertSucceeds(setDoc(doc(anon(), "admissionEnquiries/e3"), { parentName: "P", email: "p@example.com", childName: "C", childAge: "6", currentSchool: "Tadika", referralSource: "Family or friend", message: "Hi", source: "website", status: "new", createdAt: serverTimestamp() }));
    await assertFails(setDoc(doc(anon(), "admissionEnquiries/e2"), { parentName: "P", email: "p@example.com", status: "accepted", createdAt: serverTimestamp() }));
    await assertFails(getDoc(doc(anon(), "admissionEnquiries/e1")));
  });
  test("editors cannot take down or rewrite live content; leadership can", async () => {
    await seed("newsPosts/live", { title: "Live", status: "published" });
    await assertFails(updateDoc(doc(as("editor"), "newsPosts/live"), { status: "draft" }));
    await assertSucceeds(updateDoc(doc(as("principal"), "newsPosts/live"), { status: "archived" }));
  });
  test("page drafts are staff-only; the live page is public once published", async () => {
    await assertSucceeds(setDoc(doc(as("editor"), "pageDrafts/homepage"), { content: { hero: "x" }, status: "review" }));
    await assertFails(getDoc(doc(anon(), "pageDrafts/homepage")));
    await assertFails(setDoc(doc(as("editor"), "pages/homepage"), { content: { hero: "x" }, status: "published" }));
    await assertSucceeds(setDoc(doc(as("principal"), "pages/homepage"), { content: { hero: "x" }, status: "published" }));
    await assertSucceeds(getDoc(doc(anon(), "pages/homepage")));
  });
  test("the public may send a contact message that only the office can read", async () => {
    const message = { name: "N", email: "n@example.com", subject: "General", message: "Hello", status: "new", createdAt: serverTimestamp() };
    await assertSucceeds(setDoc(doc(anon(), "contactMessages/m1"), message));
    await assertFails(setDoc(doc(anon(), "contactMessages/m2"), { ...message, subject: "Spam" }));
    await assertFails(setDoc(doc(anon(), "contactMessages/m3"), { ...message, extra: true }));
    for (const subject of ["Alumni", "Volunteer", "Support SRSS", "SRSS25 memory"]) await assertSucceeds(setDoc(doc(anon(), `contactMessages/c-${subject.replace(/\W/g, "")}`), { ...message, subject }));
    await assertFails(getDoc(doc(anon(), "contactMessages/m1")));
    await assertFails(getDoc(doc(as("teacher"), "contactMessages/m1")));
    await assertSucceeds(getDoc(doc(as("admin"), "contactMessages/m1")));
  });
  test("audit logs are never client-writable", async () => {
    await assertFails(setDoc(doc(as("principal"), "auditLogs/x"), { type: "forged" }));
  });
});

describe("PUB-002 / CON-002 website image library", () => {
  const image = (id, changes = {}) => ({ url: "", storagePath: `media/public/${id}`, alt: "Pupils planting the values garden", classification: "public", status: "staging", containsPupils: true, consentChecked: true, uploadedBy: "editor", createdAt: serverTimestamp(), ...changes });
  test("editors register images with alt text and a consent check for pupil photos", async () => {
    await assertSucceeds(setDoc(doc(as("editor"), "mediaRegistry/m1"), image("m1")));
    await assertSucceeds(updateDoc(doc(as("editor"), "mediaRegistry/m1"), { url: "https://example.test/a.webp", status: "approved", updatedBy: "editor" }));
    await assertFails(updateDoc(doc(as("editor"), "mediaRegistry/m1"), { url: "https://example.test/replacement.webp" }));
    await assertFails(setDoc(doc(as("editor"), "mediaRegistry/m2"), image("m2", { alt: "" })));
    await assertFails(setDoc(doc(as("editor"), "mediaRegistry/m3"), image("m3", { consentChecked: false })));
    await assertSucceeds(setDoc(doc(as("editor"), "mediaRegistry/m4"), image("m4", { containsPupils: false, consentChecked: false })));
    await assertFails(setDoc(doc(as("teacher"), "mediaRegistry/m5"), image("m5", { uploadedBy: "teacher" })));
    await assertFails(setDoc(doc(as("editor"), "mediaRegistry/m6"), image("m6", { uploadedBy: "someone-else" })));
  });
  test("the file location cannot be rewritten; archived images leave the public listing", async () => {
    await seed("mediaRegistry/m1", image("m1", { url: "https://example.test/a.webp", status: "approved", createdAt: new Date() }));
    await assertFails(updateDoc(doc(as("editor"), "mediaRegistry/m1"), { storagePath: "media/public/other" }));
    await assertFails(updateDoc(doc(as("editor"), "mediaRegistry/m1"), { url: "https://example.test/replacement.webp" }));
    await assertSucceeds(updateDoc(doc(as("editor"), "mediaRegistry/m1"), { status: "archived" }));
    await assertFails(getDoc(doc(anon(), "mediaRegistry/m1")));
  });
});

// ---------- Role-based application and school master data (14 Oct 2026) ----------
const stamped = (who, data) => ({ ...data, status: data.status ?? "active", createdAt: serverTimestamp(), createdBy: who, updatedAt: serverTimestamp(), updatedBy: who });
const edit = (who, data) => ({ ...data, updatedAt: serverTimestamp(), updatedBy: who });
async function seedSchool() {
  await seed("academicYears/ay2027", { name: "2027", startDate: "2027-01-11", endDate: "2027-11-26", status: "active" });
  await seed("classes/c4", { name: "4 Amanah", standard: 4, academicYearId: "ay2027", classTeacherUid: "teacher", status: "active" });
  await seed("classes/c5", { name: "5 Bakti", standard: 5, academicYearId: "ay2027", classTeacherUid: null, status: "active" });
  await seed("subjects/math", { name: "Mathematics", status: "active" });
  await seed("subjects/bi", { name: "English", status: "active" });
  await seed("guardians/g-a", { name: "Parent A", uid: "parent", status: "active" });
  await seed("guardians/g-new", { name: "New guardian", uid: null, status: "active" });
}

describe("Roles: Super Administrator and the office", () => {
  test("a Super Administrator has the office's rights", async () => {
    await seedSchool();
    await assertSucceeds(getDoc(doc(as("superadmin"), "students/stu-a")));
    await assertSucceeds(setDoc(doc(as("superadmin"), "classes/c-new"), stamped("superadmin", { name: "6 Cekal", standard: 6, academicYearId: "ay2027" })));
    await assertSucceeds(getDoc(doc(as("superadmin"), "users/parent")));
  });
  test("nobody — not even an administrator — can write roles or scope from the client", async () => {
    await assertFails(setDoc(doc(as("superadmin"), "users/teacher"), { roles: ["schoolAdmin"] }));
    await assertFails(setDoc(doc(as("admin"), "userRoles/x"), { uid: "teacher", after: ["schoolAdmin"] }));
  });
});

describe("Academic structure: validation, history and self-assignment", () => {
  test("classes need a real year, a Standard 1–6 and the writer's stamp", async () => {
    await seedSchool();
    await assertSucceeds(setDoc(doc(as("admin"), "classes/c-ok"), stamped("admin", { name: "3 Cekal", standard: 3, academicYearId: "ay2027" })));
    await assertFails(setDoc(doc(as("admin"), "classes/c-bad-year"), stamped("admin", { name: "3 X", standard: 3, academicYearId: "ay1999" })));
    await assertFails(setDoc(doc(as("admin"), "classes/c-bad-std"), stamped("admin", { name: "7 X", standard: 7, academicYearId: "ay2027" })));
    await assertFails(setDoc(doc(as("admin"), "classes/c-nostamp"), { name: "3 Y", standard: 3, academicYearId: "ay2027", status: "active" }));
    await assertFails(setDoc(doc(as("teacher"), "classes/c-teacher"), stamped("teacher", { name: "3 Z", standard: 3, academicYearId: "ay2027" })));
  });
  test("a class keeps its year and Standard; nobody makes themselves class teacher", async () => {
    await seedSchool();
    await assertFails(updateDoc(doc(as("admin"), "classes/c4"), edit("admin", { standard: 5 })));
    await assertSucceeds(updateDoc(doc(as("admin"), "classes/c5"), edit("admin", { classTeacherUid: "teacher2", room: "B2" })));
    await assertFails(updateDoc(doc(as("admin"), "classes/c5"), edit("admin", { classTeacherUid: "admin" })));
    await assertFails(setDoc(doc(as("coordinator"), "classes/c-self"), stamped("coordinator", { name: "2 A", standard: 2, academicYearId: "ay2027", classTeacherUid: "coordinator" })));
  });
  test("teachers cannot assign themselves (or anyone) to classes", async () => {
    await seedSchool();
    const assignment = (teacherUid) => ({ teacherUid, classId: "c5", subjectId: "math", academicYearId: "ay2027" });
    await assertFails(setDoc(doc(as("teacher"), "teacherAssignments/t-self"), stamped("teacher", assignment("teacher"))));
    await assertFails(setDoc(doc(as("coordinator"), "teacherAssignments/c-self"), stamped("coordinator", assignment("coordinator"))));
    await assertFails(setDoc(doc(as("admin"), "teacherAssignments/a-self"), stamped("admin", assignment("admin"))));
    await assertSucceeds(setDoc(doc(as("admin"), "teacherAssignments/ok"), stamped("admin", assignment("teacher2"))));
    await assertFails(setDoc(doc(as("admin"), "teacherAssignments/wrong-year"), stamped("admin", { ...assignment("teacher2"), academicYearId: "ay2026" })));
  });
  test("an assignment's teacher, class, subject and year never change; it is archived instead", async () => {
    await seedSchool();
    await seed("teacherAssignments/ta", { teacherUid: "teacher2", classId: "c5", subjectId: "bi", academicYearId: "ay2027", status: "active" });
    await assertFails(updateDoc(doc(as("admin"), "teacherAssignments/ta"), edit("admin", { teacherUid: "teacher" })));
    await assertSucceeds(updateDoc(doc(as("admin"), "teacherAssignments/ta"), edit("admin", { status: "archived" })));
  });
  test("enrolment history is kept: class and year are fixed; moving class ends one and starts another", async () => {
    await seedSchool();
    await seed("enrollments/e-a", { studentId: "stu-a", classId: "c4", academicYearId: "ay2027", standard: 4, startDate: "2027-01-11", status: "active" });
    await assertFails(updateDoc(doc(as("admin"), "enrollments/e-a"), edit("admin", { classId: "c5" })));
    await assertSucceeds(updateDoc(doc(as("admin"), "enrollments/e-a"), edit("admin", { status: "transferred", endDate: "2027-03-01" })));
    await assertSucceeds(setDoc(doc(as("admin"), "enrollments/e-a2"), stamped("admin", { studentId: "stu-a", classId: "c5", academicYearId: "ay2027", standard: 5, startDate: "2027-03-01" })));
    await assertFails(setDoc(doc(as("admin"), "enrollments/e-bad"), stamped("admin", { studentId: "stu-a", classId: "c5", academicYearId: "ay2027", standard: 4, startDate: "2027-03-01" })));
    await assertFails(setDoc(doc(as("teacher"), "enrollments/e-t"), stamped("teacher", { studentId: "stu-b", classId: "c4", academicYearId: "ay2027", standard: 4, startDate: "2027-03-01" })));
  });
});

describe("People: guardian links and sign-in accounts", () => {
  test("guardians cannot link themselves to a child; only the office can", async () => {
    await seedSchool();
    const link = { studentId: "stu-b", guardianId: "g-a", guardianUid: "parent", classId: "c5", relationship: "mother", hasPortalAccess: true };
    await assertFails(setDoc(doc(as("parent"), "studentGuardianLinks/self"), stamped("parent", link)));
    await assertFails(setDoc(doc(as("teacher"), "studentGuardianLinks/teacher"), stamped("teacher", link)));
    await assertSucceeds(setDoc(doc(as("admin"), "studentGuardianLinks/office"), stamped("admin", link)));
  });
  test("a link must carry the guardian's own account and the pupil's class", async () => {
    await seedSchool();
    const link = { studentId: "stu-b", guardianId: "g-new", guardianUid: null, classId: "c5", relationship: "father", hasPortalAccess: true };
    await assertSucceeds(setDoc(doc(as("admin"), "studentGuardianLinks/l1"), stamped("admin", link)));
    await assertFails(setDoc(doc(as("admin"), "studentGuardianLinks/l2"), stamped("admin", { ...link, guardianUid: "otherParent" })));
    await assertFails(setDoc(doc(as("admin"), "studentGuardianLinks/l3"), stamped("admin", { ...link, classId: "c4" })));
    await assertFails(updateDoc(doc(as("admin"), "studentGuardianLinks/l1"), edit("admin", { guardianUid: "otherParent" })));
  });
  test("sign-in accounts are linked to person records by the server only", async () => {
    await seedSchool();
    await assertFails(updateDoc(doc(as("admin"), "guardians/g-new"), edit("admin", { uid: "otherParent" })));
    await assertSucceeds(updateDoc(doc(as("admin"), "guardians/g-new"), edit("admin", { name: "New guardian", phone: "+60 12" })));
    await assertFails(setDoc(doc(as("admin"), "students/s-new"), stamped("admin", { name: "Pupil", uid: "student" })));
    await assertSucceeds(setDoc(doc(as("admin"), "students/s-ok"), stamped("admin", { name: "Pupil", uid: null, currentClassId: null })));
    await assertFails(updateDoc(doc(as("admin"), "students/s-ok"), edit("admin", { name: "Pupil", currentClassId: "c4" })));
  });
});

describe("Teacher, parent and student scope", () => {
  test("a teacher cannot read another class's pupils or records (cross-class denial)", async () => {
    await assertFails(getDoc(doc(as("teacher2"), "students/stu-a")));
    await assertFails(getDocs(query(collection(as("teacher2"), "attendanceRecords"), where("classId", "==", "c4"))));
    await assertSucceeds(getDoc(doc(as("teacher2"), "students/stu-b")));
  });
  test("a parent never reads another family's records (cross-family denial)", async () => {
    await assertFails(getDoc(doc(as("otherParent"), "students/stu-a")));
    await assertFails(getDocs(query(collection(as("otherParent"), "attendanceRecords"), where("studentId", "==", "stu-a"))));
    await assertFails(getDocs(query(collection(as("otherParent"), "portfolioEntries"), where("studentId", "==", "stu-a"), where("visibility", "in", ["family"]))));
    await assertFails(getDoc(doc(as("otherParent"), "guardians/g-a")));
  });
  test("a pupil reads only their own record and who teaches their class", async () => {
    await seed("teacherAssignments/ta4", { teacherUid: "teacher", classId: "c4", subjectId: "math", academicYearId: "ay2027", status: "active" });
    await seed("teacherAssignments/ta5", { teacherUid: "teacher2", classId: "c5", subjectId: "bi", academicYearId: "ay2027", status: "active" });
    await assertSucceeds(getDoc(doc(as("student"), "students/stu-a")));
    await assertFails(getDoc(doc(as("student"), "students/stu-b")));
    await assertSucceeds(getDocs(query(collection(as("student"), "teacherAssignments"), where("classId", "==", "c4"))));
    await assertFails(getDoc(doc(as("student"), "teacherAssignments/ta5")));
  });
});

describe("Portfolio: assigned pupils, subjects, moderation and the public copy", () => {
  const entry = (who, data) => ({ title: "Work", createdBy: who, visibility: "family", ...data });
  test("teachers write only for pupils in their class and for subjects they teach there", async () => {
    await assertFails(setDoc(doc(as("teacher"), "portfolioEntries/other-class"), entry("teacher", { studentId: "stu-b", classId: "c4" })));
    await assertSucceeds(setDoc(doc(as("teacher2"), "portfolioEntries/bi"), entry("teacher2", { studentId: "stu-b", classId: "c5", subjectId: "bi" })));
    await assertFails(setDoc(doc(as("teacher2"), "portfolioEntries/math"), entry("teacher2", { studentId: "stu-b", classId: "c5", subjectId: "math" })));
    await assertSucceeds(setDoc(doc(as("teacher"), "portfolioEntries/homeroom-any"), entry("teacher", { studentId: "stu-a", classId: "c4", subjectId: "art" })));
  });
  test("only a moderator can mark an entry approved; values must be the five Human Values", async () => {
    await assertFails(setDoc(doc(as("teacher"), "portfolioEntries/self-approve"), entry("teacher", { studentId: "stu-a", classId: "c4", visibility: "showcaseCandidate", moderationStatus: "approved" })));
    await assertSucceeds(setDoc(doc(as("teacher"), "portfolioEntries/nominate"), entry("teacher", { studentId: "stu-a", classId: "c4", visibility: "showcaseCandidate", moderationStatus: "pending", humanValues: ["love", "truth"] })));
    await assertFails(setDoc(doc(as("teacher"), "portfolioEntries/bad-values"), entry("teacher", { studentId: "stu-a", classId: "c4", humanValues: ["kindness"] })));
  });
  test("entries (with their private media links) are never public; only the server-written showcase copy is", async () => {
    await seed("portfolioEntries/pub", { title: "Public", studentId: "stu-a", classId: "c4", visibility: "publicShowcase", moderationStatus: "approved", mediaReferences: [{ url: "https://drive.google.com/x" }] });
    await seed("showcaseItems/pub", { status: "published", title: "Public", firstName: "A" });
    await assertFails(getDoc(doc(anon(), "portfolioEntries/pub")));
    await assertSucceeds(getDoc(doc(anon(), "showcaseItems/pub")));
    await assertFails(setDoc(doc(as("moderator"), "showcaseItems/forged"), { status: "published", title: "x" }));
  });
});

describe("Announcements and calendar", () => {
  test("teachers post routine notices to their own class only — never school-wide, urgent or pinned", async () => {
    const notice = (data) => ({ title: "Notice", body: "", createdBy: "teacher2", status: "published", audienceKeys: ["class:c5"], category: "reminder", ...data });
    await assertSucceeds(setDoc(doc(as("teacher2"), "announcements/ok"), notice({})));
    await assertFails(setDoc(doc(as("teacher2"), "announcements/urgent"), notice({ category: "urgent" })));
    await assertFails(setDoc(doc(as("teacher2"), "announcements/pinned"), notice({ pinned: true })));
    await assertFails(setDoc(doc(as("teacher2"), "announcements/other"), notice({ audienceKeys: ["class:c4"] })));
    await assertSucceeds(setDoc(doc(as("admin"), "announcements/school"), { title: "All", body: "", createdBy: "admin", status: "scheduled", audienceKeys: ["school"], category: "urgent", pinned: true }));
  });
  test("drafts and scheduled notices are invisible to their audience", async () => {
    await seed("announcements/draft", { title: "Draft", audienceKeys: ["school"], status: "draft", createdBy: "admin" });
    await assertFails(getDoc(doc(as("parent"), "announcements/draft")));
  });
  test("teachers add class events for their own class; never public ones", async () => {
    const event = (data) => stamped("teacher2", { title: "Trip", date: "2027-02-01", status: "published", audienceKeys: ["class:c5"], category: "class", ...data });
    await assertSucceeds(setDoc(doc(as("teacher2"), "events/trip"), event({})));
    await assertFails(setDoc(doc(as("teacher2"), "events/public"), event({ publicListing: true })));
    await assertFails(setDoc(doc(as("teacher2"), "events/holiday"), event({ category: "holiday" })));
    await assertFails(setDoc(doc(as("teacher2"), "events/c4"), event({ audienceKeys: ["class:c4"] })));
  });
});

describe("Configuration and consent questions", () => {
  test("configuration lists are written by the office, not by teachers", async () => {
    await assertSucceeds(setDoc(doc(as("admin"), "announcementCategories/reminder"), stamped("admin", { name: "Reminder", order: 5 })));
    await assertFails(setDoc(doc(as("teacher"), "announcementCategories/x"), stamped("teacher", { name: "X", order: 1 })));
    await assertSucceeds(setDoc(doc(as("editor"), "downloadCategories/forms"), stamped("editor", { name: "Forms", order: 1 })));
  });
  test("rewording a consent question must raise its version", async () => {
    await seed("consentDefinitions/photoVideo", { type: "photoVideo", title: "Photos", question: "May {child}?", version: 1, status: "active" });
    await assertFails(updateDoc(doc(as("privacy"), "consentDefinitions/photoVideo"), edit("privacy", { question: "Now may {child}?" })));
    await assertSucceeds(updateDoc(doc(as("privacy"), "consentDefinitions/photoVideo"), edit("privacy", { question: "Now may {child}?", version: 2 })));
    await assertSucceeds(updateDoc(doc(as("privacy"), "consentDefinitions/photoVideo"), edit("privacy", { title: "Photos and videos" })));
    await assertFails(updateDoc(doc(as("teacher"), "consentDefinitions/photoVideo"), edit("teacher", { title: "x" })));
  });
});
