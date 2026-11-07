// Public News & Announcements archive (SRSS Connect Part 1 §6.2, Part 2 §3.1): /announcements and
// /announcements/<id>. It shows only the sanitized public copies the server writes for approved, live,
// whole-school notices — never attachments, audiences, student details or hub links.
import { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { PageHero } from "./SitePages.jsx";
import { orderPublicNotices } from "../components/AnnouncementBar.jsx";
import "../components/announcement-bar.css";

const FILTERS = [
  ["all", "All", () => true],
  ["notices", "School Notices", (item) => !["academic", "events", "achievements", "srss25"].includes(item.category)],
  ["academic", "Academic", (item) => item.category === "academic"],
  ["events", "Events", (item) => item.category === "events"],
  ["achievements", "Achievements", (item) => item.category === "achievements"],
  ["srss25", "SRSS25", (item) => item.category === "srss25"],
];
const CATEGORY_LABELS = { general: "School notice", academic: "Academic", administrative: "Administrative", events: "Event", activities: "Student activities", humanExcellence: "Human Excellence", health: "Health & safety", parentEngagement: "Parents", forms: "Forms & consent", achievements: "Achievement", srss25: "SRSS25", emergency: "Emergency", class: "Class" };
const PRIORITY_LABELS = { P1: "Emergency", P2: "Important" };
const dateLabel = (date) => (date ? new Date(`${date}T12:00:00`).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" }) : "");
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur" }).format(new Date());
export const liveNotices = (notices = []) => orderPublicNotices(notices.filter((item) => item.status === "published" && (!item.expiresAt || item.expiresAt >= today())));

function Meta({ item }) {
  return <p className="eyebrow">{[PRIORITY_LABELS[item.priority], CATEGORY_LABELS[item.category] || "School notice", item.reference, dateLabel(item.date)].filter(Boolean).join(" · ")}</p>;
}

export function AnnouncementsPage({ notices, loaded = true }) {
  const [filter, setFilter] = useState("all");
  const items = liveNotices(notices);
  const shown = items.filter(FILTERS.find(([id]) => id === filter)[2]);
  return <main id="main" className="site-page">
    <PageHero eyebrow="News & announcements" title={<>School <em>announcements.</em></>}>
      <p>Current public notices from Sekolah Rendah Sathya Sai. Families receive class and private notices in the SRSS Digital Hub.</p>
    </PageHero>
    <section className="page-inner announcement-archive" aria-labelledby="announcement-list-title">
      <h2 id="announcement-list-title" className="visually-hidden">Current announcements</h2>
      <div className="announcement-filters" role="group" aria-label="Filter announcements">{FILTERS.map(([id, label]) => <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}</div>
      {!loaded ? <p className="announcement-empty" role="status">Loading announcements…</p> : shown.length ? <ul className="announcement-list">{shown.map((item) => <li key={item.id} className={`announcement-card announcement-${item.priority || "P3"}`}>
        <Meta item={item} />
        <h2><a href={`/announcements/${item.id}`}>{item.title}</a></h2>
        <p>{item.summary || item.body}</p>
        {item.action?.href && <a className="text-link" href={item.action.href}>{item.action.label} <ArrowRight size={14} aria-hidden="true" /></a>}
      </li>)}</ul> : <p className="announcement-empty">{items.length ? "No announcements in this category right now." : "There are no public announcements right now. School news is on the News & Updates page."}</p>}
      <a className="text-link" href="/resources/news">News &amp; Updates <ArrowRight size={14} aria-hidden="true" /></a>
    </section>
  </main>;
}

export function AnnouncementPage({ notices, id, loaded = true }) {
  const item = liveNotices(notices).find((notice) => notice.id === id);
  if (!loaded) return <main id="main" className="site-page" aria-busy="true"><section className="page-inner announcement-detail"><p className="announcement-empty" role="status">Loading…</p></section></main>;
  if (!item) return <main id="main" className="site-page"><section className="page-inner announcement-detail"><p className="eyebrow">School announcements</p><h1>This announcement is no longer available.</h1><p>It may have ended or been withdrawn. Current notices are listed on the announcements page.</p><a className="text-link" href="/announcements">All announcements <ArrowRight size={14} aria-hidden="true" /></a></section></main>;
  return <main id="main" className="site-page">
    <article className="page-inner announcement-detail">
      <Meta item={item} />
      <h1>{item.title}</h1>
      {item.summary && !String(item.body || "").replace(/\s+/g, " ").startsWith(item.summary.slice(0, 190)) && <p className="announcement-lead">{item.summary}</p>}
      <div className="announcement-body">{item.body}</div>
      {item.action?.href && <a className="primary-button announcement-cta" href={item.action.href}>{item.action.label}{item.action.deadline ? ` · by ${dateLabel(item.action.deadline)}` : ""}</a>}
      {item.expiresAt && <p className="eyebrow">Shown until {dateLabel(item.expiresAt)}</p>}
      <a className="text-link" href="/announcements">All announcements <ArrowRight size={14} aria-hidden="true" /></a>
    </article>
  </main>;
}
