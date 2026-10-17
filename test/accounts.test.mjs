import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {PGlite} from '@electric-sql/pglite';
import {createAccounts,hashPassword,verifyPassword} from '../backend/accounts.mjs';
import {fresh} from '../public/learn/engine.mjs';
test('persistent accounts isolate users, deny privilege escalation, protect sessions and reject stale writes',async()=>{
 const db=new PGlite();const adminHash=await hashPassword('initial-test-password');assert.equal(await verifyPassword('wrong',adminHash),false);
 const api=await createAccounts({db,origin:'http://clinic.test',secure:false,adminName:'TestAdmin',adminHash});
 const server=http.createServer((req,res)=>api.handler(req,res,new URL(req.url,'http://clinic.test')));await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const call=async(path,method='GET',body,cookie='',origin='http://clinic.test')=>{const r=await fetch(base+path,{method,headers:{origin,cookie,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,cookie:r.headers.get('set-cookie')?.split(';')[0],headers:r.headers,body:await r.json()};};
 try{
  const auth={username:'StudentA',password:'a-long-test-password',accepted:true,role:'admin'};
  assert.equal((await call('/api/account/register','POST',auth,'','https://evil.test')).status,403);
  const a=await call('/api/account/register','POST',auth);assert.equal(a.status,201);assert.equal(a.body.user.role,'student');assert.equal(a.body.recoveryCode.length,48);assert.match(a.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
  const b=await call('/api/account/register','POST',{...auth,username:'StudentB'});
  assert.equal((await call('/api/admin/telemetry','GET',null,a.cookie)).status,403);
  assert.equal((await call('/api/account/progress')).status,401);
  assert.equal((await call('/api/account/login','POST',{...auth,password:'incorrect'})).status,401);
  const state=fresh();state.theoryRead['unknown']='sensitive';state.chat='Never save';state.wallet.nickname='Mi tutor';
  const saved=await call('/api/account/progress','PUT',{version:0,payload:{state,chat:'Never save'}},a.cookie);assert.equal(saved.status,200);assert.equal(saved.body.version,1);
  assert.equal((await call('/api/account/progress','PUT',{version:0,payload:{state}},a.cookie)).status,409);
  const result=await call('/api/account/progress','GET',null,a.cookie);assert.equal(result.body.payload.state.wallet.nickname,'Mi tutor');assert.ok(!JSON.stringify(result.body).includes('Never save'));
  assert.equal((await call('/api/account/progress','GET',null,b.cookie)).body.payload,null);
  assert.equal((await call('/api/events','POST',{name:'patient_name',text:'secret'},a.cookie)).status,400);
  assert.equal((await call('/api/events','POST',{name:'practice',text:'secret'},a.cookie)).status,200);
  assert.equal((await call('/api/account/question-report','POST',{questionId:'fake',reason:'incorrect'},a.cookie)).status,400);
  for(let i=0;i<2;i++)assert.equal((await call('/api/account/question-report','POST',{questionId:'eu-pruebas-1',reason:'ambiguous',text:'Never save'},a.cookie)).status,200);
  assert.equal((await db.query('SELECT * FROM clinic_question_reports')).rows.length,1);
  assert.equal((await call('/api/account/checkout','POST',{requestKey:'12345678-1234-1234-1234-123456789012',accepted:true},a.cookie)).status,503);
  const admin=await call('/api/account/login','POST',{username:'TestAdmin',password:'initial-test-password'});assert.equal(admin.status,200);assert.equal(admin.body.user.mustChange,true);assert.equal((await call('/api/admin/telemetry','GET',null,admin.cookie)).status,403);
  const updated=await call('/api/account/password','POST',{currentPassword:'initial-test-password',password:'new-test-password-long'},admin.cookie);assert.equal(updated.status,200);assert.equal((await call('/api/admin/telemetry','GET',null,admin.cookie)).status,401);
  const metrics=await call('/api/admin/telemetry','GET',null,updated.cookie);assert.equal(metrics.status,200);assert.equal(metrics.body.reports[0].question_id,'eu-pruebas-1');assert.equal(metrics.body.paymentsActive,false);assert.equal(Number(metrics.body.counts.accounts),2);assert.equal(metrics.body.events[0].name,'practice');assert.ok(!JSON.stringify(metrics.body).includes('secret'));
  const recovery=await call('/api/account/recover','POST',{username:'StudentA',password:'recovered-long-password',recoveryCode:a.body.recoveryCode});assert.equal(recovery.status,200);assert.equal((await call('/api/account/progress','GET',null,a.cookie)).status,401);
  assert.equal((await call('/api/account/progress','GET',null,recovery.cookie)).body.version,1);
  assert.equal((await call('/api/account/delete','POST',{password:'recovered-long-password'},recovery.cookie)).status,200);
  assert.equal((await db.query('SELECT * FROM clinic_progress WHERE user_id=$1',[a.body.user.id])).rows.length,0);
  assert.equal((await db.query('SELECT * FROM clinic_events WHERE user_id=$1',[a.body.user.id])).rows.length,0);
  // Recreate the API layer against the same database: account and admin password survive service restarts.
  await createAccounts({db,origin:'http://clinic.test',secure:false,adminName:'TestAdmin',adminHash});
  assert.equal((await call('/api/account/login','POST',{username:'TestAdmin',password:'new-test-password-long'})).status,200);
  assert.equal((await call('/api/account/login','POST',{username:'TestAdmin',password:'initial-test-password'})).status,401);
 }finally{await new Promise(r=>server.close(r));await db.close();}
});
