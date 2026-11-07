// Homepage announcement bar (SRSS Connect Part 1 §6.1): only approved public notices, most urgent first,
// one at a time with manual next/previous (no marquee, no auto-rotation), ordinary notices dismissible,
// expired ones gone. Emergency (P1) and important (P2) notices can't be dismissed.
import { useMemo, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { CaretLeft } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRight } from "@phosphor-icons/react/dist/csr/CaretRight";
import { X } from "@phosphor-icons/react/dist/csr/X";
import "./announcement-bar.css";

const STORE = "srss-dismissed-notices";
const LABELS = { P1: "Emergency notice", P2: "Important notice", P3: "School notice", P4: "School update" };
const rank = (item) => ["P1", "P2", "P3", "P4"].indexOf(item.priority || "P3");
const readDismissed = () => { try { return JSON.parse(window.localStorage.getItem(STORE) || "[]"); } catch { return []; } };

export function orderPublicNotices(notices = []) {
  return [...notices].sort((a, b) => rank(a) - rank(b) || Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || String(b.date).localeCompare(String(a.date)));
}

export function AnnouncementBar({ notices }) {
  const [dismissed, setDismissed] = useState(readDismissed);
  const [index, setIndex] = useState(0);
  const visible = useMemo(() => orderPublicNotices(notices).filter((item) => ["P1", "P2"].includes(item.priority) || !dismissed.includes(item.id)), [notices, dismissed]);
  if (!visible.length) return null;
  const current = visible[Math.min(index, visible.length - 1)];
  const priority = current.priority || "P3";
  const dismissible = !["P1", "P2"].includes(priority);
  const dismiss = () => {
    const next = [...new Set([...dismissed, current.id])].slice(-50);
    setDismissed(next); setIndex(0);
    try { window.localStorage.setItem(STORE, JSON.stringify(next)); } catch { /* private mode: dismissal lasts for this visit */ }
  };
  const step = (by) => setIndex((value) => (value + by + visible.length) % visible.length);
  const href = current.action?.href || `/announcements/${current.id}`;
  return <aside className={`announcement-bar announcement-${priority}`} aria-label="School announcements" role={priority === "P1" ? "alert" : undefined}>
    <div className="announcement-inner">
      <p className="announcement-label">{LABELS[priority]}</p>
      <p className="announcement-text"><strong>{current.title}</strong>{current.summary && <span> {current.summary}</span>}</p>
      <a className="announcement-link" href={href}>{current.action?.label || "Learn more"} <ArrowRight size={14} weight="bold" aria-hidden="true" /></a>
      {visible.length > 1 && <div className="announcement-steps">
        <button type="button" onClick={() => step(-1)} aria-label="Previous announcement"><CaretLeft size={14} weight="bold" /></button>
        <span aria-live="polite">{Math.min(index, visible.length - 1) + 1} of {visible.length}</span>
        <button type="button" onClick={() => step(1)} aria-label="Next announcement"><CaretRight size={14} weight="bold" /></button>
      </div>}
      {dismissible && <button type="button" className="announcement-dismiss" onClick={dismiss} aria-label={`Dismiss “${current.title}”`}><X size={16} weight="bold" /></button>}
    </div>
  </aside>;
}
