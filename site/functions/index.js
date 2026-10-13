import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { onDocumentUpdated, onDocumentWritten, onDocumentWrittenWithAuthContext, onDocumentCreated } from "firebase-functions/v2/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { ROLE_IDS } from "./roles.js";
import { recomputeConsentStatus, recomputeUserScope, refreshCurrentClass, refreshGuardianClasses } from "./scope.js";

initializeApp();
setGlobalOptions({ region: "asia-southeast1", maxInstances: 5 });
const db = getFirestore();
const audit = (entry) => db.collection("auditLogs").add({ ...entry, at: FieldValue.serverTimestamp() });
const uids = (...values) => [...new Set(values.flat().filter(Boolean))];

// ---------- Roles (AUTH-001) ----------
// Only accounts holding the `accessAdmin` claim (the 1–2 Super Administrators) may assign roles.
export const setUserRoles = onCall(async (request) => {
  if (request.auth?.token?.accessAdmin !== true) throw new HttpsError("permission-denied", "Only designated access administrators can assign roles.");
  const { uid, email, roles = [], reason = "" } = request.data || {};
  if (!Array.isArray(roles) || roles.some((role) => !ROLE_IDS.includes(role))) throw new HttpsError("invalid-argument", `Roles must be drawn from: ${ROLE_IDS.join(", ")}.`);
  if (!String(reason).trim()) throw new HttpsError("invalid-argument", "Record a reason for the access change.");
  const auth = getAuth();
  const target = uid ? await auth.getUser(uid) : await auth.getUserByEmail(String(email || ""));
  const before = target.customClaims?.roles || [];
  await auth.setCustomUserClaims(target.uid, { ...target.customClaims, roles });
  await db.doc(`users/${target.uid}`).set({ email: target.email, status: "active" }, { merge: true });
  await recomputeUserScope(db, target.uid, roles);
  await db.collection("userRoles").add({ uid: target.uid, before, after: roles, reason, actorUid: request.auth.uid, at: FieldValue.serverTimestamp() });
  await audit({ type: "roles.changed", targetUid: target.uid, before, after: roles, reason, actorUid: request.auth.uid });
  return { uid: target.uid, roles };
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
export const scopeOnGuardianAccount = onDocumentUpdated("guardians/{id}", async (event) => {
  const before = event.data.before.data().uid; const after = event.data.after.data().uid;
  if (before !== after) await Promise.all(uids(before, after).map((uid) => recomputeUserScope(db, uid)));
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
    const guardianUids = [...new Set(links.docs.filter((link) => link.data().status !== "inactive").map((link) => link.data().guardianUid).filter(Boolean))];
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
// Audited collections: "users", "studentGuardianLinks", "students", "enrollments", "attendanceRecords", "studentResults", "reportCards", "consentRecords", "portfolioEntries", "studentIncidents", "payments", "concessions", "assets", "settings", "staff".
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
