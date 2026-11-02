// Facts behind the family policy pages (src/pages/FamilyPages.jsx), supplied by the School (Nov 2026).
// Kept apart from the page so a confirmed change is made here once.

export const FOOD = {
  // The policy text says the School must confirm whether its vegetarian standard excludes eggs before final
  // publication. Until it does, families are asked to check first; replace this line once it is confirmed.
  eggsConfirmed: false,
  eggs: "The school is confirming whether its vegetarian standard excludes eggs. Until then, please check with the school office before sending food that contains eggs.",
};

export const PURE_LIFE = {
  children: "20+", // "more than 20 residential children" attend SRSS, fully sponsored
  timeline: [
    { when: "From the school's early years", title: "RM1 a year", text: "Recognising the school's charitable mission, the Pure Life Society made its premises available to SRSS for a nominal rental of just RM1 per year." },
    { when: "2025", title: "A modest annual lease", text: "The rental arrangement was revised to a modest annual lease fee." },
    { when: "Through 2035", title: "The lease renewed", text: "The lease has been renewed through 2035, giving SRSS greater continuity as it plans for the future." },
    { when: "Our aspiration", title: "A permanent campus of our own", text: "SRSS continues to work towards securing a permanent campus of its own.", future: true },
  ],
};

export const SPONSORSHIP = {
  paths: [
    { id: "pure-life", short: "Pure Life Society", support: "Full sponsorship", title: "Residential children of the Pure Life Society", text: "More than 20 students from the Pure Life Society currently attend SRSS under this longstanding arrangement. Their education is provided without tuition fees, with essential educational needs supported by the school.", how: "the longstanding arrangement between the school and the Pure Life Society." },
    { id: "b40", short: "B40 households", support: "Full sponsorship", title: "Children from B40 households", text: "Children from eligible B40 families receive full sponsorship, subject to verification of household circumstances and the school's admission and assistance procedures.", how: "a confidential request, followed by verification of household circumstances." },
    { id: "hardship", short: "Other hardship", support: "Full or partial assistance", title: "Families facing hardship outside the B40 category", text: "Families experiencing hardship outside the B40 category, or whose circumstances change unexpectedly, may also be considered for full or partial assistance.", how: "a confidential request, assessed with compassion and fairness." },
  ],
  // [support, Pure Life Society, B40, other hardship]: true = covered by full sponsorship
  covers: [
    ["School tuition", true, true, "Full or partial"],
    ["Necessary learning materials", true, true, "Considered individually"],
    ["Uniforms", true, true, "Considered individually"],
    ["Meals", true, true, "Considered individually"],
  ],
};
