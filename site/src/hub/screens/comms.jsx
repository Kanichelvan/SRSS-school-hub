// SRSS Connect: announcements with audience targeting (DASH-002), calendar, notifications, profile.
import { useState } from "react";
import { Link } from "react-router-dom";
import { doc, orderBy, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../../lib/firebase-firestore";
import { useAuth } from "../../auth/AuthProvider";
import { ROLES, can } from "../../auth/permissions";
import { announcementsFor, eventsFor, getMany, list, today, useLoad } from "../data";
import { ANNOUNCEMENT_CATEGORIES, EVENT_CATEGORIES, describeAudience } from "../audience";
import { EmptyState, ErrorNote, Loading, PageHeader, Section, StatusBadge, formatDate } from "../ui";

export function Announcements() {
  const auth = useAuth();
  const keys = auth.scope?.audienceKeys || ["school"];
  const schoolWide = can(auth.roles, "announcements", "A") === "all";
  const teacher = (auth.scope?.publishKeys || []).length > 0;
  const student = auth.currentHub === "student";
  const { data, loading, error } = useLoad(async () => { const [items, classes] = await Promise.all([announcementsFor(keys, 40), getMany("classes", keys.filter((key) => key.startsWith("class:")).map((key) => key.slice(6)))]); return { items, classes }; }, [keys.join("|")]);
  return <div className={student ? "hub-student" : ""}>
    <PageHeader kicker="SRSS Connect" title={student ? "Notices" : "Announcements"} actions={<>{schoolWide && <Link className="hub-button" to="/hub/admin/communications">Manage announcements</Link>}{teacher && <Link className={`hub-button ${schoolWide ? "hub-button-quiet" : ""}`} to="/hub/teacher/announcements">Post a class notice</Link>}</>}>{student ? "News from your school and your class." : "School notices meant for you, newest first. Pinned notices stay at the top."}</PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : !data.items.length ? <EmptyState title="No announcements right now." /> : <ul className="hub-list hub-list-feed">{data.items.map((item) => <li key={item.id} className={`${item.pinned ? "hub-pinned" : ""} ${item.category === "urgent" ? "hub-urgent" : ""}`}>
      <div className="hub-card-top"><strong>{item.title}</strong><small>{formatDate(item.publishedAt)}</small></div>
      <p>{item.body}</p>
      {item.attachments?.length > 0 && <ul className="hub-attachments">{item.attachments.map((link) => <li key={link.url}><a href={link.url} target="_blank" rel="noreferrer">{link.label}</a></li>)}</ul>}
      <div className="hub-badges">{item.pinned && <StatusBadge status="pending" label="Pinned" />}{item.category && <StatusBadge status={item.category === "urgent" ? "overdue" : "neutral"} label={ANNOUNCEMENT_CATEGORIES.find(([id]) => id === item.category)?.[1] || item.category} />}{!student && <StatusBadge status="info" label={describeAudience(item.audienceKeys, { classes: data.classes })} />}</div>
    </li>)}</ul>}
  </div>;
}

export function Calendar() {
  const auth = useAuth();
  const keys = auth.scope?.audienceKeys || ["school"];
  const [category, setCategory] = useState("");
  const student = auth.currentHub === "student";
  const { data, loading, error } = useLoad(() => eventsFor(keys, today()), [keys.join("|")]);
  const events = (data || []).filter((event) => !category || event.category === category);
  const byMonth = {};
  for (const event of events) (byMonth[event.date.slice(0, 7)] ||= []).push(event);
  const manage = can(auth.roles, "calendar", "U") === "all" ? "/hub/admin/calendar" : (auth.scope?.publishKeys || []).length ? "/hub/teacher/events" : null;
  return <div className={student ? "hub-student" : ""}>
    <PageHeader kicker="SRSS Connect" title="Calendar" actions={manage && <Link className="hub-button" to={manage}>{manage.includes("admin") ? "Manage the calendar" : "Add a class event"}</Link>}>{student ? "What's coming up at school." : "One school calendar, showing the events meant for you."}</PageHeader>
    <div className="hub-chips" role="group" aria-label="Filter by type"><button type="button" className={!category ? "active" : ""} onClick={() => setCategory("")}>All</button>{EVENT_CATEGORIES.map(([id, label]) => <button key={id} type="button" className={category === id ? "active" : ""} onClick={() => setCategory(id)}>{label}</button>)}</div>
    <ErrorNote error={error} />
    {loading ? <Loading /> : !events.length ? <EmptyState title="No upcoming events." /> : Object.entries(byMonth).map(([month, list]) => <Section key={month} title={formatDate(`${month}-01`, { month: "long", year: "numeric" })}><ul className="hub-list hub-list-dates">{list.map((event) => <li key={event.id}><time>{formatDate(event.date, { weekday: "short", day: "numeric" })}{event.endDate && event.endDate !== event.date ? <small>to {formatDate(event.endDate, { day: "numeric", month: "short" })}</small> : null}</time><span><strong>{event.title}</strong><small>{[event.allDay ? "All day" : [event.startTime || event.time, event.endTime].filter(Boolean).join("–"), event.location, EVENT_CATEGORIES.find(([id]) => id === event.category)?.[1]].filter(Boolean).join(" · ")}</small>{event.description && <small className="hub-event-detail">{event.description}</small>}{event.attachments?.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label}</a>)}</span>{event.consentRequired && <StatusBadge status="pending" label="Consent needed" />}</li>)}</ul></Section>)}
  </div>;
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
