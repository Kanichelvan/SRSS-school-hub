import React, { useState } from 'react';
import { Icon } from '../icons/Icon.jsx';

/** Checkbox — 20px square with a gold checked fill. */
export function Checkbox({ label, description, checked, defaultChecked = false, onChange, tone = 'light', disabled = false, style, ...rest }) {
  const [internal, setInternal] = useState(defaultChecked);
  const on = checked === undefined ? internal : checked;
  const onNavy = tone === 'navy';
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1, ...style }}>
      <input type="checkbox" checked={on} disabled={disabled}
        onChange={(e) => { if (checked === undefined) setInternal(e.target.checked); onChange && onChange(e); }}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} {...rest} />
      <span aria-hidden="true" style={{
        width: 20, height: 20, flex: '0 0 auto', marginTop: 2,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 'var(--radius-sm)',
        background: on ? 'var(--gold-400)' : onNavy ? 'var(--surface-inset-navy)' : 'var(--white)',
        border: `1px solid ${on ? 'var(--gold-400)' : onNavy ? 'var(--border-hairline-navy)' : 'var(--border-hairline)'}`,
        color: 'var(--navy-800)', transition: 'var(--transition-control)',
      }}>{on && <Icon name="check" size={14} />}</span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ font: 'var(--fw-regular) var(--text-body-sm)/1.5 var(--font-body)', color: onNavy ? 'var(--white)' : 'var(--ink-800)' }}>{label}</span>
        {description && <span style={{ font: 'var(--fw-regular) var(--text-caption)/1.5 var(--font-body)', color: onNavy ? 'var(--text-on-navy-muted)' : 'var(--text-muted)' }}>{description}</span>}
      </span>
    </label>
  );
}
