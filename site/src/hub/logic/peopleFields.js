// Form fields for the People screens (pupils, staff, guardians). Plain data so it can be tested and reused
// without React or Firebase. Allowed values come from functions/shared/fields.js; firestore.rules enforces them.
import { GENDERS, MOTHER_TONGUES, STAFF_TYPES, normalisePhone, validMonth } from "../../../functions/shared/fields.js";

export const LANGUAGES = [["English", "English"], ["Bahasa Melayu", "Bahasa Melayu"], ["Tamil", "Tamil"], ["Mandarin", "Mandarin"]];
export const WHATSAPP_ERROR = "Enter the WhatsApp number with its country code, for example +60 12-345 6789.";

export const STARTED_AT_ERROR = "Enter the month as year-month, for example 2019-01.";
export const startedAtError = (value) => (String(value ?? "").trim() && !validMonth(String(value).trim()) ? STARTED_AT_ERROR : null);

export const STUDENT_FIELDS = [
  { key: "name", label: "Full name", type: "text", required: true, maxLength: 120 },
  { key: "preferredName", label: "Preferred name", type: "text", maxLength: 60 },
  { key: "studentNumber", label: "Student number", type: "text", maxLength: 30, placeholder: "2027-0001" },
  { key: "gender", label: "Gender", type: "select", options: GENDERS, placeholder: "Not recorded" },
  { key: "dateOfBirth", label: "Date of birth", type: "date" },
  { key: "admissionDate", label: "Admission date", type: "date" },
  { key: "motherTongue", label: "Mother-tongue class", type: "select", options: MOTHER_TONGUES, placeholder: "Not recorded" },
  { key: "meals", label: "Takes school meals", type: "checkbox" },
  { key: "newThisYear", label: "New to SRSS this year", type: "checkbox" },
  { key: "status", label: "Status", type: "select", required: true, options: [["active", "Active"], ["withdrawn", "Withdrawn"], ["graduated", "Graduated"]] },
];

export const STAFF_FIELDS = [
  { key: "name", label: "Full name", type: "text", required: true, maxLength: 120 },
  { key: "schoolName", label: "Name used in school", type: "text", maxLength: 80, placeholder: "Teacher Kavitha" },
  { key: "position", label: "Position", type: "text", maxLength: 80, placeholder: "Class Teacher, Standard 4" },
  { key: "staffType", label: "Teaching or non-teaching", type: "select", options: STAFF_TYPES, placeholder: "Not recorded" },
  { key: "email", label: "Email", type: "email", maxLength: 200 },
  { key: "phone", label: "Phone", type: "tel", maxLength: 30 },
  { key: "startedAt", label: "Started at SRSS", type: "month", placeholder: "2019-01", pattern: /^\d{4}-(0[1-9]|1[0-2])$/, patternMessage: STARTED_AT_ERROR },
  { key: "directoryVisible", label: "Show name and position to families in the hub directory", type: "checkbox", wide: true },
];

export const GUARDIAN_FIELDS = [
  { key: "name", label: "Full name", type: "text", required: true, maxLength: 120 },
  { key: "email", label: "Email", type: "email", maxLength: 200 },
  { key: "phone", label: "Phone", type: "tel", maxLength: 30 },
  { key: "whatsapp", label: "WhatsApp number", type: "tel", maxLength: 30, placeholder: "+60 12-345 6789", help: "With country code. Used by the class teacher to message the family." },
  { key: "preferredLanguage", label: "Preferred language", type: "select", options: LANGUAGES },
  { key: "address", label: "Address", type: "textarea", maxLength: 300, wide: true },
];

export const whatsappError = (value) => (String(value ?? "").trim() && !normalisePhone(value) ? WHATSAPP_ERROR : null);

// Stores the WhatsApp number in one form (+60123456789) so links and the Sheet never see local spellings.
export function prepareGuardian(values) {
  if (whatsappError(values.whatsapp)) throw new Error(WHATSAPP_ERROR);
  return { ...values, whatsapp: normalisePhone(values.whatsapp) };
}

export const optionLabel = (options, value) => options.find(([key]) => key === value)?.[1] || "";
