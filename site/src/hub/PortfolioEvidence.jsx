import { useState } from "react";
import {
  arrayUnion,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getBytes, ref, uploadBytes } from "firebase/storage";
import { db } from "../lib/firebase-firestore";
import { storage } from "../lib/firebase-storage";
import { prepareImage } from "./media";
import { useAuth } from "../auth/AuthProvider";
import { saveErrorMessage } from "./manage";
const allowed =
  /^(image\/(jpeg|png|webp)|application\/pdf|audio\/(mpeg|mp4|wav|x-wav)|video\/mp4)$/;
export function AttachEvidence({ entry, onSaved }) {
  const auth = useAuth();
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      if (!allowed.test(file.type) || file.size >= 15 * 1024 * 1024)
        throw new Error(
          "Choose a photo, PDF, MP3, M4A, WAV or MP4 under 15 MB.",
        );
      if ((entry.mediaFiles || []).length >= 10)
        throw new Error("This entry already has ten uploads.");
      const blob = file.type.startsWith("image/")
        ? (await prepareImage(file)).blob
        : file;
      const path = `portfolioEvidence/${entry.id}/${crypto.randomUUID()}`;
      await uploadBytes(ref(storage, path), blob, { contentType: blob.type });
      await updateDoc(doc(db, "portfolioEntries", entry.id), {
        mediaFiles: arrayUnion({
          path,
          name: file.name.slice(0, 200),
          type: blob.type,
          size: blob.size,
        }),
        updatedAt: serverTimestamp(),
        updatedBy: auth.user.uid,
      });
      setOpen(false);
      onSaved();
    } catch (e) {
      setError(saveErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <span>
      <button
        type="button"
        className="hub-link-button"
        onClick={() => setOpen(!open)}
      >
        Attach evidence
      </button>
      {open && (
        <label className="hub-field">
          Private upload
          <input
            type="file"
            disabled={busy}
            accept="image/jpeg,image/png,image/webp,application/pdf,audio/mpeg,audio/mp4,audio/wav,video/mp4"
            onChange={upload}
          />
          <small>
            Under 15 MB; follows this entry's visibility. No public download
            link.
          </small>
        </label>
      )}
      {busy && <span role="status">Uploading…</span>}
      {error && (
        <span className="hub-error" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
export function EvidenceFiles({ files = [] }) {
  const [busy, setBusy] = useState(""),
    [error, setError] = useState("");
  async function open(file) {
    setBusy(file.path);
    setError("");
    try {
      const bytes = await getBytes(ref(storage, file.path), 15 * 1024 * 1024);
      const url = URL.createObjectURL(new Blob([bytes], { type: file.type }));
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError(
        "This file could not be opened. Check your access and connection, then try again.",
      );
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <ul className="hub-attachments">
        {files.map((f) => (
          <li key={f.path}>
            <button
              className="hub-link-button"
              disabled={!!busy}
              onClick={() => open(f)}
            >
              {busy === f.path ? "Opening…" : `Download ${f.name}`}
            </button>
          </li>
        ))}
      </ul>
      {error && (
        <p role="alert" className="hub-error">
          {error}
        </p>
      )}
    </>
  );
}
