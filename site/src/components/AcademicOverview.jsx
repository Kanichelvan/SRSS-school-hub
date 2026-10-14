import { academicSubjects, schoolHours, standards } from '../data/academics.js';

export default function AcademicOverview() {
  return <section className="academic-learning" id="learning" aria-labelledby="learning-title">
    <div className="academic-main">
      <div className="academic-copy" data-reveal>
        <p className="eyebrow">Learning experience</p>
        <h2 id="learning-title">Strong foundations.<br />Open hearts.</h2>
        <p className="academic-intro">Rooted in Malaysia’s national curriculum, SRSS nurtures confident learners with a global outlook. Bahasa Malaysia is the main language of instruction, with English woven through the curriculum and school life.</p>
        <p>Science and Mathematics are taught in English through the Dual Language Programme, while pupils also build familiarity with key terminology in Bahasa Malaysia.</p>
        <div className="academic-subjects">
          <div><h3>Standard 1 <span>KP2027</span></h3><p className="academic-syllabus">New Ministry of Education syllabus from 2027</p><p>{academicSubjects.standard1.join(' · ')}</p></div>
          <div><h3>Standards 2–6 <span>KSSR</span></h3><p><strong>Core subjects:</strong> {academicSubjects.core.join(', ')}. History is a core subject in Standards 4–6.</p><p><strong>Non-core subjects:</strong> {academicSubjects.nonCore.join(', ')}.</p></div>
        </div>
        <p className="academic-maths">Mathematics develops arithmetic, logical reasoning and problem-solving, supported by understanding in English and Bahasa Malaysia.</p>
        <a className="text-link" href="/learning/curriculum">Explore the curriculum</a>
      </div>
      <figure className="academic-photo" data-reveal="image"><img src="/assets/photos/processed/science-microscope-1600.jpg" alt="An SRSS pupil examining a specimen through a microscope during a science activity." width="1600" height="1200" loading="lazy" decoding="async" /></figure>
    </div>
    <div className="academic-essentials">
      <div><h3>Our six-year journey</h3><dl className="academic-standards">{standards.map((name, index) => <div key={name}><dt>Standard {index + 1}</dt><dd>{name}</dd></div>)}</dl></div>
      <div className="academic-hours" id="school-hours"><h3>The school week</h3><p>7.40 am start · Monday–Friday</p><table><caption>School finishing times</caption><thead><tr><th scope="col">Day</th><th scope="col">Standard 1</th><th scope="col">Standards 2–6</th></tr></thead><tbody>{schoolHours.map(({ days, standard1, standards2to6 }) => <tr key={days}><th scope="row">{days}</th><td>{standard1}</td><td>{standards2to6}</td></tr>)}</tbody></table><p className="academic-weekend">Occasional weekend events offer further enrichment.</p></div>
      <div className="academic-extra"><h3>Beyond the core</h3><p><strong>Mother-tongue classes</strong><br />Tamil, Chinese and Telugu</p><p><strong>SSEHV</strong><br />Sathya Sai Education in Human Values</p><p><strong>ICT</strong><br />Information and Communication Technology</p></div>
    </div>
  </section>;
}

export function ActiveBodies() {
  return <section className="active-bodies" id="active-bodies" aria-labelledby="active-bodies-title">
    <figure className="active-bodies-photo" data-reveal="image"><img src="/assets/photos/processed/football-match-1600.jpg" alt="SRSS pupils competing in a football match." width="1600" height="900" loading="lazy" decoding="async" /></figure>
    <div className="active-bodies-copy" data-reveal>
      <p className="eyebrow">Co-curricular life</p>
      <h2 id="active-bodies-title">Active bodies.<br />Confident spirits.</h2>
      <p>Sports, games and co-curricular activities give children space to build strength, confidence and friendships. They learn to practise with commitment, compete fairly and support one another.</p>
      <div className="active-bodies-achievement"><h3>2025 · State football champions</h3><p>SRSS’s boys’ and girls’ football teams won state titles in 2025, celebrating their teamwork, discipline and determination.</p></div>
      <p>Chess tournament participation develops concentration, strategic thinking and patience. Across these experiences, children discover their strengths and grow through challenge.</p>
      <a className="text-link" href="/student-life/sports">Explore sports and co-curricular life</a>
    </div>
  </section>;
}
