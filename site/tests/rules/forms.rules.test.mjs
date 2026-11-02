// Forms & Response Centre security rules: who can read cases, their history and the records behind them.
// Run with `npm run test:rules`.
import { readFile } from "node:fs/promises";
import { after, before, beforeEach, describe, test } from "node:test";
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";

let env;
const [host, port = "8080"] = (process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080").split(":");
const roles = { parent: ["parent"], otherParent: ["parent"], admin: ["schoolAdmin"], principal: ["leadership"], tech: ["technicalAdmin"], welfare: ["safeguardingLead"], teacher: ["teacher"], superadmin: ["superAdmin"], finance: ["financeOfficer"] };
const as = (name) => env.authenticatedContext(name, { roles: roles[name] }).firestore();
const seed = (path, data) => env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), path), data));
const ordinary = { reference: "SRSS-SYS-2027-0001", formId: "E09", picRole: "technicalAdmin", backupRole: "superAdmin", escalationRole: "leadership", submitterUid: "teacher", assignedToUid: null, status: "new" };
const complaint = { reference: "SRSS-PAR-2027-0002", formId: "B09", picRole: "leadership", backupRole: "superAdmin", escalationRole: "superAdmin", submitterUid: "parent", assignedToUid: null, status: "new", answers: { details: "…" } };
const safeguarding = { reference: "SRSS-SAF-2027-0003", formId: "H05", picRole: "safeguardingLead", backupRole: "leadership", escalationRole: "leadership", submitterUid: "teacher", assignedToUid: null, status: "new" };

before(async () => {
  env = await initializeTestEnvironment({ projectId: "demo-srss-tests", firestore: { rules: await readFile(new URL("../../firestore.rules", import.meta.url), "utf8"), host, port: Number(port) } });
});
after(() => env?.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  for (const [uid, list] of Object.entries(roles)) await seed(`users/${uid}`, { roles: list });
  await seed("formCases/c1", ordinary);
  await seed("formCases/c1/activity/a1", { kind: "submitted", visibility: "external", body: "Received." });
  await seed("formCases/c1/activity/a2", { kind: "note", visibility: "internal", body: "Check the projector cable." });
  await seed("formSubmissions/c1", { formId: "E09", caseId: "c1", submittedByUid: "teacher", status: "submitted", answers: { problem: "Projector" } });
  await seed("restrictedCases/r1", complaint);
  await seed("restrictedCases/r1/activity/a1", { kind: "submitted", visibility: "external", body: "Received." });
  await seed("restrictedCases/r1/activity/a2", { kind: "note", visibility: "internal", body: "Speak to the class teacher." });
  await seed("restrictedCases/r2", safeguarding);
});

describe("ordinary cases", () => {
  test("the PIC role, the office and the submitter can read the case; others cannot", async () => {
    for (const name of ["tech", "admin", "principal", "teacher"]) await assertSucceeds(getDoc(doc(as(name), "formCases/c1")));
    for (const name of ["parent", "welfare", "finance"]) await assertFails(getDoc(doc(as(name), "formCases/c1")));
  });
  test("a PIC lists their queue by role; a role they don't hold is refused", async () => {
    await assertSucceeds(getDocs(query(collection(as("tech"), "formCases"), where("picRole", "==", "technicalAdmin"))));
    await assertFails(getDocs(query(collection(as("tech"), "formCases"), where("picRole", "==", "admissionsOfficer"))));
    await assertSucceeds(getDocs(query(collection(as("teacher"), "formCases"), where("submitterUid", "==", "teacher"))));
    await assertFails(getDocs(query(collection(as("parent"), "formCases"), where("submitterUid", "==", "teacher"))));
  });
  test("nobody writes a case or its history from the client — not even the office", async () => {
    await assertFails(updateDoc(doc(as("admin"), "formCases/c1"), { status: "closed" }));
    await assertFails(setDoc(doc(as("teacher"), "formCases/c9"), ordinary));
    await assertFails(setDoc(doc(as("tech"), "formCases/c1/activity/x"), { kind: "reply", visibility: "external", body: "Done" }));
  });
  test("the submitter sees only external history; staff see internal notes", async () => {
    await assertSucceeds(getDocs(query(collection(as("teacher"), "formCases/c1/activity"), where("visibility", "==", "external"))));
    await assertFails(getDocs(collection(as("teacher"), "formCases/c1/activity")));
    await assertFails(getDoc(doc(as("teacher"), "formCases/c1/activity/a2")));
    await assertSucceeds(getDocs(collection(as("tech"), "formCases/c1/activity")));
  });
  test("the PIC can read the submitted answers behind the case", async () => {
    await assertSucceeds(getDoc(doc(as("tech"), "formSubmissions/c1")));
    await assertFails(getDoc(doc(as("finance"), "formSubmissions/c1")));
  });
});

describe("restricted cases", () => {
  test("only the case's own roles can read it — the office cannot", async () => {
    await assertSucceeds(getDoc(doc(as("principal"), "restrictedCases/r1")));
    await assertSucceeds(getDoc(doc(as("superadmin"), "restrictedCases/r1")));
    await assertFails(getDoc(doc(as("admin"), "restrictedCases/r1")));
    await assertFails(getDoc(doc(as("tech"), "restrictedCases/r1")));
    await assertSucceeds(getDoc(doc(as("welfare"), "restrictedCases/r2")));
    await assertFails(getDoc(doc(as("superadmin"), "restrictedCases/r2"))); // safeguarding: only the Safeguarding Lead and the Headmistress
  });
  test("the person who raised it follows its status but not the internal notes", async () => {
    await assertSucceeds(getDocs(query(collection(as("parent"), "restrictedCases"), where("submitterUid", "==", "parent"))));
    await assertFails(getDoc(doc(as("otherParent"), "restrictedCases/r1")));
    await assertSucceeds(getDocs(query(collection(as("parent"), "restrictedCases/r1/activity"), where("visibility", "==", "external"))));
    await assertFails(getDoc(doc(as("parent"), "restrictedCases/r1/activity/a2")));
  });
  test("a lead queries only their own restricted queue", async () => {
    await assertSucceeds(getDocs(query(collection(as("welfare"), "restrictedCases"), where("picRole", "==", "safeguardingLead"))));
    await assertFails(getDocs(query(collection(as("admin"), "restrictedCases"), where("picRole", "==", "safeguardingLead"))));
  });
});

describe("server-only collections", () => {
  test("counters, the email outbox and rate limits are closed to every client", async () => {
    for (const path of ["formCounters/ADM-2027", "mail/m1", "formRateLimits/x"]) {
      await assertFails(getDoc(doc(as("superadmin"), path)));
      await assertFails(setDoc(doc(as("superadmin"), path), { value: 1 }));
    }
  });
});
