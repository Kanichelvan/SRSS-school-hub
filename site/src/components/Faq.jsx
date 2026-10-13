// Shared FAQ rendering: the full FAQ page, the homepage preview and topic subsets on landing pages
// all read the same FAQ records (single content source).
import { useState } from "react";
import { Plus } from "@phosphor-icons/react/dist/csr/Plus";

export function FaqAnswer({ item }) {
  return <div className="faq-answer">
    {item.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    {item.bullets?.length ? <ul>{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
    {item.sections?.map((section) => <section key={section.heading}><h4>{section.heading}</h4>{section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets?.length ? <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}</section>)}
    {item.closing ? <p>{item.closing}</p> : null}
  </div>;
}

export function FaqAccordion({ items, openIndex, onToggle, idPrefix }) {
  return <div className="faq-list">{items.map((item, index) => {
    const answerId = `${idPrefix}-answer-${index}`;
    const isOpen = openIndex === index;
    return <article key={item.question}><button type="button" onClick={() => onToggle(isOpen ? null : index)} aria-expanded={isOpen} aria-controls={answerId}>{item.question}<Plus size={19} className={isOpen ? "turned" : ""} /></button>{isOpen ? <div id={answerId}><FaqAnswer item={item} /></div> : null}</article>;
  })}</div>;
}

// A topic subset of the FAQ, chosen by question wording, with its own open state.
export function FaqList({ items, questions, idPrefix, firstOpen = false }) {
  const picked = questions.map((question) => items.find((item) => item.question === question)).filter(Boolean);
  const [openIndex, setOpenIndex] = useState(firstOpen ? 0 : null);
  if (!picked.length) return null;
  return <FaqAccordion items={picked} openIndex={openIndex} onToggle={setOpenIndex} idPrefix={idPrefix} />;
}

export const FAQ_TOPICS = {
  curriculum: ["What curriculum does SRSS follow?", "What subjects are offered at SRSS?", "What is the medium of instruction at SRSS?", "How are students assessed at SRSS?"],
  journey: ["What year levels are offered at SRSS?", "What is the teacher-to-student ratio at SRSS?"],
  profile: ["Is SRSS a registered school in Malaysia?", "What year levels are offered at SRSS?", "What are the school hours at SRSS?", "Where is SRSS located?"],
  schoolDay: ["What are the school hours at SRSS?", "Does SRSS provide meals and transport?"],
  whySrss: ["What makes SRSS different from other schools?", "Is SRSS a religious school?"],
  fees: ["What are the school fees?"],
  admissions: ["What year levels are offered at SRSS?", "Does SRSS accept mid-year admissions?", "Is SRSS a registered school in Malaysia?", "Is SRSS a religious school?"],
};
