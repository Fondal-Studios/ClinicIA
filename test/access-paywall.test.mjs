import test from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';import {PGlite} from '@electric-sql/pglite';
import {createAccounts} from '../backend/accounts.mjs';import {isFreeCourse,isPaidCourse} from '../backend/access.mjs';
test('Alumno es gratis: solo los cursos de certificación son de pago; rotantes, curso policial, refuerzos y minicursos siguen gratis',()=>{
 for(const id of ['respuesta-policial','refuerzo-rcp','refuerzo-hemorragias','refuerzo-radio','evacuacion-escena','rot-cirugia','rot-clinica','rot-ginecologia','rot-pediatria','rot-emergencias','examen-unico','revalida','kine-clinica','enf-medicacion','nut-gapa'])assert.equal(isFreeCourse(id),true,id);
 for(const id of ['acls','pals','fccs','phtls','atls','amls-preparacion','epc-preparacion'])assert.equal(isPaidCourse(id),true,id);
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
  assert.equal((await start('rot-cirugia')).status,200,'rotantes: gratis siempre');
  assert.equal((await start('respuesta-policial')).status,200,'el curso policial sigue gratis');assert.equal((await start('refuerzo-rcp')).status,200,'los refuerzos siguen gratis');
  const g=await group();assert.equal(g.status,402);assert.match(g.json.error,/nivel Instructor/);
  assert.equal((await call(c,'/api/account/classes',{action:'create',title:'x'})).status,402);assert.equal((await call(c,'/api/account/class-ai',{action:'draft',topic:'x'})).status,402);
  const uid=(await db.query("SELECT id FROM clinic_users WHERE username='Persona1'")).rows[0].id;
  const order=async(plan,daysAgo)=>{const id=crypto.randomUUID();await db.query("INSERT INTO clinic_orders(id,user_id,request_key,title,amount_cents,status,valid_until,plan,preference_id) VALUES($1,$2,$3,'t',500,'approved',now()+($4||' days')::interval,$5,'p')",[id,uid,crypto.randomUUID(),String(30-daysAgo),plan]);return id;};
  await order('curso',2);
  assert.equal((await group()).status,402,'comprar un curso no habilita crear grupos');
  const oAlumno=await order('instructor',2);
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
import {createAccessGuard} from '../backend/access.mjs';
test('guard: un curso de pago exige haberlo comprado; Instructor y Profesional se exigen por separado; el administrador nunca se bloquea',async()=>{
 const st={instructor:false,profesional:false,courses:[]};const payments={access:async()=>({instructor:{active:st.instructor||st.profesional},profesional:{active:st.profesional},courses:st.courses})};
 const guard=createAccessGuard({payments,env:{CLINICIA_PAYWALL:'true'}}),user={id:'u',role:'student'};
 await assert.rejects(()=>guard(user,'curso','acls'),e=>e.status===402&&e.plan==='curso');await guard(user,'curso','rot-cirugia');
 st.courses=['acls'];await guard(user,'curso','acls');await assert.rejects(()=>guard(user,'curso','pals'),e=>e.status===402);
 await assert.rejects(()=>guard(user,'instructor'),e=>e.status===402&&/USD 4,99/.test(e.message));await assert.rejects(()=>guard(user,'profesional'),e=>e.status===402&&/USD 9,99/.test(e.message));
 st.profesional=true;await guard(user,'instructor');await guard(user,'profesional');
 st.profesional=false;await guard({id:'a',role:'admin'},'profesional');await createAccessGuard({payments,env:{}})(user,'profesional');
});
test('admin panel: lists accounts, releases and revokes levels without payment, sets modes; only admins; admin accounts are protected',async()=>{
 const db=new PGlite();let accounts;const old=process.env.CLINICIA_PAYWALL;process.env.CLINICIA_PAYWALL='true';
 const server=http.createServer(async(req,res)=>{const url=new URL(req.url,'http://x');if(!(await accounts.handler(req,res,url))){res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;accounts=await createAccounts({db,origin:base,secure:false});
 const call=async(cookie,path,body)=>{const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Origin:base,...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,cookie:r.headers.get('set-cookie')?.split(';')[0],json:await r.json().catch(()=>({}))};};
 try{
  const adm=(await call(null,'/api/account/register',{username:'AdminHosp',password:'clave-segura-123',accepted:true})).cookie;await db.query("UPDATE clinic_users SET role='admin' WHERE username='AdminHosp'");
  const staff=(await call(null,'/api/account/register',{username:'Enfermera_Ana',password:'clave-segura-123',accepted:true})).cookie;
  const staffId=(await db.query("SELECT id FROM clinic_users WHERE username='Enfermera_Ana'")).rows[0].id,admId=(await db.query("SELECT id FROM clinic_users WHERE username='AdminHosp'")).rows[0].id;
  assert.equal((await call(staff,'/api/admin/users')).status,403);assert.equal((await call(staff,'/api/admin/grant',{userId:staffId,plan:'instructor',days:30})).status,403,'una cuenta común no se libera a sí misma');
  const list=await call(adm,'/api/admin/users?q=ana');assert.equal(list.status,200);assert.deepEqual(list.json.users.map(u=>u.username),['Enfermera_Ana']);assert.equal(list.json.users[0].access.instructor.active,false);assert.equal(list.json.total,2);
  assert.equal((await call(staff,'/api/account/capacitacion',{action:'create-group',title:'Hospital'})).status,402,'sin liberar: bloqueado');
  assert.equal((await call(adm,'/api/admin/grant',{userId:staffId,plan:'oro',days:30})).status,400);assert.equal((await call(adm,'/api/admin/grant',{userId:staffId,plan:'instructor',days:99999})).status,400);assert.equal((await call(adm,'/api/admin/grant',{userId:'no-existe',plan:'instructor',days:30})).status,404);
  const g=await call(adm,'/api/admin/grant',{userId:staffId,plan:'instructor',days:90,note:'Hospital'});assert.equal(g.status,200);
  assert.equal((await call(staff,'/api/account/capacitacion',{action:'create-group',title:'Hospital'})).status,200,'liberada: puede crear grupos sin pagar');
  const after=(await call(adm,'/api/admin/users?q=ana')).json.users[0];assert.equal(after.access.instructor.active,true);assert.equal(after.access.profesional.active,false);assert.equal(after.grants[0].note,'Hospital');
  assert.equal((await call(adm,'/api/admin/revoke-grant',{grantId:g.json.id})).status,200);assert.equal((await call(adm,'/api/admin/revoke-grant',{grantId:g.json.id})).status,404);
  assert.equal((await call(staff,'/api/account/capacitacion',{action:'create-group',title:'Otro'})).status,402,'revocada: vuelve a bloquear');
  const m=await call(adm,'/api/admin/user-modes',{userId:staffId,mode:'teacher',enabled:true});assert.equal(m.status,200);assert.ok(m.json.modes.includes('teacher'));assert.equal((await call(adm,'/api/admin/user-modes',{userId:staffId,mode:'teacher',enabled:false})).json.modes.includes('teacher'),false);
  assert.equal((await call(adm,'/api/admin/user-modes',{userId:admId,mode:'teacher',enabled:true})).status,400,'no se tocan cuentas administradoras');assert.equal((await call(adm,'/api/admin/user-modes',{userId:staffId,mode:'admin',enabled:true})).status,400,'nadie se asigna admin por la API');
 }finally{if(old===undefined)delete process.env.CLINICIA_PAYWALL;else process.env.CLINICIA_PAYWALL=old;server.close();await db.close();}
});
