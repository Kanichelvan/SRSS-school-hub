# SRSS master form registry

Generated from `functions/forms-registry.js` by `scripts/forms-registry-report.mjs` — edit the registry, then re-run the script.
Routing, ownership and response targets are the specification's proposals, pending SRSS leadership approval; the School
changes routing in Forms & Response Centre › Workflow rules.

197 forms and workflows: 62 hub forms, 11 website forms, 77 handled in their own module, 47 planned with later modules.

Where: **Hub form** runs at `/hub/requests/new/<ID>`; **Website form** at `/forms/<ID>`; **Own module** links to the hub page that already does it; **Planned** arrives with its module (Library, Fees, Assets, incidents follow-up and so on).
Notification level: 1 Standard (in-app + daily summary) · 2 Action required (+ email to the PIC, reminders) · 3 Priority / confidential (restricted queue, no details in email).

## A — Admissions, Registration & Onboarding

Queue: Admissions · reference `SRSS-ADM-YYYY-NNNN` · default PIC Admissions Officer, backup School Administrator, escalation Headmistress / Leadership.

| ID | Form | Intended user | Priority | Where | Type | PIC / backup | Target | Level | Data | Stored in |
|---|---|---|---|---|---|---|---|---|---|---|
| A01 | General School Enquiry / Contact Form | Public | P1 | [Own module](/resources/contact) | Standard submission | School Administrator / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Confidential | contactMessages |
| A02 | New Student Admission Enquiry Form | Public | P1 | [Own module](/admissions) | Standard submission | Admissions Officer / School Administrator | 3 working days for initial review | 2 Action required | Confidential | admissionEnquiries |
| A03 | School Visit / Campus Tour Request | Public | P1 | [Website form](/forms/A03) | Approval / workflow | Admissions Officer / School Administrator | 2 working days for initial action | 2 Action required | Confidential | admissionEnquiries |
| A04 | Student Admission Application / Registration Form | Parent | P1 | [Own module](/hub/parent/applications) | Approval / workflow | Admissions Officer / School Administrator | 3 working days for initial review | 2 Action required | Confidential | applications |
| A05 | Admission Supporting Documents Submission | Parent | P1 | [Own module](/hub/parent/applications) | Standard submission | Admissions Officer / School Administrator | 3 working days for initial review | 1 Standard | Confidential | applicationDocuments |
| A06 | Parent / Guardian Information Form | Parent | P1 | [Own module](/hub/parent/applications) | Standard submission | Admissions Officer / School Administrator | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → admissions |
| A07 | Emergency Contact & Authorised Collection Form | Parent | P1 | [Own module](/hub/parent/applications) | Standard submission | Admissions Officer / School Administrator | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → admissions |
| A08 | Student Medical, Allergy & Dietary Information Form | Parent | P1 | [Own module](/hub/parent/applications) | Standard submission | Admissions Officer / School Administrator | 2 working days for initial action | 3 Priority / confidential | Restricted | restrictedCases |
| A09 | Admission Interview / Assessment Record | Admin / Teacher | P1 | [Own module](/hub/admin/admissions) | Operational record / checklist | Admissions Officer / School Administrator | 3 working days for initial review | 1 Standard | Confidential | applicationActions |
| A10 | Admission Decision / Offer Acceptance Form | Parent | P1 | [Own module](/hub/parent/applications) | Standard submission | Admissions Officer / School Administrator | 3 working days for initial review | 1 Standard | Confidential | applicationActions |
| A11 | New Parent Onboarding Checklist | Parent / Admin | P1 | [Own module](/hub/welcome) | Operational record / checklist | Admissions Officer / School Administrator | By the operational due date | 1 Standard | Confidential | formSubmissions → admissions |
| A12 | New Student Orientation Acknowledgement | Parent | P1 | [Own module](/hub/welcome) | Consent / acknowledgement | Admissions Officer / School Administrator | Recorded immediately; exceptions reviewed | 1 Standard | Confidential | formSubmissions → admissions |
| A13 | Parent Communication Preferences Form | Parent | P1 | [Own module](/hub/profile) | Standard submission | Admissions Officer / School Administrator | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → admissions |
| A14 | New Staff Onboarding Checklist | Staff / Admin | P2 | [Own module](/hub/welcome) | Operational record / checklist | Admissions Officer / School Administrator | By the operational due date | 1 Standard | Confidential | formSubmissions → admissions |
| A15 | New Teacher Onboarding Checklist | Teacher / Admin | P2 | [Own module](/hub/welcome) | Operational record / checklist | Admissions Officer / School Administrator | By the operational due date | 1 Standard | Confidential | formSubmissions → admissions |
| A16 | Student Withdrawal / Transfer Request | Parent | P2 | [Hub form](/hub/requests/new/A16) | Approval / workflow | Admissions Officer / School Administrator | 2 working days for initial action | 2 Action required | Confidential | formSubmissions → admissions |
| A17 | Student Exit / Clearance Checklist | Admin | P2 | Planned | Operational record / checklist | Admissions Officer / School Administrator | By the operational due date | 1 Standard | Confidential | formSubmissions → admissions |
| A18 | Admission Application Withdrawal Form | Parent | P2 | [Hub form](/hub/requests/new/A18) | Approval / workflow | Admissions Officer / School Administrator | 3 working days for initial review | 2 Action required | Confidential | formSubmissions → admissions |

## B — Parents, Guardians & Communication

Queue: Parent Relations · reference `SRSS-PAR-YYYY-NNNN` · default PIC School Administrator, backup Headmistress / Leadership, escalation Headmistress / Leadership.

| ID | Form | Intended user | Priority | Where | Type | PIC / backup | Target | Level | Data | Stored in |
|---|---|---|---|---|---|---|---|---|---|---|
| B01 | Parent / Guardian Contact Update Form | Parent | P1 | [Hub form](/hub/requests/new/B01) | Profile / record update | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → parentRelations |
| B02 | Student Information Correction / Update Request | Parent | P1 | [Hub form](/hub/requests/new/B02) | Approval / workflow | School Administrator / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Confidential | formSubmissions → parentRelations |
| B03 | Emergency Contact / Collection Arrangement Update | Parent | P1 | [Hub form](/hub/requests/new/B03) | Profile / record update | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → parentRelations |
| B04 | Parent Communication Preferences Update | Parent | P1 | [Own module](/hub/profile) | Profile / record update | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → parentRelations |
| B05 | Student Absence Notification / Explanation | Parent | P1 | [Own module](/hub/parent/attendance) | Standard submission | School Attendance Manager / School Administrator | Same school day | 1 Standard | Confidential | absenceReports |
| B06 | Parent-Teacher Meeting Request | Parent | P2 | [Hub form](/hub/requests/new/B06) | Approval / workflow | School Administrator / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Confidential | formSubmissions → parentRelations |
| B07 | Parent-Teacher Meeting Record / Follow-Up | Teacher | P2 | Planned | Operational record / checklist | School Administrator / Headmistress / Leadership | By the operational due date | 1 Standard | Confidential | formSubmissions → parentRelations |
| B08 | Parent Feedback & Suggestions Form | Parent | P1 | [Hub form](/hub/requests/new/B08) | Standard submission | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → parentRelations |
| B09 | Parent Complaint / Grievance Form | Parent | P1 | [Hub form](/hub/requests/new/B09) | Standard submission | Headmistress / Leadership / Super Administrator | 2 working days for initial action | 3 Priority / confidential | Restricted | restrictedCases |
| B10 | Parent Testimonial Submission | Parent | P1 | [Hub form](/hub/requests/new/B10) | Standard submission | Content Editor / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → CMS |
| B11 | Parent FAQ / Question Submission | Parent | P2 | [Hub form](/hub/requests/new/B11) | Standard submission | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → parentRelations |
| B12 | Parent Acknowledgement of School Circular / Notice | Parent | P1 | [Own module](/hub/announcements) | Consent / acknowledgement | School Administrator / Headmistress / Leadership | Recorded immediately; exceptions reviewed | 1 Standard | Confidential | formSubmissions → parentRelations |
| B13 | Parent Volunteer / School Support Interest | Parent | P2 | [Hub form](/hub/requests/new/B13) | Standard submission | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → parentRelations |
| B14 | Parent Request for School Documents / Certification | Parent | P2 | [Hub form](/hub/requests/new/B14) | Approval / workflow | School Administrator / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Confidential | formSubmissions → parentRelations |
| B15 | Parent Communication / Meeting Follow-Up Record | Staff / Teacher | P2 | Planned | Operational record / checklist | School Administrator / Headmistress / Leadership | By the operational due date | 1 Standard | Confidential | formSubmissions → parentRelations |
| B16 | Parent–School Partnership & Shared Values Agreement | Parent | P1 | [Hub form](/hub/requests/new/B16) | Consent / acknowledgement | School Administrator / Headmistress / Leadership | Recorded immediately; exceptions reviewed | 1 Standard | Confidential | formSubmissions → parentRelations |
| B17 | School Event / Celebration Food Check | Public / Parent / Visitor | P2 | [Website form](/forms/B17) | Standard submission | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → parentRelations |
| B18 | Medically Necessary Dietary Arrangement Request | Parent | P1 | [Hub form](/hub/requests/new/B18) | Approval / workflow | Admissions Officer / School Administrator | 2 working days for initial action | 3 Priority / confidential | Restricted | restrictedCases |

## C — Identity, Consent, Privacy & Authorisation

Queue: Governance › Consent Centre · reference `SRSS-CON-YYYY-NNNN` · default PIC Privacy / Consent Steward, backup School Administrator, escalation Headmistress / Leadership.

| ID | Form | Intended user | Priority | Where | Type | PIC / backup | Target | Level | Data | Stored in |
|---|---|---|---|---|---|---|---|---|---|---|
| C01 | Student Photography / Video Consent | Parent | P1 | [Own module](/hub/parent/consent) | Consent / acknowledgement | Privacy / Consent Steward / School Administrator | Recorded immediately; exceptions reviewed | 1 Standard | Confidential | consentRecords |
| C02 | Internal Student Portfolio Sharing Consent | Parent | P1 | [Own module](/hub/parent/consent) | Consent / acknowledgement | Privacy / Consent Steward / School Administrator | Recorded immediately; exceptions reviewed | 1 Standard | Confidential | consentRecords |
| C03 | Public Portfolio / Student Showcase Consent | Parent | P1 | [Own module](/hub/parent/consent) | Consent / acknowledgement | Privacy / Consent Steward / School Administrator | Recorded immediately; exceptions reviewed | 1 Standard | Confidential | consentRecords |
| C04 | Website Directory / Student Profile Publication Consent | Parent | P1 | [Own module](/hub/parent/consent) | Consent / acknowledgement | Privacy / Consent Steward / School Administrator | Recorded immediately; exceptions reviewed | 1 Standard | Confidential | consentRecords |
| C05 | Digital Communications Consent | Parent | P1 | [Own module](/hub/parent/consent) | Consent / acknowledgement | Privacy / Consent Steward / School Administrator | Recorded immediately; exceptions reviewed | 1 Standard | Confidential | consentRecords |
| C06 | Data Privacy Notice Acknowledgement | Parent / Staff | P1 | [Own module](/hub/parent/consent) | Consent / acknowledgement | Privacy / Consent Steward / School Administrator | Recorded immediately; exceptions reviewed | 1 Standard | Confidential | consentRecords |
| C07 | Event-Specific Photography / Media Consent | Parent | P1 | [Own module](/hub/parent/consent) | Consent / acknowledgement | Privacy / Consent Steward / School Administrator | Recorded immediately; exceptions reviewed | 1 Standard | Confidential | consentRecords |
| C08 | SRSS25 Anniversary Feature / Publication Consent | Parent | P1 | [Own module](/hub/parent/consent) | Consent / acknowledgement | Privacy / Consent Steward / School Administrator | Recorded immediately; exceptions reviewed | 1 Standard | Confidential | consentRecords |
| C09 | School Excursion / Activity Participation Consent | Parent | P1 | [Own module](/hub/parent/consent) | Consent / acknowledgement | Privacy / Consent Steward / School Administrator | Recorded immediately; exceptions reviewed | 1 Standard | Confidential | consentRecords |
| C10 | Consent Withdrawal / Revision Request | Parent | P1 | [Own module](/hub/parent/consent) | Consent / acknowledgement | Privacy / Consent Steward / School Administrator | Recorded immediately; exceptions reviewed | 1 Standard | Confidential | consentRecords |
| C11 | Student Digital Platform / Acceptable Use Acknowledgement | Parent / Student | P1 | [Own module](/hub/parent/consent) | Consent / acknowledgement | Privacy / Consent Steward / School Administrator | Recorded immediately; exceptions reviewed | 1 Standard | Confidential | consentRecords |
| C12 | Staff Data Privacy & Confidentiality Acknowledgement | Staff | P1 | [Own module](/hub) | Consent / acknowledgement | Privacy / Consent Steward / School Administrator | Recorded immediately; exceptions reviewed | 1 Standard | Confidential | consentRecords |
| C13 | Staff Photography / Public Profile Consent | Staff | P1 | [Own module](/hub/parent/consent) | Consent / acknowledgement | Privacy / Consent Steward / School Administrator | Recorded immediately; exceptions reviewed | 1 Standard | Confidential | consentRecords |
| C14 | Personal Data Access / Correction Request | Parent / Staff | P1 | [Hub form](/hub/requests/new/C14) | Approval / workflow | Privacy / Consent Steward / School Administrator | 2 working days for initial action | 2 Action required | Confidential | privacyRequests |
| C15 | Consent Verification / Exception Review | Admin | P1 | [Own module](/hub/admin/consent) | Consent / acknowledgement | Privacy / Consent Steward / School Administrator | Recorded immediately; exceptions reviewed | 1 Standard | Confidential | consentRecords |
| C16 | Annual Consent Review / Renewal | Parent | P2 | [Own module](/hub/parent/consent) | Consent / acknowledgement | Privacy / Consent Steward / School Administrator | Recorded immediately; exceptions reviewed | 1 Standard | Confidential | consentRecords |

## D — Academics, Teaching & Student Development

Queue: Academic › Submissions & Reviews · reference `SRSS-ACA-YYYY-NNNN` · default PIC Academic Coordinator, backup Headmistress / Leadership, escalation Headmistress / Leadership.

| ID | Form | Intended user | Priority | Where | Type | PIC / backup | Target | Level | Data | Stored in |
|---|---|---|---|---|---|---|---|---|---|---|
| D01 | Teacher Profile Submission / Update | Teacher | P1 | [Hub form](/hub/requests/new/D01) | Profile / record update | Content Editor / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | staff → CMS review |
| D02 | Class Overview Submission | Teacher | P1 | [Hub form](/hub/requests/new/D02) | Standard submission | Academic Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → academic |
| D03 | Syllabus / Term Curriculum Planning Template | Teacher | P1 | [Own module](/hub/teacher/teaching) | Standard submission | Academic Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → academic |
| D04 | Lesson / Unit Planning Template | Teacher | P2 | [Own module](/hub/teacher/teaching) | Standard submission | Academic Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → academic |
| D05 | Weekly Lesson Plan | Teacher | P2 | [Own module](/hub/teacher/teaching) | Standard submission | Academic Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → academic |
| D06 | Student Portfolio Entry | Teacher | P1 | [Own module](/hub/teacher/portfolios) | Standard submission | Portfolio Moderator / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Confidential | portfolioEntries |
| D07 | Student Achievement Submission | Teacher | P1 | [Own module](/hub/teacher/portfolios) | Standard submission | Academic Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | studentAchievements |
| D08 | Human Excellence / Human Values Observation | Teacher | P2 | [Own module](/hub/teacher/students) | Standard submission | Academic Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | humanValuesObservations |
| D09 | Student Reflection Submission | Student | P2 | Planned | Standard submission | Academic Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → academic |
| D10 | Teacher Self-Reflection Form | Teacher | P2 | [Own module](/hub/teacher/development) | Standard submission | Academic Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → academic |
| D11 | Classroom Observation Form | Academic Coordinator | P2 | [Own module](/hub/admin/development) | Standard submission | Academic Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → academic |
| D12 | Teacher KPI / Performance Review | Academic Coordinator | P2 | [Own module](/hub/admin/development) | Standard submission | Academic Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → academic |
| D13 | Student Learning Support Referral | Teacher | P2 | [Own module](/hub/admin/support-groups) | Standard submission | Academic Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | studentSupportPlans |
| D14 | Student Support / Intervention Plan | Teacher / Coordinator | P2 | [Own module](/hub/admin/support-groups) | Standard submission | Academic Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | studentSupportPlans |
| D15 | Student Support Progress / Review | Teacher | P2 | [Own module](/hub/admin/support-groups) | Standard submission | Academic Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | studentSupportSessions |
| D16 | Assessment / Examination Marks Submission | Teacher | P2 | [Own module](/hub/teacher/assessments) | Operational record / checklist | Academic Coordinator / Headmistress / Leadership | By the operational due date | 1 Standard | Internal | studentResults |
| D17 | Report Card Remarks Submission | Teacher | P2 | [Own module](/hub/teacher/reports) | Operational record / checklist | Academic Coordinator / Headmistress / Leadership | By the operational due date | 1 Standard | Internal | formSubmissions → academic |
| D18 | Assessment Moderation / Approval | Academic Coordinator | P2 | [Own module](/hub/admin/assessments) | Approval / workflow | Academic Coordinator / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Internal | formSubmissions → academic |
| D19 | Student Academic Progress Review | Teacher | P2 | [Own module](/hub/teacher/assessments) | Standard submission | Academic Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → academic |
| D20 | Classroom Resource Request | Teacher | P2 | [Hub form](/hub/requests/new/D20) | Approval / workflow | Academic Coordinator / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Internal | formSubmissions → academic |
| D21 | Student Attendance Register | Teacher | P1 | [Own module](/hub/teacher/attendance) | Operational record / checklist | Class Teacher / Headmistress / Leadership | By the operational due date | 1 Standard | Confidential | attendanceSessions + attendanceRecords |
| D22 | Student Attendance Correction Request | Teacher / Admin | P1 | [Hub form](/hub/requests/new/D22) | Approval / workflow | School Administrator / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Confidential | attendanceRecords + auditLogs |
| D23 | Teacher Professional Development Reflection | Teacher | P2 | [Own module](/hub/teacher/development) | Standard submission | Academic Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → academic |
| D24 | Academic Programme / Project Proposal | Teacher | P2 | [Hub form](/hub/requests/new/D24) | Standard submission | Academic Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → academic |

## E — Staff, Human Resources & School Operations

Queue: Staff Operations · reference `SRSS-STF-YYYY-NNNN` · default PIC School Administrator, backup Headmistress / Leadership, escalation Headmistress / Leadership.

| ID | Form | Intended user | Priority | Where | Type | PIC / backup | Target | Level | Data | Stored in |
|---|---|---|---|---|---|---|---|---|---|---|
| E01 | Staff Personal Information Update | Staff | P1 | [Hub form](/hub/requests/new/E01) | Profile / record update | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → staffOperations |
| E02 | Staff Leave Application | Staff | P2 | [Hub form](/hub/requests/new/E02) | Approval / workflow | Headmistress / Leadership / Super Administrator | 3 working days for initial review | 2 Action required | Confidential | staffLeave |
| E03 | Staff Emergency Absence Notification | Staff | P1 | [Hub form](/hub/requests/new/E03) | Standard submission | School Administrator / Headmistress / Leadership | Same school day | 1 Standard | Confidential | formSubmissions → staffOperations |
| E04 | Staff Training / CPD Record Submission | Staff | P2 | [Own module](/hub/teacher/development) | Operational record / checklist | School Administrator / Headmistress / Leadership | By the operational due date | 1 Standard | Confidential | formSubmissions → staffOperations |
| E05 | Staff Training / Professional Development Request | Staff | P2 | [Hub form](/hub/requests/new/E05) | Approval / workflow | School Administrator / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Confidential | formSubmissions → staffOperations |
| E06 | Staff Appraisal / Development Plan | Staff / Leadership | P2 | [Own module](/hub/teacher/development) | Standard submission | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → staffOperations |
| E07 | Staff Maintenance / Repair Request | Staff | P2 | [Hub form](/hub/requests/new/E07) | Approval / workflow | School Administrator / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Confidential | formSubmissions → staffOperations |
| E08 | Equipment / Asset Request | Staff | P2 | [Hub form](/hub/requests/new/E08) | Approval / workflow | School Administrator / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Confidential | formSubmissions → staffOperations |
| E09 | IT Support / Technical Assistance Request | Staff | P1 | [Hub form](/hub/requests/new/E09) | Approval / workflow | Technical Administrator / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Confidential | formSubmissions |
| E10 | Staff Confidential Grievance | Staff | P2 | [Hub form](/hub/requests/new/E10) | Standard submission | Headmistress / Leadership / Super Administrator | 2 working days for initial action | 3 Priority / confidential | Restricted | restrictedCases |
| E11 | Staff Employment Document Submission | Staff | P2 | Planned | Standard submission | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → staffOperations |
| E12 | Staff Exit / Handover Checklist | Staff / Admin | P2 | Planned | Operational record / checklist | School Administrator / Headmistress / Leadership | By the operational due date | 1 Standard | Confidential | formSubmissions → staffOperations |
| E13 | Asset Assignment / Handover Record | Staff / Admin | P2 | Planned | Operational record / checklist | School Administrator / Headmistress / Leadership | By the operational due date | 1 Standard | Confidential | formSubmissions → staffOperations |
| E14 | Asset Maintenance / Condition Report | Staff | P2 | Planned | Standard submission | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → staffOperations |
| E15 | Resource / Room Booking Request | Staff | P2 | [Hub form](/hub/requests/new/E15) | Approval / workflow | School Administrator / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Confidential | formSubmissions → staffOperations |
| E16 | Staff Duty / Responsibility Acknowledgement | Staff | P2 | Planned | Consent / acknowledgement | School Administrator / Headmistress / Leadership | Recorded immediately; exceptions reviewed | 1 Standard | Confidential | formSubmissions → staffOperations |

## F — Library & Resource Centre

Queue: Library › Operations · reference `SRSS-LIB-YYYY-NNNN` · default PIC Librarian, backup School Administrator, escalation Headmistress / Leadership.

| ID | Form | Intended user | Priority | Where | Type | PIC / backup | Target | Level | Data | Stored in |
|---|---|---|---|---|---|---|---|---|---|---|
| F01 | Library Membership / Rules Acknowledgement | Student / Parent | P3 | Planned | Consent / acknowledgement | Librarian / School Administrator | Recorded immediately; exceptions reviewed | 1 Standard | Internal | formSubmissions → library |
| F02 | Book Borrowing / Return Record | Librarian | P3 | Planned | Operational record / checklist | Librarian / School Administrator | By the operational due date | 1 Standard | Internal | libraryLoans (future) |
| F03 | Book Reservation Request | Student / Teacher | P3 | Planned | Approval / workflow | Librarian / School Administrator | 2 working days for initial action | 2 Action required | Internal | libraryReservations (future) |
| F04 | Class Teaching Resource Request | Teacher | P3 | Planned | Approval / workflow | Librarian / School Administrator | 2 working days for initial action | 2 Action required | Internal | formSubmissions → library |
| F05 | Resource Centre / Library Space Booking | Teacher / Staff | P3 | Planned | Standard submission | Librarian / School Administrator | 2 working days for initial action | 1 Standard | Internal | formSubmissions → library |
| F06 | Student Librarian Application | Student | P3 | Planned | Approval / workflow | Librarian / School Administrator | 3 working days for initial review | 2 Action required | Confidential | formSubmissions → library |
| F07 | Student Librarian / Library Prefect Duty Roster | Librarian | P3 | Planned | Operational record / checklist | Librarian / School Administrator | By the operational due date | 1 Standard | Confidential | formSubmissions → library |
| F08 | Lost / Damaged Book or Resource Report | Student / Staff | P3 | Planned | Standard submission | Librarian / School Administrator | 2 working days for initial action | 1 Standard | Internal | formSubmissions → library |
| F09 | Reading Programme Registration | Student / Parent | P3 | Planned | Standard submission | Librarian / School Administrator | 2 working days for initial action | 1 Standard | Internal | formSubmissions → library |
| F10 | Book / Resource Recommendation | Student / Teacher | P3 | Planned | Standard submission | Librarian / School Administrator | 2 working days for initial action | 1 Standard | Internal | formSubmissions → library |
| F11 | Library Inventory / Stock Verification | Librarian | P3 | Planned | Operational record / checklist | Librarian / School Administrator | By the operational due date | 1 Standard | Internal | formSubmissions → library |
| F12 | Student Librarian Appointment / Acceptance | Student / Parent | P3 | Planned | Standard submission | Librarian / School Administrator | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → library |
| F13 | Library Activity / Reading Progress Record | Student / Librarian | P3 | Planned | Operational record / checklist | Librarian / School Administrator | By the operational due date | 1 Standard | Internal | formSubmissions → library |

## G — Extracurricular Activities, Events & Excursions

Queue: Events › Registrations & Actions · reference `SRSS-EVT-YYYY-NNNN` · default PIC School Administrator, backup Headmistress / Leadership, escalation Headmistress / Leadership.

| ID | Form | Intended user | Priority | Where | Type | PIC / backup | Target | Level | Data | Stored in |
|---|---|---|---|---|---|---|---|---|---|---|
| G01 | General Event Registration | Public / Parent | P1 | [Own module](/hub/calendar) | Standard submission | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | registrations |
| G02 | Extracurricular Activity Registration | Parent | P2 | [Own module](/hub/forms) | Standard submission | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | activityForms |
| G03 | Parent Participation Permission / Consent | Parent | P1 | [Own module](/hub/forms) | Consent / acknowledgement | School Administrator / Headmistress / Leadership | Recorded immediately; exceptions reviewed | 1 Standard | Internal | activityForms |
| G04 | Activity-Specific Medical / Dietary Disclosure | Parent | P1 | [Own module](/hub/forms) | Standard submission | School Administrator / Headmistress / Leadership | 2 working days for initial action | 3 Priority / confidential | Restricted | restrictedCases |
| G05 | Event Photography / Media Consent | Parent | P1 | [Own module](/hub/forms) | Consent / acknowledgement | Privacy / Consent Steward / School Administrator | Recorded immediately; exceptions reviewed | 1 Standard | Internal | activityForms |
| G06 | Emergency Contact Confirmation | Parent | P1 | [Own module](/hub/forms) | Standard submission | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | activityForms |
| G07 | Activity Collection / Pickup Arrangement | Parent | P1 | [Own module](/hub/forms) | Standard submission | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → events |
| G08 | Teacher / Adult Supervisor Safety Checklist | Teacher / Staff | P1 | [Own module](/hub/forms) | Operational record / checklist | School Administrator / Headmistress / Leadership | By the operational due date | 1 Standard | Internal | activityForms |
| G09 | Activity Attendance Register | Teacher / Organiser | P1 | [Own module](/hub/forms) | Operational record / checklist | School Administrator / Headmistress / Leadership | By the operational due date | 1 Standard | Internal | activityForms |
| G10 | Event / Activity Incident Report | Staff | P1 | [Own module](/hub/forms) | Standard submission | Safeguarding / Welfare Lead / School Administrator | Immediate triage; emergency route | 3 Priority / confidential | Internal | restrictedCases |
| G11 | Post-Event Reflection / Report | Event Organiser | P2 | [Own module](/hub/forms) | Standard submission | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | activityForms |
| G12 | Volunteer / Chaperone Registration & Declaration | Parent / Volunteer | P2 | [Own module](/hub/forms) | Consent / acknowledgement | School Administrator / Headmistress / Leadership | Recorded immediately; exceptions reviewed | 1 Standard | Internal | activityForms |
| G13 | Event Proposal / Approval Request | Staff | P2 | [Hub form](/hub/requests/new/G13) | Approval / workflow | School Administrator / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Internal | formSubmissions → events |
| G14 | Event Feedback Form | Parent / Participant | P2 | [Hub form](/hub/requests/new/G14) | Standard submission | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → events |
| G15 | Event Resource / Equipment Request | Organiser | P2 | Planned | Approval / workflow | School Administrator / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Internal | formSubmissions → events |
| G16 | Event Volunteer Duty Assignment | Organiser | P2 | Planned | Standard submission | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → events |
| G17 | Event Attendance / Participation Confirmation | Organiser | P2 | Planned | Standard submission | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → events |
| G18 | Excursion Risk Assessment / Safety Plan | Organiser | P2 | Planned | Standard submission | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → events |
| G19 | Event Cancellation / Registration Withdrawal | Parent / Participant | P2 | [Hub form](/hub/requests/new/G19) | Standard submission | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → events |
| G20 | Event Media / Photograph Submission | Staff | P2 | Planned | Standard submission | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → events |

## H — Safety, Safeguarding & Incident Management

Queue: Restricted › Safety & Incidents · reference `SRSS-SAF-YYYY-NNNN` · default PIC Safeguarding / Welfare Lead, backup Headmistress / Leadership, escalation Headmistress / Leadership.

| ID | Form | Intended user | Priority | Where | Type | PIC / backup | Target | Level | Data | Stored in |
|---|---|---|---|---|---|---|---|---|---|---|
| H01 | Student Incident Report | Teacher / Staff | P1 | [Hub form](/hub/requests/new/H01) | Standard submission | Safeguarding / Welfare Lead / Headmistress / Leadership | Immediate triage; emergency route | 3 Priority / confidential | Restricted | restrictedCases |
| H02 | Staff Incident Report | Staff | P1 | [Hub form](/hub/requests/new/H02) | Standard submission | Safeguarding / Welfare Lead / Headmistress / Leadership | Immediate triage; emergency route | 3 Priority / confidential | Restricted | restrictedCases |
| H03 | Student Behaviour / Discipline Report | Teacher | P2 | [Hub form](/hub/requests/new/H03) | Standard submission | Safeguarding / Welfare Lead / Headmistress / Leadership | 2 working days for initial action | 3 Priority / confidential | Restricted | restrictedCases |
| H04 | Injury / Accident Report | Staff | P1 | [Hub form](/hub/requests/new/H04) | Standard submission | Safeguarding / Welfare Lead / Headmistress / Leadership | Immediate triage; emergency route | 3 Priority / confidential | Restricted | restrictedCases |
| H05 | Safeguarding Concern Report | Authorised Staff | P1 | [Hub form](/hub/requests/new/H05) | Standard submission | Safeguarding / Welfare Lead / Headmistress / Leadership | Immediate triage; emergency route | 3 Priority / confidential | Restricted | restrictedCases |
| H06 | Bullying Complaint / Concern Report | Parent / Staff | P1 | [Hub form](/hub/requests/new/H06) | Standard submission | Safeguarding / Welfare Lead / Headmistress / Leadership | Immediate triage; emergency route | 3 Priority / confidential | Restricted | restrictedCases |
| H07 | Property Damage / Loss Report | Staff / Parent | P2 | [Hub form](/hub/requests/new/H07) | Standard submission | Safeguarding / Welfare Lead / Headmistress / Leadership | 2 working days for initial action | 3 Priority / confidential | Restricted | restrictedCases |
| H08 | Witness Statement Form | Authorised User | P1 | Planned | Standard submission | Safeguarding / Welfare Lead / Headmistress / Leadership | 2 working days for initial action | 3 Priority / confidential | Restricted | restrictedCases |
| H09 | Incident Follow-Up / Resolution Log | Designated PIC | P1 | Planned | Standard submission | Safeguarding / Welfare Lead / Headmistress / Leadership | Immediate triage; emergency route | 3 Priority / confidential | Restricted | restrictedCases |
| H10 | Parent Notification / Incident Acknowledgement | Parent | P1 | Planned | Standard submission | Safeguarding / Welfare Lead / Headmistress / Leadership | Immediate triage; emergency route | 3 Priority / confidential | Restricted | restrictedCases |
| H11 | Incident Investigation / Review Record | Authorised Investigator | P1 | Planned | Standard submission | Safeguarding / Welfare Lead / Headmistress / Leadership | Immediate triage; emergency route | 3 Priority / confidential | Restricted | restrictedCases |
| H12 | Corrective / Preventive Action Record | School Leadership | P2 | Planned | Operational record / checklist | Safeguarding / Welfare Lead / Headmistress / Leadership | By the operational due date | 3 Priority / confidential | Restricted | restrictedCases |
| H13 | Student Safety / Welfare Follow-Up Record | Authorised Staff | P1 | Planned | Operational record / checklist | Safeguarding / Welfare Lead / Headmistress / Leadership | By the operational due date | 3 Priority / confidential | Restricted | restrictedCases |
| H14 | Emergency Drill / Safety Exercise Report | Staff | P2 | Planned | Standard submission | Safeguarding / Welfare Lead / Headmistress / Leadership | 2 working days for initial action | 3 Priority / confidential | Restricted | restrictedCases |

## I — SRSS25, Alumni & Community Engagement

Queue: SRSS25 › Community Submissions · reference `SRSS-S25-YYYY-NNNN` · default PIC Alumni / SRSS25 Coordinator, backup Headmistress / Leadership, escalation Headmistress / Leadership.

| ID | Form | Intended user | Priority | Where | Type | PIC / backup | Target | Level | Data | Stored in |
|---|---|---|---|---|---|---|---|---|---|---|
| I01 | Alumni Registration | Alumni | P1 | [Own module](/srss25) | Standard submission | Alumni / SRSS25 Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | contactMessages |
| I02 | Alumni Story / Testimonial Submission | Alumni | P1 | [Website form](/forms/I02) | Standard submission | Alumni / SRSS25 Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | alumniStories (proposed) |
| I03 | Historical Photograph / Memorabilia Submission | Alumni / Community | P1 | [Website form](/forms/I03) | Standard submission | Alumni / SRSS25 Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → alumni |
| I04 | Former Teacher / Staff Story Submission | Former Staff | P1 | [Website form](/forms/I04) | Standard submission | Alumni / SRSS25 Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → alumni |
| I05 | Silver Jubilee Event Registration | Public / Alumni | P1 | [Website form](/forms/I05) | Standard submission | School Administrator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | registrations |
| I06 | Anniversary Volunteer Registration | Public / Alumni | P2 | [Own module](/srss25) | Standard submission | Alumni / SRSS25 Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | contactMessages |
| I07 | Anniversary Sponsorship / Support Enquiry | Public | P2 | [Own module](/srss25) | Standard submission | Alumni / SRSS25 Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | contactMessages |
| I08 | SRSS Memory / Message Submission | Alumni / Community | P1 | [Own module](/srss25) | Standard submission | Alumni / SRSS25 Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | contactMessages |
| I09 | Alumni Launch Involvement / Participation Form | Alumni | P1 | [Website form](/forms/I09) | Standard submission | Alumni / SRSS25 Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → alumni |
| I10 | Alumni Mentoring / Speaking Interest | Alumni | P2 | Planned | Standard submission | Alumni / SRSS25 Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → alumni |
| I11 | Alumni Contact Information Update | Alumni | P2 | Planned | Profile / record update | Alumni / SRSS25 Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → alumni |
| I12 | Alumni Profile Publication Consent | Alumni | P1 | [Website form](/forms/I12) | Consent / acknowledgement | Privacy / Consent Steward / Headmistress / Leadership | Recorded immediately; exceptions reviewed | 1 Standard | Internal | consentRecords |
| I13 | SRSS25 Historical Timeline Contribution | Community | P1 | [Website form](/forms/I13) | Standard submission | Alumni / SRSS25 Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → alumni |
| I14 | Anniversary Programme / Performance Proposal | Alumni / Staff | P2 | Planned | Standard submission | Alumni / SRSS25 Coordinator / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → alumni |
| I15 | Alumni Outreach / Follow-Up Record | Alumni Coordinator | P1 | Planned | Operational record / checklist | Alumni / SRSS25 Coordinator / Headmistress / Leadership | By the operational due date | 1 Standard | Internal | formSubmissions → alumni |

## J — Website Content, CMS & Governance

Queue: CMS › Review & Publishing · reference `SRSS-WEB-YYYY-NNNN` · default PIC Content Editor, backup Headmistress / Leadership, escalation Headmistress / Leadership.

| ID | Form | Intended user | Priority | Where | Type | PIC / backup | Target | Level | Data | Stored in |
|---|---|---|---|---|---|---|---|---|---|---|
| J01 | Website Content Update Request | Staff | P1 | [Hub form](/hub/requests/new/J01) | Approval / workflow | Content Editor / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Internal | formSubmissions → content |
| J02 | News / Article Submission | Staff / Teacher | P1 | [Hub form](/hub/requests/new/J02) | Standard submission | Content Editor / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Internal | newsPosts |
| J03 | Student Achievement Publication Request | Teacher | P1 | [Hub form](/hub/requests/new/J03) | Approval / workflow | Content Editor / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Confidential | formSubmissions → content |
| J04 | Website Page Review / Sign-Off | Content Approver | P1 | [Own module](/hub/admin/content) | Standard submission | Headmistress / Leadership / Super Administrator | 2 working days for initial action | 1 Standard | Internal | pages |
| J05 | New Website Page / Module Request | Staff / Leadership | P2 | [Hub form](/hub/requests/new/J05) | Approval / workflow | Content Editor / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Internal | formSubmissions → content |
| J06 | Policy Upload / Update Request | Authorised Staff | P2 | [Hub form](/hub/requests/new/J06) | Approval / workflow | Content Editor / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Internal | formSubmissions → content |
| J07 | Broken Link / Website Issue Report | Public / Staff | P1 | [Website form](/forms/J07) | Standard submission | Content Editor / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → content |
| J08 | Annual Website Audit Checklist | Content Lead | P2 | Planned | Operational record / checklist | Content Editor / Headmistress / Leadership | By the operational due date | 1 Standard | Internal | formSubmissions → content |
| J09 | Consent Audit Checklist | Consent Steward | P1 | [Own module](/hub/admin/consent) | Consent / acknowledgement | Privacy / Consent Steward / Headmistress / Leadership | Recorded immediately; exceptions reviewed | 1 Standard | Internal | consentRecords + auditLogs |
| J10 | Content Expiry / Archive Request | Content Editor | P1 | [Hub form](/hub/requests/new/J10) | Approval / workflow | Content Editor / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Internal | formSubmissions → content |
| J11 | Website Feedback / Usability Suggestion | Public | P2 | [Own module](/resources/contact) | Standard submission | Content Editor / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | contactMessages |
| J12 | Homepage Feature / Highlight Submission | Staff | P1 | [Hub form](/hub/requests/new/J12) | Standard submission | Content Editor / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → content |
| J13 | Teacher Profile Publication Review | Content Editor | P1 | [Own module](/hub/admin/content) | Standard submission | Content Editor / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → content |
| J14 | Public Media / Photography Approval | Content Editor | P1 | [Own module](/hub/admin/showcase) | Approval / workflow | Content Editor / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Internal | formSubmissions → content |
| J15 | Content Correction / Retraction Request | Authorised User | P1 | [Hub form](/hub/requests/new/J15) | Approval / workflow | Content Editor / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Internal | formSubmissions → content |
| J16 | Website Accessibility Issue Report | Public / Staff | P2 | [Website form](/forms/J16) | Standard submission | Content Editor / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → content |
| J17 | Content Ownership / Review Assignment | Admin | P1 | Planned | Standard submission | Content Editor / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Internal | formSubmissions → content |
| J18 | Policy Review / Approval Record | Policy Owner | P2 | Planned | Operational record / checklist | Content Editor / Headmistress / Leadership | By the operational due date | 2 Action required | Internal | formSubmissions → content |

## K — System Administration, Access & Data Management

Queue: System › Access & Data · reference `SRSS-SYS-YYYY-NNNN` · default PIC Technical Administrator, backup Super Administrator, escalation Headmistress / Leadership.

| ID | Form | Intended user | Priority | Where | Type | PIC / backup | Target | Level | Data | Stored in |
|---|---|---|---|---|---|---|---|---|---|---|
| K01 | User Account Creation / Access Request | Admin | P1 | [Hub form](/hub/requests/new/K01) | Approval / workflow | Technical Administrator / Super Administrator | 2 working days for initial action | 2 Action required | Confidential | users + userRoles |
| K02 | User Role / Permission Change Request | Admin | P1 | [Hub form](/hub/requests/new/K02) | Consent / acknowledgement | Technical Administrator / Super Administrator | Recorded immediately; exceptions reviewed | 2 Action required | Confidential | userRoles + auditLogs |
| K03 | User Account Deactivation Request | Admin | P1 | [Hub form](/hub/requests/new/K03) | Approval / workflow | Technical Administrator / Super Administrator | 2 working days for initial action | 2 Action required | Confidential | users + auditLogs |
| K04 | Student / Guardian Relationship Verification | Admin | P1 | [Own module](/hub/admin/guardian-links) | Standard submission | Technical Administrator / Super Administrator | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → system |
| K05 | Student Record Correction / Data Review | Admin | P1 | [Hub form](/hub/requests/new/K05) | Operational record / checklist | Technical Administrator / Super Administrator | By the operational due date | 1 Standard | Confidential | formSubmissions → system |
| K06 | Staff Record Correction Request | Staff / Admin | P1 | [Hub form](/hub/requests/new/K06) | Operational record / checklist | Technical Administrator / Super Administrator | By the operational due date | 2 Action required | Confidential | formSubmissions → system |
| K07 | Technical Bug / System Error Report | User | P1 | [Hub form](/hub/requests/new/K07) | Standard submission | Technical Administrator / Super Administrator | 2 working days for initial action | 2 Action required | Confidential | formSubmissions → system |
| K08 | System Feature / Enhancement Request | Staff | P2 | [Hub form](/hub/requests/new/K08) | Approval / workflow | Technical Administrator / Super Administrator | 2 working days for initial action | 2 Action required | Confidential | formSubmissions → system |
| K09 | Data Import / Migration Verification | Admin | P1 | [Own module](/hub/admin/setup) | Standard submission | Technical Administrator / Super Administrator | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → system |
| K10 | Data Export Request | Authorised User | P2 | [Hub form](/hub/requests/new/K10) | Approval / workflow | Technical Administrator / Super Administrator | 2 working days for initial action | 2 Action required | Confidential | formSubmissions → system |
| K11 | Permission / Access Audit Checklist | Technical Admin | P1 | [Own module](/hub/admin/roles) | Consent / acknowledgement | Technical Administrator / Super Administrator | Recorded immediately; exceptions reviewed | 1 Standard | Confidential | formSubmissions → system |
| K12 | System Configuration Change Request | Technical Admin | P2 | Planned | Approval / workflow | Technical Administrator / Super Administrator | 2 working days for initial action | 2 Action required | Confidential | formSubmissions → system |
| K13 | Data Quality / Duplicate Record Report | Admin | P1 | [Hub form](/hub/requests/new/K13) | Operational record / checklist | Technical Administrator / Super Administrator | By the operational due date | 1 Standard | Confidential | formSubmissions → system |
| K14 | System Incident / Security Concern Report | Authorised User | P1 | [Hub form](/hub/requests/new/K14) | Standard submission | Technical Administrator / Super Administrator | Immediate triage; emergency route | 3 Priority / confidential | Confidential | restrictedCases |
| K15 | System Change / Release Approval | Product Owner | P2 | Planned | Approval / workflow | Technical Administrator / Super Administrator | 2 working days for initial action | 2 Action required | Confidential | formSubmissions → system |

## L — Finance, Fees & School Resources

Queue: Finance › Requests & Reconciliation · reference `SRSS-FIN-YYYY-NNNN` · default PIC Finance Officer, backup Headmistress / Leadership, escalation Headmistress / Leadership.

| ID | Form | Intended user | Priority | Where | Type | PIC / backup | Target | Level | Data | Stored in |
|---|---|---|---|---|---|---|---|---|---|---|
| L01 | Student Fee Information / Payment Enquiry | Parent | P2 | [Hub form](/hub/requests/new/L01) | Standard submission | Finance Officer / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → finance |
| L02 | Payment Reference / Proof Submission | Parent | P2 | Planned | Standard submission | Finance Officer / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | payments |
| L03 | Fee Concession / Financial Assistance Request | Parent | P2 | [Hub form](/hub/requests/new/L03) | Approval / workflow | Finance Officer / Headmistress / Leadership | 2 working days for initial action | 3 Priority / confidential | Restricted | restrictedCases |
| L04 | Fee Adjustment / Correction Request | Finance Officer | P2 | Planned | Approval / workflow | Finance Officer / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Confidential | formSubmissions → finance |
| L05 | Refund Request | Parent | P2 | [Hub form](/hub/requests/new/L05) | Approval / workflow | Finance Officer / Headmistress / Leadership | 2 working days for initial action | 2 Action required | Confidential | formSubmissions → finance |
| L06 | Purchase / Resource Requisition | Staff | P2 | [Hub form](/hub/requests/new/L06) | Standard submission | Finance Officer / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → finance |
| L07 | Expense Reimbursement Claim | Staff | P2 | [Hub form](/hub/requests/new/L07) | Standard submission | Finance Officer / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | formSubmissions → finance |
| L08 | Donation / Contribution Enquiry | Public | P2 | [Own module](/srss25) | Standard submission | Finance Officer / Headmistress / Leadership | 2 working days for initial action | 1 Standard | Confidential | contactMessages |
| L09 | Financial Assistance Review / Approval | Authorised Admin | P2 | Planned | Approval / workflow | Finance Officer / Headmistress / Leadership | 2 working days for initial action | 3 Priority / confidential | Restricted | restrictedCases |
| L10 | Payment Reconciliation / Verification Record | Finance Officer | P2 | Planned | Operational record / checklist | Finance Officer / Headmistress / Leadership | By the operational due date | 1 Standard | Confidential | formSubmissions → finance |
