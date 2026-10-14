import { useEffect, useState } from "react";
import { ArrowUp } from "@phosphor-icons/react/dist/csr/ArrowUp";
import { Buildings } from "@phosphor-icons/react/dist/csr/Buildings";
import { CaretDown } from "@phosphor-icons/react/dist/csr/CaretDown";
import { ChalkboardTeacher } from "@phosphor-icons/react/dist/csr/ChalkboardTeacher";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/csr/EnvelopeSimple";
import { MapPin } from "@phosphor-icons/react/dist/csr/MapPin";
import { NavigationArrow } from "@phosphor-icons/react/dist/csr/NavigationArrow";
import { Phone } from "@phosphor-icons/react/dist/csr/Phone";
import { Student } from "@phosphor-icons/react/dist/csr/Student";
import { UsersThree } from "@phosphor-icons/react/dist/csr/UsersThree";
import { SAFEGUARDING_HREF } from "./legal/registry.js";
import { CookiePreferencesButton } from "./components/CookiePreferences.jsx";

const MAP_HREF = "https://maps.google.com/?q=6+Jalan+Puchong+Taman+Tan+Yew+Lai+58200+Kuala+Lumpur";
const PHONE = ["+60 12-600 1926", "tel:+60126001926"];
const EMAIL = "saischoolpuchong@gmail.com";

const explore = [["About SRSS", "/about"], ["Learning", "/learning"], ["Student Life", "/student-life"], ["News & Events", "/resources/news"], ["SRSS25", "/about/silver-jubilee"]];
const hubs = [["Parent Hub", "/hub/parent", UsersThree], ["Student Hub", "/hub/student", Student], ["Teacher Hub", "/hub/teacher", ChalkboardTeacher], ["Administration Hub", "/hub/admin", Buildings]];
const policies = [["Privacy Policy", "/legal/privacy"], ["Terms of Use", "/legal/terms"], ["Child Safeguarding", SAFEGUARDING_HREF]];

const scrollToTop = () => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });

function useNarrow(query) {
  const [narrow, setNarrow] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setNarrow(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return narrow;
}

// Desktop: a titled column. Phones: a collapsed accordion, so the footer starts short.
function Group({ title, narrow, children }) {
  if (narrow) return <details className="site-footer-group"><summary>{title}<CaretDown size={16} aria-hidden="true" /></summary><div className="site-footer-links">{children}</div></details>;
  return <nav className="site-footer-group" aria-label={title}><h2>{title}</h2><div className="site-footer-links">{children}</div></nav>;
}

export function PreFooter({ onVisit }) {
  return (
    <section className="prefooter" aria-labelledby="prefooter-title">
      <div className="prefooter-inner">
        <div>
          <h2 id="prefooter-title">Every Child Deserves the Opportunity to Flourish.</h2>
          <p>Discover an education that nurtures academic excellence, character and human values.</p>
        </div>
        <div className="prefooter-actions">
          <a className="prefooter-primary" href="/about">Discover SRSS</a>
          <button type="button" className="prefooter-secondary" onClick={onVisit}>Arrange a School Visit</button>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter({ onVisit }) {
  const narrow = useNarrow("(max-width: 720px)");
  const year = new Date().getFullYear();
  const support = <>
    <a href="/join/admissions">Admissions</a>
    <button type="button" onClick={onVisit}>Visit SRSS</button>
    <a href="/resources/faq">FAQ</a>
    <a href="/resources">Resources &amp; Downloads</a>
    <a href="/resources/contact">Contact the School</a>
  </>;

  return (
    <footer id="community" className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-identity">
          <div className="footer-brand">
            <img src="/assets/srss-logo.png" alt="" />
            <div><strong>Sekolah Rendah Sathya Sai</strong><span>Shaping Minds. Nurturing Hearts. Inspiring Lives.</span></div>
          </div>
          <p><strong>Sekolah Rendah Sathya Sai</strong> is a human value-based primary school dedicated to nurturing academic excellence, character, and compassionate leadership. Guided by the philosophy of Sathya Sai Educare, we inspire every child to discover the human values of Truth, Right Conduct, Peace, Love, and Nonviolence, empowering them to become confident learners and responsible global citizens.</p>
          {narrow && <div className="site-footer-quick" aria-label="Contact the school">
            <a href={PHONE[1]}><Phone size={18} aria-hidden="true" />Call School</a>
            <a href={`mailto:${EMAIL}`}><EnvelopeSimple size={18} aria-hidden="true" />Email Us</a>
            <a href={MAP_HREF} target="_blank" rel="noreferrer"><NavigationArrow size={18} aria-hidden="true" />Get Directions</a>
          </div>}
        </div>

        <div className="site-footer-columns">
          {!narrow && <Group title="Contact" narrow={false}>
            <a href={MAP_HREF} target="_blank" rel="noreferrer" className="site-footer-address"><MapPin size={16} aria-hidden="true" /><span>6, Jalan Puchong<br />Taman Tan Yew Lai<br />58200 Kuala Lumpur<br />Malaysia</span></a>
            <a href={PHONE[1]}><Phone size={16} aria-hidden="true" />{PHONE[0]}</a>
            <a href={`mailto:${EMAIL}`}><EnvelopeSimple size={16} aria-hidden="true" />{EMAIL}</a>
          </Group>}
          <Group title="Explore SRSS" narrow={narrow}>{explore.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</Group>
          <Group title="Digital Hub" narrow={narrow}>{hubs.map(([label, href, Icon]) => <a key={href} href={href} className="site-footer-hub"><span aria-hidden="true"><Icon size={16} weight="duotone" /></span>{label}</a>)}</Group>
          <Group title="Information & Support" narrow={narrow}>{support}</Group>
          {narrow && <Group title="Policies & Governance" narrow>{policies.map(([label, href]) => <a key={href} href={href}>{label}</a>)}<a href="/legal">All Policies →</a></Group>}
        </div>
      </div>

      {!narrow && <nav className="site-footer-policies" aria-label="Policies and governance">
        <h2>Policies &amp; Governance</h2>
        <p>{policies.map(([label, href]) => <span key={href}><a href={href}>{label}</a><span aria-hidden="true">·</span></span>)}<a href="/legal" className="site-footer-all">All Policies →</a></p>
      </nav>}

      <div className="site-footer-base">
        <div className="site-footer-legalese">
          <p>© {year} Sathya Sai International Organisation of Malaysia. All rights reserved.</p>
          <p className="site-footer-jubilee"><strong>SRSS25</strong> | 25 years of Shaping Minds. Nurturing Hearts. Inspiring Lives.</p>
        </div>
        <p className="site-footer-utility"><a href="/legal/accessibility-complaints">Accessibility</a><span aria-hidden="true">·</span><a href="/legal/privacy">Privacy</a><span aria-hidden="true">·</span><CookiePreferencesButton /><span aria-hidden="true">·</span><button type="button" onClick={scrollToTop}>Back to Top <ArrowUp size={13} weight="bold" aria-hidden="true" /></button></p>
      </div>
    </footer>
  );
}
