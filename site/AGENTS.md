# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## SRSS design decisions

- `SITEMAP.md` is the canonical information architecture and route plan for the public website and secure hubs.
- The platform is a dual-plane system (public web presence + secure role-based hub) on a Google Workspace backbone; boundary rules and decisions D1–D6 are in `docs/architecture.md`.
- Planned public navigation (SITEMAP.md, merged PRD + Dual-Plane brief on 10 Oct 2026): About · Learning · Student Life · Admissions · Community · SRSS25 · Sign in, with utility links Calendar · Downloads · News · Contact. The live header still uses the earlier `Be part of SRSS` grouping until the header change is approved and implemented.
- Use one `/sign-in` entry and a role-aware `/hub` shell. Parent, student, teacher and admin/staff access is enforced by the data/API layer, not by hidden navigation.
- Google Workspace products support governed SRSS workflows; they are integrations rather than substitutes for clear SRSS pages, permissions, status and confirmation states.

- Use the official SRSS logo only as a compact header and restrained footer brand mark. Do not refer to it as a crest or use oversized emblems, anniversary artwork, decorative school motifs, or unrelated multilingual/religious symbols.
- The public homepage is calm and editorial: solid deep navy, ivory, white, and restrained gold. The interactive Values Garden is the deliberate exception, using the approved vibrant five-value palette; reserve other bright gradients for internal student-hub galleries.
- Homepage photography may feature fictional pupils, but uniforms must follow the real SRSS lavender-and-aubergine-purple uniform. Integrate imagery with softened photographic edges rather than visible rectangular cards.
- The selected visual target is `design-reference.png`, the cinematic navy hero with teacher and pupils, three value pillars, blended learning strip, and four-audience hub row.
- The homepage hero eyebrow is `Since 2002`; the headline is `The End of Education is Character`, with metallic gold reserved for the single word `Character`.
- The school motto is `Human Excellence | Kecemerlangan Insan`; keep it distinct from the educational maxim `The End of Education is Character`.
- Use the exact label `Sai Educare Philosophy`. Values Garden petals must keep their labels comfortably inside the artwork and visibly behave as interactive controls.
- The Values Garden uses five equal radial oval value petals around a true circular centre, with five smaller pointed gold inter-petals placed precisely in the gaps. Keep the established value-to-colour mapping, but render the red, blue, purple, green and orange petals with the vibrant tonal gradients and depth of the supplied 25th-anniversary floral reference. Value names remain bold, white, uppercase radial typography and must stay comfortably inside their petals.
- The homepage contains Our Purpose, an interactive five-leaf Values Garden, a real-photo Life at SRSS carousel, Learning Experience tabs, and a five-audience role navigator.
- Place the homepage FAQ preview immediately after the Values Garden and link it to the canonical standalone `/faq` page. FAQ content is database-backed and editable through Admin Content Management.
- Place Stories & Happenings immediately after the FAQ. Inside it, keep the order: prominent 25th anniversary feature, latest news and events, `Small moments. Lasting roots.` carousel, then a monthly calendar with an adjacent event list.
- Keep the top `Find your way · I am a…` role router as the only public hub navigator. Do not reintroduce the lower `One school, many doors` or family-essentials sections; future authentication actions belong in or beside the top router.
- The current public experience is canonical at `/`; former section-style paths such as `/contact`, `/learning`, `/admissions`, and `/news` resolve to homepage anchors, while `/about` remains the dedicated About SRSS experience.
- The homepage role router combines visitors, guests, prospective parents and Sai-community pathways under `Exploring the school`; its fifth role is `Admin`, opening the secure Admin Hub. The Admin Hub prioritises communications, people records, admissions, publishing, announcements, events, forms, submissions and operational reminders—not finance-heavy back-office work.
- The attached 500 px circular `SRSS LOGO (2).png` is the current official source of truth for the site logo.
- The Values Garden uses the supplied five-petal SRSS artwork with accessible clickable petal labels; do not return to a generic CSS tree.
- Give newly supplied high-resolution documentary school photographs priority in Life at SRSS. Preserve their originals and use generated imagery only for purpose-built editorial compositions such as the blended hero.
- Preserve the full Principal, Senior Assistant of Academics and pioneer-alumna messages on the public `/about/voices` editorial page. Use the supplied 4:5 portraits, and let the Principal’s message and portrait anchor the homepage leadership feature.
- Keep `/about/voices` aligned with the approved typography system: Playfair Display for all editorial headings, Open Sans for speech body copy, and Poppins only for labels, navigation and UI.
- Footer copy, Kuala Lumpur address, phone, email and six quick links must remain available and responsive.
- Homepage composition (user decisions, 10 Oct 2026): hero → raised welcome box (`Welcome to SRSS Digital Hub` / `Learning beyond classroom.` / SSIO Malaysia body copy, with the three pillars along its base) → `Find your way · I am a…` role router → Silver Jubilee band (25th-anniversary mark with the motto beneath; eyebrow `2002–2027 · Silver Jubilee`; three facts: Since 2002 → learning experience, Year 1–6 · KSSR infused with 5 human values, 25 years → `/about#srss25`) → Small moments photo montage → Learning experience (a photo per theme; the interactive Values Garden replaces the photo under Human Values, with the selected value's details in the panel; `/#values` opens it) → Voices that guide us (Principal card) → FAQ → Stories & Happenings → calendar → Admissions → Contact & visit → footer. The separate stats row and stand-alone Values Garden section are gone.
- Homepage interaction (user decisions, 10 Oct 2026): a shiny purple announcement ticker scrolls published news/event titles with a pause button; the Small moments montage is a one-photo-at-a-time carousel with captions that slides left and fades, auto-advances, pauses on hover/focus and has a pause button; content unveils progressively — role buttons reveal their details, FAQ shows four questions then "Show more", the calendar shows the coming-up list before the month view, Stories shows four preview cards (all eight scroll sideways on phones), and the admissions/question forms open from two choice buttons. A back-to-top button and a floating "+" quick-actions button (visit, enquiry, contact, sign in) sit bottom-right.
- Footer quick links: About us · FAQ · Visit SRSS · Student Hub · Teachers Hub · Admin Hub · Parents Hub · Resources. The hub logo returns to the public homepage, and hub pages carry their own footer.
- Homepage motion stays subtle: a staggered hero entrance, a once-only fade-up as sections enter the viewport (`data-reveal` / `data-reveal-stagger`), gentle card lift and arrow nudges on hover. Animate with the `translate`/`scale` properties, never `transform`, so existing layout transforms survive. Everything is disabled under `prefers-reduced-motion`.
- The public Prayer, Pledge & Anthem resource lives at `/resources/prayer-pledge-anthem`; it uses the shared public header/footer and presents the assembly sequence as six accessible, printable practice panels using the supplied SRSS photography.

## Secure hub implementation decisions

- The product is the **SRSS Digital Hub** (SRSS25 is the launch occasion). The secure hub (`/sign-in`, `/hub/*`) runs on React + Vite with Firebase (Auth, Firestore, Functions, Security Rules) and Google Workspace as the productivity layer. The user chose to keep React + Vite rather than the PRD's Next.js. Setup: `docs/HUB-SETUP.md`; data model: `docs/data-model.md`; requirement status: `docs/requirements.md`.
- `src/auth/permissions.js` is the single source of truth for hub roles (PRD user groups) and the V/C/U/A/R module matrix. Any change must be mirrored in `firestore.rules` / `storage.rules` and pass `npm test` and `npm run test:rules`.
- Roles live only in Firebase custom claims set by `setUserRoles`; access scope lives in server-derived `users/{uid}` (`functions/scope.js`). Per-child records carry `studentId` + `classId`, and hub queries must be constrained so every returned document is readable.
- Hub route metadata (label, module, phase, Google services, screen) lives in `src/hub/routes.js`. Use the shared components in `src/hub/ui.jsx`; the student hub stays deliberately simple (large cards, few choices).
- Human Values are recorded as specific observations, never numeric scores; public showcase needs a moderator and recorded consent; consent records are append-only.
- Hub reads are one-shot (no realtime listeners) to keep Firebase on free allowances.
- Firestore is the system of record for children, guardians, enrolment, attendance, admissions and consent. Applications and consent are hub forms; Google Sheets only receives read-only reports and Google Forms only handles low-risk public intake (user decision, 10 Oct 2026).
- The SRSS25 badge, 2002–2027 timeline, archival photos and gala registration live on `/srss25`; the homepage keeps one restrained Silver Jubilee band linking there (user decision, 10 Oct 2026).
- The Workspace edition is unconfirmed: keep plans edition-neutral until the school confirms (Google for Nonprofits excludes schools).
- Public website images come from the hub image library (Content → Image library): every image needs alt text, and photos showing pupils need the uploader's public-media consent confirmation. Uploads are resized in the browser (max 2,000 px, WebP).
- Any demo role-switching bar is local-demo only (emulators); never ship view switching without sign-in.
