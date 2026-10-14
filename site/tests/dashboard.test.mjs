import assert from "node:assert/strict";
import { test } from "node:test";
import { attendanceByClass, attendanceSummary, completeness, followUpPrompts, nextClass, parentActions } from "../src/hub/logic/dashboard.js";

test("attendance %: authorised and unauthorised absences both count as missed; X is not counted (policy §11)", () => {
  const summary = attendanceSummary([{ status: "present" }, { status: "late" }, { status: "absent" }, { status: "excused" }, { code: "X" }]);
  assert.equal(summary.rate, 50);
  assert.equal(summary.counts.absent, 2);
  assert.equal(summary.counted, 4);
  assert.equal(attendanceSummary([]).rate, null);
});

test("ATT-002: 'not submitted' is distinct from 'submitted, all present'", () => {
  const classes = [{ id: "c1", name: "1A" }, { id: "c2", name: "2A" }, { id: "c3", name: "3A" }];
  const sessions = [{ classId: "c1", date: "2026-10-09", status: "submitted" }, { classId: "c2", date: "2026-10-09", status: "open" }];
  assert.deepEqual(attendanceByClass(classes, sessions, "2026-10-09").map((row) => row.state), ["submitted", "open", "missing"]);
});

test("follow-up prompts follow the attendance policy and never label a child", () => {
  const today = new Date("2026-10-30T12:00:00");
  const lates = ["01", "02", "05", "06", "07"].map((day) => ({ studentId: "late", code: "L", date: `2026-10-${day}` }));
  const unauthorised = ["01", "02", "05"].map((day) => ({ studentId: "away", code: "O", date: `2026-10-${day}` }));
  const kinds = followUpPrompts([...lates, ...unauthorised], { today }).map((prompt) => `${prompt.studentId}:${prompt.kind}`);
  assert.ok(kinds.includes("late:late"));
  assert.ok(kinds.includes("away:unauthorised"));
  assert.equal(followUpPrompts(lates.slice(0, 4), { today }).length, 0);
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
