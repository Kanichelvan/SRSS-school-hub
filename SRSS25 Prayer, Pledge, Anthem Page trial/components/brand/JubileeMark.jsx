import React from 'react';

/**
 * JubileeMark — the SRSS25 Silver Jubilee emblem (six-petal bloom, silver 25).
 * Pair with the "25 Years of Human Excellence" line for jubilee surfaces.
 */
export function JubileeMark({ size = 96, lockup = 'mark', tone = 'onNavy', src = 'assets/logo-srss25-jubilee.png', style, ...rest }) {
  const onNavy = tone === 'onNavy';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', ...style }} {...rest}>
      <img src={src} alt="SRSS25 Silver Jubilee emblem" style={{ width: size, height: size, objectFit: 'contain' }} />
      {lockup === 'stacked' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ font: 'var(--fw-semibold) var(--text-eyebrow)/1 var(--font-body)', letterSpacing: 'var(--ls-eyebrow)', textTransform: 'uppercase', color: onNavy ? 'var(--gold-300)' : 'var(--gold-600)' }}>
            Silver Jubilee · 2027
          </span>
          <span style={{ font: 'var(--fw-semibold) var(--text-display-sm)/1.05 var(--font-display)', color: onNavy ? 'var(--white)' : 'var(--navy-800)' }}>
            25 Years of<br />Human Excellence
          </span>
        </div>
      )}
    </div>
  );
}
