// End-to-end journey against the local emulators — real security rules, real Cloud Functions, real sign-in.
// Run with `npm run test:e2e` (starts Auth, Firestore and Functions emulators for a throwaway demo project).
//
// ADMIN creates a class, a teacher (account + assignment), a pupil (+ enrolment), a guardian (+ account + link).
// TEACHER signs in, sees the class, reads the roster, marks attendance, corrects it, adds a portfolio entry and
// posts a class notice. PARENT signs in, sees the child, attendance, the portfolio entry and the notice.
// ADMIN sees the dashboard figures. Then the denials: cross-family, cross-class, unauthorised role assignment,
// portfolio visibility, public-showcase consent, attendance correction rules and account deactivation.
//
// Accounts are created without passwords (people sign in with Google or an email link); the test gives each
// one an emulator-only password through the Admin SDK so it can sign in as them.
import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import { deleteApp, initializeApp as initClient } from "firebase/app";
import { connectAuthEmulator, getAuth as clientAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, connectFirestoreEmulator, doc, getDoc, getDocs, initializeFirestore, query, serverTimestamp, setDoc, updateDoc, where, writeBatch, terminate } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";
import { initializeApp as initAdmin } from "firebase-admin/app";
import { getAuth as adminAuth } from "firebase-admin/auth";
import { getFirestore as adminDb } from "firebase-admin/firestore";

const PROJECT = process.env.GCLOUD_PROJECT || "demo-srss-e2e";
const PASSWORD = "e2e-emulator-only";
const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const admin = initAdmin({ projectId: PROJECT }, "admin");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitFor(check, label, timeout = 20000) {
  const start = Date.now();
  for (;;) { const value = await check(); if (value) return value; if (Date.now() - start > timeout) throw new Error(`Timed out waiting for ${label}`); await sleep(400); }
}

// A signed-in client session as one person.
const sessions = [];
async function signIn(email) {
  const app = initClient({ projectId: PROJECT, apiKey: "demo-key", authDomain: `${PROJECT}.firebaseapp.com` }, `s${sessions.length}-${email}`);
  const auth = clientAuth(app); connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  const db = initializeFirestore(app, { experimentalForceLongPolling: true }); connectFirestoreEmulator(db, "127.0.0.1", 8080);
  const functions = getFunctions(app, "asia-southeast1"); connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  const credential = await signInWithEmailAndPassword(auth, email, PASSWORD);
  await credential.user.getIdToken(true);
  const session = { app, auth, db, uid: credential.user.uid, call: (name, data) => httpsCallable(functions, name)(data).then((result) => result.data) };
  sessions.push(session);
  return session;
}
const stamp = (session) => ({ createdAt: serverTimestamp(), createdBy: session.uid, updatedAt: serverTimestamp(), updatedBy: session.uid, status: "active" });
const edit = (session) => ({ updatedAt: serverTimestamp(), updatedBy: session.uid });
const denied = async (promise) => { await assert.rejects(promise, (error) => /permission|PERMISSION_DENIED|denied/i.test(`${error.code} ${error.message}`)); };
// Accounts created by provisionAccount have no password; set an emulator-only one so the test can sign in.
const allowSignIn = async (email) => adminAuth(admin).updateUser((await adminAuth(admin).getUserByEmail(email)).uid, { password: PASSWORD });
const scopeOf = (uid) => adminDb(admin).doc(`users/${uid}`).get().then((snap) => snap.data() || {});

const ids = {};
let office; let superadmin; let teacher; let parent;

before(async () => {
  // Bootstrap (what scripts/grant-access-admin.mjs does on the real project): one Super Administrator and the office.
  for (const [email, roles] of [["superadmin@e2e.test", ["superAdmin"]], ["office@e2e.test", ["schoolAdmin"]]]) {
    const user = await adminAuth(admin).createUser({ email, password: PASSWORD, displayName: email.split("@")[0] });
    await adminAuth(admin).setCustomUserClaims(user.uid, { roles, ...(roles.includes("superAdmin") ? { accessAdmin: true } : {}) });
    await adminDb(admin).doc(`users/${user.uid}`).set({ email, roles, status: "active" });
  }
  superadmin = await signIn("superadmin@e2e.test");
  office = await signIn("office@e2e.test");
});
after(async () => { for (const session of sessions) { await signOut(session.auth).catch(() => {}); await terminate(session.db).catch(() => {}); await deleteApp(session.app).catch(() => {}); } });

describe("Admin sets up the school", () => {
  test("creates the year, a subject, a class and makes the year current", async () => {
    await setDoc(doc(office.db, "academicYears/ay2027"), { name: "2027", startDate: "2027-01-11", endDate: "2027-11-26", ...stamp(office) });
    await setDoc(doc(office.db, "settings/school"), { name: "SRSS (e2e)", phone: "+60 3", currentAcademicYearId: "ay2027", ...edit(office) });
    await setDoc(doc(office.db, "subjects/math"), { name: "Mathematics", ...stamp(office) });
    await setDoc(doc(office.db, "subjects/bi"), { name: "English", ...stamp(office) });
    for (const [id, name, standard] of [["ay2027-4-amanah", "4 Amanah", 4], ["ay2027-5-bakti", "5 Bakti", 5]]) await setDoc(doc(office.db, `classes/${id}`), { name, standard, academicYearId: "ay2027", classTeacherUid: null, room: "A1", ...stamp(office) });
    ids.classId = "ay2027-4-amanah"; ids.otherClassId = "ay2027-5-bakti";
    assert.equal((await getDoc(doc(office.db, `classes/${ids.classId}`))).data().standard, 4);
  });

  test("creates a teacher, gives them an account, and assigns them", async () => {
    for (const [id, name, email] of [["staff-lim", "Cikgu Lim (e2e)", "lim@e2e.test"], ["staff-tan", "Mr Tan (e2e)", "tan@e2e.test"]]) {
      await setDoc(doc(office.db, `staff/${id}`), { name, position: "Teacher", email, uid: null, directoryVisible: true, ...stamp(office) });
      await office.call("provisionAccount", { email, roles: ["teacher"], personType: "staff", personId: id, reason: "New teacher" });
    }
    ids.teacherUid = (await adminAuth(admin).getUserByEmail("lim@e2e.test")).uid;
    ids.otherTeacherUid = (await adminAuth(admin).getUserByEmail("tan@e2e.test")).uid;
    await setDoc(doc(office.db, "teacherAssignments/ta-lim-math"), { teacherUid: ids.teacherUid, staffId: "staff-lim", classId: ids.classId, subjectId: "math", academicYearId: "ay2027", slots: [{ day: 1, time: "08:30" }], startDate: "2027-01-11", ...stamp(office) });
    await updateDoc(doc(office.db, `classes/${ids.classId}`), { classTeacherUid: ids.teacherUid, ...edit(office) });
    await setDoc(doc(office.db, "teacherAssignments/ta-tan-bi"), { teacherUid: ids.otherTeacherUid, staffId: "staff-tan", classId: ids.otherClassId, subjectId: "bi", academicYearId: "ay2027", slots: [], startDate: "2027-01-11", ...stamp(office) });
    await waitFor(async () => (await scopeOf(ids.teacherUid)).classIds?.includes(ids.classId), "the teacher's scope");
    assert.deepEqual((await scopeOf(ids.teacherUid)).assignmentKeys, [`${ids.classId}:math`]);
  });

  test("creates a pupil and enrols them; the current class follows the enrolment", async () => {
    const batch = writeBatch(office.db);
    batch.set(doc(office.db, "students/stu-e2e"), { name: "Aisha Rahman (e2e)", preferredName: "Aisha", studentNumber: "E2E-1", uid: null, currentClassId: null, currentStandard: null, ...stamp(office) });
    batch.set(doc(office.db, "enrollments/enr-e2e"), { studentId: "stu-e2e", classId: ids.classId, academicYearId: "ay2027", standard: 4, startDate: "2027-01-11", ...stamp(office) });
    await batch.commit();
    await setDoc(doc(office.db, "students/stu-other"), { name: "Ben Lee (e2e)", uid: null, currentClassId: null, ...stamp(office) });
    await setDoc(doc(office.db, "enrollments/enr-other"), { studentId: "stu-other", classId: ids.otherClassId, academicYearId: "ay2027", standard: 5, startDate: "2027-01-11", ...stamp(office) });
    await waitFor(async () => (await adminDb(admin).doc("students/stu-e2e").get()).data().currentClassId === ids.classId, "the pupil's current class");
  });

  test("creates a guardian, gives them an account and links them to the pupil", async () => {
    for (const [id, name] of [["g-e2e", "Farah Rahman (e2e)"], ["g-other", "Other Parent (e2e)"]]) await setDoc(doc(office.db, `guardians/${id}`), { name, email: `${id}@e2e.test`, uid: null, ...stamp(office) });
    await office.call("provisionAccount", { email: "g-e2e@e2e.test", roles: ["parent"], personType: "guardian", personId: "g-e2e", reason: "New family" });
    await office.call("provisionAccount", { email: "g-other@e2e.test", roles: ["parent"], personType: "guardian", personId: "g-other", reason: "New family" });
    ids.parentUid = (await adminAuth(admin).getUserByEmail("g-e2e@e2e.test")).uid;
    const guardianUid = (await getDoc(doc(office.db, "guardians/g-e2e"))).data().uid;
    assert.equal(guardianUid, ids.parentUid);
    await setDoc(doc(office.db, "studentGuardianLinks/lnk-e2e"), { studentId: "stu-e2e", guardianId: "g-e2e", guardianUid, classId: ids.classId, relationship: "mother", hasPortalAccess: true, isEmergencyContact: true, canCollect: true, ...stamp(office) });
    await waitFor(async () => (await scopeOf(ids.parentUid)).childIds?.includes("stu-e2e"), "the parent's scope");
  });
});

describe("Teacher manages the class", () => {
  test("signs in and sees the assigned class and its roster", async () => {
    await allowSignIn("lim@e2e.test");
    teacher = await signIn("lim@e2e.test");
    const scope = (await getDoc(doc(teacher.db, `users/${teacher.uid}`))).data();
    assert.deepEqual(scope.classIds, [ids.classId]);
    const roster = await getDocs(query(collection(teacher.db, "students"), where("currentClassId", "==", ids.classId)));
    assert.deepEqual(roster.docs.map((item) => item.id), ["stu-e2e"]);
  });

  test("marks attendance, submits, and corrects it with a reason", async () => {
    const sessionId = `${ids.classId}_${today}_am`;
    const batch = writeBatch(teacher.db);
    batch.set(doc(teacher.db, `attendanceSessions/${sessionId}`), { ...stamp(teacher), classId: ids.classId, date: today, sessionType: "am", status: "submitted", openedBy: teacher.uid, submittedBy: teacher.uid, submittedAt: serverTimestamp(), studentCount: 1, academicYearId: "ay2027" });
    batch.set(doc(teacher.db, `attendanceRecords/${sessionId}_stu-e2e`), { sessionId, classId: ids.classId, date: today, studentId: "stu-e2e", status: "absent", reason: "Unwell", markedBy: teacher.uid, markedAt: serverTimestamp(), ...edit(teacher) });
    await batch.commit();
    const record = doc(teacher.db, `attendanceRecords/${sessionId}_stu-e2e`);
    await denied(updateDoc(record, { status: "late", markedBy: teacher.uid, ...edit(teacher) }));
    await updateDoc(record, { status: "late", previousStatus: "absent", correctionReason: "Arrived after the register", correctedBy: teacher.uid, correctedAt: serverTimestamp(), markedBy: teacher.uid, ...edit(teacher) });
    assert.equal((await getDoc(record)).data().status, "late");
    // The correction is in the server-written audit trail.
    await waitFor(async () => (await adminDb(admin).collection("auditLogs").where("path", "==", `attendanceRecords/${sessionId}_stu-e2e`).get()).docs.some((log) => (log.data().fields || []).includes("correctionReason")), "the correction audit entry");
  });

  test("creates a parent-visible portfolio entry and an internal note", async () => {
    await setDoc(doc(teacher.db, "portfolioEntries/pe-e2e"), { studentId: "stu-e2e", classId: ids.classId, academicYearId: "ay2027", subjectId: "math", category: "academic", title: "Fractions with paper folding", date: today, description: "Folded strips into equal parts.", humanValues: ["truth"], achievementTags: [], mediaReferences: [{ label: "Photo", url: "https://drive.google.com/e2e" }], visibility: "family", consentStatus: "missing", moderationStatus: null, ...stamp(teacher) });
    await setDoc(doc(teacher.db, "portfolioEntries/pe-internal"), { studentId: "stu-e2e", classId: ids.classId, title: "Private planning note", visibility: "internal", moderationStatus: null, ...stamp(teacher) });
  });

  test("publishes a class notice", async () => {
    await setDoc(doc(teacher.db, "announcements/an-e2e"), { title: "Bring a recycled item on Friday", body: "For our values project.", audienceKeys: [`class:${ids.classId}`], category: "class", pinned: false, attachments: [], publishedAt: serverTimestamp(), ...stamp(teacher), status: "published" });
  });
});

describe("Parent follows their child", () => {
  test("signs in and sees the linked child, attendance, portfolio and the class notice", async () => {
    await allowSignIn("g-e2e@e2e.test");
    parent = await signIn("g-e2e@e2e.test");
    const scope = (await getDoc(doc(parent.db, `users/${parent.uid}`))).data();
    assert.deepEqual(scope.childIds, ["stu-e2e"]);
    assert.equal((await getDoc(doc(parent.db, "students/stu-e2e"))).data().name, "Aisha Rahman (e2e)");
    const attendance = await getDocs(query(collection(parent.db, "attendanceRecords"), where("studentId", "==", "stu-e2e")));
    assert.equal(attendance.docs[0].data().status, "late");
    const entries = await getDocs(query(collection(parent.db, "portfolioEntries"), where("studentId", "==", "stu-e2e"), where("visibility", "in", ["family", "showcaseCandidate", "publicShowcase"])));
    assert.deepEqual(entries.docs.map((item) => item.id), ["pe-e2e"]);
    const notices = await getDocs(query(collection(parent.db, "announcements"), where("status", "==", "published"), where("audienceKeys", "array-contains-any", scope.audienceKeys)));
    assert.ok(notices.docs.some((item) => item.id === "an-e2e"));
  });
});

describe("Admin sees the result", () => {
  test("dashboard figures reflect the day's work", async () => {
    const sessionsToday = await getDocs(query(collection(office.db, "attendanceSessions"), where("date", "==", today)));
    assert.equal(sessionsToday.docs.filter((item) => item.data().status === "submitted").length, 1);
    const classes = await getDocs(query(collection(office.db, "classes"), where("academicYearId", "==", "ay2027")));
    assert.equal(classes.size, 2);
    const portfolio = await getDocs(query(collection(office.db, "portfolioEntries"), where("date", ">=", today)));
    assert.ok(portfolio.docs.some((item) => item.id === "pe-e2e"));
    const enrolled = await getDocs(query(collection(office.db, "enrollments"), where("academicYearId", "==", "ay2027"), where("status", "==", "active")));
    assert.equal(enrolled.size, 2);
  });
});

describe("Access is enforced by the data layer", () => {
  test("cross-family access is denied", async () => {
    await allowSignIn("g-other@e2e.test");
    const other = await signIn("g-other@e2e.test");
    await denied(getDoc(doc(other.db, "students/stu-e2e")));
    await denied(getDocs(query(collection(other.db, "attendanceRecords"), where("studentId", "==", "stu-e2e"))));
    await denied(getDocs(query(collection(other.db, "portfolioEntries"), where("studentId", "==", "stu-e2e"), where("visibility", "in", ["family"]))));
    await denied(setDoc(doc(other.db, "studentGuardianLinks/self-link"), { studentId: "stu-e2e", guardianId: "g-other", guardianUid: other.uid, classId: ids.classId, relationship: "mother", hasPortalAccess: true, ...stamp(other) }));
  });

  test("cross-class teacher access is denied", async () => {
    await allowSignIn("tan@e2e.test");
    const tan = await signIn("tan@e2e.test");
    await denied(getDoc(doc(tan.db, "students/stu-e2e")));
    await denied(getDocs(query(collection(tan.db, "students"), where("currentClassId", "==", ids.classId))));
    await denied(setDoc(doc(tan.db, "teacherAssignments/self"), { teacherUid: tan.uid, classId: ids.classId, subjectId: "math", academicYearId: "ay2027", ...stamp(tan) }));
    assert.equal((await getDoc(doc(tan.db, "students/stu-other"))).data().name, "Ben Lee (e2e)");
  });

  test("unauthorised role assignment is denied", async () => {
    await assert.rejects(office.call("setUserRoles", { uid: ids.teacherUid, roles: ["teacher", "schoolAdmin"], reason: "test" }), /Super Administrator/);
    await assert.rejects(office.call("setUserRoles", { uid: office.uid, roles: ["schoolAdmin", "superAdmin"], reason: "test" }), /own roles/);
    await assert.rejects(teacher.call("setUserRoles", { uid: teacher.uid, roles: ["teacher", "classTeacher"], reason: "test" }), /own roles|permission/i);
    await assert.rejects(teacher.call("provisionAccount", { email: "x@e2e.test", roles: ["parent"], reason: "test" }), /school office|permission|Super/i);
    // The office may add family and teacher roles; a Super Administrator may grant any role.
    await office.call("setUserRoles", { uid: ids.teacherUid, roles: ["teacher", "classTeacher"], reason: "Class teacher of 4 Amanah" });
    await superadmin.call("setUserRoles", { uid: ids.otherTeacherUid, roles: ["teacher", "portfolioModerator"], reason: "Portfolio lead" });
    assert.deepEqual((await adminAuth(admin).getUser(ids.otherTeacherUid)).customClaims.roles, ["teacher", "portfolioModerator"]);
  });

  test("portfolio visibility: internal entries are hidden from families; entries are never public", async () => {
    await denied(getDoc(doc(parent.db, "portfolioEntries/pe-internal")));
    const anon = initClient({ projectId: PROJECT, apiKey: "demo-key" }, "anon");
    const anonDb = initializeFirestore(anon, { experimentalForceLongPolling: true }); connectFirestoreEmulator(anonDb, "127.0.0.1", 8080);
    sessions.push({ app: anon, auth: clientAuth(anon), db: anonDb });
    await denied(getDoc(doc(anonDb, "portfolioEntries/pe-e2e")));
    ids.anonDb = anonDb;
  });

  test("public showcase needs consent and a moderator; the public sees only a copy without media", async () => {
    await updateDoc(doc(teacher.db, "portfolioEntries/pe-e2e"), { visibility: "showcaseCandidate", moderationStatus: "pending", ...edit(teacher) });
    await denied(updateDoc(doc(teacher.db, "portfolioEntries/pe-e2e"), { visibility: "publicShowcase", moderationStatus: "approved", ...edit(teacher) }));
    const moderator = await signIn("tan@e2e.test"); // now a portfolio moderator
    await denied(updateDoc(doc(moderator.db, "portfolioEntries/pe-e2e"), { visibility: "publicShowcase", moderationStatus: "approved", ...edit(moderator) }));
    await setDoc(doc(parent.db, "consentRecords/cr-e2e"), { studentId: "stu-e2e", classId: ids.classId, guardianUid: parent.uid, consentType: "publicShowcase", definitionId: "publicShowcase", definitionVersion: 1, response: "granted", source: "parentPortal", createdAt: serverTimestamp(), createdBy: parent.uid });
    await waitFor(async () => (await adminDb(admin).doc("studentConsentStatus/stu-e2e").get()).data()?.types?.publicShowcase?.response === "granted", "the consent status");
    await updateDoc(doc(moderator.db, "portfolioEntries/pe-e2e"), { visibility: "publicShowcase", moderationStatus: "approved", ...edit(moderator) });
    const copy = await waitFor(async () => (await getDoc(doc(ids.anonDb, "showcaseItems/pe-e2e")).catch(() => null))?.data(), "the public showcase copy");
    assert.equal(copy.firstName, "Aisha");
    assert.equal(copy.mediaReferences, undefined);
    assert.equal(JSON.stringify(copy).includes("Rahman"), false);
  });

  test("account deactivation signs the person out and blocks sign-in; staff accounts need a Super Administrator", async () => {
    await assert.rejects(office.call("setAccountStatus", { uid: ids.otherTeacherUid, disabled: true, reason: "test" }), /Super Administrator/);
    const other = (await adminAuth(admin).getUserByEmail("g-other@e2e.test")).uid;
    await office.call("setAccountStatus", { uid: other, disabled: true, reason: "Left the school" });
    await assert.rejects(signIn("g-other@e2e.test"), /user-disabled/);
    assert.equal((await adminDb(admin).doc(`users/${other}`).get()).data().status, "disabled");
    await office.call("setAccountStatus", { uid: other, disabled: false, reason: "Returned" });
    await signIn("g-other@e2e.test");
  });
});
