// Browser check of /tutorial.html: three profiles, five steps each, the mini quiz gives feedback, no overflow at 360 px, links resolve.
import assert from 'node:assert/strict';import {server as assets} from '../server.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
await new Promise(r=>assets.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+assets.address().port;
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const p=await (await browser.newContext({viewport:{width:360,height:640}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(origin+'/tutorial.html');
for(const rol of ['respondedor','sanitario','instructor']){
 await p.locator(`.tabs button[data-rol="${rol}"]`).click();assert.equal(await p.locator('.step').count(),5,rol+' pasos');
 await p.locator('#opts button').nth(0).click();assert.match(await p.locator('#fb').innerText(),/Todavía no|Correcto/);
 await p.locator('#opts button').nth(1).click();assert.match(await p.locator('#fb').innerText(),/Correcto/,rol+' la opción 2 es la correcta');
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),rol+' desborde');
 for(const a of await p.locator('#go a').evaluateAll(l=>l.map(x=>x.getAttribute('href')))){const r=await p.request.get(origin+a.split('#')[0].split('?')[0]);assert.ok(r.status()<400,a+' '+r.status());}
}
await p.goto(origin+'/tutorial.html?rol=instructor');assert.equal(await p.locator('.tabs button[aria-selected=true]').getAttribute('data-rol'),'instructor');
assert.deepEqual(errs,[]);console.log('qa-tutorial OK');await browser.close();assets.close();process.exit(0);
