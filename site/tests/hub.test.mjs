// Hub logic behind the Admin, Teacher, Parent and Student hubs: consent versions, audiences, portfolio
// visibility and the School Setup Wizard's year roll-over plans.
import assert from "node:assert/strict";
import { test } from "node:test";
import { CONSENT_ITEMS, isCurrent, mergeConsentItems, missingItems } from "../src/hub/consentForm.js";
import { draftFromKeys, describeAudience, keysFromDraft, linksError, parseLinks } from "../src/hub/audience.js";
import { FAMILY_VISIBLE, TEACHER_VISIBILITY, categoryOf, humanValuesOf, moderationFor, showcaseConsent, visibleToFamily } from "../src/hub/portfolio.js";
import { planAssignmentCopy, planClassCopy, planPromotion, previousYear, setupStatus, targetYear } from "../src/hub/logic/setup.js";
import { hubRoutes } from "../src/hub/routes.js";

test("rewording a consent question asks families again; other answers still count", () => {
  const items = mergeConsentItems([{ type: "photoVideo", question: "New wording for {child}?", version: 2 }]);
  const status = Object.fromEntries(CONSENT_ITEMS.map((item) => [item.type, { response: "granted", version: 1 }]));
  assert.deepEqual(missingItems(status, items).map((item) => item.type), ["photoVideo"]);
  assert.equal(isCurrent({ version: 2 }, items.find((item) => item.type === "photoVideo")), true);
});

test("retired consent questions drop out and added ones appear", () => {
  const items = mergeConsentItems([{ type: "socialMedia", status: "archived" }, { type: "fieldTrips", title: "Trips", question: "May {child} go?", version: 1, order: 7 }]);
  assert.equal(items.some((item) => item.type === "socialMedia"), false);
  assert.equal(items.at(-1).type, "fieldTrips");
});

test("audiences round-trip between the editor and audienceKeys", () => {
  for (const keys of [["school"], ["role:parents"], ["standard:4", "standard:5"], ["class:c1"], ["user:u1", "user:u2"]]) assert.deepEqual(keysFromDraft(draftFromKeys(keys)), keys);
  assert.equal(describeAudience(["class:c1", "role:parents"], { classes: [{ id: "c1", name: "4 Amanah" }] }), "Class 4 Amanah, Parents");
});

test("attachments and media are https links only", () => {
  assert.deepEqual(parseLinks("Slip | https://drive.google.com/x\nhttps://y.test/a"), [{ label: "Slip", url: "https://drive.google.com/x" }, { label: "https://y.test/a", url: "https://y.test/a" }]);
  assert.match(linksError("http://insecure.test"), /https/);
  assert.equal(linksError(""), null);
});

test("portfolio: teachers can't choose public showcase; families never see internal or archived entries", () => {
  assert.equal(TEACHER_VISIBILITY.some(([value]) => value === "publicShowcase"), false);
  assert.equal(FAMILY_VISIBLE.includes("internal"), false);
  assert.equal(visibleToFamily({ visibility: "family", status: "archived" }), false);
  assert.equal(visibleToFamily({ visibility: "family", status: "active" }), true);
  assert.equal(moderationFor("showcaseCandidate", null), "pending");
  assert.equal(moderationFor("family", "pending"), null);
  assert.equal(showcaseConsent({ types: { publicShowcase: { response: "granted" } } }), "granted");
  assert.equal(showcaseConsent(undefined), "missing");
  assert.equal(categoryOf({ category: "character" }), "humanValues");
  assert.deepEqual(humanValuesOf({ humanValue: "love" }), ["love"]);
});

test("setup wizard: the year being prepared, and step status from real records", () => {
  const years = [{ id: "ay2026", name: "2026" }, { id: "ay2027", name: "2027" }];
  assert.equal(targetYear(years, "ay2026").id, "ay2027");
  assert.equal(previousYear(years, years[1]).id, "ay2026");
  const empty = { settings: {}, years, terms: [], standards: [], classes: [], subjects: [], staff: [], assignments: [], students: [], enrolments: [], links: [], guardians: [] };
  const { steps } = setupStatus(empty, "ay2027");
  assert.equal(steps.school.state, "pending");
  assert.equal(steps.year.state, "partial");
  assert.equal(steps.activate.state, "pending");
});

test("setup wizard: copy classes, carry assignments forward (never to yourself) and promote pupils", () => {
  const old = [1, 2, 6].map((standard) => ({ id: `o${standard}`, name: `${standard} A`, standard, academicYearId: "ay2026", status: "active" }));
  const copies = planClassCopy(old, [], "ay2027", (cls) => `n${cls.standard}`);
  assert.deepEqual(copies.map((cls) => [cls.id, cls.standard, cls.classTeacherUid]), [["n1", 1, null], ["n2", 2, null], ["n6", 6, null]]);
  const fresh = copies.map((cls) => ({ ...cls, status: "active" }));
  const { plan, skipped } = planAssignmentCopy({ previousAssignments: [{ classId: "o1", subjectId: "math", teacherUid: "t1" }, { classId: "o2", subjectId: "bm", teacherUid: "me" }], previousClasses: old, targetClasses: fresh, existing: [], me: "me" });
  assert.deepEqual(plan.map((item) => [item.classId, item.teacherUid]), [["n1", "t1"]]);
  assert.equal(skipped.length, 1);
  const students = ["s1", "s6"].map((id) => ({ id, status: "active" }));
  const { moves, graduates } = planPromotion({ previousEnrolments: [{ id: "e1", studentId: "s1", classId: "o1", status: "active" }, { id: "e6", studentId: "s6", classId: "o6", status: "active" }], previousClasses: old, targetClasses: fresh, targetEnrolments: [], students });
  assert.deepEqual(moves.map((move) => [move.student.id, move.newClass.id]), [["s1", "n2"]]);
  assert.deepEqual(graduates.map((item) => item.student.id), ["s6"]);
});

test("every hub has a dashboard route and the required pages", () => {
  for (const path of ["/hub/admin", "/hub/teacher", "/hub/parent", "/hub/student"]) assert.ok(hubRoutes.some((route) => route.path === path && route.index), path);
  for (const path of ["/hub/admin/setup", "/hub/admin/classes", "/hub/admin/accounts", "/hub/admin/teacher-assignments", "/hub/admin/enrolments", "/hub/admin/guardian-links", "/hub/admin/calendar", "/hub/admin/roles", "/hub/admin/settings", "/hub/teacher/classes/:classId", "/hub/teacher/classes/:classId/roster", "/hub/teacher/portfolios", "/hub/student/class", "/hub/student/achievements"]) assert.ok(hubRoutes.some((route) => route.path === path && route.screen), path);
});
