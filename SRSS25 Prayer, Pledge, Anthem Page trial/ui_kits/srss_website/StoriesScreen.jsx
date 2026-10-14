const Band = window.Band;
const { SectionHeading, StoryCard, Tag, Breadcrumbs, ArrowLink, ValueSpectrum, Eyebrow, Badge } = window.SRSS25DesignSystem_f05209;

const STORIES = [
  { tag: 'Reflection', kicker: 'Reflection · 5 min read', title: 'What changes when service becomes a habit?', body: 'Pupils reflect on the quiet discipline behind meaningful, sustained community work.', image: 'photo-assembly-meditate.png' },
  { tag: 'Voices', kicker: 'Voices', title: 'Malaysian roots. Sai wings.', body: 'What our pupils carry from their community into the wider world.', image: 'photo-assembly-singing.png' },
  { tag: 'Assembly', kicker: 'School life', title: 'Two minutes of silence, every single morning', body: 'Why silent sitting opens the SRSS day — and what it does to a classroom.', image: 'photo-meditate-assembly.png' },
  { tag: 'Academics', kicker: 'Learning · Science Week', title: 'A week where every corridor became a laboratory', body: 'Open Classroom sessions brought parents into the middle of the experiment.', image: 'photo-student-rukun.png' },
];

const PEOPLE = [
  { img: 'portrait-staff-01.png', name: 'School leadership', role: 'On twenty-five years of character education' },
  { img: 'portrait-staff-02.png', name: 'SRSS25 committee', role: 'On planning the Silver Jubilee year' },
];

function StoriesScreen() {
  const [filter, setFilter] = React.useState('All stories');
  const tags = ['All stories', 'Reflection', 'Voices', 'Assembly', 'Academics'];
  const shown = filter === 'All stories' ? STORIES : STORIES.filter((s) => s.tag === filter);
  return (
    <>
      <section style={{ background: 'var(--navy-800)', padding: 'var(--space-8) var(--space-8) var(--space-16)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
          <Breadcrumbs tone="navy" items={[{ label: 'Home', href: '#' }, 'Community', 'Stories']} />
          <SectionHeading tone="navy" eyebrow="Community · Stories" title="School life, in the" accent="words of the school" standfirst="Reflections, voices and reports from the SRSS community — pupils, teachers, parents and alumni." size="lg" maxWidth={760} />
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            {tags.map((t) => <Tag key={t} tone="navy" active={filter === t} onClick={() => setFilter(t)}>{t}</Tag>)}
          </div>
        </div>
      </section>
      <ValueSpectrum variant="rule" height={5} />

      <div style={{ display: 'grid', gridTemplateColumns: shown.length > 1 ? '1.4fr 1fr' : '1fr' }}>
        {shown.map((s, i) => (
          <StoryCard key={s.title} image={window.ASSETS + s.image} kicker={s.kicker} title={s.title} body={s.body}
            height={i === 0 ? 460 : 230} size={i === 0 ? 'lg' : 'sm'} />
        ))}
      </div>

      <Band tone="cream">
        <SectionHeading eyebrow="Voices from the school" title="Who you will meet" maxWidth={640} style={{ marginBottom: 'var(--space-12)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 'var(--space-12)' }}>
          {PEOPLE.map((p) => (
            <article key={p.name} style={{ display: 'grid', gridTemplateColumns: '160px minmax(0,1fr)', gap: 'var(--space-8)', alignItems: 'center' }}>
              <img src={window.ASSETS + p.img} alt="" style={{ width: 160, height: 190, objectFit: 'cover', objectPosition: 'top' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                <Badge tone="silver">Interview</Badge>
                <h3 style={{ margin: 0, font: 'var(--fw-semibold) var(--text-h3)/1.25 var(--font-display)', color: 'var(--navy-800)' }}>{p.name}</h3>
                <p style={{ margin: 0, font: 'var(--fw-regular) var(--text-body-sm)/var(--lh-body) var(--font-body)', color: 'var(--text-muted)' }}>{p.role}</p>
                <ArrowLink size="sm" icon="arrow-up-right">Read the interview</ArrowLink>
              </div>
            </article>
          ))}
        </div>
      </Band>
    </>
  );
}
Object.assign(window, { StoriesScreen });
