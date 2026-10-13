// Shared academic context for the Academics and Assessments modules: current year and term, classes,
// subjects and the viewer's teaching pairs (from teacherAssignments, the same source as users.teachingKeys).
import { where } from "firebase/firestore";
import { useAuth } from "../auth/AuthProvider";
import { list, one, useLoad } from "./data";

const isStaffRole = (roles) => roles.some((role) => !["parent", "student"].includes(role));

export function useAcademicContext() {
  const auth = useAuth();
  return useLoad(async () => {
    const settings = await one("settings/school");
    const yearId = settings?.currentAcademicYearId || null;
    const [terms, classes, subjects, assignments, staff] = await Promise.all([
      list("terms", where("academicYearId", "==", yearId)),
      list("classes", where("academicYearId", "==", yearId)),
      list("subjects"),
      isStaffRole(auth.roles) ? list("teacherAssignments", where("academicYearId", "==", yearId)) : [],
      isStaffRole(auth.roles) ? list("staff", where("status", "==", "active")) : [],
    ]);
    const classById = Object.fromEntries(classes.map((cls) => [cls.id, cls]));
    const subjectById = Object.fromEntries(subjects.map((subject) => [subject.id, subject]));
    const staffByUid = Object.fromEntries(staff.filter((person) => person.uid).map((person) => [person.uid, person]));
    const pair = (assignment) => ({ ...assignment, key: `${assignment.classId}|${assignment.subjectId}`, standard: classById[assignment.classId]?.standard, label: `${classById[assignment.classId]?.name ?? assignment.classId} · ${subjectById[assignment.subjectId]?.name ?? assignment.subjectId}` });
    const pairs = assignments.map(pair).filter((item) => item.standard).sort((a, b) => a.standard - b.standard || a.label.localeCompare(b.label));
    return {
      settings, yearId, termId: settings?.currentTermId || null,
      terms: terms.sort((a, b) => String(a.startDate).localeCompare(String(b.startDate))),
      classes: classes.sort((a, b) => a.standard - b.standard), subjects: subjects.sort((a, b) => a.name.localeCompare(b.name)),
      classById, subjectById, staffByUid, pairs, mine: pairs.filter((item) => item.teacherUid === auth.user.uid),
      className: (id) => classById[id]?.name || id || "—",
      subjectName: (id) => subjectById[id]?.name || id || "—",
      personName: (uid) => staffByUid[uid]?.name || "School staff",
    };
  }, [auth.user.uid, auth.roles.join("|")]);
}

// Today's date in the school's zone, as YYYY-MM-DD (avoids UTC rolling the date back before 8 am).
export const schoolToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur" }).format(new Date());
