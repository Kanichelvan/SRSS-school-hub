import React, { useState } from 'react';
import { Crest } from '../brand/Crest.jsx';
import { Button } from '../actions/Button.jsx';
import { IconButton } from '../actions/IconButton.jsx';

/**
 * SiteHeader — the SRSS masthead: crest lockup left, nav right,
 * search / Parent Hub / gold-outlined Admissions button.
 *
 * The bar is a single no-wrap row, so it tightens itself as the nav grows:
 * past five items it drops the tagline, shrinks the crest and closes the gaps
 * rather than letting the lockup wrap and spill over the ticker above.
 */
export function SiteHeader({
  nav = ['About', 'Learning', 'School Life', 'Values', 'Community'],
  active, onNavigate, crestSrc = 'assets/logo-srss-crest.png',
  ctaLabel = 'Admissions & Visits', denseCtaLabel = 'Admissions', onCta, compact = false, style, ...rest
}) {
  const [hovered, setHovered] = useState(null);
  const dense = compact || nav.length > 5;
  const navFont = dense ? '15px' : 'var(--text-body-md)';

  return (
    <header style={{
      display: 'flex', alignItems: 'center', flexWrap: 'nowrap',
      gap: dense ? 'var(--space-6)' : 'var(--space-10)',
      minHeight: compact ? 76 : 'var(--header-h)',
      padding: '0 var(--space-8)', background: 'var(--navy-800)', ...style,
    }} {...rest}>
      <Crest size={dense ? 48 : 60} lockup={dense ? 'name' : 'full'} tone="onNavy" src={crestSrc} />

      <nav style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: dense ? 'var(--space-4)' : 'var(--space-8)', marginLeft: 'auto' }}>
        {nav.map((item) => {
          const on = hovered === item || active === item;
          return (
            <a key={item} href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate(item); }}
              onMouseEnter={() => setHovered(item)} onMouseLeave={() => setHovered(null)}
              style={{
                textDecoration: 'none', paddingBottom: '5px', whiteSpace: 'nowrap',
                font: `var(--fw-medium) ${navFont}/1 var(--font-body)`,
                color: on ? 'var(--gold-300)' : 'var(--white)',
                borderBottom: `var(--stroke-underline) solid ${active === item ? 'var(--gold-400)' : 'transparent'}`,
                transition: 'var(--transition-control)',
              }}>{item}</a>
          );
        })}
      </nav>

      <span style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: dense ? 'var(--space-4)' : 'var(--space-5)' }}>
        <IconButton icon="search" label="Search" tone="onNavy" size={44} />
        <span style={{ width: 1, height: 26, flex: '0 0 auto', background: 'var(--border-hairline-navy)' }} />
        <a href="#" style={{ textDecoration: 'none', whiteSpace: 'nowrap', font: `var(--fw-medium) ${navFont}/1 var(--font-body)`, color: 'var(--white)' }}>Parent Hub</a>
        <Button variant="outline" size={dense ? 'sm' : 'md'} onClick={onCta} style={{ whiteSpace: 'nowrap' }}>{dense ? denseCtaLabel : ctaLabel}</Button>
      </span>
    </header>
  );
}
