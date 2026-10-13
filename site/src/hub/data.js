// Hub data access. One-shot reads rather than realtime listeners (PRD §70 cost control).
// Firestore rules are not filters: every list query here is constrained so that each document it can
// return is one the signed-in user may read (by studentId, classId, audience key or own uid).
import { useCallback, useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase-firestore";
import { mergeConsentItems } from "./consentForm";

export const withId = (snap) => ({ id: snap.id, ...snap.data() });
const chunks = (values, size = 30) => Array.from({ length: Math.ceil(values.length / size) }, (_, i) => values.slice(i * size, i * size + size));

export async function list(path, ...constraints) {
  const snap = await getDocs(query(collection(db, path), ...constraints));
  return snap.docs.map(withId);
}

export async function one(path) {
  const snap = await getDoc(doc(db, path));
  return snap.exists() ? withId(snap) : null;
}

// `in` queries are limited to 30 values; split and merge.
export async function listIn(path, field, values, ...constraints) {
  if (!values?.length) return [];
  const parts = await Promise.all(chunks([...new Set(values)]).map((part) => list(path, where(field, "in", part), ...constraints)));
  return parts.flat();
}

export async function getMany(path, ids) {
  const docs = await Promise.all([...new Set(ids || [])].map((id) => one(`${path}/${id}`).catch(() => null)));
  return docs.filter(Boolean);
}

// Published notices for these audiences: pinned first, newest next, expired ones left out.
export const announcementsFor = async (audienceKeys, max = 10) => {
  if (!audienceKeys.length) return [];
  const rows = await list("announcements", where("status", "==", "published"), where("audienceKeys", "array-contains-any", audienceKeys.slice(0, 30)), limit(Math.max(max * 2, 20)));
  const now = today();
  return rows.filter((item) => !item.expiresAt || item.expiresAt >= now)
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || (b.publishedAt?.seconds || 0) - (a.publishedAt?.seconds || 0)).slice(0, max);
};

// Published events for these audiences that haven't ended (multi-day events that started earlier included).
export const eventsFor = async (audienceKeys, fromDate) => {
  if (!audienceKeys.length) return [];
  const since = new Date(`${fromDate}T12:00:00`); since.setDate(since.getDate() - 31);
  const rows = await list("events", where("status", "==", "published"), where("audienceKeys", "array-contains-any", audienceKeys.slice(0, 30)), where("date", ">=", localDate(since)), orderBy("date"), limit(60));
  return rows.filter((event) => (event.endDate || event.date) >= fromDate).slice(0, 40);
};

// Calendar dates in the school's local time (YYYY-MM-DD). toISOString() alone would give the UTC date,
// which in Malaysia is still "yesterday" until 8 am.
export const localDate = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
export const today = () => localDate(new Date());
export const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return localDate(d); };

// Small async-state hook: { data, error, loading, reload }.
// Each result is tagged with the deps that produced it, so a render with new deps never sees stale data.
export function useLoad(loader, deps) {
  const key = JSON.stringify(deps);
  const [state, setState] = useState({ key: null, data: null, error: null, loading: true });
  const run = useCallback(() => {
    let alive = true;
    setState((current) => ({ ...current, loading: true, error: null }));
    Promise.resolve().then(loader).then((data) => alive && setState({ key, data, error: null, loading: false }), (error) => alive && setState({ key, data: null, error, loading: false }));
    return () => { alive = false; };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(run, [run]);
  const current = state.key === key ? state : { data: null, error: null, loading: true };
  return { data: current.data, error: current.error, loading: current.loading, reload: run };
}

// ---------- shared reference data (cached for the session; cleared when it changes) ----------
const cache = new Map();
export function cached(key, loader) {
  if (!cache.has(key)) cache.set(key, Promise.resolve().then(loader).catch((error) => { cache.delete(key); throw error; }));
  return cache.get(key);
}
export const forget = (...keys) => keys.forEach((key) => cache.delete(key));

// settings/school: name, currentAcademicYearId, currentTermId, attendanceDueTime.
export const schoolSettings = () => cached("settings", async () => (await one("settings/school")) || {});
export const currentYearId = async () => (await schoolSettings()).currentAcademicYearId || null;

// Staff names for "created / updated by" lines (staff records carry the sign-in uid).
export const staffNames = () => cached("staffNames", async () => Object.fromEntries((await list("staff")).filter((person) => person.uid).map((person) => [person.uid, person.name])));

// Configuration lists managed in Admin › Settings, active entries in display order.
export const configList = (name) => cached(`config:${name}`, async () => (await list(name)).filter((item) => (item.status ?? "active") === "active").sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.name).localeCompare(String(b.name))));

// The consent questions in force (built-in wording plus the school's edits in consentDefinitions).
export const consentItems = () => cached("consentItems", async () => mergeConsentItems(await list("consentDefinitions").catch(() => [])));

// Security rules may read at most 20 other documents per batched write, and several hub rules look up the
// pupil or class being written. Large saves are therefore committed in small batches, in order; callers
// put the write that marks the work "done" (e.g. submitting a register) in the last batch.
export const RULE_SAFE_BATCH = 8;
export async function commitInChunks(writes, size = RULE_SAFE_BATCH) {
  for (let i = 0; i < writes.length; i += size) {
    const batch = writeBatch(db);
    for (const write of writes.slice(i, i + size)) write(batch);
    await batch.commit();
  }
}
