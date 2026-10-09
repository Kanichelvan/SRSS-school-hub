import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { BookOpen } from "@phosphor-icons/react/dist/csr/BookOpen";
import { CalendarBlank } from "@phosphor-icons/react/dist/csr/CalendarBlank";
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
import { loadPublicContent, submitPublicForm } from "./lib/publicContent.js";
import { PrayerPledgeAnthemPage } from "./PrayerPledgeAnthemPage.jsx";
import { defaultFaqs } from "./data/faqs.js";
import { srssVoices } from "./data/voices.js";

const navItems = [
  ["About Us", "/about#top"],
  ["Learning", "/#learning"],
  ["Prayer & Pledge", "/resources/prayer-pledge-anthem"],
  ["Admissions", "/#admissions"],
  ["News & Events", "/#news"],
  ["Contact", "/#contact"],
];

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
  ["Parent", "Notices, forms, dates and class updates.", "/hub/parent", UsersThree],
  ["Student", "Learning links, reading and values challenges.", "/hub/student", GraduationCap],
  ["Teacher", "Timetables, resources and staff essentials.", "/hub/teacher", ChalkboardTeacher],
  ["Exploring the school", "Visitors, guests and prospective families.", "/about#top", Compass],
  ["Admin", "School operations, records and publishing.", "/hub/admin", LockKey],
];

const whySrss = [
  [BookOpen, "Values-integrated curriculum", "Human values shape how pupils enquire, collaborate and apply Malaysia’s national curriculum each day."],
  [Heart, "Whole-child development", "Head, Heart, Hands and Health grow together through learning, reflection, movement and service."],
  [GlobeHemisphereEast, "Sai Educare Philosophy", "Sathya Sai Educare helps each child draw out the character, confidence and compassion already within."],
];

const defaultHomepageContent = {
  stats: { years: 25, students: "Year 1–6", values: 5, motto: "Human Excellence | Kecemerlangan Insan" },
  principal: { quote: "The real magic of SRSS lies in our teachers and staff, who teach by example every day.", message: "After twenty-five years, our vision is brighter than ever. We want to nurture young people who meet challenges with courage, embrace opportunities with wisdom, and become champions of peace, unity and care for our planet.", image: "/assets/photos/processed/principal-uma-devi-1086x1358.jpg", alt: "Portrait of Uma Devi Jenes Nayagam, Principal of Sekolah Rendah Sathya Sai" },
  anniversary: { title: "Celebrating 25 Years.", description: "A quarter-century of learning, service and Human Excellence. Follow the milestones and voices that continue to shape SRSS." },
};

const inspirationQuote = "Education is not for mere living; it is for life, a fuller life, a more meaningful, and a more worthwhile life.";

function InspirationPage() {
  return <main id="main" className="inspiration-page">
    <section className="inspiration-hero"><div className="about-inner inspiration-hero-grid"><div><p className="eyebrow">Our inspiration · Founder</p><h1>Education for life,<br/><em>inspired by character.</em></h1><p>SRSS is guided by the educational vision of Bhagawan Sri Sathya Sai Baba: to draw out the human values already present in every child and help them live with purpose.</p><a className="primary-button" href="#organisation">Meet the SRSS community <ArrowRight size={18}/></a></div><figure><img src="/assets/sathya-sai-baba-portrait.jpg" alt="Illustrated portrait of Bhagawan Sri Sathya Sai Baba in an orange robe" /></figure></div></section>
    <section className="inspiration-quote about-inner"><p className="eyebrow">A life-giving education</p><blockquote>“{inspirationQuote}”</blockquote><p className="quote-source">— Sathya Sai Baba, Maharani’s Women’s College in Mysore, September 1963</p><p>At SRSS, this vision is lived through the Head, Heart and Hands: strong learning, steady character, practical capability and compassionate service.</p></section>
    <section className="organisation-section" id="organisation"><div className="about-inner"><p className="eyebrow">Leadership &amp; governance</p><h2>One school community,<br/><em>many hands in service.</em></h2><p className="organisation-intro">The school’s work is held by a connected community of governance, leadership, teachers, families and volunteers. This overview will grow with the full organisation chart and role details.</p><div className="organisation-chart" aria-label="SRSS organisation chart"><div className="org-node org-board"><span>01</span><strong>Board of Directors</strong><small>Stewardship &amp; governance</small></div><div className="org-line" aria-hidden="true"/><div className="org-row"><div className="org-node"><span>02</span><strong>School Leadership</strong><small>Principal &amp; administration</small></div><div className="org-node"><span>03</span><strong>Teaching Team</strong><small>Learning &amp; pupil wellbeing</small></div><div className="org-node"><span>04</span><strong>School Community</strong><small>Families, volunteers &amp; partners</small></div></div></div></div></section>
    <section className="inspiration-closing"><div className="about-inner"><p className="eyebrow">Rooted in Educare</p><h2>Human excellence is the<br/><em>journey we share.</em></h2><a className="text-link" href="/about#educare">Explore Sathya Sai Educare <ArrowRight size={17}/></a></div></section>
  </main>;
}

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
const aboutLinks = [["Our Story", "/about/our-story"], ["Vision & Mission", "/about/vision-mission"], ["Sathya Sai Education & Educare", "#educare"], ["Leadership & Governance", "/about/governance"], ["Voices of SRSS", "/about/voices"], ["School Profile", "#school-profile"], ["Campus & Contact", "#campus"], ["25 Years of SRSS", "#srss25"]];

function AboutPage({ onVisit, content }) {
  const about = { ...defaultAboutContent, ...content };
  return <main id="main" className="about-page about-refresh">
    <section className="about-hero" id="top"><div className="about-inner about-hero-grid"><div><p className="eyebrow">ABOUT SRSS · EDUCATION FOR LIFE</p><h1>Education for Life,<br/>Not Mere Living.</h1><p>Sekolah Rendah Sathya Sai is a Malaysian primary school dedicated to helping every child grow into the fullest and finest expression of who they can become.</p><a className="primary-button" href="#who-we-are">Discover who we are <ArrowRight size={18}/></a></div><figure className="about-hero-photo"><img src={about.heroImage} alt={about.heroAlt}/></figure></div></section>
    <nav className="about-directory about-inner" aria-label="About SRSS sections">{aboutLinks.map(([label, href]) => <a key={label} href={href}>{label}<ArrowRight size={15}/></a>)}</nav>
    <section className="about-intro about-inner" id="who-we-are"><div><p className="eyebrow">Who we are</p><h2>A school for the mind, heart and character.</h2></div><div className="about-rich-copy"><p>At SRSS, education is more than the acquisition of knowledge or preparation for examinations. We believe a truly educated child develops an intelligent mind, a strong character, a compassionate heart, practical abilities and responsibility towards others.</p><p>Inspired by the educational philosophy of Sri Sathya Sai Baba, we combine the Malaysian National Curriculum with an integral approach that nurtures body, mind, heart and spirit.</p><a className="text-link" href="/about/our-story">Explore Our Story <ArrowRight size={17}/></a></div></section>
    <section className="purpose-refresh" id="vision-mission"><div className="about-inner"><div className="purpose-refresh-heading"><p className="eyebrow">Our purpose</p><h2>Human Excellence, lived with purpose.</h2><p><strong>Vision</strong> — to nurture young people of character, confidence and compassion who contribute to a more peaceful world.</p><p><strong>Mission</strong> — to integrate Malaysia’s national curriculum with an education that develops intellect, integrity, wellbeing and service.</p></div><div className="mission-pillars">{missionPillars.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div><a className="text-link" href="/about/vision-mission">Discover Our Vision &amp; Mission <ArrowRight size={17}/></a></div></section>
    <section className="educare-refresh" id="educare"><div className="about-inner educare-grid"><div><p className="eyebrow">Sathya Sai Education &amp; Educare</p><h2>Drawing out what is already within.</h2><p>Education provides knowledge from the outside. <strong>Educare seeks to draw out the values and human potential already within the child.</strong></p><p>Truth, Right Conduct, Peace, Love and Non-Violence are not separate subjects or decorative slogans. They are practised in lessons, relationships, reflection and service.</p></div><div className="integral-model" role="img" aria-label="Body plus mind plus heart plus spirit leads to human excellence"><span>BODY</span><b>+</b><span>MIND</span><b>+</b><span>HEART</span><b>+</b><span>SPIRIT</span><i>↓</i><strong>HUMAN EXCELLENCE</strong></div></div><div className="about-inner global-line"><p><strong>A global educational movement.</strong> Sathya Sai Schools are locally rooted, inclusive and non-denominational, sharing a commitment to academic excellence and universal human values.</p></div></section>
    <section className="learning-refresh about-inner"><div><p className="eyebrow">Learning at SRSS</p><h2>More Than Schooling, <em>Educating the Whole Child.</em></h2><p>Children do not all learn in the same way, develop at the same pace or reveal their strengths through examinations alone. Our educational model creates space to know, become, think, live, do and serve.</p></div><div className="excellence-framework"><strong>HUMAN EXCELLENCE</strong><div><span><b>KNOWING</b>Academics</span><span><b>BECOMING</b>Character</span><span><b>THINKING</b>Critical thinking</span><span><b>LIVING</b>Human Values</span><span><b>DOING</b>Practical skills</span><span><b>SERVING</b>Social responsibility</span></div></div></section>
    <section className="spaces-refresh" id="school-profile"><div className="about-inner"><p className="eyebrow">Spaces designed for learning</p><h2>Opportunity to enquire, create and grow.</h2><div>{[["Science & Discovery", "Hands-on experimentation, scientific inquiry, observation and problem-solving.", "science-microscope-1600.jpg"], ["Digital Learning", "Digital literacy, research, creativity and responsible use of technology.", "classroom-art-1280.jpg"], ["Library & Reading", "Reading culture, literacy development and independent discovery.", "chess-competition-1280.jpg"], ["Learning Support", "Targeted intervention and personalised support for every learner.", "student-speaker-960.jpg"]].map(([title, copy, image]) => <article key={title}><img src={`/assets/photos/processed/${image}`} alt=""/><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>
    <section className="community-refresh" id="our-people"><div className="about-inner"><p className="eyebrow">It takes a community to educate a child</p><h2>Every day is an opportunity to grow.</h2><div className="partnership"><strong>CHILD</strong><span>TEACHERS</span><span>PARENTS</span><span>VOLUNTEERS</span></div><p>Teachers, parents and volunteers each bring something essential to the child’s learning. Together, they create the conditions in which confidence, character and capability can flourish.</p><a className="text-link" href="/#contact">Discover how you can be part of SRSS <ArrowRight size={17}/></a></div></section>
    <section className="people-refresh about-inner"><figure><img src={about.principal?.image || defaultAboutContent.principal.image} alt={about.principal?.alt || defaultAboutContent.principal.alt}/></figure><div><p className="eyebrow">Our people</p><h2>Leadership, teachers and family partnership.</h2><p>Our people include the Board of Directors, school leadership, teachers, administrators, support staff and Teacher-Parent Association — each contributing to a school community in which every child is known and encouraged.</p><a className="text-link" href="/about/voices">Read the voices of SRSS <ArrowRight size={17}/></a></div></section>
    <section className="anniversary-refresh" id="srss25"><div className="about-inner"><p className="eyebrow">SRSS25 · 25 years of educating the heart</p><h2>2002 <span>—</span> 2027</h2><div>{["Our beginning", "Our journey", "Our people", "Our impact", "Our future"].map((item) => <article key={item}><i>↓</i><strong>{item}</strong></article>)}</div><p>Our Silver Jubilee will honour founders and pioneers, former teachers, alumni stories, anniversary projects and the next chapter of SRSS.</p><a className="primary-button" href="/#contact">Join the SRSS Alumni Network <ArrowRight size={18}/></a></div></section>
    <section className="about-closing" id="campus"><div className="about-inner"><TreeStructure size={32}/><p className="eyebrow">About SRSS</p><h2>Discover who we are and what shapes our approach to education.</h2><button className="primary-button" type="button" onClick={onVisit}>Arrange a visit <ArrowRight size={18}/></button></div></section>
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
      <div className="voices-shell"><p className="eyebrow">25 years of human excellence</p><h2>The story continues with every child.</h2><p>Discover the educational philosophy and community that connect these reflections.</p><a className="primary-button" href="/about#top">Explore About SRSS <ArrowRight size={18}/></a></div>
    </section>
    <section className="organisation-section" id="organisation"><div className="about-inner"><p className="eyebrow">Leadership &amp; governance</p><h2>One school community,<br/><em>many hands in service.</em></h2><p className="organisation-intro">The school’s work is held by a connected community of governance, leadership, teachers, families and volunteers. This overview will grow with the full organisation chart and role details.</p><div className="organisation-chart" aria-label="SRSS organisation chart"><div className="org-node org-board"><span>01</span><strong>Board of Directors</strong><small>Stewardship &amp; governance</small></div><div className="org-line" aria-hidden="true"/><div className="org-row"><div className="org-node"><span>02</span><strong>School Leadership</strong><small>Principal &amp; administration</small></div><div className="org-node"><span>03</span><strong>Teaching Team</strong><small>Learning &amp; pupil wellbeing</small></div><div className="org-node"><span>04</span><strong>School Community</strong><small>Families, volunteers &amp; partners</small></div></div></div></div></section>
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

function FaqAnswer({ item }) {
  return <div className="faq-answer">
    {item.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    {item.bullets?.length ? <ul>{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
    {item.sections?.map((section) => <section key={section.heading}><h4>{section.heading}</h4>{section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets?.length ? <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}</section>)}
    {item.closing ? <p>{item.closing}</p> : null}
  </div>;
}

function FaqAccordion({ items, openIndex, onToggle, idPrefix }) {
  return <div className="faq-list">{items.map((item, index) => {
    const answerId = `${idPrefix}-answer-${index}`;
    const isOpen = openIndex === index;
    return <article key={item.question}><button type="button" onClick={() => onToggle(isOpen ? null : index)} aria-expanded={isOpen} aria-controls={answerId}>{item.question}<Plus size={19} className={isOpen ? "turned" : ""} /></button>{isOpen ? <div id={answerId}><FaqAnswer item={item} /></div> : null}</article>;
  })}</div>;
}

function FaqPage({ items }) {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(0);
  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => `${item.question} ${item.paragraphs?.join(" ") || ""} ${item.sections?.map((section) => `${section.heading} ${section.paragraphs?.join(" ") || ""}`).join(" ") || ""}`.toLowerCase().includes(normalized));
  }, [items, query]);
  return <main id="main" className="faq-page"><section className="faq-page-hero"><div><p className="eyebrow">SRSS information</p><h1>Frequently Asked <em>Questions.</em></h1><p>Clear answers about learning, admissions, school life and the values-led education offered at SRSS.</p></div><form role="search" onSubmit={(event) => event.preventDefault()}><MagnifyingGlass size={20} aria-hidden="true" /><label htmlFor="faq-search">Search questions</label><input id="faq-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setOpenIndex(null); }} placeholder="Try “curriculum”, “fees” or “transport”" /></form></section><section className="faq-page-content" aria-labelledby="all-faq-title"><aside><p className="eyebrow">Helpful answers</p><h2 id="all-faq-title">Everything families ask most often.</h2><p>{filteredItems.length} {filteredItems.length === 1 ? "answer" : "answers"}</p><a href="/#admissions">Admissions &amp; visits <ArrowRight size={16} /></a></aside>{filteredItems.length ? <FaqAccordion items={filteredItems} openIndex={openIndex} onToggle={setOpenIndex} idPrefix="full-faq" /> : <div className="faq-empty"><h3>No matching question yet.</h3><p>Try a broader word or contact the school and we will help.</p><a href="/#contact">Contact SRSS <ArrowRight size={16} /></a></div>}</section></main>;
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
  return <section className="calendar-section" aria-labelledby="events-title"><div className="calendar-heading"><div><p className="eyebrow">Mark your calendar</p><h2 id="events-title">Upcoming <em>togetherness.</em></h2><p>Academic, cultural, seva and community dates at a glance.</p></div><div className="calendar-month-nav"><button type="button" onClick={() => moveMonth(-1)} aria-label="Previous month"><CaretLeft size={20} /></button><strong>{visibleMonth.toLocaleDateString("en-MY", { month: "long", year: "numeric" })}</strong><button type="button" onClick={() => moveMonth(1)} aria-label="Next month"><CaretRight size={20} /></button></div></div><div className="calendar-layout"><div className="month-grid" aria-label={`${visibleMonth.toLocaleDateString("en-MY", { month: "long", year: "numeric" })} calendar`}>{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span className="weekday" key={day}>{day}</span>)}{cells.map((day, index) => <span className={`calendar-day ${day && eventDates.has(day) ? "has-event" : ""}`} key={`${day || "blank"}-${index}`}>{day ? <><time dateTime={`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`}>{day}</time>{eventDates.has(day) ? <i aria-label="School event" /> : null}</> : null}</span>)}</div><div className="event-side-list"><p className="event-list-label">Dates this month</p>{monthEvents.length ? monthEvents.map((item) => <article key={item.id}><time dateTime={item.date}><strong>{new Date(`${item.date}T12:00:00`).toLocaleDateString("en-MY", { day: "2-digit" })}</strong><span>{new Date(`${item.date}T12:00:00`).toLocaleDateString("en-MY", { month: "short" }).toUpperCase()}</span></time><div><span>{item.category}</span><h3>{item.title}</h3><p><Clock size={14} /> {item.time}</p></div><button type="button" onClick={() => onAdd(item.title, item.date)} aria-label={`Add ${item.title} to calendar`}><CalendarBlank size={20} /></button></article>) : <p className="calendar-empty">No published events for this month.</p>}</div></div></section>;
}

export function App() {
  const [isAbout, setIsAbout] = useState(() => window.location.pathname.startsWith("/about"));
  const [isVoices, setIsVoices] = useState(() => window.location.pathname === "/about/voices");
  const [isInspiration, setIsInspiration] = useState(() => window.location.pathname === "/about/inspiration");
  const [isFaq, setIsFaq] = useState(() => window.location.pathname === "/faq");
  const [isPrayerPage, setIsPrayerPage] = useState(() => window.location.pathname === "/resources/prayer-pledge-anthem");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeValue, setActiveValue] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryPaused, setGalleryPaused] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [statCounts, setStatCounts] = useState({ years: 0, values: 0 });
  const glanceRef = useRef(null);
  const [activeLearning, setActiveLearning] = useState(0);
  const [activeNews, setActiveNews] = useState("All");
  const [openFaq, setOpenFaq] = useState(null);
  const [enquirySent, setEnquirySent] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [formMode, setFormMode] = useState("enquiry");
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
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const legacyHomepageSections = new Set(["/learning", "/admissions", "/news", "/contact"]);
    const handleRouteChange = () => {
      if (legacyHomepageSections.has(window.location.pathname)) {
        const fallbackSection = window.location.pathname.slice(1);
        const targetHash = window.location.hash || `#${fallbackSection}`;
        window.history.replaceState({}, "", `/${targetHash}`);
      }
      const aboutRoute = window.location.pathname.startsWith("/about");
      const voicesRoute = window.location.pathname === "/about/voices";
      const inspirationRoute = window.location.pathname === "/about/inspiration";
      const faqRoute = window.location.pathname === "/faq";
      const prayerPageRoute = window.location.pathname === "/resources/prayer-pledge-anthem";
      setIsAbout(aboutRoute);
      setIsVoices(voicesRoute);
      setIsInspiration(inspirationRoute);
      setIsFaq(faqRoute);
      setIsPrayerPage(prayerPageRoute);
      document.title = voicesRoute ? "Voices of SRSS | Sekolah Rendah Sathya Sai" : inspirationRoute ? "Our Inspiration | Sekolah Rendah Sathya Sai" : prayerPageRoute ? "Prayer, Pledge & Anthem | SRSS" : aboutRoute ? "About SRSS | Sekolah Rendah Sathya Sai" : faqRoute ? "Frequently Asked Questions | SRSS" : "Sekolah Rendah Sathya Sai | Human Excellence";
    };
    handleRouteChange();
    window.addEventListener("hashchange", handleRouteChange); window.addEventListener("popstate", handleRouteChange);
    return () => { window.removeEventListener("hashchange", handleRouteChange); window.removeEventListener("popstate", handleRouteChange); };
  }, []);

  useEffect(() => { loadPublicContent().then((data) => setManagedContent((current) => ({ ...current, ...data, homepage: { ...current.homepage, ...(data.homepage || {}) } }))).catch(() => {}); }, []);

  useEffect(() => { const target = window.location.hash.slice(1); if (target && target !== "about") window.setTimeout(() => document.getElementById(target)?.scrollIntoView(), 0); }, [isAbout, isVoices, isFaq, isPrayerPage]);

  useEffect(() => {
    const node = glanceRef.current;
    if (!node || statsVisible) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStatsVisible(true); observer.disconnect(); }
    }, { threshold: 0.3 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [statsVisible]);

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
  }, [isAbout, isVoices, isInspiration, isFaq, isPrayerPage]);

  useEffect(() => {
    if (!statsVisible) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setStatCounts({ years: 25, values: 5 }); return undefined; }
    const start = performance.now(); let frame;
    const tick = (now) => { const progress = Math.min((now - start) / 900, 1); const eased = 1 - Math.pow(1 - progress, 3); setStatCounts({ years: Math.round(25 * eased), values: Math.round(5 * eased) }); if (progress < 1) frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [statsVisible]);

  useEffect(() => {
    if (galleryPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setInterval(() => setGalleryIndex((index) => (index + 1) % galleryItems.length), 5200);
    return () => window.clearInterval(timer);
  }, [galleryPaused]);

  const visibleGallery = useMemo(
    () => [0, 1, 2].map((offset) => galleryItems[(galleryIndex + offset) % galleryItems.length]),
    [galleryIndex],
  );
  const homepageCards = useMemo(() => {
    const firstNews = managedContent.news?.[0];
    const firstEvent = managedContent.events?.[0];
    const announcement = managedContent.news?.[1];
    return [
      firstNews && { ...firstNews, type: "School news", excerpt: firstNews.excerpt || "A recent glimpse of curiosity, care and purposeful learning across SRSS.", Icon: Newspaper },
      firstEvent && { ...firstEvent, type: "Upcoming event", excerpt: firstEvent.excerpt || "Families are invited to take part in the next shared school experience.", image: "/assets/photos/processed/sports-day-march-1600.jpg", Icon: CalendarBlank },
      announcement && { ...announcement, type: "Announcement", excerpt: announcement.excerpt || "An important update for pupils, families and the wider school community.", Icon: Megaphone },
    ].filter(Boolean);
  }, [managedContent.news, managedContent.events]);

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


  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>

      <header className="site-header">
        <div className="updates-bar">
          <div className="header-wrap updates-inner">
            <span className="updates-label">Updates</span>
            <span className="updates-pause" aria-hidden="true">Ⅱ</span>
            <time dateTime="2026-07-20">20 Jul 2026</time>
            <p>Discover school life, upcoming dates and the latest news from the SRSS community.</p>
            <a href="/#school-life">View all updates <ArrowRight size={15} weight="bold" /></a>
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
              {navItems.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
            </nav>

            <div className="nav-actions">
              <button className="icon-action" type="button" onClick={() => setSearchOpen(true)} aria-label="Search SRSS"><MagnifyingGlass size={22} /></button>
              <a className="parent-link" href="/hub/parent">Parent Hub</a>
              <a className="admissions-button" href="/#admissions">Admissions &amp; Visits</a>
              <button className="mobile-menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation">{menuOpen ? <X size={25} /> : <List size={25} />}</button>
            </div>
          </div>

          {menuOpen && (
            <nav className="mobile-nav" aria-label="Mobile navigation">
              {navItems.map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
              <a href="/hub/parent" onClick={() => setMenuOpen(false)}>Parent Hub</a>
              <button type="button" onClick={() => { setMenuOpen(false); setVisitOpen(true); }}>Admissions &amp; Visits</button>
            </nav>
          )}
        </div>
      </header>

      {searchOpen && (
        <div className="search-layer" role="dialog" aria-modal="true" aria-label="Search SRSS">
          <form className="search-panel" onSubmit={(event) => event.preventDefault()}>
            <MagnifyingGlass size={25} />
            <label htmlFor="site-search">Search the SRSS website</label>
            <input id="site-search" autoFocus type="search" placeholder="Try “admissions”, “calendar” or “values”" />
            <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={24} /></button>
          </form>
        </div>
      )}

      {isVoices ? <VoicesPage /> : isInspiration ? <InspirationPage /> : isPrayerPage ? <PrayerPledgeAnthemPage /> : isAbout ? <AboutPage content={managedContent.about} onVisit={() => { setSent(false); setVisitOpen(true); }} /> : isFaq ? <FaqPage items={managedContent.faqs?.length ? managedContent.faqs : defaultFaqs} /> : <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Sekolah Rendah Sathya Sai&nbsp;&nbsp;·&nbsp;&nbsp;Since 2002</p>
            <h1 id="hero-title">The End of<br />Education is <span>Character</span></h1>
            <p className="hero-description">At <strong>Sekolah Rendah Sathya Sai</strong>, education is the journey of drawing out the best within every child. By harmonising the Head, Heart, and Hands, we cultivate learners who excel academically, live by universal human values, and become thoughtful leaders committed to making the world a better place.</p>
            <div className="hero-actions">
              <a className="primary-button" href="#purpose">Explore SRSS <ArrowRight size={18} weight="bold" /></a>
              <button className="text-button" type="button" onClick={() => { setSent(false); setVisitOpen(true); }}>Arrange a visit <ArrowRight size={18} /></button>
            </div>
          </div>
          <img className="hero-image" src="/assets/srss-hero-learning.png" alt="Teacher and pupils reading together in SRSS uniform" />
        </section>

        <section className="role-router" aria-labelledby="role-router-title">
          <div className="role-router-heading"><div><p className="eyebrow">Find your way</p><h2 id="role-router-title">I am a…</h2></div><p>Choose your role for school information and secure hub access.</p></div>
          <div className="role-router-grid">{roleRoutes.map(([label, copy, target, Icon]) => <a key={label} className="role-card" href={target}><Icon size={25} weight="duotone" /><span><strong>{label}</strong><small>{copy}</small></span><ArrowRight size={17} /></a>)}</div>
          
        </section>

        <section className="home-purpose" id="purpose" aria-labelledby="purpose-title">
          <div className="home-purpose-intro" data-reveal>
            <p className="eyebrow">Our purpose</p>
            <h2 id="purpose-title">Learning that reaches beyond the classroom.</h2>
            <p>Sekolah Rendah Sathya Sai is a values-based learning community where academic excellence meets character development. Rooted in Truth, Right Conduct, Peace, Love and Nonviolence, we help every child realise their potential and become a positive force for others.</p>
            <div className="home-links"><a className="text-link" href="/about#top">Discover About SRSS <ArrowRight size={16} /></a><a className="text-link" href="#learning">The learning experience <ArrowRight size={16} /></a></div>
          </div>
          <ul className="home-pillars" id="about-preview" data-reveal-stagger>{whySrss.map(([Icon, title, copy]) => <li key={title}><Icon size={26} weight="duotone" aria-hidden="true" /><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ul>
          <dl className="home-stats" ref={glanceRef} data-reveal-stagger>
            <div><dt>Years serving families</dt><dd>{statCounts.years}</dd></div>
            <div><dt>Primary years</dt><dd>{managedContent.homepage?.stats?.students || "Year 1–6"}</dd></div>
            <div><dt>Human values, one foundation</dt><dd>{statCounts.values}</dd></div>
            <div className="home-stats-motto"><dt>School motto</dt><dd>{managedContent.homepage?.stats?.motto || defaultHomepageContent.stats.motto}</dd></div>
          </dl>
        </section>

        <section className="learning-experience" id="learning" aria-labelledby="learning-title">
          <div className="learning-visual" data-reveal="image"><img src="/assets/srss-learning-strip.png" alt="Pupils exploring science, design and nature" /></div>
          <div className="learning-content" data-reveal>
            <p className="eyebrow">Learning experience</p>
            <h2 id="learning-title">Strong foundations. Open hearts.</h2>
            <p className="learning-summary">SRSS integrates Malaysia’s national curriculum with the philosophy of Sathya Sai Educare, so intellect and character grow together.</p>
            <div className="learning-tabs" role="tablist" aria-label="Learning experience themes">
              {learningTabs.map(([label], index) => (
                <button key={label} type="button" role="tab" aria-selected={activeLearning === index} aria-controls="learning-panel" onClick={() => setActiveLearning(index)}>{label}</button>
              ))}
            </div>
            <div className="learning-panel" id="learning-panel" role="tabpanel" aria-live="polite" key={activeLearning}>
              <h3>{learningTabs[activeLearning][0]}</h3>
              <p>{learningTabs[activeLearning][1]}</p>
            </div>
          </div>
        </section>

        <section className="home-voices" aria-labelledby="voices-title">
          <div className="home-section-head" data-reveal><p className="eyebrow">Voices that guide us</p><h2 id="voices-title">Led by example, inspired by service.</h2></div>
          <div className="home-voices-grid" data-reveal-stagger>
            <article className="voice-principal">
              <figure><img src={managedContent.homepage?.principal?.image || defaultHomepageContent.principal.image} alt={managedContent.homepage?.principal?.alt || defaultHomepageContent.principal.alt} /></figure>
              <div><p className="eyebrow">A welcome from our Principal</p><blockquote>“{managedContent.homepage?.principal?.quote || defaultHomepageContent.principal.quote}”</blockquote><p>{managedContent.homepage?.principal?.message || defaultHomepageContent.principal.message}</p><p className="quote-source">Uma Devi Jenes Nayagam · Principal</p><a className="text-link" href="/about/voices#principal">Read the Principal’s address <ArrowRight size={16} /></a></div>
            </article>
            <article className="voice-inspiration" aria-labelledby="inspiration-feature-title">
              <figure><img src="/assets/sathya-sai-baba-portrait.jpg" alt="Illustrated portrait of Bhagawan Sri Sathya Sai Baba in an orange robe" /></figure>
              <p className="eyebrow">Our inspiration</p>
              <h3 id="inspiration-feature-title">Education for life, not mere living.</h3>
              <blockquote>“{inspirationQuote}”</blockquote>
              <p className="quote-source">Sathya Sai Baba · September 1963</p>
              <a className="text-link" href="/about/inspiration">Our founder &amp; school community <ArrowRight size={16} /></a>
            </article>
          </div>
        </section>

        <section className="values-garden" id="values" aria-labelledby="garden-title">
          <div className="section-intro" data-reveal>
            <p className="eyebrow">The Values Garden</p>
            <h2 id="garden-title">What we nurture <em>takes root for life.</em></h2>
            <p>Select a petal to see how each human value becomes part of everyday school life.</p>
            <p className="values-interaction-cue"><CursorClick size={17} weight="duotone" aria-hidden="true" /> Choose any value to explore it</p>
          </div>
          <div className="values-flower" data-reveal role="group" aria-label="The five human values" onMouseLeave={() => setActiveValue(null)}>
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
                  aria-controls="value-description"
                  onMouseEnter={() => setActiveValue(index)}
                  onFocus={() => setActiveValue(index)}
                  onClick={() => setActiveValue(index)}
                >
                  <span className="petal-label">{value.petalLabel.map((line) => <span key={line}>{line}</span>)}</span>
                </button>
              ))}
            </div>
            {activeValue === null ? <article className="value-description value-default" id="value-description" aria-live="polite"><span>Head · Heart · Hands</span><h3>Education for Human Excellence</h3><p>At SRSS, education draws out the human values of Truth, Right Conduct, Peace, Love and Nonviolence so that every child can lead a fully human, meaningful and balanced life.</p><p className="value-quote">“Love in speech is Truth. Love in action is Right Conduct. Love in thought is Peace. Love in understanding is Nonviolence.”<br/><small>— Sri Sathya Sai Baba</small></p></article> : <article className={`value-description ${values[activeValue].className}`} id="value-description" aria-live="polite"><span>Human value</span><h3>{values[activeValue].name}</h3><p>{values[activeValue].description}</p><p className="value-practice">{values[activeValue].practice}</p></article>}
          </div>
        </section>

        <section className="faq-section home-faq-section" id="faq" aria-labelledby="faq-title"><div data-reveal><p className="eyebrow">Helpful answers</p><h2 id="faq-title">Questions, welcomed.</h2><p>Start with the questions families ask most often, or open the complete FAQ for detailed school information.</p><a className="text-link" href="/faq">View all frequently asked questions <ArrowRight size={16} /></a></div><FaqAccordion items={(managedContent.faqs?.length ? managedContent.faqs : defaultFaqs).slice(0, 8)} openIndex={openFaq} onToggle={setOpenFaq} idPrefix="home-faq" /></section>

        <section className="stories-band" id="news" aria-labelledby="news-title">
          <div className="stories-head" data-reveal><p className="eyebrow">News &amp; events</p><h2 id="news-title">Stories &amp; <em>Happenings.</em></h2><p>Moments of learning, service and celebration from the SRSS community.</p></div>
          <div className="stories-jubilee" data-reveal>
            <img src="/assets/brand/originals/srss-25-anniversary-mark.png" alt="SRSS 25th anniversary mark" />
            <div><p className="eyebrow">2002–2027 · Silver Jubilee</p><h3>{managedContent.homepage?.anniversary?.title || defaultHomepageContent.anniversary.title}</h3><p>{managedContent.homepage?.anniversary?.description || defaultHomepageContent.anniversary.description}</p><div className="anniversary-timeline"><span><strong>2002</strong>Our beginning</span><span><strong>2012</strong>Our journey</span><span><strong>2027</strong>Our future</span></div><a className="text-link" href="/about#srss25">Explore 25 years of SRSS <ArrowRight size={16} /></a></div>
          </div>
        </section>
        <section className="news-section" aria-label="Latest news"><div className="news-head" data-reveal><h3>Latest news &amp; events</h3><a href="#news">View all updates <ArrowRight size={16} /></a></div><div className="news-grid home-news-grid" data-reveal-stagger>{homepageCards.map((item) => <article key={`${item.type}-${item.id}`}><img src={item.image || "/assets/photos/processed/classroom-art-1280.jpg"} alt="" /><div><span><item.Icon size={15} />{item.type}</span><time>{new Date(`${item.date}T12:00:00`).toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" })}</time><h3>{item.title}</h3><p>{item.excerpt}</p><a href="#news">Read more <ArrowRight size={15} /></a></div></article>)}</div></section>
        <section className="life-section news-life-section" id="school-life" aria-labelledby="life-title" onMouseEnter={() => setGalleryPaused(true)} onMouseLeave={() => setGalleryPaused(false)} onFocusCapture={() => setGalleryPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setGalleryPaused(false); }}><div className="section-head-row" data-reveal><div><p className="eyebrow">School life in motion</p><h2 id="life-title">Small moments. <em>Lasting roots.</em></h2></div><div className="carousel-controls" aria-label="Gallery controls"><button type="button" onClick={() => setGalleryIndex((galleryIndex - 1 + galleryItems.length) % galleryItems.length)} aria-label="Previous gallery images"><CaretLeft size={21} /></button><span>{String(galleryIndex + 1).padStart(2, "0")} / {String(galleryItems.length).padStart(2, "0")}</span><button type="button" onClick={() => setGalleryIndex((galleryIndex + 1) % galleryItems.length)} aria-label="Next gallery images"><CaretRight size={21} /></button><small>{galleryPaused ? "Paused" : "Auto"}</small></div></div><div className="gallery-grid" data-reveal aria-live="polite">{visibleGallery.map(([src, title, alt], index) => <figure key={`${src}-${galleryIndex}`} className={index === 0 ? "featured" : ""}><img src={src} alt={alt} /><figcaption><span>{title}</span><small>SRSS school life</small></figcaption></figure>)}</div><a className="source-link" href="https://www.facebook.com/SSPSM/" target="_blank" rel="noreferrer">See more school moments on Facebook <ArrowRight size={17} /></a></section>
        <SchoolCalendar items={managedContent.events || []} onAdd={addToCalendar} />

        <section className="home-join" id="admissions" aria-labelledby="admissions-title">
          <div className="home-join-intro" data-reveal>
            <p className="eyebrow">Admissions</p>
            <h2 id="admissions-title">Begin the <em>journey.</em></h2>
            <p>SRSS welcomes primary-age children, Year 1 to Year 6, from families of every background who share a values-based approach to education. Admission is a warm conversation about readiness, learning needs and the values that matter to your family.</p>
            <ol className="home-pathway" aria-label="Admissions pathway">{admissionSteps.map(([step, detail], index) => <li key={step}><span aria-hidden="true">{index + 1}</span><div><strong>{step}</strong><small>{detail}</small></div></li>)}</ol>
            <div className="home-links"><a className="text-link" href="mailto:saischoolpuchong@gmail.com?subject=Fee%20enquiry">Request fee information <ArrowRight size={16} /></a><a className="text-link" href="mailto:saischoolpuchong@gmail.com?subject=Prospectus%20request">Request the prospectus <ArrowRight size={16} /></a></div>
          </div>
          <div className="home-join-card" id="enquiry" data-reveal>
            <div className="home-form-switch" role="tablist" aria-label="What would you like to send?">
              <button type="button" role="tab" aria-selected={formMode === "enquiry"} onClick={() => { setFormMode("enquiry"); setFormError(""); }}>Admissions enquiry</button>
              <button type="button" role="tab" aria-selected={formMode === "question"} onClick={() => { setFormMode("question"); setFormError(""); }}>General question</button>
            </div>
            {formMode === "enquiry" ? (enquirySent ? <div className="form-success" role="status"><CheckCircle size={34} weight="duotone" /><h3>Your enquiry is on its way.</h3><p>The admissions team will contact you with a next step, usually within two school days.</p></div> : <form className="school-form" onSubmit={async (event) => { event.preventDefault(); setFormError(""); const { questions, ...payload } = Object.fromEntries(new FormData(event.currentTarget)); try { await submitPublicForm("admissionEnquiries", { ...payload, message: questions, source: "website" }); setEnquirySent(true); } catch (reason) { setFormError(reason.message || "Your enquiry could not be sent. Please try again."); } }}>
              <label>Parent / guardian name<input required name="parentName" autoComplete="name" /></label><label>Email address<input required name="email" type="email" autoComplete="email" /></label>
              <label>Child’s name<input required name="childName" /></label><label>Child’s age<select required name="childAge" defaultValue=""><option value="" disabled>Select age</option>{[5,6,7,8,9,10,11,12].map(age => <option key={age}>{age}</option>)}</select></label>
              <label>Current school<input name="currentSchool" /></label><label>How did you hear about SRSS?<select name="referralSource" defaultValue=""><option value="" disabled>Select one</option><option>Family or friend</option><option>Social media</option><option>School event</option><option>Online search</option><option>Other</option></select></label>
              <label className="wide-label">Questions or anything you would like us to know<textarea name="questions" rows="3" /></label>{formError && <p className="form-error wide-label" role="alert">{formError}</p>}<button className="primary-button" type="submit">Send enquiry <ArrowRight size={18} weight="bold" /></button>
            </form>) : (contactSent ? <div className="form-success" role="status"><CheckCircle size={34} weight="duotone" /><h3>Thank you for writing.</h3><p>We will pass your message to the right person at school.</p></div> : <form className="school-form contact-form" onSubmit={async (event) => { event.preventDefault(); setFormError(""); try { await submitPublicForm("contactMessages", Object.fromEntries(new FormData(event.currentTarget))); setContactSent(true); } catch (reason) { setFormError(reason.message || "Your message could not be sent. Please try again."); } }}><label>Name<input required name="name" autoComplete="name" /></label><label>Email<input required name="email" type="email" autoComplete="email" /></label><label className="wide-label">Subject<select required name="subject" defaultValue=""><option value="" disabled>Select a subject</option><option>General</option><option>Admissions</option><option>Feedback</option><option>Other</option></select></label><label className="wide-label">Message<textarea required name="message" rows="5" /></label>{formError && <p className="form-error wide-label" role="alert">{formError}</p>}<button className="primary-button" type="submit">Send message <ArrowRight size={18} weight="bold" /></button></form>)}
          </div>
        </section>

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
      </main>}


      <footer id="community">
        <div className="footer-inner">
          <div className="footer-about">
            <div className="footer-brand">
              <img src="/assets/srss-logo.png" alt="" />
              <div><strong>Sekolah Rendah Sathya Sai</strong><span>Shaping Minds. Nurturing Hearts. Inspiring Lives.</span></div>
            </div>
            <p><strong>Sekolah Rendah Sathya Sai</strong> is a human value-based primary school dedicated to nurturing academic excellence, character, and compassionate leadership. Guided by the philosophy of Sathya Sai Educare, we inspire every child to discover the human values of Truth, Right Conduct, Peace, Love, and Nonviolence, empowering them to become confident learners and responsible global citizens.</p>
          </div>
          <address className="footer-contact">
            <h2>Contact</h2>
            <strong>Sekolah Rendah Sathya Sai</strong>
            <span>6, Jalan Puchong, Taman Tan Yew Lai,<br />58200 Kuala Lumpur,<br />Wilayah Persekutuan Kuala Lumpur</span>
            <a href="tel:+60126001926">+60 12-600 1926</a>
            <a href="mailto:saischoolpuchong@gmail.com">saischoolpuchong@gmail.com</a>
          </address>
          <nav className="footer-quick-links" aria-label="Footer quick links">
            <h2>Quick links</h2>
            <a href="/">Home</a>
            <a href="/about#top">About SRSS</a>
            <a href="/hub/parent">Parents Hub</a>
            <a href="/#students">Students Hub</a>
            <a href="/#teachers">Teachers Hub</a>
            <a href="/resources/prayer-pledge-anthem">Prayer, Pledge &amp; Anthem</a>
            <a href="/faq">FAQ</a>
          </nav>
        </div>
        <div className="footer-base"><span>© 2026 Sekolah Rendah Sathya Sai</span><button type="button" onClick={() => setVisitOpen(true)}>Contact the school</button></div>
      </footer>

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
                  <button className="primary-button" type="submit">Request a visit <ArrowRight size={18} weight="bold" /></button>
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
