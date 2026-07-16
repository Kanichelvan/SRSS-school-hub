# SRSS Internal Hubs and Gallery Modules

## Shared shell

Keep the global shell recognisably SRSS:

- solid navy navigation and footer;
- official school logo in the header;
- Poppins controls and Open Sans body;
- white/off-white content surfaces;
- gold reserved for important actions and milestones.

Allow each hub to have a different working personality without becoming a separate brand.

## Parent Hub

Tone: calm, clear and reassuring.

Prioritise:

- today’s notice;
- upcoming dates and school calendar;
- forms and documents;
- attendance/absence guidance;
- uniform, arrival and dismissal information;
- class and contact links.

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

Use navy structure, white surfaces and restrained category top borders. Purple may identify reflective or professional-development resources. Keep gradients limited to major alerts or featured resource headers.

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
