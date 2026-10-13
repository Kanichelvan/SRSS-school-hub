// Stage 1 end-to-end workflows in a real browser against the local emulators and fictional seed data.
// Prerequisites: `npm run emulators` (auth, firestore, storage), `npm run seed`, `npm run dev` (port 5173).
// Run: `node tests/e2e/stage1.e2e.mjs` (uses Playwright; set PLAYWRIGHT_MODULE to a global install if needed).
// Re-seed before each run: the script moves real records through the workflow.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const BASE = process.env.HUB_URL || "http://localhost:5173";
const SHOTS = process.env.SHOTS_DIR || "test-results/e2e";
await mkdir(SHOTS, { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const results = [];
async function step(name, fn) {
  try { await fn(); results.push(["ok", name]); console.log(`ok - ${name}`); }
  catch (error) { results.push(["not ok", name]); console.log(`not ok - ${name}\n  ${String(error.message).split("\n").slice(0, 4).join("\n  ")}`); }
}

async function signIn(role, { viewport = { width: 1280, height: 900 } } = {}) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  page.on("pageerror", (error) => console.log(`  [page error as ${role}] ${error.message}`));
  await page.goto(`${BASE}/login`);
  await page.getByText("Local demo accounts").click();
  const labels = { teacher: "Class teacher", coordinator: "Academic coordinator", principal: "Headmistress", parent: "Parent (2 children)", student: "Student", office: "Office admin", editor: "Content editor" };
  await page.getByRole("button", { name: labels[role], exact: true }).click();
  await page.waitForURL(/\/hub\//, { timeout: 20000 });
  return { page, context };
}
const shot = (page, name) => page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });

// ---------- Teacher: plan, task, marks ----------
const teacher = await signIn("teacher");
await step("teacher sees Academics and Assessments in the Teaching navigation", async () => {
  const nav = teacher.page.getByRole("navigation", { name: "Hub navigation" });
  await nav.getByRole("link", { name: "Academics" }).waitFor();
  await nav.getByRole("link", { name: "Assessments" }).waitFor();
  const labels = await nav.getByRole("link").allTextContents();
  assert.ok(labels.indexOf("Academics") === labels.indexOf("Attendance") + 1, `nav order: ${labels.join(", ")}`);
});
await step("teacher dashboard lists marks to enter for the open period", async () => {
  await teacher.page.getByRole("heading", { name: "Marks to enter" }).waitFor();
  await teacher.page.getByRole("link", { name: "4 Dedikasi · Mathematics" }).waitFor();
});
await step("academics overview shows coverage for the teacher's classes", async () => {
  await teacher.page.goto(`${BASE}/hub/academics`);
  await teacher.page.getByText("4 Dedikasi · Mathematics").first().waitFor();
  await teacher.page.getByText("25% covered").waitFor(); // 1 of 4 topics has a completed lesson
  await shot(teacher.page, "01-academics-overview");
});
await step("teacher creates a lesson plan with Human Values and a Google Drive resource", async () => {
  await teacher.page.goto(`${BASE}/hub/academics/lessons/new?class=c26-4&subject=math`);
  await teacher.page.getByLabel("Curriculum topic").selectOption("tp-money");
  await teacher.page.getByLabel("Lesson topic").fill("Money: making change");
  await teacher.page.getByLabel("Week", { exact: true }).fill("7");
  await teacher.page.getByLabel("Learning activities").fill("Class shop role-play in pairs.");
  await teacher.page.locator("label.hub-value-chip", { hasText: "Right Conduct" }).click();
  await teacher.page.getByRole("button", { name: "Attach from Google Drive" }).click();
  const dialog = teacher.page.getByRole("dialog");
  await dialog.getByLabel(/Link to the file/).fill("https://drive.google.com/file/d/1DemoShopPriceCards/view?usp=sharing");
  await dialog.getByText("Recognised:").waitFor();
  await dialog.getByLabel(/Title shown in the hub/).fill("Shop price cards");
  await shot(teacher.page, "02-workspace-modal");
  await dialog.getByRole("button", { name: "Attach", exact: true }).click();
  await teacher.page.getByText("Shop price cards").waitFor();
  assert.match(teacher.page.url(), /\/lessons\/new/, "attaching a resource must not submit the lesson plan form");
  await teacher.page.getByRole("combobox", { name: /^Status/ }).selectOption("completed");
  await teacher.page.getByRole("button", { name: "Save lesson plan" }).click();
  await teacher.page.getByText("Lesson plan saved.").waitFor();
  assert.match(teacher.page.url(), /\/hub\/academics\/lessons\/[A-Za-z0-9]+$/);
  await shot(teacher.page, "03-lesson-plan");
});
await step("the Workspace modal rejects look-alike links", async () => {
  await teacher.page.getByRole("button", { name: "Attach Google Form" }).click();
  const dialog = teacher.page.getByRole("dialog");
  await dialog.getByLabel(/Link to the file/).fill("https://docs.google.com.evil.test/forms/d/1AbCdEfGhIjKl/edit");
  await dialog.getByText("Not a Google Workspace link yet.").waitFor();
  assert.equal(await dialog.getByRole("button", { name: "Attach", exact: true }).isDisabled(), true);
  await dialog.getByRole("button", { name: "Cancel" }).click();
});
await step("teacher publishes a learning task", async () => {
  await teacher.page.goto(`${BASE}/hub/academics/tasks/new?class=c26-4&subject=math`);
  await teacher.page.getByLabel("Title").fill("Count the coins at home");
  await teacher.page.getByLabel("Due").fill("2026-12-01");
  await teacher.page.getByLabel("Hand-in").selectOption("hub");
  await teacher.page.getByRole("combobox", { name: /^Status/ }).selectOption("published");
  await teacher.page.getByRole("button", { name: "Save task" }).click();
  await teacher.page.getByText("Task saved.").waitFor();
  await teacher.page.getByRole("heading", { name: "Completion and feedback" }).waitFor();
});
await step("teacher cannot open marks for a subject in another class's scope (unassigned class)", async () => {
  await teacher.page.goto(`${BASE}/hub/assessments/marks/ap-2026-t3/as-t3-math-3/c26-2`);
  await teacher.page.getByRole("heading", { name: "You can't open this mark sheet" }).waitFor();
});
await step("teacher enters marks with validation, saves a draft and submits", async () => {
  const page = teacher.page;
  await page.goto(`${BASE}/hub/assessments/marks/ap-2026-t3/as-t3-math-4/c26-4`);
  await page.getByRole("heading", { name: "4 Dedikasi · Mathematics" }).waitFor();
  assert.equal(await page.getByRole("button", { name: "Submit for review" }).isDisabled(), true, "incomplete sheet cannot be submitted");
  const cells = page.locator("input[data-cell]");
  await cells.first().waitFor();
  const count = await cells.count();
  for (let i = 0; i < count; i++) await cells.nth(i).fill(String(10 + (i % 9)));
  await page.locator('input[data-cell="0:0"]').fill("75");
  await page.getByText("75 is above the maximum of 60.").waitFor();
  assert.equal(await page.getByRole("button", { name: "Save draft" }).isDisabled(), true, "invalid marks block saving");
  await page.locator('input[data-cell="0:0"]').fill("54");
  await page.locator('input[data-cell="1:1"]').fill("A");
  await page.locator('input[data-cell="2:2"]').fill("ex");
  await page.getByRole("button", { name: "Save draft" }).click();
  await page.getByText("Draft saved.").waitFor();
  await shot(page, "04-mark-entry");
  await page.getByRole("button", { name: "Submit for review" }).click();
  await page.getByText("Mark sheet is now submitted.").waitFor();
  assert.equal(await page.locator("input[data-cell]").count(), 0, "submitted marks are read-only for the teacher");
});
await step("teacher's Google Sheets import validates and lands in the draft only", async () => {
  const page = teacher.page;
  await page.goto(`${BASE}/hub/assessments/marks/ap-2026-t3/as-t3-math-5/c26-5`);
  await page.getByRole("button", { name: "Import from Google Sheets" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Paste cells here").fill("Name\tWritten\tOral\tCoursework\nDiya Krishnan\t50\t18\t17\nAmir Hamzah\t70\t10\t10\nNobody Here\t1\t1\t1");
  await dialog.getByText(/1 pupil ready to import; 2 problems/).waitFor();
  await dialog.getByRole("button", { name: "Apply to draft" }).click();
  await page.getByText(/1 row imported into the draft/).waitFor();
  assert.equal(await page.locator('input[aria-label^="Written for Diya Krishnan"]').inputValue(), "50");
});
await teacher.context.close();

// ---------- Coordinator: review lesson plan, return one sheet, review another ----------
const coordinator = await signIn("coordinator");
await step("coordinator reviews a completed lesson plan", async () => {
  const page = coordinator.page;
  await page.goto(`${BASE}/hub/academics/lessons`);
  await page.getByRole("link", { name: /Money: making change/ }).first().click();
  await page.getByRole("heading", { name: "Coordinator review" }).waitFor();
  await page.getByLabel(/Note for the teacher/).fill("Good link to Right Conduct.");
  await page.getByRole("button", { name: "Mark as reviewed" }).click();
  await page.waitForURL(/view=review/);
});
await step("coordinator returns a sheet for correction (note required) and reviews the submitted one", async () => {
  const page = coordinator.page;
  await page.goto(`${BASE}/hub/assessments`);
  await page.getByRole("heading", { name: "Waiting for your review" }).waitFor();
  await shot(page, "05-review-queue");
  await page.goto(`${BASE}/hub/assessments/marks/ap-2026-t3/as-t3-math-3/c26-3`);
  await page.getByRole("button", { name: "Return for correction" }).click();
  const dialog = page.getByRole("dialog");
  assert.equal(await dialog.getByRole("button", { name: "Return for correction" }).isDisabled(), true);
  await dialog.getByLabel("What needs correcting").fill("Please re-check Kavya's coursework mark.");
  await dialog.getByRole("button", { name: "Return for correction" }).click();
  await page.getByText("Returned to the teacher for correction, with your note.").waitFor();
  await page.goto(`${BASE}/hub/assessments/marks/ap-2026-t3/as-t3-math-4/c26-4`);
  assert.equal(await page.locator("input[data-cell]").count(), 0, "the coordinator cannot edit marks");
  await page.getByRole("button", { name: "Mark as reviewed" }).click();
  await page.getByText("Mark sheet is now reviewed.").waitFor();
  assert.equal(await page.getByRole("button", { name: "Publish to families" }).count(), 0, "the coordinator cannot publish");
});
await coordinator.context.close();

// ---------- Headmistress: approve and publish ----------
const principal = await signIn("principal");
await step("leadership approves and publishes; publication asks for confirmation", async () => {
  const page = principal.page;
  await page.goto(`${BASE}/hub/assessments/marks/ap-2026-t3/as-t3-math-4/c26-4`);
  await page.getByRole("button", { name: "Approve results" }).click();
  await page.getByText("Mark sheet is now approved.").waitFor();
  await page.getByRole("button", { name: "Publish to families" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Publish to families" }).click();
  await page.getByText("Mark sheet is now published.").waitFor();
  await shot(page, "06-published-sheet");
});
await step("leadership amends a published result only with a reason", async () => {
  const page = principal.page;
  await page.getByRole("button", { name: "Amend a result" }).click();
  await page.locator('input[data-cell="0:1"]').fill("19");
  await page.getByRole("button", { name: "Save amendment" }).click();
  await page.getByText(/Record the reason/).waitFor();
  await page.getByLabel(/Reason for amending/).fill("Oral mark transcribed incorrectly; confirmed with the teacher.");
  await page.getByRole("button", { name: "Save amendment" }).click();
  await page.getByText(/1 result amended/).waitFor();
});
await principal.context.close();

// ---------- Parent and student: published results and tasks ----------
const parent = await signIn("parent", { viewport: { width: 390, height: 844 } });
await step("parent sees the newly published Term 3 result and the Term 2 result (mobile)", async () => {
  const page = parent.page;
  await page.goto(`${BASE}/hub/parent/progress`);
  await page.getByRole("heading", { name: "Term 3 assessment" }).waitFor();
  await page.getByRole("heading", { name: "Term 2 assessment" }).waitFor();
  await page.getByText("Explains his reasoning clearly").waitFor();
  await shot(page, "07-parent-progress-mobile");
});
await step("parent sees published tasks with due dates and completion, not drafts", async () => {
  const page = parent.page;
  await page.goto(`${BASE}/hub/parent/tasks`);
  await page.getByText("Count the coins at home").waitFor();
  await page.getByText("Careful counting").waitFor();
  assert.equal(await page.getByRole("button", { name: "Hand in my work" }).count(), 0, "parents do not hand in");
  await shot(page, "08-parent-tasks-mobile");
});
await step("parent cannot open staff academic pages", async () => {
  await parent.page.goto(`${BASE}/hub/academics`);
  await parent.page.getByRole("heading", { name: "You don't have access to this page" }).waitFor();
});
await parent.context.close();

const student = await signIn("student", { viewport: { width: 390, height: 844 } });
await step("student hands in a task and sees their published results", async () => {
  const page = student.page;
  await page.goto(`${BASE}/hub/student/learning`);
  const card = page.locator("li", { hasText: "Fractions practice sheet" });
  await card.getByRole("button", { name: "Hand in my work" }).click();
  await card.getByLabel("My work", { exact: true }).fill("1/2 = 2/4 = 4/8");
  await card.getByRole("button", { name: "Hand in", exact: true }).click();
  await page.locator("li", { hasText: "Fractions practice sheet" }).getByText("Handed in").waitFor();
  await page.goto(`${BASE}/hub/student/progress`);
  await page.getByRole("heading", { name: "Term 3 assessment" }).waitFor();
  await shot(page, "09-student-progress-mobile");
});
await student.context.close();

await browser.close();
const failed = results.filter(([status]) => status !== "ok").length;
console.log(`\n# pass ${results.length - failed}\n# fail ${failed}`);
process.exitCode = failed ? 1 : 0;
