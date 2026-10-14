import React from 'react';
import { Icon } from '../icons/Icon.jsx';

/** Breadcrumbs — interior-page trail. Current page is not a link. */
export function Breadcrumbs({ items = [], tone = 'light', style, ...rest }) {
  const onNavy = tone === 'navy';
  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', ...style }} {...rest}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={(it.label || it) + i}>
            {last
              ? <span aria-current="page" style={{ font: 'var(--fw-semibold) var(--text-body-sm)/1.4 var(--font-body)', color: onNavy ? 'var(--white)' : 'var(--navy-800)' }}>{it.label || it}</span>
              : <a href={it.href || '#'} style={{ textDecoration: 'none', font: 'var(--fw-regular) var(--text-body-sm)/1.4 var(--font-body)', color: onNavy ? 'var(--text-on-navy-muted)' : 'var(--text-muted)' }}>{it.label || it}</a>}
            {!last && <Icon name="chevron-right" size={14} style={{ color: onNavy ? 'rgba(255,255,255,.4)' : 'var(--ink-300)' }} />}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
