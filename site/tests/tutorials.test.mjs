import test from 'node:test';
import assert from 'node:assert/strict';
import { TUTORIALS, cleanTutorialProgress, tutorialLinkAllowed } from '../src/hub/logic/tutorials.js';
import { hubRoutes } from '../src/hub/routes.js';
test('all four hubs have usable role-specific guides and unique progress IDs',()=>{
 assert.deepEqual(Object.keys(TUTORIALS).sort(),['admin','parent','student','teacher']);
 const ids=[];
 for(const guide of Object.values(TUTORIALS)){assert.ok(guide.lessons.length>=6);for(const lesson of guide.lessons){assert.ok(lesson.steps.length>=3);ids.push(lesson.id);for(const [path,label]of lesson.links){assert.ok(label);if(path.startsWith('/hub/'))assert.ok(hubRoutes.some(r=>new RegExp('^'+r.path.replace(/:[^/]+/g,'[^/]+')+'$').test(path.split('?')[0])),path);}}}
 assert.equal(ids.length,new Set(ids).size);
});
test('saved progress rejects unknown IDs, cross-role IDs and duplicates',()=>{
 assert.deepEqual(cleanTutorialProgress('parent',['parent-children','parent-children','admin-start','invented',null]),['parent-children']);
 assert.deepEqual(cleanTutorialProgress('student',null),[]);
});
test('tutorial actions respect parent, student and staff permissions',()=>{
 assert.equal(tutorialLinkAllowed('/hub/admin/import',['parent']),false);
 assert.equal(tutorialLinkAllowed('/hub/admin/import',['contentEditor']),false);
 assert.equal(tutorialLinkAllowed('/hub/admin/import',['schoolAdmin']),true);
 assert.equal(tutorialLinkAllowed('/hub/parent/consent',['parent']),true);
 assert.equal(tutorialLinkAllowed('/hub/teacher/classes',['student']),false);
 assert.equal(tutorialLinkAllowed('/hub/student/nilam',['student']),true);
 assert.equal(tutorialLinkAllowed('/hub/unknown',['superAdmin']),false);
});
test('future results guidance says from when it opens and contains no payment-action links',()=>{
 assert.match(TUTORIALS.teacher.lessons.find(l=>l.id==='teacher-results').steps.join(' '),/From when it opens/);
 for(const guide of Object.values(TUTORIALS))for(const lesson of guide.lessons)for(const [path]of lesson.links)assert.ok(!/payment|refund|receipt|L0[234579]|L10/.test(path));
});
