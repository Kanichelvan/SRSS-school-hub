// Firestore security rules tests mapped to PRD acceptance criteria. Run with `npm run test:rules`.
import { readFile } from "node:fs/promises";
import { after, before, beforeEach, describe, test } from "node:test";
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";

let env;
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
};
const as = (name) => env.authenticatedContext(name, { roles: people[name].roles }).firestore();
const anon = () => env.unauthenticatedContext().firestore();
const seed = (path, data) => env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), path), data));

before(async () => {
  env = await initializeTestEnvironment({ projectId: "demo-srss-rules", firestore: { rules: await readFile(new URL("../../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 } });
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
  await seed("portfolioEntries/p-int", { studentId: "stu-a", classId: "c4", visibility: "internal", createdBy: "teacher" });
  await seed("portfolioEntries/p-fam", { studentId: "stu-a", classId: "c4", visibility: "family", createdBy: "teacher" });
  await seed("portfolioEntries/p-cand-b", { studentId: "stu-b", classId: "c5", visibility: "showcaseCandidate", createdBy: "x" });
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
});

describe("POR-001 / CON-002 portfolio visibility and consent", () => {
  test("families see family-visible entries, never internal ones", async () => {
    await assertSucceeds(getDocs(query(collection(as("parent"), "portfolioEntries"), where("studentId", "==", "stu-a"), where("visibility", "in", ["family", "showcaseCandidate", "publicShowcase"]))));
    await assertFails(getDoc(doc(as("parent"), "portfolioEntries/p-int")));
  });
  test("new entries default to internal or family; a teacher cannot publish publicly", async () => {
    await assertSucceeds(setDoc(doc(as("teacher"), "portfolioEntries/new"), { studentId: "stu-a", classId: "c4", visibility: "internal", createdBy: "teacher" }));
    await assertFails(setDoc(doc(as("teacher"), "portfolioEntries/new2"), { studentId: "stu-a", classId: "c4", visibility: "publicShowcase", createdBy: "teacher" }));
    await assertFails(updateDoc(doc(as("teacher"), "portfolioEntries/p-fam"), { visibility: "publicShowcase" }));
  });
  test("a moderator publishes only when public-showcase consent is granted", async () => {
    await seed("portfolioEntries/p-cand-a", { studentId: "stu-a", classId: "c4", visibility: "showcaseCandidate", createdBy: "teacher" });
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
  test("consent records are never overwritten", async () => {
    await assertFails(updateDoc(doc(as("parent"), "consentRecords/cr-1"), { response: "withdrawn" }));
    await assertFails(updateDoc(doc(as("admin"), "consentRecords/cr-1"), { response: "withdrawn" }));
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
    await assertFails(getDoc(doc(anon(), "contactMessages/m1")));
    await assertFails(getDoc(doc(as("teacher"), "contactMessages/m1")));
    await assertSucceeds(getDoc(doc(as("admin"), "contactMessages/m1")));
  });
  test("audit logs are never client-writable", async () => {
    await assertFails(setDoc(doc(as("principal"), "auditLogs/x"), { type: "forged" }));
  });
});

describe("PUB-002 / CON-002 website image library", () => {
  const image = { url: "https://example.test/a.webp", storagePath: "media/public/a.webp", alt: "Pupils planting the values garden", classification: "public", status: "approved", containsPupils: true, consentChecked: true, uploadedBy: "editor", createdAt: serverTimestamp() };
  test("editors register images with alt text and a consent check for pupil photos", async () => {
    await assertSucceeds(setDoc(doc(as("editor"), "mediaRegistry/m1"), image));
    await assertFails(setDoc(doc(as("editor"), "mediaRegistry/m2"), { ...image, alt: "" }));
    await assertFails(setDoc(doc(as("editor"), "mediaRegistry/m3"), { ...image, consentChecked: false }));
    await assertSucceeds(setDoc(doc(as("editor"), "mediaRegistry/m4"), { ...image, containsPupils: false, consentChecked: false }));
    await assertFails(setDoc(doc(as("teacher"), "mediaRegistry/m5"), { ...image, uploadedBy: "teacher" }));
    await assertFails(setDoc(doc(as("editor"), "mediaRegistry/m6"), { ...image, uploadedBy: "someone-else" }));
  });
  test("the file location cannot be rewritten; archived images leave the public listing", async () => {
    await seed("mediaRegistry/m1", { ...image, createdAt: new Date() });
    await assertFails(updateDoc(doc(as("editor"), "mediaRegistry/m1"), { storagePath: "media/public/other.webp" }));
    await assertSucceeds(updateDoc(doc(as("editor"), "mediaRegistry/m1"), { status: "archived" }));
    await assertFails(getDoc(doc(anon(), "mediaRegistry/m1")));
  });
});
