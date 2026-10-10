import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { BookOpen } from "@phosphor-icons/react/dist/csr/BookOpen";
import { Clock } from "@phosphor-icons/react/dist/csr/Clock";
import { Flag } from "@phosphor-icons/react/dist/csr/Flag";
import { HandHeart } from "@phosphor-icons/react/dist/csr/HandHeart";
import { Headphones } from "@phosphor-icons/react/dist/csr/Headphones";
import { Info } from "@phosphor-icons/react/dist/csr/Info";
import { Moon } from "@phosphor-icons/react/dist/csr/Moon";
import { MusicNotes } from "@phosphor-icons/react/dist/csr/MusicNotes";
import { Play } from "@phosphor-icons/react/dist/csr/Play";
import { Printer } from "@phosphor-icons/react/dist/csr/Printer";
import { Sparkle } from "@phosphor-icons/react/dist/csr/Sparkle";
import { Sun } from "@phosphor-icons/react/dist/csr/Sun";
import { UsersThree } from "@phosphor-icons/react/dist/csr/UsersThree";
import { X } from "@phosphor-icons/react/dist/csr/X";

const ASSET_ROOT = "/assets/prayer-page";

const ORDER = [
  { id: "silent-sitting", label: "Silent Sitting", note: "Ten minutes · 7.30 am", Icon: Sparkle },
  { id: "prayers", label: "School Prayers", note: "Morning, lunch and close", Icon: Sun },
  { id: "negaraku", label: "Negaraku", note: "The national anthem", Icon: Flag },
  { id: "rukun-negara", label: "Rukun Negara", note: "Five national principles", Icon: BookOpen },
  { id: "anthem", label: "SRSS Anthem", note: "Keunggulan insan", Icon: MusicNotes },
  { id: "pledge", label: "School Pledge", note: "Right hand raised", Icon: HandHeart },
];

// Daily guided visualisations (audio by the Sathya Sai Baba Centre of Bandar Klang).
const VISUALISATIONS = [
  { id: "YLbwrteoGS8", title: "Jyothi meditation", theme: "Light", accent: "nonviolence" },
  { id: "sXLdBVWFrSE", title: "Courage visualisation", theme: "Courage", accent: "truth" },
  { id: "SoBIt6-9FmE", title: "Trust visualisation", theme: "Trust", accent: "peace" },
  { id: "fgy7n-AvypY", title: "Colour breathing visualisation", theme: "Breathing", accent: "love" },
  { id: "wxUpC_MHjdg", title: "Treehouse meditation", theme: "Imagination", accent: "conduct" },
];

const SILENT_AIMS = [
  "The ability to be calm and to concentrate (physical and mental alertness).",
  "The ability to listen and to be aware of one’s inner feelings and inner voice (conscience).",
  "The awareness that happiness, peace and love come from inside and not from outside.",
  "The creation of an inner world of positive images and feelings, building confidence in oneself and good feeling towards others.",
  "The ability to identify with others, and to expand these positive feelings to include all of the outside world.",
];

const SILENT_REFERENCES = [
  "Bealing, J. (1997). Meditation prescribed for unruly children. Times Educational Supplement, 13 June 1997, Issue 4224, p. 23.",
  "Jumsai Na Ayudhya, A. (1997). The Five Human Values and Human Excellence. Bangkok: International Institute of Sathya Sai Education.",
  "Kratter, J. & Hogan, J. (1982). The Use of Meditation in the Treatment of Attention Deficit Disorder with Hyperactivity. ERIC Document ED232787.",
  "Rickard, J. (1994). Relaxation for Children. Melbourne: Australian Council for Educational Research.",
  "Rozman, D. (1994). Meditation with Children: The Art of Concentration and Centering. Boulder Creek, CA: Planetary Publications.",
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
  { id: "en", label: "English meaning", note: "An unofficial reading for meaning, not a singing translation." },
  { id: "ta", label: "தமிழ்", note: "Tamil reading for meaning — pending review by the language panel." },
  { id: "zh", label: "中文", note: "Mandarin reading for meaning — pending review by the language panel." },
  { id: "ph", label: "Pronunciation", note: "A syllable guide for singing; capitals mark the stressed syllable." },
];

const RUKUN = [
  ["Kepercayaan kepada Tuhan", "Belief in God", "truth"],
  ["Kesetiaan kepada Raja dan Negara", "Loyalty to King and Country", "conduct"],
  ["Keluhuran Perlembagaan", "Upholding the Constitution", "peace"],
  ["Kedaulatan undang-undang", "Rule of Law", "love"],
  ["Kesopanan dan kesusilaan", "Courtesy and Morality", "nonviolence"],
];

const PLEDGE = [
  ["We are the children of Sathya Sai,", "Proud students of SRSS,", "Striving to be our very best."],
  ["With Devotion in our hearts,", "Duty in our actions,", "Discipline in our lives,", "Discrimination in our choices,", "And Determination in all our efforts."],
  ["We pledge to live the Five Human Values:", "Truth, Right Conduct, Peace, Love and Non-violence,", "In all that we think, say and do."],
  ["We shall honour our parents, teachers and elders,", "Love and serve Malaysia, our Motherland,", "And remember that service to humanity is service to God."],
  ["We shall use our senses wisely,", "Do our duties wholeheartedly,", "And strive for excellence in all that we do."],
  ["With noble thoughts, loving hearts and helping hands,", "We shall bring honour to our families, our school and our nation."],
  ["We are the children of SRSS", "We shall be the best that we can be!"],
];

// Words highlighted in the pledge: the five Ds in gold, each human value in its own colour.
const PLEDGE_ACCENTS = [["Devotion", "d"], ["Duty", "d"], ["Discipline", "d"], ["Discrimination", "d"], ["Determination", "d"], ["Truth", "truth"], ["Right Conduct", "conduct"], ["Peace", "peace"], ["Love", "love"], ["Non-violence", "nonviolence"]];
function accentLine(line) {
  // The value colours belong to the line that names the Five Human Values, not to verbs like "Love and serve".
  const accents = line.startsWith("Truth,") ? PLEDGE_ACCENTS : PLEDGE_ACCENTS.filter(([, kind]) => kind === "d");
  const pattern = new RegExp(`\\b(${accents.map(([word]) => word).join("|")})\\b`, "g");
  return line.split(pattern).map((part, index) => {
    const match = accents.find(([word]) => word === part);
    return match ? <span key={index} className={match[1] === "d" ? "ppa-pledge-d" : `ppa-value-${match[1]}`}>{part}</span> : part;
  });
}

const PRAYERS = [
  {
    id: "morning", tab: "Morning", title: "Universal Prayer", when: "Morning assembly", Icon: Sun, accent: "nonviolence",
    stanzas: [
      ["Dear God, as this new day begins,", "be the light that shines within."],
      ["Be in my mind, and make my thinking clear.", "Be in my eyes, and let me see the good in all.", "Be in my ears, and let me listen with care.", "Be in my mouth, and let my words be true and kind.", "Be in my hands, and let them help and serve.", "Be in my feet, and guide me on the right path.", "Be in my heart, and let me love all."],
      ["Make me a light for someone today."],
    ],
  },
  {
    id: "lunch", tab: "Lunchtime", title: "Food Prayer", when: "Before the midday meal", Icon: HandHeart, accent: "love",
    stanzas: [
      ["Thank You, God, for this food,", "for sun and rain that made it grow,", "for farmers’ hands and cooks’ kind care,", "for all the love that brought it here."],
      ["Thank you dear parents, teachers, and uncles and aunties", "who have prepared this food for us today.", "Thank you, God, for the food."],
      ["I offer this food to You with gratitude.", "May it give me strength to learn, to serve, and to love.", "May all beings everywhere have enough to eat."],
    ],
  },
  {
    id: "closing", tab: "Closing", title: "Peace Prayer", when: "End of the school day", Icon: Moon, accent: "peace",
    stanzas: [
      ["For the lessons I have learnt today,", "for friends who shared my work and play,", "for teachers who have shown the way,", "thank You, God, for this day."],
      ["Let there be Peace in my heart,", "Peace in my home,", "Peace in my country,", "and Peace in all the world."],
      ["Let there be Joy in my heart,", "Joy in my home,", "Joy in my country,", "and Joy in all the world."],
      ["Let there be Love in my heart,", "Love in my home,", "Love in my country,", "and Love in all the world."],
    ],
  },
];
const PRAYER_WORDS = { Peace: "peace", Joy: "nonviolence", Love: "love" };
const prayerLine = (line) => line.split(/\b(Peace|Joy|Love)\b/).map((part, index) => PRAYER_WORDS[part] ? <span key={index} className={`ppa-prayer-word ppa-tint-${PRAYER_WORDS[part]}`}>{part}</span> : part);

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

// One look for every recording: a designed cover that turns into the YouTube player when pressed.
// (YouTube's terms require the player to stay visible, so playback opens in a small video frame.)
function MediaCard({ videoId, title, meta, accent = "peace", label = "Listen" }) {
  const [playing, setPlaying] = useState(false);
  return <figure className={`ppa-media ppa-accent-${accent}`}>
    {playing
      ? <iframe src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
      : <button type="button" className="ppa-media-cover" onClick={() => setPlaying(true)} aria-label={`${label}: ${title}`}>
        <span className="ppa-media-rings" aria-hidden="true" /><span className="ppa-media-play" aria-hidden="true"><Play size={22} weight="fill" /></span>
        <span className="ppa-media-text"><strong>{title}</strong><small>{meta}</small></span>
      </button>}
  </figure>;
}

function SilentSittingPanel() {
  return <>
    <SectionHero image="silent-sitting-practice.jpg" imagePosition="50% 40%" eyebrow="01 · Every school day begins here" title="Silent Sitting">
      Every SRSS day begins with ten minutes of Silent Sitting for every pupil and teacher. It is not a religious practice. It is a mindfulness experience, guided by creative visualisation, that helps the mind settle before learning begins.
    </SectionHero>
    <section className="ppa-light-section ppa-silent">
      <div className="ppa-wrap">
        <ul className="ppa-silent-facts">
          <li><Clock size={24} aria-hidden="true" /><strong>7.30 am sharp</strong><span>Ten minutes, every school day. Silent Sitting is compulsory for all, with no exceptions.</span></li>
          <li><UsersThree size={24} aria-hidden="true" /><strong>Mondays, together</strong><span>The whole school practises as one at the Monday assembly.</span></li>
          <li><BookOpen size={24} aria-hidden="true" /><strong>Other days, in class</strong><span>Each class practises together at the start of its first period.</span></li>
        </ul>
        <div className="ppa-silent-grid">
          <article>
            <p className="eyebrow">Why we begin in silence</p>
            <h3>A calm start makes everything easier.</h3>
            <p>Teaching is harder today. Teachers everywhere face more trouble with discipline, shorter attention spans and pupils who struggle to stay motivated. Life is busier and more complicated for children too.</p>
            <p>For the good of both pupils and teachers, we look for simple ways to help, ones that work in the classroom without taking much time from lessons. Silent Sitting and creative visualisation are two of them.</p>
            <h4>Learning to enjoy our own company</h4>
            <p>Part of finding inner peace is learning to be happy in our own company, rather than always looking for others to fill the quiet. Everyone needs time to be completely alone, and to enjoy it. Yet many children have never been fully alone, out of sight and hearing of another person.</p>
          </article>
          <article className="ppa-silent-aims">
            <p className="eyebrow">Aim and objectives</p>
            <h3>Stillness lets us see who we really are.</h3>
            <p>When the mind is full of one thought after another, we cannot look inside ourselves. In stillness, children can experience the qualities of Peace, Love, Truth, Right Conduct and Non-violence that lie within, listen to the voice of God, their conscience, and discover a happiness that lasts. In the Sathya Sai Human Values Programme, Silent Sitting aims to develop:</p>
            <ul>{SILENT_AIMS.map((aim) => <li key={aim}>{aim}</li>)}</ul>
            <p>There are sound reasons in brain physiology for the practice, but perhaps its greatest gift is the chance to develop control over the mind.</p>
          </article>
        </div>
        <section className="ppa-research" aria-labelledby="ppa-research-title">
          <h3 id="ppa-research-title">What the research says</h3>
          <div><p>Meditation and quiet reflection have helped disruptive or inattentive pupils (Bealing, 1997). One study found that it improved children’s decision making and put them in touch with their deeper values (Rozman, 1994); another found it helped them cope better with stressful events (Rickard, 1994). Other benefits have included less impulsive behaviour, longer attention spans and better behaviour overall (Kratter &amp; Hogan, 1982).</p>
          <details><summary>References</summary><ol>{SILENT_REFERENCES.map((item) => <li key={item}>{item}</li>)}</ol></details></div>
        </section>
        <section className="ppa-guides" aria-labelledby="ppa-guides-title">
          <div className="ppa-guides-head"><Headphones size={28} aria-hidden="true" /><div><p className="eyebrow">Daily guided visualisations</p><h3 id="ppa-guides-title">A different journey each morning.</h3><p>Each day pupils follow a 7–10 minute audio guide, exploring themes such as love, light, courage and gratitude. Try one at home.</p></div></div>
          <div className="ppa-guides-grid">{VISUALISATIONS.map((item) => <MediaCard key={item.id} videoId={item.id} title={item.title} meta={`${item.theme} · guided audio`} accent={item.accent} />)}</div>
          <p className="ppa-credit">Audio guides by the Sathya Sai Baba Centre of Bandar Klang.</p>
        </section>
      </div>
    </section>
  </>;
}

function PrayersPanel() {
  const [activeId, setActiveId] = useState("morning");
  const active = useMemo(() => PRAYERS.find((prayer) => prayer.id === activeId), [activeId]);
  return <>
    <SectionHero image="prayer-at-microphone.jpg" imagePosition="35% 30%" align="right" eyebrow="02 · After the silence" title="School Prayers">
      After Silent Sitting, the school prays together. Three prayers mark the day: one to open it, one before lunch and one to close it.
    </SectionHero>
    <section className="ppa-prayers-section"><div className="ppa-wrap ppa-prayer-reader"><div className="ppa-prayer-tabs" role="tablist" aria-label="School prayers">{PRAYERS.map(({ id, tab, title, Icon, accent }) => <button type="button" role="tab" aria-selected={activeId === id} className={`ppa-tint-${accent}`} onClick={() => setActiveId(id)} key={id}><Icon size={20} /><span><strong>{tab}</strong><small>{title}</small></span></button>)}</div><article className={`ppa-prayer-text ppa-tint-${active.accent}`} key={active.id}><p className="eyebrow">{active.when}</p><h3>{active.title}</h3><span className="ppa-spectrum-rule" aria-hidden="true" />{active.stanzas.map((stanza, index) => <p className="ppa-prayer-stanza" key={index}>{stanza.map((line) => <span key={line}>{prayerLine(line)}</span>)}</p>)}</article></div></section>
  </>;
}

function NegarakuPanel() {
  const [factsOpen, setFactsOpen] = useState(false);
  const dialog = useRef(null);
  useEffect(() => { if (factsOpen) dialog.current?.showModal(); }, [factsOpen]);
  return <>
    <SectionHero image="negaraku-flag-raising.jpg" imagePosition="40% 30%" eyebrow="03 · Standing to attention" title="Negaraku">
      Our first lesson in duty is not taught in a textbook. It is practised each morning. Standing tall, the school sings the national anthem as the Jalur Gemilang is raised.
    </SectionHero>
    <section className="ppa-light-section"><div className="ppa-wrap ppa-lyrics-layout"><article><span className="ppa-gold-rule" />{NEGARAKU.map((line, index) => <p className={index === 0 ? "lead" : ""} key={line + index}>{line}</p>)}<small>Patriotism · Negaraku</small></article>
      <aside><MediaCard videoId="Kpi8lB4srDU" title="Lagu Negaraku" meta="Official version · Jabatan Penerangan Malaysia" accent="truth" label="Play" /><button type="button" className="ppa-facts-button" onClick={() => setFactsOpen(true)}><Info size={20} aria-hidden="true" /> Did you know?</button></aside>
    </div></section>
    {factsOpen && <dialog ref={dialog} className="ppa-facts" aria-labelledby="ppa-facts-title" onClose={() => setFactsOpen(false)} onCancel={() => setFactsOpen(false)}>
      <button type="button" className="ppa-facts-close" onClick={() => dialog.current?.close()} aria-label="Close"><X size={20} /></button>
      <p className="eyebrow">Did you know?</p>
      <h3 id="ppa-facts-title">The story behind Negaraku</h3>
      <ul>
        <li><strong>A melody that travelled.</strong> The tune is traced to “La Rosalie”, a 19th-century French melody associated with Pierre-Jean de Béranger, which later became the traditional Malay and Indonesian song “Terang Bulan”.</li>
        <li><strong>From a state anthem.</strong> Negaraku comes from the state anthem of Perak, “Allah Lanjutkan Usia Sultan”.</li>
        <li><strong>Chosen in 1957.</strong> When a worldwide contest failed to produce a suitable national song, a committee led by Tunku Abdul Rahman chose the Perak melody for the newly independent Federation of Malaya.</li>
      </ul>
    </dialog>}
  </>;
}

function RukunPanel() {
  return <>
    <SectionHero image="assembly-rows.jpg" imagePosition="50% 55%" eyebrow="04 · Recited together" title="Rukun Negara">
      The five national principles are recited by the whole school after the anthem: one community, speaking with shared purpose.
    </SectionHero>
    <section className="ppa-rukun-section"><div className="ppa-wrap">
      <div className="ppa-rukun-preamble">
        <p className="ppa-rukun-lead">Maka kami, rakyat Malaysia, berikrar akan menumpukan seluruh tenaga dan usaha kami untuk mencapai cita-cita tersebut berdasarkan atas prinsip-prinsip yang berikut:</p>
      </div>
      <div className="ppa-rukun-grid">{RUKUN.map(([ms, en, value], index) => <article className={`ppa-value-${value}`} key={ms}><strong>{index + 1}</strong><h3>{ms}</h3><p>{en}</p></article>)}</div>
    </div></section>
  </>;
}

function AnthemPanel() {
  const [gloss, setGloss] = useState(null);
  const active = GLOSSES.find((item) => item.id === gloss);
  return <>
    <SectionHero image="school-flag-raising.jpg" imagePosition="40% 35%" align="right" eyebrow="05 · The school’s own song" title="SRSS Anthem" subtitle="Keunggulan insan tujuan kami">
      Our anthem names what we are here for: human excellence. Truth and justice are its call; kindness is its golden rule.
    </SectionHero>
    <section className="ppa-anthem-section"><div className="ppa-wrap"><div className="ppa-anthem-heading"><div><p className="eyebrow">Sung in Bahasa Melayu</p><h3>The whole anthem.</h3></div><div className="ppa-gloss-tabs" role="group" aria-label="Show the meaning">{GLOSSES.map((item) => <button type="button" aria-pressed={gloss === item.id} key={item.id} onClick={() => setGloss(gloss === item.id ? null : item.id)}>{item.label}</button>)}</div></div>
      <p className="ppa-gloss-note">{active ? `${active.note} The anthem is always sung in Bahasa Melayu.` : "Choose a language above to show the meaning beside each line."}</p>
      <div className={`ppa-anthem-verses${gloss ? " has-gloss" : ""}`}>{ANTHEM.map((verse, index) => <article key={index}>{verse.ms.map((line, lineIndex) => <div className="ppa-anthem-line" key={line}><strong>{line}</strong>{gloss && <p lang={gloss === "ta" ? "ta" : gloss === "zh" ? "zh" : undefined}>{verse[gloss][lineIndex]}</p>}</div>)}</article>)}</div>
    </div></section>
  </>;
}

function PledgePanel() {
  return <>
    <SectionHero image="pledge-hand-raised.jpg" imagePosition="45% 35%" eyebrow="06 · Right hand raised" title="SRSS School Pledge">
      Said aloud each morning, the pledge helps every child name the values they practise, and promise them in their own voice.
    </SectionHero>
    <section className="ppa-pledge-section"><div className="ppa-wrap ppa-pledge-text">{PLEDGE.map((stanza, index) => <p key={index} className={index === PLEDGE.length - 1 ? "ppa-pledge-final" : ""}>{stanza.map((line) => <span key={line}>{accentLine(line)}</span>)}</p>)}</div></section>
  </>;
}

const PANELS = {
  "silent-sitting": SilentSittingPanel,
  prayers: PrayersPanel,
  negaraku: NegarakuPanel,
  "rukun-negara": RukunPanel,
  anthem: AnthemPanel,
  pledge: PledgePanel,
};

export function PrayerPledgeAnthemPage() {
  // Deep links such as /resources/prayer-pledge-anthem#prayers open that part of the sequence.
  const fromHash = () => { const id = window.location.hash.slice(1); return ORDER.some((item) => item.id === id) ? id : null; };
  const [active, setActive] = useState(() => fromHash() || "silent-sitting");
  useEffect(() => {
    const onHash = () => { const id = fromHash(); if (id) setActive(id); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const ActivePanel = PANELS[active];
  const selectPanel = (id) => { setActive(id); window.setTimeout(() => document.querySelector(".ppa-active-panel")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }), 0); };

  return <main id="main" className="ppa-page">
    <section className="ppa-page-hero">
      <img src={`${ASSET_ROOT}/seated-rows.png`} alt="SRSS pupils seated together during morning assembly" />
      <div className="ppa-page-hero-scrim" />
      <div className="ppa-wrap ppa-page-hero-inner"><nav aria-label="Breadcrumb"><a href="/">Home</a><span>›</span><a href="/#learning">Resources</a><span>›</span><strong>Prayer, Pledge &amp; Anthem</strong></nav><p className="eyebrow">Silence · Prayer · Anthem · Pledge</p><h1>Before the<br/><em>First Bell</em></h1><p>Silence. Prayer. Anthem. Pledge. This is how an SRSS morning begins — and why it stays with a child for life. Learn the words, practise them at home and carry their meaning into the day.</p></div>
    </section>

    <section className="ppa-order-section" aria-label="Assembly order"><div className="ppa-wrap ppa-order" role="tablist" aria-label="Choose an assembly practice">{ORDER.map(({ id, label, note, Icon }, index) => <button type="button" role="tab" aria-selected={active === id} aria-controls={`ppa-panel-${id}`} key={id} onClick={() => selectPanel(id)}><span><Icon size={18} /><b>{String(index + 1).padStart(2, "0")}</b></span><strong>{label}</strong><small>{note}</small></button>)}</div></section>
    <div className="ppa-spectrum" aria-hidden="true" />

    <div className="ppa-active-panel" id={`ppa-panel-${active}`} role="tabpanel"><ActivePanel /></div>

    <section className="ppa-print-section"><div className="ppa-wrap"><div><p className="eyebrow">For parents and teachers</p><h2>Keep the words close.</h2><p>Print this page for practice at home or in class. The printable version includes all six parts of the assembly sequence.</p></div><div><button type="button" className="primary-button" onClick={() => window.print()}><Printer size={18} /> Print this page</button><a className="ppa-text-link" href="/#values">Explore the five values <ArrowRight size={17} /></a></div></div></section>

    <div className="ppa-print-all" aria-hidden="true">{ORDER.filter((item) => item.id !== active).map((item) => { const Panel = PANELS[item.id]; return <div key={item.id}><Panel /></div>; })}</div>
  </main>;
}
