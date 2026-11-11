// Office data fields: allowed values, labels and validators. This is the single definition used by the hub
// screens, the CSV import and (later) the Google Sheet sync and Cloud Functions. Pure module: no imports.
// The same limits are enforced in firestore.rules.

export const GENDERS = [["boy", "Boy"], ["girl", "Girl"]];
export const MOTHER_TONGUES = [["tamil", "Tamil"], ["chinese", "Chinese"], ["telugu", "Telugu"]];
export const STAFF_TYPES = [["teaching", "Teaching"], ["nonTeaching", "Non-teaching"]];
export const MAX_SIGNATORIES = 10;

const squash = (value) => String(value ?? "").trim().toLowerCase().replace(/[\s-]/g, "");

// E.164 ("+60123456789") or null. Numbers typed the Malaysian way ("012-345 6789", "6012 345 6789") gain +60.
export function normalisePhone(input) {
  const raw = String(input ?? "").trim();
  const digits = raw.replace(/\D/g, "");
  let number = null;
  if (raw.startsWith("+")) number = `+${digits}`;
  else if (digits.startsWith("0")) number = `+60${digits.slice(1)}`;
  else if (digits.startsWith("60")) number = `+${digits}`;
  return number && /^\+\d{8,15}$/.test(number) ? number : null;
}

// Matches a stored value or its label, ignoring case, spaces and hyphens. Null when nothing matches.
export function parseChoice(options, input) {
  const wanted = squash(input);
  if (!wanted) return null;
  return options.find(([value, label]) => squash(value) === wanted || squash(label) === wanted)?.[0] ?? null;
}

export function parseYesNo(input) {
  const value = squash(input);
  if (["yes", "y", "true"].includes(value)) return true;
  if (["no", "n", "false"].includes(value)) return false;
  return null;
}

export const validMonth = (input) => /^\d{4}-(0[1-9]|1[0-2])$/.test(String(input ?? ""));

// Trims, drops entries with no name, keeps existing ids and gives new entries the next free "sig-<n>".
export function sanitiseSignatories(list) {
  const entries = (Array.isArray(list) ? list : [])
    .map((entry) => ({ id: String(entry?.id ?? "").trim(), name: String(entry?.name ?? "").trim().slice(0, 120), title: String(entry?.title ?? "").trim().slice(0, 80), active: entry?.active !== false }))
    .filter((entry) => entry.name)
    .slice(0, MAX_SIGNATORIES);
  const used = new Set(entries.map((entry) => entry.id).filter(Boolean));
  let next = 1;
  return entries.map((entry) => {
    if (entry.id) return entry;
    while (used.has(`sig-${next}`)) next += 1;
    used.add(`sig-${next}`);
    return { ...entry, id: `sig-${next}` };
  });
}

// Letters record their signatory by id, so a signatory is retired, never deleted.
export const removeSignatory = (list, id) => list.map((entry) => (entry.id === id ? { ...entry, active: false } : entry));
