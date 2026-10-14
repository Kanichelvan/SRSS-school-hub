import React, { useState } from 'react';
import { Icon } from '../icons/Icon.jsx';

/** ArrowLink — the SRSS text CTA: label, arrow, gold rule that grows on hover. */
export function ArrowLink({
  children, href = '#', tone = 'navy', size = 'md',
  icon = 'arrow-right', underline = true, style, ...rest
}) {
  const [hover, setHover] = useState(false);
  const tones = {
    navy: { color: 'var(--navy-800)', rule: 'var(--gold-500)' },
    onNavy: { color: 'var(--white)', rule: 'var(--gold-400)' },
    gold: { color: 'var(--gold-300)', rule: 'var(--gold-400)' },
  };
  const c = tones[tone] || tones.navy;
  const font = size === 'sm' ? 'var(--text-body-sm)' : 'var(--text-body-md)';

  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', flexDirection: 'column', gap: '6px',
        textDecoration: 'none', color: c.color, width: 'fit-content', ...style,
      }}
      {...rest}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)', font: `var(--fw-semibold) ${font}/1.3 var(--font-body)` }}>
        {children}
        <Icon name={icon} size={size === 'sm' ? 16 : 18} style={{ transform: hover ? 'translateX(4px)' : 'none', transition: 'transform var(--dur-base) var(--ease-out)' }} />
      </span>
      {underline && (
        <span style={{
          height: 'var(--stroke-underline)', background: c.rule,
          width: hover ? '100%' : '72%', transition: 'width var(--dur-base) var(--ease-out)',
        }} />
      )}
    </a>
  );
}
