import test from 'node:test';
import assert from 'node:assert/strict';
import {aboutPillars,aboutFaqGroups,aboutValues,communityQuotes} from '../src/data/about.js';
test('the eleven commitments each belong to exactly one of the three pillars',()=>{
 assert.deepEqual(aboutPillars.map(p=>p.ways.length),[6,2,3]);
 const ways=aboutPillars.flatMap(p=>p.ways.map(([name])=>name));
 assert.equal(new Set(ways).size,11);
});
test('all four FAQ topics and all six community audiences have supplied content',()=>{
 assert.equal(aboutFaqGroups.length,4);
 assert.ok(aboutFaqGroups.every(g=>g.items.length&&g.items.every(i=>i.question&&i.paragraphs[0])));
 assert.equal(new Set(communityQuotes.map(q=>q.group)).size,6);
 assert.deepEqual(aboutValues.map(v=>v.className),['truth','conduct','peace','love','nonviolence']);
});
