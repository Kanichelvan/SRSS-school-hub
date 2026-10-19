// Definitive public route map — SRSS Digital Hub Website Architecture v2.0 (user decision, 13 Oct 2026).
// Every public URL appears here exactly once. Navigation, breadcrumbs, search, redirects and SITEMAP.md
// all derive from this file, so a page is added or moved in one place.
//
// status "page":    the URL renders its own page.
// status "section": the URL is final, but its content currently lives as a section of the parent page
//                   (`page` + `anchor`). `editable` sections become full pages as soon as the school
//                   publishes their content from the hub — no code change needed.
// owner:            who keeps the content accurate (hub roles); Leadership approves anything published.

export const SITE = [
  { path: "/", label: "Home", page: "home", status: "page", owner: "Content editor", summary: "Introducing Sekolah Rendah Sathya Sai and where to go next." },

  // 01 About SRSS — who we are
  { path: "/about", label: "About SRSS", page: "about", status: "page", owner: "Leadership", summary: "Our identity, philosophy, history and people." },
  { path: "/about/our-story", label: "Our Story", parent: "/about", page: "aboutStory", status: "page", editable: "append", owner: "Leadership", summary: "How SRSS began and grew since 2002." },
  { path: "/about/vision-mission", label: "Our Vision & Mission", parent: "/about", page: "aboutPurpose", status: "page", editable: "append", owner: "Leadership", summary: "Our purpose, vision, mission, eleven aims and five universal values." },
  { path: "/about/human-excellence", label: "Human Excellence", parent: "/about", page: "aboutExcellence", status: "page", editable: "append", owner: "Leadership", summary: "Developing the whole child through Head, Heart and Hands, values and purposeful action." },
  { path: "/about/why-srss", label: "Why SRSS?", parent: "/about", page: "aboutWhy", status: "page", editable: "append", owner: "Admissions officer", summary: "Academic foundations, character, languages and opportunities to grow." },
  { path: "/about/our-educators", label: "Our Educators", parent: "/about", page: "aboutEducators", status: "page", editable: "append", owner: "Leadership", summary: "Teachers as educators, mentors and examples of human values." },
  { path: "/about/sathya-sai-education", label: "The Sathya Sai Educare Philosophy", parent: "/about", page: "aboutEducare", status: "page", editable: "append", owner: "Leadership", summary: "The philosophy of Sathya Sai Educare and the five human values." },
  { path: "/about/leadership-governance", label: "Our Leadership", parent: "/about", page: "aboutLeadership", status: "page", editable: "append", owner: "Leadership", summary: "How the school is governed and led, and its relationship with SSIOM." },
  { path: "/about/our-people", label: "Our People", parent: "/about", page: "ourPeople", status: "page", editable: "append", owner: "Leadership", summary: "Our Board, school administration, teachers, support staff, volunteers and PTA." },
  { path: "/about/voices", label: "Community Voices", parent: "/about", page: "voices", status: "page", editable: "append", owner: "Leadership", summary: "Reflections from educators, alumni, former parents and volunteers." },
  { path: "/about/school-profile", label: "School Profile", parent: "/about", page: "aboutProfile", status: "page", editable: "append", owner: "School office", summary: "Key facts: registration, levels, curriculum, hours and location." },
  { path: "/about/campus", label: "Campus", parent: "/about", page: "aboutCampus", status: "page", editable: "append", owner: "School office", summary: "The spaces where children learn, play and grow." },
  { path: "/about/silver-jubilee", label: "Silver Jubilee", parent: "/about", page: "jubilee", status: "page", owner: "Content editor", summary: "SRSS25 — 25 years of education for life." },

  // 02 Learning — how we educate
  { path: "/learning", label: "Learning", page: "learning", status: "page", owner: "Academic coordinator", summary: "How SRSS educates the whole child." },
  { path: "/learning/curriculum", label: "Curriculum", parent: "/learning", page: "learning", anchor: "curriculum", status: "section", editable: true, owner: "Academic coordinator", summary: "Subjects, structure, language of instruction and assessment." },
  { path: "/learning/learning-journey", label: "Learning Journey", parent: "/learning", page: "learning", anchor: "learning-journey", status: "section", editable: true, owner: "Academic coordinator", summary: "Standard 1 to 6: progression and expectations." },
  { path: "/learning/human-values", label: "Human Values", parent: "/learning", page: "learning", anchor: "human-values", status: "section", owner: "Academic coordinator", summary: "How the five human values are practised in everyday learning." },
  { path: "/learning/enrichment", label: "Enrichment", parent: "/learning", page: "learning", anchor: "active-bodies", status: "section", editable: true, owner: "Academic coordinator", summary: "Co-curricular programmes and learning beyond the classroom." },
  { path: "/learning/reading-library", label: "Reading & Library", parent: "/learning", page: "learning", anchor: "learning-environment", status: "section", editable: true, owner: "Academic coordinator", summary: "Reading culture, literacy and the library." },
  { path: "/learning/learning-support", label: "Learning Support", parent: "/learning", page: "learning", anchor: "learning-environment", status: "section", editable: true, owner: "Academic coordinator", summary: "Every child can learn: support, intervention and confidence." },
  { path: "/learning/learning-environment", label: "Learning Environment", parent: "/learning", page: "learning", anchor: "learning-environment", status: "section", editable: true, owner: "Academic coordinator", summary: "Learning spaces and their educational purpose." },

  // 03 Student Life — what children experience
  { path: "/student-life", label: "Student Life", page: "studentLife", status: "page", owner: "Content editor", summary: "What children experience at SRSS." },
  { path: "/student-life/events", label: "Events", parent: "/student-life", page: "studentLife", anchor: "events", status: "section", owner: "Content editor", summary: "School celebrations and upcoming dates." },
  { path: "/student-life/sports", label: "Sports", parent: "/student-life", page: "studentLife", anchor: "stories", category: "Sports", status: "section", owner: "Content editor", summary: "Sports, physical education and house activities." },
  { path: "/student-life/arts-culture", label: "Arts & Culture", parent: "/student-life", page: "studentLife", anchor: "stories", category: "Arts & Culture", status: "section", owner: "Content editor", summary: "Music, performances, arts and cultural activities." },
  { path: "/student-life/service", label: "Service", parent: "/student-life", page: "studentLife", anchor: "stories", category: "Service", status: "section", owner: "Content editor", summary: "Community service and character in action." },
  { path: "/student-life/leadership", label: "Student Leadership", parent: "/student-life", page: "studentLife", anchor: "stories", category: "Leadership", status: "section", owner: "Content editor", summary: "Leadership opportunities and responsibilities." },
  { path: "/student-life/achievements", label: "Achievements", parent: "/student-life", page: "studentLife", anchor: "stories", category: "Achievements", status: "section", owner: "Content editor", summary: "Competitions, awards and accomplishments." },
  { path: "/student-life/stories", label: "Stories", parent: "/student-life", page: "studentLife", anchor: "stories", status: "section", owner: "Content editor", summary: "School stories and student experiences." },
  { path: "/student-life/gallery", label: "Gallery", parent: "/student-life", page: "studentLife", anchor: "gallery", status: "section", owner: "Content editor", summary: "Curated photographs of school life." },

  // 04 Join SRSS — admissions and community
  { path: "/join", label: "Join SRSS", page: "join", status: "page", owner: "Admissions officer", summary: "Admissions, alumni, volunteering and support." },
  { path: "/join/admissions", label: "Admissions", parent: "/join", page: "admissions", status: "page", owner: "Admissions officer", summary: "Who can apply, the process, fees and enquiries." },
  { path: "/join/how-to-apply", label: "How to Apply", parent: "/join/admissions", page: "admissions", anchor: "how-to-apply", status: "section", editable: true, owner: "Admissions officer", summary: "The admissions process, step by step." },
  { path: "/join/fees", label: "Fees", parent: "/join/admissions", page: "admissions", anchor: "fees", status: "section", owner: "Admissions officer", summary: "Fees and how to request fee information." },
  { path: "/join/book-a-visit", label: "Book a Visit", parent: "/join/admissions", page: "admissions", anchor: "how-to-apply", status: "section", owner: "Admissions officer", openVisit: true, summary: "Request a school tour." },
  { path: "/join/admissions-faq", label: "Admissions FAQs", parent: "/join/admissions", page: "admissions", anchor: "admissions-faq", status: "section", owner: "Admissions officer", summary: "Questions families ask about joining SRSS." },
  { path: "/join/get-involved", label: "Get Involved", parent: "/join", page: "join", anchor: "community", status: "section", owner: "School office", summary: "A school built by a community." },
  { path: "/join/alumni", label: "Alumni", parent: "/join/get-involved", page: "join", anchor: "alumni", status: "section", owner: "School office", summary: "Reconnect, and share your SRSS memory for SRSS25." },
  { path: "/join/volunteer", label: "Volunteer", parent: "/join/get-involved", page: "join", anchor: "volunteer", status: "section", owner: "School office", summary: "Offer your time, expertise or practical support." },
  { path: "/join/support-srss", label: "Support SRSS", parent: "/join/get-involved", page: "join", anchor: "support-srss", status: "section", owner: "School office", summary: "Contribute to approved school initiatives." },
  { path: "/join/parents-community", label: "Parents & Community", parent: "/join/get-involved", page: "join", anchor: "parents-community", status: "section", owner: "School office", summary: "Parent participation and school-community life." },

  // 05 Resources — where to find information
  { path: "/resources", label: "Resources", page: "resources", status: "page", owner: "School office", summary: "Calendars, news, documents, policies and contacts." },
  { path: "/resources/calendar", label: "Calendar", parent: "/resources", page: "resources", anchor: "calendar", status: "section", owner: "School office", summary: "Term dates, holidays and public events." },
  { path: "/resources/news", label: "News & Updates", parent: "/resources", page: "resources", anchor: "news", status: "section", owner: "Content editor", summary: "Announcements, newsletters and school news." },
  { path: "/resources/notices", label: "Notices", parent: "/resources", page: "resources", anchor: "news", status: "section", owner: "School office", summary: "Public school notices." },
  { path: "/resources/downloads", label: "Downloads", parent: "/resources", page: "resources", anchor: "downloads", status: "section", editable: true, owner: "School office", summary: "Forms, brochures and approved documents." },
  { path: "/resources/policies", label: "Policies", parent: "/resources", page: "resources", anchor: "policies", status: "section", owner: "Privacy steward", summary: "Public school policies, privacy and safeguarding." },
  { path: "/resources/faq", label: "FAQs", parent: "/resources", page: "faq", status: "page", owner: "School office", summary: "Clear answers about learning, admissions and school life." },
  { path: "/resources/contact", label: "Contact", parent: "/resources", page: "resources", anchor: "contact", status: "section", owner: "School office", summary: "Office details, directions and how to reach us." },
  { path: "/resources/prayer-pledge-anthem", label: "Before the First Bell", parent: "/resources", page: "prayer", status: "page", owner: "Academic coordinator", summary: "Silent sitting, prayers, Negaraku, Rukun Negara, the school anthem and pledge." },

  // 07 Legal — handled by the legal registry (src/legal/registry.js)
  { path: "/legal", label: "Legal & Policies", page: "legal", status: "page", owner: "Privacy steward", summary: "Privacy, terms, safeguarding and the School’s other policies." },
];

// Pages marked `editable` wait on verified content from the school. Staff write them in the hub
// (Content › Website pages); once Leadership publishes, the address renders as a full page.
export const sitePageId = (path) => `site${path.replace(/\//g, "-")}`;
export const editablePages = () => SITE.filter((entry) => entry.editable);

// The one template every editable page starts from. Empty fields and rows are simply not shown, so a
// page can use any mix of sections, a timeline, people and documents.
export const SITE_PAGE_TEMPLATE = {
  title: "",
  intro: "",
  heroImage: "",
  heroImageAlt: "",
  sections: [{ heading: "", body: "", image: "", imageAlt: "" }],
  timeline: [{ year: "", title: "", text: "" }],
  people: [{ name: "", role: "", image: "", imageAlt: "" }],
  documents: [{ title: "", description: "", link: "" }],
};
// The parts of a page that have content, or null when nothing has been written yet.
export function pageContent(content) {
  if (!content) return null;
  const sections = (content.sections || []).filter((item) => item.heading?.trim() || item.body?.trim());
  const timeline = (content.timeline || []).filter((item) => item.year?.trim() || item.title?.trim());
  const people = (content.people || []).filter((item) => item.name?.trim());
  const documents = (content.documents || []).filter((item) => item.title?.trim() && item.link?.trim());
  const hasBody = content.intro?.trim() || sections.length || timeline.length || people.length || documents.length;
  return hasBody ? { ...content, sections, timeline, people, documents } : null;
}

// Old addresses → canonical ones. Also mirrored as permanent (301) redirects in firebase.json.
export const REDIRECTS = {
  "/join/why-srss": "/about/why-srss",
  "/about/inspiration": "/about/sathya-sai-education",
  "/about/governance": "/about/leadership-governance",
  "/faq": "/resources/faq",
  "/admissions": "/join/admissions",
  "/news": "/resources/news",
  "/contact": "/resources/contact",
  "/legal/privacy-policy": "/legal/privacy",
  "/legal/terms-of-use": "/legal/terms",
  "/legal/intellectual-property": "/legal/acceptable-use",
  "/legal/child-protection": "/legal/child-safeguarding",
};

const byPath = Object.fromEntries(SITE.map((entry) => [entry.path, entry]));
export const siteEntry = (path) => byPath[path];

// Path → { entry, redirect }. Legal policy slugs resolve to the legal page; unknown paths to "notFound".
export function resolvePath(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (REDIRECTS[path]) return { redirect: REDIRECTS[path] };
  if (byPath[path]) return { entry: byPath[path] };
  if (path.startsWith("/legal/")) return { entry: { path, label: "Legal & Policies", parent: "/legal", page: "legal", slug: path.slice(7) } };
  return { entry: { path, label: "Page not found", page: "notFound" } };
}

// Home › About SRSS › Our Story
export function breadcrumbs(entry) {
  const trail = [];
  let current = entry;
  while (current?.parent) { current = byPath[current.parent]; if (current) trail.unshift(current); }
  return [byPath["/"], ...trail.filter((item) => item.path !== "/"), entry];
}

export const childrenOf = (path) => SITE.filter((entry) => entry.parent === path);

// Simple public search across page names and summaries (the FAQ page searches its own answers).
export function searchSite(query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return SITE.map((entry) => {
    const haystack = `${entry.label} ${entry.summary || ""}`.toLowerCase();
    const score = terms.reduce((total, term) => total + (entry.label.toLowerCase().includes(term) ? 3 : 0) + (haystack.includes(term) ? 1 : 0), 0);
    return { entry, score };
  }).filter((result) => result.score > 0 && result.entry.page !== "notFound").sort((a, b) => b.score - a.score).slice(0, 8).map((result) => result.entry);
}
