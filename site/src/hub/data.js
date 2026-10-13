// Hub data access. One-shot reads rather than realtime listeners (PRD §70 cost control).
// Firestore rules are not filters: every list query here is constrained so that each document it can
// return is one the signed-in user may read (by studentId, classId, audience key or own uid).
import { useCallback, useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "../lib/firebase-firestore";

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

export const announcementsFor = (audienceKeys, max = 10) =>
  list("announcements", where("status", "==", "published"), where("audienceKeys", "array-contains-any", audienceKeys.slice(0, 30)), limit(max));

export const eventsFor = (audienceKeys, fromDate) =>
  list("events", where("status", "==", "published"), where("audienceKeys", "array-contains-any", audienceKeys.slice(0, 30)), where("date", ">=", fromDate), orderBy("date"), limit(20));

export const today = () => new Date().toISOString().slice(0, 10);
export const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };

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
