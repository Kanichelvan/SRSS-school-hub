// Fees information only. Payment administration is intentionally outside the Digital Hub.
import { Link } from "react-router-dom";
import { PageHeader, Section } from "../ui";
import { CHILD_LABELS, FEES, childFees, ringgit } from "../../data/fees.js";
const money = (value) => ringgit(value, { decimals: 2 });

export function FeeInformation() {
  return <>
    <PageHeader kicker="School information" title="Fee schedule & billing procedure">Published pricing and guidance for families. Contact the school office for individual billing matters.</PageHeader>
    <Section title="Published fee schedule (effective Academic Year 2025)">
      <dl className="hub-facts">
        <div><dt>School tuition</dt><dd>{money(FEES.tuitionMonthly)} a month · {money(FEES.tuitionMonthly * FEES.months)} a year ({FEES.months} months, January–November)</dd></div>
        <div><dt>Vendor meals</dt><dd>{money(FEES.mealMonthly)} a month · {money(FEES.mealMonthly * FEES.months)} a year, charged separately from tuition</dd></div>
        {FEES.siblingDiscounts.map((rate, index) => <div key={rate}><dt>{index === FEES.siblingDiscounts.length - 1 ? "Fourth child onwards" : CHILD_LABELS[index]}</dt><dd>{Math.round(rate * 100)}% off tuition · {money(childFees(index + 1).tuition)} a month</dd></div>)}
      </dl>
      <p>The school confirms any revised schedule before it takes effect.</p>
    </Section>
    <Section title="Billing procedure">
      <p>The school office provides individual bills and handles payments, receipts and account queries through its established office process. Please contact the office directly about a bill, payment arrangement, correction, assistance or refund.</p>
      <p>Monthly tuition is due by the {FEES.dueDay}th under the published policy. Any alternative billing arrangement is agreed directly with the school.</p>
      <p><Link to="/join/fees/policy">Read the school fee policy</Link> · <Link to="/resources/contact">Contact the school office</Link></p>
    </Section>
  </>;
}
export const FamilyFees = FeeInformation;
export const FeesOffice = FeeInformation;
