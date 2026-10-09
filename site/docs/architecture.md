# SRSS Online System — Dual-Plane Architecture

Status: alignment baseline, 10 Oct 2026. It reconciles the *Dual-Plane Platform* brief (public web presence + secure role-based hub + Google Workspace backbone) with the Digital Hub PRDs, [`SITEMAP.md`](../SITEMAP.md) and what is already built. Decisions are recorded in the Decisions section below.

## The three planes

| Plane | Purpose | Built on | Owns |
|---|---|---|---|
| **1. Public web presence** | Community trust, Sathya Sai Educare (Head, Heart, Hands), the 25th Anniversary, admissions/alumni/donor engagement | React + Vite pages, content from Firestore CMS collections | Public pages, news, events, public achievements, public FAQs, enquiry intake |
| **2. Secure role-based hub** | One profile-centred place for Students, Parents, Teachers and Admin/Staff: records, attendance, notices, communication | React + Vite `/hub`, Firebase Auth, Firestore + Security Rules, Cloud Functions | Identity relationships, SIS, attendance, consent, portfolio metadata, workflow status, permissions, audit |
| **3. Google Workspace backbone** | Day-to-day productivity with little custom software to maintain | Classroom, Meet, Drive, Calendar, Groups, Gmail, Forms, Sites, Vault | Documents and media, lessons and homework, meetings, mail and groups, legal retention |

### Boundary rules (what makes the planes safe together)

1. **One identity.** Staff and students sign in with their school Google account; parents with email + password or email link. The hub's role and scope (Firebase custom claims + server-derived `users/{uid}`) decide what each person sees. Google Groups/OUs are derived from the same records, not maintained separately.
2. **One system of record per fact.** Child, guardian, enrolment, attendance, consent and admissions status live in Firestore. Workspace tools hold files and collaboration, and the hub stores links/IDs to them. A Google Sheet may be a *read-only report* of hub data, never the source of truth.
3. **Sensitive data never leaves the governed plane.** Medical disclosures, safeguarding notes, pastoral notes, fees and consent records stay in Firestore under restricted rules — not in Forms responses, Sheets or shared Drive folders.
4. **Public is opt-in.** Nothing crosses from plane 2 to plane 1 without status `published` plus, for pupils, recorded consent and moderation (CON-002).

## Brief → current state

✅ built and verified · 🟡 partly built / planned in a PRD phase · ⚠️ conflicts with an earlier decision or needs a policy choice

### Plane 1 — public pages

| Brief page | State | Notes |
|---|---|---|
| Home `/` — marquee with pause/play, hero "The End of Education is Character", dual CTA, audience pathways, core pillars, calendar, tour booking, search | ✅ most elements live | Marquee, hero, role router, Values Garden, FAQ, Stories & Happenings, calendar, visit modal and search exist. ⚠️ Brief has a 4-card pathways grid (Parents/Students/Teachers/Community); the approved router has 5 roles incl. Admin and "Exploring the school". Per D5 the commemorative badge and timeline live on `/srss25`; the homepage keeps one SRSS25 band. |
| About `/about` — story, 3HV, Five Values in BM/Tamil/Chinese/English, leadership & board, accreditation pack, campus map | 🟡 | `/about`, `/about/voices`, `/about/inspiration` exist. Leadership directory, multilingual values, campus map and Drive-hosted profile pack are new content. |
| Learning `/learning` — KSSR matrix Std 1–6, values integration, daily practices, co-curricular, library/remedial, Sites showcases | 🟡 | Currently a homepage anchor; becomes a page when content is ready. |
| Student Life `/student-life` — assembly, vegetarian dining, competitions, houses & prefects, media gallery | 🟡 | Life at SRSS carousel and Prayer/Pledge/Anthem page exist. Gallery must show only consented media. |
| Admissions `/admissions` — why SRSS, 4-step stepper, fees & sponsorship, FAQ, application form, age calculator | 🟡 | Hub side done: applications pipeline and enrolment without re-keying (`enrolApplication`). Per D4 the application is a hub form; Sheets gets a read-only report. |
| Community `/community` — PTCA, alumni circle, donors & impact, volunteers | 🟡 ⚠️ | Added to the top navigation by D1. Gift-aid/donation needs a payment and receipting decision. |
| Resources `/resources` — calendar, document vault, emergency directory | 🟡 | `/resources/prayer-pledge-anthem` and `/faq` exist. Calendar and downloads are planned. |

### Plane 2 — hubs

| Brief module | State | Where / phase |
|---|---|---|
| Profile header per role; linked-children selector | ✅ | Shell + `ChildSwitcher` |
| **Student** — timetable | 🟡 | Weekly slots exist on teacher assignments; full timetable is Phase 2 |
| Student — Classroom assignment stream | 🟡 | Phase 1: deep links to Classroom. Phase 2: Classroom API (needs per-user OAuth; internal app trust in the Workspace domain avoids public verification) |
| Student — values reflection ("My Educare Journey") | 🟡 | `studentReflections` collection and rules exist; form is next |
| Student — house points | ⚠️ | New. Allowed for effort/participation/punctuality; values themselves stay observations, never points (PRD rule) |
| Student — Workspace quick bar | 🟡 | Per-route `google` metadata already lists the services |
| **Parent** — attendance tracker | ✅ list view | Monthly heat-map is a presentation upgrade |
| Parent — PBD TP1–TP6 + character development | 🟡 ⚠️ | Assessments are Phase 2. Character development shows teacher observations, not ratings |
| Parent — notices & consent slips | ✅ / ⚠️ | Announcements and grouped Actions Required done; consent must be the hub's append-only form, not Google Forms (D4) |
| Parent — message teacher / book Meet | 🟡 | Messages + appointments planned (Phase 1–2) |
| Parent — canteen menu & allergy records | 🟡 | Menu = content. Allergies are medical data: own child only, restricted |
| **Teacher** — roster & quick roll-call | ✅ | Default Present, exceptions only; parents notified of absence |
| Teacher — PBD grading + MoE export | 🟡 | Phase 2 gradebook; export format to confirm with the school |
| Teacher — Classroom station, Drive lesson repository | 🟡 | Links Phase 1, API Phase 2 |
| Teacher — pastoral notes | 🟡 | `studentIncidents`/support plans with restricted classification (Phase 2) |
| **Admin** — admissions funnel | ✅ | Pipeline by stage; capacity per Standard to add |
| Admin — Workspace account lifecycle (OUs) | 🟡 | Phase 1 step 1 (Roles & access) + Admin SDK provisioning |
| Admin — emergency broadcast | 🟡 ⚠️ | Portal banner + email (Groups) feasible; SMS needs a paid gateway (D6) |
| Admin — governance & Vault | ✅ audit trail / 🟡 Vault | Vault availability depends on the Workspace edition (D3) |

### Interactive elements

| Element | Plan |
|---|---|
| Role Simulator Bar | Build as **local-demo only** (shown when `VITE_USE_EMULATORS=true`, switching between the seeded demo accounts). Never in production: switching views without signing in would bypass authentication. |
| Silent Sitting timer | Public/student widget; respects `prefers-reduced-motion`, audio only after a tap |
| Admissions age calculator | Rules live in `settings/admissions`, not code: standard entry is age 7, and from the 2027 session KPM allows optional Year 1 entry at 6. Shows guidance, not a placement decision |
| Document filter/search | Reuse `DataTable` filtering over a `documents` collection with Drive links |
| Silver Jubilee timeline | Part of `/srss25`, content-driven |
| Tour booking modal | Writes an `admissionEnquiries` record; slot capacity from a calendar collection; confirmation e-mail by Function |

## Decisions

Confirmed by the user on 10 Oct 2026 unless marked *proposed*.

| # | Question | Outcome |
|---|---|---|
| **D1** | Public navigation: brief vs PRD | **Merged:** About · Learning · Student Life · Admissions · Community · SRSS25, with utility links Calendar · Downloads · News · Contact, and Sign in. `SITEMAP.md` updated. The live header changes only as a separate, approved design change. |
| **D2** | Hub URLs `/portal/{role}` vs `/hub/{role}` | **Done:** `/hub/*` kept; `/portal/*` aliases added (user approved 10 Oct 2026). |
| **D3** | Workspace edition | **Open — confirm with the school.** The plan stays edition-neutral. Google for Nonprofits excludes schools (only a separate philanthropic arm, e.g. a foundation or alumni trust, qualifies); Google Workspace for Education Fundamentals is the usual school edition and includes Classroom and Vault. Features that depend on the edition (Vault, Classroom API, under-18 controls) are flagged in the plan. |
| **D4** | Forms/Sheets as admissions CRM and consent store | **Hub + Sheets report.** Applications (incl. medical disclosures) and consent are submitted in the hub, tied to a verified guardian and child, append-only and audited. Staff get a scheduled read-only Google Sheets export. Google Forms only for low-risk public intake (tour interest, alumni, volunteer sign-ups). |
| **D5** | Anniversary badge on the homepage | **Band links to `/srss25`.** The homepage stays restrained with one Silver Jubilee band; badge, 2002–2027 timeline, archival photos and gala registration live on the SRSS25 pages. |
| **D6** | Emergency broadcast over SMS | *Proposed:* launch with portal banner + email to Groups; add SMS only with a budgeted provider. |

## Consolidation the brief implies

- **Legacy prototype plane — retired 10 Oct 2026.** The JSON-file API in `server.mjs`, the `/admin` CMS modal and the `/parent-hub` prototype (whose login accepted any e-mail) are gone. Public pages now read published content from Firestore and send enquiry/contact forms to `admissionEnquiries` / `contactMessages` through the REST API (`src/lib/publicContent.js`, no Firebase SDK on public pages). Staff edit news, public events and homepage/About/FAQ copy in **Admin → Content** (drafts in `pageDrafts`, published copy in `pages`) and read contact messages in **Admin → Website inbox**. `/admin`, `/parent-hub` and `/portal/{role}` redirect into the hub; the homepage role router and Parent Hub links open `/hub/{role}` (sign-in first). `scripts/import-legacy-content.mjs` moves the old `data/srss-db.json` content into Firestore (`npm run seed` does this locally). `server.mjs` is now only a static preview of `dist/`.
- **Facts to confirm with the school before publishing** (they appear in the brief but are not yet verified): house names (Sathya, Dharma, Shanti, Prema), class naming, Dharma Institute history and Batu 6 Jalan Puchong address, `srss.edu.my` domain, accreditation details, fee and sponsorship policy, co-curricular list.

## Performance budget ("ultra-modern, high-performance")

| Measure | Target | Today |
|---|---|---|
| Largest Contentful Paint (mobile, 4G) | ≤ 2.5 s | Not measured; several public images are multi-MB PNGs |
| Interaction to Next Paint | ≤ 200 ms | — |
| Public JS (gzip, first load) | ≤ 150 kB; Firebase never loaded on public pages | Firebase already isolated to hub routes |
| Hub route chunk (gzip) | ≤ 120 kB per screen group | One 217 kB gzip chunk → split per hub with `React.lazy` |
| Images | AVIF/WebP, responsive `srcset`, ≤ 250 kB hero | Processed set exists; originals still referenced in places |
| Accessibility | WCAG 2.2 AA, 48 px touch targets | Hub components follow this |

Hosting on Firebase Hosting (CDN, HTTP/2/3, immutable hashed assets) with one-shot Firestore reads keeps running costs within free allowances at school scale.
