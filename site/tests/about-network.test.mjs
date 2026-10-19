import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { aboutJourney, aboutAnchorDestination } from '../src/data/aboutNetwork.js';
import { REDIRECTS, resolvePath, breadcrumbs } from '../src/data/siteMap.js';

test('the About journey leads to seven distinct pages with About breadcrumbs and school editing',()=>{
 assert.equal(aboutJourney.length,7);
 const pages=new Set();
 for(const item of aboutJourney){
  const {entry}=resolvePath(item.path);
  assert.equal(entry.status,'page',item.path);
  assert.equal(entry.editable,'append',item.path);
  assert.equal(breadcrumbs(entry).at(-2).path,'/about');
  pages.add(entry.page);
 }
 assert.equal(pages.size,7);
});
test('old About bookmarks follow content to its new page',()=>{
 for(const [hash,destination] of Object.entries({'#mission':'/about/vision-mission#mission','#principal-welcome':'/about/leadership-governance#principal-welcome','#values':'/about/human-excellence#values','#campus':'/about/campus','#school-profile':'/about/school-profile'})){
  assert.equal(aboutAnchorDestination('/about',hash),destination);
  assert.notEqual(resolvePath(destination.split('#')[0]).entry.page,'notFound');
 }
 assert.equal(aboutAnchorDestination('/about/our-people','#principal'),'/about/leadership-governance#principal-welcome');
 assert.equal(aboutAnchorDestination('/about','#explore-about'),null);
 assert.equal(aboutAnchorDestination('/learning','#values'),null);
});
test('Why SRSS has one canonical destination, mirrored by Hosting',()=>{
 assert.equal(REDIRECTS['/join/why-srss'],'/about/why-srss');
 const {hosting}=JSON.parse(readFileSync(new URL('../firebase.json',import.meta.url)));
 for(const config of Array.isArray(hosting)?hosting:[hosting]) assert.ok(config.redirects.some(r=>r.source==='/join/why-srss'&&r.destination==='/about/why-srss'&&r.type===301));
});

test('old Educare subpage bookmarks follow the relocated sections',()=>{
 assert.equal(aboutAnchorDestination('/about/sathya-sai-education','#three-hs'),'/about/human-excellence#whole-child');
 assert.equal(aboutAnchorDestination('/about/sathya-sai-education','#five-values'),'/about/human-excellence#values');
 assert.equal(aboutAnchorDestination('/about/sathya-sai-education','#integral-education'),'/about/sathya-sai-education#integral');
 assert.equal(aboutAnchorDestination('/about/sathya-sai-education','#inspiration'),null);
});
