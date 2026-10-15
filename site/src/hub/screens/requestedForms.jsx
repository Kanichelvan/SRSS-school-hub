import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../../lib/firebase-firestore";
import { useAuth } from "../../auth/AuthProvider";
import { list, one, useLoad } from "../data";
import {
  EmptyState,
  ErrorNote,
  Loading,
  PageHeader,
  Section,
  StatusBadge,
} from "../ui";
import { saveErrorMessage } from "../manage";
export function RequestedForms() {
  const auth = useAuth();
  const { data, loading, error } = useLoad(
    () =>
      list("formSubmissions", where("requestedFromUid", "==", auth.user.uid)),
    [auth.user.uid],
  );
  return (
    <Section title="Forms requested by the school">
      <ErrorNote error={error} />
      {loading ? (
        <Loading />
      ) : !data?.length ? (
        <EmptyState title="No requested forms." />
      ) : (
        <ul className="hub-list">
          {data.map((r) => (
            <li key={r.id}>
              <Link to={"/hub/forms/" + r.id}>
                {r.formTitle || "School form"}
              </Link>
              <StatusBadge status={r.status} />
              <p>{r.dueDate ? "Due " + r.dueDate : ""}</p>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
export function RequestedForm() {
  const { submissionId } = useParams(),
    auth = useAuth();
  const { data, loading, error, reload } = useLoad(async () => {
    const record = await one("formSubmissions/" + submissionId);
    return {
      record,
      definition: record ? await one("formDefinitions/" + record.formId) : null,
    };
  }, [submissionId]);
  const [busy, setBusy] = useState(false),
    [failure, setFailure] = useState("");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setFailure("");
    try {
      const answers = Object.fromEntries(new FormData(e.currentTarget));
      await updateDoc(doc(db, "formSubmissions", submissionId), {
        answers,
        status: "submitted",
        submittedByUid: auth.user.uid,
        submittedAt: serverTimestamp(),
        updatedBy: auth.user.uid,
        updatedAt: serverTimestamp(),
      });
      reload();
    } catch (e) {
      setFailure(saveErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <Loading />;
  if (error) return <ErrorNote error={error} />;
  if (!data?.record || !data.definition)
    return <EmptyState title="This requested form is unavailable." />;
  const { record, definition } = data,
    readOnly = !["pending", "draft"].includes(record.status);
  return (
    <>
      <PageHeader
        kicker="School forms"
        title={record.formTitle || definition.title}
      >
        {definition.purpose}
      </PageHeader>
      <Link to="/hub/forms">Back to downloads and forms</Link>
      <StatusBadge status={record.status} />
      <form className="hub-form-sheet" onSubmit={submit}>
        {(definition.fields || []).map((field) => {
          const key = typeof field === "string" ? field : field.key;
          return (
            <label key={key}>
              {typeof field === "string"
                ? field.replace(/([A-Z])/g, " $1")
                : field.label}
              <textarea
                name={key}
                defaultValue={record.answers?.[key] || ""}
                maxLength={4000}
                required
                readOnly={readOnly}
              />
            </label>
          );
        })}
        {readOnly ? (
          <p role="status">
            Submitted to the school. Contact the office if a correction is
            needed.
          </p>
        ) : (
          <button className="hub-button" disabled={busy}>
            {busy ? "Submitting…" : "Submit completed form"}
          </button>
        )}
        {failure && (
          <p role="alert" className="hub-error">
            {failure}
          </p>
        )}
      </form>
    </>
  );
}
