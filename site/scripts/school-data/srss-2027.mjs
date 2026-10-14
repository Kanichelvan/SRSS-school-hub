// SRSS 2027 school set-up, as supplied by the School on 14 Oct 2026 (real data — not the demo dataset).
// Imported by scripts/import-school-setup.mjs. Staff, pupils and families are NOT here: they are added
// when the School provides them.

export const SCHOOL = {
  name: "Sekolah Rendah Sathya Sai",
  motto: "Human Excellence | Kecemerlangan Insan",
  address: "6, Jalan Puchong, Taman Tan Yew Lai, 58200 Kuala Lumpur",
  phone: "+60 12-600 1926",
  email: "saischoolpuchong@gmail.com",
  arriveBy: "07:35",
  schoolStart: "07:40",
  attendanceDueTime: "08:00", // parents report absences by 8.00 am; registers reviewed then (Attendance Policy §8)
  week: "Monday to Friday, with occasional weekend special events for enrichment learning",
  // Finishing times by weekday (1 = Monday … 5 = Friday). Everyone starts at 07:40.
  timings: {
    standard1: { 1: "13:30", 2: "13:30", 3: "12:30", 4: "13:00", 5: "12:30" },
    standards2to6: { 1: "13:30", 2: "13:30", 3: "13:00", 4: "13:00", 5: "12:30" },
  },
  curriculum: {
    standard1: "KP2027 — the new MOE syllabus",
    standards2to6: "KSSR",
    languages: "Dual Language Programme: Science and Mathematics are taught in English, while Bahasa Malaysia remains the primary language of instruction.",
  },
};

export const YEAR = { id: "ay2027", name: "2027", startDate: "2027-01-04", endDate: "2027-12-03" };
// Two terms (school decision, 14 Oct 2026); the term breaks are holidays inside them.
export const TERMS = [
  { id: "ay2027-term-1", name: "Term 1", startDate: "2027-01-04", endDate: "2027-05-21" },
  { id: "ay2027-term-2", name: "Term 2", startDate: "2027-06-07", endDate: "2027-12-03" },
];

// One class per Standard. Remedial is a support group (Admin › Remedial group), not a register class.
export const CLASS_NAMES = { 1: "Prema", 2: "Sathya", 3: "Dharma", 4: "Shanti", 5: "Ahimsa", 6: "Ananda" };
export const CLASSES = [1, 2, 3, 4, 5, 6].map((level) => ({ id: `ay2027-standard-${level}`, name: `Standard ${level} ${CLASS_NAMES[level]}`, standard: level }));

const ALL = [];
const STD1 = [1];
const STD2_6 = [2, 3, 4, 5, 6];
// [code, name, Standards ([] = every Standard), category, medium, description]
export const SUBJECTS = [
  ["alam-dan-manusia", "Alam dan Manusia", STD1, "core", "Bahasa Melayu", "Standard 1 subject in the KP2027 syllabus."],
  ["bm", "Bahasa Melayu", [1, ...STD2_6], "core", "Bahasa Melayu", null],
  ["english", "English", [1, ...STD2_6], "core", "English", null],
  ["math", "Mathematics", [1, ...STD2_6], "core", "Bahasa Melayu and English", "Builds foundational skills in problem-solving, arithmetic, and logical reasoning. Mathematics is taught in both Bahasa Melayu and English."],
  ["science", "Science", STD2_6, "core", "English", null],
  ["moral", "Moral Education", STD2_6, "core", null, null],
  ["history", "History", [4, 5, 6], "core", null, null],
  ["rbt", "Technology Design (RBT)", STD2_6, "nonCore", null, null],
  ["visual-arts-music", "Visual Arts and Music", STD2_6, "nonCore", null, null],
  ["phe", "Physical Health Education", STD2_6, "nonCore", null, null],
  ["tamil", "Tamil (mother tongue)", ALL, "srss", "Tamil", "SRSS mother-tongue class."],
  ["chinese", "Chinese (mother tongue)", ALL, "srss", "Chinese", "SRSS mother-tongue class."],
  ["telugu", "Telugu (mother tongue)", ALL, "srss", "Telugu", "SRSS mother-tongue class."],
  ["ssehv", "SSEHV (Sathya Sai Education in Human Values)", ALL, "srss", null, "SRSS subject."],
  ["ict", "ICT", ALL, "srss", null, "SRSS subject."],
].map(([code, name, standards, category, medium, description]) => ({ code, name, standards: standards.map(String), category, medium, description }));

// Breaks and holidays. `closed` marks days the School is closed; dates marked * by the School are
// subject to official confirmation. Weekdays checked against the 2027 calendar.
export const EVENTS = [
  ["2027-01-04", null, "School session reopens", "school", false, null],
  ["2027-03-06", "2027-03-14", "1st Term Break", "holiday", true, "9 days"],
  ["2027-05-22", "2027-06-06", "Mid-Year Break", "holiday", true, "16 days"],
  ["2027-08-28", "2027-09-05", "2nd Term Break", "holiday", true, "9 days"],
  ["2027-12-04", "2027-12-31", "Year-End Break", "holiday", true, "28 days"],
  ["2027-01-22", null, "Thaipusam (public holiday)", "holiday", true, "School closed. Date subject to official confirmation."],
  ["2027-02-06", "2027-02-07", "Chinese New Year", "holiday", true, null],
  ["2027-02-24", null, "Nuzul Al-Quran (public holiday)", "holiday", true, "School closed. Date subject to official confirmation."],
  ["2027-03-10", "2027-03-11", "Hari Raya Aidilfitri", "holiday", true, "Falls within the 1st Term Break."],
  ["2027-05-01", null, "Labour Day (public holiday)", "holiday", true, null],
  ["2027-05-17", null, "Hari Raya Aidiladha", "holiday", true, null],
  ["2027-05-20", null, "Wesak Day", "holiday", true, null],
  ["2027-06-06", null, "Awal Muharram (public holiday)", "holiday", true, "Date subject to official confirmation."],
  ["2027-06-07", null, "King's Birthday (public holiday)", "holiday", true, "School closed. Date subject to official confirmation."],
  ["2027-08-31", null, "National Day (public holiday)", "holiday", true, "School closed."],
  ["2027-09-16", null, "Malaysia Day (public holiday)", "holiday", true, "School closed."],
  ["2027-10-28", null, "Deepavali", "holiday", true, null],
].map(([date, endDate, title, category, closed, description], index) => ({ id: `ay2027-cal-${String(index + 1).padStart(2, "0")}`, date, endDate, title, category, closed, description }));

export const ANNOUNCEMENT_CATEGORIES = [["school", "School-wide"], ["class", "Class"], ["academic", "Academic"], ["event", "Event"], ["reminder", "Reminder"], ["urgent", "Urgent"]];
export const PORTFOLIO_CATEGORIES = [["academic", "Academic Learning"], ["humanValues", "Human Values"], ["cocurricular", "Co-curricular"], ["achievements", "Achievements"], ["reflections", "Reflections & Growth"]];

// Draft copy for Learning › Curriculum (saved as a staff draft, never published by the import).
export const CURRICULUM_DRAFT = {
  title: "Curriculum",
  intro: "In our private national primary school, students thrive in a multilingual environment where both Bahasa Malaysia and English are integrated into the curriculum.",
  sections: [
    { heading: "Dual Language Programme", body: "Through our Dual Language Programme, Science and Mathematics subjects are taught in English, while Bahasa Malaysia remains the primary language of instruction." },
    { heading: "A national curriculum with a global outlook", body: "We blend the Malaysian National Curriculum with a global perspective, preparing students for success both locally and internationally. Our unique approach combines local students with international exposure, all in an English-speaking environment. Students benefit from a well-rounded experience, grounded in core subjects, while gaining a global outlook." },
    { heading: "Standard 1 (KP2027, the new MOE syllabus)", body: "Alam dan Manusia, Mathematics, Bahasa Melayu and English." },
    { heading: "Standards 2 to 6 (KSSR)", body: "Core subjects: Bahasa Melayu, English, Mathematics, Science and Moral Education, with History from Standard 4.\n\nNon-core subjects: Technology Design (RBT), Visual Arts and Music, and Physical Health Education." },
    { heading: "SRSS subjects", body: "Mother-tongue classes (Tamil, Chinese and Telugu), SSEHV (Sathya Sai Education in Human Values) and ICT." },
    { heading: "Mathematics", body: "Builds foundational skills in problem-solving, arithmetic, and logical reasoning. Mathematics is taught in both Bahasa Melayu and English." },
    { heading: "The school week", body: "The regular school week is Monday to Friday, with occasional weekend special events focused on continued enrichment learning. School starts at 7.40 am (please arrive by 7.35 am).\n\nStandard 1: Monday and Tuesday until 1.30 pm, Thursday until 1.00 pm, Wednesday and Friday until 12.30 pm.\n\nStandards 2 to 6: Monday and Tuesday until 1.30 pm, Wednesday and Thursday until 1.00 pm, Friday until 12.30 pm." },
  ],
};
