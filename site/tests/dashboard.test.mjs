import assert from "node:assert/strict";
import { test } from "node:test";
import { attendanceByClass, attendanceSummary, completeness, followUpPrompts, nextClass, parentActions } from "../src/hub/logic/dashboard.js";

test("attendance rate counts only absences against it", () => {
  const summary = attendanceSummary([{ status: "present" }, { status: "late" }, { status: "absent" }, { status: "excused" }]);
  assert.equal(summary.rate, 75);
  assert.equal(summary.counts.absent, 1);
  assert.equal(attendanceSummary([]).rate, null);
});

test("ATT-002: 'not submitted' is distinct from 'submitted, all present'", () => {
  const classes = [{ id: "c1", name: "1A" }, { id: "c2", name: "2A" }, { id: "c3", name: "3A" }];
  const sessions = [{ classId: "c1", date: "2026-10-09", status: "submitted" }, { classId: "c2", date: "2026-10-09", status: "open" }];
  assert.deepEqual(attendanceByClass(classes, sessions, "2026-10-09").map((row) => row.state), ["submitted", "open", "missing"]);
});

test("follow-up prompts need three absences within 30 days and never label a child", () => {
  const today = new Date("2026-10-09");
  const records = ["2026-10-01", "2026-10-03", "2026-10-07", "2026-08-01"].map((date) => ({ studentId: "s1", status: "absent", date }));
  const prompts = followUpPrompts(records, { today });
  assert.equal(prompts.length, 1);
  assert.equal(prompts[0].count, 3);
  assert.match(prompts[0].message, /review suggested/);
  assert.equal(followUpPrompts(records.slice(0, 2), { today }).length, 0);
});

test("DASH-001: actions cover missing consent, pending forms and outstanding fees, soonest first", () => {
  const actions = parentActions({
    children: [{ id: "a", name: "Aarav" }, { id: "b", name: "Anika" }],
    consentDefinitions: [{ type: "photoVideo", title: "Photo & video" }],
    consentStatus: { a: { types: { photoVideo: { response: "granted" } } } },
    formRequests: [{ id: "f1", studentId: "a", status: "pending", formTitle: "Emergency contacts", dueDate: "2026-10-12" }, { id: "f2", status: "submitted" }],
    fees: [{ studentId: "a", outstanding: 600, nextDueDate: "2026-10-20" }, { studentId: "b", outstanding: 0 }],
    today: new Date("2026-10-09"),
  });
  assert.deepEqual(actions.map((action) => action.kind), ["form", "payment", "consent"]);
  assert.equal(actions[2].studentId, "b");
  const grouped = parentActions({ children: [{ id: "b", name: "Anika" }], consentDefinitions: [{ type: "photoVideo", title: "Photo & video" }, { type: "eventMedia", title: "Event media" }], consentStatus: {}, formRequests: [], fees: [] });
  assert.equal(grouped.length, 1);
  assert.match(grouped[0].title, /2 consent choices/);
  assert.equal(actions.every((action) => !action.overdue), true);
});

test("record completeness lists what is missing", () => {
  const result = completeness({ completeness: { emergencyContact: true, medical: false, photoConsent: true, birthCertificate: true } });
  assert.equal(result.complete, false);
  assert.deepEqual(result.missing, ["Medical declaration"]);
  assert.equal(result.percent, 75);
});

test("next class finds the next timetable slot", () => {
  const monday0815 = new Date("2026-10-05T08:15:00");
  const assignments = [{ id: "m4", classId: "c4", slots: [{ day: 1, time: "08:30" }, { day: 3, time: "10:30" }] }, { id: "m5", classId: "c5", slots: [{ day: 2, time: "08:30" }] }];
  assert.equal(nextClass(assignments, monday0815).classId, "c4");
  const monday1200 = new Date("2026-10-05T12:00:00");
  assert.equal(nextClass(assignments, monday1200).classId, "c5");
});
