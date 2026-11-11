// School profile fields used by parents and by letters: office hours, the phone number for parents, the school
// code, the Headmistress and the people who sign letters. Pure; the screen is SchoolInformation (screens/system.jsx).
import { normalisePhone, sanitiseSignatories } from "../../../functions/shared/fields.js";

const clean = (value, max) => String(value ?? "").trim().slice(0, max) || null;

// The part of settings/school this screen owns, ready to merge. Throws with a message the form can show.
export function profilePatch(values) {
  const phone = String(values.parentPhone ?? "").trim();
  if (phone && !normalisePhone(phone)) throw new Error("Enter the phone number with its country code.");
  const name = clean(values.headmistress?.name, 120);
  const title = clean(values.headmistress?.title, 80);
  return {
    officeHours: clean(values.officeHours, 200),
    parentPhone: phone ? normalisePhone(phone) : null,
    schoolCode: clean(values.schoolCode, 30),
    headmistress: name || title ? { name: name || "", title: title || "" } : null,
    signatories: sanitiseSignatories(values.signatories),
  };
}
