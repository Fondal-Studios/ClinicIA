// Browser check of the class day: three doors, instructor creates the group and shares the link, a participant enters with a name only,
// gets a code, the instructor sees them, and the participant can come back from another phone with the code. 390 px, no page errors.
// Run with PLAYWRIGHT_MODULE and CHROME_BIN when the browser is not installed globally.
import assert from 'node:assert/strict';import http from 'node:http';
import {PGlite} from '@electric-sql/pglite';import {createAccounts,hashPassword} from '../backend/accounts.mjs';import {server as assets} from '../server.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');process.env.HOSPITAL_ISSUER_USERNAME='instructor_demo';
const db=new PGlite();let accounts;
const server=http.createServer((req,res)=>{const u=new URL(req.url,origin);(u.pathname.startsWith('/api/account')||u.pathname==='/api/v'||u.pathname.startsWith('/api/admin'))?accounts.handler(req,res,u):assets.emit('request',req,res);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
accounts=await createAccounts({db,origin,secure:false,adminName:'instructor_demo',adminHash:await hashPassword('clave-inicial-demo-1')});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const errors=[],noScroll=p=>p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);
const ctx=async()=>{const c=await browser.newContext({viewport:{width:390,height:844}}),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());return {c,p};};
try{
 // the three doors, on the home and on the training entry
 const home=await ctx();await home.p.goto(origin+'/');await home.p.getByRole('heading',{name:'¿Cómo vas a entrar?'}).waitFor();
 for(const t of ['Primeros respondedores','Médicos','Instructores'])assert.ok(await home.p.getByRole('heading',{name:t,exact:true}).count()>=1,'home door '+t);assert.ok(await noScroll(home.p));await home.p.screenshot({path:'/tmp/clase-home.png',fullPage:true});
 await home.p.goto(origin+'/capacitacion.html');await home.p.getByRole('heading',{name:'¿Cómo vas a entrar?'}).waitFor();for(const t of ['Primeros respondedores','Médicos','Instructores'])await home.p.getByRole('heading',{name:t,exact:true}).waitFor();await home.p.screenshot({path:'/tmp/clase-doors.png',fullPage:true});
 // instructor
 const ins=await ctx();let r=await ins.c.request.post(origin+'/api/account/login',{headers:{Origin:origin},data:{username:'instructor_demo',password:'clave-inicial-demo-1'}});assert.equal(r.status(),200);
 r=await ins.c.request.post(origin+'/api/account/password',{headers:{Origin:origin},data:{currentPassword:'clave-inicial-demo-1',password:'otra-clave-segura-2'}});assert.equal(r.status(),200);
 await ins.p.goto(origin+'/capacitacion.html?perfil=instructor');await ins.p.getByRole('heading',{name:'Panel de instructor'}).waitFor();
 for(const t of ['1 · Presentación de apertura (10 min)','2 · Plan de la jornada de 3 horas','4 · Planilla de observación (papel)'])await ins.p.getByRole('link',{name:t}).waitFor();
 await ins.p.locator('input[name=title]').fill('Policía · clase de prueba');await ins.p.getByRole('button',{name:'Crear grupo'}).click();
 await ins.p.getByRole('button',{name:'Policía · clase de prueba'}).click();await ins.p.getByText('Compartí con la clase').waitFor();
 const link=(await ins.p.locator('.share-box .big-code').innerText()).trim();assert.match(link,/capacitacion\.html\?codigo=[A-F0-9]{12}$/);await ins.p.screenshot({path:'/tmp/clase-instructor.png',fullPage:true});
 // participant on a phone: only a name
 const al=await ctx();await al.p.goto(link);await al.p.getByRole('heading',{name:'Entrá a la clase'}).waitFor();assert.ok(await noScroll(al.p));
 await al.p.locator('input[name=name]').fill('María Fernández');await al.p.locator('input[name=accepted]').check();await al.p.getByRole('button',{name:'Entrar a la clase'}).click();
 await al.p.getByRole('heading',{name:'Guardá tu código'}).waitFor();await al.p.getByText('Ya estás en el grupo de la clase').waitFor();
 const [username,code]=await al.p.locator('.access-code .big-code').allInnerTexts();assert.match(username,/^Maria_Fernandez_[A-Z0-9]{3}$/);assert.match(code,/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);await al.p.screenshot({path:'/tmp/clase-codigo.png',fullPage:true});
 await al.p.getByRole('button',{name:'Empezar el curso'}).click();await al.p.getByRole('button',{name:'Continuar el curso',exact:true}).waitFor();
 await al.p.getByRole('button',{name:'Continuar el curso',exact:true}).click();await al.p.getByRole('button',{name:'Abrir módulo',exact:true}).first().click();await al.p.getByRole('heading',{name:'Ensayo en grupos de tres'}).waitFor();assert.ok(await noScroll(al.p));
 // the instructor sees the participant without accepting anything
 await ins.p.getByRole('button',{name:'Actualizar lista'}).click();await ins.p.getByRole('heading',{name:username.trim()}).waitFor();await ins.p.getByText('Aceptado ·').first().waitFor();
 // another phone: back in with username and code
 const otro=await ctx();await otro.p.goto(link);await otro.p.getByRole('button',{name:'Entrar con mi código'}).click();await otro.p.locator('input[name=username]').fill(username.trim());await otro.p.locator('input[name=password]').fill(code.trim().toLowerCase());await otro.p.getByRole('button',{name:'Entrar',exact:true}).click();
 await otro.p.getByRole('button',{name:'Continuar el curso',exact:true}).waitFor();
 // responders without a code reach the same quick access from the door
 const solo=await ctx();await solo.p.goto(origin+'/capacitacion.html?perfil=respondedor');await solo.p.getByRole('button',{name:'Continuar el curso',exact:true}).click();await solo.p.getByRole('button',{name:'Rendir / continuar evaluación'}).click();await solo.p.getByRole('heading',{name:'Entrá a la clase'}).waitFor();
 // printable material opens without errors
 for(const [path,heading] of [['/clase-apertura.html','Primeros auxilios para primeros respondedores'],['/plan-clase.html','Clase para primeros respondedores · 9:00 a 12:00'],['/planilla-practicas.html','Planilla de observación · Primeros respondedores']]){const m=await ctx();await m.p.goto(origin+path);await m.p.getByRole('heading',{name:heading}).first().waitFor({state:'attached'});await m.p.screenshot({path:'/tmp/clase-'+path.slice(1,-5)+'.png',fullPage:path!=='/clase-apertura.html'});await m.c.close();}
 const deck=await ctx();await deck.p.goto(origin+'/clase-apertura.html');for(let i=0;i<9;i++)await deck.p.getByRole('button',{name:'Siguiente →'}).click();await deck.p.getByRole('heading',{name:'Empezamos'}).waitFor();
 assert.deepEqual(errors,[]);console.log('qa-clase OK');
}finally{await browser.close();await new Promise(r=>server.close(r));await db.close();}
