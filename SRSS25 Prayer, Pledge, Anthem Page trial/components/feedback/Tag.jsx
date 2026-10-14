import React, { useState } from 'react';

/** Tag — filterable topic chip (story categories, year groups). */
export function Tag({ children, active = false, tone = 'light', onClick, style, ...rest }) {
  const [hover, setHover] = useState(false);
  const onNavy = tone === 'navy';
  const bg = active ? (onNavy ? 'var(--gold-400)' : 'var(--navy-800)') : hover ? (onNavy ? 'rgba(255,255,255,.08)' : 'var(--cream-100)') : 'transparent';
  const fg = active ? (onNavy ? 'var(--navy-800)' : 'var(--white)') : onNavy ? 'var(--white)' : 'var(--navy-700)';
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        padding: '8px 16px', font: 'var(--fw-medium) var(--text-body-sm)/1.2 var(--font-body)',
        color: fg, background: bg,
        border: `1px solid ${active ? 'transparent' : onNavy ? 'var(--border-hairline-navy)' : 'var(--border-hairline)'}`,
        borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'var(--transition-control)', ...style,
      }} {...rest}>{children}</button>
  );
}
