import test from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';import {PGlite} from '@electric-sql/pglite';
import {createAccounts} from '../backend/accounts.mjs';
test('class access: quick accounts with a short code, automatic or bulk acceptance, and instructor-only control',async()=>{
 const db=new PGlite();let accounts;
 const server=http.createServer(async(req,res)=>{const url=new URL(req.url,'http://x');if(!(await accounts.handler(req,res,url))){res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;accounts=await createAccounts({db,origin:base,secure:false});
 const call=async(cookie,path,body)=>{const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Origin:base,...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,cookie:r.headers.get('set-cookie')?.split(';')[0],json:await r.json().catch(()=>({}))};};
 try{
  // instructor: ordinary account promoted to teacher mode
  const reg=await call(null,'/api/account/register',{username:'Instructor1',password:'clave-segura-123',accepted:true});const teacher=reg.cookie;await db.query("UPDATE clinic_users SET modes='student,teacher' WHERE username='Instructor1'");
  const created=await call(teacher,'/api/account/capacitacion',{action:'create-group',title:'Policía · clase',autoAccept:true});assert.equal(created.status,200);assert.equal(created.json.autoAccept,true);const {id:groupId,joinCode}=created.json;
  // validation of input and consent
  assert.equal((await call(null,'/api/account/quick',{name:'A',accepted:true})).status,400);assert.equal((await call(null,'/api/account/quick',{name:'Juan Pérez'})).status,400);
  // quick access: real account, short code, session cookie, group joined and accepted at once
  const a=await call(null,'/api/account/quick',{name:'Juan Pérez',accepted:true,joinCode});assert.equal(a.status,201);assert.match(a.json.accessCode,/^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);assert.match(a.json.user.username,/^Juan_Perez_[A-HJ-NP-Z2-9]{3}$/);assert.equal(a.json.group.accepted,true);
  const b=await call(null,'/api/account/quick',{name:'Juan Pérez',accepted:true,joinCode});assert.notEqual(b.json.user.username,a.json.user.username);
  assert.equal((await call(a.cookie,'/api/account/me')).json.user.username,a.json.user.username);
  // the code works as a password from another phone, and a wrong code does not
  const relog=await call(null,'/api/account/login',{username:a.json.user.username,password:a.json.accessCode});assert.equal(relog.status,200);assert.equal((await call(null,'/api/account/login',{username:a.json.user.username,password:'AAAA-AAAA'})).status,401);
  const state=await call(a.cookie,'/api/account/capacitacion');assert.equal(state.json.groups.find(g=>g.id===groupId).status,'accepted');
  // wrong group code does not break account creation
  const c=await call(null,'/api/account/quick',{name:'Ana Gómez',accepted:true,joinCode:'ZZZZZZZZZZZZ'});assert.equal(c.status,201);assert.ok(c.json.group.error);
  // without auto-accept requests wait; the owner accepts everyone at once; others cannot
  assert.equal((await call(teacher,'/api/account/capacitacion',{action:'set-auto',groupId,autoAccept:false})).json.autoAccept,false);
  const d=await call(null,'/api/account/quick',{name:'Luis Díaz',accepted:true,joinCode}),e=await call(null,'/api/account/quick',{name:'Marta Ruiz',accepted:true,joinCode});assert.equal(d.json.group.requested,true);
  assert.equal((await call(d.cookie,'/api/account/capacitacion',{action:'accept-all',groupId})).status,403);assert.equal((await call(d.cookie,'/api/account/capacitacion',{action:'set-auto',groupId,autoAccept:true})).status,403);
  let roster=await call(teacher,'/api/account/capacitacion',{action:'roster',groupId});assert.equal(roster.json.members.filter(m=>m.status==='pending').length,2);assert.equal(roster.json.autoAccept,false);
  assert.equal((await call(teacher,'/api/account/capacitacion',{action:'accept-all',groupId})).json.accepted,2);
  roster=await call(teacher,'/api/account/capacitacion',{action:'roster',groupId});assert.equal(roster.json.members.length,4);assert.ok(roster.json.members.every(m=>m.status==='accepted'));
  // a student cannot read another group's roster
  assert.equal((await call(a.cookie,'/api/account/capacitacion',{action:'roster',groupId})).status,403);
 }finally{server.close();await db.close();}
});

test('a classroom sharing one IP can re-enter with codes more than 40 times in 15 minutes, while each account stays rate-limited',async()=>{
 const db=new PGlite();let accounts;
 const server=http.createServer(async(req,res)=>{const url=new URL(req.url,'http://x');if(!(await accounts.handler(req,res,url))){res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;accounts=await createAccounts({db,origin:base,secure:false});
 try{
  const login=async u=>(await fetch(base+'/api/account/login',{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({username:u,password:'XXXX-XXXX'})})).status;
  const statuses=[];for(let i=0;i<60;i++)statuses.push(await login('alumno_'+i));
  assert.ok(!statuses.includes(429),'no lockout across 60 different people on one IP');
  const same=[];for(let i=0;i<12;i++)same.push(await login('alumno_objetivo'));
  assert.ok(same.includes(429),'repeated guesses on a single account are still blocked');
 }finally{server.close();}
});

test('health endpoint reports whether accounts are configured and which commit runs, without secrets',async()=>{
 const {server}=await import('../server.mjs');await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{const r=await fetch('http://127.0.0.1:'+server.address().port+'/api/health');const j=await r.json();assert.equal(r.status,200);assert.equal(j.ok,true);assert.equal(typeof j.accountsConfigured,'boolean');assert.deepEqual(Object.keys(j).sort(),['accountsConfigured','commit','ok']);}
 finally{server.close();}
});

test('static assets are served gzip-compressed and revalidate with ETag for slow phone networks',async()=>{
 const {server}=await import('../server.mjs');await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 try{
  const plain=await fetch(base+'/learn/courses.mjs',{headers:{'Accept-Encoding':'identity'}});const raw=(await plain.arrayBuffer()).byteLength;assert.equal(plain.headers.get('content-encoding'),null);
  const {request}=await import('node:http');
  const gz=await new Promise((res,rej)=>request(base+'/learn/courses.mjs',{headers:{'Accept-Encoding':'gzip'}},r=>{const c=[];r.on('data',d=>c.push(d));r.on('end',()=>res({h:r.headers,n:Buffer.concat(c).length}));}).on('error',rej).end());
  assert.equal(gz.h['content-encoding'],'gzip');assert.ok(gz.n<raw/3,`gzip ${gz.n} vs ${raw}`);
  const etag=gz.h.etag;assert.ok(etag);const again=await fetch(base+'/learn/courses.mjs',{headers:{'If-None-Match':etag}});assert.equal(again.status,304);
 }finally{server.close();}
});
