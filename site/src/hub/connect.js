// SRSS Connect client helpers. Every change goes through the `connect` Cloud Function; this file only
// shapes requests, turns editor choices into audience keys and reads what the signed-in person may read.
import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebase-functions";
import { describeAudience } from "../../functions/connect-model.js";

export * from "../../functions/connect-model.js";

export async function connectCall(action, payload = {}) {
  try {
    const { data } = await httpsCallable(functions, "connect")({ action, ...payload });
    return data.data;
  } catch (error) {
    const friendly = new Error(error.message?.replace(/^(FirebaseError: )?/, "") || "Something went wrong. Please try again.");
    friendly.code = error.details?.code || error.code;
    friendly.errors = error.details?.errors || null;
    throw friendly;
  }
}

// Editor audience choices → audienceKeys (functions/scope.js gives each person the matching keys).
export const AUDIENCE_CHOICES = [
  ["school", "Whole school (everyone with a hub account)"],
  ["role:parents", "All parents"],
  ["role:staff", "All staff"],
  ["role:teachers", "Teachers"],
  ["role:students", "All students"],
  ["standardParents", "Parents of selected Standards"],
  ["standard", "Everyone in selected Standards (pupils, parents, teachers)"],
  ["classParents", "Parents of selected classes"],
  ["class", "Everyone in selected classes"],
  ["users", "Selected people"],
];
export const TEACHER_CHOICES = [["classParents", "Parents of my class(es)"], ["class", "Everyone in my class(es) — pupils and parents"]];

export const audienceLabel = (keys, lookups) => describeAudience(keys, lookups);

// datetime-local ⇄ ISO (the browser's local time, which for SRSS staff is Malaysia time).
export const toLocalInput = (value) => {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
export const fromLocalInput = (value) => (value ? new Date(value).toISOString() : null);

// StatusBadge tone keys (src/hub/ui.jsx).
export const STATUS_TONES = { draft: "neutral", pending_review: "pending", approved: "approved", scheduled: "scheduled", published: "published", expired: "neutral", archived: "neutral", cancelled: "overdue", rejected: "returned" };
export const PRIORITY_TONES = { P1: "overdue", P2: "pending", P3: "open", P4: "neutral" };
export const workspacePath = (mode, id = "") => `${mode === "teacher" ? "/hub/teacher/announcements" : "/hub/admin/communications"}${id ? `/${id}` : ""}`;
