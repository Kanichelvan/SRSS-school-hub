import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../lib/firebase-firestore";
import { useAuth } from "../../auth/AuthProvider";
import { getMany, list, listIn, useLoad } from "../data";
import { RecordManager, saveErrorMessage } from "../manage";
import {
  EmptyState,
  ErrorNote,
  Loading,
  PageHeader,
  Section,
  StatCard,
  formatDate,
} from "../ui";
import "../community.css";
export function Planning() {
  const auth = useAuth();
  const [mode, setMode] = useState("lessonPlans");
  return (
    <>
      <div className="hub-screen-tabs">
        <button
          className="hub-button hub-button-quiet"
          aria-pressed={mode === "lessonPlans"}
          onClick={() => setMode("lessonPlans")}
        >
          Weekly lesson plans
        </button>
        <button
          className="hub-button hub-button-quiet"
          aria-pressed={mode === "curriculumPlans"}
          onClick={() => setMode("curriculumPlans")}
        >
          Curriculum targets
        </button>
        <Link to="/hub/teacher/classes">Back to my classes</Link>
      </div>
      <Plans key={mode} mode={mode} auth={auth} />
    </>
  );
}
function Plans({ mode, auth }) {
  const classIds = auth.scope?.classIds || [];
  const startClass = new URLSearchParams(window.location.search).get("class");
  return (
    <RecordManager
      kicker="Teaching"
      title={
        mode === "lessonPlans"
          ? "Weekly lesson plans"
          : "Curriculum and syllabus targets"
      }
      noun="plan"
      collection={mode}
      canEdit={classIds.length > 0}
      intro="Keep the plan close to the class work: syllabus targets, learning, support and evidence. Plans remain internal to school staff."
      load={() => list(mode, where("ownerUid", "==", auth.user.uid))}
      lookups={async () => ({
        classes: await getMany("classes", classIds),
        subjects: await list("subjects"),
      })}
      fields={[
        {
          key: "classId",
          label: "Class",
          required: true,
          type: "select",
          immutable: true,
          options: (l) => l.classes.map((c) => [c.id, c.name]),
        },
        {
          key: "subjectId",
          label: "Subject",
          required: true,
          type: "select",
          immutable: true,
          options: (l, d) =>
            l.subjects
              .filter(
                (s) =>
                  (auth.scope?.homeroomClassIds || []).includes(d.classId) ||
                  (auth.scope?.assignmentKeys || []).includes(
                    `${d.classId}:${s.id}`,
                  ),
              )
              .map((s) => [s.id, s.name]),
        },
        {
          key: "title",
          label: "Plan title",
          required: true,
          type: "text",
          maxLength: 140,
          wide: true,
        },
        {
          key: "weekOf",
          label: mode === "lessonPlans" ? "Week beginning" : "Period beginning",
          required: true,
          type: "date",
        },
        {
          key: "syllabus",
          label: "Syllabus targets / curriculum alignment",
          required: true,
          type: "textarea",
          maxLength: 4000,
          wide: true,
        },
        {
          key: "learning",
          label: "Learning activities and resources",
          required: true,
          type: "textarea",
          maxLength: 4000,
          wide: true,
        },
        {
          key: "support",
          label: "Differentiation and learning support",
          type: "textarea",
          maxLength: 4000,
          wide: true,
        },
        {
          key: "evidence",
          label: "Evidence of learning / reflection",
          type: "textarea",
          maxLength: 4000,
          wide: true,
        },
      ]}
      defaults={() => ({
        classId: classIds.includes(startClass) ? startClass : classIds[0],
      })}
      prepare={(v, { isNew }) => ({
        ...v,
        ...(isNew ? { ownerUid: auth.user.uid } : {}),
      })}
      columns={(l) => [
        { key: "title", label: "Plan" },
        {
          key: "classId",
          label: "Class",
          render: (r) => l.classes.find((c) => c.id === r.classId)?.name,
        },
        { key: "weekOf", label: "Week / period" },
        {
          key: "subjectId",
          label: "Subject",
          render: (r) => l.subjects.find((s) => s.id === r.subjectId)?.name,
        },
      ]}
      searchKeys={["title", "syllabus"]}
      initialSort={{ key: "weekOf", dir: -1 }}
    />
  );
}
export function Messages() {
  const auth = useAuth();
  const [selected, setSelected] = useState(null),
    [compose, setCompose] = useState(false);
  const { data, loading, error, reload } = useLoad(
    () =>
      list(
        "messageThreads",
        where("participantUids", "array-contains", auth.user.uid),
      ),
    [auth.user.uid],
  );
  return (
    <>
      <PageHeader
        kicker="SRSS Connect"
        title="Messages"
        actions={
          <button
            className="hub-button"
            onClick={() => {
              setCompose(true);
              setSelected(null);
            }}
          >
            New school conversation
          </button>
        }
      >
        Private school conversations. For urgent concerns, telephone the school;
        messages are not an emergency service.
      </PageHeader>
      <ErrorNote error={error} />
      {compose ? (
        <NewConversation
          onCreated={(id) => {
            setCompose(false);
            setSelected(id);
            reload();
          }}
          onCancel={() => setCompose(false)}
        />
      ) : null}
      {loading ? (
        <Loading />
      ) : !data?.length ? (
        <EmptyState title="No conversations yet." />
      ) : (
        <ul className="hub-list">
          {data.map((t) => (
            <li key={t.id}>
              <button
                className="hub-link-button"
                onClick={() => {
                  setCompose(false);
                  setSelected(t.id);
                }}
              >
                {t.subject}
              </button>
              <p>{t.lastMessagePreview || "Open conversation"}</p>
            </li>
          ))}
        </ul>
      )}
      {selected && (
        <Conversation key={selected} id={selected} onSent={reload} />
      )}
    </>
  );
}
function NewConversation({ onCreated, onCancel }) {
  const auth = useAuth();
  const [target, setTarget] = useState(""),
    [subject, setSubject] = useState(""),
    [busy, setBusy] = useState(false),
    [failure, setFailure] = useState("");
  const { data, loading, error } = useLoad(async () => {
    const staff = await list(
      "staff",
      ...(auth.roles.includes("parent") &&
      !auth.roles.some((r) => !["parent", "student"].includes(r))
        ? [where("directoryVisible", "==", true)]
        : []),
    );
    const classes = auth.scope?.classIds || [];
    const guardians = classes.length
      ? await list(
          "guardians",
          where("classIds", "array-contains-any", classes.slice(0, 30)),
        )
      : [];
    return [
      ...new Map(
        [...staff, ...guardians]
          .filter(
            (p) => p.uid && p.uid !== auth.user.uid && p.status !== "archived",
          )
          .map((p) => [p.uid, p]),
      ).values(),
    ];
  }, [auth.user.uid]);
  async function create(e) {
    e.preventDefault();
    setBusy(true);
    setFailure("");
    try {
      const thread = await addDoc(collection(db, "messageThreads"), {
        subject,
        participantUids: [auth.user.uid, target],
        createdBy: auth.user.uid,
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        lastMessagePreview: "",
        updatedAt: serverTimestamp(),
      });
      onCreated(thread.id);
    } catch (e) {
      setFailure(saveErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Section title="New conversation">
      <ErrorNote error={error} />
      {loading ? (
        <Loading />
      ) : !data?.length ? (
        <EmptyState title="No school contacts available yet.">
          Ask the school office to publish staff contacts and check your class
          assignments.
        </EmptyState>
      ) : (
        <form className="hub-form" onSubmit={create}>
          <label className="hub-field">
            School contact
            <select
              required
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              <option value="">Choose…</option>
              {data.map((p) => (
                <option key={p.uid} value={p.uid}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="hub-field">
            Subject
            <input
              required
              maxLength={140}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </label>
          <button disabled={busy} className="hub-button">
            Open conversation
          </button>
          <button
            type="button"
            className="hub-button hub-button-quiet"
            onClick={onCancel}
          >
            Cancel
          </button>
          {failure && (
            <p className="hub-error" role="alert">
              {failure}
            </p>
          )}
        </form>
      )}
    </Section>
  );
}
function Conversation({ id, onSent }) {
  const auth = useAuth();
  const [text, setText] = useState(""),
    [busy, setBusy] = useState(false),
    [failure, setFailure] = useState("");
  const { data, loading, error, reload } = useLoad(
    () => list(`messageThreads/${id}/messageItems`),
    [id],
  );
  async function send(e) {
    e.preventDefault();
    setBusy(true);
    setFailure("");
    try {
      await addDoc(collection(db, "messageThreads", id, "messageItems"), {
        senderUid: auth.user.uid,
        body: text.trim(),
        createdAt: serverTimestamp(),
      });
      setText("");
      reload();
      onSent();
      try {
        await updateDoc(doc(db, "messageThreads", id), {
          lastMessageAt: serverTimestamp(),
          lastMessagePreview: text.trim().slice(0, 120),
          updatedAt: serverTimestamp(),
        });
        onSent();
      } catch {
        /* The message was saved; a preview failure must not invite duplicate sending. */
      }
    } catch (e) {
      setFailure(saveErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Section title="Conversation">
      <ErrorNote error={error} />
      {loading ? (
        <Loading />
      ) : (
        <ul className="hub-list">
          {(data || [])
            .sort(
              (a, b) =>
                (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0),
            )
            .map((m) => (
              <li key={m.id}>
                <strong>
                  {m.senderUid === auth.user.uid ? "You" : "School contact"}
                </strong>
                <small>
                  {" "}
                  ·{" "}
                  {formatDate(m.createdAt, {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
                <p style={{ whiteSpace: "pre-wrap" }}>{m.body}</p>
              </li>
            ))}
        </ul>
      )}
      <form className="hub-form hub-message-compose" onSubmit={send}>
        <label className="hub-field">
          Your message
          <textarea
            required
            maxLength={5000}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <button className="hub-button" disabled={busy || !text.trim()}>
          {busy ? "Sending…" : "Send in the hub"}
        </button>
        {failure && (
          <p className="hub-error" role="alert">
            {failure}
          </p>
        )}
      </form>
    </Section>
  );
}
export function CommunityReports() {
  const auth = useAuth();
  const allowed = auth.roles.some((r) =>
    ["superAdmin", "schoolAdmin", "leadership"].includes(r),
  );
  const { data, loading, error } = useLoad(async () => {
    if (!allowed) return null;
    const [attendance, entries, receipts, notices] = await Promise.all([
      list("attendanceRecords"),
      list("portfolioEntries"),
      list("announcementReads"),
      list("announcements"),
    ]);
    return { attendance, entries, receipts, notices };
  }, [allowed]);
  if (!allowed)
    return (
      <EmptyState title="These school-wide reports require an authorised school role." />
    );
  return (
    <>
      <PageHeader kicker="School operations" title="School activity reports">
        Recorded attendance, portfolio activity and explicit notice
        acknowledgements. Acknowledgements are not a measure of message delivery
        or engagement.
      </PageHeader>
      <ErrorNote error={error} />
      {loading ? (
        <Loading />
      ) : (
        data && (
          <>
            <div className="hub-stats">
              <StatCard
                label="Attendance marks"
                value={data.attendance.length}
              />
              <StatCard
                label="Present / late"
                value={
                  data.attendance.filter((a) =>
                    ["present", "late"].includes(a.status),
                  ).length
                }
              />
              <StatCard
                label="Portfolio entries"
                value={
                  data.entries.filter((e) => e.status !== "archived").length
                }
              />
            </div>
            <Section title="Announcement reach">
              <ul className="hub-list">
                {data.notices.map((n) => (
                  <li key={n.id}>
                    <strong>{n.title}</strong>
                    <p>
                      {
                        data.receipts.filter((r) => r.announcementId === n.id)
                          .length
                      }{" "}
                      marked as read
                    </p>
                  </li>
                ))}
              </ul>
            </Section>
          </>
        )
      )}
    </>
  );
}
