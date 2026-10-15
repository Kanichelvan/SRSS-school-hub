import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "../../lib/firebase-storage";
import { EvidenceFiles } from "../PortfolioEvidence";
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
export function FamilyApplications() {
  const auth = useAuth();
  const [editing, setEditing] = useState(false),
    [failure, setFailure] = useState(""),
    [busy, setBusy] = useState(false);
  const { data, loading, error, reload } = useLoad(
    () => list("applications", where("applicantUid", "==", auth.user.uid)),
    [auth.user.uid],
  );
  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setFailure("");
    try {
      await addDoc(collection(db, "applications"), {
        applicantUid: auth.user.uid,
        child: { name: f.get("childName"), dateOfBirth: f.get("birth") },
        guardians: [
          {
            name: f.get("guardian"),
            email: auth.user.email,
            phone: f.get("phone"),
            relationship: "legalGuardian",
          },
        ],
        enteringStandard: Number(f.get("standard")),
        startDate: f.get("startDate"),
        status: "submitted",
        createdAt: serverTimestamp(),
        createdBy: auth.user.uid,
        updatedAt: serverTimestamp(),
        updatedBy: auth.user.uid,
      });
      setEditing(false);
      reload();
    } catch (e) {
      setFailure(saveErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        kicker="My family"
        title="Admissions applications"
        actions={
          <button className="hub-button" onClick={() => setEditing(!editing)}>
            New application
          </button>
        }
      >
        Apply for a child and respond to a school offer. Submission does not
        guarantee admission.
      </PageHeader>
      <ErrorNote error={error} />
      {editing && (
        <form className="hub-form hub-editor" onSubmit={submit}>
          {[
            ["childName", "Child name", "text"],
            ["birth", "Date of birth", "date"],
            ["guardian", "Parent / guardian name", "text"],
            ["phone", "Contact telephone", "tel"],
            ["startDate", "Preferred start date", "date"],
          ].map(([name, label, type]) => (
            <label className="hub-field" key={name}>
              {label}
              <input name={name} type={type} required maxLength={120} />
            </label>
          ))}
          <label className="hub-field">
            Entering Standard
            <select name="standard">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <p>
            Read the <a href="/legal/privacy">privacy notice</a> before
            submitting personal information.
          </p>
          <button disabled={busy} className="hub-button">
            {busy ? "Submitting…" : "Submit application"}
          </button>
          {failure && (
            <p className="hub-error" role="alert">
              {failure}
            </p>
          )}
        </form>
      )}
      {loading ? (
        <Loading />
      ) : !data?.length ? (
        <EmptyState title="No applications yet." />
      ) : (
        data.map((a) => (
          <Section key={a.id} title={a.child?.name || "Application"}>
            <StatusBadge status={a.status} />
            <p>Entering Standard {a.enteringStandard}</p>
            {a.offerText && (
              <p style={{ whiteSpace: "pre-wrap" }}>{a.offerText}</p>
            )}
            {a.status === "offer" && (
              <AcceptOffer application={a} onSaved={reload} />
            )}
            <ApplicationDocuments application={a} />
            {a.status === "enrolled" && (
              <Link to="/hub/welcome">Open your family welcome pack</Link>
            )}
          </Section>
        ))
      )}
    </>
  );
}
function AcceptOffer({ application, onSaved }) {
  const auth = useAuth();
  const [checked, setChecked] = useState(false),
    [busy, setBusy] = useState(false),
    [failure, setFailure] = useState("");
  async function accept(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await updateDoc(doc(db, "applications", application.id), {
        status: "accepted",
        acceptedBy: auth.user.uid,
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        updatedBy: auth.user.uid,
      });
      onSaved();
    } catch (e) {
      setFailure(saveErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="hub-form" onSubmit={accept}>
      <label className="hub-check">
        <input
          required
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        I have read the school's offer above and accept it for this child.
      </label>
      <button className="hub-button" disabled={!checked || busy}>
        {busy ? "Saving…" : "Accept this offer"}
      </button>
      {failure && (
        <p role="alert" className="hub-error">
          {failure}
        </p>
      )}
    </form>
  );
}
export function ApplicationReview({ application, onSaved }) {
  const auth = useAuth();
  const [stage, setStage] = useState(application.status),
    [offer, setOffer] = useState(application.offerText || ""),
    [busy, setBusy] = useState(false),
    [failure, setFailure] = useState("");
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await updateDoc(doc(db, "applications", application.id), {
        status: stage,
        offerText: offer,
        updatedAt: serverTimestamp(),
        updatedBy: auth.user.uid,
      });
      onSaved();
    } catch (e) {
      setFailure(saveErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Section title={"Review · " + application.child?.name}>
      <ApplicationDocuments application={application} />
      <SelectionNotes applicationId={application.id} />
      <form className="hub-form" onSubmit={save}>
        <label className="hub-field">
          Application stage
          <select value={stage} onChange={(e) => setStage(e.target.value)}>
            {[
              ["submitted", "Submitted"],
              ["documentsPending", "Documents pending"],
              ["underReview", "Under review"],
              ["interview", "Interview / assessment"],
              ["offer", "Offer"],
              ["declined", "Declined"],
              ["accepted", "Accepted (recorded family response)"],
            ].map(([id, l]) => (
              <option key={id} value={id}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="hub-field">
          Offer / outcome shown to the family
          <textarea
            required={stage === "offer"}
            maxLength={4000}
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
          />
        </label>
        <p className="hub-hint">
          This updates the family's application in the hub. It does not send an
          email. Record acceptance only after receiving the family's response.
        </p>
        <button className="hub-button" disabled={busy}>
          {busy ? "Saving…" : "Save application review"}
        </button>
        {failure && (
          <p role="alert" className="hub-error">
            {failure}
          </p>
        )}
      </form>
    </Section>
  );
}

function ApplicationDocuments({ application }) {
  const auth = useAuth();
  const [failure, setFailure] = useState(""),
    [busy, setBusy] = useState(false);
  const { data, loading, error, reload } = useLoad(
    () =>
      list(
        "applicationDocuments",
        where("applicationId", "==", application.id),
        where("applicantUid", "==", application.applicantUid),
      ),
    [application.id],
  );
  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setFailure("");
    try {
      if (
        !/^(application\/pdf|image\/(jpeg|png))$/.test(file.type) ||
        file.size >= 10 * 1024 * 1024
      )
        throw new Error("Choose a PDF, JPEG or PNG under 10 MB.");
      const path = "applications/" + auth.user.uid + "/" + crypto.randomUUID();
      await uploadBytes(ref(storage, path), file, { contentType: file.type });
      await addDoc(collection(db, "applicationDocuments"), {
        applicationId: application.id,
        applicantUid: auth.user.uid,
        path,
        name: file.name.slice(0, 200),
        type: file.type,
        createdAt: serverTimestamp(),
      });
      reload();
    } catch (e) {
      setFailure(saveErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <h3>Supporting documents</h3>
      <ErrorNote error={error} />
      {loading ? (
        <Loading />
      ) : (
        <EvidenceFiles
          files={(data || []).map((f) => ({
            path: f.path,
            name: f.name,
            type: f.type,
          }))}
        />
      )}{" "}
      {application.applicantUid === auth.user.uid && (
        <label className="hub-field">
          Upload a requested document
          <input
            type="file"
            disabled={busy}
            accept="application/pdf,image/jpeg,image/png"
            onChange={upload}
          />
        </label>
      )}
      {busy && <p role="status">Uploading…</p>}
      {failure && (
        <p role="alert" className="hub-error">
          {failure}
        </p>
      )}
    </div>
  );
}

function SelectionNotes({ applicationId }) {
  const auth = useAuth();
  const { data, loading, error } = useLoad(
    () => one("applicationReviews/" + applicationId),
    [applicationId],
  );
  const [rank, setRank] = useState(""),
    [criteria, setCriteria] = useState(""),
    [notes, setNotes] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  useEffect(() => {
    setRank(data?.meritRank ?? "");
    setCriteria(data?.criteriaReference || "");
    setNotes(data?.notes || "");
  }, [data]);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      await setDoc(doc(db, "applicationReviews", applicationId), {
        applicationId,
        meritRank: rank === "" ? null : Number(rank),
        criteriaReference: criteria,
        notes,
        updatedBy: auth.user.uid,
        updatedAt: serverTimestamp(),
      });
      setNotice("Private selection notes saved.");
    } catch (e) {
      setNotice(saveErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <details>
      <summary>Private selection notes and merit-list position</summary>
      <ErrorNote error={error} />
      {loading ? (
        <Loading />
      ) : (
        !error && (
          <form className="hub-form" onSubmit={save}>
            <p>
              Record a human-reviewed position using the school-approved
              admissions criteria. No automatic eligibility, ranking or
              admission decision is calculated.
            </p>
            <label className="hub-field">
              Reviewed merit-list position (optional)
              <input
                type="number"
                min="1"
                max="10000"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
              />
            </label>
            <label className="hub-field">
              Approved criteria / review reference
              <input
                required
                maxLength={500}
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
              />
            </label>
            <label className="hub-field">
              Private review notes
              <textarea
                maxLength={4000}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
            <button className="hub-button" disabled={busy}>
              Save private review
            </button>
            <p role="status">{notice}</p>
          </form>
        )
      )}
    </details>
  );
}
