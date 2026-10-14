import React from 'react';
import { Icon } from '../icons/Icon.jsx';

const TONES = {
  info: { icon: 'info', accent: 'var(--value-peace)', bg: '#EEF3FB' },
  gold: { icon: 'sparkles', accent: 'var(--gold-600)', bg: 'var(--gold-100)' },
  success: { icon: 'check-circle', accent: 'var(--status-success)', bg: '#E7F2EB' },
  warning: { icon: 'alert-triangle', accent: 'var(--status-warning)', bg: '#FBF0DC' },
  danger: { icon: 'alert-circle', accent: 'var(--status-danger)', bg: '#FBE9E9' },
};

/** Notice — inline message band. Top gold/colour rule, no left-border stripe. */
export function Notice({ title, children, tone = 'info', style, ...rest }) {
  const c = TONES[tone] || TONES.info;
  return (
    <div role="status" style={{ background: c.bg, borderTop: `var(--stroke-rule) solid ${c.accent}`, padding: 'var(--space-5) var(--space-6)', display: 'flex', gap: 'var(--space-4)', ...style }} {...rest}>
      <span style={{ color: c.accent, marginTop: 2 }}><Icon name={c.icon} size={20} /></span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {title && <span style={{ font: 'var(--fw-semibold) var(--text-body-md)/1.4 var(--font-body)', color: 'var(--navy-800)' }}>{title}</span>}
        <span style={{ font: 'var(--fw-regular) var(--text-body-sm)/var(--lh-body) var(--font-body)', color: 'var(--ink-700)' }}>{children}</span>
      </span>
    </div>
  );
}
