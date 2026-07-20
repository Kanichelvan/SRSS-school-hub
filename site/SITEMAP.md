# SRSS Website and Secure Hub Information Architecture

Status: approved planning baseline. This document defines the intended navigation and URL contract; it does not imply that every route is implemented yet.

## Architecture decisions

- Keep the public website focused on discovery, trust, admissions and public resources. Never expose private student, family or staff information on a public route.
- Use `Be part of SRSS` as a navigation group, not as one oversized page. It groups `Admissions & Visits` and `Community & Support`, which have different audiences and workflows.
- Use one secure entry point at `/sign-in`. After authentication, `/hub` redirects to the user's role-aware dashboard.
- Give shared hub services stable URLs under `/hub`; the content and available actions are filtered by role.
- Create standalone public routes only for content with a clear audience, durable owner and enough material to maintain. Use anchored sections for narrower topics until they justify a page.
- Treat Google Workspace products as governed services behind SRSS pages. Do not send users into an unexplained collection of external links.
- Keep the anniversary as a focused legacy/campaign experience. The anniversary mark belongs only on anniversary content.

## Primary navigation

Desktop navigation:

1. About
2. Learning
3. Student Life
4. Be part of SRSS
   - Admissions & Visits
   - Community & Support
5. Resources

Persistent actions: Search, Sign in, and the primary `Admissions & Visits` action. On mobile, preserve the same hierarchy in one accessible menu.

## Public sitemap

### Home — `/`

- Hero and school value proposition
- Quick pathways: Parent Hub, Student Hub, Teacher Hub, Admin/Staff Hub, prospective families, alumni, volunteers, supporters and the Sai community
- Highlights: learning, human values, student life, latest news and featured public events
- Search entry point
- Enquiry and visit/tour request
- Approved brochure and prospectus downloads

The homepage should preview deeper content rather than duplicate whole pages. Secure-hub pathways route through `/sign-in` when the visitor is not authenticated.

### About SRSS — `/about`

- Our story — `/about/our-story`
- Mission, values and Sathya Sai Educare — `/about/values`
- Leadership and governance — `/about/leadership-governance`
- School profile and accreditation information — `/about/school-profile`
- Campus, location and contact — `/about/contact`
- 25th anniversary and legacy — `/about/legacy`
- Teachers and administrators — `/about/people`
- Teacher Parent Association — `/about/tpa`

Initial release: `/about` may present story, values, leadership, school profile, people and TPA as anchored sections. Promote a section to its own route when content ownership and volume justify it. `/about/contact` and `/about/legacy` are useful standalone destinations from launch.

### Learning — `/learning`

- Curriculum overview
- Standard 1–6 learning journey — `/learning/standards`
- Human values integration — `/learning#human-values`
- Co-curricular and enrichment — `/learning#enrichment`
- Library and reading culture — `/learning/library`
- Student support and remedial philosophy — `/learning#student-support`

Class showcases may link to approved Google Sites, but the SRSS page must explain the destination and whether it is public or sign-in restricted.

### Student Life — `/student-life`

- Events and celebrations — `/student-life#events`
- Competitions and projects — `/student-life#projects`
- Arts, service and character development — `/student-life#arts-service-character`
- Gallery and stories — `/student-life/gallery`
- Student leadership — `/student-life#leadership`

Only publish media with recorded consent and an approved audience. Public calendar entries must be intentionally marked public.

### Admissions & Visits — `/admissions`

- Why choose SRSS — `/admissions#why-srss`
- Admissions process — `/admissions#process`
- Fees and funding guidance — `/admissions#fees-funding`
- Admissions FAQ — `/admissions#faq`
- Arrange a visit — `/admissions/visit`
- Expression of interest — `/admissions/interest`

Enquiry, visit and interest forms may be powered by Google Forms or an SRSS form service, but confirmation, privacy and error states remain part of the SRSS experience.

### Community & Support — `/community`

- Alumni — `/community/alumni`
- Volunteer and involvement opportunities — `/community/volunteer`
- Support the school and donor enquiries — `/community/support`
- Sai community connections — `/community#sai-community`
- Jubilee participation — `/about/legacy#jubilee`

Do not combine donor, volunteer and admissions records. Each workflow needs its own purpose, owner, permissions and retention rule.

### News & Newsletters — `/news`

- News index and filters
- Individual story — `/news/:slug`
- Newsletter archive — `/newsletters`

News is linked from Home and Student Life but remains independently addressable for sharing and archiving.

### Resources — `/resources`

- Public school calendar — `/resources/calendar`
- Notices and downloads — `/resources/notices`
- Policies and handbooks — `/resources/policies`
- General FAQ — `/resources/faq`
- Contact directory — `/resources/contacts`

Admissions questions stay under Admissions; operational questions stay in Resources. Private notices and documents belong in the relevant secure hub.

### Search — `/search`

Search covers approved public content only before sign-in. Authenticated hub search uses `/hub/search` and respects the user's role and record permissions.

### Sign in — `/sign-in`

- One branded authentication entry point
- Account recovery and help
- Redirect to `/hub`, then to the user's authorized dashboard
- No role selector that can grant or imply access

## Secure hub shell

Shared routes are role-filtered:

- Dashboard — `/hub`
- Search — `/hub/search`
- Announcements — `/hub/announcements`
- Calendar — `/hub/calendar`
- Messages — `/hub/messages`
- Forms and consent — `/hub/forms`
- Profile and account settings — `/hub/profile`
- Help and support — `/hub/help`

The shell uses one SRSS identity, sign-out control, current role/account context, breadcrumbs where needed, and a clear route back to the public site.

## Student Hub

- Dashboard — `/hub/student`
- Profile — `/hub/student/profile`
- Progress — `/hub/student/progress`
- Portfolio — `/hub/student/portfolio`
- Assignments and special projects — `/hub/student/assignments`
- Library and reading — `/hub/student/library`
- Events and activities — `/hub/student/events`

The student experience may surface Google Classroom, Calendar, Gmail, Drive, Docs, Slides and Forms. Progress, support flags and portfolio visibility must follow age-appropriate permissions.

## Parent Hub

- Dashboard — `/hub/parent`
- My children — `/hub/parent/children`
- Progress and reports — `/hub/parent/progress`
- Consent and forms — `/hub/parent/forms`
- Meetings and communication — `/hub/parent/meetings`
- Resources and services — `/hub/parent/resources`

A parent sees only linked children and permitted records. Google Forms, Drive, Gmail, Meet and Calendar may support workflows; the hub owns status, confirmation and access boundaries.

## Teacher Hub

- Dashboard — `/hub/teacher`
- My classes — `/hub/teacher/classes`
- Student profiles — `/hub/teacher/students`
- Teaching and assignments — `/hub/teacher/assignments`
- Attendance and observation — `/hub/teacher/attendance`
- Parent communication — `/hub/teacher/communication`
- Room and resource booking — `/hub/teacher/bookings`

Teacher access is scoped to assigned classes, responsibilities and time periods. Google Classroom, Drive, Docs, Slides, Sheets, Forms, Gmail, Meet and Calendar may support these workflows.

## Admin and Staff Hub

- Dashboard — `/hub/admin`
- Admissions CRM Lite — `/hub/admin/admissions`
- Student records — `/hub/admin/records`
- Staff and teacher directory — `/hub/admin/staff`
- Forms registry — `/hub/admin/forms`
- Library and resource administration — `/hub/admin/library`
- Events and communications — `/hub/admin/events`
- Governance and compliance — `/hub/admin/governance`

Administrative privileges are capability-based. Not every staff member receives access to admissions, student records, publishing, consent audits or system permissions.

## Role and visibility model

| Area | Public | Student | Parent | Teacher | Admin/authorized staff |
|---|---:|---:|---:|---:|---:|
| Public site and approved downloads | Yes | Yes | Yes | Yes | Yes |
| Shared hub services | No | Own context | Family context | Assigned context | Authorized scope |
| Student profile/progress | No | Own record | Linked children | Assigned pupils | Authorized scope |
| Portfolio evidence | Approved public items only | Own record | Linked children | Assigned pupils | Authorized scope |
| Admissions pipeline | No | No | Own submissions only | No by default | Admissions roles only |
| Governance and access review | No | No | No | No by default | Designated roles only |

Authorization must be enforced by the data/API layer. Hiding a navigation item is not an access-control mechanism.

## Google Workspace integration rules

| Need | Candidate service | SRSS responsibility |
|---|---|---|
| Enquiry, visit, admissions, consent and requests | Google Forms | Purpose notice, identity requirements, confirmation, owner, retention and response workflow |
| Public and private calendars | Google Calendar | Separate calendars/audiences; publish only intentionally public events |
| Handbooks, evidence and controlled files | Google Drive | Named owner, least-privilege sharing, versioning and link review |
| Classwork and assignments | Google Classroom | Class membership, archive cycle and hub deep-link context |
| Email and group communication | Gmail and Google Groups | Approved sender, moderation, escalation and record expectations |
| Meetings | Google Meet and Calendar | Authorized attendees, safeguarding and meeting-link visibility |
| Operational trackers | Google Sheets | Restricted access, data validation, audit owner and no public sharing |
| Class showcases | Google Sites | Publication approval, consent review and clear return path to SRSS |
| Public galleries | Approved repository; Google Photos only if approved | Consent, album audience, removal workflow, captions and ownership |
| Location | Google Maps | Correct verified listing, privacy-safe embed and accessible address text |

Before launch, every integration must have a named data owner, audience, review cycle, retention rule, fallback/error state and accessibility check. Avoid embedding private Google content on public pages. Forms handling sensitive or authenticated data require an approved identity and storage model; a public share link is not sufficient.

## Route behaviour and migration

- Use lowercase, hyphenated, human-readable canonical URLs.
- Preserve deep links on refresh through server fallback and client routing.
- Redirect the current `/parent-hub` routes to their `/hub/parent` equivalents when the new shell is implemented.
- Redirect `/contact` to `/about/contact` unless a distinct contact page is retained.
- Keep hash links only for sections within a canonical page.
- Provide a helpful not-found page and an unauthorized state; never silently send an unauthorized user to a different role's dashboard.
- Store route metadata—label, audience, parent route and status—in one source of truth when routing is implemented.

## Delivery sequence

1. Route foundation: public router, `/sign-in`, protected `/hub`, role authorization, not-found and unauthorized states.
2. Public core: Home, About, Learning, Student Life, Admissions, Community, Resources, News and Search.
3. Shared hub shell: dashboard, announcements, calendar, messages, forms, profile and help.
4. Parent Hub migration from `/parent-hub` to `/hub/parent` without losing existing prototype functionality.
5. Student and Teacher Hub minimum viable workflows.
6. Admin modules, integration registry, audit trails and governance controls.
7. Promote anchored public sections into standalone routes only when content and ownership are ready.

## Definition of ready for each page

- Named audience and content owner
- Canonical route and navigation parent
- Approved copy, assets and calls to action
- Mobile, keyboard and accessibility behavior
- Empty, loading, error and success states where relevant
- Analytics/search metadata and page title
- Integration owner and privacy review where applicable
- Acceptance criteria and realistic sample data
