const Band = window.Band;
const { SectionHeading, PillarCard, StoryCard, AudienceLink, Button, ArrowLink, Eyebrow, ValueSpectrum, PullQuote, StatBlock, Badge } = window.SRSS25DesignSystem_f05209;

function Hero({ onNavigate }) {
  return (
    <section style={{ position: 'relative', minHeight: 560, background: 'var(--navy-800)', overflow: 'hidden' }}>
      <img src={window.ASSETS + 'photo-student-rukun.png'} alt="" style={{ position: 'absolute', right: 0, top: 0, width: '62%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'var(--gradient-hero-scrim)' }} />
      <div style={{ position: 'relative', maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--space-20) var(--space-8)' }}>
        <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <Eyebrow>Sekolah Rendah Sathya Sai · Since 2002</Eyebrow>
          <h1 style={{ margin: 0, font: 'var(--fw-semibold) var(--text-display-xl)/var(--lh-display) var(--font-display)', letterSpacing: 'var(--ls-display)', color: 'var(--white)' }}>
            The End of<br />Education is<br /><span style={{ background: 'var(--gradient-gold-foil)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Character</span>
          </h1>
          <p style={{ margin: 0, maxWidth: '52ch', font: 'var(--fw-regular) var(--text-body-lg)/var(--lh-body) var(--font-body)', color: 'var(--text-on-navy-body)' }}>
            At <strong style={{ color: 'var(--white)', fontWeight: 'var(--fw-semibold)' }}>Sekolah Rendah Sathya Sai</strong>, education is the journey of drawing out the best within every child. By harmonising the Head, Heart and Hands, we cultivate learners who excel academically, live by universal human values, and become thoughtful leaders committed to making the world a better place.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-10)', flexWrap: 'wrap' }}>
            <Button size="lg" icon="arrow-right" onClick={() => onNavigate('About')}>Explore SRSS</Button>
            <ArrowLink tone="onNavy" href="#" onClick={(e) => { e.preventDefault(); onNavigate('Admissions'); }}>Arrange a visit</ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeScreen({ onNavigate }) {
  return (
    <>
      <Hero onNavigate={onNavigate} />
      <ValueSpectrum variant="rule" height={5} />

      <Band tone="cream">
        <SectionHeading align="center" title="A school for the mind, heart and character" size="md" style={{ margin: '0 auto var(--space-16)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
          <PillarCard divider={false} title="Academic confidence" body="Rigorous, engaging learning that builds knowledge, curiosity and the confidence to think independently." />
          <PillarCard title="Human values in action" body="Daily practice of respect, honesty and responsibility that shapes good decisions and strong character." />
          <PillarCard title="Compassionate leadership" body="Empathy, service and teamwork that inspire every child to lead with purpose and care for others." />
        </div>
      </Band>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
        <StoryCard image={window.ASSETS + 'photo-assembly-singing.png'} kicker="Assembly" title="Every morning begins in one voice" cta={null} height={320} size="sm" />
        <StoryCard image={window.ASSETS + 'photo-assembly-meditate.png'} kicker="Silent sitting" title="Two minutes that shape the whole day" cta={null} height={320} size="sm" />
        <StoryCard image={window.ASSETS + 'photo-meditate-assembly.png'} kicker="Classroom" title="Learning that starts with attention" cta={null} height={320} size="sm" />
      </div>

      <Band tone="cream-alt" pad="0">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))' }}>
          <AudienceLink divider={false} title="For Parents" body="Information, resources and support" />
          <AudienceLink title="For Students" body="Learning support and opportunities" />
          <AudienceLink title="For Teachers" body="Professional growth and collaboration" />
          <AudienceLink title="For Community" body="Volunteer, partner and connect" />
        </div>
      </Band>

      <Band tone="navy">
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 'var(--space-20)', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', alignItems: 'flex-start' }}>
            <Badge tone="onNavy">Silver Jubilee · 2027</Badge>
            <SectionHeading tone="navy" title="Twenty-five years of" accent="Human Excellence" standfirst="In 2027 SRSS marks its 25th year. One school, five values, and a quarter-century of children who left here knowing who they are." size="md" />
            <Button icon="arrow-right" onClick={() => onNavigate('Jubilee')}>Explore SRSS25</Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12) var(--space-8)' }}>
            <StatBlock value="25" label="Years" sublabel="2002 – 2027" metal="silver" />
            <StatBlock value="5" label="Human values" sublabel="Taught daily, lived daily" />
            <StatBlock value="1" label="Campus" sublabel="Kuala Lumpur, Malaysia" />
            <StatBlock value="∞" label="Alumni stories" sublabel="Still being written" />
          </div>
        </div>
      </Band>

      <Band tone="cream">
        <PullQuote align="center" tone="light" size="lg" attribution="Bhagawan Sri Sathya Sai Baba">
          The end of education is character.
        </PullQuote>
      </Band>
    </>
  );
}

Object.assign(window, { HomeScreen });
