const { UpdatesTicker, SiteHeader, SiteFooter } = window.SRSS25DesignSystem_f05209;

const CREST = '../../assets/logo-srss-crest.png';

const UPDATES = [
  { date: '20 Jul 2026', message: 'Discover school life, upcoming dates and the latest news from the SRSS community.' },
  { date: '15 Jul 2026', message: 'SRSS Primary Science Week 2026 runs from 21 – 25 July. Parents are welcome to visit our Open Classroom sessions.' },
  { date: '02 Jul 2026', message: 'Silver Jubilee planning begins — the SRSS25 committee invites alumni to register their interest.' },
];

function Shell({ active, onNavigate, children }) {
  const [i, setI] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  React.useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % UPDATES.length), 6000);
    return () => clearInterval(t);
  }, [paused]);
  const u = UPDATES[i];
  return (
    <div style={{ background: 'var(--navy-800)', minHeight: '100%' }}>
      <UpdatesTicker date={u.date} message={u.message} paused={paused} onTogglePause={() => setPaused((p) => !p)} />
      <SiteHeader nav={['About', 'Learning', 'School Life', 'Values', 'Resources', 'Community']} active={active} onNavigate={onNavigate} crestSrc={CREST} onCta={() => onNavigate('Admissions')} />
      <main>{children}</main>
      <SiteFooter crestSrc={CREST} />
    </div>
  );
}

const Band = ({ tone = 'cream', pad = 'var(--space-24) var(--space-8)', children, style }) => (
  <section style={{ background: tone === 'cream' ? 'var(--cream-50)' : tone === 'cream-alt' ? 'var(--cream-100)' : 'var(--navy-800)', padding: pad, ...style }}>
    <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>{children}</div>
  </section>
);

Object.assign(window, { Shell, Band, CREST, ASSETS: '../../assets/' });
