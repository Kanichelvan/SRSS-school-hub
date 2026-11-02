// Forms & Response Centre — the server side of the Forms, Submissions & Response Management System.
// Universal routing sequence (specification): submit → validate identity and permissions → write the
// authoritative record → generate a reference and the case → acknowledge the submitter → route to the
// PIC → notify → review / request information / approve / respond → close, keeping the audit history.
//
// `formCases` is the cross-module queue: one lightweight case per submission that points at the
// authoritative record (formSubmissions, or a domain collection such as applications or absenceReports).
// Restricted matters (complaints, grievances, safeguarding, incidents, financial assistance) live in
// `restrictedCases`, which only the case's own PIC, backup and escalation roles can read. Every write
// goes through these functions; clients never write cases.
import { FieldValue } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { createHash } from "node:crypto";
import { malaysiaDate } from "./announcement-service.js";
import {
  CATEGORIES, FORM, HANDLER_ROLES, OPEN_STATUSES, ROLE_LABELS, STATUSES, SUBMITTER_STATUS, canStart, closedDates, dueDateFor,
  escalationStep, isOpen, isWorkingDay, referenceFor, routeFor, validateAnswers,
} from "./forms-registry.js";

const SITE = process.env.PUBLIC_SITE_URL || "https://srssdigitalhub.web.app";
const now = () => FieldValue.serverTimestamp();
const OFFICE = ["schoolAdmin", "superAdmin", "leadership"];
const casesOf = (restricted) => (restricted ? "restrictedCases" : "formCases");

// ---------- Shared lookups ----------
let closureCache = { at: 0, closed: new Set() };
async function closures(db) {
  if (Date.now() - closureCache.at < 10 * 60 * 1000) return closureCache.closed;
  const events = await db.collection("events").where("schoolClosed", "==", true).get();
  closureCache = { at: Date.now(), closed: closedDates(events.docs.map((doc) => doc.data())) };
  return closureCache.closed;
}
const routingRules = async (db) => (await db.doc("settings/formsRouting").get()).data() || {};
async function holders(db, role) {
  if (!role) return [];
  const users = await db.collection("users").where("roles", "array-contains", role).get();
  return users.docs.filter((doc) => doc.data().status !== "disabled").map((doc) => ({ uid: doc.id, email: doc.data().email || null, name: doc.data().displayName || doc.data().email || "" }));
}
async function nextReference(db, form, year) {
  const ref = db.doc(`formCounters/${CATEGORIES[form.category].code}-${year}`);
  const sequence = await db.runTransaction(async (tx) => {
    const value = ((await tx.get(ref)).data()?.value || 0) + 1;
    tx.set(ref, { value, updatedAt: now() });
    return value;
  });
  return referenceFor(form, year, sequence);
}
const caseLink = (caseId, restricted) => `/hub/admin/forms/case/${caseId}${restricted ? "?restricted=1" : ""}`;
const requestLink = (caseId, restricted) => `/hub/requests/${caseId}${restricted ? "?restricted=1" : ""}`;

// In-app notifications and the email outbox. `mail` uses the Firebase "Trigger Email" extension's document
// format; emails never carry confidential details (specification: "Notifications").
function notify(db, batch, recipients, notice) {
  for (const uid of new Set(recipients.filter(Boolean))) batch.set(db.collection("notificationRecords").doc(), { recipientUid: uid, category: "forms", critical: Boolean(notice.critical), title: notice.title, body: notice.body || "", link: notice.link || null, createdAt: now(), readAt: null });
}
function mail(db, batch, to, subject, text, meta = {}) {
  const addresses = [...new Set([to].flat().filter(Boolean))];
  if (!addresses.length) return;
  batch.set(db.collection("mail").doc(), { to: addresses, message: { subject, text: `${text}\n\nSekolah Rendah Sathya Sai\n6, Jalan Puchong, Taman Tan Yew Lai, 58200 Kuala Lumpur · +60 12-600 1926` }, ...meta, createdAt: now() });
}

// ---------- Opening a case ----------
// `source` is the authoritative record ({ collection, id, link }). The case id is deterministic for records
// that come from another module, so a repeated trigger never opens a second case.
export async function openCase(db, { form, caseId, source, submitter, studentId = null, answers = null, summary = "", priority = "normal", status, extra = {} }) {
  const restricted = form.restricted;
  const ref = db.collection(casesOf(restricted)).doc(caseId);
  if ((await ref.get()).exists) return { caseId, existing: true };
  if (submitter.uid && !submitter.name) { const profile = (await db.doc(`users/${submitter.uid}`).get()).data() || {}; submitter = { ...submitter, name: profile.displayName || profile.email || null, email: submitter.email || profile.email || null }; }
  const today = malaysiaDate();
  const [rules, closed] = await Promise.all([routingRules(db), closures(db)]);
  const route = routeFor(form, answers || {}, rules);
  const reference = await nextReference(db, form, today.slice(0, 4));
  let student = null;
  if (studentId) { const snap = await db.doc(`students/${studentId}`).get(); student = snap.exists ? snap.data() : null; }
  const recorded = ["confirmation", "exception"].includes(form.notify);
  const initial = status || (recorded ? "completed" : "new");
  const record = {
    reference, formId: form.id, formTitle: form.title, category: form.category, classification: form.classification, level: form.level, restricted,
    status: initial, priority, ...route, assignedToUid: null, assignedToName: null,
    submitterUid: submitter.uid || null, submitterName: submitter.name || null, submitterEmail: submitter.email || null,
    studentId: studentId || null, studentName: student ? student.preferredName || student.name || null : null, classId: student?.currentClassId || null,
    summary: String(summary || "").slice(0, 140), source: source || null,
    submittedOn: today, submittedAt: now(), dueAt: recorded ? null : dueDateFor(form, today, closed), reminders: {}, overdue: false,
    firstResponseAt: null, completedOn: recorded ? today : null, closedAt: null,
    lastAction: recorded ? "Recorded" : "Submission received", lastActionAt: now(), externalUpdatedAt: now(), updatedAt: now(),
    ...(restricted && answers ? { answers } : {}), ...extra,
  };
  const batch = db.batch();
  batch.set(ref, record);
  batch.set(ref.collection("activity").doc(), { kind: "submitted", visibility: "external", body: recorded ? "Recorded." : `Received. Reference ${reference}.`, toStatus: initial, actorUid: submitter.uid || null, actorName: submitter.name || "Submitter", channel: "hub", at: now() });

  // Acknowledge the submitter: in the hub for people with an account, by email for everyone else.
  if (submitter.uid) notify(db, batch, [submitter.uid], { title: recorded ? `${form.title}: recorded` : `We've received your ${form.title.toLowerCase()}`, body: `Reference ${reference}. You can follow it in My requests & forms.`, link: requestLink(caseId, restricted) });
  if (!recorded && submitter.email && !submitter.uid) {
    mail(db, batch, submitter.email, `We've received your message — ${reference}`, restricted
      ? `Thank you for contacting Sekolah Rendah Sathya Sai.\n\nWe have received your submission. Your reference number is ${reference}. The responsible person will contact you.`
      : `Dear ${submitter.name || "Parent / Guardian"},\n\nThank you for contacting Sekolah Rendah Sathya Sai. We have successfully received your ${form.title.toLowerCase()}.\n\nYour reference number: ${reference}\n\nThe right person at school will review it and contact you as soon as possible.\n\nWarm regards,\nSchool Administration`, { caseId, kind: "acknowledgement" });
  }
  // Route to the PIC. Consent and operational records only reach the PIC when something needs attention.
  if (!recorded) {
    const pics = await holders(db, route.picRole);
    notify(db, batch, pics.map((user) => user.uid), { critical: form.level === 3, title: restricted ? `Restricted case ${reference} needs your attention` : `New ${form.title} (${reference})`, body: restricted ? "Open the Forms & Response Centre › Restricted to view it." : `Response due ${record.dueAt || "by the operational date"}.`, link: caseLink(caseId, restricted) });
    if (form.level >= 2) mail(db, batch, pics.map((user) => user.email), restricted ? "SRSS Digital Hub: a restricted case needs your attention" : "SRSS Digital Hub: a submission is waiting for you", `Reference ${reference}.\n\nSign in to the Forms & Response Centre to view it:\n${SITE}${caseLink(caseId, restricted)}`, { caseId, kind: "picAlert" });
  }
  batch.set(db.collection("auditLogs").doc(), { type: "forms.caseOpened", caseId, reference, formId: form.id, restricted, sourceCollection: source?.collection || null, actorUid: submitter.uid || null, at: now() });
  await batch.commit();
  return { caseId, reference, status: initial, restricted };
}

// ---------- submitForm: every form that runs in the hub or on the public website ----------
const rateKey = (ip) => createHash("sha256").update(`forms:${ip}`).digest("hex").slice(0, 32);
export async function submitForm(db, request) {
  const { formId, answers = {} } = request.data || {};
  const form = FORM[formId];
  if (!form || !["form", "public"].includes(form.availability)) throw new HttpsError("invalid-argument", "This form isn't available online.");
  const token = request.auth?.token;
  const roles = token?.roles || [];
  if (form.audience !== "public" && !request.auth) throw new HttpsError("unauthenticated", "Sign in to the hub to send this form.");
  if (!canStart(form, roles)) throw new HttpsError("permission-denied", "This form isn't available to your account.");
  if (answers.website) throw new HttpsError("invalid-argument", "We couldn't send that."); // spam trap: a hidden field people never fill in
  if (!request.auth) {
    // Public forms: at most 10 submissions an hour from one address.
    const hour = new Date().toISOString().slice(0, 13);
    const limit = db.doc(`formRateLimits/${rateKey(request.rawRequest?.ip || "unknown")}`);
    const used = await db.runTransaction(async (tx) => { const data = (await tx.get(limit)).data(); const count = data?.hour === hour ? data.count + 1 : 1; tx.set(limit, { hour, count }); return count; });
    if (used > 10) throw new HttpsError("resource-exhausted", "Too many submissions from this connection. Please try again later or email the school office.");
  }
  const { values, errors, ok } = validateAnswers(form, answers);
  if (!ok) throw new HttpsError("invalid-argument", "Please check the highlighted answers.", { errors });

  // A parent may only submit about a child linked to them (the scope the server derives from guardian links).
  const profile = request.auth ? (await db.doc(`users/${request.auth.uid}`).get()).data() || {} : {};
  if (values.studentId && !(profile.childIds || []).includes(values.studentId)) throw new HttpsError("permission-denied", "You can only send forms about your own children.");
  const submitter = request.auth
    ? { uid: request.auth.uid, name: profile.displayName || token.name || token.email || "", email: token.email || null }
    : { uid: null, name: values.name, email: values.email };

  const caseId = db.collection("formCases").doc().id;
  const priority = values.urgency === "Urgent" || /safety risk/.test(values.urgency || "") || (values.immediateRisk && values.immediateRisk !== "No") || form.notify === "restricted" ? "high" : "normal";
  const { studentId = null, ...rest } = values;
  const summary = values.summary || values.topic || values.request || values.system || values.document || values.leaveType || values.item || values.headline || values.page || "";
  let source = null;
  const batch = db.batch();
  if (form.writesTo === "formSubmissions") {
    source = { collection: "formSubmissions", id: caseId, link: null };
    batch.set(db.doc(`formSubmissions/${caseId}`), { formId: form.id, formTitle: form.title, version: 1, answers: rest, studentId, status: "submitted", caseId, submittedByUid: submitter.uid, submitterName: submitter.name || null, submitterEmail: submitter.email || null, createdAt: now(), submittedAt: now(), updatedAt: now(), updatedBy: submitter.uid });
  } else if (form.writesTo === "admissionEnquiries") {
    source = { collection: "admissionEnquiries", id: caseId, link: "/hub/admin/admissions" };
    batch.set(db.doc(`admissionEnquiries/${caseId}`), { parentName: values.name, email: values.email, phone: values.phone || null, childName: values.childName || null, enteringStandard: values.enteringStandard, message: [`School visit request: ${values.preferredDate}, ${values.preferredTime}.`, values.message].filter(Boolean).join("\n\n"), source: "visitRequest", status: "new", consentToContact: true, caseId, createdAt: now() });
  } else if (form.writesTo === "staffLeave") {
    source = { collection: "staffLeave", id: caseId, link: null };
    batch.set(db.doc(`staffLeave/${caseId}`), { staffUid: submitter.uid, staffName: submitter.name || null, type: values.leaveType, from: values.from, to: values.to, reason: values.reason || null, cover: values.cover || null, status: "requested", caseId, createdAt: now(), updatedAt: now(), updatedBy: submitter.uid });
  }
  if (source) await batch.commit();
  return openCase(db, { form, caseId, source, submitter, studentId, answers: form.restricted ? rest : null, summary, priority });
}

// ---------- Cases opened from other modules ----------
// Records created on the website or in another hub screen get a case automatically; later status changes
// in that module are mirrored onto the case so the Forms & Response Centre never disagrees with it.
export const SOURCE_SYNC = {
  contactMessages: { handled: ["completed", "Marked handled in the website inbox"] },
  admissionEnquiries: { contacted: ["inProgress", "Family contacted"], visitBooked: ["approved", "Visit booked"], applied: ["completed", "Application started"], closed: ["closed", "Enquiry closed"] },
  applications: { documentsPending: ["awaitingInformation", "Documents requested"], underReview: ["inProgress", "Application under review"], offer: ["awaitingApproval", "Offer sent to the family"], accepted: ["approved", "Offer accepted"], enrolled: ["closed", "Pupil enrolled"], declined: ["rejected", "Application not successful"], withdrawn: ["cancelled", "Application withdrawn"] },
  absenceReports: { acknowledged: ["completed", "Absence report acknowledged by the school"] },
  registrations: { confirmed: ["approved", "Registration confirmed"], waitlisted: ["inProgress", "On the waiting list"], cancelled: ["cancelled", "Registration cancelled"] },
};
export async function syncSourceStatus(db, collection, id, status) {
  const step = SOURCE_SYNC[collection]?.[status];
  if (!step) return;
  for (const restricted of [false, true]) {
    const ref = db.doc(`${casesOf(restricted)}/${collection}_${id}`);
    const snap = await ref.get();
    if (!snap.exists || snap.data().status === step[0]) continue;
    const terminal = !isOpen(step[0]);
    const batch = db.batch();
    batch.update(ref, { status: step[0], lastAction: step[1], lastActionAt: now(), externalUpdatedAt: now(), updatedAt: now(), ...(terminal ? { completedOn: snap.data().completedOn || malaysiaDate() } : {}) });
    batch.set(ref.collection("activity").doc(), { kind: "sourceUpdate", visibility: "external", body: step[1], fromStatus: snap.data().status, toStatus: step[0], actorUid: null, actorName: "SRSS Digital Hub", channel: "hub", at: now() });
    await batch.commit();
  }
}

// ---------- caseAction: everything the PIC (and the submitter) does on a case ----------
const DECISIONS = { approved: "Approved", rejected: "Not approved", completed: "Completed", closed: "Closed", cancelled: "Cancelled", inProgress: "In progress", awaitingApproval: "Awaiting approval" };
export async function caseAction(db, request) {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in first.");
  const { caseId, restricted = false, action, body = "", assignToUid, status, channel } = request.data || {};
  const ref = db.doc(`${casesOf(restricted)}/${String(caseId || "")}`);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "This case doesn't exist.");
  const item = snap.data();
  const form = FORM[item.formId];
  const uid = request.auth.uid;
  const roles = request.auth.token?.roles || [];
  const handler = [item.picRole, item.backupRole, item.escalationRole].some((role) => roles.includes(role)) || item.assignedToUid === uid || (!item.restricted && roles.some((role) => OFFICE.includes(role)));
  const submitter = item.submitterUid && item.submitterUid === uid;
  const text = String(body || "").trim().slice(0, 5000);
  const actor = (await db.doc(`users/${uid}`).get()).data() || {};
  const actorName = actor.displayName || request.auth.token?.email || "";
  const update = { updatedAt: now(), lastActionAt: now() };
  const entries = [];
  const batch = db.batch();
  const tellSubmitter = (title, detail) => {
    if (item.submitterUid) notify(db, batch, [item.submitterUid], { title: `${title} — ${item.reference}`, body: item.restricted ? "Open My requests & forms to see it." : detail, link: requestLink(snap.id, item.restricted) });
    else if (item.submitterEmail) mail(db, batch, item.submitterEmail, `${title} — ${item.reference}`, item.restricted ? `There is an update on your submission ${item.reference}. Please contact the school office.` : `Dear ${item.submitterName || "Parent / Guardian"},\n\n${detail}\n\nReference: ${item.reference}`, { caseId: snap.id, kind: "response" });
  };
  const needText = () => { if (!text) throw new HttpsError("invalid-argument", "Write the message first."); };
  const needHandler = () => { if (!handler) throw new HttpsError("permission-denied", "Only the person in charge of this case can do that."); };

  switch (action) {
    case "take":
      needHandler();
      Object.assign(update, { assignedToUid: uid, assignedToName: actorName, ...(item.status === "new" ? { status: "assigned" } : {}), lastAction: `Assigned to ${actorName}` });
      entries.push({ kind: "assigned", visibility: "internal", body: `Assigned to ${actorName}.` });
      break;
    case "assign": {
      needHandler();
      const target = (await db.doc(`users/${String(assignToUid || "")}`).get()).data();
      if (!target || ![item.picRole, item.backupRole, item.escalationRole].some((role) => (target.roles || []).includes(role))) throw new HttpsError("invalid-argument", `Choose someone who holds the ${ROLE_LABELS[item.picRole] || item.picRole} or backup role.`);
      const name = target.displayName || target.email || "";
      Object.assign(update, { assignedToUid: assignToUid, assignedToName: name, ...(item.status === "new" ? { status: "assigned" } : {}), lastAction: `Assigned to ${name}` });
      entries.push({ kind: "assigned", visibility: "internal", body: `Assigned to ${name} by ${actorName}.` });
      notify(db, batch, [assignToUid], { title: `${item.reference} has been assigned to you`, body: item.restricted ? "A restricted case." : item.formTitle, link: caseLink(snap.id, item.restricted) });
      break;
    }
    case "reply":
    case "requestInfo":
      needHandler(); needText();
      Object.assign(update, { status: action === "requestInfo" ? "awaitingInformation" : ["new", "assigned"].includes(item.status) ? "inProgress" : item.status, lastAction: action === "requestInfo" ? "More information requested" : "Reply sent", externalUpdatedAt: now(), firstResponseAt: item.firstResponseAt || now() });
      entries.push({ kind: action === "requestInfo" ? "request" : "reply", visibility: "external", body: text, channel: item.submitterUid ? "hub" : "email" });
      tellSubmitter(action === "requestInfo" ? "The school needs more information" : "A reply from the school", text);
      break;
    case "note":
      needHandler(); needText();
      entries.push({ kind: "note", visibility: "internal", body: text });
      update.lastAction = "Internal note added";
      break;
    case "call":
    case "meeting":
      needHandler(); needText();
      entries.push({ kind: action, visibility: "internal", body: text, channel: action === "call" ? "phone" : "inPerson" });
      Object.assign(update, { lastAction: action === "call" ? "Phone call recorded" : "Discussion recorded", firstResponseAt: item.firstResponseAt || now(), ...(["new", "assigned"].includes(item.status) ? { status: "inProgress" } : {}) });
      break;
    case "status": {
      needHandler();
      if (!DECISIONS[status]) throw new HttpsError("invalid-argument", "Choose a valid status.");
      const reopening = !isOpen(item.status) && isOpen(status);
      if (!reopening && !isOpen(item.status)) throw new HttpsError("failed-precondition", "This case is already finished. Reopen it first.");
      if (["approved", "rejected"].includes(status) && form?.reply !== "decision" && form?.type !== "update") throw new HttpsError("failed-precondition", "This form doesn't need an approval decision; mark it completed instead.");
      Object.assign(update, { status, lastAction: reopening ? "Reopened" : DECISIONS[status], externalUpdatedAt: now(), ...(isOpen(status) ? { completedOn: null, closedAt: null } : { completedOn: item.completedOn || malaysiaDate(), ...(status === "closed" ? { closedAt: now() } : {}) }) });
      entries.push({ kind: reopening ? "reopened" : "status", visibility: "external", body: text || (reopening ? "Reopened." : `${DECISIONS[status]}.`), fromStatus: item.status, toStatus: status });
      if (["approved", "rejected", "completed"].includes(status)) tellSubmitter(`${item.formTitle}: ${SUBMITTER_STATUS[status].toLowerCase()}`, text || `Your ${item.formTitle.toLowerCase()} is ${SUBMITTER_STATUS[status].toLowerCase()}.`);
      await applyOutcome(db, batch, item, status, uid);
      break;
    }
    case "submitterReply":
      if (!submitter) throw new HttpsError("permission-denied", "Only the person who sent this can reply here.");
      if (!isOpen(item.status)) throw new HttpsError("failed-precondition", "This request is finished. Send a new one if you need more help.");
      needText();
      Object.assign(update, { status: item.status === "awaitingInformation" ? "inProgress" : item.status, lastAction: "Reply from the submitter", externalUpdatedAt: now(), ...(item.status === "awaitingInformation" ? { dueAt: dueDateFor(form, malaysiaDate(), await closures(db)), reminders: {}, overdue: false } : {}) });
      entries.push({ kind: "submitterReply", visibility: "external", body: text, channel: "hub" });
      notify(db, batch, item.assignedToUid ? [item.assignedToUid] : (await holders(db, item.picRole)).map((user) => user.uid), { title: `Reply on ${item.reference}`, body: item.restricted ? "A restricted case." : item.formTitle, link: caseLink(snap.id, item.restricted) });
      break;
    case "withdraw":
      if (!submitter) throw new HttpsError("permission-denied", "Only the person who sent this can withdraw it.");
      if (!isOpen(item.status)) throw new HttpsError("failed-precondition", "This request is already finished.");
      Object.assign(update, { status: "cancelled", lastAction: "Withdrawn by the submitter", externalUpdatedAt: now(), completedOn: malaysiaDate() });
      entries.push({ kind: "status", visibility: "external", body: text || "Withdrawn by the submitter.", fromStatus: item.status, toStatus: "cancelled" });
      if (item.source?.collection === "staffLeave") batch.update(db.doc(`staffLeave/${item.source.id}`), { status: "cancelled", updatedAt: now(), updatedBy: uid });
      break;
    default:
      throw new HttpsError("invalid-argument", "Unknown action.");
  }
  batch.update(ref, update);
  for (const entry of entries) batch.set(ref.collection("activity").doc(), { ...entry, fromStatus: entry.fromStatus || item.status, toStatus: update.status || item.status, actorUid: uid, actorName: actorName || (submitter ? item.submitterName : ""), channel: entry.channel || "hub", at: now() });
  if (["take", "assign", "status", "withdraw"].includes(action)) batch.set(db.collection("auditLogs").doc(), { type: `forms.${action}`, caseId: snap.id, reference: item.reference, restricted: item.restricted, fromStatus: item.status, toStatus: update.status || item.status, actorUid: uid, at: now() });
  await batch.commit();
  return { status: update.status || item.status };
}

// An approved change request updates the source record in the same batch, with an audit entry
// (specification: "Approval of a change request must update the source record transactionally").
async function applyOutcome(db, batch, item, status, uid) {
  const form = FORM[item.formId];
  const stamp = { updatedAt: now(), updatedBy: uid };
  if (item.source?.collection === "staffLeave" && ["approved", "rejected", "cancelled"].includes(status)) batch.update(db.doc(`staffLeave/${item.source.id}`), { status, decidedBy: uid, decidedAt: now(), ...stamp });
  if (item.source?.collection === "contactMessages" && ["completed", "closed"].includes(status)) batch.update(db.doc(`contactMessages/${item.source.id}`), { status: "handled", handledBy: uid, handledAt: now() });
  if (item.source?.collection === "absenceReports" && status === "completed") batch.update(db.doc(`absenceReports/${item.source.id}`), { status: "acknowledged", ...stamp });
  if (form?.apply === "guardianContact" && status === "approved") {
    const answers = (await db.doc(`formSubmissions/${item.source.id}`).get()).data()?.answers || {};
    const guardianId = (await db.doc(`users/${item.submitterUid}`).get()).data()?.guardianId;
    if (!guardianId) throw new HttpsError("failed-precondition", "This account isn't linked to a guardian record yet. Link it in Admin › Parents & guardians, then approve again.");
    const change = Object.fromEntries([["phone", answers.phone], ["address", answers.address]].filter(([, value]) => value));
    batch.update(db.doc(`guardians/${guardianId}`), { ...change, ...stamp });
    batch.set(db.collection("auditLogs").doc(), { type: "forms.recordUpdated", collection: "guardians", docId: guardianId, fields: Object.keys(change), reference: item.reference, actorUid: uid, at: now() });
  }
}

// ---------- Daily run: reminders, escalation and the daily action summary ----------
export async function runFormsSchedule(db, today = malaysiaDate()) {
  const closed = await closures(db);
  if (!isWorkingDay(today, closed)) return { skipped: "not a working day" };
  const yesterday = new Date(`${today}T00:00:00Z`); yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayIso = yesterday.toISOString().slice(0, 10);
  const lists = await Promise.all([false, true].map(async (restricted) => {
    const [open, done] = await Promise.all([db.collection(casesOf(restricted)).where("status", "in", OPEN_STATUSES).get(), db.collection(casesOf(restricted)).where("completedOn", ">=", yesterdayIso).get()]);
    return { restricted, open: open.docs, done: done.docs };
  }));
  const holderCache = {};
  const roleHolders = async (role) => (holderCache[role] ||= await holders(db, role));
  let reminders = 0;
  for (const { restricted, open } of lists) {
    for (const doc of open) {
      const item = doc.data();
      const step = escalationStep(item, today, closed);
      if (!step) continue;
      const recipients = step === "overdue" ? (item.assignedToUid ? [{ uid: item.assignedToUid }] : await roleHolders(item.picRole)) : await roleHolders(step === "backup" ? item.backupRole : item.escalationRole);
      const batch = db.batch();
      const title = step === "overdue" ? `${item.reference} ${item.dueAt === today ? "is due today" : "is overdue"}` : step === "backup" ? `${item.reference} is overdue — please cover it` : `${item.reference} is three working days overdue`;
      notify(db, batch, recipients.map((user) => user.uid), { critical: step !== "overdue" || item.level === 3, title, body: restricted ? "A restricted case." : `${item.formTitle}. Response was due ${item.dueAt}.`, link: caseLink(doc.id, restricted) });
      if (item.level >= 2) mail(db, batch, recipients.map((user) => user.email), "SRSS Digital Hub: an overdue case needs attention", `Reference ${item.reference} was due ${item.dueAt}.\n\n${SITE}${caseLink(doc.id, restricted)}`, { caseId: doc.id, kind: step });
      batch.update(doc.ref, { [`reminders.${step}`]: true, "reminders.on": today, overdue: true, updatedAt: now() });
      batch.set(doc.ref.collection("activity").doc(), { kind: step === "escalated" ? "escalated" : "reminder", visibility: "internal", body: step === "overdue" ? "Overdue reminder sent to the person in charge." : step === "backup" ? `Escalated to the backup (${ROLE_LABELS[item.backupRole] || item.backupRole}).` : `Escalated to ${ROLE_LABELS[item.escalationRole] || item.escalationRole}.`, actorUid: null, actorName: "SRSS Digital Hub", channel: "hub", at: now() });
      await batch.commit();
      reminders++;
    }
  }
  // Daily action summary for each person who holds a queue (only counts they are allowed to see).
  const people = new Map();
  for (const role of HANDLER_ROLES) for (const user of await roleHolders(role)) people.set(user.uid, { ...user, roles: [...(people.get(user.uid)?.roles || []), role] });
  const summaries = db.batch();
  let digests = 0;
  for (const person of people.values()) {
    const mine = (doc) => { const item = doc.data(); return item.assignedToUid === person.uid || [item.picRole, item.backupRole].some((role) => person.roles.includes(role)); };
    const counts = { new: 0, awaitingResponse: 0, awaitingApproval: 0, overdue: 0, completedYesterday: 0, restricted: 0 };
    for (const { restricted, open, done } of lists) {
      for (const doc of open.filter(mine)) {
        const item = doc.data();
        if (restricted) { counts.restricted++; continue; }
        if (item.status === "new") counts.new++;
        if (["new", "assigned", "inProgress"].includes(item.status) && !item.firstResponseAt) counts.awaitingResponse++;
        if (item.status === "awaitingApproval") counts.awaitingApproval++;
        if (item.overdue || (item.dueAt && item.dueAt < today && item.status !== "awaitingInformation")) counts.overdue++;
      }
      if (!restricted) counts.completedYesterday += done.filter((d) => mine(d) && d.data().completedOn === yesterdayIso).length;
    }
    if (!counts.new && !counts.awaitingResponse && !counts.awaitingApproval && !counts.overdue && !counts.restricted) continue;
    const parts = [`New ${counts.new}`, `Awaiting response ${counts.awaitingResponse}`, `Awaiting approval ${counts.awaitingApproval}`, `Overdue ${counts.overdue}`, `Completed yesterday ${counts.completedYesterday}`, ...(counts.restricted ? [`Restricted ${counts.restricted}`] : [])];
    summaries.set(db.doc(`notificationRecords/formsDigest_${today}_${person.uid}`), { recipientUid: person.uid, category: "forms", critical: counts.overdue > 0, title: "SRSS Digital Hub — daily action summary", body: parts.join(" · "), link: "/hub/admin/forms", createdAt: now(), readAt: null });
    digests++;
  }
  if (digests) await summaries.commit();
  return { reminders, digests, statuses: Object.keys(STATUSES).length };
}
