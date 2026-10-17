// School-provided academic details, 15 October 2026.
export const standards = ['Prema', 'Sathya', 'Dharma', 'Shanti', 'Ahimsa', 'Ananda'];

export const schoolHours = [
  { days: 'Mon & Tue', standard1: '1.30 pm', standards2to6: '1.30 pm' },
  { days: 'Wednesday', standard1: '12.30 pm', standards2to6: '1.00 pm' },
  { days: 'Thursday', standard1: '1.00 pm', standards2to6: '1.00 pm' },
  { days: 'Friday', standard1: '12.30 pm', standards2to6: '12.30 pm' },
];

export const schoolHoursAnswer = {
  question: 'What are the school hours at SRSS?',
  paragraphs: ['All classes start at 7.40 am, Monday–Friday. Finishing times vary by day and cohort.'],
  bullets: schoolHours.map(({ days, standard1, standards2to6 }) => `${days}: Standard 1 finishes at ${standard1}; Standards 2–6 finish at ${standards2to6}.`),
  closing: 'Occasional weekend events offer further enrichment. Please arrive punctually for the start of the school day.',
};

export const academicSubjects = {
  standard1: ['Alam dan Manusia', 'Mathematics', 'Malay', 'English'],
  core: ['Malay', 'English', 'Mathematics', 'Science', 'Moral Education'],
  nonCore: ['Technology Design (RBT)', 'Visual Arts', 'Music', 'Physical and Health Education'],
};
