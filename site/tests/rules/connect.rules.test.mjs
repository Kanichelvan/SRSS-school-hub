// SRSS Connect against the Firestore emulator: the real `connect` workflows (functions/connect-service.js) and the
// real security rules. Covers spec Part 2 §14.3–§14.5: SEC-003…SEC-011, INT-001…INT-011 and the E2E journeys
// at the data layer (teacher class notice, circular acknowledgement, emergency publication).
import assert from "node:assert/strict";
import { after, before, beforeEach, describe, test } from "node:test";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { FieldValue, Firestore } from "@google-cloud/firestore";
import { readFile } from "node:fs/promises";
import { ConnectError, ensureDelivery, handleConnect, runConnectSchedule } from "../../functions/connect-service.js";
import { syncAnnouncement } from "../../functions/announcement-service.js";

if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error("These tests require the local Firestore emulator.");
const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(":");
const PROJECT = "demo-srss-tests";
const db = new Firestore({ projectId: PROJECT });
const stamp = () => FieldValue.serverTimestamp();
let env;

const parentKeys = (classes) => ["school", "role:parents", ...classes.flatMap(([id, std]) => [`class:${id}`, `standard:${std}`, `class:${id}@parents`, `standard:${std}@parents`])];
const people = {
  office: { roles: ["schoolAdmin"], audienceKeys: ["school", "role:staff"] },
  leader: { roles: ["leadership"], audienceKeys: ["school", "role:staff"] },
  editor: { roles: ["contentEditor"], audienceKeys: ["school", "role:staff"] },
  teacher: { roles: ["teacher"], audienceKeys: ["school", "role:staff", "role:teachers", "class:a", "standard:2"], publishKeys: ["class:a"], classIds: ["a"] },
  teacher2: { roles: ["teacher"], audienceKeys: ["school", "role:staff", "role:teachers", "class:b", "standard:5"], publishKeys: ["class:b"], classIds: ["b"] },
  // Two children: one in Standard 2 (class a), one in Standard 5 (class b).
  parentA: { roles: ["parent"], displayName: "Parent A", audienceKeys: parentKeys([["a", 2], ["b", 5]]), childIds: ["s1", "s2"] },
  parentB: { roles: ["parent"], displayName: "Parent B", audienceKeys: parentKeys([["b", 5]]), childIds: ["s3"] },
  studentA: { roles: ["student"], audienceKeys: ["school", "role:students", "class:a", "standard:2"] },
  gone: { roles: ["parent"], status: "disabled", audienceKeys: parentKeys([["a", 2]]) },
};
const as = (uid) => env.authenticatedContext(uid, { roles: people[uid].roles }).firestore();
const call = (uid, action, data = {}, now = new Date()) => handleConnect(db, { auth: { uid, token: { roles: people[uid].roles } }, data: { action, ...data } }, { now, stamp }).then((result) => result.data);
async function rejects(promise, code) {
  await assert.rejects(promise, (error) => { assert.ok(error instanceof ConnectError, error.message); assert.equal(error.code, code, error.message); return true; });
}
const notice = (data = {}) => ({ title: "Spelling activity", body: "Please practise the week's words at home.", category: "class", priority: "P3", audienceKeys: ["class:a@parents"], ...data });
const deliver = (id) => syncAnnouncement(db, id, { stamp });
const notificationsOf = async (uid) => (await db.collection("notificationRecords").where("recipientUid", "==", uid).get()).docs.map((d) => ({ id: d.id, ...d.data() }));
async function publishAs(uid, data) {
  const saved = await call(uid, "save", { notice: notice(data) });
  const result = await call(uid, "publish", { id: saved.id, revision: saved.revision });
  if (result.status === "published") await deliver(saved.id);
  return { id: saved.id, ...result };
}

before(async () => { env = await initializeTestEnvironment({ projectId: PROJECT, firestore: { host, port: Number(port), rules: await readFile(new URL("../../firestore.rules", import.meta.url), "utf8") } }); });
after(async () => { await env.cleanup(); await db.terminate(); });
beforeEach(async () => {
  await env.clearFirestore();
  await Promise.all(Object.entries(people).map(([uid, scope]) => db.doc(`users/${uid}`).set({ status: "active", ...scope })));
});

describe("teacher class notices (E2E-001, SEC-005/006, INT-005/006)", () => {
  test("a teacher posts to their class's parents; only those parents are notified and can read it", async () => {
    const { id, status } = await publishAs("teacher", {});
    assert.equal(status, "published");
    assert.equal((await notificationsOf("parentA")).length, 1);
    assert.equal((await notificationsOf("parentB")).length, 0, "other class");
    assert.equal((await notificationsOf("studentA")).length, 0, "parents-only audience");
    assert.equal((await notificationsOf("gone")).length, 0, "deactivated account");
    await assertSucceeds(getDoc(doc(as("parentA"), `announcements/${id}`)));
    await assertFails(getDoc(doc(as("parentB"), `announcements/${id}`)));
    await assertFails(getDoc(doc(as("teacher2"), `announcements/${id}`)));
    const job = (await db.doc(`communicationDeliveryJobs/${id}_r1_inApp`).get()).data();
    assert.equal(job.status, "completed");
    assert.equal(job.deliveredCount, 1);
  });
  test("teachers can't publish beyond their own classes or address individuals", async () => {
    const wide = await call("teacher", "save", { notice: notice({ audienceKeys: ["school"] }) });
    await rejects(call("teacher", "publish", { id: wide.id, revision: wide.revision }), "CONNECT_APPROVAL_REQUIRED");
    const other = await call("teacher", "save", { notice: notice({ audienceKeys: ["class:b"] }) });
    await rejects(call("teacher", "publish", { id: other.id, revision: other.revision }), "CONNECT_APPROVAL_REQUIRED");
    await rejects(call("teacher", "save", { notice: notice({ audienceKeys: ["user:parentB"] }) }), "CONNECT_AUDIENCE_INVALID");
    await rejects(call("teacher2", "save", { id: wide.id, notice: notice() }), "CONNECT_PERMISSION_DENIED");
    await rejects(call("parentA", "save", { notice: notice() }), "CONNECT_PERMISSION_DENIED");
  });
  test("a whole-school notice reaches a two-child family once", async () => {
    await publishAs("office", { category: "general", audienceKeys: ["school"] });
    assert.equal((await notificationsOf("parentA")).length, 1);
    const both = await publishAs("office", { category: "academic", audienceKeys: ["standard:2@parents", "standard:5@parents"] });
    assert.equal((await notificationsOf("parentA")).filter((item) => item.announcementId === both.id).length, 1);
    assert.equal((await notificationsOf("parentB")).filter((item) => item.announcementId === both.id).length, 1);
  });
});

describe("approval workflow (Part 2 §6, SEC-007, UT-008/009)", () => {
  test("an editor's school-wide notice needs approval; stale approvals and returned notices are refused", async () => {
    const saved = await call("editor", "save", { notice: notice({ category: "general", audienceKeys: ["school"] }) });
    await rejects(call("editor", "publish", { id: saved.id, revision: saved.revision }), "CONNECT_APPROVAL_REQUIRED");
    await call("editor", "submit", { id: saved.id, revision: saved.revision });
    const reviewers = (await db.collection("notificationRecords").where("purpose", "==", "review").get()).docs.map((d) => d.data().recipientUid).sort();
    assert.deepEqual(reviewers, ["leader", "office"]);
    await rejects(call("office", "approve", { id: saved.id, revision: saved.revision + 5 }), "CONNECT_REVISION_CONFLICT");
    await call("office", "reject", { id: saved.id, revision: saved.revision, reason: "Add the date." });
    await rejects(call("editor", "publish", { id: saved.id, revision: saved.revision }), "CONNECT_INVALID_TRANSITION");
    await rejects(call("editor", "submit", { id: saved.id, revision: saved.revision }), "CONNECT_INVALID_TRANSITION");
    const revised = await call("editor", "save", { id: saved.id, revision: saved.revision, notice: notice({ category: "general", audienceKeys: ["school"], body: "On 3 March." }) });
    assert.equal(revised.revision, saved.revision + 1);
    await call("editor", "submit", { id: saved.id, revision: revised.revision });
    const approved = await call("office", "approve", { id: saved.id, revision: revised.revision });
    assert.equal(approved.status, "published");
    const stored = (await db.doc(`announcements/${saved.id}`).get()).data();
    assert.equal(stored.approvedRevision, revised.revision);
    assert.equal(stored.approvedBy, "office");
    assert.ok((await db.doc(`announcements/${saved.id}/revisions/${revised.revision}`).get()).exists, "approved revision is kept");
  });
  test("emergency (P1) publication needs Leadership and is audited (E2E-004)", async () => {
    const saved = await call("office", "save", { notice: notice({ category: "emergency", priority: "P1", audienceKeys: ["school"], title: "School closed today" }) });
    await rejects(call("office", "publish", { id: saved.id, revision: saved.revision }), "CONNECT_APPROVAL_REQUIRED");
    await call("office", "submit", { id: saved.id, revision: saved.revision });
    await rejects(call("office", "approve", { id: saved.id, revision: saved.revision }), "CONNECT_PERMISSION_DENIED");
    assert.equal((await call("leader", "approve", { id: saved.id, revision: saved.revision })).status, "published");
    const audits = (await db.collection("auditLogs").where("announcementId", "==", saved.id).get()).docs.map((d) => d.data());
    assert.ok(audits.some((entry) => entry.type === "connect.published" && entry.emergency === true && entry.actorUid === "leader"));
    await deliver(saved.id);
    const [alert] = await notificationsOf("parentA");
    assert.equal(alert.priority, "P1");
    assert.equal(alert.critical, true);
  });
});

describe("scheduling, expiry and cancellation (INT-003, INT-004, INT-011)", () => {
  test("scheduled notices appear only when due; expiry removes them from active surfaces", async () => {
    const at = new Date(Date.now() + 2 * 3600000).toISOString();
    const saved = await call("office", "save", { notice: notice({ category: "events", audienceKeys: ["school"], publishAt: at }) });
    assert.equal((await call("office", "publish", { id: saved.id, revision: saved.revision })).status, "scheduled");
    await assertFails(getDoc(doc(as("parentA"), `announcements/${saved.id}`)));
    assert.equal((await runConnectSchedule(db, { now: new Date(), stamp })).published, 0);
    assert.equal((await runConnectSchedule(db, { now: new Date(Date.now() + 3 * 3600000), stamp })).published, 1);
    assert.equal((await db.doc(`announcements/${saved.id}`).get()).data().status, "published");
    await assertSucceeds(getDoc(doc(as("parentA"), `announcements/${saved.id}`)));
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur" }).format(new Date());
    await db.doc(`announcements/${saved.id}`).update({ expiresAt: day });
    assert.equal((await runConnectSchedule(db, { now: new Date(Date.now() + 2 * 86400000), stamp })).expired, 1);
    assert.equal((await db.doc(`announcements/${saved.id}`).get()).data().status, "expired");
    await assertFails(getDoc(doc(as("parentA"), `announcements/${saved.id}`)));
  });
  test("cancelling stops pending delivery and withdraws the public copy", async () => {
    const saved = await call("office", "save", { notice: notice({ category: "general", audienceKeys: ["school"], publicListing: true }) });
    await call("office", "publish", { id: saved.id, revision: saved.revision });
    await syncAnnouncement(db, saved.id, { stamp, notify: false });
    assert.ok((await db.doc(`publicAnnouncements/${saved.id}`).get()).exists);
    await call("office", "cancel", { id: saved.id, reason: "Date changed" });
    assert.equal((await deliver(saved.id)).notified, 0);
    assert.equal((await db.doc(`publicAnnouncements/${saved.id}`).get()).exists, false);
    assert.equal((await notificationsOf("parentA")).length, 0);
    await rejects(call("office", "cancel", { id: saved.id, reason: "again" }), "CONNECT_INVALID_TRANSITION");
  });
});

describe("delivery reliability (INT-002, INT-007, INT-010)", () => {
  test("repeated deliveries and an interrupted worker never duplicate notifications", async () => {
    const { id } = await publishAs("office", { category: "general", audienceKeys: ["school"] });
    const first = (await db.collection("notificationRecords").where("announcementId", "==", id).get()).size;
    await Promise.all([deliver(id), deliver(id), ensureDelivery(db, id, { stamp, force: true })]);
    assert.equal((await db.collection("notificationRecords").where("announcementId", "==", id).get()).size, first);
    // Simulate a worker that stopped after its first batch, with one record written.
    const second = await call("office", "save", { notice: notice({ category: "general", audienceKeys: ["school"], title: "Second" }) });
    await call("office", "publish", { id: second.id, revision: second.revision });
    await db.doc(`notificationRecords/announcement_${second.id}_editor`).set({ recipientUid: "editor", announcementId: second.id, readAt: "kept" });
    await db.doc(`communicationDeliveryJobs/${second.id}_r1_inApp`).set({ announcementId: second.id, revision: 1, channel: "inApp", status: "processing", cursor: "editor", processedCount: 1, deliveredCount: 1, skippedCount: 0, failedCount: 0, attemptCount: 1, targetSnapshotCount: 0, updatedAt: new Date(Date.now() - 600000) });
    assert.equal((await runConnectSchedule(db, { now: new Date(), stamp })).resumed, 1);
    const records = (await db.collection("notificationRecords").where("announcementId", "==", second.id).get()).docs;
    assert.equal(records.length, first);
    assert.equal(records.find((d) => d.id.endsWith("_editor")).data().readAt, "kept");
    assert.equal((await db.doc(`communicationDeliveryJobs/${second.id}_r1_inApp`).get()).data().status, "completed");
  });
  test("a revoked guardian link stops future private notices", async () => {
    await db.doc("users/parentA").update({ audienceKeys: parentKeys([["b", 5]]) });
    const { id } = await publishAs("teacher", {});
    assert.equal((await notificationsOf("parentA")).length, 0);
    await assertFails(getDoc(doc(as("parentA"), `announcements/${id}`)));
  });
  test("muted optional categories skip the notification but keep the notice readable", async () => {
    await db.doc("notificationPreferences/parentA").set({ mutedCategories: ["achievements"] });
    const { id } = await publishAs("office", { category: "achievements", priority: "P4", audienceKeys: ["role:parents"] });
    assert.equal((await notificationsOf("parentA")).length, 0);
    assert.equal((await notificationsOf("parentB")).length, 1);
    await assertSucceeds(getDoc(doc(as("parentA"), `announcements/${id}`)));
  });
});

describe("circulars and acknowledgements (E2E-002, INT-009, UT-015)", () => {
  test("parents acknowledge the exact revision once; reports and reminders count only the right people", async () => {
    const saved = await call("office", "save", { notice: notice({ type: "circular", category: "administrative", audienceKeys: ["role:parents"], requiresAcknowledgement: true, title: "Uniform policy" }) });
    const published = await call("office", "publish", { id: saved.id, revision: saved.revision });
    assert.match(published.reference, /^SRSS\/CIR\/\d{4}\/001$/);
    await deliver(saved.id);
    const ack = await call("parentA", "acknowledge", { id: saved.id, revision: 1 });
    assert.equal(ack.revision, 1);
    assert.equal((await call("parentA", "acknowledge", { id: saved.id, revision: 1 })).already, true);
    assert.equal((await db.collection("announcementAcknowledgements").where("announcementId", "==", saved.id).get()).size, 1);
    assert.ok((await db.doc(`announcementAcknowledgements/${saved.id}_r1_parentA`).get()).exists);
    await rejects(call("teacher", "acknowledge", { id: saved.id, revision: 1 }), "CONNECT_NOT_FOUND");
    const report = await call("office", "report", { id: saved.id });
    assert.deepEqual([report.eligible, report.acknowledged, report.pendingCount], [2, 1, 1]);
    assert.deepEqual(report.pending.map((person) => person.uid), ["parentB"]);
    await rejects(call("parentA", "report", { id: saved.id }), "CONNECT_PERMISSION_DENIED");
    assert.equal((await call("office", "remind", { id: saved.id })).sent, 1);
    assert.equal((await call("office", "remind", { id: saved.id })).sent, 0, "one reminder per person per day");
    // A new revision creates a new obligation; acknowledging the old one is refused.
    const revised = await call("office", "save", { id: saved.id, revision: 1, notice: notice({ type: "circular", category: "administrative", audienceKeys: ["role:parents"], requiresAcknowledgement: true, title: "Uniform policy", body: "Updated shoes rule." }) });
    assert.equal(revised.revision, 2);
    await rejects(call("parentA", "acknowledge", { id: saved.id, revision: 1 }), "CONNECT_REVISION_CONFLICT");
    assert.equal((await call("parentA", "acknowledge", { id: saved.id, revision: 2 })).revision, 2);
    // Clients read only their own acknowledgements and can't forge one.
    await assertSucceeds(getDoc(doc(as("parentA"), `announcementAcknowledgements/${saved.id}_r1_parentA`)));
    await assertFails(getDoc(doc(as("parentB"), `announcementAcknowledgements/${saved.id}_r1_parentA`)));
    await assertFails(setDoc(doc(as("parentB"), `announcementAcknowledgements/${saved.id}_r2_parentB`), { announcementId: saved.id, announcementRevision: 2, recipientUid: "parentB" }));
  });
});

describe("notification records and preferences (SEC-003/004/010)", () => {
  test("people read and update only their own notifications, and only read/archive state", async () => {
    await publishAs("office", { category: "general", audienceKeys: ["school"] });
    const [mine] = await notificationsOf("parentA");
    const ref = (uid) => doc(as(uid), `notificationRecords/${mine.id}`);
    await assertSucceeds(getDoc(ref("parentA")));
    await assertFails(getDoc(ref("parentB")));
    await assertSucceeds(getDocs(query(collection(as("parentA"), "notificationRecords"), where("recipientUid", "==", "parentA"))));
    await assertFails(getDocs(query(collection(as("parentA"), "notificationRecords"), where("recipientUid", "==", "parentB"))));
    await assertSucceeds(updateDoc(ref("parentA"), { readAt: serverTimestamp() }));
    await assertSucceeds(updateDoc(ref("parentA"), { archivedAt: serverTimestamp() }));
    await assertSucceeds(updateDoc(ref("parentA"), { archivedAt: null }));
    await assertFails(updateDoc(ref("parentA"), { title: "Changed" }));
    await assertFails(updateDoc(ref("parentA"), { readAt: new Date("2020-01-01") }));
    await assertFails(updateDoc(ref("parentB"), { readAt: serverTimestamp() }));
    await assertFails(setDoc(doc(as("parentA"), "notificationRecords/forged"), { recipientUid: "parentB", title: "x" }));
    await assertFails(getDocs(collection(as("parentA"), "communicationDeliveryJobs")));
    await assertSucceeds(getDocs(collection(as("office"), "communicationDeliveryJobs")));
  });
  test("preferences: optional categories only, owner only", async () => {
    const prefs = (data) => ({ mutedCategories: ["achievements"], language: "ms", digest: "none", updatedAt: serverTimestamp(), ...data });
    await assertSucceeds(setDoc(doc(as("parentA"), "notificationPreferences/parentA"), prefs()));
    await assertFails(setDoc(doc(as("parentA"), "notificationPreferences/parentA"), prefs({ mutedCategories: ["emergency"] })));
    await assertFails(setDoc(doc(as("parentA"), "notificationPreferences/parentA"), prefs({ language: "fr" })));
    await assertFails(setDoc(doc(as("parentA"), "notificationPreferences/parentB"), prefs()));
    await assertFails(getDoc(doc(as("parentB"), "notificationPreferences/parentA")));
  });
});
