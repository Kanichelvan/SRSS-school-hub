import assert from 'node:assert/strict';
import { test } from 'node:test';
import { defaultFaqs, verifiedFaqs } from '../src/data/faqs.js';
import { schoolHours } from '../src/data/academics.js';

test('school-hours answers use the confirmed cohort timetable, including Wednesday', () => {
  const answer = defaultFaqs.find(item => item.question === 'What are the school hours at SRSS?');
  assert.match(answer.paragraphs.join(' '), /7\.40 am/);
  for (const row of schoolHours) {
    const line = answer.bullets.find(line => line.startsWith(row.days));
    assert.ok(line?.includes(row.standard1));
    assert.ok(line?.includes(row.standards2to6));
  }
  const stale = { ...answer, paragraphs: ['School starts at 7:00 AM'], bullets: [] };
  assert.deepEqual(verifiedFaqs([stale])[0], answer);
});
