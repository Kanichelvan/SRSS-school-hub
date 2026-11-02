// Forms & Response Centre end to end, against the emulators with the real Cloud Functions and rules.
// PUBLIC sends a visit request and a website message → both get a reference, a case and an acknowledgement.
// PARENT updates their phone number → the office approves → the guardian record changes. PARENT complains
// about the Headmistress → the case is restricted and routed past the Headmistress and the office.
// TEACHER asks for IT help → the PIC asks for more information → the teacher replies → completed, with
// internal notes kept from the teacher. The daily run sends overdue reminders.
import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import { deleteApp, initializeApp as initClient } from "firebase/app";
import { connectAuthEmulator, getAuth as clientAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, connectFirestoreEmulator, doc, getDoc, getDocs, initializeFirestore, query, setDoc, serverTimestamp, terminate, where } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";
import { initializeApp as initAdmin } from "firebase-admin/app";
import { getAuth as adminAuth } from "firebase-admin/auth";
import { getFirestore as adminDb } from "firebase-admin/firestore";

const PROJECT = process.env.GCLOUD_PROJECT || "demo-srss-e2e";
const PASSWORD = "e2e-emulator-only";
const address = (value, port) => { const [host, configured = port] = (value || `127.0.0.1:${port}`).split(":"); return [host, Number(configured)]; };
const admin = initAdmin({ projectId: PROJECT }, "forms-admin");
const store = () => adminDb(admin);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitFor(check, label, timeout = 20000) {
  const start = Date.now();
  for (;;) { const value = await check(); if (value) return value; if (Date.now() - start > timeout) throw new Error(`Timed out waiting for ${label}`); await sleep(400); }
}
const apps = [];
function client(name) {
  const app = initClient({ projectId: PROJECT, apiKey: "demo-key", authDomain: `${PROJECT}.firebaseapp.com` }, `forms-${name}-${apps.length}`);
  const db = initializeFirestore(app, { experimentalForceLongPolling: true }); connectFirestoreEmulator(db, ...address(process.env.FIRESTORE_EMULATOR_HOST, 8080));
  const functions = getFunctions(app, "asia-southeast1"); connectFunctionsEmulator(functions, ...address(process.env.QUEST_FUNCTIONS_EMULATOR_HOST, 5001));
  apps.push({ app, db });
  return { app, db, call: (fn, data) => httpsCallable(functions, fn)(data).then((result) => result.data) };
}
async function signIn(email) {
  const session = client(email);
  const auth = clientAuth(session.app); connectAuthEmulator(auth, `http://${address(process.env.FIREBASE_AUTH_EMULATOR_HOST, 9099).join(":")}`, { disableWarnings: true });
  const credential = await signInWithEmailAndPassword(auth, email, PASSWORD);
  await credential.user.getIdToken(true);
  return { ...session, uid: credential.user.uid };
}
const denied = async (promise) => { await assert.rejects(promise, (error) => /permission|PERMISSION_DENIED|denied/i.test(`${error.code} ${error.message}`)); };
const people = {};
let office; let tech; let principal; let superadmin; let parent; let teacher;

before(async () => {
  const accounts = [["office", ["schoolAdmin"]], ["tech", ["technicalAdmin"]], ["principal", ["leadership"]], ["superadmin", ["superAdmin"]], ["parent", ["parent"]], ["teacher", ["teacher"]]];
  for (const [key, roles] of accounts) {
    const email = `forms-${key}@e2e.test`;
    const user = await adminAuth(admin).createUser({ email, password: PASSWORD, displayName: `Forms ${key}` }).catch(() => adminAuth(admin).getUserByEmail(email));
    await adminAuth(admin).setCustomUserClaims(user.uid, { roles, ...(roles.includes("superAdmin") ? { accessAdmin: true } : {}) });
    people[key] = { uid: user.uid, email };
    await store().doc(`users/${user.uid}`).set({ email, displayName: `Forms ${key}`, roles, status: "active" });
  }
  // A linked family: what functions/scope.js derives from the guardian link.
  await store().doc("students/forms-child").set({ name: "Forms Child", currentClassId: "forms-class", status: "active" });
  await store().doc("students/forms-other").set({ name: "Someone Else", currentClassId: "forms-class", status: "active" });
  await store().doc("guardians/forms-guardian").set({ name: "Forms Parent", phone: "012-000 0000", address: "Old address", uid: people.parent.uid, status: "active" });
  await store().doc(`users/${people.parent.uid}`).set({ guardianId: "forms-guardian", childIds: ["forms-child"] }, { merge: true });
  [office, tech, principal, superadmin, parent, teacher] = await Promise.all(["office", "tech", "principal", "superadmin", "parent", "teacher"].map((key) => signIn(people[key].email)));
});
after(async () => { for (const { app, db } of apps) { await terminate(db).catch(() => {}); await deleteApp(app).catch(() => {}); } });

describe("public forms", () => {
  test("a visit request gets a reference, one case, an admissions record and an acknowledgement email", async () => {
    const visitor = client("visitor");
    const result = await visitor.call("submitForm", { formId: "A03", answers: { enteringStandard: "Standard 1", preferredDate: "2027-01-20", preferredTime: "Either", name: "Visiting Parent", email: "visit@e2e.test", contactConsent: true } });
    assert.match(result.reference, /^SRSS-ADM-\d{4}-\d{4}$/);
    const item = (await store().doc(`formCases/${result.caseId}`).get()).data();
    assert.equal(item.formId, "A03"); assert.equal(item.picRole, "admissionsOfficer"); assert.equal(item.status, "new"); assert.ok(item.dueAt);
    assert.equal((await store().doc(`admissionEnquiries/${result.caseId}`).get()).data().source, "visitRequest");
    await sleep(2500); // the admissionEnquiries trigger must not open a second case
    assert.equal((await store().collection("formCases").where("formId", "==", "A03").get()).size, 1);
    const mail = await store().collection("mail").where("caseId", "==", result.caseId).get();
    assert.equal(mail.docs[0].data().to[0], "visit@e2e.test");
    assert.match(mail.docs[0].data().message.text, new RegExp(result.reference));
  });
  test("bad answers are refused with the field errors; staff-only forms need sign-in", async () => {
    const visitor = client("visitor2");
    await assert.rejects(visitor.call("submitForm", { formId: "A03", answers: { email: "nope" } }), (error) => Boolean(error.details?.errors?.email && error.details?.errors?.preferredDate));
    await assert.rejects(visitor.call("submitForm", { formId: "E09", answers: {} }), /Sign in/);
  });
  test("a message from the website contact form opens a case routed by its subject", async () => {
    const visitor = client("contact");
    await setDoc(doc(visitor.db, "contactMessages/forms-msg"), { name: "Alumna", email: "alumna@e2e.test", subject: "Alumni", message: "Class of 2008 here!", status: "new", createdAt: serverTimestamp() });
    const item = await waitFor(async () => (await store().doc("formCases/contactMessages_forms-msg").get()).data(), "contact case");
    assert.equal(item.formId, "I01"); assert.equal(item.picRole, "alumniCoordinator"); assert.match(item.reference, /^SRSS-S25-/);
  });
});

describe("a parent's contact update", () => {
  test("the office approves it and the guardian record changes", async () => {
    const { caseId, reference } = await parent.call("submitForm", { formId: "B01", answers: { phone: "012-345 6789", address: "6, Jalan Baru" } });
    const mine = await getDocs(query(collection(parent.db, "formCases"), where("submitterUid", "==", parent.uid)));
    assert.ok(mine.docs.some((d) => d.id === caseId));
    await denied(teacher.call("caseAction", { caseId, action: "reply", body: "Hello" }));
    await office.call("caseAction", { caseId, action: "take" });
    await office.call("caseAction", { caseId, action: "status", status: "approved", body: "Updated — thank you." });
    const guardian = (await store().doc("guardians/forms-guardian").get()).data();
    assert.equal(guardian.phone, "012-345 6789"); assert.equal(guardian.address, "6, Jalan Baru");
    const told = await store().collection("notificationRecords").where("recipientUid", "==", parent.uid).get();
    assert.ok(told.docs.some((d) => d.data().title.includes(reference) && /approved/i.test(d.data().title)));
  });
  test("a parent can't send a form about a child who isn't theirs", async () => {
    await denied(parent.call("submitForm", { formId: "B02", answers: { studentId: "forms-other", field: "Other", correction: "x" } }));
  });
});

describe("a complaint about the Headmistress", () => {
  test("is restricted, routed to the independent delegate and hidden from the office and the Headmistress", async () => {
    const { caseId, restricted } = await parent.call("submitForm", { formId: "B09", answers: { concerns: "The Headmistress", details: "Something happened." } });
    assert.equal(restricted, true);
    const item = (await store().doc(`restrictedCases/${caseId}`).get()).data();
    assert.equal(item.picRole, "superAdmin"); assert.ok(![item.backupRole, item.escalationRole].includes("leadership"));
    assert.equal((await store().doc(`formCases/${caseId}`).get()).exists, false);
    await denied(getDoc(doc(office.db, `restrictedCases/${caseId}`)));
    await denied(getDoc(doc(principal.db, `restrictedCases/${caseId}`)));
    await denied(principal.call("caseAction", { caseId, restricted: true, action: "note", body: "x" }));
    assert.ok((await getDoc(doc(superadmin.db, `restrictedCases/${caseId}`))).exists());
    assert.equal((await getDoc(doc(parent.db, `restrictedCases/${caseId}`))).data().status, "new");
    const alerts = await store().collection("mail").where("caseId", "==", caseId).get();
    for (const message of alerts.docs) assert.ok(!message.data().message.text.includes("Something happened"), "no details in email");
  });
});

describe("a teacher's IT request", () => {
  test("request information → reply → complete, with internal notes kept from the teacher", async () => {
    const { caseId } = await teacher.call("submitForm", { formId: "E09", answers: { system: "Projector or display", problem: "No picture in 4 Shanti", urgency: "Normal" } });
    await tech.call("caseAction", { caseId, action: "requestInfo", body: "Which cable are you using?" });
    assert.equal((await store().doc(`formCases/${caseId}`).get()).data().status, "awaitingInformation");
    await tech.call("caseAction", { caseId, action: "note", body: "Probably the HDMI adaptor." });
    const visible = await getDocs(query(collection(teacher.db, `formCases/${caseId}/activity`), where("visibility", "==", "external")));
    assert.ok(visible.docs.some((d) => d.data().body === "Which cable are you using?"));
    assert.ok(!visible.docs.some((d) => d.data().kind === "note"));
    await denied(getDocs(collection(teacher.db, `formCases/${caseId}/activity`)));
    await teacher.call("caseAction", { caseId, action: "submitterReply", body: "The grey HDMI one." });
    assert.equal((await store().doc(`formCases/${caseId}`).get()).data().status, "inProgress");
    await tech.call("caseAction", { caseId, action: "status", status: "completed", body: "Replaced the adaptor." });
    const done = (await store().doc(`formCases/${caseId}`).get()).data();
    assert.equal(done.status, "completed"); assert.ok(done.firstResponseAt && done.completedOn);
    await assert.rejects(teacher.call("caseAction", { caseId, action: "submitterReply", body: "Thanks" }), /finished/);
    await tech.call("caseAction", { caseId, action: "status", status: "inProgress", body: "Reopened: it failed again." });
    assert.equal((await store().doc(`formCases/${caseId}`).get()).data().status, "inProgress");
  });
});

describe("the daily run", () => {
  test("sends overdue reminders once and a daily summary to people with queues", async () => {
    const far = "2099-06-01"; // a Monday, long after every response date
    const first = await office.call("runFormsSchedule", { today: far });
    assert.ok(first.reminders > 0 && first.digests > 0);
    const second = await office.call("runFormsSchedule", { today: far });
    assert.equal(second.reminders, 0);
    const summary = await store().doc(`notificationRecords/formsDigest_${far}_${people.tech.uid}`).get();
    assert.match(summary.data().body, /Overdue/);
    await denied(teacher.call("runFormsSchedule", {}));
  });
});
