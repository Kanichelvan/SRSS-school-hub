// Stable, versioned packs. Progress is operational; it is never a safeguarding or consent acknowledgement.
export const PACK_VERSION = 1;
export const PACKS = {
  student: {
    title: "Your first days at SRSS",
    checkIn: "Week 1",
    steps: [
      [
        "welcome",
        "Meet your class",
        "Ask your class teacher to introduce you to your classmates and your buddy.",
        "/hub/student/class",
      ],
      [
        "access",
        "Try your school login",
        "Open your class and portfolio. Ask your teacher if anything is missing.",
        "/hub/student/portfolio",
      ],
      [
        "routines",
        "Learn the school routines",
        "Practise Silent Sitting, assembly and the school-day routines with your class.",
        "/resources/prayer-pledge-anthem",
      ],
      [
        "buddy",
        "Find your buddy",
        "Find the person you can turn to at break and when moving around the school.",
      ],
      [
        "checkin",
        "Tell your teacher how it is going",
        "At the end of Week 1, share something you enjoyed and anything you need help with.",
      ],
    ],
  },
  parent: {
    title: "Welcome to the SRSS family",
    checkIn: "Week 1",
    steps: [
      [
        "welcome",
        "Read your family quick-start guide",
        "Check your linked children and tell the school office about missing or incorrect information.",
        "/hub/parent/children",
      ],
      [
        "access",
        "Set up your communication preferences",
        "Choose which updates help your family and how you prefer to communicate.",
        "/hub/profile",
      ],
      [
        "consent",
        "Record consent for each child",
        "Choose media and public showcase permissions separately for each child. You can change them later.",
        "/hub/parent/consent",
      ],
      [
        "orientation",
        "Attend orientation",
        "Ask the office for the next orientation date. Check school routines and the calendar.",
        "/hub/calendar",
      ],
      [
        "teacher",
        "Make your first teacher contact",
        "Introduce your family and share any practical support needs privately.",
        "/hub/messages",
      ],
      [
        "checkin",
        "Week 1 family check-in",
        "Discuss access, settling in and unanswered questions with your class teacher.",
      ],
    ],
  },
  teacher: {
    title: "A supported start to teaching",
    checkIn: "First month",
    steps: [
      [
        "welcome",
        "Meet the office and your mentor",
        "Confirm your responsibilities, orientation date and first-month review with your mentor.",
      ],
      [
        "access",
        "Check your classes and access",
        "The office assigns accounts and classes. Check your roster before entering information.",
        "/hub/teacher/classes",
      ],
      [
        "privacy",
        "Complete safeguarding and data training",
        "Read the school policies, attend the briefing and record the staff acknowledgement.",
        "/legal/child-safeguarding",
      ],
      [
        "plans",
        "Prepare your curriculum and weekly plans",
        "Agree syllabus targets, evidence and appropriate learning support.",
        "/hub/teacher/teaching",
      ],
      [
        "communication",
        "Agree the communication routine",
        "Keep updates clear, practical and private to the appropriate families.",
        "/hub/teacher/announcements",
      ],
      [
        "review",
        "Set goals with your mentor",
        "Use your first-month discussion to agree support, development goals and follow-up.",
        "/hub/teacher/development",
      ],
    ],
  },
  staff: {
    title: "Welcome to the SRSS team",
    checkIn: "First month",
    steps: [
      [
        "welcome",
        "Confirm your role with the office",
        "Meet your supervisor and agree your practical induction checklist.",
      ],
      [
        "access",
        "Check your system access",
        "Check only the responsibilities assigned to you. Ask the office to correct missing access.",
        "/hub/profile",
      ],
      [
        "safeguarding",
        "Attend the safeguarding briefing",
        "Learn the reporting route and who to contact when a child needs help.",
        "/legal/child-safeguarding",
      ],
      [
        "privacy",
        "Read and acknowledge data responsibilities",
        "Use the confidentiality acknowledgement in your hub and discuss questions with your supervisor.",
        "/legal/data-protection",
      ],
      [
        "orientation",
        "Walk through your daily tasks",
        "Check the contact and escalation map with your supervisor.",
      ],
      [
        "checkin",
        "Arrange your probation check-in",
        "Review what is working, questions and training needs in your first month.",
      ],
    ],
  },
};
export const packRoles = (roles) => [
  ...new Set([
    ...(roles.includes("student") ? ["student"] : []),
    ...(roles.includes("parent") ? ["parent"] : []),
    ...(roles.some((r) =>
      ["teacher", "classTeacher", "specialistTeacher"].includes(r),
    )
      ? ["teacher"]
      : []),
    ...(roles.some(
      (r) =>
        ![
          "student",
          "parent",
          "teacher",
          "classTeacher",
          "specialistTeacher",
        ].includes(r),
    )
      ? ["staff"]
      : []),
  ]),
];
export const REVIEW_DOMAINS = [
  [
    "delivery",
    "Teaching and learning delivery",
    "Classroom observation, inclusive practice and pupil engagement.",
  ],
  [
    "planning",
    "Planning and curriculum alignment",
    "Term plans, weekly updates and progress against agreed syllabus targets.",
  ],
  [
    "growth",
    "Student portfolio and growth",
    "Quality and variety of evidence, pupil reflection and timely feedback.",
  ],
  [
    "pastoral",
    "Parent communication and pastoral care",
    "Class updates, response timeliness, attendance follow-up and support.",
  ],
  [
    "contribution",
    "Professional contribution and school values",
    "Training, collaboration, events and specific examples of values in practice.",
  ],
];
export const REVIEW_BANDS = [
  ["meets", "Meets expectation"],
  ["strong", "Strong"],
  ["support", "Needs support"],
];
export const REVIEW_STAGES = [
  ["goals", "Beginning-of-year goals"],
  ["midyear", "Mid-year developmental review"],
  ["yearend", "End-of-year summary"],
];
export const COMMUNICATION_NEEDS = [
  ["announcements", "Announcements"],
  ["forms", "Forms and actions"],
  ["calendar", "Calendar reminders"],
  ["teacherUpdates", "Teacher updates"],
];
// No automatic notifications or public publication follow these preferences.
export const ACTIVITY_FORMS = [
  [
    "registration",
    "Activity registration",
    "family",
    ["participation", "medical", "pickup"],
  ],
  [
    "permission",
    "Parent participation consent",
    "family",
    ["participation", "pickup"],
  ],
  ["medical", "Medical and dietary disclosure", "family", ["medical"]],
  ["media", "Event photography and media choice", "family", ["media"]],
  ["emergency", "Emergency contact confirmation", "family", ["emergency"]],
  ["supervision", "Adult supervisor checklist", "staff", ["supervision"]],
  ["attendance", "Activity attendance register", "staff", ["attendance"]],
  ["incident", "Incident or accident report", "staff", ["incident"]],
  ["reflection", "Post-event reflection and report", "staff", ["reflection"]],
  ["volunteer", "Volunteer / chaperone declaration", "family", ["volunteer"]],
].map(([id, title, audience, sections]) => ({
  id,
  title,
  audience,
  sections,
  version: 1,
}));
export const ACTIVITY_FIELDS = {
  participation: [
    ["participation", "Participation permission", "select", ["Yes", "No"]],
  ],
  medical: [
    [
      "medical",
      "Medical considerations, allergies and dietary needs",
      "textarea",
    ],
  ],
  pickup: [
    ["collection", "Collection arrangements / authorised adult", "text"],
  ],
  media: [
    [
      "mediaChoice",
      "Photography / event media choice",
      "select",
      ["Yes", "No"],
    ],
  ],
  emergency: [
    ["emergencyName", "Emergency contact name", "text"],
    ["emergencyPhone", "Emergency contact telephone", "tel"],
  ],
  supervision: [
    [
      "supervision",
      "Briefing, headcount, first aid, supervision and collection checks",
      "textarea",
    ],
  ],
  attendance: [
    [
      "attendance",
      "Session date, pupil names and present / absent record",
      "textarea",
    ],
  ],
  incident: [
    [
      "incident",
      "Time, factual account, immediate action and people informed",
      "textarea",
    ],
  ],
  reflection: [
    [
      "reflection",
      "What happened, learning, feedback and follow-up",
      "textarea",
    ],
  ],
  volunteer: [
    [
      "volunteer",
      "Role, availability and safeguarding briefing confirmation",
      "textarea",
    ],
  ],
};
export function icsCalendar(events) {
  const escape = (v) =>
    String(v || "")
      .replaceAll("\\", "\\\\")
      .replaceAll("\n", "\\n")
      .replaceAll(";", "\\;")
      .replaceAll(",", "\\,")
      .replaceAll("\r", "");
  const stamp = (v) => String(v).replaceAll("-", "");
  const nextDay = (v) => {
    const d = new Date(`${v}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().slice(0, 10);
  };
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SRSS//School Calendar//EN",
    "CALSCALE:GREGORIAN",
  ];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${escape(e.id)}@srssdigitalhub`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d{3}/g, "")}`,
    );
    if (e.allDay || !e.startTime)
      lines.push(
        `DTSTART;VALUE=DATE:${stamp(e.date)}`,
        `DTEND;VALUE=DATE:${stamp(nextDay(e.endDate || e.date))}`,
      );
    else {
      const instant = (d, t) =>
        new Date(`${d}T${t}:00+08:00`)
          .toISOString()
          .replace(/[-:]|\.\d{3}/g, "");
      lines.push(`DTSTART:${instant(e.date, e.startTime)}`);
      if (e.endTime)
        lines.push(`DTEND:${instant(e.endDate || e.date, e.endTime)}`);
    }
    lines.push(
      `SUMMARY:${escape(e.title)}`,
      `DESCRIPTION:${escape(e.description)}`,
      `LOCATION:${escape(e.location)}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  // RFC 5545: fold by UTF-8 octets, not JS character count.
  return (
    lines
      .map((line) => {
        let result = "",
          part = "",
          count = 0;
        for (const c of line) {
          const n = new TextEncoder().encode(c).length;
          if (count + n > 73) {
            result += part + "\r\n ";
            part = "";
            count = 1;
          }
          part += c;
          count += n;
        }
        return result + part;
      })
      .join("\r\n") + "\r\n"
  );
}
export function downloadText(name, text, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
