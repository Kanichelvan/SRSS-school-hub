import React from 'react';

/** Eyebrow — uppercase, wide-tracked kicker that sits above every SRSS heading. */
export function Eyebrow({ children, tone = 'gold', size = 'md', style, ...rest }) {
  const tones = { gold: 'var(--gold-300)', goldInk: 'var(--gold-600)', onNavy: 'rgba(255,255,255,.62)', navy: 'var(--navy-500)' };
  return (
    <span style={{
      display: 'block',
      font: `var(--fw-semibold) ${size === 'sm' ? 'var(--text-eyebrow-sm)' : 'var(--text-eyebrow)'}/1.3 var(--font-body)`,
      letterSpacing: 'var(--ls-eyebrow)', textTransform: 'uppercase',
      color: tones[tone] || tones.gold, ...style,
    }} {...rest}>{children}</span>
  );
}
