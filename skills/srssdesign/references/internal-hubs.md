# SRSS Internal Hubs and Gallery Modules

## Shared shell

Keep the global shell recognisably SRSS:

- solid navy navigation and footer;
- official school logo in the header;
- Poppins controls and Open Sans body;
- white/off-white content surfaces;
- gold reserved for important actions and milestones.

Allow each hub to have a different working personality without becoming a separate brand.

Use `site/SITEMAP.md` as the canonical route, role and integration model. All users enter at `/sign-in`; after authentication, `/hub` resolves to a role-aware dashboard. Shared hub services use stable `/hub/*` routes and filter content and actions by authorization.

Shared areas:

- dashboard;
- search;
- announcements;
- calendar;
- messages;
- forms and consent;
- profile and account settings;
- help and support.

Hiding a link is not authorization. Enforce role, family, class and capability boundaries in the data/API layer, including direct URL access.

## Parent Hub

Tone: calm, clear and reassuring.

Prioritise:

- today’s notice;
- upcoming dates and school calendar;
- forms and documents;
- attendance/absence guidance;
- uniform, arrival and dismissal information;
- class and contact links.

Use `/hub/parent` and its children, including children, progress, forms, meetings and resources. A parent may see only linked children and permitted records.

Use white and ivory cards, Navy 900 headings, limited Purple 700 labels and gold focus states. Avoid playful gradients in core administrative tasks.

## Student Hub

Tone: energetic, encouraging and discovery-led.

Prioritise:

- weekly learning board;
- reading/book club;
- class resources;
- values challenge;
- journal/reflection;
- progress and achievements;
- events and activities.

Use `/hub/student` and its children, including profile, progress, portfolio, assignments, library and events. Keep progress and support information age-appropriate and permission-aware.

This is the primary home for colourful gradients. Use gradient bands as module headers while keeping card bodies white and text legible.

Suggested semantic colour mapping:

- Green: reading, growth, book club and success.
- Red/coral: dashboard, progress and important alerts.
- Purple: journal, reflection and personal journey.
- Orange: activities, play and active participation.
- Blue: events, schedules and structured learning.
- Teal: service, confirmation and selected states.

Do not use every colour in one viewport. Choose three to five modules and maintain white space between them.

## Teacher Hub

Tone: organised, efficient and professional.

Prioritise:

- timetable and staff notices;
- SOPs and forms;
- teaching resources;
- event checklists;
- protected links and contact routes.

Use `/hub/teacher` and its children, including classes, students, assignments, attendance, communication and bookings. Scope access to assigned classes, responsibilities and time periods.

Use navy structure, white surfaces and restrained category top borders. Purple may identify reflective or professional-development resources. Keep gradients limited to major alerts or featured resource headers.

## Admin and Staff Hub

Tone: precise, accountable and operational.

Prioritise:

- admissions enquiries and follow-up;
- student records and completeness checks;
- staff roles and access permissions;
- forms registry and review cycles;
- library and resource administration;
- events, publishing and school communications;
- governance, consent audits, retention and incident follow-up.

Use `/hub/admin` and capability-based child routes. Do not assume every staff account can access admissions, records, publishing or governance.

## Service integrations

Google Classroom, Calendar, Drive, Docs, Slides, Sheets, Forms, Gmail, Groups, Meet and approved Sites or gallery repositories may support workflows. Keep the SRSS hub responsible for context, authorization, status, confirmation, errors and return navigation. Every integration needs a named owner, audience, review cycle and retention rule.

## Community Hub

Tone: generous, active and connected.

Prioritise:

- events and celebrations;
- seva/volunteering opportunities;
- alumni and supporter stories;
- contributions and school campaigns;
- community contact routes.

Use teal for service/growth, gold for contribution/milestones and orange for active participation. Separate strong colours with white or ivory.

## Approved gradient tokens

Use these only on internal feature surfaces:

- Updates: `linear-gradient(90deg, #1B4568 0%, #4A1E6B 100%)`.
- Updates hover: `linear-gradient(90deg, #24547E 0%, #5C2784 100%)`.
- Updates active: `linear-gradient(90deg, #153653 0%, #391654 100%)`.
- Purple glow: `linear-gradient(90deg, #5F176C 0%, #9837A1 45%, #CF79D6 100%)`.
- Purple metallic: use a narrow reflective band only for premium announcements, milestones and modal headers; never as a page background.

Use CSS gradients for UI modules only when they match these approved tokens. Do not place them behind long body copy.

## Card anatomy

Recommended content-gallery card:

1. Coloured/gradient header band with a functional icon, eyebrow and title.
2. White body with a concise one- or two-sentence description.
3. Full-width soft-tinted action with strong text contrast.
4. 14–18 px radius, thin neutral border and a soft low shadow.

Use icons from one coherent outline library. Do not use emoji or hand-drawn SVG substitutes.

## Accessibility and restraint

- Maintain at least 4.5:1 contrast for body text.
- Use white text on strong module colours.
- Do not place gold body text on white.
- Keep category colour out of form-field text.
- Provide visible keyboard focus, selected and success states.
- Avoid large red panels, excessive metallic effects and many gradients in one viewport.
