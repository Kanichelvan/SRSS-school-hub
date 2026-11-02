// Fees-Lite (PRD Fees-lite; School Fees and Payment Policy, effective 2025): fee statements, sibling order,
// concessions, payments and outstanding balances — not an accounting system. Every statement shows School
// Tuition and Vendor Meals as two separate lines (policy §3, §8). Amounts come from src/data/fees.js.
// The Finance Officer issues statements and records payments; parents see their own children's statements.
// Assessment details for financial assistance stay in the restricted L03 case, never on a statement.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase-firestore";
import { useAuth } from "../../auth/AuthProvider";
import { can } from "../../auth/permissions";
import { commitInChunks, currentYearId, getMany, list, listIn, one, today, useLoad } from "../data";
import { DataTable, EmptyState, ErrorNote, Loading, PageHeader, Section, StatCard, StatusBadge, formatDate } from "../ui";
import { CHILD_LABELS, FEES, PLANS, childFees, families, ringgit, siblingDiscount, siblingOrder, statement } from "../../data/fees.js";

const money = (value) => ringgit(value, { decimals: 2 });
const percent = (rate) => (rate ? `${Math.round(rate * 100)}%` : "—");
const CONCESSIONS = { none: ["No concession", 0], partial25: ["Partial assistance — 25%", 0.25], partial50: ["Partial assistance — 50%", 0.5], partial75: ["Partial assistance — 75%", 0.75], full: ["Full sponsorship", 1], pureLife: ["Full sponsorship — Pure Life Society", 1], b40: ["Full sponsorship — B40 household", 1] };
const yearOf = (yearId, settings) => Number(String(settings?.name || yearId || "").match(/\d{4}/)?.[0]) || new Date().getFullYear();

function StatementLines({ assignment, payments, onDate = today() }) {
  const result = statement(assignment, payments, onDate);
  const row = (title, line, note) => <section className="hub-fee-line" aria-label={title}>
    <h3>{title}</h3>{note && <p className="hub-hint">{note}</p>}
    <dl className="hub-facts">
      <div><dt>Monthly</dt><dd>{money(line.monthly)}</dd></div>
      <div><dt>Charged for the year ({FEES.months} months)</dt><dd>{money(line.charged)}</dd></div>
      <div><dt>Due so far</dt><dd>{money(line.due)}</dd></div>
      <div><dt>Paid</dt><dd>{money(line.paid)}</dd></div>
      <div><dt>Outstanding now</dt><dd>{line.outstanding ? <strong>{money(line.outstanding)}</strong> : "Nothing outstanding"}</dd></div>
    </dl>
  </section>;
  return <div className="hub-fee-statement">
    {row("School tuition", result.tuition, [result.discount ? `${CHILD_LABELS[(assignment.siblingPosition || 1) - 1] || "Child"}: ${percent(result.discount)} sibling discount` : "First child (no sibling discount)", assignment.concessionLabel].filter(Boolean).join(" · "))}
    {assignment.meals ? row("Vendor meals", result.meals, assignment.mealSponsored ? "Sponsored as part of full sponsorship." : "Supplied and charged by the external food vendor — not a school tuition fee.") : <section className="hub-fee-line"><h3>Vendor meals</h3><p className="hub-hint">Not using the meal service.</p></section>}
  </div>;
}

// ---------- Parents: My family's fees ----------
export function FamilyFees() {
  const auth = useAuth();
  const childIds = auth.scope?.childIds || [];
  const { data, loading, error } = useLoad(async () => {
    const [children, assignments, payments] = await Promise.all([getMany("students", childIds), listIn("studentFeeAssignments", "studentId", childIds), listIn("payments", "studentId", childIds)]);
    const yearId = await currentYearId();
    return { children: siblingOrder(children), assignments: assignments.filter((item) => !yearId || item.academicYearId === yearId), payments };
  }, [childIds.join()]);
  if (loading && !data) return <Loading />;
  if (!data) return <ErrorNote error={error} />;
  return <>
    <PageHeader kicker="My family" title="Fees">Your children's fee statements. School tuition and vendor meals are always shown separately.</PageHeader>
    <ErrorNote error={error} />
    {data.children.map((child, index) => {
      const assignment = data.assignments.find((item) => item.studentId === child.id);
      const payments = data.payments.filter((payment) => payment.studentId === child.id && (!assignment || payment.academicYearId === assignment.academicYearId));
      const standard = childFees(index + 1);
      return <Section key={child.id} title={child.preferredName || child.name}>
        {assignment ? <>
          <p className="hub-lede">Academic year {assignment.year} · {PLANS[assignment.plan] || PLANS.monthly}</p>
          <StatementLines assignment={assignment} payments={payments} />
          {payments.length > 0 && <><h3 className="hub-subhead">Payments received</h3><ul className="hub-list hub-list-compact">{payments.sort((a, b) => String(b.date).localeCompare(String(a.date))).map((payment) => <li key={payment.id}><strong>{money(payment.amount)}</strong> · {payment.line === "meals" ? "Vendor meals" : "School tuition"} · {formatDate(payment.date, { day: "numeric", month: "short", year: "numeric" })}{payment.reference ? ` · ref. ${payment.reference}` : ""}</li>)}</ul></>}
        </> : <EmptyState title="No statement has been issued yet.">Standard fees as the {CHILD_LABELS[index]?.toLowerCase() || "child"}: tuition {money(standard.tuition)} a month{standard.discount ? ` (sibling discount ${percent(standard.discount)})` : ""}, plus vendor meals {money(standard.meal)} a month if used.</EmptyState>}
      </Section>;
    })}
    {!data.children.length && <EmptyState title="No children are linked to your account yet." />}
    <Section title="Questions, assistance and the policy">
      <ul className="hub-cards">
        <li className="hub-card"><Link to="/hub/requests/new/L01"><strong>Ask about fees or a payment</strong></Link><p className="hub-hint">Statements, payment schedules, sibling discounts.</p></li>
        <li className="hub-card"><Link to="/hub/requests/new/L03"><strong>Ask about financial assistance</strong></Link><p className="hub-hint">Confidential: only the Finance Officer and the Headmistress see it.</p></li>
        <li className="hub-card"><Link to="/hub/requests/new/L05"><strong>Request a refund</strong></Link><p className="hub-hint">Reconciled under the withdrawal and refund schedule.</p></li>
        <li className="hub-card"><a href="/join/fees/policy"><strong>School Fees and Payment Policy</strong></a><p className="hub-hint">Tuition, meals, discounts, payment options and assistance.</p></li>
      </ul>
      <p className="hub-hint">Fees are due by the {FEES.dueDay}th of each month (or on your written schedule). If a payment will be late, please contact the office early — there is no automatic late-payment penalty.</p>
    </Section>
  </>;
}

// ---------- School office: Fees ----------
const TABS = [["statements", "Statements"], ["payments", "Payments"], ["outstanding", "Outstanding"], ["schedule", "Fee schedule & rules"]];
export function FeesOffice() {
  const auth = useAuth();
  const canEdit = can(auth.roles, "fees", "U") === "all";
  const [tab, setTab] = useState("statements");
  const state = useLoad(async () => {
    const yearId = await currentYearId();
    const year = yearOf(yearId, yearId ? await one(`academicYears/${yearId}`) : null);
    const [students, assignments, payments] = await Promise.all([list("students"), list("studentFeeAssignments"), list("payments")]);
    const enrolled = students.filter((student) => (student.status ?? "active") === "active" && student.currentClassId);
    const links = canEdit || auth.roles.some((role) => ["schoolAdmin", "leadership", "superAdmin"].includes(role)) ? await listIn("studentGuardianLinks", "studentId", enrolled.map((student) => student.id)).catch(() => []) : [];
    return { yearId, year, enrolled, links, assignments: assignments.filter((item) => item.academicYearId === yearId), payments: payments.filter((item) => item.academicYearId === yearId) };
  }, [auth.user.uid]);
  if (state.loading && !state.data) return <Loading />;
  if (state.error) return <ErrorNote error={state.error} />;
  const data = state.data;
  return <>
    <PageHeader kicker="School operations" title="Fees">Fees-Lite for {data.year}: statements with school tuition and vendor meals as separate lines, sibling discounts, assistance, payments and balances.</PageHeader>
    {!data.yearId && <p className="hub-error">Set the current academic year first (School setup wizard).</p>}
    <div className="hub-tabs" role="tablist" aria-label="Fees">{TABS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}</button>)}</div>
    <div className="hub-tab-panel">
      {tab === "statements" ? <Statements data={data} canEdit={canEdit} reload={state.reload} />
        : tab === "payments" ? <Payments data={data} canEdit={canEdit} reload={state.reload} />
        : tab === "outstanding" ? <Outstanding data={data} />
        : <Schedule />}
    </div>
  </>;
}

function Statements({ data, canEdit, reload }) {
  const auth = useAuth();
  const plan = useMemo(() => families(data.enrolled, data.links).flat(), [data]);
  const existing = Object.fromEntries(data.assignments.map((item) => [item.studentId, item]));
  const [choices, setChoices] = useState({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const choice = (studentId) => ({ meals: existing[studentId]?.meals ?? true, concession: existing[studentId]?.concessionKey || "none", plan: existing[studentId]?.plan || "monthly", ...choices[studentId] });
  const set = (studentId, key, value) => setChoices({ ...choices, [studentId]: { ...choice(studentId), [key]: value } });
  const changed = plan.filter(({ student, position }) => !existing[student.id] || existing[student.id].siblingPosition !== position || choices[student.id]);
  async function issue() {
    setBusy(true); setNotice("");
    try {
      await commitInChunks(plan.map(({ student, position, familyKey, familySize }) => (batch) => {
        const picked = choice(student.id);
        const [concessionLabel, concessionRate] = CONCESSIONS[picked.concession];
        const full = concessionRate === 1;
        const paid = (line) => data.payments.filter((payment) => payment.studentId === student.id && payment.line === line).reduce((total, payment) => total + Number(payment.amount || 0), 0);
        const assignment = { studentId: student.id, studentName: student.preferredName || student.name, classId: student.currentClassId, academicYearId: data.yearId, year: data.year, familyKey, familySize, siblingPosition: position, siblingDiscount: siblingDiscount(position), meals: Boolean(picked.meals), mealSponsored: full && Boolean(picked.meals), concessionKey: picked.concession, concessionRate, concessionLabel: picked.concession === "none" ? null : concessionLabel, plan: picked.plan };
        const result = statement(assignment, data.payments.filter((payment) => payment.studentId === student.id), today());
        batch.set(doc(db, "studentFeeAssignments", `${student.id}_${data.yearId}`), { ...assignment, tuitionMonthly: result.tuition.monthly, mealMonthly: result.meals.monthly, tuitionCharged: result.tuition.charged, mealsCharged: result.meals.charged, amountDue: result.tuition.charged + result.meals.charged, paidTuition: paid("tuition"), paidMeals: paid("meals"), outstanding: result.outstanding, status: "issued", issuedOn: today(), updatedAt: serverTimestamp(), updatedBy: auth.user.uid });
      }));
      setChoices({}); setNotice(`Statements issued for ${plan.length} pupils. Parents see them under Fees.`); reload();
    } catch (error) { setNotice(error.message); } finally { setBusy(false); }
  }
  if (!plan.length) return <EmptyState title="No pupils are enrolled in the current year yet.">Enrol pupils first; their statements are worked out from their families.</EmptyState>;
  return <>
    <p className="hub-lede">Sibling order is worked out automatically: pupils who share a guardian are one family, and the oldest enrolled child is the first child. Re-issue statements whenever enrolment changes.</p>
    <div className="hub-table-scroll"><table className="hub-table hub-table-compact">
      <thead><tr><th scope="col">Pupil</th><th scope="col">Child in family</th><th scope="col">Tuition / month</th><th scope="col">Vendor meals</th><th scope="col">Assistance</th><th scope="col">Payment plan</th><th scope="col">Statement</th></tr></thead>
      <tbody>{plan.map(({ student, position, familySize }) => { const picked = choice(student.id); const tuition = childFees(position).tuition * (1 - CONCESSIONS[picked.concession][1]); return <tr key={student.id}>
        <td data-label="Pupil">{student.preferredName || student.name}</td>
        <td data-label="Child in family">{CHILD_LABELS[position - 1]}{familySize > 1 ? ` of ${familySize}` : ""}{position > 1 && <small className="hub-hint"> · −{percent(siblingDiscount(position))}</small>}</td>
        <td data-label="Tuition / month">{money(tuition)}</td>
        <td data-label="Vendor meals">{canEdit ? <label className="hub-check"><input type="checkbox" checked={Boolean(picked.meals)} onChange={(event) => set(student.id, "meals", event.target.checked)} />{money(FEES.mealMonthly)}</label> : picked.meals ? money(FEES.mealMonthly) : "No"}</td>
        <td data-label="Assistance">{canEdit ? <select aria-label={`Assistance for ${student.name}`} value={picked.concession} onChange={(event) => set(student.id, "concession", event.target.value)}>{Object.entries(CONCESSIONS).map(([key, [label]]) => <option key={key} value={key}>{label}</option>)}</select> : CONCESSIONS[picked.concession][0]}</td>
        <td data-label="Payment plan">{canEdit ? <select aria-label={`Payment plan for ${student.name}`} value={picked.plan} onChange={(event) => set(student.id, "plan", event.target.value)}>{Object.entries(PLANS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select> : PLANS[picked.plan]}</td>
        <td data-label="Statement">{existing[student.id] ? <StatusBadge status={changed.some((item) => item.student.id === student.id) ? "pending" : "approved"} label={changed.some((item) => item.student.id === student.id) ? "Needs re-issue" : "Issued"} /> : <StatusBadge status="missing" label="Not issued" />}</td>
      </tr>; })}</tbody>
    </table></div>
    <p className="hub-hint">Assistance is decided in the confidential L03 case; only the resulting rate appears on the statement. Full sponsorship also covers the meal service when meals are used.</p>
    {canEdit ? <div className="hub-form-actions"><button type="button" className="hub-button" disabled={busy || !data.yearId} onClick={issue}>{busy ? "Issuing…" : `Issue statements (${changed.length} new or changed)`}</button></div> : <p className="hub-hint">Only the Finance Officer issues statements.</p>}
    {notice && <p className="hub-status" role="status">{notice}</p>}
  </>;
}

function Payments({ data, canEdit, reload }) {
  const auth = useAuth();
  const [form, setForm] = useState({ studentId: "", line: "tuition", amount: "", date: today(), reference: "", method: "Bank transfer" });
  const [notice, setNotice] = useState("");
  const names = Object.fromEntries(data.enrolled.map((student) => [student.id, student.preferredName || student.name]));
  async function record(event) {
    event.preventDefault(); setNotice("");
    const amount = Number(form.amount);
    if (!form.studentId || !(amount > 0)) { setNotice("Choose a pupil and enter an amount."); return; }
    const assignment = data.assignments.find((item) => item.studentId === form.studentId);
    if (!assignment) { setNotice("Issue this pupil's statement first."); return; }
    const id = `${form.studentId}_${Date.now()}`;
    const payments = [...data.payments.filter((payment) => payment.studentId === form.studentId), { line: form.line, amount }];
    const result = statement(assignment, payments, today());
    const sum = (line) => payments.filter((payment) => payment.line === line).reduce((total, payment) => total + Number(payment.amount), 0);
    await commitInChunks([
      (batch) => batch.set(doc(db, "payments", id), { studentId: form.studentId, academicYearId: data.yearId, line: form.line, amount, date: form.date, reference: form.reference.trim() || null, method: form.method, recordedBy: auth.user.uid, createdAt: serverTimestamp() }),
      (batch) => batch.set(doc(db, "studentFeeAssignments", assignment.id), { paidTuition: sum("tuition"), paidMeals: sum("meals"), outstanding: result.outstanding, updatedAt: serverTimestamp(), updatedBy: auth.user.uid }, { merge: true }),
    ]);
    setForm({ ...form, amount: "", reference: "" }); setNotice(`Recorded ${money(amount)} (${form.line === "meals" ? "vendor meals" : "school tuition"}) for ${names[form.studentId]}.`); reload();
  }
  return <>
    {canEdit && <form className="hub-form hub-form-wide" onSubmit={record}>
      <div className="hub-form-row">
        <label className="hub-field"><span>Pupil</span><select value={form.studentId} onChange={(event) => setForm({ ...form, studentId: event.target.value })} required><option value="">Choose…</option>{data.enrolled.map((student) => <option key={student.id} value={student.id}>{names[student.id]}</option>)}</select></label>
        <label className="hub-field"><span>For</span><select value={form.line} onChange={(event) => setForm({ ...form, line: event.target.value })}><option value="tuition">School tuition</option><option value="meals">Vendor meals</option></select></label>
        <label className="hub-field"><span>Amount (RM)</span><input type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required /></label>
        <label className="hub-field"><span>Date received</span><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></label>
        <label className="hub-field"><span>Method</span><select value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })}>{["Bank transfer", "DuitNow / online", "Cheque", "Cash"].map((method) => <option key={method}>{method}</option>)}</select></label>
        <label className="hub-field"><span>Payment reference</span><input value={form.reference} maxLength={80} onChange={(event) => setForm({ ...form, reference: event.target.value })} /></label>
      </div>
      <div className="hub-form-actions"><button className="hub-button">Record payment</button></div>
      {notice && <p className="hub-status" role="status">{notice}</p>}
    </form>}
    <DataTable rows={data.payments.map((payment) => ({ ...payment, pupil: names[payment.studentId] || payment.studentId, lineName: payment.line === "meals" ? "Vendor meals" : "School tuition" }))} exportName={`payments-${data.year}`} searchKeys={["pupil", "reference"]} initialSort={{ key: "date", dir: -1 }}
      filters={[{ key: "lineName", label: "Line", options: [["School tuition", "School tuition"], ["Vendor meals", "Vendor meals"]] }]}
      columns={[{ key: "date", label: "Date" }, { key: "pupil", label: "Pupil" }, { key: "lineName", label: "For" }, { key: "amount", label: "Amount", render: (row) => money(row.amount), csv: (row) => row.amount }, { key: "method", label: "Method" }, { key: "reference", label: "Reference" }]}
      empty="No payments recorded this year." />
  </>;
}

function Outstanding({ data }) {
  const rows = data.assignments.map((assignment) => {
    const result = statement(assignment, data.payments.filter((payment) => payment.studentId === assignment.studentId), today());
    return { id: assignment.id, pupil: assignment.studentName, plan: PLANS[assignment.plan], tuition: result.tuition.outstanding, meals: result.meals.outstanding, total: result.outstanding };
  }).filter((row) => row.total > 0);
  const total = (key) => rows.reduce((sum, row) => sum + row[key], 0);
  return <>
    <div className="hub-stats"><StatCard label="School tuition outstanding" value={money(total("tuition"))} tone={total("tuition") ? "warn" : "good"} /><StatCard label="Vendor meals outstanding" value={money(total("meals"))} tone={total("meals") ? "warn" : "good"} /><StatCard label="Families to follow up" value={rows.length} /></div>
    <p className="hub-hint">Policy §9: a courteous reminder after a missed due date, then private follow-up by the authorised administration. No automatic penalty, and no pupil is ever identified or treated differently in class because of unpaid fees. Families can ask for an instalment revision or an assistance review.</p>
    <DataTable rows={rows} exportName={`outstanding-${new Date().getFullYear()}`} searchKeys={["pupil"]} initialSort={{ key: "total", dir: -1 }} empty="Nothing is outstanding."
      columns={[{ key: "pupil", label: "Pupil" }, { key: "plan", label: "Plan" }, { key: "tuition", label: "School tuition", render: (row) => money(row.tuition), csv: (row) => row.tuition }, { key: "meals", label: "Vendor meals", render: (row) => money(row.meals), csv: (row) => row.meals }, { key: "total", label: "Total", render: (row) => <strong>{money(row.total)}</strong>, csv: (row) => row.total }]} />
  </>;
}

// The policy's recommended decisions, as the office applies them.
const RULES = [
  ["Payment due date", `Monthly tuition by the ${FEES.dueDay}th.`], ["Six-monthly payments", "January–June and July–November, with exact due dates published."],
  ["Fortnightly payments", "A fixed written instalment schedule, not an informal arrangement."], ["Sibling order", "Oldest enrolled child is the first child; recalculated when enrolment changes."],
  ["Financial hardship", "Confidential application (form L03), documented approval and periodic review."], ["Full sponsorship", "Pure Life Society residential children, and B40 households after verification: tuition, learning materials, uniforms and meals."], ["Late payment", "Reminders and personal follow-up; no automatic penalties."],
  ["Mid-year admissions", "Written pro-rata schedule approved before enrolment."], ["Withdrawals", "Clear notice period and advance-payment refund rules."],
  ["Vendor meals", "Separate fee line, vendor terms and reconciliation."], ["Fee changes", "Board approval and advance written notice."],
  ["Campus development", "Separate, transparent fundraising and accounting arrangements."],
];
function Schedule() {
  return <>
    <Section title="Fee schedule (effective Academic Year 2025)">
      <dl className="hub-facts">
        <div><dt>School tuition</dt><dd>{money(FEES.tuitionMonthly)} a month · {money(FEES.tuitionMonthly * FEES.months)} a year ({FEES.months} months, January–November)</dd></div>
        <div><dt>Vendor meals (separate)</dt><dd>{money(FEES.mealMonthly)} a month · {money(FEES.mealMonthly * FEES.months)} a year — charged for the external vendor, not tuition</dd></div>
        {FEES.siblingDiscounts.map((rate, index) => <div key={rate}><dt>{index === FEES.siblingDiscounts.length - 1 ? "Fourth child onwards" : CHILD_LABELS[index]}</dt><dd>{percent(rate)} off tuition → {money(childFees(index + 1).tuition)} a month</dd></div>)}
      </dl>
      <p className="hub-hint">Amounts live in <code>src/data/fees.js</code>; a fee change needs Board approval and advance written notice, and never applies to completed periods. <a href="/join/fees/policy">Read the policy</a>.</p>
    </Section>
    <Section title="How the office applies the policy">
      <dl className="hub-facts">{RULES.map(([matter, decision]) => <div key={matter}><dt>{matter}</dt><dd>{decision}</dd></div>)}</dl>
    </Section>
  </>;
}
