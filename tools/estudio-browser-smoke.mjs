// Optional visual smoke test for estudio.html: PLAYWRIGHT_MODULE and CHROME_BIN may point to local installs.
// Uses an in-memory Postgres (PGlite) and a fake AI provider, so it needs no keys or network.
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,writeFile,mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,extname} from 'node:path';
import {PGlite} from '@electric-sql/pglite';
import {createAccounts} from '../backend/accounts.mjs';
import {PAGES,makePdf} from '../test/helpers/pdf.mjs';
const pw=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),chromium=pw.chromium??pw.default.chromium;
const realFetch=global.fetch,root=resolve('public'),types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript','.css':'text/css'};
Object.assign(process.env,{ANTHROPIC_API_KEY:'k',ANTHROPIC_MODEL:'m'});
const lesson={title:'Cardiología básica',exercises:[
 {type:'mcq',prompt:'¿Qué cifra define la hipertensión en consultorio?',options:['≥140 mmHg','≥100 mmHg','≥180 mmHg','≥90 mmHg'],answer:0,explanation:'Lo dice la página 1.',evidence:{page:1,quote:'presion arterial sistolica mayor o igual a 140 mmHg'}},
 {type:'tf',prompt:'La FE reducida es menor al 40%.',answer:true,explanation:'Según el material.',evidence:{page:2,quote:'fraccion de eyeccion menor al 40 por ciento'}},
 {type:'cloze',prompt:'La ____ es la arritmia sostenida más frecuente.',options:['fibrilación auricular','flutter','taquicardia ventricular','bloqueo AV'],answer:0,explanation:'Página 3.',evidence:{page:3,quote:'La fibrilacion auricular es la arritmia sostenida mas frecuente'}}]};
global.fetch=async(u,a)=>String(u).startsWith('http://127.0.0.1')?realFetch(u,a):{ok:true,json:async()=>({stop_reason:'end_turn',content:[{type:'text',text:JSON.stringify(lesson)}]})};
const db=new PGlite();let origin;
const server=http.createServer(async(req,res)=>{const url=new URL(req.url,origin);
 if(url.pathname.startsWith('/api/')){const handled=await api.handler(req,res,url);if(handled||res.headersSent)return;res.writeHead(404);return res.end();}
 try{const p=resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname)),body=await readFile(p);res.writeHead(200,{'Content-Type':types[extname(p)]||'application/octet-stream'});res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;
const api=await createAccounts({db,origin,secure:false});
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:['--no-sandbox']});
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844}}),page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 const reg=await ctx.request.post(origin+'/api/account/register',{data:{username:'Estudiante1',password:'una-clave-bien-larga',accepted:true},headers:{origin}});assert.equal(reg.status(),201);
 await page.goto(origin+'/estudio.html');await page.getByRole('heading',{name:'Subí tu material'}).waitFor();
 const dir=await mkdtemp(join(tmpdir(),'estudio-')),pdf=join(dir,'anatomia.pdf');await writeFile(pdf,makePdf(PAGES));
 await page.setInputFiles('input[type=file]',pdf);await page.locator('input[type=text]').fill('Cardiología II');
 await page.getByRole('button',{name:'Subir y empezar'}).click();assert.match(await page.locator('#status').innerText(),/derecho/);
 await page.locator('input[type=checkbox]').check();await page.getByRole('button',{name:'Subir y empezar'}).click();
 await page.getByRole('button',{name:'Generar lecciones'}).waitFor();await page.screenshot({path:process.env.SHOT_DIR?join(process.env.SHOT_DIR,'estudio-1-generar.png'):undefined});
 await page.getByRole('button',{name:'Generar lecciones'}).click();
 await page.locator('.node').first().waitFor();assert.match(await page.locator('#status').innerText(),/Listo: 1 lección nueva/);
 if(process.env.SHOT_DIR)await page.screenshot({path:join(process.env.SHOT_DIR,'estudio-2-ruta.png')});
 await page.locator('.node').first().click();
 for(let n=0;n<3;n++){
  await page.locator('.choice').first().waitFor();
  if(n===0&&process.env.SHOT_DIR)await page.screenshot({path:join(process.env.SHOT_DIR,'estudio-3-ejercicio.png')});
  // answer correctly: the right option is the one whose text matches the lesson data
  const q=await page.locator('.q').innerText(),ex=lesson.exercises.find(e=>q.startsWith(e.prompt.split('____')[0].trim().slice(0,12)));
  const right=ex.type==='tf'?(ex.answer?'Verdadero':'Falso'):ex.options[ex.answer];
  await page.locator('.choice',{hasText:right}).first().click();await page.getByRole('button',{name:'Comprobar'}).click();
  await page.locator('.feedback.ok').waitFor();assert.match(await page.locator('.evidence').innerText(),/Tu material, página \d/);
  if(n===0&&process.env.SHOT_DIR)await page.screenshot({path:join(process.env.SHOT_DIR,'estudio-4-feedback.png')});
  await page.getByRole('button',{name:n===2?'Terminar':'Continuar'}).click();
 }
 await page.getByRole('heading',{name:'Lección completa'}).waitFor();assert.match(await page.locator('.xp').innerText(),/\+30 XP/);
 if(process.env.SHOT_DIR)await page.screenshot({path:join(process.env.SHOT_DIR,'estudio-5-fin.png')});
 await page.getByRole('button',{name:'Volver a la ruta'}).click();await page.locator('.node.done').waitFor();assert.match(await page.locator('.node.done').innerText(),/100%/);
 assert.deepEqual(errors,[]);console.log('estudio smoke ok');
}finally{await browser.close();server.close();}
