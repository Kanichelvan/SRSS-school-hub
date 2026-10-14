const Band = window.Band;
const { JubileeMark, SectionHeading, StatBlock, Eyebrow, Badge, Button, ArrowLink, ValueSpectrum, Breadcrumbs, PullQuote } = window.SRSS25DesignSystem_f05209;

const TIMELINE = [
  ['2002', 'SRSS opens in Kuala Lumpur', 'The first intake of pupils begins a values-based primary education built on the Head, Heart and Hands.'],
  ['2009', 'The five values enter the daily timetable', 'Silent sitting and value reflection become fixed points of every school day, not occasional assemblies.'],
  ['2016', 'Community service becomes a school habit', 'Every year group adopts an ongoing service commitment beyond the school gate.'],
  ['2023', 'Alumni network formalised', 'Two decades of former pupils reconnect as mentors, speakers and visiting teachers.'],
  ['2027', '25 Years of Human Excellence', 'The Silver Jubilee year: a celebration of a quarter-century of character, and a commitment to the next.'],
];

function JubileeScreen({ onNavigate }) {
  return (
    <>
      <section style={{ background: 'var(--gradient-navy-depth)', padding: 'var(--space-8) var(--space-8) var(--space-24)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
          <Breadcrumbs tone="navy" items={[{ label: 'Home', href: '#' }, 'Silver Jubilee']} />
          <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: 'var(--space-16)', alignItems: 'center' }}>
            <img src={window.ASSETS + 'logo-srss25-jubilee.png'} alt="SRSS25 Silver Jubilee emblem" style={{ width: 260, height: 260, objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', alignItems: 'flex-start' }}>
              <Badge tone="onNavy">Silver Jubilee · 2027</Badge>
              <h1 style={{ margin: 0, font: 'var(--fw-bold) var(--text-display-xl)/1.02 var(--font-display)', letterSpacing: 'var(--ls-display)', color: 'var(--white)' }}>
                <span style={{ background: 'var(--gradient-silver-foil)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>25 Years</span><br />of Human Excellence
              </h1>
              <p style={{ margin: 0, maxWidth: '54ch', font: 'var(--fw-regular) var(--text-body-lg)/var(--lh-body) var(--font-body)', color: 'var(--text-on-navy-body)' }}>
                Sekolah Rendah Sathya Sai opened its doors in 2002. In 2027 we mark twenty-five years of drawing out the best within every child — and invite every family, teacher and alumnus who built it to celebrate with us.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-10)', flexWrap: 'wrap' }}>
                <Button size="lg" icon="arrow-right" onClick={() => onNavigate('Admissions')}>Register your interest</Button>
                <ArrowLink tone="onNavy" icon="download">Download the jubilee brief</ArrowLink>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ValueSpectrum variant="rule" height={6} />

      <Band tone="cream-alt" pad="var(--space-16) var(--space-8)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 'var(--space-8)' }}>
          <StatBlock tone="light" value="25" label="Years" sublabel="2002 – 2027" />
          <StatBlock tone="light" value="5" label="Human values" sublabel="At the centre of every day" />
          <StatBlock tone="light" value="1" label="Campus" sublabel="Kuala Lumpur, Malaysia" />
          <StatBlock tone="light" value="2027" label="Jubilee year" sublabel="Celebrations across the year" />
        </div>
      </Band>

      <Band tone="cream">
        <SectionHeading eyebrow="A quarter-century" title="How SRSS grew" maxWidth={640} style={{ marginBottom: 'var(--space-12)' }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {TIMELINE.map(([year, title, body], i) => (
            <div key={year} style={{ display: 'grid', gridTemplateColumns: '150px minmax(0,1fr)', gap: 'var(--space-10)', padding: 'var(--space-8) 0', borderTop: 'var(--stroke-hairline) solid var(--border-hairline)' }}>
              <span style={{ font: 'var(--fw-bold) var(--text-display-sm)/1 var(--font-display)', color: i === TIMELINE.length - 1 ? 'var(--gold-600)' : 'var(--navy-800)' }}>{year}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <h3 style={{ margin: 0, font: 'var(--fw-semibold) var(--text-h3)/1.25 var(--font-display)', color: 'var(--navy-800)' }}>{title}</h3>
                <p style={{ margin: 0, maxWidth: '68ch', font: 'var(--fw-regular) var(--text-body-md)/var(--lh-body) var(--font-body)', color: 'var(--text-body)' }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </Band>

      <Band tone="navy">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-20)', alignItems: 'center' }}>
          <PullQuote tone="navy" attribution="SRSS25 committee">
            A school is twenty-five years of children, not twenty-five years of buildings.
          </PullQuote>
          <JubileeMark size={150} lockup="stacked" tone="onNavy" src={window.ASSETS + 'logo-srss25-jubilee.png'} />
        </div>
      </Band>
    </>
  );
}
Object.assign(window, { JubileeScreen });
