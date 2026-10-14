import React from 'react';
import { Eyebrow } from './Eyebrow.jsx';

/** SectionHeading — eyebrow + serif display heading + optional standfirst. */
export function SectionHeading({
  eyebrow, title, accent, standfirst, align = 'left',
  tone = 'light', size = 'md', maxWidth, style, ...rest
}) {
  const onNavy = tone === 'navy';
  const sizes = { sm: 'var(--text-display-sm)', md: 'var(--text-display-md)', lg: 'var(--text-display-lg)', xl: 'var(--text-display-xl)' };
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 'var(--space-5)',
      textAlign: align, alignItems: align === 'center' ? 'center' : 'flex-start',
      maxWidth, ...style,
    }} {...rest}>
      {eyebrow && <Eyebrow tone={onNavy ? 'gold' : 'goldInk'}>{eyebrow}</Eyebrow>}
      <h2 style={{
        margin: 0, font: `var(--fw-semibold) ${sizes[size] || sizes.md}/var(--lh-display) var(--font-display)`,
        letterSpacing: 'var(--ls-display)', color: onNavy ? 'var(--white)' : 'var(--navy-800)',
      }}>
        {title}
        {accent && <><br /><span style={{ color: onNavy ? 'var(--gold-300)' : 'var(--gold-600)' }}>{accent}</span></>}
      </h2>
      {standfirst && (
        <p style={{
          margin: 0, maxWidth: '60ch',
          font: 'var(--fw-regular) var(--text-body-lg)/var(--lh-body) var(--font-body)',
          color: onNavy ? 'var(--text-on-navy-body)' : 'var(--text-body)',
        }}>{standfirst}</p>
      )}
    </div>
  );
}
