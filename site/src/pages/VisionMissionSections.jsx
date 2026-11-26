import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CaretLeft } from '@phosphor-icons/react/dist/csr/CaretLeft';
import { CaretRight } from '@phosphor-icons/react/dist/csr/CaretRight';
import { Pause } from '@phosphor-icons/react/dist/csr/Pause';
import { Play } from '@phosphor-icons/react/dist/csr/Play';
import HeroPhoto, { HERO_PHOTOS } from '../components/HeroPhoto.jsx';
import { EducationQuote } from '../components/SchoolMoments.jsx';
import { globalEducareData, inspirationData, inspirationSlides, methodologies, methodologiesIntro, visionMissionData } from '../data/aboutNetwork.js';

// Automatically collapses an expanded note once its card has scrolled out of view,
// compensating scrollY when collapsing above the viewport so the next section never jumps.
function useAutoCollapseOnScroll(cardRef, sectionRef, expanded, onCollapse) {
  const pendingCompensation = useRef(null);

  useEffect(() => {
    if (!expanded || !cardRef.current) return undefined;
    let seenVisible = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          seenVisible = true;
          return;
        }
        if (!seenVisible) return;
        const sectionEl = sectionRef?.current || cardRef.current;
        if (entry.boundingClientRect.bottom <= 0 && sectionEl) {
          pendingCompensation.current = sectionEl.getBoundingClientRect().height;
        }
        onCollapse();
      },
      { threshold: 0 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [expanded, cardRef, sectionRef, onCollapse]);

  useLayoutEffect(() => {
    if (expanded || pendingCompensation.current === null) return;
    const prevHeight = pendingCompensation.current;
    pendingCompensation.current = null;
    const sectionEl = sectionRef?.current || cardRef.current;
    if (!sectionEl) return;
    const delta = prevHeight - sectionEl.getBoundingClientRect().height;
    if (delta > 0) {
      window.scrollBy({ top: -delta, behavior: 'instant' });
    }
  }, [expanded, cardRef, sectionRef]);
}

function VisionMissionCard({ id, variant, data, image, expanded, onToggle, onCollapse, sectionRef }) {
  const cardRef = useRef(null);
  useAutoCollapseOnScroll(cardRef, sectionRef, expanded, onCollapse);

  return (
    <article ref={cardRef} className={`vm-card vm-card-${variant}`} id={id} aria-labelledby={`${id}-heading`}>
      <div className="vm-card-media">
        <HeroPhoto image={image} sizes="(max-width: 900px) 100vw, 50vw" />
      </div>
      <div className="vm-card-body">
        <p className="eyebrow">{data.eyebrow}</p>
        <h2 id={`${id}-heading`} className="vm-card-label">{data.title}</h2>
        <p className="vm-statement">
          {data.statementBefore}
          <em>{data.statementEm1}</em>
          {data.statementMid}
          <em>{data.statementEm2}</em>
          {data.statementAfter}
          {!expanded && (
            <>
              {' '}
              <button
                type="button"
                className="vm-inline-more"
                aria-expanded="false"
                aria-controls={`${id}-notes`}
                aria-label={`Read more about ${data.eyebrow.toLowerCase()}`}
                onClick={onToggle}
              >
                More…
              </button>
            </>
          )}
        </p>
        <div id={`${id}-notes`} className={`vm-notes${expanded ? ' is-open' : ''}`} hidden={!expanded}>
          {data.notes.map((paragraph, i) => (
            <p key={paragraph}>
              {paragraph}
              {i === data.notes.length - 1 && (
                <>
                  {' '}
                  <button
                    type="button"
                    className="vm-inline-more vm-inline-less"
                    aria-expanded="true"
                    aria-controls={`${id}-notes`}
                    aria-label={`Show less of ${data.eyebrow.toLowerCase()}`}
                    onClick={onToggle}
                  >
                    Less
                  </button>
                </>
              )}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}

export function VisionMissionCards() {
  const [openVision, setOpenVision] = useState(false);
  const [openMission, setOpenMission] = useState(false);
  const sectionRef = useRef(null);
  const closeVision = useCallback(() => setOpenVision(false), []);
  const closeMission = useCallback(() => setOpenMission(false), []);

  return (
    <section ref={sectionRef} className="vm-showcase about-network-section" id="purpose" aria-label="Our Vision and Our Mission">
      <div className="about-inner">
        <div className="vm-grid">
          <VisionMissionCard
            id="vision"
            variant="vision"
            data={visionMissionData.vision}
            image={HERO_PHOTOS.assembly}
            expanded={openVision}
            onToggle={() => setOpenVision((v) => !v)}
            onCollapse={closeVision}
            sectionRef={sectionRef}
          />
          <VisionMissionCard
            id="mission"
            variant="mission"
            data={visionMissionData.mission}
            image={HERO_PHOTOS.welcome}
            expanded={openMission}
            onToggle={() => setOpenMission((m) => !m)}
            onCollapse={closeMission}
            sectionRef={sectionRef}
          />
        </div>
      </div>
    </section>
  );
}

function InstitutesCarousel() {
  const track = useRef(null);
  const section = useRef(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [tabVisible, setTabVisible] = useState(() =>
    typeof document !== 'undefined' ? !document.hidden : true
  );

  const goTo = (targetIndex) => {
    const node = track.current;
    if (!node || !node.children.length) return;
    const clamped = ((targetIndex % inspirationSlides.length) + inspirationSlides.length) % inspirationSlides.length;
    const child = node.children[clamped];
    if (!child) return;
    node.scrollTo({
      left: child.offsetLeft - node.offsetLeft,
      behavior: reduced ? 'auto' : 'smooth',
    });
    setIndex(clamped);
  };

  useEffect(() => {
    if (!section.current) return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(section.current);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => setReduced(media.matches);
    const onVisibility = () => setTabVisible(!document.hidden);
    media.addEventListener('change', onMotion);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      media.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    if (paused || engaged || reduced || !visible || !tabVisible) return undefined;
    const timer = setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % inspirationSlides.length;
        const node = track.current;
        const child = node?.children[next];
        if (node && child) {
          node.scrollTo({ left: child.offsetLeft - node.offsetLeft, behavior: 'smooth' });
        }
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [paused, engaged, reduced, visible, tabVisible]);

  return (
    <div
      ref={section}
      className="inspiration-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Sathya Sai Educational Institutions worldwide"
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocusCapture={() => setEngaged(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setEngaged(false);
      }}
    >
      <div className="inspiration-carousel-head">
        <div>
          <p className="eyebrow">A Worldwide Educational Fraternity</p>
          <h3>Sathya Sai Institutes &amp; Educare Across the World</h3>
        </div>
        <div className="carousel-controls" aria-label="Institutes carousel controls">
          <button type="button" aria-label="Previous institute" onClick={() => goTo(index - 1)}>
            <CaretLeft size={20} />
          </button>
          <span>{String(index + 1).padStart(2, '0')} / {String(inspirationSlides.length).padStart(2, '0')}</span>
          <button type="button" aria-label="Next institute" onClick={() => goTo(index + 1)}>
            <CaretRight size={20} />
          </button>
          <button
            type="button"
            aria-label={paused ? 'Play institutes slideshow' : 'Pause institutes slideshow'}
            aria-pressed={paused}
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? <Play size={16} weight="fill" /> : <Pause size={16} weight="fill" />}
          </button>
        </div>
      </div>

      <div className="global-educare-overview">
        <div className="global-educare-copy">
          {globalEducareData.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <dl className="global-educare-stats" aria-label="Global Sathya Sai education reach">
          {globalEducareData.stats.map(([value, label]) => (
            <div key={label}>
              <dt>{value}</dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div
        className="inspiration-track"
        ref={track}
        tabIndex={0}
        aria-label="Sathya Sai Institutes gallery; swipe or use arrow keys"
        onScroll={() => {
          const node = track.current;
          if (!node?.children.length) return;
          const step = node.children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(node).gap || '0');
          if (step > 0) setIndex(Math.min(inspirationSlides.length - 1, Math.round(node.scrollLeft / step)));
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') { event.preventDefault(); goTo(index + 1); }
          if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(index - 1); }
        }}
      >
        {inspirationSlides.map((slide, i) => (
          <figure
            key={slide.id}
            className="inspiration-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${inspirationSlides.length}`}
          >
            <div className="inspiration-slide-frame">
              <img src={slide.src} alt={slide.alt} loading="lazy" decoding="async" />
              <span className="inspiration-slide-badge">{slide.institution}</span>
            </div>
            <figcaption>
              <h4>{slide.title}</h4>
              <p className="inspiration-slide-place">{slide.place}</p>
              <p>{slide.caption}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="inspiration-dots" role="tablist" aria-label="Choose an institute slide">
        {inspirationSlides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={index === i}
            aria-label={`View ${slide.title}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      <figure className="global-educare-quote" aria-label="Quotation from Bhagawan Sri Sathya Sai Baba">
        <blockquote>{globalEducareData.quote}</blockquote>
        <figcaption>{globalEducareData.quoteSource}</figcaption>
      </figure>
    </div>
  );
}

export function OurInspirationSection() {
  const [expanded, setExpanded] = useState(false);
  const quoteWrapRef = useRef(null);
  const sectionRef = useRef(null);
  const closeInspiration = useCallback(() => setExpanded(false), []);
  useAutoCollapseOnScroll(quoteWrapRef, sectionRef, expanded, closeInspiration);

  return (
    <section ref={sectionRef} className="about-network-section inspiration-section" id="inspiration" aria-labelledby="inspiration-heading">
      <div className="about-inner">
        <div className="about-network-section-heading">
          <p className="eyebrow">{inspirationData.eyebrow}</p>
          <h2 id="inspiration-heading">{inspirationData.title}</h2>
        </div>

        <div ref={quoteWrapRef} className="inspiration-quote-wrap">
          <EducationQuote embedded id="inspiration-quote" linkHref={null} linkLabel={null}>
            <p className="inspiration-quote-lead">
              {inspirationData.paragraphs[0]}
              {!expanded && (
                <>
                  {' '}
                  <button
                    type="button"
                    className="vm-inline-more vm-inline-more-light"
                    aria-expanded="false"
                    aria-controls="inspiration-reading"
                    aria-label="Read more about our inspiration"
                    onClick={() => setExpanded(true)}
                  >
                    More…
                  </button>
                </>
              )}
            </p>
            <div id="inspiration-reading" className={`inspiration-reading${expanded ? ' is-open' : ''}`} hidden={!expanded}>
              {inspirationData.paragraphs.slice(1).map((paragraph, i, list) => (
                <p key={paragraph}>
                  {paragraph}
                  {i === list.length - 1 && (
                    <>
                      {' '}
                      <button
                        type="button"
                        className="vm-inline-more vm-inline-more-light vm-inline-less"
                        aria-expanded="true"
                        aria-controls="inspiration-reading"
                        aria-label="Show less of our inspiration"
                        onClick={() => setExpanded(false)}
                      >
                        Less
                      </button>
                    </>
                  )}
                </p>
              ))}
            </div>
          </EducationQuote>
        </div>

        <InstitutesCarousel />
      </div>
    </section>
  );
}

// 9 evenly spaced positions on a circle (starting at top, clockwise) in percentage coordinates.
const MINDMAP_RADIUS = 41;
const nodePositions = methodologies.map((_, index) => {
  const angle = (-90 + (360 / methodologies.length) * index) * (Math.PI / 180);
  return {
    x: 50 + MINDMAP_RADIUS * Math.cos(angle),
    y: 50 + MINDMAP_RADIUS * Math.sin(angle),
  };
});

export function MethodologiesInfographic() {
  const [active, setActive] = useState(0);
  const current = methodologies[active];

  const step = (delta) => setActive((i) => (i + delta + methodologies.length) % methodologies.length);

  return (
    <section
      className="about-network-section methodologies-section"
      id="methodologies"
      aria-labelledby="methodologies-heading"
    >
      {/* Anchor compatibility for legacy #commitments and #principles bookmarks */}
      <span id="commitments" className="visually-hidden" aria-hidden="true" />
      <span id="principles" className="visually-hidden" aria-hidden="true" />

      <div className="about-inner">
        <div className="about-network-section-heading methodologies-intro-block">
          <p className="eyebrow">{methodologiesIntro.eyebrow}</p>
          <h2 id="methodologies-heading">{methodologiesIntro.title}</h2>
          <p className="network-lead">{methodologiesIntro.paragraphs[0]}</p>
          <p className="methodologies-intro-second">{methodologiesIntro.paragraphs[1]}</p>
          <p className="methodologies-sublabel">How Children Learn · Select any of the nine pillars below to explore</p>
        </div>

        <div className="mindmap-layout">
          {/* Interactive Radial Mind Map (Desktop & Tablet) */}
          <div className="mindmap-stage" role="group" aria-label="Interactive SRSS Methodologies Mind Map">
            <svg className="mindmap-spokes" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
              <circle cx="50" cy="50" r={MINDMAP_RADIUS} className="mindmap-orbit" />
              {nodePositions.map((pos, i) => (
                <line
                  key={methodologies[i].id}
                  x1="50"
                  y1="50"
                  x2={pos.x}
                  y2={pos.y}
                  className={`mindmap-spoke${active === i ? ' is-active' : ''}`}
                />
              ))}
            </svg>

            <div className="mindmap-hub" aria-hidden="true">
              <span className="mindmap-hub-eyebrow">How Children Learn</span>
              <strong>Our<br />Methodologies</strong>
              <small>Human Excellence</small>
            </div>

            {methodologies.map((item, i) => {
              const pos = nodePositions[i];
              const isSelected = active === i;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`mindmap-node tone-${item.tone}${isSelected ? ' is-active' : ''}`}
                  style={{ '--node-x': `${pos.x}%`, '--node-y': `${pos.y}%` }}
                  aria-pressed={isSelected}
                  aria-controls="methodology-detail"
                  onClick={() => setActive(i)}
                >
                  <span className="mindmap-node-num">{item.number}</span>
                  <span className="mindmap-node-label">{item.short}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile / Compact Selector Bar */}
          <div className="mindmap-mobile-pills" role="group" aria-label="Choose a methodology">
            {methodologies.map((item, i) => (
              <button
                key={item.id}
                type="button"
                className={`mindmap-pill tone-${item.tone}${active === i ? ' is-active' : ''}`}
                aria-pressed={active === i}
                aria-controls="methodology-detail"
                onClick={() => setActive(i)}
              >
                <span>{item.number}</span>
                {item.short}
              </button>
            ))}
          </div>

          {/* Active Methodology Detail Spotlight */}
          <article
            id="methodology-detail"
            className={`mindmap-detail tone-${current.tone}`}
            aria-live="polite"
            aria-atomic="true"
            key={current.id}
          >
            <figure className="mindmap-detail-photo">
              <img src={current.image} alt={current.alt} loading="lazy" decoding="async" />
              <span className="mindmap-detail-badge">{current.number} / {String(methodologies.length).padStart(2, '0')}</span>
            </figure>
            <div className="mindmap-detail-body">
              <p className="eyebrow">How Children Learn · {current.number}</p>
              <h3>{current.title}</h3>
              <p className="mindmap-detail-summary">{current.summary}</p>
              {current.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {current.subSections && (
                <div className="mindmap-subsections">
                  {current.subSections.map((sub) => (
                    <section key={sub.heading} className="mindmap-subsec">
                      <h4>{sub.heading}</h4>
                      <p className="mindmap-subsec-lead">{sub.lead}</p>
                      {sub.paragraphs.map((p) => (
                        <p key={p}>{p}</p>
                      ))}
                    </section>
                  ))}
                </div>
              )}
              {current.ctaLink && (
                <p className="mindmap-cta-wrap">
                  <a className="text-link" href={current.ctaLink.href}>{current.ctaLink.label}</a>
                </p>
              )}
              <ul className="mindmap-highlights" aria-label="Key elements">
                {current.highlights.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <div className="mindmap-stepper">
                <button type="button" onClick={() => step(-1)} aria-label="Previous methodology">
                  <CaretLeft size={17} aria-hidden="true" /> Previous
                </button>
                <span>{current.number} of {String(methodologies.length).padStart(2, '0')}</span>
                <button type="button" onClick={() => step(1)} aria-label="Next methodology">
                  Next <CaretRight size={17} aria-hidden="true" />
                </button>
              </div>
            </div>
          </article>
        </div>

        <details className="network-disclosure methodologies-all-list">
          <summary>Read all nine methodologies at a glance</summary>
          <ol className="methodologies-glance-grid">
            {methodologies.map((item) => (
              <li key={item.id}>
                <span>{item.number}</span>
                <div>
                  <h4>{item.title}</h4>
                  <p className="glance-summary">{item.summary}</p>
                  {item.paragraphs.map((p) => <p key={p}>{p}</p>)}
                  {item.subSections && item.subSections.map((sub) => (
                    <div key={sub.heading} className="glance-subsec">
                      <strong>{sub.heading}</strong>
                      {sub.paragraphs.map((p) => <p key={p}>{p}</p>)}
                    </div>
                  ))}
                  {item.ctaLink && (
                    <p><a className="text-link" href={item.ctaLink.href}>{item.ctaLink.label}</a></p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </details>
      </div>
    </section>
  );
}
