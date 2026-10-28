import assert from 'node:assert/strict';
import http from 'node:http';
import {createHash} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {createAccounts,hashPassword} from '../backend/accounts.mjs';
import {server as assets} from '../server.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const db=new PGlite();let accounts;
const server=http.createServer((req,res)=>req.url.startsWith('/api/account')?accounts.handler(req,res,new URL(req.url,origin)):assets.emit('request',req,res));
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const code='1'.repeat(48);process.env.ADMIN_RECOVERY_GRANT=JSON.stringify({username:'RecoveryAdmin',tokenHash:createHash('sha256').update(code).digest('hex'),expiresAt:new Date(Date.now()+3600000).toISOString()});
accounts=await createAccounts({db,origin,secure:false,adminName:'RecoveryAdmin',adminHash:await hashPassword('old-test-password')});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/recuperar-cuenta.html');await page.screenshot({path:'/tmp/clinic-recovery.png',fullPage:true});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.locator('[name=username]').fill('RecoveryAdmin');await page.locator('[name=recoveryCode]').fill(code);await page.locator('[name=password]').fill('new-private-test-password');await page.locator('[name=confirmation]').fill('new-private-test-password');await page.getByRole('button',{name:'Guardar nueva contraseña'}).click();
 await page.getByRole('heading',{name:'Tu acceso está recuperado'}).waitFor();await page.getByText('Usuario: RecoveryAdmin · Rol: Administrador',{exact:true}).waitFor();assert.equal((await page.locator('#new-code').textContent()).length,48);
 await page.getByRole('link',{name:'Entrar a mis cursos'}).click();await page.getByRole('button',{name:'RecoveryAdmin',exact:true}).waitFor();
 const second=await browser.newPage();await second.goto(origin+'/recuperar-cuenta.html');await second.locator('[name=username]').fill('RecoveryAdmin');await second.locator('[name=recoveryCode]').fill(code);await second.locator('[name=password]').fill('another-test-password');await second.locator('[name=confirmation]').fill('another-test-password');await second.getByRole('button',{name:'Guardar nueva contraseña'}).click();await second.getByText('No pudimos validar esos datos. El código puede haber vencido o ya haberse utilizado.',{exact:true}).waitFor();
 assert.deepEqual(errors,[]);console.log('PASS: mobile recovery form, new password, retained admin role, signed-in courses, rejected code reuse');
}finally{await browser.close();await new Promise(r=>server.close(r));await db.close();}
