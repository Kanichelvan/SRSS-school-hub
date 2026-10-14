import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { onDocumentUpdated, onDocumentWritten, onDocumentWrittenWithAuthContext, onDocumentCreated } from "firebase-functions/v2/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { OFFICE_ASSIGNABLE_ROLES, ROLE_IDS } from "./roles.js";
import { recomputeAllScopes, recomputeConsentStatus, recomputeUserScope, refreshCurrentClass, refreshGuardianClasses } from "./scope.js";
import { handleQuest } from "./quest-service.js";
import { QuestError } from "./quest-engine.js";

initializeApp();
setGlobalOptions({ region: "asia-southeast1", maxInstances: 5 });
const db = getFirestore();
const audit = (entry) => db.collection("auditLogs").add({ ...entry, at: FieldValue.serverTimestamp() });
const uids = (...values) => [...new Set(values.flat().filter(Boolean))];

// Shared campaign engine; every action derives its identity and SIS scope on the server.
export const engagement = onCall(async (request) => {
  try { return await handleQuest(db, request); }
  catch (error) { if (error instanceof QuestError) throw new HttpsError(error.code, error.message); throw error; }
});

// ---------- Roles and accounts (AUTH-001) ----------
// A Super Administrator (the `superAdmin` role, or the legacy `accessAdmin` claim from the bootstrap
// script) may grant any role. The school office (schoolAdmin) may grant or remove only family and
// teacher roles, and can never change an elevated role. Nobody changes their own roles.
const isSuper = (token) => token?.accessAdmin === true || (token?.roles || []).includes("superAdmin");
const PERSON_TYPES = { guardian: "guardians", student: "students", staff: "staff" };

function checkRoleChange(request, targetUid, before, after) {
  const token = request.auth?.token;
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in first.");
  if (!Array.isArray(after) || after.some((role) => !ROLE_IDS.includes(role))) throw new HttpsError("invalid-argument", `Roles must be drawn from: ${ROLE_IDS.join(", ")}.`);
  if (targetUid === request.auth.uid && !isSuper(token)) throw new HttpsError("permission-denied", "You can't change your own roles. Ask a Super Administrator.");
  if (targetUid === request.auth.uid && before.includes("superAdmin") && !after.includes("superAdmin")) throw new HttpsError("failed-precondition", "A Super Administrator can't remove their own Super Administrator role; ask the other one.");
  if (isSuper(token)) return;
  if (!(token?.roles || []).includes("schoolAdmin")) throw new HttpsError("permission-denied", "Only the school office or a Super Administrator can change roles.");
  const elevated = (roles) => roles.filter((role) => !OFFICE_ASSIGNABLE_ROLES.includes(role)).sort().join(",");
  if (elevated(before) !== elevated(after)) throw new HttpsError("permission-denied", "Only a Super Administrator can grant or remove staff and administrator roles.");
}

async function applyRoles(target, roles, request, reason) {
  const before = target.customClaims?.roles || [];
  // The legacy claim follows the role; a bootstrap-granted claim stays until a Super Administrator removes the role.
  const accessAdmin = roles.includes("superAdmin") || (target.customClaims?.accessAdmin === true && !before.includes("superAdmin"));
  const claims = { ...target.customClaims, roles };
  if (accessAdmin) claims.accessAdmin = true; else delete claims.accessAdmin;
  await getAuth().setCustomUserClaims(target.uid, claims);
  await db.doc(`users/${target.uid}`).set({ email: target.email, displayName: target.displayName || null, status: target.disabled ? "disabled" : "active", roles }, { merge: true });
  await recomputeUserScope(db, target.uid, roles);
  await db.collection("userRoles").add({ uid: target.uid, before, after: roles, reason, actorUid: request.auth.uid, at: FieldValue.serverTimestamp() });
  await audit({ type: "roles.changed", targetUid: target.uid, before, after: roles, reason, actorUid: request.auth.uid });
}

export const setUserRoles = onCall(async (request) => {
  const { uid, email, roles = [], reason = "" } = request.data || {};
  if (!String(reason).trim()) throw new HttpsError("invalid-argument", "Record a reason for the access change.");
  const target = uid ? await getAuth().getUser(uid) : await getAuth().getUserByEmail(String(email || ""));
  const after = [...new Set(roles)];
  checkRoleChange(request, target.uid, target.customClaims?.roles || [], after);
  await applyRoles(target, after, request, String(reason).trim());
  return { uid: target.uid, roles: after };
});

// Creates (or reuses) a sign-in account, gives it roles and links it to the person record, in one step.
// No password is set: the person signs in with Google or a one-time email link at /login.
export const provisionAccount = onCall(async (request) => {
  const { email, displayName = "", roles = [], personType, personId, reason = "" } = request.data || {};
  const address = String(email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address)) throw new HttpsError("invalid-argument", "Enter a valid email address.");
  if (!roles.length) throw new HttpsError("invalid-argument", "Choose at least one role.");
  const collection = PERSON_TYPES[personType];
  if (personType && !collection) throw new HttpsError("invalid-argument", "Unknown person type.");
  const personRef = collection ? db.doc(`${collection}/${personId}`) : null;
  const person = personRef ? await personRef.get() : null;
  if (personRef && !person.exists) throw new HttpsError("not-found", "That person record no longer exists.");

  const auth = getAuth();
  let target;
  try { target = await auth.getUserByEmail(address); }
  catch { target = await auth.createUser({ email: address, displayName: String(displayName).trim() || person?.data()?.name || undefined, emailVerified: false }); }
  if (person?.data()?.uid && person.data().uid !== target.uid) throw new HttpsError("already-exists", "This person is already linked to a different account.");
  const after = [...new Set([...(target.customClaims?.roles || []), ...roles])];
  checkRoleChange(request, target.uid, target.customClaims?.roles || [], after);
  if (personRef) {
    const other = await db.collection(collection).where("uid", "==", target.uid).limit(1).get();
    if (!other.empty && other.docs[0].id !== personId) throw new HttpsError("already-exists", `${address} is already linked to another ${personType} record.`);
    await personRef.set({ uid: target.uid, email: person.data().email || address, updatedAt: FieldValue.serverTimestamp(), updatedBy: request.auth.uid }, { merge: true });
    // Copy the account onto the guardian's links now, so the parent sees their children on first sign-in.
    if (personType === "guardian") {
      const links = await db.collection("studentGuardianLinks").where("guardianId", "==", personId).get();
      await Promise.all(links.docs.map((link) => link.ref.set({ guardianUid: target.uid }, { merge: true })));
    }
  }
  await db.doc(`users/${target.uid}`).set({ personType: personType || null, personId: personId || null, createdAt: FieldValue.serverTimestamp(), createdBy: request.auth.uid }, { merge: true });
  await applyRoles(target, after, request, String(reason).trim() || "Account created");
  return { uid: target.uid, email: address, roles: after };
});

// Disable or re-enable an account. Disabling signs the person out everywhere; records stay.
export const setAccountStatus = onCall(async (request) => {
  const { uid, disabled, reason = "" } = request.data || {};
  if (!String(reason).trim()) throw new HttpsError("invalid-argument", "Record a reason.");
  if (uid === request.auth?.uid) throw new HttpsError("failed-precondition", "You can't disable your own account.");
  const target = await getAuth().getUser(String(uid || ""));
  const roles = target.customClaims?.roles || [];
  if (!isSuper(request.auth?.token)) {
    if (!(request.auth?.token?.roles || []).includes("schoolAdmin")) throw new HttpsError("permission-denied", "Only the school office or a Super Administrator can do this.");
    if (roles.some((role) => !OFFICE_ASSIGNABLE_ROLES.includes(role))) throw new HttpsError("permission-denied", "Only a Super Administrator can disable staff or administrator accounts.");
  }
  await getAuth().updateUser(target.uid, { disabled: Boolean(disabled) });
  if (disabled) await getAuth().revokeRefreshTokens(target.uid);
  await db.doc(`users/${target.uid}`).set({ status: disabled ? "disabled" : "active", statusReason: String(reason).trim(), statusChangedAt: FieldValue.serverTimestamp(), statusChangedBy: request.auth.uid }, { merge: true });
  await audit({ type: disabled ? "account.disabled" : "account.enabled", targetUid: target.uid, reason: String(reason).trim(), actorUid: request.auth.uid });
  return { uid: target.uid, disabled: Boolean(disabled) };
});

// ---------- Access scope (AUTH-002) ----------
// Recompute affected users whenever a relationship that grants access changes.
export const scopeOnGuardianLink = onDocumentWritten("studentGuardianLinks/{id}", async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  await Promise.all(uids(before?.guardianUid, after?.guardianUid).map((uid) => recomputeUserScope(db, uid)));
  await Promise.all(uids(before?.guardianId, after?.guardianId).map((id) => refreshGuardianClasses(db, id)));
});
export const scopeOnTeacherAssignment = onDocumentWritten("teacherAssignments/{id}", async (event) => {
  await Promise.all(uids(event.data?.before?.data()?.teacherUid, event.data?.after?.data()?.teacherUid).map((uid) => recomputeUserScope(db, uid)));
});
export const scopeOnClass = onDocumentWritten("classes/{id}", async (event) => {
  await Promise.all(uids(event.data?.before?.data()?.classTeacherUid, event.data?.after?.data()?.classTeacherUid).map((uid) => recomputeUserScope(db, uid)));
});
export const scopeOnSupportPlan = onDocumentWritten("studentSupportPlans/{id}", async (event) => {
  await Promise.all(uids(event.data?.before?.data()?.assignedStaffUids || [], event.data?.after?.data()?.assignedStaffUids || []).map((uid) => recomputeUserScope(db, uid)));
});
// Enrolment history is authoritative; refresh the cached current class, then the child's family scopes.
export const scopeOnEnrollment = onDocumentWritten("enrollments/{id}", async (event) => {
  const studentId = (event.data?.after ?? event.data?.before)?.data()?.studentId;
  if (!studentId) return;
  await refreshCurrentClass(db, studentId);
  const [student, links] = await Promise.all([db.doc(`students/${studentId}`).get(), db.collection("studentGuardianLinks").where("studentId", "==", studentId).get()]);
  await Promise.all(uids(student.data()?.uid, links.docs.map((doc) => doc.data().guardianUid)).map((uid) => recomputeUserScope(db, uid)));
});
// Linking a sign-in account to a person record (the `uid` field) changes that account's scope.
// The guardian's account id is copied onto their links, which is what grants a parent their children.
export const scopeOnGuardianAccount = onDocumentUpdated("guardians/{id}", async (event) => {
  const before = event.data.before.data().uid; const after = event.data.after.data().uid;
  if (before === after) return;
  const links = await db.collection("studentGuardianLinks").where("guardianId", "==", event.params.id).get();
  await Promise.all(links.docs.map((link) => link.ref.set({ guardianUid: after ?? null }, { merge: true })));
  await Promise.all(uids(before, after).map((uid) => recomputeUserScope(db, uid)));
});
// A new current academic year changes every teacher's classes and every family's class keys.
export const scopeOnSchoolYear = onDocumentUpdated("settings/school", async (event) => {
  if (event.data.before.data().currentAcademicYearId === event.data.after.data().currentAcademicYearId) return;
  // Each pupil's current class (a cache of the active enrolment for the current year) first, then every account.
  const students = await db.collection("students").get();
  for (const student of students.docs) await refreshCurrentClass(db, student.id);
  const count = await recomputeAllScopes(db);
  await audit({ type: "settings.academicYearChanged", before: event.data.before.data().currentAcademicYearId || null, after: event.data.after.data().currentAcademicYearId, accountsRefreshed: count });
});
export const scopeOnStudentAccount = onDocumentUpdated("students/{id}", async (event) => {
  const before = event.data.before.data().uid; const after = event.data.after.data().uid;
  if (before !== after) await Promise.all(uids(before, after).map((uid) => recomputeUserScope(db, uid)));
});

// ---------- Consent (CON-001, CON-002, CON-006) ----------
export const consentStatusOnRecord = onDocumentCreated("consentRecords/{id}", async (event) => {
  await recomputeConsentStatus(db, event.data.data().studentId);
});

// One-click reminder from the admin consent page: an in-hub notification to every linked guardian
// with portal access. Pupils without a parent account are returned so the office can phone instead.
export const sendConsentReminders = onCall(async (request) => {
  const roles = request.auth?.token?.roles || [];
  if (!roles.some((role) => ["schoolAdmin", "privacySteward"].includes(role))) throw new HttpsError("permission-denied", "Only the school office or the privacy steward can send consent reminders.");
  const studentIds = [...new Set(request.data?.studentIds || [])].filter((id) => typeof id === "string").slice(0, 500);
  if (!studentIds.length) throw new HttpsError("invalid-argument", "Choose at least one pupil.");
  let notified = 0; const withoutAccount = [];
  for (const studentId of studentIds) {
    const [student, links] = await Promise.all([db.doc(`students/${studentId}`).get(), db.collection("studentGuardianLinks").where("studentId", "==", studentId).where("hasPortalAccess", "==", true).get()]);
    const name = student.data()?.preferredName || student.data()?.name || "your child";
    const guardianUids = [...new Set(links.docs.filter((link) => (link.data().status ?? "active") === "active").map((link) => link.data().guardianUid).filter(Boolean))];
    if (!guardianUids.length) { withoutAccount.push(studentId); continue; }
    const batch = db.batch();
    for (const recipientUid of guardianUids) {
      batch.set(db.collection("notificationRecords").doc(), {
        recipientUid, category: "consent", critical: false,
        title: `Consent choices for ${name} are waiting`,
        body: "A few yes or no questions — about two minutes. You can change your answers at any time.",
        link: `/hub/parent/consent?student=${studentId}`, studentId, createdAt: FieldValue.serverTimestamp(), readAt: null,
      });
    }
    batch.set(db.doc(`consentReminders/${studentId}`), { studentId, lastSentAt: FieldValue.serverTimestamp(), lastSentBy: request.auth.uid, count: FieldValue.increment(1) }, { merge: true });
    await batch.commit();
    notified += guardianUids.length;
  }
  return { notified, withoutAccount };
});

// ---------- Portfolio public showcase (CON-002) ----------
// Portfolio entries hold private media references, so they are never public. When a moderator approves
// an entry for the public showcase — and only while public-showcase consent is granted — a public-safe
// copy (first name, standard, title, description, values; no media, no surname) goes to showcaseItems.
export const showcaseOnModeration = onDocumentWritten("portfolioEntries/{id}", async (event) => {
  const entry = event.data?.after?.data();
  const ref = db.doc(`showcaseItems/${event.params.id}`);
  const approved = entry && entry.visibility === "publicShowcase" && entry.moderationStatus === "approved";
  const consent = approved ? (await db.doc(`studentConsentStatus/${entry.studentId}`).get()).data()?.types?.publicShowcase?.response : null;
  if (!approved || consent !== "granted") {
    const existing = await ref.get();
    if (existing.exists && existing.data().status !== "withdrawn") await ref.set({ status: "withdrawn", withdrawnAt: FieldValue.serverTimestamp() }, { merge: true });
    return;
  }
  const student = (await db.doc(`students/${entry.studentId}`).get()).data() || {};
  await ref.set({
    status: "published", entryId: event.params.id, title: entry.title, description: entry.description || "", category: entry.category || null,
    humanValues: entry.humanValues || (entry.humanValue ? [entry.humanValue] : []), firstName: (student.preferredName || student.name || "").split(" ")[0], standard: student.currentStandard || null,
    date: entry.date || null, publishedAt: FieldValue.serverTimestamp(),
  });
});

// ---------- Announcements: scheduled publication and expiry ----------
export async function publishDueAnnouncements(now = new Date()) {
  const [due, live] = await Promise.all([db.collection("announcements").where("status", "==", "scheduled").get(), db.collection("announcements").where("status", "==", "published").get()]);
  const batch = db.batch(); let published = 0; let expired = 0;
  for (const item of due.docs) {
    const at = item.data().publishAt?.toDate?.() ?? (item.data().publishAt ? new Date(item.data().publishAt) : null);
    if (at && at <= now) { batch.update(item.ref, { status: "published", publishedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), updatedBy: "scheduler" }); published++; }
  }
  for (const item of live.docs) {
    const until = item.data().expiresAt ? new Date(item.data().expiresAt) : null;
    if (until && until < now) { batch.update(item.ref, { status: "archived", archivedReason: "expired", archivedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), updatedBy: "scheduler" }); expired++; }
  }
  if (published || expired) await batch.commit();
  return { published, expired };
}
export const publishScheduledAnnouncements = onSchedule({ schedule: "every 15 minutes", timeZone: "Asia/Kuala_Lumpur" }, async () => { await publishDueAnnouncements(); });
// Lets the office publish due notices immediately (also used to exercise scheduling in the emulators).
export const runAnnouncementSchedule = onCall(async (request) => {
  if (!(request.auth?.token?.roles || []).some((role) => ["schoolAdmin", "superAdmin", "leadership"].includes(role))) throw new HttpsError("permission-denied", "Only the school office can run this.");
  return publishDueAnnouncements();
});

// ---------- Attendance (ATT workflow → parent dashboard → optional notification) ----------
// Fires when a session first becomes "submitted" — whether created submitted or updated to it.
export const notifyAbsencesOnSubmit = onDocumentWritten("attendanceSessions/{id}", async (event) => {
  const before = event.data?.before?.data(); const after = event.data?.after?.data();
  if (!after || before?.status === "submitted" || after.status !== "submitted") return;
  const absences = await db.collection("attendanceRecords").where("sessionId", "==", event.params.id).where("status", "==", "absent").get();
  const batch = db.batch();
  for (const record of absences.docs) {
    const { studentId } = record.data();
    const [student, links] = await Promise.all([db.doc(`students/${studentId}`).get(), db.collection("studentGuardianLinks").where("studentId", "==", studentId).where("hasPortalAccess", "==", true).get()]);
    for (const link of links.docs) {
      if (!link.data().guardianUid) continue;
      batch.set(db.collection("notificationRecords").doc(), {
        recipientUid: link.data().guardianUid, category: "attendance", critical: false,
        title: `${student.data()?.preferredName || student.data()?.name || "Your child"} was marked absent`,
        body: `Attendance for ${after.date}. Contact the class teacher if this is unexpected.`,
        link: "/hub/parent/attendance", studentId, createdAt: FieldValue.serverTimestamp(), readAt: null,
      });
    }
  }
  await batch.commit();
});

// Attendance Policy §6.3: the clerk prompts teachers whose AM register isn't in yet.
export const remindRegisters = onCall(async (request) => {
  const roles = request.auth?.token?.roles || [];
  if (!roles.some((role) => ["schoolAdmin", "superAdmin", "attendanceManager", "leadership"].includes(role))) throw new HttpsError("permission-denied", "Only the attendance manager or the school office can send register reminders.");
  const { date, classIds = [] } = request.data || {};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date)) || !Array.isArray(classIds) || !classIds.length) throw new HttpsError("invalid-argument", "Choose a date and at least one class.");
  const notified = new Set();
  const batch = db.batch();
  for (const classId of classIds.slice(0, 50)) {
    const [cls, assignments, session] = await Promise.all([db.doc(`classes/${classId}`).get(), db.collection("teacherAssignments").where("classId", "==", classId).get(), db.doc(`attendanceSessions/${classId}_${date}_am`).get()]);
    if (session.exists && session.data().status === "submitted") continue;
    const teachers = uids(cls.data()?.classTeacherUid, assignments.docs.filter((doc) => (doc.data().status ?? "active") === "active").map((doc) => doc.data().teacherUid));
    for (const recipientUid of teachers) {
      batch.set(db.collection("notificationRecords").doc(), { recipientUid, category: "attendance", critical: true, title: `AM register for ${cls.data()?.name || "your class"} isn't submitted yet`, body: `Please complete and submit the register for ${date}.`, link: `/hub/teacher/attendance/${classId}${date ? `?date=${date}` : ""}`, createdAt: FieldValue.serverTimestamp(), readAt: null });
      notified.add(recipientUid);
    }
  }
  await batch.commit();
  await audit({ type: "attendance.registerReminder", date, classIds, notified: notified.size, actorUid: request.auth.uid });
  return { notified: notified.size };
});

// ---------- Admissions → SIS without re-keying (PRD §33) ----------
export const enrolApplication = onCall(async (request) => {
  const roles = request.auth?.token?.roles || [];
  if (!roles.some((role) => ["admissionsOfficer", "schoolAdmin"].includes(role))) throw new HttpsError("permission-denied", "Only admissions staff can enrol applicants.");
  const { applicationId, classId } = request.data || {};
  const appRef = db.doc(`applications/${applicationId}`);
  return db.runTransaction(async (tx) => {
    const app = await tx.get(appRef);
    if (!app.exists) throw new HttpsError("not-found", "Application not found.");
    const data = app.data();
    if (data.status !== "accepted") throw new HttpsError("failed-precondition", "Only accepted applications can be enrolled.");
    const classDoc = await tx.get(db.doc(`classes/${classId}`));
    if (!classDoc.exists) throw new HttpsError("invalid-argument", "Choose a valid class for the current academic year.");
    const now = FieldValue.serverTimestamp();
    const meta = { createdAt: now, createdBy: request.auth.uid, updatedAt: now, updatedBy: request.auth.uid };
    const studentRef = db.collection("students").doc();
    tx.set(studentRef, { name: data.child.name, preferredName: data.child.preferredName || null, dateOfBirth: data.child.dateOfBirth || null, admissionDate: data.startDate || null, status: "active", sourceApplicationId: applicationId, currentClassId: classId, currentStandard: classDoc.data().standard, ...meta });
    tx.set(db.collection("enrollments").doc(), { studentId: studentRef.id, classId, academicYearId: classDoc.data().academicYearId, status: "active", startDate: data.startDate || null, ...meta });
    for (const guardian of data.guardians || []) {
      const guardianRef = db.collection("guardians").doc();
      tx.set(guardianRef, { name: guardian.name, email: guardian.email || null, phone: guardian.phone || null, uid: null, status: "invited", ...meta });
      tx.set(db.collection("studentGuardianLinks").doc(), { studentId: studentRef.id, guardianId: guardianRef.id, guardianUid: null, relationship: guardian.relationship || "legalGuardian", hasPortalAccess: guardian.portalAccess !== false, isEmergencyContact: Boolean(guardian.emergencyContact), canCollect: Boolean(guardian.canCollect), status: "active", classId, ...meta });
    }
    tx.update(appRef, { status: "enrolled", studentId: studentRef.id, updatedAt: now, updatedBy: request.auth.uid });
    tx.set(db.collection("applicationActions").doc(), { applicationId, action: "enrolled", studentId: studentRef.id, actorUid: request.auth.uid, at: now });
    tx.set(db.collection("auditLogs").doc(), { type: "applications.enrolled", applicationId, studentId: studentRef.id, actorUid: request.auth.uid, at: now });
    return { studentId: studentRef.id };
  });
});

// ---------- Audit trail (PRD §42) ----------
// Who changed which record and which fields. Restricted records log the event only.
// Audited collections: "users", "studentGuardianLinks", "students", "enrollments", "attendanceRecords", "studentResults", "reportCards", "consentRecords", "portfolioEntries", "studentIncidents", "payments", "concessions", "assets", "settings", "staff",
// plus the school master data and configuration lists managed in the Admin hub.
const auditWrite = (collection) => onDocumentWrittenWithAuthContext(`${collection}/{id}`, async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  const action = !before ? "created" : !after ? "deleted" : "updated";
  const restricted = (after ?? before)?.classification === "restricted";
  const changed = before && after ? Object.keys({ ...before, ...after }).filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key])) : [];
  if (action === "updated" && changed.every((key) => ["updatedAt", "scopeUpdatedAt"].includes(key))) return;
  await audit({ type: `${collection}.${action}`, path: event.document, fields: restricted ? [] : changed, actorUid: event.authId || null, actorType: event.authType || null });
});
export const auditUsers = auditWrite("users");
export const auditGuardianLinks = auditWrite("studentGuardianLinks");
export const auditStudents = auditWrite("students");
export const auditEnrollments = auditWrite("enrollments");
export const auditAttendance = auditWrite("attendanceRecords");
export const auditResults = auditWrite("studentResults");
export const auditReportCards = auditWrite("reportCards");
export const auditConsent = auditWrite("consentRecords");
export const auditPortfolio = auditWrite("portfolioEntries");
export const auditIncidents = auditWrite("studentIncidents");
export const auditPayments = auditWrite("payments");
export const auditConcessions = auditWrite("concessions");
export const auditAssets = auditWrite("assets");
export const auditSettings = auditWrite("settings");
export const auditStaff = auditWrite("staff");
export const auditGuardians = auditWrite("guardians");
export const auditAcademicYears = auditWrite("academicYears");
export const auditTerms = auditWrite("terms");
export const auditStandards = auditWrite("standards");
export const auditClasses = auditWrite("classes");
export const auditSubjects = auditWrite("subjects");
export const auditTeacherAssignments = auditWrite("teacherAssignments");
export const auditAnnouncements = auditWrite("announcements");
export const auditEvents = auditWrite("events");
export const auditConsentDefinitions = auditWrite("consentDefinitions");
export const auditAnnouncementCategories = auditWrite("announcementCategories");
export const auditPortfolioCategories = auditWrite("portfolioCategories");
export const auditPortfolioTags = auditWrite("portfolioTags");
export const auditDownloadCategories = auditWrite("downloadCategories");
export const auditAttendanceMovements = auditWrite("attendanceMovements");
export const auditAttendanceFollowUps = auditWrite("attendanceFollowUps");
