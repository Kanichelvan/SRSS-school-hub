import React from 'react';

/**
 * PillarCard — one of three or four value propositions shown in a row,
 * separated by vertical hairlines rather than boxed in cards.
 */
export function PillarCard({ title, body, align = 'center', tone = 'light', divider = true, style, ...rest }) {
  const onNavy = tone === 'navy';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
      textAlign: align, alignItems: align === 'center' ? 'center' : 'flex-start',
      padding: '0 var(--space-8)',
      borderLeft: divider ? `var(--stroke-hairline) solid ${onNavy ? 'var(--border-hairline-navy)' : 'var(--border-hairline)'}` : 'none',
      ...style,
    }} {...rest}>
      <h3 style={{ margin: 0, font: 'var(--fw-semibold) var(--text-h3)/var(--lh-heading) var(--font-display)', color: onNavy ? 'var(--white)' : 'var(--navy-800)' }}>{title}</h3>
      <p style={{ margin: 0, maxWidth: '34ch', font: 'var(--fw-regular) var(--text-body-sm)/var(--lh-body) var(--font-body)', color: onNavy ? 'var(--text-on-navy-body)' : 'var(--text-muted)' }}>{body}</p>
    </div>
  );
}
