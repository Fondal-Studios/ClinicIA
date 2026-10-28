import test from 'node:test';import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {schema} from '../backend/accounts.mjs';
import {createCapacitacion,capacitacionSchema} from '../backend/capacitacion.mjs';
import {policeCourse} from '../public/learn/content/respuesta-policial.mjs';
test('persistent training: groups, isolation, resumable grading, practices and exclusive idempotent certificates',async()=>{
 const db=new PGlite();await db.exec(schema+capacitacionSchema);
 const student={id:'s',username:'Alumno',role:'student'},teacher={id:'t',username:'Instructor',modes:'teacher'},other={id:'o',username:'Otro',modes:'teacher'},issuer={id:'i',username:'Mariano',role:'admin'};
 for(const u of [student,teacher,other,issuer])await db.query('INSERT INTO clinic_users(id,username,username_key,password_hash,recovery_hash,role,modes) VALUES($1,$2,$3,$4,$5,$6,$7)',[u.id,u.username,u.username.toLowerCase(),'unused','unused',u.role||'student',u.modes||'student']);
 let api=createCapacitacion({db,issuerId:issuer.id});const call=(u,b)=>api.handle(u,'POST',b);const reject=async(u,b,code)=>assert.rejects(call(u,b),e=>e.status===code);
 try{
  await reject(student,{action:'create-group',title:'Policía'},403);
  const {id:groupId}=await call(teacher,{action:'create-group',title:'Policía Cafayate'});
  await call(student,{action:'join',groupId});await reject(other,{action:'accept',groupId,userId:'s'},403);
  await call(teacher,{action:'accept',groupId,userId:'s'});
  await reject(other,{action:'roster',groupId},403);
  for(const l of policeCourse.lessons)await call(student,{action:'read',lessonId:l.id});
  let e=await call(student,{action:'start',courseId:'respuesta-policial'});assert.equal(e.questions.length,50);assert.ok(e.questions.every(q=>!('answer' in q)&&!('why' in q)));
  assert.equal((await call(student,{action:'start',courseId:'respuesta-policial'})).id,e.id);
  await reject(other,{action:'save-answer',attemptId:e.id,questionId:e.questions[0].id,answer:0,version:0},404);
  await reject(student,{action:'submit',attemptId:e.id},400);
  const qs=policeCourse.lessons.flatMap(l=>l.questions);
  for(let i=0;i<qs.length;i++){const q=qs[i];const r=await call(student,{action:'save-answer',attemptId:e.id,questionId:q.id,answer:i<40?q.answer:(q.answer+1)%5,version:i});assert.equal(r.version,i+1);}
  await reject(student,{action:'save-answer',attemptId:e.id,questionId:qs[0].id,answer:0,version:0},409);
  api=createCapacitacion({db,issuerId:issuer.id});const resumed=await call(student,{action:'start',courseId:'respuesta-policial'});assert.equal(Object.keys(resumed.answers).length,50);
  const r=await call(student,{action:'submit',attemptId:e.id});assert.equal(r.result.correct,40);assert.equal(r.result.passed,true);
  const issue={action:'issue',groupId,userId:'s',courseId:'respuesta-policial',fullName:'Alumno de prueba',confirm:true};
  await reject(teacher,issue,403);await reject(issuer,issue,409);
  for(const l of policeCourse.lessons.filter(l=>l.simulation.required)){
   await call(student,{action:'practice',groupId,lessonId:l.id});
   const review={action:'review',groupId,userId:'s',lessonId:l.id,status:'approved',criteria:[true,true,true,true]};
   await reject(student,review,403);await reject(other,review,403);await reject(teacher,{...review,criteria:[true,false,true,true]},400);
   await call(teacher,review);await call(student,{action:'practice',groupId,lessonId:l.id});
  }
  await call(issuer,issue);await call(issuer,issue);
  const s=await api.handle(student,'GET');assert.equal(s.certificates.length,1);assert.equal(s.practices.filter(p=>p.status==='approved').length,3);
  assert.equal((await api.handle(other,'GET')).certificates.length,0);
  await assert.rejects(createCapacitacion({db,issuerId:''}).handle(issuer,'POST',issue),e=>e.status===403);
  const retry=await call(student,{action:'start',courseId:'respuesta-policial'});assert.notEqual(retry.id,e.id);
  for(let i=0;i<qs.length;i++)await call(student,{action:'save-answer',attemptId:retry.id,questionId:qs[i].id,answer:(qs[i].answer+1)%5,version:i});
  assert.equal((await call(student,{action:'submit',attemptId:retry.id})).result.passed,false);
  assert.ok((await api.handle(student,'GET')).attempts.some(a=>a.result?.passed));
 }finally{await db.close();}
});
