import test from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';import {PGlite} from '@electric-sql/pglite';
import {createAccounts} from '../backend/accounts.mjs';import {isFreeCourse} from '../backend/access.mjs';
test('free vs paid policy: refuerzos, minicursos and the police course are free; rotations need the alumno level',()=>{
 for(const id of ['respuesta-policial','refuerzo-rcp','refuerzo-hemorragias','refuerzo-radio','evacuacion-escena'])assert.equal(isFreeCourse(id),true,id);
 for(const id of ['rot-cirugia','rot-clinica','inexistente'])assert.equal(isFreeCourse(id),false,id);
});
test('paywall is off by default and, when on, blocks paid features server-side until the level is active; withdrawals within 10 days',async()=>{
 const db=new PGlite();let accounts;const old=process.env.CLINICIA_PAYWALL;delete process.env.CLINICIA_PAYWALL;
 const server=http.createServer(async(req,res)=>{const url=new URL(req.url,'http://x');if(!(await accounts.handler(req,res,url))){res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;accounts=await createAccounts({db,origin:base,secure:false});
 const call=async(cookie,path,body)=>{const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Origin:base,...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,cookie:r.headers.get('set-cookie')?.split(';')[0],json:await r.json().catch(()=>({}))};};
 try{
  const reg=await call(null,'/api/account/register',{username:'Persona1',password:'clave-segura-123',accepted:true});const c=reg.cookie;
  const start=id=>call(c,'/api/account/capacitacion',{action:'start',courseId:id}),group=()=>call(c,'/api/account/capacitacion',{action:'create-group',title:'Mi grupo'});
  assert.equal((await start('rot-cirugia')).status,200,'piloto: todo abierto con el bloqueo apagado');assert.equal((await group()).status,200);
  process.env.CLINICIA_PAYWALL='true';
  const blocked=await start('rot-cirugia');assert.equal(blocked.status,402);assert.match(blocked.json.error,/Acceso alumno/);
  assert.equal((await start('respuesta-policial')).status,200,'el curso policial sigue gratis');assert.equal((await start('refuerzo-rcp')).status,200,'los refuerzos siguen gratis');
  const g=await group();assert.equal(g.status,402);assert.match(g.json.error,/Acceso instructor/);
  assert.equal((await call(c,'/api/account/classes',{action:'create',title:'x'})).status,402);assert.equal((await call(c,'/api/account/class-ai',{action:'draft',topic:'x'})).status,402);
  const uid=(await db.query("SELECT id FROM clinic_users WHERE username='Persona1'")).rows[0].id;
  const order=async(plan,daysAgo)=>{const id=crypto.randomUUID();await db.query("INSERT INTO clinic_orders(id,user_id,request_key,title,amount_cents,status,valid_until,plan,preference_id) VALUES($1,$2,$3,'t',500,'approved',now()+($4||' days')::interval,$5,'p')",[id,uid,crypto.randomUUID(),String(30-daysAgo),plan]);return id;};
  const oAlumno=await order('alumno',2);
  assert.equal((await start('rot-cirugia')).status,200,'con acceso alumno vigente se abre');assert.equal((await group()).status,402,'alumno no crea grupos');
  const wd=await call(c,'/api/account/withdrawal',{orderId:oAlumno,reason:'Me arrepentí'});assert.equal(wd.status,200);assert.equal(wd.json.status,'received');assert.equal(wd.json.repeated,false);
  assert.equal((await call(c,'/api/account/withdrawal',{orderId:oAlumno})).json.repeated,true,'idempotente');
  const oOld=await order('instructor',15);assert.equal((await call(c,'/api/account/withdrawal',{orderId:oOld})).status,409,'fuera de plazo de 10 días');
  assert.equal((await group()).status,200,'con acceso instructor vigente se pueden crear grupos');
  assert.equal((await call(c,'/api/account/withdrawal',{orderId:crypto.randomUUID()})).status,404);
  const other=await call(null,'/api/account/register',{username:'Persona2',password:'clave-segura-123',accepted:true});assert.equal((await call(other.cookie,'/api/account/withdrawal',{orderId:oAlumno})).status,404,'no se puede revocar la compra de otro');
  assert.equal((await call(c,'/api/admin/withdrawals')).status,403,'solo administración ve los pedidos');
  await db.query("UPDATE clinic_users SET role='admin' WHERE username='Persona1'");const list=await call(c,'/api/admin/withdrawals');assert.equal(list.status,200);assert.equal(list.json.withdrawals.length,1);
 }finally{if(old===undefined)delete process.env.CLINICIA_PAYWALL;else process.env.CLINICIA_PAYWALL=old;server.close();await db.close();}
});
