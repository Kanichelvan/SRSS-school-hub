import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarBlank,
  List,
  MagnifyingGlass,
  UsersThree,
  X,
} from "@phosphor-icons/react";

const navItems = [
  ["About", "#about"],
  ["Learning", "#learning"],
  ["School Life", "#school-life"],
  ["Values", "#values"],
  ["Community", "#community"],
];

const audienceLinks = [
  ["For Parents", "Information, resources and support", "#parents"],
  ["For Students", "Learning support and opportunities", "#students"],
  ["For Teachers", "Professional growth and collaboration", "#teachers"],
  ["For Community", "Volunteer, partner and connect", "#community"],
];

export function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [sent, setSent] = useState(false);

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

  const handleVisitSubmit = (event) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>

      <header className="site-header">
        <div className="updates-bar">
          <div className="header-wrap updates-inner">
            <span className="updates-label">Updates</span>
            <span className="updates-pause" aria-hidden="true">Ⅱ</span>
            <time dateTime="2026-07-15">15 Jul 2026</time>
            <p>SRSS Primary Science Week 2026 runs from 21–25 July. Parents are welcome to visit our Open Classroom sessions.</p>
            <a href="#school-life">View all updates <ArrowRight size={15} weight="bold" /></a>
          </div>
        </div>

        <div className="main-nav">
          <div className="header-wrap nav-inner">
            <a className="brand" href="#top" aria-label="SRSS home">
              <img src="/assets/srss-crest.png" alt="Sekolah Rendah Sathya Sai crest" />
              <span>
                <strong>Sekolah Rendah Sathya Sai</strong>
                <small>Kuala Lumpur, Malaysia</small>
                <em>Human Excellence&nbsp;&nbsp;·&nbsp;&nbsp;Kecemerlangan Insan</em>
              </span>
            </a>

            <nav className="desktop-nav" aria-label="Primary navigation">
              {navItems.map(([label, href]) => (
                <a key={label} href={href}>{label}</a>
              ))}
            </nav>

            <div className="nav-actions">
              <button className="icon-action" type="button" onClick={() => setSearchOpen(true)} aria-label="Search SRSS">
                <MagnifyingGlass size={22} />
              </button>
              <a className="parent-link" href="#parents">Parent Hub</a>
              <button className="admissions-button" type="button" onClick={() => { setSent(false); setVisitOpen(true); }}>
                Admissions &amp; Visits
              </button>
              <button className="mobile-menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation">
                {menuOpen ? <X size={25} /> : <List size={25} />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <nav className="mobile-nav" aria-label="Mobile navigation">
              {navItems.map(([label, href]) => (
                <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
              ))}
              <a href="#parents" onClick={() => setMenuOpen(false)}>Parent Hub</a>
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

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Sekolah Rendah Sathya Sai&nbsp;&nbsp;·&nbsp;&nbsp;25th Year</p>
            <h1 id="hero-title">The future does not walk into our school tomorrow — it sits in our classrooms today.</h1>
            <p className="hero-description">We nurture academic excellence, strong character and compassionate leadership through a values-based education that prepares every child for life.</p>
            <div className="hero-actions">
              <a className="primary-button" href="#about">Explore SRSS <ArrowRight size={18} weight="bold" /></a>
              <button className="text-button" type="button" onClick={() => { setSent(false); setVisitOpen(true); }}>Arrange a visit <ArrowRight size={18} /></button>
            </div>
          </div>
          <img className="hero-image" src="/assets/srss-hero-learning.png" alt="Teacher and pupils reading together in SRSS uniform" />
        </section>

        <section className="values-intro" id="about" aria-labelledby="values-title">
          <h2 id="values-title">A school for the mind, heart and character</h2>
          <div className="value-pillars" id="values">
            <article>
              <h3>Academic confidence</h3>
              <p>Rigorous, engaging learning that builds knowledge, curiosity and the confidence to think independently.</p>
            </article>
            <article>
              <h3>Human values in action</h3>
              <p>Daily practice of respect, honesty and responsibility that shapes good decisions and strong character.</p>
            </article>
            <article>
              <h3>Compassionate leadership</h3>
              <p>Empathy, service and teamwork that inspire every child to lead with purpose and care for others.</p>
            </article>
          </div>
        </section>

        <section className="learning-strip" id="learning" aria-label="Learning in action">
          <img src="/assets/srss-learning-strip.png" alt="SRSS pupils exploring science, design and nature" />
        </section>

        <section className="audience-row" id="school-life" aria-label="School hubs">
          {audienceLinks.map(([title, text, href]) => (
            <a key={title} href={href} className="audience-link">
              <span>
                <strong>{title}</strong>
                <small>{text}</small>
              </span>
              <ArrowRight size={21} />
            </a>
          ))}
        </section>

        <section className="essentials-section" id="parents">
          <div className="essentials-copy">
            <p className="eyebrow">A connected school community</p>
            <h2>Everything families need, in one calm place.</h2>
            <p>Find essential dates, forms, learning links and guidance without losing sight of what matters most: every child’s growth.</p>
          </div>
          <div className="essentials-list">
            <a href="#calendar"><CalendarBlank size={23} /><span><strong>School calendar</strong><small>Term dates, events and parent meetings</small></span><ArrowRight size={19} /></a>
            <a href="#community" id="students"><UsersThree size={23} /><span><strong>Student and family hub</strong><small>Learning resources, forms and notices</small></span><ArrowRight size={19} /></a>
          </div>
        </section>
      </main>

      <footer id="community">
        <div className="footer-inner">
          <div className="footer-brand">
            <img src="/assets/srss-crest.png" alt="" />
            <div><strong>Sekolah Rendah Sathya Sai</strong><span>Shaping Minds. Nurturing Hearts. Inspiring Lives.</span></div>
          </div>
          <p><strong>Sekolah Rendah Sathya Sai</strong> is a values-based primary school in Malaysia dedicated to nurturing academic excellence, character, and compassionate leadership.</p>
          <div className="footer-links"><a href="#top">Back to top</a><button type="button" onClick={() => setVisitOpen(true)}>Contact the school</button></div>
        </div>
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
