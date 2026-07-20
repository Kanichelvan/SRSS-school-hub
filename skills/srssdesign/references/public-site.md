# SRSS Public Site Pattern

## Page purpose

Make the public site a living invitation into SRSS rather than a brochure. A prospective parent should understand within seconds that academic excellence and character development belong together.

Use `site/SITEMAP.md` as the canonical public route and content hierarchy. This reference governs presentation; the sitemap governs page boundaries, URLs, audiences and integrations.

## Header and navigation

Use a two-tier solid-navy header.

### Utility strip

- Height: approximately 32–38 px.
- Left: uppercase `Updates`, optional restrained gold dot or pause indicator.
- Middle: one concise current notice with an exact date.
- Right: `View all updates` or `Read more` with a proper arrow icon.
- Use Poppins/Open Sans at 10–12 px. Keep the strip readable, not decorative.

### Main navigation

- Height: approximately 88–105 px desktop.
- Left: official school logo at 52–68 px and a two- or three-line school lockup.
- Lockup: `Sekolah Rendah Sathya Sai`, `Kuala Lumpur, Malaysia`, optional small gold `Human Excellence · Kecemerlangan Insan`.
- Centre: About, Learning, Student Life, Be part of SRSS, Resources.
- `Be part of SRSS` groups two distinct destinations: Admissions & Visits, and Community & Support.
- Right: search, Sign in, and a restrained outlined `Admissions & Visits` action.
- Use the logo once. Do not place an anniversary mark beside it in standard navigation.
- Collapse to logo, search and menu on mobile.

## Hero

Use a full-width solid Navy 950/900 hero approximately 410–460 px tall on desktop.

Left column:

- Gold eyebrow: `Sekolah Rendah Sathya Sai · 25th Year` or a page-specific label.
- Playfair Display statement. Keep desktop wrapping to three or four deliberate lines.
- Supporting paragraph of no more than 60–70 words.
- One solid-gold primary action and one understated text/outline action.

Right column:

- Use one high-quality teacher-and-pupil or pupil collaboration photograph.
- Blend the image into the solid navy at image level. Do not show a rectangular photo card.
- Preserve human faces, hands, uniforms and books/learning materials as the focal point.
- Let the image bleed to the right edge while leaving clean navy space behind the copy.

Do not place the school logo, anniversary mark, flower emblem, building illustration or watermark inside the hero.

## Values band

Follow the hero with an ivory editorial band:

- Heading: `A school for the mind, heart and character`.
- Three concise pillars: Academic confidence, Human values in action, Compassionate leadership.
- Use typography and fine vertical rules, not three heavy cards.
- Keep each description to one or two sentences.

## Learning panorama

Use one wide documentary strip showing multiple learning moments. Fade the top and bottom edges into ivory at image level. Avoid boxed gallery cards in the first viewport.

Suitable scenes:

- science and experimentation;
- reading and enquiry;
- collaboration and making;
- care for nature;
- service and community action.

## Audience row

Use a minimal four-column row beneath the panorama:

- For Parents
- For Students
- For Teachers
- For Community

Each item contains a serif heading, one short description and a functional arrow icon. Use fine vertical rules. On mobile, stack the items and preserve 44 px tap targets.

## Deeper homepage sections

After the first viewport, introduce practical usefulness:

- school calendar and upcoming dates;
- parent essentials and downloadable forms;
- notices and school-life stories;
- enquiry/visit request;
- optional links to the student, teacher and community hubs.

Route unauthenticated Student, Parent, Teacher and Admin/Staff Hub visitors through `/sign-in`; do not expose a role-specific sign-in form on the public homepage.

Keep these sections simpler than the internal hubs. Use white/ivory surfaces and restrained borders.

## Footer

Use solid Navy 950 with a thin Gold 700 bottom rule. The school logo may appear once in a compact lockup. Include the approved footer description from `content-and-copy.md`, essential links, contact/visit action and accessibility basics.

## Interaction standards

- Navigation links scroll or route correctly.
- Use canonical, shareable routes for complete pages and hash links only for sections within those pages.
- Search opens a labelled overlay and closes with Escape.
- Admissions & Visits opens a labelled form or routes to a focused enquiry page.
- Forms show labels, validation, focus and success states.
- Hover states remain restrained: underline, colour shift or 1 px movement.
- Use a real icon library for search, arrows, calendar, people and menu icons.
- Provide visible focus, semantic regions, alt text, a skip link and reduced-motion support.

## Responsive behaviour

- Preserve the navy hero as the brand anchor.
- Stack copy above imagery below 820 px.
- Keep the headline readable and avoid one-word dangling lines.
- Reposition the hero photography without hiding faces or hands.
- Convert three columns to one and four audience links to two or one.
- Never introduce horizontal scrolling.
