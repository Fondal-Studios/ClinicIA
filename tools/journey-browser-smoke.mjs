// Run with PLAYWRIGHT_MODULE and CHROME_BIN when the browser is not installed globally.
import assert from 'node:assert/strict';
import {questions} from '../public/learn/courses.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const {server}=await import('../server.mjs');
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote']});
try{
 for(const width of [390,1280]){
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/#fccs/journey`);
  await page.getByRole('heading',{name:'Un próximo paso claro.'}).waitFor();
  assert.equal(await page.locator('.route-node').count(),8);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:`/tmp/clinicia-route-${width}.png`,fullPage:true});
  await page.locator('[data-action="path-next"]').click();
  await page.locator('[data-action="read"]').click();
  await page.locator('details.nav-more summary').click();await page.locator('nav a[href="#fccs/journey"]').click();
  await page.locator('[data-action="path-next"]').click();
  for(let i=0;i<3;i++){
   const prompt=await page.locator('h1.question').innerText(),q=questions.find(q=>q.prompt===prompt);
   assert.ok(q);assert.equal(await page.locator('.feedback').count(),0);
   await page.locator(`[data-action="answer"][data-index="${q.answer}"]`).click();
   await page.locator('[data-action="next"]').click();
  }
  await page.locator('[data-view="journey"]').last().click();
  assert.equal(await page.locator('.route-node.passed').count(),1);
  await page.reload();await page.getByRole('heading',{name:'Un próximo paso claro.'}).waitFor();
  assert.equal(await page.locator('.route-node.passed').count(),1);
  // Open a revised topic: no rationale before submission; all five afterwards.
  await page.locator('.route-chapter').nth(1).locator('summary').click();
  await page.locator('[data-action="path-topic"][data-id="fccs-8"]').click();
  await page.locator('[data-action="start"][data-mode="lesson"]').click();
  assert.equal(await page.locator('.feedback').count(),0);
  await page.locator('[data-action="answer"]').first().click();
  assert.equal(await page.locator('.feedback details ul li').count(),5);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(errors,[]);
  await page.close();
 }
}finally{await browser.close();await new Promise(r=>server.close(r));}

console.log('Journey smoke passed: mobile + desktop, next step, lesson pass, reload, revised feedback, no overflow or page errors.');
