// Browser check of the consultorio dictation flow (new patient by voice -> AI-organised history -> review -> saved).
// The microphone is a stub and the AI provider is simulated; the Node server, routes and functions are the real ones.
// Run with PLAYWRIGHT_MODULE=/path/to/playwright and CHROME_BIN when the browser is not installed globally.
import assert from 'node:assert/strict';
Object.assign(process.env,{GROQ_API_KEY:'gsk_test'});delete process.env.CLINIC_ACCESS_TOKEN;delete process.env.LEGACY_CLINICAL_ENABLED;
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const {server}=await import('../server.mjs');
const structured={motivo_consulta:{texto:'Dolor torácico opresivo',estado:'registrado'},enfermedad_actual:{fragmentos:['Dolor de 2 horas de evolución con el esfuerzo'],editado:null},antecedentes_personales:[{texto:'Hipertensión arterial',estado:'positivo'}],antecedentes_quirurgicos:[],internaciones_previas:[],alergias:[{texto:'Penicilina',estado:'positivo'}],medicacion_habitual:[{texto_original:'enalapril 10 mg',principio_activo_probable:'enalapril',dosis:'10 mg',frecuencia:'cada 12 horas'}],habitos:[],antecedentes_familiares:[],examen_fisico:{},estudios_complementarios:[],impresion_diagnostica:[],plan:[{texto:'Aspirina 100 mg cada 24 horas y control en 48 horas'}],alertas:[],transcripcion_interpretada:[]};
const aiCalls=[];const realFetch=globalThis.fetch;
globalThis.fetch=async(url,args)=>{url=String(url);if(!url.includes('api.groq.com'))return realFetch(url,args);const b=JSON.parse(args.body);aiCalls.push(b.messages.at(-1).content.slice(0,40));
 const isStructure=b.messages.at(-1).content.includes('Antecedentes ya conocidos');const content=isStructure?JSON.stringify(structured):JSON.stringify({nombre:'Juan',apellido:'Pérez',dni:'30111222',telefono:null,sexo:'Masculino',obraSocial:'OSDE',nroAfiliado:null,domicilio:null,fechaNacimiento:null,fechaEsAproximada:false});
 return {ok:true,json:async()=>({choices:[{message:{content},finish_reason:'stop'}]})};};
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote']});
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{
  window.SpeechRecognition=class{start(){setTimeout(()=>{this.onresult?.({resultIndex:0,results:[Object.assign([{transcript:'Paciente Juan Pérez documento 30111222 obra social OSDE. Motivo de consulta dolor torácico opresivo. Enfermedad actual dolor de dos horas con el esfuerzo. Antecedentes hipertensión arterial y alergia a la penicilina, toma enalapril 10 mg cada 12 horas. Tratamiento aspirina 100 mg cada 24 horas y control en 48 horas.'}],{isFinal:true})]});},50);}stop(){}};});
 const page=await ctx.newPage(),errors=[];page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,300));});page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto('http://127.0.0.1:'+server.address().port+'/consultorio.html');
 await page.getByRole('button',{name:'+ Nuevo paciente'}).click();
 await page.locator('#npMicBtn').click();
 await page.waitForFunction(()=>document.querySelector('#f_nombre')?.value==='Juan'&&document.querySelector('#f_apellido')?.value==='Pérez');
 assert.equal(await page.locator('#f_dni').inputValue(),'30111222');
 assert.match(await page.locator('#npDictation').inputValue(),/Tratamiento aspirina/);
 await page.getByRole('button',{name:'Crear paciente y organizar la historia con IA'}).click();
 await page.getByText('Revisión de consulta').waitFor();
 await page.getByText('Dolor torácico opresivo').first().waitFor();
 await page.getByText('Plan y tratamiento').first().waitFor();
 await page.getByText('Aspirina 100 mg cada 24 horas').first().waitFor();
 await page.getByText('Hipertensión arterial').first().waitFor();
 const body=await page.locator('body').innerText();assert.ok(body.includes('Organizado con IA'),'AI path expected; page said: '+body.slice(0,500));
 await page.getByRole('button',{name:'Agregar todos al perfil del paciente'}).click();
 await page.getByRole('button',{name:'Guardar consulta'}).click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinia_v1')));
 const patient=Object.values(saved.patients)[0],enc=Object.values(saved.encounters)[0];
 assert.equal(patient.nombre,'Juan');assert.deepEqual(patient.antecedentes_personales.map(x=>x.texto),['Hipertensión arterial']);assert.deepEqual(patient.alergias.map(x=>x.texto),['Penicilina']);assert.ok(patient.medicacion_habitual.some(x=>x.texto.includes('enalapril')));assert.equal(patient.dni,'30111222');assert.equal(enc.structured.plan[0].texto.includes('Aspirina'),true);assert.equal(enc.structured.motivo_consulta.texto,'Dolor torácico opresivo');
 assert.ok(aiCalls.some(c=>c.includes('Antecedentes ya conocidos')));
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal scroll');
 await page.screenshot({path:'/tmp/clinicia-consultorio.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('consultorio e2e ok');
}finally{await browser.close();server.close();}
