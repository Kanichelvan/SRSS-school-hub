import { useEffect, useMemo, useRef, useState } from "react";
import { Inline, parse } from "./markdown.jsx";
import { COPYRIGHT_YEAR, EFFECTIVE_DATE, LEGAL_STATUS, SAFEGUARDING_HREF, contact, emergencyLines, legalGroups, policies, policyBySlug, policyHref, safeguardingLead } from "./registry.js";
import "./legal.css";

const sources = import.meta.glob("./content/*.md", { query: "?raw", import: "default" });
const sourceFor = (policy) => sources[`./content/${policy.slug}.md`];
const pad = (number) => String(number).padStart(2, "0");

function DraftBanner() {
  if (LEGAL_STATUS !== "draft") return null;
  return <p className="legal-draft" role="note"><strong>Draft for review.</strong> These policies take effect on {EFFECTIVE_DATE}, once the School and its legal advisers have approved them.</p>;
}

function Dates() {
  return <p className="legal-dates">Effective date (last revised date): {EFFECTIVE_DATE}</p>;
}

function EmergencyLines() {
  return <ul className="legal-emergency">{emergencyLines.map(([label, number, href]) => <li key={label}><span>{label}</span><a href={href}>{number}</a></li>)}</ul>;
}

function ChildProtectionNotice() {
  return (
    <aside className="legal-notice" aria-labelledby="child-protection-notice">
      <h2 id="child-protection-notice">Child protection notice</h2>
      <p>SRSS Digital Hub serves primary-school children. Their safety, dignity and privacy come before convenience, publicity or administrative efficiency. Pupils’ information is collected only where it is needed, seen only by people with a legitimate reason, and shared with parents and legal guardians according to their verified authority.</p>
      <p>If you are worried about a child, contact the {safeguardingLead.title}, {safeguardingLead.name}, on <a href={safeguardingLead.phoneHref}>{safeguardingLead.phone}</a> or the Principal. If a child is in immediate danger, call 999. <a href={SAFEGUARDING_HREF}>Safeguarding contacts</a></p>
    </aside>
  );
}

function ContactCard() {
  return (
    <dl className="legal-contact-grid">
      <div><dt>Person in charge</dt><dd>{contact.person}, {contact.role}</dd></div>
      <div><dt>School</dt><dd>{contact.school}</dd></div>
      <div><dt>Address</dt><dd>{contact.address.join(" ")}</dd></div>
      <div><dt>Telephone</dt><dd><a href={contact.phoneHref}>{contact.phone}</a></dd></div>
      <div><dt>Email</dt><dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd></div>
    </dl>
  );
}

function Blocks({ blocks }) {
  return blocks.map((block, key) => {
    switch (block.type) {
      case "h2": return <h2 key={key} id={block.id}><Inline text={block.text} /></h2>;
      case "h3": return <h3 key={key} id={block.id}><Inline text={block.text} /></h3>;
      case "h4": return <h4 key={key} id={block.id}><Inline text={block.text} /></h4>;
      case "p": return block.text === "{{emergency}}" ? <EmergencyLines key={key} /> : <p key={key}><Inline text={block.text} /></p>;
      case "ul": return <ul key={key}>{block.items.map((item, i) => <li key={i}><Inline text={item} /></li>)}</ul>;
      case "ol": return <ol key={key}>{block.items.map((item, i) => <li key={i}><Inline text={item} /></li>)}</ol>;
      case "table": return <div key={key} className="legal-table" role="region" aria-label="Table" tabIndex={0}><table><thead><tr>{block.head.map((cell, i) => <th key={i} scope="col"><Inline text={cell} /></th>)}</tr></thead><tbody>{block.rows.map((row, r) => <tr key={r}>{row.map((cell, i) => (i === 0 ? <th key={i} scope="row"><Inline text={cell} /></th> : <td key={i}><Inline text={cell} /></td>))}</tr>)}</tbody></table></div>;
      case "container": return <Container key={key} block={block} />;
      default: return null;
    }
  });
}

function Container({ block }) {
  if (block.kind === "values") {
    const items = block.children.flatMap((child) => child.items || []);
    return <ul className="legal-values">{items.map((item, i) => <li key={i}><span className="legal-petal" aria-hidden="true" /><span><Inline text={item} /></span></li>)}</ul>;
  }
  if (block.kind === "contact") {
    return (
      <section className="legal-contact" aria-labelledby={block.id}>
        <h2 id={block.id}><Inline text={block.title} /></h2>
        <Blocks blocks={block.children.filter((child) => child.type === "p")} />
        <ContactCard />
        <Blocks blocks={block.children.filter((child) => child.type !== "p")} />
      </section>
    );
  }
  return (
    <aside className={block.kind === "note" ? "legal-note" : "legal-box"}>
      {block.title && <p className="legal-box-title"><Inline text={block.title} /></p>}
      <Blocks blocks={block.children} />
    </aside>
  );
}

function InstitutionalFooter() {
  return (
    <div className="legal-institution">
      <p className="legal-institution-title"><strong>SRSS Digital Hub</strong> An SSIOM Digital Initiative for Sekolah Rendah Sathya Sai</p>
      <dl>
        <div><dt>Parent Organisation & Platform Software Rights Holder</dt><dd>Sathya Sai International Organisation of Malaysia (SSIOM)</dd></div>
        <div><dt>Registered School Governing Entity</dt><dd>Sekolah Rendah Sathya Berhad (263453-U)</dd></div>
        <div><dt>Educational Institution</dt><dd>Sekolah Rendah Sathya Sai (SMIPS Code WDA0001)</dd></div>
        <div><dt>Platform Administration</dt><dd>The Principal and authorised personnel of Sekolah Rendah Sathya Sai</dd></div>
        <div><dt>Inaugural Initiative</dt><dd>SRSS25 — Silver Jubilee Digital Transformation Initiative</dd></div>
      </dl>
      <p className="legal-copyright">© {COPYRIGHT_YEAR} Sathya Sai International Organisation of Malaysia (SSIOM). All Rights Reserved.</p>
      <p className="legal-qualifier">Original platform software and associated proprietary digital intellectual property are subject to applicable ownership and licensing arrangements. Educational materials, pupil-created work, personal information, photographs, trademarks and third-party content remain subject to their respective rights holders and legal protections.</p>
    </div>
  );
}

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    if (!ids.length || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: "0px 0px -70% 0px" });
    ids.forEach((id) => { const node = document.getElementById(id); if (node) observer.observe(node); });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

function PolicyView({ policy }) {
  const [blocks, setBlocks] = useState(null);
  const [failed, setFailed] = useState(false);
  // Contents list starts open beside the text on wide screens and folded above it on phones.
  // Set once on the element (not as a React prop) so re-renders never re-fold it.
  const tocRef = useRef(null);
  useEffect(() => { if (tocRef.current) tocRef.current.open = window.matchMedia("(min-width: 1100px)").matches; }, []);

  useEffect(() => {
    let live = true;
    setBlocks(null); setFailed(false);
    sourceFor(policy)().then((text) => { if (live) setBlocks(parse(text)); }).catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [policy]);

  useEffect(() => {
    if (!blocks) return;
    const target = window.location.hash.slice(1);
    if (target) window.setTimeout(() => document.getElementById(target)?.scrollIntoView(), 0);
  }, [blocks]);

  const sections = useMemo(() => (blocks || []).filter((block) => block.type === "h2" || (block.type === "container" && block.kind === "contact")).map((block) => ({ id: block.id, text: block.text || block.title })), [blocks]);
  const sectionIds = useMemo(() => sections.map((section) => section.id), [sections]);
  const active = useActiveSection(sectionIds);

  // The child protection notice follows the introduction (before the second numbered section).
  const content = useMemo(() => {
    if (!blocks) return null;
    const secondHeading = blocks.findIndex((block, index) => index > 0 && (block.type === "h2" || block.kind === "contact"));
    const split = secondHeading === -1 ? blocks.length : secondHeading;
    return <><Blocks blocks={blocks.slice(0, split)} /><ChildProtectionNotice /><Blocks blocks={blocks.slice(split)} /></>;
  }, [blocks]);

  const position = policies.indexOf(policy);
  const previous = policies[position - 1];
  const next = policies[position + 1];

  return (
    <main id="main" className="legal-page">
      <header className="legal-hero">
        <p className="legal-crumb"><a href="/legal">Legal & policies</a><span aria-hidden="true">/</span>Policy {pad(policy.number)} of {pad(policies.length)}</p>
        <h1>SRSS Digital Hub — {policy.title}</h1>
        <Dates />
      </header>
      <DraftBanner />
      <div className="legal-salutation">
        <p className="legal-om">Om Sai Ram.</p>
        <p className="legal-lotus">Our loving salutations at the Divine Lotus Feet of Bhagawan Sri Sathya Sai Baba.</p>
      </div>
      <div className="legal-layout">
        <nav className="legal-toc" aria-label="On this page">
          <details ref={tocRef}>
            <summary>On this page</summary>
            <ol>{sections.map((section) => <li key={section.id}><a href={`#${section.id}`} aria-current={active === section.id ? "true" : undefined}><Inline text={section.text} /></a></li>)}</ol>
          </details>
        </nav>
        <article className="legal-article">
          {failed ? <p className="legal-error">This policy couldn’t load. Check your connection and refresh the page, or contact the School for a copy.</p> : content || <p className="legal-loading">Loading policy…</p>}
        </article>
      </div>
      <div className="legal-closing">
        <p className="legal-om">Om Sai Ram.</p>
        <InstitutionalFooter />
        <nav className="legal-pager" aria-label="Other policies">
          {previous ? <a href={policyHref(previous.slug)} rel="prev"><span>Previous policy</span>{previous.short || previous.title}</a> : <a href="/legal"><span>All policies</span>Legal & policies</a>}
          {next ? <a href={policyHref(next.slug)} rel="next"><span>Next policy</span>{next.short || next.title}</a> : <a href="/legal"><span>All policies</span>Legal & policies</a>}
        </nav>
      </div>
    </main>
  );
}

function LegalIndex() {
  return (
    <main id="main" className="legal-page legal-index">
      <header className="legal-hero">
        <p className="legal-crumb">SRSS Digital Hub</p>
        <h1>Legal & policies</h1>
        <Dates />
      </header>
      <DraftBanner />
      <div className="legal-salutation">
        <p className="legal-om">Om Sai Ram.</p>
        <p className="legal-lotus">Our loving salutations at the Divine Lotus Feet of Bhagawan Sri Sathya Sai Baba.</p>
      </div>
      <div className="legal-index-body">
        <p className="legal-lead">How SRSS Digital Hub is run, how the School protects children and their information, and where to raise a concern.</p>
        <section className="legal-urgent" aria-labelledby="urgent-title">
          <h2 id="urgent-title">Worried about a child’s safety?</h2>
          <p>Contact the {safeguardingLead.title}, {safeguardingLead.name} ({safeguardingLead.post}), on <a href={safeguardingLead.phoneHref}>{safeguardingLead.phone}</a> or <a href={`mailto:${safeguardingLead.email}`}>{safeguardingLead.email}</a>, or the School on <a href={contact.phoneHref}>{contact.phone}</a>. If a child is in immediate danger, do not wait for the School: call 999.</p>
          <EmergencyLines />
          <a className="legal-urgent-link" href="/legal/child-protection#s-7">How the School handles a concern</a>
        </section>
        {legalGroups.map((group) => (
          <section className="legal-group" key={group.title} aria-labelledby={`group-${group.slugs[0]}`}>
            <h2 id={`group-${group.slugs[0]}`}>{group.title}</h2>
            <ul>
              {group.slugs.map((slug) => { const policy = policyBySlug[slug]; return <li key={slug}><a href={policyHref(slug)}><span className="legal-number">{pad(policy.number)}</span><strong>{policy.title}</strong><span>{policy.summary}</span></a></li>; })}
              {group.extra?.map(([label, href]) => <li key={href}><a href={href}><span className="legal-number" aria-hidden="true">—</span><strong>{label}</strong><span>Address, telephone, email and visiting arrangements.</span></a></li>)}
            </ul>
          </section>
        ))}
        <section className="legal-about" aria-labelledby="about-hub">
          <h2 id="about-hub">About SRSS Digital Hub</h2>
          <p>The SRSS Digital Hub is an integrated digital platform established under the auspices of the Sathya Sai International Organisation of Malaysia (SSIOM) to support the educational, administrative, and community activities of Sekolah Rendah Sathya Sai (SRSS).</p>
          <p>Developed in conjunction with SRSS25, the School’s Silver Jubilee initiative, the platform serves as a unified digital environment connecting pupils, parents, guardians, teachers, administrators, alumni, and the wider school community. It will be progressively developed to support school communications, educational resources, pupil development, administrative services, and the School’s philosophy of Sathya Sai Educare and Human Excellence.</p>
          <p>The SRSS Digital Hub is owned by SSIOM and operated for SRSS, with the School retaining responsibility for its educational operations, pupil welfare, and school records.</p>
          <h3>Platform ownership and administration</h3>
          <p>The platform and its associated original software, design, and digital infrastructure are owned by SSIOM, subject to applicable third-party intellectual property rights. It is operated for the benefit of Sekolah Rendah Sathya Sai, with its day-to-day educational and administrative functions managed by the School under the supervision of its Principal and authorised personnel.</p>
          <p>The School remains responsible for the management and confidentiality of its educational records and personal information in accordance with applicable Malaysian laws.</p>
        </section>
      </div>
      <div className="legal-closing">
        <p className="legal-om">Om Sai Ram.</p>
        <InstitutionalFooter />
      </div>
    </main>
  );
}

export default function LegalPage({ slug }) {
  const policy = slug ? policyBySlug[slug] : null;
  useEffect(() => {
    document.title = policy ? `${policy.title} | SRSS Digital Hub` : "Legal & policies | SRSS Digital Hub";
  }, [policy]);
  if (slug && !policy) {
    return <main id="main" className="legal-page legal-index"><header className="legal-hero"><h1>Policy not found</h1><p className="legal-lead">This address doesn’t match a current policy. <a href="/legal">See all legal pages</a>.</p></header></main>;
  }
  return policy ? <PolicyView policy={policy} /> : <LegalIndex />;
}
