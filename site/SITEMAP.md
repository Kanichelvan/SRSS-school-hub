# SRSS Digital Hub — Information Architecture

Status: planning baseline, aligned on 9 Oct 2026 with the *SRSS Digital Hub Master PRD & Developer PRD v1.0* and the *SRSS25 Digital Hub PRD* (final navigation model, §2–3), and on 10 Oct 2026 with the *Dual-Plane Platform* brief (see [`docs/architecture.md`](docs/architecture.md) for the three planes, system-of-record rules and decisions D1–D6). It defines the intended navigation and URL contract; it doesn't mean every route is built yet. Secure-hub routes are implemented as metadata in `src/hub/routes.js`.

**Product identity:** *SRSS Digital Hub — the digital home of Sekolah Rendah Sathya Sai.* SRSS25 (the Silver Jubilee, 2027) is the launch occasion, not the product name.

## Architecture decisions

- Dual-plane platform on a Google Workspace backbone: a public website (trust, Sathya Sai Educare, the Silver Jubilee, admissions/alumni/donor engagement) and a secure, role-based hub, with Workspace as the productivity layer. After sign-in the public navigation is replaced by an application shell.
- One secure entry point: `/sign-in`. `/hub` redirects to the user's highest-privilege dashboard; people with several roles switch with the role switcher (AUTH-001).
- Access is enforced by Firestore security rules and server-derived scope, never by hidden navigation (PRD §43–44). A user's ability to discover a record never exceeds their permission to read it.
- Google Workspace is the productivity layer (Drive, Docs, Classroom, Calendar, Meet, Gmail, Forms, Groups). The hub owns identity relationships, the SIS, attendance, portfolio metadata, consent status, workflow status, permissions and audit.
- Create standalone public routes only for content with a clear audience, durable owner and enough material to maintain; use anchored sections until then.
- SRSS25 gives the anniversary a major presence without anniversary branding permanently dominating the site.
- Library & Resource Centre is a future domain; it must not delay the Jubilee launch.

## Public website

### Primary navigation (user-supplied IA, 10 Oct 2026 — supersedes D1)

**About · Academics · Admissions · Student Life · Resources · Hubs**, plus search and the **Admissions & Visits** action. Desktop shows a drop-down panel per menu; phones and tablets use an accordion drawer. Menu data lives in `src/data/navigation.js`.

| Menu | Items (→ current destination; *Soon* = planned page, shown but not linked) |
|---|---|
| About | Welcome — Principal’s message (→ `/about/voices#principal`) · Our history (→ `/about#who-we-are`): Sathya Sai Baba (→ `/about/inspiration`), SSIOM (→ `/about/inspiration#organisation`) · Our vision & mission (→ `/about#vision-mission`): Human Excellence, Character development (→ `/about#educare`), Values integration & academics (→ `/#learning`) · Our community (→ `/about#our-people`): Management & governance, Staff, Parent–Teacher Association (*Soon*), Alumni (→ `/about/voices#alumni`) · Facilities (→ `/about#campus`): SRSS spaces, Address & contact (→ `/#contact`), A day at SRSS (→ `/resources/prayer-pledge-anthem`), Uniform, transport & meals (→ `/faq`) |
| Academics | Curriculum & academic pathway, Learning labs (→ `/#learning`) · Assessment structure (→ `/faq`) · Co-curricular and Enrichment activities (→ `/#school-life`) |
| Admissions | Apply now, Registration (→ `/#enquiry`) · Admission process (→ `/#admissions`) · Entry requirements, Fee structure (→ `/faq`) · Refund policy (*Soon*) · Open house (→ calendar) · Contact details (→ `/#contact`) · Visit SRSS (opens the visit form) |
| Student Life | Morning assembly, Well-being (→ `/resources/prayer-pledge-anthem#silent-sitting`) · Prayer & pledge (→ `…#prayers`) · Dress code, Leadership (*Soon*) · Achievements (→ `/#news`) · Facilities usage (→ `/about#campus`) |
| Resources | Forms (→ `/hub/forms`) · Useful links, Parents’ handbook (*Soon*) · Calendar, Monthly events (→ calendar) · News (→ `/#news`) |
| Hubs | Student Hub · Teachers Hub · Parents Hub · Admin Hub (→ `/hub/{role}`, sign-in first) |

Pages still to create so every item has its own home: Parent–Teacher Association, Refund policy, Dress code, Leadership, Useful links, Parents’ handbook, and dedicated pages for Fees, Entry requirements, Assessment, Uniform/transport/meals, Co-curricular and Enrichment (currently FAQ or homepage sections).

### Homepage — `/`

Recommended sequence (PRD §9): hero · SRSS identity / Human Excellence · why SRSS · learning at SRSS · Human Excellence / Educare · student experience · learning and growth stories · achievements · latest news · upcoming events · SRSS25 feature · admissions CTA · footer.

The existing approved homepage elements (role router, Values Garden, FAQ preview, Stories & Happenings, Life at SRSS carousel) map onto this sequence; see `AGENTS.md` for their recorded design decisions. The role router sends unauthenticated visitors to `/sign-in` and signed-in users to their dashboard (PUB-001).

### Routes

| Section | Routes |
|---|---|
| About | `/about` · `/about/our-story` · `/about/vision-mission` · `/about/human-excellence` · `/about/sathya-sai-educare` · `/about/leadership` · `/about/teachers` · *existing:* `/about/voices`, `/about/inspiration` |
| Learning | `/learning` · `/learning/curriculum` (KSSR) · `/learning/standard-1` … `/learning/standard-6` · `/learning/learning-support` (incl. Learning Studio) |
| Student Life | `/student-life` · `/student-life/activities` · `/student-life/human-values` · `/student-life/service` · `/student-life/sports-arts` · `/student-life/achievements` · `/student-life/showcase` (moderated, consented portfolio work only) |
| Admissions | `/admissions` · `/admissions/why-srss` · `/admissions/how-to-apply` · `/admissions/fees` · `/admissions/faq` · `/admissions/visit` · `/admissions/enquire` |
| Community | `/community` · `/community/ptca` · `/community/alumni` · `/community/supporters` (donors, impact reports) · `/community/volunteer` |
| News & Events (utility) | `/news` · `/news/:slug` · `/events` |
| Resources (utility) | `/resources` (public calendar, document vault with search/filter, emergency & key contacts) · *existing:* `/resources/prayer-pledge-anthem` · `/faq` |
| Contact | `/contact` |
| SRSS25 | `/srss25` (commemorative badge, 2002–2027 timeline, archival photos, gala registration — the homepage carries one band linking here, decision D5) · `/srss25/our-25-years` · `/srss25/timeline` · `/srss25/stories` · `/srss25/alumni` · `/srss25/celebrations` · `/srss25/legacy` |
| Utility | `/sign-in` · `/verify/:certificateCode` (public certificate check, safe fields only) · `/search` (public content only) |

Current implementation note: `/contact`, `/learning`, `/admissions` and `/news` currently resolve to homepage anchors; they become pages as content and owners are ready.

### Public content rules

- Public pages come from the CMS (`pages`, `newsPosts`, `publicAchievements`), each with an owner, approver, status and review date: Draft → Review → Approved → Published → Archived (PUB-002).
- Student media is published only with recorded consent and moderation (CON-002). Alumni information is never public merely because it was collected.
- Public events must be intentionally marked public.
- Admissions applications and consent are hub forms tied to a verified guardian and child (D4). Google Forms is used only for low-risk public intake (tour interest, alumni and volunteer sign-ups); staff reporting uses a read-only Sheets export.

## Secure hub — `/hub`

Shared navigation: **Dashboard · Announcements · Calendar · Messages · Forms & Actions · Notifications · Search** (+ Profile, Help). Everything else is role-filtered.

| Hub | Navigation (PRD final model) | Routes |
|---|---|---|
| Teacher | My Classes · Attendance · Teaching · Assessments · Students · Portfolios · Parents · Resources | `/hub/teacher`, `/hub/teacher/{classes,attendance,attendance/:classId,teaching,assessments,students,portfolios,parents,resources}` |
| Parent | My Children · Progress · Attendance · Portfolio · Tasks · Reports · Fees · Meetings | `/hub/parent`, `/hub/parent/{children,progress,attendance,portfolio,tasks,reports,fees,meetings}` |
| Student | Today · My Learning · My Portfolio · My Progress · Achievements | `/hub/student`, `/hub/student/{learning,portfolio,progress,achievements}` |
| Admin | Students · Staff · Academics · Admissions · Attendance · Assessments · Communications · Consent · Showcase · Content · Fees · Assets · Reports · Governance · Settings · Roles & access | `/hub/admin`, `/hub/admin/{students,staff,academics,admissions,attendance,assessments,communications,consent,showcase,content,fees,assets,reports,governance,settings,roles}` |
| Shared | Student 360° profile | `/hub/students/:studentId` (tabs filtered by role — SIS-002) |

Aliases from the Developer PRD: `/login` → `/sign-in`; `/dashboard/{role}` → `/hub/{role}`. Proposed (D2): `/portal/{role}` → `/hub/{role}` from the Dual-Plane brief.

Admin-hub roles: School Administrator, Headmistress/Leadership, Academic Coordinator, Admissions Officer, Finance Officer, Safeguarding Lead, Privacy/Consent Steward, Portfolio Moderator, Content Editor, Technical Administrator. Each sees only the admin modules their role allows.

## Release phases

| Phase | Scope |
|---|---|
| 0 — Foundation | Sitemap, role matrix, academic structure, record cleanup, Google account/OU/group structure, Shared Drives, consent framework, classification, design system, Firestore schema, content ownership |
| 1 — Jubilee launch | Public site, SRSS25, CMS, authentication, role dashboards, SIS, guardian linking, staff directory, academic setup, announcements, calendar, Forms & Actions, consent, basic attendance, basic portfolio, Human Excellence record, admissions, Workspace links |
| 2 — Learning & growth | Timetable, teaching/planning, assessments & gradebook, report cards, parent–teacher meetings, learning support, incidents, fees-lite, staff HR, certificates, Classroom integration |
| 3 — Operations / later | Assets, library & student librarians, advanced analytics |

Explicit non-goals for launch: payroll, accounting ledger, procurement ERP, multi-school SaaS, transport GPS, RFID, biometrics, native apps, full LMS, predictive child-risk AI, SMS-dependent authentication.

## Definition of ready for each page

Named audience and content owner · canonical route and navigation parent · approved copy, assets and calls to action · mobile, keyboard and WCAG 2.2 AA behaviour · empty, loading, error and success states · page title and metadata · integration owner and privacy review where applicable · acceptance criteria and realistic sample data.
