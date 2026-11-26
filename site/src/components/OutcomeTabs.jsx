import { useEffect, useRef, useState } from 'react';
import { CaretDown } from '@phosphor-icons/react/dist/csr/CaretDown';
import { X } from '@phosphor-icons/react/dist/csr/X';
import AcademicOverview, { ActiveBodies } from './AcademicOverview.jsx';
import { EducationQuote } from './SchoolMoments.jsx';
import ValuesGarden from './ValuesGarden.jsx';

const outcomes = [
  {
    id: 'academic',
    title: 'Academic Excellence',
    tone: 'red',
    eyebrow: '01 · Academic Excellence',
    lead: 'Strong foundations in Malaysia’s national curriculum build knowledge, curiosity and confidence—supported by bilingual fluency and care for each learner’s pace.',
    hashes: ['learning', 'school-hours', 'academic'],
  },
  {
    id: 'character',
    title: 'Character Development',
    tone: 'blue',
    eyebrow: '02 · Character Development',
    lead: 'Integrity, self-awareness and compassion develop through Sathya Sai Educare—connecting classroom learning with reflection, daily choices and living example.',
    hashes: ['education-for-life', 'character'],
  },
  {
    id: 'civic',
    title: 'Civic Stewardship',
    tone: 'purple',
    eyebrow: '03 · Civic Stewardship',
    lead: 'Honouring Malaysia’s rich multicultural heritage while bringing the Falsafah Pendidikan Kebangsaan to life through respect, unity and active citizenship.',
    hashes: ['civic', 'civic-stewardship'],
  },
  {
    id: 'holistic',
    title: 'Holistic Empowerment',
    tone: 'green',
    eyebrow: '04 · Holistic Empowerment',
    lead: 'Head, Heart and Hands grow together through sports clubs, chess lessons, co-curricular discovery, Walk for Values and purposeful service.',
    hashes: ['active-bodies', 'holistic'],
  },
  {
    id: 'values',
    title: 'Human Values',
    tone: 'orange',
    eyebrow: '05 · Human Values',
    lead: 'Truth, Right Conduct, Peace, Love and Nonviolence guide how we learn, care and grow together. Explore each petal below.',
    hashes: ['values', 'human-values'],
  },
];

const characterHighlights = [
  {
    title: 'SSEHV Lessons',
    body: 'Sathya Sai Education in Human Values uses five experiential techniques—Silent Sitting, Storytelling, Group Singing, Prayers & Inspirational Quotations, and Group Activities—to awaken conscience and nurture inner strength.',
  },
  {
    title: 'Walk for Values & Service',
    body: 'Signature school programmes such as Walk for Values, classroom duties and community seva help pupils translate human values from reflection into joyful everyday kindness and responsibility.',
  },
  {
    title: 'Education That Draws Out',
    body: 'Grounded in the Sathya Sai Educare Philosophy, our educators lead by example—modelling honesty, patience and compassion so knowledge from outside meets values drawn out from within.',
  },
];

function tabIndexForHash(hash) {
  const clean = (hash || '').replace(/^#/, '');
  if (!clean) return null;
  const idx = outcomes.findIndex((item) => item.hashes.includes(clean));
  return idx === -1 ? null : idx;
}

export default function OutcomeTabs({ values = [] }) {
  const [active, setActive] = useState(() => tabIndexForHash(typeof window !== 'undefined' ? window.location.hash : ''));
  const [emphasised, setEmphasised] = useState(null);
  const tabRefs = useRef([]);
  const panelRef = useRef(null);

  const selected = active !== null ? outcomes[active] : null;

  const toggleTab = (index) => {
    setActive((current) => {
      const next = current === index ? null : index;
      setEmphasised(next);
      return next;
    });
  };

  useEffect(() => {
    const syncFromHash = () => {
      const idx = tabIndexForHash(window.location.hash);
      if (idx !== null) {
        setActive(idx);
        setEmphasised(idx);
      }
    };
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  // Scrolling clears only the decorative shine; the open panel stays open.
  useEffect(() => {
    if (emphasised === null) return undefined;
    const clear = () => setEmphasised(null);
    window.addEventListener('scroll', clear, { passive: true });
    return () => window.removeEventListener('scroll', clear);
  }, [emphasised]);

  const move = (event, index) => {
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % outcomes.length
        : event.key === 'ArrowLeft'
          ? (index - 1 + outcomes.length) % outcomes.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? outcomes.length - 1
              : null;
    if (next !== null) {
      event.preventDefault();
      tabRefs.current[next]?.focus();
    }
  };

  const renderPanelBody = () => {
    if (!selected) return null;
    switch (selected.id) {
      case 'academic':
        return <AcademicOverview embedded />;

      case 'character':
        return (
          <div className="outcome-character-content">
            <EducationQuote
              embedded
              linkHref="/about/vision-mission#inspiration"
              linkLabel="Read our “Founding Principles”"
            />
            <div className="outcome-character-grid">
              {characterHighlights.map((item) => (
                <article key={item.title} className="outcome-feature-card">
                  <h4>{item.title}</h4>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
            <div className="outcome-panel-links">
              <a className="text-link" href="/about/sathya-sai-education">Explore the Sathya Sai Educare Philosophy</a>
              <a className="text-link" href="/about/human-excellence">Discover Human Excellence</a>
            </div>
          </div>
        );

      case 'civic':
        return (
          <div className="outcome-civic-content" id="civic-stewardship">
            <div className="outcome-civic-grid">
              <div className="outcome-civic-copy">
                <p className="eyebrow">Honouring Our Nation · Embracing Humanity</p>
                <h4>Honour our nation. Serve our shared world.</h4>
                <p>
                  Respect for Malaysia, appreciation of its cultural and religious diversity, and responsibility as active
                  national and global citizens grow through everyday learning at Sekolah Rendah Sathya Sai.
                </p>
                <div className="outcome-fpk-box">
                  <h5>Falsafah Pendidikan Kebangsaan in Action</h5>
                  <p>
                    Our teachers integrate universal human values across every subject, bringing Malaysia’s National Education
                    Philosophy (<em>Falsafah Pendidikan Kebangsaan</em>) to life in the classroom—nurturing individuals who are
                    intellectually, spiritually, emotionally and physically balanced and harmonious, anchored in belief in God,
                    good character and contribution to family, community and nation.
                  </p>
                </div>
                <ul className="outcome-civic-points">
                  <li><strong>Morning Assembly &amp; Rukun Negara:</strong> Every day opens with Silent Sitting, school prayers, <em>Negaraku</em> and the <em>Rukun Negara</em>, cultivating gratitude and national unity.</li>
                  <li><strong>Unity in Diversity:</strong> Celebrating Malaysia’s major cultural traditions together fosters mutual respect, open-mindedness and belonging for every child.</li>
                  <li><strong>Service &amp; Stewardship:</strong> Environmental care, recycling, tree planting and community service turn altruistic responsibility into lived citizenship.</li>
                </ul>
                <div className="outcome-panel-links">
                  <a className="text-link" href="/resources/prayer-pledge-anthem">Before the First Bell: Negaraku &amp; Rukun Negara</a>
                  <a className="text-link" href="/student-life/service">See service in action</a>
                </div>
              </div>
              <figure className="outcome-civic-photo">
                <img
                  src="/assets/prayer-page/negaraku-flag-raising.jpg"
                  alt="SRSS pupils standing attentively during the raising of the Jalur Gemilang at morning assembly."
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            </div>
          </div>
        );

      case 'holistic':
        return <ActiveBodies embedded />;

      case 'values':
        return (
          <div className="outcome-values-content">
            <ValuesGarden values={values} embedded id="values" idPrefix="home-value" />
            <div className="outcome-panel-links">
              <a className="text-link" href="/about/human-excellence#values">Explore Human Excellence &amp; daily values</a>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="home-outcomes" aria-labelledby="outcomes-title">
      <h2 id="outcomes-title" className="visually-hidden">Five pillars of an SRSS education</h2>
      <div className="outcome-tabs" role="tablist" aria-label="Five pillars of an SRSS education">
        {outcomes.map((outcome, index) => {
          const isOpen = active === index;
          return (
            <button
              key={outcome.id}
              ref={(el) => { tabRefs.current[index] = el; }}
              type="button"
              role="tab"
              id={`outcome-tab-${index}`}
              className={`outcome-tab outcome-${outcome.tone}${emphasised === index ? ' is-emphasised' : ''}`}
              aria-selected={isOpen}
              aria-expanded={isOpen}
              aria-controls="outcome-panel"
              tabIndex={(active === null ? index === 0 : isOpen) ? 0 : -1}
              onClick={() => toggleTab(index)}
              onKeyDown={(event) => move(event, index)}
            >
              <span>{outcome.title}</span>
              <CaretDown size={14} weight="bold" className={`outcome-tab-caret${isOpen ? ' is-open' : ''}`} aria-hidden="true" />
            </button>
          );
        })}
      </div>

      {!selected ? (
        <div className="outcome-prompt-bar">
          <p>Select any pillar above to explore our curriculum, character education, civic stewardship, co-curricular life and five human values.</p>
        </div>
      ) : (
        <div
          ref={panelRef}
          className={`outcome-panel outcome-${selected.tone}`}
          id="outcome-panel"
          role="tabpanel"
          aria-labelledby={`outcome-tab-${active}`}
          key={selected.id}
        >
          <div className="outcome-panel-head">
            <div>
              <p className="eyebrow">{selected.eyebrow}</p>
              <h3>{selected.title}</h3>
              <p className="outcome-panel-lead">{selected.lead}</p>
            </div>
            <button
              type="button"
              className="outcome-panel-close"
              onClick={() => { setActive(null); setEmphasised(null); }}
              aria-label={`Close ${selected.title} section`}
            >
              <X size={18} aria-hidden="true" />
              <span>Close</span>
            </button>
          </div>
          <div className="outcome-panel-body">{renderPanelBody()}</div>
        </div>
      )}
    </section>
  );
}
