// Pure challenge contract, shared by all campaigns and audiences. Never sent with keys to players.
export const TYPES = {
  mcq: 'Quick Quiz', trueFalse: 'Fact or Fiction', decode: 'Crack the Code',
  wordScramble: 'Word Scramble', wordSearch: 'Word Search', picturePuzzle: 'Picture Puzzle',
  memoryMatch: 'Memory Match', sequence: 'Put It in Order', spotDifference: 'Spot the Difference',
  creative: 'Creative Mission',
};
export const AUDIENCES = ['students', 'teachers', 'nonTeachingStaff', 'allStaff', 'wholeSchool', 'classes', 'staffTeams', 'users'];
export const STAMPS = ['Discover', 'Aspire', 'Create', 'Read', 'Serve', 'Reflect', 'Celebrate'];
export const TEACHERS = ['teacher', 'classTeacher', 'specialistTeacher'];
export const STAFF = ['superAdmin', ...TEACHERS, 'academicCoordinator', 'schoolAdmin', 'admissionsOfficer', 'financeOfficer', 'leadership', 'safeguardingLead', 'privacySteward', 'portfolioModerator', 'contentEditor', 'technicalAdmin', 'librarian', 'auditor'];
export const PUBLISHERS = ['superAdmin', 'schoolAdmin', 'leadership'];
export const EDITORS = [...PUBLISHERS, ...TEACHERS, 'contentEditor'];
export class QuestError extends Error { constructor(code, message) { super(message); this.code = code; } }
export const fail = (message, code = 'invalid-argument') => { throw new QuestError(code, message); };
export const hasAny = (roles, allowed) => roles.some((role) => allowed.includes(role));
export function text(value, name, max = 300, required = true) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) fail(`Enter a valid ${name} (up to ${max} characters).`);
  return value.trim();
}
export function ids(value = []) {
  if (!Array.isArray(value) || value.length > 100 || value.some((id) => typeof id !== 'string' || !/^[\w-]{1,128}$/.test(id))) fail('Invalid selection identifiers.');
  return [...new Set(value)];
}
export function integer(value, name, min = 0, max = 1000) {
  if (!Number.isInteger(value) || value < min || value > max) fail(`Invalid ${name}.`);
  return value;
}
export function instant(value, name) {
  if (typeof value !== 'string' || !/T.*(Z|[+-]\d\d:\d\d)$/.test(value) || !Number.isFinite(Date.parse(value))) fail(`Enter ${name} with a timezone.`);
  return new Date(value).toISOString();
}
export function eligible(c, actor) {
  const { roles, uid, scope, student, teamIds = [] } = actor;
  const isStudent = actor.mode !== 'staff' && roles.includes('student') && !!student;
  const isTeacher = actor.mode !== 'student' && hasAny(roles, TEACHERS);
  const isStaff = actor.mode !== 'student' && hasAny(roles, STAFF);
  const audiences = c.audiences || [];
  const matches = audiences.some((a) => ({
    students: isStudent, teachers: isTeacher, nonTeachingStaff: isStaff && !isTeacher,
    allStaff: isStaff, wholeSchool: isStudent || isStaff,
    classes: isStudent && c.classIds.includes(student.currentClassId),
    staffTeams: isStaff && c.teamIds.some((id) => teamIds.includes(id)), users: (isStudent || isStaff) && c.userIds.includes(uid),
  })[a]);
  if (!matches) return false;
  // Extra eligibility is conjunctive, not bypassed by matching another audience.
  if (isStudent && c.standards.length && !c.standards.includes(student.currentStandard)) return false;
  if (isStudent && c.classIds.length && !c.classIds.includes(student.currentClassId)) return false;
  return scope.status !== 'disabled';
}
export function availability(c, now = Date.now()) {
  if (c.status === 'archived' || c.status === 'closed') return c.status;
  if (!['live', 'scheduled'].includes(c.status)) return 'unpublished';
  if (now < Date.parse(c.startAt)) return 'comingSoon';
  if (now >= Date.parse(c.endAt)) return 'closed';
  return 'live';
}
export function validateDefinition(input) {
  if (!input || !TYPES[input.type]) fail('Choose a supported challenge type.');
  const audiences = input.audiences;
  if (!Array.isArray(audiences) || !audiences.length || audiences.some((a) => !AUDIENCES.includes(a))) fail('Choose a target audience.');
  const c = {
    title: text(input.title, 'title', 120), description: text(input.description || '', 'description', 1600, false),
    instructions: text(input.instructions, 'instructions', 2400), type: input.type,
    category: text(input.category, 'category', 80), campaignId: text(input.campaignId, 'campaign', 80),
    academicYearId: text(input.academicYearId, 'academic year', 40), collection: text(input.collection || '', 'collection', 80, false),
    difficulty: ['gentle', 'growing', 'stretch'].includes(input.difficulty) ? input.difficulty : 'gentle',
    audiences: [...new Set(audiences)], standards: (input.standards || []).map((n) => integer(n, 'Standard', 1, 6)),
    classIds: ids(input.classIds), teamIds: ids(input.teamIds), userIds: ids(input.userIds),
    durationMinutes: integer(input.durationMinutes ?? 5, 'estimated duration', 1, 120),
    attemptLimit: integer(input.attemptLimit ?? 1, 'attempt limit', 1, 10), timeLimitSeconds: integer(input.timeLimitSeconds ?? 0, 'time limit', 0, 7200),
    startAt: instant(input.startAt, 'opening time'), endAt: instant(input.endAt, 'closing time'),
    participationPoints: integer(input.participationPoints ?? 0, 'participation points'), completionPoints: integer(input.completionPoints ?? 10, 'completion points'),
    accuracyBonus: integer(input.accuracyBonus ?? 0, 'accuracy bonus'), anniversaryPoints: integer(input.anniversaryPoints ?? 0, 'anniversary points'),
    maxPoints: integer(input.maxPoints ?? 100, 'maximum points', 0, 4000), passPercent: integer(input.passPercent ?? 0, 'completion percentage', 0, 100),
    badgeId: input.badgeId ? ids([input.badgeId])[0] : '', stamp: STAMPS.includes(input.stamp) ? input.stamp : '', featured: input.featured === true,
    resources: validateResources(input.resources || []),
  };
  if (!/^[\w-]{1,80}$/.test(c.campaignId)) fail('Invalid campaign identifier.');
  if (Date.parse(c.startAt) >= Date.parse(c.endAt)) fail('Closing must follow opening.');
  for (const [a, field] of [['classes', 'classIds'], ['staffTeams', 'teamIds'], ['users', 'userIds']]) if (audiences.includes(a) && !c[field].length) fail(`Select ${field} for this audience.`);
  // Human Excellence, kindness and service recognise participation; never rank perceived virtue.
  if (['Human Excellence', 'Service & Sustainability'].includes(c.category)) {
    c.participationPoints = c.completionPoints = c.accuracyBonus = c.anniversaryPoints = c.maxPoints = 0;
  }
  return c;
}
export function validateResources(resources) {
  if (!Array.isArray(resources) || resources.length > 8) fail('At most eight Workspace attachments.');
  return resources.map((r) => {
    const label = text(r.label, 'resource label', 160);
    let url; try { url = new URL(r.url); } catch { fail('Enter a Google Workspace link.'); }
    if (url.protocol !== 'https:' || !['drive.google.com', 'docs.google.com', 'forms.gle'].includes(url.hostname) || url.username || url.password) fail('Use an authorised Google Drive, Docs, Slides, Sheets or Forms link.');
    return { label, url: url.href, provider: 'googleWorkspace' };
  });
}
export function validateQuestions(type, rows) {
  if (type === 'creative') return [];
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 30) fail('Add between one and thirty questions.');
  return rows.map((q, i) => {
    const item = { id: `q${i + 1}`, prompt: text(q.prompt, 'question', 1000), explanation: text(q.explanation || '', 'explanation', 1200, false) };
    if (['mcq', 'trueFalse'].includes(type)) {
      item.options = type === 'trueFalse' ? ['True', 'False'] : (q.options || []).map((v) => text(v, 'answer option', 200));
      if (item.options.length < 2 || item.options.length > 6 || new Set(item.options).size !== item.options.length) fail('Use two to six distinct answer options.');
      item.answer = integer(q.answer, 'correct option', 0, item.options.length - 1);
    } else if (['decode', 'wordScramble'].includes(type)) {
      item.clue = text(q.clue || '', 'clue', 300, false);
      item.answer = text(q.answer, 'correct answer', 200);
    } else if (['sequence', 'picturePuzzle', 'memoryMatch'].includes(type)) {
      if (!Array.isArray(q.items) || q.items.length < 2 || q.items.length > 16) fail('Use two to sixteen puzzle pieces.');
      item.items = q.items.map((p) => ({ id: ids([p.id])[0], label: text(p.label, 'piece label', 160), ...(p.image ? { image: mediaUrl(p.image) } : {}) }));
      if (new Set(item.items.map((p) => p.id)).size !== item.items.length) fail('Puzzle piece IDs must be unique.');
      if (type === 'picturePuzzle') {
        item.image = mediaUrl(q.image); item.rows = integer(q.rows, 'puzzle rows', 2, 4); item.columns = integer(q.columns, 'puzzle columns', 2, 4);
        if (q.items.length !== item.rows * item.columns) fail('Use one piece for every tile.');
        item.items = item.items.map((p, n) => ({ ...p, cropX: integer(q.items[n].cropX, 'tile column', 0, item.columns - 1), cropY: integer(q.items[n].cropY, 'tile row', 0, item.rows - 1) }));
        if (new Set(item.items.map((p) => `${p.cropX}:${p.cropY}`)).size !== item.items.length) fail('Use every tile exactly once.');
      }
      if (type === 'memoryMatch') {
        if (!Array.isArray(q.answer) || q.answer.length * 2 !== item.items.length) fail('Pair every memory card once.');
        item.answer = q.answer.map((pair) => { if (!Array.isArray(pair) || pair.length !== 2) fail('Each pair has two cards.'); return ids(pair); });
        const flattened = item.answer.flat();
        if (new Set(flattened).size !== item.items.length || flattened.some((id) => !item.items.some((p) => p.id === id))) fail('Pair every card exactly once.');
      } else {
        item.answer = ids(q.answer);
        if (item.answer.length !== item.items.length || item.answer.some((id) => !item.items.some((p) => p.id === id))) fail('Order every piece exactly once.');
        if (type === 'picturePuzzle' && JSON.stringify(item.answer) !== JSON.stringify([...item.items].sort((a, b) => a.cropY - b.cropY || a.cropX - b.cropX).map((p) => p.id))) fail('Picture pieces must reconstruct the original image, left to right and top to bottom.');
      }
    } else if (type === 'wordSearch') {
      if (!Array.isArray(q.grid) || q.grid.length < 2 || q.grid.length > 12 || q.grid.some((row) => typeof row !== 'string' || !/^[A-Z]{2,12}$/.test(row) || row.length !== q.grid[0].length)) fail('Use a rectangular uppercase letter grid, up to 12 × 12.');
      item.grid = q.grid; item.words = (q.words || []).map((w) => text(w, 'word to find', 30));
      item.answer = ids(q.answer); // cell IDs r0c0, r0c1…; selected union of target-word cells.
      if (!item.words.length || !item.answer.length || item.answer.some((id) => !q.grid.some((row, r) => [...row].some((_, col) => id === `r${r}c${col}`)))) fail('Choose valid target cells.');
    } else if (type === 'spotDifference') {
      item.images = (q.images || []).map(mediaUrl);
      if (item.images.length !== 2) fail('Add two approved comparison images.');
      if (!Array.isArray(q.regions) || q.regions.length < 2 || q.regions.length > 20) fail('Add two to twenty comparison areas, including distractors.');
      item.regions = q.regions.map((r) => ({ id: ids([r.id])[0], label: text(r.label, 'area label', 100), x: integer(r.x, 'horizontal position', 0, 100), y: integer(r.y, 'vertical position', 0, 100) }));
      item.answer = ids(q.answer);
      if (new Set(item.regions.map((r) => r.id)).size !== item.regions.length || !item.answer.length || item.answer.some((id) => !item.regions.some((r) => r.id === id))) fail('Choose valid difference areas.');
    }
    return item;
  });
}
function mediaUrl(value) {
  const url = text(value, 'approved image address', 500);
  // Only already-approved school website assets; arbitrary external media is not embedded.
  if (!/^\/assets\/[\w/.-]+\.(png|jpg|jpeg|webp)$/.test(url) || url.includes('..')) fail('Choose an approved school asset under /assets/.');
  return url;
}
export const publicQuestions = (rows) => rows.map(({ answer, explanation, ...rest }) => rest);
const normalText = (value) => typeof value === 'string' ? value.normalize('NFKC').trim().toLocaleLowerCase('en').replace(/\s+/g, ' ') : null;
const sorted = (value) => JSON.stringify([...value].sort());
function correct(type, actual, expected) {
  if (['decode', 'wordScramble'].includes(type)) return normalText(actual) === normalText(expected);
  if (['wordSearch', 'spotDifference'].includes(type)) return Array.isArray(actual) && new Set(actual).size === actual.length && sorted(actual) === sorted(expected);
  if (type === 'memoryMatch') return Array.isArray(actual) && actual.every((p) => Array.isArray(p) && p.length === 2) && sorted(actual.map(sorted)) === sorted(expected.map(sorted));
  return JSON.stringify(actual) === JSON.stringify(expected);
}
export function grade(c, questions, answers) {
  if (!Array.isArray(answers) || answers.length !== questions.length || JSON.stringify(answers).length > 40000) fail('Answer every question.');
  questions.forEach((q, i) => {
    const actual = answers[i];
    if (['mcq', 'trueFalse'].includes(c.type)) {
      if (!Number.isInteger(actual) || actual < 0 || actual >= q.options.length) fail('Choose an answer for every question.');
    } else if (['decode', 'wordScramble'].includes(c.type)) text(actual, 'puzzle answer', 200);
    else {
      let allowed;
      if (c.type === 'wordSearch') allowed = q.grid.flatMap((row, r) => [...row].map((_, col) => `r${r}c${col}`));
      else if (c.type === 'spotDifference') allowed = q.regions.map((r) => r.id);
      else allowed = q.items.map((p) => p.id);
      const flat = c.type === 'memoryMatch' && Array.isArray(actual) ? actual.flat() : actual;
      if (!Array.isArray(flat) || !flat.length || new Set(flat).size !== flat.length || flat.some((id) => !allowed.includes(id))) fail('Provide a valid puzzle answer.');
      if (['sequence', 'picturePuzzle', 'memoryMatch'].includes(c.type) && flat.length !== allowed.length) fail('Use every puzzle piece once.');
      if (c.type === 'memoryMatch' && actual.some((pair) => !Array.isArray(pair) || pair.length !== 2)) fail('Pair every memory card.');
    }
  });
  const results = questions.map((q, i) => ({ id: q.id, correct: correct(c.type, answers[i], q.answer), explanation: q.explanation }));
  const percentage = questions.length ? Math.round(results.filter((r) => r.correct).length * 100 / questions.length) : 100;
  const completed = percentage >= c.passPercent;
  const points = Math.min(c.maxPoints, c.participationPoints + (completed ? c.completionPoints + c.anniversaryPoints : 0) + (c.type === 'creative' ? 0 : Math.floor(c.accuracyBonus * percentage / 100)));
  return { results, percentage, completed, points };
}
export const boundedAnswers = (answers) => {
  if (!Array.isArray(answers) || JSON.stringify(answers).length > 40000) fail('Invalid saved answers.');
  return answers;
};
