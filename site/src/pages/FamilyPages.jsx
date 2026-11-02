// Family-facing school policies, supplied by the School (Nov 2026): the Vegetarian Food and School
// Activities Policy (/student-life/vegetarian-food), the Pure Life Society partnership
// (/about/pure-life-society), Equitable Access and Student Sponsorship (/join/fees/sponsorship) and the
// Parent–School Partnership and Shared Values Agreement (/join/parent-partnership).
// Loaded on demand to keep the homepage light. Forms: B16 agreement, B17 event food, B18 medical diet, L03 assistance.
import { ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { Bird } from "@phosphor-icons/react/dist/csr/Bird";
import { BowlFood } from "@phosphor-icons/react/dist/csr/BowlFood";
import { Cake } from "@phosphor-icons/react/dist/csr/Cake";
import { Carrot } from "@phosphor-icons/react/dist/csr/Carrot";
import { Check } from "@phosphor-icons/react/dist/csr/Check";
import { Cow } from "@phosphor-icons/react/dist/csr/Cow";
import { Drop } from "@phosphor-icons/react/dist/csr/Drop";
import { Egg } from "@phosphor-icons/react/dist/csr/Egg";
import { Fish } from "@phosphor-icons/react/dist/csr/Fish";
import { Grains } from "@phosphor-icons/react/dist/csr/Grains";
import { Leaf } from "@phosphor-icons/react/dist/csr/Leaf";
import { Plant } from "@phosphor-icons/react/dist/csr/Plant";
import { Storefront } from "@phosphor-icons/react/dist/csr/Storefront";
import { Tent } from "@phosphor-icons/react/dist/csr/Tent";
import { Trophy } from "@phosphor-icons/react/dist/csr/Trophy";
import { Users } from "@phosphor-icons/react/dist/csr/Users";
import { Closing, PageHero, PageSection } from "./SitePages.jsx";
import { FOOD, PURE_LIFE, SPONSORSHIP } from "../data/familyPolicies.js";
import "./fees.css";
import "./family.css";

const OFFICE = "saischoolpuchong@gmail.com";
const mailto = (subject) => `mailto:${OFFICE}?subject=${encodeURIComponent(subject)}`;
const form = (id) => `/hub/requests/new/${id}`;
const VALUES = ["Truth", "Right Conduct", "Peace", "Love", "Non-violence"];

// ---------- Vegetarian Food and School Activities Policy ----------
const OCCASIONS = [
  [BowlFood, "Daily school meals and food brought from home"],
  [Cake, "Recess, classroom celebrations and birthday events"],
  [Trophy, "School assemblies, sports days, camps and excursions"],
  [Users, "Parent–teacher gatherings and school functions"],
  [Storefront, "Food provided by external caterers, vendors, sponsors or volunteers"],
  [Tent, "Off-campus activities conducted under the school's supervision"],
];
const PERMITTED = [[Carrot, "Vegetables"], [Leaf, "Fruits"], [Grains, "Grains"], [Plant, "Legumes"], [Plant, "Nuts and seeds"], [Drop, "Milk and dairy products"]];
const NOT_PERMITTED = [[Cow, "Meat"], [Bird, "Poultry"], [Fish, "Fish"], [Fish, "Seafood"]];

export function FoodPolicyPage() {
  return <main id="main" className="site-page fees-page">
    <PageHero eyebrow="Vegetarian Food and School Activities Policy" title={<>Compassion, <em>served daily.</em></>}
      actions={<><a className="primary-button" href="#permitted">What may be served</a><a className="text-button" href="/forms/B17">Check food for an event</a></>}>
      <p>At Sekolah Rendah Sathya Sai, vegetarian food is an established part of our school environment, reflecting our commitment to compassion, non-violence, respect for life and responsible living.</p>
    </PageHero>
    <PageSection id="applies" eyebrow="Where the policy applies" title="All food served, shared or consumed during school-organised activities must be vegetarian.">
      <ul className="family-occasions">{OCCASIONS.map(([Icon, label]) => <li key={label}><Icon size={26} weight="duotone" aria-hidden="true" /><span>{label}</span></li>)}</ul>
    </PageSection>
    <PageSection id="permitted" eyebrow="What is permitted?" title="On the table, and off it." tone="ivory">
      <div className="family-plate">
        <section className="family-plate-yes" aria-labelledby="plate-yes"><h3 id="plate-yes"><Check size={18} weight="bold" aria-hidden="true" /> Vegetarian food may include</h3>
          <ul>{PERMITTED.map(([Icon, label]) => <li key={label}><Icon size={22} weight="duotone" aria-hidden="true" />{label}</li>)}</ul>
          <p>Subject to individual dietary requirements.</p></section>
        <section className="family-plate-no" aria-labelledby="plate-no"><h3 id="plate-no">Not permitted</h3>
          <ul>{NOT_PERMITTED.map(([Icon, label]) => <li key={label}><Icon size={22} weight="duotone" aria-hidden="true" />{label}</li>)}</ul>
          <p>Nor food containing ingredients derived from these.</p></section>
        <section className="family-plate-pending" aria-labelledby="plate-eggs"><h3 id="plate-eggs"><Egg size={20} weight="duotone" aria-hidden="true" /> Eggs and foods containing eggs</h3>
          <p>{FOOD.eggs}</p></section>
      </div>
    </PageSection>
    <PageSection id="responsibilities" eyebrow="Responsibilities of parents and visitors" title="Check first, especially when food is shared.">
      <div className="fees-prose">
        <p>Parents are requested to ensure that food packed for school or contributed to school events complies with this policy.</p>
        <p>When organising celebrations or providing refreshments, parents should consult the school beforehand, particularly where food allergies, ingredient restrictions or special dietary requirements are involved.</p>
        <p>The same expectations apply to visitors, volunteers and external food providers.</p>
      </div>
      <ul className="fees-options family-actions">
        <li><h3>Bringing food for a celebration or event</h3><p>Tell the school what you plan to bring and when. The office will confirm, or suggest an alternative.</p><a className="text-link" href="/forms/B17">Check food for an event <ArrowRight size={15} /></a></li>
        <li><h3>A medically necessary diet</h3><p>Let the school know privately so that an appropriate arrangement can be considered. Only authorised staff see the details.</p><a className="text-link" href={form("B18")}>Ask for a dietary arrangement <ArrowRight size={15} /></a></li>
      </ul>
    </PageSection>
    <PageSection id="respectful" eyebrow="Respectful implementation" title="Guided with kindness, never with embarrassment." tone="ivory">
      <div className="fees-prose">
        <p>This policy governs food within the school environment and school-organised activities. It does not seek to regulate what families eat in their private lives.</p>
        <p>Children will be guided with kindness and understanding. Accidental non-compliance should be addressed discreetly and without embarrassment.</p>
        <p>Where a child has a medically necessary dietary requirement, parents should inform the school so that an appropriate arrangement can be considered.</p>
        <p className="fees-pledge">Our intention is to make compassion and non-violence part of daily school life through understanding, consistency and positive example.</p>
      </div>
    </PageSection>
    <Closing title="Questions about food at school?">
      <a className="primary-button" href={mailto("Vegetarian food question")}>Contact the school office</a>
      <a className="text-button" href="/join/parent-partnership">Our partnership with families</a>
    </Closing>
  </main>;
}

// ---------- A Home Made Possible Through Generosity ----------
export function PureLifePage() {
  return <main id="main" className="site-page fees-page">
    <PageHero eyebrow="Our enduring partnership with the Pure Life Society" title={<>A home made possible <em>through generosity.</em></>}
      actions={<><a className="primary-button" href="#journey">The partnership over the years</a><a className="text-button" href="/join/fees/sponsorship">Fully sponsored education</a></>}>
      <p>Since its early years, Sekolah Rendah Sathya Sai has benefited from the generosity of the Pure Life Society, whose support has played an important role in making accessible, values-based education possible.</p>
    </PageHero>
    <PageSection id="journey" eyebrow="The partnership" title="From RM1 a year to a lease renewed through 2035.">
      <ol className="family-timeline">{PURE_LIFE.timeline.map(({ when, title, text, future }) => <li key={title} className={future ? "is-future" : undefined}><p className="family-timeline-when">{when}</p><h3>{title}</h3><p>{text}</p></li>)}</ol>
    </PageSection>
    <PageSection id="generosity" eyebrow="An extraordinary gesture" title="More of every gift went to educating children." tone="ivory">
      <div className="family-split">
        <div className="fees-prose">
          <p>Recognising the school's charitable educational mission, the Pure Life Society initially made its premises available to SRSS for a nominal rental of just <strong>RM1 per year</strong>.</p>
          <p>This extraordinary gesture helped the school minimise its operating expenses and enabled SSIOM members and well-wishers to direct their contributions towards educating children.</p>
          <p>Beginning in 2025, the rental arrangement was revised to a modest annual lease fee. The lease has since been renewed through <strong>2035</strong>, providing SRSS with greater continuity as it plans for the future.</p>
        </div>
        <dl className="fees-figures family-figures">
          <div><dt>Original rental</dt><dd><strong>RM1</strong><small>per year</small></dd></div>
          <div><dt>Lease renewed through</dt><dd><strong>2035</strong><small>greater continuity for planning</small></dd></div>
          <div><dt>Pure Life Society children at SRSS</dt><dd><strong>{PURE_LIFE.children}</strong><small>residential children, fully sponsored</small></dd></div>
        </dl>
      </div>
    </PageSection>
    <PageSection id="beyond" eyebrow="Beyond the premises" title="A partnership in the lives of children.">
      <div className="fees-prose">
        <p>The partnership extends beyond the provision of premises.</p>
        <p>Today, more than 20 residential children from the Pure Life Society attend SRSS and continue to receive fully sponsored education.</p>
        <p>While SRSS remains grateful for the security offered by its renewed lease, the school continues to work towards its long-term aspiration of securing a permanent campus of its own.</p>
        <p>This enduring relationship reflects a shared belief that education, compassion and service can transform lives.</p>
        <p className="fees-pledge">For SRSS, the Pure Life Society has provided more than a place to teach. It has helped provide a home in which generations of children could learn and grow.</p>
      </div>
    </PageSection>
    <Closing title="Read about our not-for-profit commitment.">
      <a className="primary-button" href="/about/our-commitment">Our Commitment</a>
      <a className="text-button" href="/about/campus">Our campus</a>
    </Closing>
  </main>;
}

// ---------- Equitable Access and Student Sponsorship ----------
const Mark = ({ value }) => value === true ? <><Check size={18} weight="bold" aria-hidden="true" /><span className="visually-hidden">Covered</span></> : <span>{value}</span>;

export function SponsorshipPage() {
  return <main id="main" className="site-page fees-page">
    <PageHero eyebrow="Equitable access and student sponsorship" title={<>An opportunity for <em>every child.</em></>}
      actions={<><a className="primary-button" href="#who">Who is sponsored</a><a className="text-button" href={form("L03")}>Ask confidentially for assistance</a></>}>
      <p>Education should be an opportunity available to every child, regardless of family income or social circumstances.</p>
    </PageHero>
    <PageSection id="commitment" eyebrow="Our commitment" title="Affordable fees, an unchanged commitment.">
      <div className="fees-prose">
        <p>For more than two decades, SRSS operated without charging tuition fees, supported by SSIOM members, volunteers, donors and well-wishers.</p>
        <p>Although affordable tuition fees were introduced in 2025, our commitment to accessible education remains unchanged.</p>
      </div>
    </PageSection>
    <PageSection id="who" eyebrow="Fully sponsored education" title="Three ways a child's education is supported." tone="ivory">
      <ol className="family-paths">{SPONSORSHIP.paths.map((path) => <li key={path.id} id={path.id}><p className="eyebrow">{path.support}</p><h3>{path.title}</h3><p>{path.text}</p><p className="family-paths-how"><strong>How it starts:</strong> {path.how}</p></li>)}</ol>
    </PageSection>
    <PageSection id="covers" eyebrow="What sponsorship covers" title="Tuition, and the essentials of school life.">
      <div className="fees-table-wrap"><table className="fees-table family-matrix">
        <caption>Support by pathway</caption>
        <thead><tr><th scope="col">Support</th>{SPONSORSHIP.paths.map((path) => <th key={path.id} scope="col">{path.short}</th>)}</tr></thead>
        <tbody>{SPONSORSHIP.covers.map(([item, ...cells]) => <tr key={item}><th scope="row">{item}</th>{cells.map((cell, index) => <td key={index}><Mark value={cell} /></td>)}</tr>)}</tbody>
      </table></div>
      <p className="page-note">Full sponsorship is intended to cover tuition and essential school-related requirements, including necessary learning materials, uniforms and meals. Partial assistance is assessed individually.</p>
    </PageSection>
    <PageSection id="assistance" eyebrow="Additional financial assistance" title="When circumstances change, ask early." tone="ivory">
      <div className="fees-prose">
        <p>Families experiencing hardship outside the B40 category, or whose circumstances change unexpectedly, may also be considered for full or partial assistance.</p>
        <p>Applications are treated confidentially and assessed with compassion and fairness. Only the Finance Officer and the Headmistress see a request, and decisions are communicated privately.</p>
        <p><a className="text-link" href={form("L03")}>Ask confidentially for financial assistance <ArrowRight size={15} /></a> · <a className="text-link" href={mailto("Financial assistance")}>or contact the school office <ArrowRight size={15} /></a></p>
      </div>
    </PageSection>
    <section className="fees-principle" aria-label="Dignity"><div className="page-inner"><p className="eyebrow">Dignity first</p><p><span>No child should be made to feel different</span><span>because their education is sponsored.</span></p></div></section>
    <PageSection id="dignity" eyebrow="Equal participation" title="Every child takes part as an equal.">
      <p className="fees-prose">The school is committed to preserving the dignity, equal participation and educational opportunities of every student.</p>
    </PageSection>
    <Closing title="Fees, discounts and the family calculator.">
      <a className="primary-button" href="/join/fees">School fees</a>
      <a className="text-button" href="/about/pure-life-society">The Pure Life Society</a>
    </Closing>
  </main>;
}

// ---------- Parent–School Partnership and Shared Values Agreement ----------
const EXPECTATIONS = [
  ["Reinforce human values at home", "Encourage honesty, kindness, self-discipline, responsibility, respect for others and care for the environment. Help children understand that good character matters as much as academic achievement."],
  ["Lead by example", "Children learn from what adults do. Parents are encouraged to demonstrate respectful speech, patience, integrity and consideration in their interactions with teachers, staff, other parents and children."],
  ["Support learning and attendance", "Ensure that children attend school regularly and punctually, arrive prepared for learning, complete age-appropriate responsibilities and receive sufficient rest and support at home."],
  ["Respect the school's educational philosophy", <>Support the school's emphasis on character formation, silent sitting, human values education, service, respect for different faiths and cultures, and its <a href="/student-life/vegetarian-food">vegetarian food policy</a>. Participation in the school's values-based educational programme does not require families to adopt a particular religious belief.</>],
  ["Encourage simplicity and responsible living", "Help children appreciate gratitude, moderation, cleanliness, environmental responsibility and the dignity of every individual, regardless of background or financial circumstances."],
  ["Maintain respectful communication", "Raise concerns directly and constructively with the appropriate teacher or school administrator. Avoid confrontational behaviour, public criticism of individual children or staff, and the circulation of unverified information."],
  ["Protect the dignity and wellbeing of every child", "Encourage friendship, inclusion and compassion. Support the school's efforts to prevent bullying, discrimination, humiliation and harmful behaviour."],
  ["Work cooperatively with the school", "Attend important parent meetings, respond to essential communications, keep contact and medical information updated, and cooperate with reasonable school procedures."],
];
const UNDERTAKINGS = [
  "Treat every child with dignity, fairness and compassion.",
  "Provide a safe, supportive and values-centred learning environment.",
  "Maintain professional and respectful communication.",
  "Recognise the individual needs and abilities of students.",
  "Support academic progress alongside character development.",
  "Respect the diversity of families and religious traditions.",
  "Address concerns fairly and confidentially.",
  "Work with parents in the best interests of their children.",
];

export function PartnershipPage() {
  return <main id="main" className="site-page fees-page">
    <PageHero eyebrow="Parent–School Partnership and Shared Values Agreement" title={<>Growing together in <em>Human Excellence.</em></>}
      actions={<><a className="primary-button" href={form("B16")}>Read and agree</a><a className="text-button" href="#expectations">What we ask of families</a></>}>
      <p>At Sekolah Rendah Sathya Sai, we believe that education is most effective when the school and family work together.</p>
    </PageHero>
    <PageSection id="values" eyebrow="Five universal human values" title="Academic development and character, given equal importance.">
      <ul className="family-values" aria-label="The five universal human values">{VALUES.map((value) => <li key={value}>{value}</li>)}</ul>
      <div className="fees-prose">
        <p>These values are taught not only through lessons, but through relationships, daily habits, conduct and personal example.</p>
        <p>We invite every parent and guardian to become an active partner in nurturing these qualities.</p>
      </div>
    </PageSection>
    <section className="family-covenant page-inner" aria-label="The partnership">
      <div id="expectations">
        <p className="eyebrow">Our expectations of parents and guardians</p>
        <h2>What we ask of families</h2>
        <ol className="family-expectations">{EXPECTATIONS.map(([title, text]) => <li key={title}><h3>{title}</h3><p>{text}</p></li>)}</ol>
      </div>
      <div id="our-commitment">
        <p className="eyebrow">Our commitment to parents</p>
        <h2>In return, SRSS undertakes to</h2>
        <ul className="family-undertakings">{UNDERTAKINGS.map((item) => <li key={item}><Check size={18} weight="bold" aria-hidden="true" />{item}</li>)}</ul>
      </div>
    </section>
    <PageSection id="shared" eyebrow="Our shared commitment" title="A shared responsibility between the family and the school." tone="ivory">
      <div className="fees-prose">
        <p>We understand that the education of a child is a shared responsibility between the family and the school.</p>
        <p>We agree to support the principles of human values education and to work together in nurturing children who are academically capable, compassionate, responsible and respectful of others.</p>
        <p className="fees-pledge">At SRSS, we do not merely prepare children for examinations. We prepare them for life.</p>
      </div>
      <p className="page-note">Parents and guardians can record their agreement in the parent hub. <a className="text-link" href={form("B16")}>Read and agree in the parent hub <ArrowRight size={15} /></a></p>
    </PageSection>
    <Closing title="Thinking of joining SRSS?">
      <a className="primary-button" href="/join/admissions">Admissions</a>
      <a className="text-button" href="/join/fees">School fees</a>
    </Closing>
  </main>;
}
