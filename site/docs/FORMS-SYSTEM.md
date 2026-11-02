# Forms, Submissions & Response Management System

Built from the School's specification *Forms, Submissions & Response Management System* (Nov 2026). Every form has
a destination, a person in charge (PIC), a notification, a response procedure and a recorded outcome.

The full list of 197 forms (the specification's A01–L10 plus B16–B18 for the family policies), with where each lives, its PIC and backup, response target and data class, is
[`FORMS-REGISTRY.md`](FORMS-REGISTRY.md). It is generated from `functions/forms-registry.js`; that file is the
source of truth, and the hub's **Form definitions** tab shows the same list.

## Where people find it

| Who | Where | What they do |
|---|---|---|
| Anyone (no sign-in) | `/forms` and `/forms/<ID>` on the website, e.g. `/forms/A03` | Visit requests, alumni stories, memorabilia, Jubilee registration, website problems. They get a reference number on screen and by email. |
| Website visitors | The existing contact, admissions enquiry and SRSS25 community forms | Unchanged. Each message now opens a case automatically, routed by its subject. |
| Parents, teachers and staff | **My requests & forms** (`/hub/requests`) | Start a request, see every submission with its status, reply when the school asks for information, withdraw a request. |
| Staff who hold a queue | **Admin › Forms & Response Centre** (`/hub/admin/forms`) | Overview, all submissions, assigned to me, awaiting approval, overdue, completed, restricted, form definitions, workflow rules, response templates, reports. |

## How a submission flows

Submit → the server checks identity, permissions and answers → writes the authoritative record → creates the case
and a reference (`SRSS-ADM-2027-0042`) → acknowledges the submitter → notifies the PIC → the PIC replies, asks for
information, records a call or discussion, approves, rejects or completes → the case closes with its history kept.
Closed cases can be reopened; the earlier decision stays in the history.

- **Statuses:** New, Assigned, In progress, Awaiting information, Awaiting approval, Approved, Rejected, Completed,
  Closed, Cancelled. Consent forms and operational records (registers, checklists) are recorded straight away and
  only reach the PIC when something needs attention.
- **The Centre doesn't replace the modules.** Admission applications stay in Admissions, absence reports in
  Attendance, activity forms in Downloads / Forms; their cases link there and follow their status.
- **Approvals update the record.** Approving a parent's contact update (B01) changes the guardian record, with an
  audit entry. Approving or rejecting leave (E02) updates the leave record.
- **Restricted matters:** complaints (B09), staff grievances (E10), safeguarding (H05), incidents (H01–H04, H06,
  H07), financial assistance (L03) and security concerns (K14) go to a separate restricted queue that only that
  case's own PIC, backup and escalation roles can open — not the general office. A complaint or grievance about the
  Headmistress goes to the Super Administrator chain instead. Safety forms show the emergency route first: a form
  is never the only way to report a child at risk.

## Deadlines, reminders and escalation

Response targets are the specification's proposals: 2 working days for ordinary requests, 3 for admissions
reviews, the same school day for absences, immediate triage for safety. Working days are Monday–Friday less the
calendar's school-closed days. Each school day at 7.00 am:

1. On the due date the PIC is reminded; one working day late, the backup is told; three working days late, the
   Headmistress (the escalation role). Cases waiting on the submitter are not escalated.
2. Everyone who holds a queue gets a **daily action summary** in Notifications (new, awaiting response, awaiting
   approval, overdue, completed yesterday).

## Notifications and email

In-app notifications always. Emails go to the PIC for action-required and restricted cases, and to people without a
hub account (acknowledgements and replies). Emails never carry confidential details — restricted cases say only
that there is something to look at.

**To switch emails on:** install the Firebase *Trigger Email from Firestore* extension on the `srssdigitalhub`
project, pointing at the `mail` collection and the school's SMTP account (e.g. a Google Workspace address with an
app password). Until then emails wait in `mail` and nothing is lost; everything in the hub works without it.

## Set-up the School does once

1. Give the right people the queue roles in **User accounts**: Admissions Officer, Privacy / Consent Steward,
   Academic Coordinator, Safeguarding / Welfare Lead, Content Editor, Technical Administrator, Finance Officer,
   School Attendance Manager and the new **Alumni / SRSS25 Coordinator**.
2. Check **Forms & Response Centre › Workflow rules**. The defaults follow the specification; change a queue's
   person in charge, backup or escalation there.
3. Add the School's own wording in **Response templates** if wanted.
4. Link the public forms from the website when ready (`/forms` lists them). The website header and pages were not
   changed.

## For developers

- Add or change a form in `functions/forms-registry.js` (`LIVE` for fields, `MODULE_LINKS` for forms done
  elsewhere), then run `node scripts/forms-registry-report.mjs` and `npm test`.
- Forms that change critical records, permissions, consent or money are never freely configurable: the server
  decides what an approval does (`applyOutcome` in `functions/forms-service.js`).
- Tests: `tests/forms.test.mjs` (registry, validation, routing, working days), `tests/rules/forms.rules.test.mjs`
  (who can read what), `tests/e2e/forms.test.mjs` (the whole flow against the emulators).
