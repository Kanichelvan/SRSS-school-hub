import React, { useState } from 'react';
import { Icon } from '../icons/Icon.jsx';

/** Select — native select styled to match Input, with a chevron affordance. */
export function Select({ label, hint, options = [], tone = 'light', required = false, id, style, ...rest }) {
  const [focus, setFocus] = useState(false);
  const onNavy = tone === 'navy';
  const fid = id || `sel-${label ? label.toLowerCase().replace(/\W+/g, '-') : 'field'}`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', ...style }}>
      {label && (
        <label htmlFor={fid} style={{ font: 'var(--fw-semibold) var(--text-eyebrow-sm)/1.3 var(--font-body)', letterSpacing: 'var(--ls-eyebrow)', textTransform: 'uppercase', color: onNavy ? 'var(--gold-300)' : 'var(--navy-600)' }}>
          {label}{required && <span style={{ color: 'var(--value-truth)' }}> *</span>}
        </label>
      )}
      <span style={{ position: 'relative', display: 'block' }}>
        <select id={fid} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            width: '100%', appearance: 'none', font: 'var(--fw-regular) var(--text-body-md)/1.4 var(--font-body)',
            color: onNavy ? 'var(--white)' : 'var(--ink-900)',
            background: onNavy ? 'var(--surface-inset-navy)' : 'var(--white)',
            padding: '13px 42px 13px 15px', borderRadius: 'var(--radius-sm)',
            border: `1px solid ${focus ? 'var(--gold-400)' : onNavy ? 'var(--border-hairline-navy)' : 'var(--border-hairline)'}`,
            boxShadow: focus ? '0 0 0 3px rgba(217,179,65,.25)' : 'none',
            outline: 'none', transition: 'var(--transition-control)',
          }} {...rest}>
          {options.map((o) => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
        </select>
        <Icon name="chevron-down" size={18} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: onNavy ? 'var(--gold-300)' : 'var(--navy-500)', pointerEvents: 'none' }} />
      </span>
      {hint && <span style={{ font: 'var(--fw-regular) var(--text-caption)/1.5 var(--font-body)', color: onNavy ? 'var(--text-on-navy-muted)' : 'var(--text-muted)' }}>{hint}</span>}
    </div>
  );
}
