import test from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';import {PGlite} from '@electric-sql/pglite';
import {createAccounts,modesOf} from '../backend/accounts.mjs';import {search,facets,canUseLibrary} from '../backend/library.mjs';
test('modes: everyone studies, teacher and institution are opt-in, admin is never self-assigned',()=>{
 assert.deepEqual(modesOf({role:'student',modes:'student'}),['student']);assert.deepEqual(modesOf({role:'student',modes:'student,teacher,admin,bogus'}),['student','teacher']);
 assert.deepEqual(modesOf({role:'admin',modes:'student'}),['student','admin']);assert.equal(canUseLibrary({role:'student',modes:'student'}),false);assert.equal(canUseLibrary({role:'student',modes:'student,teacher'}),true);assert.equal(canUseLibrary({role:'admin',modes:'student'}),true);
});
test('library searches the whole bank for teachers only and exposes answers with their source',()=>{
 const teacher={role:'student',modes:'student,teacher'};assert.throws(()=>search({role:'student',modes:'student'},{}),e=>e.status===403);
 const f=facets();assert.ok(f.totalQuestions>=678&&f.courses.length>=12);
 const all=search(teacher,{});assert.equal(all.total,f.totalQuestions);assert.equal(all.items.length,30);assert.ok(all.items[0].options.length===5&&Number.isInteger(all.items[0].answer)&&all.items[0].why);
 const acls=search(teacher,{course:'acls'});assert.ok(acls.total>=24&&acls.items.every(i=>i.course==='acls'));
 const hit=search(teacher,{q:'vía aérea'});assert.ok(hit.total>0&&hit.items.every(i=>{const t=(i.prompt+i.options.join(' ')+i.why).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();return t.includes('via')&&t.includes('aerea');}));
 assert.equal(search(teacher,{q:'zzzzqqq'}).total,0);const th=search(teacher,{type:'theory',course:'acls'});assert.ok(th.items.length>0&&th.items[0].body);assert.throws(()=>search(teacher,{type:'x'}),e=>e.status===400);
});
test('modes and library endpoints: teacher mode must be enabled with consent, then the library opens',async()=>{
 const db=new PGlite(),root={};let accounts;
 const server=http.createServer(async(req,res)=>{const url=new URL(req.url,'http://x');if(!(await accounts.handler(req,res,url))){res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;accounts=await createAccounts({db,origin:base,secure:false});
 try{
  const reg=await fetch(base+'/api/account/register',{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({username:'Profe1',password:'clave-segura-123',accepted:true})});assert.equal(reg.status,201);
  const cookie=reg.headers.get('set-cookie').split(';')[0],call=(path,body)=>fetch(base+path,{method:body?'POST':'GET',headers:{Cookie:cookie,Origin:base,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
  assert.deepEqual((await (await call('/api/account/me')).json()).user.modes,['student']);
  assert.equal((await call('/api/account/library?facets=1')).status,403);assert.equal((await call('/api/account/library')).status,403);
  assert.equal((await call('/api/account/modes',{mode:'teacher'})).status,400);assert.equal((await call('/api/account/modes',{mode:'admin',accepted:true})).status,400);
  const on=await (await call('/api/account/modes',{mode:'teacher',accepted:true})).json();assert.deepEqual(on.user.modes,['student','teacher']);
  const lib=await (await call('/api/account/library?course=acls&q=ritmo')).json();assert.ok(lib.total>0&&lib.items[0].answer!==undefined);assert.ok((await (await call('/api/account/library?facets=1')).json()).courses.length>=12);
  assert.equal((await fetch(base+'/api/account/library')).status,401);
 }finally{server.close();await db.close();}
});
