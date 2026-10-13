import assert from "node:assert/strict";
import { test } from "node:test";
import {
  canEditMarks, canPublishResults, canReviewResults, computeResult, curriculumCoverage, familyTaskView, gradeFor, importMarks,
  lessonStatusOptions, marksTemplateCsv, parseTable, readMarkCell, sheetActions, sheetProgress, taskSummary, teachesSubject,
  validateAssessment, validateCurriculumPlan, validateLessonPlan, validateTask,
} from "../src/hub/logic/academics.js";
import { addAttachment, makeAttachment, parseGoogleUrl } from "../src/hub/logic/workspace.js";

const maths = {
  periodId: "p1", standard: 4, subjectId: "math", weighting: "weighted", absentPolicy: "exclude",
  components: [{ id: "w", name: "Written", maxMarks: 50, weight: 60 }, { id: "o", name: "Oral", maxMarks: 20, weight: 40 }],
  grading: { bands: [{ min: 80, grade: "A" }, { min: 50, grade: "C" }, { min: 0, grade: "E" }] },
};
const roster = [{ id: "s1", studentNumber: "2026-0019", name: "Aarav Raman" }, { id: "s2", studentNumber: "2026-0020", name: "Mei Ling Tan" }];

// ---------- assessment configuration ----------
test("assessment weights must total 100% and components need names and maximum marks", () => {
  assert.deepEqual(validateAssessment(maths), []);
  assert.match(validateAssessment({ ...maths, components: [{ id: "w", name: "Written", maxMarks: 50, weight: 60 }] }).join(" "), /total 100%/);
  assert.match(validateAssessment({ ...maths, components: [...maths.components, { id: "x", name: "written", maxMarks: 10, weight: 0 }] }).join(" "), /Two components/);
  assert.match(validateAssessment({ ...maths, components: [{ id: "w", name: "Written", maxMarks: 0, weight: 100 }] }).join(" "), /maximum marks/);
  // A raw-total assessment does not need weights.
  assert.deepEqual(validateAssessment({ ...maths, weighting: "rawTotal", components: [{ id: "w", name: "Written", maxMarks: 50 }] }), []);
});

test("grade bands must cover 0% and have unique starting points", () => {
  assert.match(validateAssessment({ ...maths, grading: { bands: [{ min: 50, grade: "Pass" }] } }).join(" "), /start at 0%/);
  assert.match(validateAssessment({ ...maths, grading: { bands: [{ min: 0, grade: "E" }, { min: 0, grade: "D" }] } }).join(" "), /same percentage/);
  assert.equal(gradeFor(79.9, maths.grading.bands), "C");
  assert.equal(gradeFor(80, maths.grading.bands), "A");
  assert.equal(gradeFor(80, []), null);
});

// ---------- marks ----------
test("mark cells accept numbers, A for absent and EX for exempt; reject out-of-range values", () => {
  assert.deepEqual(readMarkCell("42", 50), { mark: 42, flag: null, error: null });
  assert.deepEqual(readMarkCell(" a ", 50), { mark: null, flag: "absent", error: null });
  assert.deepEqual(readMarkCell("EX", 50), { mark: null, flag: "exempt", error: null });
  assert.deepEqual(readMarkCell("", 50), { mark: null, flag: null, error: null });
  assert.match(readMarkCell("51", 50).error, /above the maximum/);
  assert.match(readMarkCell("-3", 50).error, /not a mark/);
  assert.match(readMarkCell("12.25", 50).error, /one decimal/);
});

test("weighted results, exemptions and the absent policy", () => {
  assert.deepEqual(computeResult(maths, { marks: { w: 40, o: 20 } }), { percent: 88, grade: "A", complete: true, missing: [] });
  // Exempt and (by default) absent components are left out and the remaining weight re-normalised.
  assert.equal(computeResult(maths, { marks: { w: 40 }, flags: { o: "exempt" } }).percent, 80);
  assert.equal(computeResult(maths, { marks: { w: 40 }, flags: { o: "absent" } }).percent, 80);
  assert.equal(computeResult({ ...maths, absentPolicy: "zero" }, { marks: { w: 40 }, flags: { o: "absent" } }).percent, 48);
  // Missing marks keep the result incomplete rather than guessing.
  assert.deepEqual(computeResult(maths, { marks: { w: 40 } }).missing, ["o"]);
  assert.equal(computeResult({ ...maths, weighting: "rawTotal" }, { marks: { w: 25, o: 10 } }).percent, 50);
  assert.equal(sheetProgress(maths, roster, { s1: { marks: { w: 1, o: 1 } } }).complete, false);
});

// ---------- workflow ----------
test("results workflow: teacher submits, coordinator reviews or returns, leadership approves and publishes", () => {
  const to = (actions) => actions.map((action) => action.to);
  assert.deepEqual(to(sheetActions(["teacher"], "draft", { teaches: true, complete: true })), ["submitted"]);
  assert.equal(sheetActions(["teacher"], "draft", { teaches: true, complete: false })[0].disabled, true);
  assert.deepEqual(to(sheetActions(["teacher"], "submitted", { teaches: true })), []);
  assert.deepEqual(to(sheetActions(["academicCoordinator"], "submitted")), ["reviewed", "draft"]);
  assert.equal(sheetActions(["academicCoordinator"], "submitted").find((action) => action.to === "draft").note, true);
  assert.deepEqual(to(sheetActions(["academicCoordinator"], "reviewed")), ["draft"]);
  assert.deepEqual(to(sheetActions(["leadership"], "reviewed")), ["approved", "draft"]);
  assert.deepEqual(to(sheetActions(["leadership"], "approved")), ["published", "draft"]);
  assert.deepEqual(to(sheetActions(["leadership"], "published")), ["locked"]);
  assert.equal(canPublishResults(["schoolAdmin"]), false);
  assert.equal(canReviewResults(["leadership"]), false);
  assert.equal(canEditMarks("submitted", true), false);
  assert.equal(canEditMarks(undefined, true), true);
  assert.equal(canEditMarks("draft", false), false);
});

test("subject-level teaching scope", () => {
  const scope = { teachingKeys: ["c4|math", "c4|ehv"] };
  assert.equal(teachesSubject(scope, "c4", "math"), true);
  assert.equal(teachesSubject(scope, "c4", "bm"), false);
  assert.equal(teachesSubject({}, "c4", "math"), false);
});

// ---------- Sheets interchange ----------
test("the marks template round-trips through a controlled import", () => {
  const csv = marksTemplateCsv(maths, roster, { s1: { marks: { w: 40, o: 18 }, comment: "Careful work" } });
  assert.match(csv.split("\n")[0], /"Written \(\/50\)","Oral \(\/20\)"/);
  const result = importMarks(csv, maths, roster);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.rows[0], { studentId: "s1", marks: { w: 40, o: 18 }, flags: {}, comment: "Careful work" });
});

test("pasting from Google Sheets (tab-separated) reports every problem and imports only valid rows", () => {
  const pasted = ["Name\tWritten\tOral", "Aarav Raman\t45\tA", "Mei Ling Tan\t60\t10", "Someone Else\t10\t10", "Aarav Raman\t1\t1"].join("\n");
  const result = importMarks(pasted, maths, roster);
  assert.equal(result.rows.length, 1);
  assert.deepEqual(result.rows[0].flags, { o: "absent" });
  assert.equal(result.errors.length, 3);
  assert.match(result.errors.join(" "), /above the maximum/);
  assert.match(result.errors.join(" "), /not a pupil in this class/);
  assert.match(result.errors.join(" "), /more than once/);
  assert.match(importMarks("Name\tUnknown\nAarav Raman\t3", maths, roster).errors[0], /No column matches/);
});

test("CSV parsing handles quotes, commas and Windows line endings", () => {
  assert.deepEqual(parseTable('a,"b, c","d ""e"""\r\n1,2,3'), [["a", "b, c", 'd "e"'], ["1", "2", "3"]]);
});

// ---------- curriculum, lessons, tasks ----------
test("curriculum coverage counts topics with a completed or reviewed lesson", () => {
  const plan = { topics: [{ id: "t1", title: "Fractions" }, { id: "t2", title: "Decimals" }, { id: "t3", title: "Money" }] };
  const lessons = [{ topicId: "t1", status: "completed", date: "2026-10-01" }, { topicId: "t2", status: "draft" }, { topicId: "t1", status: "reviewed", date: "2026-10-05" }];
  const coverage = curriculumCoverage(plan, lessons);
  assert.equal(coverage.percent, 33);
  assert.equal(coverage.topics[0].lastDate, "2026-10-05");
  assert.equal(coverage.topics[1].covered, false);
  assert.equal(curriculumCoverage(null, []).percent, null);
  assert.match(validateCurriculumPlan({ standard: 4, subjectId: "math", title: "x", topics: [{ title: "" }] }).join(" "), /Topic 1/);
});

test("lesson plan statuses: the owner never reviews; only the coordinator reviews or reopens", () => {
  assert.deepEqual(lessonStatusOptions({ owner: true }, "completed"), ["draft", "ready", "completed"]);
  assert.deepEqual(lessonStatusOptions({ owner: true, coordinator: true }, "completed"), ["draft", "ready", "completed"]);
  assert.deepEqual(lessonStatusOptions({ owner: true }, "reviewed"), ["reviewed"]);
  assert.deepEqual(lessonStatusOptions({ coordinator: true }, "completed"), ["completed", "reviewed"]);
  assert.deepEqual(lessonStatusOptions({ coordinator: true }, "draft"), ["draft"]);
  assert.match(validateLessonPlan({ classId: "c4", subjectId: "math", topic: "Fractions", date: "2026-10-01", contentSource: "googleDoc" }).join(" "), /Google Doc/);
});

test("learning tasks: validation, completion summary and the family view", () => {
  assert.match(validateTask({ classId: "c4", subjectId: "math", title: "Worksheet", status: "published" }).join(" "), /due date/);
  assert.match(validateTask({ classId: "c4", subjectId: "math", title: "W", status: "draft", setDate: "2026-10-10", dueDate: "2026-10-01" }).join(" "), /before the set date/);
  assert.match(validateTask({ classId: "c4", subjectId: "math", title: "W", status: "draft", submissionMode: "classroom", classroomUrl: "https://evil.example/" }).join(" "), /classroom.google.com/);
  const summary = taskSummary(roster, [{ studentId: "s1", status: "completed" }]);
  assert.deepEqual([summary.counts.completed, summary.notYet], [1, 1]);
  const tasks = [{ id: "t1", status: "published", dueDate: "2026-10-01" }, { id: "t2", status: "draft", dueDate: "2026-10-02" }, { id: "t3", status: "published", dueDate: "2026-10-01" }];
  const view = familyTaskView(tasks, [{ taskId: "t3", studentId: "s1", status: "submitted" }], "s1", "2026-10-05");
  assert.deepEqual(view.map((task) => [task.id, task.overdue]), [["t1", true], ["t3", false]]);
});

// ---------- Workspace links ----------
test("Google links are recognised, canonicalised and look-alikes rejected", () => {
  assert.deepEqual(parseGoogleUrl("https://docs.google.com/document/d/1AbCdEfGhIjKlMnOp/edit?usp=sharing"), { kind: "document", fileId: "1AbCdEfGhIjKlMnOp", published: false, url: "https://docs.google.com/document/d/1AbCdEfGhIjKlMnOp/edit" });
  assert.equal(parseGoogleUrl("https://docs.google.com/spreadsheets/u/1/d/1AbCdEfGhIjKlMnOp/edit#gid=0").kind, "spreadsheet");
  assert.equal(parseGoogleUrl("https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view").url, "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view");
  assert.equal(parseGoogleUrl("https://drive.google.com/drive/u/0/folders/1AbCdEfGhIjKlMnOp").kind, "folder");
  assert.equal(parseGoogleUrl("https://drive.google.com/open?id=1AbCdEfGhIjKlMnOp").kind, "file");
  assert.equal(parseGoogleUrl("https://docs.google.com/forms/d/e/1FAIpQLSdAbCdEfGhIj/viewform").url, "https://docs.google.com/forms/d/e/1FAIpQLSdAbCdEfGhIj/viewform");
  assert.equal(parseGoogleUrl("https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view?resourcekey=0-abc").url, "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view?resourcekey=0-abc");
  for (const bad of ["http://docs.google.com/document/d/1AbCdEfGhIjKlMnOp/edit", "https://docs.google.com.evil.test/document/d/1AbCdEfGhIjKlMnOp", "https://evil.test/?https://docs.google.com/document/d/1AbCdEfGhIjKlMnOp", "javascript:alert(1)", "not a link"]) assert.equal(parseGoogleUrl(bad), null, bad);
});

test("attachments carry structured metadata, de-duplicate and respect the limit", () => {
  const parsed = parseGoogleUrl("https://docs.google.com/presentation/d/1AbCdEfGhIjKlMnOp/edit");
  const attachment = makeAttachment(parsed, { title: "  Fractions slides ", uid: "teacher", now: new Date("2026-10-13T00:00:00Z") });
  assert.deepEqual(attachment, { provider: "google", kind: "presentation", fileId: "1AbCdEfGhIjKlMnOp", title: "Fractions slides", url: "https://docs.google.com/presentation/d/1AbCdEfGhIjKlMnOp/edit", addedBy: "teacher", addedAt: "2026-10-13T00:00:00.000Z" });
  assert.equal(makeAttachment(parsed, {}).title, "Google Slides");
  assert.throws(() => makeAttachment(null, {}), /Paste a link/);
  assert.equal(addAttachment([attachment], attachment).length, 1);
  const many = Array.from({ length: 20 }, (_, i) => ({ fileId: `f${i}` }));
  assert.throws(() => addAttachment(many, attachment), /up to 20/);
});
