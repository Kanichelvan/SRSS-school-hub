import { srssVoices } from '../data/voices.js';

function Placeholders({ count, label }) {
  return <div className="people-profile-grid">{Array.from({ length: count }, (_, index) => <article className="people-profile people-profile-pending" key={index}>
    <div className="people-photo-pending" aria-hidden="true"><span>{String(index + 1).padStart(2, '0')}</span><small>Portrait to follow</small></div>
    <div><h3>{label} {String(index + 1).padStart(2, '0')}</h3><p>Name and profile to be added.</p></div>
  </article>)}</div>;
}

export default function OurPeople({ extra }) {
  const leaders = srssVoices.filter(person => ['principal', 'academics'].includes(person.id));
  return <main id="main" className="site-page people-page">
    <section className="landing-hero landing-hero-plain" id="top"><div className="page-inner landing-hero-grid"><div><p className="eyebrow">About SRSS · Our people</p><h1>A community<br/>in service of every child.</h1><div className="landing-hero-copy"><p>Meet the people who govern our school, guide its learning and care for its community.</p></div></div></div></section>
    <nav className="people-section-nav page-inner" aria-label="Our People sections"><a href="#board">Board of Directors / Governors</a><a href="#school-team">School administration &amp; staff</a><a href="#pta">Parent–Teacher Association</a></nav>
    <section className="people-section page-inner" id="board"><header><p className="eyebrow">01 · Governance</p><h2>Board of Directors / Governors</h2><p className="people-entity">Sekolah Rendah Sathya Berhad</p><p>Stewardship of the school’s purpose, governance and long-term development.</p></header><Placeholders count={10} label="Board member" /></section>
    <section className="people-team-band" id="school-team"><div className="people-section page-inner"><header><p className="eyebrow">02 · The school team</p><h2>School administration &amp; staff</h2><p>Our principal, teachers, administration, support staff and volunteers work together to create a caring place to learn.</p></header>
      <h3 className="people-group-title">School leadership</h3><div className="people-leadership">{leaders.map(person => <article className="people-leader" key={person.id}><img src={person.image} alt={person.alt} loading="lazy"/><div><p className="eyebrow">{person.role}</p><h3>{person.name}</h3><p>{person.excerpt}</p><a className="text-link" href={person.id === 'principal' ? '/about#principal-welcome' : '/about/voices#academics'}>{person.id === 'principal' ? 'Read the Principal’s welcome' : 'Read his reflection'} →</a></div></article>)}</div>
      <h3 className="people-group-title">Teachers</h3><Placeholders count={14} label="Teacher" />
      <h3 className="people-group-title">Administration &amp; support staff</h3><p className="people-group-intro">The people supporting school operations, daily care and security.</p><Placeholders count={3} label="Support staff" />
      <h3 className="people-group-title">Volunteers</h3><Placeholders count={2} label="Volunteer" />
      {extra?.people?.length > 0 && <div className="people-published"><h3 className="people-group-title">More of our school team</h3><div className="people-profile-grid">{extra.people.map((person,index) => <article className="people-profile" key={index}>{person.image && <img src={person.image} alt={person.imageAlt || person.name} loading="lazy"/>}<div><h3>{person.name}</h3><p>{person.role}</p></div></article>)}</div></div>}
    </div></section>
    <section className="people-section page-inner" id="pta"><header><p className="eyebrow">03 · Family partnership</p><h2>Parent–Teacher Association</h2><p>Parents and teachers working together in support of the children and school community.</p></header><div className="people-pta-pending"><h3>Meet the PTA committee</h3><p>Committee names and profiles will be added here.</p></div></section>
    <section className="people-voices-link"><div className="page-inner"><p className="eyebrow">Our wider community</p><h2>Stories that stay with us.</h2><p>Explore reflections from educators and alumni, with space for former parents and volunteers to share their experiences.</p><a className="primary-button" href="/about/voices">Read community voices</a></div></section>
  </main>;
}
