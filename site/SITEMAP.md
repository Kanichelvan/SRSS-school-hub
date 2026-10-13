# SRSS Digital Hub — Information Architecture

Status: **Website Architecture v2.0 adopted 13 Oct 2026** (public section below); originally aligned on 9 Oct 2026 with the *SRSS Digital Hub Master PRD & Developer PRD v1.0* and the *SRSS25 Digital Hub PRD* (final navigation model, §2–3), and on 10 Oct 2026 with the *Dual-Plane Platform* brief (see [`docs/architecture.md`](docs/architecture.md) for the three planes, system-of-record rules and decisions D1–D6). It defines the intended navigation and URL contract; it doesn't mean every route is built yet. Secure-hub routes are implemented as metadata in `src/hub/routes.js`.

**Product identity:** *SRSS Digital Hub — the digital home of Sekolah Rendah Sathya Sai.* SRSS25 (the Silver Jubilee, 2027) is the launch occasion, not the product name.

## Architecture decisions

- Dual-plane platform on a Google Workspace backbone: a public website (trust, Sathya Sai Educare, the Silver Jubilee, admissions/alumni/donor engagement) and a secure, role-based hub, with Workspace as the productivity layer. After sign-in the public navigation is replaced by an application shell.
- One secure entry point: `/login` (`/sign-in` is an alias). `/hub` redirects to the user's highest-privilege dashboard; people with several roles switch with the role switcher (AUTH-001).
- Access is enforced by Firestore security rules and server-derived scope, never by hidden navigation (PRD §43–44). A user's ability to discover a record never exceeds their permission to read it.
- Google Workspace is the productivity layer (Drive, Docs, Classroom, Calendar, Meet, Gmail, Forms, Groups). The hub owns identity relationships, the SIS, attendance, portfolio metadata, consent status, workflow status, permissions and audit.
- Create standalone public routes only for content with a clear audience, durable owner and enough material to maintain; use anchored sections until then.
- SRSS25 gives the anniversary a major presence without anniversary branding permanently dominating the site.
- Library & Resource Centre is a future domain; it must not delay the Jubilee launch.

## Public website — Architecture v2.0 (definitive, 13 Oct 2026)

Three experiences share one design language and one domain, but not one navigation:

1. **Institutional website**: who SRSS is, its philosophy, learning, student life and admissions.
2. **Community website**: events, news, alumni, volunteers and resources.
3. **Secure Digital Hub**: role-based services behind `/login`.

The public site reads like a premium school website. The hub works like a well-organised school portal. Each public page has one purpose:

| Section | Its one question |
|---|---|
| About SRSS | Who are we? |
| Learning | How do we educate? |
| Student Life | What do children experience? |
| Join SRSS | How can I become part of the community? |
| Resources | Where can I find information? |
| Digital Hub | What do I need to do? |

### Navigation

**About SRSS · Learning · Student Life · Join SRSS · Resources · Sign In**, plus search and the **Admissions & Visits** action. The logo goes home.

- **Desktop:** the label opens the landing page, and the chevron beside it opens the mega-menu.
- **Phones:** an accordion drawer. Each group starts with "Explore {section}", and the drawer ends with Arrange a visit, Make an enquiry and Sign In.

Menu data lives in `src/data/navigation.js`.

| Menu | Groups (→ pages) |
|---|---|
| About SRSS | **Our School:** Our Story · School Profile · Campus. **Our Philosophy:** Vision & Mission · Sathya Sai Education. **Our Community:** Leadership & Governance · Our People. **Our Legacy:** Silver Jubilee |
| Learning | **Learning Foundations:** Curriculum · Learning Journey. **Our Programmes:** Human Values · Enrichment · Learning Environment. **Supporting Every Child:** Learning Support · Reading & Library |
| Student Life | **Experiences:** Events · Sports · Arts & Culture. **Growth & Achievement:** Student Leadership · Achievements · Service. **Explore:** Stories · Gallery |
| Join SRSS | **Admissions:** Why SRSS? · How to Apply · Fees · Book a Visit · Admissions FAQs. **Get Involved:** Alumni · Volunteer · Support SRSS · Parents & Community |
| Resources | **Information:** Calendar · News & Updates · Notices. **Documents:** Downloads · Policies. **Assistance:** FAQs · Contact |

Pages below the homepage show breadcrumbs. Search (header, Resources and the not-found page) looks across every page name and summary in the route map.

### Route map and content ownership

The source of truth is `src/data/siteMap.js`, and this table is generated from it. "Section of …" means the URL is already final, but its content currently lives as a section of the parent page, and the address scrolls straight to it. Promote a section to its own page only when there is enough verified content to justify one.

| URL | Page | Today | Content owner |
|---|---|---|---|
| `/` | Home | Own page | Content editor |
| `/about` | About SRSS | Own page | Leadership |
| `/about/our-story` | Our Story | Section of `/about#who-we-are` | Leadership |
| `/about/vision-mission` | Vision & Mission | Section of `/about#vision-mission` | Leadership |
| `/about/sathya-sai-education` | Sathya Sai Education | Own page | Leadership |
| `/about/leadership-governance` | Leadership & Governance | Own page | Leadership |
| `/about/our-people` | Our People | Own page | Leadership |
| `/about/school-profile` | School Profile | Section of `/about#school-profile` | School office |
| `/about/campus` | Campus | Section of `/about#campus` | School office |
| `/about/silver-jubilee` | Silver Jubilee | Section of `/about#srss25` | Content editor |
| `/learning` | Learning | Own page | Academic coordinator |
| `/learning/curriculum` | Curriculum | Section of `/learning#curriculum` | Academic coordinator |
| `/learning/learning-journey` | Learning Journey | Section of `/learning#learning-journey` | Academic coordinator |
| `/learning/human-values` | Human Values | Section of `/learning#human-values` | Academic coordinator |
| `/learning/enrichment` | Enrichment | Section of `/learning#human-values` | Academic coordinator |
| `/learning/reading-library` | Reading & Library | Section of `/learning#learning-environment` | Academic coordinator |
| `/learning/learning-support` | Learning Support | Section of `/learning#learning-environment` | Academic coordinator |
| `/learning/learning-environment` | Learning Environment | Section of `/learning#learning-environment` | Academic coordinator |
| `/student-life` | Student Life | Own page | Content editor |
| `/student-life/events` | Events | Section of `/student-life#events` | Content editor |
| `/student-life/sports` | Sports | Section of `/student-life#stories` | Content editor |
| `/student-life/arts-culture` | Arts & Culture | Section of `/student-life#stories` | Content editor |
| `/student-life/service` | Service | Section of `/student-life#stories` | Content editor |
| `/student-life/leadership` | Student Leadership | Section of `/student-life#stories` | Content editor |
| `/student-life/achievements` | Achievements | Section of `/student-life#stories` | Content editor |
| `/student-life/stories` | Stories | Section of `/student-life#stories` | Content editor |
| `/student-life/gallery` | Gallery | Section of `/student-life#gallery` | Content editor |
| `/join` | Join SRSS | Own page | Admissions officer |
| `/join/admissions` | Admissions | Own page | Admissions officer |
| `/join/why-srss` | Why SRSS? | Section of `/join/admissions#why-srss` | Admissions officer |
| `/join/how-to-apply` | How to Apply | Section of `/join/admissions#how-to-apply` | Admissions officer |
| `/join/fees` | Fees | Section of `/join/admissions#fees` | Admissions officer |
| `/join/book-a-visit` | Book a Visit | Section of `/join/admissions#how-to-apply` | Admissions officer |
| `/join/admissions-faq` | Admissions FAQs | Section of `/join/admissions#admissions-faq` | Admissions officer |
| `/join/get-involved` | Get Involved | Section of `/join#community` | School office |
| `/join/alumni` | Alumni | Section of `/join#alumni` | School office |
| `/join/volunteer` | Volunteer | Section of `/join#volunteer` | School office |
| `/join/support-srss` | Support SRSS | Section of `/join#support-srss` | School office |
| `/join/parents-community` | Parents & Community | Section of `/join#parents-community` | School office |
| `/resources` | Resources | Own page | School office |
| `/resources/calendar` | Calendar | Section of `/resources#calendar` | School office |
| `/resources/news` | News & Updates | Section of `/resources#news` | Content editor |
| `/resources/notices` | Notices | Section of `/resources#news` | School office |
| `/resources/downloads` | Downloads | Section of `/resources#downloads` | School office |
| `/resources/policies` | Policies | Section of `/resources#policies` | Privacy steward |
| `/resources/faq` | FAQs | Own page | School office |
| `/resources/contact` | Contact | Section of `/resources#contact` | School office |
| `/resources/prayer-pledge-anthem` | Before the First Bell | Own page | Academic coordinator |
| `/legal` | Legal & Policies | Own page | Privacy steward |

The secure hub uses `/login` (with `/sign-in` kept as an alias) and `/hub/student`, `/hub/parent`, `/hub/teacher` and `/hub/admin`; see the next section. Legal pages are `/legal`, `/legal/privacy`, `/legal/terms`, `/legal/cookies`, `/legal/acceptable-use`, `/legal/child-safeguarding` and the other policies in `src/legal/registry.js`.

**Redirects:** old addresses redirect permanently to their canonical URL, in the browser and as 301s in `firebase.json`: `/about/voices`, `/about/inspiration`, `/about/governance`, `/faq`, `/admissions`, `/news`, `/contact`, the four renamed legal pages and `/sign-in`. `tests/siteMap.test.mjs` checks that every menu link and redirect resolves.

### URL rules

- Lowercase, with hyphens between words, descriptive, and stable once published. A moved page gets a permanent redirect.
- One canonical URL per piece of content. Other pages link to it rather than copy it. Homepage previews and landing pages reuse the same blocks and FAQ records.
- All `/hub/*` routes enforce authentication and permissions in Firestore rules and Cloud Functions. Hiding a menu item is not access control.
- Create content once and display it wherever it's needed: one news and events store feeds the homepage, Student Life and Resources.

### Homepage — `/`

1. Announcement bar
2. Hero ("The End of Education is Character")
3. Welcome to Sekolah Rendah Sathya Sai ("Learning for Life. Growing in Human Excellence.") with Our Educational Promise (the four mission pillars → Vision & Mission)
4. Learning at SRSS (→ Learning)
5. Find your way · I am a… (Parent, Student and Teacher sign in to their hubs; Prospective family → Admissions; Staff → Admin Hub)
6. Life at SRSS (six photos → Student Life › Gallery)
7. Our People (Principal’s message → Our People)
8. Silver Jubilee (→ About › Silver Jubilee)
9. News & Events, with the calendar
10. Five FAQs (→ Resources › FAQs)
11. Admissions invitation (→ Join › Admissions, or book a visit)
12. Contact
13. Footer

The welcome names the school, not the platform: the Digital Hub is the platform, and the school is the identity.

### Migration checklist (Architecture v2.0)

| Existing content | Now lives at | Status |
|---|---|---|
| Homepage hero, role selector, Silver Jubilee band, “Small moments” carousel | `/` | Kept. Role destinations corrected and gallery shortened to six photos. |
| “Welcome to SRSS Digital Hub” | `/` | Renamed “Welcome to Sekolah Rendah Sathya Sai” |
| Values-integrated curriculum, whole-child development pillars | `/join/why-srss` | Moved from the homepage. The homepage now shows the four mission pillars. |
| Learning experience tabs and Values Garden | `/learning/human-values` | One component, also previewed on the homepage |
| “More Than Schooling” framework (was on About) | `/learning` (approach) | Moved |
| Learning spaces | `/about/campus` and `/learning/learning-environment` | One shared component |
| Sathya Sai Baba and SSIOM page (`/about/inspiration`) | `/about/sathya-sai-education` | Redirected. Its duplicated governance chart was removed. |
| Organisation chart (was on two pages) | `/about/leadership-governance` | One copy, with SSIOM, Sekolah Rendah Sathya Berhad and escalation |
| Voices: Principal, teachers, alumni (`/about/voices`) | `/about/our-people` | Redirected |
| FAQ page (`/faq`) | `/resources/faq` | Redirected. Topic subsets appear on Learning, Admissions, About and Student Life. |
| Stories & Happenings, calendar | `/resources/news`, `/resources/calendar`, `/student-life/stories`, `/student-life/events` | One feed, shown in each place |
| Admissions pathway and forms | `/join/admissions` | Moved. The homepage keeps a short invitation. |
| Contact and map | `/resources/contact` | Short version still on the homepage |
| Alumni call (was on About) | `/join/alumni` | Moved |
| Before the First Bell | `/resources/prayer-pledge-anthem`, featured in Student Life › A day at SRSS | Kept |
| “Hubs” menu | Sign In → `/login` | Replaced |

### Still to do (Phase 2, public website completion)

These are standalone pages, written once verified content exists:

- Our Story timeline and then-and-now photographs
- Sathya Sai Education: replace the empty BODY + MIND + HEART + SPIRIT panel with an interactive four-dimension framework, and add the five values and the three H’s
- Our People staff directory
- School Profile and prospectus download
- Silver Jubilee mini-site with its own sub-navigation
- Curriculum detail
- Learning Journey (Standard 1–6)
- Enrichment
- Reading & Library
- Learning Support
- Sports, Arts & Culture, Service, Leadership and Achievements: stories filtered by category, which needs a category on each story
- How to Apply: required documents
- Alumni registration and volunteer sign-up: public Google Forms are allowed for low-risk intake

### Public content rules

- Every page has one primary purpose. A section that doesn’t serve it belongs elsewhere.
- Use progressive disclosure: introduce on landing pages and explain on child pages. Don’t create a page just because a topic exists.
- Use a predictable structure: Hero → Introduction → Main content → Supporting evidence → Related content → Call to action.
- Use navy for heroes, selected features and the footer; ivory or white for reading content; gold for primary actions; purple for labels and interactive states.
- Use authentic SRSS photography. Photos of identifiable pupils follow the consent arrangements in the Media Consent policy.
- Public pages come from the CMS (`pages`, `newsPosts`, `publicAchievements`), each with an owner, an approver, a status and a review date (PUB-002). Student media is published only with recorded consent (CON-002). Public events must be intentionally marked public. Admissions applications and consent are hub forms (D4). Google Forms handles only low-risk public intake.

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
