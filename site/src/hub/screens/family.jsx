// Family-facing screens: My Children, My SRSS Journey (POR-002).
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { where } from "firebase/firestore";
import { useAuth } from "../../auth/AuthProvider";
import { JourneySummary } from "./quest";
import { getMany, list, useLoad } from "../data";
import { HUMAN_VALUES } from "../logic/dashboard";
import { ChildSwitcher, EmptyState, ErrorNote, Loading, PageHeader, Section, StatusBadge, formatDate } from "../ui";
import { EvidenceFiles } from "../PortfolioEvidence";
import { FAMILY_VISIBLE, PORTFOLIO_CATEGORIES, categoryOf, humanValuesOf, visibleToFamily } from "../portfolio";

export function MyChildren() {
  const auth = useAuth();
  const { data, loading, error } = useLoad(() => getMany("students", auth.scope?.childIds || []), [(auth.scope?.childIds || []).join("|")]);
  return <>
    <PageHeader kicker="My family" title="My children">Each child's profile, attendance, portfolio and forms.</PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : !data.length ? <EmptyState title="No children linked to this account.">The school office links guardians to their children.</EmptyState> : <ul className="hub-cards">{data.map((child) => <li key={child.id} className="hub-card hub-child-card"><div className="hub-avatar" aria-hidden="true">{(child.preferredName || child.name).slice(0, 1)}</div><div><strong>{child.name}</strong><span>Standard {child.currentStandard ?? "—"}</span></div><Link className="hub-button hub-button-quiet" to={`/hub/students/${child.id}`}>Open profile</Link></li>)}</ul>}
  </>;
}

// Longitudinal Standard 1 → 6 timeline, filterable by portfolio category, mobile-first vertical layout.
const AREAS = Object.fromEntries(PORTFOLIO_CATEGORIES);
export function Journey() {
  const auth = useAuth();
  const isStudent = auth.currentHub === "student";
  const childIds = isStudent ? [auth.scope?.studentId].filter(Boolean) : auth.scope?.childIds || [];
  const [selected, setSelected] = useState(null);
  const [area, setArea] = useState("");
  const [view,setView] = useState("timeline");
  const { data: subjects } = useLoad(() => list("subjects"), []);
  const { data: children } = useLoad(() => getMany("students", childIds), [childIds.join("|")]);
  useEffect(() => { if (children?.length && !selected) setSelected(children[0].id); }, [children, selected]);
  const { data, loading, error } = useLoad(async () => {
    if (!selected) return { entries: [], enrollments: [] };
    const [entries, enrollments] = await Promise.all([
      list("portfolioEntries", where("studentId", "==", selected), where("visibility", "in", FAMILY_VISIBLE)),
      list("enrollments", where("studentId", "==", selected)),
    ]);
    return { entries: entries.filter(visibleToFamily), enrollments };
  }, [selected]);
  const child = children?.find((item) => item.id === selected);
  const byYear = {};
  for (const entry of (data?.entries || []).filter(item => (!area || categoryOf(item) === area) && (view !== "achievements" || categoryOf(item) === "achievements" || item.achievementTags?.length))) {
    const keys = view === "subject" ? [subjects?.find(s=>s.id===entry.subjectId)?.name || "Across subjects"] : view === "values" ? (humanValuesOf(entry).length ? humanValuesOf(entry).map(v=>HUMAN_VALUES[v]) : ["Across values"]) : [entry.academicYearId || "other"];
    for(const key of keys) (byYear[key] ||= []).push(entry);
  }
  const years = Object.keys(byYear).sort().reverse();
  const standardFor = (yearId) => data?.enrollments.find((item) => item.academicYearId === yearId)?.standard;

  return <>
    <PageHeader kicker="Portfolio" title={isStudent ? "My SRSS Journey" : `${child?.preferredName || "Your child"}'s SRSS Journey`}>What they did, what they learned, and how they grew — Standard 1 to 6.</PageHeader>
    {children && <ChildSwitcher children={children} selectedId={selected} onSelect={setSelected} />}
    {selected && <Section title="Quest memories & achievements"><JourneySummary studentId={selected} compact /></Section>}
    <div className="hub-chips" role="group" aria-label="Portfolio view">{[["timeline","Timeline"],["subject","By subject"],["values","By human value"],["achievements","Achievement highlights"]].map(([id,label])=><button key={id} className={view===id?"active":""} aria-pressed={view===id} onClick={()=>setView(id)}>{label}</button>)}</div>
    <div className="hub-chips" role="group" aria-label="Filter by growth area"><button type="button" className={!area ? "active" : ""} onClick={() => setArea("")}>All</button>{Object.entries(AREAS).map(([key, label]) => <button key={key} type="button" className={area === key ? "active" : ""} onClick={() => setArea(key)}>{label}</button>)}</div>
    <ErrorNote error={error} />
    {loading ? <Loading /> : !years.length ? <EmptyState title="No shared portfolio entries yet.">Teachers share work here as the year goes on.</EmptyState> : <ol className="hub-timeline">{years.map((year) => <li key={year}>
      <h2>{year.replace(/^ay/, "")}{view === "timeline" && standardFor(year) ? ` · Standard ${standardFor(year)}` : ""}</h2>
      <ul>{byYear[year].sort((a, b) => String(b.date).localeCompare(String(a.date))).map((entry) => <li key={entry.id} className={`hub-timeline-item hub-area-${categoryOf(entry)}`}>
        <time>{formatDate(entry.date, { day: "numeric", month: "short" })}</time>
        <div><span className="hub-kicker">{AREAS[categoryOf(entry)] || "Learning"}</span><h3>{entry.title}</h3><p>{entry.description}</p>
          {entry.teacherObservation && <p className="hub-quote"><strong>Teacher:</strong> {entry.teacherObservation}</p>}
          {entry.studentReflection && <p className="hub-quote"><strong>{isStudent ? "I said" : "In their words"}:</strong> {entry.studentReflection}</p>}
          {entry.learningObjective && <p className="hub-hint"><strong>Learning objective:</strong> {entry.learningObjective}</p>}
          <div className="hub-badges">{humanValuesOf(entry).map((value) => <StatusBadge key={value} status="good" label={HUMAN_VALUES[value]} />)}{entry.visibility === "publicShowcase" && <StatusBadge status="published" label="Public showcase" />}</div>
          <EvidenceFiles files={entry.mediaFiles} />
          {(entry.mediaReferences || (entry.evidenceUrl ? [{ label: "Evidence", url: entry.evidenceUrl }] : [])).map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">Open “{link.label}” in Google Drive →</a>)}</div>
      </li>)}</ul>
    </li>)}</ol>}
  </>;
}
