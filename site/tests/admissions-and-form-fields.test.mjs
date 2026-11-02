// Admissions routes (Nov 2026) and the rating-grid and typed-signature form questions.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { ADMISSION_ROUTES, ENROLMENT } from "../src/data/admissions.js";
import { defaultFaqs, verifiedFaqs } from "../src/data/faqs.js";
import { FORM, todayAtSchool, validateAnswers } from "../functions/forms-registry.js";

describe("admissions", () => {
  test("the Standard 1 intake follows the School's steps, ending in an offer letter", () => {
    assert.deepEqual(ADMISSION_ROUTES.standard1.steps.map(([title]) => title), ["Interview date announced", "Parent interview", "Meet and mingle", "Entrance test", "Offer letter"]);
    assert.match(ADMISSION_ROUTES.standard1.who, /age six/);
  });
  test("mid-year places depend on the enrolment ceiling, and Pure Life Society children enrol automatically", () => {
    assert.deepEqual(ENROLMENT, { usual: 160, max: 170 });
    assert.match(ADMISSION_ROUTES.midYear.steps.at(-1)[1], /subject to availability/);
    assert.match(ADMISSION_ROUTES.pureLife.who, /automatically/);
  });
  test("the FAQ explains both routes, and replaces a stale saved mid-year answer", () => {
    const questions = defaultFaqs.map((item) => item.question);
    assert.ok(questions.indexOf("How does admission to Standard 1 work?") === questions.indexOf("What year levels are offered at SRSS?") + 1);
    const [midYear] = verifiedFaqs([{ question: "Does SRSS accept mid-year admissions?", paragraphs: ["Old answer"] }]);
    assert.match(midYear.paragraphs.join(" "), /170/);
  });
});

describe("rating grids", () => {
  const rows = { "Organisation on the day": "Good", "The activities": "Excellent", "Information beforehand": "Fair", Overall: "Good" };
  test("a required grid needs a rating on every row", () => {
    assert.equal(validateAnswers(FORM.G14, { event: "Sports Day", ratings: { Overall: "Good" } }).errors.ratings, "Please give a rating for every row.");
    assert.deepEqual(validateAnswers(FORM.G14, { event: "Sports Day", ratings: rows }).values.ratings, rows);
  });
  test("ratings outside the scale are refused, and an optional grid may be left out", () => {
    assert.ok(validateAnswers(FORM.G14, { event: "Sports Day", ratings: { ...rows, Overall: "Amazing" } }).errors.ratings);
    const feedback = validateAnswers(FORM.B08, { topic: "Facilities", feedback: "More shade in the playground." });
    assert.ok(feedback.ok);
    assert.equal(feedback.values.ratings, undefined);
  });
});

describe("typed signatures", () => {
  test("the signature records the typed name and today's date at the school", () => {
    const { values, ok } = validateAnswers(FORM.B16, { agreement: true, signature: "  Priya   Raman " });
    assert.ok(ok);
    assert.deepEqual(values.signature, { name: "Priya Raman", signedOn: todayAtSchool() });
  });
  test("a date sent by the browser is ignored, and a name is required", () => {
    assert.equal(validateAnswers(FORM.B16, { agreement: true, signature: { name: "Priya Raman", signedOn: "1999-01-01" } }).values.signature.signedOn, todayAtSchool());
    assert.ok(validateAnswers(FORM.B16, { agreement: true, signature: "" }).errors.signature);
    assert.ok(validateAnswers(FORM.B16, { agreement: true, signature: "1" }).errors.signature);
  });
  test("consent and declaration forms are signed", () => {
    for (const id of ["B16", "B10", "I12", "A16", "L03"]) assert.ok(FORM[id].fields.some((field) => field.type === "signature"), id);
  });
  test("the school's date is Malaysian time", () => {
    assert.equal(todayAtSchool(new Date("2026-11-01T17:30:00Z")), "2026-11-02");
  });
});
