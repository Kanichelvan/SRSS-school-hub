// Forms, Submissions & Response Management System: the master registry and its pure logic.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  CATEGORIES, FORM, FORMS, HANDLER_ROLES, addWorkingDays, canStart, closedDates, dueDateFor, escalationStep, fieldsFor, referenceFor,
  routeFor, validateAnswers, workingDaysBetween,
} from "../functions/forms-registry.js";
import { ROLE_IDS } from "../src/auth/permissions.js";
import { hubRoutes } from "../src/hub/routes.js";

describe("master form registry", () => {
  test("holds the 194 specification forms, A01–L10, and the School's B16–B18, once each", () => {
    const expected = { A: 18, B: 18, C: 16, D: 24, E: 16, F: 13, G: 20, H: 14, I: 15, J: 18, K: 15, L: 10 };
    assert.equal(FORMS.length, 197);
    assert.equal(new Set(FORMS.map((form) => form.id)).size, 197);
    for (const [category, count] of Object.entries(expected)) assert.equal(FORMS.filter((form) => form.category === category).length, count, category);
  });
  test("every queue is held by a real hub role, and backup differs from the PIC", () => {
    for (const form of FORMS) {
      for (const role of [form.pic, form.backup, form.escalation]) assert.ok(ROLE_IDS.includes(role) && HANDLER_ROLES.includes(role), `${form.id}: ${role}`);
      assert.notEqual(form.pic, form.backup, form.id);
    }
    for (const category of Object.values(CATEGORIES)) assert.ok(ROLE_IDS.includes(category.pic));
  });
  test("restricted matters never go to the general queue or into formSubmissions", () => {
    for (const id of ["B09", "E10", "H05", "H06", "L03", "K14"]) { assert.equal(FORM[id].restricted, true, id); assert.equal(FORM[id].writesTo, "restrictedCases", id); }
    assert.equal(FORM.B08.restricted, false);
  });
  test("every form that runs in the hub has well-formed fields; public forms ask nothing about a child", () => {
    for (const form of FORMS.filter((item) => ["form", "public"].includes(item.availability))) {
      assert.ok(form.fields.length > 0 && form.intro, form.id);
      assert.ok(["public", "parent", "staff", "signedIn"].includes(form.audience), form.id);
      for (const field of fieldsFor(form)) {
        assert.ok(field.key && field.label && field.type, `${form.id}.${field.key}`);
        if (field.type === "select") assert.ok(field.options?.length > 1, `${form.id}.${field.key}`);
      }
      if (form.audience === "public") assert.ok(!form.fields.some((field) => field.type === "child"), form.id);
    }
  });
  test("forms handled elsewhere link to a real hub route", () => {
    const pattern = (path) => new RegExp(`^${path.replace(/:[^/]+\??/g, "[^/]+")}$`);
    for (const form of FORMS.filter((item) => item.availability === "module" && item.link.startsWith("/hub"))) {
      assert.ok(form.link === "/hub" || hubRoutes.some((route) => pattern(route.path).test(form.link)), `${form.id} → ${form.link}`);
    }
  });
  test("the specification's Stage 2 essentials are available", () => {
    for (const id of ["A01", "A02", "A03", "A04", "B01", "B03", "B05", "C01", "D01", "D02", "D03", "D06", "D07", "J01", "J04", "K05", "E09", "I01", "I02", "I03", "I05"]) {
      assert.notEqual(FORM[id].availability, "planned", id);
    }
  });
});

describe("validation", () => {
  test("required fields, formats and options are checked", () => {
    const result = validateAnswers(FORM.A03, { enteringStandard: "Standard 9", preferredDate: "soon", email: "nope", name: "" });
    assert.equal(result.ok, false);
    assert.ok(result.errors.enteringStandard && result.errors.preferredDate && result.errors.email && result.errors.name && result.errors.contactConsent);
    const good = validateAnswers(FORM.A03, { enteringStandard: "Standard 1", preferredDate: "2027-01-20", preferredTime: "Either", name: "Ana", email: "ana@example.com", contactConsent: true, extra: "dropped" });
    assert.equal(good.ok, true);
    assert.equal(good.values.extra, undefined);
  });
  test("a contact update needs at least one new detail; leave can't end before it starts", () => {
    assert.equal(validateAnswers(FORM.B01, { notes: "hi" }).ok, false);
    assert.equal(validateAnswers(FORM.B01, { phone: "012-345 6789" }).ok, true);
    const leave = validateAnswers(FORM.E02, { leaveType: "Annual leave", from: "2027-03-10", to: "2027-03-08" });
    assert.ok(leave.errors.to);
  });
  test("links must be https; numbers are numbers", () => {
    assert.ok(validateAnswers(FORM.L07, { description: "Paper", amount: "12.50", date: "2027-02-01", receiptLink: "http://x" }).errors.receiptLink);
    assert.equal(validateAnswers(FORM.L07, { description: "Paper", amount: "12.50", date: "2027-02-01", receiptLink: "https://drive.google.com/x" }).values.amount, 12.5);
  });
});

describe("who may start a form", () => {
  test("by audience", () => {
    assert.equal(canStart(FORM.A03, []), true);
    assert.equal(canStart(FORM.B01, ["parent"]), true);
    assert.equal(canStart(FORM.B01, ["teacher"]), false);
    assert.equal(canStart(FORM.E09, ["teacher"]), true);
    assert.equal(canStart(FORM.E09, ["student"]), false);
    assert.equal(canStart(FORM.K07, ["student"]), true);
    assert.equal(canStart(FORM.A04, ["parent"]), false); // handled by the applications module
  });
});

describe("routing", () => {
  test("a complaint about the Headmistress never goes to the Headmistress", () => {
    assert.equal(routeFor(FORM.B09, { concerns: "A teacher or staff member" }).picRole, "leadership");
    const route = routeFor(FORM.B09, { concerns: "The Headmistress" });
    assert.equal(route.picRole, "superAdmin");
    assert.ok(![route.backupRole, route.escalationRole].includes("leadership"));
    assert.equal(routeFor(FORM.E10, { concerns: "The Headmistress" }, { categories: { E: { pic: "leadership" } } }).picRole, "superAdmin");
  });
  test("the School's workflow rules override the defaults, per form before per category", () => {
    const rules = { categories: { I: { pic: "contentEditor" } }, forms: { I01: { pic: "schoolAdmin" } } };
    assert.equal(routeFor(FORM.I02, {}, rules).picRole, "contentEditor");
    assert.equal(routeFor(FORM.I01, {}, rules).picRole, "schoolAdmin");
    assert.equal(routeFor(FORM.I02, {}).picRole, "alumniCoordinator");
  });
  test("absence reports go to the attendance manager (Attendance Policy §8)", () => {
    assert.equal(routeFor(FORM.B05).picRole, "attendanceManager");
  });
  test("references look like SRSS-ADM-2027-0042", () => {
    assert.equal(referenceFor(FORM.A02, "2027", 42), "SRSS-ADM-2027-0042");
    assert.equal(referenceFor(FORM.H05, "2027", 7), "SRSS-SAF-2027-0007");
  });
});

describe("working days, deadlines and escalation", () => {
  const closed = closedDates([{ date: "2027-03-06", endDate: "2027-03-14", schoolClosed: true }, { date: "2027-01-22", schoolClosed: true }, { date: "2027-02-01", schoolClosed: false }]);
  test("closures cover single days and ranges", () => {
    assert.ok(closed.has("2027-01-22") && closed.has("2027-03-10") && closed.has("2027-03-14"));
    assert.ok(!closed.has("2027-02-01"));
  });
  test("deadlines skip weekends and closures", () => {
    assert.equal(addWorkingDays("2027-01-20", 2, closed), "2027-01-25"); // Wed + 2 skips Fri 22 (Thaipusam) and the weekend
    assert.equal(addWorkingDays("2027-01-23", 0, closed), "2027-01-25"); // Saturday counts from Monday
    assert.equal(addWorkingDays("2027-03-05", 1, closed), "2027-03-15"); // across the term break
    assert.equal(dueDateFor(FORM.A04, "2027-01-11", closed), "2027-01-14");
    assert.equal(dueDateFor(FORM.D21, "2027-01-11", closed), null);
    assert.equal(workingDaysBetween("2027-01-18", "2027-01-25", closed), 4);
  });
  test("overdue → backup → escalation, once each; nothing while waiting on the submitter", () => {
    const item = { status: "inProgress", dueAt: "2027-01-18", reminders: {} };
    assert.equal(escalationStep(item, "2027-01-15", closed), null);
    assert.equal(escalationStep(item, "2027-01-18", closed), "overdue");
    const told = { ...item, reminders: { overdue: true } };
    assert.equal(escalationStep(told, "2027-01-18", closed), null);
    assert.equal(escalationStep(told, "2027-01-19", closed), "backup");
    assert.equal(escalationStep({ ...item, reminders: { overdue: true, backup: true } }, "2027-01-20", closed), null);
    assert.equal(escalationStep({ ...item, reminders: { overdue: true, backup: true } }, "2027-01-21", closed), "escalated");
    assert.equal(escalationStep({ ...item, reminders: { overdue: true, on: "2027-01-19" } }, "2027-01-19", closed), null);
    assert.equal(escalationStep({ ...item, status: "awaitingInformation" }, "2027-02-25", closed), null);
    assert.equal(escalationStep({ ...item, status: "completed" }, "2027-02-25", closed), null);
  });
});
