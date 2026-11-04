import { schoolHoursAnswer } from './academics.js';
import { contact } from '../legal/registry.js';
import { FEES, childFees, ringgit } from './fees.js';
import { ENROLMENT } from './admissions.js';

// The School Fees and Payment Policy (src/data/fees.js) owns every amount quoted here.
const firstChild = childFees(1);
export const feesAnswer = {
  question: "What are the school fees?",
  paragraphs: [
    `School tuition is ${ringgit(FEES.tuitionMonthly)} a month, charged for ${FEES.months} months from January to November (${ringgit(firstChild.tuitionAnnual)} a year). Meals are provided by an external vendor and charged separately at ${ringgit(FEES.mealMonthly)} a month, so a family using the meal service pays ${ringgit(firstChild.monthly)} a month for one child.`,
    `Brothers and sisters enrolled at the same time receive sibling discounts on tuition: 20% for the second child, 35% for the third and 45% for the fourth child onwards. Fees can be paid monthly by the ${FEES.dueDay}th, six-monthly or fortnightly on a written schedule, at the same total cost.`,
    "SRSS was tuition-free from 2002 to 2024 and operates on a not-for-profit basis. Full sponsorship continues for residential children of the Pure Life Society and for children from eligible B40 households, subject to verification; other families facing hardship may be considered for full or partial assistance.",
    "Families who may need assistance are warmly encouraged to speak confidentially with the school administration. The School Fees page has the full table, a family fee calculator and the Fees and Payment Policy.",
  ],
  link: ["School fees and the family fee calculator", "/join/fees"],
};

// Vegetarian Food and School Activities Policy (src/pages/FamilyPages.jsx).
export const mealsAnswer = {
  question: "Does SRSS provide meals and transport?",
  paragraphs: [
    `Yes, meals are provided. An external vendor supplies them at ${ringgit(FEES.mealMonthly)} a month, charged separately from school tuition.`,
    "Vegetarian food is an established part of school life at SRSS, reflecting our commitment to compassion, non-violence, respect for life and responsible living. All food served, shared or eaten during school-organised activities must be vegetarian. This includes food brought from home, celebrations, events, camps and excursions. The policy does not seek to regulate what families eat in their private lives.",
    "If your child has a medically necessary dietary requirement, please tell the school so that an appropriate arrangement can be considered.",
    "The school does not provide transport directly. Parents may contact the school office for guidance on transport services used by SRSS families.",
  ],
  link: ["The Vegetarian Food and School Activities Policy", "/student-life/vegetarian-food"],
};

export const celebrationAnswer = {
  question: "Can we bring food for a birthday or class celebration?",
  paragraphs: [
    "Yes, as long as it is vegetarian. Please check with the school before you bring it, especially where allergies, ingredient restrictions or special dietary needs may be involved. The same applies to visitors, volunteers and external food providers.",
    "Children are guided with kindness. Accidental mistakes are handled discreetly and without embarrassment.",
  ],
  link: ["Check food for an event with the school", "/forms/B17"],
};
// School Uniform, Personal Appearance & Grooming Policy (src/pages/UniformPolicy.jsx, src/data/uniform.js).
export const uniformAnswer = {
  question: "What uniform do students wear?",
  paragraphs: [
    "Students wear a light-purple shirt or blouse with a dark-purple school tie, and dark-purple shorts or long trousers for boys or a pleated pinafore for girls, with the school badge, name tag, plain black socks and black shoes. Girls may wear the approved light-purple baju kurung with a school-purple headscarf, and Sikh students may wear a turban or patka.",
    "On designated PE days, students may wear the complete sports uniform all day, except on Mondays, examination days and formal occasions, when the formal uniform is required.",
    "If a uniform item is hard to obtain, or a substitute is needed for a day, please tell the school in writing. Families facing financial difficulty can speak to the school office confidentially; no child is singled out over a uniform item.",
  ],
  link: ["The School Uniform, Personal Appearance & Grooming Policy", "/student-life/uniform"],
};
export const sponsorshipAnswer = {
  question: "Is financial assistance or sponsorship available?",
  paragraphs: [
    "Yes. Residential children of the Pure Life Society and children from eligible B40 households receive fully sponsored education. Full sponsorship is intended to cover tuition and essential school-related needs, including learning materials, uniforms and meals.",
    "Families facing hardship outside the B40 category, or whose circumstances change unexpectedly, may also be considered for full or partial assistance. Requests are confidential and assessed with compassion and fairness.",
  ],
  link: ["Equitable access and student sponsorship", "/join/fees/sponsorship"],
};
export const parentsAnswer = {
  question: "What does SRSS ask of parents?",
  paragraphs: [
    "Education works best when the school and family work together. Under the Parent–School Partnership and Shared Values Agreement, we ask parents to reinforce human values at home, lead by example, support regular attendance and respect the school's philosophy, including silent sitting and the vegetarian food policy. We also ask families to communicate respectfully and to work cooperatively with the school.",
    "In return, SRSS undertakes to treat every child with dignity, fairness and compassion, and to work with parents in the best interests of their children.",
  ],
  link: ["The Parent–School Partnership", "/join/parent-partnership"],
};

// How children join SRSS (src/data/admissions.js), as described by the School in Nov 2026.
export const intakeAnswer = {
  question: "How does admission to Standard 1 work?",
  paragraphs: [
    "Most children join SRSS in Standard 1 at age six, through the school's yearly intake. The school announces a date on which parents are interviewed; prospective parents also meet one another and the school community, and children sit an entrance test. Families offered a place receive an offer letter.",
    "Residential children of the Pure Life Society are enrolled automatically, with fully sponsored education.",
    `To keep classes small, SRSS keeps enrolment at about ${ENROLMENT.usual} pupils and never more than ${ENROLMENT.max}.`,
  ],
  link: ["How admission works", "/join/admissions#admission-pathways"],
};
export const midYearAnswer = {
  question: "Does SRSS accept mid-year admissions?",
  paragraphs: [
    "Yes, subject to available places.",
    "Write to the school, or bring your child's documents to the school office. The school then discusses your child's previous learning, placement and needs with you, and offers a place at the earliest opening possible.",
    `Places depend on availability because SRSS keeps enrolment at about ${ENROLMENT.usual} pupils, never more than ${ENROLMENT.max}, so that the ratio of teachers to pupils stays at its best.`,
    "For students joining midway through the year, our teachers work with the child and family to make the transition into SRSS as smooth and comfortable as possible.",
  ],
  link: ["How admission works", "/join/admissions#admission-pathways"],
};

// The confirmed timetable, fees and food policy have one owner each; a stale saved FAQ must not publish older answers.
const VERIFIED = [schoolHoursAnswer, feesAnswer, mealsAnswer, midYearAnswer];
// Answers the School added with its family policies (Nov 2026) also appear when a saved FAQ list predates them,
// next to the question they follow.
const POLICY_ADDITIONS = [[intakeAnswer, "What year levels are offered at SRSS?"], [sponsorshipAnswer, "What are the school fees?"], [parentsAnswer, "Is SRSS a religious school?"], [celebrationAnswer, "Does SRSS provide meals and transport?"], [uniformAnswer, "Can we bring food for a birthday or class celebration?"]];
export function verifiedFaqs(items) {
  const list = items.map(item => VERIFIED.find(answer => answer.question === item.question) || item);
  for (const [answer, after] of POLICY_ADDITIONS) {
    if (list.some(item => item.question === answer.question)) continue;
    const index = list.findIndex(item => item.question === after);
    list.splice(index < 0 ? list.length : index + 1, 0, answer);
  }
  return list;
}

export const defaultFaqs = [
  {
    question: "What year levels are offered at SRSS?",
    paragraphs: [
      "Sekolah Rendah Sathya Sai (SRSS) is a private primary school serving children from Year 1 to Year 6 (Tahun 1–6), traditionally corresponding to ages seven to twelve. Our primary programme covers both Lower Primary (Tahap 1) and Upper Primary (Tahap 2).",
      "Beginning with the 2027 school year, SRSS will also open Year 1 admission to eligible six-year-old children, in line with Malaysia’s introduction of optional Year 1 entry at age six.",
    ],
  },
  intakeAnswer,
  {
    question: "Is SRSS a registered school in Malaysia?",
    paragraphs: [
      "Yes. SRSS is a registered private primary academic school (Sekolah Rendah Swasta Akademik) in Malaysia under Registration No. WDA0001.",
      "The school operates within the educational framework and requirements applicable to private academic schools in Malaysia.",
    ],
  },
  {
    question: "What curriculum does SRSS follow?",
    paragraphs: [
      "From 2027, Standard 1 follows the Ministry of Education’s new KP2027 syllabus. Standards 2–6 follow KSSR (Kurikulum Standard Sekolah Rendah), Malaysia’s national primary curriculum.",
      "Across the six years of primary education, students build strong foundations in literacy, numeracy, scientific understanding, communication, critical thinking and problem-solving.",
      "Alongside the national curriculum, SRSS places particular emphasis on the holistic development of every child, integrating academic learning with character development and Education in Human Values.",
    ],
  },
  {
    question: "What subjects are offered at SRSS?",
    paragraphs: [
      "Under KP2027, Standard 1 studies Alam dan Manusia, Mathematics, Malay and English. For Standards 2–6 under KSSR, core subjects include Malay, English, Mathematics, Science and Moral Education; History is a core subject in Standards 4–6.",
      "Non-core subjects include Technology Design (RBT), Visual Arts, Music, and Physical and Health Education. SRSS also offers ICT alongside its values education and additional language classes.",
      "Bahasa Malaysia and English form an important part of every student’s language development. Students may also learn an additional language through supplementary classes in:",
    ],
    bullets: ["Tamil", "Chinese", "Telugu"],
    sections: [
      {
        heading: "Sathya Sai Education in Human Values",
        paragraphs: [
          "A distinctive part of the SRSS experience is Sathya Sai Education in Human Values (SSEHV). This programme complements academic learning by helping children develop the universal human values of Truth, Right Conduct, Peace, Love and Non-violence.",
          "SSEHV learning is experiential rather than simply theoretical. Students engage through five principal teaching techniques:",
        ],
        bullets: ["Silent Sitting", "Storytelling", "Group Singing", "Quotes and Prayers", "Group Activities"],
      },
    ],
    closing: "Together, academic learning and values education aim to develop not only what a child knows, but also how the child thinks, behaves, relates to others and contributes to society.",
  },
  {
    question: "What is the medium of instruction at SRSS?",
    paragraphs: [
      "SRSS provides a bilingual learning environment, with both English and Bahasa Malaysia playing important roles throughout school life.",
      "Science and Mathematics are taught through the Dual Language Programme (DLP), enabling students to learn these subjects in English while developing familiarity with the appropriate terminology in Bahasa Malaysia.",
      "Subjects such as History, Visual Arts, Music and Physical Education are predominantly taught in Bahasa Malaysia, while many school assemblies, SSEHV activities, presentations and special programmes are conducted in English.",
      "Students therefore become comfortable communicating and learning across both languages, while supplementary Tamil, Chinese and Telugu classes further enrich their multilingual experience.",
    ],
  },
  {
    question: "How are students assessed at SRSS?",
    paragraphs: [
      "Assessment at SRSS is designed to understand the whole child’s progress, rather than relying solely on examination results.",
      "Teachers continuously observe and assess students’ academic understanding, communication, thinking and problem-solving abilities, participation, interests, learning needs and personal development. This helps teachers identify areas of strength as well as areas where additional guidance or intervention may be helpful.",
      "Academic assessment includes a combination of:",
    ],
    sections: [
      { heading: "Classroom-Based Assessment (PBD)", paragraphs: ["Ongoing assessment conducted during teaching and learning to monitor each child’s progress and mastery."] },
      { heading: "School-Based Assessments and Examinations", paragraphs: ["Periodic assessments and mid- or end-of-session examinations provide a more formal measure of academic progress."] },
      { heading: "Matriks Pembelajaran Tahun 4", paragraphs: ["From 2026, Year 4 students participate in the national Matriks Pembelajaran assessment. For the 2026 cohort, the assessment is scheduled from 6–8 October 2026, covering Bahasa Melayu, English, Mathematics and Science."] },
    ],
    closing: "Assessment at SRSS also extends beyond academics. Students’ participation and development through co-curricular activities, leadership, teamwork, physical development, service and other school experiences form an important part of understanding their overall growth. The purpose of assessment is not simply to generate marks, but to help teachers, parents and students understand progress and determine what the child needs next.",
  },
  {
    question: "Is SRSS a religious school?",
    paragraphs: [
      "No. SRSS is a private academic primary school that follows Malaysia’s national primary curriculum.",
      "Our values education is centred on the universal human values of Truth, Right Conduct, Peace, Love and Non-violence—values that can be found across religions, cultures, traditions and civilisations around the world.",
      "The purpose of values education at SRSS is not religious conversion or instruction. Rather, it is to help children develop good character, self-discipline, compassion, responsibility, respect for others and an appreciation of human diversity alongside their academic education.",
      "We believe that education should help children become not only knowledgeable, but also good human beings.",
      "Taking part in the school's values-based programme does not require families to adopt a particular religious belief.",
    ],
  },
  parentsAnswer,
  feesAnswer,
  sponsorshipAnswer,
  {
    question: "What is the teacher-to-student ratio at SRSS?",
    paragraphs: [
      "Class sizes at SRSS are deliberately kept manageable, with a maximum teacher-to-student ratio of approximately 1:20 across the school.",
      "Many lessons and activities are conducted in even smaller groups, allowing teachers to know their students well, identify individual learning needs and provide more personalised guidance and support.",
    ],
  },
  midYearAnswer,
  schoolHoursAnswer,
  {
    question: "Where is SRSS located?",
    paragraphs: [
      `Sekolah Rendah Sathya Sai is located at ${contact.address.join(' ')} The school is situated adjacent to the Pure Life Society, whose premises SRSS leases under an agreement renewed through 2035.`,
      `Telephone: ${contact.phone}`,
    ],
  },
  mealsAnswer,
  celebrationAnswer,
  uniformAnswer,
  {
    question: "What makes SRSS different from other schools?",
    paragraphs: ["SRSS combines a strong academic foundation with a distinctive commitment to Human Values and Human Excellence. We believe education should develop not only what a child knows, but also who the child becomes."],
    sections: [
      { heading: "Human Values at the heart of education", paragraphs: ["Education in Human Values is integrated throughout the life of the school and complements the Malaysian national curriculum.", "Students learn and practise the universal values of Truth, Right Conduct, Peace, Love and Non-violence through classroom learning, relationships, reflection, service and everyday school experiences.", "Our approach to Human Values education is supported by the Sathya Sai Academy of Human Values, an educational initiative of the Sathya Sai International Organisation of Malaysia."] },
      { heading: "A warm and connected community", paragraphs: ["SRSS is more than a place of academic learning. It is a community where students, families, teachers and volunteers build meaningful relationships and support one another.", "Our school community brings together people from diverse cultural and national backgrounds while remaining deeply connected to Malaysian society and culture.", "Students learn to appreciate different traditions, perspectives and ways of life while developing mutual respect, understanding and a genuine sense of belonging."] },
      { heading: "Inclusive and responsive learning", paragraphs: ["We recognise that every child is unique, and children do not all learn in the same way or at the same pace.", "Teachers seek to understand each student’s strengths, learning needs, interests and abilities and provide appropriate opportunities, support and guidance.", "Our multicultural learning environment also encourages children to develop intercultural understanding, empathy and a sense of responsible global citizenship."] },
      { heading: "Developing Human Excellence", paragraphs: ["At SRSS, education extends beyond academic achievement.", "We seek to nurture the intellectual, emotional, social, physical, creative and character development of every child.", "Students are given opportunities to discover their interests through areas such as music, sport, art, technology, leadership, co-curricular activities and service.", "These experiences help children develop confidence, resilience, teamwork, creativity, responsibility and compassion.", "Our aspiration is to help every student grow into a capable and caring individual who is prepared not only to succeed personally, but also to contribute positively to society."] },
    ],
  },
];
