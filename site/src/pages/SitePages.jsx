// Landing pages for Website Architecture v2.0. They assemble existing, verified content in its new home:
// shared homepage blocks (passed in as `blocks`), FAQ records and the route map. Child URLs that are
// "sections" scroll to the matching anchor here until they earn standalone pages (see src/data/siteMap.js).
import { useMemo, useState } from "react";
import HeroVideo, { HERO_CLIPS } from '../components/HeroVideo.jsx';
import HeroPhoto, { HERO_PHOTOS } from '../components/HeroPhoto.jsx';
import { CaretDown } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CheckCircle } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { FaqList, FAQ_TOPICS } from "../components/Faq.jsx";
import { breadcrumbs, childrenOf, searchSite } from "../data/siteMap.js";
import { contact, safeguardingLead } from "../legal/registry.js";
import { submitPublicForm } from "../lib/publicContent.js";
import { STUDENT_LIFE_CATEGORIES } from "../data/stories.js";
import { srssVoices } from "../data/voices.js";

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

function PageHero({ eyebrow, title, children, actions, image, alt, video, photo }) {
  return (
    <section className={`landing-hero${image || video || photo ? "" : " landing-hero-plain"}`} id="top">
      <div className="page-inner landing-hero-grid">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <div className="landing-hero-copy">{children}</div>
          {actions && <div className="landing-hero-actions">{actions}</div>}
        </div>
        {photo ? <figure><HeroPhoto image={photo} priority /></figure> : video ? <figure><HeroVideo clip={video} priority /></figure> : image && <figure><img src={image} alt={alt} /></figure>}
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
    <PageHero eyebrow="Learning at SRSS" title="Every Child. Every Possibility." photo={HERO_PHOTOS.science}
      actions={<><a className="primary-button" href="/learning/curriculum">Explore the Curriculum</a><a className="text-button" href="/student-life">Discover Student Life</a></>}>
      <p>At SRSS, learning develops knowledge, curiosity, confidence, character and the ability to contribute meaningfully to the world.</p>
    </PageHero>
    <Directory path="/learning" title="Learning at SRSS" />
    <LearningApproach />
    <div id="curriculum" className="anchor-block">{blocks.learning()}</div>
    {blocks.activeBodies()}
    <PageSection id="curriculum-questions" eyebrow="Curriculum questions" title="Learning, explained.">
      <FaqList items={faqs} questions={FAQ_TOPICS.curriculum} idPrefix="curriculum" firstOpen />
    </PageSection>
    <PageSection id="learning-journey" eyebrow="The learning journey" title="Standard 1 to Standard 6." tone="ivory">
      <FaqList items={faqs} questions={FAQ_TOPICS.journey} idPrefix="journey" firstOpen />
    </PageSection>
    <div id="human-values" className="anchor-block">{blocks.values()}</div>
    <LearningSpaces id="learning-environment" eyebrow="Learning environment" />
    <Closing title="See learning come alive.">
      <a className="primary-button" href="/student-life">Discover Student Life</a>
      <a className="text-button" href="/about/sathya-sai-education">The philosophy behind it</a>
    </Closing>
  </main>;
}

// ---------- 03 Student Life ----------
// Category chips link to the Student Life pages, so every filter has its own address.
export function StoryFilters({ current }) {
  return <nav className="story-filters" aria-label="Story categories"><a href="/student-life/stories" aria-current={!current ? "page" : undefined}>All stories</a>{STUDENT_LIFE_CATEGORIES.map(([label, href]) => <a key={href} href={href} aria-current={current === label ? "page" : undefined}>{label}</a>)}</nav>;
}

export function StudentLifePage({ blocks, faqs, entry }) {
  return <main id="main" className="site-page">
    <PageHero eyebrow="Student Life" title="Growing Together. Learning for Life." video={HERO_CLIPS.malaysia}
      actions={<><a className="primary-button" href="/student-life/gallery">See school life</a><a className="text-button" href="/student-life/stories">Read our stories</a></>}>
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
    <div id="stories" className="anchor-block">{blocks.news({ category: entry?.category })}</div>
    <div id="events" className="anchor-block">{blocks.calendar()}</div>
    <Closing title="Come and see a school day for yourself.">
      <button type="button" className="primary-button" onClick={blocks.openVisit}>Arrange a visit</button>
      <a className="text-button" href="/join">Join SRSS</a>
    </Closing>
  </main>;
}

// ---------- 04 Join SRSS ----------
// Community sign-ups go to the hub’s website inbox (contactMessages) — one place for the office to reply.
// Extra answers are folded into the message so the inbox needs no new fields.
export function CommunityForm({ subject, intro, extra = [], messageLabel, submitLabel, note, done }) {
  const [state, setState] = useState({ busy: false, sent: false, error: "" });
  async function submit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const details = extra.map(([name, label]) => (data[name] ? `${label}: ${data[name]}` : "")).filter(Boolean).join("\n");
    setState({ busy: true, sent: false, error: "" });
    try {
      await submitPublicForm("contactMessages", { name: data.name, email: data.email, subject, message: [details, data.message].filter(Boolean).join("\n\n") });
      setState({ busy: false, sent: true, error: "" });
    } catch (reason) { setState({ busy: false, sent: false, error: reason.message }); }
  }
  if (state.sent) return <div className="form-success community-sent" role="status"><CheckCircle size={30} weight="duotone" /><p>{done}</p></div>;
  return (
    <form className="school-form community-form" onSubmit={submit}>
      {intro && <p className="wide-label community-form-intro">{intro}</p>}
      <label>Your name<input required name="name" autoComplete="name" maxLength={120} /></label>
      <label>Email address<input required type="email" name="email" autoComplete="email" maxLength={200} /></label>
      {extra.map(([name, label, placeholder]) => <label key={name}>{label}<input name={name} placeholder={placeholder} maxLength={120} /></label>)}
      <label className="wide-label">{messageLabel}<textarea required name="message" rows="4" maxLength={3500} /></label>
      <p className="form-privacy wide-label">{note} The School uses these details to reply to you, as described in our <a href="/legal/privacy">Privacy Policy</a>.</p>
      {state.error && <p className="form-error wide-label" role="alert">{state.error}</p>}
      <button className="primary-button" type="submit" disabled={state.busy}>{state.busy ? "Sending…" : submitLabel}</button>
    </form>
  );
}

const MEMORY_FORM = { subject: "SRSS25 memory", extra: [["years", "Years at SRSS", "For example 2002–2007"], ["role", "You were a…", "Pupil, parent, teacher, volunteer"]], messageLabel: "Your memory of SRSS", submitLabel: "Share my memory", note: "We will ask your permission before publishing anything you share.", done: "Thank you for sharing your memory. The SRSS25 team will be in touch before using it." };

const COMMUNITY = [
  { id: "alumni", title: "Alumni", copy: "Reconnect with the school that shaped you. Tell us where life has taken you, and stay in touch for SRSS25.", form: { subject: "Alumni", extra: [["years", "Years at SRSS", "For example 2002–2007"]], messageLabel: "Where life has taken you, and how you’d like to stay in touch", submitLabel: "Register as an alumnus", note: "", done: "Thank you — you’re on the SRSS alumni list. We’ll be in touch about SRSS25." }, links: [["Read alumni voices", "/about/our-people#alumni"], ["Share an SRSS memory", "/about/silver-jubilee#memories"]] },
  { id: "volunteer", title: "Volunteer", copy: "Offer your time, expertise or practical support to school activities.", form: { subject: "Volunteer", extra: [["availability", "When you’re available", "Weekdays, weekends, events"]], messageLabel: "How you’d like to help", submitLabel: "Offer to volunteer", note: "Volunteers who work with pupils follow the Child Protection & Safeguarding Policy, including suitability checks.", done: "Thank you for offering to help. The school office will contact you." }, links: [["Safeguarding policy", "/legal/child-safeguarding"]] },
  { id: "support-srss", title: "Support SRSS", copy: "Contribute to approved school initiatives, including SRSS25 anniversary projects.", form: { subject: "Support SRSS", extra: [], messageLabel: "How you’d like to support the school", submitLabel: "Ask how to help", note: "", done: "Thank you. The school office will reply with the current approved initiatives." }, links: [] },
  { id: "parents-community", title: "Parents & Community", copy: "Take part in school-community life alongside our teachers, including through the Teacher-Parent Association.", links: [["Contact the school office", "/resources/contact"], ["Current families: sign in", "/login"]] },
];

function CommunityCard({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <article id={item.id}>
      <h3>{item.title}</h3><p>{item.copy}</p>
      <div>
        {item.form && <button type="button" className="reveal-toggle community-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Close the form" : item.form.submitLabel} <CaretDown size={15} className={open ? "turned-up" : "turned-down"} /></button>}
        {item.links.map(([label, href]) => <a key={label} className="text-link" href={href}>{label} <ArrowRight size={15} /></a>)}
      </div>
      {open && <CommunityForm {...item.form} />}
    </article>
  );
}

export function JoinPage() {
  return <main id="main" className="site-page">
    <PageHero eyebrow="Join SRSS" title="Be Part of Something Meaningful." photo={HERO_PHOTOS.friends}>
      <p>Whether you are choosing a school for your child, reconnecting as an alumnus or contributing your time and talents, there is a place for you in the SRSS community.</p>
    </PageHero>
    <section className="page-pathways page-inner" aria-label="Two ways to join SRSS">
      <a href="/join/admissions" className="pathway-card"><p className="eyebrow">Pathway A</p><h2>Join Our School</h2><p>For prospective families: why SRSS, how to apply, fees and visits.</p><span>Admissions <ArrowRight size={17} /></span></a>
      <a href="/join/get-involved" className="pathway-card"><p className="eyebrow">Pathway B</p><h2>Join Our Community</h2><p>For alumni, volunteers, supporters and current families.</p><span>Get involved <ArrowRight size={17} /></span></a>
    </section>
    <PageSection id="community" eyebrow="Get involved" title="A School Built by a Community." intro="Teachers, parents, alumni and volunteers each bring something essential to a child’s education." tone="ivory">
      <div className="community-grid">{COMMUNITY.map((item) => <CommunityCard key={item.id} item={item} />)}</div>
    </PageSection>
  </main>;
}

export function AdmissionsPage({ blocks, faqs, pillars }) {
  return <main id="main" className="site-page">
    <PageHero eyebrow="Admissions" title="Begin the journey." photo={HERO_PHOTOS.friends}
      actions={<><a className="primary-button" href="#enquiry">Make an enquiry</a><button type="button" className="text-button" onClick={blocks.openVisit}>Book a visit</button></>}>
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
      <a className="primary-button" href="/about/our-people">Our People</a>
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

// ---------- 01C Sathya Sai Education ----------
// Body · Mind · Heart · Spirit around Human Excellence. Replaces the static equation (Architecture v2.0
// design correction); also used on the About page so the explanation has one source.
const DIMENSIONS = [
  ["Body", "Health, discipline and practical skill — caring for the body as the instrument for learning and service."],
  ["Mind", "Knowledge, concentration and clear thinking, developed through the national curriculum and inquiry."],
  ["Heart", "Compassion, empathy and love for others, nurtured through friendships, reflection and service."],
  ["Spirit", "Inner peace, conscience and a sense of unity with all life, cultivated through silent sitting and reflection."],
];
export function IntegralFramework({ tone = "dark" }) {
  const [active, setActive] = useState(0);
  return (
    <div className={`integral-framework integral-${tone}`}>
      <div className="integral-ring" role="tablist" aria-label="The four dimensions of integral education">
        {DIMENSIONS.map(([name], index) => <button key={name} type="button" role="tab" id={`dimension-${name}`} aria-selected={active === index} aria-controls="dimension-panel" className={`integral-node integral-node-${index + 1}`} onClick={() => setActive(index)} onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)}>{name}</button>)}
        <div className="integral-core"><span>Human</span><strong>Excellence</strong></div>
      </div>
      <div className="integral-panel" id="dimension-panel" role="tabpanel" aria-labelledby={`dimension-${DIMENSIONS[active][0]}`} aria-live="polite">
        <p className="eyebrow">Integral education</p>
        <h3>{DIMENSIONS[active][0]}</h3>
        <p>{DIMENSIONS[active][1]}</p>
        <p className="integral-hint">Choose a dimension to explore how it grows at SRSS.</p>
      </div>
    </div>
  );
}

// The five human values as cards in the SRSS25 petal colours; each reveals how children practise it.
export function ValueCards({ values }) {
  const [open, setOpen] = useState(null);
  return (
    <ul className="value-cards">{values.map((value, index) => (
      <li key={value.name} className={`value-card value-card-${index + 1}`}>
        <span className="value-card-petal" aria-hidden="true" />
        <h3>{value.name}</h3>
        <p>{value.description}</p>
        <button type="button" className="value-card-toggle" aria-expanded={open === index} onClick={() => setOpen(open === index ? null : index)}>{open === index ? "Hide" : "How children practise it"} <CaretDown size={14} className={open === index ? "turned-up" : "turned-down"} /></button>
        {open === index && <p className="value-card-practice">{value.practice}</p>}
      </li>
    ))}</ul>
  );
}

const SECTIONS_SSE = [["The inspiration", "inspiration"], ["Educare", "educare"], ["Five human values", "five-values"], ["Integral education", "integral-education"], ["Head, Heart, Hands", "three-hs"], ["Around the world", "around-the-world"], ["At SRSS", "educare-in-action"], ["Questions", "questions"]];

export function SathyaSaiEducationPage({ values, quote, faqs }) {
  return <main id="main" className="site-page">
    <PageHero eyebrow="Sathya Sai Education" title="Drawing Out What Is Already Within." photo={HERO_PHOTOS.founder}>
      <p>Discover the philosophy of Sathya Sai Educare and an approach to education that seeks to develop the whole person.</p>
    </PageHero>
    <nav className="page-subnav" aria-label="On this page"><div className="page-inner">{SECTIONS_SSE.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}</div></nav>
    <PageSection id="inspiration" eyebrow="01 · The inspiration" title="Education for life, not mere living.">
      <div className="page-split">
        <div className="page-prose"><p>SRSS is guided by the educational vision of Bhagawan Sri Sathya Sai Baba: to draw out the human values already present in every child and help them live with purpose.</p></div>
        <blockquote className="page-quote">“{quote}”<cite>Sathya Sai Baba · Maharani’s Women’s College, Mysore, September 1963</cite></blockquote>
      </div>
    </PageSection>
    <PageSection id="educare" eyebrow="02 · Education and Educare" title="Knowledge from outside. Values from within." tone="ivory">
      <div className="page-prose">
        <p>Education provides knowledge from the outside. <strong>Educare seeks to draw out the values and human potential already within the child.</strong></p>
        <p>Truth, Right Conduct, Peace, Love and Non-Violence are not separate subjects or decorative slogans. They are practised in lessons, relationships, reflection and service.</p>
      </div>
    </PageSection>
    <PageSection id="five-values" eyebrow="03 · The five human values" title="Truth, Right Conduct, Peace, Love and Non-Violence.">
      <ValueCards values={values} />
    </PageSection>
    <section className="page-section page-section-navy" id="integral-education" aria-labelledby="integral-education-title">
      <div className="page-inner">
        <header className="page-section-head"><p className="eyebrow">04 · Integral education</p><h2 id="integral-education-title">Body, mind, heart and spirit, growing together.</h2></header>
        <IntegralFramework />
      </div>
    </section>
    <PageSection id="three-hs" eyebrow="05 · Head, Heart and Hands" title="Understanding, compassion and action.">
      <ul className="page-pillars">{[["Head", "Strong learning and clear thinking."], ["Heart", "Steady character and compassion for others."], ["Hands", "Practical capability and compassionate service."]].map(([title, copy]) => <li key={title}><h3>{title}</h3><p>{copy}</p></li>)}</ul>
      <p className="page-note">Together they make up <a href="/learning">Human Excellence</a>: developing character alongside academic capability.</p>
    </PageSection>
    <PageSection id="around-the-world" eyebrow="06 · Around the world" title="A global educational movement." tone="ivory">
      <div className="page-prose"><p>Sathya Sai Schools are locally rooted, inclusive and non-denominational, sharing a commitment to academic excellence and universal human values.</p></div>
    </PageSection>
    <PageSection id="educare-in-action" eyebrow="07 · Educare in action at SRSS" title="How it shows up in a school day.">
      <ul className="resource-list">
        <li><a href="/resources/prayer-pledge-anthem#silent-sitting"><strong>Silent sitting</strong><span>Every morning begins with ten minutes of quiet reflection</span><ArrowRight size={16} aria-hidden="true" /></a></li>
        <li><a href="/learning/human-values"><strong>Values in every lesson</strong><span>How the five values are woven through learning</span><ArrowRight size={16} aria-hidden="true" /></a></li>
        <li><a href="/student-life/service"><strong>Service in action</strong><span>Stories of pupils serving their community</span><ArrowRight size={16} aria-hidden="true" /></a></li>
      </ul>
    </PageSection>
    <PageSection id="questions" eyebrow="08 · Questions" title="Questions about Sathya Sai Education." tone="ivory">
      <FaqList items={faqs} questions={FAQ_TOPICS.whySrss} idPrefix="sse" firstOpen />
    </PageSection>
    <Closing title="See how we integrate human values.">
      <a className="primary-button" href="/learning/human-values">Human Values in Learning</a>
      <a className="text-button" href="/about/our-people">Meet Our People</a>
    </Closing>
  </main>;
}

// ---------- 01H Silver Jubilee (SRSS25 mini-site) ----------
const JUBILEE_NAV = [["Our journey", "journey"], ["Voices", "voices"], ["Updates", "updates"], ["Events", "events"], ["Get involved", "get-involved"], ["Share a memory", "memories"]];

export function JubileePage({ blocks, motto }) {
  const alumni = srssVoices.find((voice) => voice.id === "alumni");
  return <main id="main" className="site-page jubilee-page">
    <section className="landing-hero jubilee-hero" id="top">
      <div className="page-inner jubilee-hero-grid">
        <div>
          <p className="eyebrow">SRSS25 · 2002–2027 · Silver Jubilee</p>
          <img className="jubilee-video-brand" src="/assets/brand/originals/srss-25-anniversary-mark.png" alt="SRSS 25th anniversary mark" />
          <h1>25 Years of Education for Life.</h1>
          <div className="landing-hero-copy"><p>A quarter-century of learning, growing and nurturing human values — and an invitation to everyone who has been part of the journey.</p></div>
          <div className="landing-hero-actions"><a className="primary-button" href="#memories">Share your SRSS memory</a><a className="text-button" href="#events">Anniversary events</a></div>
        </div>
        <figure className="jubilee-hero-video"><HeroVideo clip={HERO_CLIPS.school} priority /><figcaption className="jubilee-video-motto">{motto}</figcaption></figure>
      </div>
    </section>
    <nav className="page-subnav jubilee-subnav" aria-label="SRSS25"><div className="page-inner">{JUBILEE_NAV.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}</div></nav>
    <PageSection id="journey" eyebrow="Our 25-year journey" title="2002 — 2027.">
      <ul className="jubilee-themes">{["Our beginning", "Our journey", "Our people", "Our impact", "Our future"].map((theme) => <li key={theme}><span className="value-card-petal" aria-hidden="true" /><strong>{theme}</strong></li>)}</ul>
      <p className="page-note">Our Silver Jubilee will honour founders and pioneers, former teachers, alumni stories, anniversary projects and the next chapter of SRSS. The anniversary archive is being gathered now — <a href="#memories">share your memory</a> or photographs to help tell the story.</p>
    </PageSection>
    {alumni && <PageSection id="voices" eyebrow="Alumni memories" title="We were the beginning of something." tone="ivory">
      <article className="jubilee-voice">
        <img src={alumni.image} alt={alumni.alt} />
        <div><blockquote>“{alumni.excerpt}”</blockquote><p className="quote-source">{alumni.name} · {alumni.role}</p><a className="text-link" href="/about/our-people#alumni">Read the full message <ArrowRight size={16} /></a></div>
      </article>
    </PageSection>}
    <div id="updates" className="anchor-block">{blocks.news({ category: "SRSS25" })}</div>
    <div id="events" className="anchor-block">{blocks.calendar({ category: "SRSS25" })}</div>
    <PageSection id="get-involved" eyebrow="Get involved" title="Help write the next chapter.">
      <ul className="resource-list">
        <li><a href="/join/alumni"><strong>Alumni</strong><span>Register and stay in touch for SRSS25</span><ArrowRight size={16} aria-hidden="true" /></a></li>
        <li><a href="/join/volunteer"><strong>Volunteer</strong><span>Help with anniversary events and projects</span><ArrowRight size={16} aria-hidden="true" /></a></li>
        <li><a href="/join/support-srss"><strong>Support SRSS</strong><span>Contribute to approved anniversary projects</span><ArrowRight size={16} aria-hidden="true" /></a></li>
      </ul>
    </PageSection>
    <PageSection id="memories" eyebrow="Share your SRSS memory" title="25 stories for 25 years." intro="Pupils, parents, teachers and volunteers — tell us a moment from your time at SRSS." tone="ivory">
      <CommunityForm {...MEMORY_FORM} />
    </PageSection>
  </main>;
}

// ---------- Editable pages (written by the school in the hub) ----------
const paragraphs = (text) => String(text || "").split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);

// The written parts of a page: sections, timeline, people and documents, each shown only when filled in.
export function ContentBody({ content }) {
  return <>
    {content.sections.map((section, index) => (
      <section key={index} className={`page-section${index % 2 ? " page-section-ivory" : ""}`}>
        <div className={`page-inner${section.image ? " page-split" : ""}`}>
          <div>
            {section.heading && <h2 className="content-heading">{section.heading}</h2>}
            <div className="page-prose">{paragraphs(section.body).map((text) => <p key={text}>{text}</p>)}</div>
          </div>
          {section.image && <img className="content-image" src={section.image} alt={section.imageAlt || ""} loading="lazy" />}
        </div>
      </section>
    ))}
    {content.timeline.length > 0 && <section className="page-section page-section-ivory"><div className="page-inner">
      <h2 className="content-heading">Timeline</h2>
      <ol className="content-timeline">{content.timeline.map((item, index) => <li key={index}><span>{item.year}</span><div><strong>{item.title}</strong>{item.text && <p>{item.text}</p>}</div></li>)}</ol>
    </div></section>}
    {content.people.length > 0 && <section className="page-section"><div className="page-inner">
      <ul className="content-people">{content.people.map((person, index) => <li key={index}>{person.image ? <img src={person.image} alt={person.imageAlt || ""} loading="lazy" /> : <span className="content-people-initial" aria-hidden="true">{person.name.trim()[0]}</span>}<strong>{person.name}</strong>{person.role && <span>{person.role}</span>}</li>)}</ul>
    </div></section>}
    {content.documents.length > 0 && <section className="page-section page-section-ivory"><div className="page-inner">
      <h2 className="content-heading">Documents</h2>
      <ul className="resource-list">{content.documents.map((item, index) => <li key={index}><a href={item.link} target={/^https?:/.test(item.link) ? "_blank" : undefined} rel="noreferrer"><strong>{item.title}</strong>{item.description && <span>{item.description}</span>}<ArrowRight size={16} aria-hidden="true" /></a></li>)}</ul>
    </div></section>}
  </>;
}

// A full page for an editable address once the school has published its content.
export function ContentPage({ entry, content, parent }) {
  const siblings = childrenOf(entry.parent).filter((item) => item.path !== entry.path).slice(0, 6);
  return <main id="main" className="site-page">
    <PageHero eyebrow={parent?.label || "SRSS"} title={content.title?.trim() || entry.label} image={content.heroImage || undefined} alt={content.heroImageAlt || ""}>
      {paragraphs(content.intro).map((text) => <p key={text}>{text}</p>)}
    </PageHero>
    <ContentBody content={content} />
    {siblings.length > 0 && <section className="page-section"><div className="page-inner">
      <p className="eyebrow content-related-label">More in {parent?.label}</p>
      <nav className="page-directory content-related" aria-label={`More in ${parent?.label}`}>{siblings.map((item) => <a key={item.path} href={item.path}><strong>{item.label}</strong><span>{item.summary}</span><ArrowRight size={16} aria-hidden="true" /></a>)}</nav>
    </div></section>}
    <Closing title="Come and discover SRSS for yourself.">
      <a className="primary-button" href="/join/admissions">Admissions</a>
      {parent && <a className="text-button" href={parent.path}>Back to {parent.label}</a>}
    </Closing>
  </main>;
}
