// School Uniform, Personal Appearance & Grooming Policy (user text, Nov 2026).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { JEWELLERY, PROGRESSIVE_RESPONSE, UNIFORM, UNIFORM_GALLERY, UNIFORM_WHEN } from "../src/data/uniform.js";
import { defaultFaqs, verifiedFaqs } from "../src/data/faqs.js";
import { resolvePath } from "../src/data/siteMap.js";
import { siteNav } from "../src/data/navigation.js";

const page = readFileSync(new URL("../src/pages/UniformPolicy.jsx", import.meta.url), "utf8");

describe("uniform policy page", () => {
  test("has its own public address under Student Life", () => {
    const { entry } = resolvePath(UNIFORM.path);
    assert.equal(entry.page, "uniformPolicy");
    assert.equal(entry.parent, "/student-life");
  });
  test("is linked from the Student Life menu", () => {
    const links = siteNav.find((item) => item.label === "Student Life").groups.flatMap((group) => group.links);
    assert.ok(links.some(([, href]) => href === UNIFORM.path));
  });
  test("shows school management's approval and its date", () => {
    assert.match(UNIFORM.status, /^Approved/);
    assert.match(UNIFORM.approved, /2026$/);
  });
  test("keeps all nineteen numbered sections, the statement and the commitment", () => {
    for (let n = 1; n <= 19; n += 1) assert.ok(page.includes(`"${n}. `), `section ${n}`);
    assert.ok(page.includes('"Policy Statement"') && page.includes('"Our Commitment"'));
  });
  test("every illustration exists and has alternative text", () => {
    const figures = UNIFORM_GALLERY.flatMap((group) => group.figures);
    assert.equal(figures.length, 13);
    for (const figure of figures) {
      assert.ok(existsSync(new URL(`../public${figure.src}`, import.meta.url)), figure.src);
      assert.ok(figure.alt.length > 20, figure.label);
    }
  });
  test("formal uniform on Mondays and examinations; three-stage supportive response; smartwatch rule", () => {
    assert.ok(UNIFORM_WHEN.some(([when, what]) => /Mondays/.test(when) && /Formal/.test(what)));
    assert.deepEqual(PROGRESSIVE_RESPONSE.map(([stage]) => stage), ["First incident", "Second incident", "Third incident"]);
    assert.ok(JEWELLERY.some(([item]) => item === "Smartwatches"));
  });
});

describe("uniform FAQ", () => {
  test("answers the uniform question and links to the policy", () => {
    const item = defaultFaqs.find((faq) => faq.question === "What uniform do students wear?");
    assert.ok(item);
    assert.equal(item.link[1], UNIFORM.path);
    assert.match(item.paragraphs.join(" "), /Mondays/);
  });
  test("appears even when a saved FAQ list predates the policy", () => {
    const list = verifiedFaqs([{ question: "Does SRSS provide meals and transport?" }]);
    assert.ok(list.some((faq) => faq.question === "What uniform do students wear?"));
  });
});
