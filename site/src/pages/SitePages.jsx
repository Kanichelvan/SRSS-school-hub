// Landing pages for Website Architecture v2.0. They assemble existing, verified content in its new home:
// shared homepage blocks (passed in as `blocks`), FAQ records and the route map. Child URLs that are
// "sections" scroll to the matching anchor here until they earn standalone pages (see src/data/siteMap.js).
import { useMemo, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { FaqList, FAQ_TOPICS } from "../components/Faq.jsx";
import { breadcrumbs, childrenOf, searchSite } from "../data/siteMap.js";
import { contact, safeguardingLead } from "../legal/registry.js";

const OFFICE = "saischoolpuchong@gmail.com";
const mailto = (subject) => `mailto:${OFFICE}?subject=${encodeURIComponent(subject)}`;

export function Breadcrumbs({ entry }) {
  if (!entry || entry.path === "/" || entry.page === "notFound") return null;
  const trail = breadcrumbs(entry);
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="page-inner">{trail.map((item, index) => <li key={item.path}>{index === trail.length - 1 ? <span aria-current="page">{item.label}</span> : <a href={item.path}>{item.label}</a>}</li>)}</ol>
    </nav>
  );
}

function PageHero({ eyebrow, title, children, actions, image, alt }) {
  return (
    <section className={`landing-hero${image ? "" : " landing-hero-plain"}`} id="top">
      <div className="page-inner landing-hero-grid">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <div className="landing-hero-copy">{children}</div>
          {actions && <div className="landing-hero-actions">{actions}</div>}
        </div>
        {image && <figure><img src={image} alt={alt} /></figure>}
      </div>
    </section>
  );
}

// Cards for every child page of a landing page, from the route map.
function Directory({ path, title = "Explore this section" }) {
  const items = childrenOf(path);
  return (
    <nav className="page-directory page-inner" aria-label={title}>
      {items.map((item) => <a key={item.path} href={item.path}><strong>{item.label}</strong><span>{item.summary}</span><ArrowRight size={16} aria-hidden="true" /></a>)}
    </nav>
  );
}

function PageSection({ id, eyebrow, title, intro, children, tone }) {
  return (
    <section className={`page-section${tone ? ` page-section-${tone}` : ""}`} id={id} aria-labelledby={`${id}-title`}>
      <div className="page-inner">
        <header className="page-section-head"><p className="eyebrow">{eyebrow}</p><h2 id={`${id}-title`}>{title}</h2>{intro && <p>{intro}</p>}</header>
        {children}
      </div>
    </section>
  );
}

function Closing({ title, children }) {
  return <section className="page-closing"><div className="page-inner"><h2>{title}</h2><div className="landing-hero-actions">{children}</div></div></section>;
}

// Moved from the About page: the whole-child framework belongs with how SRSS teaches.
export function LearningApproach() {
  return <section className="learning-refresh about-inner" id="approach"><div><p className="eyebrow">Our approach to learning</p><h2>More Than Schooling, <em>Educating the Whole Child.</em></h2><p>Children do not all learn in the same way, develop at the same pace or reveal their strengths through examinations alone. Our educational model creates space to know, become, think, live, do and serve.</p></div><div className="excellence-framework"><strong>HUMAN EXCELLENCE</strong><div><span><b>KNOWING</b>Academics</span><span><b>BECOMING</b>Character</span><span><b>THINKING</b>Critical thinking</span><span><b>LIVING</b>Human Values</span><span><b>DOING</b>Practical skills</span><span><b>SERVING</b>Social responsibility</span></div></div></section>;
}

// Shared by About › Campus and Learning › Learning environment (one source).
export const LEARNING_SPACES = [["Science & Discovery", "Hands-on experimentation, scientific inquiry, observation and problem-solving.", "science-microscope-1600.jpg"], ["Digital Learning", "Digital literacy, research, creativity and responsible use of technology.", "classroom-art-1280.jpg"], ["Library & Reading", "Reading culture, literacy development and independent discovery.", "chess-competition-1280.jpg"], ["Learning Support", "Targeted intervention and personalised support for every learner.", "student-speaker-960.jpg"]];
export function LearningSpaces({ id, eyebrow = "Spaces designed for learning", title = "Opportunity to enquire, create and grow." }) {
  return <section className="spaces-refresh" id={id}><div className="about-inner"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><div>{LEARNING_SPACES.map(([heading, copy, image]) => <article key={heading}><img src={`/assets/photos/processed/${image}`} alt="" /><h3>{heading}</h3><p>{copy}</p></article>)}</div></div></section>;
}

export function OrganisationChart() {
  return <div className="organisation-chart" aria-label="SRSS organisation chart"><div className="org-node org-board"><span>01</span><strong>Board of Governors</strong><small>Stewardship &amp; governance</small></div><div className="org-line" aria-hidden="true" /><div className="org-row"><div className="org-node"><span>02</span><strong>School Leadership</strong><small>Principal &amp; administration</small></div><div className="org-node"><span>03</span><strong>Teaching Team</strong><small>Learning &amp; pupil wellbeing</small></div><div className="org-node"><span>04</span><strong>School Community</strong><small>Families, volunteers &amp; partners</small></div></div></div>;
}

// ---------- 02 Learning ----------
export function LearningPage({ blocks, faqs }) {
  return <main id="main" className="site-page">
    <PageHero eyebrow="Learning at SRSS" title="Every Child. Every Possibility." image="/assets/photos/processed/science-lab-lesson-1600.jpg" alt="A teacher demonstrating a science experiment to SRSS pupils."
      actions={<><a className="primary-button" href="/learning/curriculum">Explore the Curriculum <ArrowRight size={18} /></a><a className="text-button" href="/student-life">Discover Student Life <ArrowRight size={18} /></a></>}>
      <p>At SRSS, learning develops knowledge, curiosity, confidence, character and the ability to contribute meaningfully to the world.</p>
    </PageHero>
    <Directory path="/learning" title="Learning at SRSS" />
    <LearningApproach />
    <PageSection id="curriculum" eyebrow="Curriculum" title="Malaysia’s national curriculum, taught with heart." intro="SRSS follows the national primary curriculum, with the five human values woven through every subject.">
      <FaqList items={faqs} questions={FAQ_TOPICS.curriculum} idPrefix="curriculum" firstOpen />
    </PageSection>
    <PageSection id="learning-journey" eyebrow="The learning journey" title="Standard 1 to Standard 6." tone="ivory">
      <FaqList items={faqs} questions={FAQ_TOPICS.journey} idPrefix="journey" firstOpen />
    </PageSection>
    <div id="human-values" className="anchor-block">{blocks.learning()}</div>
    <LearningSpaces id="learning-environment" eyebrow="Learning environment" />
    <Closing title="See learning come alive.">
      <a className="primary-button" href="/student-life">Discover Student Life <ArrowRight size={18} /></a>
      <a className="text-button" href="/about/sathya-sai-education">The philosophy behind it <ArrowRight size={18} /></a>
    </Closing>
  </main>;
}

// ---------- 03 Student Life ----------
export function StudentLifePage({ blocks, faqs }) {
  return <main id="main" className="site-page">
    <PageHero eyebrow="Student Life" title="Growing Together. Learning for Life." image="/assets/photos/processed/sports-day-march-1600.jpg" alt="SRSS pupils taking part in a Sports Day march."
      actions={<><a className="primary-button" href="/student-life/gallery">See school life <ArrowRight size={18} /></a><a className="text-button" href="/student-life/stories">Read our stories <ArrowRight size={18} /></a></>}>
      <p>Beyond lessons and examinations, SRSS offers children opportunities to discover their talents, build friendships, develop confidence and practise human values through meaningful experiences.</p>
    </PageHero>
    <Directory path="/student-life" title="Student Life" />
    <PageSection id="a-day" eyebrow="A day at SRSS" title="Every day begins before the first bell." intro="Silent sitting, school prayers, Negaraku, Rukun Negara, the school anthem and pledge set the tone for learning each morning.">
      <div className="page-split">
        <a className="feature-link" href="/resources/prayer-pledge-anthem"><img src="/assets/prayer-page/silent-sitting-practice.jpg" alt="SRSS pupils in silent sitting at morning assembly." /><span><strong>Before the First Bell</strong><small>Practise the morning assembly at home</small></span><ArrowRight size={18} aria-hidden="true" /></a>
        <FaqList items={faqs} questions={FAQ_TOPICS.schoolDay} idPrefix="school-day" />
      </div>
    </PageSection>
    <div id="gallery" className="anchor-block">{blocks.gallery({ all: true })}</div>
    <div id="stories" className="anchor-block">{blocks.news()}</div>
    <div id="events" className="anchor-block">{blocks.calendar()}</div>
    <Closing title="Come and see a school day for yourself.">
      <button type="button" className="primary-button" onClick={blocks.openVisit}>Arrange a visit <ArrowRight size={18} /></button>
      <a className="text-button" href="/join">Join SRSS <ArrowRight size={18} /></a>
    </Closing>
  </main>;
}

// ---------- 04 Join SRSS ----------
const COMMUNITY = [
  { id: "alumni", title: "Alumni", copy: "Reconnect with the school that shaped you, and share your memories for our Silver Jubilee.", actions: [["Share your SRSS memory", mailto("SRSS25 alumni memory")], ["Read alumni voices", "/about/our-people"]] },
  { id: "volunteer", title: "Volunteer", copy: "Offer your time, expertise or practical support to school activities. Volunteers working with pupils follow our Child Protection & Safeguarding Policy.", actions: [["Offer to volunteer", mailto("Volunteering at SRSS")], ["Safeguarding policy", "/legal/child-safeguarding"]] },
  { id: "support-srss", title: "Support SRSS", copy: "Contribute to approved school initiatives, including SRSS25 anniversary projects.", actions: [["Ask how to help", mailto("Supporting SRSS")]] },
  { id: "parents-community", title: "Parents & Community", copy: "Take part in school-community life alongside our teachers, including through the Teacher-Parent Association.", actions: [["Contact the school office", mailto("Parents and community")], ["Current families: sign in", "/login"]] },
];

export function JoinPage() {
  return <main id="main" className="site-page">
    <PageHero eyebrow="Join SRSS" title="Be Part of Something Meaningful." image="/assets/photos/processed/field-friends-1052.jpg" alt="Smiling SRSS pupils sitting together on the school field.">
      <p>Whether you are choosing a school for your child, reconnecting as an alumnus or contributing your time and talents, there is a place for you in the SRSS community.</p>
    </PageHero>
    <section className="page-pathways page-inner" aria-label="Two ways to join SRSS">
      <a href="/join/admissions" className="pathway-card"><p className="eyebrow">Pathway A</p><h2>Join Our School</h2><p>For prospective families: why SRSS, how to apply, fees and visits.</p><span>Admissions <ArrowRight size={17} /></span></a>
      <a href="/join/get-involved" className="pathway-card"><p className="eyebrow">Pathway B</p><h2>Join Our Community</h2><p>For alumni, volunteers, supporters and current families.</p><span>Get involved <ArrowRight size={17} /></span></a>
    </section>
    <PageSection id="community" eyebrow="Get involved" title="A School Built by a Community." intro="Teachers, parents, alumni and volunteers each bring something essential to a child’s education." tone="ivory">
      <div className="community-grid">{COMMUNITY.map((item) => <article key={item.id} id={item.id}><h3>{item.title}</h3><p>{item.copy}</p><div>{item.actions.map(([label, href]) => <a key={label} className="text-link" href={href}>{label} <ArrowRight size={15} /></a>)}</div></article>)}</div>
    </PageSection>
  </main>;
}

export function AdmissionsPage({ blocks, faqs, pillars }) {
  return <main id="main" className="site-page">
    <PageHero eyebrow="Admissions" title="Begin the journey." image="/assets/photos/processed/assembly-achievements-1280.jpg" alt="SRSS pupils sharing certificates during assembly."
      actions={<><a className="primary-button" href="#enquiry">Make an enquiry <ArrowRight size={18} /></a><button type="button" className="text-button" onClick={blocks.openVisit}>Book a visit <ArrowRight size={18} /></button></>}>
      <p>SRSS welcomes primary-age children, Standard 1 to Standard 6, from families of every background who share a values-based approach to education.</p>
    </PageHero>
    <Directory path="/join/admissions" title="Admissions" />
    <PageSection id="why-srss" eyebrow="Why SRSS?" title="An education for the head, heart and hands.">
      <ul className="page-pillars">{pillars.map(([Icon, title, copy]) => <li key={title}><Icon size={26} weight="duotone" aria-hidden="true" /><h3>{title}</h3><p>{copy}</p></li>)}</ul>
      <FaqList items={faqs} questions={FAQ_TOPICS.whySrss} idPrefix="why" />
    </PageSection>
    <div id="how-to-apply" className="anchor-block">{blocks.admissions()}</div>
    <PageSection id="fees" eyebrow="Fees" title="Fees and financial information." tone="ivory">
      <FaqList items={faqs} questions={FAQ_TOPICS.fees} idPrefix="fees" firstOpen />
      <p className="page-note"><a className="text-link" href={mailto("Fee enquiry")}>Request the current fee schedule <ArrowRight size={15} /></a></p>
    </PageSection>
    <PageSection id="admissions-faq" eyebrow="Admissions FAQs" title="Questions families ask.">
      <FaqList items={faqs} questions={FAQ_TOPICS.admissions} idPrefix="admissions-faq" />
      <p className="page-note"><a className="text-link" href="/resources/faq">All frequently asked questions <ArrowRight size={15} /></a></p>
    </PageSection>
    {blocks.contact()}
  </main>;
}

// ---------- 05 Resources ----------
const DOWNLOADS = [
  ["School prospectus", "Request a copy by email.", mailto("Prospectus request")],
  ["Fee information", "Request the current fee schedule.", mailto("Fee enquiry")],
  ["Before the First Bell", "The morning assembly guide, printable.", "/resources/prayer-pledge-anthem"],
];
const POLICY_LINKS = [["Privacy Policy", "/legal/privacy"], ["Terms of Use", "/legal/terms"], ["Child Protection & Safeguarding", "/legal/child-safeguarding"], ["Photography & Media Consent", "/legal/media-consent"], ["Accessibility & Complaints", "/legal/accessibility-complaints"]];

export function SiteSearch({ autoFocus = false, id = "resources-search" }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchSite(query), [query]);
  return (
    <div className="site-search">
      <form role="search" onSubmit={(event) => { event.preventDefault(); if (results[0]) window.location.assign(results[0].path); }}>
        <MagnifyingGlass size={20} aria-hidden="true" />
        <label htmlFor={id} className="visually-hidden">Search the SRSS website</label>
        <input id={id} type="search" autoFocus={autoFocus} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “admissions”, “calendar” or “values”" autoComplete="off" />
      </form>
      {query.trim() && <ul className="site-search-results" aria-live="polite">{results.length ? results.map((entry) => <li key={entry.path}><a href={entry.path}><strong>{entry.label}</strong><span>{entry.summary}</span></a></li>) : <li className="site-search-empty">No page matches “{query}”. Try the <a href="/resources/faq">FAQs</a> or <a href="/resources/contact">contact the school</a>.</li>}</ul>}
    </div>
  );
}

export function ResourcesPage({ blocks }) {
  return <main id="main" className="site-page">
    <PageHero eyebrow="Resources" title="Everything You Need, In One Place.">
      <SiteSearch />
    </PageHero>
    <Directory path="/resources" title="Resources" />
    <div id="calendar" className="anchor-block">{blocks.calendar()}</div>
    <div id="news" className="anchor-block">{blocks.news()}</div>
    <PageSection id="downloads" eyebrow="Downloads" title="Documents and forms." intro="Approved public documents are added here as they are published. Forms for current families are in the Parents Hub." tone="ivory">
      <ul className="resource-list">{DOWNLOADS.map(([title, copy, href]) => <li key={title}><a href={href}><strong>{title}</strong><span>{copy}</span><ArrowRight size={16} aria-hidden="true" /></a></li>)}</ul>
    </PageSection>
    <PageSection id="policies" eyebrow="Policies" title="Privacy, safeguarding and school policies.">
      <ul className="resource-list">{POLICY_LINKS.map(([title, href]) => <li key={href}><a href={href}><strong>{title}</strong><ArrowRight size={16} aria-hidden="true" /></a></li>)}<li><a href="/legal"><strong>All policies</strong><span>The complete policy directory</span><ArrowRight size={16} aria-hidden="true" /></a></li></ul>
    </PageSection>
    {blocks.contact()}
  </main>;
}

// ---------- 01D Leadership & Governance ----------
export function GovernancePage() {
  return <main id="main" className="site-page">
    <PageHero eyebrow="Leadership & Governance" title="One school community, many hands in service.">
      <p>How Sekolah Rendah Sathya Sai is governed and led, and where to turn when you need the School to act.</p>
    </PageHero>
    <PageSection id="structure" eyebrow="Governance" title="Who is responsible for SRSS.">
      <div className="governance-grid">
        <article><h3>Sathya Sai International Organisation of Malaysia (SSIOM)</h3><p>The parent organisation of SRSS — a Malaysian non-profit organisation registered with the Registrar of Societies (PPM-001-14-10081983). SSIOM supports the School’s mission and owns the SRSS Digital Hub platform.</p></article>
        <article><h3>Sekolah Rendah Sathya Berhad</h3><p>The registered governing entity of the School (263453-U). Its Board of Governors oversees institutional administration, financial stewardship and governance.</p></article>
        <article><h3>Sekolah Rendah Sathya Sai</h3><p>A private primary school registered with the Ministry of Education Malaysia (SMIPS Code WDA0001), led day to day by the Principal and the school leadership team.</p></article>
      </div>
      <OrganisationChart />
    </PageSection>
    <PageSection id="accountability" eyebrow="Accountability" title="Policies and how to raise a concern." tone="ivory">
      <ul className="resource-list">
        <li><a href="/legal"><strong>School policies</strong><span>Privacy, safeguarding, terms and governance policies</span><ArrowRight size={16} aria-hidden="true" /></a></li>
        <li><a href="/legal/accessibility-complaints"><strong>Complaints and escalation</strong><span>How concerns are reviewed, and escalated where needed</span><ArrowRight size={16} aria-hidden="true" /></a></li>
        <li><a href="/legal/child-safeguarding#s-4"><strong>Safeguarding contacts</strong><span>{safeguardingLead.title}: {safeguardingLead.name}</span><ArrowRight size={16} aria-hidden="true" /></a></li>
      </ul>
      <p className="page-note">The Principal is the first point of contact through the school office on <a href={contact.phoneHref}>{contact.phone}</a>. Concerns about the Principal go to the Chair of the Board of Governors, Dr Maniam.</p>
    </PageSection>
    <Closing title="Meet the people who make SRSS.">
      <a className="primary-button" href="/about/our-people">Our People <ArrowRight size={18} /></a>
    </Closing>
  </main>;
}

export function NotFoundPage() {
  return <main id="main" className="site-page">
    <PageHero eyebrow="Page not found" title="We couldn’t find that page.">
      <p>It may have moved in our new website structure. Search for it, or start from one of the main sections.</p>
      <SiteSearch id="notfound-search" autoFocus />
    </PageHero>
    <nav className="page-directory page-inner" aria-label="Main sections">
      {[["About SRSS", "/about"], ["Learning", "/learning"], ["Student Life", "/student-life"], ["Join SRSS", "/join"], ["Resources", "/resources"]].map(([label, href]) => <a key={href} href={href}><strong>{label}</strong><ArrowRight size={16} aria-hidden="true" /></a>)}
    </nav>
  </main>;
}
