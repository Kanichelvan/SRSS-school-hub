// SRSS Connect: announcements with audience targeting (DASH-002), calendar, notifications, profile.
import { useState } from "react";
import { addDoc, collection, doc, orderBy, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../../lib/firebase-firestore";
import { useAuth } from "../../auth/AuthProvider";
import { ROLES, can } from "../../auth/permissions";
import { announcementsFor, eventsFor, getMany, list, today, useLoad } from "../data";
import { EmptyState, ErrorNote, Loading, PageHeader, Section, StatusBadge, formatDate } from "../ui";

const AUDIENCES = [["school", "Whole school"], ["role:staff", "Staff"], ["role:teachers", "Teachers"], ["role:parents", "Parents"], ["role:students", "Students"], ...[1, 2, 3, 4, 5, 6].map((s) => [`standard:${s}`, `Standard ${s}`])];

export function Announcements() {
  const auth = useAuth();
  const keys = auth.scope?.audienceKeys || ["school"];
  const canPublish = Boolean(can(auth.roles, "announcements", "A"));
  const schoolWide = can(auth.roles, "announcements", "A") === "all";
  const { data, loading, error, reload } = useLoad(() => announcementsFor(keys, 30), [keys.join("|")]);
  return <>
    <PageHeader kicker="SRSS Connect" title="Announcements">Institutional notices, filtered to the audiences you belong to.</PageHeader>
    {canPublish && <Composer schoolWide={schoolWide} onPublished={reload} />}
    <ErrorNote error={error} />
    {loading ? <Loading /> : !data.length ? <EmptyState title="No announcements yet." /> : <ul className="hub-list hub-list-feed">{data.sort((a, b) => (b.publishedAt?.seconds || 0) - (a.publishedAt?.seconds || 0)).map((item) => <li key={item.id}><div className="hub-card-top"><strong>{item.title}</strong><small>{formatDate(item.publishedAt)}</small></div><p>{item.body}</p><div className="hub-badges">{item.audienceKeys.map((key) => <StatusBadge key={key} status="info" label={AUDIENCES.find(([value]) => value === key)?.[1] || key.replace("class:", "Class ")} />)}</div></li>)}</ul>}
  </>;
}

// What? → Who? → When? (send now) — the PRD composer flow. Teachers may target only their own classes.
function Composer({ schoolWide, onPublished }) {
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ title: "", body: "", audience: schoolWide ? "school" : auth.scope?.publishKeys?.[0] || "" });
  const [status, setStatus] = useState(null);
  const { data: classes } = useLoad(() => getMany("classes", (auth.scope?.publishKeys || []).map((key) => key.replace("class:", ""))), [(auth.scope?.publishKeys || []).join("|")]);
  const options = [...(schoolWide ? AUDIENCES : []), ...(auth.scope?.publishKeys || []).map((key) => [key, `Class ${classes?.find((cls) => `class:${cls.id}` === key)?.name || key.replace("class:", "")}`])];
  async function publish(event) {
    event.preventDefault(); setStatus("saving");
    try {
      const stamp = serverTimestamp();
      await addDoc(collection(db, "announcements"), { title: state.title.trim(), body: state.body.trim(), audienceKeys: [state.audience], category: state.audience.startsWith("class:") ? "class" : "school", status: "published", publishedAt: stamp, createdAt: stamp, createdBy: auth.user.uid, updatedAt: stamp, updatedBy: auth.user.uid });
      setState({ ...state, title: "", body: "" }); setStatus("done"); setOpen(false); onPublished();
    } catch (error) { setStatus(error); }
  }
  if (!open) return <button type="button" className="hub-button" onClick={() => setOpen(true)}>New announcement</button>;
  return <form className="hub-form" onSubmit={publish}>
    <label>What?<input required maxLength={140} value={state.title} onChange={(event) => setState({ ...state, title: event.target.value })} placeholder="Headline" /></label>
    <label>Details<textarea required rows={4} value={state.body} onChange={(event) => setState({ ...state, body: event.target.value })} /></label>
    <label>Who?<select required value={state.audience} onChange={(event) => setState({ ...state, audience: event.target.value })}>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    {status instanceof Error && <ErrorNote error={status} />}
    <div className="hub-form-actions"><button type="submit" className="hub-button" disabled={status === "saving"}>Publish now</button><button type="button" className="hub-button hub-button-quiet" onClick={() => setOpen(false)}>Cancel</button></div>
  </form>;
}

export function Calendar() {
  const auth = useAuth();
  const keys = auth.scope?.audienceKeys || ["school"];
  const { data, loading, error } = useLoad(() => eventsFor(keys, today()), [keys.join("|")]);
  const byMonth = {};
  for (const event of data || []) (byMonth[event.date.slice(0, 7)] ||= []).push(event);
  return <>
    <PageHeader kicker="SRSS Connect" title="Calendar">One master school calendar, filtered to your role.</PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : !data.length ? <EmptyState title="No upcoming events." /> : Object.entries(byMonth).map(([month, events]) => <Section key={month} title={formatDate(`${month}-01`, { month: "long", year: "numeric" })}><ul className="hub-list hub-list-dates">{events.map((event) => <li key={event.id}><time>{formatDate(event.date, { weekday: "short", day: "numeric" })}</time><span><strong>{event.title}</strong><small>{[event.startTime || event.time, event.location].filter(Boolean).join(" · ")}</small></span>{event.consentRequired && <StatusBadge status="pending" label="Consent needed" />}</li>)}</ul></Section>)}
  </>;
}

export function Notifications() {
  const auth = useAuth();
  const { data, loading, error, reload } = useLoad(() => list("notificationRecords", where("recipientUid", "==", auth.user.uid), orderBy("createdAt", "desc")), [auth.user.uid]);
  const markRead = async (id) => { await updateDoc(doc(db, "notificationRecords", id), { readAt: serverTimestamp() }); reload(); };
  return <>
    <PageHeader kicker="SRSS Connect" title="Notifications">System alerts about attendance, forms and actions.</PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : !data.length ? <EmptyState title="No notifications." /> : <ul className="hub-list">{data.map((item) => <li key={item.id} className={item.readAt ? "" : "hub-unread"}><div className="hub-card-top"><strong>{item.title}</strong>{item.critical && <StatusBadge status="pending" label="Important" />}</div><p>{item.body}</p><div className="hub-form-actions">{item.link && <a href={item.link}>Open</a>}{!item.readAt && <button type="button" className="hub-button hub-button-quiet hub-button-small" onClick={() => markRead(item.id)}>Mark as read</button>}</div></li>)}</ul>}
  </>;
}

export function Profile() {
  const auth = useAuth();
  const scope = auth.scope || {};
  return <>
    <PageHeader kicker="Account" title="Profile">{auth.user.email}</PageHeader>
    <Section title="Your roles"><div className="hub-badges">{auth.roles.map((role) => <StatusBadge key={role} status="info" label={ROLES[role]?.label || role} />)}</div><p className="hub-lede">Roles are assigned by the school office and reviewed each term.</p></Section>
    <Section title="What you can see"><dl className="hub-facts">
      {scope.childIds?.length > 0 && <div><dt>Linked children</dt><dd>{scope.childIds.length}</dd></div>}
      {scope.classIds?.length > 0 && <div><dt>Classes</dt><dd>{scope.classIds.length}</dd></div>}
      {scope.assignedStudentIds?.length > 0 && <div><dt>Assigned pupils</dt><dd>{scope.assignedStudentIds.length}</dd></div>}
      <div><dt>Notices for</dt><dd>{(scope.audienceKeys || []).filter((key) => !key.startsWith("user:")).join(", ")}</dd></div>
    </dl></Section>
  </>;
}
