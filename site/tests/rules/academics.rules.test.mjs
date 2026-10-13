// Stage 1 academic operations — security rules tests (ACAD-001 … ACAD-003, ASMT-001 … ASMT-003).
// Run with `npm run test:rules`. Scope documents mirror what functions/scope.js derives, including teachingKeys.
import { readFile } from "node:fs/promises";
import { after, before, beforeEach, describe, test } from "node:test";
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";

let env;
const [firestoreHost, firestorePort = "8080"] = (process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080").split(":");
const people = {
  // Teaches Maths in 4 (c4) and is its class teacher; does not teach Bahasa Melayu there.
  teacher: { roles: ["teacher", "classTeacher"], classIds: ["c4"], homeroomClassIds: ["c4"], teachingKeys: ["c4|math"] },
  bmTeacher: { roles: ["teacher"], classIds: ["c4", "c5"], teachingKeys: ["c4|bm", "c5|bm"] },
  otherTeacher: { roles: ["teacher"], classIds: ["c5"], teachingKeys: ["c5|math"] },
  coordinator: { roles: ["academicCoordinator", "teacher"], classIds: ["c6"], teachingKeys: ["c6|sci"] },
  principal: { roles: ["leadership"] },
  admin: { roles: ["schoolAdmin"] },
  parent: { roles: ["parent"], childIds: ["stu-a"], familyClassIds: ["c4"] },
  otherParent: { roles: ["parent"], childIds: ["stu-b"], familyClassIds: ["c5"] },
  student: { roles: ["student"], studentId: "stu-a", familyClassIds: ["c4"] },
  editor: { roles: ["contentEditor"] },
};
const as = (name) => env.authenticatedContext(name, { roles: people[name].roles }).firestore();
const seed = (path, data) => env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), path), data));
const now = () => ({ updatedAt: serverTimestamp() });
const by = (name) => ({ updatedBy: name, updatedAt: serverTimestamp() });

const SHEET = "p1_as-math4_c4";
const sheet = (changes = {}) => ({ periodId: "p1", assessmentId: "as-math4", classId: "c4", subjectId: "math", standard: 4, academicYearId: "ay", status: "draft", createdBy: "teacher", createdAt: new Date(), updatedBy: "teacher", updatedAt: new Date(), ...changes });
const result = (studentId, changes = {}) => ({ periodId: "p1", assessmentId: "as-math4", classId: "c4", subjectId: "math", standard: 4, academicYearId: "ay", studentId, sheetId: SHEET, marks: { w: 40 }, flags: {}, percent: 80, grade: "A", comment: "", status: "draft", studentVisible: false, createdBy: "teacher", createdAt: new Date(), updatedBy: "teacher", updatedAt: new Date(), ...changes });

before(async () => {
  env = await initializeTestEnvironment({ projectId: "demo-srss-tests", firestore: { rules: await readFile(new URL("../../firestore.rules", import.meta.url), "utf8"), host: firestoreHost, port: Number(firestorePort) } });
});
after(() => env?.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  for (const [uid, scope] of Object.entries(people)) await seed(`users/${uid}`, scope);
  await seed("students/stu-a", { name: "A", currentClassId: "c4", status: "active" });
  await seed("students/stu-a2", { name: "A2", currentClassId: "c4", status: "active" });
  await seed("students/stu-b", { name: "B", currentClassId: "c5", status: "active" });
});

describe("ASMT-001 assessment configuration", () => {
  const structure = { periodId: "p1", standard: 4, subjectId: "math", name: "Mathematics", weighting: "weighted", absentPolicy: "exclude", components: [{ id: "w", name: "Written", maxMarks: 50, weight: 100 }], grading: { bands: [] } };
  test("the coordinator and school admin configure; teachers and families cannot", async () => {
    await assertSucceeds(setDoc(doc(as("coordinator"), "assessments/a1"), { ...structure, ...by("coordinator") }));
    await assertSucceeds(setDoc(doc(as("admin"), "assessmentPeriods/p1"), { name: "Term 3", status: "open", resultsVisibleToStudents: false, ...by("admin") }));
    await assertFails(setDoc(doc(as("teacher"), "assessments/a2"), { ...structure, ...by("teacher") }));
    await assertFails(setDoc(doc(as("parent"), "assessmentPeriods/p2"), { name: "x", status: "open", ...by("parent") }));
  });
  test("a structure needs components and a known weighting", async () => {
    await assertFails(setDoc(doc(as("coordinator"), "assessments/a3"), { ...structure, components: [], ...by("coordinator") }));
    await assertFails(setDoc(doc(as("coordinator"), "assessments/a4"), { ...structure, weighting: "vibes", ...by("coordinator") }));
  });
});

describe("ASMT-002 teacher mark entry", () => {
  test("a teacher enters marks for a subject they teach, never for another subject in the same class", async () => {
    await assertSucceeds(setDoc(doc(as("teacher"), `markSheets/${SHEET}`), { ...sheet(), createdAt: serverTimestamp(), ...now() }));
    await assertSucceeds(setDoc(doc(as("teacher"), `studentResults/${SHEET}_stu-a`), { ...result("stu-a"), createdAt: serverTimestamp(), ...now() }));
    // Class teacher of 4 but not its BM teacher.
    await assertFails(setDoc(doc(as("teacher"), "markSheets/p1_as-bm4_c4"), { ...sheet({ assessmentId: "as-bm4", subjectId: "bm" }), createdAt: serverTimestamp(), ...now() }));
    await assertFails(setDoc(doc(as("teacher"), `studentResults/p1_as-bm4_c4_stu-a`), { ...result("stu-a", { assessmentId: "as-bm4", subjectId: "bm", sheetId: "p1_as-bm4_c4" }), createdAt: serverTimestamp(), ...now() }));
    // Another class's teacher.
    await assertFails(setDoc(doc(as("otherTeacher"), `studentResults/${SHEET}_stu-a`), { ...result("stu-a", { createdBy: "otherTeacher", updatedBy: "otherTeacher" }), createdAt: serverTimestamp(), ...now() }));
  });
  test("results must belong to a pupil in that class and start as draft", async () => {
    await assertFails(setDoc(doc(as("teacher"), `studentResults/${SHEET}_stu-b`), { ...result("stu-b"), createdAt: serverTimestamp(), ...now() }));
    await assertFails(setDoc(doc(as("teacher"), `studentResults/${SHEET}_stu-a2`), { ...result("stu-a2", { status: "published" }), createdAt: serverTimestamp(), ...now() }));
    await assertFails(setDoc(doc(as("teacher"), `studentResults/${SHEET}_stu-a2`), { ...result("stu-a2", { score: 9 }), createdAt: serverTimestamp(), ...now() }));
  });
  test("a teacher's batch of result writes for a full class stays within rule limits when chunked", async () => {
    for (let i = 0; i < 8; i++) await seed(`students/stu-c${i}`, { name: `C${i}`, currentClassId: "c4", status: "active" });
    const db = as("teacher");
    const batch = writeBatch(db);
    for (let i = 0; i < 8; i++) batch.set(doc(db, `studentResults/${SHEET}_stu-c${i}`), { ...result(`stu-c${i}`), createdAt: serverTimestamp(), ...now() });
    await assertSucceeds(batch.commit());
  });
  test("a teacher can open a sheet nobody has started; families cannot probe sheets", async () => {
    await assertSucceeds(getDoc(doc(as("teacher"), `markSheets/${SHEET}`)));
    await assertFails(getDoc(doc(as("parent"), `markSheets/${SHEET}`)));
    await seed(`markSheets/${SHEET}`, sheet());
    await assertFails(getDoc(doc(as("otherTeacher"), `markSheets/${SHEET}`)));
  });
  test("submitted marks are closed to the teacher", async () => {
    await seed(`studentResults/${SHEET}_stu-a`, result("stu-a", { status: "submitted" }));
    await assertFails(updateDoc(doc(as("teacher"), `studentResults/${SHEET}_stu-a`), { marks: { w: 50 }, ...by("teacher") }));
  });
});

describe("ASMT-003 approval workflow", () => {
  test("teacher submits; coordinator reviews but cannot change marks or publish", async () => {
    await seed(`markSheets/${SHEET}`, sheet());
    await seed(`studentResults/${SHEET}_stu-a`, result("stu-a"));
    await assertSucceeds(updateDoc(doc(as("teacher"), `markSheets/${SHEET}`), { status: "submitted", submittedBy: "teacher", submittedAt: serverTimestamp(), ...by("teacher") }));
    await assertSucceeds(updateDoc(doc(as("teacher"), `studentResults/${SHEET}_stu-a`), { status: "submitted", ...by("teacher") }));
    await assertFails(updateDoc(doc(as("coordinator"), `studentResults/${SHEET}_stu-a`), { marks: { w: 10 }, ...by("coordinator") }));
    await assertFails(updateDoc(doc(as("coordinator"), `studentResults/${SHEET}_stu-a`), { status: "published", ...by("coordinator") }));
    await assertFails(updateDoc(doc(as("coordinator"), `markSheets/${SHEET}`), { status: "published", publishedBy: "coordinator", publishedAt: serverTimestamp(), ...by("coordinator") }));
    await assertSucceeds(updateDoc(doc(as("coordinator"), `markSheets/${SHEET}`), { status: "reviewed", reviewedBy: "coordinator", reviewedAt: serverTimestamp(), ...by("coordinator") }));
    await assertSucceeds(updateDoc(doc(as("coordinator"), `studentResults/${SHEET}_stu-a`), { status: "reviewed", ...by("coordinator") }));
  });
  test("returning for correction needs a note", async () => {
    await seed(`markSheets/${SHEET}`, sheet({ status: "submitted" }));
    await assertFails(updateDoc(doc(as("coordinator"), `markSheets/${SHEET}`), { status: "draft", returnedBy: "coordinator", returnedAt: serverTimestamp(), ...by("coordinator") }));
    await assertSucceeds(updateDoc(doc(as("coordinator"), `markSheets/${SHEET}`), { status: "draft", returnNote: "Check Ishaan's oral mark.", returnedBy: "coordinator", returnedAt: serverTimestamp(), ...by("coordinator") }));
  });
  test("only leadership approves and publishes; the teacher and school admin cannot", async () => {
    await seed(`markSheets/${SHEET}`, sheet({ status: "reviewed" }));
    await seed(`studentResults/${SHEET}_stu-a`, result("stu-a", { status: "reviewed" }));
    await assertFails(updateDoc(doc(as("teacher"), `studentResults/${SHEET}_stu-a`), { status: "approved", ...by("teacher") }));
    await assertFails(updateDoc(doc(as("admin"), `markSheets/${SHEET}`), { status: "approved", approvedBy: "admin", approvedAt: serverTimestamp(), ...by("admin") }));
    await assertFails(updateDoc(doc(as("principal"), `markSheets/${SHEET}`), { status: "published", publishedBy: "principal", publishedAt: serverTimestamp(), ...by("principal") }));
    await assertSucceeds(updateDoc(doc(as("principal"), `markSheets/${SHEET}`), { status: "approved", approvedBy: "principal", approvedAt: serverTimestamp(), ...by("principal") }));
    await assertSucceeds(updateDoc(doc(as("principal"), `studentResults/${SHEET}_stu-a`), { status: "approved", ...by("principal") }));
    await assertSucceeds(updateDoc(doc(as("principal"), `markSheets/${SHEET}`), { status: "published", publishedBy: "principal", publishedAt: serverTimestamp(), ...by("principal") }));
    await assertSucceeds(updateDoc(doc(as("principal"), `studentResults/${SHEET}_stu-a`), { status: "published", studentVisible: true, ...by("principal") }));
  });
  test("published results change only through an amendment with a reason", async () => {
    await seed(`studentResults/${SHEET}_stu-a`, result("stu-a", { status: "published" }));
    await assertFails(updateDoc(doc(as("principal"), `studentResults/${SHEET}_stu-a`), { marks: { w: 45 }, percent: 90, ...by("principal") }));
    await assertFails(updateDoc(doc(as("teacher"), `studentResults/${SHEET}_stu-a`), { marks: { w: 45 }, amendmentReason: "Marking error", amendedBy: "teacher", amendedAt: serverTimestamp(), ...by("teacher") }));
    await assertSucceeds(updateDoc(doc(as("principal"), `studentResults/${SHEET}_stu-a`), { marks: { w: 45 }, percent: 90, amendmentReason: "Marking error corrected", amendedBy: "principal", amendedAt: serverTimestamp(), ...by("principal") }));
  });
  test("families see published results only; pupils only when the period allows it", async () => {
    await seed(`studentResults/${SHEET}_stu-a`, result("stu-a", { status: "published", studentVisible: false }));
    await seed(`studentResults/p1_as-bm4_c4_stu-a`, result("stu-a", { subjectId: "bm", status: "approved" }));
    await assertSucceeds(getDocs(query(collection(as("parent"), "studentResults"), where("studentId", "==", "stu-a"), where("status", "in", ["published", "locked"]))));
    await assertFails(getDoc(doc(as("parent"), "studentResults/p1_as-bm4_c4_stu-a")));
    await assertFails(getDocs(query(collection(as("otherParent"), "studentResults"), where("studentId", "==", "stu-a"), where("status", "in", ["published", "locked"]))));
    await assertFails(getDoc(doc(as("student"), `studentResults/${SHEET}_stu-a`)));
    await seed(`studentResults/${SHEET}_stu-a`, result("stu-a", { status: "published", studentVisible: true }));
    await assertSucceeds(getDocs(query(collection(as("student"), "studentResults"), where("studentId", "==", "stu-a"), where("status", "in", ["published", "locked"]), where("studentVisible", "==", true))));
    await assertFails(getDoc(doc(as("editor"), `studentResults/${SHEET}_stu-a`)));
  });
});

describe("ACAD-002 lesson planning", () => {
  const plan = (changes = {}) => ({ ownerUid: "teacher", classId: "c4", subjectId: "math", topic: "Fractions", status: "draft", contentSource: "hub", humanValues: ["love"], attachments: [], createdBy: "teacher", createdAt: serverTimestamp(), ...by("teacher"), ...changes });
  test("teachers plan only their own class and subject; Human Values come from the five", async () => {
    await assertSucceeds(setDoc(doc(as("teacher"), "lessonPlans/l1"), plan()));
    await assertFails(setDoc(doc(as("teacher"), "lessonPlans/l2"), plan({ subjectId: "bm" })));
    await assertFails(setDoc(doc(as("teacher"), "lessonPlans/l3"), plan({ ownerUid: "bmTeacher" })));
    await assertFails(setDoc(doc(as("teacher"), "lessonPlans/l4"), plan({ humanValues: ["courage"] })));
    await assertFails(setDoc(doc(as("teacher"), "lessonPlans/l5"), plan({ status: "reviewed" })));
  });
  test("the coordinator reviews completed plans but cannot edit their content or review their own", async () => {
    await seed("lessonPlans/l1", { ...plan({ status: "completed" }), createdAt: new Date(), updatedAt: new Date() });
    await assertFails(updateDoc(doc(as("coordinator"), "lessonPlans/l1"), { topic: "Changed", ...by("coordinator") }));
    await assertSucceeds(updateDoc(doc(as("coordinator"), "lessonPlans/l1"), { status: "reviewed", reviewedBy: "coordinator", reviewedAt: serverTimestamp(), reviewNote: "Clear objectives.", ...by("coordinator") }));
    await assertFails(updateDoc(doc(as("teacher"), "lessonPlans/l1"), { topic: "Edited after review", ...by("teacher") }));
    await seed("lessonPlans/own", { ...plan({ ownerUid: "coordinator", classId: "c6", subjectId: "sci", status: "completed", createdBy: "coordinator" }), createdAt: new Date(), updatedAt: new Date() });
    await assertFails(updateDoc(doc(as("coordinator"), "lessonPlans/own"), { status: "reviewed", reviewedBy: "coordinator", reviewedAt: serverTimestamp(), ...by("coordinator") }));
  });
  test("lesson plans are staff-only", async () => {
    await seed("lessonPlans/l1", { ...plan(), createdAt: new Date(), updatedAt: new Date() });
    await assertSucceeds(getDoc(doc(as("bmTeacher"), "lessonPlans/l1")));
    await assertFails(getDoc(doc(as("parent"), "lessonPlans/l1")));
    await assertFails(getDoc(doc(as("otherTeacher"), "lessonPlans/l1")));
  });
  test("only the coordinator configures curriculum plans", async () => {
    const curriculum = { standard: 4, subjectId: "math", title: "Mathematics Std 4", status: "active", topics: [], sourceRefs: [] };
    await assertSucceeds(setDoc(doc(as("coordinator"), "curriculumPlans/cp1"), { ...curriculum, ...by("coordinator") }));
    await assertFails(setDoc(doc(as("teacher"), "curriculumPlans/cp2"), { ...curriculum, ...by("teacher") }));
  });
});

describe("ACAD-003 learning tasks", () => {
  const task = (changes = {}) => ({ classId: "c4", subjectId: "math", title: "Fractions worksheet", instructions: "", status: "published", submissionMode: "hub", dueDate: "2026-10-20", attachments: [], createdBy: "teacher", createdAt: serverTimestamp(), ...by("teacher"), ...changes });
  test("families see published tasks for their own class only", async () => {
    await seed("learningTasks/t1", { ...task(), createdAt: new Date(), updatedAt: new Date() });
    await seed("learningTasks/t-draft", { ...task({ status: "draft" }), createdAt: new Date(), updatedAt: new Date() });
    await assertSucceeds(getDocs(query(collection(as("parent"), "learningTasks"), where("classId", "in", ["c4"]), where("status", "in", ["published", "closed"]))));
    await assertFails(getDoc(doc(as("parent"), "learningTasks/t-draft")));
    await assertFails(getDoc(doc(as("otherParent"), "learningTasks/t1")));
    await assertFails(setDoc(doc(as("teacher"), "learningTasks/t2"), task({ subjectId: "bm" })));
    await assertSucceeds(setDoc(doc(as("teacher"), "learningTasks/t3"), task()));
  });
  test("a pupil hands in their own work; the teacher gives feedback without rewriting it", async () => {
    await seed("learningTasks/t1", { ...task(), createdAt: new Date(), updatedAt: new Date() });
    const handIn = { taskId: "t1", studentId: "stu-a", classId: "c4", subjectId: "math", status: "submitted", submissionText: "My answers", submissionUrl: "", submittedAt: serverTimestamp(), createdBy: "student", createdAt: serverTimestamp(), ...by("student") };
    await assertFails(setDoc(doc(as("student"), "learningTaskProgress/t1_stu-a2"), { ...handIn, studentId: "stu-a2" }));
    await assertSucceeds(setDoc(doc(as("student"), "learningTaskProgress/t1_stu-a"), handIn));
    await assertFails(updateDoc(doc(as("teacher"), "learningTaskProgress/t1_stu-a"), { submissionText: "Changed", ...by("teacher") }));
    await assertSucceeds(updateDoc(doc(as("teacher"), "learningTaskProgress/t1_stu-a"), { status: "completed", feedback: "Well explained.", feedbackBy: "teacher", feedbackAt: serverTimestamp(), ...by("teacher") }));
    await assertFails(updateDoc(doc(as("student"), "learningTaskProgress/t1_stu-a"), { status: "submitted", submissionText: "Again", ...by("student") }));
    await assertSucceeds(getDoc(doc(as("parent"), "learningTaskProgress/t1_stu-a")));
    await assertFails(getDoc(doc(as("otherParent"), "learningTaskProgress/t1_stu-a")));
  });
  test("pupils cannot hand in when the task does not accept hub submissions", async () => {
    await seed("learningTasks/t-classroom", { ...task({ submissionMode: "classroom" }), createdAt: new Date(), updatedAt: new Date() });
    await assertFails(setDoc(doc(as("student"), "learningTaskProgress/t-classroom_stu-a"), { taskId: "t-classroom", studentId: "stu-a", classId: "c4", subjectId: "math", status: "submitted", submissionText: "x", createdBy: "student", createdAt: serverTimestamp(), ...by("student") }));
  });
});
