// Browser check of the consultorio: dictate a patient -> identity goes to the encrypted server vault, never to the AI -> history organised from
// the de-identified text -> review -> saved. Microphone and AI provider are simulated; server, routes, accounts, vault and database engine are real.
// Run with PLAYWRIGHT_MODULE=/path/to/playwright and CHROME_BIN when the browser is not installed globally.
import assert from 'node:assert/strict';import http from 'node:http';import {readFile} from 'node:fs/promises';import {resolve,extname,sep} from 'node:path';import {createRequire} from 'node:module';
import {PGlite} from '@electric-sql/pglite';import {createAccounts} from '../backend/accounts.mjs';
Object.assign(process.env,{GROQ_API_KEY:'gsk_test',PATIENT_VAULT_KEY:'c'.repeat(64)});delete process.env.CLINIC_ACCESS_TOKEN;delete process.env.LEGACY_CLINICAL_ENABLED;
const require=createRequire(import.meta.url),{chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const structured={motivo_consulta:{texto:'Dolor torácico opresivo',estado:'registrado'},enfermedad_actual:{fragmentos:['Dolor de 2 horas de evolución con el esfuerzo'],editado:null},antecedentes_personales:[{texto:'Hipertensión arterial',estado:'positivo'}],antecedentes_quirurgicos:[],internaciones_previas:[],alergias:[{texto:'Penicilina',estado:'positivo'}],medicacion_habitual:[{texto_original:'enalapril 10 mg',principio_activo_probable:'enalapril',dosis:'10 mg',frecuencia:'cada 12 horas'}],habitos:[],antecedentes_familiares:[],examen_fisico:{},estudios_complementarios:[],impresion_diagnostica:[],plan:[{texto:'Aspirina 100 mg cada 24 horas y control en 48 horas'}],alertas:[],transcripcion_interpretada:[]};
const sentToAI=[];const realFetch=globalThis.fetch;
globalThis.fetch=async(url,args)=>{url=String(url);if(new URL(url).hostname!=='api.groq.com')return realFetch(url,args);sentToAI.push(args.body);
 return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify(structured)},finish_reason:'stop'}]})};};
const db=new PGlite(),root=resolve('public');let accounts;
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://x'),fn=url.pathname.match(/^\/\.netlify\/functions\/(deidentify|structure-consulta|rewrite-field)$/);
 if(url.pathname.startsWith('/api/')){if(await accounts.handler(req,res,url))return;res.writeHead(404);return res.end();}
 if(fn){let body='';for await(const c of req)body+=c;const r=await require('../netlify/functions/'+fn[1]+'.js').handler({httpMethod:req.method,headers:req.headers,body});res.writeHead(r.statusCode,r.headers);return res.end(r.body);}
 const p=resolve(root,'.'+decodeURIComponent(url.pathname));if(!p.startsWith(root+sep))throw 0;res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.mjs':'text/javascript','.css':'text/css'}[extname(p)]||'application/octet-stream'});res.end(await readFile(p));}catch{if(!res.headersSent){res.writeHead(404);res.end();}}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;accounts=await createAccounts({db,origin:base,secure:false});
const DICTATION='Paciente Juan Pérez documento 30111222 obra social OSDE. Motivo de consulta dolor torácico opresivo. Enfermedad actual dolor de dos horas con el esfuerzo. Antecedentes hipertensión arterial y alergia a la penicilina, toma enalapril 10 mg cada 12 horas. Tratamiento aspirina 100 mg cada 24 horas y control en 48 horas.';
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote']});
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844}});
 await ctx.addInitScript(d=>{window.SpeechRecognition=class{start(){setTimeout(()=>{this.onresult?.({resultIndex:0,results:[Object.assign([{transcript:d}],{isFinal:true})]});},50);}stop(){}};},DICTATION);
 const reg=await ctx.request.post(base+'/api/account/register',{headers:{Origin:base},data:{username:'DocDemo',password:'clave-segura-123',accepted:true}});assert.equal(reg.status(),201);
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto(base+'/consultorio.html');
 await page.getByText('cifrados en el servidor').first().waitFor();
 await page.getByRole('button',{name:'+ Nuevo paciente'}).click();
 await page.locator('#npMicBtn').click();
 await page.waitForFunction(()=>document.querySelector('#f_nombre')?.value==='Juan'&&document.querySelector('#f_apellido')?.value==='Pérez');
 assert.equal(await page.locator('#f_dni').inputValue(),'30111222');
 assert.equal(sentToAI.length,0,'dictating personal data never calls the AI');
 await page.getByRole('button',{name:'Crear paciente y organizar la historia con IA'}).click();
 // the professional sees exactly what will go to the AI, without personal data
 await page.getByText('Esto es lo que se enviará a la IA').waitFor();
 const preview=await page.locator('#aiPreviewText').inputValue();
 for(const leak of ['Juan','Pérez','30111222','OSDE'])assert.ok(!preview.includes(leak),'preview leaks '+leak+': '+preview);
 assert.ok(preview.includes('dolor torácico opresivo')&&preview.includes('aspirina 100 mg'));assert.equal(sentToAI.length,0,'nothing is sent before the professional confirms');
 await page.getByRole('button',{name:'Enviar a la IA'}).click();
 await page.getByText('Revisión de consulta').waitFor();
 await page.getByText('Aspirina 100 mg cada 24 horas').first().waitFor();
 const body=await page.locator('body').innerText();assert.ok(body.includes('Organizado con IA'),'AI path expected');
 await page.getByRole('button',{name:'Agregar todos al perfil del paciente'}).click();
 await page.getByRole('button',{name:'Guardar consulta'}).click();
 await page.getByText('Pérez').first().waitFor(); // identity is shown from the server vault
 // what the provider received and what the device stored
 assert.equal(sentToAI.length,1);for(const leak of ['Juan','Pérez','30111222','OSDE'])assert.ok(!sentToAI[0].includes(leak),'provider received '+leak);assert.ok(sentToAI[0].includes('dolor torácico opresivo'));
 const local=await page.evaluate(()=>localStorage.getItem('clinia_v1'));
 const saved=JSON.parse(local),patient=Object.values(saved.patients)[0],enc=Object.values(saved.encounters)[0];
 for(const k of ['nombre','apellido','dni','telefono','obraSocial','nroAfiliado','domicilio','fechaNacimiento'])assert.equal(patient[k],undefined,'device keeps '+k);
 assert.ok(patient.identityId);assert.deepEqual(patient.antecedentes_personales.map(x=>x.texto),['Hipertensión arterial']);assert.deepEqual(patient.alergias.map(x=>x.texto),['Penicilina']);assert.ok(enc.structured.plan[0].texto.includes('Aspirina'));
 const row=(await db.query('SELECT payload FROM clinic_patient_identity')).rows[0];assert.ok(row&&!row.payload.includes('Juan')&&!Buffer.from(row.payload,'base64').toString('latin1').includes('Pérez'),'encrypted at rest');
 // a fresh browser context with the same account sees the identity only from the server
 await page.reload();await page.getByText('Pérez, Juan').first().waitFor();
 // without a session no personal data can be saved
 const anon=await browser.newPage({viewport:{width:390,height:844}});anon.on('dialog',d=>d.dismiss());await anon.goto(base+'/consultorio.html');await anon.getByText('Iniciá sesión para guardar datos personales').waitFor();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal scroll');
 await page.screenshot({path:'/tmp/clinicia-consultorio.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('consultorio e2e ok');
}finally{await browser.close();server.close();await db.close();}
