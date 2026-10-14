import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sendInOrder } from '../src/hub/logic/orderedWrites.js';

test('offline register waits for pupil acknowledgement before submitting', async () => {
  let acknowledge;
  const calls = [];
  const result = await sendInOrder([
    () => { calls.push('pupils'); return new Promise((resolve) => { acknowledge = resolve; }); },
    async () => { calls.push('session'); },
  ], { online: false });
  assert.equal(result.queued, true);
  assert.deepEqual(calls, ['pupils']);
  acknowledge();
  await result.sent;
  assert.deepEqual(calls, ['pupils', 'session']);
});

test('a denied offline pupil batch never submits the register', async () => {
  let deny;
  let submitted = false;
  const result = await sendInOrder([
    () => new Promise((_, reject) => { deny = reject; }),
    async () => { submitted = true; },
  ], { online: false });
  deny(new Error('permission-denied'));
  await assert.rejects(result.sent, /permission-denied/);
  assert.equal(submitted, false);
});

test('slow online commits return pending without bypassing dependencies', async () => {
  let acknowledge;
  let submitted = false;
  const result = await sendInOrder([
    () => new Promise((resolve) => { acknowledge = resolve; }),
    async () => { submitted = true; },
  ], { timeoutMs: 1 });
  assert.equal(result.queued, true);
  assert.equal(submitted, false);
  acknowledge();
  await result.sent;
  assert.equal(submitted, true);
});

test('online saves acknowledge success and surface server rejection', async () => {
  assert.equal((await sendInOrder([async () => {}])).queued, false);
  await assert.rejects(sendInOrder([async () => { throw new Error('denied'); }]), /denied/);
});
