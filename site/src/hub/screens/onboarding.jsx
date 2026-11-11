import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, serverTimestamp, setDoc, where } from "firebase/firestore";
import { db } from "../../lib/firebase-firestore";
import { useAuth } from "../../auth/AuthProvider";
import { list, one, useLoad } from "../data";
import {
  PACK_VERSION,
  PACKS,
  packRoles,
  COMMUNICATION_NEEDS,
} from "../logic/community";
import {
  EmptyState,
  ErrorNote,
  Loading,
  PageHeader,
  Section,
  StatusBadge,
  formatDate,
} from "../ui";
import { saveErrorMessage } from "../manage";
import "../community.css";

export function Onboarding() {
  const auth = useAuth();
  const roles = packRoles(auth.roles);
  const [role, setRole] = useState(roles[0]);
  return (
    <>
      <PageHeader kicker="My SRSS" title="A warm welcome, a clear start">
        Your practical guide to settling in. Progress is saved to your account;
        completing this checklist does not submit consent or replace a staff
        briefing.
      </PageHeader>
      <div className="hub-chips" aria-label="Choose your welcome pack">
        {roles.map((r) => (
          <button
            key={r}
            className={r === role ? "active" : ""}
            onClick={() => setRole(r)}
          >
            {r[0].toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>
      {role && <Pack key={role} role={role} />}
    </>
  );
}
function Pack({ role }) {
  const auth = useAuth(),
    pack = PACKS[role];
  const { data, loading, error, reload } = useLoad(
    () => one(`onboardingProgress/${auth.user.uid}_${role}`),
    [auth.user.uid, role],
  );
  const [done, setDone] = useState([]),
    [checkIn, setCheckIn] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [saveError, setSaveError] = useState("");
  useEffect(() => {
    setDone(data?.completed || []);
    setCheckIn(data?.checkInDate || "");
  }, [data]);
  async function save() {
    setBusy(true);
    setSaveError("");
    setNotice("");
    try {
      await setDoc(doc(db, "onboardingProgress", `${auth.user.uid}_${role}`), {
        ownerUid: auth.user.uid,
        role,
        version: PACK_VERSION,
        completed: done,
        checkInDate: checkIn,
        updatedAt: serverTimestamp(),
      });
      setNotice("Your welcome checklist is saved.");
      reload();
    } catch (e) {
      setSaveError(saveErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <Loading />;
  return (
    <>
      <ErrorNote error={error} />
      {!error && (
        <>
          <Section
            title={pack.title}
            action={
              <button
                className="hub-button hub-button-quiet"
                onClick={() => window.print()}
              >
                Print quick-start guide
              </button>
            }
          >
            <p>
              Welcome to Sekolah Rendah Sathya Sai. Our office and your class
              teacher or supervisor will help you settle in. Start with the
              steps below, and bring any questions to your{" "}
              {pack.checkIn.toLowerCase()} conversation.
            </p>
            <p className="hub-hint">
              {done.length} of {pack.steps.length} steps complete
            </p>
            <progress
              aria-label="Welcome checklist progress"
              max={pack.steps.length}
              value={done.length}
            />
            <ol className="hub-welcome-steps">
              {pack.steps.map(([id, title, body, link]) => (
                <li key={id}>
                  <label className="hub-check">
                    <input
                      type="checkbox"
                      disabled={busy}
                      checked={done.includes(id)}
                      onChange={(e) =>
                        setDone(
                          e.target.checked
                            ? [...done, id]
                            : done.filter((v) => v !== id),
                        )
                      }
                    />
                    <strong>{title}</strong>
                  </label>
                  <p>{body}</p>
                  {link && <Link to={link}>Open {title.toLowerCase()}</Link>}
                </li>
              ))}
            </ol>
            <label className="hub-field">
              Agreed {pack.checkIn.toLowerCase()} check-in date
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </label>
            <p className="hub-hint">
              Arrange the conversation with your teacher, mentor or supervisor.
              Saving a date here does not book an appointment or send a message.
            </p>
            <div className="hub-form-actions">
              <button className="hub-button" disabled={busy} onClick={save}>
                {busy ? "Saving…" : "Save my progress"}
              </button>
            </div>
            <p role="status">{notice}</p>
            {saveError && (
              <p role="alert" className="hub-error">
                {saveError}
              </p>
            )}
          </Section>
          <section className="hub-print-guide">
            <h2>SRSS quick-start and contact map</h2>
            <div className="hub-guide-grid">
              <article>
                <h3>Login and access</h3>
                <p>
                  Use your own school-linked account at /login. The office
                  assigns your role, children and classes. Never share
                  passwords. Sign out on shared devices.
                </p>
                <Link to="/hub/profile">Check your access</Link>
              </article>
              <article>
                <h3>Who to ask</h3>
                <p>
                  Classwork and settling in: class teacher. Accounts, records
                  and orientation: school office. Staff induction: supervisor or
                  mentor.
                </p>
                <a href="/contact">School office contacts</a>
              </article>
              <article>
                <h3>School routines</h3>
                <p>
                  Silent Sitting starts at 7.30 am. Lessons begin at 7.40 am.
                  Finishing times vary by Standard and day; check the academic
                  overview and school calendar.
                </p>
                <a href="/learning">School-day guide</a>
              </article>
              <article>
                <h3>Privacy and safeguarding</h3>
                <p>
                  Safeguarding: Mr Ravi Balan, designated safeguarding lead.
                  Privacy: Ms Vasanthi, data protection officer. Use the formal
                  school reporting routes for concerns.
                </p>
                <a href="/legal/child-safeguarding">
                  Safeguarding contacts and reporting
                </a>{" "}
                · <a href="/legal/data-protection">Data responsibilities</a>
              </article>
            </div>
            <p>
              Family consent is recorded separately for each child. Staff must
              complete their confidentiality acknowledgement in the hub.
              Checklist ticks do not replace either record.
            </p>
            {role === "parent" && (
              <Link to="/hub/parent/consent">Open the family consent pack</Link>
            )}
          </section>
        </>
      )}
    </>
  );
}
export function OnboardingOffice() {
  const { data, loading, error } = useLoad(
    async () => ({
      progress: await list("onboardingProgress"),
      users: await list("users"),
      preferences: await list("familyPreferences"),
    }),
    [],
  );
  return (
    <>
      <PageHeader kicker="People" title="Welcome check-ins">
        Arrange a personal follow-up for new families and colleagues. Dates
        below are recorded preferences, not calendar bookings.
      </PageHeader>
      <ErrorNote error={error} />
      {loading ? (
        <Loading />
      ) : !data?.progress.length ? (
        <EmptyState title="No welcome checklists saved yet." />
      ) : (
        <ul className="hub-list">
          {data.progress.map((p) => (
            <li key={p.id}>
              <strong>
                {data.users.find((u) => u.id === p.ownerUid)?.displayName ||
                  data.users.find((u) => u.id === p.ownerUid)?.email ||
                  "Registered user"}
              </strong>
              <p>
                {PACKS[p.role]?.title} · {p.completed.length}/
                {PACKS[p.role]?.steps.length} steps
              </p>
              <StatusBadge
                status={
                  p.completed.length === PACKS[p.role]?.steps.length
                    ? "complete"
                    : "pending"
                }
              />
              <p>
                Check-in:{" "}
                {p.checkInDate
                  ? formatDate(p.checkInDate, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "To be arranged"}
              </p>
            </li>
          ))}
        </ul>
      )}
      {data?.preferences.length > 0 && (
        <Section title="Family communication needs and parent voices">
          <ul className="hub-list">
            {data.preferences.map((p) => (
              <li key={p.id}>
                <strong>
                  {data.users.find((u) => u.id === p.ownerUid)?.displayName ||
                    data.users.find((u) => u.id === p.ownerUid)?.email ||
                    "Family account"}
                </strong>
                <p>
                  {p.needs
                    .map(
                      (n) =>
                        COMMUNICATION_NEEDS.find((x) => x[0] === n)?.[1] || n,
                    )
                    .join(" · ")}{" "}
                  · {p.contact} · {p.language}
                </p>
                {p.voice && <blockquote>{p.voice}</blockquote>}
                <p>
                  {p.allowContact
                    ? "May contact about story"
                    : "No permission to contact about story"}
                  . No public publication permission.
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
export function FamilyPreferences() {
  const auth = useAuth();
  const { data, loading, error } = useLoad(
    () => one(`familyPreferences/${auth.user.uid}`),
    [auth.user.uid],
  );
  const [needs, setNeeds] = useState([]),
    [language, setLanguage] = useState(""),
    [contact, setContact] = useState("hub"),
    [voice, setVoice] = useState(""),
    [allow, setAllow] = useState(false),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [failure, setFailure] = useState("");
  useEffect(() => {
    setNeeds(data?.needs || []);
    setLanguage(data?.language || "");
    setContact(data?.contact || "hub");
    setVoice(data?.voice || "");
    setAllow(data?.allowContact || false);
  }, [data]);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setNotice("");
    setFailure("");
    try {
      await setDoc(doc(db, "familyPreferences", auth.user.uid), {
        ownerUid: auth.user.uid,
        needs,
        language,
        contact,
        voice,
        allowContact: allow,
        updatedAt: serverTimestamp(),
      });
      setNotice("Your family preferences are saved.");
    } catch (e) {
      setFailure(saveErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Section title="Family communication preferences">
      <ErrorNote error={error} />
      {loading ? (
        <Loading />
      ) : (
        !error && (
          <form className="hub-form" onSubmit={save}>
            <fieldset>
              <legend>Updates that help your family</legend>
              {COMMUNICATION_NEEDS.map(([id, label]) => (
                <label key={id} className="hub-check">
                  <input
                    type="checkbox"
                    checked={needs.includes(id)}
                    onChange={(e) =>
                      setNeeds(
                        e.target.checked
                          ? [...needs, id]
                          : needs.filter((n) => n !== id),
                      )
                    }
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            <label className="hub-field">
              Preferred language / accessibility needs
              <input
                maxLength={200}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </label>
            <label className="hub-field">
              Preferred contact channel
              <select
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              >
                <option value="hub">Hub messages</option>
                <option value="email">School email</option>
                <option value="phone">Telephone</option>
              </select>
            </label>
            <p className="hub-hint">
              The office can read these preferences. They do not turn off
              important notices or enable automatic email, calls or reminders.
            </p>
            <label className="hub-field">
              Optional parent voice or story of growth
              <textarea
                maxLength={2000}
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
              />
            </label>
            <label className="hub-check">
              <input
                type="checkbox"
                checked={allow}
                onChange={(e) => setAllow(e.target.checked)}
              />
              The school may contact me about this story.
            </label>
            <p className="hub-hint">
              This stays private to the school office. Public use needs a
              separate, explicit agreement.
            </p>
            <Link to="/hub/parent/consent">
              Review media and showcase consent for each child
            </Link>
            <button className="hub-button" disabled={busy}>
              {busy ? "Saving…" : "Save preferences"}
            </button>
            <p role="status">{notice}</p>
            {failure && (
              <p role="alert" className="hub-error">
                {failure}
              </p>
            )}
          </form>
        )
      )}
    </Section>
  );
}
