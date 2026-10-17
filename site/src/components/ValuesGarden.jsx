import { useState } from 'react';

// Coordinates follow the supplied artwork, inside its transparent content bounds.
const positions = [
  { x: '49.8%', y: '14.1%', angle: '0deg' },
  { x: '15%', y: '37.4%', angle: '-56deg' },
  { x: '82.7%', y: '37.4%', angle: '56deg' },
  { x: '28.7%', y: '76.5%', angle: '24deg' },
  { x: '70.3%', y: '76.5%', angle: '-24deg' },
];

export default function ValuesGarden({ values, id = 'values', idPrefix = 'home-value' }) {
  const [active, setActive] = useState(0);
  const value = values[active];
  return <section className="home-values-garden" id={id} aria-labelledby={`${idPrefix}s-title`}>
    <div className="home-values-inner">
      <div className="home-values-art" role="group" aria-label="Explore the five human values">
        <svg viewBox="306 238 1458 1534" width="1458" height="1534" aria-hidden="true" focusable="false">
          <image href="/assets/brand/originals/srss25-values-petals-2026.png" x="0" y="0" width="2000" height="2000" />
        </svg>
        {values.map((item, index) => <button key={item.name} type="button" className={`home-value-petal home-value-${item.className}`} style={{ '--petal-x': positions[index].x, '--petal-y': positions[index].y, '--petal-angle': positions[index].angle }} aria-label={`Explore ${item.name}`} aria-pressed={active === index} aria-controls={`${idPrefix}-explanation`} onClick={() => setActive(index)}>
          <span>{item.petalLabel.map((line) => <span key={line}>{line}</span>)}</span>
        </button>)}
      </div>
      <div className="home-values-copy">
        <p className="eyebrow">Sai Educare Philosophy</p>
        <h2 id={`${idPrefix}s-title`}>Five values.<br />{' '}One way of life.</h2>
        <p>Truth, Right Conduct, Peace, Love and Nonviolence guide how we learn, care and grow together.</p>
        <p className="home-values-cue">Choose a petal to explore a value.</p>
        <div id={`${idPrefix}-explanation`} className={`home-value-explanation ${value.className}`} role="region" aria-labelledby={`${idPrefix}-name`} aria-live="polite" aria-atomic="true">
          <div key={active} className="home-value-content"><h3 id={`${idPrefix}-name`}>{value.name}</h3><p>{value.description}</p><p className="home-value-practice">{value.practice}</p></div>
        </div>
      </div>
    </div>
  </section>;
}
