// End-to-end check of the classroom flow in a real browser, against an in-memory PostgreSQL engine and simulated AI/web services.
// Run with PLAYWRIGHT_MODULE=/path/to/playwright and CHROME_BIN when the browser is not installed globally.
import assert from 'node:assert/strict';import http from 'node:http';import {readFile} from 'node:fs/promises';import {resolve,extname,sep} from 'node:path';
import {PGlite} from '@electric-sql/pglite';import {createAccounts} from '../backend/accounts.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
Object.assign(process.env,{TUTOR_PROVIDER:'anthropic',ANTHROPIC_API_KEY:'x',ANTHROPIC_MODEL:'m'});
const q=(n)=>({prompt:'Pregunta de glomerulopatía '+n,options:['A'+n,'B'+n,'C'+n,'D'+n,'E'+n],answer:n%5,why:'Explicación '+n,sources:['W1']});
const aiClass={title:'Glomerulopatías para residentes',summary:'Resumen',objectives:['Distinguir nefrítico de nefrótico'],sections:[{heading:'Síndrome nefrótico',body:'Proteinuria masiva y edema.',sources:['W1']},{heading:'Síndrome nefrítico',body:'Hematuria e hipertensión.',sources:['W1']}],
 slides:[{title:'Nefrótico',bullets:['Proteinuria','Edema'],notes:'Nota',sources:['W1']},{title:'Nefrítico',bullets:['Hematuria'],notes:'',sources:['W1']}],questions:[1,2,3,4,5].map(q),case:{scenario:'Paciente ficticio con edema.',question:q(6)},game:{pairs:[1,2,3,4].map(n=>({term:'Término '+n,definition:'Definición '+n}))}};
const realFetch=globalThis.fetch;
globalThis.fetch=async(url,args)=>{url=String(url);
 if(url.startsWith('http://127.0.0.1'))return realFetch(url,args);
 if(url.startsWith('https://api.anthropic.com')){const system=JSON.parse(args.body).system,text=system.startsWith('Devolvé solo JSON {"queries"')?JSON.stringify({queries:['glomerulonephritis','glomerulopatía']}):system.includes('UN elemento')?JSON.stringify({item:{...q(9),prompt:'Pregunta regenerada',sources:['W1']}}):JSON.stringify(aiClass);return {ok:true,json:async()=>({stop_reason:'end_turn',content:[{type:'text',text}]})};}
 if(url.includes('europepmc'))return {ok:true,json:async()=>({resultList:{result:[{title:'Glomerular disease',abstractText:'Resumen.',doi:'10.1/x',pubYear:'2024'}]}})};
 if(url.includes('nlm.nih.gov'))return {ok:true,text:async()=>'<nlmSearchResult></nlmSearchResult>'};
 return {ok:true,json:async()=>({})};};
const db=new PGlite(),root=resolve('public');let accounts;
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://x');if(url.pathname.startsWith('/api/')){if(await accounts.handler(req,res,url))return;res.writeHead(404);return res.end();}
 const p=resolve(root,'.'+decodeURIComponent(url.pathname));if(!p.startsWith(root+sep))throw 0;const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript','.css':'text/css'};res.writeHead(200,{'Content-Type':types[extname(p)]||'application/octet-stream'});res.end(await readFile(p));}catch(e){if(!res.headersSent){res.writeHead(404);res.end();}console.error('harness',e?.message||e);}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
accounts=await createAccounts({db,origin:base,secure:false});
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote']});
const person=async(name,teacher=false)=>{const ctx=await browser.newContext({viewport:{width:390,height:844}});if(teacher)await ctx.addInitScript(()=>{try{localStorage.setItem('clinia_mode','teacher');}catch{}});const r=await ctx.request.post(base+'/api/account/register',{headers:{Origin:base},data:{username:name,password:'clave-segura-123',accepted:true}});assert.equal(r.status(),201);if(teacher){const m=await ctx.request.post(base+'/api/account/modes',{headers:{Origin:base},data:{mode:'teacher',accepted:true}});assert.equal(m.status(),200);}const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());return {ctx,page,errors};};
try{
 const t=await person('Profe',true),s=await person('Alumna');
 await t.page.goto(base+'/aulas.html');
 await t.page.locator('textarea').first().fill('Clase de glomerulopatías para residentes: nefrítico vs nefrótico, 30 minutos.');
 await t.page.getByRole('button',{name:'Crear con el tutor'}).click();
 await t.page.getByRole('heading',{name:'Glomerulopatías para residentes'}).waitFor();
 // edit: title, add a teacher-authored question, regenerate another with AI, then save
 await t.page.getByRole('tab',{name:'Preguntas',exact:true}).click();
 await t.page.getByRole('button',{name:'+ Agregar pregunta'}).click();
 const cards=t.page.locator('.card');const last=cards.last();
 await last.locator('textarea').first().fill('Pregunta propia del docente');
 const inputs=last.locator('input:not([type=radio])');for(let i=0;i<5;i++)await inputs.nth(i).fill('Opción propia '+(i+1));
 await last.locator('textarea').nth(1).fill('Porque lo dice el docente');
 await t.page.getByRole('button',{name:'Regenerar con IA'}).first().click();
 await t.page.waitForFunction(()=>[...document.querySelectorAll('textarea')].some(x=>x.value==='Pregunta regenerada'));
 await t.page.getByRole('tab',{name:'Datos',exact:true}).click();
 await t.page.locator('label:has-text("Título") input').fill('Glomerulopatías — Residentes R1');
 await t.page.getByRole('button',{name:'Guardar cambios'}).click();
 await t.page.getByText('Cambios guardados.').waitFor();
 // students cannot join a draft
 await t.page.getByRole('tab',{name:'Alumnos y códigos'}).click();
 const studentCode=(await t.page.locator('.code').first().innerText()).trim();assert.match(studentCode,/^[A-Z2-9]{8}$/);
 await s.page.goto(base+'/aulas.html');await s.page.getByLabel('Código del aula').fill(studentCode);await s.page.locator('input[type=checkbox]').check();await s.page.getByRole('button',{name:'Unirme',exact:true}).click();
 await s.page.getByText('todavía no está publicada').waitFor();
 // publish, then the student joins and studies
 await t.page.getByRole('button',{name:'Publicar'}).click();await t.page.getByText('Publicada. Compartí el código').waitFor();
 await s.page.getByRole('button',{name:'Unirme',exact:true}).click();
 await s.page.getByRole('heading',{name:'Glomerulopatías — Residentes R1'}).waitFor();
 await s.page.getByText('Necesitás 80% en la evaluación').waitFor();
 assert.equal(await s.page.locator('.slide h2').innerText(),'Nefrótico');await s.page.getByRole('button',{name:'Siguiente →'}).click();assert.equal(await s.page.locator('.slide h2').innerText(),'Nefrítico');
 await s.page.getByRole('tab',{name:'Juego',exact:true}).click();
 for(let n=1;n<=4;n++){await s.page.locator(`[data-t="Término ${n}"]`).click();await s.page.getByRole('button',{name:'Definición '+n,exact:true}).click();}
 await s.page.getByText('¡Completaste el juego!').waitFor();
 assert.ok(await s.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal scroll on mobile');
 // the answer key never reaches the student's browser: only the server grades
 const leaked=await s.page.evaluate(async()=>JSON.stringify(await (await fetch('/api/account/classes')).json()));assert.ok(!leaked.includes('"answer"'));
 // fail an exam first (every pick wrong), then pass it
 await s.page.getByRole('tab',{name:'Evaluación',exact:true}).click();
 const pickAll=async which=>{await s.page.getByRole('button',{name:/Comenzar evaluación|Nuevo intento/}).click();await s.page.locator('form fieldset').first().waitFor({timeout:8000}).catch(async e=>{console.log('ERRS',s.errors,(await s.page.locator('#aula').innerText()).slice(0,600));console.log('STATUS',await s.page.locator('[role=status]').allInnerTexts(),await s.page.locator('#aula-status').innerText());throw e;});
  const n=await s.page.locator('form fieldset').count();
  for(let i=0;i<n;i++){const f=s.page.locator('form fieldset').nth(i);const legend=await f.locator('legend').innerText();const text=legend.replace(/^\d+\.\s*/,'');
   const known={'Pregunta propia del docente':'Opción propia 1','Pregunta regenerada':'E9'};let correct=known[text];if(!correct){const m=text.match(/(\d+)$/);correct=m?'ABCDE'[Number(m[1])%5]+m[1]:null;}
   const labels=f.locator('label.option-row');const count=await labels.count();let idx=-1;for(let k=0;k<count;k++){if((await labels.nth(k).innerText()).trim()===correct){idx=k;break;}}
   assert.ok(which==='wrong'||idx>=0,'known correct option for: '+text);
   await labels.nth(which==='right'?idx:(idx>=0?(idx+1)%count:0)).locator('input').check();}
  await s.page.getByRole('button',{name:'Entregar'}).click();};
 await pickAll('wrong');await s.page.getByText(/Todavía no alcanzás el 80%/).waitFor();
 await pickAll('right');await s.page.getByText(/Aprobado: superaste/).waitFor();
 // teacher sees the result
 await t.page.reload();await t.page.getByRole('tab',{name:'Alumnos y códigos'}).click();
 await t.page.getByRole('cell',{name:'Alumna'}).waitFor();await t.page.getByText('✔ Aprobado').waitFor();await t.page.getByText(/1 aprobados \(100%\)/).waitFor();
 await t.page.screenshot({path:'/tmp/clinicia-aulas-teacher.png',fullPage:true});await s.page.screenshot({path:'/tmp/clinicia-aulas-student.png',fullPage:true});
 // library (teacher mode): browse the bank, add questions and theory to the class, students still never see answers
 await t.page.goto(base+'/aulas.html#biblioteca');
 await t.page.getByRole('heading',{name:'Biblioteca'}).waitFor();
 await t.page.getByText(/resultado\(s\)/).waitFor();
 await t.page.locator('input[aria-label="Buscar"]').fill('ritmo');await t.page.getByRole('button',{name:'Buscar',exact:true}).click();
 await t.page.waitForFunction(()=>/\d+ resultado/.test(document.body.innerText));
 const boxes=t.page.locator('details.card input[type=checkbox]');assert.ok(await boxes.count()>=2);await boxes.nth(0).check();await boxes.nth(1).check();
 await t.page.getByRole('button',{name:'Agregar 2 al aula'}).click();
 await t.page.getByText(/Agregado al aula: 2 pregunta/).waitFor({timeout:8000}).catch(async e=>{console.log('STATUS:',await t.page.locator('#aula-status').innerText());throw e;});
 const lib=await t.page.evaluate(async()=>{const c=(await (await fetch('/api/account/classes')).json()).classes[0];const d=await (await fetch('/api/account/classes/'+c.id)).json();return {n:d.content.questions.length,last:d.content.questions.at(-1),sources:d.content.sources.length};});
 assert.equal(lib.n,8);assert.ok(lib.last.options.length===5&&lib.last.sources.length===1&&lib.sources>=2);
 const leakedAgain=await s.page.evaluate(async()=>JSON.stringify(await (await fetch('/api/account/library?facets=1')).json()));assert.ok(leakedAgain.includes('permission')||leakedAgain.includes('error')||leakedAgain.includes('teacher'),'students cannot open the library');
 assert.deepEqual([...t.errors,...s.errors],[]);
 console.log('aulas e2e ok');
}finally{await browser.close();server.close();await db.close();}
