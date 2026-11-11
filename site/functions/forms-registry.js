// SRSS Forms, Submissions & Response Management System — the master form registry.
// One entry per form or workflow (A01–L10, 194 in all) from the School's "Forms, Submissions & Response
// Management System" specification (Nov 2026), plus B16–B18 for the family policies the School added after it
// (Parent–School Partnership Agreement, Vegetarian Food and School Activities Policy): who uses it, where it lives, where its data is stored, the
// person-in-charge (PIC) and backup, how people are notified, the response target and the data class.
//
// Shared by Cloud Functions (validation, routing, deadlines, reminders) and the hub (Forms & Response
// Centre, My requests). Plain JS with no imports so both can load it; `npm test` checks its integrity.
//
// Routing and ownership are the specification's defaults, pending SRSS leadership approval. The School
// changes them in Forms & Response Centre › Workflow rules (settings/formsRouting), not in this file.
// Response targets are proposals, not adopted or statutory deadlines.

// [id, priority, title, intended user, frontend entry, store, PIC, backup, notify, reply, action, target, classification]
const ROWS = [
  ["A01", "P1", "General School Enquiry / Contact Form", "Public", "Public → Contact", "formSubmissions", "School Administrator", "School Administrator", "pic", "review", "Reply / close", "2d", "confidential"],
  ["A02", "P1", "New Student Admission Enquiry Form", "Public", "Public → Admissions → Enquire", "admissionEnquiries", "Admissions Officer", "School Administrator", "pic", "review", "Contact / qualify / progress", "3d", "confidential"],
  ["A03", "P1", "School Visit / Campus Tour Request", "Public", "Public → Admissions → Visit SRSS", "admissionEnquiries", "Admissions Officer", "School Administrator", "pic", "decision", "Schedule / confirm", "2d", "confidential"],
  ["A04", "P1", "Student Admission Application / Registration Form", "Parent", "Admissions → Apply", "applications", "Admissions Officer", "School Administrator", "pic", "decision", "Review / decision", "3d", "confidential"],
  ["A05", "P1", "Admission Supporting Documents Submission", "Parent", "Admissions → Application Portal", "applicationDocuments", "Admissions Officer", "School Administrator", "pic", "review", "Verify documents", "3d", "confidential"],
  ["A06", "P1", "Parent / Guardian Information Form", "Parent", "Public / Admissions → Parent / Guardian Information Form", "formSubmissions → admissions", "Admissions Officer", "School Administrator", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["A07", "P1", "Emergency Contact & Authorised Collection Form", "Parent", "Public / Admissions → Emergency Contact & Authorised Collection Form", "formSubmissions → admissions", "Admissions Officer", "School Administrator", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["A08", "P1", "Student Medical, Allergy & Dietary Information Form", "Parent", "Admissions → Medical Information", "applications (restricted medical section)", "Admissions Officer / Authorised Health PIC", "School Administrator", "pic", "review", "Verify / restrict", "2d", "restricted"],
  ["A09", "P1", "Admission Interview / Assessment Record", "Admin / Teacher", "Admin → Admissions → Assessment", "applicationActions", "Admissions Officer / Assessor", "School Administrator", "exception", "record", "Record outcome", "3d", "confidential"],
  ["A10", "P1", "Admission Decision / Offer Acceptance Form", "Parent", "Admissions → Offer", "applicationActions", "Admissions Officer", "School Administrator", "pic", "review", "Confirm acceptance", "3d", "confidential"],
  ["A11", "P1", "New Parent Onboarding Checklist", "Parent / Admin", "Public / Admissions → New Parent Onboarding Checklist", "formSubmissions → admissions", "Admissions Officer", "School Administrator", "exception", "record", "Review / respond / close", "operational", "confidential"],
  ["A12", "P1", "New Student Orientation Acknowledgement", "Parent", "Public / Admissions → New Student Orientation Acknowledgement", "formSubmissions → admissions", "Admissions Officer", "School Administrator", "confirmation", "ack", "Review / respond / close", "immediate", "confidential"],
  ["A13", "P1", "Parent Communication Preferences Form", "Parent", "Public / Admissions → Parent Communication Preferences Form", "formSubmissions → admissions", "Admissions Officer", "School Administrator", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["A14", "P2", "New Staff Onboarding Checklist", "Staff / Admin", "Public / Admissions → New Staff Onboarding Checklist", "formSubmissions → admissions", "Admissions Officer", "School Administrator", "exception", "record", "Review / respond / close", "operational", "confidential"],
  ["A15", "P2", "New Teacher Onboarding Checklist", "Teacher / Admin", "Public / Admissions → New Teacher Onboarding Checklist", "formSubmissions → admissions", "Admissions Officer", "School Administrator", "exception", "record", "Review / respond / close", "operational", "confidential"],
  ["A16", "P2", "Student Withdrawal / Transfer Request", "Parent", "Public / Admissions → Student Withdrawal / Transfer Request", "formSubmissions → admissions", "Admissions Officer", "School Administrator", "pic", "decision", "Review / respond / close", "2d", "confidential"],
  ["A17", "P2", "Student Exit / Clearance Checklist", "Admin", "Public / Admissions → Student Exit / Clearance Checklist", "formSubmissions → admissions", "Admissions Officer", "School Administrator", "exception", "record", "Review / respond / close", "operational", "confidential"],
  ["A18", "P2", "Admission Application Withdrawal Form", "Parent", "Public / Admissions → Admission Application Withdrawal Form", "formSubmissions → admissions", "Admissions Officer", "School Administrator", "pic", "decision", "Review / respond / close", "3d", "confidential"],
  ["B01", "P1", "Parent / Guardian Contact Update Form", "Parent", "Parent Hub → Parent / Guardian Contact Update Form", "formSubmissions → parentRelations", "School Administrator", "Parent Liaison", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["B02", "P1", "Student Information Correction / Update Request", "Parent", "Parent Hub → Student Information Correction / Update Request", "formSubmissions → parentRelations", "School Administrator", "Parent Liaison", "pic", "decision", "Review / respond / close", "2d", "confidential"],
  ["B03", "P1", "Emergency Contact / Collection Arrangement Update", "Parent", "Parent Hub → Emergency Contact / Collection Arrangement Update", "formSubmissions → parentRelations", "School Administrator", "Parent Liaison", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["B04", "P1", "Parent Communication Preferences Update", "Parent", "Parent Hub → Parent Communication Preferences Update", "formSubmissions → parentRelations", "School Administrator", "Parent Liaison", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["B05", "P1", "Student Absence Notification / Explanation", "Parent", "Parent → Attendance → Notify Absence", "formSubmissions → attendance review", "Class Teacher", "Parent Liaison", "pic", "review", "Verify; update attendance", "sameDay", "confidential"],
  ["B06", "P2", "Parent-Teacher Meeting Request", "Parent", "Parent Hub → Parent-Teacher Meeting Request", "formSubmissions → parentRelations", "School Administrator", "Parent Liaison", "pic", "decision", "Review / respond / close", "2d", "confidential"],
  ["B07", "P2", "Parent-Teacher Meeting Record / Follow-Up", "Teacher", "Parent Hub → Parent-Teacher Meeting Record / Follow-Up", "formSubmissions → parentRelations", "School Administrator", "Parent Liaison", "exception", "record", "Review / respond / close", "operational", "confidential"],
  ["B08", "P1", "Parent Feedback & Suggestions Form", "Parent", "Parent Hub → Parent Feedback & Suggestions Form", "formSubmissions → parentRelations", "School Administrator", "Parent Liaison", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["B09", "P1", "Parent Complaint / Grievance Form", "Parent", "Parent → Confidential Feedback", "restrictedCases", "Headmistress / Independent Delegate", "Parent Liaison", "restricted", "review", "Investigate / reply", "2d", "restricted"],
  ["B10", "P1", "Parent Testimonial Submission", "Parent", "Parent → Share Your Story", "formSubmissions → CMS", "Content Editor", "Parent Liaison", "pic", "review", "Consent check / editorial review", "2d", "confidential"],
  ["B11", "P2", "Parent FAQ / Question Submission", "Parent", "Parent Hub → Parent FAQ / Question Submission", "formSubmissions → parentRelations", "School Administrator", "Parent Liaison", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["B12", "P1", "Parent Acknowledgement of School Circular / Notice", "Parent", "Parent Hub → Parent Acknowledgement of School Circular / Notice", "formSubmissions → parentRelations", "School Administrator", "Parent Liaison", "confirmation", "ack", "Review / respond / close", "immediate", "confidential"],
  ["B13", "P2", "Parent Volunteer / School Support Interest", "Parent", "Parent Hub → Parent Volunteer / School Support Interest", "formSubmissions → parentRelations", "School Administrator", "Parent Liaison", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["B14", "P2", "Parent Request for School Documents / Certification", "Parent", "Parent Hub → Parent Request for School Documents / Certification", "formSubmissions → parentRelations", "School Administrator", "Parent Liaison", "pic", "decision", "Review / respond / close", "2d", "confidential"],
  ["B15", "P2", "Parent Communication / Meeting Follow-Up Record", "Staff / Teacher", "Parent Hub → Parent Communication / Meeting Follow-Up Record", "formSubmissions → parentRelations", "School Administrator", "Parent Liaison", "exception", "record", "Review / respond / close", "operational", "confidential"],
  // Added for the School's family policies (Nov 2026), after the specification.
  ["B16", "P1", "Parent–School Partnership & Shared Values Agreement", "Parent", "Public → Parent–School Partnership → Read and agree", "formSubmissions → parentRelations", "School Administrator", "Headmistress / Delegate", "confirmation", "ack", "Record agreement", "immediate", "confidential"],
  ["B17", "P2", "School Event / Celebration Food Check", "Public / Parent / Visitor", "Public → Vegetarian Food → Check food for an event", "formSubmissions → parentRelations", "School Administrator", "Headmistress / Delegate", "pic", "review", "Advise / confirm", "2d", "confidential"],
  ["B18", "P1", "Medically Necessary Dietary Arrangement Request", "Parent", "Parent → Vegetarian Food → Dietary arrangement", "restricted dietary requests", "Admissions Officer / Authorised Health PIC", "School Administrator", "pic", "decision", "Consider arrangement / reply privately", "2d", "restricted"],
  ["C01", "P1", "Student Photography / Video Consent", "Parent", "Consent Hub → Student Photography / Video Consent", "consentRecords", "Privacy / Consent Steward", "Authorised Administrator", "confirmation", "ack", "Record / verify / audit", "immediate", "confidential"],
  ["C02", "P1", "Internal Student Portfolio Sharing Consent", "Parent", "Consent Hub → Internal Student Portfolio Sharing Consent", "consentRecords", "Privacy / Consent Steward", "Authorised Administrator", "confirmation", "ack", "Record / verify / audit", "immediate", "confidential"],
  ["C03", "P1", "Public Portfolio / Student Showcase Consent", "Parent", "Consent Hub → Public Portfolio / Student Showcase Consent", "consentRecords", "Privacy / Consent Steward", "Authorised Administrator", "confirmation", "ack", "Record / verify / audit", "immediate", "confidential"],
  ["C04", "P1", "Website Directory / Student Profile Publication Consent", "Parent", "Consent Hub → Website Directory / Student Profile Publication Consent", "consentRecords", "Privacy / Consent Steward", "Authorised Administrator", "confirmation", "ack", "Record / verify / audit", "immediate", "confidential"],
  ["C05", "P1", "Digital Communications Consent", "Parent", "Consent Hub → Digital Communications Consent", "consentRecords", "Privacy / Consent Steward", "Authorised Administrator", "confirmation", "ack", "Record / verify / audit", "immediate", "confidential"],
  ["C06", "P1", "Data Privacy Notice Acknowledgement", "Parent / Staff", "Consent Hub → Data Privacy Notice Acknowledgement", "consentRecords", "Privacy / Consent Steward", "Authorised Administrator", "confirmation", "ack", "Record / verify / audit", "immediate", "confidential"],
  ["C07", "P1", "Event-Specific Photography / Media Consent", "Parent", "Consent Hub → Event-Specific Photography / Media Consent", "consentRecords", "Privacy / Consent Steward", "Authorised Administrator", "confirmation", "ack", "Record / verify / audit", "immediate", "confidential"],
  ["C08", "P1", "SRSS25 Anniversary Feature / Publication Consent", "Parent", "Consent Hub → SRSS25 Anniversary Feature / Publication Consent", "consentRecords", "Privacy / Consent Steward", "Authorised Administrator", "confirmation", "ack", "Record / verify / audit", "immediate", "confidential"],
  ["C09", "P1", "School Excursion / Activity Participation Consent", "Parent", "Consent Hub → School Excursion / Activity Participation Consent", "consentRecords", "Privacy / Consent Steward", "Authorised Administrator", "confirmation", "ack", "Record / verify / audit", "immediate", "confidential"],
  ["C10", "P1", "Consent Withdrawal / Revision Request", "Parent", "Consent Hub → Consent Withdrawal / Revision Request", "consentRecords", "Privacy / Consent Steward", "Authorised Administrator", "confirmation", "ack", "Record / verify / audit", "immediate", "confidential"],
  ["C11", "P1", "Student Digital Platform / Acceptable Use Acknowledgement", "Parent / Student", "Consent Hub → Student Digital Platform / Acceptable Use Acknowledgement", "consentRecords", "Privacy / Consent Steward", "Authorised Administrator", "confirmation", "ack", "Record / verify / audit", "immediate", "confidential"],
  ["C12", "P1", "Staff Data Privacy & Confidentiality Acknowledgement", "Staff", "Consent Hub → Staff Data Privacy & Confidentiality Acknowledgement", "consentRecords", "Privacy / Consent Steward", "Authorised Administrator", "confirmation", "ack", "Record / verify / audit", "immediate", "confidential"],
  ["C13", "P1", "Staff Photography / Public Profile Consent", "Staff", "Consent Hub → Staff Photography / Public Profile Consent", "consentRecords", "Privacy / Consent Steward", "Authorised Administrator", "confirmation", "ack", "Record / verify / audit", "immediate", "confidential"],
  ["C14", "P1", "Personal Data Access / Correction Request", "Parent / Staff", "Parent / Staff → Privacy Requests", "privacyRequests", "Privacy Steward", "Authorised Administrator", "pic", "decision", "Verify identity / process", "2d", "confidential"],
  ["C15", "P1", "Consent Verification / Exception Review", "Admin", "Consent Hub → Consent Verification / Exception Review", "consentRecords", "Privacy / Consent Steward", "Authorised Administrator", "confirmation", "ack", "Record / verify / audit", "immediate", "confidential"],
  ["C16", "P2", "Annual Consent Review / Renewal", "Parent", "Consent Hub → Annual Consent Review / Renewal", "consentRecords", "Privacy / Consent Steward", "Authorised Administrator", "confirmation", "ack", "Record / verify / audit", "immediate", "confidential"],
  ["D01", "P1", "Teacher Profile Submission / Update", "Teacher", "Teacher → My Profile", "staff → CMS review", "Administration / Content Editor", "Academic Lead", "pic", "review", "Review / publish", "2d", "internal"],
  ["D02", "P1", "Class Overview Submission", "Teacher", "Teacher Hub → Class Overview Submission", "formSubmissions → academic", "Academic Coordinator", "Academic Lead", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["D03", "P1", "Syllabus / Term Curriculum Planning Template", "Teacher", "Teacher Hub → Syllabus / Term Curriculum Planning Template", "formSubmissions → academic", "Academic Coordinator", "Academic Lead", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["D04", "P2", "Lesson / Unit Planning Template", "Teacher", "Teacher Hub → Lesson / Unit Planning Template", "formSubmissions → academic", "Academic Coordinator", "Academic Lead", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["D05", "P2", "Weekly Lesson Plan", "Teacher", "Teacher Hub → Weekly Lesson Plan", "formSubmissions → academic", "Academic Coordinator", "Academic Lead", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["D06", "P1", "Student Portfolio Entry", "Teacher", "Teacher → Portfolio", "portfolioEntries", "Portfolio Lead / Moderator", "Academic Lead", "pic", "review", "Moderate / consent check", "2d", "confidential"],
  ["D07", "P1", "Student Achievement Submission", "Teacher", "Teacher → Achievements", "studentAchievements", "Academic Coordinator", "Academic Lead", "pic", "review", "Verify / publish if approved", "2d", "confidential"],
  ["D08", "P2", "Human Excellence / Human Values Observation", "Teacher", "Teacher → Student → Human Excellence", "humanValuesObservations", "Assigned Teacher / Academic Coordinator", "Academic Lead", "pic", "review", "Record / review", "2d", "internal"],
  ["D09", "P2", "Student Reflection Submission", "Student", "Teacher Hub → Student Reflection Submission", "formSubmissions → academic", "Academic Coordinator", "Academic Lead", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["D10", "P2", "Teacher Self-Reflection Form", "Teacher", "Teacher Hub → Teacher Self-Reflection Form", "formSubmissions → academic", "Academic Coordinator", "Academic Lead", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["D11", "P2", "Classroom Observation Form", "Academic Coordinator", "Teacher Hub → Classroom Observation Form", "formSubmissions → academic", "Academic Coordinator", "Academic Lead", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["D12", "P2", "Teacher KPI / Performance Review", "Academic Coordinator", "Teacher Hub → Teacher KPI / Performance Review", "formSubmissions → academic", "Academic Coordinator", "Academic Lead", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["D13", "P2", "Student Learning Support Referral", "Teacher", "Teacher → Student Support", "studentSupportPlans", "Academic Coordinator", "Academic Lead", "pic", "review", "Triage / plan", "2d", "confidential"],
  ["D14", "P2", "Student Support / Intervention Plan", "Teacher / Coordinator", "Teacher → Student Support", "studentSupportPlans", "Assigned Support Lead", "Academic Lead", "pic", "review", "Approve plan", "2d", "confidential"],
  ["D15", "P2", "Student Support Progress / Review", "Teacher", "Teacher → Student Support", "studentSupportSessions", "Assigned Support Lead", "Academic Lead", "pic", "review", "Review progress", "2d", "confidential"],
  ["D16", "P2", "Assessment / Examination Marks Submission", "Teacher", "Teacher → Assessment", "studentResults", "Academic Coordinator", "Academic Lead", "exception", "record", "Moderate / publish", "operational", "internal"],
  ["D17", "P2", "Report Card Remarks Submission", "Teacher", "Teacher Hub → Report Card Remarks Submission", "formSubmissions → academic", "Academic Coordinator", "Academic Lead", "exception", "record", "Review / respond / close", "operational", "internal"],
  ["D18", "P2", "Assessment Moderation / Approval", "Academic Coordinator", "Teacher Hub → Assessment Moderation / Approval", "formSubmissions → academic", "Academic Coordinator", "Academic Lead", "pic", "decision", "Review / respond / close", "2d", "internal"],
  ["D19", "P2", "Student Academic Progress Review", "Teacher", "Teacher Hub → Student Academic Progress Review", "formSubmissions → academic", "Academic Coordinator", "Academic Lead", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["D20", "P2", "Classroom Resource Request", "Teacher", "Teacher Hub → Classroom Resource Request", "formSubmissions → academic", "Academic Coordinator", "Academic Lead", "pic", "decision", "Review / respond / close", "2d", "internal"],
  ["D21", "P1", "Student Attendance Register", "Teacher", "Teacher → My Class → Attendance", "attendanceSessions + attendanceRecords", "Class Teacher", "Academic Lead", "exception", "record", "Submit / verify exceptions", "operational", "confidential"],
  ["D22", "P1", "Student Attendance Correction Request", "Teacher / Admin", "Teacher → Attendance → Corrections", "attendanceRecords + auditLogs", "School Administrator", "Academic Lead", "pic", "decision", "Verify / correct", "2d", "confidential"],
  ["D23", "P2", "Teacher Professional Development Reflection", "Teacher", "Teacher Hub → Teacher Professional Development Reflection", "formSubmissions → academic", "Academic Coordinator", "Academic Lead", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["D24", "P2", "Academic Programme / Project Proposal", "Teacher", "Teacher Hub → Academic Programme / Project Proposal", "formSubmissions → academic", "Academic Coordinator", "Academic Lead", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["E01", "P1", "Staff Personal Information Update", "Staff", "Staff Hub → Staff Personal Information Update", "formSubmissions → staffOperations", "School Administrator", "Headmistress / Delegate", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["E02", "P2", "Staff Leave Application", "Staff", "Staff → Leave", "staffLeave", "Headmistress / Delegate", "Headmistress / Delegate", "pic", "decision", "Approve / reject", "3d", "confidential"],
  ["E03", "P1", "Staff Emergency Absence Notification", "Staff", "Staff Hub → Staff Emergency Absence Notification", "formSubmissions → staffOperations", "School Administrator", "Headmistress / Delegate", "pic", "review", "Review / respond / close", "sameDay", "confidential"],
  ["E04", "P2", "Staff Training / CPD Record Submission", "Staff", "Staff Hub → Staff Training / CPD Record Submission", "formSubmissions → staffOperations", "School Administrator", "Headmistress / Delegate", "exception", "record", "Review / respond / close", "operational", "confidential"],
  ["E05", "P2", "Staff Training / Professional Development Request", "Staff", "Staff Hub → Staff Training / Professional Development Request", "formSubmissions → staffOperations", "School Administrator", "Headmistress / Delegate", "pic", "decision", "Review / respond / close", "2d", "confidential"],
  ["E06", "P2", "Staff Appraisal / Development Plan", "Staff / Leadership", "Staff Hub → Staff Appraisal / Development Plan", "formSubmissions → staffOperations", "School Administrator", "Headmistress / Delegate", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["E07", "P2", "Staff Maintenance / Repair Request", "Staff", "Staff Hub → Staff Maintenance / Repair Request", "formSubmissions → staffOperations", "School Administrator", "Headmistress / Delegate", "pic", "decision", "Review / respond / close", "2d", "confidential"],
  ["E08", "P2", "Equipment / Asset Request", "Staff", "Staff Hub → Equipment / Asset Request", "formSubmissions → staffOperations", "School Administrator", "Headmistress / Delegate", "pic", "decision", "Review / respond / close", "2d", "confidential"],
  ["E09", "P1", "IT Support / Technical Assistance Request", "Staff", "Staff → Help → IT Support", "formSubmissions", "Technical Administrator", "Headmistress / Delegate", "pic", "decision", "Troubleshoot / close", "2d", "confidential"],
  ["E10", "P2", "Staff Confidential Grievance", "Staff", "Staff → Confidential Support", "restrictedCases", "Independent Designated Authority", "Headmistress / Delegate", "restricted", "review", "Investigate confidentially", "2d", "restricted"],
  ["E11", "P2", "Staff Employment Document Submission", "Staff", "Staff Hub → Staff Employment Document Submission", "formSubmissions → staffOperations", "School Administrator", "Headmistress / Delegate", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["E12", "P2", "Staff Exit / Handover Checklist", "Staff / Admin", "Staff Hub → Staff Exit / Handover Checklist", "formSubmissions → staffOperations", "School Administrator", "Headmistress / Delegate", "exception", "record", "Review / respond / close", "operational", "confidential"],
  ["E13", "P2", "Asset Assignment / Handover Record", "Staff / Admin", "Staff Hub → Asset Assignment / Handover Record", "formSubmissions → staffOperations", "School Administrator", "Headmistress / Delegate", "exception", "record", "Review / respond / close", "operational", "confidential"],
  ["E14", "P2", "Asset Maintenance / Condition Report", "Staff", "Staff Hub → Asset Maintenance / Condition Report", "formSubmissions → staffOperations", "School Administrator", "Headmistress / Delegate", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["E15", "P2", "Resource / Room Booking Request", "Staff", "Staff Hub → Resource / Room Booking Request", "formSubmissions → staffOperations", "School Administrator", "Headmistress / Delegate", "pic", "decision", "Review / respond / close", "2d", "confidential"],
  ["E16", "P2", "Staff Duty / Responsibility Acknowledgement", "Staff", "Staff Hub → Staff Duty / Responsibility Acknowledgement", "formSubmissions → staffOperations", "School Administrator", "Headmistress / Delegate", "confirmation", "ack", "Review / respond / close", "immediate", "confidential"],
  ["F01", "P3", "Library Membership / Rules Acknowledgement", "Student / Parent", "Library Hub → Library Membership / Rules Acknowledgement", "formSubmissions → library", "Librarian / Resource Lead", "School Administrator", "confirmation", "ack", "Review / respond / close", "immediate", "internal"],
  ["F02", "P3", "Book Borrowing / Return Record", "Librarian", "Library → Borrow / Return", "libraryLoans (future)", "Librarian", "School Administrator", "exception", "record", "Issue / return", "operational", "internal"],
  ["F03", "P3", "Book Reservation Request", "Student / Teacher", "Library → Reserve", "libraryReservations (future)", "Librarian", "School Administrator", "pic", "decision", "Reserve / fulfil", "2d", "internal"],
  ["F04", "P3", "Class Teaching Resource Request", "Teacher", "Library Hub → Class Teaching Resource Request", "formSubmissions → library", "Librarian / Resource Lead", "School Administrator", "pic", "decision", "Review / respond / close", "2d", "internal"],
  ["F05", "P3", "Resource Centre / Library Space Booking", "Teacher / Staff", "Library Hub → Resource Centre / Library Space Booking", "formSubmissions → library", "Librarian / Resource Lead", "School Administrator", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["F06", "P3", "Student Librarian Application", "Student", "Library Hub → Student Librarian Application", "formSubmissions → library", "Librarian / Resource Lead", "School Administrator", "pic", "decision", "Review / respond / close", "3d", "confidential"],
  ["F07", "P3", "Student Librarian / Library Prefect Duty Roster", "Librarian", "Library Hub → Student Librarian / Library Prefect Duty Roster", "formSubmissions → library", "Librarian / Resource Lead", "School Administrator", "exception", "record", "Review / respond / close", "operational", "confidential"],
  ["F08", "P3", "Lost / Damaged Book or Resource Report", "Student / Staff", "Library Hub → Lost / Damaged Book or Resource Report", "formSubmissions → library", "Librarian / Resource Lead", "School Administrator", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["F09", "P3", "Reading Programme Registration", "Student / Parent", "Library Hub → Reading Programme Registration", "formSubmissions → library", "Librarian / Resource Lead", "School Administrator", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["F10", "P3", "Book / Resource Recommendation", "Student / Teacher", "Library Hub → Book / Resource Recommendation", "formSubmissions → library", "Librarian / Resource Lead", "School Administrator", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["F11", "P3", "Library Inventory / Stock Verification", "Librarian", "Library Hub → Library Inventory / Stock Verification", "formSubmissions → library", "Librarian / Resource Lead", "School Administrator", "exception", "record", "Review / respond / close", "operational", "internal"],
  ["F12", "P3", "Student Librarian Appointment / Acceptance", "Student / Parent", "Library Hub → Student Librarian Appointment / Acceptance", "formSubmissions → library", "Librarian / Resource Lead", "School Administrator", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["F13", "P3", "Library Activity / Reading Progress Record", "Student / Librarian", "Library Hub → Library Activity / Reading Progress Record", "formSubmissions → library", "Librarian / Resource Lead", "School Administrator", "exception", "record", "Review / respond / close", "operational", "internal"],
  ["G01", "P1", "General Event Registration", "Public / Parent", "Public / Parent → Events → Register", "registrations", "Event Organiser", "School Administrator", "pic", "review", "Confirm / waitlist", "2d", "internal"],
  ["G02", "P2", "Extracurricular Activity Registration", "Parent", "Events Hub → Extracurricular Activity Registration", "formSubmissions → events", "Event Organiser", "School Administrator", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["G03", "P1", "Parent Participation Permission / Consent", "Parent", "Events Hub → Parent Participation Permission / Consent", "formSubmissions → events", "Event Organiser", "School Administrator", "confirmation", "ack", "Review / respond / close", "immediate", "internal"],
  ["G04", "P1", "Activity-Specific Medical / Dietary Disclosure", "Parent", "Parent → Event → Medical Details", "registrations (restricted health data)", "Event Organiser / Authorised Health PIC", "School Administrator", "pic", "review", "Review accommodations", "2d", "restricted"],
  ["G05", "P1", "Event Photography / Media Consent", "Parent", "Parent → Event → Media Consent", "consentRecords", "Consent Steward", "School Administrator", "confirmation", "ack", "Record choice", "immediate", "internal"],
  ["G06", "P1", "Emergency Contact Confirmation", "Parent", "Events Hub → Emergency Contact Confirmation", "formSubmissions → events", "Event Organiser", "School Administrator", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["G07", "P1", "Activity Collection / Pickup Arrangement", "Parent", "Events Hub → Activity Collection / Pickup Arrangement", "formSubmissions → events", "Event Organiser", "School Administrator", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["G08", "P1", "Teacher / Adult Supervisor Safety Checklist", "Teacher / Staff", "Events Hub → Teacher / Adult Supervisor Safety Checklist", "formSubmissions → events", "Event Organiser", "School Administrator", "exception", "record", "Review / respond / close", "operational", "internal"],
  ["G09", "P1", "Activity Attendance Register", "Teacher / Organiser", "Events Hub → Activity Attendance Register", "formSubmissions → events", "Event Organiser", "School Administrator", "exception", "record", "Review / respond / close", "operational", "internal"],
  ["G10", "P1", "Event / Activity Incident Report", "Staff", "Staff → Safety → Incident", "studentIncidents / restrictedCases", "Safety Lead", "School Administrator", "restricted", "triage", "Triage immediately", "triage", "internal"],
  ["G11", "P2", "Post-Event Reflection / Report", "Event Organiser", "Events Hub → Post-Event Reflection / Report", "formSubmissions → events", "Event Organiser", "School Administrator", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["G12", "P2", "Volunteer / Chaperone Registration & Declaration", "Parent / Volunteer", "Events Hub → Volunteer / Chaperone Registration & Declaration", "formSubmissions → events", "Event Organiser", "School Administrator", "confirmation", "review", "Review / respond / close", "immediate", "internal"],
  ["G13", "P2", "Event Proposal / Approval Request", "Staff", "Events Hub → Event Proposal / Approval Request", "formSubmissions → events", "Event Organiser", "School Administrator", "pic", "decision", "Review / respond / close", "2d", "internal"],
  ["G14", "P2", "Event Feedback Form", "Parent / Participant", "Events Hub → Event Feedback Form", "formSubmissions → events", "Event Organiser", "School Administrator", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["G15", "P2", "Event Resource / Equipment Request", "Organiser", "Events Hub → Event Resource / Equipment Request", "formSubmissions → events", "Event Organiser", "School Administrator", "pic", "decision", "Review / respond / close", "2d", "internal"],
  ["G16", "P2", "Event Volunteer Duty Assignment", "Organiser", "Events Hub → Event Volunteer Duty Assignment", "formSubmissions → events", "Event Organiser", "School Administrator", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["G17", "P2", "Event Attendance / Participation Confirmation", "Organiser", "Events Hub → Event Attendance / Participation Confirmation", "formSubmissions → events", "Event Organiser", "School Administrator", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["G18", "P2", "Excursion Risk Assessment / Safety Plan", "Organiser", "Events Hub → Excursion Risk Assessment / Safety Plan", "formSubmissions → events", "Event Organiser", "School Administrator", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["G19", "P2", "Event Cancellation / Registration Withdrawal", "Parent / Participant", "Events Hub → Event Cancellation / Registration Withdrawal", "formSubmissions → events", "Event Organiser", "School Administrator", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["G20", "P2", "Event Media / Photograph Submission", "Staff", "Events Hub → Event Media / Photograph Submission", "formSubmissions → events", "Event Organiser", "School Administrator", "pic", "rights", "Review / respond / close", "2d", "internal"],
  ["H01", "P1", "Student Incident Report", "Teacher / Staff", "Safety Hub → Student Incident Report", "studentIncidents / restrictedCases", "Designated Safeguarding / Safety Lead", "Headmistress / Independent Authority", "restricted", "triage", "Triage / investigate / document", "triage", "restricted"],
  ["H02", "P1", "Staff Incident Report", "Staff", "Safety Hub → Staff Incident Report", "studentIncidents / restrictedCases", "Designated Safeguarding / Safety Lead", "Headmistress / Independent Authority", "restricted", "triage", "Triage / investigate / document", "triage", "restricted"],
  ["H03", "P2", "Student Behaviour / Discipline Report", "Teacher", "Safety Hub → Student Behaviour / Discipline Report", "studentIncidents / restrictedCases", "Designated Safeguarding / Safety Lead", "Headmistress / Independent Authority", "pic", "review", "Triage / investigate / document", "2d", "restricted"],
  ["H04", "P1", "Injury / Accident Report", "Staff", "Safety Hub → Injury / Accident Report", "studentIncidents / restrictedCases", "Designated Safeguarding / Safety Lead", "Headmistress / Independent Authority", "restricted", "review", "Triage / investigate / document", "triage", "restricted"],
  ["H05", "P1", "Safeguarding Concern Report", "Authorised Staff", "Restricted → Report Safeguarding Concern", "restrictedSafeguardingCases", "Designated Safeguarding Lead", "Headmistress / Independent Authority", "restricted", "triage", "Immediate triage / escalate", "triage", "restricted"],
  ["H06", "P1", "Bullying Complaint / Concern Report", "Parent / Staff", "Parent / Staff → Bullying Concern", "restrictedCases", "Designated Safeguarding Lead", "Headmistress / Independent Authority", "restricted", "triage", "Assess / investigate", "triage", "restricted"],
  ["H07", "P2", "Property Damage / Loss Report", "Staff / Parent", "Safety Hub → Property Damage / Loss Report", "studentIncidents / restrictedCases", "Designated Safeguarding / Safety Lead", "Headmistress / Independent Authority", "pic", "review", "Triage / investigate / document", "2d", "restricted"],
  ["H08", "P1", "Witness Statement Form", "Authorised User", "Safety Hub → Witness Statement Form", "studentIncidents / restrictedCases", "Designated Safeguarding / Safety Lead", "Headmistress / Independent Authority", "pic", "review", "Triage / investigate / document", "2d", "restricted"],
  ["H09", "P1", "Incident Follow-Up / Resolution Log", "Designated PIC", "Safety Hub → Incident Follow-Up / Resolution Log", "studentIncidents / restrictedCases", "Designated Safeguarding / Safety Lead", "Headmistress / Independent Authority", "restricted", "triage", "Triage / investigate / document", "triage", "restricted"],
  ["H10", "P1", "Parent Notification / Incident Acknowledgement", "Parent", "Safety Hub → Parent Notification / Incident Acknowledgement", "studentIncidents / restrictedCases", "Designated Safeguarding / Safety Lead", "Headmistress / Independent Authority", "restricted", "ack", "Triage / investigate / document", "triage", "restricted"],
  ["H11", "P1", "Incident Investigation / Review Record", "Authorised Investigator", "Safety Hub → Incident Investigation / Review Record", "studentIncidents / restrictedCases", "Designated Safeguarding / Safety Lead", "Headmistress / Independent Authority", "restricted", "triage", "Triage / investigate / document", "triage", "restricted"],
  ["H12", "P2", "Corrective / Preventive Action Record", "School Leadership", "Safety Hub → Corrective / Preventive Action Record", "studentIncidents / restrictedCases", "Designated Safeguarding / Safety Lead", "Headmistress / Independent Authority", "exception", "record", "Triage / investigate / document", "operational", "restricted"],
  ["H13", "P1", "Student Safety / Welfare Follow-Up Record", "Authorised Staff", "Safety Hub → Student Safety / Welfare Follow-Up Record", "studentIncidents / restrictedCases", "Designated Safeguarding / Safety Lead", "Headmistress / Independent Authority", "exception", "record", "Triage / investigate / document", "operational", "restricted"],
  ["H14", "P2", "Emergency Drill / Safety Exercise Report", "Staff", "Safety Hub → Emergency Drill / Safety Exercise Report", "studentIncidents / restrictedCases", "Designated Safeguarding / Safety Lead", "Headmistress / Independent Authority", "pic", "review", "Triage / investigate / document", "2d", "restricted"],
  ["I01", "P1", "Alumni Registration", "Alumni", "SRSS25 → Alumni → Register", "alumniRegistrations (proposed)", "Alumni Coordinator", "Jubilee Committee Lead", "pic", "review", "Verify / welcome", "2d", "internal"],
  ["I02", "P1", "Alumni Story / Testimonial Submission", "Alumni", "SRSS25 → Share Your Story", "alumniStories (proposed)", "Alumni Coordinator / Content Editor", "Jubilee Committee Lead", "pic", "rights", "Review / consent / publish", "2d", "internal"],
  ["I03", "P1", "Historical Photograph / Memorabilia Submission", "Alumni / Community", "SRSS25 → Historical Photograph / Memorabilia Submission", "formSubmissions → alumni", "Alumni / Anniversary Coordinator", "Jubilee Committee Lead", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["I04", "P1", "Former Teacher / Staff Story Submission", "Former Staff", "SRSS25 → Former Teacher / Staff Story Submission", "formSubmissions → alumni", "Alumni / Anniversary Coordinator", "Jubilee Committee Lead", "pic", "rights", "Review / respond / close", "2d", "internal"],
  ["I05", "P1", "Silver Jubilee Event Registration", "Public / Alumni", "SRSS25 → Celebrations → Register", "registrations", "Event Organiser", "Jubilee Committee Lead", "pic", "review", "Confirm", "2d", "internal"],
  ["I06", "P2", "Anniversary Volunteer Registration", "Public / Alumni", "SRSS25 → Anniversary Volunteer Registration", "formSubmissions → alumni", "Alumni / Anniversary Coordinator", "Jubilee Committee Lead", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["I07", "P2", "Anniversary Sponsorship / Support Enquiry", "Public", "SRSS25 → Anniversary Sponsorship / Support Enquiry", "formSubmissions → alumni", "Alumni / Anniversary Coordinator", "Jubilee Committee Lead", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["I08", "P1", "SRSS Memory / Message Submission", "Alumni / Community", "SRSS25 → SRSS Memory / Message Submission", "formSubmissions → alumni", "Alumni / Anniversary Coordinator", "Jubilee Committee Lead", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["I09", "P1", "Alumni Launch Involvement / Participation Form", "Alumni", "SRSS25 → Alumni Launch Involvement / Participation Form", "formSubmissions → alumni", "Alumni / Anniversary Coordinator", "Jubilee Committee Lead", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["I10", "P2", "Alumni Mentoring / Speaking Interest", "Alumni", "SRSS25 → Alumni Mentoring / Speaking Interest", "formSubmissions → alumni", "Alumni / Anniversary Coordinator", "Jubilee Committee Lead", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["I11", "P2", "Alumni Contact Information Update", "Alumni", "SRSS25 → Alumni Contact Information Update", "formSubmissions → alumni", "Alumni / Anniversary Coordinator", "Jubilee Committee Lead", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["I12", "P1", "Alumni Profile Publication Consent", "Alumni", "SRSS25 → Alumni → Publication Consent", "consentRecords", "Privacy Steward", "Jubilee Committee Lead", "confirmation", "ack", "Record choice", "immediate", "internal"],
  ["I13", "P1", "SRSS25 Historical Timeline Contribution", "Community", "SRSS25 → SRSS25 Historical Timeline Contribution", "formSubmissions → alumni", "Alumni / Anniversary Coordinator", "Jubilee Committee Lead", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["I14", "P2", "Anniversary Programme / Performance Proposal", "Alumni / Staff", "SRSS25 → Anniversary Programme / Performance Proposal", "formSubmissions → alumni", "Alumni / Anniversary Coordinator", "Jubilee Committee Lead", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["I15", "P1", "Alumni Outreach / Follow-Up Record", "Alumni Coordinator", "SRSS25 → Alumni Outreach / Follow-Up Record", "formSubmissions → alumni", "Alumni / Anniversary Coordinator", "Jubilee Committee Lead", "exception", "record", "Review / respond / close", "operational", "internal"],
  ["J01", "P1", "Website Content Update Request", "Staff", "CMS Hub → Website Content Update Request", "formSubmissions → content", "Content Editor", "Content Lead / Publishing Approver", "pic", "decision", "Review / respond / close", "2d", "internal"],
  ["J02", "P1", "News / Article Submission", "Staff / Teacher", "Staff → CMS → Submit News", "newsPosts", "Content Editor", "Content Lead / Publishing Approver", "pic", "review", "Edit / approve / publish", "2d", "internal"],
  ["J03", "P1", "Student Achievement Publication Request", "Teacher", "CMS Hub → Student Achievement Publication Request", "formSubmissions → content", "Content Editor", "Content Lead / Publishing Approver", "pic", "decision", "Review / respond / close", "2d", "confidential"],
  ["J04", "P1", "Website Page Review / Sign-Off", "Content Approver", "Admin → CMS → Page Sign-off", "pages", "Publishing Approver", "Content Lead / Publishing Approver", "pic", "review", "Approve / return", "2d", "internal"],
  ["J05", "P2", "New Website Page / Module Request", "Staff / Leadership", "CMS Hub → New Website Page / Module Request", "formSubmissions → content", "Content Editor", "Content Lead / Publishing Approver", "pic", "decision", "Review / respond / close", "2d", "internal"],
  ["J06", "P2", "Policy Upload / Update Request", "Authorised Staff", "CMS Hub → Policy Upload / Update Request", "formSubmissions → content", "Content Editor", "Content Lead / Publishing Approver", "pic", "decision", "Review / respond / close", "2d", "internal"],
  ["J07", "P1", "Broken Link / Website Issue Report", "Public / Staff", "CMS Hub → Broken Link / Website Issue Report", "formSubmissions → content", "Content Editor", "Content Lead / Publishing Approver", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["J08", "P2", "Annual Website Audit Checklist", "Content Lead", "CMS Hub → Annual Website Audit Checklist", "formSubmissions → content", "Content Editor", "Content Lead / Publishing Approver", "exception", "record", "Review / respond / close", "operational", "internal"],
  ["J09", "P1", "Consent Audit Checklist", "Consent Steward", "Admin → Governance → Consent Audit", "consentRecords + auditLogs", "Consent Steward", "Content Lead / Publishing Approver", "confirmation", "ack", "Resolve exceptions", "immediate", "internal"],
  ["J10", "P1", "Content Expiry / Archive Request", "Content Editor", "CMS Hub → Content Expiry / Archive Request", "formSubmissions → content", "Content Editor", "Content Lead / Publishing Approver", "pic", "decision", "Review / respond / close", "2d", "internal"],
  ["J11", "P2", "Website Feedback / Usability Suggestion", "Public", "CMS Hub → Website Feedback / Usability Suggestion", "formSubmissions → content", "Content Editor", "Content Lead / Publishing Approver", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["J12", "P1", "Homepage Feature / Highlight Submission", "Staff", "CMS Hub → Homepage Feature / Highlight Submission", "formSubmissions → content", "Content Editor", "Content Lead / Publishing Approver", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["J13", "P1", "Teacher Profile Publication Review", "Content Editor", "CMS Hub → Teacher Profile Publication Review", "formSubmissions → content", "Content Editor", "Content Lead / Publishing Approver", "pic", "rights", "Review / respond / close", "2d", "internal"],
  ["J14", "P1", "Public Media / Photography Approval", "Content Editor", "CMS Hub → Public Media / Photography Approval", "formSubmissions → content", "Content Editor", "Content Lead / Publishing Approver", "pic", "decision", "Review / respond / close", "2d", "internal"],
  ["J15", "P1", "Content Correction / Retraction Request", "Authorised User", "CMS Hub → Content Correction / Retraction Request", "formSubmissions → content", "Content Editor", "Content Lead / Publishing Approver", "pic", "decision", "Review / respond / close", "2d", "internal"],
  ["J16", "P2", "Website Accessibility Issue Report", "Public / Staff", "CMS Hub → Website Accessibility Issue Report", "formSubmissions → content", "Content Editor", "Content Lead / Publishing Approver", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["J17", "P1", "Content Ownership / Review Assignment", "Admin", "CMS Hub → Content Ownership / Review Assignment", "formSubmissions → content", "Content Editor", "Content Lead / Publishing Approver", "pic", "review", "Review / respond / close", "2d", "internal"],
  ["J18", "P2", "Policy Review / Approval Record", "Policy Owner", "CMS Hub → Policy Review / Approval Record", "formSubmissions → content", "Content Editor", "Content Lead / Publishing Approver", "exception", "decision", "Review / respond / close", "operational", "internal"],
  ["K01", "P1", "User Account Creation / Access Request", "Admin", "Admin → Users → Create Access", "users + userRoles", "Technical Administrator", "Digital Hub Product Owner", "pic", "decision", "Verify / provision", "2d", "confidential"],
  ["K02", "P1", "User Role / Permission Change Request", "Admin", "Admin → Users → Change Roles", "userRoles + auditLogs", "Technical Administrator", "Digital Hub Product Owner", "confirmation", "decision", "Authorise / change", "immediate", "confidential"],
  ["K03", "P1", "User Account Deactivation Request", "Admin", "Admin → Users → Deactivate", "users + auditLogs", "Technical Administrator", "Digital Hub Product Owner", "pic", "decision", "Deactivate / revoke", "2d", "confidential"],
  ["K04", "P1", "Student / Guardian Relationship Verification", "Admin", "System Hub → Student / Guardian Relationship Verification", "formSubmissions → system", "Technical Administrator / Data Steward", "Digital Hub Product Owner", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["K05", "P1", "Student Record Correction / Data Review", "Admin", "System Hub → Student Record Correction / Data Review", "formSubmissions → system", "Technical Administrator / Data Steward", "Digital Hub Product Owner", "exception", "record", "Review / respond / close", "operational", "confidential"],
  ["K06", "P1", "Staff Record Correction Request", "Staff / Admin", "System Hub → Staff Record Correction Request", "formSubmissions → system", "Technical Administrator / Data Steward", "Digital Hub Product Owner", "exception", "decision", "Review / respond / close", "operational", "confidential"],
  ["K07", "P1", "Technical Bug / System Error Report", "User", "System Hub → Technical Bug / System Error Report", "formSubmissions → system", "Technical Administrator / Data Steward", "Digital Hub Product Owner", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["K08", "P2", "System Feature / Enhancement Request", "Staff", "System Hub → System Feature / Enhancement Request", "formSubmissions → system", "Technical Administrator / Data Steward", "Digital Hub Product Owner", "pic", "decision", "Review / respond / close", "2d", "confidential"],
  ["K09", "P1", "Data Import / Migration Verification", "Admin", "System Hub → Data Import / Migration Verification", "formSubmissions → system", "Technical Administrator / Data Steward", "Digital Hub Product Owner", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["K10", "P2", "Data Export Request", "Authorised User", "System Hub → Data Export Request", "formSubmissions → system", "Technical Administrator / Data Steward", "Digital Hub Product Owner", "pic", "decision", "Review / respond / close", "2d", "confidential"],
  ["K11", "P1", "Permission / Access Audit Checklist", "Technical Admin", "System Hub → Permission / Access Audit Checklist", "formSubmissions → system", "Technical Administrator / Data Steward", "Digital Hub Product Owner", "confirmation", "review", "Review / respond / close", "immediate", "confidential"],
  ["K12", "P2", "System Configuration Change Request", "Technical Admin", "System Hub → System Configuration Change Request", "formSubmissions → system", "Technical Administrator / Data Steward", "Digital Hub Product Owner", "pic", "decision", "Review / respond / close", "2d", "confidential"],
  ["K13", "P1", "Data Quality / Duplicate Record Report", "Admin", "System Hub → Data Quality / Duplicate Record Report", "formSubmissions → system", "Technical Administrator / Data Steward", "Digital Hub Product Owner", "exception", "record", "Review / respond / close", "operational", "confidential"],
  ["K14", "P1", "System Incident / Security Concern Report", "Authorised User", "Help → Report Security Issue", "securityIncidents (proposed)", "Technical Administrator", "Digital Hub Product Owner", "restricted", "triage", "Urgent containment / escalate", "triage", "confidential"],
  ["K15", "P2", "System Change / Release Approval", "Product Owner", "System Hub → System Change / Release Approval", "formSubmissions → system", "Technical Administrator / Data Steward", "Digital Hub Product Owner", "pic", "decision", "Review / respond / close", "2d", "confidential"],
  ["L01", "P2", "Fee Schedule / Billing Procedure Enquiry", "Parent", "Fee information → Billing procedure enquiry", "formSubmissions → finance", "Finance Officer", "Headmistress / Authorised Finance Approver", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["L02", "P2", "Payment Reference / Proof Submission", "Parent", "Parent → Finance → Payment Reference", "payments", "Finance Officer", "Headmistress / Authorised Finance Approver", "pic", "review", "Verify / reconcile", "2d", "confidential"],
  ["L03", "P2", "Fee Concession / Financial Assistance Request", "Parent", "Parent → Finance → Assistance", "concessions / restricted requests", "Finance Officer", "Headmistress / Authorised Finance Approver", "pic", "decision", "Confidential review", "2d", "restricted"],
  ["L04", "P2", "Fee Adjustment / Correction Request", "Finance Officer", "Finance Hub → Fee Adjustment / Correction Request", "formSubmissions → finance", "Finance Officer", "Headmistress / Authorised Finance Approver", "pic", "decision", "Review / respond / close", "2d", "confidential"],
  ["L05", "P2", "Refund Request", "Parent", "Finance Hub → Refund Request", "formSubmissions → finance", "Finance Officer", "Headmistress / Authorised Finance Approver", "pic", "decision", "Review / respond / close", "2d", "confidential"],
  ["L06", "P2", "Purchase / Resource Requisition", "Staff", "Finance Hub → Purchase / Resource Requisition", "formSubmissions → finance", "Finance Officer", "Headmistress / Authorised Finance Approver", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["L07", "P2", "Expense Reimbursement Claim", "Staff", "Finance Hub → Expense Reimbursement Claim", "formSubmissions → finance", "Finance Officer", "Headmistress / Authorised Finance Approver", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["L08", "P2", "Donation / Contribution Enquiry", "Public", "Finance Hub → Donation / Contribution Enquiry", "formSubmissions → finance", "Finance Officer", "Headmistress / Authorised Finance Approver", "pic", "review", "Review / respond / close", "2d", "confidential"],
  ["L09", "P2", "Financial Assistance Review / Approval", "Authorised Admin", "Finance Hub → Financial Assistance Review / Approval", "formSubmissions → finance", "Finance Officer", "Headmistress / Authorised Finance Approver", "pic", "decision", "Review / respond / close", "2d", "restricted"],
  ["L10", "P2", "Payment Reconciliation / Verification Record", "Finance Officer", "Finance Hub → Payment Reconciliation / Verification Record", "formSubmissions → finance", "Finance Officer", "Headmistress / Authorised Finance Approver", "exception", "record", "Review / respond / close", "operational", "confidential"],
];

// Categories, their reference code, backend queue and the default PIC, backup and escalation roles
// (specification: "Role and escalation directory"). Three working days overdue goes to the escalation role.
export const CATEGORIES = {
  A: { code: "ADM", name: "Admissions, Registration & Onboarding", queue: "Admissions", pic: "admissionsOfficer", backup: "schoolAdmin", escalation: "leadership", module: "/hub/admin/admissions" },
  B: { code: "PAR", name: "Parents, Guardians & Communication", queue: "Parent Relations", pic: "schoolAdmin", backup: "leadership", escalation: "leadership", module: "/hub/admin/guardians" },
  C: { code: "CON", name: "Identity, Consent, Privacy & Authorisation", queue: "Governance › Consent Centre", pic: "privacySteward", backup: "schoolAdmin", escalation: "leadership", module: "/hub/admin/consent" },
  D: { code: "ACA", name: "Academics, Teaching & Student Development", queue: "Academic › Submissions & Reviews", pic: "academicCoordinator", backup: "leadership", escalation: "leadership", module: "/hub/admin/assessments" },
  E: { code: "STF", name: "Staff, Human Resources & School Operations", queue: "Staff Operations", pic: "schoolAdmin", backup: "leadership", escalation: "leadership", module: "/hub/admin/staff" },
  F: { code: "LIB", name: "Library & Resource Centre", queue: "Library › Operations", pic: "librarian", backup: "schoolAdmin", escalation: "leadership", module: null },
  G: { code: "EVT", name: "Extracurricular Activities, Events & Excursions", queue: "Events › Registrations & Actions", pic: "schoolAdmin", backup: "leadership", escalation: "leadership", module: "/hub/admin/calendar" },
  H: { code: "SAF", name: "Safety, Safeguarding & Incident Management", queue: "Restricted › Safety & Incidents", pic: "safeguardingLead", backup: "leadership", escalation: "leadership", module: null },
  I: { code: "S25", name: "SRSS25, Alumni & Community Engagement", queue: "SRSS25 › Community Submissions", pic: "alumniCoordinator", backup: "leadership", escalation: "leadership", module: "/hub/admin/inbox" },
  J: { code: "WEB", name: "Website Content, CMS & Governance", queue: "CMS › Review & Publishing", pic: "contentEditor", backup: "leadership", escalation: "leadership", module: "/hub/admin/content" },
  K: { code: "SYS", name: "System Administration, Access & Data Management", queue: "System › Access & Data", pic: "technicalAdmin", backup: "superAdmin", escalation: "leadership", module: "/hub/admin/accounts" },
  L: { code: "FIN", name: "Finance, Fees & School Resources", queue: "Fee information & School Resources", pic: "financeOfficer", backup: "leadership", escalation: "leadership", module: "/hub/admin/fees" },
};

// The specification's role names → hub roles. "Event Organiser", "Parent Liaison", "Academic Lead" and the
// other people the School has not yet named map to the role that holds the work today.
const ROLE_OF = {
  "School Administrator": "schoolAdmin", "Authorised Administrator": "schoolAdmin", "Administration / Content Editor": "contentEditor",
  "Admissions Officer": "admissionsOfficer", "Admissions Officer / Authorised Health PIC": "admissionsOfficer", "Admissions Officer / Assessor": "admissionsOfficer",
  "Privacy / Consent Steward": "privacySteward", "Privacy Steward": "privacySteward", "Consent Steward": "privacySteward",
  "Academic Coordinator": "academicCoordinator", "Assigned Teacher / Academic Coordinator": "academicCoordinator", "Assigned Support Lead": "academicCoordinator",
  "Academic Lead": "leadership", "Class Teacher": "classTeacher", "Portfolio Lead / Moderator": "portfolioModerator",
  "Headmistress / Delegate": "leadership", "Headmistress / Independent Delegate": "leadership", "Headmistress / Independent Authority": "leadership",
  "Headmistress / Authorised Finance Approver": "leadership", "Independent Designated Authority": "leadership", "Parent Liaison": "leadership",
  "Librarian / Resource Lead": "librarian", "Librarian": "librarian", "Event Organiser": "schoolAdmin", "Event Organiser / Authorised Health PIC": "schoolAdmin",
  "Designated Safeguarding / Safety Lead": "safeguardingLead", "Designated Safeguarding Lead": "safeguardingLead", "Safety Lead": "safeguardingLead",
  "Alumni / Anniversary Coordinator": "alumniCoordinator", "Alumni Coordinator": "alumniCoordinator", "Alumni Coordinator / Content Editor": "alumniCoordinator", "Jubilee Committee Lead": "leadership",
  "Content Editor": "contentEditor", "Content Lead / Publishing Approver": "leadership", "Publishing Approver": "leadership",
  "Technical Administrator": "technicalAdmin", "Technical Administrator / Data Steward": "technicalAdmin", "Digital Hub Product Owner": "superAdmin",
  "Finance Officer": "financeOfficer",
};
// Deliberate departures from the specification's defaults, with the reason.
const PIC_OVERRIDES = {
  // SRSS Attendance Policy §8: the attendance manager handles parent absence reports; the class teacher sees them on the register.
  B05: { pic: "attendanceManager", backup: "schoolAdmin" },
  // Complaints and grievances: the Headmistress, with the independent delegate (Super Administrator) as backup.
  B09: { backup: "superAdmin" }, E10: { backup: "superAdmin" },
};

export const ROLE_LABELS = {
  superAdmin: "Super Administrator", schoolAdmin: "School Administrator", leadership: "Headmistress / Leadership", admissionsOfficer: "Admissions Officer",
  attendanceManager: "School Attendance Manager", privacySteward: "Privacy / Consent Steward", academicCoordinator: "Academic Coordinator", classTeacher: "Class Teacher",
  portfolioModerator: "Portfolio Moderator", librarian: "Librarian", safeguardingLead: "Safeguarding / Welfare Lead", alumniCoordinator: "Alumni / SRSS25 Coordinator",
  contentEditor: "Content Editor", technicalAdmin: "Technical Administrator", financeOfficer: "Finance Officer",
};
// Roles that can hold a queue, and so may open the Forms & Response Centre.
export const HANDLER_ROLES = Object.keys(ROLE_LABELS);

// The five reusable form types (specification: "Recommended form architecture").
export const FORM_TYPES = {
  submission: "Standard submission", update: "Profile / record update", consent: "Consent / acknowledgement",
  approval: "Approval / workflow", operational: "Operational record / checklist",
};
export const CLASSIFICATIONS = { internal: "Internal", confidential: "Confidential", restricted: "Restricted" };
// Notification levels: 1 standard (in-app + daily summary), 2 action required (+ email to the PIC and reminders),
// 3 priority / confidential (restricted alert, no details in any email).
export const LEVELS = { 1: "Standard", 2: "Action required", 3: "Priority / confidential" };
export const TARGETS = {
  "2d": { label: "2 working days for initial action", days: 2 }, "3d": { label: "3 working days for initial review", days: 3 },
  sameDay: { label: "Same school day", days: 0 }, immediate: { label: "Recorded immediately; exceptions reviewed", days: 0 },
  triage: { label: "Immediate triage; emergency route", days: 0 }, operational: { label: "By the operational due date", days: null },
};

// Case statuses (specification: "Recommended status system").
export const STATUSES = {
  new: "New", assigned: "Assigned", inProgress: "In progress", awaitingInformation: "Awaiting information", awaitingApproval: "Awaiting approval",
  approved: "Approved", rejected: "Rejected", completed: "Completed", closed: "Closed", cancelled: "Cancelled",
};
export const OPEN_STATUSES = ["new", "assigned", "inProgress", "awaitingInformation", "awaitingApproval"];
export const isOpen = (status) => OPEN_STATUSES.includes(status);
// What the submitter is told each status means.
export const SUBMITTER_STATUS = {
  new: "Received", assigned: "Being looked at", inProgress: "Being looked at", awaitingInformation: "The school needs more information from you",
  awaitingApproval: "Awaiting a decision", approved: "Approved", rejected: "Not approved", completed: "Completed", closed: "Closed", cancelled: "Withdrawn",
};

// ---------- Field presets for the forms that run in the hub ----------
const f = (key, label, type = "text", extra = {}) => ({ key, label, type, required: extra.optional ? false : true, ...extra });
const opt = (key, label, type = "text", extra = {}) => f(key, label, type, { ...extra, optional: true });
const pick = (key, label, options, extra = {}) => f(key, label, "select", { options, ...extra });
const CHILD = f("studentId", "Which child is this about?", "child");
// A rating grid: one answer from `scale` for every row (stored as { row: rating }).
const grid = (key, label, rows, scale, extra = {}) => f(key, label, "grid", { rows, scale, ...extra });
const SATISFACTION = ["Not satisfied", "Somewhat satisfied", "Satisfied", "Very satisfied"];
const QUALITY = ["Excellent", "Good", "Fair", "Poor"];
// A typed signature: the person types their full name; the server records the date it was signed.
const SIGN = (label = "Your signature") => f("signature", label, "signature");
const CHILD_OPTIONAL = opt("studentId", "Which child is this about? (if any)", "child");
const DETAILS = f("details", "Details", "textarea");
const URGENCY = pick("urgency", "How urgent is it?", ["Not urgent", "Normal", "Urgent"]);
const PUBLISH_STORY = pick("publication", "May SRSS publish it?", ["Yes, with my name", "Yes, without my name", "No — for the school archive only"]);
const CODES = ["/ Present", "R School trip / representation", "L Late", "M Medical / sickness", "S Suspension", "P Other authorised absence", "O Unknown absence", "T Other unauthorised absence", "X No attendance required"];
const STANDARDS = ["Standard 1", "Standard 2", "Standard 3", "Standard 4", "Standard 5", "Standard 6", "Not sure yet"];
const MEDIA_CONSENT = f("consentChecked", "Every pupil named or shown has the matching publication consent in the Consent Centre", "checkbox");
const EMERGENCY = "If a child may be in immediate danger, do not wait for this form: call 999, then tell the Safeguarding Lead or the Headmistress in person straight away. Use this form to record the concern afterwards.";

// Forms that run in the hub ("form" for signed-in people, "public" on the website at /forms/<id>).
// audience: public · parent · staff · signedIn. `store` names where the authoritative record is written.
const LIVE = {
  A03: { audience: "public", store: "admissionEnquiries", intro: "Tell us when you would like to visit and we'll confirm a time.", fields: [pick("enteringStandard", "Which Standard is your child joining?", STANDARDS), opt("childName", "Child's name"), f("preferredDate", "Preferred date", "date"), pick("preferredTime", "Preferred time", ["Morning (8.00–10.30 am)", "Late morning (10.30 am–12.30 pm)", "Either"]), opt("message", "Anything we should know?", "textarea")] },
  A16: { audience: "parent", intro: "Let the school know your child will be leaving. The office will confirm the clearance steps.", fields: [CHILD, f("lastDay", "Last day at SRSS", "date"), pick("reason", "Reason", ["Moving to another area", "Transferring to another school", "Other"]), opt("newSchool", "New school (if known)"), opt("notes", "Anything else", "textarea"), SIGN("Parent or guardian's signature")] },
  A18: { audience: "parent", intro: "Withdraw an admission application you no longer wish to continue.", fields: [f("application", "Child's name or application reference"), opt("reason", "Reason (optional)", "textarea")] },
  B01: { audience: "parent", apply: "guardianContact", intro: "Update your phone number or address. The office checks the change, then updates your record — you don't need to tell anyone else.", fields: [opt("phone", "New phone number", "tel"), opt("address", "New address", "textarea"), opt("contactEmail", "A different email for school letters", "email"), opt("notes", "Anything else", "textarea")], atLeastOne: ["phone", "address", "contactEmail"] },
  B02: { audience: "parent", intro: "Ask the school to correct something in your child's record. Nothing changes until the office has checked it.", fields: [CHILD, pick("field", "What needs correcting?", ["Name or spelling", "Date of birth", "Address", "Health or medical information", "Other"]), f("correction", "What it should say", "textarea"), opt("evidence", "Link to a supporting document (optional)", "url")] },
  B03: { audience: "parent", intro: "Change who the school calls in an emergency or who may collect your child.", fields: [CHILD, f("contactName", "Contact's name"), f("relationship", "Relationship to the child"), f("phone", "Contact's phone number", "tel"), pick("canCollect", "May this person collect your child?", ["Yes", "No"]), pick("change", "Is this a new contact, a change or a removal?", ["New contact", "Change to an existing contact", "Remove this contact"])] },
  B06: { audience: "parent", intro: "Ask for a meeting with your child's teacher or the school.", fields: [CHILD, pick("withWhom", "Who would you like to meet?", ["Class teacher", "Subject teacher", "Headmistress", "School office"]), pick("mode", "How would you like to meet?", ["In person at school", "Online (Google Meet)", "Phone call"]), f("availability", "Days and times that suit you"), f("topic", "What would you like to discuss?", "textarea")] },
  B08: { audience: "parent", intro: "Share an idea or feedback with the school.", fields: [pick("topic", "Topic", ["Teaching and learning", "Communication", "Facilities", "Events and activities", "The Digital Hub", "Other"]), f("feedback", "Your feedback or suggestion", "textarea"), grid("ratings", "If you'd like, tell us how satisfied you are with each area", ["Teaching and learning", "Values education (SSEHV)", "Communication from the school", "Facilities", "Events and activities"], SATISFACTION, { optional: true })] },
  B09: { audience: "parent", restrictedNote: true, intro: "A complaint is seen only by the Headmistress or an independent delegate — never by the person it concerns.", fields: [pick("concerns", "Who or what is the complaint about?", ["A teacher or staff member", "School administration", "The Headmistress", "Another matter"]), CHILD_OPTIONAL, f("details", "What happened?", "textarea"), opt("outcome", "What would you like to happen?", "textarea")] },
  B16: { audience: "parent", intro: "Read the Parent–School Partnership and Shared Values Agreement on the school website (Join SRSS › Parent–School Partnership), then record that your family agrees to support it.", fields: [f("agreement", "I have read the Parent–School Partnership and Shared Values Agreement, including the vegetarian food policy, and agree to support its principles", "checkbox"), SIGN("Sign the agreement"), opt("discuss", "Anything you'd like to discuss with the school?", "textarea")] },
  B17: { audience: "public", intro: "All food served or shared at school-organised activities must be vegetarian. Tell the school what you plan to bring, and the office will confirm or suggest an alternative.", fields: [pick("role", "You are a…", ["Parent or guardian", "Volunteer", "Visitor", "Caterer, vendor or sponsor"]), f("occasion", "Which celebration or event?"), f("date", "Date", "date"), f("food", "What food or refreshments do you plan to bring? Include ingredients if you can.", "textarea"), opt("dietary", "Allergies or dietary needs you know of in the group", "textarea")] },
  B18: { audience: "parent", restrictedNote: true, intro: "If your child has a medically necessary dietary requirement, tell the school so that an appropriate arrangement can be considered. Only authorised staff see this request. A doctor's letter can be handed to the school office.", fields: [CHILD, pick("requirement", "What kind of requirement?", ["A medically necessary diet", "A food allergy", "A food intolerance", "Something else"]), f("details", "What does your child need, and what should the school avoid?", "textarea"), opt("letter", "Do you have a doctor's letter or plan?", "select", { options: ["Yes, I will bring it to the office", "Not yet", "Not needed"] })] },
  B10: { audience: "parent", intro: "Share your family's experience of SRSS. We always ask before publishing anything.", fields: [f("testimonial", "Your words", "textarea"), pick("publishAs", "How should we credit it?", ["My name and my child's Standard", "“An SRSS parent” (no name)"]), f("consent", "SRSS may publish my words on its website and printed materials", "checkbox"), SIGN("Sign your permission")] },
  B11: { audience: "parent", intro: "Ask a question. Useful answers may be added to the website FAQ (without your name).", fields: [f("question", "Your question", "textarea")] },
  B13: { audience: "parent", intro: "Tell us how you'd like to help the school.", fields: [pick("area", "Where would you like to help?", ["School events", "Library and reading", "Sports", "Arts and culture", "Values programmes (SSEHV)", "Anything that's needed"]), f("availability", "When are you usually available?"), opt("skills", "Skills you'd like to offer", "textarea")] },
  B14: { audience: "parent", intro: "Request a letter or document from the school office.", fields: [CHILD, pick("document", "Which document?", ["Letter confirming enrolment or attendance", "Transfer letter", "Character / testimonial letter", "Copy of a report card", "Other"]), f("purpose", "What is it for?"), opt("neededBy", "Needed by", "date")] },
  C14: { audience: "signedIn", intro: "Ask for a copy of the personal data the school holds, or ask for it to be corrected. The Privacy Steward first confirms your identity.", fields: [pick("request", "What would you like?", ["A copy of the personal data the school holds", "Correct personal data", "Delete or restrict personal data", "Another privacy question"]), pick("about", "Whose data?", ["Mine", "My child's"]), CHILD_OPTIONAL, DETAILS] },
  D01: { audience: "staff", intro: "Update your teacher profile. A Content Editor reviews it before anything appears on the website.", fields: [f("displayName", "Name as it should appear"), f("position", "Position and subjects"), f("bio", "A short introduction", "textarea"), opt("photoLink", "Link to a photo (optional)", "url"), pick("publish", "Where may it appear?", ["Hub staff directory only", "Hub directory and the public website"])] },
  D02: { audience: "staff", intro: "Submit the class overview for this term.", fields: [f("className", "Class"), pick("term", "Term", ["Term 1", "Term 2"]), f("overview", "Class overview", "textarea")] },
  D20: { audience: "staff", intro: "Request materials or equipment for your classroom.", fields: [f("item", "What do you need?"), f("quantity", "How many?", "number"), f("className", "For which class?"), opt("neededBy", "Needed by", "date"), opt("reason", "Why it's needed", "textarea")] },
  D22: { audience: "staff", intro: "Ask the office to correct an attendance mark after the register was submitted.", fields: [f("className", "Class"), f("date", "Date of the register", "date"), f("pupil", "Pupil's name"), pick("currentCode", "Mark recorded", CODES), pick("correctCode", "Correct mark", CODES), f("reason", "Reason for the correction", "textarea")] },
  D24: { audience: "staff", intro: "Propose an academic programme or project for approval.", fields: [f("title", "Programme or project name"), f("summary", "What it involves and who it's for", "textarea"), f("dates", "Proposed dates"), opt("budget", "Estimated cost (if any)")] },
  E01: { audience: "staff", intro: "Update your contact details on your staff record.", fields: [opt("phone", "New phone number", "tel"), opt("address", "New address", "textarea"), opt("emergencyContact", "Emergency contact (name and phone)"), opt("notes", "Anything else", "textarea")], atLeastOne: ["phone", "address", "emergencyContact"] },
  E02: { audience: "staff", store: "staffLeave", intro: "Apply for leave. The Headmistress or delegate approves it, and you'll see the decision here.", fields: [pick("leaveType", "Type of leave", ["Annual leave", "Medical leave", "Emergency leave", "Compassionate leave", "Unpaid leave", "Other"]), f("from", "First day", "date"), f("to", "Last day", "date"), opt("reason", "Reason", "textarea"), opt("cover", "Cover arrangements for your classes", "textarea")] },
  E03: { audience: "staff", intro: "Tell the office you can't come in today. Call the office as well if it's after 7.00 am.", fields: [f("date", "Date", "date"), pick("reason", "Reason", ["Illness", "Family emergency", "Other"]), opt("returnDate", "Expected return", "date"), opt("coverNotes", "Notes for whoever covers your classes", "textarea")] },
  E05: { audience: "staff", intro: "Request a course or professional development opportunity.", fields: [f("course", "Course or programme"), opt("provider", "Provider"), f("dates", "Dates"), opt("cost", "Cost"), f("benefit", "How it helps your teaching or role", "textarea")] },
  E07: { audience: "staff", intro: "Report something that needs repairing.", fields: [f("location", "Where is it?"), f("problem", "What's wrong?", "textarea"), pick("urgency", "How urgent is it?", ["Can wait", "Soon", "Urgent — a safety risk"])] },
  E08: { audience: "staff", intro: "Request equipment or an asset.", fields: [f("item", "What do you need?"), f("quantity", "How many?", "number"), f("purpose", "What it's for", "textarea"), opt("neededBy", "Needed by", "date")] },
  E09: { audience: "staff", intro: "Get help with the Digital Hub, a school account or a device.", fields: [pick("system", "What do you need help with?", ["Digital Hub", "Google Workspace account", "Laptop or computer", "Projector or display", "Printer", "Wi-Fi or network", "Other"]), f("problem", "What's happening?", "textarea"), URGENCY] },
  E10: { audience: "staff", restrictedNote: true, intro: "A grievance is seen only by the designated authority — never by the person it concerns.", fields: [pick("concerns", "What is it about?", ["A colleague", "A line manager", "The Headmistress", "School policy or working conditions", "Another matter"]), f("details", "What happened?", "textarea"), opt("outcome", "What would you like to happen?", "textarea")] },
  E15: { audience: "staff", intro: "Book a room or shared space.", fields: [pick("room", "Room or space", ["School hall", "Library / Resource Centre", "ICT room", "Music room", "Field", "Other"]), f("date", "Date", "date"), f("fromTime", "From", "time"), f("toTime", "To", "time"), f("purpose", "What it's for")] },
  G13: { audience: "staff", intro: "Propose an event or activity for approval.", fields: [f("eventName", "Event or activity"), f("date", "Proposed date", "date"), f("audience", "Who it's for"), f("summary", "What will happen", "textarea"), opt("resources", "Staff, budget or equipment needed", "textarea")] },
  G14: { audience: "parent", intro: "Tell us how an event went.", fields: [f("event", "Which event?"), grid("ratings", "How was it?", ["Organisation on the day", "The activities", "Information beforehand", "Overall"], QUALITY), opt("comments", "Comments", "textarea")] },
  G19: { audience: "parent", intro: "Withdraw from an event or activity you registered for.", fields: [f("event", "Which event or activity?"), CHILD_OPTIONAL, opt("reason", "Reason (optional)", "textarea")] },
  H01: { audience: "staff", emergency: EMERGENCY, intro: "Record an incident involving a pupil.", fields: [f("pupil", "Pupil's name"), f("className", "Class"), f("date", "Date", "date"), opt("time", "Time", "time"), f("location", "Where"), f("whatHappened", "What happened", "textarea"), f("actionTaken", "Action taken", "textarea"), pick("parentsInformed", "Have the parents been told?", ["Yes", "Not yet", "Not needed"])] },
  H02: { audience: "staff", emergency: EMERGENCY, intro: "Record an incident involving a member of staff.", fields: [f("date", "Date", "date"), f("location", "Where"), f("whatHappened", "What happened", "textarea"), f("actionTaken", "Action taken", "textarea")] },
  H03: { audience: "staff", intro: "Record a behaviour or discipline concern.", fields: [f("pupil", "Pupil's name"), f("className", "Class"), f("date", "Date", "date"), f("behaviour", "What happened", "textarea"), f("actionTaken", "Action taken", "textarea")] },
  H04: { audience: "staff", emergency: EMERGENCY, intro: "Record an injury or accident.", fields: [pick("person", "Who was hurt?", ["A pupil", "A member of staff", "A visitor"]), f("name", "Name"), f("date", "Date", "date"), opt("time", "Time", "time"), f("location", "Where"), f("injury", "What happened and the injury", "textarea"), f("firstAid", "First aid given", "textarea"), pick("parentsInformed", "Have the parents or next of kin been told?", ["Yes", "Not yet", "Not needed"])] },
  H05: { audience: "staff", emergency: EMERGENCY, restrictedNote: true, intro: "Record a concern about a child's safety or welfare. Only the Designated Safeguarding Lead and the Headmistress can see it.", fields: [f("child", "Child's name"), f("className", "Class"), pick("source", "How did the concern arise?", ["The child told me", "I saw a sign or behaviour", "Someone else told me"]), f("date", "Date", "date"), f("concern", "What you saw or heard, in the words used", "textarea"), pick("immediateRisk", "Is the child at immediate risk?", ["No", "Possibly", "Yes — I have already contacted the Safeguarding Lead or police"])] },
  H06: { audience: "signedIn", emergency: EMERGENCY, restrictedNote: true, intro: "Report bullying or a concern about a child being hurt or excluded.", fields: [CHILD_OPTIONAL, f("whatHappened", "What happened", "textarea"), f("when", "When did it happen?"), opt("whoInvolved", "Who was involved (if known)", "textarea")] },
  H07: { audience: "signedIn", intro: "Report damage to or loss of school or personal property.", fields: [f("item", "What was damaged or lost?"), f("location", "Where"), f("date", "Date", "date"), f("description", "What happened", "textarea")] },
  I02: { audience: "public", intro: "Share a story from your years at SRSS for the Silver Jubilee.", fields: [f("years", "Your years at SRSS (e.g. 2004–2010)"), f("story", "Your story", "textarea"), PUBLISH_STORY] },
  I03: { audience: "public", intro: "Tell us about photographs or keepsakes from SRSS's history. We'll contact you about copying or borrowing them.", fields: [f("description", "What do you have?", "textarea"), opt("year", "Approximate year"), pick("share", "How could you share it?", ["I can send digital copies", "I can lend the originals", "Please contact me"]), opt("link", "Link to photos, e.g. a shared Google Drive folder (optional)", "url")] },
  I04: { audience: "public", intro: "Former teachers and staff: share a memory of your time at SRSS.", fields: [f("role", "Your role and years at SRSS"), f("story", "Your story", "textarea"), PUBLISH_STORY] },
  I05: { audience: "public", intro: "Register to attend an SRSS25 Silver Jubilee event.", fields: [f("event", "Which event?", "text", { placeholder: "SRSS25 Silver Jubilee celebration" }), f("attendees", "How many people (including you)?", "number", { min: 1, max: 10 }), pick("connection", "Your connection to SRSS", ["Parent", "Alumnus / alumna", "Former staff", "Friend of SRSS", "Other"]), opt("dietary", "Dietary needs")] },
  I09: { audience: "public", intro: "Alumni: tell us how you'd like to take part in the SRSS25 alumni launch.", fields: [f("years", "Your years at SRSS"), pick("involvement", "How would you like to take part?", ["Attend the launch", "Share my story", "Speak or perform", "Help organise", "Mentor pupils"]), opt("notes", "Anything else", "textarea")] },
  I12: { audience: "public", intro: "Give or change your permission for SRSS to publish your alumni profile. You can withdraw it at any time.", fields: [pick("scope", "What may SRSS publish?", ["My name, years and story", "My name and years only", "My photo, name and story", "Nothing — please remove my profile"]), f("confirm", "I confirm this is my own profile and choice", "checkbox"), SIGN("Sign your choice")] },
  I13: { audience: "public", intro: "Add a moment to the SRSS25 history timeline.", fields: [f("year", "Year"), f("moment", "What happened", "textarea"), opt("source", "How do you know? (e.g. you were there, a newsletter)")] },
  J01: { audience: "staff", intro: "Ask for a change to a website page.", fields: [f("page", "Which page? (address or name)"), f("change", "What should change?", "textarea"), opt("deadline", "Needed by", "date")] },
  J02: { audience: "staff", intro: "Submit a news story for the website.", fields: [f("headline", "Headline"), f("story", "The story", "textarea"), opt("photoLink", "Link to photos (optional)", "url"), MEDIA_CONSENT] },
  J03: { audience: "staff", intro: "Ask for a pupil achievement to be published.", fields: [f("pupils", "Pupil(s)"), f("achievement", "The achievement", "textarea"), f("date", "Date", "date"), MEDIA_CONSENT] },
  J05: { audience: "staff", intro: "Propose a new website page or hub module.", fields: [f("what", "What is needed?"), f("why", "Why, and who it's for", "textarea")] },
  J06: { audience: "staff", intro: "Ask for a policy to be uploaded or updated.", fields: [f("policy", "Policy"), f("change", "What should change?", "textarea"), opt("link", "Link to the approved version", "url"), f("approvedBy", "Approved by")] },
  J07: { audience: "public", intro: "Tell us about a broken link or something not working on the website.", fields: [f("page", "Which page? (address or name)"), f("problem", "What went wrong?", "textarea")] },
  J10: { audience: "staff", intro: "Ask for content to be archived or removed when it's out of date.", fields: [f("page", "Which page or item?"), f("reason", "Why it should be archived", "textarea")] },
  J12: { audience: "staff", intro: "Suggest a homepage feature or highlight.", fields: [f("headline", "Headline"), f("summary", "Summary", "textarea"), opt("link", "Link", "url"), opt("dates", "When should it appear?")] },
  J15: { audience: "signedIn", intro: "Ask for published content to be corrected or withdrawn.", fields: [f("page", "Which page or item?"), f("problem", "What is wrong?", "textarea"), URGENCY] },
  J16: { audience: "public", intro: "Tell us if part of the website is hard to use with a screen reader, keyboard or other assistive technology.", fields: [f("page", "Which page? (address or name)"), f("problem", "What was difficult?", "textarea"), opt("technology", "Technology you use (optional)")] },
  K01: { audience: "staff", intro: "Request a hub account or access. Submitting this doesn't grant anything: a Super Administrator reviews it.", fields: [f("person", "Person's name"), f("email", "Their email address", "email"), f("access", "What access do they need?"), f("reason", "Why", "textarea")] },
  K02: { audience: "staff", intro: "Request a role or permission change. A Super Administrator reviews it.", fields: [f("person", "Person's name or email"), f("change", "What should change?", "textarea"), f("reason", "Why", "textarea")] },
  K03: { audience: "staff", intro: "Ask for an account to be deactivated, e.g. when someone leaves.", fields: [f("person", "Person's name"), f("email", "Their email address", "email"), f("lastDay", "Last day", "date"), opt("reason", "Reason", "textarea")] },
  K05: { audience: "staff", intro: "Report a pupil record that needs correcting.", fields: [f("pupil", "Pupil's name"), f("field", "What is wrong?"), f("correction", "What it should say", "textarea"), opt("source", "Source or evidence")] },
  K06: { audience: "staff", intro: "Ask for your staff record to be corrected.", fields: [f("field", "What is wrong?"), f("correction", "What it should say", "textarea")] },
  K07: { audience: "signedIn", intro: "Report a problem with the Digital Hub.", fields: [f("page", "Which page or feature?"), f("whatHappened", "What happened?", "textarea"), opt("expected", "What did you expect?", "textarea"), opt("device", "Device and browser (if you know)")] },
  K08: { audience: "staff", intro: "Suggest an improvement to the Digital Hub.", fields: [f("idea", "Your idea", "textarea"), f("benefit", "Who it helps and how", "textarea")] },
  K10: { audience: "staff", intro: "Request an export of hub data. The Technical Administrator checks you're authorised to receive it.", fields: [f("data", "What data?", "textarea"), f("purpose", "What it's for", "textarea"), pick("format", "Format", ["Google Sheets", "CSV", "PDF"]), opt("neededBy", "Needed by", "date")] },
  K13: { audience: "staff", intro: "Report a duplicate or inaccurate record.", fields: [f("record", "Which record?"), f("problem", "What is wrong?", "textarea")] },
  K14: { audience: "signedIn", emergency: "If you think an account has been taken over or data has leaked, also phone the school office now so the account can be locked.", intro: "Report a security concern about the Digital Hub or a school account.", fields: [f("what", "What did you notice?", "textarea"), f("when", "When?"), opt("accounts", "Accounts or data affected (if known)")] },
  L01: { audience: "parent", intro: "Ask about the published fee schedule, pricing or general billing procedure. Contact the school office directly for individual bills or payment matters; do not submit receipts or bank details here.", fields: [pick("topic", "What is it about?", ["Published fee schedule", "Sibling pricing", "Vendor meal pricing", "General billing procedure"]), f("question", "Your question about the published information", "textarea")] },
  L03: { audience: "parent", restrictedNote: true, intro: "No child should miss an SRSS education because of genuine financial hardship. Children from eligible B40 households receive full sponsorship, subject to verification of household circumstances; other families may be considered for full or partial assistance. Only the Finance Officer and the Headmistress see your request, and the decision is shared with you privately.", fields: [CHILD, pick("household", "Which describes your household?", ["A B40 household", "Outside B40, facing financial hardship", "Our circumstances have changed unexpectedly", "I'd rather explain below"]), pick("request", "What would help?", ["Full sponsorship", "Partial tuition assistance", "A modified payment arrangement", "Help with essential expenses (uniform, books, meals)"]), f("circumstances", "Tell us about your household circumstances, dependants and financial commitments", "textarea"), f("confirm", "The information I've given is accurate, and I can provide documents to verify it if asked", "checkbox"), SIGN("Sign your request")] },
  L05: { audience: "parent", intro: "Request a refund. Advance payments are reconciled under the school's withdrawal and refund schedule; meal refunds follow the vendor's terms.", fields: [CHILD, pick("line", "Refund of", ["School tuition", "Vendor meals", "Another charge"]), f("amount", "Amount (RM)", "number"), f("paymentReference", "Payment reference or date"), f("reason", "Reason", "textarea")] },
  L06: { audience: "staff", intro: "Request a purchase for school use.", fields: [f("item", "What is needed?"), f("quantity", "How many?", "number"), f("estimatedCost", "Estimated cost (RM)", "number"), opt("supplier", "Supplier (if known)"), f("justification", "Why it's needed", "textarea")] },
  L07: { audience: "staff", intro: "Claim back money you spent for the school.", fields: [f("description", "What you bought"), f("amount", "Amount (RM)", "number"), f("date", "Date of purchase", "date"), f("receiptLink", "Link to the receipt", "url")] },
};

// Forms handled by an existing hub screen or public page; the case links there.
const MODULE_LINKS = {
  A01: "/resources/contact", A02: "/admissions", A04: "/hub/parent/applications", A05: "/hub/parent/applications", A06: "/hub/parent/applications",
  A07: "/hub/parent/applications", A08: "/hub/parent/applications", A09: "/hub/admin/admissions", A10: "/hub/parent/applications", A11: "/hub/welcome",
  A12: "/hub/welcome", A13: "/hub/profile", A14: "/hub/welcome", A15: "/hub/welcome", B04: "/hub/profile", B05: "/hub/parent/attendance",
  B12: "/hub/announcements", C12: "/hub", C15: "/hub/admin/consent", D03: "/hub/teacher/teaching", D04: "/hub/teacher/teaching", D05: "/hub/teacher/teaching",
  D06: "/hub/teacher/portfolios", D07: "/hub/teacher/portfolios", D08: "/hub/teacher/students", D10: "/hub/teacher/development", D11: "/hub/admin/development",
  D12: "/hub/admin/development", D13: "/hub/admin/support-groups", D14: "/hub/admin/support-groups", D15: "/hub/admin/support-groups",
  D16: "/hub/teacher/assessments", D17: "/hub/teacher/reports", D18: "/hub/admin/assessments", D19: "/hub/teacher/assessments", D21: "/hub/teacher/attendance",
  D23: "/hub/teacher/development", E04: "/hub/teacher/development", E06: "/hub/teacher/development", G01: "/hub/calendar",
  G02: "/hub/forms", G03: "/hub/forms", G04: "/hub/forms", G05: "/hub/forms", G06: "/hub/forms", G07: "/hub/forms", G08: "/hub/forms",
  G09: "/hub/forms", G10: "/hub/forms", G11: "/hub/forms", G12: "/hub/forms", I01: "/srss25", I06: "/srss25", I07: "/srss25", I08: "/srss25",
  J04: "/hub/admin/content", J09: "/hub/admin/consent", J11: "/resources/contact", J13: "/hub/admin/content", J14: "/hub/admin/showcase",
  K04: "/hub/admin/guardian-links", K09: "/hub/admin/setup", K11: "/hub/admin/roles", L08: "/srss25",
};
for (const id of ["C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "C11", "C13", "C16"]) MODULE_LINKS[id] = "/hub/parent/consent";

// Website and hub records that open a case automatically (the domain module stays the authoritative record).
// contactMessages are routed by the subject chosen on the website form.
export const CONTACT_SUBJECT_FORMS = { General: "A01", Other: "A01", Admissions: "A02", Feedback: "J11", Alumni: "I01", Volunteer: "I06", "Support SRSS": "I07", "SRSS25 memory": "I08" };
export const ACTIVITY_FORM_IDS = { registration: "G02", permission: "G03", medical: "G04", media: "G05", emergency: "G06", supervision: "G08", attendance: "G09", incident: "G10", reflection: "G11", volunteer: "G12" };

function typeOf(row) {
  const [id, , title, , , , , , notify, reply] = row;
  if (id.startsWith("C") && notify === "confirmation") return "consent";
  if (notify === "confirmation") return "consent";
  if (notify === "exception") return "operational";
  if (reply === "decision") return "approval";
  if (/update|correction/i.test(title)) return "update";
  return "submission";
}
// Where the record is really kept today, where that differs from the specification's proposed store.
const STORED_IN = { A01: "contactMessages", B05: "absenceReports", I01: "contactMessages", I06: "contactMessages", I07: "contactMessages", I08: "contactMessages", J11: "contactMessages", L08: "contactMessages", E02: "staffLeave" };
for (const id of Object.values(ACTIVITY_FORM_IDS)) STORED_IN[id] = "activityForms";
const ACTION_REQUIRED = ["A01", "A02", "A03", "B06", "D06", "J01", "J02", "J03", "E09", "K07"];

// Existing identifiers are retained for historical references, with online payment workflows retired.
export const RETIRED_PAYMENT_FORMS = ["L02", "L03", "L04", "L05", "L07", "L09", "L10"];
export const isRetiredPaymentForm = (id) => RETIRED_PAYMENT_FORMS.includes(id);
export const FORMS = ROWS.map((row) => {
  const [id, priority, title, user, entry, store, picLabel, backupLabel, notify, reply, action, target, classification] = row;
  const category = id[0];
  const live = LIVE[id];
  const restricted = classification === "restricted" || notify === "restricted";
  const routing = { pic: ROLE_OF[picLabel] || CATEGORIES[category].pic, backup: ROLE_OF[backupLabel] || CATEGORIES[category].backup, ...PIC_OVERRIDES[id] };
  const availability = isRetiredPaymentForm(id) ? "retired" : live ? (live.audience === "public" ? "public" : "form") : MODULE_LINKS[id] ? "module" : "planned";
  return {
    id, category, priority, stage: availability === "planned" ? 3 : priority === "P1" ? 2 : 3, title, user, entry, store: STORED_IN[id] || store, proposedStore: store, picLabel, backupLabel,
    pic: routing.pic, backup: routing.backup !== routing.pic ? routing.backup : CATEGORIES[category].escalation !== routing.pic ? CATEGORIES[category].escalation : "superAdmin", escalation: CATEGORIES[category].escalation,
    notify, reply, action, target, classification, restricted, type: typeOf(row),
    level: restricted ? 3 : reply === "decision" || ACTION_REQUIRED.includes(id) ? 2 : 1,
    availability, link: availability === "retired" ? null : live ? (availability === "public" ? `/forms/${id}` : `/hub/requests/new/${id}`) : MODULE_LINKS[id] || null,
    audience: live?.audience || null, fields: live?.fields || [], intro: live?.intro || "", emergency: live?.emergency || null,
    restrictedNote: Boolean(live?.restrictedNote), writesTo: live?.store || (restricted ? "restrictedCases" : "formSubmissions"),
    apply: live?.apply || null, atLeastOne: live?.atLeastOne || null,
  };
});
export const FORM = Object.fromEntries(FORMS.map((form) => [form.id, form]));

// Public forms always ask who is writing and for permission to reply.
export const CONTACT_FIELDS = [f("name", "Your name"), f("email", "Email address", "email"), opt("phone", "Phone", "tel"), f("contactConsent", "SRSS may contact me about this submission", "checkbox")];
// A signature always comes last, after the contact details on public forms.
const signedLast = (fields) => [...fields.filter((field) => field.type !== "signature"), ...fields.filter((field) => field.type === "signature")];
export const fieldsFor = (form) => signedLast(form.audience === "public" ? [...form.fields, ...CONTACT_FIELDS] : form.fields);

// Who may start a form in the hub. `roles` are the person's hub roles; public forms need no sign-in.
export function canStart(form, roles = []) {
  if (!["form", "public"].includes(form?.availability)) return false;
  if (form.audience === "public") return true;
  if (!roles.length) return false;
  if (form.audience === "signedIn") return true;
  if (form.audience === "parent") return roles.includes("parent");
  if (form.audience === "staff") return roles.some((role) => !["parent", "student"].includes(role));
  return false;
}

// Routing for one submission: the School's Workflow rules first (per form, then per category), then the
// registry. Complaints about the Headmistress never go to the Headmistress (specification: "never
// automatically routed to the subject of a complaint"); they go to the independent delegate.
export function routeFor(form, answers = {}, rules = {}) {
  const category = rules.categories?.[form.category] || {};
  const own = rules.forms?.[form.id] || {};
  const pic = own.pic || category.pic || form.pic;
  const backup = own.backup || category.backup || form.backup;
  const escalation = own.escalation || category.escalation || form.escalation;
  if (["B09", "E10"].includes(form.id) && answers.concerns === "The Headmistress") return { picRole: "superAdmin", backupRole: "superAdmin", escalationRole: "superAdmin" };
  return { picRole: pic, backupRole: backup === pic ? escalation : backup, escalationRole: escalation === pic ? "superAdmin" : escalation };
}

// SRSS-ADM-2027-0042
export const referenceFor = (form, year, sequence) => `SRSS-${CATEGORIES[form.category].code}-${year}-${String(sequence).padStart(4, "0")}`;

// ---------- Validation (the server runs this; the hub runs it before sending) ----------
// Today's date at the school (Malaysia), YYYY-MM-DD: the date a typed signature is recorded against.
export const todayAtSchool = (date = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur" }).format(date);
const LIMITS = { text: 300, textarea: 4000, email: 200, tel: 40, url: 500, select: 200, child: 64, date: 10, time: 5, number: 20 };
export function validateAnswers(form, input = {}) {
  const values = {}; const errors = {};
  for (const field of fieldsFor(form)) {
    if (field.type === "grid") {
      const given = input[field.key] && typeof input[field.key] === "object" ? input[field.key] : {};
      const rated = Object.fromEntries(field.rows.filter((row) => field.scale.includes(given[row])).map((row) => [row, given[row]]));
      if (field.rows.some((row) => given[row] != null && given[row] !== "" && !field.scale.includes(given[row]))) errors[field.key] = "Choose one of the ratings.";
      else if (field.required && Object.keys(rated).length < field.rows.length) errors[field.key] = "Please give a rating for every row.";
      else if (Object.keys(rated).length) values[field.key] = rated;
      continue;
    }
    if (field.type === "signature") {
      const raw = input[field.key];
      const name = String((raw && typeof raw === "object" ? raw.name : raw) ?? "").trim().replace(/\s+/g, " ");
      if (!name) { if (field.required) errors[field.key] = "Type your full name to sign."; continue; }
      if (name.length > 120 || !/\p{L}.*\p{L}/u.test(name)) { errors[field.key] = "Type your full name as your signature."; continue; }
      values[field.key] = { name, signedOn: todayAtSchool() };
      continue;
    }
    let value = input[field.key];
    if (field.type === "checkbox") value = value === true || value === "true" || value === "on";
    else if (value == null) value = "";
    else value = String(value).trim();
    const empty = field.type === "checkbox" ? value === false : value === "";
    if (empty) { if (field.required) errors[field.key] = field.type === "checkbox" ? "Please tick to confirm." : "This is required."; continue; }
    if (field.type !== "checkbox" && value.length > LIMITS[field.type]) { errors[field.key] = `Keep this under ${LIMITS[field.type]} characters.`; continue; }
    if (field.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) errors[field.key] = "Enter a valid email address.";
    else if (field.type === "url" && !/^https:\/\/\S+$/.test(value)) errors[field.key] = "Enter a link starting with https://";
    else if (field.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) errors[field.key] = "Enter a date.";
    else if (field.type === "time" && !/^\d{2}:\d{2}$/.test(value)) errors[field.key] = "Enter a time.";
    else if (field.type === "select" && !field.options.includes(value)) errors[field.key] = "Choose one of the options.";
    else if (field.type === "number") {
      const number = Number(value);
      if (!Number.isFinite(number) || number < (field.min ?? 0) || (field.max != null && number > field.max)) errors[field.key] = "Enter a valid number.";
      else values[field.key] = number;
      continue;
    }
    if (!errors[field.key]) values[field.key] = value;
  }
  if (form.atLeastOne && !form.atLeastOne.some((key) => values[key])) errors[form.atLeastOne[0]] = "Fill in at least one of the details to update.";
  if (form.id === "E02" && values.from && values.to && values.to < values.from) errors.to = "The last day can't be before the first day.";
  return { values, errors, ok: Object.keys(errors).length === 0 };
}

// ---------- Working days (Monday–Friday, less the School's closures) ----------
const isoOf = (date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
const dayOf = (iso) => new Date(`${iso}T00:00:00Z`);
export const isWorkingDay = (iso, closed = new Set()) => { const weekday = dayOf(iso).getUTCDay(); return weekday >= 1 && weekday <= 5 && !closed.has(iso); };
export function addWorkingDays(iso, days, closed = new Set()) {
  const date = dayOf(iso);
  // A submission on a non-working day starts counting from the next working day.
  while (!isWorkingDay(isoOf(date), closed)) date.setUTCDate(date.getUTCDate() + 1);
  for (let added = 0; added < days;) { date.setUTCDate(date.getUTCDate() + 1); if (isWorkingDay(isoOf(date), closed)) added++; }
  return isoOf(date);
}
// Working days after `from` up to and including `to` (0 when `to` is on or before `from`).
export function workingDaysBetween(from, to, closed = new Set()) {
  let count = 0;
  for (const date = dayOf(from); isoOf(date) < to;) { date.setUTCDate(date.getUTCDate() + 1); if (isWorkingDay(isoOf(date), closed)) count++; }
  return count;
}
// Closure dates from calendar events marked schoolClosed (single days and ranges).
export function closedDates(events = []) {
  const closed = new Set();
  for (const event of events) {
    if (!event.schoolClosed || !event.date) continue;
    for (const date = dayOf(event.date); isoOf(date) <= (event.endDate || event.date); date.setUTCDate(date.getUTCDate() + 1)) closed.add(isoOf(date));
  }
  return closed;
}
export const dueDateFor = (form, submittedOn, closed) => (TARGETS[form.target].days == null ? null : addWorkingDays(submittedOn, TARGETS[form.target].days, closed));

// Reminder and escalation steps (specification: "Automated reminders & escalation"). Cases waiting on the
// submitter are not escalated: the clock restarts when they reply.
export function escalationStep(caseRecord, today, closed) {
  if (!caseRecord.dueAt || !isOpen(caseRecord.status) || caseRecord.status === "awaitingInformation") return null;
  if (today < caseRecord.dueAt) return null;
  const late = workingDaysBetween(caseRecord.dueAt, today, closed);
  const sent = caseRecord.reminders || {};
  if (sent.on === today) return null; // a second run on the same day sends nothing new
  // One step per daily run, in order: the PIC on the due date, the backup a working day later, the
  // escalation role three working days later.
  if (!sent.overdue) return "overdue";
  if (late >= 1 && !sent.backup) return "backup";
  if (late >= 3 && !sent.escalated) return "escalated";
  return null;
}

// ---------- Response templates (the School adds its own in Forms & Response Centre › Response templates) ----------
export const RESPONSE_TEMPLATES = [
  { id: "acknowledgement", title: "Acknowledgement", body: "Thank you for contacting Sekolah Rendah Sathya Sai. We have received your submission ({reference}) and the right person is looking at it. We will contact you as soon as possible." },
  { id: "moreInformation", title: "Request for more information", body: "Thank you for your submission ({reference}). To help us respond, could you please tell us: " },
  { id: "approved", title: "Approved", body: "Your request ({reference}) has been approved. " },
  { id: "notApproved", title: "Not approved", body: "Thank you for your request ({reference}). After careful consideration we are unable to approve it at this time because " },
  { id: "completed", title: "Completed", body: "We have completed your request ({reference}). Please contact the school office if anything further is needed." },
  { id: "visitConfirmed", title: "School visit confirmed", body: "Thank you for your interest in SRSS. We are pleased to confirm your visit on " },
];
export const fillTemplate = (body, values) => body.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
