# SRSS25 — Sekolah Rendah Sathya Sai Design System

**25 Years of Human Excellence** · *Kecemerlangan Insan*

Sekolah Rendah Sathya Sai (SRSS) is a values-based private primary school in
Kuala Lumpur, Malaysia, opened in 2002. In **2027** it marks its **Silver
Jubilee — 25 years** — and that anniversary programme is branded **SRSS25**.

The school's whole proposition is character: *"The end of education is
character."* Teaching is organised around **Head, Heart and Hands** and the
**five Human Values** — Truth, Right Conduct, Peace, Love and Non-Violence
(Kebenaran, Kesucian, Keamanan, Cinta, Tanpa Kekerasan) — which appear on the
school crest and are practised daily rather than taught as a subject.

This design system covers two related identities:

1. **SRSS** — the school's everyday identity: navy ground, gold accent, serif
   masthead, the official multicolour crest.
2. **SRSS25** — the Silver Jubilee overlay: the six-petal jubilee emblem, a
   silver "25", silver-foil display type, and the same navy/gold foundation.

---

## Sources supplied

Everything in this system was derived from the files the brand owner uploaded.
There was **no codebase and no Figma file**, so nothing could be read from
production source. Verbatim sources:

| File (as uploaded) | What it gave us |
|---|---|
| `SRSS25Logo.png` | The Silver Jubilee emblem — six petals + silver "25" + gold "SRSS" bar. → `assets/logo-srss25-jubilee.png` |
| `SRSS LOGO (1).png` | The official school crest — purple ring, bilingual/multilingual value petals, open book. → `assets/logo-srss-crest.png` |
| `design-reference.png` | **Primary layout reference.** Full SRSS homepage render: updates ticker, masthead, hero with right-hand photo and navy scrim, three-pillar band, photo triptych, four-up audience router. → `assets/reference-homepage.png` |
| `Screenshot 2026-08-28 at 1.35.10 AM.png` | **Primary type/colour reference.** The "The End of Education is **Character**" hero at full size — gold foil accent word, gold CTA, gold eyebrow. → `assets/reference-hero-character.png` |
| `SRSSassemblysinging.png`, `srssassemblymeditate.png`, `srssmeditateassembly.png`, `srssstudentrukun.png` | School photography — purple/lilac uniforms, warm Malaysian daylight, children mid-activity. → `assets/photo-*.png` |
| `schoolflag.png`, `srssflaghoisted.png`, `srssflagmale.png` | The SRSS flag — lilac ground, purple ring, crest at centre — flying, and being hoisted at assembly. → `assets/photo-flag-*.png` |
| `31AD7D35-…jpeg`, `srssassemblymeditate-…png`, `75D9BA6D-…jpeg`, `srssstudentrukun-…png` | Assembly photography for the Songs & Prayers page: a pupil leading the pledge at the microphone, the full school in silent sitting, seated rows. → `assets/photo-pledge-boy.png`, `photo-silent-sitting.png`, `photo-seated-rows.png`, `photo-students-seated.png` |
| `86A4492C-…PNG`, `1CDCDACD-…png` | Staff/committee portraits on neutral grey. → `assets/portrait-staff-0*.png` |
| `sai_conference_brand_guide_final.html` | A **sibling** brand guide (Sathya Sai Conference 2025, Zone 4 centenary). Confirmed the Playfair Display + Poppins pairing and the organisation's love of gradient accents, but its purple/coral/teal/amber palette is **that event's**, not SRSS's. Not carried into these tokens. |
| `sai_conference_ecosystem.html` | Same event; same note. |
| `Screenshot 2026-08-13 …`, `Screenshot 2026-08-27 … (×2)` | **MySAIYa Digital Hub** (SSIO Malaysia young-adults platform) in development. A sibling surface in the same navy + gold + Playfair/Poppins family — useful corroboration of the house style, not an SRSS product. |

> **What is reconstructed, not copied.** Only the homepage and the Character
> hero exist as references. The Values, Silver Jubilee, Admissions and Stories
> screens in the UI kit are composed from the same vocabulary — they are honest
> extensions, not recreations of screens we were shown. Treat them as proposals.

---

## CONTENT FUNDAMENTALS

**Voice.** Warm institutional. The school speaks as a considered adult who has
been doing this for twenty-five years and doesn't need to oversell. Confident,
never boastful; plain, never plain-spoken to the point of blandness.

**Person.** "**We**" for the school, "**your child**" / "**every child**" for
the pupil. Parents are addressed as **you**, directly and respectfully. Never
"our students" when "every child" will do — the singular is deliberate and
recurs throughout the reference copy.

**Sentence shape.** Long first sentence, short second. The hero standfirst is
the model: *"At Sekolah Rendah Sathya Sai, education is the journey of drawing
out the best within every child. By harmonising the Head, Heart, and Hands, we
cultivate learners who excel academically, live by universal human values, and
become thoughtful leaders committed to making the world a better place."* Serial
lists of three are the signature rhythm — *mind, heart and character*;
*Head, Heart and Hands*; *knowledge, curiosity and confidence*.

**Headlines are claims, not labels.** The reference heroes are declarative
sentences, sometimes with an em dash: *"The End of Education is Character."*
*"The future does not walk into our school tomorrow — it sits in our classrooms
today."* One word or phrase in each is set in gold. Section headings behave the
same way: *"A school for the mind, heart and character."* Never a bare noun
label like "Our Approach".

**Casing.** Sentence case for headlines and body. **UPPERCASE with 0.14em
tracking** for eyebrows, micro-labels, nav accessories and form labels
(`UPDATES`, `SEKOLAH RENDAH SATHYA SAI · SINCE 2002`, `REFLECTION · 5 MIN
READ`, `ADDRESS`). Serif caps at 0.05em only for the school name in the
masthead. Title Case is used for nav items and named things
(`Parent Hub`, `Admissions & Visits`, `Human Values`).

**Bilingualism.** Malay sits beside English as an equal, joined by a spaced
middot: *Human Excellence · Kecemerlangan Insan*. Value names are always
bilingual — *Truth / Kebenaran*. Never translate mid-sentence; pair whole
labels.

**Punctuation.** The spaced middot ` · ` joins eyebrow segments and bilingual
pairs. Em dashes do the thinking in headlines. Ampersands only in fixed names
(`Admissions & Visits`). No exclamation marks anywhere.

**Dates and numbers.** `20 Jul 2026` in the ticker, `15 August 2026` in
prose. Years stand alone as display figures (`2002`, `2027`, `25`).

**Emoji: never.** The sibling conference guide used them (🎯 📋 🌈) and it is
exactly what SRSS should not do. No emoji in any SRSS surface.

**Spiritual register.** Quotations from Bhagawan Sri Sathya Sai Baba appear
unadorned — italic serif, gold rule, name in uppercase beneath. No quote marks,
no reverential framing, no exclamation. The words carry themselves.

**Things to avoid.** Marketing superlatives ("world-class", "state-of-the-art"),
data slop (invented percentages, league-table claims), the word "journey" more
than once per page, and any implication of exclusivity — the school's pitch is
character, not prestige.

---

## VISUAL FOUNDATIONS

**Colour.** Deep navy `--navy-800 #0A1A3C` is the ground; it is the default,
not an accent. Gold is the single accent — `--gold-400 #D9B341` fills the one
primary action, `--gold-300 #E6C65C` is accent type on navy,
`--gold-600 #A67C1A` is accent type on cream. Cream `--cream-50 #FBF9F4`
carries light bands. That is the whole everyday palette: **navy, gold, cream.**
Maximum two background colours per page.

Saturated colour appears in exactly one place: the **Human Values spectrum**,
read off the crest petals — Truth red `#D42128`, Right Conduct orange
`#F07020`, Peace blue `#1B4FA8`, Love green `#0C7A3F`, Non-Violence purple
`#5C2D91`. These are semantic, never decorative. A value colour used for
anything other than that value is off-brand.

Silver `--silver-400 #C9CED6` is jubilee-only. Uniform purple `#5B2A7E` and
lilac `#C9A7D6` are not UI colours — they exist in the tokens because they
recur in every photograph and must not be fought.

**Type.** Two families. **Playfair Display** for everything display: heroes
(52–64px), section headings (32–40px), card titles (22px), the masthead school
name (serif caps at 0.05em), and quotations (italic). **Calibri** for
everything else: body 16/1.75, standfirst 18/1.75, captions 14, and all
uppercase eyebrows at 13px/0.14em. Display tracking is negative (−0.015em) and
line-height tight (1.08). Body line-height is generous (1.75) — the airiness is
what keeps a navy page from feeling heavy. No third face. The sibling conference
guide used Dancing Script; SRSS does not.

**Body ink is grey, never black — and never pure white.** Long-form copy on
cream sits at `--ink-600 #606671`, a cool slate; headings go the other way, to
`--navy-950 #07152F`, deeper than the navy ground. On navy, body copy is an
explicit light grey — `--silver-400 #C9CED6` — not white at reduced opacity, and
muted copy is `--silver-500 #9BA3AE`. Pure white is reserved for headings and
for the school name in the masthead. That split (grey body, high-contrast
heading) is what gives both the cream and the navy bands their calm.

**Gold foil.** The signature emphasis: a single accent word in a headline filled
with `--gradient-gold-foil` (a four-stop metallic, not a two-stop hue ramp) —
"**Character**" in the reference hero. The jubilee equivalent is
`--gradient-silver-foil` on "**25 Years**". Use once per view, on one word or
phrase. Never on body text.

**Backgrounds.** Full-bleed photography, always. The hero puts the photo on the
right 60% and lays `--gradient-hero-scrim` over it — a horizontal navy ramp
that holds the left column fully opaque and fades to clear. Story cards use
`--gradient-photo-foot`, a bottom-up navy ramp. Those two protection gradients
are *load-bearing*: they are what guarantees 4.5:1 text contrast over an
unknown image, so type over photography always sits on one. No repeating
patterns, no textures, no hand-drawn illustration, and **no aggressive
decorative gradients** — the sibling conference material is full of purple-to-coral
washes and that is precisely the house style SRSS moved away from.

**Imagery.** Warm Malaysian daylight, shot slightly wide, children mid-activity
rather than posed — assembly, silent sitting, a classroom experiment. Purple and
lilac uniforms give every photo a consistent cast that sits naturally against
navy. No grain, no duotone, no black and white. Portraits are studio shots on
neutral grey, cropped at the shoulder. Photos are never rounded and never
bordered.

**Geometry and corners.** SRSS is squared-off. Photography, bands, panels and
story cards have **zero** radius. Controls take `--radius-sm 4px`; panels
`--radius-md 6px`. Pills (`999px`) exist for exactly two things: `Badge`
and the footer's circular social buttons. Nothing else is rounded.

**Cards.** Mostly there are no cards. Content groups are separated by
**hairlines** — `1px` `--cream-300` on light, `rgba(255,255,255,.16)` on
navy — and by whitespace. The three-pillar row, the audience router, the values
list and the timeline are all hairline-divided, not boxed. Where a true card is
needed (the admissions form) it is white, square, and carries
`--shadow-md`, no border. Never a rounded card with a coloured left border.

**Shadows.** Rare and soft, tuned to navy rather than black:
`--shadow-xs` through `--shadow-lg` at `rgba(10,26,60,…)`.
`--shadow-gold` (a warm 22px glow) appears only under a hovered primary
button. Inner shadows are used only as hairline substitutes
(`--shadow-inset-hairline`).

**Borders and rules.** `1px` hairlines separate; `2px` rules emphasise. The
2px vocabulary: gold underline under the active nav item, gold left rule beside
a pull-quote, gold underline under an `ArrowLink`, and a coloured top rule on a
`Notice`. **Never** a coloured left-border stripe on a card. The
`ValueSpectrum variant="rule"` — a 4–6px gradient hairline of the five value
colours — is the system's section divider and the footer's opening gesture.

**Transparency and blur.** Sparingly, and only on navy. On-navy secondary
surfaces are `rgba(255,255,255,.06)`; hover washes `rgba(255,255,255,.10)`;
hairlines `rgba(255,255,255,.16)`. Text opacity is used for hierarchy on navy
(`.80` body, `.58` muted) but **never** on gold or on light grounds — accent
type is always full-opacity ink. Blur (`--blur-glass 14px`) is reserved for a
sticky masthead over scrolling photography; it is not a decorative material.

**Motion.** Quiet and quick. `--ease-out cubic-bezier(.22,.61,.36,1)` for
controls at `--dur-fast 140ms`; `--dur-base 220ms` for arrows and rules;
`--dur-slow 420ms` for image scale; `--dur-reveal 640ms` with
`--ease-entrance` for scroll-in fades (opacity + 16px rise). No bounce, no
spring, no parallax, no counting-up numbers. `prefers-reduced-motion` is
honoured globally in `tokens/base.css`.

**Hover states.** Gold **lightens** (`gold-400 → gold-300`) and gains
`--shadow-gold`. Navy buttons lighten (`navy-800 → navy-700`). Quiet
controls take a cream or 10%-white wash — never an opacity change. Trailing
arrows translate 3–4px right. `ArrowLink` rules grow from 72% to 100% width.
Photographs scale to `--image-zoom 1.035`. Nav items go white → gold.

**Press states.** Gold **deepens** (`gold-400 → gold-500`), navy deepens to
`navy-900`, and the control shrinks to `--press-scale 0.985`. No colour
inversion.

**Focus.** A `2px` `--gold-300` outline at `2px` offset — set globally, so
it applies to anything focusable. Form fields additionally take a gold border
and a `3px rgba(217,179,65,.25)` glow. Never the browser's blue ring.

**Layout.** `--container-max 1280px` centred, `--gutter 24px` (48 at large).
Vertical rhythm is `--section-y 96px` top and bottom of every band; alternate
navy and cream bands down the page. The fixed furniture is a
`--ticker-h 38px` announcement strip on `--navy-900` above a
`--header-h 104px` masthead on `--navy-800`. Heroes are at least 560px tall.
Photo triptychs and audience routers run full-bleed, edge to edge, with no
container padding — the hairlines between cells do the structuring.

**Contrast floor.** Body text meets 4.5:1; display type meets 3:1 minimum but in
practice runs white-on-navy at 14:1. Gold type on navy (`gold-300` on
`navy-800`) is used at 13px+ semibold or larger only. Gold on cream uses
`gold-600`, never `gold-400`.

---

## ICONOGRAPHY

**No icon assets were supplied.** The reference captures show a thin,
round-capped, ~2px-stroke outline set — magnifier, hamburger, arrow-right,
arrow-up-right, chevron-right, chevron-down, pause/play, and circular social
glyphs in the footer.

**Substitution (flagged):** the outline set is **Lucide** — the closest
available match in stroke weight and cap style — plus four **Simple Icons**
brand glyphs (instagram, facebook, youtube, whatsapp) for the footer social row.
The SVG sources live in `assets/icons/` and their geometry is **inlined** into
`components/icons/Icon.jsx`, so every glyph inherits `currentColor` with no
network request. See `components/icons/icons.card.html` for the full set.

Rules:
- **Never hand-roll an SVG icon.** Add a Lucide slug instead.
- **Never use emoji as an icon.** Not in UI, not in slides, not in documents.
- **Unicode as glyph** is permitted in exactly one place: the mathematical
  infinity `∞` as a display figure in a `StatBlock` (it appears in the
  organisation's wider visual language). Not in body copy.
- Icons are 16px inline, 20px default, 22–24px in the masthead. Always paired
  with a label except in the masthead (search, menu) and footer socials, where
  an `aria-label` is mandatory.
- Icons never carry their own colour — they take the colour of the text beside
  them.

**If the school has a real icon set, send it.** Drop the SVGs into
`assets/icons/` and the `ICONS` map in `Icon.jsx` is the only file to change.

---

## Logos and assets

| Asset | Use |
|---|---|
`assets/logo-srss-crest.png` | Official school crest. Everyday identity. Never redraw, recolour, stretch or rotate. Clear space ≥ ½ the crest diameter. Below 40px use the mark alone — the ring type stops being legible. |
| `assets/logo-srss25-jubilee.png` | Silver Jubilee emblem. Jubilee surfaces only, always *alongside* the crest on official material, never instead of it. Minimum 48px. |
| `assets/photo-*.png` | School photography (4 images) — assembly singing, silent sitting, classroom, meditation. |
| `assets/portrait-staff-0*.png` | Two studio portraits for interview and leadership contexts. |
| `assets/photo-flag-*.png` | The school flag (3 images) — flying against sky, and hoisted at assembly. |
| `assets/photo-pledge-mic.png` | A pupil at the microphone leading the pledge, right hand raised, flags and school building behind. The pledge hero. |
| `assets/icons/` | 46 SVG glyph sources — Lucide outline set plus four Simple Icons brand marks. Geometry is inlined into `Icon.jsx`; these are kept for provenance and for adding glyphs. |
| `assets/reference-*.png` | The two rendered references this system was reconstructed from. Keep for provenance; do not ship. |

No vector (SVG/EPS) artwork was supplied — both marks are raster PNGs with
transparent grounds. **Please send vector versions of the crest and the jubilee
emblem** for print and large-format use.

---

## Fonts — substitution flagged

**Playfair Display** (display) is loaded from Google Fonts. The body face is
**Calibri**, confirmed by the brand owner.

Calibri ships with Microsoft Office, so it renders locally on most authoring
machines — but it is **not licensed for web serving**, and no font files were
supplied. So there is deliberately **no `@font-face` for Calibri**: the token
points at `"Calibri"` and falls back to the system sans
(`-apple-system`, `Segoe UI`) for visitors without it. No look-alike family is
substituted in its place.

**Action for the brand owner:** if SRSS holds a Calibri webfont licence, upload
the files (`.woff2`) — drop them into `assets/fonts/`, add the `@font-face`
rules to `tokens/fonts.css`, and nothing else changes. Until then, expect the
body face to vary slightly between machines. If the school holds licensed files, drop them into
`assets/fonts/` and replace that file's `@import` with local `@font-face`
rules — nothing else needs to change.

---

## Index

### Root
- `styles.css` — the single entry point consumers link. `@import` lines only.
- `readme.md` — this file.
- `SKILL.md` — Agent Skills front-matter wrapper.
- `thumbnail.html` — homepage tile.

### `tokens/`
`fonts.css` · `colors.css` · `typography.css` · `spacing.css` ·
`elevation.css` · `motion.css` · `base.css`

> **Naming rule:** `--text-*` splits by role. Sizes carry an explicit step
> suffix — `--text-body-lg / -md / -sm` — while the bare `--text-body` is the
> **colour** alias (as are `--text-heading`, `--text-muted`, `--text-accent`).
> Never declare a size on a bare `--text-<role>` name: both files land on
> `:root`, the later `@import` wins, and every `color: var(--text-body)`
> silently becomes an invalid declaration.

### `guidelines/` — foundation specimen cards
**Colors:** navy · gold · cream & ink · Human Values spectrum · silver & uniform
purple · gradients.
**Type:** display · body · eyebrows & micro-labels · serif caps · quotation
style · full scale.
**Spacing:** scale · corner radii · layout rhythm.
**Brand:** school crest · Silver Jubilee emblem · photography · elevation &
hairlines · interaction states.

### Components — 25, in six groups

**`components/icons/`**
- **Icon** — masked Lucide glyph inheriting `currentColor`.

**`components/actions/`**
- **Button** — primary gold / outline / outline-ink / ghost / solid.
- **ArrowLink** — text CTA with a growing gold rule.
- **IconButton** — square or circular glyph-only control.

**`components/brand/`**
- **Crest** — official seal with bilingual name lockups.
- **JubileeMark** — SRSS25 emblem, optionally with the jubilee line.
- **Wordmark** — type-only lockup for small or flat contexts.

**`components/content/`**
- **Eyebrow** — uppercase gold kicker.
- **SectionHeading** — eyebrow + Playfair title + gold accent line + standfirst.
- **PillarCard** — a column in the hairline-divided pillar row.
- **StoryCard** — photography with a navy foot gradient and type over it.
- **StatBlock** — big serif figure with a gold label, optional metal foil.
- **PullQuote** — italic serif quotation with a gold rule.
- **ValueSpectrum** — the five Human Values as a row, a rule, or a stack.
- **AudienceLink** — a cell of the four-up audience router.

**`components/navigation/`**
- **UpdatesTicker** — dated announcement strip above the masthead.
- **SiteHeader** — the SRSS masthead.
- **SiteFooter** — navy footer with contact table and link columns.
- **Breadcrumbs** — interior-page trail.

**`components/forms/`**
- **Input** — labelled text field with a gold focus ring.
- **Select** — native select matched to Input.
- **Checkbox** — 20px square, gold when checked.

**`components/feedback/`**
- **Badge** — small uppercase status pill.
- **Tag** — filterable topic chip.
- **Notice** — inline message band with a coloured top rule.

### `ui_kits/srss_website/`
Click-through recreation of the public site: Home, Values, Silver Jubilee,
Admissions & Visits, Community · Stories, and **Resources · Songs, Pledge &
Prayers** (also served standalone as `songs-and-prayers.html`). See its own
`README.md` for what is copied from reference versus composed.

The Songs & Prayers page holds the school's liturgy verbatim as supplied: the
assembly order (silent sitting → Negaraku → SRSS anthem → Rukun Negara → pledge
→ prayers), a working two-minute silent-sitting timer, an embedded Negaraku
recording, the SRSS anthem with a Bahasa Melayu / English-meaning toggle, the
five-value school pledge, and the four prayers — Universal, Food, Peace and
Surrender — as a tabbed reader. **The anthem's English text is an unofficial
reading for meaning, not a singing translation**, and is labelled as such on the
page.

### `templates/`
- `srss-page/SrssPage.dc.html` — a blank SRSS page shell (ticker, masthead,
  hero, cream band, footer) for consuming projects to start from.

### Intentional additions
- **Icon** — no icon primitive existed in the sources; one wrapper was needed so
  the substituted Lucide set stays swappable from a single file.
- **Wordmark** — no type-only lockup was supplied, but the crest is illegible
  below 40px and small contexts need *something*; it uses only brand type.

---

## Open questions for the brand owner

1. **Vector artwork** for the crest and the jubilee emblem.
2. **Licensed font files**, if Playfair Display / Poppins are held under licence.
3. **A real icon set**, if one exists — otherwise Lucide stays.
4. Whether the sibling **MySAIYa Digital Hub** should become a second UI kit in
   this system, or live in its own.
5. Confirmation of the crest's **value-to-colour mapping** (Truth red, Right
   Conduct orange, Peace blue, Love green, Non-Violence purple) — read from the
   crest artwork, not from a written spec.
