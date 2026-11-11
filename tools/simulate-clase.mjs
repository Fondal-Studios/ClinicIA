// Simulates the whole class on the real server code and an in-memory PostgreSQL engine: 30 participants enter with a name (quick access),
// join the group, read the 10 modules, take the 50-question exam concurrently (some resume after a lost connection, some fail and retry),
// request the three mandatory practices; the instructor accepts, validates only part of them, and authorises certificates.
// Usage: node tools/simulate-clase.mjs [participants=30]
import assert from 'node:assert/strict';import http from 'node:http';import {PGlite} from '@electric-sql/pglite';
import {createAccounts,hashPassword} from '../backend/accounts.mjs';
import {policeCourse} from '../public/learn/content/respuesta-policial.mjs';
const N=Number(process.argv[2]||30);process.env.HOSPITAL_ISSUER_USERNAME='instructor_demo';
const db=new PGlite();let accounts;
const server=http.createServer(async(req,res)=>{const url=new URL(req.url,'http://x');if(!(await accounts.handler(req,res,url))){res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
accounts=await createAccounts({db,origin:base,secure:false,adminName:'instructor_demo',adminHash:await hashPassword('clave-inicial-demo-1')});
const lat=[];let calls=0;
const call=async(cookie,path,body)=>{const t=performance.now();const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Origin:base,...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});const j=await r.json().catch(()=>({}));lat.push(performance.now()-t);calls++;return {status:r.status,cookie:r.headers.get('set-cookie')?.split(';')[0],json:j};};
const ok=(r,msg)=>{if(r.status>=300)throw new Error(msg+': '+r.status+' '+JSON.stringify(r.json));return r;};
const q=policeCourse.lessons.flatMap(l=>l.questions),required=policeCourse.lessons.filter(l=>l.simulation.required).map(l=>l.id);
try{
 // instructor: activate the initial account, create the class group with automatic acceptance
 const login=ok(await call(null,'/api/account/login',{username:'instructor_demo',password:'clave-inicial-demo-1'}),'login instructor');let teacher=login.cookie;
 const pw=ok(await call(teacher,'/api/account/password',{currentPassword:'clave-inicial-demo-1',password:'otra-clave-segura-2'}),'cambio de clave');teacher=pw.cookie||teacher;
 const group=ok(await call(teacher,'/api/account/capacitacion',{action:'create-group',title:'Policía · clase simulada',autoAccept:true}),'crear grupo').json;
 const t0=performance.now();
 // 1) everyone enters at once with a name and the class code
 const names=Array.from({length:N},(_,i)=>['Juan','Ana','Luis','Marta','Pedro','Sofía','Diego','Lucía','Hugo','Rita'][i%10]+' '+['Pérez','Gómez','Díaz','Ruiz','Sosa','Vega'][i%6]);
 const people=await Promise.all(names.map(async(name)=>{const r=ok(await call(null,'/api/account/quick',{name,accepted:true,joinCode:group.joinCode}),'acceso rápido '+name);return {name,cookie:r.cookie,code:r.json.accessCode,username:r.json.user.username,id:r.json.user.id,joined:r.json.group?.accepted};}));
 assert.ok(people.every(p=>p.joined),'todos quedan aceptados automáticamente');assert.equal(new Set(people.map(p=>p.username)).size,N);
 const tEnter=performance.now()-t0;
 // 2) read all modules
 await Promise.all(people.map(async p=>{for(const l of policeCourse.lessons)ok(await call(p.cookie,'/api/account/capacitacion',{action:'read',lessonId:l.id}),'leer');}));
 // 3) exam: ability varies; participant #7 loses connection halfway and resumes; the last 4 fail the first time and retry
 const skill=i=>i>=N-4?0.62:0.88-(i%5)*0.02;let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 async function takeExam(p,i,ability){
  let at=ok(await call(p.cookie,'/api/account/capacitacion',{action:'start',courseId:'respuesta-policial'}),'iniciar examen').json;assert.equal(at.questions.length,50);let version=at.version??0;
  for(let k=0;k<50;k++){
   if(i===7&&k===25){at=ok(await call(p.cookie,'/api/account/capacitacion',{action:'start',courseId:'respuesta-policial'}),'retomar').json;assert.equal(Object.keys(at.answers).length,25,'el intento retoma las 25 respuestas guardadas');version=at.version;}
   const item=q.find(x=>x.id===at.questions[k].id),right=rnd()<ability,answer=right?item.answer:(item.answer+1+Math.floor(rnd()*4))%5;
   const r=ok(await call(p.cookie,'/api/account/capacitacion',{action:'save-answer',attemptId:at.id,questionId:item.id,answer,version}),'guardar respuesta');version=r.json.version;
  }
  return ok(await call(p.cookie,'/api/account/capacitacion',{action:'submit',attemptId:at.id}),'entregar').json.result;
 }
 const tExam0=performance.now();const results=await Promise.all(people.map((p,i)=>takeExam(p,i,skill(i))));const tExam=performance.now()-tExam0;
 const failed=people.filter((_,i)=>!results[i].passed);
 for(const p of failed){const again=await takeExam(p,-1,0.95);assert.ok(again.passed,'el reintento aprueba');p.retried=true;}
 // a later failing attempt never removes an earlier approval
 const p0=people.find(p=>!p.retried);const bad=await takeExam(p0,-1,0.1);assert.equal(bad.passed,false);const st=(await call(p0.cookie,'/api/account/capacitacion')).json;assert.ok(st.attempts.some(a=>a.result?.passed),'la aprobación previa se conserva');
 // 4) practices: everyone marks the three as done; two observers validate about 45%
 await Promise.all(people.map(async p=>{for(const id of required)ok(await call(p.cookie,'/api/account/capacitacion',{action:'practice',groupId:group.id,lessonId:id}),'practicar');}));
 let validated=0;const roster0=ok(await call(teacher,'/api/account/capacitacion',{action:'roster',groupId:group.id}),'lista').json;assert.equal(roster0.members.length,N);assert.equal(roster0.practices.filter(x=>x.status==='pending').length,N*3);
 for(const [i,p] of people.entries()){for(const id of required){if((i*3+required.indexOf(id))%20<9){const lesson=policeCourse.lessons.find(l=>l.id===id);ok(await call(teacher,'/api/account/capacitacion',{action:'review',groupId:group.id,userId:p.id,lessonId:id,status:'approved',criteria:lesson.simulation.checklist.map(()=>true),feedback:'Observada en clase.'}),'validar');validated++;}}}
 // 5) certificates only for those who have everything; the rest are refused
 let issued=0,refused=0;for(const p of people){const r=await call(teacher,'/api/account/capacitacion',{action:'issue',groupId:group.id,userId:p.id,courseId:'respuesta-policial',fullName:p.name+' (simulación)',confirm:true});if(r.status===200)issued++;else{refused++;assert.equal(r.status,409);}}
 const roster=ok(await call(teacher,'/api/account/capacitacion',{action:'roster',groupId:group.id}),'lista final').json;
 lat.sort((a,b)=>a-b);const p=x=>lat[Math.floor(lat.length*x)].toFixed(0);
 console.log(`SIMULACIÓN OK · ${N} participantes`);
 console.log(`  ingreso simultáneo: ${(tEnter/1000).toFixed(1)} s · todos aceptados automáticamente, ${N} usuarios únicos con código`);
 console.log(`  examen simultáneo de ${N} personas (50 preguntas cada una): ${(tExam/1000).toFixed(1)} s · desaprobaron al primer intento: ${failed.length} (todos aprobaron al reintentar) · uno retomó tras perder la conexión`);
 console.log(`  prácticas pedidas: ${N*3} · validadas en clase (simulado ~45%): ${validated} · pendientes: ${N*3-validated}`);
 console.log(`  certificados autorizados: ${issued} · rechazados por requisitos pendientes: ${refused}`);
 console.log(`  solicitudes al servidor: ${calls} · latencia p50 ${p(0.5)} ms, p95 ${p(0.95)} ms, máx ${p(0.999)} ms`);
 console.log(`  panel del instructor: ${roster.members.length} participantes, ${roster.members.filter(m=>(m.attempts||[]).some(a=>a.result?.passed)).length} con examen aprobado`);
}finally{server.close();await db.close();}
