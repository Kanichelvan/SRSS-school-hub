// Audience targeting for announcements and events. A notice carries `audienceKeys`; each person's own keys
// are derived on the server (functions/scope.js), and firestore.rules only lets someone read a notice
// whose keys overlap theirs — so targeting is enforced by the data layer, not by hiding things.
//   All → school · Parents → role:parents · Teachers → role:teachers · Students → role:students
//   Standard → standard:N · Class → class:<id> · Selected users → user:<uid>

export const AUDIENCE_TYPES = [
  ["school", "Everyone (whole school)"], ["role:parents", "Parents"], ["role:teachers", "Teachers"], ["role:staff", "All staff"],
  ["role:students", "Students"], ["standard", "One or more Standards"], ["class", "One or more classes"], ["users", "Selected people"],
];

export const ANNOUNCEMENT_CATEGORIES = [["school", "School-wide"], ["class", "Class"], ["academic", "Academic"], ["event", "Event"], ["reminder", "Reminder"], ["urgent", "Urgent"]];
export const EVENT_CATEGORIES = [["school", "School event"], ["class", "Class event"], ["academic", "Academic"], ["holiday", "Holiday"], ["meeting", "Meeting"]];

export function keysFromDraft(draft) {
  if (draft.audienceType === "standard") return (draft.audienceStandards || []).map((level) => `standard:${level}`);
  if (draft.audienceType === "class") return (draft.audienceClasses || []).map((id) => `class:${id}`);
  if (draft.audienceType === "users") return (draft.audienceUsers || []).map((uid) => `user:${uid}`);
  return draft.audienceType ? [draft.audienceType] : [];
}

export function draftFromKeys(keys = []) {
  const first = keys[0] || "school";
  if (first.startsWith("standard:")) return { audienceType: "standard", audienceStandards: keys.map((key) => key.slice(9)) };
  if (first.startsWith("class:")) return { audienceType: "class", audienceClasses: keys.map((key) => key.slice(6)) };
  if (first.startsWith("user:")) return { audienceType: "users", audienceUsers: keys.map((key) => key.slice(5)) };
  return { audienceType: first };
}

export function describeAudience(keys = [], { classes = [], people = {} } = {}) {
  return keys.map((key) => {
    const fixed = AUDIENCE_TYPES.find(([value]) => value === key);
    if (fixed) return fixed[1].replace(" (whole school)", "");
    if (key.startsWith("standard:")) return `Standard ${key.slice(9)}`;
    if (key.startsWith("class:")) return `Class ${classes.find((cls) => cls.id === key.slice(6))?.name || key.slice(6)}`;
    if (key.startsWith("user:")) return people[key.slice(5)] || "Selected person";
    return key;
  }).join(", ");
}

// Fields shared by the announcement and event editors (see manage.jsx field format).
export function audienceFields({ classOptions, userOptions }) {
  return [
    { key: "audienceType", label: "Who should see this?", type: "select", required: true, options: AUDIENCE_TYPES },
    { key: "audienceStandards", label: "Standards", type: "checkboxes", options: [1, 2, 3, 4, 5, 6].map((level) => [String(level), `Standard ${level}`]), show: (draft) => draft.audienceType === "standard", wide: true },
    { key: "audienceClasses", label: "Classes", type: "checkboxes", options: classOptions, show: (draft) => draft.audienceType === "class", wide: true },
    { key: "audienceUsers", label: "People", type: "checkboxes", options: userOptions, show: (draft) => draft.audienceType === "users", wide: true, emptyOptions: "No hub accounts yet." },
  ];
}

export function audienceError(draft) {
  if (["standard", "class", "users"].includes(draft.audienceType) && !keysFromDraft(draft).length) return "Choose at least one.";
  if (keysFromDraft(draft).length > 30) return "Choose 30 or fewer.";
  return null;
}

// Attachments and media references are links ("Label | https://…", one per line) to files kept in the
// school's Google Drive, which keeps its own sharing controls; nothing here creates a public file URL.
export function parseLinks(text) {
  return String(text || "").split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const [label, url] = line.includes("|") ? line.split("|").map((part) => part.trim()) : [null, line];
    return { label: label || url, url };
  });
}
export const linksText = (links = []) => links.map((link) => (link.label && link.label !== link.url ? `${link.label} | ${link.url}` : link.url)).join("\n");
export const linksError = (text) => (parseLinks(text).some((link) => !/^https:\/\/\S+$/.test(link.url)) ? "Each link must start with https://" : parseLinks(text).length > 10 ? "Add 10 links or fewer." : null);
