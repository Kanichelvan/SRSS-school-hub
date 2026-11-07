// SRSS Connect — trusted backend workflows (spec Part 2 §6–§11). The browser never approves, publishes,
// assigns publication times, creates other people's notifications, changes delivery counters or edits audit
// history: every one of those happens here, after the actor's identity, capability and scope are checked.
// Firestore-only (no FieldValue) so the same code runs in Cloud Functions and in emulator tests; callers pass
// `stamp` (a server-timestamp factory).
import {
  STATUSES, acknowledgementId, audienceLevel, canEdit, canReport, canTransition, capabilitiesFor, categoryOf, circularReference,
  deliveryJobId, deliveryRevision, hasCapability, isDue, isLive, materialChange, notificationFor, notificationId, priorityOf,
  publicNotice, publishDecision, recipientEligible, reviewDecision, schoolDate, shouldNotify, teacherKeys, toMillis, validateNotice,
} from "./connect-model.js";

const HTTP_STATUS = {
  CONNECT_UNAUTHENTICATED: "unauthenticated", CONNECT_PERMISSION_DENIED: "permission-denied", CONNECT_NOT_FOUND: "not-found",
  CONNECT_VALIDATION_FAILED: "invalid-argument", CONNECT_INVALID_TRANSITION: "failed-precondition", CONNECT_REVISION_CONFLICT: "aborted",
  CONNECT_AUDIENCE_INVALID: "invalid-argument", CONNECT_APPROVAL_REQUIRED: "failed-precondition", CONNECT_RATE_LIMITED: "resource-exhausted",
  CONNECT_DELIVERY_UNAVAILABLE: "unavailable", CONNECT_INTERNAL_ERROR: "internal",
};
export class ConnectError extends Error {
  constructor(code, message, details = {}) { super(message); this.code = code; this.status = HTTP_STATUS[code] || "internal"; this.details = details; }
}
const fail = (code, message, details) => { throw new ConnectError(code, message, details); };
const BATCH = 100;
const MAX_ATTEMPTS = 5;
const BACKOFF_MINUTES = [0, 1, 5, 15, 60];
const REVIEWERS = ["schoolAdmin", "leadership", "superAdmin", "academicCoordinator"];
const CONTENT_FIELDS = ["schemaVersion", "type", "title", "summary", "body", "category", "priority", "audienceKeys", "publicListing", "pinned", "requiresAcknowledgement",
  "acknowledgementDeadline", "expiresAt", "effectiveDate", "publishAt", "action", "attachments", "issuingDepartment", "channels"];
const pick = (object, keys) => Object.fromEntries(keys.filter((key) => object[key] !== undefined).map((key) => [key, object[key]]));
const requestId = () => `req_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

// ---------- delivery (Part 2 §9, §11) ----------
async function audienceMembers(db, keys) {
  if (!keys?.length) return [];
  const snap = await db.collection("users").where("audienceKeys", "array-contains-any", keys.slice(0, 30)).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Creates (once) and runs the in-app delivery job for the notice's delivery revision. Resumable: the job keeps a
// cursor, each batch rechecks that the notice is still live, and notification ids are deterministic, so a retry,
// a second trigger or a restarted worker can never deliver twice. Cancelling stops the next batch.
export async function ensureDelivery(db, id, { now = new Date(), stamp = () => new Date(), force = false } = {}) {
  const source = db.doc(`announcements/${id}`);
  const notice = (await source.get()).data();
  if (!isLive(notice, now)) return { notified: 0, status: "inactive" };
  const revision = deliveryRevision(notice);
  const jobRef = db.doc(`communicationDeliveryJobs/${deliveryJobId(id, revision)}`);
  const job = await db.runTransaction(async (tx) => {
    const snap = await tx.get(jobRef);
    const current = snap.exists ? snap.data() : null;
    if (current && ["completed", "cancelled"].includes(current.status)) return null;
    if (current && current.status === "failed" && !force) return null;
    // Another worker is mid-batch: leave it; the scheduler resumes jobs that stop moving.
    if (current?.status === "processing" && !force && now.getTime() - toMillis(current.updatedAt) < 120000) return null;
    const next = {
      announcementId: id, revision, channel: "inApp", cursor: current?.cursor ?? null, targetSnapshotCount: current?.targetSnapshotCount ?? 0,
      processedCount: current?.processedCount ?? 0, deliveredCount: current?.deliveredCount ?? 0, skippedCount: current?.skippedCount ?? 0, failedCount: current?.failedCount ?? 0,
      attemptCount: (current?.attemptCount ?? 0) + 1, status: "processing", lastErrorCode: null, createdAt: current?.createdAt ?? stamp(), updatedAt: stamp(),
    };
    tx.set(jobRef, next);
    return next;
  });
  if (!job) return { notified: 0, status: "skipped" };
  let notified = 0;
  try {
    const eligible = (await audienceMembers(db, notice.audienceKeys)).filter((user) => recipientEligible(user, notice)).sort((a, b) => (a.id < b.id ? -1 : 1));
    if (job.targetSnapshotCount !== eligible.length) await jobRef.update({ targetSnapshotCount: eligible.length, updatedAt: stamp() });
    const remaining = job.cursor ? eligible.filter((user) => user.id > job.cursor) : eligible;
    for (let start = 0; start < remaining.length; start += BATCH) {
      const group = remaining.slice(start, start + BATCH);
      const result = await db.runTransaction(async (tx) => {
        const current = (await tx.get(source)).data();
        if (!isLive(current, now) || deliveryRevision(current) !== revision) return { stop: true };
        const refs = group.map((user) => db.doc(`notificationRecords/${notificationId(id, revision, user.id)}`));
        const [jobSnap, existing, preferences] = await Promise.all([tx.get(jobRef), tx.getAll(...refs), tx.getAll(...group.map((user) => db.doc(`notificationPreferences/${user.id}`)))]);
        let created = 0; let skipped = 0;
        existing.forEach((snapshot, index) => {
          if (snapshot.exists || !shouldNotify(preferences[index].data(), current)) { skipped++; return; }
          tx.create(refs[index], { ...notificationFor(id, current, group[index].id), createdAt: stamp() });
          created++;
        });
        const counts = jobSnap.data();
        tx.update(jobRef, { cursor: group.at(-1).id, processedCount: counts.processedCount + group.length, deliveredCount: counts.deliveredCount + created, skippedCount: counts.skippedCount + skipped, updatedAt: stamp() });
        return { created };
      });
      if (result.stop) { await jobRef.update({ status: "cancelled", updatedAt: stamp() }); return { notified, status: "cancelled" }; }
      notified += result.created;
    }
    await jobRef.update({ status: "completed", completedAt: stamp(), updatedAt: stamp() });
    return { notified, status: "completed" };
  } catch (error) {
    const attempts = job.attemptCount;
    const delay = BACKOFF_MINUTES[Math.min(attempts, BACKOFF_MINUTES.length - 1)] * 60000 * (0.8 + Math.random() * 0.4);
    await jobRef.update({ status: attempts >= MAX_ATTEMPTS ? "failed" : "retry_pending", lastErrorCode: error.code ? String(error.code) : "CONNECT_INTERNAL_ERROR", nextAttemptAt: new Date(now.getTime() + delay), updatedAt: stamp() }).catch(() => {});
    throw error;
  }
}

// Keeps the sanitized public copy in step with the notice (published, explicitly public, whole-school only).
export async function syncPublicCopy(db, id, { now = new Date() } = {}) {
  const source = db.doc(`announcements/${id}`);
  const publicRef = db.doc(`publicAnnouncements/${id}`);
  return db.runTransaction(async (tx) => {
    const current = (await tx.get(source)).data();
    const copy = current && publicNotice(id, current, now);
    if (copy) tx.set(publicRef, copy); else tx.delete(publicRef);
    return current;
  });
}

// Small helper for system notifications to a known list of people (reviewers, authors, reminders).
async function notifyPeople(db, uids, build, stamp) {
  const unique = [...new Set(uids.filter(Boolean))];
  let created = 0;
  for (let start = 0; start < unique.length; start += BATCH) {
    const group = unique.slice(start, start + BATCH);
    const refs = group.map((uid) => db.doc(`notificationRecords/${build(uid).id}`));
    const existing = await db.getAll(...refs);
    const batch = db.batch();
    existing.forEach((snap, index) => { if (!snap.exists) { const { id, ...record } = build(group[index]); batch.create(refs[index], { ...record, createdAt: stamp() }); created++; } });
    await batch.commit();
  }
  return created;
}

async function pendingAcknowledgers(db, id, notice) {
  const revision = notice.revision || 1;
  const [members, acks] = await Promise.all([
    audienceMembers(db, notice.audienceKeys),
    db.collection("announcementAcknowledgements").where("announcementId", "==", id).where("announcementRevision", "==", revision).get(),
  ]);
  const done = new Set(acks.docs.map((doc) => doc.data().recipientUid));
  const eligible = members.filter((user) => recipientEligible(user, notice));
  return { eligible, acknowledged: eligible.filter((user) => done.has(user.id)), pending: eligible.filter((user) => !done.has(user.id)) };
}

export async function sendAcknowledgementReminders(db, id, notice, { now = new Date(), stamp = () => new Date() } = {}) {
  if (!isLive(notice, now) || !notice.requiresAcknowledgement) return 0;
  const { pending } = await pendingAcknowledgers(db, id, notice);
  const day = schoolDate(now);
  const revision = notice.revision || 1;
  return notifyPeople(db, pending.map((user) => user.id), (uid) => ({
    ...notificationFor(id, notice, uid, { purpose: "ackReminder", title: `Reminder: please acknowledge “${notice.title}”` }),
    id: `ackReminder_${id}_r${revision}_${day}_${uid}`, dedupeKey: `ackReminder_${id}_r${revision}_${day}_${uid}`, critical: true,
  }), stamp);
}

// ---------- scheduler (Part 2 §10, §11.6) ----------
export async function runConnectSchedule(db, { now = new Date(), stamp = () => new Date() } = {}) {
  const [scheduled, live, jobs] = await Promise.all([
    db.collection("announcements").where("status", "==", "scheduled").get(),
    db.collection("announcements").where("status", "==", "published").get(),
    db.collection("communicationDeliveryJobs").where("status", "in", ["queued", "processing", "retry_pending"]).get(),
  ]);
  let published = 0; let expired = 0; let resumed = 0; let reminded = 0;
  for (const item of scheduled.docs.filter((doc) => isDue(doc.data(), now))) {
    const changed = await db.runTransaction(async (tx) => {
      const current = (await tx.get(item.ref)).data();
      if (!isDue(current, now) || current.approvedRevision !== current.revision) return false;
      if (current.expiresAt && current.expiresAt < schoolDate(now)) { tx.update(item.ref, { status: "expired", expiredAt: stamp(), updatedAt: stamp(), updatedBy: "scheduler" }); return false; }
      tx.update(item.ref, { status: "published", publishedAt: stamp(), publishedBy: "scheduler", deliveryRevision: current.revision, updatedAt: stamp(), updatedBy: "scheduler" });
      tx.set(db.collection("auditLogs").doc(), { type: "connect.published", announcementId: item.id, revision: current.revision, from: "scheduled", to: "published", actorUid: "scheduler", at: stamp() });
      return true;
    });
    if (changed) published++;
  }
  const today = schoolDate(now);
  const tomorrow = schoolDate(new Date(now.getTime() + 86400000));
  for (const item of live.docs) {
    const notice = item.data();
    if (notice.expiresAt && notice.expiresAt < today) {
      await item.ref.update({ status: "expired", expiredAt: stamp(), updatedAt: stamp(), updatedBy: "scheduler" });
      expired++;
    } else if (notice.requiresAcknowledgement && notice.acknowledgementDeadline === tomorrow) {
      reminded += await sendAcknowledgementReminders(db, item.id, notice, { now, stamp });
    }
  }
  for (const job of jobs.docs) {
    const data = job.data();
    const stale = now.getTime() - toMillis(data.updatedAt) > 5 * 60000;
    const due = data.status === "retry_pending" && (!data.nextAttemptAt || toMillis(data.nextAttemptAt) <= now.getTime());
    if (stale || due) { await ensureDelivery(db, data.announcementId, { now, stamp, force: true }).catch(() => {}); resumed++; }
  }
  return { published, expired, resumed, reminded };
}

// ---------- the connect callable (Part 2 §7) ----------
export async function handleConnect(db, request, { now = new Date(), stamp = () => new Date() } = {}) {
  if (!request.auth) fail("CONNECT_UNAUTHENTICATED", "Please sign in again.");
  const uid = request.auth.uid;
  const roles = request.auth.token?.roles || [];
  const scope = (await db.doc(`users/${uid}`).get()).data() || {};
  if ((scope.status ?? "active") !== "active" || !roles.length) fail("CONNECT_PERMISSION_DENIED", "Your account isn't active.");
  const actor = { uid, roles, scope, name: scope.displayName || request.auth.token?.name || request.auth.token?.email || "School staff", caps: capabilitiesFor(roles) };
  const data = request.data || {};
  const handler = ACTIONS[data.action];
  if (!handler) fail("CONNECT_VALIDATION_FAILED", "Unknown SRSS Connect action.");
  const ctx = { db, actor, now, stamp, requestId: requestId() };
  return { success: true, data: await handler(ctx, data), requestId: ctx.requestId };
}

const can = (actor, capability) => actor.caps.has(`connect.${capability}`);
const requireCap = (actor, capability, message = "You are not authorised to perform this action.") => { if (!can(actor, capability)) fail("CONNECT_PERMISSION_DENIED", message); };
const auditEntry = (ctx, type, id, extra = {}) => ({ type: `connect.${type}`, announcementId: id, actorUid: ctx.actor.uid, requestId: ctx.requestId, at: ctx.stamp(), ...extra });
const refOf = (ctx, id) => { if (typeof id !== "string" || !/^[\w-]{1,128}$/.test(id)) fail("CONNECT_VALIDATION_FAILED", "Unknown notice."); return ctx.db.doc(`announcements/${id}`); };
async function readable(tx, ref) { const snap = await tx.get(ref); if (!snap.exists) fail("CONNECT_NOT_FOUND", "This notice is not available."); return snap.data(); }
function expectRevision(current, revision) { if (revision != null && revision !== current.revision) fail("CONNECT_REVISION_CONFLICT", "Someone changed this notice since you opened it. Reload it and try again."); }
function move(current, to) { if (!canTransition(current.status, to)) fail("CONNECT_INVALID_TRANSITION", `A ${STATUSES[current.status]?.toLowerCase() || current.status} notice can't become ${STATUSES[to]?.toLowerCase() || to}.`); }

// Which audience levels may this person put in a draft? Teachers may draft wider audiences only to submit them.
function checkDraftAudience(actor, keys) {
  const teacher = can(actor, "announcement.publish.class");
  for (const key of keys) {
    const level = audienceLevel(key);
    if (can(actor, `announcement.target.${level}`)) continue;
    if (teacher && level !== "explicit") continue;
    fail("CONNECT_AUDIENCE_INVALID", "Your role can't address that audience.");
  }
}

function validated(ctx, input) {
  const { value, errors, valid } = validateNotice(input, { now: ctx.now });
  if (!valid) fail("CONNECT_VALIDATION_FAILED", Object.values(errors)[0], { errors });
  if (value.type === "circular") requireCap(ctx.actor, "circular.create", "Your role can't issue circulars.");
  checkDraftAudience(ctx.actor, value.audienceKeys);
  return value;
}

async function snapshotRevision(ctx, tx, id, notice, extra = {}) {
  tx.set(ctx.db.doc(`announcements/${id}/revisions/${notice.revision}`), { ...pick(notice, CONTENT_FIELDS), revision: notice.revision, reference: notice.reference || null, approvedBy: notice.approvedBy || null, recordedAt: ctx.stamp(), ...extra });
}

// Publishes or schedules an approved revision inside a transaction (Part 2 §6.3 invariants). It performs its
// reads first (Firestore transactions read before they write), so callers call it before writing anything.
async function activate(ctx, tx, ref, current, { publishAt, extra = {} } = {}) {
  const at = publishAt === undefined ? current.publishAt : publishAt;
  const future = at && Date.parse(at) > ctx.now.getTime() + 60000;
  if (current.approvedRevision !== current.revision) fail("CONNECT_APPROVAL_REQUIRED", "This revision hasn't been approved.");
  if (current.expiresAt && current.expiresAt < schoolDate(ctx.now)) fail("CONNECT_VALIDATION_FAILED", "The removal date has already passed.");
  if (future && !can(ctx.actor, "announcement.schedule")) fail("CONNECT_PERMISSION_DENIED", "You can't schedule notices.");
  const update = { ...extra, publishAt: at || null, updatedAt: ctx.stamp(), updatedBy: ctx.actor.uid };
  if (current.type === "circular" && !current.reference) {
    const year = schoolDate(ctx.now).slice(0, 4);
    const counterRef = ctx.db.doc(`connectCounters/circulars-${year}`);
    const sequence = (await tx.get(counterRef)).data()?.next || 1;
    tx.set(counterRef, { next: sequence + 1, updatedAt: ctx.stamp() });
    update.reference = circularReference(year, sequence);
  }
  if (future) update.status = "scheduled";
  else Object.assign(update, { status: "published", publishedAt: ctx.stamp(), publishedBy: ctx.actor.uid, publishedByName: ctx.actor.name, deliveryRevision: current.revision });
  tx.update(ref, update);
  await snapshotRevision(ctx, tx, ref.id, { ...current, ...update }, { publishedBy: update.publishedBy || null });
  tx.set(ctx.db.collection("auditLogs").doc(), auditEntry(ctx, update.status, ref.id, { revision: current.revision, from: current.status, to: update.status, priority: priorityOf(current), emergency: priorityOf(current) === "P1" }));
  return { status: update.status, reference: update.reference || current.reference || null };
}

// Where an author manages their notice: teachers in the Teaching hub, everyone else in the Admin hub.
async function workspaceLink(db, uid, id) {
  const roles = (await db.doc(`users/${uid}`).get()).data()?.roles || [];
  return hasCapability(roles, "announcement.edit.scope") ? `/hub/admin/communications/${id}` : `/hub/teacher/announcements/${id}`;
}

const ACTIONS = {
  // Create or edit a draft. Editing after approval returns the notice to draft (renewed approval);
  // editing a published notice creates a new revision, and tells recipients again only when asked.
  async save(ctx, { id, notice, revision, notifyAgain = false }) {
    const { db, actor } = ctx;
    requireCap(actor, "announcement.create", "Your role can't write notices.");
    const value = validated(ctx, notice || {});
    if (!id) {
      const ref = db.collection("announcements").doc();
      await ref.set({ ...value, status: "draft", revision: 1, approvedRevision: null, createdBy: actor.uid, createdByName: actor.name, createdAt: ctx.stamp(), updatedAt: ctx.stamp(), updatedBy: actor.uid });
      await db.collection("auditLogs").add(auditEntry(ctx, "created", ref.id, { revision: 1, to: "draft" }));
      return { id: ref.id, status: "draft", revision: 1 };
    }
    const ref = refOf(ctx, id);
    return db.runTransaction(async (tx) => {
      const current = await readable(tx, ref);
      if (!canEdit(actor.roles, current, actor.uid)) fail("CONNECT_PERMISSION_DENIED", "You can't edit this notice.");
      expectRevision(current, revision);
      const next = current.revision + 1;
      if (current.status === "published") {
        const decision = publishDecision({ roles: actor.roles, scope: actor.scope, uid: actor.uid, notice: { ...current, ...value } });
        if (!decision.allowed) fail("CONNECT_APPROVAL_REQUIRED", decision.reason);
        const update = { ...value, revision: next, approvedRevision: next, approvedBy: actor.uid, deliveryRevision: notifyAgain ? next : deliveryRevision(current), updatedAt: ctx.stamp(), updatedBy: actor.uid, lastMaterialChange: materialChange(current, value) };
        tx.update(ref, update);
        await snapshotRevision(ctx, tx, id, { ...current, ...update });
        tx.set(db.collection("auditLogs").doc(), auditEntry(ctx, "revised", id, { revision: next, notifyAgain, material: update.lastMaterialChange }));
        return { id, status: "published", revision: next };
      }
      if (!["draft", "rejected", "pending_review", "approved", "scheduled"].includes(current.status)) fail("CONNECT_INVALID_TRANSITION", "This notice can no longer be edited. Duplicate it instead.");
      tx.update(ref, { ...value, status: "draft", revision: next, approvedRevision: null, approvedBy: null, rejectedReason: null, updatedAt: ctx.stamp(), updatedBy: actor.uid });
      tx.set(db.collection("auditLogs").doc(), auditEntry(ctx, "edited", id, { revision: next, from: current.status, to: "draft" }));
      return { id, status: "draft", revision: next };
    });
  },

  async submit(ctx, { id, revision }) {
    const { db, actor } = ctx;
    requireCap(actor, "announcement.submit");
    const ref = refOf(ctx, id);
    const result = await db.runTransaction(async (tx) => {
      const current = await readable(tx, ref);
      if (!canEdit(actor.roles, current, actor.uid)) fail("CONNECT_PERMISSION_DENIED", "You can submit only your own notices.");
      expectRevision(current, revision);
      if (current.status === "rejected") fail("CONNECT_INVALID_TRANSITION", "Revise the notice before submitting it again.");
      move(current, "pending_review");
      validated(ctx, current);
      tx.update(ref, { status: "pending_review", submittedBy: actor.uid, submittedByName: actor.name, submittedAt: ctx.stamp(), updatedAt: ctx.stamp(), updatedBy: actor.uid });
      tx.set(db.collection("auditLogs").doc(), auditEntry(ctx, "submitted", id, { revision: current.revision, from: current.status, to: "pending_review" }));
      return current;
    });
    // Tell the people who can approve it (P1 → Leadership only).
    const reviewerRoles = priorityOf(result) === "P1" ? ["leadership", "superAdmin"] : REVIEWERS;
    const reviewers = (await db.collection("users").where("roles", "array-contains-any", reviewerRoles).get()).docs
      .filter((doc) => doc.id !== actor.uid && (doc.data().status ?? "active") === "active" && reviewDecision({ roles: doc.data().roles || [], notice: result }).allowed).map((doc) => doc.id);
    await notifyPeople(db, reviewers, (uid) => ({ id: `review_${id}_r${result.revision}_${uid}`, recipientUid: uid, sourceType: "review", sourceId: id, sourceRevision: result.revision, announcementId: id, purpose: "review",
      category: "staff", priority: priorityOf(result), critical: priorityOf(result) === "P1", title: `Approval needed: ${result.title}`, preview: `Submitted by ${actor.name}.`, body: `Submitted by ${actor.name}.`,
      link: `/hub/admin/communications/${id}`, actionRequired: true, readAt: null, archivedAt: null, expiresAt: null }), ctx.stamp);
    return { id, status: "pending_review", reviewersNotified: reviewers.length };
  },

  async withdraw(ctx, { id }) {
    const ref = refOf(ctx, id);
    return ctx.db.runTransaction(async (tx) => {
      const current = await readable(tx, ref);
      if (!canEdit(ctx.actor.roles, current, ctx.actor.uid)) fail("CONNECT_PERMISSION_DENIED", "You can withdraw only your own notices.");
      if (current.status !== "pending_review") fail("CONNECT_INVALID_TRANSITION", "Only a notice waiting for approval can be withdrawn.");
      tx.update(ref, { status: "draft", updatedAt: ctx.stamp(), updatedBy: ctx.actor.uid });
      tx.set(ctx.db.collection("auditLogs").doc(), auditEntry(ctx, "withdrawn", id, { revision: current.revision, from: "pending_review", to: "draft" }));
      return { id, status: "draft" };
    });
  },

  // Direct publication by someone with the authority to publish it (self-approval is recorded).
  async publish(ctx, { id, revision, publishAt }) {
    const { db, actor } = ctx;
    const ref = refOf(ctx, id);
    return db.runTransaction(async (tx) => {
      const current = await readable(tx, ref);
      expectRevision(current, revision);
      if (!["draft", "approved"].includes(current.status)) fail("CONNECT_INVALID_TRANSITION", current.status === "rejected" ? "A returned notice must be revised and approved before publication." : current.status === "pending_review" ? "This notice is waiting for approval." : "This notice can't be published from its current state.");
      validated(ctx, current);
      const decision = publishDecision({ roles: actor.roles, scope: actor.scope, uid: actor.uid, notice: current });
      if (!decision.allowed) fail("CONNECT_APPROVAL_REQUIRED", decision.reason);
      const when = publishAt === undefined ? current.publishAt : publishAt ? validateNotice({ ...current, publishAt }).value.publishAt : null;
      if (current.status === "approved" && !can(actor, "announcement.publish") && current.createdBy !== actor.uid) fail("CONNECT_PERMISSION_DENIED", "You can't publish this notice.");
      const selfApproval = current.status === "draft" ? { approvedRevision: current.revision, approvedBy: actor.uid, approvedByName: actor.name, approvedAt: ctx.stamp() } : {};
      return { id, ...(await activate(ctx, tx, ref, { ...current, ...selfApproval }, { publishAt: when, extra: selfApproval })) };
    });
  },

  async approve(ctx, { id, revision }) {
    const { db, actor } = ctx;
    requireCap(actor, "announcement.approve", "You don't approve notices.");
    const ref = refOf(ctx, id);
    const result = await db.runTransaction(async (tx) => {
      const current = await readable(tx, ref);
      expectRevision(current, revision);
      if (current.status !== "pending_review") fail("CONNECT_INVALID_TRANSITION", "Only a notice waiting for approval can be approved.");
      const decision = reviewDecision({ roles: actor.roles, notice: current });
      if (!decision.allowed) fail("CONNECT_PERMISSION_DENIED", decision.reason);
      validated({ ...ctx, actor: { ...actor, caps: new Set([...actor.caps, "connect.circular.create"]) } }, current);
      const approval = { approvedRevision: current.revision, approvedBy: actor.uid, approvedByName: actor.name, approvedAt: ctx.stamp(), reviewedBy: actor.uid };
      const outcome = await activate(ctx, tx, ref, { ...current, ...approval, status: "approved" }, { extra: approval });
      tx.set(db.collection("auditLogs").doc(), auditEntry(ctx, "approved", id, { revision: current.revision, from: "pending_review", to: "approved" }));
      return { current, outcome };
    });
    const authorLink = await workspaceLink(db, result.current.createdBy, id);
    await notifyPeople(db, [result.current.createdBy], (uid) => ({ id: `approved_${id}_r${result.current.revision}_${uid}`, recipientUid: uid, sourceType: "review", sourceId: id, sourceRevision: result.current.revision, announcementId: id, purpose: "approved",
      category: "staff", priority: "P4", critical: false, title: `Approved: ${result.current.title}`, preview: result.outcome.status === "scheduled" ? "It will be published at the scheduled time." : "It is now published.",
      body: "", link: authorLink, actionRequired: false, readAt: null, archivedAt: null, expiresAt: null }), ctx.stamp);
    return { id, ...result.outcome };
  },

  async reject(ctx, { id, revision, reason }) {
    const { db, actor } = ctx;
    requireCap(actor, "announcement.review", "You don't review notices.");
    if (typeof reason !== "string" || !reason.trim() || reason.length > 500) fail("CONNECT_VALIDATION_FAILED", "Say briefly what needs changing.");
    const ref = refOf(ctx, id);
    const current = await db.runTransaction(async (tx) => {
      const notice = await readable(tx, ref);
      expectRevision(notice, revision);
      move(notice, "rejected");
      tx.update(ref, { status: "rejected", rejectedReason: reason.trim(), reviewedBy: actor.uid, reviewedAt: ctx.stamp(), updatedAt: ctx.stamp(), updatedBy: actor.uid });
      tx.set(db.collection("auditLogs").doc(), auditEntry(ctx, "rejected", id, { revision: notice.revision, from: notice.status, to: "rejected", reason: reason.trim() }));
      return notice;
    });
    const authorLink = await workspaceLink(db, current.createdBy, id);
    await notifyPeople(db, [current.createdBy], (uid) => ({ id: `returned_${id}_r${current.revision}_${uid}`, recipientUid: uid, sourceType: "review", sourceId: id, sourceRevision: current.revision, announcementId: id, purpose: "returned",
      category: "staff", priority: "P3", critical: false, title: `Changes requested: ${current.title}`, preview: reason.trim().slice(0, 160), body: reason.trim().slice(0, 160),
      link: authorLink, actionRequired: true, readAt: null, archivedAt: null, expiresAt: null }), ctx.stamp);
    return { id, status: "rejected" };
  },

  async cancel(ctx, { id, reason }) {
    const { db, actor } = ctx;
    if (typeof reason !== "string" || !reason.trim() || reason.length > 500) fail("CONNECT_VALIDATION_FAILED", "Give a short reason for withdrawing this notice.");
    const ref = refOf(ctx, id);
    return db.runTransaction(async (tx) => {
      const current = await readable(tx, ref);
      if (!(can(actor, "announcement.cancel") || (current.createdBy === actor.uid && can(actor, "announcement.publish.class")))) fail("CONNECT_PERMISSION_DENIED", "You can't withdraw this notice.");
      move(current, "cancelled");
      tx.update(ref, { status: "cancelled", cancelledAt: ctx.stamp(), cancelledBy: actor.uid, cancelledReason: reason.trim(), updatedAt: ctx.stamp(), updatedBy: actor.uid });
      tx.set(db.collection("auditLogs").doc(), auditEntry(ctx, "cancelled", id, { revision: current.revision, from: current.status, to: "cancelled", reason: reason.trim() }));
      return { id, status: "cancelled" };
    });
  },

  async archive(ctx, { id }) {
    const { db, actor } = ctx;
    const ref = refOf(ctx, id);
    return db.runTransaction(async (tx) => {
      const current = await readable(tx, ref);
      if (!(can(actor, "announcement.archive") || current.createdBy === actor.uid)) fail("CONNECT_PERMISSION_DENIED", "You can't archive this notice.");
      move(current, "archived");
      tx.update(ref, { status: "archived", archivedAt: ctx.stamp(), archivedBy: actor.uid, updatedAt: ctx.stamp(), updatedBy: actor.uid });
      tx.set(db.collection("auditLogs").doc(), auditEntry(ctx, "archived", id, { revision: current.revision, from: current.status, to: "archived" }));
      return { id, status: "archived" };
    });
  },

  // "I acknowledge" (Part 1 §9.2): idempotent, tied to the exact revision the person saw.
  async acknowledge(ctx, { id, revision }) {
    const { db, actor } = ctx;
    const ref = refOf(ctx, id);
    return db.runTransaction(async (tx) => {
      const current = await readable(tx, ref);
      if (!isLive(current, ctx.now) || !recipientEligible({ ...actor.scope, roles: actor.roles }, current)) fail("CONNECT_NOT_FOUND", "This notice is not available.");
      if (!current.requiresAcknowledgement) fail("CONNECT_VALIDATION_FAILED", "This notice doesn't ask for an acknowledgement.");
      expectRevision(current, revision);
      const ackRef = db.doc(`announcementAcknowledgements/${acknowledgementId(id, current.revision, actor.uid)}`);
      const existing = await tx.get(ackRef);
      if (existing.exists) return { id, revision: current.revision, acknowledgedAt: existing.data().acknowledgedAt, already: true };
      const at = ctx.stamp();
      tx.create(ackRef, { announcementId: id, announcementRevision: current.revision, reference: current.reference || null, title: current.title, recipientUid: actor.uid, recipientName: actor.name,
        audienceKeys: current.audienceKeys, acknowledgedAt: at, acknowledgementMethod: "hub_button", acknowledgementTextVersion: "srss-connect-ack-v1", createdAt: at });
      return { id, revision: current.revision, acknowledgedAt: new Date(ctx.now).toISOString(), already: false };
    });
  },

  // Estimated reach before publishing (Part 1 §5.3) — counts only, never names.
  async preview(ctx, { audienceKeys }) {
    requireCap(ctx.actor, "announcement.create");
    const keys = Array.isArray(audienceKeys) ? audienceKeys : [];
    const { valid, errors } = validateNotice({ title: "x", body: "x", audienceKeys: keys });
    if (!valid && errors.audienceKeys) fail("CONNECT_AUDIENCE_INVALID", errors.audienceKeys);
    const members = await audienceMembers(ctx.db, keys);
    const active = members.filter((user) => recipientEligible(user, { audienceKeys: keys }));
    const has = (user, list) => (user.roles || []).some((role) => list.includes(role));
    return {
      estimated: active.length, inactive: members.length - active.length,
      parents: active.filter((user) => has(user, ["parent"])).length, students: active.filter((user) => has(user, ["student"])).length,
      staff: active.filter((user) => (user.roles || []).some((role) => !["parent", "student"].includes(role))).length,
      childRecords: new Set(active.flatMap((user) => user.childIds || [])).size,
    };
  },

  // Delivery and acknowledgement summary (Part 1 §9.3, §21). Delivered, read, acknowledged and completed stay separate.
  async report(ctx, { id }) {
    const { db, actor } = ctx;
    const ref = refOf(ctx, id);
    const snap = await ref.get();
    if (!snap.exists) fail("CONNECT_NOT_FOUND", "This notice is not available.");
    const notice = snap.data();
    if (!canReport(actor.roles, notice, actor.uid)) fail("CONNECT_PERMISSION_DENIED", "You can't view this report.");
    const revision = deliveryRevision(notice);
    const [jobs, reads] = await Promise.all([
      db.collection("communicationDeliveryJobs").where("announcementId", "==", id).get(),
      db.collection("notificationRecords").where("announcementId", "==", id).where("sourceRevision", "==", revision).where("purpose", "==", "announcement").get(),
    ]);
    const records = reads.docs.map((doc) => doc.data());
    const result = {
      revision, status: notice.status,
      jobs: jobs.docs.map((doc) => ({ id: doc.id, ...pick(doc.data(), ["revision", "channel", "status", "targetSnapshotCount", "processedCount", "deliveredCount", "skippedCount", "failedCount", "attemptCount", "lastErrorCode"]), updatedAt: toMillis(doc.data().updatedAt) || null })).sort((a, b) => b.revision - a.revision),
      delivered: records.length, read: records.filter((record) => record.readAt).length,
    };
    if (notice.requiresAcknowledgement) {
      const { eligible, acknowledged, pending } = await pendingAcknowledgers(db, id, notice);
      const named = can(actor, "circular.report.view") || notice.createdBy === actor.uid;
      Object.assign(result, { eligible: eligible.length, acknowledged: acknowledged.length, pendingCount: pending.length,
        pending: named ? pending.slice(0, 500).map((user) => ({ uid: user.id, name: user.displayName || user.email || "Hub user", group: (user.roles || []).includes("parent") ? "Parent" : (user.roles || []).includes("student") ? "Student" : "Staff" })) : [] });
    }
    return result;
  },

  async remind(ctx, { id }) {
    const { db, actor } = ctx;
    const ref = refOf(ctx, id);
    const notice = (await ref.get()).data();
    if (!notice) fail("CONNECT_NOT_FOUND", "This notice is not available.");
    if (!(can(actor, "circular.remind") || (notice.createdBy === actor.uid && can(actor, "circular.remind.own")))) fail("CONNECT_PERMISSION_DENIED", "You can't send reminders for this notice.");
    if (!notice.requiresAcknowledgement || !isLive(notice, ctx.now)) fail("CONNECT_VALIDATION_FAILED", "Reminders are for live notices that ask for an acknowledgement.");
    const sent = await sendAcknowledgementReminders(db, id, notice, { now: ctx.now, stamp: ctx.stamp });
    await db.collection("auditLogs").add(auditEntry(ctx, "reminded", id, { revision: notice.revision, count: sent }));
    return { sent };
  },

  // Restart a stopped or failed delivery job; idempotent because notification ids are deterministic.
  async retry(ctx, { id }) {
    if (!(can(ctx.actor, "notification.delivery.retry") || can(ctx.actor, "announcement.publish"))) fail("CONNECT_PERMISSION_DENIED", "You can't retry deliveries.");
    const result = await ensureDelivery(ctx.db, refOf(ctx, id).id, { now: ctx.now, stamp: ctx.stamp, force: true });
    await ctx.db.collection("auditLogs").add(auditEntry(ctx, "deliveryRetried", id, { result: result.status }));
    return result;
  },
};
export const CONNECT_ACTIONS = Object.keys(ACTIONS);
// Re-exported for the trigger and tests.
export { categoryOf, hasCapability, teacherKeys };
