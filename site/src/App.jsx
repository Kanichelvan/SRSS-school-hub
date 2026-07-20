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
import { EnvelopeSimple } from "@phosphor-icons/react/dist/csr/EnvelopeSimple";
import { FacebookLogo } from "@phosphor-icons/react/dist/csr/FacebookLogo";
import { FloppyDisk } from "@phosphor-icons/react/dist/csr/FloppyDisk";
import { GlobeHemisphereEast } from "@phosphor-icons/react/dist/csr/GlobeHemisphereEast";
import { GraduationCap } from "@phosphor-icons/react/dist/csr/GraduationCap";
import { HandHeart } from "@phosphor-icons/react/dist/csr/HandHeart";
import { HandsClapping } from "@phosphor-icons/react/dist/csr/HandsClapping";
import { Heart } from "@phosphor-icons/react/dist/csr/Heart";
import { List } from "@phosphor-icons/react/dist/csr/List";
import { LockKey } from "@phosphor-icons/react/dist/csr/LockKey";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { MapPin } from "@phosphor-icons/react/dist/csr/MapPin";
import { Megaphone } from "@phosphor-icons/react/dist/csr/Megaphone";
import { Newspaper } from "@phosphor-icons/react/dist/csr/Newspaper";
import { PersonSimpleRun } from "@phosphor-icons/react/dist/csr/PersonSimpleRun";
import { Phone } from "@phosphor-icons/react/dist/csr/Phone";
import { Plus } from "@phosphor-icons/react/dist/csr/Plus";
import { Quotes } from "@phosphor-icons/react/dist/csr/Quotes";
import { Sparkle } from "@phosphor-icons/react/dist/csr/Sparkle";
import { TreeStructure } from "@phosphor-icons/react/dist/csr/TreeStructure";
import { UploadSimple } from "@phosphor-icons/react/dist/csr/UploadSimple";
import { UsersThree } from "@phosphor-icons/react/dist/csr/UsersThree";
import { X } from "@phosphor-icons/react/dist/csr/X";
import { ParentHubSystem } from "./ParentHubSystem.jsx";

const navItems = [
  ["About", "/about#about"],
  ["Learning", "/learning#learning"],
  ["Admissions", "/admissions#admissions"],
  ["News & Events", "/news#news"],
  ["Contact", "/contact#contact"],
];

const values = [
  {
    name: "Truth",
    className: "truth",
    description: "Truth is sincerity, courage and integrity in word and action. Pupils learn to speak honestly, think clearly and stand gently for what is right.",
  },
  {
    name: "Right Conduct",
    className: "conduct",
    description: "Right Conduct turns good intentions into daily habits—responsibility, punctuality, cleanliness, self-discipline and service to others.",
  },
  {
    name: "Peace",
    className: "peace",
    description: "Peace grows through quiet reflection, respectful speech and emotional self-control, helping every child respond thoughtfully to the world around them.",
  },
  {
    name: "Love",
    className: "love",
    description: "Love is expressed through kindness, inclusion and care. It shapes the way pupils learn together, support friends and contribute to their community.",
  },
  {
    name: "Nonviolence",
    className: "nonviolence",
    description: "Nonviolence is gentleness in thought, word and deed—respect for people, animals and nature, guided by empathy and understanding.",
  },
];

const galleryItems = [
  ["./assets/photos/processed/science-microscope-1600.jpg", "Looking closer", "An SRSS pupil examining a specimen through a microscope during a science activity."],
  ["./assets/photos/processed/chess-competition-1280.jpg", "Minds at play", "SRSS pupils concentrating during a chess competition."],
  ["./assets/photos/processed/classroom-art-1280.jpg", "Making together", "SRSS pupils painting and creating together during a classroom art activity."],
  ["./assets/photos/processed/student-speaker-960.jpg", "Finding a voice", "An SRSS pupil in school uniform speaking into a microphone."],
  ["./assets/photos/processed/assembly-achievements-1280.jpg", "Growing together", "SRSS pupils sharing certificates during a school assembly."],
  ["./assets/photos/processed/sports-day-march-1600.jpg", "Moving as one", "SRSS pupils taking part in a Sports Day march on the school field."],
  ["./assets/photos/processed/sports-day-podium-1600.jpg", "Celebrating effort", "Pupils and staff celebrating Sports Day achievements at the awards podium."],
  ["./assets/photos/processed/facebook-jejak-juara-02.jpg", "Confident voices", "An SRSS pupil presenting classroom work beside a digital display."],
  ["./assets/photos/processed/facebook-jejak-juara-06.jpg", "Active bodies", "Two SRSS pupils with their coach on a badminton court."],
];

const roleRoutes = [
  ["Parent", "Notices, forms, dates and class updates.", "parent", UsersThree],
  ["Student", "Learning links, reading and values challenges.", "#students", GraduationCap],
  ["Teacher", "Timetables, resources and staff essentials.", "#teachers", ChalkboardTeacher],
  ["Exploring the school", "Our story, learning approach and admissions.", "#about", Compass],
  ["Part of the Sai community", "Events, seva and ways to stay connected.", "#community", HandHeart],
];

const whySrss = [
  [BookOpen, "Values-integrated curriculum", "Human values shape how pupils enquire, collaborate and apply Malaysia’s national curriculum each day."],
  [Heart, "Whole-child development", "Head, Heart, Hands and Health grow together through learning, reflection, movement and service."],
  [GlobeHemisphereEast, "Sai education philosophy", "Sathya Sai Educare helps each child draw out the character, confidence and compassion already within."],
];

const defaultHomepageContent = {
  stats: { years: 25, students: "Year 1–6", values: 5, motto: "The End of Education is Character" },
  principal: { quote: "Each child enters our school with gifts waiting to be recognised. Our task is to nurture clear thinking, a compassionate heart and the courage to serve.", message: "Welcome to a school community where pupils are known, challenged and cared for. We invite your family to discover how character and learning grow together at SRSS.", image: "/assets/srss-hero-learning.png" },
  anniversary: { title: "Celebrating 25 Years.", description: "A quarter-century of learning, service and Human Excellence. Follow the milestones and voices that continue to shape SRSS." },
};

const learningTabs = [
  ["Curious minds", "Through Malaysia’s national curriculum, pupils investigate, question and connect ideas. Classrooms are structured for strong foundations while leaving space for wonder, dialogue and independent thought."],
  ["Active bodies", "Movement, games and co-curricular experiences develop coordination, resilience and teamwork. Pupils learn to participate wholeheartedly, strive fairly and care for one another."],
  ["Human Values", "Truth, Right Conduct, Peace, Love and Nonviolence are woven into lessons, reflection, relationships and service—not taught as slogans, but practised as ways of living."],
  ["Loving learning environment", "Teachers know each child as a whole person. Clear expectations, encouragement and mutual respect create a safe environment in which every learner can contribute and grow."],
];

const hubs = [
  ["Parents Hub", "Notices, calendar, forms, handbooks and the practical guidance families need each week.", "#parents"],
  ["Student Hub", "Learning links, reading, class resources, values challenges and activities for curious young minds.", "#students"],
  ["Teacher Hub", "Timetables, teaching resources, SOPs, forms, checklists and protected staff links.", "#teachers"],
  ["Community", "School events, volunteering, service opportunities, alumni stories and ways to support SRSS.", "#community"],
];

const aboutMilestones = [["2001", "A shared vision", "A values-based primary school is envisioned for families in Kuala Lumpur."], ["2002", "SRSS begins", "The first cohort begins a learning journey rooted in human excellence."], ["2007", "Growing together", "The school community expands its learning spaces and co-curricular life."], ["2017", "Service in action", "Seva and community partnerships become an even more visible part of school life."], ["2026", "Looking forward", "SRSS celebrates a quarter-century of nurturing minds, hearts and character."]];

const humanValues = [["Sathya", "Truth", "Integrity in thought, word and action.", "Speaking honestly in a classroom discussion", "Owning a mistake and making it right", "Bringing sincere effort to each task"], ["Dharma", "Right Conduct", "Doing what is right with care and responsibility.", "Arriving prepared and on time", "Taking care of shared spaces", "Offering a helping hand without being asked"], ["Shanti", "Peace", "Finding steadiness within and respect around us.", "Beginning with a quiet moment", "Choosing calm words in a disagreement", "Reflecting before responding"], ["Prema", "Love", "Seeing and serving the good in every person.", "Including a classmate at play", "Encouraging a friend who is trying", "Showing gratitude to those who care for us"], ["Ahimsa", "Non-Violence", "Gentleness towards people, animals and the earth.", "Solving conflict without hurtful words", "Caring for the school garden", "Making choices that protect our shared world"]];

const defaultAboutContent = {
  heroEyebrow: "About SRSS · 25th year", heroTitle: "Our Story", heroBody: "At SRSS, education begins with a simple belief: every child carries within them the capacity for wisdom, kindness and purposeful action.", heroImage: "/assets/photos/processed/assembly-achievements-1280.jpg", heroAlt: "SRSS pupils gathered at a school assembly", foundingTitle: "A school built on what matters most.", foundingBody: "Sekolah Rendah Sathya Sai was established to offer an education in which strong learning and strong character belong together. Inspired by the education vision of Sathya Sai Baba, the school seeks to draw out the human values already present in every child.", foundingSupport: "SRSS is part of a worldwide family of Sathya Sai schools: locally rooted, globally connected, and united by a commitment to academic confidence, compassionate leadership and service to society.", milestones: aboutMilestones.map(([year, title, copy]) => ({ year, title, copy })), valueWeek: { title: "Love in action", prompt: "Notice one thoughtful way you can make someone’s day lighter.", route: "#students" }, principal: { heading: "Every child deserves to be known.", quote: "Our work is not only to help children succeed in school, but to help them grow into people who can bring courage, care and clarity to the world around them.", body: "SRSS is a community of educators, families and pupils learning together. We hold high expectations with warmth, and create space for every child to discover both their strengths and their responsibility to others.", image: "/assets/photos/processed/student-speaker-960.jpg", alt: "An SRSS pupil sharing a reflection at school" }, updatedAt: null,
};

const missionPillars = [["Academic Excellence", "Developing knowledgeable, confident and capable lifelong learners."], ["Character Excellence", "Nurturing integrity, self-awareness, compassion, responsibility and strength of character."], ["Civic Stewardship", "Developing responsible Malaysians who respect their nation, its diversity and the wider human family."], ["Altruistic Responsibility", "Inspiring children to recognise their responsibility to serve society and care for the world around them."]];
const aboutLinks = [["Our Story", "/about/our-story"], ["Vision & Mission", "/about/vision-mission"], ["Sathya Sai Education & Educare", "#educare"], ["Leadership & Governance", "/about/governance"], ["Our People", "#our-people"], ["School Profile", "#school-profile"], ["Campus & Contact", "#campus"], ["25 Years of SRSS", "#srss25"]];

function AboutPage({ onVisit, content }) {
  const about = { ...defaultAboutContent, ...content };
  return <main id="main" className="about-page about-refresh">
    <section className="about-hero"><div className="about-inner about-hero-grid"><div><p className="eyebrow">ABOUT SRSS · EDUCATION FOR LIFE</p><h1>Education for Life,<br/>Not Mere Living.</h1><p>Sekolah Rendah Sathya Sai is a Malaysian primary school dedicated to helping every child grow into the fullest and finest expression of who they can become.</p><a className="primary-button" href="#who-we-are">Discover who we are <ArrowRight size={18}/></a></div><figure className="about-hero-photo"><img src={about.heroImage} alt={about.heroAlt}/></figure></div></section>
    <nav className="about-directory about-inner" aria-label="About SRSS sections">{aboutLinks.map(([label, href]) => <a key={label} href={href}>{label}<ArrowRight size={15}/></a>)}</nav>
    <section className="about-intro about-inner" id="who-we-are"><div><p className="eyebrow">Who we are</p><h2>A school for the mind, heart and character.</h2></div><div className="about-rich-copy"><p>At SRSS, education is more than the acquisition of knowledge or preparation for examinations. We believe a truly educated child develops an intelligent mind, a strong character, a compassionate heart, practical abilities and responsibility towards others.</p><p>Inspired by the educational philosophy of Sri Sathya Sai Baba, we combine the Malaysian National Curriculum with an integral approach that nurtures body, mind, heart and spirit.</p><a className="text-link" href="/about/our-story">Explore Our Story <ArrowRight size={17}/></a></div></section>
    <section className="purpose-refresh" id="vision-mission"><div className="about-inner"><div className="purpose-refresh-heading"><p className="eyebrow">Our purpose</p><h2>Human Excellence, lived with purpose.</h2><p><strong>Vision</strong> — to nurture young people of character, confidence and compassion who contribute to a more peaceful world.</p><p><strong>Mission</strong> — to integrate Malaysia’s national curriculum with an education that develops intellect, integrity, wellbeing and service.</p></div><div className="mission-pillars">{missionPillars.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div><a className="text-link" href="/about/vision-mission">Discover Our Vision &amp; Mission <ArrowRight size={17}/></a></div></section>
    <section className="educare-refresh" id="educare"><div className="about-inner educare-grid"><div><p className="eyebrow">Sathya Sai Education &amp; Educare</p><h2>Drawing out what is already within.</h2><p>Education provides knowledge from the outside. <strong>Educare seeks to draw out the values and human potential already within the child.</strong></p><p>Truth, Right Conduct, Peace, Love and Non-Violence are not separate subjects or decorative slogans. They are practised in lessons, relationships, reflection and service.</p></div><div className="integral-model" role="img" aria-label="Body plus mind plus heart plus spirit leads to human excellence"><span>BODY</span><b>+</b><span>MIND</span><b>+</b><span>HEART</span><b>+</b><span>SPIRIT</span><i>↓</i><strong>HUMAN EXCELLENCE</strong></div></div><div className="about-inner global-line"><p><strong>A global educational movement.</strong> Sathya Sai Schools are locally rooted, inclusive and non-denominational, sharing a commitment to academic excellence and universal human values.</p></div></section>
    <section className="learning-refresh about-inner"><div><p className="eyebrow">Learning at SRSS</p><h2>More Than Schooling, <em>Educating the Whole Child.</em></h2><p>Children do not all learn in the same way, develop at the same pace or reveal their strengths through examinations alone. Our educational model creates space to know, become, think, live, do and serve.</p></div><div className="excellence-framework"><strong>HUMAN EXCELLENCE</strong><div><span><b>KNOWING</b>Academics</span><span><b>BECOMING</b>Character</span><span><b>THINKING</b>Critical thinking</span><span><b>LIVING</b>Human Values</span><span><b>DOING</b>Practical skills</span><span><b>SERVING</b>Social responsibility</span></div></div></section>
    <section className="spaces-refresh" id="school-profile"><div className="about-inner"><p className="eyebrow">Spaces designed for learning</p><h2>Opportunity to enquire, create and grow.</h2><div>{[["Science & Discovery", "Hands-on experimentation, scientific inquiry, observation and problem-solving.", "science-microscope-1600.jpg"], ["Digital Learning", "Digital literacy, research, creativity and responsible use of technology.", "classroom-art-1280.jpg"], ["Library & Reading", "Reading culture, literacy development and independent discovery.", "chess-competition-1280.jpg"], ["Learning Support", "Targeted intervention and personalised support for every learner.", "student-speaker-960.jpg"]].map(([title, copy, image]) => <article key={title}><img src={`./assets/photos/processed/${image}`} alt=""/><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>
    <section className="community-refresh" id="our-people"><div className="about-inner"><p className="eyebrow">It takes a community to educate a child</p><h2>Every day is an opportunity to grow.</h2><div className="partnership"><strong>CHILD</strong><span>TEACHERS</span><span>PARENTS</span><span>VOLUNTEERS</span></div><p>Teachers, parents and volunteers each bring something essential to the child’s learning. Together, they create the conditions in which confidence, character and capability can flourish.</p><a className="text-link" href="#contact">Discover how you can be part of SRSS <ArrowRight size={17}/></a></div></section>
    <section className="people-refresh about-inner"><figure><img src={about.principal?.image || defaultAboutContent.principal.image} alt="SRSS pupil sharing a reflection"/></figure><div><p className="eyebrow">Our people</p><h2>Leadership, teachers and family partnership.</h2><p>Our people include the Board of Directors, school leadership, teachers, administrators, support staff and Teacher-Parent Association — each contributing to a school community in which every child is known and encouraged.</p><a className="text-link" href="/about/governance">Learn about Governance <ArrowRight size={17}/></a></div></section>
    <section className="anniversary-refresh" id="srss25"><div className="about-inner"><p className="eyebrow">SRSS25 · 25 years of educating the heart</p><h2>2002 <span>—</span> 2027</h2><div>{["Our beginning", "Our journey", "Our people", "Our impact", "Our future"].map((item) => <article key={item}><i>↓</i><strong>{item}</strong></article>)}</div><p>Our Silver Jubilee will honour founders and pioneers, former teachers, alumni stories, anniversary projects and the next chapter of SRSS.</p><a className="primary-button" href="#contact">Join the SRSS Alumni Network <ArrowRight size={18}/></a></div></section>
    <section className="about-closing" id="campus"><div className="about-inner"><TreeStructure size={32}/><p className="eyebrow">About SRSS</p><h2>Discover who we are and what shapes our approach to education.</h2><button className="primary-button" type="button" onClick={onVisit}>Arrange a visit <ArrowRight size={18}/></button></div></section>
  </main>;
}

const admissionSteps = ["Enquiry", "Visit", "Application", "Assessment / interview", "Offer", "Enrolment"];
const newsItems = [
  ["School News", "A new term of curious, caring learning", "20 Jul 2026", "./assets/photos/processed/science-microscope-1600.jpg"],
  ["Achievements", "Celebrating effort, teamwork and every growing voice", "14 Jul 2026", "./assets/photos/processed/sports-day-podium-1600.jpg"],
  ["Values in Action", "Pupils bring care and responsibility into daily life", "08 Jul 2026", "./assets/photos/processed/classroom-art-1280.jpg"],
];
const events = [
  ["25 JUL", "Open morning for prospective families", "Parent", "9.30–11.30 am"],
  ["31 JUL", "Community seva day", "Seva", "8.30–11.00 am"],
  ["08 AUG", "National Day cultural celebration", "Cultural", "8.00 am–12.00 pm"],
];
const faqs = [
  ["Is SRSS a religious school?", "SRSS is a values-based school. We welcome families of all backgrounds who value character, respect and compassionate service."],
  ["What curriculum do pupils follow?", "Our primary programme integrates Malaysia’s national curriculum with a values-based approach to learning."],
  ["What is the language of instruction?", "Teaching is delivered in line with the national curriculum, with language support provided as appropriate for each child."],
  ["Are uniform, transport and after-school care available?", "Our admissions team can share the current practical arrangements and options during your visit or enquiry."],
];

function AboutEditor({ about = defaultAboutContent, onChange }) {
  const update = (key, value) => onChange({ ...about, [key]: value });
  const updateNested = (key, nested, value) => onChange({ ...about, [key]: { ...(about[key] || {}), [nested]: value } });
  return <section className="admin-panel about-admin-panel"><div className="admin-panel-head"><div><h2>About SRSS page</h2><span>Public page content and managed assets</span></div><a href="/about#about" target="_blank" rel="noreferrer">Preview page</a></div><div className="about-admin-grid"><label>Hero eyebrow<input value={about.heroEyebrow || ""} onChange={(event) => update("heroEyebrow", event.target.value)} /></label><label>Hero title<input value={about.heroTitle || ""} onChange={(event) => update("heroTitle", event.target.value)} /></label><label className="wide-label">Hero message<textarea rows="3" value={about.heroBody || ""} onChange={(event) => update("heroBody", event.target.value)} /></label><label>Hero image URL<input value={about.heroImage || ""} onChange={(event) => update("heroImage", event.target.value)} /></label><label>Hero image alt text<input value={about.heroAlt || ""} onChange={(event) => update("heroAlt", event.target.value)} /></label><label>Founding heading<input value={about.foundingTitle || ""} onChange={(event) => update("foundingTitle", event.target.value)} /></label><label className="wide-label">Founding story<textarea rows="4" value={about.foundingBody || ""} onChange={(event) => update("foundingBody", event.target.value)} /></label><label className="wide-label">Founding support<textarea rows="3" value={about.foundingSupport || ""} onChange={(event) => update("foundingSupport", event.target.value)} /></label><label>Value of the week<input value={about.valueWeek?.title || ""} onChange={(event) => updateNested("valueWeek", "title", event.target.value)} /></label><label>Student challenge link<input value={about.valueWeek?.route || ""} onChange={(event) => updateNested("valueWeek", "route", event.target.value)} /></label><label className="wide-label">Weekly prompt<textarea rows="2" value={about.valueWeek?.prompt || ""} onChange={(event) => updateNested("valueWeek", "prompt", event.target.value)} /></label><label>Leadership heading<input value={about.principal?.heading || ""} onChange={(event) => updateNested("principal", "heading", event.target.value)} /></label><label>Leadership image URL<input value={about.principal?.image || ""} onChange={(event) => updateNested("principal", "image", event.target.value)} /></label><label className="wide-label">Leadership message<textarea rows="4" value={about.principal?.quote || ""} onChange={(event) => updateNested("principal", "quote", event.target.value)} /></label></div></section>;
}

function AdminHub({ onExit }) {
  const [key, setKey] = useState(() => sessionStorage.getItem("srss-admin-key") || "");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async (event) => { event?.preventDefault(); setError(""); try { const response = await fetch("/api/admin/content", { headers: { "x-srss-admin-key": key } }); const result = await response.json(); if (!response.ok) throw new Error(result.error); sessionStorage.setItem("srss-admin-key", key); setData(result); } catch (reason) { setError(reason.message || "Unable to connect to the Admin Hub."); } };
  const save = async () => { setSaving(true); setError(""); try { const response = await fetch("/api/admin/content", { method: "PUT", headers: { "content-type": "application/json", "x-srss-admin-key": key }, body: JSON.stringify(data) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setData(result); } catch (reason) { setError(reason.message); } finally { setSaving(false); } };
  const updateEnquiry = async (id, status) => { const response = await fetch(`/api/admin/enquiries/${id}`, { method: "PATCH", headers: { "content-type": "application/json", "x-srss-admin-key": key }, body: JSON.stringify({ status }) }); const result = await response.json(); if (response.ok) setData({ ...data, enquiries: data.enquiries.map((item) => item.id === id ? result : item) }); else setError(result.error); };
  const upload = async (event) => { const file = event.target.files?.[0]; if (!file) return; const base64 = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); }); const response = await fetch("/api/admin/assets", { method: "POST", headers: { "content-type": "application/json", "x-srss-admin-key": key }, body: JSON.stringify({ filename: file.name, mimeType: file.type, base64, alt: "" }) }); const result = await response.json(); if (!response.ok) setError(result.error); else setData({ ...data, assets: [result, ...data.assets] }); };

  if (!data) return <div className="admin-shell"><header><button type="button" onClick={onExit}>← Return to SRSS</button><img src="./assets/srss-logo.png" alt="SRSS logo" /><span>Admin Hub</span></header><main className="admin-login"><p className="hub-eyebrow">Staff management</p><h1>Manage public school information.</h1><p>Review admissions enquiries, refresh news and events, and add approved image assets.</p><form onSubmit={load}><label>Admin key<input required type="password" value={key} onChange={(event) => setKey(event.target.value)} autoComplete="current-password" /></label><button className="hub-primary" type="submit"><LockKey size={17} /> Open Admin Hub</button></form>{error && <p className="admin-error">{error}</p>}<small>Set <code>SRSS_ADMIN_KEY</code> before deploying. Local development uses <code>srss-local-admin</code>.</small></main></div>;
  return <div className="admin-shell"><header><button type="button" onClick={onExit}>← Return to SRSS</button><img src="./assets/srss-logo.png" alt="SRSS logo" /><span>Admin Hub</span><button type="button" onClick={load}>Refresh</button></header><main className="admin-main"><div className="admin-heading"><div><p className="hub-eyebrow">Public site management</p><h1>Today’s school story, in hand.</h1></div><button className="hub-primary" type="button" disabled={saving} onClick={save}><FloppyDisk size={17} /> {saving ? "Saving…" : "Save public content"}</button></div>{error && <p className="admin-error">{error}</p>}<section className="admin-stat-grid"><article><strong>{data.enquiries.filter((item) => item.status === "new").length}</strong><span>New admissions enquiries</span></article><article><strong>{data.news.length}</strong><span>News stories</span></article><article><strong>{data.events.length}</strong><span>Upcoming events</span></article><article><strong>{data.assets.length}</strong><span>Managed assets</span></article></section><section className="admin-columns"><div><section className="admin-panel"><div className="admin-panel-head"><h2>Admissions queue</h2><span>{data.enquiries.length} total</span></div>{data.enquiries.length ? data.enquiries.map((item) => <article className="admin-enquiry" key={item.id}><div><strong>{item.parentName}</strong><span>{item.childName} · age {item.childAge}</span><small>{item.email} · {new Date(item.createdAt).toLocaleDateString()}</small></div><select value={item.status} onChange={(event) => updateEnquiry(item.id, event.target.value)} aria-label={`Status for ${item.parentName}`}><option value="new">New</option><option value="in progress">In progress</option><option value="closed">Closed</option></select></article>) : <p className="admin-empty">New family enquiries will appear here.</p>}</section><section className="admin-panel"><div className="admin-panel-head"><h2>Asset library</h2><label className="asset-upload"><UploadSimple size={16} /> Upload image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} /></label></div><div className="asset-list">{data.assets.length ? data.assets.map((asset) => <a key={asset.id} href={asset.url} target="_blank" rel="noreferrer">{asset.filename}</a>) : <p className="admin-empty">Upload approved JPEG, PNG or WebP files (up to 5 MB).</p>}</div></section></div><div><section className="admin-panel"><div className="admin-panel-head"><h2>News</h2><button type="button" onClick={() => setData({ ...data, news: [{ id: `news-${Date.now()}`, category: "School News", title: "New school story", date: new Date().toISOString().slice(0, 10), image: "", published: false }, ...data.news] })}>Add story</button></div>{data.news.map((item, index) => <div className="content-editor" key={item.id}><input value={item.title} onChange={(event) => { const news = [...data.news]; news[index] = { ...item, title: event.target.value }; setData({ ...data, news }); }} aria-label="News title" /><div><select value={item.category} onChange={(event) => { const news = [...data.news]; news[index] = { ...item, category: event.target.value }; setData({ ...data, news }); }}><option>School News</option><option>Achievements</option><option>Values in Action</option><option>Community</option></select><input type="date" value={item.date} onChange={(event) => { const news = [...data.news]; news[index] = { ...item, date: event.target.value }; setData({ ...data, news }); }} /><label><input type="checkbox" checked={item.published} onChange={(event) => { const news = [...data.news]; news[index] = { ...item, published: event.target.checked }; setData({ ...data, news }); }} /> Published</label></div></div>)}</section><section className="admin-panel"><div className="admin-panel-head"><h2>Events</h2><button type="button" onClick={() => setData({ ...data, events: [{ id: `event-${Date.now()}`, title: "New school event", date: new Date().toISOString().slice(0, 10), category: "Community", time: "", published: false }, ...data.events] })}>Add event</button></div>{data.events.map((item, index) => <div className="content-editor" key={item.id}><input value={item.title} onChange={(event) => { const events = [...data.events]; events[index] = { ...item, title: event.target.value }; setData({ ...data, events }); }} aria-label="Event title" /><div><input type="date" value={item.date} onChange={(event) => { const events = [...data.events]; events[index] = { ...item, date: event.target.value }; setData({ ...data, events }); }} /><input value={item.time} placeholder="Time" onChange={(event) => { const events = [...data.events]; events[index] = { ...item, time: event.target.value }; setData({ ...data, events }); }} /><label><input type="checkbox" checked={item.published} onChange={(event) => { const events = [...data.events]; events[index] = { ...item, published: event.target.checked }; setData({ ...data, events }); }} /> Published</label></div></div>)}</section></div></section></main></div>;
}

const parentNotices = [
  { date: "20 Jul", title: "Reminder: National Day cultural celebration", detail: "Please send your child in the requested attire by 7.45 am on Friday, 8 August.", tag: "School-wide" },
  { date: "18 Jul", title: "Year 3 weekly update", detail: "This week, pupils will explore measurement through practical activities and reading reflections.", tag: "Year 3 Amanah" },
  { date: "14 Jul", title: "Community seva day", detail: "Families are warmly invited to join us on Saturday, 31 July.", tag: "Community" },
];

const parentEvents = [
  ["25", "JUL", "Open morning", "9.30–11.30 am"],
  ["31", "JUL", "Community seva day", "8.30–11.00 am"],
  ["08", "AUG", "National Day celebration", "8.00 am–12.00 pm"],
];

function ParentHub({ onExit }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [child, setChild] = useState("Aarav Raman · Year 3 Amanah");
  const [absenceOpen, setAbsenceOpen] = useState(false);
  const [absenceSent, setAbsenceSent] = useState(false);
  const [noticePreference, setNoticePreference] = useState(true);
  const sections = ["Dashboard", "Notices", "Calendar", "Forms & documents", "Parent essentials", "Class page", "Contacts"];
  const addCalendarEvent = (title, date) => {
    const [day, month] = date.split(" ");
    const yyyyMmDd = `2026${month === "JUL" ? "07" : "08"}${day.padStart(2, "0")}`;
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART;VALUE=DATE:${yyyyMmDd}\nSUMMARY:${title}\nEND:VEVENT\nEND:VCALENDAR`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (!authenticated) {
    return (
      <div className="parent-auth-shell">
        <header className="parent-auth-header">
          <button type="button" className="parent-back" onClick={onExit}>← Return to SRSS</button>
          <div className="parent-auth-brand"><img src="./assets/srss-logo.png" alt="Sekolah Rendah Sathya Sai logo" /><span><strong>Sekolah Rendah Sathya Sai</strong><small>Parent Hub</small></span></div>
          <span className="secure-label">Secure family access</span>
        </header>
        <main className="parent-auth-main">
          <section className="parent-auth-card" aria-labelledby="parent-login-title">
            <p className="hub-eyebrow">Welcome to Parent Hub</p>
            <h1 id="parent-login-title">Your family’s school day, in one place.</h1>
            <p>Check notices, dates, forms and classroom updates whenever you need them.</p>
            <form onSubmit={(event) => { event.preventDefault(); setAuthenticated(true); }}>
              <label>Email address<input required type="email" autoComplete="email" placeholder="name@example.com" /></label>
              <label>Password<input required type="password" autoComplete="current-password" placeholder="••••••••" /></label>
              <button className="hub-primary" type="submit">Sign in to Parent Hub <ArrowRight size={17} weight="bold" /></button>
            </form>
            <div className="auth-actions"><button type="button">Forgot password?</button><span>·</span><button type="button">Need an invitation?</button></div>
          </section>
          <aside className="parent-auth-aside"><p className="hub-eyebrow">A calmer school week</p><h2>What needs your attention—without the searching.</h2><ul><li>Important notices, clearly pinned</li><li>Dates and parent meetings at a glance</li><li>Forms and documents ready when you need them</li></ul></aside>
        </main>
      </div>
    );
  }

  const showDashboard = activeSection === "Dashboard";
  return (
    <div className="parent-hub-shell">
      <header className="parent-hub-header">
        <div className="parent-hub-brand"><img src="./assets/srss-logo.png" alt="Sekolah Rendah Sathya Sai logo" /><span><strong>Sekolah Rendah Sathya Sai</strong><small>Parent Hub</small></span></div>
        <div className="parent-hub-actions"><select value={child} onChange={(event) => setChild(event.target.value)} aria-label="Select child"><option>Aarav Raman · Year 3 Amanah</option><option>Meera Raman · Year 1 Bestari</option></select><button type="button" className="notification-toggle" aria-pressed={noticePreference} onClick={() => setNoticePreference(!noticePreference)}>Notices {noticePreference ? "on" : "off"}</button><button type="button" className="sign-out" onClick={onExit}>Sign out</button></div>
      </header>
      <div className="parent-hub-body">
        <aside className="parent-hub-nav"><p>FAMILY SPACE</p>{sections.map((section) => <button type="button" key={section} className={activeSection === section ? "active" : ""} onClick={() => setActiveSection(section)}>{section}</button>)}<div className="hub-help"><strong>Need help?</strong><span>School Office</span><a href="tel:+60126001926">+60 12-600 1926</a></div></aside>
        <main className="parent-hub-content">
          {showDashboard ? <>
            <div className="hub-welcome"><div><p className="hub-eyebrow">Monday, 20 July</p><h1>Good morning, Priya.</h1><p>Here is what is happening for Aarav this week.</p></div><button type="button" className="hub-outline" onClick={() => setActiveSection("Calendar")}>View full calendar <CalendarBlank size={17} /></button></div>
            <section className="hub-pinned"><div><span className="pinned-dot" /><p className="hub-eyebrow">Today’s notice · School-wide</p><h2>National Day cultural celebration</h2><p>Please note the requested attire and arrival time for Friday, 8 August.</p></div><button type="button" onClick={() => setActiveSection("Notices")}>Read notice <ArrowRight size={17} /></button></section>
            <div className="hub-grid">
              <section className="hub-panel-card hub-events"><div className="hub-card-heading"><div><p className="hub-eyebrow">Upcoming dates</p><h2>This week</h2></div><button type="button" onClick={() => setActiveSection("Calendar")}>All dates</button></div>{parentEvents.map(([day, month, event, time]) => <div className="event-row" key={event}><time><strong>{day}</strong><span>{month}</span></time><div><strong>{event}</strong><span>{time}</span></div></div>)}</section>
              <section className="hub-panel-card hub-forms"><div className="hub-card-heading"><div><p className="hub-eyebrow">Action needed</p><h2>Forms & tasks</h2></div><span className="task-count">2</span></div><button type="button" className="task-row" onClick={() => { setAbsenceSent(false); setAbsenceOpen(true); }}><span><strong>Submit absence notice</strong><small>For an upcoming absence</small></span><ArrowRight size={18} /></button><button type="button" className="task-row"><span><strong>Seva day response</strong><small>Please respond by 28 July</small></span><ArrowRight size={18} /></button><button type="button" className="quiet-link" onClick={() => setActiveSection("Forms & documents")}>Open Forms Centre</button></section>
            </div>
            <section className="hub-quick-links"><div><p className="hub-eyebrow">Useful today</p><h2>Quick links</h2></div><div className="quick-link-list"><button type="button" onClick={() => setActiveSection("Class page")}><GraduationCap size={22} /><span><strong>Class page</strong><small>Weekly update & homework</small></span></button><button type="button" onClick={() => setActiveSection("Parent essentials")}><CheckCircle size={22} /><span><strong>Parent essentials</strong><small>Arrival, uniform & handbook</small></span></button><button type="button" onClick={() => setActiveSection("Contacts")}><EnvelopeSimple size={22} /><span><strong>Contact school</strong><small>Teachers & office directory</small></span></button></div></section>
            <section className="hub-notice-list"><div className="hub-card-heading"><div><p className="hub-eyebrow">Latest updates</p><h2>Notices for your family</h2></div><button type="button" onClick={() => setActiveSection("Notices")}>View all notices</button></div>{parentNotices.slice(1).map((notice) => <article key={notice.title}><time>{notice.date}</time><div><span>{notice.tag}</span><h3>{notice.title}</h3><p>{notice.detail}</p></div><ArrowRight size={19} /></article>)}</section>
          </> : <HubSection section={activeSection} onDashboard={() => setActiveSection("Dashboard")} onAbsence={() => { setAbsenceSent(false); setAbsenceOpen(true); }} onCalendar={addCalendarEvent} />}
        </main>
      </div>
      {absenceOpen && <div className="hub-modal-backdrop"><section className="hub-form-modal" role="dialog" aria-modal="true" aria-labelledby="absence-title"><button className="modal-close" type="button" onClick={() => setAbsenceOpen(false)} aria-label="Close"><X size={21} /></button>{absenceSent ? <div className="absence-success"><CheckCircle size={38} weight="fill" /><h2 id="absence-title">Absence notice sent</h2><p>The class teacher and school office have been notified.</p><button className="hub-primary" type="button" onClick={() => setAbsenceOpen(false)}>Return to dashboard</button></div> : <><p className="hub-eyebrow">Forms Centre</p><h2 id="absence-title">Submit an absence notice</h2><p>Let Aarav’s class teacher know as early as you can.</p><form onSubmit={(event) => { event.preventDefault(); setAbsenceSent(true); }}><label>Date of absence<input type="date" required /></label><label>Reason<select required defaultValue=""><option value="" disabled>Select a reason</option><option>Unwell</option><option>Medical appointment</option><option>Family matter</option><option>Other</option></select></label><label>Additional note<textarea rows="3" placeholder="Optional details for the class teacher" /></label><button className="hub-primary" type="submit">Send absence notice <ArrowRight size={17} /></button></form></>}</section></div>}
    </div>
  );
}

function HubSection({ section, onDashboard, onAbsence, onCalendar }) {
  const copy = {
    Notices: ["Notices & announcements", "School-wide and class updates, most recent first."], Calendar: ["School calendar", "Academic dates, events, seva days and parent meetings in one place."], "Forms & documents": ["Forms Centre", "Submit practical requests and find documents for the school year."], "Parent essentials": ["Parent essentials", "Everything families need for smooth school days."], "Class page": ["Year 3 Amanah", "Weekly learning, homework and messages from the class teacher."], Contacts: ["Contacts", "The right person to speak with, when you need help."],
  };
  const [title, subtitle] = copy[section];
  return <section className="hub-section-page"><button type="button" className="back-dashboard" onClick={onDashboard}>← Dashboard</button><p className="hub-eyebrow">Parent Hub</p><h1>{title}</h1><p className="section-subtitle">{subtitle}</p><div className="section-placeholder">{section === "Forms & documents" ? <><h2>Make a request</h2><button className="hub-primary" type="button" onClick={onAbsence}>Submit absence notice <ArrowRight size={17} /></button><h2>Downloads</h2><p>School handbook · Uniform guide · Term calendar · Arrival & dismissal procedures</p></> : section === "Calendar" ? <><div className="calendar-filter"><span>Showing</span><button type="button">All</button><button type="button">Academic</button><button type="button">Events</button><button type="button">Seva</button><button type="button">Holidays</button></div><div className="hub-calendar-list">{parentEvents.map(([day, month, event, time]) => <article key={event}><time><strong>{day}</strong><span>{month}</span></time><div><h2>{event}</h2><p>{time}</p></div><button type="button" onClick={() => onCalendar(event, `${day} ${month}`)}>Add to calendar</button></article>)}</div></> : section === "Contacts" ? <><h2>School contacts</h2><p><strong>Class teacher</strong><br />Ms. Kavitha · Year 3 Amanah<br />class3@srss.edu.my</p><p><strong>School office</strong><br />+60 12-600 1926 · saischoolpuchong@gmail.com</p></> : <><h2>Coming into focus</h2><p>This prototype provides the dashboard workflow; this page is ready for the relevant school content and integrations.</p></>}</div></section>;
}

export function App() {
  const [hubRoute, setHubRoute] = useState(() => window.location.pathname.startsWith("/parent-hub") ? window.location.pathname : null);
  const [isAbout, setIsAbout] = useState(() => window.location.hash === "#about" || window.location.pathname.startsWith("/about"));
  const [adminOpen, setAdminOpen] = useState(() => window.location.pathname === "/admin" || window.location.hash === "#admin");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeValue, setActiveValue] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryPaused, setGalleryPaused] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [statCounts, setStatCounts] = useState({ years: 0, values: 0 });
  const glanceRef = useRef(null);
  const [activeLearning, setActiveLearning] = useState(0);
  const [activeHub, setActiveHub] = useState(0);
  const [activeNews, setActiveNews] = useState("All");
  const [openFaq, setOpenFaq] = useState(null);
  const [enquirySent, setEnquirySent] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [formError, setFormError] = useState("");
  const [managedContent, setManagedContent] = useState({
    news: newsItems.map(([category, title, date, image], index) => ({ id: `fallback-news-${index}`, category, title, date: `2026-${date.slice(3, 6) === "Jul" ? "07" : "07"}-${date.slice(0, 2)}`, image })),
    events: events.map(([date, title, category, time], index) => ({ id: `fallback-event-${index}`, date: `2026-${date.endsWith("JUL") ? "07" : "08"}-${date.slice(0, 2)}`, title, category, time })),
    about: defaultAboutContent,
    homepage: defaultHomepageContent,
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
    const handleRoute = () => setHubRoute(window.location.pathname.startsWith("/parent-hub") ? window.location.pathname : null);
    window.addEventListener("popstate", handleRoute);
    return () => window.removeEventListener("popstate", handleRoute);
  }, []);

  useEffect(() => {
    const handleRouteChange = () => { setIsAbout(window.location.hash === "#about" || window.location.pathname.startsWith("/about")); setAdminOpen(window.location.pathname === "/admin" || window.location.hash === "#admin"); };
    window.addEventListener("hashchange", handleRouteChange); window.addEventListener("popstate", handleRouteChange);
    return () => { window.removeEventListener("hashchange", handleRouteChange); window.removeEventListener("popstate", handleRouteChange); };
  }, []);

  useEffect(() => { fetch("/api/content").then((response) => response.ok ? response.json() : null).then((data) => { if (data) setManagedContent((current) => ({ ...current, ...data, homepage: { ...current.homepage, ...(data.homepage || {}) } })); }).catch(() => {}); }, []);

  useEffect(() => { const target = window.location.hash.slice(1); if (target && target !== "about" && target !== "admin") window.setTimeout(() => document.getElementById(target)?.scrollIntoView(), 0); }, [isAbout, adminOpen]);

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

  const openParentHub = (path = "/parent-hub") => {
    window.history.pushState({}, "", path);
    setHubRoute(path);
    window.scrollTo(0, 0);
  };

  const exitParentHub = () => {
    window.history.pushState({}, "", "/");
    setHubRoute(null);
    window.scrollTo(0, 0);
  };

  if (hubRoute) return <ParentHubSystem route={hubRoute} onExit={exitParentHub} />;
  if (adminOpen) return <AdminHub onExit={() => { window.history.pushState({}, "", "/"); setAdminOpen(false); }} />;

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
            <a href="#school-life">View all updates <ArrowRight size={15} weight="bold" /></a>
          </div>
        </div>

        <div className="main-nav">
          <div className="header-wrap nav-inner">
            <a className="brand" href="#top" aria-label="SRSS home">
              <img src="./assets/srss-logo.png" alt="Sekolah Rendah Sathya Sai logo" />
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
              <button className="parent-link" type="button" onClick={() => openParentHub()}>Parent Hub</button>
              <a className="admissions-button" href="#admissions">Admissions &amp; Visits</a>
              <button className="mobile-menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation">{menuOpen ? <X size={25} /> : <List size={25} />}</button>
            </div>
          </div>

          {menuOpen && (
            <nav className="mobile-nav" aria-label="Mobile navigation">
              {navItems.map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
              <button type="button" onClick={() => { setMenuOpen(false); openParentHub(); }}>Parent Hub</button>
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

      {isAbout ? <AboutPage content={managedContent.about} onVisit={() => { setSent(false); setVisitOpen(true); }} /> : <main id="main">
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
          <img className="hero-image" src="./assets/srss-hero-learning.png" alt="Teacher and pupils reading together in SRSS uniform" />
        </section>

        <section className="role-router" aria-labelledby="role-router-title">
          <div className="role-router-heading"><p className="eyebrow">Find your way</p><h2 id="role-router-title">I am a…</h2></div>
          <div className="role-router-grid">{roleRoutes.map(([label, copy, target, Icon]) => target === "parent" ? <button key={label} type="button" className="role-card" onClick={() => setParentHubOpen(true)}><Icon size={25} weight="duotone" /><span><strong>{label}</strong><small>{copy}</small></span><ArrowRight size={17} /></button> : <a key={label} className="role-card" href={target}><Icon size={25} weight="duotone" /><span><strong>{label}</strong><small>{copy}</small></span><ArrowRight size={17} /></a>)}</div>
        </section>

        <section className="purpose-section" id="purpose" aria-labelledby="purpose-title">
          <p className="eyebrow">Our purpose</p>
          <h2 id="purpose-title">Learning that reaches <em>beyond the classroom.</em></h2>
          <p>Sekolah Rendah Sathya Sai is a values-based learning community where academic excellence meets character development. Rooted in the timeless principles of Truth, Right Conduct, Peace, Love, and Nonviolence, we empower every child to realise their highest potential and become a positive force for humanity.</p>
        </section>

        <section className="glance-section" ref={glanceRef} aria-labelledby="glance-title">
          <div className="section-intro glance-heading"><p className="eyebrow">School at a glance</p><h2 id="glance-title">A quarter-century of <em>purposeful learning.</em></h2></div>
          <div className="glance-grid"><article><strong>{statCounts.years}</strong><span>Years</span><p>Serving families since 2002</p></article><article><strong>{managedContent.homepage?.stats?.students || "Year 1–6"}</strong><span>Students</span><p>A close-knit primary community</p></article><article><strong>{statCounts.values}</strong><span>Human Values</span><p>One foundation for daily life</p></article><article className="motto-stat"><strong>“{managedContent.homepage?.stats?.motto || defaultHomepageContent.stats.motto}”</strong><span>School motto</span><p>Learning with mind, heart and hands</p></article></div>
        </section>

        <section className="why-section" aria-labelledby="why-title"><div className="why-heading"><p className="eyebrow">Why SRSS</p><h2 id="why-title">Learning with depth. <em>Growing with purpose.</em></h2><p>SRSS brings academic confidence and character formation into one connected school experience.</p></div><div className="why-grid">{whySrss.map(([Icon, title, copy]) => <article key={title}><Icon size={29} weight="duotone" /><h3>{title}</h3><p>{copy}</p></article>)}</div><div className="why-links"><a href="#about">About SRSS <ArrowRight size={16} /></a><a href="#learning">Explore the learning experience <ArrowRight size={16} /></a></div></section>

        <section className="principal-section" aria-labelledby="principal-title"><figure><img src={managedContent.homepage?.principal?.image || defaultHomepageContent.principal.image} alt="An SRSS teacher reading with pupils" /></figure><div><p className="eyebrow">Message from the Principal</p><Quotes size={34} weight="duotone" aria-hidden="true" /><blockquote id="principal-title">“{managedContent.homepage?.principal?.quote || defaultHomepageContent.principal.quote}”</blockquote><p>{managedContent.homepage?.principal?.message || defaultHomepageContent.principal.message}</p><a href="#about">Read the Principal’s message <ArrowRight size={17} /></a></div></section>

        <section className="values-garden" id="values" aria-labelledby="garden-title">
          <div className="section-intro">
            <p className="eyebrow">The Values Garden</p>
            <h2 id="garden-title">What we nurture <em>takes root for life.</em></h2>
            <p>Select a petal to see how each human value becomes part of everyday school life.</p>
          </div>
          <div className="values-flower" role="group" aria-label="The five human values">
              <img src="./assets/values-flower.svg" alt="" aria-hidden="true" />
              {values.map((value, index) => (
                <button
                  key={value.name}
                  type="button"
                  className={`value-petal petal-${index + 1} ${value.className} ${activeValue === index ? "active" : ""}`}
                  aria-pressed={activeValue === index}
                  aria-controls="value-description"
                  onClick={() => setActiveValue(index)}
                >
                  {value.name}
                </button>
              ))}
            <article className={`value-description ${values[activeValue].className}`} id="value-description" aria-live="polite">
              <span>Human value</span>
              <h3>{values[activeValue].name}</h3>
              <p>{values[activeValue].description}</p>
            </article>
          </div>
        </section>

        <section className="life-section" id="school-life" aria-labelledby="life-title" onMouseEnter={() => setGalleryPaused(true)} onMouseLeave={() => setGalleryPaused(false)} onFocusCapture={() => setGalleryPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setGalleryPaused(false); }}>
          <div className="section-head-row">
            <div>
              <p className="eyebrow">Life at SRSS</p>
              <h2 id="life-title">Small moments. <em>Lasting roots.</em></h2>
            </div>
            <div className="carousel-controls" aria-label="Gallery controls">
              <button type="button" onClick={() => setGalleryIndex((galleryIndex - 1 + galleryItems.length) % galleryItems.length)} aria-label="Previous gallery images"><CaretLeft size={21} /></button>
              <span>{String(galleryIndex + 1).padStart(2, "0")} / {String(galleryItems.length).padStart(2, "0")}</span>
              <button type="button" onClick={() => setGalleryIndex((galleryIndex + 1) % galleryItems.length)} aria-label="Next gallery images"><CaretRight size={21} /></button>
              <small>{galleryPaused ? "Paused" : "Auto"}</small>
            </div>
          </div>
          <div className="gallery-grid" aria-live="polite">
            {visibleGallery.map(([src, title, alt], index) => (
              <figure key={`${src}-${galleryIndex}`} className={index === 0 ? "featured" : ""}>
                <img src={src} alt={alt} />
                <figcaption><span>{title}</span><small>SRSS school life</small></figcaption>
              </figure>
            ))}
          </div>
          <a className="source-link" href="https://www.facebook.com/SSPSM/" target="_blank" rel="noreferrer">See more school moments on Facebook <ArrowRight size={17} /></a>
        </section>

        <section className="learning-experience" id="learning" aria-labelledby="learning-title">
          <div className="learning-visual"><img src="./assets/srss-learning-strip.png" alt="Pupils exploring science, design and nature" /></div>
          <div className="learning-content">
            <p className="eyebrow">Learning experience</p>
            <h2 id="learning-title">Strong foundations. <em>Open hearts.</em></h2>
            <p className="learning-summary">Sekolah Rendah Sathya Sai is a private primary school that integrates Malaysia’s national curriculum with the philosophy of Sathya Sai Educare. We believe education should develop both intellect and character, empowering children to lead with excellence, compassion, integrity, and purpose.</p>
            <div className="learning-tabs" role="tablist" aria-label="Learning experience themes">
              {learningTabs.map(([label], index) => (
                <button key={label} type="button" role="tab" aria-selected={activeLearning === index} aria-controls="learning-panel" onClick={() => setActiveLearning(index)}>{label}</button>
              ))}
            </div>
            <div className="learning-panel" id="learning-panel" role="tabpanel" aria-live="polite">
              <h3>{learningTabs[activeLearning][0]}</h3>
              <p>{learningTabs[activeLearning][1]}</p>
            </div>
          </div>
        </section>

        <section className="hubs-section" id="hubs" aria-labelledby="hubs-title">
          <div className="section-intro">
            <p className="eyebrow">One school, many doors</p>
            <h2 id="hubs-title">A home base for our <em>whole community.</em></h2>
          </div>
          <div className="hub-tabs" role="tablist" aria-label="SRSS community hubs">
            {hubs.map(([label], index) => <button key={label} type="button" role="tab" aria-selected={activeHub === index} aria-controls="hub-panel" onClick={() => setActiveHub(index)}>{label}</button>)}
          </div>
          <article className="hub-panel" id="hub-panel" role="tabpanel" aria-live="polite">
            <div><span>0{activeHub + 1}</span><h3>{hubs[activeHub][0]}</h3></div>
            <p>{hubs[activeHub][1]}</p>
            <a href={hubs[activeHub][2]} onClick={(event) => { if (activeHub === 0) { event.preventDefault(); openParentHub(); } }}>Open {hubs[activeHub][0]} <ArrowRight size={18} /></a>
          </article>
        </section>

        <section className="essentials-section" id="parents">
          <div className="essentials-copy">
            <p className="eyebrow">A connected school community</p>
            <h2>Everything families need, in one calm place.</h2>
            <p>Find essential dates, forms, learning links and guidance without losing sight of what matters most: every child’s growth.</p>
          </div>
          <div className="essentials-list">
            <button type="button" onClick={() => openParentHub()}><CalendarBlank size={23} /><span><strong>Open Parent Hub</strong><small>Notices, calendar, forms and class updates</small></span><ArrowRight size={19} /></button>
            <button type="button" id="students" onClick={() => openParentHub()}><span className="list-index">02</span><span><strong>Student and family hub</strong><small>Learning resources, forms and notices</small></span><ArrowRight size={19} /></button>
            <span id="teachers" className="anchor-target" />
          </div>
        </section>

        <section className="page-hero admissions-hero" id="admissions" aria-labelledby="admissions-title">
          <div>
            <p className="eyebrow">Admissions / enquiries</p>
            <h2 id="admissions-title">Begin the <em>Journey.</em></h2>
            <p>We would be glad to meet your family, answer your questions and help you discover whether SRSS is the right place for your child to grow.</p>
            <a className="primary-button" href="#enquiry">Make an enquiry <ArrowRight size={18} weight="bold" /></a>
          </div>
          <img src="./assets/photos/processed/student-speaker-960.jpg" alt="An SRSS pupil confidently speaking during a school activity" />
        </section>

        <section className="admissions-intro" aria-label="Who we serve and our admission approach">
          <article><p className="eyebrow">Who we serve</p><h2>Primary years <em>1–6.</em></h2><p>SRSS welcomes primary-age children and families who are looking for a thoughtful, values-based learning community. We invite families from all backgrounds who share this approach to education.</p></article>
          <article><p className="eyebrow">Our approach</p><h2>Belonging begins <em>with shared values.</em></h2><p>We look beyond a child’s academic record alone. Our admissions process is a warm conversation about readiness, learning needs and the values that matter to your family.</p></article>
        </section>

        <section className="process-section" aria-labelledby="process-title">
          <div className="section-intro"><p className="eyebrow">A clear next step</p><h2 id="process-title">Your admissions <em>pathway.</em></h2><p>Our team will guide you with care at every stage.</p></div>
          <ol className="admission-steps">{admissionSteps.map((step, index) => <li key={step}><span>0{index + 1}</span><strong>{step}</strong></li>)}</ol>
        </section>

        <section className="enquiry-section" id="enquiry" aria-labelledby="enquiry-title">
          <div className="form-intro"><p className="eyebrow">Start here</p><h2 id="enquiry-title">Tell us about <em>your family.</em></h2><p>Your enquiry goes directly to the SRSS Admin Hub. We will be in touch with a thoughtful next step.</p><div className="visit-note"><CalendarBlank size={20} /><span><strong>Visit the school</strong>Arrange a personalised visit or join our next open morning on 25 July 2026.</span></div></div>
          {enquirySent ? <div className="form-success"><CheckCircle size={38} weight="duotone" /><h3>Your enquiry is on its way.</h3><p>Thank you. The admissions team will contact you shortly.</p></div> : <form className="school-form" onSubmit={async (event) => { event.preventDefault(); setFormError(""); const payload = Object.fromEntries(new FormData(event.currentTarget)); try { const response = await fetch("/api/enquiries", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setEnquirySent(true); } catch (reason) { setFormError(reason.message || "Your enquiry could not be sent. Please try again."); } }}>
            <label>Parent / guardian name<input required name="parentName" autoComplete="name" /></label><label>Email address<input required name="email" type="email" autoComplete="email" /></label>
            <label>Child’s name<input required name="childName" /></label><label>Child’s age<select required name="childAge" defaultValue=""><option value="" disabled>Select age</option>{[5,6,7,8,9,10,11,12].map(age => <option key={age}>{age}</option>)}</select></label>
            <label>Current school<input name="currentSchool" /></label><label>How did you hear about SRSS?<select name="referralSource" defaultValue=""><option value="" disabled>Select one</option><option>Family or friend</option><option>Social media</option><option>School event</option><option>Online search</option><option>Other</option></select></label>
            <label className="wide-label">Questions or anything you would like us to know<textarea name="questions" rows="4" /></label>{formError && <p className="form-error wide-label">{formError}</p>}<button className="primary-button" type="submit">Send enquiry <ArrowRight size={18} weight="bold" /></button>
          </form>}
        </section>

        <section className="info-grid" aria-label="Fees and prospectus information">
          <article><GraduationCap size={30} weight="duotone" /><p className="eyebrow">Fees & financial information</p><h3>Clarity for every family.</h3><p>Our admissions team can share the current fee structure, payment schedule and information about available financial assistance.</p><a href="mailto:saischoolpuchong@gmail.com?subject=Fee%20enquiry">Request fee information <ArrowRight size={16} /></a></article>
          <article><Plus size={30} weight="duotone" /><p className="eyebrow">Prospectus</p><h3>Keep SRSS close at hand.</h3><p>Download our prospectus for an introduction to our learning approach, values and school community.</p><a href="#contact">Request the prospectus <ArrowRight size={16} /></a></article>
        </section>

        <section className="faq-section" id="faq" aria-labelledby="faq-title"><div><p className="eyebrow">Helpful answers</p><h2 id="faq-title">Questions, <em>welcomed.</em></h2></div><div className="faq-list">{faqs.map(([question, answer], index) => <article key={question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}>{question}<Plus size={19} className={openFaq === index ? "turned" : ""} /></button>{openFaq === index && <p>{answer}</p>}</article>)}</div></section>

        <section className="news-hero" id="news" aria-labelledby="news-title"><p className="eyebrow">News & events</p><h2 id="news-title">Stories &amp; <em>Happenings.</em></h2><p>Moments of learning, service and celebration from the SRSS community.</p></section>
        <section className="news-section" aria-label="Latest news">
          <div className="news-head"><h3>Latest news &amp; events</h3><a href="#news">View all updates <ArrowRight size={16} /></a></div>
          <div className="news-grid home-news-grid">{homepageCards.map((item) => <article key={`${item.type}-${item.id}`}><img src={item.image || "./assets/photos/processed/classroom-art-1280.jpg"} alt="" /><div><span><item.Icon size={15} />{item.type}</span><time>{new Date(`${item.date}T12:00:00`).toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" })}</time><h3>{item.title}</h3><p>{item.excerpt}</p><a href="#news">Read more <ArrowRight size={15} /></a></div></article>)}</div>
        </section>
        <section className="events-section" aria-labelledby="events-title"><div><p className="eyebrow">Mark your calendar</p><h2 id="events-title">Upcoming <em>togetherness.</em></h2><p>Join in the academic, cultural, seva and community life of our school.</p></div><div className="event-list">{managedContent.events.map((item) => <article key={item.id}><time>{new Date(`${item.date}T12:00:00`).toLocaleDateString("en-MY", { day: "2-digit", month: "short" }).toUpperCase()}</time><div><span>{item.category}</span><h3>{item.title}</h3><p><Clock size={14} /> {item.time}</p></div><button type="button" onClick={() => addToCalendar(item.title, item.date)} aria-label={`Add ${item.title} to calendar`}><CalendarBlank size={20} /></button></article>)}</div></section>
        <section className="anniversary-section"><img src="./assets/brand/originals/srss-25-anniversary-mark.png" alt="SRSS 25th anniversary mark" /><div><p className="eyebrow">2002–2027</p><h2>{managedContent.homepage?.anniversary?.title || defaultHomepageContent.anniversary.title}</h2><p>{managedContent.homepage?.anniversary?.description || defaultHomepageContent.anniversary.description}</p><div className="anniversary-timeline"><span><strong>2002</strong>First cohort</span><span><strong>2012</strong>A growing community</span><span><strong>2027</strong>25th anniversary</span></div><a href="#news">Explore the anniversary story <ArrowRight size={17} /></a></div></section>
        <section className="community-strip" aria-label="Community, achievements and newsletter"><article><Heart size={28} weight="duotone" /><p className="eyebrow">Seva & community</p><h3>Small hands, meaningful service.</h3><p>Find upcoming seva opportunities and ways families can contribute to the wider community.</p><a href="#contact">Volunteer with SRSS <ArrowRight size={16} /></a></article><article><Sparkle size={28} weight="duotone" /><p className="eyebrow">Student achievements</p><h3>Every effort has a story.</h3><p>Discover academic, co-curricular and values-led achievements from across our school.</p><a href="#news">Celebrate with us <ArrowRight size={16} /></a></article><article><BookOpen size={28} weight="duotone" /><p className="eyebrow">Newsletter archive</p><h3>Keep up with each term.</h3><p>Read school news, learning highlights and family updates in our newsletter archive.</p><a href="#contact">Request newsletters <ArrowRight size={16} /></a></article></section>

        <section className="page-hero contact-hero" id="contact" aria-labelledby="contact-title"><div><p className="eyebrow">Contact</p><h2 id="contact-title">Get in <em>Touch.</em></h2><p>Whether you have a question, wish to visit, or want to connect with a particular department, the right person is close by.</p></div><img src="./assets/photos/processed/assembly-achievements-1280.jpg" alt="SRSS pupils gathered at a school assembly" /></section>
        <section className="contact-section"><div className="key-contacts"><p className="eyebrow">Key contacts</p><h2>Here to <em>help.</em></h2><article><strong>School office</strong><a href="tel:+60126001926"><Phone size={16} /> +60 12-600 1926</a><a href="mailto:saischoolpuchong@gmail.com"><EnvelopeSimple size={16} /> saischoolpuchong@gmail.com</a></article><article><strong>Admissions</strong><a href="mailto:saischoolpuchong@gmail.com?subject=Admissions%20enquiry"><EnvelopeSimple size={16} /> Admissions enquiries</a></article><article><strong>Office hours</strong><span>Monday–Friday · 8.00 am–4.00 pm<br />School hours · 7.30 am–1.30 pm</span></article></div>
          {contactSent ? <div className="form-success"><CheckCircle size={38} weight="duotone" /><h3>Thank you for writing.</h3><p>We will route your message to the right team.</p></div> : <form className="school-form contact-form" onSubmit={async (event) => { event.preventDefault(); setFormError(""); try { const response = await fetch("/api/messages", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setContactSent(true); } catch (reason) { setFormError(reason.message || "Your message could not be sent. Please try again."); } }}><label>Name<input required name="name" autoComplete="name" /></label><label>Email<input required name="email" type="email" autoComplete="email" /></label><label className="wide-label">Subject<select required name="subject" defaultValue=""><option value="" disabled>Select a subject</option><option>General</option><option>Admissions</option><option>Feedback</option><option>Other</option></select></label><label className="wide-label">Message<textarea required name="message" rows="5" /></label>{formError && <p className="form-error wide-label">{formError}</p>}<button className="primary-button" type="submit">Send message <ArrowRight size={18} weight="bold" /></button></form>}</section>
        <section className="location-section"><div><p className="eyebrow">Visit SRSS</p><h2>Find your way <em>here.</em></h2><address><MapPin size={20} />6, Jalan Puchong, Taman Tan Yew Lai,<br />58200 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur</address><p>Visitor parking is available by arrangement. Please contact the office before your visit.</p><a href="https://maps.google.com/?q=6+Jalan+Puchong+Taman+Tan+Yew+Lai+58200+Kuala+Lumpur" target="_blank" rel="noreferrer">Get directions <ArrowRight size={17} /></a><a className="social-link" href="https://www.facebook.com/SSPSM/" target="_blank" rel="noreferrer"><FacebookLogo size={19} /> Follow school life on Facebook</a></div><iframe title="Map showing Sekolah Rendah Sathya Sai" src="https://www.google.com/maps?q=6%20Jalan%20Puchong%20Taman%20Tan%20Yew%20Lai%2058200%20Kuala%20Lumpur&output=embed" loading="lazy" /></section>
      </main>}

      <footer id="community">
        <div className="footer-inner">
          <div className="footer-about">
            <div className="footer-brand">
              <img src="./assets/srss-logo.png" alt="" />
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
            <a href="#top">Home</a>
            <a href="/about#about">About SRSS</a>
            <button type="button" onClick={() => openParentHub()}>Parents Hub</button>
            <a href="#students">Students Hub</a>
            <a href="#teachers">Teachers Hub</a>
            <a href="#learning">Resources</a>
            <a href="#faq">FAQ</a>
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
