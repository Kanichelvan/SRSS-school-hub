// SRSS Connect — the pure domain contract for announcements, circulars, notifications and acknowledgements
// (SRSS Connect spec Part 1 §2–§17, Part 2 §4–§9). Shared by the Cloud Functions (authoritative) and the hub
// screens (to show the same choices and explain decisions). No Firebase imports: everything here is testable.
//
// Reconciled with the existing hub (see docs/SRSS-CONNECT.md):
//  · Targeting keeps the hub's audienceKeys model (functions/scope.js derives each person's keys from verified
//    guardian links, enrolments and teacher assignments). "Parents only" variants are `standard:4@parents` and
//    `class:<id>@parents`.
//  · Dates the school reads as calendar days (expiry, deadlines, effective date) are ISO dates in
//    Asia/Kuala_Lumpur, as elsewhere in the hub; instants (publishAt, publishedAt) are timestamps.

export const SCHEMA_VERSION = 2;
export const TIMEZONE = "Asia/Kuala_Lumpur";
export const TEACHING_ROLES = ["teacher", "classTeacher", "specialistTeacher"];

// ---------- categories (§3) ----------
// `essential` categories always notify; people may mute the others (§16).
export const CATEGORIES = [
  { id: "general", label: "General school notices", essential: false },
  { id: "academic", label: "Academic updates", essential: false },
  { id: "administrative", label: "Administrative circulars", essential: false },
  { id: "events", label: "Calendar & events", essential: false },
  { id: "activities", label: "Student activities", essential: false },
  { id: "humanExcellence", label: "Human Excellence", essential: false },
  { id: "health", label: "Health & safety", essential: true },
  { id: "parentEngagement", label: "Parent engagement", essential: false },
  { id: "forms", label: "Forms & consent", essential: true },
  { id: "staff", label: "Staff communications", essential: false },
  { id: "achievements", label: "School achievements", essential: false },
  { id: "srss25", label: "SRSS25 Silver Jubilee", essential: false },
  { id: "class", label: "Class notices", essential: false },
  { id: "emergency", label: "Emergency notices", essential: true },
];
// Notices written before SRSS Connect v2 used a shorter list.
const LEGACY_CATEGORIES = { school: "general", event: "events", reminder: "general", urgent: "emergency" };
export const categoryId = (id) => LEGACY_CATEGORIES[id] || id || "general";
export const categoryOf = (id) => CATEGORIES.find((item) => item.id === categoryId(id)) || CATEGORIES[0];
export const OPTIONAL_CATEGORY_IDS = CATEGORIES.filter((item) => !item.essential).map((item) => item.id);
// Teachers post routine notices: never emergency or staff-wide categories.
export const TEACHER_CATEGORY_IDS = ["class", "academic", "events", "activities", "humanExcellence", "parentEngagement", "forms", "health"];

// ---------- priorities (§4) ----------
export const PRIORITIES = {
  P1: { label: "Emergency", detail: "Red banner, shown first everywhere; Leadership only.", tone: "bad" },
  P2: { label: "Important", detail: "Highlighted and kept near the top.", tone: "warn" },
  P3: { label: "Standard", detail: "A normal notice and notification.", tone: "info" },
  P4: { label: "Informational", detail: "Quiet; in the feed only.", tone: "neutral" },
};
export const PRIORITY_IDS = Object.keys(PRIORITIES);
export const priorityOf = (notice) => (PRIORITY_IDS.includes(notice?.priority) ? notice.priority : notice?.category === "urgent" ? "P2" : "P3");
export const priorityRank = (notice) => PRIORITY_IDS.indexOf(priorityOf(notice));
export const isImportant = (notice) => ["P1", "P2"].includes(priorityOf(notice));

// ---------- types and required actions (§9–§10) ----------
export const TYPES = { announcement: "Announcement", circular: "Circular" };
export const ACTION_TYPES = {
  form: "Complete a form", consent: "Submit consent", register: "Register for an event", meeting: "Book a meeting",
  confirm: "Confirm information", review: "Review a document", link: "Open a link",
};

// ---------- lifecycle (Part 2 §6.1) ----------
export const STATUSES = {
  draft: "Draft", pending_review: "Pending approval", approved: "Approved", scheduled: "Scheduled", published: "Published",
  expired: "Expired", archived: "Archived", cancelled: "Cancelled", rejected: "Returned for changes",
};
export const TRANSITIONS = {
  draft: ["pending_review", "approved", "archived"],
  pending_review: ["approved", "rejected", "draft"],
  rejected: ["draft", "archived"],
  approved: ["published", "scheduled", "draft"],
  scheduled: ["published", "cancelled", "draft"],
  published: ["expired", "cancelled", "archived"],
  expired: ["archived"],
  cancelled: ["archived"],
  archived: [],
};
export const canTransition = (from, to) => (TRANSITIONS[from] || []).includes(to);
// Content may change only before approval; afterwards an edit returns the notice to draft (renewed approval).
export const EDITABLE_STATUSES = ["draft", "rejected", "pending_review", "approved", "scheduled"];

// ---------- dates ----------
export const schoolDate = (date = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
export const toMillis = (value) => (value?.toMillis ? value.toMillis() : value?.toDate ? value.toDate().getTime() : value?.seconds != null ? value.seconds * 1000 : value ? new Date(value).getTime() : NaN);
export const isLive = (notice, now = new Date()) => notice?.status === "published" && (!notice.expiresAt || notice.expiresAt >= schoolDate(now));
export const isDue = (notice, now = new Date()) => notice?.status === "scheduled" && Number.isFinite(toMillis(notice.publishAt)) && toMillis(notice.publishAt) <= now.getTime();

// ---------- audiences (§5, Part 2 §5.3) ----------
const KEY = /^(school|role:(parents|teachers|staff|students)|standard:[1-6](@parents)?|class:[A-Za-z0-9_-]{1,64}(@parents)?|user:[A-Za-z0-9_-]{1,128})$/;
export const isAudienceKey = (key) => typeof key === "string" && KEY.test(key);
// school-wide → target.school · standard → target.standard · class → target.class · person → target.explicit
export function audienceLevel(key) {
  if (key === "school" || key.startsWith("role:")) return "school";
  if (key.startsWith("standard:")) return "standard";
  if (key.startsWith("class:")) return "class";
  return "explicit";
}
export const teacherKeys = (scope = {}) => (scope.publishKeys || []).flatMap((key) => [key, `${key}@parents`]);
// Parents of a class or standard also see the plain key, so `class:x` reaches pupils, parents and teachers.
export function describeKey(key, { classes = [], people = {} } = {}) {
  const parents = key.endsWith("@parents");
  const base = parents ? key.slice(0, -8) : key;
  const fixed = { school: "Whole school", "role:parents": "All parents", "role:teachers": "Teachers", "role:staff": "All staff", "role:students": "All students" }[base];
  let label = fixed;
  if (!label && base.startsWith("standard:")) label = `Standard ${base.slice(9)}`;
  if (!label && base.startsWith("class:")) label = classes.find((cls) => cls.id === base.slice(6))?.name || "Class";
  if (!label && base.startsWith("user:")) label = people[base.slice(5)] || "Selected person";
  return parents ? `${label} parents` : label || key;
}
export const describeAudience = (keys = [], lookups) => keys.map((key) => describeKey(key, lookups)).join(", ") || "—";

// Editor choices ⇄ keys (shared so the hub editor and tests agree).
export function keysFromChoice({ audience, standards = [], classes = [], users = [] }) {
  if (audience === "standardParents") return standards.map((level) => `standard:${level}@parents`);
  if (audience === "standard") return standards.map((level) => `standard:${level}`);
  if (audience === "classParents") return classes.map((id) => `class:${id}@parents`);
  if (audience === "class") return classes.map((id) => `class:${id}`);
  if (audience === "users") return users.map((uid) => `user:${uid}`);
  return audience ? [audience] : [];
}
export function choiceFromKeys(keys = []) {
  const first = keys[0] || "school";
  const parents = first.endsWith("@parents");
  const strip = (key) => (key.endsWith("@parents") ? key.slice(0, -8) : key);
  if (first.startsWith("standard:")) return { audience: parents ? "standardParents" : "standard", standards: keys.map((key) => strip(key).slice(9)) };
  if (first.startsWith("class:")) return { audience: parents ? "classParents" : "class", classes: keys.map((key) => strip(key).slice(6)) };
  if (first.startsWith("user:")) return { audience: "users", users: keys.map((key) => key.slice(5)) };
  return { audience: first };
}

// ---------- capabilities (Part 2 §4) ----------
const C = (...names) => names.map((name) => `connect.${name}`);
const SELF = C("announcement.read.public", "announcement.read.targeted", "notification.read.self", "notification.mark_read.self", "notification.archive.self", "notification.preferences.self", "circular.acknowledge.self");
const OFFICE = C("announcement.create", "announcement.edit.scope", "announcement.submit", "announcement.review", "announcement.approve", "announcement.publish", "announcement.schedule", "announcement.cancel", "announcement.archive",
  "announcement.target.class", "announcement.target.standard", "announcement.target.school", "announcement.target.explicit",
  "notification.delivery.view", "circular.create", "circular.publish", "circular.report.view", "circular.remind", "template.manage");
export const ROLE_CAPABILITIES = {
  superAdmin: [...OFFICE, ...C("announcement.priority.critical", "emergency.override", "settings.manage", "audit.read", "delivery.diagnostics", "notification.delivery.retry")],
  leadership: [...OFFICE, ...C("announcement.priority.critical", "emergency.override", "settings.manage", "audit.read")],
  schoolAdmin: [...OFFICE, ...C("audit.read")],
  academicCoordinator: C("announcement.create", "announcement.edit.scope", "announcement.submit", "announcement.review", "announcement.approve", "announcement.publish", "announcement.schedule", "announcement.cancel", "announcement.archive",
    "announcement.target.class", "announcement.target.standard", "notification.delivery.view", "circular.create", "circular.publish", "circular.report.view", "circular.remind"),
  contentEditor: C("announcement.create", "announcement.edit.scope", "announcement.submit", "announcement.target.school", "announcement.target.standard", "announcement.target.class", "circular.create"),
  // Teachers act on their own notices for their own classes only; the class scope is checked separately.
  teacher: C("announcement.create", "announcement.edit.own", "announcement.submit", "announcement.publish.class", "announcement.schedule", "announcement.target.class", "notification.delivery.view.own", "circular.create", "circular.report.view.own", "circular.remind.own"),
  technicalAdmin: C("delivery.diagnostics", "notification.delivery.retry"),
};
ROLE_CAPABILITIES.classTeacher = ROLE_CAPABILITIES.teacher;
ROLE_CAPABILITIES.specialistTeacher = ROLE_CAPABILITIES.teacher;

export function capabilitiesFor(roles = []) {
  const set = new Set(roles.length ? SELF : []);
  for (const role of roles) for (const capability of ROLE_CAPABILITIES[role] || []) set.add(capability);
  return set;
}
export const hasCapability = (roles, capability) => capabilitiesFor(roles).has(capability.startsWith("connect.") ? capability : `connect.${capability}`);
export const canAuthor = (roles) => hasCapability(roles, "announcement.create");
export const canReview = (roles) => hasCapability(roles, "announcement.approve");
export const isOffice = (roles) => hasCapability(roles, "announcement.edit.scope");
export const canReport = (roles, notice, uid) => hasCapability(roles, "circular.report.view") || hasCapability(roles, "notification.delivery.view") || (notice?.createdBy === uid && hasCapability(roles, "circular.report.view.own"));
export const canEdit = (roles, notice, uid) => !notice || isOffice(roles) || (notice.createdBy === uid && hasCapability(roles, "announcement.edit.own"));

// May this person publish this notice without a second person's approval? (Part 1 §13, user decision 7 Nov 2026:
// office and leadership publish directly; P1 needs Leadership; teachers publish routine notices to their classes.)
export function publishDecision({ roles = [], scope = {}, uid, notice }) {
  const caps = capabilitiesFor(roles);
  const keys = notice.audienceKeys || [];
  if (priorityOf(notice) === "P1" && !caps.has("connect.announcement.priority.critical")) return { allowed: false, reason: "Emergency (P1) notices are published by Leadership. Submit it for approval." };
  if (notice.publicListing && !caps.has("connect.announcement.target.school")) return { allowed: false, reason: "Only the school office can put a notice on the public website." };
  if (caps.has("connect.announcement.publish")) {
    const missing = keys.find((key) => !caps.has(`connect.announcement.target.${audienceLevel(key)}`));
    return missing ? { allowed: false, reason: `Your role can't address "${describeKey(missing)}" directly. Submit it for approval.` } : { allowed: true };
  }
  if (caps.has("connect.announcement.publish.class")) {
    const own = new Set(teacherKeys(scope));
    if (notice.createdBy && notice.createdBy !== uid) return { allowed: false, reason: "Teachers publish only their own notices." };
    if (!keys.length || keys.some((key) => !own.has(key))) return { allowed: false, reason: "You can publish directly only to your own classes. Submit it for approval to reach a wider audience." };
    if (!["P3", "P4"].includes(priorityOf(notice))) return { allowed: false, reason: "Important (P2) notices from teachers go to the office for approval." };
    if (!TEACHER_CATEGORY_IDS.includes(categoryId(notice.category))) return { allowed: false, reason: "This category is published by the school office. Submit it for approval." };
    if (notice.pinned) return { allowed: false, reason: "Only the office pins notices." };
    return { allowed: true };
  }
  return { allowed: false, reason: "Your role prepares notices; a reviewer publishes them." };
}
// A reviewer may approve what they could publish themselves (so a P1 still needs Leadership).
export function reviewDecision({ roles = [], notice }) {
  if (!canReview(roles)) return { allowed: false, reason: "You don't review notices." };
  return publishDecision({ roles, notice: { ...notice, createdBy: undefined } });
}

// ---------- validation (Part 2 §5.2, UT-001…UT-013) ----------
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
export function safeHref(value) {
  if (typeof value !== "string" || value.length > 500) return false;
  if (/^\/(hub|forms|resources|join|about|learning|student-life|community|srss25|announcements|legal)(\/[\w\-./?=&%#]*)?$/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}
const isPublicHref = (href) => typeof href === "string" && !href.startsWith("/hub") && !href.startsWith("/forms/requests");

export function validateNotice(input = {}, { now = new Date() } = {}) {
  const errors = {};
  const str = (key, max, required) => {
    const value = input[key] == null ? "" : input[key];
    if (typeof value !== "string") { errors[key] = "Enter text."; return ""; }
    const trimmed = value.trim();
    if (required && !trimmed) errors[key] = "Required.";
    else if (trimmed.length > max) errors[key] = `Keep this to ${max} characters or fewer.`;
    return trimmed;
  };
  const type = input.type ?? "announcement";
  if (!TYPES[type]) errors.type = "Choose announcement or circular.";
  const title = str("title", 140, true);
  const body = str("body", 5000, true);
  const summary = str("summary", 300, false) || body.replace(/\s+/g, " ").slice(0, 200);
  const category = categoryId(input.category);
  if (!CATEGORIES.some((item) => item.id === category)) errors.category = "Choose a category.";
  const priority = input.priority ?? "P3";
  if (!PRIORITY_IDS.includes(priority)) errors.priority = "Choose a priority from P1 to P4.";
  const audienceKeys = Array.isArray(input.audienceKeys) ? [...new Set(input.audienceKeys)] : [];
  if (!audienceKeys.length) errors.audienceKeys = "Choose who should receive this.";
  else if (audienceKeys.length > 30) errors.audienceKeys = "Choose 30 or fewer audiences.";
  else if (audienceKeys.some((key) => !isAudienceKey(key))) errors.audienceKeys = "That audience isn't recognised.";
  const publicListing = input.publicListing === true;
  if (publicListing && (audienceKeys.length !== 1 || audienceKeys[0] !== "school")) errors.publicListing = "Public website notices must be addressed to the whole school.";
  const pinned = input.pinned === true;
  const requiresAcknowledgement = input.requiresAcknowledgement === true;
  const dateField = (key) => {
    const value = input[key];
    if (value == null || value === "") return null;
    if (typeof value !== "string" || !ISO_DATE.test(value) || Number.isNaN(Date.parse(value))) { errors[key] = "Choose a valid date."; return null; }
    return value;
  };
  const expiresAt = dateField("expiresAt");
  if (expiresAt && expiresAt < schoolDate(now)) errors.expiresAt = "The removal date has already passed.";
  const acknowledgementDeadline = requiresAcknowledgement ? dateField("acknowledgementDeadline") : null;
  const effectiveDate = dateField("effectiveDate");
  let publishAt = null;
  if (input.publishAt != null && input.publishAt !== "") {
    const at = Date.parse(input.publishAt);
    if (typeof input.publishAt !== "string" || !Number.isFinite(at)) errors.publishAt = "Choose a valid publication time.";
    else publishAt = new Date(at).toISOString();
  }
  let action = null;
  if (input.action && (input.action.href || input.action.label)) {
    const kind = input.action.type || "link";
    const label = String(input.action.label || ACTION_TYPES[kind] || "").trim();
    if (!ACTION_TYPES[kind]) errors.action = "Choose what recipients should do.";
    else if (!label || label.length > 40) errors.action = "Give the button a short label (40 characters or fewer).";
    else if (!safeHref(input.action.href)) errors.action = "The action link must be a hub page (/hub/…) or an https:// address.";
    const deadline = input.action.deadline ? (ISO_DATE.test(input.action.deadline) ? input.action.deadline : (errors.action = "Choose a valid deadline.", null)) : null;
    action = { type: kind, label, href: input.action.href, deadline };
  }
  const attachments = Array.isArray(input.attachments) ? input.attachments : [];
  if (attachments.length > 10) errors.attachments = "Add 10 attachments or fewer.";
  else if (attachments.some((link) => !link || typeof link.url !== "string" || !/^https:\/\/\S+$/.test(link.url) || String(link.label || "").length > 120)) errors.attachments = "Each attachment must be an https:// link.";
  const issuingDepartment = type === "circular" ? str("issuingDepartment", 80, false) || "School Office" : null;
  const value = {
    schemaVersion: SCHEMA_VERSION, type, title, summary, body, category, priority, audienceKeys, publicListing, pinned,
    requiresAcknowledgement, acknowledgementDeadline, expiresAt, effectiveDate, publishAt, action,
    attachments: attachments.map((link) => ({ label: String(link.label || link.url).trim(), url: link.url })), issuingDepartment,
    channels: { inApp: true, publicWebsite: publicListing, email: false, push: false },
  };
  return { value, errors, valid: Object.keys(errors).length === 0 };
}
// Changes that need renewed approval when they are made after approval (Part 2 §6.2).
export function materialChange(before = {}, after = {}) {
  const wider = (after.audienceKeys || []).some((key) => !(before.audienceKeys || []).includes(key));
  return wider || priorityRank(after) < priorityRank(before) || before.acknowledgementDeadline !== after.acknowledgementDeadline
    || JSON.stringify(before.action || null) !== JSON.stringify(after.action || null) || before.body !== after.body || before.requiresAcknowledgement !== after.requiresAcknowledgement
    || JSON.stringify(before.attachments || []) !== JSON.stringify(after.attachments || []);
}

// ---------- notifications, acknowledgements and delivery (Part 2 §5.4–§5.6, §9) ----------
// Revision 1 keeps the pre-v2 identifier so notices delivered before SRSS Connect v2 are never delivered twice.
export const notificationId = (announcementId, revision, uid, purpose = "announcement") =>
  purpose === "announcement" ? (revision > 1 ? `announcement_${announcementId}_r${revision}_${uid}` : `announcement_${announcementId}_${uid}`) : `${purpose}_${announcementId}_r${revision}_${uid}`;
export const acknowledgementId = (announcementId, revision, uid) => `${announcementId}_r${revision}_${uid}`;
export const deliveryJobId = (announcementId, revision, channel = "inApp") => `${announcementId}_r${revision}_${channel}`;
export const deliveryRevision = (notice) => notice?.deliveryRevision || notice?.revision || 1;

// The minimum a notification needs to be shown; the notice itself stays the authoritative record.
export function notificationFor(id, notice, recipientUid, { purpose = "announcement", title } = {}) {
  const revision = deliveryRevision(notice);
  const preview = String(notice.summary || notice.body || "").replace(/\s+/g, " ").slice(0, 160);
  return {
    recipientUid, sourceType: notice.type || "announcement", sourceId: id, sourceRevision: revision, announcementId: id, purpose,
    category: categoryId(notice.category), priority: priorityOf(notice), critical: isImportant(notice),
    title: title || notice.title, preview, body: preview, link: `/hub/announcements/${id}`,
    actionRequired: Boolean(notice.requiresAcknowledgement || notice.action), readAt: null, archivedAt: null, expiresAt: notice.expiresAt || null,
    dedupeKey: notificationId(id, revision, recipientUid, purpose),
  };
}
// Essential notices always notify; muted optional categories still appear in the person's notice feed.
export function shouldNotify(preferences, notice) {
  if (isImportant(notice) || notice.requiresAcknowledgement || notice.action || categoryOf(notice.category).essential) return true;
  return !(preferences?.mutedCategories || []).includes(categoryId(notice.category));
}
export const recipientEligible = (user, notice) => (user.status ?? "active") === "active" && (user.roles || []).length > 0
  && (user.audienceKeys || []).some((key) => (notice.audienceKeys || []).includes(key));

// Public copy: only explicitly public, live, whole-school notices; never attachments, recipients or hub links.
export function publicNotice(id, notice, now = new Date()) {
  if (!isLive(notice, now) || notice.publicListing !== true || notice.audienceKeys?.length !== 1 || notice.audienceKeys[0] !== "school") return null;
  const at = notice.publishedAt?.toDate?.() || notice.createdAt?.toDate?.() || now;
  const action = notice.action && isPublicHref(notice.action.href) ? { label: notice.action.label, href: notice.action.href, deadline: notice.action.deadline || null } : null;
  return {
    sourceId: id, status: "published", title: notice.title, summary: notice.summary || String(notice.body || "").slice(0, 200), body: notice.body || "",
    category: categoryId(notice.category), priority: priorityOf(notice), pinned: Boolean(notice.pinned), reference: notice.reference || null,
    date: schoolDate(at), expiresAt: notice.expiresAt || null, action,
  };
}
// Circular reference numbers: SRSS/CIR/2027/004 (§9.1).
export const circularReference = (year, sequence) => `SRSS/CIR/${year}/${String(sequence).padStart(3, "0")}`;

// Feed order: emergency and important first, then pinned, then newest.
export function feedOrder(a, b) {
  if (isImportant(a) || isImportant(b)) { const byPriority = priorityRank(a) - priorityRank(b); if (byPriority) return byPriority; }
  return Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || (toMillis(b.publishedAt) || 0) - (toMillis(a.publishedAt) || 0);
}
