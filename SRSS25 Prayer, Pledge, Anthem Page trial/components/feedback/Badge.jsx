import React from 'react';

/** Badge — small status pill. Values tones use the crest colours. */
export function Badge({ children, tone = 'gold', style, ...rest }) {
  const tones = {
    gold: { bg: 'var(--gold-100)', fg: 'var(--gold-700)', bd: 'var(--gold-200)' },
    navy: { bg: 'var(--navy-800)', fg: 'var(--white)', bd: 'var(--navy-800)' },
    onNavy: { bg: 'rgba(217,179,65,.16)', fg: 'var(--gold-300)', bd: 'rgba(217,179,65,.42)' },
    silver: { bg: 'var(--silver-200)', fg: 'var(--navy-700)', bd: 'var(--silver-400)' },
    success: { bg: '#E7F2EB', fg: '#0A5C30', bd: '#BCDCC8' },
    warning: { bg: '#FBF0DC', fg: '#8A5A0F', bd: '#EFD6A8' },
    danger: { bg: '#FBE9E9', fg: '#8E1820', bd: '#EFC4C6' },
  };
  const c = tones[tone] || tones.gold;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '5px 11px',
      font: 'var(--fw-semibold) var(--text-eyebrow-sm)/1.2 var(--font-body)',
      letterSpacing: '0.09em', textTransform: 'uppercase',
      color: c.fg, background: c.bg, border: `1px solid ${c.bd}`,
      borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap', ...style,
    }} {...rest}>{children}</span>
  );
}
