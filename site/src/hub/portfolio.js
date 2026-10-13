// Portfolio vocabulary shared by the teacher, parent, student and moderation screens (plain JS, unit-tested).

// Built-in categories (user decision, 14 Oct 2026); Admin › Settings › Portfolio categories can add more.
export const PORTFOLIO_CATEGORIES = [["academic", "Academic Learning"], ["humanValues", "Human Values"], ["cocurricular", "Co-curricular"], ["achievements", "Achievements"], ["reflections", "Reflections & Growth"]];
// Categories used before these were settled.
const LEGACY_CATEGORIES = { character: "humanValues", personal: "reflections", contribution: "cocurricular", experiences: "cocurricular" };
export const categoryOf = (entry) => LEGACY_CATEGORIES[entry.category] || entry.category || "academic";
export const categoryLabel = (id, extra = []) => [...PORTFOLIO_CATEGORIES, ...extra].find(([value]) => value === LEGACY_CATEGORIES[id] || value === id)?.[1] || "Learning";

export const VISIBILITY = [["internal", "Internal (staff only)"], ["family", "Parent-visible"], ["showcaseCandidate", "Showcase candidate"], ["publicShowcase", "Public showcase"]];
// What a teacher may choose. Public showcase is set only by a moderator, and only with consent.
export const TEACHER_VISIBILITY = VISIBILITY.slice(0, 3);
export const FAMILY_VISIBLE = ["family", "showcaseCandidate", "publicShowcase"];

export const humanValuesOf = (entry) => entry.humanValues || (entry.humanValue ? [entry.humanValue] : []);

// The public-showcase consent recorded for a pupil: granted / declined / withdrawn / missing.
export const showcaseConsent = (statusDoc) => statusDoc?.types?.publicShowcase?.response || "missing";

// What families and the pupil may see: not internal, not archived.
export const visibleToFamily = (entry) => FAMILY_VISIBLE.includes(entry.visibility) && entry.status !== "archived";

// Moderation status follows the visibility a teacher chooses; a moderator's decision is kept.
export function moderationFor(visibility, previous) {
  if (visibility === "showcaseCandidate") return previous === "returned" ? "pending" : previous || "pending";
  if (visibility === "publicShowcase") return previous;
  return previous === "returned" ? "returned" : null;
}
