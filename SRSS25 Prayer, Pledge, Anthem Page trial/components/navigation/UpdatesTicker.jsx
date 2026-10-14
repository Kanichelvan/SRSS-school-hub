import React, { useState } from 'react';
import { Icon } from '../icons/Icon.jsx';

/**
 * UpdatesTicker — the thin navy strip above the masthead carrying one dated
 * announcement at a time, with a pause control and a "View all" link.
 */
export function UpdatesTicker({ label = 'Updates', date, message, linkLabel = 'View all updates', href = '#', paused = false, onTogglePause, style, ...rest }) {
  const [hover, setHover] = useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-6)',
      height: 'var(--ticker-h)', padding: '0 var(--space-8)',
      background: 'var(--navy-900)', borderBottom: 'var(--stroke-hairline) solid rgba(255,255,255,.08)', ...style,
    }} {...rest}>
      <span style={{ font: 'var(--fw-semibold) var(--text-eyebrow-sm)/1 var(--font-body)', letterSpacing: 'var(--ls-eyebrow)', textTransform: 'uppercase', color: 'var(--gold-300)' }}>{label}</span>
      <button type="button" aria-label={paused ? 'Resume updates' : 'Pause updates'} onClick={onTogglePause}
        style={{ display: 'inline-flex', background: 'none', border: 0, padding: 0, cursor: 'pointer', color: 'var(--white)', opacity: 0.8 }}>
        <Icon name={paused ? 'play' : 'pause'} size={13} />
      </button>
      <span style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-4)', minWidth: 0, flex: 1 }}>
        {date && <span style={{ font: 'var(--fw-medium) var(--text-body-sm)/1 var(--font-body)', color: 'var(--white)', whiteSpace: 'nowrap' }}>{date}</span>}
        <span style={{ font: 'var(--fw-regular) var(--text-body-sm)/1 var(--font-body)', color: 'var(--text-on-navy-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{message}</span>
      </span>
      <a href={href} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', textDecoration: 'none', whiteSpace: 'nowrap', font: 'var(--fw-semibold) var(--text-body-sm)/1 var(--font-body)', color: hover ? 'var(--gold-200)' : 'var(--gold-300)' }}>
        {linkLabel}<Icon name="chevron-right" size={15} />
      </a>
    </div>
  );
}
