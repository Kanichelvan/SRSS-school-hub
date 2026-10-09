// Derives each user's access scope (users/{uid}) from the source-of-truth collections:
// guardians/students/staff (account ↔ person), studentGuardianLinks, teacherAssignments, classes,
// studentSupportPlans and enrollments. Firestore rules read this document; clients never write it.
// Takes the Admin SDK Firestore instance as a parameter so triggers and the seed script share it.

const TEACHING_ROLES = ["teacher", "classTeacher", "specialistTeacher"];
const ROLE_GROUP_KEYS = { student: "role:students", parent: "role:parents" };
const unique = (values) => [...new Set(values.filter(Boolean))];
const chunk = (values, size = 30) => Array.from({ length: Math.ceil(values.length / size) }, (_, i) => values.slice(i * size, i * size + size));

async function firstId(db, collection, uid) {
  const snap = await db.collection(collection).where("uid", "==", uid).limit(1).get();
  return snap.empty ? null : snap.docs[0].id;
}

async function getMany(db, collection, ids) {
  const docs = [];
  for (const part of chunk(unique(ids), 100)) {
    if (!part.length) continue;
    const snaps = await db.getAll(...part.map((id) => db.doc(`${collection}/${id}`)));
    docs.push(...snaps.filter((snap) => snap.exists));
  }
  return docs;
}

export async function currentAcademicYearId(db) {
  const settings = await db.doc("settings/school").get();
  return settings.exists ? settings.data().currentAcademicYearId : null;
}

export async function computeUserScope(db, uid, roles = []) {
  const yearId = await currentAcademicYearId(db);
  const [guardianId, studentId, staffId] = await Promise.all([firstId(db, "guardians", uid), firstId(db, "students", uid), firstId(db, "staff", uid)]);

  const [links, assignments, homerooms, supportPlans] = await Promise.all([
    db.collection("studentGuardianLinks").where("guardianUid", "==", uid).where("hasPortalAccess", "==", true).where("status", "==", "active").get(),
    db.collection("teacherAssignments").where("teacherUid", "==", uid).where("academicYearId", "==", yearId).get(),
    db.collection("classes").where("classTeacherUid", "==", uid).where("academicYearId", "==", yearId).get(),
    db.collection("studentSupportPlans").where("assignedStaffUids", "array-contains", uid).where("status", "==", "active").get(),
  ]);

  const childIds = unique(links.docs.map((doc) => doc.data().studentId));
  const teachingClassIds = unique(assignments.docs.map((doc) => doc.data().classId));
  const homeroomClassIds = homerooms.docs.map((doc) => doc.id);
  const classIds = unique([...teachingClassIds, ...homeroomClassIds]);
  const assignedStudentIds = unique(supportPlans.docs.map((doc) => doc.data().studentId));

  const familyStudents = await getMany(db, "students", [...childIds, studentId]);
  const familyClassIds = unique(familyStudents.map((doc) => doc.data().currentClassId));
  const classDocs = await getMany(db, "classes", [...familyClassIds, ...classIds]);
  const standardOf = Object.fromEntries(classDocs.map((doc) => [doc.id, doc.data().standard]));

  const audienceKeys = unique([
    "school",
    `user:${uid}`,
    ...roles.map((role) => ROLE_GROUP_KEYS[role]),
    roles.some((role) => TEACHING_ROLES.includes(role)) ? "role:teachers" : null,
    roles.some((role) => !["student", "parent"].includes(role)) ? "role:staff" : null,
    ...[...familyClassIds, ...classIds].map((classId) => `class:${classId}`),
    ...[...familyClassIds, ...classIds].map((classId) => (standardOf[classId] ? `standard:${standardOf[classId]}` : null)),
  ]);

  return {
    roles,
    guardianId,
    studentId,
    staffId,
    childIds,
    teachingClassIds,
    homeroomClassIds,
    classIds,
    assignedStudentIds,
    familyClassIds,
    audienceKeys,
    publishKeys: classIds.map((classId) => `class:${classId}`),
    scopeUpdatedAt: new Date(),
  };
}

export async function recomputeUserScope(db, uid, roles) {
  if (!uid) return null;
  const userRef = db.doc(`users/${uid}`);
  const existing = await userRef.get();
  const scope = await computeUserScope(db, uid, roles ?? existing.data()?.roles ?? []);
  await userRef.set(scope, { merge: true });
  if (scope.guardianId) await db.doc(`guardians/${scope.guardianId}`).set({ classIds: scope.familyClassIds }, { merge: true });
  return scope;
}

// Guardian records carry their children's current class ids so class teachers can read family contacts.
export async function refreshGuardianClasses(db, guardianId) {
  if (!guardianId) return;
  const links = await db.collection("studentGuardianLinks").where("guardianId", "==", guardianId).where("status", "==", "active").get();
  const students = await getMany(db, "students", links.docs.map((doc) => doc.data().studentId));
  await db.doc(`guardians/${guardianId}`).set({ classIds: unique(students.map((doc) => doc.data().currentClassId)) }, { merge: true });
}

// Keeps students.currentClassId (a cache) in line with the active enrolment for the current year.
export async function refreshCurrentClass(db, studentId) {
  const yearId = await currentAcademicYearId(db);
  const enrolments = await db.collection("enrollments").where("studentId", "==", studentId).where("academicYearId", "==", yearId).where("status", "==", "active").limit(1).get();
  const enrolment = enrolments.empty ? null : enrolments.docs[0].data();
  const classDoc = enrolment ? await db.doc(`classes/${enrolment.classId}`).get() : null;
  await db.doc(`students/${studentId}`).set({ currentClassId: enrolment?.classId ?? null, currentStandard: classDoc?.data()?.standard ?? null }, { merge: true });
  const links = await db.collection("studentGuardianLinks").where("studentId", "==", studentId).get();
  await Promise.all(links.docs.map((doc) => doc.ref.set({ classId: enrolment?.classId ?? null }, { merge: true })));
  await Promise.all(links.docs.map((doc) => refreshGuardianClasses(db, doc.data().guardianId)));
  return enrolment?.classId ?? null;
}

// Latest response per consent type for one student (consent records are append-only).
export async function recomputeConsentStatus(db, studentId) {
  const records = await db.collection("consentRecords").where("studentId", "==", studentId).get();
  const latest = {};
  for (const doc of records.docs) {
    const record = doc.data();
    const at = record.createdAt?.toMillis?.() ?? new Date(record.createdAt).getTime();
    if (!latest[record.consentType] || at > latest[record.consentType].at) {
      latest[record.consentType] = { response: record.response, version: record.definitionVersion, recordId: doc.id, at, choice: record.choice ?? null };
    }
  }
  const student = await db.doc(`students/${studentId}`).get();
  await db.doc(`studentConsentStatus/${studentId}`).set({ studentId, classId: student.data()?.currentClassId ?? null, types: latest, updatedAt: new Date() });
  return latest;
}
