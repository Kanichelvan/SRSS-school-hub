# SRSS Connect — Announcements, Updates & Notifications

Implementation of *SRSS Connect — School Communications* (Part 1 functional spec, Part 2 technical spec v1.0,
7 Nov 2026) in the SRSS Digital Hub. Scope agreed with Kani on 7 Nov 2026: **Phase 1 + acknowledgements**
(announcements, circulars, targeting, approval, scheduling/expiry/cancellation, notification bell and centre,
in-app preferences, Actions Required, delivery and acknowledgement reports, public bar and archive).
Email, browser push, SMS and translations are not built; the data model leaves room for them.

## 1. Reconciliation report (Part 2 §1.3)

| Area | Status | Notes |
|---|---|---|
| Stack | **Conflict → kept existing** | The spec assumes Next.js/TypeScript/Tailwind. The hub stays React + Vite + Cloud Functions v2 (decision of 9 Oct 2026). "API endpoints" are actions of one callable function, `connect`. |
| `announcements` collection | Reused, extended | v2 fields added (§4). Pre-v2 notices keep working: `urgent` → P2, old categories map to new ones, revision 1 keeps old notification ids. |
| `notificationRecords` | Reused | Kept as a top-level collection (rules already enforce `recipientUid == uid`) rather than moving to `users/{uid}/notifications`. Added `archivedAt`, `priority`, `preview`, `sourceRevision`, `purpose`, `dedupeKey`. |
| `auditLogs` | Reused | `connect.*` events written by the server; existing `auditAnnouncements` trigger still records every write. |
| `publicAnnouncements` | Reused | Sanitized public copies now carry `summary`, `category`, `priority`, `reference` and a public-only `action`. |
| Audience targeting | Reused, extended | `audienceKeys` derived server-side (functions/scope.js). Added "parents only" keys `class:<id>@parents` and `standard:N@parents`, given only to verified guardians. |
| Forms & Actions | Linked, not imitated | A notice can link to a form/consent page; completion still shows in Actions Required from the real form/consent records. Pending acknowledgements are added to Actions Required. |
| Client writes to notices | **Changed** | Previously admins/teachers wrote `announcements` directly. Now only the `connect` function writes them (Part 2 §2.3). The old RecordManager screens were removed. |
| Public ticker | **Replaced** (approved) | The scrolling "Updates" marquee became a static, priority-ordered announcement bar below the header; the hero notice box was removed (the bar replaces it). |

## 2. Routes

Canonical hub routes (aliases from the spec's `/dashboard/…` and `/admin/…` addresses redirect here — see `src/hub/routes.js`).

| Route | Purpose | Access |
|---|---|---|
| `/announcements`, `/announcements/<id>` | Public archive and notice page (`/resources/notices` redirects) | Public, sanitized copies only |
| `/hub/announcements` | Personal feed: important first, filters, "Needs my response" | Signed in, audience-matched |
| `/hub/announcements/:id` | Notice detail, "I acknowledge" | Recipients; author; office |
| `/hub/notifications` (`?tab=preferences`) | Notification Centre: All · Unread · Important · Actions · Archived · Preferences | Own records |
| `/hub/teacher/announcements` (+ `/new`, `/:id`, `/:id/edit`) | Teacher workspace (own notices, own classes) | Teaching roles |
| `/hub/admin/communications` (+ `/new`, `/:id`, `/:id/edit`) | Office workspace: tabs, editor, review, delivery & acknowledgement report | Admin hub |
| Header bell | Latest 6, unread count, links to centre and preferences | Every signed-in user |

## 3. Capabilities and approval policy

Capabilities follow Part 2 §4 (`functions/connect-model.js`, `ROLE_CAPABILITIES`). Default decision is deny.

- **School Admin, Leadership, Super Admin** publish directly. **P1 Emergency** needs Leadership/Super Admin (`connect.announcement.priority.critical`); an admin's P1 is submitted and Leadership approves.
- **Academic Coordinator** approves and publishes Standard/class notices; whole-school needs the office.
- **Content Editor** drafts and submits; does not publish.
- **Teachers** publish routine (P3/P4, teacher categories, unpinned) notices to their own classes (`publishKeys`, incl. parents-only). Anything wider is submitted for approval. Teachers can't address individuals.
- **Technical Administrator** sees delivery diagnostics and can retry jobs; no editorial access.
- A reviewer may approve only what they could publish themselves. Approval is tied to a revision; editing after approval returns the notice to draft.

## 4. Data contract

`announcements/{id}` — `schemaVersion: 2`, `type` (announcement|circular), `status`
(draft · pending_review · approved · scheduled · published · expired · archived · cancelled · rejected), `category`,
`priority` (P1–P4), `title`, `summary`, `body` (plain text), `audienceKeys`, `channels`, `publicListing`, `pinned`,
`action {type,label,href,deadline}`, `requiresAcknowledgement`, `acknowledgementDeadline`, `expiresAt` (school date),
`effectiveDate`, `issuingDepartment`, `reference` (`SRSS/CIR/2027/004`, assigned on first publication), `publishAt`,
`revision`, `approvedRevision`, `deliveryRevision`, `createdBy/approvedBy/publishedBy` (+ names), timestamps, rejection and
cancellation reasons. Revisions are snapshotted at `announcements/{id}/revisions/{n}` when approved or published.

| Collection | Key | Written by |
|---|---|---|
| `notificationRecords/{id}` | `announcement_<id>_<uid>` (rev 1), `announcement_<id>_r<n>_<uid>`, `review_…`, `ackReminder_<id>_r<n>_<date>_<uid>` | Server; owner may set only `readAt`/`archivedAt` |
| `announcementAcknowledgements/{id}` | `<announcementId>_r<revision>_<uid>` | Server (`acknowledge`) |
| `communicationDeliveryJobs/{id}` | `<announcementId>_r<revision>_inApp` | Server; cursor, counts, attempts, last error |
| `notificationPreferences/{uid}` | — | Owner (optional categories, language) |
| `connectCounters/circulars-<year>` | — | Server |

## 5. Backend

- `connect` callable — actions `save`, `submit`, `withdraw`, `publish`, `approve`, `reject`, `cancel`, `archive`,
  `acknowledge`, `preview` (estimated reach, counts only), `report`, `remind`, `retry`. Errors carry the spec codes
  (`CONNECT_PERMISSION_DENIED`, `CONNECT_REVISION_CONFLICT`, …) in `details.code`.
- `deliverAnnouncement` trigger — syncs the public copy; when a notice becomes published (or a new revision asks to notify
  again) runs the delivery job: batches of 100, cursor persisted, each batch re-checks the notice is still live,
  deterministic ids (no duplicates on retry), muted optional categories skipped.
- `publishScheduledAnnouncements` (every 15 min, Asia/Kuala_Lumpur) — publishes due scheduled notices, expires past ones,
  sends one acknowledgement reminder the day before a deadline, resumes stuck or retry-pending jobs (backoff 1/5/15/60 min, then failed).

## 6. Tests

- `tests/connect.test.mjs` — UT-001…015, decision-level SEC-005/006/007, preferences, public sanitizing, feed order.
- `tests/rules/connect.rules.test.mjs` — real service + real rules on the emulator: SEC-003…011, INT-001…011, E2E-001/002/004 at the data layer.
- `tests/e2e/journey.test.mjs` — the teacher's class notice now goes through the deployed-style `connect` function and the trigger delivers it.

## 7. Open items for the School

- Retention periods for notifications, delivery jobs and acknowledgements (Part 1 §20) — owner: privacy steward.
- An escalation procedure outside the hub for genuinely time-critical incidents (Part 1 §4): in-app delivery is not proof of receipt.
- Email/Google Groups delivery, push, translations — later phases.
- Deployment needs rules, indexes (none new) and functions (`connect`, updated trigger and scheduler) deployed together, because clients can no longer write notices.
