// Auto-rotating "Inside SRSS" carousel of school spaces (Student Life). One large photo with its name and a
// short line, thumbnails to jump, previous / pause / next, swipe and arrow keys. Rotates only while visible
// and the tab is in view; pauses on hover or keyboard focus; a visitor's Pause sticks; reduced motion never rotates.
import { useEffect, useRef, useState } from "react";
import { SCHOOL_SPACES } from "../data/schoolSpaces.js";
import "./spaces-carousel.css";

const DELAY = 5500;
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function SpacesCarousel({ items = SCHOOL_SPACES }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(() => reducedMotion()); // visitor's choice (or reduced motion)
  const [held, setHeld] = useState(false); // hover / focus inside
  const [visible, setVisible] = useState(false);
  const root = useRef(null);
  const thumbs = useRef(null);
  const swipe = useRef(null);
  const count = items.length;
  const go = (next) => setIndex(((next % count) + count) % count);

  useEffect(() => {
    const el = root.current;
    if (!el || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && !document.hidden), { threshold: 0.4 });
    io.observe(el);
    const onTab = () => setVisible((v) => v && !document.hidden);
    const onShow = () => { if (!document.hidden) { io.unobserve(el); io.observe(el); } else onTab(); };
    document.addEventListener("visibilitychange", onShow);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onShow); };
  }, []);

  const rotating = visible && !paused && !held && count > 1;
  useEffect(() => {
    if (!rotating) return undefined;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), DELAY);
    return () => window.clearTimeout(timer);
  }, [rotating, index, count]);

  // Keep the current thumbnail in view inside its own strip without scrolling the page.
  useEffect(() => {
    const strip = thumbs.current; const active = strip?.children[index];
    if (!strip || !active) return;
    const left = active.offsetLeft - (strip.clientWidth - active.clientWidth) / 2;
    strip.scrollTo({ left, behavior: reducedMotion() ? "auto" : "smooth" });
  }, [index]);

  const item = items[index];
  const onKey = (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); go(index + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); go(index - 1); }
  };
  const onPointerDown = (event) => { swipe.current = event.pointerType === "mouse" ? null : event.clientX; };
  const onPointerUp = (event) => {
    if (swipe.current == null) return;
    const dx = event.clientX - swipe.current; swipe.current = null;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
  };

  return (
    <div ref={root} className="spaces-carousel" role="region" aria-roledescription="carousel" aria-label="Inside SRSS: school spaces and moments"
      onKeyDown={onKey} onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHeld(false); }}>
      <div className="spaces-stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { swipe.current = null; }}>
        {items.map((slide, i) => (
          <figure key={slide.id} className={i === index ? "is-active" : undefined} aria-hidden={i !== index}
            role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${count}: ${slide.title}`}>
            <img src={slide.src} srcSet={slide.srcSet} sizes="(max-width: 860px) 92vw, 620px" alt={slide.alt}
              width="1200" height="1200" loading={i === 0 ? "eager" : "lazy"} decoding="async" draggable="false" />
          </figure>
        ))}
      </div>
      <div className="spaces-panel">
        <div className="spaces-caption" aria-live={rotating ? "off" : "polite"} aria-atomic="true">
          <p className="spaces-count"><span>{String(index + 1).padStart(2, "0")}</span> / {String(count).padStart(2, "0")} · {item.kind}</p>
          <h3 key={item.id}>{item.title}</h3>
          <p key={`${item.id}-copy`}>{item.copy}</p>
        </div>
        <div className="spaces-controls">
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous space">←</button>
          <button type="button" onClick={() => setPaused((p) => !p)} aria-pressed={paused}
            aria-label={paused ? "Play the slideshow" : "Pause the slideshow"}>{paused ? "Play" : "Pause"}</button>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next space">→</button>
          <span className="spaces-progress" aria-hidden="true"><i key={`${index}-${rotating}`} className={rotating ? "is-running" : undefined} style={{ animationDuration: `${DELAY}ms` }} /></span>
        </div>
        <ol ref={thumbs} className="spaces-thumbs" aria-label="Choose a space">
          {items.map((slide, i) => (
            <li key={slide.id}>
              <button type="button" onClick={() => go(i)} aria-current={i === index ? "true" : undefined} aria-label={`Show ${slide.title}`}>
                <img src={slide.thumb} alt="" width="240" height="240" loading="lazy" decoding="async" />
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
