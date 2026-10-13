// One School Stories system (Architecture v2.0): a story is written once, tagged with a category, and
// appears automatically on the homepage, Resources › News and the matching Student Life page.
// The hub's news editor offers exactly these categories.
export const STORY_CATEGORIES = ["School News", "Achievements", "Academic", "Sports", "Arts & Culture", "Service", "Leadership", "Community", "SRSS25"];

// Older stories used "Values in Action" before the categories were settled.
const LEGACY = { "Values in Action": "Service" };
export const storyCategory = (item) => LEGACY[item.category] || item.category || (item.type === "Event" ? "Event" : "School News");

// Student Life pages that list one category of stories (route path → category).
export const STUDENT_LIFE_CATEGORIES = [
  ["Achievements", "/student-life/achievements"],
  ["Sports", "/student-life/sports"],
  ["Arts & Culture", "/student-life/arts-culture"],
  ["Service", "/student-life/service"],
  ["Leadership", "/student-life/leadership"],
];
