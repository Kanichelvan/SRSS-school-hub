import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { BookOpen } from "@phosphor-icons/react/dist/csr/BookOpen";
import { CalendarBlank } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { CaretDown } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretLeft } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRight } from "@phosphor-icons/react/dist/csr/CaretRight";
import { CheckCircle } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ChalkboardTeacher } from "@phosphor-icons/react/dist/csr/ChalkboardTeacher";
import { Clock } from "@phosphor-icons/react/dist/csr/Clock";
import { Compass } from "@phosphor-icons/react/dist/csr/Compass";
import { CursorClick } from "@phosphor-icons/react/dist/csr/CursorClick";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/csr/EnvelopeSimple";
import { FacebookLogo } from "@phosphor-icons/react/dist/csr/FacebookLogo";
import { GlobeHemisphereEast } from "@phosphor-icons/react/dist/csr/GlobeHemisphereEast";
import { GraduationCap } from "@phosphor-icons/react/dist/csr/GraduationCap";
import { Heart } from "@phosphor-icons/react/dist/csr/Heart";
import { List } from "@phosphor-icons/react/dist/csr/List";
import { LockKey } from "@phosphor-icons/react/dist/csr/LockKey";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { MapPin } from "@phosphor-icons/react/dist/csr/MapPin";
import { Megaphone } from "@phosphor-icons/react/dist/csr/Megaphone";
import { Newspaper } from "@phosphor-icons/react/dist/csr/Newspaper";
import { Phone } from "@phosphor-icons/react/dist/csr/Phone";
import { Plus } from "@phosphor-icons/react/dist/csr/Plus";
import { TreeStructure } from "@phosphor-icons/react/dist/csr/TreeStructure";
import { UsersThree } from "@phosphor-icons/react/dist/csr/UsersThree";
import { X } from "@phosphor-icons/react/dist/csr/X";
import { ArrowUp } from "@phosphor-icons/react/dist/csr/ArrowUp";
import { Pause } from "@phosphor-icons/react/dist/csr/Pause";
import { Play } from "@phosphor-icons/react/dist/csr/Play";
import { SignIn } from "@phosphor-icons/react/dist/csr/SignIn";
import { loadPublicContent, submitPublicForm } from "./lib/publicContent.js";
import { PrayerPledgeAnthemPage } from "./PrayerPledgeAnthemPage.jsx";
import { defaultFaqs } from "./data/faqs.js";
import { srssVoices } from "./data/voices.js";
import { signInLink, siteNav } from "./data/navigation.js";
import { resolvePath } from "./data/siteMap.js";
import { storyCategory } from "./data/stories.js";
import { FaqAccordion, FaqList, FAQ_TOPICS } from "./components/Faq.jsx";
import { AdmissionsPage, Breadcrumbs, GovernancePage, IntegralFramework, JoinPage, JubileePage, LearningPage, LearningSpaces, NotFoundPage, ResourcesPage, SathyaSaiEducationPage, SiteSearch, StoryFilters, StudentLifePage } from "./pages/SitePages.jsx";
import { PreFooter, SiteFooter } from "./SiteFooter.jsx";

// Policy pages load on demand so their text never weighs on the homepage.
const LegalPage = lazy(() => import("./legal/LegalPage.jsx"));
// Current route from the address bar; old addresses are swapped for their canonical URL in place.
function currentRoute() {
  const { pathname, hash } = window.location;
  const resolved = resolvePath(pathname);
  if (resolved.redirect) {
    window.history.replaceState({}, "", `${resolved.redirect}${hash}`);
    return resolvePath(resolved.redirect).entry;
  }
  return resolved.entry;
}

const values = [
  {
    name: "Truth",
    petalLabel: ["Truth"],
    className: "truth",
    description: "Truth remains one across cultures and through past, present and future. Pupils encounter it through honest speech, careful inquiry, science, nature, art and the wisdom traditions of the world.",
    practice: "At SRSS: speak truthfully, test ideas carefully and honour evidence.",
  },
  {
    name: "Right Conduct",
    petalLabel: ["Right", "Conduct"],
    className: "conduct",
    description: "Right Conduct turns an inner sense of duty into responsible action. Pupils care for themselves, one another and nature, guided by the Golden Rule: treat others as you wish to be treated.",
    practice: "At SRSS: keep promises, care for shared spaces and help without being asked.",
  },
  {
    name: "Peace",
    petalLabel: ["Peace"],
    className: "peace",
    description: "Peace grows through inner attention. Quiet reflection, alert silence and thoughtful choices help pupils become steady within and respond to daily life with clarity.",
    practice: "At SRSS: pause, listen and choose calm words before responding.",
  },
  {
    name: "Love",
    petalLabel: ["Love"],
    className: "love",
    description: "Love gives life to the other values. Pupils practise kindness, compassion, empathy and selfless service, learning to give and forgive without expecting something in return.",
    practice: "At SRSS: include others, notice who needs help and serve with care.",
  },
  {
    name: "Nonviolence",
    petalLabel: ["Non", "Violence"],
    className: "nonviolence",
    description: "Nonviolence begins with recognising the unity within life’s diversity. Pupils learn to avoid harm and show respect for people, animals, nature and the shared laws that sustain our world.",
    practice: "At SRSS: resolve conflict gently and make choices that protect life.",
  },
];

const galleryItems = [
  ["/assets/photos/processed/science-lab-lesson-1600.jpg", "Curious minds", "A teacher demonstrating a science experiment to SRSS pupils in the laboratory."],
  ["/assets/photos/processed/classroom-assessment-1280.jpg", "Focused minds", "SRSS pupils working quietly at their desks during a classroom assessment."],
  ["/assets/photos/processed/values-signs-graduation-1600.jpg", "Values on display", "SRSS pupils holding Truth, Right Conduct, Love and Non-violence signs beside the school emblem."],
  ["/assets/photos/processed/chess-tournament-960.jpg", "Every move counts", "SRSS pupils competing at a chess tournament."],
  ["/assets/photos/processed/field-friends-1052.jpg", "Joy together", "Smiling SRSS pupils sitting together on the school field."],
  ["/assets/photos/processed/scouts-outing-544.jpg", "Ready to explore", "SRSS Scouts walking together during an outdoor activity."],
  ["/assets/photos/processed/science-microscope-1600.jpg", "Looking closer", "An SRSS pupil examining a specimen through a microscope during a science activity."],
  ["/assets/photos/processed/chess-competition-1280.jpg", "Minds at play", "SRSS pupils concentrating during a chess competition."],
  ["/assets/photos/processed/classroom-art-1280.jpg", "Making together", "SRSS pupils painting and creating together during a classroom art activity."],
  ["/assets/photos/processed/student-speaker-960.jpg", "Finding a voice", "An SRSS pupil in school uniform speaking into a microphone."],
  ["/assets/photos/processed/assembly-achievements-1280.jpg", "Growing together", "SRSS pupils sharing certificates during a school assembly."],
  ["/assets/photos/processed/sports-day-march-1600.jpg", "Moving as one", "SRSS pupils taking part in a Sports Day march on the school field."],
  ["/assets/photos/processed/sports-day-podium-1600.jpg", "Celebrating effort", "Pupils and staff celebrating Sports Day achievements at the awards podium."],
  ["/assets/photos/processed/facebook-jejak-juara-02.jpg", "Confident voices", "An SRSS pupil presenting classroom work beside a digital display."],
  ["/assets/photos/processed/facebook-jejak-juara-06.jpg", "Active bodies", "Two SRSS pupils with their coach on a badminton court."],
];

const roleRoutes = [
  ["Parent", "Notices, forms, dates and class updates.", "/hub/parent", UsersThree, "Go to the Parent Hub"],
  ["Student", "Learning links, reading and values challenges.", "/hub/student", GraduationCap, "Go to the Student Hub"],
  ["Teacher", "Timetables, resources and staff essentials.", "/hub/teacher", ChalkboardTeacher, "Go to the Teacher Hub"],
  ["Prospective family", "Visitors, guests and families exploring SRSS.", "/join/admissions", Compass, "Admissions"],
  ["Staff", "School operations, records and publishing.", "/hub/admin", LockKey, "Sign in to the Admin Hub"],
];

const whySrss = [
  [BookOpen, "Values-integrated curriculum", "Human values shape how pupils enquire, collaborate and apply Malaysia’s national curriculum each day."],
  [Heart, "Whole-child development", "Head, Heart, Hands and Health grow together through learning, reflection, movement and service."],
  [GlobeHemisphereEast, "Sai Educare Philosophy", "Sathya Sai Educare helps each child draw out the character, confidence and compassion already within."],
];

const defaultHomepageContent = {
  stats: { years: 25, students: "Year 1–6", values: 5, motto: "Human Excellence | Kecemerlangan Insan" },
  principal: { quote: "The real magic of SRSS lies in our teachers and staff, who teach by example every day.", message: "After twenty-five years, our vision is brighter than ever. We want to nurture young people who meet challenges with courage, embrace opportunities with wisdom, and become champions of peace, unity and care for our planet.", image: "/assets/photos/processed/principal-uma-devi-1086x1358.jpg", alt: "Portrait of Uma Devi Jenes Nayagam, Principal of Sekolah Rendah Sathya Sai" },
  anniversary: { title: "Celebrating 25 Years of SRSS.", description: "A quarter-century of learning, growing and nurturing human values." },
};

const inspirationQuote = "Education is not for mere living; it is for life, a fuller life, a more meaningful, and a more worthwhile life.";


// Pictures for events published without their own image.
const eventFallbackImages = ["/assets/photos/processed/sports-day-march-1600.jpg", "/assets/photos/processed/assembly-achievements-1280.jpg", "/assets/photos/processed/values-signs-graduation-1600.jpg", "/assets/photos/processed/field-friends-1052.jpg"];

// Photo for each learning theme; "Human Values" shows the interactive Values Garden instead.
const learningImages = {
  "Curious minds": ["/assets/photos/processed/science-microscope-1600.jpg", "An SRSS pupil examining a specimen through a microscope during a science activity."],
  "Active bodies": ["/assets/photos/processed/football-match-1600.jpg", "SRSS pupils competing in a football match."],
  "Loving learning environment": ["/assets/photos/processed/assembly-silent-sitting-1600.jpg", "SRSS pupils sitting together in quiet reflection at morning assembly."],
};

const learningTabs = [
  ["Curious minds", "Through Malaysia’s national curriculum, pupils investigate, question and connect ideas. Classrooms are structured for strong foundations while leaving space for wonder, dialogue and independent thought."],
  ["Active bodies", "Movement, games and co-curricular experiences develop coordination, resilience and teamwork. Pupils learn to participate wholeheartedly, strive fairly and care for one another."],
  ["Human Values", "Truth, Right Conduct, Peace, Love and Nonviolence are woven into lessons, reflection, relationships and service—not taught as slogans, but practised as ways of living."],
  ["Loving learning environment", "Teachers know each child as a whole person. Clear expectations, encouragement and mutual respect create a safe environment in which every learner can contribute and grow."],
];

const aboutMilestones = [["2001", "A shared vision", "A values-based primary school is envisioned for families in Kuala Lumpur."], ["2002", "SRSS begins", "The first cohort begins a learning journey rooted in human excellence."], ["2007", "Growing together", "The school community expands its learning spaces and co-curricular life."], ["2017", "Service in action", "Seva and community partnerships become an even more visible part of school life."], ["2026", "Looking forward", "SRSS celebrates a quarter-century of nurturing minds, hearts and character."]];

const humanValues = [["Sathya", "Truth", "Integrity in thought, word and action.", "Speaking honestly in a classroom discussion", "Owning a mistake and making it right", "Bringing sincere effort to each task"], ["Dharma", "Right Conduct", "Doing what is right with care and responsibility.", "Arriving prepared and on time", "Taking care of shared spaces", "Offering a helping hand without being asked"], ["Shanti", "Peace", "Finding steadiness within and respect around us.", "Beginning with a quiet moment", "Choosing calm words in a disagreement", "Reflecting before responding"], ["Prema", "Love", "Seeing and serving the good in every person.", "Including a classmate at play", "Encouraging a friend who is trying", "Showing gratitude to those who care for us"], ["Ahimsa", "Non-Violence", "Gentleness towards people, animals and the earth.", "Solving conflict without hurtful words", "Caring for the school garden", "Making choices that protect our shared world"]];

const defaultAboutContent = {
  heroEyebrow: "About SRSS · 25th year", heroTitle: "Our Story", heroBody: "At SRSS, education begins with a simple belief: every child carries within them the capacity for wisdom, kindness and purposeful action.", heroImage: "/assets/photos/processed/assembly-achievements-1280.jpg", heroAlt: "SRSS pupils gathered at a school assembly", foundingTitle: "A school built on what matters most.", foundingBody: "Sekolah Rendah Sathya Sai was established to offer an education in which strong learning and strong character belong together. Inspired by the education vision of Sathya Sai Baba, the school seeks to draw out the human values already present in every child.", foundingSupport: "SRSS is part of a worldwide family of Sathya Sai schools: locally rooted, globally connected, and united by a commitment to academic confidence, compassionate leadership and service to society.", milestones: aboutMilestones.map(([year, title, copy]) => ({ year, title, copy })), valueWeek: { title: "Love in action", prompt: "Notice one thoughtful way you can make someone’s day lighter.", route: "#students" }, principal: { heading: "Learning with love, leading with character.", quote: "The real magic of SRSS lies in our teachers and staff, who teach by example every day.", body: "After twenty-five years, our vision is brighter than ever: to nurture young people who meet challenges with courage, embrace opportunities with wisdom, and become champions of peace, unity and care for our planet.", image: "/assets/photos/processed/principal-uma-devi-1086x1358.jpg", alt: "Portrait of Uma Devi Jenes Nayagam, Principal of Sekolah Rendah Sathya Sai" }, updatedAt: null,
};

const missionPillars = [["Academic Excellence", "Developing knowledgeable, confident and capable lifelong learners."], ["Character Excellence", "Nurturing integrity, self-awareness, compassion, responsibility and strength of character."], ["Civic Stewardship", "Developing responsible Malaysians who respect their nation, its diversity and the wider human family."], ["Altruistic Responsibility", "Inspiring children to recognise their responsibility to serve society and care for the world around them."]];
const aboutLinks = [["Our Story", "/about/our-story"], ["Vision & Mission", "/about/vision-mission"], ["Sathya Sai Education", "/about/sathya-sai-education"], ["Leadership & Governance", "/about/leadership-governance"], ["Our People", "/about/our-people"], ["School Profile", "/about/school-profile"], ["Campus", "/about/campus"], ["Silver Jubilee", "/about/silver-jubilee"]];

function AboutPage({ onVisit, content, faqs }) {
  const about = { ...defaultAboutContent, ...content };
  return <main id="main" className="about-page about-refresh">
    <section className="about-hero" id="top"><div className="about-inner about-hero-grid"><div><p className="eyebrow">ABOUT SRSS · EDUCATION FOR LIFE</p><h1>Education for Life,<br/>Not Mere Living.</h1><p>Sekolah Rendah Sathya Sai is a Malaysian primary school dedicated to helping every child grow into the fullest and finest expression of who they can become.</p><a className="primary-button" href="/about/our-story">Discover Our Story <ArrowRight size={18}/></a></div><figure className="about-hero-photo"><img src={about.heroImage} alt={about.heroAlt}/></figure></div></section>
    <nav className="about-directory about-inner" aria-label="About SRSS sections">{aboutLinks.map(([label, href]) => <a key={label} href={href}>{label}<ArrowRight size={15}/></a>)}</nav>
    <section className="about-intro about-inner" id="who-we-are"><div><p className="eyebrow">Who we are</p><h2>A school for the mind, heart and character.</h2></div><div className="about-rich-copy"><p>At SRSS, education is more than the acquisition of knowledge or preparation for examinations. We believe a truly educated child develops an intelligent mind, a strong character, a compassionate heart, practical abilities and responsibility towards others.</p><p>Inspired by the educational philosophy of Sri Sathya Sai Baba, we combine the Malaysian National Curriculum with an integral approach that nurtures body, mind, heart and spirit.</p><a className="text-link" href="/about/our-story">Explore Our Story <ArrowRight size={17}/></a></div></section>
    <section className="about-profile about-inner" id="school-profile"><div><p className="eyebrow">School profile</p><h2>SRSS at a glance.</h2><p>Key facts about the school. Families can find more in the <a className="text-link" href="/resources/faq">FAQs</a>.</p></div><FaqList items={faqs} questions={FAQ_TOPICS.profile} idPrefix="profile" firstOpen /></section>
    <section className="purpose-refresh" id="vision-mission"><div className="about-inner"><div className="purpose-refresh-heading"><p className="eyebrow">Our purpose</p><h2>Human Excellence, lived with purpose.</h2><p><strong>Vision</strong> — to nurture young people of character, confidence and compassion who contribute to a more peaceful world.</p><p><strong>Mission</strong> — to integrate Malaysia’s national curriculum with an education that develops intellect, integrity, wellbeing and service.</p></div><div className="mission-pillars">{missionPillars.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div><a className="text-link" href="/about/vision-mission">Discover Our Vision &amp; Mission <ArrowRight size={17}/></a></div></section>
    <section className="educare-refresh" id="educare"><div className="about-inner educare-grid"><div><p className="eyebrow">Sathya Sai Education &amp; Educare</p><h2>Drawing out what is already within.</h2><p>Education provides knowledge from the outside. <strong>Educare seeks to draw out the values and human potential already within the child.</strong></p><p>Truth, Right Conduct, Peace, Love and Non-Violence are not separate subjects or decorative slogans. They are practised in lessons, relationships, reflection and service.</p></div><IntegralFramework /></div><div className="about-inner global-line"><p><strong>A global educational movement.</strong> Sathya Sai Schools are locally rooted, inclusive and non-denominational, sharing a commitment to academic excellence and universal human values.</p><a className="text-link" href="/about/sathya-sai-education">Discover Sathya Sai Education <ArrowRight size={17}/></a></div></section>
    <section className="community-refresh" id="our-people"><div className="about-inner"><p className="eyebrow">It takes a community to educate a child</p><h2>Every day is an opportunity to grow.</h2><div className="partnership"><strong>CHILD</strong><span>TEACHERS</span><span>PARENTS</span><span>VOLUNTEERS</span></div><p>Teachers, parents and volunteers each bring something essential to the child’s learning. Together, they create the conditions in which confidence, character and capability can flourish.</p><a className="text-link" href="/join/get-involved">Discover how you can be part of SRSS <ArrowRight size={17}/></a></div></section>
    <section className="people-refresh about-inner"><figure><img src={about.principal?.image || defaultAboutContent.principal.image} alt={about.principal?.alt || defaultAboutContent.principal.alt}/></figure><div><p className="eyebrow">Our people</p><h2>Leadership, teachers and family partnership.</h2><p>Our people include the Board of Directors, school leadership, teachers, administrators, support staff and Teacher-Parent Association — each contributing to a school community in which every child is known and encouraged.</p><a className="text-link" href="/about/our-people">Read the voices of SRSS <ArrowRight size={17}/></a></div></section>
    <LearningSpaces id="campus" eyebrow="Our campus" />
    <section className="anniversary-refresh" id="srss25"><div className="about-inner"><p className="eyebrow">SRSS25 · 25 years of educating the heart</p><h2>2002 <span>—</span> 2027</h2><div>{["Our beginning", "Our journey", "Our people", "Our impact", "Our future"].map((item) => <article key={item}><i>↓</i><strong>{item}</strong></article>)}</div><p>Our Silver Jubilee will honour founders and pioneers, former teachers, alumni stories, anniversary projects and the next chapter of SRSS.</p><a className="primary-button" href="/about/silver-jubilee">Celebrating 25 Years <ArrowRight size={18}/></a></div></section>
    <section className="about-closing" id="about-closing"><div className="about-inner"><TreeStructure size={32}/><p className="eyebrow">About SRSS</p><h2>Discover who we are and what shapes our approach to education.</h2><button className="primary-button" type="button" onClick={onVisit}>Arrange a visit <ArrowRight size={18}/></button></div></section>
  </main>;
}

function VoicesPage() {
  return <main id="main" className="voices-page">
    <section className="voices-hero" id="top" aria-labelledby="voices-title">
      <div className="voices-shell voices-hero-grid">
        <div>
          <p className="eyebrow">SRSS25 · In their own words</p>
          <h1 id="voices-title">Many voices.<br/><em>One enduring purpose.</em></h1>
        </div>
        <p>From school leaders, teachers and alumni, these reflections tell one connected story: education at SRSS is measured not only by what children know, but by who they become.</p>
      </div>
    </section>

    <nav className="voices-directory voices-shell" aria-label="Messages on this page">
      {srssVoices.map((voice) => <a key={voice.id} href={`#${voice.id}`}>
        <span>{voice.sequence}</span>
        <img src={voice.image} alt=""/>
        <strong>{voice.name}</strong>
        <small>{voice.role}</small>
        <ArrowRight size={17}/>
      </a>)}
    </nav>

    <section className="voices-introduction voices-shell" aria-labelledby="voices-intro-title">
      <p className="eyebrow">A living school story</p>
      <h2 id="voices-intro-title">From the people who lead it, shape it and carry it forward.</h2>
      <p>Read each message in full, from a principal’s welcome and an educator’s renewed purpose to the memories of a pupil from SRSS’s pioneer batch.</p>
    </section>

    <div className="voices-list">
      {srssVoices.map((voice, index) => <article className={`voice-story voice-story-${index + 1}`} id={voice.id} key={voice.id}>
        <div className="voices-shell voice-story-grid">
          <aside className="voice-profile">
            <div className="voice-sequence" aria-hidden="true"><span>{voice.sequence}</span><i/></div>
            <figure><img src={voice.image} alt={voice.alt}/></figure>
            <p className="voice-category">{voice.category}</p>
            <h2>{voice.name}</h2>
            <p className="voice-role">{voice.role}<br/><span>{voice.organisation}</span></p>
          </aside>
          <div className="voice-copy">
            <header>
              <p className="eyebrow">{voice.title}</p>
              <blockquote>“{voice.excerpt}”</blockquote>
            </header>
            <p className="voice-salutation">{voice.salutation}</p>
            {voice.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {voice.sections.map((section, sectionIndex) => <section key={`${voice.id}-${section.title || sectionIndex}`}>
              {section.title ? <h3>{section.title}</h3> : null}
              {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets ? <ul>{section.bullets.map(([lead, detail]) => <li key={lead}><strong>{lead}</strong> {detail}</li>)}</ul> : null}
            </section>)}
            <div className="voice-signature">
              <p>{voice.signoff}</p>
              <strong>{voice.name}</strong>
              <span>{voice.role}</span>
            </div>
            {voice.closingQuote ? <blockquote className="voice-closing-quote">“{voice.closingQuote}”</blockquote> : null}
          </div>
        </div>
      </article>)}
    </div>

    <section className="voices-closing">
      <div className="voices-shell"><p className="eyebrow">25 years of human excellence</p><h2>The story continues with every child.</h2><p>Discover the educational philosophy and community that connect these reflections.</p><a className="primary-button" href="/about">Explore About SRSS <ArrowRight size={18}/></a></div>
    </section>
  </main>;
}

const admissionSteps = [
  ["Enquiry", "Send the form or call the school office."],
  ["Visit", "See classrooms and meet the team."],
  ["Application", "Share your child’s details and records."],
  ["Readiness conversation", "A friendly meeting with your child."],
  ["Offer", "We confirm a place and the next steps."],
  ["Enrolment", "An onboarding checklist and a first-day welcome."],
];
const newsItems = [
  ["School News", "A new term of curious, caring learning", "20 Jul 2026", "/assets/photos/processed/science-microscope-1600.jpg"],
  ["Achievements", "Celebrating effort, teamwork and every growing voice", "14 Jul 2026", "/assets/photos/processed/sports-day-podium-1600.jpg"],
  ["Values in Action", "Pupils bring care and responsibility into daily life", "08 Jul 2026", "/assets/photos/processed/classroom-art-1280.jpg"],
];
const events = [
  ["25 JUL", "Open morning for prospective families", "Parent", "9.30–11.30 am"],
  ["31 JUL", "Community seva day", "Seva", "8.30–11.00 am"],
  ["08 AUG", "National Day cultural celebration", "Cultural", "8.00 am–12.00 pm"],
];

function FaqPage({ items }) {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(0);
  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => `${item.question} ${item.paragraphs?.join(" ") || ""} ${item.sections?.map((section) => `${section.heading} ${section.paragraphs?.join(" ") || ""}`).join(" ") || ""}`.toLowerCase().includes(normalized));
  }, [items, query]);
  return <main id="main" className="faq-page"><section className="faq-page-hero"><div><p className="eyebrow">SRSS information</p><h1>Frequently Asked <em>Questions.</em></h1><p>Clear answers about learning, admissions, school life and the values-led education offered at SRSS.</p></div><form role="search" onSubmit={(event) => event.preventDefault()}><MagnifyingGlass size={20} aria-hidden="true" /><label htmlFor="faq-search">Search questions</label><input id="faq-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setOpenIndex(null); }} placeholder="Try “curriculum”, “fees” or “transport”" /></form></section><section className="faq-page-content" aria-labelledby="all-faq-title"><aside><p className="eyebrow">Helpful answers</p><h2 id="all-faq-title">Everything families ask most often.</h2><p>{filteredItems.length} {filteredItems.length === 1 ? "answer" : "answers"}</p><a href="/join/admissions">Admissions &amp; visits <ArrowRight size={16} /></a></aside>{filteredItems.length ? <FaqAccordion items={filteredItems} openIndex={openIndex} onToggle={setOpenIndex} idPrefix="full-faq" /> : <div className="faq-empty"><h3>No matching question yet.</h3><p>Try a broader word or contact the school and we will help.</p><a href="/resources/contact">Contact SRSS <ArrowRight size={16} /></a></div>}</section></main>;
}

function SchoolCalendar({ items, onAdd }) {
  const firstDate = items[0]?.date ? new Date(`${items[0].date}T12:00:00`) : new Date(2026, 6, 1);
  const [visibleMonth, setVisibleMonth] = useState(new Date(firstDate.getFullYear(), firstDate.getMonth(), 1));
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = new Date(year, month, 1).getDay();
  const monthEvents = items.filter((item) => { const date = new Date(`${item.date}T12:00:00`); return date.getFullYear() === year && date.getMonth() === month; });
  const eventDates = new Set(monthEvents.map((item) => Number(item.date.slice(-2))));
  const cells = [...Array(leadingDays).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  while (cells.length % 7) cells.push(null);
  const moveMonth = (offset) => setVisibleMonth(new Date(year, month + offset, 1));
  const [showMonth, setShowMonth] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = items.filter((item) => item.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const listed = (upcoming.length ? upcoming : [...items].sort((a, b) => b.date.localeCompare(a.date))).slice(0, 5);
  const eventRow = (item) => <article key={item.id}><time dateTime={item.date}><strong>{new Date(`${item.date}T12:00:00`).toLocaleDateString("en-MY", { day: "2-digit" })}</strong><span>{new Date(`${item.date}T12:00:00`).toLocaleDateString("en-MY", { month: "short" }).toUpperCase()}</span></time><div><span>{item.category}</span><h3>{item.title}</h3>{item.time && <p><Clock size={14} /> {item.time}</p>}</div><button type="button" onClick={() => onAdd(item.title, item.date)} aria-label={`Add ${item.title} to calendar`}><CalendarBlank size={20} /></button></article>;
  if (!showMonth) return <section className="calendar-section" aria-labelledby="events-title"><div className="calendar-heading"><div><p className="eyebrow">Mark your calendar</p><h2 id="events-title">Upcoming <em>togetherness.</em></h2><p>Academic, cultural, seva and community dates at a glance.</p></div><button type="button" className="reveal-toggle" aria-expanded="false" onClick={() => setShowMonth(true)}>Show month calendar <CalendarBlank size={16} /></button></div><div className="event-side-list event-list-compact"><p className="event-list-label">{upcoming.length ? "Coming up" : "Recent dates"}</p>{listed.length ? listed.map(eventRow) : <p className="calendar-empty">No published events yet.</p>}</div></section>;
  return <section className="calendar-section" aria-labelledby="events-title"><div className="calendar-heading"><div><p className="eyebrow">Mark your calendar</p><h2 id="events-title">Upcoming <em>togetherness.</em></h2><p>Academic, cultural, seva and community dates at a glance.</p></div><div className="calendar-month-nav"><button type="button" className="reveal-toggle" aria-expanded="true" onClick={() => setShowMonth(false)}>Show list</button><button type="button" onClick={() => moveMonth(-1)} aria-label="Previous month"><CaretLeft size={20} /></button><strong>{visibleMonth.toLocaleDateString("en-MY", { month: "long", year: "numeric" })}</strong><button type="button" onClick={() => moveMonth(1)} aria-label="Next month"><CaretRight size={20} /></button></div></div><div className="calendar-layout"><div className="month-grid" aria-label={`${visibleMonth.toLocaleDateString("en-MY", { month: "long", year: "numeric" })} calendar`}>{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span className="weekday" key={day}>{day}</span>)}{cells.map((day, index) => <span className={`calendar-day ${day && eventDates.has(day) ? "has-event" : ""}`} key={`${day || "blank"}-${index}`}>{day ? <><time dateTime={`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`}>{day}</time>{eventDates.has(day) ? <i aria-label="School event" /> : null}</> : null}</span>)}</div><div className="event-side-list"><p className="event-list-label">Dates this month</p>{monthEvents.length ? monthEvents.map((item) => <article key={item.id}><time dateTime={item.date}><strong>{new Date(`${item.date}T12:00:00`).toLocaleDateString("en-MY", { day: "2-digit" })}</strong><span>{new Date(`${item.date}T12:00:00`).toLocaleDateString("en-MY", { month: "short" }).toUpperCase()}</span></time><div><span>{item.category}</span><h3>{item.title}</h3><p><Clock size={14} /> {item.time}</p></div><button type="button" onClick={() => onAdd(item.title, item.date)} aria-label={`Add ${item.title} to calendar`}><CalendarBlank size={20} /></button></article>) : <p className="calendar-empty">No published events for this month.</p>}</div></div></section>;
}

export function App() {
  const [route, setRoute] = useState(currentRoute);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(null);
  const [mobileSection, setMobileSection] = useState(null);
  const [visitOpen, setVisitOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeValue, setActiveValue] = useState(null);
  const [gallery, setGallery] = useState({ index: 0, prev: null, dir: "next" });
  const galleryIndex = gallery.index;
  const [galleryPaused, setGalleryPaused] = useState(false);
  const [galleryStopped, setGalleryStopped] = useState(false);
  const [storiesExpanded, setStoriesExpanded] = useState(false);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [statCounts, setStatCounts] = useState({ years: 0, values: 0 });
  const glanceRef = useRef(null);
  const [activeLearning, setActiveLearning] = useState(() => (window.location.hash === "#values" ? learningTabs.findIndex(([label]) => label === "Human Values") : 0));
  const [activeNews, setActiveNews] = useState("All");
  const [openFaq, setOpenFaq] = useState(null);
  const [enquirySent, setEnquirySent] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [formMode, setFormMode] = useState(null);
  const [formError, setFormError] = useState("");
  const [managedContent, setManagedContent] = useState({
    news: newsItems.map(([category, title, date, image], index) => ({ id: `fallback-news-${index}`, category, title, date: `2026-${date.slice(3, 6) === "Jul" ? "07" : "07"}-${date.slice(0, 2)}`, image })),
    events: events.map(([date, title, category, time], index) => ({ id: `fallback-event-${index}`, date: `2026-${date.endsWith("JUL") ? "07" : "08"}-${date.slice(0, 2)}`, title, category, time })),
    about: defaultAboutContent,
    homepage: defaultHomepageContent,
    faqs: defaultFaqs,
  });

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
        setVisitOpen(false);
        setFabOpen(false);
        setNavOpen(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // One route map (src/data/siteMap.js): old addresses are replaced with their canonical URL, "section"
  // URLs scroll to their anchor on the parent page, and Book a Visit opens the visit form.
  useEffect(() => {
    const handleRouteChange = () => {
      const next = currentRoute();
      setRoute(next);
      if (next.page !== "legal") document.title = next.path === "/" ? "Sekolah Rendah Sathya Sai | Human Excellence" : `${next.label} | Sekolah Rendah Sathya Sai`;
      if (next.openVisit) { setSent(false); setVisitOpen(true); }
    };
    handleRouteChange();
    window.addEventListener("hashchange", handleRouteChange); window.addEventListener("popstate", handleRouteChange);
    return () => { window.removeEventListener("hashchange", handleRouteChange); window.removeEventListener("popstate", handleRouteChange); };
  }, []);

  useEffect(() => { loadPublicContent().then((data) => setManagedContent((current) => ({ ...current, ...data, homepage: { ...current.homepage, ...(data.homepage || {}) } }))).catch(() => {}); }, []);

  useEffect(() => {
    const target = window.location.hash.slice(1) || route.anchor;
    if (target) window.setTimeout(() => document.getElementById(target)?.scrollIntoView(), 0);
    else window.scrollTo(0, 0);
  }, [route]);

  useEffect(() => {
    const node = glanceRef.current;
    if (!node || statsVisible) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStatsVisible(true); observer.disconnect(); }
    }, { threshold: 0.3 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [statsVisible]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 900);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("nav-locked", menuOpen);
    return () => document.documentElement.classList.remove("nav-locked");
  }, [menuOpen]);

  // Scroll reveal: sections fade up once as they enter the viewport. Content stays visible when motion
  // is reduced or IntersectionObserver is unavailable, because `reveal-ready` is never added then.
  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    document.documentElement.classList.add("reveal-ready");
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add("is-revealed"); observer.unobserve(entry.target); }
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
    document.querySelectorAll("[data-reveal]:not(.is-revealed), [data-reveal-stagger]:not(.is-revealed)").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [route]);

  useEffect(() => {
    if (!statsVisible) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setStatCounts({ years: 25, values: 5 }); return undefined; }
    const start = performance.now(); let frame;
    const tick = (now) => { const progress = Math.min((now - start) / 900, 1); const eased = 1 - Math.pow(1 - progress, 3); setStatCounts({ years: Math.round(25 * eased), values: Math.round(5 * eased) }); if (progress < 1) frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [statsVisible]);

  // Photo carousel: one slide at a time; the outgoing slide slides left and fades (right when going back).
  // The homepage shows six chosen photos; the full collection lives in Student Life › Gallery.
  const showFullGallery = route.page === "studentLife";
  const galleryList = showFullGallery ? galleryItems : galleryItems.slice(0, 6);
  useEffect(() => { setGallery({ index: 0, prev: null, dir: "next" }); }, [showFullGallery]);
  const goToSlide = (target, dir = "next") => setGallery((current) => ({ index: (target + galleryList.length) % galleryList.length, prev: current.index, dir }));
  useEffect(() => {
    if (galleryPaused || galleryStopped || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setInterval(() => setGallery((current) => ({ index: (current.index + 1) % galleryList.length, prev: current.index, dir: "next" })), 5600);
    return () => window.clearInterval(timer);
  }, [galleryPaused, galleryStopped, galleryList.length]);
  // Stories & Happenings gallery: published news and public events, newest first.
  const allStories = useMemo(() => [
    ...(managedContent.news || []).map((item) => ({ ...item, type: item.category || "School news", Icon: Newspaper })),
    ...(managedContent.events || []).map((item, index) => ({ ...item, type: "Event", image: item.image || eventFallbackImages[index % eventFallbackImages.length], Icon: CalendarBlank })),
  ].filter((item) => item.date).sort((a, b) => String(b.date).localeCompare(String(a.date))), [managedContent.news, managedContent.events]);
  const storyItems = useMemo(() => allStories.slice(0, 8), [allStories]);
  const tickerItems = useMemo(() => storyItems.slice(0, 6).map((item) => ({ id: `${item.type}-${item.id}`, date: item.date, title: item.title })), [storyItems]);

  // The homepage already ends with Contact & visit, so the pre-footer invitation shows on other public pages.
  const isHome = route.page === "home";
  const handleVisitSubmit = (event) => {
    event.preventDefault();
    setSent(true);
  };

  const addToCalendar = (title, date) => {
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART;VALUE=DATE:${date.replaceAll("-", "")}\nSUMMARY:${title}\nEND:VEVENT\nEND:VCALENDAR`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
    link.click();
    URL.revokeObjectURL(link.href);
  };


  // Homepage sections as reusable blocks: landing pages show the same content instead of copies.
  const blocks = {
    openVisit: () => { setSent(false); setVisitOpen(true); },
    hero: () => (
          <section className="hero" id="top" aria-labelledby="hero-title">
            <div className="hero-copy">
              <p className="eyebrow">Sekolah Rendah Sathya Sai&nbsp;&nbsp;·&nbsp;&nbsp;Since 2002</p>
              <h1 id="hero-title">The End of<br />Education is <span>Character</span></h1>
              <p className="hero-description">At <strong>Sekolah Rendah Sathya Sai</strong>, education is the journey of drawing out the best within every child. By harmonising the Head, Heart, and Hands, we cultivate learners who excel academically, live by universal human values, and become thoughtful leaders committed to making the world a better place.</p>
              <div className="hero-actions">
                <a className="primary-button" href="/about">Explore SRSS <ArrowRight size={18} weight="bold" /></a>
                <button className="text-button" type="button" onClick={() => { setSent(false); setVisitOpen(true); }}>Arrange a visit <ArrowRight size={18} /></button>
              </div>
            </div>
            <img className="hero-image" src="/assets/srss-hero-learning.png" alt="Teacher and pupils reading together in SRSS uniform" />
          </section>
    ),
    welcome: () => (
          <section className="home-welcome" id="purpose" aria-labelledby="welcome-title">
            <div className="home-welcome-intro">
              <div><h2 id="welcome-title">Welcome to Sekolah Rendah Sathya Sai</h2><p className="home-welcome-sub">Learning for Life. Growing in Human Excellence.</p></div>
              <p>Sekolah Rendah Sathya Sai by the Sathya Sai International Organisation of Malaysia is a human values-centered learning community where academic excellence meets character development. Rooted in Truth, Right Conduct, Peace, Love and Nonviolence, we help every child realise their potential and empower them to contribute positively to their communities, the nation and the wider world.</p>
            </div>
            <div className="home-promise" data-reveal>
              <div className="home-promise-head"><p className="eyebrow">Our Educational Promise</p><a className="text-link" href="/about/vision-mission">Discover Our Mission <ArrowRight size={16} /></a></div>
              <ul className="home-pillars" id="about-preview" data-reveal-stagger>{missionPillars.map(([title, copy]) => <li key={title}><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ul>
            </div>
          </section>
    ),
    router: () => (
          <section className="role-router" aria-labelledby="role-router-title">
            <div className="role-router-heading"><div><p className="eyebrow">Find your way</p><h2 id="role-router-title">I am a…</h2></div><p>Choose your role for school information and secure hub access.</p></div>
            <div className="role-router-grid">{roleRoutes.map(([label, copy, target, Icon]) => <a key={label} className="role-card" href={target}><Icon size={25} weight="duotone" /><span><strong>{label}</strong><small>{copy}</small>{target.startsWith("/hub") && <em className="role-signin"><LockKey size={12} aria-hidden="true" /> Sign in</em>}</span><ArrowRight size={17} /></a>)}</div>
          </section>
    ),
    jubilee: () => (
          <section className="home-jubilee" aria-labelledby="jubilee-title">
            <figure className="home-jubilee-mark" data-reveal><img src="/assets/brand/originals/srss-25-anniversary-mark.png" alt="SRSS 25th anniversary mark" /><figcaption>{managedContent.homepage?.stats?.motto || defaultHomepageContent.stats.motto}</figcaption></figure>
            <div data-reveal>
              <p className="eyebrow">2002–2027 · Silver Jubilee</p>
              <h2 id="jubilee-title">{managedContent.homepage?.anniversary?.title || defaultHomepageContent.anniversary.title}</h2>
              <p className="home-jubilee-lede">{managedContent.homepage?.anniversary?.description || defaultHomepageContent.anniversary.description}</p>
              <ul className="home-jubilee-facts" ref={glanceRef} data-reveal-stagger>
                <li><strong>Since 2002</strong><a href="/learning">Sai Educare in action <ArrowRight size={15} /></a></li>
                <li><strong>Year 1–6</strong><span>KSSR infused with 5 human values</span></li>
                <li><strong>{statCounts.years} years</strong><a href="/about/silver-jubilee">Explore SRSS25 <ArrowRight size={15} /></a></li>
              </ul>
            </div>
          </section>
    ),
    gallery: () => (
          <section className="life-section news-life-section" id="school-life" aria-labelledby="life-title" aria-roledescription="carousel" onMouseEnter={() => setGalleryPaused(true)} onMouseLeave={() => setGalleryPaused(false)} onFocusCapture={() => setGalleryPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setGalleryPaused(false); }} onKeyDown={(event) => { if (event.key === "ArrowRight") goToSlide(galleryIndex + 1); if (event.key === "ArrowLeft") goToSlide(galleryIndex - 1, "back"); }}>
            <div className="section-head-row" data-reveal>
              <div><p className="eyebrow">School life in motion</p><h2 id="life-title">Small moments. <em>Lasting roots.</em></h2></div>
              <div className="carousel-controls" aria-label="Gallery controls">
                <button type="button" onClick={() => goToSlide(galleryIndex - 1, "back")} aria-label="Previous photo"><CaretLeft size={21} /></button>
                <span aria-live="polite">{String(galleryIndex + 1).padStart(2, "0")} / {String(galleryList.length).padStart(2, "0")}</span>
                <button type="button" onClick={() => goToSlide(galleryIndex + 1)} aria-label="Next photo"><CaretRight size={21} /></button>
                <button type="button" className="carousel-play" onClick={() => setGalleryStopped(!galleryStopped)} aria-pressed={galleryStopped} aria-label={galleryStopped ? "Play slideshow" : "Pause slideshow"}>{galleryStopped ? <Play size={16} weight="fill" /> : <Pause size={16} weight="fill" />}</button>
              </div>
            </div>
            <div className={`photo-carousel is-${gallery.dir}`} data-reveal>
              {galleryList.map(([src, title, alt], index) => <figure key={src} className={`photo-slide${index === galleryIndex ? " is-active" : index === gallery.prev ? " is-leaving" : ""}`} aria-hidden={index !== galleryIndex} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${galleryList.length}: ${title}`} style={{ "--slide-bg": `url(${src})` }}>
                <img src={src} alt={alt} loading={index < 2 ? "eager" : "lazy"} />
                <figcaption><span>{title}</span><small>{alt}</small></figcaption>
              </figure>)}
            </div>
            <div className="photo-dots" role="group" aria-label="Choose a photo">{galleryList.map(([, title], index) => <button key={title} type="button" className={index === galleryIndex ? "is-active" : ""} aria-label={`Show photo ${index + 1}: ${title}`} aria-current={index === galleryIndex} onClick={() => goToSlide(index, index < galleryIndex ? "back" : "next")} />)}</div>
            {!showFullGallery && <a className="source-link" href="/student-life/gallery">Explore Student Life <ArrowRight size={17} /></a>}
            <a className="source-link" href="https://www.facebook.com/SSPSM/" target="_blank" rel="noreferrer">See more school moments on Facebook <ArrowRight size={17} /></a>
          </section>
    ),
    learning: () => (
          <section className={`learning-experience${learningTabs[activeLearning][0] === "Human Values" ? " is-values" : ""}`} id="learning" aria-labelledby="learning-title">
            <div className="learning-visual" data-reveal="image">
              {learningTabs[activeLearning][0] === "Human Values" ? <div className="learning-garden" id="values">
            <div className="values-flower" role="group" aria-label="The five human values" onMouseLeave={() => setActiveValue(null)}>
              <div className="values-art">
                <img src="/assets/values-flower-2026.svg" alt="" aria-hidden="true" />
                <img className="values-crest-watermark" src="/assets/srss-logo.png" alt="" aria-hidden="true" />
                {values.map((value, index) => (
                  <button
                    key={value.name}
                    type="button"
                    className={`value-petal petal-${index + 1} ${value.className} ${activeValue === index ? "active" : ""}`}
                    aria-label={`Explore ${value.name}`}
                    title={`Explore ${value.name}`}
                    aria-pressed={activeValue === index}
                    aria-controls="learning-panel"
                    onMouseEnter={() => setActiveValue(index)}
                    onFocus={() => setActiveValue(index)}
                    onClick={() => setActiveValue(index)}
                  >
                    <span className="petal-label">{value.petalLabel.map((line) => <span key={line}>{line}</span>)}</span>
                  </button>
                ))}
              </div>
            </div>
              </div> : <img key={activeLearning} src={learningImages[learningTabs[activeLearning][0]][0]} alt={learningImages[learningTabs[activeLearning][0]][1]} />}
            </div>
            <div className="learning-content" data-reveal>
              <p className="eyebrow">Learning experience</p>
              <h2 id="learning-title">Strong foundations. Open hearts.</h2>
              <p className="learning-summary">SRSS integrates Malaysia’s national curriculum with the philosophy of Sathya Sai Educare, so intellect and character grow together.</p>
              <div className="learning-tabs" role="tablist" aria-label="Learning experience themes">
                {learningTabs.map(([label], index) => (
                  <button key={label} type="button" role="tab" aria-selected={activeLearning === index} aria-controls="learning-panel" onClick={() => { setActiveLearning(index); setActiveValue(null); }}>{label}</button>
                ))}
              </div>
              <div className="learning-panel" id="learning-panel" role="tabpanel" aria-live="polite" key={`${activeLearning}-${activeValue}`}>
                {learningTabs[activeLearning][0] === "Human Values" && activeValue !== null ? <div className={`learning-value ${values[activeValue].className}`}>
                  <span>Human value</span><h3>{values[activeValue].name}</h3><p>{values[activeValue].description}</p><p className="value-practice">{values[activeValue].practice}</p>
                </div> : <>
                  <h3>{learningTabs[activeLearning][0]}</h3>
                  <p>{learningTabs[activeLearning][1]}</p>
                  {learningTabs[activeLearning][0] === "Human Values" && <p className="values-interaction-cue"><CursorClick size={17} weight="duotone" aria-hidden="true" /> Choose a petal in the Values Garden to explore each value</p>}
                </>}
              </div>
              {route.page === "home" && <a className="text-link learning-more" href="/learning">Explore Learning <ArrowRight size={16} /></a>}
            </div>
          </section>
    ),
    voices: () => (
          <section className="home-voices" aria-labelledby="voices-title">
            <div className="home-section-head" data-reveal><p className="eyebrow">Voices that guide us</p><h2 id="voices-title">Led by example, inspired by service.</h2></div>
            <div className="home-voices-grid" data-reveal-stagger>
              <article className="voice-principal">
                <figure><img src={managedContent.homepage?.principal?.image || defaultHomepageContent.principal.image} alt={managedContent.homepage?.principal?.alt || defaultHomepageContent.principal.alt} /></figure>
                <div><p className="eyebrow">A welcome from our Principal</p><blockquote>“{managedContent.homepage?.principal?.quote || defaultHomepageContent.principal.quote}”</blockquote><p>{managedContent.homepage?.principal?.message || defaultHomepageContent.principal.message}</p><p className="quote-source">Uma Devi Jenes Nayagam · Principal</p><a className="text-link" href="/about/our-people#principal">Meet Our People <ArrowRight size={16} /></a></div>
              </article>
              <article className="voice-inspiration" aria-labelledby="inspiration-feature-title">
                <figure><img src="/assets/sathya-sai-baba-portrait.jpg" alt="Illustrated portrait of Bhagawan Sri Sathya Sai Baba in an orange robe" /></figure>
                <p className="eyebrow">Our inspiration</p>
                <h3 id="inspiration-feature-title">Education for life, not mere living.</h3>
                <blockquote>“{inspirationQuote}”</blockquote>
                <p className="quote-source">Sathya Sai Baba · September 1963</p>
                <a className="text-link" href="/about/sathya-sai-education">Our founder &amp; school community <ArrowRight size={16} /></a>
              </article>
            </div>
          </section>
    ),
    faq: () => (
          <section className="faq-section home-faq-section" id="faq" aria-labelledby="faq-title"><div data-reveal><p className="eyebrow">Helpful answers</p><h2 id="faq-title">Questions, welcomed.</h2><p>Start with the questions families ask most often, or open the complete FAQ for detailed school information.</p><a className="text-link" href="/resources/faq">View all frequently asked questions <ArrowRight size={16} /></a></div><div><FaqAccordion items={(managedContent.faqs?.length ? managedContent.faqs : defaultFaqs).slice(0, 5)} openIndex={openFaq} onToggle={setOpenFaq} idPrefix="home-faq" /></div></section>
    ),
    // A category shows only that kind of story (Student Life pages, SRSS25 updates); otherwise the latest eight.
    news: ({ category } = {}) => {
      const list = category ? allStories.filter((item) => storyCategory(item) === category) : storyItems;
      return (
          <section className="news-section" id="news" aria-labelledby="news-title"><div className="news-head" data-reveal><div><p className="eyebrow">News &amp; events</p><h2 id="news-title">{category ? <>{category} <em>stories.</em></> : <>Stories &amp; <em>Happenings.</em></>}</h2></div>{route.page === "studentLife" && <StoryFilters current={category} />}<a href={route.page === "home" ? "/resources/news" : "#events-title"}>{route.page === "home" ? "View all news" : "See the calendar"} <ArrowRight size={16} /></a></div>
            {list.length ? <ul className={`story-gallery${storiesExpanded ? "" : " is-collapsed"}`} data-reveal-stagger>{list.map((item) => <li key={`${item.type}-${item.id}`}><img src={item.image || "/assets/photos/processed/classroom-art-1280.jpg"} alt="" loading="lazy" /><div><span><item.Icon size={14} aria-hidden="true" />{item.type}</span><time dateTime={item.date}>{new Date(`${item.date}T12:00:00`).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}</time><h3>{item.title}</h3>{item.excerpt && <p>{item.excerpt}</p>}</div></li>)}</ul> : <p className="calendar-empty">{category ? "No stories in this category have been published yet. They appear here as soon as the school publishes them." : "News and events will appear here once they are published."}</p>}
            {list.length > 4 && <button type="button" className="reveal-toggle" aria-expanded={storiesExpanded} onClick={() => setStoriesExpanded(!storiesExpanded)}>{storiesExpanded ? "Show fewer stories" : "Show more stories"} <CaretRight size={15} className={storiesExpanded ? "turned-up" : "turned-down"} /></button>}
          </section>
    );
    },
    calendar: ({ category } = {}) => (
          <SchoolCalendar items={(managedContent.events || []).filter((item) => !category || item.category === category)} onAdd={addToCalendar} />
    ),
    admissions: () => (
          <section className="home-join" id="admissions" aria-labelledby="admissions-title">
            <div className="home-join-intro" data-reveal>
              <p className="eyebrow">Admissions</p>
              <h2 id="admissions-title">Begin the <em>journey.</em></h2>
              <p>SRSS welcomes primary-age children, Year 1 to Year 6, from families of every background who share a values-based approach to education. Admission is a warm conversation about readiness, learning needs and the values that matter to your family.</p>
              <ol className="home-pathway" aria-label="Admissions pathway">{admissionSteps.map(([step, detail], index) => <li key={step}><span aria-hidden="true">{index + 1}</span><div><strong>{step}</strong><small>{detail}</small></div></li>)}</ol>
              <div className="home-links"><a className="text-link" href="mailto:saischoolpuchong@gmail.com?subject=Fee%20enquiry">Request fee information <ArrowRight size={16} /></a><a className="text-link" href="mailto:saischoolpuchong@gmail.com?subject=Prospectus%20request">Request the prospectus <ArrowRight size={16} /></a></div>
            </div>
            <div className="home-join-card" id="enquiry" data-reveal>
              {!formMode ? <div className="home-form-choice">
                <p className="eyebrow">How can we help?</p>
                <button type="button" onClick={() => { setFormMode("enquiry"); setFormError(""); }}><GraduationCap size={26} weight="duotone" aria-hidden="true" /><span><strong>Make an admissions enquiry</strong><small>Tell us about your child and we will plan a next step with you.</small></span><ArrowRight size={18} /></button>
                <button type="button" onClick={() => { setFormMode("question"); setFormError(""); }}><EnvelopeSimple size={26} weight="duotone" aria-hidden="true" /><span><strong>Ask a general question</strong><small>Reach the school office about anything else.</small></span><ArrowRight size={18} /></button>
              </div> : <div className="home-form-switch" role="tablist" aria-label="What would you like to send?">
                <button type="button" role="tab" aria-selected={formMode === "enquiry"} onClick={() => { setFormMode("enquiry"); setFormError(""); }}>Admissions enquiry</button>
                <button type="button" role="tab" aria-selected={formMode === "question"} onClick={() => { setFormMode("question"); setFormError(""); }}>General question</button>
              </div>}
              {!formMode ? null : formMode === "enquiry" ? (enquirySent ? <div className="form-success" role="status"><CheckCircle size={34} weight="duotone" /><h3>Your enquiry is on its way.</h3><p>The admissions team will contact you with a next step, usually within two school days.</p></div> : <form className="school-form" onSubmit={async (event) => { event.preventDefault(); setFormError(""); const { questions, ...payload } = Object.fromEntries(new FormData(event.currentTarget)); try { await submitPublicForm("admissionEnquiries", { ...payload, message: questions, source: "website" }); setEnquirySent(true); } catch (reason) { setFormError(reason.message || "Your enquiry could not be sent. Please try again."); } }}>
                <label>Parent / guardian name<input required name="parentName" autoComplete="name" /></label><label>Email address<input required name="email" type="email" autoComplete="email" /></label>
                <label>Child’s name<input required name="childName" /></label><label>Child’s age<select required name="childAge" defaultValue=""><option value="" disabled>Select age</option>{[5,6,7,8,9,10,11,12].map(age => <option key={age}>{age}</option>)}</select></label>
                <label>Current school<input name="currentSchool" /></label><label>How did you hear about SRSS?<select name="referralSource" defaultValue=""><option value="" disabled>Select one</option><option>Family or friend</option><option>Social media</option><option>School event</option><option>Online search</option><option>Other</option></select></label>
                <label className="wide-label">Questions or anything you would like us to know<textarea name="questions" rows="3" /></label><p className="form-privacy wide-label">The School uses these details to reply to you, as described in our <a href="/legal/privacy">Privacy Policy</a>.</p>{formError && <p className="form-error wide-label" role="alert">{formError}</p>}<button className="primary-button" type="submit">Send enquiry <ArrowRight size={18} weight="bold" /></button>
              </form>) : (contactSent ? <div className="form-success" role="status"><CheckCircle size={34} weight="duotone" /><h3>Thank you for writing.</h3><p>We will pass your message to the right person at school.</p></div> : <form className="school-form contact-form" onSubmit={async (event) => { event.preventDefault(); setFormError(""); try { await submitPublicForm("contactMessages", Object.fromEntries(new FormData(event.currentTarget))); setContactSent(true); } catch (reason) { setFormError(reason.message || "Your message could not be sent. Please try again."); } }}><label>Name<input required name="name" autoComplete="name" /></label><label>Email<input required name="email" type="email" autoComplete="email" /></label><label className="wide-label">Subject<select required name="subject" defaultValue=""><option value="" disabled>Select a subject</option><option>General</option><option>Admissions</option><option>Feedback</option><option>Other</option></select></label><label className="wide-label">Message<textarea required name="message" rows="5" /></label><p className="form-privacy wide-label">The School uses these details to reply to you, as described in our <a href="/legal/privacy">Privacy Policy</a>.</p>{formError && <p className="form-error wide-label" role="alert">{formError}</p>}<button className="primary-button" type="submit">Send message <ArrowRight size={18} weight="bold" /></button></form>)}
            </div>
          </section>
    ),
    contact: () => (
          <section className="home-visit" id="contact" aria-labelledby="contact-title">
            <div className="home-visit-details" data-reveal>
              <p className="eyebrow">Contact &amp; visit</p>
              <h2 id="contact-title">Find your way here.</h2>
              <address><MapPin size={19} aria-hidden="true" /><span>6, Jalan Puchong, Taman Tan Yew Lai,<br />58200 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur</span></address>
              <dl className="home-contacts">
                <div><dt>School office</dt><dd><a href="tel:+60126001926"><Phone size={15} aria-hidden="true" /> +60 12-600 1926</a><a href="mailto:saischoolpuchong@gmail.com"><EnvelopeSimple size={15} aria-hidden="true" /> saischoolpuchong@gmail.com</a></dd></div>
                <div><dt>Office hours</dt><dd>Monday–Friday · 8.00 am–4.00 pm<br />School hours · 7.30 am–1.30 pm</dd></div>
              </dl>
              <p className="home-visit-note">Visitor parking is available by arrangement. Please contact the office before your visit.</p>
              <div className="home-links"><a className="text-link" href="https://maps.google.com/?q=6+Jalan+Puchong+Taman+Tan+Yew+Lai+58200+Kuala+Lumpur" target="_blank" rel="noreferrer">Get directions <ArrowRight size={16} /></a><a className="text-link" href="https://www.facebook.com/SSPSM/" target="_blank" rel="noreferrer"><FacebookLogo size={17} aria-hidden="true" /> School life on Facebook</a></div>
            </div>
            <div className="home-visit-map" data-reveal="image"><iframe title="Map showing Sekolah Rendah Sathya Sai" src="https://www.google.com/maps?q=6%20Jalan%20Puchong%20Taman%20Tan%20Yew%20Lai%2058200%20Kuala%20Lumpur&output=embed" loading="lazy" /></div>
          </section>
    ),
    admissionsCta: () => (
      <section className="home-admissions-cta" aria-labelledby="admissions-cta-title">
        <div className="home-admissions-inner" data-reveal>
          <div><p className="eyebrow">Admissions</p><h2 id="admissions-cta-title">Begin the <em>journey.</em></h2><p>SRSS welcomes primary-age children, Standard 1 to Standard 6, from families of every background who share a values-based approach to education.</p></div>
          <div className="landing-hero-actions"><a className="primary-button" href="/join/admissions#enquiry">Make an enquiry <ArrowRight size={18} /></a><button type="button" className="text-button" onClick={() => { setSent(false); setVisitOpen(true); }}>Book a visit <ArrowRight size={18} /></button></div>
        </div>
      </section>
    ),
  };
  const pageFaqs = managedContent.faqs?.length ? managedContent.faqs : defaultFaqs;
  const pages = {
    legal: () => <Suspense fallback={<main id="main" className="legal-page" />}><LegalPage slug={route.slug || ""} /></Suspense>,
    about: () => <AboutPage content={managedContent.about} faqs={pageFaqs} onVisit={blocks.openVisit} />,
    sathyaSai: () => <SathyaSaiEducationPage values={values} quote={inspirationQuote} faqs={pageFaqs} />,
    jubilee: () => <JubileePage blocks={blocks} motto={managedContent.homepage?.stats?.motto || defaultHomepageContent.stats.motto} />,
    governance: () => <GovernancePage />,
    ourPeople: () => <VoicesPage />,
    learning: () => <LearningPage blocks={blocks} faqs={pageFaqs} />,
    studentLife: () => <StudentLifePage blocks={blocks} faqs={pageFaqs} entry={route} />,
    join: () => <JoinPage />,
    admissions: () => <AdmissionsPage blocks={blocks} faqs={pageFaqs} pillars={whySrss} />,
    resources: () => <ResourcesPage blocks={blocks} />,
    faq: () => <FaqPage items={pageFaqs} />,
    prayer: () => <PrayerPledgeAnthemPage />,
    notFound: () => <NotFoundPage />,
    // Homepage order (Architecture v2.0): hero → welcome & promise → learning → find your way → life at SRSS
    // → our people → Silver Jubilee → news & events → FAQs → admissions → contact.
    home: () => <main id="main">
      {blocks.hero()}
      {blocks.welcome()}
      {blocks.learning()}
      {blocks.router()}
      {blocks.gallery()}
      {blocks.voices()}
      {blocks.jubilee()}
      {blocks.news()}
      {blocks.calendar()}
      {blocks.faq()}
      {blocks.admissionsCta()}
      {blocks.contact()}
    </main>,
  };

  const closeMenus = () => { setNavOpen(null); setMenuOpen(false); };
  const navLink = (label, href, className = "") => href === undefined
    ? <span className={className}>{label}</span>
    : href === "visit"
      ? <button type="button" className={className} onClick={() => { closeMenus(); setSent(false); setVisitOpen(true); }}>{label}</button>
      : <a className={className} href={href} onClick={closeMenus}>{label}</a>;
  const menuBody = (item) => <>
    {item.groups && <div className="mega-groups">{item.groups.map((group) => <div className="mega-group" key={group.title}>{navLink(group.title, group.href, "mega-group-title")}{group.note && <small>{group.note}</small>}{group.links && <ul>{group.links.map(([label, href]) => <li key={label}>{navLink(label, href)}</li>)}</ul>}</div>)}</div>}
    {item.links && <ul className="mega-links">{item.links.map(([label, href]) => <li key={label}>{navLink(label, href)}</li>)}</ul>}
  </>;
  const activeNav = siteNav.find((item) => item.label === navOpen);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>

      <header className="site-header" onMouseLeave={() => setNavOpen(null)}>
        <div className={`updates-bar${tickerPaused ? " is-paused" : ""}`} role="region" aria-label="Announcements">
          <div className="header-wrap updates-inner">
            <span className="updates-label">Updates</span>
            <button type="button" className="updates-toggle" onClick={() => setTickerPaused(!tickerPaused)} aria-pressed={tickerPaused} aria-label={tickerPaused ? "Play announcements" : "Pause announcements"}>{tickerPaused ? <Play size={13} weight="fill" /> : <Pause size={13} weight="fill" />}</button>
            <div className="updates-ticker"><div className="updates-track">{[0, 1].map((copy) => <ul key={copy} aria-hidden={copy === 1}>{(tickerItems.length ? tickerItems : [{ id: "welcome", title: "Discover school life, upcoming dates and the latest news from the SRSS community." }]).map((item) => <li key={`${copy}-${item.id}`}>{item.date && <time dateTime={item.date}>{new Date(`${item.date}T12:00:00`).toLocaleDateString("en-MY", { day: "numeric", month: "short" })}</time>}<span>{item.title}</span></li>)}</ul>)}</div></div>
            <a href="/resources/news">View all updates <ArrowRight size={15} weight="bold" /></a>
          </div>
        </div>

        <div className="main-nav">
          <div className="header-wrap nav-inner">
            <a className="brand" href="/" aria-label="SRSS home">
              <img src="/assets/srss-logo.png" alt="Sekolah Rendah Sathya Sai logo" />
              <span>
                <strong>Sekolah Rendah Sathya Sai</strong>
                <small>Kuala Lumpur, Malaysia</small>
                <em>Human Excellence&nbsp;&nbsp;·&nbsp;&nbsp;Kecemerlangan Insan</em>
              </span>
            </a>

            <nav className="desktop-nav" aria-label="Primary navigation">
              {siteNav.map((item) => {
                const current = route.path === item.href || route.path.startsWith(`${item.href}/`);
                return <div key={item.label} className={`nav-item${navOpen === item.label ? " is-open" : ""}${current ? " is-current" : ""}`} onMouseEnter={() => setNavOpen(item.label)}>
                  <a href={item.href} aria-current={current ? "page" : undefined} onClick={closeMenus}>{item.label}</a>
                  <button type="button" className="nav-chevron" aria-expanded={navOpen === item.label} aria-controls="site-mega-menu" aria-label={`Show the ${item.label} menu`} onClick={() => setNavOpen(navOpen === item.label ? null : item.label)}><CaretDown size={12} weight="bold" aria-hidden="true" /></button>
                </div>;
              })}
              <a className={`nav-signin${route.path === signInLink.href ? " is-current" : ""}`} href={signInLink.href}><SignIn size={15} weight="bold" aria-hidden="true" />{signInLink.label}</a>
            </nav>

            <div className="nav-actions">
              <button className="icon-action" type="button" onClick={() => setSearchOpen(true)} aria-label="Search SRSS"><MagnifyingGlass size={22} /></button>
              <a className="admissions-button" href="/join/admissions">Admissions &amp; Visits</a>
              <button className="mobile-menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation">{menuOpen ? <X size={25} /> : <List size={25} />}</button>
            </div>
          </div>

          {activeNav && <div className="mega-panel" id="site-mega-menu" role="region" aria-label={`${activeNav.label} menu`} key={activeNav.label}>
            <div className="header-wrap mega-inner">
              <div className="mega-intro"><p className="eyebrow">{activeNav.label}</p><p>{activeNav.intro}</p><a className="text-link" href={activeNav.href} onClick={closeMenus}>Explore {activeNav.label} <ArrowRight size={15} /></a></div>
              <div className="mega-content">{menuBody(activeNav)}</div>
            </div>
          </div>}

          {menuOpen && <button type="button" className="mobile-nav-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
          {menuOpen && (
            <nav className="nav-drawer" aria-label="Site menu">
              <div className="nav-drawer-head"><strong>Menu</strong><button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={22} /></button></div>
              <div className="nav-drawer-body">{siteNav.map((item) => <section key={item.label}>
                <button type="button" className="nav-acc" aria-expanded={mobileSection === item.label} onClick={() => setMobileSection(mobileSection === item.label ? null : item.label)}>{item.label}<CaretDown size={16} weight="bold" aria-hidden="true" /></button>
                {mobileSection === item.label && <div className="nav-acc-panel"><a className="nav-acc-overview" href={item.href} onClick={closeMenus}>Explore {item.label} <ArrowRight size={14} /></a>{menuBody(item)}</div>}
              </section>)}</div>
              <div className="nav-drawer-foot"><button type="button" className="primary-button" onClick={() => { closeMenus(); setSent(false); setVisitOpen(true); }}>Arrange a visit <ArrowRight size={17} /></button><a href="/join/admissions#enquiry" onClick={closeMenus}>Make an enquiry</a><a className="nav-drawer-signin" href={signInLink.href} onClick={closeMenus}><SignIn size={16} aria-hidden="true" /> {signInLink.label}</a></div>
            </nav>
          )}
        </div>
      </header>

      {searchOpen && (
        <div className="search-layer" role="dialog" aria-modal="true" aria-label="Search SRSS">
          <div className="search-panel">
            <SiteSearch autoFocus id="site-search" />
            <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={24} /></button>
          </div>
        </div>
      )}

      {route.page !== "legal" && <Breadcrumbs entry={route} />}
      {(pages[route.page] || pages.notFound)()}


      {!isHome && <PreFooter onVisit={() => { setSent(false); setVisitOpen(true); }} />}
      <SiteFooter onVisit={() => { setSent(false); setVisitOpen(true); }} />

      <div className={`floating-actions${fabOpen ? " is-open" : ""}`}>
        <button type="button" className={`to-top${showTop ? " is-visible" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })} aria-label="Back to top" tabIndex={showTop ? 0 : -1} aria-hidden={!showTop}><ArrowUp size={20} weight="bold" /></button>
        {fabOpen && <div className="fab-menu" id="fab-menu" role="menu" aria-label="Quick actions">
          <button type="button" role="menuitem" onClick={() => { setFabOpen(false); setSent(false); setVisitOpen(true); }}><CalendarBlank size={19} aria-hidden="true" /> Arrange a visit</button>
          <a role="menuitem" href="/join/admissions#enquiry" onClick={() => { setFabOpen(false); setFormMode("enquiry"); }}><GraduationCap size={19} aria-hidden="true" /> Admissions enquiry</a>
          <a role="menuitem" href="/resources/contact" onClick={() => setFabOpen(false)}><Phone size={19} aria-hidden="true" /> Contact the school</a>
          <a role="menuitem" href="/login" onClick={() => setFabOpen(false)}><SignIn size={19} aria-hidden="true" /> Sign in to the hub</a>
        </div>}
        <button type="button" className="fab" onClick={() => setFabOpen(!fabOpen)} aria-expanded={fabOpen} aria-controls="fab-menu" aria-label={fabOpen ? "Close quick actions" : "Open quick actions"}><Plus size={24} weight="bold" /></button>
      </div>

      {visitOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setVisitOpen(false); }}>
          <section className="visit-modal" role="dialog" aria-modal="true" aria-labelledby="visit-title">
            <button className="modal-close" type="button" onClick={() => setVisitOpen(false)} aria-label="Close"><X size={23} /></button>
            {!sent ? (
              <>
                <p className="eyebrow">Admissions &amp; visits</p>
                <h2 id="visit-title">Come and experience SRSS.</h2>
                <p>Tell us a little about your family and our school team will help you plan the next step.</p>
                <form onSubmit={handleVisitSubmit}>
                  <label>Parent or guardian name<input required name="name" autoComplete="name" /></label>
                  <label>Email address<input required type="email" name="email" autoComplete="email" /></label>
                  <label>Child’s current year<select required defaultValue=""><option value="" disabled>Select a year</option><option>Preschool</option><option>Year 1</option><option>Year 2</option><option>Year 3</option><option>Year 4</option><option>Year 5</option><option>Year 6</option></select></label>
                  <p className="form-privacy">The School uses these details to arrange your visit, as described in our <a href="/legal/privacy">Privacy Policy</a>.</p><button className="primary-button" type="submit">Request a visit <ArrowRight size={18} weight="bold" /></button>
                </form>
              </>
            ) : (
              <div className="success-state">
                <p className="eyebrow">Request received</p>
                <h2 id="visit-title">Thank you for your interest in SRSS.</h2>
                <p>Our school team will contact you shortly to arrange a suitable visit.</p>
                <button className="primary-button" type="button" onClick={() => setVisitOpen(false)}>Return to the website</button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
