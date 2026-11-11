# SRSS25: school onboarding and upkeep

The school team starts at **Admin hub → School setup & upkeep** (`/hub/admin/operations`). Every hub has a **How to use this hub** button: separate guides for administrators, teachers, parents and pupils. Guide progress is saved to the person's account. Reading a guide does not submit a school task or approve a policy.

## First working session

1. The authorised administrator issues individual accounts. The Clerk uses the office role (`schoolAdmin`); the PIC Teacher uses `academicCoordinator`. Leadership, technical support, content, fee-information and safeguarding responsibilities use their existing designated roles. A teacher who is also the PIC needs the coordinator role approved separately.
2. In **Team & settings**, leadership assigns the named responsible person and backup for each responsibility. Content editor, Finance Officer and Safeguarding Lead stay unassigned until the school confirms them. Assigning a responsibility does not grant account permissions.
3. Confirm the academic year, adoption date, proposed audit months and time estimates. May and November and a four-hour audit are starting suggestions. The school can adjust them.
4. Open **Set up the school**. Each task gives the information to prepare, detailed steps, a checklist, prerequisites and links to the actual record-editing screens.
5. Save incomplete work as **In progress**. Once the records and checklist are complete, include an evidence reference and submit for review. The PIC or leadership records the review; leadership approves opening.
6. Use **My tasks** for allocated work and **Questions & support** for questions the office, PIC or hub team can answer. Keep private custody, medical and safeguarding details in the school's restricted record, not general task notes.

## Information the school prepares

| Area | Prepare and verify |
|---|---|
| School | Official name, office contacts, opening/dismissal times by Standard, logo and letterhead |
| Academic structure | Year, terms, Standards, classes, subjects and approved calendar |
| Staff | Full list, staff IDs, names, individual emails, positions, class and subject assignments |
| Teaching | Class teachers, subject teachers, weekly lesson slots; reconcile against the approved timetable |
| Pupils | Pupil IDs, full names, official pupil numbers, admission dates, active status and one correct enrolment |
| Families | Guardian IDs, names, phone/email, relationships, sibling links, emergency and collection permissions, authorised hub access |
| Consent | Approved purposes and wording, responses, evidence references, responsible safeguarding contact |
| Documents and content | Current circulars and forms, approved events, page corrections, photo permissions, owners and review dates |
| Fee information | Approved prices and fee schedule, explanation of the school's billing procedure and contact |
| Launch | Staff and parent pilot evidence, permission checks, support cover, recovery evidence and approving leader |

**Import school records** provides CSV templates for staff, pupils, guardians, classes, subjects, enrolments and guardian links. Save spreadsheets as CSV. Import parents before linking them; reuse the same guardian ID for siblings. Preview and correct errors before saving. Imports create new records only; edit existing records in their management screen. Guardian links are imported with hub access off and must be verified before access is enabled. Account creation is separate.

## Working timetable

| Frequency | School team | Hub team | Suggested time |
|---|---|---|---|
| Every school day | Registers, absences, requests and urgent notices | Respond to reported urgent issues | 5 minutes per teacher; 15 minutes office |
| Weekly | PIC checks missing records, open work and the next week's changes | Review error/access logs and scheduled jobs | 30 minutes |
| Monthly | Reconcile people and contacts; review consent, website and documents | Review software updates; perform a backup restore in an isolated test environment | 60 minutes office; 15 minutes other owners; technical effort recorded separately |
| Termly | PIC leads the audit with office, leadership and relevant owners | Join the audit; review access, logs and recovery evidence | Half a day; May and November proposed |
| Annually | Prepare the new year, assignments and handover; preserve history | Support rollover and review recovery arrangements | Agree before rollover |

The **Upkeep timetable** retains current and overdue periods from the adoption date. **Sign-off record** starts blank. Each completed check records its period, findings, evidence, follow-up, signing account and timestamp. A signed period cannot be silently overwritten. These are records of work performed: the website does not itself install software updates or restore production backups.

The header's **Urgent changes & sign-off** modal lists staff departures, custody/collection changes, suspected account misuse, incorrect disclosure, pupil movements and school closures. Urgent changes must be handled when they happen rather than waiting for a routine review.

## Progressive opening

Leadership can move through preparation, staff pilot, parent pilot and live operation only after the required tasks and saved records have been checked. Stage labels do not invite people or grant access automatically.

Results and report cards show **From when it opens**. They remain closed until after February 2027 and an authorised leader explicitly enables them. Both the interface and database rules enforce this restriction; the date alone does not open them.

The site provides fee information only. Payment collection, balances, allocations, receipts, concessions, payment-related forms and payment management are unavailable. Existing historical records are preserved, with payment collections blocked from client access.

## Technical handoff

- Callable: `schoolOperations` in `asia-southeast1`; school tasks and checks are stored beneath `operationsYears/{yearId}` through the authenticated service.
- Tutorial progress: each user owns only their `tutorialProgress/{uid}_{hub}` record.
- Publish frontend, Firestore rules and changed functions together. Use the production Firebase environment with `VITE_USE_EMULATORS=false`; never deploy a local demo build.
- Changed service exports: `schoolOperations`, `submitForm`, `caseAction`, `runFormsSchedule`, `formsDaily`. The other existing audit triggers remain unchanged.
- Validation: 140 unit tests, five operations-service tests and five focused rules tests passed. Production bundle budgets pass.
