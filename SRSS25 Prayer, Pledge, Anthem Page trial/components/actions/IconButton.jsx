import React, { useState } from 'react';
import { Icon } from '../icons/Icon.jsx';

/** IconButton — square or circular glyph-only control (search, menu, social). */
export function IconButton({
  icon = 'search', label, shape = 'square', tone = 'onNavy',
  size = 44, disabled = false, style, ...rest
}) {
  const [hover, setHover] = useState(false);
  const tones = {
    onNavy: { color: 'var(--white)', bg: hover ? 'rgba(255,255,255,.10)' : 'transparent', border: 'transparent' },
    onNavyRing: { color: 'var(--white)', bg: hover ? 'rgba(255,255,255,.10)' : 'transparent', border: 'var(--border-hairline-navy)' },
    gold: { color: hover ? 'var(--gold-200)' : 'var(--gold-300)', bg: 'transparent', border: 'transparent' },
    ink: { color: 'var(--navy-700)', bg: hover ? 'var(--cream-100)' : 'transparent', border: 'transparent' },
  };
  const c = tones[tone] || tones.onNavy;
  return (
    <button
      type="button" aria-label={label || icon} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: c.color, background: c.bg, border: `1px solid ${c.border}`,
        borderRadius: shape === 'circle' ? 'var(--radius-pill)' : 'var(--radius-sm)',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.42 : 1,
        transition: 'var(--transition-control)', ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={Math.round(size * 0.48)} />
    </button>
  );
}
