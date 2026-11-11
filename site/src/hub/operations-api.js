import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase-functions';

export const operationsCall = (action, payload = {}) =>
  httpsCallable(functions, 'schoolOperations')({ action, ...payload }).then(({ data }) => action === 'snapshot' ? normaliseSnapshot(data) : data);

function normaliseSnapshot(data) {
  const tasks = (data.tasks || []).map(task => ({ ...task, status: task.available === false ? 'deferred' : task.status }));
  const routines = (data.routines || []).map(routine => ({ ...routine, status: routine.available === false ? 'deferred' : routine.status === 'pending' ? 'due' : routine.status }));
  return { ...data, tasks, routines, users: data.users || [], years: data.years?.length ? data.years : [{id:data.yearId,name:data.yearId?.replace(/^ay/,'') || '2027'}], help: data.help || [], signoffs: (data.signoffs || []).map(row => ({ ...row, signedAt: row.signedAt || row.at, actorName: row.actorName || row.signedName, actorUid: row.actorUid || row.signedBy, title: row.title || routines.find(r => r.id === row.routineId)?.title })) };
}

export function operationsError(error) {
  if (String(error?.code).includes('aborted')) return 'Someone updated this record while you were working. Refresh the records, check their changes, then save again.';
  if (String(error?.code).includes('permission-denied')) return 'Your account cannot make this change. Ask the office or school leader to check your assigned access.';
  if (String(error?.code).includes('unavailable')) return 'The hub could not connect. Your changes have not been saved. Please try again.';
  return error?.message || 'The change could not be saved. Please try again.';
}

export function operationDate(value) {
  if (!value) return '—';
  const date = value.seconds ? new Date(value.seconds * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-MY', { timeZone: 'Asia/Kuala_Lumpur', dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
