import React from 'react';

/**
 * Wordmark — type-only SRSS lockup for tight spaces where the crest
 * cannot be reproduced legibly (favicons, small footers, single-colour print).
 */
export function Wordmark({ variant = 'srss25', tone = 'onNavy', size = 34, style, ...rest }) {
  const onNavy = tone === 'onNavy';
  const ink = onNavy ? 'var(--white)' : 'var(--navy-800)';
  const accent = onNavy ? 'var(--gold-300)' : 'var(--gold-600)';
  if (variant === 'srss25') {
    return (
      <span style={{ font: `var(--fw-bold) ${size}px/1 var(--font-display)`, letterSpacing: '0.01em', color: ink, ...style }} {...rest}>
        SRSS<span style={{ color: accent }}>25</span>
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: '2px', ...style }} {...rest}>
      <span style={{ font: `var(--fw-semibold) ${size}px/1.05 var(--font-display)`, letterSpacing: 'var(--ls-caps-serif)', textTransform: 'uppercase', color: ink }}>Sekolah Rendah Sathya Sai</span>
      <span style={{ font: `var(--fw-medium) ${Math.round(size * 0.4)}px/1.2 var(--font-body)`, color: accent }}>Human Excellence · Kecemerlangan Insan</span>
    </span>
  );
}
