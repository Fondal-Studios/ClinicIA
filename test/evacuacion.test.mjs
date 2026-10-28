import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {schema} from '../backend/accounts.mjs';
import {resolveHospitalIssuer} from '../backend/hospital-issuer.mjs';
import {createCapacitacion,capacitacionSchema} from '../backend/capacitacion.mjs';
import {evacuationCourses} from '../public/learn/content/evacuacion.mjs';
import {trainingSources,trainingLessons} from '../public/learn/content/capacitacion-catalog.mjs';
test('three distinct evacuation courses, twenty explained questions each, valid source and stable IDs',()=>{
 assert.equal(evacuationCourses.length,3);const ids=new Set();
 for(const c of evacuationCourses){assert.equal(c.lessons.length,4);assert.equal(c.lessons.flatMap(l=>l.questions).length,20);
  for(const l of c.lessons){assert.ok(trainingSources[l.source]);assert.ok(l.body.length>200);
   for(const q of l.questions){assert.ok(!ids.has(q.id));ids.add(q.id);assert.equal(new Set(q.options).size,q.options.length);assert.ok(q.options[q.answer]);assert.ok(q.why.length>30);}
  }
 }
 assert.equal(new Set(trainingLessons.map(l=>l.id)).size,trainingLessons.length);
});
test('evacuation reads, persisted 20-question assessment, 16/20 pass, 15/20 fail and theoretical certificate',async()=>{
 const db=new PGlite();await db.exec(schema+capacitacionSchema);const u={id:'learner',username:'Alumno'},admin={id:'admin',username:'Instructor',role:'admin'};
 for(const x of [u,admin])await db.query('INSERT INTO clinic_users(id,username,username_key,password_hash,recovery_hash,role) VALUES($1,$2,$3,$4,$5,$6)',[x.id,x.username,x.username.toLowerCase(),'unused','unused',x.role||'student']);
 const api=createCapacitacion({db,issuerId:admin.id});const call=(x,b)=>api.handle(x,'POST',b);
 try{
 const {id:groupId}=await call(admin,{action:'create-group',title:'Evacuación'});await call(u,{action:'join',groupId});await call(admin,{action:'accept',groupId,userId:u.id});
 for(const c of evacuationCourses){for(const l of c.lessons)await call(u,{action:'read',lessonId:l.id});
  for(const correct of [15,16]){const a=await call(u,{action:'start',courseId:c.id});assert.equal(a.questions.length,20);const qs=c.lessons.flatMap(l=>l.questions);
   for(let i=0;i<20;i++)await call(u,{action:'save-answer',attemptId:a.id,questionId:qs[i].id,answer:i<correct?qs[i].answer:(qs[i].answer+1)%3,version:i});
   const resumed=await createCapacitacion({db,issuerId:admin.id}).handle(u,'POST',{action:'start',courseId:c.id});assert.equal(resumed.id,a.id);assert.equal(Object.keys(resumed.answers).length,20);
   const {result}=await call(u,{action:'submit',attemptId:a.id});assert.equal(result.passed,correct===16);
  }
  await call(admin,{action:'issue',groupId,userId:u.id,courseId:c.id,fullName:'Alumno de prueba',confirm:true});
 }
 const state=await api.handle(u,'GET');assert.equal(state.certificates.length,3);assert.ok(state.certificates.every(c=>c.data.scope.includes('No acredita destrezas')));
 }finally{await db.close();}
});
test('issuer bootstrap requires existing admin and stays bound to ID, never follows username reuse',async()=>{
 const db=new PGlite();await db.exec(schema);
 try{
 await db.query("INSERT INTO clinic_users(id,username,username_key,password_hash,recovery_hash) VALUES('a','NanoGM','nanogm','unused','unused')");
 assert.equal(await resolveHospitalIssuer(db,{issuerId:'',issuerUsername:'NanoGM'}),'');
 await db.query("UPDATE clinic_users SET role='admin' WHERE id='a'");
 assert.equal(await resolveHospitalIssuer(db,{issuerId:'',issuerUsername:'NanoGM'}),'a');
 await db.query("UPDATE clinic_users SET username='Renamed',username_key='renamed' WHERE id='a'");
 assert.equal(await resolveHospitalIssuer(db,{issuerId:'',issuerUsername:'NanoGM'}),'a');
 await db.query("UPDATE clinic_users SET role='student' WHERE id='a'");
 await db.query("INSERT INTO clinic_users(id,username,username_key,password_hash,recovery_hash,role) VALUES('b','NanoGM','nanogm','unused','unused','admin')");
 assert.equal(await resolveHospitalIssuer(db,{issuerId:'',issuerUsername:'NanoGM'}),'');
 assert.equal(await resolveHospitalIssuer(db,{issuerId:'b',issuerUsername:''}),'b');
 }finally{await db.close();}
});
