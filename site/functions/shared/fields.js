// Office data fields: allowed values, labels and validators. This is the single definition used by the hub
// screens, the CSV import and (later) the Google Sheet sync and Cloud Functions. Pure module: no imports.
// The same limits are enforced in firestore.rules.

export const GENDERS = [["boy", "Boy"], ["girl", "Girl"]];
export const MOTHER_TONGUES = [["tamil", "Tamil"], ["chinese", "Chinese"], ["telugu", "Telugu"]];
export const RELIGIONS = [["hindu", "Hindu"], ["buddhist", "Buddhist"], ["christian", "Christian"], ["islam", "Islam"], ["sikh", "Sikh"], ["other", "Other"]];
export const STAFF_TYPES = [["teaching", "Teaching"], ["nonTeaching", "Non-teaching"]];
export const MAX_SIGNATORIES = 10; // active at one time
export const MAX_SIGNATORY_RECORDS = 50; // active and retired together; firestore.rules enforces this

const squash = (value) => String(value ?? "").trim().toLowerCase().replace(/[\s-]/g, "");

// E.164 ("+60123456789") or null. Accepts the ways a Malaysian number is typed ("012-345 6789", "6012 345 6789",
// "+60 012-345 6789", "0060 12 345 6789") and other countries' numbers written with "+" or "00". Anything with
// letters (an extension, or a spreadsheet's "6.01E+11") is refused rather than guessed at.
export function normalisePhone(input) {
  const raw = String(input ?? "").trim();
  if (!raw || /[^\d+\s\-().]/.test(raw)) return null;
  const digits = raw.replace(/\D/g, "");
  let number = null;
  if (raw.startsWith("+")) number = digits;
  else if (digits.startsWith("00")) number = digits.slice(2);
  else if (digits.startsWith("0")) number = `60${digits.slice(1)}`;
  else if (digits.startsWith("60")) number = digits;
  if (!number) return null;
  if (number.startsWith("600")) number = `60${number.slice(3)}`; // "+60 012…": the trunk 0 does not belong
  const valid = number.startsWith("60") ? /^60\d{9,10}$/.test(number) : /^[1-9]\d{7,14}$/.test(number);
  return valid ? `+${number}` : null;
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

// Trims and tidies the signatory list. Letters refer to a signatory by id, so an id is never dropped or reused:
// a saved signatory whose name is cleared is retired instead. New entries get the next free "sig-<n>".
// At most MAX_SIGNATORIES are active; retired ones are kept (up to MAX_SIGNATORY_RECORDS in all).
export function sanitiseSignatories(list) {
  let active = 0;
  const entries = (Array.isArray(list) ? list : [])
    .map((entry) => ({ id: String(entry?.id ?? "").trim(), name: String(entry?.name ?? "").trim().slice(0, 120), title: String(entry?.title ?? "").trim().slice(0, 80), active: entry?.active !== false }))
    .filter((entry) => entry.name || entry.id)
    .map((entry) => (entry.name ? entry : { ...entry, active: false }))
    .filter((entry) => !entry.active || (active += 1) <= MAX_SIGNATORIES)
    .slice(0, MAX_SIGNATORY_RECORDS);
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
