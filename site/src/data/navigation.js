// Public site navigation (user-supplied information architecture, 10 Oct 2026).
// Items without a dedicated page yet link to the closest existing section; `soon: true` marks
// planned pages with no suitable destination today (shown, but not clickable). See SITEMAP.md.
export const siteNav = [
  {
    label: "About",
    href: "/about#top",
    intro: "Who we are, where we come from and the community behind every child.",
    groups: [
      { title: "Welcome", href: "/about/voices#principal", note: "Principal’s message" },
      { title: "Our history", href: "/about#who-we-are", links: [["Sathya Sai Baba", "/about/inspiration"], ["SSIOM", "/about/inspiration#organisation"]] },
      { title: "Our vision & mission", href: "/about#vision-mission", links: [["Human Excellence", "/about#vision-mission"], ["Character development", "/about#educare"], ["Values integration & academics", "/#learning"]] },
      { title: "Our community", href: "/about#our-people", links: [["Management & governance", "/about#our-people"], ["Staff", "/about#our-people"], ["Parent–Teacher Association", null], ["Alumni", "/about/voices#alumni"]] },
      { title: "Facilities", href: "/about#campus", links: [["SRSS spaces", "/about#campus"], ["Address & contact", "/#contact"], ["A day at SRSS", "/resources/prayer-pledge-anthem"], ["Uniform, transport & meals", "/faq"]] },
    ],
  },
  {
    label: "Academics",
    href: "/#learning",
    intro: "Malaysia’s national curriculum, taught with Sathya Sai Educare at its heart.",
    links: [["Curriculum & academic pathway", "/#learning"], ["Assessment structure", "/faq"], ["Learning labs", "/#learning"], ["Co-curricular activities", "/#school-life"], ["Enrichment activities", "/#school-life"]],
  },
  {
    label: "Admissions",
    href: "/#admissions",
    intro: "Everything families need to join SRSS, from first enquiry to the first day.",
    links: [["Apply now", "/#enquiry"], ["Admission process", "/#admissions"], ["Entry requirements", "/faq"], ["Registration", "/#enquiry"], ["Fee structure", "/faq"], ["Refund policy", null], ["Open house", "/#events-title"], ["Contact details", "/#contact"], ["Visit SRSS", "visit"]],
  },
  {
    label: "Student Life",
    href: "/#school-life",
    intro: "The rhythm of an SRSS day: assembly, friendship, leadership and care.",
    links: [["Morning assembly", "/resources/prayer-pledge-anthem#silent-sitting"], ["Prayer & pledge", "/resources/prayer-pledge-anthem#prayers"], ["Dress code", null], ["Leadership", null], ["Achievements", "/#news"], ["Well-being", "/resources/prayer-pledge-anthem#silent-sitting"], ["Facilities usage", "/about#campus"]],
  },
  {
    label: "Resources",
    href: "/#news",
    intro: "Forms, dates, news and the documents families use most.",
    links: [["Forms", "/hub/forms"], ["Useful links", null], ["Parents’ handbook", null], ["Calendar", "/#events-title"], ["News", "/#news"], ["Monthly events", "/#events-title"]],
  },
  {
    label: "Hubs",
    href: "/sign-in",
    intro: "Secure spaces for our school community. You will be asked to sign in.",
    hubs: [["Student Hub", "/hub/student", "Learning, timetable and achievements"], ["Teachers Hub", "/hub/teacher", "Classes, attendance and resources"], ["Parents Hub", "/hub/parent", "Notices, forms and your child’s progress"], ["Admin Hub", "/hub/admin", "School operations and publishing"]],
  },
];
