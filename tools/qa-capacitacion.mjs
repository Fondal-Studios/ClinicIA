import assert from 'node:assert/strict';
import http from 'node:http';
import {PGlite} from '@electric-sql/pglite';
import {createAccounts,hashPassword} from '../backend/accounts.mjs';
import {server as assets} from '../server.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const db=new PGlite();let accounts;
const server=http.createServer((req,res)=>req.url.startsWith('/api/account')?accounts.handler(req,res,new URL(req.url,origin)):assets.emit('request',req,res));
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
process.env.HOSPITAL_ISSUER_USERNAME='qa_admin';
accounts=await createAccounts({db,origin,secure:false,adminName:'qa_admin',adminHash:await hashPassword('qa-admin-initial-password')});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:process.env.CHROME_ARGS?JSON.parse(process.env.CHROME_ARGS):['--no-sandbox','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/capacitacion.html');await page.getByRole('heading',{name:'Prepararse para ayudar. Coordinar para cuidar.'}).waitFor();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:'/tmp/clinic-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Continuar el curso',exact:true}).click();await page.getByRole('button',{name:'Abrir módulo',exact:true}).first().click();
 await page.getByRole('heading',{name:'Ensayo en grupos de tres'}).waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:'/tmp/clinic-simulation.png',fullPage:true});
 await page.getByRole('button',{name:'Ingresar / crear cuenta',exact:true}).click();await page.locator('select[name=action]').selectOption('register');await page.locator('input[name=username]').fill('qa_alumno');await page.locator('input[name=password]').fill('qa-only-long-password');await page.locator('input[name=accepted]').check();await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.getByRole('button',{name:'Ya lo guardé: continuar'}).click();
 await page.getByRole('button',{name:'Continuar el curso',exact:true}).click();await page.getByRole('button',{name:'Rendir / continuar evaluación'}).click();await page.locator('input[type=radio]').first().check();await page.getByText('Respuesta guardada en tu cuenta',{exact:true}).waitFor();
 await page.reload();await page.getByRole('button',{name:'Continuar el curso',exact:true}).click();await page.getByRole('button',{name:'Rendir / continuar evaluación'}).click();await page.locator('input[type=radio]:checked').waitFor();assert.equal(await page.locator('input[type=radio]:checked').count(),1);
 await page.getByRole('button',{name:'Instructor',exact:true}).click();await page.getByRole('button',{name:'Activar modo instructor'}).click();await page.locator('input[name=title]').fill('Prueba visual Cafayate');await page.getByRole('button',{name:'Crear grupo',exact:true}).click();await page.getByRole('button',{name:'Prueba visual Cafayate'}).waitFor();
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'/tmp/clinic-instructor.png',fullPage:true});
 await page.getByRole('button',{name:'Mis cursos',exact:true}).click();await page.screenshot({path:'/tmp/clinic-desktop.png',fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 // A fresh browser session must retrieve the same progress after login.
 const fresh=await browser.newContext({viewport:{width:390,height:844}});const second=await fresh.newPage();second.on('pageerror',e=>errors.push(e.message));
 await second.goto(origin+'/capacitacion.html');await second.getByRole('button',{name:'Ingresar / crear cuenta',exact:true}).click();await second.locator('input[name=username]').fill('qa_alumno');await second.locator('input[name=password]').fill('qa-only-long-password');await second.getByRole('button',{name:'Continuar',exact:true}).click();
 await second.getByRole('button',{name:'Continuar el curso',exact:true}).click();await second.getByRole('button',{name:'Rendir / continuar evaluación'}).click();await second.locator('input[type=radio]:checked').waitFor();
 await second.getByRole('button',{name:'Mis cursos',exact:true}).click();assert.equal(await second.getByRole('button',{name:'Abrir minicurso',exact:true}).count(),3);
 for(let i=0;i<3;i++){await second.getByRole('button',{name:'Abrir minicurso',exact:true}).nth(i).click();await second.getByRole('button',{name:'Abrir módulo',exact:true}).first().click();await second.getByRole('heading',{name:'Ejercicio de coordinación'}).waitFor();await second.getByRole('button',{name:'Marcar como leído',exact:true}).click();await second.getByRole('button',{name:'Leído ✓',exact:true}).waitFor();await second.getByRole('button',{name:'Volver al curso',exact:true}).click();await second.getByRole('button',{name:'Rendir / continuar evaluación'}).click();await second.getByText('EVALUACIÓN · 1/20',{exact:true}).waitFor();await second.getByRole('button',{name:'Mis cursos',exact:true}).click();}
 await fresh.close();
 // The administrator can change the initial password in the course UI.
 const adminContext=await browser.newContext({viewport:{width:390,height:844}});const adminPage=await adminContext.newPage();adminPage.on('pageerror',e=>errors.push(e.message));await adminPage.goto(origin+'/capacitacion.html');await adminPage.getByRole('button',{name:'Ingresar / crear cuenta',exact:true}).click();await adminPage.locator('input[name=username]').fill('qa_admin');await adminPage.locator('input[name=password]').fill('qa-admin-initial-password');await adminPage.getByRole('button',{name:'Continuar',exact:true}).click();await adminPage.getByRole('heading',{name:'Activar cuenta: cambiar contraseña inicial'}).waitFor();await adminPage.locator('input[name=currentPassword]').fill('qa-admin-initial-password');await adminPage.locator('input[name=password]').fill('qa-admin-new-password');await adminPage.getByRole('button',{name:'Guardar contraseña',exact:true}).click();await adminPage.getByRole('button',{name:'Ya lo guardé: continuar'}).click();await adminPage.locator('#account').click();await adminPage.getByText('Rol: Administrador',{exact:true}).waitFor();await adminPage.getByText('Tu cuenta está autorizada para emitir certificados hospitalarios.',{exact:true}).waitFor();assert.ok(await adminPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await adminPage.screenshot({path:'/tmp/clinic-admin-mobile.png',fullPage:true});await adminContext.close();
 await page.goto(origin+'/');await page.getByRole('heading',{name:'Aprender para cuidar.',exact:true}).waitFor();assert.equal(await page.locator('a[href*="consultorio"]').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS: 390px + 1440px, simulations, registration, persisted answer after reload, fresh-browser login, 3 minicourses, admin password/role/issuer, instructor/group, hidden consultorio, no JS errors');
}finally{await browser.close();await new Promise(r=>server.close(r));await db.close();}
