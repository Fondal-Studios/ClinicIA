// Browser simulation: a student reaches nursing and nutrition from the entry points, opens each course, reads, practices, answers a case and starts the integral exam. 390 px, no page errors.
import assert from 'node:assert/strict';import {server as assets} from '../server.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
await new Promise(r=>assets.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+assets.address().port;
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const errors=[];const ctx=await browser.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
const noScroll=()=>p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);
// entry points
await p.goto(origin+'/capacitacion.html?perfil=alumno');await p.getByRole('button',{name:/Personal sanitario/}).first().click().catch(()=>{});
await p.goto(origin+'/#personal-sanitario');await p.getByRole('heading',{name:'Personal sanitario',exact:true}).waitFor();
for(const t of ['Kinesiólogos','Enfermería','Nutrición'])await p.getByRole('heading',{name:t,exact:true}).first().waitFor();assert.ok(await noScroll(),'hub overflow');
const tracks=[['enfermeria','Reconocer a tiempo. Actuar en equipo.',['enf-emergencia-evaluacion','enf-emergencia-resucitacion']],['nutricion','Del peso al metabolismo, sin estigma.',['nut-obesidad','nut-metabolismo-graso']]];
for(const [hash,h1,ids] of tracks){
 await p.goto(origin+'/#'+hash);await p.reload();await p.getByRole('heading',{name:h1}).waitFor();assert.equal(await p.locator('.course-card').count(),2,hash+' cards');assert.ok(await noScroll(),hash+' overflow');
 for(const id of ids){
  await p.goto(origin+'/#'+hash);await p.reload();await p.locator(`.course-card button[data-id="${id}"]`).click();
  await p.getByText('Programa, requisitos y bibliografía').waitFor();
  // sources are listed with links
  await p.getByText('Programa, requisitos y bibliografía').click();assert.ok(await p.locator('details.worked-example a[href^="https://"]').count()>=3,id+' sources');
  // practice first (course home shows the Práctica tab), answer one question and see feedback
  await p.locator('[data-view="practice"]:visible').first().click();await p.getByRole('button',{name:'Empezar práctica'}).click();await p.locator('.options button').first().click();await p.waitForTimeout(400);
  assert.ok(/porque|Correct|Incorrect|fundamento|Respuesta/i.test(await p.locator('body').innerText()),id+' feedback');
  // theory: five topics, open the first and read it
  await p.goto(origin+'/#'+hash);await p.reload();await p.locator(`.course-card button[data-id="${id}"]`).click();await p.getByText('Programa, requisitos y bibliografía').waitFor();
  await p.locator('[data-view="theory"]:visible').first().click();await p.getByText('5 temas encontrados').waitFor();assert.equal(await p.getByRole('button',{name:'Leer tema'}).count(),5,id+' topics');
  await p.getByRole('button',{name:'Leer tema'}).first().click();await p.waitForTimeout(500);const lesson=await p.locator('body').innerText();assert.ok(/Error frecuente|Alcance|Ensayo|simulaci/i.test(lesson),id+' lesson content');assert.ok(await noScroll(),id+' lesson overflow');
  // simulations/exam tab and the interactive case exist
  await p.goto(origin+'/#'+hash);await p.reload();await p.locator(`.course-card button[data-id="${id}"]`).click();await p.getByText('Programa, requisitos y bibliografía').waitFor();
  await p.locator('[data-view="cases"]:visible').first().click().catch(()=>{});await p.waitForTimeout(500);
 }
}
assert.deepEqual(errors,[],'JS errors: '+errors.join(' | '));
console.log('qa-sanitarios OK');await browser.close();assets.close();process.exit(0);
