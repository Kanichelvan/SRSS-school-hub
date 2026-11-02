// School fees (/join/fees), the School Fees and Payment Policy (/join/fees/policy) and Our Commitment —
// not-for-profit education and financial stewardship (/about/our-commitment). Text supplied by the School
// (Nov 2026); every amount comes from src/data/fees.js. Loaded on demand to keep the homepage light.
import { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { Closing, PageHero, PageSection } from "./SitePages.jsx";
import { CHILD_LABELS, FEES, FINANCES_2025, childFees, familyFees, ringgit } from "../data/fees.js";
import "./fees.css";

const OFFICE = "saischoolpuchong@gmail.com";
const mailto = (subject) => `mailto:${OFFICE}?subject=${encodeURIComponent(subject)}`;
const money = (value) => ringgit(value, { decimals: 2 });
const percent = (rate) => (rate ? `${Math.round(rate * 100)}%` : "—");
const PRINCIPLE = ["Education is our service.", "Human Excellence is our purpose.", "Every child is our responsibility."];

function Principle() {
  return <section className="fees-principle" aria-label="Our guiding principle"><div className="page-inner"><p className="eyebrow">Our guiding principle remains unchanged</p><p>{PRINCIPLE.map((line) => <span key={line}>{line}</span>)}</p></div></section>;
}

function FeeTable() {
  const one = childFees(1);
  return <div className="fees-table-wrap"><table className="fees-table">
    <caption>Standard fees for one child</caption>
    <thead><tr><th scope="col">Description</th><th scope="col">Monthly</th><th scope="col">Annually ({FEES.months} months)</th></tr></thead>
    <tbody>
      <tr><th scope="row">School tuition</th><td><strong>{ringgit(one.tuition)}</strong></td><td><strong>{ringgit(one.tuitionAnnual)}</strong></td></tr>
      <tr><th scope="row">Meals (external vendor)</th><td>{ringgit(one.meal)}</td><td>{ringgit(one.mealAnnual)}</td></tr>
    </tbody>
    <tfoot><tr><th scope="row">Total</th><td>{ringgit(one.monthly)}</td><td>{ringgit(one.annual)}</td></tr></tfoot>
  </table></div>;
}

function SiblingTable({ meals = true }) {
  return <div className="fees-table-wrap"><table className="fees-table">
    <caption>Monthly tuition for children enrolled at the same time</caption>
    <thead><tr><th scope="col">Child</th><th scope="col">Tuition discount</th><th scope="col">Monthly tuition</th>{meals && <th scope="col">Including meals</th>}</tr></thead>
    <tbody>{FEES.siblingDiscounts.map((rate, index) => { const row = childFees(index + 1); return <tr key={rate}><th scope="row">{index === FEES.siblingDiscounts.length - 1 ? "Fourth child onwards" : CHILD_LABELS[index]}</th><td>{percent(rate)}</td><td>{money(row.tuition)}</td>{meals && <td>{money(row.monthly)}</td>}</tr>; })}</tbody>
  </table></div>;
}

// Part B — the family fee calculator: standard tuition and vendor meals for up to six children.
function Calculator() {
  const [children, setChildren] = useState(2);
  const [meals, setMeals] = useState(true);
  const family = familyFees(children, { meals });
  return <div className="fees-calculator">
    <form className="fees-calculator-controls" onSubmit={(event) => event.preventDefault()}>
      <fieldset><legend>Children enrolled at SRSS at the same time</legend><div className="fees-count">{[1, 2, 3, 4, 5, 6].map((count) => <label key={count}><input type="radio" name="children" value={count} checked={children === count} onChange={() => setChildren(count)} /><span>{count}</span></label>)}</div></fieldset>
      <label className="fees-toggle"><input type="checkbox" checked={meals} onChange={(event) => setMeals(event.target.checked)} /> Include the vendor meal service</label>
    </form>
    <div className="fees-table-wrap"><table className="fees-table fees-ledger">
      <caption>Standard fees for {children === 1 ? "one child" : `${children} children`}{meals ? ", with meals" : ""}</caption>
      <thead><tr><th scope="col">Child</th><th scope="col">Discount</th><th scope="col">Tuition / month</th>{meals && <th scope="col">Meals / month</th>}<th scope="col">Monthly</th><th scope="col">Year ({FEES.months} months)</th></tr></thead>
      <tbody>{family.rows.map((row) => <tr key={row.position}><th scope="row">{CHILD_LABELS[row.position - 1]}</th><td>{percent(row.discount)}</td><td>{money(row.tuition)}</td>{meals && <td>{money(row.meal)}</td>}<td>{money(row.monthly)}</td><td>{money(row.annual)}</td></tr>)}</tbody>
      <tfoot><tr><th scope="row">Family total</th><td>{family.saving ? `saves ${money(family.saving)}` : "—"}</td><td>{money(family.tuition)}</td>{meals && <td>{money(family.meal)}</td>}<td>{money(family.monthly)}</td><td>{money(family.annual)}</td></tr></tfoot>
    </table></div>
    <p className="fees-calculator-total" aria-live="polite"><span>Monthly</span><strong>{money(family.monthly)}</strong><span>School tuition {money(family.tuition)}{meals ? ` · vendor meals ${money(family.meal)}` : ""}</span></p>
    <p className="page-note">Standard amounts before any financial assistance. The oldest enrolled child counts as the first child; the school recalculates when enrolment changes. Sibling discounts apply to tuition only, never to meals.</p>
  </div>;
}

export function FeesPage() {
  return <main id="main" className="site-page fees-page">
    <PageHero eyebrow="School Fees" title={<>Affordable education. <em>An enduring commitment.</em></>}
      actions={<><a className="primary-button" href="#calculator">Work out your family's fees</a><a className="text-button" href="/join/fees/policy">Read the fees policy</a></>}>
      <p><strong>At SRSS, education has never been about how much a family can pay. It has always been about how much a child can become.</strong></p>
    </PageHero>
    <PageSection id="commitment" eyebrow="Our commitment" title="Free of tuition for over two decades, and still within reach.">
      <div className="fees-prose">
        <p>For over two decades, Sekolah Rendah Sathya Sai provided education entirely free of tuition fees, sustained by the generosity of individuals who believed in the transformative power of education rooted in human values.</p>
        <p>As the school grows, so too does our responsibility to ensure that every child continues to benefit from a safe, nurturing and enriching learning environment.</p>
        <p>Our modest parental contributions have been introduced to help sustain this commitment. At {ringgit(FEES.tuitionMonthly)} per month for tuition, SRSS remains among the more affordable private primary school options in Malaysia, based on selected published school fee schedules.</p>
        <p>The true cost of educating each child is considerably higher than the amount requested from families. Even with these contributions, the school continues to depend on the goodwill of donors, benefactors and supporters.</p>
        <p>We also recognise that every family's circumstances are different. Our progressive sibling discounts, flexible payment arrangements and financial assistance provisions reflect our determination to make education accessible.</p>
        <p className="fees-pledge">No child should be deprived of an SRSS education solely because of genuine financial hardship.</p>
        <p>We remain deeply grateful to our parents, teachers, donors, the Pure Life Society and the wider SSIOM community, whose collective commitment has sustained the school since 2002.</p>
        <p><a className="text-link" href="/about/our-commitment">Why SRSS is not-for-profit <ArrowRight size={15} /></a></p>
      </div>
    </PageSection>
    <PageSection id="structure" eyebrow="Our fee structure" title="Tuition, and meals charged separately." tone="ivory">
      <FeeTable />
      <ul className="fees-notes">
        <li>Tuition is charged for {FEES.months} months, from January to November.</li>
        <li>Meals are provided by an external vendor and charged separately from school tuition. Your statement always shows them as two lines.</li>
      </ul>
    </PageSection>
    <PageSection id="siblings" eyebrow="Sibling discounts" title="Reduced tuition for families with more than one child at SRSS.">
      <SiblingTable />
      <p className="page-note">Sibling discounts apply to tuition fees only.</p>
    </PageSection>
    <PageSection id="calculator" eyebrow="Family fee calculator" title="What your family would pay." intro="Choose how many of your children would be at SRSS at the same time." tone="ivory">
      <Calculator />
    </PageSection>
    <PageSection id="payment" eyebrow="Flexible payment options" title="Pay in the way that suits your family.">
      <ul className="fees-options">
        <li><h3>Monthly</h3><p>Payment by the {FEES.dueDay}th of each month, January to November.</p></li>
        <li><h3>Six-monthly</h3><p>Advance payment in instalments covering the academic year: January–June and July–November.</p></li>
        <li><h3>Fortnightly</h3><p>Smaller, more frequent payments by arrangement with the school, on a written schedule.</p></li>
      </ul>
      <p className="page-note">The total tuition is the same whichever option you choose. There is no instalment-plan fee and no automatic late-payment penalty.</p>
    </PageSection>
    <PageSection id="additional" eyebrow="Additional expenses" title="Told in advance, never unannounced." tone="ivory">
      <p className="fees-prose">School uniforms, books, stationery, educational visits and graduation-related expenses may be charged separately where applicable. Parents will be informed of these costs in advance.</p>
    </PageSection>
    <PageSection id="assistance" eyebrow="Financial assistance" title="Financial hardship should never prevent a child from receiving an education.">
      <div className="fees-prose">
        <p>Full sponsorship continues to be provided for residential children of the Pure Life Society and for children from eligible B40 households, subject to verification of household circumstances. Full sponsorship is intended to cover tuition and essential school-related requirements, including necessary learning materials, uniforms and meals.</p>
        <p>Families experiencing hardship outside the B40 category, or whose circumstances change unexpectedly, may also be considered for full or partial assistance on a case-by-case basis.</p>
        <p><a className="text-link" href="/join/fees/sponsorship">Equitable access and student sponsorship <ArrowRight size={15} /></a></p>
        <p>Parents requiring assistance are warmly encouraged to speak confidentially with the school administration. Parents with a hub account can also ask privately through <a href="/hub/requests/new/L03">My requests &amp; forms</a>; only the Finance Officer and the Headmistress see the request.</p>
      </div>
      <p className="page-note">For fee enquiries, payment arrangements or financial assistance, please <a href={mailto("Fee enquiry")}>contact the school office</a>.</p>
    </PageSection>
    <Principle />
    <Closing title="Read the full School Fees and Payment Policy.">
      <a className="primary-button" href="/join/fees/policy">Fees and Payment Policy</a>
      <a className="text-button" href={mailto("Fee enquiry")}>Contact the school office</a>
    </Closing>
  </main>;
}

// ---------- The School Fees and Payment Policy ----------
const POLICY = [
  ["commitment", "1. Our Commitment", <>
    <p>Sekolah Rendah Sathya Sai (SRSS) was established with the conviction that every child deserves an education that develops academic ability, character, confidence and human values.</p>
    <p>From 2002 until 2024, SRSS provided tuition-free education through the generosity of donors, members and volunteers associated with the Sathya Sai International Organisation of Malaysia (SSIOM), together with other well-wishers.</p>
    <p>Beginning in 2025, SRSS introduced an affordable tuition fee structure to support the continued provision of quality education and the school's long-term sustainability.</p>
    <p>The introduction of fees does not change our fundamental commitment: <strong>a child's financial circumstances should not determine their opportunity to receive an education.</strong></p>
    <p>Financial assistance, including full sponsorship where appropriate, remains an essential part of the SRSS mission.</p>
  </>],
  ["tuition", "2. School Tuition Fees", <>
    <p>Tuition fees are charged for <strong>{FEES.months} months each academic year, January through November</strong>.</p>
    <div className="fees-table-wrap"><table className="fees-table"><thead><tr><th scope="col">Description</th><th scope="col">Monthly</th><th scope="col">Annual</th></tr></thead><tbody><tr><th scope="row">School tuition</th><td>{money(FEES.tuitionMonthly)}</td><td>{money(FEES.tuitionMonthly * FEES.months)}</td></tr></tbody></table></div>
    <p>The tuition fee contributes towards the school's educational operations, including teaching and support personnel, classroom learning, educational resources, utilities, maintenance, student development and administration.</p>
    <p>SRSS operates on a not-for-profit basis. Tuition fees are applied towards the school's educational purposes and are not distributed as profits to private owners or shareholders.</p>
  </>],
  ["meals", "3. Student Meals — Separately Provided Service", <>
    <p>A meal service is available through an external food vendor.</p>
    <div className="fees-table-wrap"><table className="fees-table"><thead><tr><th scope="col">Description</th><th scope="col">Monthly</th><th scope="col">{FEES.months}-month total</th></tr></thead><tbody><tr><th scope="row">Vendor meal charge</th><td>{money(FEES.mealMonthly)}</td><td>{money(FEES.mealMonthly * FEES.months)}</td></tr></tbody></table></div>
    <p><strong>The meal charge is not a school tuition fee.</strong></p>
    <p>The meals are prepared and supplied by an independent vendor. The {ringgit(FEES.mealMonthly)} charge relates to this outsourced service and should be separately identified on invoices and payment records.</p>
    <p>For a family using the meal service, the standard combined monthly payment is:</p>
    <ul><li>School tuition: {ringgit(FEES.tuitionMonthly)}</li><li>Vendor meal charge: {ringgit(FEES.mealMonthly)}</li><li><strong>Total payable: {ringgit(FEES.tuitionMonthly + FEES.mealMonthly)}</strong></li></ul>
    <p>The school will communicate the approved meal arrangement, collection procedure and vendor-related terms to parents.</p>
    <p>Meal-related refunds, cancellations, dietary requirements and adjustments are subject to the vendor service terms communicated by the school.</p>
  </>],
  ["siblings", "4. Sibling Tuition Discounts", <>
    <p>SRSS recognises the financial commitment involved in educating several children from the same family.</p>
    <p>Where siblings are concurrently enrolled at SRSS, the following discounts apply to school tuition.</p>
    <SiblingTable meals={false} />
    <p>Sibling discounts apply only to tuition fees and do not reduce the independent vendor meal charge or other separately billed items.</p>
    <p>The discount applies while the relevant siblings remain concurrently enrolled in Standards 1–6. The school will review the family's discount entitlement when enrolment circumstances change.</p>
  </>],
  ["assistance", "5. Financial Assistance and Full Sponsorship", <>
    <p>SRSS remains committed to assisting children from families facing genuine financial hardship.</p>
    <h3>Full sponsorship</h3>
    <p>Eligible students may receive full sponsorship covering tuition and, where approved, essential educational needs such as uniforms, books, stationery and the meal service.</p>
    <p>Full sponsorship is maintained for residential children of the Pure Life Society under the school's established charitable commitment.</p>
    <p>Children from eligible B40 households receive full sponsorship, subject to verification of household circumstances and the school's admission and assistance procedures. Full sponsorship is intended to cover tuition and essential school-related requirements, including necessary learning materials, uniforms and meals.</p>
    <h3>Partial assistance</h3>
    <p>Families experiencing financial difficulty may apply for partial tuition assistance or a modified payment arrangement.</p>
    <p>Applications are assessed individually, taking into account household circumstances, dependants, financial obligations and the child's educational needs.</p>
    <p>Parents are encouraged to approach the school early and confidentially.</p>
    <p>Financial assistance decisions will be communicated privately. Information supplied for assessment will be handled with appropriate confidentiality and restricted access.</p>
  </>],
  ["payment", "6. Payment Arrangements", <>
    <p>SRSS offers several payment arrangements to accommodate different family circumstances.</p>
    <h3>Option A — Monthly payment</h3>
    <p>Tuition is payable by the <strong>{FEES.dueDay}th day of each applicable month</strong>, January through November.</p>
    <p>Standard tuition: {ringgit(FEES.tuitionMonthly)} per month, before any approved concession.</p>
    <h3>Option B — Six-monthly payment</h3>
    <p>Parents may elect to pay tuition in advance in larger instalments.</p>
    <p>For a full academic year, the standard tuition amount is {ringgit(FEES.tuitionMonthly * FEES.months)}, before concessions.</p>
    <p>The school will provide the applicable instalment schedule in writing. A six-monthly arrangement does not create a twelfth chargeable month.</p>
    <h3>Option C — Fortnightly payment</h3>
    <p>Parents who find smaller, more frequent payments manageable may request a fortnightly payment plan.</p>
    <p>The school will issue a written instalment schedule showing the amount and due date of each payment.</p>
    <p>The total tuition charged remains the same regardless of the payment frequency. No additional instalment-plan fee is proposed.</p>
    <p className="fees-callout"><strong>Important:</strong> A payment arrangement changes when the amount is paid; it does not change the approved annual tuition entitlement or any applicable discount.</p>
  </>],
  ["other", "7. Other Educational Expenses", <>
    <p>Certain expenses may be billed separately when applicable, including:</p>
    <ul><li>School uniforms and replacement garments.</li><li>Books, workbooks and stationery.</li><li>Educational visits, excursions and special activities.</li><li>Graduation-related items or activities.</li><li>Other specifically approved educational requirements.</li></ul>
    <p>The school will communicate the purpose, amount, due date and whether participation or purchase is compulsory before requesting payment.</p>
    <p>No unannounced additional charge should be imposed.</p>
    <p>Families receiving financial assistance may request support for essential additional expenses.</p>
  </>],
  ["records", "8. Invoices, Receipts and Payment Records", <>
    <p>Parents will receive a statement identifying:</p>
    <ul><li>The student's name and academic year.</li><li>Tuition charged.</li><li>Sibling discounts or approved concessions.</li><li>Separately charged vendor meals, where applicable.</li><li>Other approved charges.</li><li>Payments received.</li><li>Outstanding balance and due dates.</li></ul>
    <p>Official payment channels will be communicated by the school.</p>
    <p>Parents should retain payment references and receipts. Any discrepancy should be reported promptly so that it can be reviewed and corrected.</p>
  </>],
  ["late", "9. Late Payments and Financial Difficulties", <>
    <p>Parents are encouraged to settle fees by the agreed due dates.</p>
    <p>Where a payment cannot be made on time, parents should contact the school as early as possible to discuss a suitable arrangement.</p>
    <p>The school's preferred approach is supportive engagement rather than punitive action.</p>
    <p>Under the proposed policy:</p>
    <ul><li>Parents receive a courteous reminder after a missed due date.</li><li>Persistent outstanding balances are followed up privately by the authorised school administration.</li><li>Families may request an instalment revision or financial assistance review.</li><li>No student should be publicly identified, embarrassed or subjected to punitive classroom treatment because of unpaid fees.</li><li>Any significant administrative action relating to prolonged non-payment must receive appropriate management review and comply with applicable requirements.</li></ul>
    <p>No automatic late-payment penalty is proposed.</p>
  </>],
  ["withdrawals", "10. Mid-Year Admissions, Withdrawals and Refunds", <>
    <p>Students admitted during the academic year will receive an individual fee statement indicating the applicable tuition period.</p>
    <p>Parents intending to withdraw a child should notify the school in writing.</p>
    <p>Fees already due, advance payments and any refundable balance will be reconciled in accordance with the school's approved withdrawal and refund schedule.</p>
    <p>The school should publish that schedule before accepting advance tuition payments. Any non-refundable charge must be clearly disclosed before payment.</p>
  </>],
  ["review", "11. Annual Review of Fees", <>
    <p>SRSS may review its fee structure periodically to reflect operational requirements and the continuing needs of the school.</p>
    <p>Any change will require appropriate school approval and advance written notice to parents.</p>
    <p>Fee changes should not be applied retrospectively to periods already completed.</p>
  </>],
  ["responsibilities", "12. Parent Responsibilities", <>
    <p>By accepting an enrolment offer, parents or authorised guardians agree to:</p>
    <ul><li>Review the applicable tuition schedule and concessions.</li><li>Select an agreed payment arrangement.</li><li>Make payments through official channels.</li><li>Notify the school promptly of relevant changes in family circumstances.</li><li>Contact the school early when financial difficulties arise.</li><li>Review and settle separately approved educational charges.</li></ul>
    <p>The school, in turn, undertakes to communicate charges clearly, maintain accurate records, respect confidentiality and administer assistance fairly.</p>
  </>],
  ["questions", "13. Questions and Assistance", <>
    <p>Parents may contact the school administration regarding fee statements, payment schedules, sibling discounts, sponsorship applications or financial difficulties.</p>
    <p className="fees-pledge">Our commitment is to work with families so that educational continuity and the welfare of every child remain central to our decisions.</p>
    <p><a className="text-link" href={mailto("Fee enquiry")}>Contact the school office <ArrowRight size={15} /></a></p>
  </>],
];

export function FeePolicyPage() {
  return <main id="main" className="site-page fees-page">
    <PageHero eyebrow="Sekolah Rendah Sathya Sai" title="School Fees and Payment Policy">
      <dl className="fees-policy-meta">
        <div><dt>Effective from</dt><dd>Academic Year {FEES.effectiveFrom}</dd></div>
        <div><dt>Applicable to</dt><dd>Students enrolled in Standards 1–6</dd></div>
        <div><dt>Policy status</dt><dd>Proposed for formal school approval</dd></div>
      </dl>
    </PageHero>
    <div className="page-inner fees-policy">
      <nav className="fees-policy-toc" aria-label="Policy sections"><p className="eyebrow">Contents</p><ol>{POLICY.map(([id, title]) => <li key={id}><a href={`#${id}`}>{title.replace(/^\d+\.\s*/, "")}</a></li>)}</ol><a className="text-link" href="/join/fees">Fees at a glance <ArrowRight size={15} /></a></nav>
      <article className="fees-prose">{POLICY.map(([id, title, body]) => <section key={id} id={id} aria-labelledby={`${id}-title`}><h2 id={`${id}-title`}>{title}</h2>{body}</section>)}</article>
    </div>
  </main>;
}

// ---------- Our Commitment: not-for-profit education and financial stewardship ----------
function Transparency() {
  const income = FINANCES_2025.income.reduce((total, [, value]) => total + value, 0);
  const donations = FINANCES_2025.donations.reduce((total, [, value]) => total + value, 0);
  return <>
    <div className="fees-figures">
      {FINANCES_2025.income.map(([label, value]) => <div key={label}><span>{label}</span><strong>{ringgit(value)}</strong><small>{((value / income) * 100).toFixed(1)}% of income</small></div>)}
      <div className="fees-figure-expense"><span>Operating expenses</span><strong>{ringgit(FINANCES_2025.expenses)}</strong><small>for the year</small></div>
    </div>
    <div className="fees-table-wrap"><table className="fees-table">
      <caption>Donations received in 2025</caption>
      <thead><tr><th scope="col">Donor</th><th scope="col">Amount</th><th scope="col">Share</th></tr></thead>
      <tbody>{FINANCES_2025.donations.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{ringgit(value)}</td><td>{Math.round((value / donations) * 100)}%</td></tr>)}</tbody>
      <tfoot><tr><th scope="row">Total donations</th><td>{ringgit(donations)}</td><td>100%</td></tr></tfoot>
    </table></div>
    <p className="page-note">From the school's 2025 financial statements. School fees and books covered part of the year's operating costs; even with these contributions, the school continues to depend on the goodwill of donors, benefactors and supporters.</p>
  </>;
}

export function CommitmentPage() {
  return <main id="main" className="site-page fees-page">
    <PageHero eyebrow="Our Commitment" title={<>Education rooted in service, <em>sustained by generosity.</em></>}
      actions={<><a className="primary-button" href="/join/fees">School fees</a><a className="text-button" href="#transparency">Our 2025 finances</a></>}>
      <p>Since 2002, Sekolah Rendah Sathya Sai has pursued a simple but profound purpose: to nurture human excellence through education grounded in Truth, Right Conduct, Peace, Love and Non-violence.</p>
    </PageHero>
    <PageSection id="not-for-profit" eyebrow="Not-for-profit education" title="Our commitment to not-for-profit education.">
      <div className="fees-prose">
        <p>Our school was founded on the educational ideals of Sri Sathya Sai Baba, who regarded education as an instrument for developing both knowledge and character.</p>
        <p>For more than two decades, from 2002 through 2024, SRSS provided education without charging tuition fees.</p>
        <p>This was made possible through the extraordinary generosity of members, volunteers and well-wishers of the Sathya Sai International Organisation of Malaysia (SSIOM), together with other supporters who believed in the school's mission.</p>
        <p>Their contributions went far beyond financial donations. They offered their time, professional knowledge, voluntary service, organisational support and personal commitment to the school and its children.</p>
        <p>The Pure Life Society also played an invaluable role by generously making its premises available to the school, initially for a nominal rental of just RM1 per year, allowing SRSS to serve generations of students without the burden of acquiring its own campus. <a href="/about/pure-life-society">Our partnership with the Pure Life Society</a></p>
      </div>
    </PageSection>
    <PageSection id="why-fees" eyebrow="2025" title="Why fees were introduced in 2025." tone="ivory">
      <div className="fees-prose">
        <p>As SRSS grew, so did the responsibility of maintaining a stable educational environment.</p>
        <p>Teaching and support personnel, educational materials, student development, utilities, maintenance, safety and administration all require consistent resources.</p>
        <p>In 2025, SRSS introduced a modest tuition fee structure to establish a more predictable contribution towards these recurring educational expenses.</p>
        <p>This decision was not a departure from the school's charitable philosophy. Rather, it was an effort to preserve that philosophy through responsible financial planning.</p>
        <p className="fees-pledge">Tuition fees help sustain the school. They do not turn the school into a profit-making enterprise.</p>
      </div>
    </PageSection>
    <PageSection id="meaning" eyebrow="Financial stewardship" title="What does not-for-profit mean?">
      <div className="fees-prose">
        <p>SRSS is operated by Sekolah Rendah Sathya Berhad, a company limited by guarantee.</p>
        <p>Unlike a conventional privately owned business, the school's purpose is not to generate profits for private shareholders.</p>
        <p>Income received through tuition, donations and other legitimate sources is applied towards the school's educational objectives and institutional responsibilities.</p>
        <p>Any annual financial surplus is retained within the organisation to support its continuing purposes, subject to its governing documents and applicable requirements.</p>
        <p>A not-for-profit institution may charge fees, receive donations, maintain reserves and record an annual surplus. What distinguishes it is the purpose for which those resources are held and used.</p>
      </div>
    </PageSection>
    <PageSection id="transparency" eyebrow="Financial transparency" title="Where the school's income came from in 2025." tone="ivory">
      <Transparency />
    </PageSection>
    <PageSection id="campus" eyebrow="A permanent home" title="A permanent home for future generations.">
      <div className="fees-prose">
        <p>SRSS continues to operate from premises made available by the Pure Life Society. Since 2025 the school has paid a modest annual lease fee, and the lease has been renewed through 2035.</p>
        <p>The school does not yet own a permanent campus.</p>
        <p>Securing suitable long-term premises is therefore an important institutional aspiration. It would provide greater stability and allow SRSS to plan confidently for future generations.</p>
        <p>This is a substantial undertaking that will require careful planning, responsible governance and continued support from the wider community.</p>
      </div>
    </PageSection>
    <PageSection id="accessible" eyebrow="Keeping education accessible" title="Those who can contribute help those who need support." tone="ivory">
      <div className="fees-prose">
        <p>While tuition fees now contribute towards school operations, SRSS remains committed to supporting children whose families cannot afford them.</p>
        <p>Eligible children facing genuine financial hardship may receive partial or full sponsorship.</p>
        <p>The school also maintains its commitment to fully sponsored education for residential children of the Pure Life Society and for children from eligible B40 households.</p>
        <p>Our goal is not to exclude children who cannot pay, but to develop a sustainable model in which those who are able to contribute help the school continue serving those who need support.</p>
      </div>
    </PageSection>
    <PageSection id="service" eyebrow="The spirit of service continues" title="Tuition, generosity and service, each with its part.">
      <div className="fees-prose">
        <p>The introduction of fees does not diminish the contribution of SSIOM volunteers, donors and well-wishers.</p>
        <p>Their generosity remains central to SRSS's history, identity and future.</p>
        <p>Tuition income, charitable contributions and voluntary service each play a different but complementary role in sustaining the school.</p>
        <p>For SRSS, education has never been merely a commercial service.</p>
        <p className="fees-pledge">It is a shared responsibility, a commitment to human values and an investment in the future of every child entrusted to our care.</p>
      </div>
    </PageSection>
    <Closing title="Support the school, or find out about fees.">
      <a className="primary-button" href="/join/support-srss">Support SRSS</a>
      <a className="text-button" href="/join/fees">School fees</a>
    </Closing>
  </main>;
}
