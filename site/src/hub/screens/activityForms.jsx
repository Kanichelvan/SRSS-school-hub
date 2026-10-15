import { RequestedForms } from "./requestedForms";
import { useEffect, useRef, useState } from "react";
import {
  doc,
  collection,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../../lib/firebase-firestore";
import { useAuth } from "../../auth/AuthProvider";
import { getMany, list, today, useLoad } from "../data";
import { ACTIVITY_FORMS, ACTIVITY_FIELDS } from "../logic/community";
import {
  EmptyState,
  ErrorNote,
  Loading,
  PageHeader,
  Section,
  formatDate,
} from "../ui";
import { saveErrorMessage } from "../manage";
import "../community.css";
export function ActivityForms() {
  const auth = useAuth();
  const staff = auth.roles.some((r) => !["parent", "student"].includes(r));
  const office = auth.roles.some((r) =>
    ["superAdmin", "schoolAdmin", "privacySteward"].includes(r),
  );
  const welfare = auth.roles.includes("safeguardingLead");
  const [template, setTemplate] = useState(null),
    [review, setReview] = useState(null);
  const { data, loading, error, reload } = useLoad(
    async () => ({
      children: await getMany("students", auth.scope?.childIds || []),
      submissions: await list(
        "activityForms",
        ...(office
          ? []
          : welfare
            ? [where("formId", "==", "incident")]
            : [where("ownerUid", "==", auth.user.uid)]),
      ),
      documents: await Promise.all([
        list("documents", where("classification", "==", "public")),
        list(
          "documents",
          where("classification", "in", ["internal", "confidential"]),
          where(
            "audienceKeys",
            "array-contains-any",
            (auth.scope?.audienceKeys || ["school"]).slice(0, 30),
          ),
        ),
      ]).then((groups) => [
        ...new Map(
          groups
            .flat()
            .filter((d) => d.status !== "archived")
            .map((d) => [d.id, d]),
        ).values(),
      ]),
    }),
    [auth.user.uid, office],
  );
  return (
    <>
      <PageHeader kicker="My SRSS" title="Downloads & activity forms">
        Reusable school forms, with printable copies for families who prefer
        paper. Completed forms stay private to the submitter and authorised
        school office.
      </PageHeader>
      <ErrorNote error={error} />
      {loading ? (
        <Loading />
      ) : error ? null : (
        <>
          <RequestedForms />
          <Section title="Activity forms pack">
            <ul className="hub-cards">
              {ACTIVITY_FORMS.filter(
                (f) => staff || f.audience === "family",
              ).map((f) => (
                <li key={f.id} className="hub-card">
                  <h3>{f.title}</h3>
                  <p>
                    {f.audience === "staff"
                      ? "For supervising school staff"
                      : "For families and the school office"}
                  </p>
                  <button
                    className="hub-button hub-button-quiet"
                    onClick={() => {
                      setTemplate(f);
                      setReview(null);
                    }}
                  >
                    {auth.roles.includes("student")
                      ? "Open printable form"
                      : "Open form"}
                  </button>
                </li>
              ))}
            </ul>
          </Section>
          {template && (
            <ActivitySheet
              key={template.id}
              template={template}
              children={data.children}
              readOnly={
                auth.roles.includes("student") &&
                !staff &&
                !auth.roles.includes("parent")
              }
              onSaved={() => {
                setTemplate(null);
                reload();
              }}
            />
          )}
          <Section
            title={
              office
                ? "Submitted activity forms"
                : welfare
                  ? "Incident reports"
                  : "Your submitted forms"
            }
          >
            {!data.submissions.length ? (
              <EmptyState title="No forms submitted yet." />
            ) : (
              <ul className="hub-list">
                {data.submissions.map((s) => (
                  <li key={s.id}>
                    <strong>{s.title}</strong>
                    <p>
                      {s.studentName || s.signature} · {s.activity} ·{" "}
                      {formatDate(s.date)}
                    </p>
                    <button
                      className="hub-button hub-button-small hub-button-quiet"
                      onClick={() => {
                        setReview(s);
                        setTemplate(null);
                      }}
                    >
                      Read submitted form
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Section>
          {review && <SubmittedSheet record={review} />}
          <Section title="School downloads">
            {data.documents.length ? (
              <ul className="hub-list">
                {data.documents.map((d) => (
                  <li key={d.id}>
                    <strong>{d.title || d.name}</strong>
                    {d.url && (
                      <a href={d.url} target="_blank" rel="noreferrer">
                        Open document
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No school downloads published yet." />
            )}
          </Section>
        </>
      )}
    </>
  );
}
function ActivitySheet({ template, children, readOnly, onSaved }) {
  const sheet = useRef(null);
  useEffect(() => {
    sheet.current?.scrollIntoView({ block: "start" });
    sheet.current
      ?.querySelector("select,input")
      ?.focus({ preventScroll: true });
  }, []);
  const auth = useAuth();
  const [v, setV] = useState({
      date: today(),
      studentId: children[0]?.id || "",
    }),
    [busy, setBusy] = useState(false),
    [failure, setFailure] = useState("");
  const put = (k, x) => setV({ ...v, [k]: x });
  const fields = template.sections.flatMap((s) => ACTIVITY_FIELDS[s]);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setFailure("");
    try {
      const child = children.find((c) => c.id === v.studentId);
      const { studentId, ...answers } = v;
      await setDoc(doc(collection(db, "activityForms")), {
        ...answers,
        studentId: child?.id || null,
        classId: child?.currentClassId || null,
        studentName: child?.name || "",
        formId: template.id,
        title: template.title,
        version: template.version,
        ownerUid: auth.user.uid,
        createdAt: serverTimestamp(),
        status: "submitted",
      });
      onSaved();
    } catch (e) {
      setFailure(saveErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form ref={sheet} className="hub-form-sheet" onSubmit={save}>
      <h2>{template.title}</h2>
      <p>Sekolah Rendah Sathya Sai · Form version {template.version}</p>
      <p className="hub-hint">
        For urgent medical or safeguarding concerns, contact the school
        immediately. This form is not monitored as an emergency service.
      </p>
      {children.length > 0 && (
        <label>
          Child
          <select
            required
            value={v.studentId}
            onChange={(e) => put("studentId", e.target.value)}
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · Standard {c.currentStandard}
              </option>
            ))}
          </select>
        </label>
      )}
      {[
        ["activity", "Activity name", "text"],
        ["date", "Activity / session date", "date"],
        ["venue", "Venue", "text"],
        ["staffLead", "Staff in charge", "text"],
        ["escalation", "Emergency escalation contact / telephone", "text"],
        ["parentContact", "Parent / guardian contact", "text"],
        ...fields,
        ["signature", "Your full name / signature on paper", "text"],
      ].map(([key, label, type, options]) => (
        <label key={key}>
          {label}
          {type === "textarea" ? (
            <textarea
              required
              maxLength={4000}
              value={v[key] || ""}
              onChange={(e) => put(key, e.target.value)}
            />
          ) : type === "select" ? (
            <select
              required
              value={v[key] || ""}
              onChange={(e) => put(key, e.target.value)}
            >
              <option value="">Choose…</option>
              {options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ) : (
            <input
              required
              type={type}
              maxLength={250}
              value={v[key] || ""}
              onChange={(e) => put(key, e.target.value)}
            />
          )}
        </label>
      ))}
      <p>
        Media permission for this event does not override the child's
        school-wide consent record or authorise publication. The school checks
        the relevant permissions separately.
      </p>
      <p>Submission date: {today()}</p>
      {failure && (
        <p role="alert" className="hub-error">
          {failure}
        </p>
      )}
      <div className="hub-form-actions">
        {!readOnly && (
          <button className="hub-button" disabled={busy}>
            {busy ? "Submitting…" : "Submit to the school office"}
          </button>
        )}
        <button
          type="button"
          className="hub-button hub-button-quiet"
          onClick={() => window.print()}
        >
          Print form
        </button>
      </div>
    </form>
  );
}
function SubmittedSheet({ record }) {
  const template = ACTIVITY_FORMS.find((f) => f.id === record.formId);
  return (
    <article className="hub-form-sheet">
      <h2>{record.title}</h2>
      <p>Submitted form · {record.studentName || record.signature}</p>
      <dl className="hub-facts">
        {[
          ["activity", "Activity"],
          ["date", "Date"],
          ["venue", "Venue"],
          ["staffLead", "Staff in charge"],
          ["escalation", "Escalation contact"],
          ["parentContact", "Parent / guardian contact"],
          ...(template?.sections
            .flatMap((s) => ACTIVITY_FIELDS[s])
            .map(([k, l]) => [k, l]) || []),
          ["signature", "Signed by"],
        ].map(([k, l]) => (
          <div key={k}>
            <dt>{l}</dt>
            <dd style={{ whiteSpace: "pre-wrap" }}>{record[k] || "—"}</dd>
          </div>
        ))}
      </dl>
      <button
        className="hub-button hub-button-quiet hub-print-hide"
        onClick={() => window.print()}
      >
        Print submitted copy
      </button>
    </article>
  );
}
