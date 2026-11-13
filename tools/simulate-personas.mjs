// Persona simulation with a real browser: scripted users with different roles, knowledge levels, phones and networks.
// They are bots that follow the app's flows (not real people): they measure waiting time under throttled networks/CPUs, steps, errors, overflow and tap targets.
// Run: PLAYWRIGHT_MODULE=<path> node tools/simulate-personas.mjs
import http from 'node:http';
import {PGlite} from '@electric-sql/pglite';import {createAccounts,hashPassword} from '../backend/accounts.mjs';import {server as assets} from '../server.mjs';
import {questions} from '../public/learn/courses.mjs';import {policeCourse} from '../public/learn/content/respuesta-policial.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const db=new PGlite();let accounts;
const server=http.createServer((req,res)=>{const u=new URL(req.url,origin);(u.pathname.startsWith('/api/account')||u.pathname.startsWith('/api/admin')||['/api/events','/api/offer'].includes(u.pathname))?accounts.handler(req,res,u):assets.emit('request',req,res);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
accounts=await createAccounts({db,origin,secure:false,adminName:'admin_demo',adminHash:await hashPassword('clave-inicial-demo-1')});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const NET={'3G lento':{latency:400,downloadThroughput:50e3,uploadThroughput:25e3},'3G':{latency:150,downloadThroughput:200e3,uploadThroughput:90e3},'4G':{latency:60,downloadThroughput:1.5e6,uploadThroughput:750e3},'wifi':null};
const DEV={'Android básico 360x640':{viewport:{width:360,height:640},deviceScaleFactor:2,isMobile:true,hasTouch:true,cpu:4},'iPhone SE 375x667':{viewport:{width:375,height:667},deviceScaleFactor:2,isMobile:true,hasTouch:true,cpu:2},'Pixel 7 412x915':{viewport:{width:412,height:915},deviceScaleFactor:2.6,isMobile:true,hasTouch:true,cpu:1},'Tablet 768x1024':{viewport:{width:768,height:1024},deviceScaleFactor:2,isMobile:true,hasTouch:true,cpu:2},'Notebook 1280x800':{viewport:{width:1280,height:800},deviceScaleFactor:1,isMobile:false,hasTouch:false,cpu:1}};
const results=[];
async function newPage(dev,net){const d=DEV[dev];const ctx=await browser.newContext({viewport:d.viewport,deviceScaleFactor:d.deviceScaleFactor,isMobile:d.isMobile,hasTouch:d.hasTouch});const p=await ctx.newPage();const cdp=await ctx.newCDPSession(p);if(NET[net])await cdp.send('Network.emulateNetworkConditions',{offline:false,...NET[net]});if(d.cpu>1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:d.cpu});p.setDefaultTimeout(60000);return {ctx,p};}
function persona(name,role,dev,net,level){const log={name,role,dev,net,level,steps:[],issues:[]};results.push(log);return log;}
async function step(log,p,label,fn){const t=Date.now();if(process.env.VERBOSE)console.error('   … '+log.name+': '+label);try{await fn();}catch(e){log.issues.push(`FALLÓ «${label}»: ${String(e.message).split('\n')[0].slice(0,110)}`);if(process.env.VERBOSE)console.error('      pantalla:',(await p.locator('body').innerText().catch(()=>'')).slice(0,300).replace(/\n+/g,' | '));}const ms=Date.now()-t;log.steps.push([label,ms]);return ms;}
async function audit(log,p,where){const r=await p.evaluate(()=>({ov:document.documentElement.scrollWidth>innerWidth+1,small:[...document.querySelectorAll('button:not([hidden]),a[href]')].filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&r.height>0&&(r.height<40||r.width<40)&&b.textContent.trim()}).length,tiny:[...document.querySelectorAll('p,li,label,span,td')].filter(e=>e.children.length===0&&e.textContent.trim().length>20&&parseFloat(getComputedStyle(e).fontSize)<13).length}));if(r.ov)log.issues.push(`desborde horizontal en ${where}`);if(r.small>6)log.issues.push(`${r.small} botones/enlaces <40 px en ${where}`);if(r.tiny>0)log.issues.push(`${r.tiny} textos <13 px en ${where}`);}
const printed=new Set();
function flush(){for(const r of results){if(!r.done||printed.has(r))continue;printed.add(r);const total=r.steps.reduce((a,x)=>a+x[1],0);console.log(`\n■ ${r.name} · ${r.role} · ${r.dev} · red ${r.net} · conocimiento ${Math.round(r.level*100)}%`);for(const [l,ms] of r.steps)console.log(`   ${String(Math.round(ms/100)/10).padStart(6)} s  ${l}`);console.log(`   total ${Math.round(total/100)/10} s${r.exam?' · '+r.exam:''}${r.code?' · muestra usuario y código':''}`);for(const i of [...new Set(r.issues)])console.log('   ⚠ '+i);}}
const pick=(level)=>Math.random()<level;
// ---------- first responders (class flow) ----------
const teacherCtx=await browser.newContext();let r0=await teacherCtx.request.post(origin+'/api/account/register',{headers:{Origin:origin},data:{username:'instructora_sim',password:'clave-segura-1234',accepted:true}});
await teacherCtx.request.post(origin+'/api/account/modes',{headers:{Origin:origin},data:{mode:'teacher',accepted:true}});
const group=await (await teacherCtx.request.post(origin+'/api/account/capacitacion',{headers:{Origin:origin},data:{action:'create-group',title:'Cafayate · simulación',autoAccept:true}})).json();
const link=origin+'/capacitacion.html?codigo='+group.joinCode;
const responders=[['Policía novato','Policía','Android básico 360x640','3G lento',.35],['Bombero con experiencia','Bombero','iPhone SE 375x667','3G',.6],['Paramédico experto','Paramédico','Pixel 7 412x915','4G',.92],['Policía mayor, poco tecnológico','Policía','Android básico 360x640','3G',.5]];
for(const [name,role,dev,net,level] of responders){
 if(process.env.ONLY&&!name.includes(process.env.ONLY))continue;
 const log=persona(name,role,dev,net,level);const {ctx,p}=await newPage(dev,net);const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(process.env.VERBOSE&&m.type()==='error')console.error('      console.error',m.text().slice(0,150))});if(process.env.VERBOSE)p.on('response',r=>{if(r.url().includes('/api/'))console.error('      api',r.status(),r.url().replace(origin,''))});
 await step(log,p,'abrir el enlace de la clase',async()=>{await p.goto(link,{waitUntil:'load'});await p.getByRole('heading',{name:'Entrá a la clase'}).waitFor();});await audit(log,p,'pantalla de ingreso');
 await step(log,p,'escribir nombre y entrar (sin contraseña)',async()=>{await p.locator('input[name=name]').fill(name+' Sim');await p.locator('input[name=accepted]').check();await p.getByRole('button',{name:'Entrar a la clase'}).click();await p.getByRole('heading',{name:'Guardá tu código'}).waitFor();});await audit(log,p,'pantalla del código');
 const codes=await p.locator('.access-code .big-code').allInnerTexts();log.code=codes.length===2;
 await step(log,p,'empezar el curso y abrir el primer módulo',async()=>{await p.getByRole('button',{name:'Empezar el curso'}).click();await p.getByRole('button',{name:'Continuar el curso',exact:true}).click();await p.getByRole('button',{name:'Abrir módulo',exact:true}).first().click();await p.getByRole('heading',{name:'Ensayo en grupos de tres'}).waitFor();});await audit(log,p,'módulo de teoría');
 // exam through the API with the persona's accuracy (UI answering 50 questions is covered by qa-clase)
 const cookies=await ctx.cookies();const cookie=cookies.map(c=>c.name+'='+c.value).join('; ');
 const call=async(body)=>{const r=await fetch(origin+'/api/account/capacitacion',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:JSON.stringify(body)});return {s:r.status,j:await r.json()};};
 let lastAttemptResult=null;
 await step(log,p,'leer los 10 módulos (API)',async()=>{for(const l of policeCourse.lessons)await call({action:'read',lessonId:l.id});});
 for(let intento=1;intento<=3;intento++){const t=await step(log,p,`examen de 50 preguntas · intento ${intento} (API)`,async()=>{let at=(await call({action:'start',courseId:'respuesta-policial'})).j;let v=at.version??0;for(const item of at.questions){const q=policeCourse.lessons.flatMap(l=>l.questions).find(x=>x.id===item.id);const right=item.options?item.options.indexOf(q.options[q.answer]):q.answer;const ans=pick(level)?right:((right+1+Math.floor(Math.random()*3))%5);const rr=await call({action:'save-answer',attemptId:at.id,questionId:item.id,answer:ans,version:v});v=rr.j.version??v;}const res=await call({action:'submit',attemptId:at.id});lastAttemptResult=res.j.result;});if(lastAttemptResult?.passed){log.exam=`aprobó en el intento ${intento} (${lastAttemptResult.correct}/50)`;break;}else log.exam=`no aprobó tras ${intento} intento(s) (${lastAttemptResult?.correct}/50)`;}
 for(const id of ['rtpp-3','rtpp-4','rtpp-5'])await call({action:'practice',groupId:group.id,lessonId:id});
 if(errs.length)log.issues.push('errores JS: '+errs.slice(0,2).join(' | '));await ctx.close();log.done=true;flush();
}
// ---------- health professionals and doctors (learn app) ----------
const learn=process.env.ONLY?[]:[['Residente de medicina (alto)','Médico','Notebook 1280x800','wifi',.9,'#formacion','salud-cardiometabolica'],['Médico clínico con poco tiempo','Médico','Pixel 7 412x915','4G',.7,'#formacion','uci-critico-integral'],['Enfermera de guardia','Enfermería','Android básico 360x640','3G',.6,'#enfermeria','enf-emergencia-evaluacion'],['Enfermero novato','Enfermería','iPhone SE 375x667','3G lento',.35,'#enfermeria','enf-emergencia-resucitacion'],['Kinesiólogo','Kinesiología','Tablet 768x1024','4G',.55,'#kinesiologia','kine-respiratoria'],['Nutricionista','Nutrición','Pixel 7 412x915','4G',.75,'#nutricion','nut-obesidad']];
for(const [name,role,dev,net,level,hash,courseId] of learn){
 const log=persona(name,role,dev,net,level);const {ctx,p}=await newPage(dev,net);const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await step(log,p,'abrir ClinicIA (inicio)',async()=>{await p.goto(origin+'/',{waitUntil:'load'});await p.getByRole('heading',{name:'¿Cómo vas a entrar?'}).waitFor();});await audit(log,p,'inicio');
 await step(log,p,'ir a mi sección ('+hash+')',async()=>{await p.goto(origin+'/'+hash);await p.reload();await p.locator(`.course-card button[data-id="${courseId}"]`).first().waitFor();});await audit(log,p,'sección '+hash);
 await step(log,p,'entrar al curso',async()=>{await p.locator(`.course-card button[data-id="${courseId}"]`).first().click();await p.locator('[data-view="practice"]:visible').first().waitFor();});await audit(log,p,'ficha del curso');
 let answered=0,right=0;
 await step(log,p,'practicar 6 preguntas',async()=>{await p.locator('[data-view="practice"]:visible').first().click();await p.getByRole('button',{name:'Empezar práctica'}).click();
  for(let i=0;i<6;i++){const prompt=(await p.locator('.question h2, .question h3, h2').filter({hasText:/\?|\.\s*$/}).first().innerText().catch(()=>'')).trim();const opts=await p.locator('.options button').allInnerTexts();if(!opts.length)break;const q=questions.find(x=>x.courseId===courseId&&prompt&&(x.prompt.includes(prompt.slice(0,40))));const correctText=q?q.options[q.answer]:null;let idx=-1;if(correctText)idx=opts.findIndex(o=>o.replace(/^[A-E]\s*/,'').trim().startsWith(correctText.slice(0,30)));if(idx<0)idx=Math.floor(Math.random()*opts.length);const want=pick(level)?idx:(idx+1)%opts.length;await p.locator('.options button').nth(want).click();answered++;if(want===idx)right++;await p.waitForTimeout(150);const next=p.getByRole('button',{name:/Siguiente|Continuar|Terminar|Ver resultado/}).first();if(await next.count())await next.click().catch(()=>{});}});
 log.exam=`respondió ${answered} preguntas de práctica`;await audit(log,p,'práctica');
 if(errs.length)log.issues.push('errores JS: '+errs.slice(0,2).join(' | '));await ctx.close();log.done=true;flush();
}
// ---------- instructors ----------
for(const [name,dev,net] of process.env.ONLY?[]:[['Instructora primeriza (celular)','Android básico 360x640','3G'],['Instructor con notebook y proyector','Notebook 1280x800','wifi']]){
 const log=persona(name,'Instructor',dev,net,.9);const {ctx,p}=await newPage(dev,net);const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await ctx.request.post(origin+'/api/account/login',{headers:{Origin:origin},data:{username:'instructora_sim',password:'clave-segura-1234'}});
 await step(log,p,'abrir panel de instructor',async()=>{await p.goto(origin+'/capacitacion.html?perfil=instructor',{waitUntil:'load'});await p.getByRole('heading',{name:'Panel de instructor'}).waitFor();});await audit(log,p,'panel de instructor');
 await step(log,p,'ver la guía del curso (módulo 3)',async()=>{await p.getByText('Módulo 3 · Reconocimiento del paro, RCP y DEA').first().click();await p.locator('strong:visible',{hasText:'Qué mirar al validar:'}).first().waitFor();});
 await step(log,p,'abrir el grupo y ver la lista de alumnos',async()=>{await p.getByRole('button',{name:'Cafayate · simulación'}).click();await p.getByText('Lista de alumnos').first().waitFor();});await audit(log,p,'lista de alumnos');
 const h=await p.evaluate(()=>document.documentElement.scrollHeight);log.exam=`el panel mide ${h} px de alto con 4 alumnos`;
 if(errs.length)log.issues.push('errores JS: '+errs.slice(0,2).join(' | '));await ctx.close();log.done=true;flush();
}
await browser.close();server.close();process.exit(0);
