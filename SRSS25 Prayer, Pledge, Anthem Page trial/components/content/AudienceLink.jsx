import React, { useState } from 'react';
import { Icon } from '../icons/Icon.jsx';

/** AudienceLink — one cell of the "For Parents / Students / Teachers / Community" row. */
export function AudienceLink({ title, body, href = '#', tone = 'light', divider = true, style, ...rest }) {
  const [hover, setHover] = useState(false);
  const onNavy = tone === 'navy';
  return (
    <a href={href} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-5)',
        padding: 'var(--space-6) var(--space-8)', textDecoration: 'none',
        borderLeft: divider ? `var(--stroke-hairline) solid ${onNavy ? 'var(--border-hairline-navy)' : 'var(--border-hairline)'}` : 'none',
        background: hover ? (onNavy ? 'rgba(255,255,255,.04)' : 'var(--cream-100)') : 'transparent',
        transition: 'background-color var(--dur-fast) var(--ease-out)', ...style,
      }} {...rest}>
      <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ font: 'var(--fw-semibold) var(--text-h4)/1.25 var(--font-display)', color: onNavy ? 'var(--white)' : 'var(--navy-800)' }}>{title}</span>
        <span style={{ font: 'var(--fw-regular) var(--text-body-sm)/1.4 var(--font-body)', color: onNavy ? 'var(--text-on-navy-muted)' : 'var(--text-muted)' }}>{body}</span>
      </span>
      <Icon name="chevron-right" size={20} style={{ color: onNavy ? 'var(--gold-300)' : 'var(--navy-600)', transform: hover ? 'translateX(3px)' : 'none', transition: 'transform var(--dur-base) var(--ease-out)' }} />
    </a>
  );
}
