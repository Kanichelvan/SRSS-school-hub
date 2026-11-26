// Facts behind the School Uniform, Personal Appearance & Grooming Policy (src/pages/UniformPolicy.jsx),
// supplied by the School (Nov 2026) and approved by school management on 4 November 2026.
// Keep the tables here so the page and FAQ agree; record any later revision in `status` and `approved`.

export const UNIFORM = {
  title: "School Uniform, Personal Appearance & Grooming Policy",
  status: "Approved by school management",
  approved: "4 November 2026",
  applicableTo: "All students enrolled in Standards 1–6",
  path: "/student-life/uniform",
};

// Illustrations cropped from the School's uniform guide (public/assets/uniform). Names on the tags are
// examples and the badge artwork is indicative; the official school badge always applies.
const img = (file) => `/assets/uniform/${file}.webp`;
export const UNIFORM_GALLERY = [
  {
    id: "daily",
    title: "Daily and PE uniform",
    figures: [
      { src: img("standard-boy-shorts"), label: "Standard (boy)", note: "Shorts option", alt: "A boy in the light-purple shirt, dark-purple tie and dark-purple shorts, with black belt, black socks and black shoes." },
      { src: img("standard-boy-trousers"), label: "Standard (boy)", note: "Long trousers option", alt: "A boy in the light-purple shirt, dark-purple tie and dark-purple long trousers, with black belt and black shoes." },
      { src: img("standard-girl"), label: "Standard (girl)", note: "Pinafore", alt: "A girl in the light-purple blouse and dark-purple tie under a dark-purple pleated pinafore, with black socks and black shoes." },
      { src: img("sports-pe"), label: "School sports top", note: "PE days", alt: "A boy in the school sports polo shirt with dark track trousers and black sports shoes." },
    ],
  },
  {
    id: "roles",
    title: "Responsibilities and occasions",
    figures: [
      { src: img("prefect-boy"), label: "Prefect (boy)", note: "Pengawas", alt: "A boy prefect wearing the black vest over the standard uniform, with the school badge, PENGAWAS tag and name tag on the left chest." },
      { src: img("prefect-girl"), label: "Prefect (girl)", note: "Pengawas", alt: "A girl prefect wearing the black vest over the standard uniform and pleated skirt, with the school badge, PENGAWAS tag and name tag." },
      { src: img("librarian"), label: "Librarian", note: "Designation tag", alt: "A student librarian wearing the black vest over the standard uniform, with the school badge, name tag and LIBRARIAN tag." },
      { src: img("sports-day"), label: "Sports Day", note: "House colour, e.g. yellow", alt: "A boy in a yellow sports-house T-shirt and cap with dark track trousers bearing the white vertical SRSS lettering." },
      { src: img("club"), label: "Club uniform", note: "e.g. Kadet Polis", alt: "A boy in a dark uniformed-body uniform with peaked cap, white gloves and black shoes, as for Kadet Polis." },
      { src: img("graduation"), label: "Graduation robe", note: "Ceremonies only", alt: "A girl in the maroon graduation robe with gold-coloured trim." },
    ],
  },
  {
    id: "faith",
    title: "Religious and cultural options",
    figures: [
      { src: img("baju-kurung"), label: "Baju kurung", note: "With school-purple headscarf", alt: "A girl in the long-sleeved light-purple baju kurung top, full-length dark-purple skirt and purple headscarf." },
      { src: img("turban"), label: "Turban", note: "Sikh students", alt: "A boy wearing a purple turban with the standard light-purple shirt, tie and dark-purple trousers." },
      { src: img("sports-hijab"), label: "Modest sports attire", note: "With sports hijab", alt: "A girl in the long-sleeved school sports top, purple sports hijab and full-length SRSS track trousers." },
    ],
  },
];

// Which uniform, when (Sections 1.6–1.7, 3 and 4).
export const UNIFORM_WHEN = [
  ["Regular school days", "Standard school uniform"],
  ["Designated PE days", "The complete sports uniform for the whole day, except on the days below"],
  ["Mondays, examinations, formal programmes and assemblies", "Formal school uniform; bring sports attire separately if PE needs it"],
  ["Sports Day and inter-house events", "The designated sports-house attire and cap announced for the event"],
  ["Club and uniformed-body activities", "The approved club uniform, on designated days or when the teacher-in-charge authorises it"],
  ["Graduation and ceremonial events", "The prescribed graduation robe, over the attire specified for the ceremony"],
];

// Section 7.
export const JEWELLERY = [
  ["Earrings", "Small, simple studs or sleepers worn in the earlobes only"],
  ["Rings", "Finger rings and nose rings are not permitted, subject to approved religious accommodations"],
  ["Necklaces", "Not permitted, except approved religious necklaces worn discreetly beneath clothing"],
  ["Bracelets and bangles", "Not permitted, except approved religious articles"],
  ["Watches", "Simple watches used primarily for telling time are permitted"],
  ["Smartwatches", "Must remain switched off or stored in the student's bag, or be deposited with the class teacher until dismissal, unless expressly authorised"],
  ["Decorative accessories", "Fashion jewellery, decorative chains and other non-essential accessories are not permitted"],
];

// Section 13.1.
export const PROGRESSIVE_RESPONSE = [
  ["First incident", "A private verbal reminder from the teacher, with guidance on the correct requirement"],
  ["Second incident", "A further verbal reminder and a record of the concern in the school's internal records"],
  ["Third incident", "The class teacher contacts the parent or guardian to discuss the recurring issue and agree on practical solutions"],
];
