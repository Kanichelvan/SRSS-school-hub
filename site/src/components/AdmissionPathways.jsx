// Admissions page infographic: the Standard 1 intake as a numbered track, the two other routes into SRSS,
// the enrolment ceiling and what families should know. Facts come from src/data/admissions.js.
import { Megaphone } from "@phosphor-icons/react/dist/csr/Megaphone";
import { ChatsCircle } from "@phosphor-icons/react/dist/csr/ChatsCircle";
import { UsersThree } from "@phosphor-icons/react/dist/csr/UsersThree";
import { PencilLine } from "@phosphor-icons/react/dist/csr/PencilLine";
import { EnvelopeOpen } from "@phosphor-icons/react/dist/csr/EnvelopeOpen";
import { House } from "@phosphor-icons/react/dist/csr/House";
import { Files } from "@phosphor-icons/react/dist/csr/Files";
import { Handshake } from "@phosphor-icons/react/dist/csr/Handshake";
import { CalendarCheck } from "@phosphor-icons/react/dist/csr/CalendarCheck";
import { Coins } from "@phosphor-icons/react/dist/csr/Coins";
import { ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { ADMISSION_ROUTES, ENROLMENT } from "../data/admissions.js";
import "./admission-pathways.css";

const STEP_ICONS = [Megaphone, ChatsCircle, UsersThree, PencilLine, EnvelopeOpen];

function Capacity() {
  // One square for every ten pupils, up to the ceiling; the last ones stay open.
  const squares = Array.from({ length: ENROLMENT.max / 10 }, (_, index) => index < ENROLMENT.usual / 10);
  return <figure className="adm-capacity">
    <div className="adm-capacity-squares" role="img" aria-label={`About ${ENROLMENT.usual} pupils, never more than ${ENROLMENT.max}`}>
      {squares.map((filled, index) => <i key={index} className={filled ? "is-filled" : undefined} />)}
    </div>
    <figcaption>
      <strong>About {ENROLMENT.usual} pupils</strong>
      <span>SRSS never takes more than {ENROLMENT.max}, so that classes stay small and every child is known. Each square is ten pupils.</span>
    </figcaption>
  </figure>;
}

export default function AdmissionPathways() {
  const { standard1, midYear, pureLife } = ADMISSION_ROUTES;
  return <div className="adm-pathways">
    <section className="adm-intake" aria-labelledby="adm-intake-title">
      <header><h3 id="adm-intake-title">{standard1.title}</h3><p>{standard1.who}</p></header>
      <ol className="adm-track">{standard1.steps.map(([title, text], index) => {
        const Icon = STEP_ICONS[index];
        return <li key={title}>
          <span className="adm-track-icon"><Icon size={26} weight="duotone" aria-hidden="true" /></span>
          <p className="adm-track-step">Step {index + 1}</p>
          <h4>{title}</h4>
          <p>{text}</p>
        </li>;
      })}</ol>
    </section>

    <div className="adm-routes">
      <section aria-labelledby="adm-midyear-title">
        <h3 id="adm-midyear-title">{midYear.title}</h3>
        <p>{midYear.who}</p>
        <ol>{midYear.steps.map(([title, text]) => <li key={title}><strong>{title}</strong><span>{text}</span></li>)}</ol>
      </section>
      <section className="adm-routes-purelife" aria-labelledby="adm-purelife-title">
        <House size={30} weight="duotone" aria-hidden="true" />
        <h3 id="adm-purelife-title">{pureLife.title}</h3>
        <p>{pureLife.who}</p>
        <a className="text-link" href="/about/pure-life-society">Our partnership with the Pure Life Society <ArrowRight size={15} /></a>
      </section>
    </div>

    <div className="adm-know">
      <Capacity />
      <section aria-labelledby="adm-know-title">
        <h3 id="adm-know-title">Good to know</h3>
        <ul>
          <li><CalendarCheck size={22} weight="duotone" aria-hidden="true" /><span>Standard 1 places are filled through the yearly intake. <a href="#enquiry">Make an enquiry</a> so the school can let you know the interview date.</span></li>
          <li><EnvelopeOpen size={22} weight="duotone" aria-hidden="true" /><span>A place is offered in writing, in the school's offer letter.</span></li>
          <li><Files size={22} weight="duotone" aria-hidden="true" /><span>Joining during the year? Ask the school office which documents to bring.</span></li>
          <li><Handshake size={22} weight="duotone" aria-hidden="true" /><span>Before your interview, read the <a href="/join/parent-partnership">Parent–School Partnership</a> and the <a href="/student-life/vegetarian-food">vegetarian food policy</a>.</span></li>
          <li><Coins size={22} weight="duotone" aria-hidden="true" /><span>See the <a href="/join/fees">school fees</a>, and the <a href="/join/fees/sponsorship">sponsorship and assistance</a> available.</span></li>
        </ul>
      </section>
    </div>
  </div>;
}
