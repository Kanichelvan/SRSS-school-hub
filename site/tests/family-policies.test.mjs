// Family policies (Nov 2026): vegetarian food, the Pure Life Society, sponsorship and the Parent–School Partnership.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { FOOD, PURE_LIFE, SPONSORSHIP } from "../src/data/familyPolicies.js";
import { defaultFaqs, verifiedFaqs } from "../src/data/faqs.js";
import { resolvePath } from "../src/data/siteMap.js";
import { FORM, canStart } from "../functions/forms-registry.js";

const PAGES = { "/student-life/vegetarian-food": "foodPolicy", "/about/pure-life-society": "pureLife", "/join/fees/sponsorship": "sponsorship", "/join/parent-partnership": "partnership" };

describe("family policy pages", () => {
  test("each policy has its own public address", () => {
    for (const [path, page] of Object.entries(PAGES)) assert.equal(resolvePath(path).entry.page, page, path);
  });
  test("eggs stay unconfirmed until the School decides", () => {
    assert.equal(FOOD.eggsConfirmed, false);
    assert.match(FOOD.eggs, /check with the school office/);
  });
  test("the Pure Life Society timeline keeps the School's facts", () => {
    const text = JSON.stringify(PURE_LIFE);
    for (const fact of ["RM1 per year", "2025", "2035", "permanent campus"]) assert.ok(text.includes(fact), fact);
  });
  test("full sponsorship covers tuition, materials, uniforms and meals for both sponsored groups", () => {
    assert.deepEqual(SPONSORSHIP.paths.map((path) => path.id), ["pure-life", "b40", "hardship"]);
    for (const row of SPONSORSHIP.covers) { assert.equal(row.length, SPONSORSHIP.paths.length + 1); assert.equal(row[1], true); assert.equal(row[2], true); }
  });
});

describe("FAQ answers follow the policies", () => {
  const faq = (question) => defaultFaqs.find((item) => item.question === question);
  test("meals, celebrations, sponsorship and parents' role are answered and link to real pages", () => {
    for (const question of ["Does SRSS provide meals and transport?", "Can we bring food for a birthday or class celebration?", "Is financial assistance or sponsorship available?", "What does SRSS ask of parents?"]) {
      const item = faq(question);
      assert.ok(item, question);
      const [, href] = item.link;
      assert.ok(href.startsWith("/forms/") || resolvePath(href).entry.page !== "notFound", href);
    }
    assert.match(faq("Does SRSS provide meals and transport?").paragraphs.join(" "), /must be vegetarian/);
    assert.match(faq("What are the school fees?").paragraphs.join(" "), /B40/);
  });
  test("a stale saved meals answer is replaced by the policy's", () => {
    const [item] = verifiedFaqs([{ question: "Does SRSS provide meals and transport?", paragraphs: ["Old answer"] }]);
    assert.match(item.paragraphs.join(" "), /vegetarian/);
  });
  test("a saved FAQ list from before the policies still shows the new answers, next to the related question", () => {
    const saved = [{ question: "What are the school fees?" }, { question: "Where is SRSS located?" }, { question: "Does SRSS provide meals and transport?" }];
    assert.deepEqual(verifiedFaqs(saved).map((item) => item.question), ["What are the school fees?", "Is financial assistance or sponsorship available?", "Where is SRSS located?", "Does SRSS provide meals and transport?", "Can we bring food for a birthday or class celebration?", "What uniform do students wear?", "How does admission to Standard 1 work?", "What does SRSS ask of parents?"]);
    assert.equal(verifiedFaqs(defaultFaqs).length, defaultFaqs.length);
  });
});

describe("family policy forms", () => {
  test("the agreement and the dietary request are parent forms; the event food check is public", () => {
    assert.ok(canStart(FORM.B16, ["parent"]) && !canStart(FORM.B16, ["teacher"]));
    assert.equal(FORM.B16.type, "consent");
    assert.equal(FORM.B17.availability, "public");
    assert.ok(FORM.B18.restricted && FORM.B18.writesTo === "restrictedCases");
  });
  test("B40 households can ask for full sponsorship in L03", () => {
    const household = FORM.L03.fields.find((field) => field.key === "household");
    assert.ok(household.options.includes("A B40 household"));
    assert.ok(FORM.L03.restricted);
  });
});
