// School Fees and Payment Policy: every published amount, the family calculator and Fees-Lite statements.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { FEES, childFees, dueToDate, familyFees, families, ringgit, siblingOrder, siblingTuition, statement } from "../src/data/fees.js";
import { feesAnswer } from "../src/data/faqs.js";

describe("the published fee tables", () => {
  test("tuition, meals and totals for one child", () => {
    const one = childFees(1);
    assert.deepEqual([one.tuition, one.meal, one.monthly], [385, 70, 455]);
    assert.deepEqual([one.tuitionAnnual, one.mealAnnual, one.annual], [4235, 770, 5005]);
  });
  test("sibling discounts apply to tuition only", () => {
    assert.deepEqual([1, 2, 3, 4, 5, 6].map(siblingTuition), [385, 308, 250.25, 211.75, 211.75, 211.75]);
    assert.deepEqual([1, 2, 3, 4].map((n) => childFees(n).monthly), [455, 378, 320.25, 281.75]);
    for (const n of [1, 2, 3, 4]) assert.equal(childFees(n).meal, FEES.mealMonthly);
  });
  test("the family calculator adds children oldest first, with or without meals", () => {
    const six = familyFees(6);
    assert.equal(six.tuition, 385 + 308 + 250.25 + 211.75 * 3);
    assert.equal(six.meal, 420);
    assert.equal(six.annual, (six.tuition + six.meal) * 11);
    assert.equal(familyFees(2, { meals: false }).monthly, 693);
    assert.equal(familyFees(2).saving, 77);
  });
  test("amounts read as the policy prints them", () => {
    assert.equal(ringgit(385), "RM385");
    assert.equal(ringgit(4235), "RM4,235");
    assert.equal(ringgit(250.25), "RM250.25");
    assert.equal(ringgit(308, { decimals: 2 }), "RM308.00");
  });
  test("the FAQ quotes the policy's figures", () => {
    const text = feesAnswer.paragraphs.join(" ");
    for (const figure of ["RM385", "RM4,235", "RM70", "RM455", "20%", "35%", "45%"]) assert.ok(text.includes(figure), figure);
  });
});

describe("Fees-Lite", () => {
  test("monthly tuition falls due on the 10th, January to November", () => {
    assert.equal(dueToDate(385, "monthly", 2027, "2026-12-01"), 0);
    assert.equal(dueToDate(385, "monthly", 2027, "2027-01-09"), 0);
    assert.equal(dueToDate(385, "monthly", 2027, "2027-01-10"), 385);
    assert.equal(dueToDate(385, "monthly", 2027, "2027-12-31"), 4235);
    assert.equal(dueToDate(385, "monthly", 2028, "2027-05-01"), 0);
  });
  test("six-monthly: January–June then July–November, never a twelfth month", () => {
    assert.equal(dueToDate(385, "sixMonthly", 2027, "2027-01-10"), 385 * 6);
    assert.equal(dueToDate(385, "sixMonthly", 2027, "2027-07-09"), 385 * 6);
    assert.equal(dueToDate(385, "sixMonthly", 2027, "2027-07-10"), 4235);
  });
  test("a statement keeps school tuition and vendor meals apart", () => {
    const assignment = { year: 2027, siblingPosition: 2, meals: true, plan: "monthly" };
    const result = statement(assignment, [{ line: "tuition", amount: 308 }, { line: "meals", amount: 70 }], "2027-02-15");
    assert.deepEqual([result.tuition.monthly, result.tuition.due, result.tuition.outstanding], [308, 616, 308]);
    assert.deepEqual([result.meals.monthly, result.meals.due, result.meals.outstanding], [70, 140, 70]);
    assert.equal(result.outstanding, 378);
  });
  test("full sponsorship covers tuition and, where approved, meals", () => {
    const result = statement({ year: 2027, siblingPosition: 1, meals: true, mealSponsored: true, concessionRate: 1, plan: "monthly" }, [], "2027-11-30");
    assert.equal(result.outstanding, 0);
    assert.equal(statement({ year: 2027, siblingPosition: 1, meals: true, concessionRate: 0.5, plan: "monthly" }, [], "2027-01-10").tuition.monthly, 192.5);
  });
  test("siblings share a guardian; the oldest enrolled child is the first child", () => {
    const students = [{ id: "b", name: "Bina", dateOfBirth: "2019-05-01" }, { id: "a", name: "Arun", dateOfBirth: "2017-02-01" }, { id: "c", name: "Chen", dateOfBirth: "2018-01-01" }, { id: "d", name: "Dev", dateOfBirth: "2018-03-03" }];
    const links = [{ studentId: "a", guardianId: "g1" }, { studentId: "b", guardianId: "g1" }, { studentId: "b", guardianId: "g2" }, { studentId: "d", guardianId: "g2" }, { studentId: "c", guardianId: "g3" }];
    const groups = families(students, links).map((family) => family.map(({ student, position }) => `${student.id}${position}`).join(" "));
    assert.deepEqual(groups.sort(), ["a1 d2 b3", "c1"]);
    assert.deepEqual(siblingOrder([{ name: "Z" }, { name: "Y", dateOfBirth: "2018-01-01" }]).map((s) => s.name), ["Y", "Z"]);
  });
});
