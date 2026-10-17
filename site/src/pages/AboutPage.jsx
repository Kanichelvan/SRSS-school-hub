import { useEffect, useRef, useState } from 'react';
import { BookOpen } from '@phosphor-icons/react/dist/csr/BookOpen';
import { Heart } from '@phosphor-icons/react/dist/csr/Heart';
import { HandsClapping } from '@phosphor-icons/react/dist/csr/HandsClapping';
import { CalendarBlank } from '@phosphor-icons/react/dist/csr/CalendarBlank';
import { ChatCircle } from '@phosphor-icons/react/dist/csr/ChatCircle';
import HeroPhoto, { HERO_PHOTOS } from '../components/HeroPhoto.jsx';
import { FaqList, FAQ_TOPICS } from '../components/Faq.jsx';
import { LearningSpaces } from './SitePages.jsx';
import { srssVoices } from '../data/voices.js';
import './about-experience.css';

const pillars = [
  [BookOpen, 'Academic Excellence', 'Head', 'Rooted in Malaysia’s national curriculum, SRSS shapes confident learners with a global outlook. Children learn to question, think critically and apply what they know, with support tailored to each learner’s strengths and pace.'],
  [Heart, 'Character Development', 'Heart', 'Truth, Right Conduct, Peace, Love and Nonviolence guide all learning and relationships. Practised daily through choices, reflection and service, they help children grow in integrity, compassion and the inner strength to persevere.'],
  [HandsClapping, 'Holistic Empowerment', 'Hands', 'Clear thinking, compassionate character and purposeful action grow together. Through service, creativity, movement and care for the environment, children learn to honour Malaysia’s diversity and contribute meaningfully to the wider human family.'],
];
const aims = [
  ['A joyful learner', [
    ['Nurturing a Joy for Learning', 'A caring, welcoming place where children feel happy, secure and ready to learn.'],
    ['Building Courage Through Growth', 'Mistakes are stepping stones; new challenges are met with confidence and growing independence.'],
    ['Igniting Curiosity', 'A creative, stimulating curriculum that builds a thirst for knowledge.'],
    ['Developing Life Skills', 'Resilience, independence, collaboration, problem-solving and creativity.'],
  ]],
  ['Every child counts', [
    ['Removing Barriers to Success', 'We find and remove obstacles so every learner can reach their fullest potential.'],
    ['Honouring Every Individual', 'Each child’s specific needs, met with care and intention.'],
    ['Giving Every Child a Voice', 'Pupils contribute to school life and take ownership of their learning.'],
  ]],
  ['Heart and character', [
    ['Cultivating Respect and Wellbeing', 'Respect for self and others, and positive choices for health and wellbeing.'],
    ['Nurturing Moral and Spiritual Growth', 'For all, honouring every person regardless of colour, creed or belief.'],
  ]],
  ['Growing together', [
    ['Partnering with Parents', 'Strong home–school bonds, with parents as “Partners in Learning”.'],
    ['Building Community Connections', 'Active, engaged citizens in a diverse world.'],
  ]],
];
const values = [
  ['Truth', 'Honesty in thought, word and action.'], ['Right Conduct', 'Doing what is right, even when no one is watching.'],
  ['Peace', 'Calm, harmony and inner strength.'], ['Love', 'Compassion, kindness and care for all.'], ['Nonviolence', 'Resolving conflict with respect and understanding.'],
];
function Expand({ id, label = 'Read more', children }) {
  const [open, setOpen] = useState(false);
  return <><button className="about-expand" type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{open ? 'Show less' : label}<span aria-hidden="true">{open ? '−' : '+'}</span></button><div className={`about-expansion${open ? ' is-open' : ''}`} id={id} inert={!open}><div><div className="about-expansion-copy">{children}</div></div></div></>;
}
function PrincipalWelcome() {
  const voice = srssVoices[0];
  const [open,setOpen]=useState(false);
  // The welcome is for the 2027 school year, SRSS's 25th year since opening in 2002.
  const years = Math.max(2027, new Date().getFullYear()) - 2002;
  return <article className="about-principal" id="principal-welcome"><p className="eyebrow">A welcome from our Principal</p><div className="principal-card-layout"><div className="principal-quote-column"><span className="principal-quote-mark" aria-hidden="true">“</span><blockquote>“{voice.excerpt}”</blockquote><div className="principal-person"><img src={voice.image} alt={voice.alt} width="72" height="72" loading="lazy"/><p><strong>{voice.name}</strong><span>SRSS Principal 2026</span></p></div></div><div className="principal-stat-column"><div className="principal-stat"><strong>{years}+<span>years</span></strong><p>Learning with love,<br/>leading with character.<small>2002–2027 · our Silver Jubilee</small></p></div><button className="about-expand" type="button" aria-expanded={open} aria-controls="principal-message" onClick={()=>setOpen(!open)}>{open?'Show less':'Welcome to SRSS'}<span aria-hidden="true">{open?'−':'+'}</span></button></div></div><div className={`about-expansion${open?' is-open':''}`} id="principal-message" inert={!open}><div><div className="about-expansion-copy"><div className="principal-new-year"><p>{voice.salutation}</p><p>{voice.introduction[0]}</p></div>{voice.introduction.filter(p => p.startsWith('The year 2002')).map(p => <p key={p}>{p}</p>)}{voice.sections.map((section,i) => <section key={i}><h3>{section.title}</h3>{section.paragraphs?.map(p => <p key={p}>{p}</p>)}{section.bullets && <ul>{section.bullets.map(([lead,body]) => <li key={lead}><strong>{lead}</strong> {body}</li>)}</ul>}</section>)}<p>{voice.signoff}<br/><strong>{voice.name}</strong></p></div></div></div></article>;
}
function AimLeaf({name,copy}) {
  const [pinned,setPinned]=useState(false), [hover,setHover]=useState(false), [focus,setFocus]=useState(false);
  return <details className="aim-leaf" open={pinned || hover || focus} onPointerEnter={e=>{if(e.pointerType==='mouse')setHover(true);}} onPointerLeave={()=>setHover(false)} onFocusCapture={e=>setFocus(e.target.matches(':focus-visible'))} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocus(false);}}><summary onClick={e=>{e.preventDefault();setPinned(!pinned);}}>{name}</summary><p>{copy}</p></details>;
}
function AimBranch({title,leaves}) {
  const [desktop,setDesktop] = useState(() => window.matchMedia('(min-width:901px)').matches);
  useEffect(() => {const mq=window.matchMedia('(min-width:901px)'); const update=()=>setDesktop(mq.matches); mq.addEventListener('change',update); return ()=>mq.removeEventListener('change',update);},[]);
  return <details className="aims-branch" open={desktop || undefined}><summary onClick={e => {if(desktop)e.preventDefault();}}>{title}</summary><ul>{leaves.map(([name,copy]) => <li key={name}><AimLeaf name={name} copy={copy}/></li>)}</ul></details>;
}
function Purpose() {
  return <section className="about-purpose-band" id="vision-mission"><div className="about-inner about-purpose-grid">
    <article className="about-purpose-card purpose-crown" id="purpose"><p className="eyebrow">Our purpose</p><h2>Human Excellence,<br/><em>life lived with purpose.</em></h2><Expand id="purpose-more"><h3>Why we exist</h3><p>Every child carries within them the seed of greatness. Education, for us, is not about filling minds with facts — it is about awakening the whole person. Every lesson, every relationship and every moment at SRSS is a chance for a child to grow into the best version of themselves.</p><h3>Our educational philosophy</h3><p>We provide a broad and balanced education grounded in Sai Educare principles, nurturing the skills, abilities, attitudes and values of the whole child.</p></Expand></article>
    <article className="about-purpose-card" id="vision"><p className="eyebrow">Our vision</p><h2>Where are we going?</h2><p>We empower the mind, body and spirit of every young person to rise to their full potential — so that each child may lead a healthy, productive and meaningful life of excellence.</p><p className="vision-promise">Our vision is a promise — no child leaves SRSS without being seen, valued and challenged to grow.</p></article>
    <article className="about-purpose-card" id="mission"><p className="eyebrow">Our mission</p><h2>How do we get there?</h2><p>Every child is special, with their own needs and abilities. So we foster an environment that delivers the best possible education.</p><Expand id="mission-more"><p>We help every child grow in three essential dimensions:</p><div className="about-pillar-tiles">{pillars.map(([Icon,title,part,body]) => <article key={part}><Icon size={27} aria-hidden="true"/><p className="eyebrow">{part}</p><h3>{title}</h3><p>{body}</p></article>)}</div></Expand></article>
    <article className="about-purpose-card aims-card" id="aims"><p className="eyebrow">Our aims</p><h2>What does that look like day to day?</h2><p>We equip every learner with the skills, experiences and confidence to thrive. Through purposeful activities in a safe, supportive and inclusive environment, we encourage every child to become the best they can be.</p><Expand id="aims-more"><div className="aims-map"><p className="aims-centre">As a school community,<br/><strong>we are committed to…</strong></p><div className="aims-branches">{aims.map(([title,leaves]) => <AimBranch key={title} title={title} leaves={leaves}/>)}</div></div></Expand></article>
    <article className="about-purpose-card" id="values"><p className="eyebrow">Our values</p><h2>What guides every choice we make</h2><p>Five universal values form the roots of everything we do.</p><div className="about-value-chips">{values.map(([name,copy],i) => <details key={name} style={{'--value-colour': ['#f49c99','#99cfff','#d2b5ef','#98d8bd','#fbc291'][i]}}><summary>{name}</summary><p>{copy}</p></details>)}</div><p>These values aren’t taught in isolation — they’re lived daily, in classrooms, on the playground and in the community.</p></article>
  </div></section>;
}
function Framework() {
  const root = useRef(null);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('layer-seen'); observer.unobserve(e.target); } }), {threshold:.15});
    root.current.querySelectorAll('.framework-layer').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  },[]);
  return <section className="about-framework about-inner" ref={root}><p className="eyebrow">Our framework</p><h2>One purpose, flowing into everything we do.</h2><p>Each layer flows from the one above. Our purpose inspires our vision, our vision shapes our mission, and our mission comes to life in our daily aims — all of it rooted in five universal values.</p><nav className="framework-tree" aria-label="How our educational framework connects">
    <a className="framework-layer tree-crown" href="#purpose"><span>Purpose</span><strong>Human Excellence, life lived with purpose</strong></a>
    <a className="framework-layer" href="#vision"><span>Vision</span><strong>Mind, body and spirit rise to their full potential</strong></a>
    <a className="framework-layer" href="#mission"><span>Mission</span><strong>Sai Educare + national curriculum</strong></a>
    <div className="framework-layer tree-pillars">{pillars.map(([Icon,title,part]) => <a href="#mission" key={part}><Icon size={26} aria-hidden="true"/><strong>{title}</strong><span>{part} · {part==='Head'?'think and question':part==='Heart'?'values lived daily':'service and action'}</span></a>)}</div>
    <a className="framework-layer" href="#aims"><span>Aims · 11 daily commitments</span><strong>Joyful learners. Every child counts.<br/>Heart and character. Growing together.</strong></a>
    <a className="framework-layer tree-roots" href="#values"><span>Values · the roots of everything</span><div>{values.map(([name]) => <strong key={name}>{name}</strong>)}</div></a>
  </nav></section>;
}
function Testimonials() {
  const [group,setGroup] = useState('students');
  const groups=['students','parents','teachers','alumnus','volunteers','others'];
  const voice = group==='teachers' ? srssVoices[1] : group==='alumnus' ? srssVoices[2] : null;
  return <section className="about-testimonials about-inner" id="testimonials"><p className="eyebrow">Our community, in their own words</p><h2><em>What {group==='others'?'':'our '}</em>{group} are saying</h2><div className="testimonial-filters" role="group" aria-label="Choose community voices">{groups.map(name => <button key={name} type="button" aria-pressed={group===name} onClick={()=>setGroup(name)}>{name==='alumnus'?'Alumnus':name[0].toUpperCase()+name.slice(1)}</button>)}</div><div className="testimonial-panel" aria-live="polite">{voice ? <figure><blockquote>“{voice.excerpt}”</blockquote><figcaption><img src={voice.image} alt={voice.alt} width="60" height="60" loading="lazy"/><p><strong>{voice.name}</strong><span>{voice.role}</span></p></figcaption><a className="text-link" href={`/about/voices#${voice.id}`}>Read the full message</a></figure> : <div className="voices-awaited"><ChatCircle size={32} aria-hidden="true"/><p>We’re gathering {group==='others'?'more community':group==='alumnus'?'alumni':group.replace(/s$/,'')} voices.</p><p>Published reflections will appear here once they have been shared and approved.</p></div>}</div></section>;
}
export default function AboutPage({ onVisit, content, faqs, jubilee, anchor, onReady }) {
  useEffect(() => {onReady(true); return ()=>onReady(false);},[onReady]);
  useEffect(() => { if (!anchor) return; const frame=requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView()); return ()=>cancelAnimationFrame(frame); },[anchor]);
  const defaultHero = !content?.heroImage || content.heroImage === '/assets/photos/processed/assembly-achievements-1280.jpg';
  return <main id="main" className="about-page about-refresh about-experience">
    <section className="about-hero" id="top"><img className="about-school-sketch" src="/assets/heritage/hero-school-sketch-v2-1536.webp" srcSet="/assets/heritage/hero-school-sketch-v2-640.webp 640w, /assets/heritage/hero-school-sketch-v2-960.webp 960w, /assets/heritage/hero-school-sketch-v2-1536.webp 1536w" sizes="(max-width: 900px) 120vw, 76vw" width="1536" height="1024" alt="" aria-hidden="true" decoding="async"/><div className="about-inner about-hero-grid"><div><p className="eyebrow">ABOUT SRSS · EDUCATION FOR LIFE</p><h1>Education for Life,<br/><em>Not Mere Living.</em></h1><p>Sekolah Rendah Sathya Sai is a Malaysian primary school dedicated to helping every child grow into the fullest and finest expression of who they can become.</p><div className="about-hero-actions"><a className="primary-button" href="#vision-mission">Discover Our Approach →</a><button className="text-button" type="button" onClick={onVisit}>Book a visit →</button></div></div><figure className="about-hero-photo">{defaultHero ? <HeroPhoto image={HERO_PHOTOS.assembly} priority /> : <img src={content.heroImage} alt={content.heroAlt}/>}</figure></div></section>
    <section className="about-welcome-grid about-inner"><PrincipalWelcome/><article className="about-identity" id="who-we-are"><p className="eyebrow">Who we are</p><h2>A school for the mind, heart and character.</h2><p>Sekolah Rendah Sathya Sai is a values-based private primary school in Puchong. We pair Malaysia’s national curriculum with Sai Educare, so children grow in knowledge, kindness and inner strength — together.</p><a className="text-link" href="#vision-mission">Our approach ↓</a></article></section>
    <Purpose/><Framework/>
    <section className="about-educare-community" id="educare"><div className="about-inner"><p className="eyebrow">Sathya Sai Education &amp; Educare</p><h2>Drawing out what is already within.</h2><p>Education provides knowledge from the outside. Educare seeks to draw out the values and human potential already within the child.</p><div className="educare-community-grid"><HeroPhoto image={HERO_PHOTOS.reflection}/><div><h3>It takes a community to educate a child.</h3><p>Teachers, parents and volunteers each bring something essential to a child’s learning. Together, they create the conditions in which confidence, character and capability can flourish.</p><p>Truth, Right Conduct, Peace, Love and Nonviolence grow through lessons, relationships, reflection and service — at school, at home and in our community.</p><a className="text-link" href="/about/sathya-sai-education">Discover Sathya Sai Education</a></div></div></div></section>
    <section className="about-people-invitation about-inner" id="our-people"><p className="eyebrow">Our people</p><h2>Many hands. One school family.</h2><p>Our Board, school leadership, teachers, administrators, support staff, volunteers and Teacher-Parent Association each help every child feel known and encouraged.</p><a className="text-link" href="/about/our-people">Meet the people of SRSS</a></section>
    <LearningSpaces id="campus" eyebrow="Our campus"/>
    {jubilee()}
    <Testimonials/>
    <section className="about-profile about-inner" id="school-profile"><div><p className="eyebrow">School profile</p><h2>SRSS at a glance.</h2><p>Practical information for your family.</p></div><FaqList items={faqs} questions={FAQ_TOPICS.profile} idPrefix="profile"/></section>
    <section className="about-join-community"><div className="about-inner"><h2>Join our community</h2><p>We’d love to welcome you and your child to Sekolah Rendah Sathya Sai.</p><div className="about-next-steps"><article><CalendarBlank size={28} aria-hidden="true"/><h3>Book a visit</h3><p>See our vision in action.</p><button type="button" className="primary-button" onClick={onVisit}>Book a visit</button></article><article><BookOpen size={28} aria-hidden="true"/><h3>Our prospectus</h3><p>Everything you need to know, in one place.</p><span className="prospectus-pending">Prospectus coming soon</span></article><article><ChatCircle size={28} aria-hidden="true"/><h3>Talk to us</h3><p>Our admissions team is happy to answer your questions.</p><a className="text-link" href="/resources/contact">Contact us</a></article></div></div></section>
  </main>;
}
