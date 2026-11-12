// Words for the sign-in page and the "not recognised" screen. Plain data, so the wording can be tested and reused.
//
// How access works: there is no sign-up form and no password to hand out. The School records an email address for
// each parent, pupil and staff member; whoever signs in with that address (Google or a one-time email link) sees
// what belongs to them, and a parent sees their own children. An address the School does not hold gets no access.

export const OFFICE_CONTACT = { phone: "+60 12-600 1926", phoneHref: "tel:+60126001926", email: "saischoolpuchong@gmail.com" };

export const DEFAULT_SIGN_IN_INTRO = "Use the email address the school has on record for you. There is no password to remember and nothing to register.";

// /login?for=parent — set by the "I am a…" cards on the public site, so each visitor reads the line meant for them.
export const SIGN_IN_AUDIENCES = {
  parent: { hub: "/hub/parent", kicker: "Parents and guardians", intro: "Use the email address you gave the school when you registered your child. You will see your own children's notices, forms, dates and class updates. There is no password to remember and nothing to register." },
  student: { hub: "/hub/student", kicker: "Pupils", intro: "Sign in with the email address the school set up for you. Ask a parent or your teacher to help the first time." },
  teacher: { hub: "/hub/teacher", kicker: "Teachers", intro: "Use the email address the school has on record for you to open your classes, registers and resources." },
  staff: { hub: "/hub/admin", kicker: "School staff", intro: "Use the email address the school has on record for you to open school records and publishing." },
};

export function audienceFromSearch(search) {
  const key = new URLSearchParams(search || "").get("for");
  return Object.hasOwn(SIGN_IN_AUDIENCES, key) ? { key, ...SIGN_IN_AUDIENCES[key] } : null;
}

export const signInHref = (key) => (Object.hasOwn(SIGN_IN_AUDIENCES, key) ? `/login?for=${key}` : "/login");

// [question, answer, [link label, href]?]
export const SIGN_IN_HELP = [
  ["The hub says my email is not recognised", "The hub only opens for the exact email address on the school's records. Try the address you gave at registration. If that does not work, ask the school office to check the address on your child's record."],
  ["I have a new email address", "Tell the school office your new address. Once they update your record, sign in with the new one. To change a phone number or home address, sign in and use the contact update form in the Parent Hub."],
  ["No link arrived", "Check your spam folder, then ask for a new link. Each link works once and must be opened on the same phone or computer."],
  ["We are a new family", "Hub access starts once your child is enrolled.", ["See admissions", "/join/admissions"]],
];
