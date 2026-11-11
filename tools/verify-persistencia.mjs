// Proves persistence: data written through the real server survives closing the database and starting a new server process on the same files.
// Usage: node tools/verify-persistencia.mjs   (uses a temporary on-disk PostgreSQL-compatible database; no network)
import assert from 'node:assert/strict';import http from 'node:http';import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {PGlite} from '@electric-sql/pglite';import {createAccounts,hashPassword} from '../backend/accounts.mjs';import {policeCourse} from '../public/learn/content/respuesta-policial.mjs';
const dir=mkdtempSync(join(tmpdir(),'clinicia-persist-'));process.env.HOSPITAL_ISSUER_USERNAME='instructor_demo';
async function boot(){const db=new PGlite(dir);let accounts;const server=http.createServer(async(req,res)=>{const u=new URL(req.url,'http://x');if(!(await accounts.handler(req,res,u))){res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;accounts=await createAccounts({db,origin:base,secure:false,adminName:'instructor_demo',adminHash:await hashPassword('clave-inicial-demo-1')});
 const call=async(cookie,path,body)=>{const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Origin:base,...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,cookie:r.headers.get('set-cookie')?.split(';')[0],json:await r.json().catch(()=>({}))};};
 return {call,stop:async()=>{await new Promise(r=>server.close(r));await db.close();}};}
try{
 // --- first server process
 let s=await boot();
 const login=await s.call(null,'/api/account/login',{username:'instructor_demo',password:'clave-inicial-demo-1'});let teacher=login.cookie;
 const pw=await s.call(teacher,'/api/account/password',{currentPassword:'clave-inicial-demo-1',password:'otra-clave-segura-2'});teacher=pw.cookie||teacher;
 const group=(await s.call(teacher,'/api/account/capacitacion',{action:'create-group',title:'Grupo persistente',autoAccept:true})).json;
 const q=await s.call(null,'/api/account/quick',{name:'Rosa Benítez',accepted:true,joinCode:group.joinCode});assert.equal(q.status,201);const {username}=q.json.user,code=q.json.accessCode,cookie=q.cookie;
 for(const l of policeCourse.lessons.slice(0,4))await s.call(cookie,'/api/account/capacitacion',{action:'read',lessonId:l.id});
 const at=(await s.call(cookie,'/api/account/capacitacion',{action:'start',courseId:'respuesta-policial'})).json;let version=at.version??0;
 const all=policeCourse.lessons.flatMap(l=>l.questions);
 for(let k=0;k<12;k++){const item=all.find(x=>x.id===at.questions[k].id);const r=await s.call(cookie,'/api/account/capacitacion',{action:'save-answer',attemptId:at.id,questionId:item.id,answer:item.answer,version});version=r.json.version;}
 await s.call(cookie,'/api/account/capacitacion',{action:'practice',groupId:group.id,lessonId:'rtpp-3'});
 await s.stop();
 // --- the process is gone; a new one opens the same files
 s=await boot();
 const stillIn=await s.call(cookie,'/api/account/me');assert.equal(stillIn.json.user?.username,username,'la sesión anterior sigue válida tras reiniciar');
 const re=await s.call(null,'/api/account/login',{username,password:code});assert.equal(re.status,200,'el código sigue funcionando tras reiniciar');
 const st=(await s.call(re.cookie,'/api/account/capacitacion')).json;
 assert.equal(st.read.length,4,'lectura conservada');assert.equal(st.groups.find(g=>g.id===group.id)?.status,'accepted','pertenencia al grupo conservada');assert.ok(st.practices.some(p=>p.lesson_id==='rtpp-3'&&p.status==='pending'),'práctica pendiente conservada');
 const resumed=(await s.call(re.cookie,'/api/account/capacitacion',{action:'start',courseId:'respuesta-policial'})).json;assert.equal(Object.keys(resumed.answers).length,12,'las 12 respuestas del examen siguen guardadas');
 const roster=(await s.call(null,'/api/account/login',{username:'instructor_demo',password:'otra-clave-segura-2'}));const rs=(await s.call(roster.cookie,'/api/account/capacitacion',{action:'roster',groupId:group.id})).json;assert.equal(rs.members.length,1);assert.equal(rs.members[0].read_count,4);
 await s.stop();
 console.log('PERSISTENCIA OK: cuenta, código, sesión, lectura, respuestas del examen, grupo y práctica pendiente sobrevivieron al cierre y reinicio del servidor.');
}finally{rmSync(dir,{recursive:true,force:true});}
