// Prueba de la versión local autónoma del módulo profesional: se arma el paquete, se levanta su servidor y se usa en un navegador real
// (celular y computadora): agregar paciente, buscar por apellido y DNI, DNI repetido, guardar al recargar, instalar y abrir sin conexión.
// Usage: PLAYWRIGHT_MODULE=/ruta/playwright/index.mjs node tools/modulo-local-smoke.mjs
import assert from 'node:assert/strict';import {spawn,execFileSync} from 'node:child_process';import {mkdtempSync,rmSync,readFileSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const dir=mkdtempSync(join(tmpdir(),'clinicia-local-')),port=4811,base='http://127.0.0.1:'+port;
execFileSync('node',['tools/build-modulo.mjs','profesional','--out',dir],{stdio:'ignore'});
const server=spawn('node',['servidor-local.mjs'],{cwd:dir,env:{...process.env,PORT:String(port)},stdio:'ignore'});await new Promise(r=>setTimeout(r,1500));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 // el servidor local no sirve fuera de su carpeta ni responde a /api
 for(const u of ['/%2e%2e/servidor-local.mjs','/..%2fservidor-local.mjs','/%2e%2e%2f%2e%2e%2fetc/passwd'])assert.ok([403,404].includes((await fetch(base+u)).status),'no se puede salir de la carpeta: '+u);
 assert.equal((await fetch(base+'/api/account/me')).status,404);assert.equal((await fetch(base+'/')).headers.get('content-type'),'text/html; charset=utf-8','la raíz abre Mi consultorio');
 for(const [label,viewport] of [['celular',{width:390,height:844}],['computadora',{width:1280,height:800}]]){
  const ctx=await browser.newContext({viewport}),page=await ctx.newPage(),errors=[],reqs=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>reqs.push(r.method()+' '+new URL(r.url()).pathname));
  await page.goto(base+'/consultorio.html');await page.getByRole('heading',{name:'Mi consultorio'}).waitFor();await page.getByText('Todavía no cargaste pacientes').waitFor();
  assert.ok(!reqs.some(r=>r.includes('areas.mjs')),'la versión local no carga la barra de áreas');assert.equal(await page.locator('.areas,.areas-bar,[class*=areas]').count(),0);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+': sin desborde');
  const f=n=>page.locator('#f-patient [name='+n+']');const alta=async(l,n,d)=>{await page.getByRole('button',{name:'+ Agregar nuevo paciente'}).first().click();await f('lastName').fill(l);await f('firstName').fill(n);await f('dni').fill(d);await page.getByRole('button',{name:'Guardar paciente'}).click();};
  await alta('López','María','30.111.222');await page.getByRole('heading',{name:'López, María'}).waitFor();
  if(viewport.width<1000)await page.getByRole('button',{name:'← Mis pacientes'}).click();await alta('Pérez','Juan','25000111');await page.getByRole('heading',{name:'Pérez, Juan'}).waitFor();
  if(viewport.width<1000)await page.getByRole('button',{name:'← Mis pacientes'}).click();await page.getByText('2 pacientes').waitFor();
  await page.locator('#q').fill('lopez');await page.locator('#plist').getByText('López, María').waitFor();assert.equal(await page.locator('#plist').getByText('Pérez, Juan').count(),0);
  await page.locator('#q').fill('25.000.111');await page.locator('#plist').getByText('Pérez, Juan').waitFor();await page.locator('#q').fill('');
  await alta('Gómez','Pedro','30111222');await page.getByRole('alert').getByText(/Ya existe un paciente con el documento 30111222/).waitFor();
  // se guarda en el navegador y se puede abrir sin internet una vez cargado
  await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForFunction(()=>navigator.serviceWorker.controller);await page.getByText('2 pacientes').waitFor();
  await ctx.setOffline(true);await page.reload();await page.getByRole('heading',{name:'Mi consultorio'}).waitFor();await page.getByText('2 pacientes').waitFor();await ctx.setOffline(false);
  assert.ok(!reqs.some(r=>r.startsWith('POST')),label+': no se envía nada por POST');assert.deepEqual(errors,[]);console.log('Versión local OK ·',label);await ctx.close();
 }
 // el paquete trae lo necesario y nada de más
 const man=JSON.parse(readFileSync(join(dir,'app','consultorio.webmanifest'),'utf8'));assert.equal(man.start_url,'/consultorio.html');
 for(const f of ['Iniciar-Mi-consultorio.bat','iniciar.sh','LEEME.txt','servidor-local.mjs','app/consultorio.html','app/sw.js'])readFileSync(join(dir,f));
 for(const f of ['app/index.html','app/app.mjs','app/aulas.html','app/payments.mjs'])assert.throws(()=>readFileSync(join(dir,f)),'no incluye '+f);
 console.log('paquete local OK');
}finally{await browser.close();server.kill();rmSync(dir,{recursive:true,force:true});}
