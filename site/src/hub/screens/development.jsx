import { useState } from "react";
import { doc, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../../lib/firebase-firestore";
import { useAuth } from "../../auth/AuthProvider";
import { list, useLoad } from "../data";
import {
  REVIEW_DOMAINS,
  REVIEW_BANDS,
  REVIEW_STAGES,
} from "../logic/community";
import { RecordManager, saveErrorMessage } from "../manage";
import { EmptyState, ErrorNote, Loading, PageHeader, Section } from "../ui";
import "../community.css";
const leadership = (roles) =>
  roles.some((r) => ["leadership", "superAdmin"].includes(r));
export function TeacherDevelopment() {
  const auth = useAuth();
  const leader = leadership(auth.roles);
  if (leader) return <ReviewManager />;
  return (
    <>
      <PageHeader kicker="Professional learning" title="My development">
        A balanced conversation about practice and growth. Reviews use evidence
        and three descriptive bands, never a score for personal virtue or exam
        results alone.
      </PageHeader>
      <MyReviews />
    </>
  );
}
function ReviewManager() {
  return (
    <RecordManager
      kicker="Professional learning"
      title="Teacher development"
      noun="developmental review"
      collection="staffAppraisals"
      canEdit
      intro="Private to the teacher and school leadership. Agree goals at the start of the year, review progress mid-year and reflect at year-end. Use evidence, support and a follow-up date; no rankings or numeric virtue scores."
      load={() => list("staffAppraisals")}
      lookups={async () => ({
        staff: (await list("staff")).filter(
          (p) => p.uid && p.status !== "archived",
        ),
      })}
      nameOf={(r) =>
        `${r.staffName || "Teacher"} · ${r.year} · ${REVIEW_STAGES.find((s) => s[0] === r.stage)?.[1] || r.stage}`
      }
      fields={[
        {
          key: "staffUid",
          label: "Teacher",
          type: "select",
          required: true,
          immutable: true,
          options: (l) => l.staff.map((p) => [p.uid, p.name]),
        },
        {
          key: "year",
          label: "Year",
          type: "number",
          required: true,
          min: 2020,
          max: 2100,
          immutable: true,
        },
        {
          key: "stage",
          label: "Conversation",
          type: "select",
          required: true,
          immutable: true,
          options: REVIEW_STAGES,
        },
        {
          key: "meetingDate",
          label: "Meeting date",
          type: "date",
          required: true,
        },
        {
          key: "goals",
          label: "Agreed goals and support",
          type: "textarea",
          required: true,
          maxLength: 4000,
          wide: true,
        },
        ...REVIEW_DOMAINS.flatMap(([id, label, help]) => [
          {
            key: `${id}Evidence`,
            label: `${label} · evidence`,
            help,
            type: "textarea",
            maxLength: 4000,
            wide: true,
          },
          {
            key: `${id}Band`,
            label: `${label} · band`,
            type: "select",
            options: REVIEW_BANDS,
            placeholder: "Not yet reviewed",
          },
        ]),
        {
          key: "evidenceLinks",
          label: "Evidence references",
          type: "textarea",
          help: "Use governed school links. Do not paste sensitive pupil details into this review.",
          maxLength: 4000,
          wide: true,
        },
        {
          key: "supervisorReview",
          label: "Supervisor reflection and agreed next steps",
          type: "textarea",
          maxLength: 4000,
          wide: true,
        },
        { key: "followUpDate", label: "Next conversation", type: "date" },
      ]}
      defaults={() => ({ year: new Date().getFullYear(), stage: "goals" })}
      prepare={(v, { lookups, isNew }) => ({
        ...v,
        staffName:
          lookups.staff.find((p) => p.uid === v.staffUid)?.name || "Teacher",
        ...(isNew ? { selfReflection: "" } : {}),
      })}
      columns={() => [
        { key: "staffName", label: "Teacher" },
        { key: "year", label: "Year" },
        {
          key: "stage",
          label: "Conversation",
          render: (r) => REVIEW_STAGES.find((s) => s[0] === r.stage)?.[1],
        },
        { key: "meetingDate", label: "Meeting" },
        { key: "followUpDate", label: "Follow-up" },
      ]}
      searchKeys={["staffName", "goals"]}
      exportName="teacher-development"
    />
  );
}
function MyReviews() {
  const auth = useAuth();
  const { data, loading, error, reload } = useLoad(
    () => list("staffAppraisals", where("staffUid", "==", auth.user.uid)),
    [auth.user.uid],
  );
  return (
    <>
      <ErrorNote error={error} />
      {loading ? (
        <Loading />
      ) : !data?.length ? (
        <EmptyState title="Your development conversations will appear here.">
          Leadership arranges your beginning-of-year, mid-year and end-of-year
          reviews. Agree evidence and support with your mentor.
        </EmptyState>
      ) : (
        data
          .sort((a, b) => b.year - a.year)
          .map((r) => (
            <Section
              key={r.id}
              title={`${r.year} · ${REVIEW_STAGES.find((s) => s[0] === r.stage)?.[1] || r.stage}`}
            >
              <p>
                <strong>Agreed goals:</strong> {r.goals}
              </p>
              <p>
                Meeting: {r.meetingDate} · Follow-up:{" "}
                {r.followUpDate || "To be agreed"}
              </p>
              {REVIEW_DOMAINS.map(([id, label]) => (
                <article className="hub-review-domain" key={id}>
                  <h3>{label}</h3>
                  <p>
                    {REVIEW_BANDS.find((b) => b[0] === r[`${id}Band`])?.[1] ||
                      "Not yet reviewed"}
                  </p>
                  <p>{r[`${id}Evidence`] || "Evidence to be discussed."}</p>
                </article>
              ))}
              <p>{r.supervisorReview}</p>
              <Reflection
                key={`${r.id}_${r.updatedAt?.seconds}`}
                review={r}
                onSaved={reload}
              />
            </Section>
          ))
      )}
    </>
  );
}
function Reflection({ review, onSaved }) {
  const auth = useAuth();
  const [text, setText] = useState(review.selfReflection || ""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await updateDoc(doc(db, "staffAppraisals", review.id), {
        selfReflection: text,
        updatedAt: serverTimestamp(),
        updatedBy: auth.user.uid,
      });
      onSaved();
    } catch (e) {
      setError(saveErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="hub-form" onSubmit={save}>
      <label className="hub-field">
        Your reflection
        <textarea
          required
          maxLength={4000}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <button disabled={busy} className="hub-button">
        {busy ? "Saving…" : "Save my reflection"}
      </button>
      {error && (
        <p role="alert" className="hub-error">
          {error}
        </p>
      )}
    </form>
  );
}
