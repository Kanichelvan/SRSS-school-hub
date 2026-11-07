// Calendar and profile. Announcements, notifications and preferences are SRSS Connect (screens/connect.jsx).
import { FamilyPreferences } from "./onboarding";
import { useState } from "react";
import { Link } from "react-router-dom";
import { doc, orderBy, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../../lib/firebase-firestore";
import { useAuth } from "../../auth/AuthProvider";
import { ROLES, can } from "../../auth/permissions";
import { announcementsFor, eventsFor, getMany, list, today, useLoad } from "../data";
import { icsCalendar, downloadText } from "../logic/community";
import "../community.css";
import { ANNOUNCEMENT_CATEGORIES, EVENT_CATEGORIES, describeAudience } from "../audience";
import { EmptyState, ErrorNote, Loading, PageHeader, Section, StatusBadge, formatDate } from "../ui";

export function Calendar() {
  const auth = useAuth();
  const keys = auth.scope?.audienceKeys || ["school"];
  const [category, setCategory] = useState("");
  const [month,setMonth]=useState(today().slice(0,7));
  const [audience,setAudience]=useState("");
  const student = auth.currentHub === "student";
  const { data, loading, error } = useLoad(() => eventsFor(keys, `${month}-01`), [keys.join("|"),month]);
  const events = (data || []).filter(event => (!category || event.category === category) && (!audience || event.audienceKeys?.includes(audience)) && event.date.slice(0,7) <= month && (event.endDate||event.date).slice(0,7) >= month);
  const first=new Date(`${month}-01T12:00:00`);
  const days=new Date(first.getFullYear(),first.getMonth()+1,0).getDate();
  const offset=(first.getDay()+6)%7;
  const byMonth = {};
  for (const event of events) (byMonth[event.date.slice(0, 7)] ||= []).push(event);
  const manage = can(auth.roles, "calendar", "U") === "all" ? "/hub/admin/calendar" : (auth.scope?.publishKeys || []).length ? "/hub/teacher/events" : null;
  return <div className={student ? "hub-student" : ""}>
    <PageHeader kicker="SRSS Connect" title="Calendar" actions={manage && <Link className="hub-button" to={manage}>{manage.includes("admin") ? "Manage the calendar" : "Add a class event"}</Link>}>{student ? "What's coming up at school." : "One school calendar, showing the events meant for you."}</PageHeader>
    <div className="hub-form-row"><label className="hub-field">Month<input type="month" required value={month} onChange={e=>{if(e.target.value)setMonth(e.target.value);}}/></label><label className="hub-field">Audience<select value={audience} onChange={e=>setAudience(e.target.value)}><option value="">All my audiences</option>{keys.filter(k=>k==='school'||k.startsWith('class:')).map(k=><option key={k} value={k}>{k==='school'?'Whole school':`Class ${k.slice(6)}`}</option>)}</select></label><button className="hub-button hub-button-quiet" disabled={loading||!events.length} onClick={()=>downloadText('srss-calendar.ics',icsCalendar(events),'text/calendar;charset=utf-8')}>Download this calendar</button></div>
    <div className="hub-calendar-grid" aria-label="Monthly school calendar">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><div className="hub-weekday" key={d}>{d}</div>)}{Array.from({length:Math.ceil((offset+days)/7)*7},(_,i)=>{const day=i-offset+1;const date=`${month}-${String(day).padStart(2,'0')}`;return <div key={i} className={day<1||day>days?'hub-calendar-empty':''}>{day>0&&day<=days&&<><small>{day}</small>{events.filter(e=>e.date<=date&&(e.endDate||e.date)>=date).map(e=><a key={e.id} href={`#event-${e.id}`}>{e.title}</a>)}</>}</div>;})}</div>
    <div className="hub-chips" role="group" aria-label="Filter by type"><button type="button" className={!category ? "active" : ""} onClick={() => setCategory("")}>All</button>{EVENT_CATEGORIES.map(([id, label]) => <button key={id} type="button" className={category === id ? "active" : ""} onClick={() => setCategory(id)}>{label}</button>)}</div>
    <ErrorNote error={error} />
    {loading ? <Loading /> : !events.length ? <EmptyState title="No upcoming events." /> : Object.entries(byMonth).map(([month, list]) => <Section key={month} title={formatDate(`${month}-01`, { month: "long", year: "numeric" })}><ul className="hub-list hub-list-dates">{list.map((event) => <li key={event.id} id={`event-${event.id}`}><time>{formatDate(event.date, { weekday: "short", day: "numeric" })}{event.endDate && event.endDate !== event.date ? <small>to {formatDate(event.endDate, { day: "numeric", month: "short" })}</small> : null}</time><span><strong>{event.title}</strong><small>{[event.allDay ? "All day" : [event.startTime || event.time, event.endTime].filter(Boolean).join("–"), event.location, EVENT_CATEGORIES.find(([id]) => id === event.category)?.[1]].filter(Boolean).join(" · ")}</small>{event.description && <small className="hub-event-detail">{event.description}</small>}{event.attachments?.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label}</a>)}</span>{event.schoolClosed && <StatusBadge status="neutral" label="School closed" />}{event.consentRequired && <StatusBadge status="pending" label="Consent needed" />}</li>)}</ul></Section>)}
  </div>;
}

export function Profile() {
  const auth = useAuth();
  const scope = auth.scope || {};
  return <>
    <PageHeader kicker="Account" title="Profile">{auth.user.email}</PageHeader>
    {auth.roles.includes("parent") && <FamilyPreferences />}
    <Section title="Your roles"><div className="hub-badges">{auth.roles.map((role) => <StatusBadge key={role} status="info" label={ROLES[role]?.label || role} />)}</div><p className="hub-lede">Roles are assigned by the school office and reviewed each term.</p></Section>
    <Section title="What you can see"><dl className="hub-facts">
      {scope.childIds?.length > 0 && <div><dt>Linked children</dt><dd>{scope.childIds.length}</dd></div>}
      {scope.classIds?.length > 0 && <div><dt>Classes</dt><dd>{scope.classIds.length}</dd></div>}
      {scope.assignedStudentIds?.length > 0 && <div><dt>Assigned pupils</dt><dd>{scope.assignedStudentIds.length}</dd></div>}
      <div><dt>Notices for</dt><dd>{(scope.audienceKeys || []).filter((key) => !key.startsWith("user:")).join(", ")}</dd></div>
    </dl></Section>
  </>;
}
