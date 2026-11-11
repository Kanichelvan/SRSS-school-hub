import test,{before,after,beforeEach} from 'node:test';import {readFile} from 'node:fs/promises';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,serverTimestamp,updateDoc} from 'firebase/firestore';
let env;
// Use the emulator `npm run test:rules` starts, and start each test from an empty database.
const [host,port='8080']=(process.env.FIRESTORE_EMULATOR_HOST||'127.0.0.1:8080').split(':');
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-srss-ops-rules',firestore:{host,port:Number(port),rules:await readFile(new URL('../../firestore.rules',import.meta.url),'utf8')}});});
beforeEach(()=>env.clearFirestore());
after(()=>env.cleanup());
const db=(uid,roles)=>env.authenticatedContext(uid,{roles}).firestore();
test('tutorial read/save only own valid guide progress',async()=>{const d=db('p',['parent']);await assertSucceeds(getDoc(doc(d,'tutorialProgress/p_parent')));await assertSucceeds(setDoc(doc(d,'tutorialProgress/p_parent'),{ownerUid:'p',hub:'parent',version:1,completed:['parent-children'],updatedAt:serverTimestamp()}));await assertFails(getDoc(doc(db('q',['parent']),'tutorialProgress/p_parent')));await assertFails(updateDoc(doc(d,'tutorialProgress/p_parent'),{completed:['admin-start'],updatedAt:serverTimestamp()}));});
test('operations records, release flags and payments reject direct writes',async()=>{const d=db('s',['superAdmin']);for(const path of ['operationsYears/ay2027','operationsYears/ay2027/tasks/school','operationsRelease/current','payments/new','studentFeeAssignments/new','concessions/new'])await assertFails(setDoc(doc(d,path),{resultsOpen:true,ownerUid:'s'}));});
test('retired payment forms cannot be requested or submitted directly',async()=>{const d=db('s',['schoolAdmin']);await assertFails(setDoc(doc(d,'formSubmissions/retired'),{formId:'L05',status:'pending',createdBy:'s'}));});
test('closed results cannot be written even with leadership role',async()=>{await assertFails(setDoc(doc(db('s',['leadership']),'reportCards/new'),{studentId:'a',classId:'c',status:'draft',createdBy:'s'}));});
test('office can create and inspect missing IDs for create-only imports',async()=>{const d=db('s',['schoolAdmin']);await assertSucceeds(getDoc(doc(d,'staff/import-new')));await assertSucceeds(getDoc(doc(d,'students/import-new')));await assertSucceeds(setDoc(doc(d,'students/import-new'),{name:'Import test',status:'active',uid:null,currentClassId:null,currentStandard:null,createdBy:'s',updatedBy:'s',createdAt:serverTimestamp(),updatedAt:serverTimestamp()}));});
