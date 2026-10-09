import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { BookOpen } from "@phosphor-icons/react/dist/csr/BookOpen";
import { Flag } from "@phosphor-icons/react/dist/csr/Flag";
import { HandHeart } from "@phosphor-icons/react/dist/csr/HandHeart";
import { Moon } from "@phosphor-icons/react/dist/csr/Moon";
import { MusicNotes } from "@phosphor-icons/react/dist/csr/MusicNotes";
import { Pause } from "@phosphor-icons/react/dist/csr/Pause";
import { Play } from "@phosphor-icons/react/dist/csr/Play";
import { Printer } from "@phosphor-icons/react/dist/csr/Printer";
import { Sparkle } from "@phosphor-icons/react/dist/csr/Sparkle";
import { SpeakerHigh } from "@phosphor-icons/react/dist/csr/SpeakerHigh";
import { Sun } from "@phosphor-icons/react/dist/csr/Sun";

const ASSET_ROOT = "/assets/prayer-page";

const ORDER = [
  { id: "silent-sitting", label: "Silent Sitting", note: "Two minutes of stillness", Icon: Sparkle },
  { id: "negaraku", label: "Negaraku", note: "The national anthem", Icon: Flag },
  { id: "anthem", label: "SRSS Anthem", note: "Keunggulan insan", Icon: MusicNotes },
  { id: "rukun-negara", label: "Rukun Negara", note: "Five national principles", Icon: BookOpen },
  { id: "pledge", label: "School Pledge", note: "Right hand on heart", Icon: HandHeart },
  { id: "prayers", label: "Prayers", note: "Through the school day", Icon: Sun },
];

const NEGARAKU = [
  "Negaraku",
  "Tanah tumpahnya darah ku",
  "Rakyat hidup bersatu dan maju",
  "Rahmat bahagia Tuhan kurniakan",
  "Raja kita selamat bertakhta",
  "Rahmat bahagia Tuhan kurniakan",
  "Raja kita selamat bertakhta",
];

const ANTHEM = [
  {
    ms: ["SRSS kami hormatimu", "Kerana ajaran luhurmu", "SRSS kami berikrar", "Keunggulan insan tujuan kami"],
    en: ["SRSS, we honour you", "for the noble teaching you give.", "SRSS, we make this promise —", "human excellence is our aim."],
    ta: ["எஸ்ஆர்எஸ்எஸ், உன்னை வணங்குகிறோம்", "உன் உயர்ந்த போதனைகளுக்காக", "எஸ்ஆர்எஸ்எஸ், நாங்கள் உறுதி கூறுகிறோம்", "மனித மேன்மையே எங்கள் இலக்கு"],
    zh: ["SRSS，我们向你致敬", "因为你崇高的教诲", "SRSS，我们立下誓言", "人格的卓越是我们的目标"],
    ph: ["es-ar-es-es · KA-mi hor-MA-ti-mu", "ke-RA-na a-JA-ran lu-HUR-mu", "es-ar-es-es · KA-mi be-RIK-rar", "ke-UNG-gu-lan IN-san TU-ju-an KA-mi"],
  },
  {
    ms: ["Kebenaran, keadilan seruanmu", "Aman dan sayang sifat ketuhanan", "Keramahan rukun keemasan", "Keunggulan insan tujuan kami"],
    en: ["Truth and justice are your call,", "peace and love, the nature of the Divine.", "Kindness is our golden rule —", "human excellence is our aim."],
    ta: ["உண்மையும் நீதியும் உன் அழைப்பு", "அமைதியும் அன்பும் தெய்வத் தன்மை", "கருணையே எங்கள் பொன்னான நெறி", "மனித மேன்மையே எங்கள் இலக்கு"],
    zh: ["真理与正义是你的召唤", "和平与慈爱是神性的本质", "仁善是我们的黄金准则", "人格的卓越是我们的目标"],
    ph: ["ke-be-NA-ran, ke-a-DI-lan se-RU-an-mu", "A-man dan SA-yang si-FAT ke-tu-HA-nan", "ke-RA-ma-han RU-kun ke-e-MA-san", "ke-UNG-gu-lan IN-san TU-ju-an KA-mi"],
  },
  {
    ms: ["Kami bertutur benar", "Berjalan menurut keadilan", "Mematuhi cita-cita negara", "Kami akan menyebarkan kasih sayang.", "Menghormati", "SRSS", "selamanya"],
    en: ["We will speak what is true", "and walk the path of justice.", "We will hold to the hopes of our nation", "and carry love wherever we go —", "honouring", "SRSS", "always."],
    ta: ["நாங்கள் உண்மையே பேசுவோம்", "நீதியின் வழியில் நடப்போம்", "நாட்டின் இலக்குகளைப் போற்றுவோம்", "அன்பை எங்கும் பரப்புவோம்", "போற்றுகிறோம்", "எஸ்ஆர்எஸ்எஸ்", "என்றென்றும்"],
    zh: ["我们说真实的话", "走在正义的路上", "秉持国家的理想", "把爱传播到各处", "敬爱", "SRSS", "永远"],
    ph: ["KA-mi ber-TU-tur be-NAR", "ber-JA-lan me-NU-rut ke-a-DI-lan", "me-ma-TU-hi CHI-ta-CHI-ta ne-GA-ra", "KA-mi A-kan me-nye-BAR-kan KA-sih SA-yang", "meng-hor-MA-ti", "es-ar-es-es", "se-la-MA-nya"],
  },
];

const GLOSSES = [
  { id: "en", label: "English", note: "An unofficial reading for meaning, not a singing translation." },
  { id: "ta", label: "தமிழ்", note: "Tamil reading for meaning — pending review by the language panel." },
  { id: "zh", label: "中文", note: "Mandarin reading for meaning — pending review by the language panel." },
  { id: "ph", label: "Pronunciation", note: "A syllable guide for singing; capitals mark the stressed syllable." },
];

const RUKUN = [
  ["Kepercayaan kepada Tuhan", "Belief in God", "truth"],
  ["Kesetiaan kepada Raja dan Negara", "Loyalty to King and Country", "conduct"],
  ["Keluhuran Perlembagaan", "Upholding the Constitution", "peace"],
  ["Kedaulatan Undang-Undang", "Rule of Law", "love"],
  ["Kesopanan dan Kesusilaan", "Courtesy and Morality", "nonviolence"],
];

const PLEDGE_VALUES = [
  ["Truth", "Kebenaran", "uphold", "to be honest in my work, clear in my words, and true to myself, even when no one is watching.", "truth"],
  ["Right Conduct", "Kesucian", "follow", "to respect the rules, own my actions, and do my duty with a willing heart.", "conduct"],
  ["Peace", "Keamanan", "cultivate", "to keep a calm mind, master my feelings, and make my classroom a place of harmony.", "peace"],
  ["Love", "Cinta", "practise", "to be kind, to encourage others, and to help everyone grow with confidence.", "love"],
  ["Non-Violence", "Tanpa Kekerasan", "live", "to solve problems by talking, not hurting, and to choose gentle words and caring actions.", "nonviolence"],
];

const PRAYERS = [
  {
    id: "morning", tab: "Morning", title: "Universal Prayer", when: "Morning assembly", Icon: Sun,
    stanzas: [
      ["Dear God, as this new day begins,", "be the light that shines within."],
      ["Be in my mind, and make my thinking clear.", "Be in my eyes, and let me see the good in all.", "Be in my ears, and let me listen with care.", "Be in my mouth, and let my words be true and kind.", "Be in my hands, and let them help and serve.", "Be in my feet, and guide me on the right path.", "Be in my heart, and let me love all."],
      ["Make me a light for someone today."],
    ],
  },
  {
    id: "lunch", tab: "Lunchtime", title: "Food Prayer", when: "Before the midday meal", Icon: HandHeart,
    stanzas: [
      ["Thank You, God, for this food,", "for sun and rain that made it grow,", "for farmers’ hands and cooks’ kind care,", "for all the love that brought it here."],
      ["Thank you dear parents, teachers, and uncles and aunties", "who have prepared this food for us today.", "Thank you, God, for the food."],
      ["I offer this food to You with gratitude.", "May it give me strength to learn, to serve, and to love.", "May all beings everywhere have enough to eat."],
    ],
  },
  {
    id: "closing", tab: "Closing", title: "Peace Prayer", when: "End of the school day", Icon: Moon,
    stanzas: [
      ["For the lessons I have learnt today,", "for friends who shared my work and play,", "for teachers who have shown the way,", "thank You, God, for this day."],
      ["Let there be Peace in my heart,", "Peace in my home,", "Peace in my country,", "and Peace in all the world."],
      ["Let there be Joy in my heart,", "Joy in my home,", "Joy in my country,", "and Joy in all the world."],
      ["Let there be Love in my heart,", "Love in my home,", "Love in my country,", "and Love in all the world."],
    ],
  },
  {
    id: "surrender", tab: "Dedication", title: "Prayer of Surrender", when: "Closing dedication", Icon: HandHeart,
    stanzas: [
      ["O Lord, take my love,", "and let it flow in full devotion to You."],
      ["O Lord, take my hands,", "and let them work tirelessly for You."],
      ["O Lord, take my mind and thoughts,", "and keep them in tune with You."],
      ["O Lord, take my soul,", "and let it merge as one with You."],
      ["O Lord, take my everything,", "and make me Your instrument of Love."],
    ],
  },
];

function SectionHero({ image, imagePosition, eyebrow, title, subtitle, children, align = "left" }) {
  return <section className={`ppa-section-hero ppa-align-${align}`}>
    <img src={`${ASSET_ROOT}/${image}`} alt="" style={{ objectPosition: imagePosition }} />
    <div className="ppa-section-scrim" />
    <div className="ppa-wrap ppa-section-hero-inner">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {subtitle && <p className="ppa-gold-subtitle">{subtitle}</p>}
        <p className="ppa-standfirst">{children}</p>
      </div>
    </div>
  </section>;
}

function SilentSittingPanel() {
  const [seconds, setSeconds] = useState(120);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || seconds === 0) return undefined;
    const timer = window.setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [running, seconds]);

  useEffect(() => { if (seconds === 0) setRunning(false); }, [seconds]);
  const display = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return <>
    <SectionHero image="silent-sitting.jpg" imagePosition="50% 34%" eyebrow="01 · The loudest lesson is silence" title="Silent Sitting">
      The first moments at SRSS are among the hardest and most important parts of the morning. Eyes closed, hands resting and breathing slow, the whole school sits still. Before the mind can learn, it must first be quiet.
    </SectionHero>
    <section className="ppa-timer-section">
      <div className="ppa-wrap ppa-timer-grid">
        <div><p className="eyebrow">A quiet beginning</p><h3>Two minutes of stillness.</h3><p>Use this simple timer for practice at home or in class. Sit comfortably, soften your gaze or close your eyes, and bring your attention to the breath.</p></div>
        <div className="ppa-timer" aria-live="polite"><strong>{display}</strong><span>{seconds === 0 ? "Stillness complete" : running ? "Breathe slowly" : "Ready when you are"}</span><div><button type="button" onClick={() => setRunning((value) => !value)} disabled={seconds === 0}>{running ? <Pause size={17} weight="fill" /> : <Play size={17} weight="fill" />}{running ? "Pause" : "Begin"}</button><button type="button" onClick={() => { setRunning(false); setSeconds(120); }}>Reset</button></div></div>
      </div>
    </section>
  </>;
}

function NegarakuPanel() {
  const [showAudio, setShowAudio] = useState(false);
  return <>
    <SectionHero image="malaysia-flag.jpg" imagePosition="70% 40%" eyebrow="02 · Standing to attention" title="Negaraku">
      Our first lesson in duty is not taught in a textbook — it is practised each morning. Standing tall, the school sings the national anthem as the Jalur Gemilang is raised.
    </SectionHero>
    <section className="ppa-light-section"><div className="ppa-wrap ppa-lyrics-layout"><article><span className="ppa-gold-rule" />{NEGARAKU.map((line, index) => <p className={index === 0 ? "lead" : ""} key={line + index}>{line}</p>)}<small>Patriotism · Negaraku</small></article><aside><SpeakerHigh size={28} /><h3>Listen and practise</h3><p>Load a classroom-practice recording when you are ready to sing.</p><button type="button" className="ppa-outline-button" onClick={() => setShowAudio((value) => !value)}>{showAudio ? "Close recording" : "Load recording"}</button>{showAudio && <iframe src="https://www.youtube-nocookie.com/embed/t44hyUvRe8Y" title="Negaraku — national anthem of Malaysia" allow="encrypted-media; picture-in-picture" allowFullScreen />}</aside></div></section>
  </>;
}

function AnthemPanel() {
  const [gloss, setGloss] = useState("en");
  const active = GLOSSES.find((item) => item.id === gloss);
  return <>
    <SectionHero image="school-sunrise.jpg" imagePosition="50% 50%" align="right" eyebrow="03 · The school’s own song" title="SRSS Anthem" subtitle="Keunggulan insan tujuan kami">
      Our anthem names what we are here for: human excellence. Truth and justice are its call; kindness is its golden rule.
    </SectionHero>
    <section className="ppa-anthem-section"><div className="ppa-wrap"><div className="ppa-anthem-heading"><div><p className="eyebrow">The words</p><h3>Verse by verse.</h3></div><div className="ppa-gloss-tabs" role="tablist" aria-label="Anthem reading language">{GLOSSES.map((item) => <button type="button" role="tab" aria-selected={gloss === item.id} key={item.id} onClick={() => setGloss(item.id)}>{item.label}</button>)}</div></div><p className="ppa-gloss-note">{active.note} The anthem is always sung in Bahasa Melayu.</p><div className="ppa-anthem-verses">{ANTHEM.map((verse, index) => <article key={index}><span>Verse {index + 1}</span><div>{verse.ms.map((line, lineIndex) => <div className="ppa-anthem-line" key={line}><strong>{line}</strong><p lang={gloss === "ta" ? "ta" : gloss === "zh" ? "zh" : undefined}>{verse[gloss][lineIndex]}</p></div>)}</div></article>)}</div></div></section>
  </>;
}

function RukunPanel() {
  return <>
    <SectionHero image="assembly-rows.jpg" imagePosition="50% 55%" eyebrow="04 · Recited together" title="Rukun Negara">
      The five national principles are recited by the whole school after the anthem — one community, speaking with shared purpose.
    </SectionHero>
    <section className="ppa-rukun-section"><div className="ppa-wrap"><blockquote>Maka kami, rakyat Malaysia, berikrar akan menumpukan seluruh tenaga dan usaha kami untuk mencapai cita-cita tersebut berdasarkan atas prinsip-prinsip yang berikut<cite>Rukun Negara · preamble</cite></blockquote><div className="ppa-rukun-grid">{RUKUN.map(([ms, en, value], index) => <article className={`ppa-value-${value}`} key={ms}><strong>{index + 1}</strong><h3>{ms}</h3><p>{en}</p></article>)}</div></div></section>
  </>;
}

function PledgePanel() {
  return <>
    <SectionHero image="values-boards.jpg" imagePosition="70% 50%" eyebrow="05 · Right hand on heart" title="The SRSS School Pledge">
      Five values, said aloud each morning. The pledge helps every child name what they are practising — and promise it in their own voice.
    </SectionHero>
    <section className="ppa-pledge-section"><div className="ppa-wrap"><p className="ppa-pledge-opening">We are the children of Sathya Sai,<br/>striving to be ideal Sai students,<br/>shaped by Devotion, Duty and Discipline,<br/>guided by Discrimination and Determination.</p><div className="ppa-pledge-values">{PLEDGE_VALUES.map(([value, ms, verb, lines, color]) => <article className={`ppa-value-${color}`} key={value}><span /><div><small>I pledge to {verb}</small><h3>{value}</h3><em>{ms}</em></div><p>{lines}</p></article>)}</div><div className="ppa-pledge-closing"><p>I will love and respect my parents, teachers and elders in all circumstances.<br/>I will use my senses wisely, serve society and protect my country.<br/>I will bring a good name to my family, my school and to Swami,<br/>and let Love flow in all I think, say and do.</p><div><strong>Love all, Serve all.</strong><span>The last line of the pledge, and the first rule of the school.</span></div></div></div></section>
  </>;
}

function PrayersPanel() {
  const [activeId, setActiveId] = useState("morning");
  const active = useMemo(() => PRAYERS.find((prayer) => prayer.id === activeId), [activeId]);
  return <>
    <SectionHero image="prayer-leader.jpg" imagePosition="60% 35%" align="right" eyebrow="06 · Through the day" title="Prayers">
      Four prayers mark the school day — one to open it, one over lunch, one to close it, and one to dedicate everything in between.
    </SectionHero>
    <section className="ppa-prayers-section"><div className="ppa-wrap ppa-prayer-reader"><div className="ppa-prayer-tabs" role="tablist" aria-label="School prayers">{PRAYERS.map(({ id, tab, title, Icon }) => <button type="button" role="tab" aria-selected={activeId === id} onClick={() => setActiveId(id)} key={id}><Icon size={20} /><span><strong>{tab}</strong><small>{title}</small></span></button>)}</div><article><p className="eyebrow">{active.when}</p><h3>{active.title}</h3><span className="ppa-gold-rule" />{active.stanzas.map((stanza, index) => <p className="ppa-prayer-stanza" key={index}>{stanza.map((line) => <span key={line}>{line}</span>)}</p>)}</article></div></section>
  </>;
}

const PANELS = {
  "silent-sitting": SilentSittingPanel,
  negaraku: NegarakuPanel,
  anthem: AnthemPanel,
  "rukun-negara": RukunPanel,
  pledge: PledgePanel,
  prayers: PrayersPanel,
};

export function PrayerPledgeAnthemPage() {
  const [active, setActive] = useState("silent-sitting");
  const ActivePanel = PANELS[active];
  const selectPanel = (id) => { setActive(id); window.setTimeout(() => document.querySelector(".ppa-active-panel")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }), 0); };

  return <main id="main" className="ppa-page">
    <section className="ppa-page-hero">
      <img src={`${ASSET_ROOT}/seated-rows.png`} alt="SRSS pupils seated together during morning assembly" />
      <div className="ppa-page-hero-scrim" />
      <div className="ppa-wrap ppa-page-hero-inner"><nav aria-label="Breadcrumb"><a href="/">Home</a><span>›</span><a href="/#learning">Resources</a><span>›</span><strong>Prayer, Pledge &amp; Anthem</strong></nav><p className="eyebrow">Anthem · Pledge · Silence · Prayer</p><h1>Before the<br/><em>First Bell</em></h1><p>Anthem. Pledge. Silence. Prayer. This is how an SRSS morning begins — and why it stays with a child for life. Learn the words, practise them at home and carry their meaning into the day.</p></div>
    </section>

    <section className="ppa-order-section" aria-label="Assembly order"><div className="ppa-wrap ppa-order" role="tablist" aria-label="Choose an assembly practice">{ORDER.map(({ id, label, note, Icon }, index) => <button type="button" role="tab" aria-selected={active === id} aria-controls={`ppa-panel-${id}`} key={id} onClick={() => selectPanel(id)}><span><Icon size={18} /><b>{String(index + 1).padStart(2, "0")}</b></span><strong>{label}</strong><small>{note}</small></button>)}</div></section>
    <div className="ppa-spectrum" aria-hidden="true" />

    <div className="ppa-active-panel" id={`ppa-panel-${active}`} role="tabpanel"><ActivePanel /></div>

    <section className="ppa-print-section"><div className="ppa-wrap"><div><p className="eyebrow">For parents and teachers</p><h2>Keep the words close.</h2><p>Print this page for practice at home or in class. The printable version includes all six parts of the assembly sequence.</p></div><div><button type="button" className="primary-button" onClick={() => window.print()}><Printer size={18} /> Print this page</button><a className="ppa-text-link" href="/#values">Explore the five values <ArrowRight size={17} /></a></div></div></section>

    <div className="ppa-print-all" aria-hidden="true">{ORDER.filter((item) => item.id !== active).map((item) => { const Panel = PANELS[item.id]; return <div key={item.id}><Panel /></div>; })}</div>
  </main>;
}
