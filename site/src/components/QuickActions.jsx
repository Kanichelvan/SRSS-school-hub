import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from '@phosphor-icons/react/dist/csr/ArrowUp';
import { BookOpen } from '@phosphor-icons/react/dist/csr/BookOpen';
import { Buildings } from '@phosphor-icons/react/dist/csr/Buildings';
import { CalendarBlank } from '@phosphor-icons/react/dist/csr/CalendarBlank';
import { ChalkboardTeacher } from '@phosphor-icons/react/dist/csr/ChalkboardTeacher';
import { Newspaper } from '@phosphor-icons/react/dist/csr/Newspaper';
import { Phone } from '@phosphor-icons/react/dist/csr/Phone';
import { Plus } from '@phosphor-icons/react/dist/csr/Plus';
import { Student } from '@phosphor-icons/react/dist/csr/Student';
import { UsersThree } from '@phosphor-icons/react/dist/csr/UsersThree';
import './quick-actions.css';

const links = [
  { label: 'Learning at SRSS', href: '/learning', Icon: BookOpen, tone: 'gold' },
  { label: 'Student Hub', href: '/hub/student', Icon: Student, tone: 'violet', hub: true },
  { label: 'News & Events', href: '/resources/news', Icon: Newspaper, tone: 'orange' },
  { label: 'Parent Hub', href: '/hub/parent', Icon: UsersThree, tone: 'rose', hub: true },
  { label: 'Teacher Hub', href: '/hub/teacher', Icon: ChalkboardTeacher, tone: 'blue', hub: true },
  { label: 'Administration Hub', href: '/hub/admin', Icon: Buildings, tone: 'purple', hub: true },
  { label: 'Book a visit', Icon: CalendarBlank, tone: 'green' },
  { label: 'Contact the school', href: '/resources/contact', Icon: Phone, tone: 'navy' },
];

export default function QuickActions({ onVisit }) {
  const [open, setOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const root = useRef(null);
  const toggle = useRef(null);
  const focusLinks = useRef(false);

  useEffect(() => {
    const update = () => setShowTop(window.scrollY > 900);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    if (focusLinks.current) {
      root.current?.querySelector('.quick-action')?.focus();
      focusLinks.current = false;
    }
    const dismiss = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event) => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return <div className="quick-actions" ref={root} onBlur={(event) => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    {!open && showTop && <button type="button" className="quick-actions-top" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}><ArrowUp size={21} weight="bold" aria-hidden="true" /></button>}
    {open && <nav id="quick-actions-links" className="quick-actions-links" aria-label="Quick links">
      {links.map(({ label, href, Icon, tone, hub }, index) => {
        const contents = <><span className="quick-action-label">{label}{hub && <small>Sign in</small>}</span><span className={`quick-action-orb quick-action-${tone}`}><Icon size={24} weight="regular" aria-hidden="true" /></span></>;
        const props = { className: 'quick-action', style: { '--quick-order': links.length - index - 1 }, 'aria-label': hub ? `Sign in to ${label}` : label };
        return href ? <a key={label} {...props} href={href} onClick={() => setOpen(false)}>{contents}</a> : <button key={label} {...props} type="button" onClick={() => { setOpen(false); onVisit(); }}>{contents}</button>;
      })}
    </nav>}
    <button ref={toggle} type="button" className={`quick-action-toggle${open ? ' is-open' : ''}`} onClick={(event) => { focusLinks.current = !open && event.detail === 0; setOpen((current) => !current); }} aria-expanded={open} aria-controls={open ? 'quick-actions-links' : undefined} aria-label={open ? 'Close quick links' : 'Open quick links'}><Plus size={27} weight="bold" aria-hidden="true" /></button>
  </div>;
}
