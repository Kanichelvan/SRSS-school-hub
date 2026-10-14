import React from 'react';

/**
 * Crest — the official Sekolah Rendah Sathya Sai seal, optionally locked up
 * with the school name and bilingual tagline. Never redraw or recolour it.
 */
export function Crest({ size = 64, lockup = 'full', tone = 'onNavy', src = 'assets/logo-srss-crest.png', style, ...rest }) {
  const onNavy = tone === 'onNavy';
  const name = onNavy ? 'var(--white)' : 'var(--navy-950)';
  const tag = onNavy ? 'var(--gold-300)' : 'var(--gold-600)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flex: '0 0 auto', ...style }} {...rest}>
      <img src={src} alt="Sekolah Rendah Sathya Sai crest" style={{ width: size, height: size, flex: '0 0 auto', objectFit: 'contain' }} />
      {lockup !== 'mark' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{ whiteSpace: 'nowrap', font: `var(--fw-semibold) ${size >= 56 ? '21px' : '17px'}/1.12 var(--font-display)`, letterSpacing: 'var(--ls-caps-serif)', textTransform: 'uppercase', color: name }}>
            Sekolah Rendah Sathya Sai
          </span>
          <span style={{ whiteSpace: 'nowrap', font: `var(--fw-regular) ${size >= 56 ? '17px' : '14px'}/1.12 var(--font-display)`, letterSpacing: 'var(--ls-caps-serif)', textTransform: 'uppercase', color: name, opacity: 0.92 }}>
            Kuala Lumpur, Malaysia
          </span>
          {lockup === 'full' && (
            <span style={{ whiteSpace: 'nowrap', font: 'var(--fw-medium) var(--text-body-sm)/1.2 var(--font-body)', color: tag, marginTop: '4px' }}>
              Human Excellence&nbsp;&nbsp;·&nbsp;&nbsp;Kecemerlangan Insan
            </span>
          )}
        </div>
      )}
    </div>
  );
}
