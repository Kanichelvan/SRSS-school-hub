import { useEffect, useState } from 'react';

const outcomes = [
  { title: 'Academic Excellence', tone: 'red', copy: 'Strong foundations in Malaysia’s national curriculum build knowledge, curiosity and confidence. Children learn to question, think critically and apply what they know, with support for each learner’s strengths and pace.', href: '/learning/curriculum', link: 'Explore our curriculum' },
  { title: 'Character Development', tone: 'blue', copy: 'Integrity, self-awareness and compassion develop through reflection, relationships and everyday choices. Children learn to act responsibly, persevere through difficulty and grow into thoughtful people of character.', href: '/about/sathya-sai-education', link: 'Discover Sai Educare' },
  { title: 'Civic Stewardship', tone: 'purple', copy: 'Children learn to respect Malaysia’s diversity and recognise their place in the wider human family. Service, kindness and care for the environment turn altruistic responsibility into practical contributions to the community.', href: '/student-life/service', link: 'See service in action' },
  { title: 'Holistic Empowerment', tone: 'green', copy: 'Head, Heart and Hands grow together: clear thinking, compassionate character and purposeful action. Learning, creativity, movement and service help children develop confidence, resilience and the ability to contribute meaningfully.', href: '/learning', link: 'Explore learning at SRSS' },
  { title: 'Human Values', tone: 'orange', copy: 'Truth, Right Conduct, Peace, Love and Nonviolence guide learning and relationships. These five values are practised through daily choices, reflection and service, helping children grow with kindness, integrity and inner strength.', href: '/learning#values', link: 'Explore the five values' },
];

export default function OutcomeTabs() {
  const [active, setActive] = useState(0);
  const [emphasised, setEmphasised] = useState(null);
  const selected = outcomes[active];
  const select = (index) => { setActive(index); setEmphasised(index); };
  // Scrolling clears only the decorative shine; the selected explanation stays open.
  useEffect(() => {
    if (emphasised === null) return undefined;
    const clear = () => setEmphasised(null);
    window.addEventListener('scroll', clear, { passive: true });
    return () => window.removeEventListener('scroll', clear);
  }, [emphasised]);
  const move = (event, index) => {
    const next = event.key === 'ArrowRight' ? (index + 1) % outcomes.length : event.key === 'ArrowLeft' ? (index - 1 + outcomes.length) % outcomes.length : event.key === 'Home' ? 0 : event.key === 'End' ? outcomes.length - 1 : null;
    if (next !== null) {
      event.preventDefault(); select(next);
      event.currentTarget.parentElement.children[next].focus();
    }
  };
  return <section className="home-outcomes" aria-labelledby="outcomes-title">
    <h2 id="outcomes-title" className="visually-hidden">Five outcomes we offer</h2>
    <div className="outcome-tabs" role="tablist" aria-label="Five outcomes we offer">
      {outcomes.map((outcome, index) => <button key={outcome.title} type="button" role="tab" id={`outcome-tab-${index}`} className={`outcome-tab outcome-${outcome.tone}${emphasised === index ? ' is-emphasised' : ''}`} aria-selected={active === index} aria-controls="outcome-panel" tabIndex={active === index ? 0 : -1} onClick={() => select(index)} onKeyDown={(event) => move(event, index)}>{outcome.title}</button>)}
    </div>
    <div className={`outcome-panel outcome-${selected.tone}`} id="outcome-panel" role="tabpanel" aria-labelledby={`outcome-tab-${active}`} tabIndex={0} key={active}>
      <h3>{selected.title}</h3><p>{selected.copy}</p><a className="text-link" href={selected.href}>{selected.link}</a>
    </div>
  </section>;
}
