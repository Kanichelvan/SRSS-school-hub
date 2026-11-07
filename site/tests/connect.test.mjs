// SRSS Connect domain contract (spec Part 2 §14.2 unit tests UT-001…UT-015 and §14.3 decision-level checks).
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  acknowledgementId, canTransition, capabilitiesFor, categoryOf, deliveryJobId, feedOrder, isLive, notificationFor, notificationId, priorityOf,
  publicNotice, publishDecision, recipientEligible, reviewDecision, safeHref, schoolDate, shouldNotify, validateNotice, circularReference, materialChange, keysFromChoice, choiceFromKeys,
} from "../functions/connect-model.js";
import { parentActions } from "../src/hub/logic/dashboard.js";

const now = new Date("2027-03-01T02:00:00Z");
const draft = { title: "Standard 4 Assessment Timetable", body: "Assessment arrangements are available.", category: "academic", priority: "P3", audienceKeys: ["standard:4@parents"] };

test("UT-001…005: drafts validate; missing title, bad priority, bad audience and bad dates fail", () => {
  assert.equal(validateNotice(draft, { now }).valid, true);
  assert.ok(validateNotice({ ...draft, title: "  " }, { now }).errors.title);
  assert.ok(validateNotice({ ...draft, priority: "P9" }, { now }).errors.priority);
  assert.ok(validateNotice({ ...draft, audienceKeys: ["everyone"] }, { now }).errors.audienceKeys);
  assert.ok(validateNotice({ ...draft, audienceKeys: [] }, { now }).errors.audienceKeys);
  assert.ok(validateNotice({ ...draft, publishAt: "next tuesday" }, { now }).errors.publishAt);
  assert.ok(validateNotice({ ...draft, expiresAt: "2027-02-01" }, { now }).errors.expiresAt);
  assert.ok(validateNotice({ ...draft, publicListing: true }, { now }).errors.publicListing, "public notices must be whole-school");
  assert.equal(validateNotice({ ...draft, summary: "" }, { now }).value.summary, draft.body, "summary defaults to the start of the message");
});

test("UT-006…008: lifecycle transitions follow the state machine", () => {
  assert.equal(canTransition("draft", "pending_review"), true);
  assert.equal(canTransition("draft", "published"), false, "draft never jumps straight to published");
  assert.equal(canTransition("rejected", "published"), false);
  assert.equal(canTransition("rejected", "draft"), true);
  assert.equal(canTransition("scheduled", "cancelled"), true);
  assert.equal(canTransition("published", "expired"), true);
  assert.equal(canTransition("archived", "published"), false);
});

test("UT-013: action links must be hub pages or https", () => {
  assert.equal(safeHref("/hub/forms/abc"), true);
  assert.equal(safeHref("https://drive.google.com/x"), true);
  assert.equal(safeHref("javascript:alert(1)"), false);
  assert.equal(safeHref("http://example.com"), false);
  assert.equal(safeHref("https://user:pass@example.com"), false);
  assert.ok(validateNotice({ ...draft, action: { type: "form", label: "Respond", href: "javascript:alert(1)" } }, { now }).errors.action);
  assert.ok(validateNotice({ ...draft, attachments: [{ label: "x", url: "http://insecure" }] }, { now }).errors.attachments);
});

test("UT-012: expiry is a whole Malaysian school day", () => {
  const notice = { status: "published", expiresAt: "2027-03-01" };
  assert.equal(isLive(notice, new Date("2027-03-01T15:59:00Z")), true);
  assert.equal(isLive(notice, new Date("2027-03-01T16:00:00Z")), false);
  assert.equal(isLive({ status: "scheduled" }, now), false);
  assert.equal(schoolDate(new Date("2027-03-01T17:00:00Z")), "2027-03-02");
});

test("UT-014/015: notification, acknowledgement and delivery identifiers are deterministic", () => {
  assert.equal(notificationId("n1", 1, "u1"), "announcement_n1_u1", "revision 1 matches pre-v2 ids so old notices are never redelivered");
  assert.equal(notificationId("n1", 3, "u1"), "announcement_n1_r3_u1");
  assert.equal(notificationId("n1", 3, "u1"), notificationId("n1", 3, "u1"));
  assert.equal(acknowledgementId("n1", 2, "u1"), "n1_r2_u1");
  assert.equal(deliveryJobId("n1", 2), "n1_r2_inApp");
  const record = notificationFor("n1", { ...draft, revision: 2, deliveryRevision: 2, requiresAcknowledgement: true }, "u1");
  assert.equal(record.dedupeKey, "announcement_n1_r2_u1");
  assert.equal(record.link, "/hub/announcements/n1");
  assert.equal(record.actionRequired, true);
  assert.equal(record.readAt, null);
  assert.ok(record.preview.length <= 160);
});

test("UT-010/011: eligibility needs an active account with a matching key", () => {
  const notice = { audienceKeys: ["class:a@parents"] };
  assert.equal(recipientEligible({ status: "active", roles: ["parent"], audienceKeys: ["school", "class:a", "class:a@parents"] }, notice), true);
  assert.equal(recipientEligible({ status: "active", roles: ["student"], audienceKeys: ["school", "class:a"] }, notice), false, "pupils of the class are not parents");
  assert.equal(recipientEligible({ status: "disabled", roles: ["parent"], audienceKeys: ["class:a@parents"] }, notice), false);
  assert.equal(recipientEligible({ status: "active", roles: [], audienceKeys: ["class:a@parents"] }, notice), false);
});

test("legacy notices keep working: categories and priorities map onto v2", () => {
  assert.equal(categoryOf("urgent").id, "emergency");
  assert.equal(categoryOf("school").id, "general");
  assert.equal(priorityOf({ category: "urgent" }), "P2");
  assert.equal(priorityOf({}), "P3");
});

test("SEC-005/006: teachers publish routine notices to their own classes only", () => {
  const teacher = { roles: ["teacher"], scope: { publishKeys: ["class:a"] }, uid: "t1" };
  const ok = (notice) => publishDecision({ ...teacher, notice: { ...notice, createdBy: "t1" } }).allowed;
  assert.equal(ok({ ...draft, category: "class", audienceKeys: ["class:a@parents"] }), true);
  assert.equal(ok({ ...draft, category: "class", audienceKeys: ["class:a"] }), true);
  assert.equal(ok({ ...draft, category: "class", audienceKeys: ["class:b"] }), false, "another class");
  assert.equal(ok({ ...draft, category: "class", audienceKeys: ["school"] }), false, "school-wide");
  assert.equal(ok({ ...draft, category: "emergency", audienceKeys: ["class:a"] }), false, "emergency category");
  assert.equal(ok({ ...draft, category: "class", priority: "P2", audienceKeys: ["class:a"] }), false, "important needs approval");
  assert.equal(publishDecision({ ...teacher, notice: { ...draft, category: "class", audienceKeys: ["class:a"], createdBy: "someone-else" } }).allowed, false);
});

test("SEC-007 / emergency: editors prepare, office publishes, P1 needs Leadership", () => {
  const school = { ...draft, audienceKeys: ["school"] };
  assert.equal(publishDecision({ roles: ["contentEditor"], notice: school }).allowed, false);
  assert.equal(publishDecision({ roles: ["schoolAdmin"], notice: school }).allowed, true);
  assert.equal(publishDecision({ roles: ["schoolAdmin"], notice: { ...school, priority: "P1" } }).allowed, false);
  assert.equal(publishDecision({ roles: ["leadership"], notice: { ...school, priority: "P1" } }).allowed, true);
  assert.equal(publishDecision({ roles: ["academicCoordinator"], notice: school }).allowed, false, "coordinator lacks whole-school targeting");
  assert.equal(publishDecision({ roles: ["academicCoordinator"], notice: draft }).allowed, true);
  assert.equal(publishDecision({ roles: ["technicalAdmin"], notice: draft }).allowed, false, "platform maintenance is not editorial authority");
  assert.equal(reviewDecision({ roles: ["schoolAdmin"], notice: { ...school, priority: "P1" } }).allowed, false);
  assert.equal(reviewDecision({ roles: ["leadership"], notice: { ...school, priority: "P1" } }).allowed, true);
  assert.equal(reviewDecision({ roles: ["teacher"], notice: draft }).allowed, false);
  assert.equal(capabilitiesFor(["parent"]).has("connect.circular.acknowledge.self"), true);
  assert.equal(capabilitiesFor(["parent"]).has("connect.announcement.create"), false);
  assert.equal(capabilitiesFor([]).size, 0);
});

test("preferences mute only optional notices", () => {
  const prefs = { mutedCategories: ["achievements", "events"] };
  assert.equal(shouldNotify(prefs, { category: "achievements", priority: "P4" }), false);
  assert.equal(shouldNotify(prefs, { category: "achievements", priority: "P2" }), true, "important always notifies");
  assert.equal(shouldNotify(prefs, { category: "events", requiresAcknowledgement: true }), true);
  assert.equal(shouldNotify(prefs, { category: "health" }), true, "health & safety is essential");
  assert.equal(shouldNotify(null, { category: "achievements" }), true);
});

test("public copies are sanitized and only for live, whole-school, explicitly public notices", () => {
  const notice = { ...draft, status: "published", audienceKeys: ["school"], publicListing: true, attachments: [{ url: "https://private" }], action: { label: "Open", href: "/hub/forms/x" }, reference: "SRSS/CIR/2027/001" };
  const copy = publicNotice("n1", notice, now);
  assert.equal(copy.title, notice.title);
  assert.equal(copy.priority, "P3");
  assert.equal("attachments" in copy, false);
  assert.equal("audienceKeys" in copy, false);
  assert.equal(copy.action, null, "hub links never go public");
  assert.deepEqual(publicNotice("n1", { ...notice, action: { label: "Apply", href: "/join/admissions" } }, now).action, { label: "Apply", href: "/join/admissions", deadline: null });
  assert.equal(publicNotice("n1", { ...notice, audienceKeys: ["role:parents"] }, now), null);
  assert.equal(publicNotice("n1", { ...notice, status: "cancelled" }, now), null);
});

test("feed order: emergency and important first, then pinned, then newest", () => {
  const items = [
    { id: "old", publishedAt: { seconds: 1 } }, { id: "new", publishedAt: { seconds: 9 } }, { id: "pin", pinned: true, publishedAt: { seconds: 2 } },
    { id: "p2", priority: "P2", publishedAt: { seconds: 3 } }, { id: "p1", priority: "P1", publishedAt: { seconds: 0 } },
  ].sort(feedOrder);
  assert.deepEqual(items.map((item) => item.id), ["p1", "p2", "pin", "new", "old"]);
});

test("material changes need renewed approval; references are formatted", () => {
  assert.equal(materialChange({ audienceKeys: ["class:a"] }, { audienceKeys: ["class:a", "class:b"] }), true);
  assert.equal(materialChange({ priority: "P3", audienceKeys: [] }, { priority: "P1", audienceKeys: [] }), true);
  assert.equal(materialChange({ body: "x", audienceKeys: ["school"] }, { body: "x", audienceKeys: ["school"] }), false);
  assert.equal(circularReference("2027", 4), "SRSS/CIR/2027/004");
});

test("audience choices round-trip, including parents-only keys", () => {
  assert.deepEqual(keysFromChoice({ audience: "standardParents", standards: ["3", "4"] }), ["standard:3@parents", "standard:4@parents"]);
  assert.deepEqual(choiceFromKeys(["class:a@parents", "class:b@parents"]), { audience: "classParents", classes: ["a", "b"] });
  assert.deepEqual(choiceFromKeys(["role:staff"]), { audience: "role:staff" });
});

test("Actions Required lists pending acknowledgements with their deadline", () => {
  const actions = parentActions({ children: [], consentDefinitions: [], consentStatus: {}, formRequests: [], fees: [], acknowledgements: [{ id: "n1", title: "Uniform policy", deadline: "2027-03-05" }], today: now });
  assert.equal(actions.length, 1);
  assert.equal(actions[0].kind, "acknowledge");
  assert.equal(actions[0].to, "/hub/announcements/n1");
  assert.equal(actions[0].overdue, false);
});
