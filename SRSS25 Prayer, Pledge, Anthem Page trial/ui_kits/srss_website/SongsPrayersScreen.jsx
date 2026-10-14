const Band = window.Band;
const { SectionHeading, Eyebrow, Breadcrumbs, ValueSpectrum, Button, ArrowLink, Icon, Badge, Notice, PullQuote, Tag } = window.SRSS25DesignSystem_f05209;

/* ---------------------------------------------------------------- data ---- */

const ORDER = [
  { id: 'silent-sitting', icon: 'sparkles', label: 'Silent Sitting', note: 'Two minutes of stillness' },
  { id: 'negaraku', icon: 'flag', label: 'Negaraku', note: 'The national anthem' },
  { id: 'anthem', icon: 'music', label: 'SRSS Anthem', note: 'Keunggulan insan' },
  { id: 'rukun-negara', icon: 'book-open', label: 'Rukun Negara', note: 'Five national principles' },
  { id: 'pledge', icon: 'hand-heart', label: 'School Pledge', note: 'Right hand on heart' },
  { id: 'prayers', icon: 'sun', label: 'Prayers', note: 'Morning, lunch and closing' },
];

const ANTHEM = [
  {
    ms: ['SRSS kami hormatimu', 'Kerana ajaran luhurmu', 'SRSS kami berikrar', 'Keunggulan insan tujuan kami'],
    en: ['SRSS, we honour you', 'for the noble teaching you give.', 'SRSS, we make this promise —', 'human excellence is our aim.'],
    ta: ['எஸ்ஆர்எஸ்எஸ், உன்னை வணங்குகிறோம்', 'உன் உயர்ந்த போதனைகளுக்காக', 'எஸ்ஆர்எஸ்எஸ், நாங்கள் உறுதி கூறுகிறோம்', 'மனித மேன்மையே எங்கள் இலக்கு'],
    zh: ['SRSS,我们向你致敬', '因为你崇高的教诲', 'SRSS,我们立下誓言', '人格的卓越是我们的目标'],
    ph: ['es-ar-es-es · KA-mi hor-MA-ti-mu', 'ke-RA-na a-JA-ran lu-HUR-mu', 'es-ar-es-es · KA-mi be-RIK-rar', 'ke-UNG-gu-lan IN-san TU-ju-an KA-mi'],
  },
  {
    ms: ['Kebenaran, keadilan seruanmu', 'Aman dan sayang sifat ketuhanan', 'Keramahan rukun keemasan', 'Keunggulan insan tujuan kami'],
    en: ['Truth and justice are your call,', 'peace and love, the nature of the Divine.', 'Kindness is our golden rule —', 'human excellence is our aim.'],
    ta: ['உண்மையும் நீதியும் உன் அழைப்பு', 'அமைதியும் அன்பும் தெய்வத் தன்மை', 'கருணையே எங்கள் பொன்னான நெறி', 'மனித மேன்மையே எங்கள் இலக்கு'],
    zh: ['真理与正义是你的召唤', '和平与慈爱是神性的本质', '仁善是我们的黄金准则', '人格的卓越是我们的目标'],
    ph: ['ke-be-NA-ran, ke-a-DI-lan se-RU-an-mu', 'A-man dan SA-yang si-FAT ke-tu-HA-nan', 'ke-RA-ma-han RU-kun ke-e-MA-san', 'ke-UNG-gu-lan IN-san TU-ju-an KA-mi'],
  },
  {
    ms: ['Kami bertutur benar', 'Berjalan menurut keadilan', 'Mematuhi cita-cita negara', 'Kami akan menyebarkan kasih sayang.', 'Menghormati', 'SRSS', 'selamanya'],
    en: ['We will speak what is true', 'and walk the path of justice.', 'We will hold to the hopes of our nation', 'and carry love wherever we go —', 'honouring', 'SRSS', 'always.'],
    ta: ['நாங்கள் உண்மையே பேசுவோம்', 'நீதியின் வழியில் நடப்போம்', 'நாட்டின் இலக்குகளைப் போற்றுவோம்', 'அன்பை எங்கும் பரப்புவோம்', 'போற்றுகிறோம்', 'எஸ்ஆர்எஸ்எஸ்', 'என்றென்றும்'],
    zh: ['我们说真实的话', '走在正义的路上', '秉持国家的理想', '把爱传播到各处', '敬爱', 'SRSS', '永远'],
    ph: ['KA-mi ber-TU-tur be-NAR', 'ber-JA-lan me-NU-rut ke-a-DI-lan', 'me-ma-TU-hi CHI-ta-CHI-ta ne-GA-ra', 'KA-mi A-kan me-nye-BAR-kan KA-sih SA-yang', 'meng-hor-MA-ti', 'es-ar-es-es', 'se-la-MA-nya'],
  },
];

const ANTHEM_GLOSSES = [
  { id: 'en', label: 'English', note: 'An unofficial reading for meaning, not a singing translation.' },
  { id: 'ta', label: 'தமிழ்', note: 'Tamil reading for meaning — pending review by the language panel.' },
  { id: 'zh', label: '中文', note: 'Mandarin reading for meaning — pending review by the language panel.' },
  { id: 'ph', label: 'Pronunciation', note: 'Syllable guide for singing; capitals mark the stressed syllable.' },
];

const NEGARAKU = [
  'Negaraku',
  'Tanah tumpahnya darah ku',
  'Rakyat hidup bersatu dan maju',
  'Rahmat bahagia Tuhan kurniakan',
  'Raja kita selamat bertakhta',
  'Rahmat bahagia Tuhan kurniakan',
  'Raja kita selamat bertakhta',
];

const RUKUN = [
  ['Kepercayaan kepada Tuhan', 'Belief in God', 'var(--value-truth)'],
  ['Kesetiaan kepada Raja dan Negara', 'Loyalty to King and Country', 'var(--value-conduct)'],
  ['Keluhuran Perlembagaan', 'Upholding the Constitution', 'var(--value-peace)'],
  ['Kedaulatan Undang-Undang', 'Rule of Law', 'var(--value-love)'],
  ['Kesopanan dan Kesusilaan', 'Courtesy and Morality', 'var(--value-nonviolence)'],
];

const PLEDGE_OPENING = [
  'We are the children of Sathya Sai,',
  'striving to be ideal Sai students,',
  'shaped by Devotion, Duty and Discipline,',
  'guided by Discrimination and Determination.',
];

const PLEDGE_VALUES = [
  { value: 'Truth', ms: 'Kebenaran', color: 'var(--value-truth)', lines: ['to be honest in my work, clear in my words,', 'and true to myself, even when no one is watching.'] },
  { value: 'Right Conduct', ms: 'Kesucian', color: 'var(--value-conduct)', lead: 'follow', lines: ['to respect the rules, own my actions,', 'and do my duty with a willing heart.'] },
  { value: 'Peace', ms: 'Keamanan', color: 'var(--value-peace)', lead: 'cultivate', lines: ['to keep a calm mind, master my feelings,', 'and make my classroom a place of harmony.'] },
  { value: 'Love', ms: 'Cinta', color: 'var(--value-love)', lead: 'practise', lines: ['to be kind, to encourage others,', 'and to help everyone grow with confidence.'] },
  { value: 'Non-Violence', ms: 'Tanpa Kekerasan', color: 'var(--value-nonviolence)', lead: 'live', lines: ['to solve problems by talking, not hurting,', 'and to choose gentle words and caring actions.'] },
];

const PLEDGE_CLOSING = [
  'I will love and respect my parents, teachers and elders in all circumstances.',
  'I will use my senses wisely, serve society and protect my country.',
  'I will bring a good name to my family, my school and to Swami,',
  'and let Love flow in all I think, say and do.',
];

const PRAYERS = [
  {
    id: 'morning', icon: 'sun', tab: 'Morning', title: 'Universal Prayer', when: 'Morning assembly',
    stanzas: [
      ['Dear God, as this new day begins,', 'be the light that shines within.'],
      ['Be in my mind, and make my thinking clear.', 'Be in my eyes, and let me see the good in all.', 'Be in my ears, and let me listen with care.', 'Be in my mouth, and let my words be true and kind.', 'Be in my hands, and let them help and serve.', 'Be in my feet, and guide me on the right path.', 'Be in my heart, and let me love all.'],
      ['Make me a light for someone today.'],
    ],
  },
  {
    id: 'lunch', icon: 'utensils', tab: 'Lunchtime', title: 'Food Prayer', when: 'Before the midday meal',
    stanzas: [
      ['Thank You, God, for this food,', 'for sun and rain that made it grow,', "for farmers' hands and cooks' kind care,", 'for all the love that brought it here.'],
      ['Thank you dear parents, teachers, and uncles and aunties', 'who have prepared this food for us today.', 'Thank you, God, for the food.'],
      ['I offer this food to You with gratitude.', 'May it give me strength to learn, to serve, and to love.', 'May all beings everywhere have enough to eat.'],
    ],
  },
  {
    id: 'closing', icon: 'moon', tab: 'Closing', title: 'Peace Prayer', when: 'End of the school day',
    stanzas: [
      ['For the lessons I have learnt today,', 'for friends who shared my work and play,', 'for teachers who have shown the way,', 'thank You, God, for this day.'],
      ['Let there be Peace in my heart,', 'Peace in my home,', 'Peace in my country,', 'and Peace in all the world.'],
      ['Let there be Joy in my heart,', 'Joy in my home,', 'Joy in my country,', 'and Joy in all the world.'],
      ['Let there be Love in my heart,', 'Love in my home,', 'Love in my country,', 'and Love in all the world.'],
    ],
  },
  {
    id: 'surrender', icon: 'hand-heart', tab: 'Dedication', title: 'Prayer of Surrender', when: 'Closing dedication',
    stanzas: [
      ['O Lord, take my love,', 'and let it flow in full devotion to You.'],
      ['O Lord, take my hands,', 'and let them work tirelessly for You.'],
      ['O Lord, take my mind and thoughts,', 'and keep them in tune with You.'],
      ['O Lord, take my soul,', 'and let it merge as one with You.'],
      ['O Lord, take my everything,', 'and make me Your instrument of Love.'],
    ],
  },
];

/* ------------------------------------------------------------ fragments ---- */

const RULE = { height: 2, background: 'var(--gold-500)', width: 56 };

/** Every panel opens the same way: full-bleed photo, one-sided navy scrim, copy over it. */
function PanelHero({ id, image, alt, objectPosition = '50% 40%', side = 'left', eyebrow, title, subtitle, standfirst, minHeight = 520, children }) {
  const scrim = side === 'left'
    ? 'linear-gradient(90deg,rgba(6,15,38,.95) 0%,rgba(6,15,38,.88) 40%,rgba(6,15,38,.35) 78%,rgba(6,15,38,.15) 100%)'
    : 'linear-gradient(270deg,rgba(6,15,38,.95) 0%,rgba(6,15,38,.88) 40%,rgba(6,15,38,.35) 78%,rgba(6,15,38,.15) 100%)';
  return (
    <section id={id} style={{ position: 'relative', minHeight, overflow: 'hidden', background: 'var(--navy-900)', scrollMarginTop: 'var(--space-8)' }}>
      <img src={window.ASSETS + image} alt={alt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition }} />
      <div style={{ position: 'absolute', inset: 0, background: scrim }} />
      <div style={{ position: 'relative', maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--space-20) var(--space-8)', display: 'flex', justifyContent: side === 'left' ? 'flex-start' : 'flex-end' }}>
        <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', alignItems: 'flex-start' }}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 style={{ margin: 0, font: 'var(--fw-semibold) var(--text-display-md)/var(--lh-display) var(--font-display)', letterSpacing: 'var(--ls-display)', color: 'var(--white)' }}>
            {title}
          </h2>
          {subtitle && (
            <span style={{ font: 'var(--fw-regular) var(--text-h3)/1.3 var(--font-display)', background: 'var(--gradient-gold-foil)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{subtitle}</span>
          )}
          <p style={{ margin: 0, maxWidth: '48ch', font: 'var(--fw-regular) var(--text-body-lg)/var(--lh-body) var(--font-body)', color: 'var(--text-on-navy-body)', textWrap: 'pretty' }}>
            {standfirst}
          </p>
          {children}
        </div>
      </div>
    </section>
  );
}

function SectionShell({ id, eyebrow, title, accent, standfirst, tone = 'cream', children, pad }) {
  return (
    <section id={id} style={{ background: tone === 'navy' ? 'var(--navy-800)' : tone === 'cream-alt' ? 'var(--cream-100)' : 'var(--cream-50)', padding: pad || 'var(--space-24) var(--space-8)', scrollMarginTop: 'var(--space-8)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <SectionHeading tone={tone === 'navy' ? 'navy' : 'light'} eyebrow={eyebrow} title={title} accent={accent} standfirst={standfirst} size="md" maxWidth={760} style={{ marginBottom: 'var(--space-12)' }} />
        {children}
      </div>
    </section>
  );
}

function Verse({ lines, tone = 'light', size = 'md', italic = false, align = 'left' }) {
  const f = size === 'lg' ? 'var(--text-h2)' : size === 'sm' ? 'var(--text-body-lg)' : 'var(--text-h3)';
  return (
    <p style={{
      margin: 0, textAlign: align,
      font: `${italic ? 'italic ' : ''}var(--fw-regular) ${f}/1.62 var(--font-display)`,
      color: tone === 'navy' ? 'var(--white)' : 'var(--navy-800)',
    }}>
      {lines.map((l, i) => <React.Fragment key={i}>{l}{i < lines.length - 1 && <br />}</React.Fragment>)}
    </p>
  );
}

const RAIL_GRADIENTS = [
  'linear-gradient(150deg,#F4D27A 0%,#E0A93B 46%,#A9740A 100%)',
  'linear-gradient(150deg,#6A1F74 0%,#9B3FA8 48%,#D9BCE4 100%)',
  'linear-gradient(150deg,#04264F 0%,#0F4B85 52%,#6FA3CC 100%)',
  'linear-gradient(150deg,#96062C 0%,#D1204E 48%,#F491A8 100%)',
  'linear-gradient(150deg,#0A5236 0%,#12885A 52%,#63D3A4 100%)',
];

function OrderRail({ active, onSelect }) {
  const [hover, setHover] = React.useState(null);
  return (
    <div role="tablist" aria-label="Assembly order" style={{ display: 'grid', gridTemplateColumns: 'repeat(6,minmax(0,1fr))', borderTop: 'var(--stroke-hairline) solid var(--border-hairline-navy)' }}>
      {ORDER.map((s, i) => {
        const on = active === s.id;
        const hot = on || hover === s.id;
        const grad = RAIL_GRADIENTS[i % RAIL_GRADIENTS.length];
        return (
          <button key={s.id} type="button" role="tab" aria-selected={on} aria-controls={`panel-${s.id}`}
            onClick={() => onSelect(s.id)}
            onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)}
            style={{
              textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
              padding: 'var(--space-6) var(--space-5)',
              border: 0,
              borderLeft: i === 0 ? 'none' : 'var(--stroke-hairline) solid var(--border-hairline-navy)',
              borderTop: `var(--stroke-rule) solid ${on ? 'var(--gold-400)' : 'transparent'}`,
              borderBottom: `var(--stroke-rule) solid ${on ? 'var(--gold-400)' : 'transparent'}`,
              backgroundColor: 'transparent',
              backgroundImage: on ? `linear-gradient(rgba(6,15,38,.42),rgba(6,15,38,.42)), ${grad}` : hot ? 'linear-gradient(rgba(255,255,255,.07),rgba(255,255,255,.07))' : 'none',
              transition: 'var(--transition-control)',
            }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: on ? 'var(--gold-200)' : hot ? 'var(--gold-200)' : 'var(--gold-300)' }}>
              <Icon name={s.icon} size={18} />
              <span style={{ font: 'var(--fw-semibold) var(--text-eyebrow-sm)/1 var(--font-body)', letterSpacing: 'var(--ls-eyebrow)' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
            </span>
            <span style={{ font: 'var(--fw-semibold) var(--text-h4)/1.25 var(--font-display)', color: 'var(--white)' }}>{s.label}</span>
            <span style={{ font: 'var(--fw-regular) var(--text-caption)/1.45 var(--font-body)', color: on ? 'rgba(255,255,255,.92)' : 'var(--text-on-navy-body)' }}>{s.note}</span>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------- screens ---- */

function SilentSitting() {
  return (
    <PanelHero
      id="silent-sitting"
      image="photo-meditate-closeup.png"
      alt="SRSS pupils seated cross-legged with eyes closed during silent sitting"
      objectPosition="50% 35%"
      eyebrow="01 · The loudest lesson is silence"
      title="Silent Sitting"
      standfirst="The first five minutes in SRSS are probably the hardest and most important part of our morning. Eyes closed, hands resting, breathing slow, the whole school sits still. Before the mind can learn, it must first be quiet."
    />
  );
}

function Negaraku() {
  const [playing, setPlaying] = React.useState(false);
  return (
    <>
      <PanelHero
        id="negaraku"
        image="photo-flag-malaysia-hoist.png"
        alt="An SRSS pupil raising the Jalur Gemilang at morning assembly while the school stands to attention"
        objectPosition="70% 40%"
        eyebrow="02 · Standing to attention"
        title="Negaraku"
        standfirst="Our first lesson in duty isn't taught in a textbook — it is practised every morning at 7:30. Chin up, standing tall, the whole school sings the national anthem as the Jalur Gemilang is raised."
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
          <Button size="sm" icon={playing ? 'pause' : 'play'} iconPosition="start" onClick={() => setPlaying((p) => !p)}>
            {playing ? 'Stop the recording' : 'Listen to Negaraku'}
          </Button>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', font: 'var(--fw-regular) var(--text-body-sm)/1.5 var(--font-body)', color: 'var(--text-on-navy-muted)' }}>
            <Icon name="volume-2" size={16} style={{ color: 'var(--gold-300)' }} />
            Audio only — sing along for classroom practice.
          </span>
          {playing && (
            <iframe
              src="https://www.youtube-nocookie.com/embed/t44hyUvRe8Y?autoplay=1&controls=0"
              title="Negaraku — the national anthem of Malaysia"
              allow="autoplay; encrypted-media"
              style={{ position: 'absolute', width: 1, height: 1, opacity: 0, border: 0, pointerEvents: 'none' }}
            />
          )}
        </div>
      </PanelHero>

      <section style={{ background: 'var(--cream-50)', padding: 'var(--space-20) var(--space-8)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', alignItems: 'flex-start' }}>
          <span style={RULE} />
          <Verse lines={NEGARAKU} size="lg" />
          <Badge tone="gold">PATRIOTISM | NEGARAKU</Badge>
        </div>
      </section>
    </>
  );
}

function Anthem() {
  const [gloss, setGloss] = React.useState('en');
  const [show, setShow] = React.useState(true);
  const active = ANTHEM_GLOSSES.find((g) => g.id === gloss);
  const hairline = 'var(--stroke-hairline) solid var(--border-hairline-navy)';
  return (
    <>
      <PanelHero
        id="anthem"
        image="illustration-school-sunset.png"
        alt="An illustration of Sekolah Rendah Sathya Sai at sunrise"
        objectPosition="50% 50%"
        side="right"
        eyebrow="03 · The school's own song"
        title="SRSS Anthem"
        subtitle="Keunggulan insan tujuan kami"
        standfirst="Our anthem names the thing we are here for: human excellence. Truth and justice are its call; kindness is its golden rule."
      />

      <section style={{ background: 'var(--gradient-navy-depth)', padding: 'var(--space-20) var(--space-8)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-12)', flexWrap: 'wrap', marginBottom: 'var(--space-10)' }}>
            <span style={{ font: 'var(--fw-semibold) var(--text-h3)/1.2 var(--font-display)', color: 'var(--white)' }}>The words, verse by verse</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                {ANTHEM_GLOSSES.map((g) => (
                  <Tag key={g.id} tone="navy" active={show && gloss === g.id} onClick={() => { setGloss(g.id); setShow(true); }}>{g.label}</Tag>
                ))}
              </div>
              <button type="button" onClick={() => setShow((s) => !s)}
                style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', color: 'var(--gold-300)', font: 'var(--fw-semibold) var(--text-body-sm)/1.4 var(--font-body)' }}>
                {show ? 'Hide the meaning column' : 'Show the meaning column'}
              </button>
            </div>
          </div>

          <div style={{ borderTop: hairline }}>
          {ANTHEM.map((v, i) => (
              <div key={i} style={{ padding: 'var(--space-10) 0', borderBottom: i === ANTHEM.length - 1 ? 'none' : hairline, display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <span style={{ font: 'var(--fw-semibold) var(--text-eyebrow-sm)/1 var(--font-body)', letterSpacing: 'var(--ls-eyebrow)', textTransform: 'uppercase', color: 'var(--gold-300)' }}>
                Verse {i + 1}
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: show ? 'minmax(0,1.35fr) minmax(0,1fr)' : 'minmax(0,1fr)', columnGap: 'var(--space-16)', rowGap: 'var(--space-3)', alignItems: 'baseline' }}>
                {v.ms.map((line, j) => (
                  <React.Fragment key={j}>
                    <span style={{ font: 'var(--fw-regular) var(--text-h3)/1.45 var(--font-display)', color: 'var(--white)' }}>{line}</span>
                    {show && (
                      <span lang={gloss === 'ta' ? 'ta' : gloss === 'zh' ? 'zh' : undefined}
                        style={{ font: 'var(--fw-regular) var(--text-body-sm)/1.5 var(--font-body)', fontStyle: gloss === 'en' ? 'italic' : 'normal', letterSpacing: gloss === 'ph' ? '0.02em' : 'normal', color: 'var(--text-on-navy-muted)' }}>
                        {v[gloss][j]}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-8)', font: 'var(--fw-regular) var(--text-body-sm)/1.6 var(--font-body)', color: 'var(--text-on-navy-muted)' }}>
            <Icon name="languages" size={16} style={{ color: 'var(--gold-300)' }} />
            {show ? `${active.note} The anthem is always sung in Bahasa Melayu.` : 'The anthem is always sung in Bahasa Melayu.'}
          </div>
        </div>
      </section>
    </>
  );
}

function RukunNegara() {
  return (
    <>
      <PanelHero
        id="rukun-negara"
        image="photo-assembly-rows-wide.jpeg"
        alt="The whole school seated in rows on mats at morning assembly"
        objectPosition="50% 55%"
        eyebrow="04 · Recited together"
        title="Rukun Negara"
        standfirst="The five national principles, recited by the whole school after the anthem — one voice, five hundred children."
      />

      <section style={{ background: 'var(--cream-100)', padding: 'var(--space-20) var(--space-8)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
          <PullQuote align="left" tone="light" size="sm" attribution="Rukun Negara · preamble">
            Maka kami, rakyat Malaysia, berikrar akan menumpukan seluruh tenaga dan usaha kami untuk mencapai cita-cita tersebut berdasarkan atas prinsip-prinsip yang berikut
          </PullQuote>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))', gap: 'var(--space-1)' }}>
            {RUKUN.map(([ms, en, color], i) => (
              <div key={ms} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', background: 'var(--white)', padding: 'var(--space-6)', borderTop: `4px solid ${color}` }}>
                <span style={{ font: 'var(--fw-bold) var(--text-display-sm)/1 var(--font-display)', color }}>{i + 1}</span>
                <span style={{ font: 'var(--fw-semibold) var(--text-h4)/1.3 var(--font-display)', color: 'var(--navy-800)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{ms}</span>
                <span style={{ font: 'var(--fw-regular) var(--text-body-sm)/1.5 var(--font-body)', color: 'var(--text-muted)', marginTop: 'auto' }}>{en}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Pledge() {
  return (
    <>
      <PanelHero
        id="pledge"
        image="photo-values-boards.png"
        alt="SRSS pupils holding framed boards reading Truth, Right Conduct, Peace, Love and Non-violence"
        objectPosition="70% 50%"
        eyebrow="05 · Right hand on heart"
        title="The SRSS School Pledge"
        standfirst="Five values, said out loud every morning. The pledge is how a child learns to name what they are practising — and to promise it in their own voice."
      >
        <Verse tone="navy" size="sm" italic lines={PLEDGE_OPENING} />
      </PanelHero>

      <section style={{ background: 'var(--cream-50)', padding: 'var(--space-20) var(--space-8)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {PLEDGE_VALUES.map((p) => (
              <div key={p.value} style={{ display: 'grid', gridTemplateColumns: '6px 280px minmax(0,1fr)', gap: 'var(--space-8)', padding: 'var(--space-8) 0', borderTop: 'var(--stroke-hairline) solid var(--border-hairline)' }}>
                <span style={{ background: p.color }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  <span style={{ font: 'var(--fw-regular) var(--text-body-sm)/1.4 var(--font-body)', color: 'var(--text-muted)' }}>
                    I pledge to {p.lead || 'uphold'}
                  </span>
                  <span style={{ font: 'var(--fw-semibold) var(--text-h2)/1.12 var(--font-display)', color: p.color }}>{p.value}</span>
                  <Eyebrow tone="goldInk" size="sm">{p.ms}</Eyebrow>
                </div>
                <Verse lines={p.lines} size="md" />
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', gap: 'var(--space-16)', alignItems: 'center', paddingTop: 'var(--space-8)', borderTop: 'var(--stroke-rule) solid var(--gold-500)' }}>
            <Verse lines={PLEDGE_CLOSING} size="sm" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
              <span style={{ font: 'var(--fw-semibold) var(--text-display-sm)/1.1 var(--font-display)', background: 'var(--gradient-gold-foil)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                Love all, Serve all.
              </span>
              <span style={{ font: 'var(--fw-regular) var(--text-body-sm)/1.5 var(--font-body)', color: 'var(--text-muted)' }}>
                The last line of the pledge, and the first rule of the school.
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Prayers() {
  const [active, setActive] = React.useState('morning');
  const p = PRAYERS.find((x) => x.id === active);
  return (
    <>
      <PanelHero
        id="prayers"
        image="photo-prayer-mic-girl.png"
        alt="An SRSS pupil with palms joined leading the morning prayer at the microphone"
        objectPosition="60% 35%"
        side="right"
        eyebrow="06 · Through the day"
        title="Prayers"
        standfirst="Four prayers mark the school day — one to open it, one over lunch, one to close it, and one to dedicate everything in between."
      />

      <section style={{ background: 'var(--navy-800)', padding: 'var(--space-20) var(--space-8)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', display: 'grid', gridTemplateColumns: '280px minmax(0,1fr)', gap: 'var(--space-16)', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: 'var(--stroke-hairline) solid var(--border-hairline-navy)' }}>
          {PRAYERS.map((x) => {
            const on = x.id === active;
            return (
              <button key={x.id} type="button" onClick={() => setActive(x.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-4)', textAlign: 'left',
                  padding: 'var(--space-5) var(--space-5)', cursor: 'pointer',
                  background: on ? 'rgba(255,255,255,.07)' : 'transparent',
                  border: 0, borderBottom: 'var(--stroke-hairline) solid var(--border-hairline-navy)',
                  borderLeft: `var(--stroke-rule) solid ${on ? 'var(--gold-400)' : 'transparent'}`,
                  transition: 'var(--transition-control)',
                }}>
                <Icon name={x.icon} size={20} style={{ color: on ? 'var(--gold-300)' : 'rgba(255,255,255,.55)' }} />
                <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ font: 'var(--fw-semibold) var(--text-body-md)/1.2 var(--font-body)', color: on ? 'var(--white)' : 'var(--text-on-navy-body)' }}>{x.tab}</span>
                  <span style={{ font: 'var(--fw-regular) var(--text-caption)/1.3 var(--font-body)', color: 'var(--text-on-navy-muted)' }}>{x.title}</span>
                </span>
              </button>
            );
          })}
          <img src={window.ASSETS + 'photo-flag-crest.png'} alt="The SRSS crest at the centre of the school flag" style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', marginTop: 'var(--space-8)' }} />
        </div>
        <article style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Eyebrow>{p.when}</Eyebrow>
            <h3 style={{ margin: 0, font: 'var(--fw-semibold) var(--text-h1)/1.15 var(--font-display)', color: 'var(--white)' }}>{p.title}</h3>
            <span style={{ ...RULE, background: 'var(--gold-400)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
            {p.stanzas.map((s, i) => <Verse key={i} tone="navy" lines={s} size="md" />)}
          </div>
          {p.coda && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', paddingTop: 'var(--space-6)', borderTop: 'var(--stroke-hairline) solid var(--border-hairline-navy)' }}>
              <span style={{ font: 'italic var(--fw-regular) var(--text-h3)/1.4 var(--font-display)', color: 'var(--gold-300)' }}>{p.coda}</span>
              {p.gloss && <span style={{ font: 'var(--fw-regular) var(--text-body-sm)/1.5 var(--font-body)', color: 'var(--text-on-navy-muted)' }}>{p.gloss}</span>}
            </div>
          )}
        </article>
        </div>
      </section>
    </>
  );
}

/* ----------------------------------------------------------------- page ---- */

function SongsPrayersScreen({ onNavigate }) {
  const [open, setOpen] = React.useState(ORDER[0].id);
  const PANELS = {
    'silent-sitting': <SilentSitting />,
    negaraku: <Negaraku />,
    anthem: <Anthem />,
    'rukun-negara': <RukunNegara />,
    pledge: <Pledge />,
    prayers: <Prayers />,
  };
  return (
    <>
      <style>{'@media print{.srss-fold{display:block!important}}@keyframes srssFold{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}'}</style>
      <section style={{ position: 'relative', overflow: 'hidden', background: 'var(--navy-800)' }}>
        <img src={window.ASSETS + 'photo-seated-rows.png'} alt="" style={{ position: 'absolute', right: 0, top: 0, width: '52%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'var(--gradient-hero-scrim)' }} />
        <div style={{ position: 'relative', maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--space-8) var(--space-8) var(--space-16)' }}>
          <Breadcrumbs tone="navy" items={[{ label: 'Home', href: '#' }, { label: 'Resources', href: '#' }, 'Songs, Pledge & Prayers']} />
          <div style={{ maxWidth: 780, display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', marginTop: 'var(--space-12)', alignItems: 'flex-start' }}>
            <Eyebrow>Anthem · Pledge · Silence · Prayer</Eyebrow>
            <h1 style={{ margin: 0, font: 'var(--fw-semibold) var(--text-display-lg)/var(--lh-display) var(--font-display)', letterSpacing: 'var(--ls-display)', color: 'var(--white)' }}>
              Before the<br /><span style={{ background: 'var(--gradient-gold-foil)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>First Bell</span>
            </h1>
            <p style={{ margin: 0, maxWidth: '58ch', font: 'var(--fw-regular) var(--text-body-lg)/var(--lh-body) var(--font-body)', color: 'var(--text-on-navy-body)', textWrap: 'pretty' }}>
              Anthem. Pledge. Silence. Prayer. This is how an SRSS morning begins — and why it stays with a child for life. Learn them, print them, practise them at home: these are the lines every SRSS child carries forever.
            </p>
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--navy-700)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--space-8)' }}>
          <OrderRail active={open} onSelect={setOpen} />
        </div>
      </section>
      <ValueSpectrum variant="rule" height={5} />

      {ORDER.map((s) => (
        <div key={s.id} id={`panel-${s.id}`} role="tabpanel" className="srss-fold" aria-hidden={open !== s.id}
          style={{ display: open === s.id ? 'block' : 'none', animation: open === s.id ? 'srssFold var(--dur-base) var(--ease-out)' : 'none' }}>
          {PANELS[s.id]}
        </div>
      ))}

      <Band tone="cream-alt" pad="var(--space-16) var(--space-8)">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 'var(--space-12)', alignItems: 'center' }}>
          <Notice tone="gold" title="For parents and teachers">
            Every text on this page may be printed and used at home or in class. Nothing here is copyrighted to the school — the anthem is national, the pledge and prayers are ours to share.
          </Notice>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Button variant="solid" icon="printer" iconPosition="start" onClick={() => window.print()}>Print</Button>
            <Button variant="outline-ink" icon="arrow-right" onClick={() => onNavigate && onNavigate('Values')}>The five values</Button>
          </div>
        </div>
      </Band>
    </>
  );
}

Object.assign(window, { SongsPrayersScreen });
