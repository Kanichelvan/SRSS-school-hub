// How children join SRSS, as described by the School (Nov 2026). The Admissions page infographic
// (src/components/AdmissionPathways.jsx), the homepage admissions steps and the admissions FAQs read from here.

// SRSS keeps enrolment at about 160 pupils, never more than 170, so that classes stay small.
export const ENROLMENT = { usual: 160, max: 170 };

export const ADMISSION_ROUTES = {
  // The main yearly admission: children join Standard 1 at age six.
  standard1: {
    title: "Standard 1 intake",
    who: "The main admission each year, for children joining Standard 1 at age six.",
    steps: [
      ["Interview date announced", "The school announces the date on which parents are interviewed."],
      ["Parent interview", "A conversation with the school about your child and your family."],
      ["Meet and mingle", "Prospective parents meet one another and the school community."],
      ["Entrance test", "Your child sits the school's entrance test."],
      ["Offer letter", "Families offered a place receive an offer letter from the school."],
    ],
  },
  midYear: {
    title: "Joining during the year",
    who: "For children transferring into SRSS mid-year or into a later Standard.",
    steps: [
      ["Write in, or bring your documents", "Write to the school, or bring your child's documents to the school office."],
      ["Talk it through with the school", "The school discusses your child's previous learning, placement and needs with you."],
      ["A place at the earliest opening", "Your child is offered a place as early as possible, subject to availability."],
    ],
  },
  pureLife: {
    title: "Pure Life Society residential children",
    who: "Residential children of the Pure Life Society are enrolled at SRSS automatically, with fully sponsored education.",
  },
};
