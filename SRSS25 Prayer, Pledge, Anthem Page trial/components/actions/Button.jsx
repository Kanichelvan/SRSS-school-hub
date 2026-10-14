import React, { useState } from 'react';
import { Icon } from '../icons/Icon.jsx';

const SIZES = {
  sm: { pad: '10px 18px', font: 'var(--text-body-sm)', icon: 16 },
  md: { pad: '15px 26px', font: 'var(--text-body-md)', icon: 18 },
  lg: { pad: '18px 32px', font: 'var(--text-body-lg)', icon: 20 },
};

/** Button — SRSS's primary action. Gold fill on navy, squared corners. */
export function Button({
  variant = 'primary', size = 'md', icon, iconPosition = 'end',
  fullWidth = false, disabled = false, children, style, ...rest
}) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const s = SIZES[size] || SIZES.md;

  const skins = {
    primary: {
      background: press ? 'var(--action-primary-bg-active)' : hover ? 'var(--action-primary-bg-hover)' : 'var(--action-primary-bg)',
      color: 'var(--action-primary-fg)',
      border: '1px solid transparent',
      boxShadow: hover && !press ? 'var(--shadow-gold)' : 'var(--shadow-none)',
    },
    outline: {
      background: hover ? 'rgba(217,179,65,.12)' : 'transparent',
      color: 'var(--action-secondary-fg)',
      border: '1px solid var(--action-secondary-border)',
    },
    'outline-ink': {
      background: hover ? 'var(--cream-100)' : 'transparent',
      color: 'var(--navy-700)',
      border: '1px solid var(--navy-700)',
    },
    ghost: {
      background: hover ? 'var(--cream-100)' : 'transparent',
      color: 'var(--action-quiet-fg)',
      border: '1px solid transparent',
    },
    solid: {
      background: press ? 'var(--navy-900)' : hover ? 'var(--navy-700)' : 'var(--navy-800)',
      color: 'var(--white)',
      border: '1px solid transparent',
    },
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        display: fullWidth ? 'flex' : 'inline-flex',
        width: fullWidth ? '100%' : undefined,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-3)',
        padding: s.pad,
        font: `var(--fw-semibold) ${s.font}/1 var(--font-body)`,
        letterSpacing: '0.01em',
        borderRadius: 'var(--radius-sm)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.42 : 1,
        transform: press && !disabled ? 'scale(var(--press-scale))' : 'none',
        transition: 'var(--transition-control), transform var(--dur-instant) var(--ease-out)',
        ...(skins[variant] || skins.primary),
        ...style,
      }}
      {...rest}
    >
      {icon && iconPosition === 'start' && <Icon name={icon} size={s.icon} />}
      {children}
      {icon && iconPosition === 'end' && (
        <Icon name={icon} size={s.icon} style={{ transform: hover ? 'translateX(3px)' : 'none', transition: 'transform var(--dur-base) var(--ease-out)' }} />
      )}
    </button>
  );
}
