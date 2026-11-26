// Prueba en navegador de Modo profesional → Mis pacientes, de punta a punta, en celular (390 px) y en computadora (1280 px):
// entrar como profesional → agregar paciente → dictar y validar → buscar por apellido y por DNI → DNI repetido → ficha y planilla →
// turnos → separación por cuenta → listado CSV → receta en un clic → bloqueo premium. Verifica que no se envíe ningún dato por POST.
// Usage: PLAYWRIGHT_MODULE=/ruta/playwright/index.mjs node tools/consultorio-local-smoke.mjs
import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const port=4801,server=spawn('node',['server.mjs'],{env:{...process.env,PORT:String(port)},stdio:'ignore'});await new Promise(r=>setTimeout(r,2500));
const base='http://localhost:'+port,browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const noScroll=p=>p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);
async function flow(label,viewport){
 const ctx=await browser.newContext({viewport,permissions:['microphone','clipboard-read','clipboard-write']}),page=await ctx.newPage(),errors=[],posts=[];let user={id:'u1',username:'dra.gomez'};
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()!=='GET'&&!r.url().startsWith('data:'))posts.push(r.method()+' '+r.url());});
 await ctx.route('**/api/account/me',r=>r.fulfill({json:{user}}));await ctx.route('**/api/offer',r=>r.fulfill({json:{paywall:false}}));
 await ctx.route('https://receto.com.ar/**',r=>r.fulfill({contentType:'text/html',body:'<title>Receto</title>'}));
 await page.addInitScript(()=>{globalThis.CLINIA_TRANSCRIBE=async()=> 'Antecedentes: hipertensión. Motivo de consulta: dolor de cabeza de dos días. Enfermedad actual: cefalea holocraneana. Diagnóstico: cefalea tensional. Tratamiento: reposo e hidratación.';let n=0;window.__printed=[];window.print=()=>{window.__printed.push({cls:document.body.className,text:document.querySelector('#print-area').innerText});};});
 const list=()=>page.locator('#plist');
 // 1. Inicio → Modo profesional → cae en «Mis pacientes»
 await page.goto(base+'/');await page.getByRole('link',{name:'Entrar como profesional'}).click();await page.getByRole('heading',{name:'Mi consultorio'}).waitFor();
 assert.equal(await page.getByRole('tab',{name:'Mis pacientes'}).getAttribute('aria-selected'),'true','la pantalla inicial es Mis pacientes');
 await page.getByRole('button',{name:'+ Agregar nuevo paciente'}).waitFor();await page.getByLabel(/Buscar por apellido o número de documento/).waitFor();await page.getByText('Todavía no cargaste pacientes').waitFor();
 assert.match(await page.locator('#who').innerText(),/dra\.gomez/);assert.ok(await noScroll(page),label+': sin desborde en Mis pacientes');
 // 2. Agregar nuevo paciente con datos filiatorios, historia resumida y motivo de la primera consulta
 await page.getByRole('button',{name:'+ Agregar nuevo paciente'}).click();await page.getByRole('heading',{name:'Agregar nuevo paciente'}).waitFor();
 const f=n=>page.locator('#f-patient [name='+n+']');
 await f('lastName').fill('López');await f('firstName').fill('María');await f('dni').fill('30.111.222');await f('birth').fill('1970-05-01');await f('sex').selectOption('F');await f('address').fill('Belgrano 123, Salta');await f('phone').fill('3875551234');await f('email').fill('maria@example.com');await f('coverage').fill('OSDE');await f('affiliate').fill('123456');await f('emergency').fill('Juan López 3875000000');
 await f('background').fill('Hipertensión arterial');await f('allergies').fill('Penicilina');await f('medication').fill('Enalapril 10 mg');await f('firstReason').fill('Dolor de cabeza');
 assert.ok(await noScroll(page),label+': sin desborde en el alta');await page.screenshot({path:`/tmp/consultorio-${label}-alta.png`,fullPage:true});
 await page.getByRole('button',{name:'Guardar paciente'}).click();
 // 3. Se abre la consulta con el motivo cargado → dictado → recetario → validar
 await page.getByText('EN CURSO').waitFor();assert.equal(await page.locator('textarea[name=motivo]').inputValue(),'Dolor de cabeza');
 await page.getByRole('button',{name:/Dictar/}).click();await page.getByRole('button',{name:/Terminar dictado/}).waitFor();await page.waitForTimeout(500);await page.getByRole('button',{name:/Terminar dictado/}).click();await page.getByText('Listo. Revisá cada sección').waitFor();
 assert.match(await page.locator('textarea[name=diagnostico]').inputValue(),/cefalea tensional/);
 const [popup]=await Promise.all([ctx.waitForEvent('page'),page.getByRole('button',{name:/Recetar con Receto/}).click()]);await popup.waitForLoadState();assert.match(popup.url(),/^https:\/\/receto\.com\.ar\/app/);await popup.close();
 await page.getByText('Datos copiados.').first().waitFor();const clip=await page.evaluate(()=>navigator.clipboard.readText());assert.match(clip,/PACIENTE: María López/);assert.match(clip,/DNI: 30111222/);assert.match(clip,/COBERTURA: OSDE/);assert.match(clip,/DIAGNÓSTICO: cefalea tensional/);assert.ok(!/hipertensión|Penicilina|Enalapril/i.test(clip),'la receta no copia antecedentes');
 await page.locator('input[name=ok]').check();await page.getByRole('button',{name:'Validar y marcar turno como dado'}).click();assert.match(await page.locator('#status').innerText(),/nombre del médico/);
 await page.locator('input[name=doctor]').fill('Dra. Gómez');await page.getByRole('button',{name:'Validar y marcar turno como dado'}).click();
 // 4. Vuelve a la ficha: datos, historia resumida e historial
 await page.getByRole('heading',{name:'López, María'}).waitFor();assert.equal(await page.getByRole('alert').count(),0,'no quedan avisos de error viejos');await page.getByText('Historial de consultas (1)').waitFor();await page.getByText('ATENDIDA').first().waitFor();await page.getByText('cefalea tensional').first().waitFor();
 assert.equal(await page.locator('#f-hc [name=allergies]').inputValue(),'Penicilina');assert.equal(await page.locator('#f-edit [name=coverage]').inputValue(),'OSDE');assert.ok(await noScroll(page),label+': sin desborde en la ficha');await page.screenshot({path:`/tmp/consultorio-${label}-ficha.png`,fullPage:true});
 // 5. Segundo paciente (sin motivo: queda en su ficha)
 await page.getByRole('button',{name:'← Mis pacientes'}).click();await page.getByText('1 paciente').waitFor();
 await page.getByRole('button',{name:'+ Agregar nuevo paciente'}).click();await f('lastName').fill('Pérez');await f('firstName').fill('Juan');await f('dni').fill('25000111');await page.getByRole('button',{name:'Guardar paciente'}).click();await page.getByRole('heading',{name:'Pérez, Juan'}).waitFor();
 // 6. DNI repetido: no se duplica y ofrece abrir la ficha existente
 await page.getByRole('button',{name:'← Mis pacientes'}).click();await page.getByRole('button',{name:'+ Agregar nuevo paciente'}).click();await f('lastName').fill('Gómez');await f('firstName').fill('Pedro');await f('dni').fill('30111222');await page.getByRole('button',{name:'Guardar paciente'}).click();
 await page.getByRole('alert').getByText(/Ya existe un paciente con el documento 30111222: López, María/).waitFor();assert.equal(await f('lastName').inputValue(),'Gómez','el formulario conserva lo escrito');
 await page.getByRole('button',{name:'Abrir esa ficha'}).click();await page.getByRole('heading',{name:'López, María'}).waitFor();
 // 7. Buscador: por apellido (con y sin tilde, parcial) y por DNI (con y sin puntos)
 await page.getByRole('button',{name:'← Mis pacientes'}).click();await page.getByText('2 pacientes').waitFor();
 const q=page.locator('#q');
 await q.fill('lopez');await list().getByText('López, María').waitFor();assert.equal(await list().getByText('Pérez, Juan').count(),0,'filtra por apellido sin tildes');
 await q.fill('PÉR');await list().getByText('Pérez, Juan').waitFor();assert.equal(await list().getByText('López, María').count(),0);
 await q.fill('30111222');await list().getByText('López, María').waitFor();await q.fill('25.000.111');await list().getByText('Pérez, Juan').waitFor();assert.equal(await list().getByText('López, María').count(),0,'por DNI con puntos');
 await q.fill('zzz');await list().getByText('No encontramos a nadie con «zzz»').waitFor();
 await list().getByRole('button',{name:'Agregar nuevo paciente'}).click();assert.equal(await f('lastName').inputValue(),'zzz','el alta arranca con lo buscado');await page.getByRole('button',{name:'← Mis pacientes'}).click();
 await page.locator('#q').fill('');await page.getByText('2 pacientes').waitFor();
 // 8. Paciente que ya tuve: lo busco por DNI, abro la ficha, edito, imprimo la planilla y hago una consulta nueva
 await page.locator('#q').fill('30111222');await page.getByRole('button',{name:'Abrir ficha'}).click();await page.getByRole('heading',{name:'López, María'}).waitFor();
 await page.locator('#f-edit [name=phone]').fill('3875999999');await page.getByRole('button',{name:'Guardar datos'}).click();await page.getByText('Datos guardados.').waitFor();
 await page.getByRole('button',{name:'Imprimir planilla'}).click();const printed=await page.evaluate(()=>window.__printed);assert.equal(printed.length,1);assert.match(printed[0].cls,/printing/);for(const t of ['Planilla de paciente','López, María','Datos filiatorios','Historia clínica resumida','Penicilina','Historial de consultas','cefalea tensional','Validó Dra. Gómez','3875999999'])assert.ok(printed[0].text.includes(t),'la planilla incluye '+t);
 assert.ok(!(await page.evaluate(()=>document.body.className)).includes('printing'),'se limpia el modo impresión');
 await page.getByRole('button',{name:'Nueva consulta ahora'}).click();await page.getByText('EN CURSO').waitFor();await page.getByRole('button',{name:/Ficha del paciente/}).click();await page.getByText('Historial de consultas (2)').waitFor();await page.getByText('PENDIENTE').first().waitFor();
 // 9. Turnos con buscador de paciente
 await page.getByRole('tab',{name:'Turnos'}).click();await page.locator('#f-visit [name=patient]').fill('Pérez, Juan — DNI 25000111');await page.locator('#f-visit [name=when]').fill('2030-12-01T10:30');await page.locator('#f-visit [name=reason]').fill('Control');await page.getByRole('button',{name:'Dar turno'}).click();await page.getByText(/Turnos pendientes \(2\)/).waitFor();
 await page.locator('#f-visit [name=patient]').fill('nadie');await page.locator('#f-visit [name=when]').fill('2030-12-02T10:30');await page.getByRole('button',{name:'Dar turno'}).click();assert.match(await page.locator('#status').innerText(),/Elegí un paciente de la lista/);
 // 10. Persiste al recargar y se separa por cuenta
 await page.reload();await page.getByText('2 pacientes').waitFor();
 user={id:'u2',username:'dr.otro'};await page.reload();await page.getByText('Todavía no cargaste pacientes').waitFor();assert.match(await page.locator('#who').innerText(),/dr\.otro/);
 user={id:'u1',username:'dra.gomez'};await page.reload();await page.getByText('2 pacientes').waitFor();
 // 11. Listado CSV
 await page.getByRole('tab',{name:'Ajustes'}).click();const [dl]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Listado de pacientes (CSV)'}).click()]);
 const csv=(await import('node:fs')).readFileSync(await dl.path(),'utf8');assert.match(csv,/Apellido,Nombre,Documento/);assert.match(csv,/"López","María","30111222"/);assert.match(csv,/"Pérez","Juan","25000111"/);
 assert.ok(await noScroll(page),label+': sin desborde en Ajustes');
 assert.deepEqual(posts,[],label+': no se envía ningún dato: '+posts.join(', '));assert.deepEqual(errors,[]);console.log('Mis pacientes OK ·',label);await ctx.close();
}
try{
 await flow('celular',{width:390,height:844});await flow('computadora',{width:1280,height:800});
 // bloqueo premium: oferta con paywall y sin acceso → no se muestra la app; con acceso profesional sí
 const lock=await browser.newPage({viewport:{width:390,height:844}});await lock.route('**/api/offer',r=>r.fulfill({json:{paywall:true}}));await lock.route('**/api/account/billing',r=>r.fulfill({status:401,json:{error:'no'}}));await lock.route('**/api/account/me',r=>r.fulfill({json:{user:null}}));
 await lock.goto(base+'/consultorio.html');await lock.getByRole('heading',{name:/función premium/}).waitFor();assert.ok(await lock.locator('#app').isHidden(),'sin acceso no se muestra la app');
 const ok=await browser.newPage();await ok.route('**/api/offer',r=>r.fulfill({json:{paywall:true}}));await ok.route('**/api/account/me',r=>r.fulfill({json:{user:{id:'u9',username:'pro'}}}));await ok.route('**/api/account/billing',r=>r.fulfill({json:{access:{profesional:{active:true}}}}));await ok.goto(base+'/consultorio.html');await ok.locator('#app').waitFor({state:'visible'});
 console.log('consultorio local OK');
}finally{await browser.close();server.kill();}
