import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PACKS,
  packRoles,
  ACTIVITY_FORMS,
  ACTIVITY_FIELDS,
  REVIEW_DOMAINS,
  REVIEW_BANDS,
  icsCalendar,
} from "../src/hub/logic/community.js";
import { can } from "../src/auth/permissions.js";
test("multi-role welcome packs remain distinct and usable", () => {
  assert.deepEqual(packRoles(["parent", "classTeacher", "teacher"]), [
    "parent",
    "teacher",
  ]);
  for (const p of Object.values(PACKS))
    assert.equal(new Set(p.steps.map((s) => s[0])).size, p.steps.length);
});
test("all ten activity templates have fields", () => {
  assert.equal(ACTIVITY_FORMS.length, 10);
  for (const f of ACTIVITY_FORMS)
    for (const s of f.sections) assert.ok(ACTIVITY_FIELDS[s]?.length);
});
test("development is five domains, three bands and leadership-only assessment", () => {
  assert.equal(REVIEW_DOMAINS.length, 5);
  assert.deepEqual(
    REVIEW_BANDS.map((b) => b[0]),
    ["meets", "strong", "support"],
  );
  assert.equal(can(["teacher"], "teacherDevelopment", "U"), "own");
  assert.equal(can(["schoolAdmin"], "teacherDevelopment"), null);
  assert.equal(can(["leadership"], "teacherDevelopment", "A"), "all");
});
test("ICS handles Malaysian time, inclusive school dates and escaped text", () => {
  const s = icsCalendar([
    {
      id: "a",
      date: "2026-12-31",
      endDate: "2027-01-01",
      allDay: true,
      title: "Camp, fun\nEND:VEVENT",
    },
    {
      id: "b",
      date: "2026-10-16",
      startTime: "07:40",
      endTime: "13:30",
      title: "Class",
    },
  ]);
  assert.match(s, /DTEND;VALUE=DATE:20270102/);
  assert.match(s, /SUMMARY:Camp\\, fun\\nEND:VEVENT/);
  assert.match(s, /DTSTART:20261015T234000Z/);
  assert.equal(s.split("\r\n").filter((l) => l === "BEGIN:VEVENT").length, 2);
});
test("ICS folds long Unicode by bytes", () => {
  for (const l of icsCalendar([
    { id: "a", date: "2026-10-16", title: "学校".repeat(80) },
  ]).split("\r\n"))
    assert.ok(new TextEncoder().encode(l).length <= 75);
});
