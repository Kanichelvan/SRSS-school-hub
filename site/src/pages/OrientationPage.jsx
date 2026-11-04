// Year 1 2027 parent orientation (/resources/year-1-orientation-2027): the School's KP2027 orientation deck
// (Nov 2026) as a printable resource page, one section per slide in deck order. School hours come from
// academics.js. Loaded on demand to keep the homepage light.
import { BookOpen } from "@phosphor-icons/react/dist/csr/BookOpen";
import { ChatCircleDots } from "@phosphor-icons/react/dist/csr/ChatCircleDots";
import { Check } from "@phosphor-icons/react/dist/csr/Check";
import { CheckCircle } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { Code } from "@phosphor-icons/react/dist/csr/Code";
import { Globe } from "@phosphor-icons/react/dist/csr/Globe";
import { HandHeart } from "@phosphor-icons/react/dist/csr/HandHeart";
import { Heartbeat } from "@phosphor-icons/react/dist/csr/Heartbeat";
import { Lightbulb } from "@phosphor-icons/react/dist/csr/Lightbulb";
import { Moon } from "@phosphor-icons/react/dist/csr/Moon";
import { MusicNotes } from "@phosphor-icons/react/dist/csr/MusicNotes";
import { PaintBrush } from "@phosphor-icons/react/dist/csr/PaintBrush";
import { Printer } from "@phosphor-icons/react/dist/csr/Printer";
import { Users } from "@phosphor-icons/react/dist/csr/Users";
import { Wrench } from "@phosphor-icons/react/dist/csr/Wrench";
import { Closing, PageHero, PageSection } from "./SitePages.jsx";
import { schoolHours } from "../data/academics.js";
import "./orientation.css";

const CONTENTS = [
  ["Welcome", [["kp2027", "The first batch"]]],
  ["What changes", [["changes", "KSSR and KP2027"], ["alam", "Alam dan Manusia"], ["character", "More Maths, more character"], ["tahap", "Three stages"], ["notextbook", "No textbooks"]]],
  ["SRSS, the week and home", [["srssplus", "What SRSS adds"], ["hours", "School hours"], ["athome", "Learning at home"]]],
  ["Progress", [["assessment", "Assessment"], ["summary", "At a glance"]]],
];

const YEARS = [2027, 2028, 2029, 2030, 2031, 2032];

const CHANGES = [
  ["Primary stages", "Two: Year 1–3 and Year 4–6", "Three stages of two years each"],
  ["Year 1 subjects", "Science, Health, Visual Art and Music taught separately", "Merged into one subject: Alam dan Manusia"],
  ["Mathematics", "3 hours a week", "3.5 hours a week in Years 1 and 2"],
  ["Character building", "No dedicated slot", "60 minutes every week, preschool to Form 5"],
  ["Textbooks", "A textbook for each subject", "None: short topic modules, digital and printed"],
  ["Teaching", "One teacher per lesson", "Two teachers co-teach Alam dan Manusia"],
  ["Progress levels", "Six levels, TP1 to TP6", "Three in Years 1–2: Know, Understand, Do"],
];

const AREAS = [[Lightbulb, "Science"], [Heartbeat, "Health Education"], [PaintBrush, "Visual Art"], [MusicNotes, "Music"], [Wrench, "TVET & digital"]];
const ALAM = [
  ["Themes and projects", "One topic, such as the human body, links all five areas."],
  ["Two teachers, one class", "They plan, teach and assess together, as equal partners."],
  ["Learning by doing", "Children learn body parts by singing about them and drawing them."],
];

const STAGES = [
  ["Tahap 1 · Std 1 & 2", "2027 – 2028", "Literasi, numerasi dan pembentukan karakter", "Reading, writing, counting and character"],
  ["Tahap 2 · Std 3 & 4", "2029 – 2030", "Aplikasi kemahiran, pengetahuan dan nilai", "Applying skills, knowledge and values"],
  ["Tahap 3 · Std 5 & 6", "2031 – 2032", "Menganalisis dan menghasilkan inovasi", "Analysing and creating new ideas"],
];

const OUTCOME_STEPS = [
  ["We set the outcome", "Teachers decide what every child should know, understand and be able to do."],
  ["We plan the learning", "Short topic modules, projects and activities, digital and printed."],
  ["Your child shows it", "Through class work and projects, not by finishing a book."],
];
const AT_HOME_CHECKS = ["No book to rush ahead in", "Ask what they made or found out today", "Look out for module sheets and project notes"];

const ADDS = [
  [HandHeart, "SSEHV", "Sathya Sai Education in Human Values: the five values, lived every day."],
  [Code, "ICT", "A school subject from Year 1, so digital skills grow early."],
  [Users, "Remedial support", "Volunteer teachers give extra help to any child who needs it."],
  [BookOpen, "Reading programmes", "Library time and reading campaigns to build a reading habit."],
];
const LANGUAGES = [["தமிழ்", "Tamil", "ta"], ["中文", "Chinese", "zh"], ["తెలుగు", "Telugu", "te"]];

const HOME = [
  [BookOpen, "Read every day", "A short story time together, in any language you use at home."],
  [CheckCircle, "Finish the day's tasks", "Homework and project pieces, at a regular time and place."],
  [ChatCircleDots, "Talk about school", "Ask what they made, found out or wondered about today."],
  [Moon, "Rest and play", "Early nights for a 7.40 am start, and time to play freely."],
];

const CALENDAR = [
  ["First assessment", "Parent review", true],
  ["Monthly · core", "", false],
  ["Mid-year · written + projects", "", true],
  ["Monthly · core", "", false],
  ["Final · written + projects", "Parent review", true],
];

const SUMMARY = [
  ["First batch", "On KP2027 from Year 1 in 2027 to Year 6 in 2032."],
  ["Three stages", "Basics and character, then applying, then analysing and creating."],
  ["One new subject", "Science, health, art, music, TVET and digital in Alam dan Manusia."],
  ["More time", "Maths 3.5 hours and character building 60 minutes every week."],
  ["SRSS extras", "Tamil, Chinese, Telugu, SSEHV, ICT, reading and remedial support."],
  ["No textbooks", "SRSS sets the outcomes; written tests and projects show progress."],
];

// Standard 1's week, from the confirmed timetable: minutes after the 7.40 am start.
const START = 7 * 60 + 40;
const minutes = (time) => { const [clock, half] = time.split(" "); const [h, m] = clock.split(".").map(Number); return (h % 12 + (half === "pm" ? 12 : 0)) * 60 + m; };
const WEEK = schoolHours.flatMap(({ days, standard1, standards2to6 }) =>
  (days === "Mon & Tue" ? ["Monday", "Tuesday"] : [days]).map((day) => ({ day, ends: standard1, length: minutes(standard1) - START, seniorsLater: standard1 !== standards2to6 ? standards2to6 : "" })));
const LONGEST = Math.max(...WEEK.map((item) => item.length));
const TOTAL = WEEK.reduce((sum, item) => sum + item.length, 0);
const SHORT_DAYS = WEEK.filter((item) => item.length < LONGEST - 30).map((item) => item.day);

const cell = (row, column) => column === row ? "child" : column < row ? "new" : "old";
const CELL_LABEL = { child: "Your child", new: "KP2027", old: "KSSR" };

export function OrientationPage() {
  return <main id="main" className="site-page kp-page">
    <PageHero eyebrow="Year 1 parent orientation · 2027" title={<>Year 1, 2027: <em>the first batch of KP2027.</em></>}
      image="/assets/prayer-page/pledge-hand-raised.jpg" alt="An SRSS pupil in the lilac uniform leading the pledge at the microphone, hand raised, with the school building and flags behind."
      actions={<><a className="primary-button" href="#changes">What changes</a><button type="button" className="text-button" onClick={() => window.print()}><Printer size={18} aria-hidden="true" /> Print this guide</button></>}>
      <p>Your child joins the first SRSS class to learn under Kurikulum Persekolahan 2027, the first new primary curriculum since KSSR began in 2011. This guide follows the orientation we give Year 1 parents.</p>
    </PageHero>

    <nav className="kp-contents page-inner" aria-label="In this guide">
      {CONTENTS.map(([part, items], index) => <div key={part}>
        <p><span>{String(index + 1).padStart(2, "0")}</span>{part}</p>
        <ul>{items.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ul>
      </div>)}
    </nav>

    <PageSection id="kp2027" eyebrow="The first batch · Kumpulan perintis" title="Your child's class is the first to learn under KP2027." tone="cream">
      <div className="kp-split">
        <div className="kp-lead">
          <p className="kp-stat">16 years</p>
          <p className="kp-stat-label">Since the last new primary curriculum, KSSR, in 2011</p>
          <p>KP2027 moves up one year group at a time. In 2027 only Year 1 starts it; Years 2 to 6 finish on KSSR. Your child's class leads the change every year until Year 6.</p>
          <ul className="kp-legend">
            <li className="is-child">Your child's class</li>
            <li className="is-new">Younger classes, also on KP2027</li>
            <li className="is-old">Older classes, still on KSSR</li>
          </ul>
        </div>
        <div className="kp-table-wrap">
          <table className="kp-rollout">
            <caption className="visually-hidden">Which curriculum each year group follows, 2027 to 2032</caption>
            <thead><tr><td /><th scope="col">Year 1</th><th scope="col">Year 2</th><th scope="col">Year 3</th><th scope="col">Year 4</th><th scope="col">Year 5</th><th scope="col">Year 6</th></tr></thead>
            <tbody>{YEARS.map((year, row) => <tr key={year}><th scope="row">{year}</th>{YEARS.map((_, column) => { const kind = cell(row, column); return <td key={column} className={`is-${kind}`}>{CELL_LABEL[kind]}</td>; })}</tr>)}</tbody>
          </table>
        </div>
      </div>
    </PageSection>

    <PageSection id="changes" eyebrow="What changes · Apa yang berubah" title="KSSR and KP2027, side by side." tone="navy">
      <div className="kp-table-wrap">
        <table className="kp-compare">
          <thead><tr><td /><th scope="col">KSSR · since 2011</th><th scope="col">KP2027 · your child</th></tr></thead>
          <tbody>{CHANGES.map(([topic, before, now]) => <tr key={topic}><th scope="row">{topic}</th><td>{before}</td><td>{now}</td></tr>)}</tbody>
        </table>
      </div>
    </PageSection>

    <PageSection id="alam" eyebrow="New subject · Mata pelajaran baharu" title="Five areas become one subject.">
      <div className="kp-merge">
        <ul className="kp-areas">{AREAS.map(([Icon, label]) => <li key={label}><Icon size={24} weight="duotone" aria-hidden="true" />{label}</li>)}</ul>
        <div className="kp-merge-result"><h3>Alam dan Manusia</h3><p>Pembelajaran Bersepadu</p></div>
      </div>
      <ul className="kp-cards">{ALAM.map(([title, body]) => <li key={title}><h3>{title}</h3><p>{body}</p></li>)}</ul>
      <p className="kp-note">Science returns as a named subject in Years 3 and 4, as Eksplorasi Sains dan Teknologi.</p>
    </PageSection>

    <PageSection id="character" eyebrow="More time for what matters" title="More Maths. More character." tone="cream">
      <div className="kp-time">
        <div className="kp-time-card">
          <p className="kp-stat">3.5 h</p>
          <p className="kp-stat-label">Mathematics every week</p>
          <dl className="kp-bars">
            <div><dt>KSSR</dt><dd><span><i style={{ width: `${(3 / 3.5) * 100}%` }} /></span>3 h</dd></div>
            <div className="is-now"><dt>KP2027</dt><dd><span><i style={{ width: "100%" }} /></span>3.5 h</dd></div>
          </dl>
        </div>
        <div className="kp-time-card">
          <p className="kp-stat">60 min</p>
          <p className="kp-stat-label">Character building every week</p>
          <p>New for every Malaysian school. At SRSS, it is what we have done every day since 2002.</p>
        </div>
        <figure className="kp-quote">
          <blockquote>The end of education is character.</blockquote>
          <figcaption>Bhagawan Sri Sathya Sai Baba</figcaption>
        </figure>
      </div>
    </PageSection>

    <PageSection id="tahap" eyebrow="Three stages · Tiga tahap" title="Three stages, each asking more of your child.">
      <div className="kp-stages-intro">
        <h3>Memorising alone will not be enough.</h3>
        <p>Each stage expects more maturity. Children move from mastering the basics to applying what they know, then to analysing and creating.</p>
      </div>
      <ol className="kp-stages">{STAGES.map(([stage, years, malay, english], index) => <li key={stage}>
        {index === 0 && <p className="kp-here">Your child starts here</p>}
        <p className="kp-stage-label">{stage}</p>
        <p className="kp-stage-years">{years}</p>
        <h3 lang="ms">{malay}</h3>
        <p>{english}</p>
      </li>)}</ol>
    </PageSection>

    <PageSection id="notextbook" eyebrow="No textbooks · Tiada buku teks" title={<>No textbooks, so <em>SRSS sets the outcome</em> for every lesson.</>} tone="navy">
      <ol className="kp-steps">{OUTCOME_STEPS.map(([title, body], index) => <li key={title}><span>{index + 1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol>
      <div className="kp-checks">
        <p className="eyebrow">What this means at home</p>
        <ul>{AT_HOME_CHECKS.map((item) => <li key={item}><Check size={22} weight="bold" aria-hidden="true" />{item}</li>)}</ul>
      </div>
    </PageSection>

    <PageSection id="srssplus" eyebrow="Beyond the syllabus · Keistimewaan SRSS" title="What SRSS adds to the national curriculum." tone="cream">
      <ul className="kp-adds">
        <li className="kp-languages">
          <Globe size={28} weight="duotone" aria-hidden="true" />
          <p className="kp-stage-label">Languages</p>
          <h3>Mother-tongue classes</h3>
          <ul>{LANGUAGES.map(([script, name, lang]) => <li key={name}><span lang={lang}>{script}</span>{name}</li>)}</ul>
          <p>On top of Bahasa Melayu and English.</p>
        </li>
        {ADDS.map(([Icon, title, body]) => <li key={title}><Icon size={28} weight="duotone" aria-hidden="true" /><h3>{title}</h3><p>{body}</p></li>)}
      </ul>
    </PageSection>

    <PageSection id="hours" eyebrow="School hours · Waktu persekolahan" title="Every Year 1 day starts at 7.40 am.">
      <div className="kp-hours">
        <ul className="kp-week">{WEEK.map(({ day, ends, length, seniorsLater }) => <li key={day}>
          <span className="kp-week-day">{day}</span>
          <span className="kp-week-track"><span className="kp-week-bar" style={{ width: `${(length / LONGEST) * 100}%` }}>7.40 am – {ends}</span></span>
          {seniorsLater && <small>Standards 2–6 stay until {seniorsLater}</small>}
        </li>)}</ul>
        <div className="kp-hours-total">
          <p className="kp-stat">{Math.floor(TOTAL / 60)} h {TOTAL % 60} min</p>
          <p className="kp-stat-label">In school each week</p>
          <p>{SHORT_DAYS.join(" and ")} are the short days for Year 1. Please plan pick-up around the earlier finish.</p>
        </div>
      </div>
    </PageSection>

    <PageSection id="athome" eyebrow="Learning at home · Di rumah" title="Keep your child engaged. Extra tuition is not the answer." tone="cream">
      <ul className="kp-cards kp-cards-four">{HOME.map(([Icon, title, body]) => <li key={title}><Icon size={28} weight="duotone" aria-hidden="true" /><h3>{title}</h3><p>{body}</p></li>)}</ul>
      <div className="kp-callout">
        <h3>Why tuition won't help</h3>
        <p>KP2027 is taught and assessed through projects, class work and character, not drilled exam answers. A rested, curious, engaged child learns most in class. If your child needs extra help, talk to the class teacher first: SRSS volunteers provide remedial support.</p>
      </div>
    </PageSection>

    <PageSection id="assessment" eyebrow="Assessment · Pentaksiran" title="Two ways of assessing your child." tone="navy">
      <div className="kp-assess">
        <div><p className="eyebrow">Core subjects</p><h3>Written assessment</h3><p className="kp-assess-subjects">Bahasa Melayu, English, Mathematics, Moral</p><p>Monthly, plus a written paper at mid-year and year end.</p></div>
        <div><p className="eyebrow">Non-core subjects</p><h3>Projects and class work</h3><p className="kp-assess-subjects">Alam dan Manusia, PE, Character, SSEHV, ICT, languages</p><p>Assessed in lessons; projects count at mid-year and year end.</p></div>
      </div>
      <ol className="kp-calendar" aria-label="The assessment year">{CALENDAR.map(([label, review, major], index) => <li key={index} className={major ? "is-major" : undefined}>
        {review && <span className="kp-review">{review}</span>}
        <span className="kp-dot" aria-hidden="true" />
        <span>{label}</span>
      </li>)}</ol>
      <div className="kp-levels">
        <div><p className="eyebrow">KSSR · six levels</p><ul>{[1, 2, 3, 4, 5, 6].map((level) => <li key={level}>{level}</li>)}</ul></div>
        <div className="is-now"><p className="eyebrow">KP2027 Year 1–2 · three levels</p><ul>{["Know", "Understand", "Do"].map((level) => <li key={level}>{level}</li>)}</ul></div>
        <p>From Year 3: four levels, adding Apply. EHV marks come with every progress report.</p>
      </div>
    </PageSection>

    <PageSection id="summary" eyebrow="At a glance · Ringkasan" title="Year 1 at SRSS in 2027, in six points.">
      <ol className="kp-summary">{SUMMARY.map(([title, body], index) => <li key={title}><p className="kp-stage-label">{String(index + 1).padStart(2, "0")} · {title}</p><p>{body}</p></li>)}</ol>
    </PageSection>

    <Closing title="Questions about Year 1?">
      <a className="primary-button" href="/resources/contact">Contact the school</a>
      <a className="text-button" href="/learning">How SRSS teaches</a>
    </Closing>
  </main>;
}
