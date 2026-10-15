// Public site navigation — Website Architecture v2.0 (user decision, 13 Oct 2026).
// About SRSS · Learning · Student Life · Join SRSS · Resources · Sign In, plus search and the
// Admissions & Visits action. The label goes to the landing page; the chevron opens the menu.
// Every href is a canonical path from src/data/siteMap.js.
export const siteNav = [
  {
    label: "About SRSS",
    href: "/about",
    intro: "Who we are, what we believe and the people behind every child’s journey.",
    groups: [
      { title: "Our School", links: [["Our Story", "/about/our-story"], ["School Profile", "/about/school-profile"], ["Campus", "/about/campus"]] },
      { title: "Our Philosophy", links: [["Vision & Mission", "/about/vision-mission"], ["Sathya Sai Education", "/about/sathya-sai-education"]] },
      { title: "Our Community", links: [["Leadership & Governance", "/about/leadership-governance"], ["Our People", "/about/our-people"], ["Community Voices", "/about/voices"]] },
      { title: "Our Legacy", links: [["Silver Jubilee", "/about/silver-jubilee"]] },
    ],
  },
  {
    label: "Learning",
    href: "/learning",
    intro: "How our beliefs become teaching: Malaysia’s national curriculum with Sathya Sai Educare at its heart.",
    groups: [
      { title: "Learning Foundations", links: [["Curriculum", "/learning/curriculum"], ["Learning Journey", "/learning/learning-journey"]] },
      { title: "Our Programmes", links: [["Human Values", "/learning/human-values"], ["Enrichment", "/learning/enrichment"], ["Learning Environment", "/learning/learning-environment"]] },
      { title: "Supporting Every Child", links: [["Learning Support", "/learning/learning-support"], ["Reading & Library", "/learning/reading-library"]] },
    ],
  },
  {
    label: "Student Life",
    href: "/student-life",
    intro: "What children experience at SRSS: friendship, talent, service and celebration.",
    groups: [
      { title: "Experiences", links: [["Events", "/student-life/events"], ["Sports", "/student-life/sports"], ["Arts & Culture", "/student-life/arts-culture"]] },
      { title: "Growth & Achievement", links: [["Student Leadership", "/student-life/leadership"], ["Achievements", "/student-life/achievements"], ["Service", "/student-life/service"]] },
      { title: "Explore", links: [["Stories", "/student-life/stories"], ["Gallery", "/student-life/gallery"]] },
    ],
  },
  {
    label: "Join SRSS",
    href: "/join",
    intro: "Choosing a school for your child, reconnecting as an alumnus or offering your time — there is a place for you.",
    groups: [
      { title: "Admissions", href: "/join/admissions", links: [["Why SRSS?", "/join/why-srss"], ["How to Apply", "/join/how-to-apply"], ["Fees", "/join/fees"], ["Book a Visit", "/join/book-a-visit"], ["Admissions FAQs", "/join/admissions-faq"]] },
      { title: "Get Involved", href: "/join/get-involved", links: [["Alumni", "/join/alumni"], ["Volunteer", "/join/volunteer"], ["Support SRSS", "/join/support-srss"], ["Parents & Community", "/join/parents-community"]] },
    ],
  },
  {
    label: "Resources",
    href: "/resources",
    intro: "Everything you need, in one place.",
    groups: [
      { title: "Information", links: [["Calendar", "/resources/calendar"], ["News & Updates", "/resources/news"], ["Notices", "/resources/notices"]] },
      { title: "Documents", links: [["Downloads", "/resources/downloads"], ["Policies", "/resources/policies"]] },
      { title: "Assistance", links: [["FAQs", "/resources/faq"], ["Contact", "/resources/contact"]] },
    ],
  },
];

// Not a menu: a direct link to the secure sign-in gateway. The individual hubs appear after sign-in.
export const signInLink = { label: "Sign In", href: "/login" };
