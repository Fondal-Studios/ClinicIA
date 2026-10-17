import test from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';import {PGlite} from '@electric-sql/pglite';
import {createAccounts} from '../backend/accounts.mjs';import {guardiaCourses} from '../public/learn/content/guardia.mjs';import {cases} from '../public/learn/cases.mjs';
test('guardia assessments are server graded, isolated and preserve approval; rooms enforce membership, hidden votes, roles and expiry',async()=>{
 const db=new PGlite(),api=await createAccounts({db,origin:'http://clinic.test',secure:false});const server=http.createServer((req,res)=>api.handler(req,res,new URL(req.url,'http://clinic.test')));await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 async function call(path,body,cookie){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{origin:'http://clinic.test',cookie:cookie||'','content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};}
 try{
  const users=[];for(let i=0;i<5;i++)users.push(await call('/api/account/register',{username:'Guard'+i,password:'test-password-long',accepted:true}));const [a,b,c]=users;
  assert.equal((await call('/api/account/rooms')).status,401);
  const course=guardiaCourses[0],lesson=course.lessons[0],start={action:'start',courseId:course.id,lessonId:lesson.id,accepted:true};
  assert.equal((await call('/api/account/training',{...start,accepted:false},a.cookie)).status,400);
  let attempt=(await call('/api/account/training',start,a.cookie)).body;assert.equal(attempt.questions.length,3);assert.ok(attempt.questions.every(q=>!Object.hasOwn(q,'answer')&&!Object.hasOwn(q,'why')));
  const answers=attempt.questions.map(q=>q.options.indexOf(lesson.questions.find(x=>x.id===q.id).options[0]));
  assert.equal((await call('/api/account/training',{action:'submit',id:attempt.id,answers},b.cookie)).status,404);
  assert.equal((await call('/api/account/training',{action:'submit',id:attempt.id,answers:[0]},a.cookie)).status,400);
  const pass=(await call('/api/account/training',{action:'submit',id:attempt.id,answers},a.cookie)).body;assert.equal(pass.passed,true);
  assert.deepEqual((await call('/api/account/training',{action:'submit',id:attempt.id,answers:[0,0,0]},a.cookie)).body,pass);
  attempt=(await call('/api/account/training',start,a.cookie)).body;const wrong=attempt.questions.map(q=>(q.options.indexOf(lesson.questions.find(x=>x.id===q.id).options[0])+1)%5);assert.equal((await call('/api/account/training',{action:'submit',id:attempt.id,answers:wrong},a.cookie)).body.passed,false);
  assert.equal((await call('/api/account/training',null,a.cookie)).body.approved.length,1);assert.equal((await call('/api/account/training',null,b.cookie)).body.attempts.length,0);
  assert.equal((await call('/api/admin/training',null,a.cookie)).status,403);await db.query("UPDATE clinic_users SET role='admin' WHERE id=$1",[c.body.user.id]);const roster=(await call('/api/admin/training',null,c.cookie)).body;assert.equal(roster.rows[0].approved,true);assert.equal(roster.rows[0].result.passed,false);
  const scenario=cases.find(x=>x.courseId==='guardia-medica');let r=(await call('/api/account/rooms',{caseId:scenario.id,mode:'coop',accepted:true},a.cookie)).body;const path='/api/account/rooms/'+r.code;
  assert.equal((await call(path,null,b.cookie)).status,403);assert.equal((await call(path,{action:'start',version:r.version},a.cookie)).status,409);
  r=(await call(path,{action:'join',accepted:true},b.cookie)).body;assert.equal((await call(path,{action:'start',version:r.version},b.cookie)).status,403);
  r=(await call(path,{action:'start',version:r.version},a.cookie)).body;assert.equal(r.phase,'vote');assert.equal(r.feedback,null);
  assert.equal((await call(path,{action:'chat',version:r.version,text:'prematuro'},a.cookie)).status,409);assert.equal((await call(path,{action:'join',accepted:true},c.cookie)).status,409);
  for(let step=0;step<scenario.steps.length;step++){
   const correct=r.question.options.find(o=>o.text===scenario.steps[step].options[0]).index,version=r.version;
   r=(await call(path,{action:'vote',version,choice:correct},a.cookie)).body;
   assert.ok(r.members.every(m=>m.choice===null));assert.equal(r.feedback,null);
   assert.equal((await call(path,{action:'vote',version,choice:correct},b.cookie)).status,409);
   assert.equal((await call(path,{action:'vote',version:r.version,choice:correct},a.cookie)).status,409);
   r=(await call(path,{action:'vote',version:r.version,choice:correct},b.cookie)).body;assert.equal(r.phase,'discussion');assert.equal(r.feedback,null);
   r=(await call(path,{action:'chat',version:r.version,text:'<script>not executable</script>'},b.cookie)).body;assert.equal(r.messages.length,step+1);
   assert.equal((await call(path,{action:'consensus',version:r.version,choice:correct},b.cookie)).status,403);
   r=(await call(path,{action:'consensus',version:r.version,choice:correct},a.cookie)).body;assert.equal(r.phase,'feedback');assert.equal(r.feedback.correct,scenario.steps[step].options[0]);
   r=(await call(path,{action:'next',version:r.version},a.cookie)).body;
  }
  assert.equal(r.phase,'finished');assert.equal(r.teamScore,3);assert.ok(r.members.every(m=>m.score===3));
  let v=(await call('/api/account/rooms',{caseId:scenario.id,mode:'versus',accepted:true},a.cookie)).body;const vp='/api/account/rooms/'+v.code;v=(await call(vp,{action:'join',accepted:true},b.cookie)).body;v=(await call(vp,{action:'start',version:v.version},a.cookie)).body;v=(await call(vp,{action:'vote',version:v.version,choice:0},a.cookie)).body;v=(await call(vp,{action:'vote',version:v.version,choice:1},b.cookie)).body;assert.equal(v.phase,'feedback');
  let cap=(await call('/api/account/rooms',{caseId:scenario.id,mode:'coop',accepted:true},a.cookie)).body;for(const x of users.slice(1,4))assert.equal((await call('/api/account/rooms/'+cap.code,{action:'join',accepted:true},x.cookie)).status,200);assert.equal((await call('/api/account/rooms/'+cap.code,{action:'join',accepted:true},users[4].cookie)).status,409);
  await db.query("UPDATE clinic_rooms SET expires_at=now()-interval '1 second' WHERE code=$1",[cap.code]);assert.equal((await call('/api/account/rooms/'+cap.code,null,a.cookie)).status,404);
  const exported=(await call('/api/account/export',null,b.cookie)).body;assert.equal(exported.training.attempts.length,0);assert.equal(exported.roomMessages[0].messages.length,3);
  assert.equal((await call('/api/account/delete',{password:'test-password-long'},b.cookie)).status,200);assert.equal((await call(path,null,a.cookie)).status,404);
 }finally{await new Promise(r=>server.close(r));await db.close();}
});
