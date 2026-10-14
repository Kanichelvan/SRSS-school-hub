const Band = window.Band;
const { SectionHeading, Input, Select, Checkbox, Button, Notice, Breadcrumbs, Eyebrow, StatBlock, ValueSpectrum, PillarCard } = window.SRSS25DesignSystem_f05209;

function AdmissionsScreen() {
  const [sent, setSent] = React.useState(false);
  const [tour, setTour] = React.useState(true);
  return (
    <>
      <section style={{ background: 'var(--navy-800)', padding: 'var(--space-8) var(--space-8) var(--space-16)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
          <Breadcrumbs tone="navy" items={[{ label: 'Home', href: '#' }, 'Admissions & Visits']} />
          <SectionHeading tone="navy" eyebrow="Admissions · Intake 2027" title="Come and see" accent="an ordinary school day" standfirst="The best way to understand SRSS is to stand in a corridor at 7.30am. Arrange a visit and we will show you the school as it actually runs." size="lg" maxWidth={760} />
        </div>
      </section>
      <ValueSpectrum variant="rule" height={5} />

      <Band tone="cream">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)', gap: 'var(--space-20)', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            <Notice tone="gold" title="Applications for the 2027 intake are open">
              Online registration closes 15 August 2026. Onsite registration is not available — please apply early so we can plan properly.
            </Notice>
            <SectionHeading eyebrow="What happens next" title="Three steps, no mystery" size="sm" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
              <PillarCard divider={false} align="left" title="1 · Visit" body="A 90-minute weekday visit: assembly, two classrooms, and time with a teacher." />
              <PillarCard align="left" title="2 · Conversation" body="A relaxed meeting with the school leadership about your child and your hopes." />
              <PillarCard align="left" title="3 · Offer" body="Written outcome within two weeks, with a clear place and start date." />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-16)', paddingTop: 'var(--space-6)', borderTop: 'var(--stroke-hairline) solid var(--border-hairline)' }}>
              <StatBlock tone="light" value="90" label="Minutes" sublabel="Typical school visit" />
              <StatBlock tone="light" value="2" label="Weeks" sublabel="To a written outcome" />
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            style={{ background: 'var(--white)', boxShadow: 'var(--shadow-md)', padding: 'var(--space-10)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <Eyebrow tone="goldInk">Arrange a visit</Eyebrow>
            <h3 style={{ margin: '0 0 var(--space-2)', font: 'var(--fw-semibold) var(--text-h2)/1.2 var(--font-display)', color: 'var(--navy-800)' }}>Request a school visit</h3>
            {sent ? (
              <Notice tone="success" title="Request received">
                Thank you. The school office will confirm your visit within two working days.
              </Notice>
            ) : (
              <>
                <Input label="Child's full name" required placeholder="As per birth certificate" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <Select label="Year of entry" required options={['2027', '2028', '2029']} />
                  <Select label="Preferred day" options={['Tuesday', 'Thursday']} />
                </div>
                <Input label="Parent or guardian" required placeholder="Full name" />
                <Input label="Email" type="email" required placeholder="you@example.com" hint="We reply within two working days." />
                <Checkbox checked={tour} onChange={(e) => setTour(e.target.checked)} label="I would like a guided campus tour" description="Tours run Tuesdays and Thursdays, 9 – 11am." />
                <Button type="submit" icon="arrow-right" fullWidth style={{ marginTop: 'var(--space-2)' }}>Request a visit</Button>
              </>
            )}
          </form>
        </div>
      </Band>
    </>
  );
}
Object.assign(window, { AdmissionsScreen });
