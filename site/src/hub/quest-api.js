import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase-functions';
export const questCall = (action, payload = {}) => httpsCallable(functions, 'engagement')({ action, ...payload }).then((r) => r.data);
export const QUEST_TYPES = { mcq: 'Quick Quiz', trueFalse: 'Fact or Fiction', decode: 'Crack the Code', wordScramble: 'Word Scramble', wordSearch: 'Word Search', picturePuzzle: 'Picture Puzzle', memoryMatch: 'Memory Match', sequence: 'Put It in Order', spotDifference: 'Spot the Difference', creative: 'Creative Mission' };
export const QUEST_CATEGORIES = ['Our School', 'Our Values', 'Our Malaysia', 'Young Explorers', 'Reading Adventures', 'SRSS25 Memories', 'School Heritage', 'Human Excellence', 'Professional Learning', 'Fun & Fellowship', 'Service & Sustainability', 'Creative Contributions', 'Team Challenges'];
export const AUDIENCE_LABELS = { students: 'Students', teachers: 'Teachers', nonTeachingStaff: 'Non-teaching staff', allStaff: 'All staff', wholeSchool: 'Whole school', classes: 'Selected classes', staffTeams: 'Selected staff teams', users: 'Selected users' };
export const STAMPS = ['Discover', 'Aspire', 'Create', 'Read', 'Serve', 'Reflect', 'Celebrate'];
export const schoolDateTime = (value) => value ? new Intl.DateTimeFormat('en-MY', { timeZone: 'Asia/Kuala_Lumpur', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
export const toLocalInput = (value) => value ? new Date(Date.parse(value) + 8 * 3600000).toISOString().slice(0, 16) : '';
export const toInstant = (value) => new Date(`${value}:00+08:00`).toISOString();
export const schoolToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }).format(new Date());
export function csvDownload(name, columns, rows) {
  // Neutralise spreadsheet formulas before quoting exported school records.
  const cell = (v) => { let s = String(v ?? ''); if (/^[=+@\-\t\r]/.test(s)) s = `'${s}`; return `"${s.replaceAll('"', '""')}"`; };
  const url = URL.createObjectURL(new Blob([[columns.map((c) => cell(c.label)).join(','), ...rows.map((r) => columns.map((c) => cell(c.value(r))).join(','))].join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = `${name}.csv`; a.click(); URL.revokeObjectURL(url);
}
