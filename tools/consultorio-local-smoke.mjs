// Prueba en navegador de Mi consultorio local: paciente → turno → dictado (transcriptor simulado) → secciones → validación → historia → persistencia.
// También verifica que no se envíe ningún dato por POST y que el bloqueo premium se muestre cuando corresponde.
// Usage: PLAYWRIGHT_MODULE=/ruta/playwright/index.mjs node tools/consultorio-local-smoke.mjs
import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const port=4801,server=spawn('node',['server.mjs'],{env:{...process.env,PORT:String(port)},stdio:'ignore'});await new Promise(r=>setTimeout(r,2500));
const base='http://localhost:'+port,browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},permissions:['microphone']}),page=await ctx.newPage(),errors=[],posts=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()!=='GET'&&!r.url().startsWith('data:'))posts.push(r.method()+' '+r.url());});
 await page.addInitScript(()=>{globalThis.CLINIA_TRANSCRIBE=async()=> 'Datos personales: María López, 54 años. Antecedentes: hipertensión. Motivo de consulta: dolor torácico de dos días. Enfermedad actual: dolor opresivo al esfuerzo. Tratamiento: reposo y control en 48 horas.';});
 await page.goto(base+'/consultorio.html');await page.getByRole('heading',{name:'Mi consultorio'}).waitFor();
 await page.getByRole('tab',{name:'Pacientes'}).click();await page.locator('#f-patient input[name=name]').fill('María López');await page.locator('#f-patient input[name=dni]').fill('30111222');await page.getByRole('button',{name:'Guardar paciente'}).click();
 await page.getByRole('button',{name:'Dar un turno a este paciente'}).click();await page.locator('#f-visit input[name=when]').fill('2026-12-01T10:30');await page.locator('#f-visit input[name=reason]').fill('Dolor torácico');await page.getByRole('button',{name:'Dar turno'}).click();
 await page.getByText('Turnos pendientes (1)').waitFor();await page.getByRole('button',{name:'Atender'}).click();
 await page.getByRole('button',{name:/Dictar/}).click();await page.getByRole('button',{name:/Terminar dictado/}).waitFor();await page.waitForTimeout(600);await page.getByRole('button',{name:/Terminar dictado/}).click();
 await page.getByText('Listo. Revisá cada sección').waitFor();
 assert.match(await page.locator('textarea[name=antecedentes]').inputValue(),/hipertensión/);assert.match(await page.locator('textarea[name=motivo]').inputValue(),/dolor torácico/);assert.match(await page.locator('textarea[name=tratamiento]').inputValue(),/reposo/);
 await page.getByRole('button',{name:'Validar y marcar turno como dado'}).click();assert.match(await page.locator('#status').innerText(),/Marcá que revisaste/);
 await page.locator('input[name=ok]').check();await page.getByRole('button',{name:'Validar y marcar turno como dado'}).click();assert.match(await page.locator('#status').innerText(),/nombre del médico/);
 await page.locator('input[name=doctor]').fill('Dra. Gómez');await page.getByRole('button',{name:'Validar y marcar turno como dado'}).click();
 await page.getByText('Turnos pendientes (0)').waitFor();await page.getByText('ATENDIDO').first().waitFor();
 await page.reload();await page.getByText('Turnos pendientes (0)').waitFor();await page.getByText('Validó: Dra. Gómez').waitFor();
 await page.getByRole('tab',{name:'Pacientes'}).click();await page.getByRole('button',{name:'Abrir ficha'}).click();await page.getByText('Antecedentes:').first().waitFor();await page.getByText('hipertensión').first().waitFor();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'sin desborde horizontal');
 await page.screenshot({path:'/tmp/clinicia-consultorio-local.png',fullPage:true});
 assert.deepEqual(posts,[],'no se envía ningún dato: '+posts.join(', '));
 // bloqueo premium: oferta con paywall y sin sesión
 const lock=await browser.newPage({viewport:{width:390,height:844}});await lock.route('**/api/offer',r=>r.fulfill({json:{paywall:true}}));await lock.route('**/api/account/billing',r=>r.fulfill({status:401,json:{error:'no'}}));
 await lock.goto(base+'/consultorio.html');await lock.getByRole('heading',{name:/función premium/}).waitFor();assert.ok(await lock.locator('#app').isHidden(),'sin acceso no se muestra la app');
 const ok=await browser.newPage();await ok.route('**/api/offer',r=>r.fulfill({json:{paywall:true}}));await ok.route('**/api/account/billing',r=>r.fulfill({json:{access:{profesional:{active:true}}}}));await ok.goto(base+'/consultorio.html');await ok.locator('#app').waitFor({state:'visible'});
 assert.deepEqual(errors,[]);console.log('consultorio local OK');
}finally{await browser.close();server.kill();}
