import React from 'react';

const VALUES = [
  { en: 'Truth', ms: 'Kebenaran', color: 'var(--value-truth)' },
  { en: 'Right Conduct', ms: 'Kesucian', color: 'var(--value-conduct)' },
  { en: 'Peace', ms: 'Keamanan', color: 'var(--value-peace)' },
  { en: 'Love', ms: 'Cinta', color: 'var(--value-love)' },
  { en: 'Non-Violence', ms: 'Tanpa Kekerasan', color: 'var(--value-nonviolence)' },
];

/**
 * ValueSpectrum — the five Human Values in their crest colours. Renders as a
 * labelled row, a bare colour rule, or a stacked list.
 */
export function ValueSpectrum({ variant = 'row', tone = 'navy', bilingual = true, height = 6, style, ...rest }) {
  const onNavy = tone === 'navy';
  if (variant === 'rule') {
    return <div role="presentation" style={{ height, background: 'var(--gradient-values-spectrum)', ...style }} {...rest} />;
  }
  const stacked = variant === 'stack';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: stacked ? '1fr' : `repeat(${VALUES.length}, 1fr)`, gap: stacked ? 'var(--space-4)' : 'var(--space-5)', ...style }} {...rest}>
      {VALUES.map((v) => (
        <div key={v.en} style={{ display: 'flex', flexDirection: stacked ? 'row' : 'column', alignItems: stacked ? 'center' : 'flex-start', gap: stacked ? 'var(--space-4)' : 'var(--space-3)' }}>
          <span style={{ width: stacked ? 14 : '100%', height: stacked ? 14 : height, background: v.color, borderRadius: stacked ? 'var(--radius-pill)' : 0, flex: '0 0 auto' }} />
          <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ font: 'var(--fw-semibold) var(--text-body-sm)/1.3 var(--font-body)', color: onNavy ? 'var(--white)' : 'var(--navy-800)' }}>{v.en}</span>
            {bilingual && <span style={{ font: 'var(--fw-regular) var(--text-caption)/1.3 var(--font-body)', color: onNavy ? 'var(--text-on-navy-muted)' : 'var(--text-muted)' }}>{v.ms}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}
