// Academic operations — pure logic for curriculum coverage, lesson plans, learning tasks, assessment
// configuration, marks entry and the results approval workflow. Free of Firebase so `npm test` covers it.
// firestore.rules enforces the same workflow; keep the two in step (see "ASSESSMENTS" in the rules).

// ---------- roles ----------
const has = (roles, list) => (roles || []).some((role) => list.includes(role));
export const isTeaching = (roles) => has(roles, ["teacher", "classTeacher", "specialistTeacher"]);
export const isCoordinator = (roles) => has(roles, ["academicCoordinator"]);
export const canConfigureCurriculum = (roles) => has(roles, ["academicCoordinator"]);
export const canConfigureAssessments = (roles) => has(roles, ["academicCoordinator", "schoolAdmin"]);
export const canReviewResults = (roles) => has(roles, ["academicCoordinator"]);
// "Authorised Admin approves and publishes" — the Headmistress / leadership, as for report cards.
export const canPublishResults = (roles) => has(roles, ["leadership"]);

// Teaching pairs ("classId|subjectId") come from teacherAssignments and are mirrored in users/{uid}.teachingKeys.
export const teachingKey = (classId, subjectId) => `${classId}|${subjectId}`;
export const teachesSubject = (scope, classId, subjectId) => (scope?.teachingKeys || []).includes(teachingKey(classId, subjectId));

// ---------- curriculum ----------
// Coverage for one class: a topic is covered once a lesson linked to it is completed (or reviewed).
export function curriculumCoverage(plan, lessons) {
  const topics = (plan?.topics || []).map((topic) => {
    const linked = lessons.filter((lesson) => lesson.topicId === topic.id);
    const done = linked.filter((lesson) => ["completed", "reviewed"].includes(lesson.status));
    return { ...topic, lessonCount: linked.length, covered: done.length > 0, lastDate: done.map((lesson) => lesson.date).filter(Boolean).sort().at(-1) || null };
  });
  const covered = topics.filter((topic) => topic.covered).length;
  return { topics, covered, total: topics.length, percent: topics.length ? Math.round((covered / topics.length) * 100) : null };
}

export function validateCurriculumPlan(plan) {
  const errors = [];
  if (!plan.standard) errors.push("Choose a Standard.");
  if (!plan.subjectId) errors.push("Choose a subject.");
  if (!String(plan.title || "").trim()) errors.push("Give the plan a title.");
  (plan.topics || []).forEach((topic, index) => {
    if (!String(topic.title || "").trim()) errors.push(`Topic ${index + 1} needs a title.`);
    if (topic.weekFrom && topic.weekTo && Number(topic.weekTo) < Number(topic.weekFrom)) errors.push(`Topic ${index + 1}: the last week is before the first.`);
  });
  return errors;
}

// ---------- lesson plans ----------
export const LESSON_STATUSES = [["draft", "Draft"], ["ready", "Ready"], ["completed", "Completed"], ["reviewed", "Reviewed"]];
export const LESSON_LABELS = Object.fromEntries(LESSON_STATUSES);

// The owner moves freely between draft, ready and completed; reviewing belongs to the coordinator (never
// their own plan), and a reviewed plan is closed to the owner unless the coordinator reopens it.
export function lessonStatusOptions({ owner, coordinator }, status = "draft") {
  if (owner) return status === "reviewed" ? ["reviewed"] : ["draft", "ready", "completed"];
  if (coordinator) return status === "completed" ? ["completed", "reviewed"] : status === "reviewed" ? ["reviewed", "completed"] : [status];
  return [status];
}

export function validateLessonPlan(plan) {
  const errors = [];
  if (!plan.classId || !plan.subjectId) errors.push("Choose one of your classes and subjects.");
  if (!String(plan.topic || "").trim()) errors.push("Add the lesson topic.");
  if (!plan.date && !plan.week) errors.push("Add a date or a teaching week.");
  if (plan.contentSource === "googleDoc" && !plan.primaryDocId) errors.push("Attach the Google Doc that holds this plan, or choose to write the plan here.");
  return errors;
}

// ---------- learning tasks ----------
export const TASK_STATUSES = [["draft", "Draft"], ["published", "Published"], ["closed", "Closed"]];
export const SUBMISSION_MODES = [["none", "No hand-in (done in class or at home)"], ["hub", "Pupils hand in through the hub"], ["classroom", "Google Classroom (Classroom is the record)"]];
export const PROGRESS_STATUSES = [["submitted", "Handed in"], ["completed", "Completed"], ["incomplete", "Not completed"], ["excused", "Excused"]];
export const PROGRESS_LABELS = Object.fromEntries(PROGRESS_STATUSES);

export function validateTask(task) {
  const errors = [];
  if (!task.classId || !task.subjectId) errors.push("Choose one of your classes and subjects.");
  if (!String(task.title || "").trim()) errors.push("Give the task a title.");
  if (task.status !== "draft" && !task.dueDate) errors.push("Set a due date before publishing.");
  if (task.setDate && task.dueDate && task.dueDate < task.setDate) errors.push("The due date is before the set date.");
  if (task.submissionMode === "classroom" && task.classroomUrl && !/^https:\/\/classroom\.google\.com\//.test(task.classroomUrl)) errors.push("The Classroom link must start with https://classroom.google.com/.");
  return errors;
}

export function taskSummary(roster, progress) {
  const counts = Object.fromEntries(PROGRESS_STATUSES.map(([status]) => [status, 0]));
  const byStudent = new Map(progress.map((item) => [item.studentId, item]));
  for (const student of roster) { const status = byStudent.get(student.id)?.status; if (status in counts) counts[status] += 1; }
  const recorded = Object.values(counts).reduce((sum, n) => sum + n, 0);
  return { counts, notYet: roster.length - recorded, total: roster.length };
}

// What a family sees for a task: published ones only, overdue flag, newest due date first.
export function familyTaskView(tasks, progress, studentId, today) {
  return tasks.filter((task) => ["published", "closed"].includes(task.status)).map((task) => {
    const mine = progress.find((item) => item.taskId === task.id && item.studentId === studentId) || null;
    const done = ["submitted", "completed", "excused"].includes(mine?.status);
    return { ...task, progress: mine, overdue: Boolean(task.dueDate && task.dueDate < today && !done && task.status === "published") };
  }).sort((a, b) => String(b.dueDate || "").localeCompare(String(a.dueDate || "")));
}

// ---------- assessment configuration ----------
export const COMPONENT_TYPES = [["written", "Written assessment"], ["oral", "Oral assessment"], ["coursework", "Coursework"], ["project", "Project"], ["practical", "Practical"], ["observation", "Teacher observation"]];
export const PERIOD_STATUSES = [["planned", "Planned"], ["open", "Open for entry"], ["closed", "Closed"]];
// Starting points only — the school edits the bands to its own policy. No official descriptors are implied.
export const GRADING_PRESETS = {
  bands: { label: "Percentage bands (edit to school policy)", bands: [{ min: 80, grade: "A" }, { min: 65, grade: "B" }, { min: 50, grade: "C" }, { min: 40, grade: "D" }, { min: 0, grade: "E" }] },
  marksOnly: { label: "Marks and percentage only (no grade)", bands: [] },
};

const close = (a, b) => Math.abs(a - b) < 0.001;

export function validateAssessment(assessment) {
  const errors = [];
  if (!assessment.periodId) errors.push("Choose an assessment period.");
  if (!assessment.standard) errors.push("Choose a Standard.");
  if (!assessment.subjectId) errors.push("Choose a subject.");
  const components = assessment.components || [];
  if (!components.length) errors.push("Add at least one assessment component.");
  const names = new Set();
  components.forEach((component, index) => {
    const name = String(component.name || "").trim();
    if (!name) errors.push(`Component ${index + 1} needs a name.`);
    else if (names.has(name.toLowerCase())) errors.push(`Two components are called “${name}”.`);
    names.add(name.toLowerCase());
    const max = Number(component.maxMarks);
    if (!(max > 0 && max <= 1000)) errors.push(`${name || `Component ${index + 1}`}: maximum marks must be between 1 and 1000.`);
    if (assessment.weighting === "weighted" && !(Number(component.weight) > 0)) errors.push(`${name || `Component ${index + 1}`}: give it a weight above 0.`);
  });
  if (assessment.weighting === "weighted" && components.length) {
    const total = components.reduce((sum, component) => sum + (Number(component.weight) || 0), 0);
    if (!close(total, 100)) errors.push(`Component weights add up to ${Math.round(total * 100) / 100}%; they must total 100%.`);
  }
  const bands = assessment.grading?.bands || [];
  if (bands.length) {
    const mins = bands.map((band) => Number(band.min));
    if (mins.some((min) => !(min >= 0 && min <= 100))) errors.push("Grade bands must start between 0 and 100%.");
    if (new Set(mins).size !== mins.length) errors.push("Two grade bands start at the same percentage.");
    if (!mins.includes(0)) errors.push("One grade band must start at 0% so every result receives a grade.");
    if (bands.some((band) => !String(band.grade || "").trim())) errors.push("Every grade band needs a grade label.");
  }
  return errors;
}

// ---------- marks ----------
export const FLAG_LABELS = { absent: "Absent", exempt: "Exempt" };
const FLAG_INPUTS = { a: "absent", abs: "absent", absent: "absent", ex: "exempt", exempt: "exempt", x: "exempt" };

// Reads one typed or imported cell: a mark, "A"/"ABS" for absent, "EX" for exempt, or blank.
export function readMarkCell(raw, maxMarks) {
  const text = String(raw ?? "").trim();
  if (!text) return { mark: null, flag: null, error: null };
  const flag = FLAG_INPUTS[text.toLowerCase()];
  if (flag) return { mark: null, flag, error: null };
  if (!/^\d+(\.\d+)?$/.test(text)) return { mark: null, flag: null, error: `“${text}” is not a mark. Use a number, A (absent) or EX (exempt).` };
  const mark = Number(text);
  if (mark > Number(maxMarks)) return { mark: null, flag: null, error: `${mark} is above the maximum of ${maxMarks}.` };
  if (Math.round(mark * 10) !== mark * 10) return { mark: null, flag: null, error: "Use at most one decimal place." };
  return { mark, flag: null, error: null };
}

export const cellText = (entry, componentId) => (entry?.flags?.[componentId] === "absent" ? "A" : entry?.flags?.[componentId] === "exempt" ? "EX" : entry?.marks?.[componentId] ?? "");

export function gradeFor(percent, bands) {
  if (percent == null || !bands?.length) return null;
  return [...bands].sort((a, b) => Number(b.min) - Number(a.min)).find((band) => percent >= Number(band.min))?.grade ?? null;
}

// Percentage for one pupil. Exempt components are left out; absent ones follow the assessment's policy
// ("exclude" like an exemption, or "zero"). Missing marks leave the result incomplete (no percentage).
export function computeResult(assessment, entry) {
  const included = []; const missing = [];
  for (const component of assessment.components || []) {
    const flag = entry?.flags?.[component.id];
    if (flag === "exempt" || (flag === "absent" && assessment.absentPolicy !== "zero")) continue;
    const mark = flag === "absent" ? 0 : entry?.marks?.[component.id];
    if (mark == null || mark === "") { missing.push(component.id); continue; }
    included.push({ ...component, mark: Number(mark) });
  }
  if (missing.length) return { percent: null, grade: null, complete: false, missing };
  if (!included.length) return { percent: null, grade: null, complete: true, missing };
  const ratio = assessment.weighting === "weighted"
    ? included.reduce((sum, c) => sum + (c.mark / Number(c.maxMarks)) * Number(c.weight), 0) / included.reduce((sum, c) => sum + Number(c.weight), 0)
    : included.reduce((sum, c) => sum + c.mark, 0) / included.reduce((sum, c) => sum + Number(c.maxMarks), 0);
  const percent = Math.round(ratio * 1000) / 10;
  return { percent, grade: gradeFor(percent, assessment.grading?.bands), complete: true, missing };
}

export function sheetProgress(assessment, roster, entries) {
  const done = roster.filter((student) => computeResult(assessment, entries[student.id]).complete).length;
  return { done, total: roster.length, complete: roster.length > 0 && done === roster.length };
}

// ---------- approval workflow ----------
export const RESULT_STATUSES = [["draft", "Draft"], ["submitted", "Submitted"], ["reviewed", "Reviewed"], ["approved", "Approved"], ["published", "Published"], ["locked", "Locked"]];
export const RESULT_LABELS = Object.fromEntries(RESULT_STATUSES);
export const markSheetId = (periodId, assessmentId, classId) => `${periodId}_${assessmentId}_${classId}`;

// Actions available on a mark sheet. `note: true` asks for a reason (returns always explain what to fix).
export function sheetActions(roles, status = "draft", { teaches = false, complete = false } = {}) {
  const actions = [];
  if (teaches && status === "draft") actions.push({ to: "submitted", label: "Submit for review", disabled: !complete, hint: complete ? null : "Enter a mark, A or EX for every pupil first." });
  if (canReviewResults(roles) && status === "submitted") actions.push({ to: "reviewed", label: "Mark as reviewed" }, { to: "draft", label: "Return for correction", note: true, quiet: true });
  if (canReviewResults(roles) && status === "reviewed" && !canPublishResults(roles)) actions.push({ to: "draft", label: "Return for correction", note: true, quiet: true });
  if (canPublishResults(roles)) {
    if (status === "reviewed") actions.push({ to: "approved", label: "Approve results" });
    if (status === "approved") actions.push({ to: "published", label: "Publish to families" });
    if (status === "published") actions.push({ to: "locked", label: "Lock results" });
    if (["reviewed", "approved"].includes(status)) actions.push({ to: "draft", label: "Return for correction", note: true, quiet: true });
  }
  return actions;
}

export const canEditMarks = (status, teaches) => teaches && (!status || status === "draft");
export const canAmend = (roles, status) => canPublishResults(roles) && ["published", "locked"].includes(status);

// ---------- Google Sheets / CSV interchange ----------
const quote = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

// Template for preparing marks in Google Sheets (File → Import) — one row per pupil, one column per component.
export function marksTemplateCsv(assessment, roster, entries = {}) {
  const header = ["Student ID", "Name", ...assessment.components.map((c) => `${c.name} (/${c.maxMarks})`), "Comment"];
  const rows = roster.map((student) => [student.studentNumber || student.id, student.name, ...assessment.components.map((c) => cellText(entries[student.id], c.id)), entries[student.id]?.comment || ""]);
  return [header, ...rows].map((row) => row.map(quote).join(",")).join("\n");
}

// Minimal CSV/TSV reader: tab-separated when pasted from Sheets, comma-separated from a downloaded file.
export function parseTable(text) {
  const source = String(text || "").replace(/^﻿/, "").replace(/\r\n?/g, "\n").trim();
  if (!source) return [];
  const delimiter = source.split("\n")[0].includes("\t") ? "\t" : ",";
  const rows = []; let row = []; let cell = ""; let quoted = false;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') { cell += '"'; i++; } else if (char === '"') quoted = false; else cell += char;
    } else if (char === '"' && !cell) quoted = true;
    else if (char === delimiter) { row.push(cell); cell = ""; }
    else if (char === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += char;
  }
  row.push(cell); rows.push(row);
  return rows.map((cells) => cells.map((value) => value.trim()));
}

const normalise = (value) => String(value || "").toLowerCase().replace(/\(\s*\/?\s*\d+(\.\d+)?\s*\)/g, "").replace(/\s+/g, " ").trim();

// Controlled import: matches pupils by Student ID (then exact name) and components by column name.
// Returns the valid rows and every problem found; nothing is written until the teacher confirms, and
// imported marks always land in the draft sheet.
export function importMarks(text, assessment, roster) {
  const table = parseTable(text);
  const errors = [];
  if (table.length < 2) return { rows: [], errors: ["Paste the header row and at least one pupil row."], matchedComponents: [] };
  const header = table[0].map(normalise);
  const idColumn = header.findIndex((h) => ["student id", "id", "student number"].includes(h));
  const nameColumn = header.findIndex((h) => ["name", "student", "pupil", "student name"].includes(h));
  const commentColumn = header.findIndex((h) => h === "comment" || h === "comments");
  const columns = assessment.components.map((component) => ({ component, index: header.indexOf(normalise(component.name)) })).filter((item) => item.index >= 0);
  if (idColumn < 0 && nameColumn < 0) errors.push("Add a “Student ID” or “Name” column so each row can be matched to a pupil.");
  if (!columns.length) errors.push(`No column matches a component name (${assessment.components.map((c) => c.name).join(", ")}).`);
  if (errors.length) return { rows: [], errors, matchedComponents: [] };
  const byNumber = new Map(roster.map((student) => [String(student.studentNumber || student.id).toLowerCase(), student]));
  const byName = new Map(roster.map((student) => [student.name.toLowerCase(), student]));
  const rows = []; const seen = new Set();
  table.slice(1).forEach((cells, offset) => {
    const line = offset + 2;
    if (cells.every((cell) => !cell)) return;
    const student = (idColumn >= 0 && byNumber.get(String(cells[idColumn] || "").toLowerCase())) || (nameColumn >= 0 && byName.get(String(cells[nameColumn] || "").toLowerCase()));
    if (!student) { errors.push(`Row ${line}: “${cells[idColumn] ?? cells[nameColumn] ?? ""}” is not a pupil in this class.`); return; }
    if (seen.has(student.id)) { errors.push(`Row ${line}: ${student.name} appears more than once.`); return; }
    const marks = {}; const flags = {}; let bad = false;
    for (const { component, index } of columns) {
      const cell = readMarkCell(cells[index], component.maxMarks);
      if (cell.error) { errors.push(`Row ${line}, ${component.name}: ${cell.error}`); bad = true; }
      marks[component.id] = cell.mark; if (cell.flag) flags[component.id] = cell.flag;
    }
    if (bad) return;
    seen.add(student.id);
    rows.push({ studentId: student.id, marks, flags, ...(commentColumn >= 0 ? { comment: String(cells[commentColumn] || "").slice(0, 1000) } : {}) });
  });
  return { rows, errors, matchedComponents: columns.map(({ component }) => component.id) };
}

// Firestore batches are limited in how many documents their rules may look up; write in small groups.
export const chunk = (items, size = 8) => Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size));
