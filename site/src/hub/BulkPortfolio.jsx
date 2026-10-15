import { useState, useRef } from "react";
import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase-firestore";
import { useAuth } from "../auth/AuthProvider";
import { today } from "./data";
import { saveErrorMessage } from "./manage";
import { HUMAN_VALUES } from "./logic/dashboard";
export function BulkPortfolio({ lookups, onSaved }) {
  const auth = useAuth();
  const [classId, setClass] = useState(lookups.classes?.[0]?.id || ""),
    [selected, setSelected] = useState([]),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [failure, setFailure] = useState(""),
    [locked, setLocked] = useState(false);
  const job = useRef(null);
  const students = (lookups.students || []).filter(
    (s) => s.currentClassId === classId,
  );
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setFailure("");
    setNotice("");
    try {
      if (!job.current) {
        const f = new FormData(e.currentTarget),
          cls = lookups.classes.find((c) => c.id === classId),
          batchKey = crypto.randomUUID();
        job.current = selected.map((studentId) => ({
          id: doc(collection(db, "portfolioEntries")).id,
          payload: {
            studentId,
            classId,
            academicYearId: cls.academicYearId,
            title: f.get("title"),
            description: f.get("description"),
            date: f.get("date"),
            category: f.get("category"),
            humanValues: f.getAll("values"),
            visibility: f.get("visibility"),
            teacherObservation: f.get("teacherObservation"),
            studentReflection: "",
            mediaReferences: [],
            achievementTags: [],
            moderationStatus: null,
            createdBy: auth.user.uid,
            status: "active",
            batchKey,
          },
        }));
        setLocked(true);
      }
      while (job.current.length) {
        const part = job.current.slice(0, 8),
          batch = writeBatch(db);
        for (const row of part) {
          const reference = doc(db, "portfolioEntries", row.id),
            existing = await getDoc(reference).catch((error) => {
              if (error.code === "permission-denied") return null;
              throw error;
            });
          if (!existing?.exists())
            batch.set(reference, {
              ...row.payload,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              updatedBy: auth.user.uid,
            });
          else if (existing.data().batchKey !== row.payload.batchKey)
            throw new Error(
              "An entry conflict needs review. No existing work was overwritten.",
            );
        }
        await batch.commit();
        job.current.splice(0, part.length);
      }
      job.current = null;
      setLocked(false);
      setNotice(
        "Portfolio entries saved for the selected pupils. Add individual reflections and media through each entry.",
      );
      setSelected([]);
      onSaved();
    } catch (e) {
      setFailure(
        saveErrorMessage(e) +
          " Any remaining entries can be retried without duplicating saved work.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="hub-form hub-editor" onSubmit={save}>
      <h2>One class activity, individual portfolios</h2>
      <p>
        Add the same learning experience to selected pupils, then personalise
        their reflections and evidence. Nothing is automatically published.
      </p>
      <fieldset disabled={busy || locked}>
        <label className="hub-field">
          Class
          <select
            required
            value={classId}
            onChange={(e) => {
              setClass(e.target.value);
              setSelected([]);
            }}
          >
            {lookups.classes?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="hub-button hub-button-small hub-button-quiet"
          onClick={() =>
            setSelected(
              selected.length === students.length
                ? []
                : students.map((s) => s.id),
            )
          }
        >
          {selected.length === students.length
            ? "Clear selection"
            : "Select whole class"}
        </button>
        {students.map((s) => (
          <label key={s.id} className="hub-check">
            <input
              type="checkbox"
              checked={selected.includes(s.id)}
              onChange={(e) =>
                setSelected(
                  e.target.checked
                    ? [...selected, s.id]
                    : selected.filter((id) => id !== s.id),
                )
              }
            />
            {s.name}
          </label>
        ))}
        {[
          ["title", "Title", "text"],
          ["date", "Date", "date"],
        ].map(([name, label, type]) => (
          <label className="hub-field" key={name}>
            {label}
            <input
              required
              name={name}
              type={type}
              maxLength={140}
              defaultValue={type === "date" ? today() : ""}
            />
          </label>
        ))}
        <label className="hub-field">
          Description
          <textarea required maxLength={4000} name="description" />
        </label>
        <label className="hub-field">
          Teacher comment
          <textarea maxLength={2000} name="teacherObservation" />
        </label>
        <label className="hub-field">
          Category
          <select name="category">
            <option value="academic">Academic learning</option>
            <option value="cocurricular">Co-curricular</option>
            <option value="humanValues">Human Values</option>
            <option value="achievements">Achievements</option>
          </select>
        </label>
        <fieldset>
          <legend>Values observed</legend>
          {Object.entries(HUMAN_VALUES).map(([id, label]) => (
            <label key={id} className="hub-check">
              <input type="checkbox" name="values" value={id} />
              {label}
            </label>
          ))}
        </fieldset>
        <label className="hub-field">
          Visibility
          <select name="visibility">
            <option value="family">Parent-visible</option>
            <option value="internal">Internal to staff</option>
          </select>
        </label>
      </fieldset>
      <button
        className="hub-button"
        disabled={busy || (!selected.length && !locked)}
      >
        {busy
          ? "Saving…"
          : locked
            ? "Retry remaining entries"
            : "Add to selected portfolios"}
      </button>
      <p role="status">{notice}</p>
      {failure && (
        <p role="alert" className="hub-error">
          {failure}
        </p>
      )}
    </form>
  );
}
