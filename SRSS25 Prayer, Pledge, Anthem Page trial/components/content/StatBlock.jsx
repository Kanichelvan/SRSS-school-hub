import React from 'react';

/** StatBlock — a large serif figure with a Poppins label. Used in jubilee bands. */
export function StatBlock({ value, label, sublabel, tone = 'navy', align = 'left', metal, style, ...rest }) {
  const onNavy = tone === 'navy';
  const figure = metal
    ? { background: metal === 'silver' ? 'var(--gradient-silver-foil)' : 'var(--gradient-gold-foil)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }
    : { color: onNavy ? 'var(--white)' : 'var(--navy-800)' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', textAlign: align, alignItems: align === 'center' ? 'center' : 'flex-start', ...style }} {...rest}>
      <span style={{ font: 'var(--fw-bold) var(--text-display-lg)/1 var(--font-display)', letterSpacing: 'var(--ls-display)', ...figure }}>{value}</span>
      <span style={{ font: 'var(--fw-semibold) var(--text-eyebrow)/1.3 var(--font-body)', letterSpacing: 'var(--ls-eyebrow)', textTransform: 'uppercase', color: onNavy ? 'var(--gold-300)' : 'var(--gold-600)' }}>{label}</span>
      {sublabel && <span style={{ font: 'var(--fw-regular) var(--text-body-sm)/var(--lh-snug) var(--font-body)', color: onNavy ? 'var(--text-on-navy-muted)' : 'var(--text-muted)' }}>{sublabel}</span>}
    </div>
  );
}
