const Band = window.Band;
const { SectionHeading, ValueSpectrum, Breadcrumbs, PullQuote, Eyebrow, StoryCard, Button, Tag } = window.SRSS25DesignSystem_f05209;

const DETAIL = [
  { en: 'Truth', ms: 'Kebenaran', color: 'var(--value-truth)', body: 'Pupils learn to say what is so — in their work, with their friends, and about themselves. Honest marking, honest reflection, honest apology.' },
  { en: 'Right Conduct', ms: 'Kesucian', color: 'var(--value-conduct)', body: 'Duty done well and quietly: uniform in order, homework on time, the classroom left better than it was found.' },
  { en: 'Peace', ms: 'Keamanan', color: 'var(--value-peace)', body: 'Two minutes of silent sitting opens every school day. Stillness is taught as a skill, not a mood.' },
  { en: 'Love', ms: 'Cinta', color: 'var(--value-love)', body: 'Care expressed as attention — to a classmate struggling, to a younger pupil lost, to a parent waiting at the gate.' },
  { en: 'Non-Violence', ms: 'Tanpa Kekerasan', color: 'var(--value-nonviolence)', body: 'Gentleness in word and hand, extended to people, to animals and to the school\u2019s own grounds.' },
];

function ValuesScreen({ onNavigate }) {
  const [filter, setFilter] = React.useState('All values');
  const shown = filter === 'All values' ? DETAIL : DETAIL.filter((d) => d.en === filter);
  return (
    <>
      <section style={{ background: 'var(--navy-800)', padding: 'var(--space-8) var(--space-8) var(--space-20)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
          <Breadcrumbs tone="navy" items={[{ label: 'Home', href: '#' }, 'Values']} />
          <SectionHeading tone="navy" eyebrow="Kecemerlangan Insan · Human Excellence" title="Five values, taught" accent="every single day" standfirst="The Human Values are not a subject at SRSS. They are the grammar of the school day — present in assembly, in marking, in the corridor and at the gate." size="lg" maxWidth={820} />
          <ValueSpectrum variant="row" tone="navy" height={6} />
        </div>
      </section>
      <ValueSpectrum variant="rule" height={5} />

      <Band tone="cream">
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-12)' }}>
          {['All values', ...DETAIL.map((d) => d.en)].map((t) => (
            <Tag key={t} active={filter === t} onClick={() => setFilter(t)}>{t}</Tag>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {shown.map((d) => (
            <article key={d.en} style={{ display: 'grid', gridTemplateColumns: '6px 240px minmax(0,1fr)', gap: 'var(--space-8)', padding: 'var(--space-8) 0', borderTop: 'var(--stroke-hairline) solid var(--border-hairline)' }}>
              <span style={{ background: d.color }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <h3 style={{ margin: 0, font: 'var(--fw-semibold) var(--text-h2)/1.15 var(--font-display)', color: 'var(--navy-800)' }}>{d.en}</h3>
                <Eyebrow tone="goldInk" size="sm">{d.ms}</Eyebrow>
              </div>
              <p style={{ margin: 0, maxWidth: '62ch', font: 'var(--fw-regular) var(--text-body-md)/var(--lh-body) var(--font-body)', color: 'var(--text-body)' }}>{d.body}</p>
            </article>
          ))}
        </div>
      </Band>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr' }}>
        <StoryCard image={window.ASSETS + 'photo-assembly-meditate.png'} kicker="Reflection · 5 min read" title="What changes when service becomes a habit?" body="Pupils reflect on the quiet discipline behind meaningful, sustained community work." height={440} size="lg" />
        <StoryCard image={window.ASSETS + 'photo-assembly-singing.png'} kicker="Voices" title="Malaysian roots. Sai wings." body="What our pupils carry from their community into the wider world." height={440} />
      </div>

      <Band tone="navy">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-16)', alignItems: 'center' }}>
          <PullQuote tone="navy" size="md" attribution="SRSS school motto">
            Head, Heart and Hands, working as one.
          </PullQuote>
          <Button size="lg" icon="arrow-right" onClick={() => onNavigate('Admissions')}>Arrange a visit</Button>
        </div>
      </Band>
    </>
  );
}
Object.assign(window, { ValuesScreen });
