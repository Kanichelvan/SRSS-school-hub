import { useEffect, useRef, useState } from 'react';
import { CaretLeft } from '@phosphor-icons/react/dist/csr/CaretLeft';
import { CaretRight } from '@phosphor-icons/react/dist/csr/CaretRight';
import { Pause } from '@phosphor-icons/react/dist/csr/Pause';
import { Play } from '@phosphor-icons/react/dist/csr/Play';
import { schoolMoments } from '../data/schoolMoments.js';

export default function SchoolMoments({ extra = [] }) {
  const items = [...schoolMoments, ...extra];
  const track = useRef(null), section = useRef(null);
  const [index, setIndex] = useState(0), [paused, setPaused] = useState(false), [engaged, setEngaged] = useState(false), [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [tabVisible, setTabVisible] = useState(!document.hidden);
  const move = (direction) => {
    const node = track.current;
    const step = node.children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(node).gap);
    const max = node.scrollWidth - node.clientWidth;
    const target = direction > 0 ? (node.scrollLeft >= max - 2 ? 0 : Math.min(max, node.scrollLeft + step)) : (node.scrollLeft <= 2 ? max : Math.max(0, node.scrollLeft - step));
    node.scrollTo({ left: target, behavior: reduced ? 'auto' : 'smooth' });
  };
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .2 });
    observer.observe(section.current);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motion = () => setReduced(media.matches), visibility = () => setTabVisible(!document.hidden);
    media.addEventListener('change', motion); document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); media.removeEventListener('change', motion); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  useEffect(() => {
    if (paused || engaged || reduced || !visible || !tabVisible) return undefined;
    const timer = setInterval(() => move(1), 7500);
    return () => clearInterval(timer);
  }, [paused, engaged, reduced, visible, tabVisible]);
  return <section ref={section} className="school-moments" id="school-life" aria-labelledby="life-title" onMouseEnter={() => setEngaged(true)} onMouseLeave={() => setEngaged(false)} onFocusCapture={() => setEngaged(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setEngaged(false); }}>
    <div className="section-head-row"><div><p className="eyebrow">Life at SRSS</p><h2 id="life-title">Small moments. <em>Lasting roots.</em></h2></div><div className="carousel-controls" aria-label="Gallery controls">
      <button type="button" aria-label="Previous photo" onClick={() => move(-1)}><CaretLeft size={21} /></button><span>{String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span><button type="button" aria-label="Next photo" onClick={() => move(1)}><CaretRight size={21} /></button><button type="button" aria-label={paused ? 'Play slideshow' : 'Pause slideshow'} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={16} weight="fill" /> : <Pause size={16} weight="fill" />}</button>
    </div></div>
    <div className="moments-track" ref={track} tabIndex="0" aria-label="School photograph gallery; swipe or use the arrow buttons" onScroll={() => { const node = track.current; const step = node.children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(node).gap); setIndex(Math.round(node.scrollLeft / step)); }} onKeyDown={(event) => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); } }}>
      {items.map((item) => <figure key={item.id}><img src={item.src} srcSet={item.srcSet} sizes="(max-width: 600px) 88vw, (max-width: 1000px) 44vw, 30vw" width={item.width} height={item.height} alt={item.alt} loading="lazy" style={{ objectPosition: item.focal || '50% 50%' }} /></figure>)}
    </div>
    <div className="moments-links">{!extra.length && <a className="text-link" href="/student-life/gallery">Explore the school gallery</a>}<a className="text-link" href="https://www.facebook.com/SSPSM/" target="_blank" rel="noreferrer">More school moments on Facebook</a></div>
  </section>;
}

export function EducationQuote() {
  return <section className="education-quote" id="education-for-life" aria-label="Words from Sathya Sai Baba"><div className="education-quote-inner">
    <img src="/assets/photos/processed/2026-10-15-sathya-sai-orange-illustration-724.webp" srcSet="/assets/photos/processed/2026-10-15-sathya-sai-orange-illustration-480.webp 480w, /assets/photos/processed/2026-10-15-sathya-sai-orange-illustration-724.webp 724w" sizes="(max-width: 600px) 150px, 320px" width="724" height="1086" alt="Illustration of Sathya Sai Baba in an orange robe" loading="lazy" />
    <div><span className="education-quote-mark" aria-hidden="true">“</span><blockquote>Education for life,<br />not mere living.</blockquote><p className="education-quote-source">Sathya Sai Baba</p><a className="text-link" href="/about/our-people#principal">Read our Principal’s welcome</a></div>
  </div></section>;
}
