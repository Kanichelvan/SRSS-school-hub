// Family-facing screens: My Children, My SRSS Journey (POR-002).
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { where } from "firebase/firestore";
import { useAuth } from "../../auth/AuthProvider";
import { getMany, list, useLoad } from "../data";
import { HUMAN_VALUES } from "../logic/dashboard";
import { ChildSwitcher, EmptyState, ErrorNote, Loading, PageHeader, StatusBadge, formatDate } from "../ui";

export function MyChildren() {
  const auth = useAuth();
  const { data, loading, error } = useLoad(() => getMany("students", auth.scope?.childIds || []), [(auth.scope?.childIds || []).join("|")]);
  return <>
    <PageHeader kicker="My family" title="My children">Each child's profile, attendance, portfolio and forms.</PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : !data.length ? <EmptyState title="No children linked to this account.">The school office links guardians to their children.</EmptyState> : <ul className="hub-cards">{data.map((child) => <li key={child.id} className="hub-card hub-child-card"><div className="hub-avatar" aria-hidden="true">{(child.preferredName || child.name).slice(0, 1)}</div><div><strong>{child.name}</strong><span>Standard {child.currentStandard ?? "—"}</span></div><Link className="hub-button hub-button-quiet" to={`/hub/students/${child.id}`}>Open profile</Link></li>)}</ul>}
  </>;
}

// Longitudinal Standard 1 → 6 timeline grouped by growth area, mobile-first vertical layout.
const AREAS = { academic: "Academic growth", character: "Character growth", personal: "Personal growth", contribution: "Contribution", experiences: "Experiences" };
export function Journey() {
  const auth = useAuth();
  const isStudent = auth.currentHub === "student";
  const childIds = isStudent ? [auth.scope?.studentId].filter(Boolean) : auth.scope?.childIds || [];
  const [selected, setSelected] = useState(null);
  const [area, setArea] = useState("");
  const { data: children } = useLoad(() => getMany("students", childIds), [childIds.join("|")]);
  useEffect(() => { if (children?.length && !selected) setSelected(children[0].id); }, [children, selected]);
  const { data, loading, error } = useLoad(async () => {
    if (!selected) return { entries: [], enrollments: [] };
    const [entries, enrollments] = await Promise.all([
      list("portfolioEntries", where("studentId", "==", selected), where("visibility", "in", ["family", "showcaseCandidate", "publicShowcase"])),
      list("enrollments", where("studentId", "==", selected)),
    ]);
    return { entries, enrollments };
  }, [selected]);
  const child = children?.find((item) => item.id === selected);
  const byYear = {};
  for (const entry of (data?.entries || []).filter((item) => !area || item.category === area)) (byYear[entry.academicYearId || "other"] ||= []).push(entry);
  const years = Object.keys(byYear).sort().reverse();
  const standardFor = (yearId) => data?.enrollments.find((item) => item.academicYearId === yearId)?.standard;

  return <>
    <PageHeader kicker="Portfolio" title={isStudent ? "My SRSS Journey" : `${child?.preferredName || "Your child"}'s SRSS Journey`}>What they did, what they learned, and how they grew — Standard 1 to 6.</PageHeader>
    {children && <ChildSwitcher children={children} selectedId={selected} onSelect={setSelected} />}
    <div className="hub-chips" role="group" aria-label="Filter by growth area"><button type="button" className={!area ? "active" : ""} onClick={() => setArea("")}>All</button>{Object.entries(AREAS).map(([key, label]) => <button key={key} type="button" className={area === key ? "active" : ""} onClick={() => setArea(key)}>{label}</button>)}</div>
    <ErrorNote error={error} />
    {loading ? <Loading /> : !years.length ? <EmptyState title="No shared portfolio entries yet.">Teachers share work here as the year goes on.</EmptyState> : <ol className="hub-timeline">{years.map((year) => <li key={year}>
      <h2>{year.replace("ay", "")}{standardFor(year) ? ` · Standard ${standardFor(year)}` : ""}</h2>
      <ul>{byYear[year].sort((a, b) => String(b.date).localeCompare(String(a.date))).map((entry) => <li key={entry.id} className={`hub-timeline-item hub-area-${entry.category || "academic"}`}>
        <time>{formatDate(entry.date, { day: "numeric", month: "short" })}</time>
        <div><span className="hub-kicker">{AREAS[entry.category] || "Learning"}</span><h3>{entry.title}</h3><p>{entry.description}</p>
          {entry.teacherObservation && <p className="hub-quote"><strong>Teacher:</strong> {entry.teacherObservation}</p>}
          {entry.studentReflection && <p className="hub-quote"><strong>{isStudent ? "I said" : "In their words"}:</strong> {entry.studentReflection}</p>}
          <div className="hub-badges">{entry.humanValue && <StatusBadge status="good" label={HUMAN_VALUES[entry.humanValue]} />}{entry.visibility === "publicShowcase" && <StatusBadge status="published" label="Public showcase" />}</div>
          {entry.evidenceUrl && <a href={entry.evidenceUrl} target="_blank" rel="noreferrer">Open evidence in Google Drive →</a>}</div>
      </li>)}</ul>
    </li>)}</ol>}
  </>;
}
