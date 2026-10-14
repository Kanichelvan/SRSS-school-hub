import React, { useState } from 'react';
import { Eyebrow } from './Eyebrow.jsx';
import { ArrowLink } from '../actions/ArrowLink.jsx';

/**
 * StoryCard — full-bleed photograph with a navy foot gradient and type laid
 * directly over the image. The SRSS news / reflection unit.
 */
export function StoryCard({ image, kicker, title, body, cta = 'Read the story', href = '#', height = 380, size = 'md', style, ...rest }) {
  const [hover, setHover] = useState(false);
  const titleSize = size === 'lg' ? 'var(--text-display-md)' : size === 'sm' ? 'var(--text-h3)' : 'var(--text-display-sm)';
  return (
    <article
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', overflow: 'hidden', height, background: 'var(--navy-900)', borderRadius: 'var(--radius-none)', ...style }}
      {...rest}
    >
      {image && (
        <img src={image} alt="" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          transform: hover ? 'scale(var(--image-zoom))' : 'scale(1)',
          transition: 'transform var(--dur-slow) var(--ease-out)',
        }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'var(--gradient-photo-foot)' }} />
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 'var(--space-4)', padding: 'var(--space-8)' }}>
        {kicker && <Eyebrow tone="gold">{kicker}</Eyebrow>}
        <h3 style={{ margin: 0, maxWidth: '22ch', font: `var(--fw-semibold) ${titleSize}/var(--lh-display) var(--font-display)`, letterSpacing: 'var(--ls-display)', color: 'var(--white)' }}>{title}</h3>
        {body && <p style={{ margin: 0, maxWidth: '48ch', font: 'var(--fw-regular) var(--text-body-sm)/var(--lh-snug) var(--font-body)', color: 'var(--text-on-navy-body)' }}>{body}</p>}
        {cta && <ArrowLink tone="onNavy" size="sm" icon="arrow-up-right" href={href} underline={false} style={{ marginTop: 'var(--space-1)' }}>{cta}</ArrowLink>}
      </div>
    </article>
  );
}
