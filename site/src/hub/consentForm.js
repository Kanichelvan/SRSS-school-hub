// The SRSS consent form, built in so the office never has to set it up (user decision, 13 Oct 2026:
// one page per child, a few yes/no choices, pre-filled, nothing for the office to approve).
// Wording follows the Parental Consent policy §9–§14 and the Media Consent policy §4–§5 and §16.
// These are the built-in questions. The privacy steward or office can reword, add or retire questions in
// Admin › Settings › Consent questions (`consentDefinitions`); rewording a question raises that question's
// version, so families are asked it again while their other answers still count.
// Plain JS (no JSX) so the emulator seed script can import it too.

export const CONSENT_FORM_VERSION = 1; // version of every built-in question

export const CONSENT_ITEMS = [
  {
    type: "digitalAccess",
    title: "School digital accounts",
    question: "May {child} use a school Google account and approved learning apps for classwork?",
    detail: "Google Classroom and Google Drive, set up and supervised by the School. If you say no, teachers will give your child paper alternatives.",
    policy: "/legal/parental-consent#s-8",
  },
  {
    type: "photoVideo",
    title: "Photos and videos in the Parents Hub",
    question: "May photos and videos of {child} at school activities be shared with families of the class in the SRSS Digital Hub?",
    detail: "Only signed-in parents and staff can see them, and families may not repost them publicly.",
    policy: "/legal/media-consent#s-4",
  },
  {
    type: "websiteIdentification",
    title: "Photos on the school website",
    question: "May photos of {child} appear on the public school website?",
    detail: "We never publish a full name, birthday or address with a photo.",
    policy: "/legal/media-consent#s-8",
  },
  {
    type: "socialMedia",
    title: "Photos on official social media",
    question: "May photos of {child} appear on the School’s official social media, such as its Facebook page?",
    detail: "Posts on social media can be copied and shared beyond the School’s control.",
    policy: "/legal/media-consent#s-4",
  },
  {
    type: "printPublications",
    title: "Printed publications",
    question: "May photos of {child} appear in printed school publications?",
    detail: "Newsletters, the school magazine and the SRSS25 Silver Jubilee commemorative book.",
    policy: "/legal/media-consent#s-4",
  },
  {
    type: "publicShowcase",
    title: "Name with work and achievements",
    question: "May {child}’s first name and class appear with their work or achievements on the website and in publications?",
    detail: "For example awards, competition results and selected artwork.",
    policy: "/legal/media-consent#s-12",
  },
];

// Recorded alongside the choices; required once per save.
export const ACKNOWLEDGEMENT = {
  type: "termsPrivacy",
  title: "Terms of Use and Privacy Policy",
};

export const consentQuestion = (item, childName) => item.question.replace("{child}", childName || "your child");

// One response per choice: yes → granted; no → declined, or withdrawn if it was granted before (CON-006).
export function responseFor(answer, previous) {
  if (answer === "yes") return "granted";
  return previous === "granted" ? "withdrawn" : "declined";
}

// The questions in force: the built-in ones, as reworded by the school, plus any it added; retired ones drop out.
export function mergeConsentItems(definitions = []) {
  const byType = Object.fromEntries(definitions.map((definition) => [definition.type || definition.id, definition]));
  const builtIn = CONSENT_ITEMS.map((item, index) => ({ ...item, version: CONSENT_FORM_VERSION, order: index + 1, builtIn: true, ...pick(byType[item.type]) }));
  const added = definitions.filter((definition) => !CONSENT_ITEMS.some((item) => item.type === (definition.type || definition.id)))
    .map((definition) => ({ type: definition.type || definition.id, policy: "/legal/parental-consent", order: 99, ...pick(definition) }));
  return [...builtIn, ...added].filter((item) => item.status !== "archived").sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}
const pick = (definition) => (definition ? Object.fromEntries(["title", "question", "detail", "policy", "version", "order", "status"].filter((key) => definition[key] != null && definition[key] !== "").map((key) => [key, definition[key]])) : {});

// An answer counts only if it was given to the current version of that question.
export const isCurrent = (entry, item) => Boolean(entry && (entry.version ?? 1) >= (item?.version ?? CONSENT_FORM_VERSION));

// The choices still waiting for an answer for one child.
export const missingItems = (status = {}, items = CONSENT_ITEMS) => items.filter((item) => !isCurrent(status[item.type], item));

// Shown on the printed form, so a signed paper copy can be matched to the wording it answered.
export const formVersionLabel = (items = CONSENT_ITEMS) => items.map((item) => item.version ?? CONSENT_FORM_VERSION).reduce((a, b) => a + b - 1, 1);
