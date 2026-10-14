// SRSS Digital Hub legal framework: the public policies, their footer groups and shared facts.
// Policy text lives in ./content/*.md (loaded per page, so it never weighs on the homepage bundle).
// Keep names, dates and contact details here so every policy page stays consistent.

// "draft" shows a review banner on every policy. Switch to "published" only after the School and
// its legal advisers approve the text (see docs/legal-verification.md).
export const LEGAL_STATUS = "published"; // approved by the School, 14 Oct 2026
// One date on every page, shown as “Effective date (last revised date)”, as on the MySAIYa legal pages.
export const EFFECTIVE_DATE = "23rd November 2026";
export const COPYRIGHT_YEAR = 2026;

export const policies = [
  { slug: "terms", title: "Terms of Use", summary: "The conditions for using SRSS Digital Hub, who may use it, and what each user is responsible for." },
  { slug: "privacy", title: "Privacy Policy", summary: "What personal information the School collects, why, who can see it, how long it is kept and your rights." },
  { slug: "child-safeguarding", title: "Child Protection & Safeguarding Policy", short: "Child Protection & Safeguarding", summary: "The School-wide policy: who the safeguarding leads are, how abuse is recognised and reported, and how allegations are handled." },
  { slug: "online-safeguarding", title: "Child Protection & Online Safeguarding Policy", short: "Online Safeguarding", summary: "How the School keeps children safe online, what conduct is prohibited and how to report a concern." },
  { slug: "acceptable-use", title: "Intellectual Property, Educational Content & Acceptable Use Policy", short: "Intellectual Property & Acceptable Use", summary: "Who owns the platform, school materials and pupils’ work, and how they may be used." },
  { slug: "media-consent", title: "Photography, Video, Student Work & Media Consent Policy", short: "Photography, Video & Media Consent", summary: "When pupils’ photos, recordings and work may be used, with separate consent for each kind of publication." },
  { slug: "disclaimer", title: "Disclaimer & Limitation of Liability", short: "Disclaimer", summary: "The limits of online information and services, without excluding duties the law does not allow us to exclude." },
  { slug: "cookies", title: "Cookies, Analytics & Digital Technologies Policy", short: "Cookies & Digital Technologies", summary: "The cookies, browser storage and outside services the platform uses, with a list of what is in use today." },
  { slug: "accessibility-complaints", title: "Accessibility, Complaints & Digital Governance Policy", short: "Accessibility, Complaints & Governance", summary: "Getting help with access, raising a complaint, and how concerns are escalated and reviewed." },
  { slug: "data-protection-retention", title: "Data Protection, Information Security & Records Retention Policy", short: "Data Protection, Security & Retention", summary: "How information is classified, secured, kept, archived and disposed of." },
  { slug: "parental-consent", title: "Parental Consent, Guardian Authority & Children’s Digital Participation Policy", short: "Parental Consent & Children’s Participation", summary: "How parents and legal guardians are verified, give or withdraw consent, and manage children’s access." },
];

// Display order is the order above; numbers follow it.
policies.forEach((policy, index) => { policy.number = index + 1; });
export const policyBySlug = Object.fromEntries(policies.map((policy) => [policy.slug, policy]));
export const policyHref = (slug) => `/legal/${slug}`;

// Footer grouping (framework Part VII).
export const legalGroups = [
  { title: "Legal & policies", slugs: ["terms", "privacy", "parental-consent", "disclaimer", "cookies"] },
  { title: "Safety & digital responsibility", slugs: ["child-safeguarding", "online-safeguarding", "media-consent", "acceptable-use", "data-protection-retention"] },
  { title: "Governance & support", slugs: ["accessibility-complaints"], extra: [["Contact the school", "/resources/contact"]] },
];

export const SAFEGUARDING_HREF = "/legal/child-safeguarding#s-4";

export const contact = {
  person: "The Principal",
  role: "Designated Platform Administrator and Compliance Liaison",
  school: "Sekolah Rendah Sathya Sai",
  address: ["6, Jalan Puchong, Taman Tan Yew Lai,", "58200 Kuala Lumpur,", "Wilayah Persekutuan Kuala Lumpur, Malaysia."],
  phone: "+60 12-600 1926",
  phoneHref: "tel:+60126001926",
  email: "saischoolpuchong@gmail.com",
};

// Named post-holders (user decisions, 13 Oct 2026). Update here and in the policy texts when people change.
export const safeguardingLead = { title: "Designated Safeguarding Lead", post: "Senior Assistant for Administration / Academic", name: "Mr Ravi Balan", phone: "+60 16-290 3300", phoneHref: "tel:+60162903300", email: "ravi.srss@ssiomya.com" };
export const dataProtectionOfficer = { post: "Senior Assistant for Student Affairs", name: "Ms Vasanthi", email: "vasanthi.srss@ssiomya.com" };

// Public emergency and child-protection lines (confirm with the School before publication).
export const emergencyLines = [
  ["Police and ambulance", "999", "tel:999"],
  ["Talian Kasih (child abuse and neglect, 24 hours)", "15999", "tel:15999"],
  ["Talian Kasih on WhatsApp", "019-261 5999", "https://wa.me/60192615999"],
];
