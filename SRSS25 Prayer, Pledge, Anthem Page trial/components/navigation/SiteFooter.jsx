import React from 'react';
import { Crest } from '../brand/Crest.jsx';
import { IconButton } from '../actions/IconButton.jsx';
import { ValueSpectrum } from '../content/ValueSpectrum.jsx';

const H = { font: 'var(--fw-semibold) var(--text-eyebrow)/1 var(--font-body)', letterSpacing: 'var(--ls-eyebrow)', textTransform: 'uppercase', color: 'var(--gold-300)', marginBottom: 'var(--space-2)' };

/** SiteFooter — navy footer: crest blurb, contact table, link columns, socials. */
export function SiteFooter({
  blurb = 'A values-based primary school in Kuala Lumpur nurturing academic excellence, strong character and compassionate leadership since 2002.',
  contact = [['Address', 'Sekolah Rendah Sathya Sai, Kuala Lumpur, Malaysia'], ['Phone', '+603 — school office'], ['Email', 'info@srss.edu.my']],
  columns = [{ title: 'Explore', links: ['About SRSS', 'Learning', 'School Life', 'Human Values', 'Silver Jubilee'] }, { title: 'For families', links: ['Admissions & Visits', 'Parent Hub', 'Term calendar', 'Uniform & supplies', 'Contact us'] }],
  socials = ['mail', 'facebook', 'instagram', 'youtube'],
  crestSrc = 'assets/logo-srss-crest.png', style, ...rest
}) {
  return (
    <footer style={{ background: 'var(--navy-900)', ...style }} {...rest}>
      <ValueSpectrum variant="rule" height={4} />
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 'var(--space-16)', padding: 'var(--space-16) var(--space-8) var(--space-10)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Crest size={56} lockup="name" tone="onNavy" src={crestSrc} />
          <p style={{ margin: 0, maxWidth: '44ch', font: 'var(--fw-regular) var(--text-body-sm)/var(--lh-body) var(--font-body)', color: 'var(--text-on-navy-body)' }}>{blurb}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={H}>Contact</div>
            {contact.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 'var(--space-5)' }}>
                <span style={{ width: 92, flex: '0 0 auto', font: 'var(--fw-semibold) var(--text-caption)/1.5 var(--font-body)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold-300)' }}>{k}</span>
                <span style={{ font: 'var(--fw-regular) var(--text-body-sm)/1.5 var(--font-body)', color: 'var(--text-on-navy-body)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.title} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={H}>{col.title}</div>
            {col.links.map((l) => (
              <a key={l} href="#" style={{ textDecoration: 'none', font: 'var(--fw-regular) var(--text-body-sm)/1.9 var(--font-body)', color: 'var(--text-on-navy-body)' }}>{l}</a>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-8)', padding: 'var(--space-6) var(--space-8)', borderTop: 'var(--stroke-hairline) solid var(--border-hairline-navy)' }}>
        <span style={{ font: 'var(--fw-regular) var(--text-caption)/1.5 var(--font-body)', color: 'var(--text-on-navy-muted)' }}>
          © {new Date().getFullYear()} Sekolah Rendah Sathya Sai, Kuala Lumpur · Human Excellence · Kecemerlangan Insan
        </span>
        <span style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {socials.map((s) => <IconButton key={s} icon={s} label={s} shape="circle" tone="onNavyRing" size={44} />)}
        </span>
      </div>
    </footer>
  );
}
