import React from 'react';

/** PullQuote — Swami or community quotation, italic serif with a gold rule. */
export function PullQuote({ children, attribution, tone = 'navy', align = 'left', size = 'md', style, ...rest }) {
  const onNavy = tone === 'navy';
  const s = size === 'lg' ? 'var(--text-display-sm)' : size === 'sm' ? 'var(--text-h3)' : 'var(--text-h1)';
  return (
    <figure style={{
      margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-5)',
      textAlign: align, alignItems: align === 'center' ? 'center' : 'flex-start',
      borderLeft: align === 'left' ? 'var(--stroke-rule) solid var(--gold-500)' : 'none',
      paddingLeft: align === 'left' ? 'var(--space-8)' : 0, ...style,
    }} {...rest}>
      <blockquote style={{
        margin: 0, maxWidth: '34ch', fontStyle: 'italic',
        font: `italic var(--fw-regular) ${s}/var(--lh-heading) var(--font-display)`,
        color: onNavy ? 'var(--white)' : 'var(--navy-800)',
      }}>{children}</blockquote>
      {attribution && (
        <figcaption style={{ font: 'var(--fw-semibold) var(--text-eyebrow)/1.3 var(--font-body)', letterSpacing: 'var(--ls-eyebrow)', textTransform: 'uppercase', color: onNavy ? 'var(--gold-300)' : 'var(--gold-600)' }}>
          {attribution}
        </figcaption>
      )}
    </figure>
  );
}
