# SRSS Digital Hub — legal pages: verification before commit and merge

Last updated 13 October 2026. **Status: draft.** Every policy shows a “Draft for review” banner while `LEGAL_STATUS = "draft"` in `src/legal/registry.js`. Change it to `"published"` once the short list in section 4 is done.

**Guiding rule (user decision): keep digitalisation simple.** The school admin should never face a tiresome process. Prefer one clear step over several, reuse what the School already holds (enrolment records, existing parent emails), and do not add approvals or forms unless the law requires them.

| Where | What |
|---|---|
| `/legal` | Index: grouped policies, the urgent safeguarding box (DSL name and phone, 999, Talian Kasih), and the approved “About SRSS Digital Hub” wording |
| `/legal/{slug}` | Eleven policies; the order and titles are in `src/legal/registry.js` |
| `src/legal/content/{slug}.md` | Policy text in plain Markdown, so the School and counsel can edit it directly |
| `src/legal/registry.js` | One date, status, School contact, the DSL, the DPO and emergency lines |
| Site footer | Three policy groups, a “Worried about a child’s safety?” link to the DSL contacts, and the SSIOM copyright line |

## 1. Decisions applied

- **One date on every page:** “Effective date (last revised date): 23rd November 2026”, the MySAIYa format.
- **Safeguarding leads:**
  - **DSL:** Mr Ravi Balan, Senior Assistant for Administration / Academic (+60 16-290 3300, ravi.srss@ssiomya.com).
  - **Deputy DSL I:** the School Counsellor, Ms Pravina.
  - **Deputy DSL II:** the Senior Assistant for Co-curriculum (to be appointed).
- **Data protection:**
  - **DPO:** Ms Vasanthi, Senior Assistant for Student Affairs (vasanthi.srss@ssiomya.com).
  - **Deputy DPO:** the School Data Teacher.
- **Concerns about the Principal:** the Chair of the Board of Governors, Dr Maniam, or Board member Santosh Govind (National Treasurer of SSIOM). They appear in the Child Protection, Online Safeguarding, Complaints and Parental Consent policies.
- **Records retention:** the School’s periods are published as Schedule A of the Data Protection policy, and the safeguarding periods are repeated in Child Protection §21.
- **New policy:** the School-wide **Child Protection & Safeguarding Policy** (`/legal/child-safeguarding`), built from the School’s text. The digital policy is now titled “Child Protection & Online Safeguarding Policy” (`/legal/online-safeguarding`) and defers to it. There are now eleven policies.

## 2. Child protection text: UK references changed for Malaysia

The supplied child protection text came from a UK school template: “staff children’s” was a find-and-replace of “pupils”, and it cited UK bodies and laws. Publishing those as if they applied in Malaysia would be wrong, so they were adapted as follows. **Please check each one.**

| Supplied text | Published as | Why |
|---|---|---|
| “Education Act 2002” and “section 157 of the Education Act 2002” | **Education Act 1996 (Act 550)**; the section number was dropped | The Education Act 2002 and its s157 duty are English law. Malaysia’s Act is the Education Act 1996. |
| “Criminal Procedure Code 1976” | Criminal Procedure Code (Act 593) | Malaysia’s Code is Act 593 |
| Act numbers | Added: Child Act 2001 (Act 611); Adoption Act 1952 (Act 257); Child Care Centres Act 1984 (Act 308); Children and Young Persons (Employment) Act 1966 (Act 350); Domestic Violence Act 1994 (Act 521); Islamic Family Law (Federal Territories) Act 1984 (Act 303) | Consistency with the other policies |
| “staff children’s” | pupils | Template artefact |
| “Directors”, “Board of Directors”, “Head”, “senior and top management” | Board of Governors; Principal | SRSS titles |
| Disclosure and Barring Service (DBS), Local Authority Designated Officer, the “report to DBS within one month” duty, and settlement agreements being a “criminal offence” | Suitability checks with, and reports to, “the relevant Malaysian authorities”; the School “will not enter into any settlement that would prevent such a report” | UK bodies and UK legal duties. **Confirm the Malaysian checks used**, for example PDRM vetting and JKM’s register of child sex offenders. |
| “section 47 Children Act 1989 enquiries”, “children’s social care”, “Keeping children safe in education”, the “What to do if you’re worried…” footnote | JKM enquiries and police investigations; references removed | UK law and guidance |
| PSHE; “sex and relationships advice” | Health Education, with age-appropriate personal safety and online safety education | Malaysian primary curriculum |
| “Common Room Handbook”; “Information for New Staff children’s and Parents” booklet | The School’s guidance for staff; this policy is published on the website | Generic, because those document names are not confirmed |
| NSPCC Designated Safeguarding Lead training “or similar” | “or equivalent” | Kept: it is a training standard, not a law |

**Separate documents the policy refers to:** the whistleblowing procedure, physical intervention (reasonable force), anti-bullying, complaints and attendance. Please confirm each exists. If one does not, the sentence that mentions it should be removed.

## 3. Malaysian data protection law (desk review — not legal advice)

Under the 2024 amendments to the Personal Data Protection Act, phased in during 2025:

- **DPO.** The School has now appointed one. If SRSS is above the Commissioner’s thresholds, the appointment must also be notified to the Commissioner. The policies say this will be done “where applicable law requires”.
- **Breach notification** is now mandatory. Secondary sources report 72 hours to notify the Commissioner; this is not verified against the statute. The policies promise “the applicable criteria and timelines” and name no hours, so they stay correct.
- **Cross-border transfers** now follow risk-based conditions. The platform runs in Google Cloud’s **Singapore** region, which Cookies Schedule A and the Privacy Policy disclose. The legal basis should be noted once, by counsel.

Sources (secondary summaries):
- [DLA Piper](https://www.dlapiperdataprotection.com/index.html?t=law&c=MY)
- [Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2025/07/from-legislative-reform-to-practical-guidance-key-amendments-to-malaysias-pdpa-and-the-launch-of-cross-border-transfer-guidelines)
- [Christopher & Lee Ong](https://www.christopherleeong.com/viewpoints/launch-of-personal-data-protection-guideline-for-cross-border-data-transfers/)
- [Nagashima](https://www.nagashima.com/en/publications/publication20250527-2/)
- [Legal That Works](https://www.legalthatworks.com/blog/pdpa-compliance-malaysia-2024-amendment-act)

## 4. Still to do before the draft banner comes off

Kept to the minimum:

1. **A direct contact for Dr Maniam and Santosh Govind.** The table currently says “Through the School office”, but the office reports to the Principal. One email address is enough, for example a Board inbox.
2. **Check the UK-to-Malaysia changes** in section 2, and confirm that the separate documents exist.
3. **One review by Malaysian counsel** of all eleven pages, including the DPO notification, the breach timeline and the Singapore transfer basis.
4. **Approve the short child protection notice** that appears on every page (component E).

Built into the hub (13 Oct 2026):

- **Parents** tick “I have read the Terms of Use and Privacy Policy” when saving their consent choices.
- **Sign-in page:** links to both policies and to the safeguarding contacts.
- **Staff:** confirm a one-time confidentiality and acceptable-use acknowledgement.
- **Families without an account:** get a printable form, and the office enters the signed answers in one step.

Not built: an alumni photograph and testimonial permission form, because there are no alumni accounts yet.

## 5. Technologies in use (checked against the code)

Cookies Schedule A lists only what the code actually uses:
- Firebase sign-in, stored in browser storage.
- Two local settings: the sign-in email and the last hub opened.
- Google sign-in, Firestore, Storage and Functions, all in Singapore.
- Google Fonts.
- The homepage Google Map.
- YouTube in privacy-enhanced mode, loaded only after pressing play.

There are **no analytics, advertising or tracking tools**. Re-check at go-live, because hosting is not deployed yet.

Optional improvements: load the map only when tapped, and host the fonts ourselves.

## 6. Retention categories not yet covered

The School’s schedule covers pupil, safeguarding, staff and CCTV records. When convenient, the School may add periods for:
- Admissions enquiries that did not lead to enrolment.
- Consent records.
- Fee and accounting records (7 years is the usual tax requirement).
- Hub sign-in and audit logs.
- Published photos and the SRSS25 archive.

Until then these follow the general rule in Data Protection §15: kept only as long as needed.
