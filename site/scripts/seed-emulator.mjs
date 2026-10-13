// Seeds the local emulators with a realistic, entirely fictional SRSS school following the PRD data model.
// Run while the emulators are up: `npm run emulators` (terminal 1), then `npm run seed` (terminal 2).
// Refuses to run against anything except the local emulators.
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { recomputeConsentStatus, recomputeUserScope, refreshGuardianClasses } from "../functions/scope.js";
import { CONSENT_FORM_VERSION, CONSENT_ITEMS } from "../src/hub/consentForm.js";
import { importLegacyContent } from "./import-legacy-content.mjs";

process.env.FIREBASE_AUTH_EMULATOR_HOST ||= "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";
if (!process.env.FIRESTORE_EMULATOR_HOST.startsWith("127.0.0.1") && !process.env.FIRESTORE_EMULATOR_HOST.startsWith("localhost")) throw new Error("Seeding is only allowed against local emulators.");
initializeApp({ projectId: "demo-srss" });
const auth = getAuth();
const db = getFirestore();

// Emulator-only test password, shared with the demo sign-in buttons in src/hub/SignIn.jsx.
export const DEMO_PASSWORD = "srss-demo-only";
const YEAR = "ay2026";
const SYSTEM = "seed-script";
const now = Timestamp.now();
const meta = (extra = {}) => ({ status: "active", createdAt: now, createdBy: SYSTEM, updatedAt: now, updatedBy: SYSTEM, academicYearId: YEAR, ...extra });
const day = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); };
const schoolDays = (count) => { const days = []; for (let i = 1; days.length < count; i++) { const d = new Date(); d.setDate(d.getDate() - i); if (d.getDay() % 6) days.push(d.toISOString().slice(0, 10)); } return days.reverse(); };

const writes = [];
const put = (path, data) => writes.push([path, data]);

// ---------- accounts (one per role) ----------
const accounts = [
  { key: "office", email: "office@demo.srss.test", name: "Puan Salmah (Office)", roles: ["schoolAdmin"], accessAdmin: true, staff: "Administrator" },
  { key: "principal", email: "principal@demo.srss.test", name: "Headmistress", roles: ["leadership"], staff: "Headmistress" },
  { key: "coordinator", email: "coordinator@demo.srss.test", name: "Cikgu Rohani", roles: ["academicCoordinator", "teacher"], staff: "Academic Coordinator" },
  { key: "teacher", email: "teacher@demo.srss.test", name: "Cikgu Lim Wei Ling", roles: ["teacher", "classTeacher"], staff: "Class Teacher, Standard 4" },
  { key: "specialist", email: "specialist@demo.srss.test", name: "Ms Kavitha", roles: ["specialistTeacher"], staff: "Learning Studio Teacher" },
  { key: "admissions", email: "admissions@demo.srss.test", name: "Encik Faizal", roles: ["admissionsOfficer"], staff: "Admissions Officer" },
  { key: "finance", email: "finance@demo.srss.test", name: "Mrs Chong", roles: ["financeOfficer"], staff: "Finance Officer" },
  { key: "welfare", email: "welfare@demo.srss.test", name: "Ms Devi", roles: ["safeguardingLead"], staff: "Welfare Lead" },
  { key: "privacy", email: "privacy@demo.srss.test", name: "Mr Ravi", roles: ["privacySteward"], staff: "Privacy & Consent Steward" },
  { key: "moderator", email: "moderator@demo.srss.test", name: "Ms Anita", roles: ["portfolioModerator", "teacher"], staff: "Portfolio Lead" },
  { key: "editor", email: "editor@demo.srss.test", name: "Content Editor", roles: ["contentEditor"], staff: "Communications" },
  { key: "parent", email: "parent@demo.srss.test", name: "Priya Raman", roles: ["parent"] },
  { key: "student", email: "student@demo.srss.test", name: "Aarav Raman", roles: ["student"] },
];
const uid = {};
for (const account of accounts) {
  let user;
  try { user = await auth.getUserByEmail(account.email); } catch { user = await auth.createUser({ email: account.email, password: DEMO_PASSWORD, displayName: account.name, emailVerified: true }); }
  uid[account.key] = user.uid;
  await auth.setCustomUserClaims(user.uid, { roles: account.roles, ...(account.accessAdmin ? { accessAdmin: true } : {}) });
  put(`users/${user.uid}`, { email: account.email, displayName: account.name, roles: account.roles, status: "active" });
  if (account.staff) put(`staff/staff-${account.key}`, meta({ uid: user.uid, name: account.name, position: account.staff, email: account.email, directoryVisible: true }));
}

// ---------- academic structure (SIS-001) ----------
put("settings/school", { name: "Sekolah Rendah Sathya Sai", motto: "Human Excellence | Kecemerlangan Insan", currentAcademicYearId: YEAR, currentTermId: "ay2026-t3", timezone: "Asia/Kuala_Lumpur", attendanceDueTime: "09:00", updatedAt: now });
put(`academicYears/${YEAR}`, meta({ name: "2026", startDate: "2026-01-12", endDate: "2026-12-04", current: true }));
[["t1", "Term 1", "2026-01-12", "2026-05-22"], ["t2", "Term 2", "2026-06-08", "2026-09-04"], ["t3", "Term 3", "2026-09-14", "2026-12-04"]].forEach(([id, name, start, end]) => put(`terms/${YEAR}-${id}`, meta({ name, startDate: start, endDate: end })));
const classNames = ["Amanah", "Bakti", "Cekal", "Dedikasi", "Ehsan", "Fikrah"];
for (let s = 1; s <= 6; s++) {
  put(`standards/std${s}`, { name: `Standard ${s}`, order: s, status: "active" });
  put(`classes/c26-${s}`, meta({ name: `${s} ${classNames[s - 1]}`, standard: s, classTeacherUid: s === 4 ? uid.teacher : null, room: `Block A · Room ${s}` }));
}
const subjects = [["bm", "Bahasa Melayu"], ["bi", "English"], ["math", "Mathematics"], ["sci", "Science"], ["ehv", "Education in Human Values"], ["pe", "Physical Education"], ["art", "Visual Arts"], ["music", "Music"]];
subjects.forEach(([id, name]) => put(`subjects/${id}`, { name, status: "active" }));
// teacherAssignments carry simple weekly slots ({ day: 1–5, time }) until the timetable module (phase 2) exists.
const assign = (id, teacherKey, classNo, subjectId, slots) => put(`teacherAssignments/${id}`, meta({ teacherUid: uid[teacherKey], staffId: `staff-${teacherKey}`, classId: `c26-${classNo}`, subjectId, slots: slots.map(([day, time]) => ({ day, time })) }));
assign("ta-math-3", "teacher", 3, "math", [[1, "10:30"], [3, "10:30"], [5, "08:30"]]);
assign("ta-math-4", "teacher", 4, "math", [[1, "08:30"], [2, "08:30"], [3, "08:30"], [4, "08:30"], [5, "10:30"]]);
assign("ta-ehv-4", "teacher", 4, "ehv", [[2, "11:30"], [4, "11:30"]]);
assign("ta-math-5", "teacher", 5, "math", [[2, "10:30"], [4, "10:30"]]);
assign("ta-bi-2", "moderator", 2, "bi", [[1, "08:30"], [3, "08:30"]]);
assign("ta-sci-6", "coordinator", 6, "sci", [[2, "08:30"], [5, "11:30"]]);

// ---------- students, guardians, links, enrolments ----------
const roster = {
  1: ["Ananya Pillai", "Haziq Ismail", "Mei Xin Tan", "Arjun Nair", "Nur Aisyah Rahman", "Ethan Lee"],
  2: ["Anika Raman", "Danish Hakim", "Sofia Wong", "Rohan Menon", "Siti Hajar", "Lucas Teoh"],
  3: ["Kavya Suresh", "Irfan Zulkifli", "Chloe Lim", "Vikram Das", "Aina Sofea", "Jayden Ng"],
  4: ["Aarav Raman", "Mei Ling Tan", "Adam Harith", "Ishaan Kumar", "Nurul Iman", "Ryan Chua"],
  5: ["Diya Krishnan", "Amir Hamzah", "Hui Min Ooi", "Karthik Raj", "Balqis Zahra", "Marcus Yeoh"],
  6: ["Tara Subramaniam", "Hakimi Yusof", "Jia Yi Koh", "Nikhil Rao", "Puteri Alya", "Daniel Goh"],
};
const studentIds = {};
let n = 1;
for (const [standard, names] of Object.entries(roster)) {
  for (const name of names) {
    const id = `stu-${String(n).padStart(4, "0")}`;
    studentIds[name] = id;
    const classId = `c26-${standard}`;
    const complete = n % 7 !== 0;
    put(`students/${id}`, meta({ studentNumber: `2026-${String(n).padStart(4, "0")}`, name, preferredName: name.split(" ")[0], dateOfBirth: `${2026 - 6 - Number(standard)}-0${(n % 9) + 1}-1${n % 9}`, admissionDate: `${2026 - Number(standard) + 1}-01-12`, currentClassId: classId, currentStandard: Number(standard), uid: name === "Aarav Raman" ? uid.student : null, completeness: { emergencyContact: complete, medical: n % 5 !== 0, photoConsent: n % 4 !== 0, birthCertificate: true } }));
    put(`enrollments/enr-${id}-${YEAR}`, meta({ studentId: id, classId, standard: Number(standard), startDate: "2026-01-12" }));
    if (Number(standard) > 1) put(`enrollments/enr-${id}-ay2025`, { ...meta({ studentId: id, classId: `c25-${Number(standard) - 1}`, standard: Number(standard) - 1, startDate: "2025-01-13" }), academicYearId: "ay2025", status: "completed" });
    n++;
  }
}
// Families: the Ramans have two children (Std 4 and Std 2) to exercise the child switcher.
put("guardians/g-raman", meta({ name: "Priya Raman", email: "parent@demo.srss.test", phone: "+60 12-555 0101", uid: uid.parent, preferredLanguage: "English" }));
put("guardians/g-raman-2", meta({ name: "Vijay Raman", email: "vijay@example.com", phone: "+60 12-555 0102", uid: null }));
const link = (id, studentName, guardianId, guardianUid, relationship, portal = true) => put(`studentGuardianLinks/${id}`, meta({ studentId: studentIds[studentName], guardianId, guardianUid, relationship, hasPortalAccess: portal, isEmergencyContact: true, canCollect: true, classId: `c26-${Object.entries(roster).find(([, names]) => names.includes(studentName))[0]}` }));
link("lnk-aarav-priya", "Aarav Raman", "g-raman", uid.parent, "mother");
link("lnk-anika-priya", "Anika Raman", "g-raman", uid.parent, "mother");
link("lnk-aarav-vijay", "Aarav Raman", "g-raman-2", null, "father");
link("lnk-anika-vijay", "Anika Raman", "g-raman-2", null, "father");
let g = 1;
for (const names of Object.values(roster)) for (const name of names) {
  if (name.endsWith("Raman")) continue;
  const gid = `g-${String(g).padStart(4, "0")}`;
  put(`guardians/${gid}`, meta({ name: `Parent of ${name.split(" ")[0]}`, email: `family${g}@example.com`, uid: null }));
  link(`lnk-${gid}`, name, gid, null, g % 2 ? "mother" : "father");
  g++;
}
put("students/" + studentIds["Aarav Raman"] + "/restricted/medical", { allergies: "Peanuts (mild)", medication: null, updatedAt: now, updatedBy: SYSTEM });

// Learning Studio support plan (assigns the specialist to one Standard 2 pupil).
put("studentSupportPlans/sp-danish", meta({ studentId: studentIds["Danish Hakim"], classId: "c26-2", focus: "Reading fluency", goal: "Read Standard 2 texts aloud with confidence", assignedStaffUids: [uid.specialist], reviewDate: day(21), familyVisible: true }));

// ---------- attendance (ATT-001/002): five submitted days; today open for Std 4 only ----------
const statuses = ["present", "present", "present", "present", "present", "present", "present", "present", "absent", "late"];
for (const [i, date] of schoolDays(5).entries()) {
  for (let s = 1; s <= 6; s++) {
    const classId = `c26-${s}`;
    const sessionId = `${classId}_${date}_am`;
    put(`attendanceSessions/${sessionId}`, meta({ classId, date, sessionType: "am", status: "submitted", openedBy: uid.teacher, submittedBy: uid.teacher, submittedAt: now }));
    roster[s].forEach((name, j) => {
      const status = statuses[(i * 7 + j * 3 + s) % statuses.length];
      put(`attendanceRecords/${sessionId}_${studentIds[name]}`, meta({ sessionId, classId, date, studentId: studentIds[name], status, reason: status === "absent" ? "Unwell" : status === "late" ? "Traffic" : null, markedBy: uid.teacher, markedAt: now }));
    });
  }
}
put(`attendanceSessions/c26-1_${day(0)}_am`, meta({ classId: "c26-1", date: day(0), sessionType: "am", status: "submitted", openedBy: uid.office, submittedBy: uid.office, submittedAt: now }));

// ---------- consent (CON-001) ----------
// The consent form is built into the hub (src/hub/consentForm.js); these documents keep a dated copy for audit.
CONSENT_ITEMS.forEach(({ type, title, question, detail }) => put(`consentDefinitions/${type}`, meta({ type, title, version: CONSENT_FORM_VERSION, policyText: `${question} ${detail}`, effectiveFrom: "2026-11-23", status: "active" })));
const consent = (id, studentName, guardianUid, type, response, choice) => put(`consentRecords/${id}`, { studentId: studentIds[studentName], classId: "c26-4", guardianUid, consentType: type, definitionId: type, definitionVersion: 1, response, choice, effectiveFrom: "2026-01-12", effectiveTo: "2026-12-31", createdAt: now, createdBy: guardianUid });
consent("cr-aarav-photo", "Aarav Raman", uid.parent, "photoVideo", "granted", "parentPortal");
consent("cr-aarav-website", "Aarav Raman", uid.parent, "websiteIdentification", "granted", null);
consent("cr-aarav-showcase", "Aarav Raman", uid.parent, "publicShowcase", "granted", "publicFirstName");
consent("cr-meiling-photo", "Mei Ling Tan", "seed-guardian", "photoVideo", "declined", "internalOnly");

// ---------- portfolio & Human Excellence (POR-001, CON-002) ----------
const entry = (id, studentName, classId, data) => put(`portfolioEntries/${id}`, meta({ studentId: studentIds[studentName], classId, createdBy: uid.teacher, moderationStatus: null, ...data }));
entry("pe-aarav-1", "Aarav Raman", "c26-4", { date: day(-20), subjectId: "math", title: "Fractions with paper folding", description: "Folded and labelled halves, quarters and eighths, then explained equivalent fractions to the group.", learningObjective: "Recognise equivalent fractions", evidenceUrl: "https://drive.google.com/demo-fractions", teacherObservation: "Explained his reasoning clearly and patiently helped a friend.", studentReflection: "I learned that 2/4 is the same as 1/2.", humanValue: "love", category: "academic", visibility: "family", consentStatus: "granted" });
entry("pe-aarav-2", "Aarav Raman", "c26-4", { date: day(-9), subjectId: "ehv", title: "Recycling corner service project", description: "Organised the class recycling corner for two weeks.", learningObjective: "Care for the environment", teacherObservation: "Took responsibility without being reminded.", studentReflection: "Small jobs done every day make a difference.", humanValue: "rightConduct", category: "contribution", visibility: "showcaseCandidate", consentStatus: "granted" });
entry("pe-meiling-1", "Mei Ling Tan", "c26-4", { date: day(-6), subjectId: "art", title: "Batik-inspired painting", description: "Watercolour piece using traditional batik motifs.", learningObjective: "Use pattern and colour", teacherObservation: "Careful, patient brushwork.", humanValue: "peace", category: "experiences", visibility: "showcaseCandidate", consentStatus: "declined" });
entry("pe-anika-1", "Anika Raman", "c26-2", { date: day(-12), subjectId: "bi", title: "My first book review", description: "Wrote and read aloud a review of a picture book.", learningObjective: "Express opinions in writing", teacherObservation: "Confident reading voice.", humanValue: "truth", category: "academic", visibility: "family", consentStatus: "granted" });
const hv = (id, studentName, classId, value, observation, context) => put(`humanValuesObservations/${id}`, { studentId: studentIds[studentName], classId, academicYearId: YEAR, value, observation, context, type: "positive", familyVisible: true, status: "active", createdAt: now, createdBy: uid.teacher, updatedAt: now, updatedBy: uid.teacher });
hv("hv-aarav-1", "Aarav Raman", "c26-4", "rightConduct", "Helped organise classroom materials without being asked.", "Classroom");
hv("hv-aarav-2", "Aarav Raman", "c26-4", "love", "Comforted a younger pupil who was upset at dismissal.", "Dismissal");
hv("hv-ishaan-1", "Ishaan Kumar", "c26-4", "truth", "Owned up to a mistake in group work and fixed it.", "Group project");
put("studentAchievements/ach-aarav-1", meta({ studentId: studentIds["Aarav Raman"], classId: "c26-4", title: "Zone Mathematics Olympiad — Merit", date: day(-30), category: "academic", visibility: "family", createdBy: uid.teacher }));

// ---------- communication & calendar (DASH-002) ----------
put("announcements/an-welcome", meta({ title: "Welcome to the SRSS Digital Hub", body: "Notices, forms, attendance and your child's portfolio now live here.", audienceKeys: ["school"], category: "school", status: "published", publishedAt: now, createdBy: uid.office }));
put("announcements/an-parents-ptm", meta({ title: "Parent–teacher meetings next month", body: "Booking opens soon. Look out for the request in Actions Required.", audienceKeys: ["role:parents"], category: "parent", status: "published", publishedAt: now, createdBy: uid.office }));
put("announcements/an-class4", meta({ title: "Standard 4: bring a recycled item on Friday", body: "For our Human Values project on caring for the earth.", audienceKeys: ["class:c26-4"], category: "class", status: "published", publishedAt: now, createdBy: uid.teacher }));
put("announcements/an-staff", meta({ title: "Staff briefing: SRSS25 launch roles", body: "Please review your launch-week responsibilities.", audienceKeys: ["role:staff"], category: "staff", status: "published", publishedAt: now, createdBy: uid.office }));
put("events/ev-sports", meta({ title: "Sports Day", date: day(12), startTime: "07:30", location: "School field", audienceKeys: ["school"], category: "sports", publicListing: true, status: "published", consentRequired: "eventMedia" }));
put("events/ev-ptm", meta({ title: "Parent–Teacher Meetings", date: day(26), startTime: "08:00", location: "Classrooms / Google Meet", audienceKeys: ["role:parents", "role:teachers"], category: "parent", publicListing: false, status: "published" }));
put("events/ev-srss25", meta({ title: "SRSS25 Silver Jubilee launch", date: "2027-01-23", startTime: "09:00", location: "School hall", audienceKeys: ["school"], category: "srss25", publicListing: true, status: "published" }));
put(`notificationRecords/nt-1`, { recipientUid: uid.parent, category: "actionRequired", title: "Emergency contact details need confirming", body: "Please confirm Aarav's emergency contacts.", link: "/hub/forms", critical: true, createdAt: now, readAt: null });

// ---------- forms (DASH-001) ----------
put("formDefinitions/fd-emergency", meta({ title: "Emergency contact & collection update", purpose: "Keep emergency and authorised-collection contacts current", ownerRole: "schoolAdmin", audienceKeys: ["role:parents"], fields: ["primaryContact", "secondaryContact", "authorisedCollection"], approvalRequired: true, status: "published" }));
put("formDefinitions/fd-leave", meta({ title: "Staff leave request", purpose: "Request planned leave", ownerRole: "schoolAdmin", audienceKeys: ["role:staff"], fields: ["from", "to", "reason"], approvalRequired: true, status: "published" }));
put("formSubmissions/fs-raman-emergency", { formId: "fd-emergency", formTitle: "Emergency contact & collection update", studentId: studentIds["Aarav Raman"], requestedFromUid: uid.parent, status: "pending", dueDate: day(5), createdAt: now, createdBy: uid.office, updatedAt: now, updatedBy: uid.office });

// ---------- admissions ----------
put("admissionEnquiries/enq-1", { parentName: "Farah Aziz", email: "farah@example.com", phone: "+60 13-111 2222", childName: "Zara", childDateOfBirth: "2020-03-14", enteringStandard: 1, message: "We'd like to visit before applying.", source: "website", status: "new", createdAt: now, consentToContact: true });
put("admissionEnquiries/enq-2", { parentName: "Kevin Ong", email: "kevin@example.com", childName: "Ethan", enteringStandard: 3, source: "website", status: "visitBooked", createdAt: now, consentToContact: true });
put("applications/app-1", meta({ applicantUid: null, status: "underReview", child: { name: "Zara Aziz", dateOfBirth: "2020-03-14" }, guardians: [{ name: "Farah Aziz", email: "farah@example.com", relationship: "mother" }], enteringStandard: 1, submittedAt: now, createdBy: uid.admissions }));
put("applications/app-2", meta({ applicantUid: null, status: "accepted", child: { name: "Hannah Lee", dateOfBirth: "2019-07-02" }, guardians: [{ name: "Grace Lee", email: "grace@example.com", relationship: "mother" }], enteringStandard: 2, startDate: "2027-01-11", submittedAt: now, createdBy: uid.admissions }));

// ---------- academic operations (Stage 1): curriculum, lesson plans, tasks, assessments ----------
// Curriculum topics and Drive links are fictional placeholders, not official KSSR content.
const demoDrive = (kind, fileId, title) => ({ provider: "google", kind, fileId, title, url: kind === "file" ? `https://drive.google.com/file/d/${fileId}/view` : `https://docs.google.com/${kind}/d/${fileId}/edit`, addedBy: uid.coordinator, addedAt: "2026-09-14T00:00:00.000Z" });
put("curriculumPlans/cp-math-4", meta({ standard: 4, subjectId: "math", title: "Mathematics · Standard 4", status: "active", sourceRefs: [demoDrive("file", "1DemoSchemeOfWorkMath4", "Scheme of work (demo)")],
  topics: [["tp-frac", "Fractions", ["Recognise equivalent fractions", "Compare and order fractions"], 1, 3], ["tp-dec", "Decimals", ["Read and write decimals to two places"], 4, 6], ["tp-money", "Money", ["Solve everyday money problems"], 7, 8], ["tp-time", "Time", ["Read 24-hour time"], 9, 10]]
    .map(([id, title, objectives, weekFrom, weekTo]) => ({ id, title, objectives, learningStandards: "", weekFrom, weekTo })), updatedBy: uid.coordinator }));
const lesson = (id, data) => put(`lessonPlans/${id}`, meta({ termId: "ay2026-t3", standard: 4, classId: "c26-4", subjectId: "math", ownerUid: uid.teacher, createdBy: uid.teacher, updatedBy: uid.teacher, curriculumPlanId: "cp-math-4", objectives: "", activities: "", materials: "", assessmentApproach: "", humanValues: [], humanValuesNote: "", reflection: "", attachments: [], primaryDoc: null, primaryDocId: null, contentSource: "hub", ...data }));
lesson("lp-frac-1", { week: 2, date: day(-8), topicId: "tp-frac", topic: "Equivalent fractions with paper folding", objectives: "Recognise equivalent fractions", activities: "Fold paper strips into halves, quarters and eighths; pairs explain equal parts.", materials: "Paper strips, coloured pencils", assessmentApproach: "Exit ticket: two equivalent fractions", humanValues: ["love", "rightConduct"], humanValuesNote: "Helping a partner who is stuck; taking turns.", reflection: "Most pupils secure; three need more practice with eighths.", status: "completed", attachments: [demoDrive("presentation", "1DemoFractionsSlides", "Fractions slides (demo)")] });
lesson("lp-dec-1", { week: 4, date: day(3), topicId: "tp-dec", topic: "Introducing decimals", status: "draft", contentSource: "googleDoc", primaryDoc: demoDrive("document", "1DemoDecimalsPlanDoc", "Decimals lesson plan (demo)"), primaryDocId: "1DemoDecimalsPlanDoc", humanValues: ["truth"] });
const task = (id, data) => put(`learningTasks/${id}`, meta({ standard: 4, classId: "c26-4", subjectId: "math", createdBy: uid.teacher, updatedBy: uid.teacher, instructions: "", attachments: [], classroomUrl: "", ...data }));
task("lt-frac-sheet", { title: "Fractions practice sheet", instructions: "Complete questions 1–10. Show how you folded or drew each fraction.", setDate: day(-1), dueDate: day(3), submissionMode: "hub", status: "published", attachments: [demoDrive("document", "1DemoFractionsWorksheet", "Fractions worksheet (demo)")] });
task("lt-money-shop", { title: "Pretend shop: count the change", instructions: "With someone at home, pay for three items and count the change.", setDate: day(-12), dueDate: day(-5), submissionMode: "none", status: "closed" });
put(`learningTaskProgress/lt-money-shop_${studentIds["Aarav Raman"]}`, { taskId: "lt-money-shop", studentId: studentIds["Aarav Raman"], classId: "c26-4", subjectId: "math", status: "completed", feedback: "Careful counting — and kind to your little sister as the shopkeeper!", feedbackBy: uid.teacher, feedbackAt: now, submissionText: "", submissionUrl: "", createdAt: now, createdBy: uid.teacher, updatedAt: now, updatedBy: uid.teacher });

put("assessmentPeriods/ap-2026-t2", meta({ name: "Term 2 assessment", termId: "ay2026-t2", startDate: "2026-08-17", endDate: "2026-08-28", entryDeadline: "2026-09-02", status: "closed", resultsVisibleToStudents: true, updatedBy: uid.coordinator }));
put("assessmentPeriods/ap-2026-t3", meta({ name: "Term 3 assessment", termId: "ay2026-t3", startDate: day(-3), endDate: day(7), entryDeadline: day(10), status: "open", resultsVisibleToStudents: true, updatedBy: uid.coordinator }));
const MATH_COMPONENTS = [{ id: "wr", name: "Written", type: "written", maxMarks: 60, weight: 60 }, { id: "or", name: "Oral", type: "oral", maxMarks: 20, weight: 20 }, { id: "cw", name: "Coursework", type: "coursework", maxMarks: 20, weight: 20 }];
const BANDS = { preset: "bands", bands: [{ min: 80, grade: "A" }, { min: 65, grade: "B" }, { min: 50, grade: "C" }, { min: 40, grade: "D" }, { min: 0, grade: "E" }] };
const structure = (id, periodId, standard, subjectId, extra = {}) => put(`assessments/${id}`, meta({ periodId, standard, subjectId, name: subjects.find(([sid]) => sid === subjectId)[1], weighting: "weighted", absentPolicy: "exclude", components: MATH_COMPONENTS, grading: BANDS, updatedBy: uid.coordinator, ...extra }));
for (const s of [3, 4, 5]) structure(`as-t3-math-${s}`, "ap-2026-t3", s, "math");
structure("as-t3-ehv-4", "ap-2026-t3", 4, "ehv", { weighting: "rawTotal", components: [{ id: "pj", name: "Project", type: "project", maxMarks: 30 }, { id: "ob", name: "Teacher observation", type: "observation", maxMarks: 20 }], grading: { preset: "marksOnly", bands: [] } });
structure("as-t2-math-4", "ap-2026-t2", 4, "math");
// Mark sheets in different workflow states: Term 2 Std 4 published (families see it), Term 3 Std 3 submitted
// (waiting for the coordinator), Term 3 Std 4 a part-filled draft.
const marksFor = (n, of = 1) => ({ wr: Math.min(60, 30 + ((n * 7) % 31)), or: Math.min(20, 10 + ((n * 3) % 11)), cw: Math.min(20, 12 + ((n * 5) % 9)) * of });
const pct = (m) => Math.round(((m.wr / 60) * 60 + (m.or / 20) * 20 + (m.cw / 20) * 20) * 10) / 10;
const gradeOf = (p) => BANDS.bands.find((band) => p >= band.min).grade;
const sheetSeed = (periodId, assessmentId, standard, status, extra = {}) => {
  const classId = `c26-${standard}`; const sheetId = `${periodId}_${assessmentId}_${classId}`;
  put(`markSheets/${sheetId}`, { periodId, assessmentId, classId, subjectId: "math", standard, academicYearId: YEAR, status, progress: { done: roster[standard].length, total: roster[standard].length }, createdAt: now, createdBy: uid.teacher, updatedAt: now, updatedBy: uid.teacher, ...extra });
  return { classId, sheetId };
};
const t2 = sheetSeed("ap-2026-t2", "as-t2-math-4", 4, "published", { submittedBy: uid.teacher, submittedAt: now, reviewedBy: uid.coordinator, reviewedAt: now, approvedBy: uid.principal, approvedAt: now, publishedBy: uid.principal, publishedAt: now });
const t3s3 = sheetSeed("ap-2026-t3", "as-t3-math-3", 3, "submitted", { submittedBy: uid.teacher, submittedAt: now });
const t3s4 = sheetSeed("ap-2026-t3", "as-t3-math-4", 4, "draft", { progress: { done: 3, total: roster[4].length } });
const resultSeed = ({ classId, sheetId }, periodId, assessmentId, standard, name, i, status, filled = true) => {
  const marks = filled ? marksFor(i + standard) : { wr: i < 3 ? 40 + i : null, or: i < 3 ? 15 : null, cw: i < 3 ? 16 : null };
  const complete = Object.values(marks).every((value) => value != null);
  put(`studentResults/${sheetId}_${studentIds[name]}`, { periodId, assessmentId, classId, subjectId: "math", standard, academicYearId: YEAR, studentId: studentIds[name], sheetId, marks, flags: {}, percent: complete ? pct(marks) : null, grade: complete ? gradeOf(pct(marks)) : null,
    comment: status === "published" && name === "Aarav Raman" ? "Explains his reasoning clearly; keep practising mental arithmetic." : "", status, studentVisible: status === "published", createdAt: now, createdBy: uid.teacher, updatedAt: now, updatedBy: uid.teacher });
};
roster[4].forEach((name, i) => resultSeed(t2, "ap-2026-t2", "as-t2-math-4", 4, name, i, "published"));
roster[3].forEach((name, i) => resultSeed(t3s3, "ap-2026-t3", "as-t3-math-3", 3, name, i, "submitted"));
roster[4].forEach((name, i) => resultSeed(t3s4, "ap-2026-t3", "as-t3-math-4", 4, name, i, "draft", false));

// ---------- fees-lite (phase 2 data, shown on the parent dashboard when present) ----------
put("feeStructures/fs-2026", meta({ name: "2026 tuition", amount: 1800, currency: "MYR", instalments: 3 }));
put("studentFeeAssignments/sfa-aarav", meta({ studentId: studentIds["Aarav Raman"], feeStructureId: "fs-2026", amountDue: 1800, amountPaid: 1200, outstanding: 600, nextDueDate: day(14) }));
put("studentFeeAssignments/sfa-anika", meta({ studentId: studentIds["Anika Raman"], feeStructureId: "fs-2026", amountDue: 1800, amountPaid: 1800, outstanding: 0 }));

// ---------- public website CMS ----------
put("newsPosts/np-1", meta({ title: "Standard 4 recycling corner wins zone award", category: "Achievements", date: day(-3), image: "/assets/photos/processed/sports-day-podium-1600.jpg", excerpt: "Our Standard 4 pupils turned a quiet corner into a working recycling station.", status: "published", ownerRole: "contentEditor", reviewDate: day(60), publishedAt: now }));
put("newsPosts/np-2", meta({ title: "SRSS25: call for alumni stories", category: "School News", date: day(2), excerpt: "Share how SRSS shaped your journey.", status: "review", ownerRole: "contentEditor", reviewDate: day(30) }));

// ---------- commit ----------
for (let i = 0; i < writes.length; i += 400) {
  const batch = db.batch();
  for (const [path, data] of writes.slice(i, i + 400)) batch.set(db.doc(path), data);
  await batch.commit();
}
for (const studentId of new Set(Object.values(studentIds))) await recomputeConsentStatus(db, studentId);
for (const account of accounts) await recomputeUserScope(db, uid[account.key], account.roles);
const guardianIds = writes.filter(([path]) => path.startsWith("guardians/")).map(([path]) => path.split("/")[1]);
for (const guardianId of guardianIds) await refreshGuardianClasses(db, guardianId);
const content = await importLegacyContent(db, { overwrite: true });

console.log(`Seeded ${accounts.length} demo accounts, ${Object.keys(studentIds).length} students, ${writes.length} records and ${content.written} public content documents into the demo-srss emulator.`);
