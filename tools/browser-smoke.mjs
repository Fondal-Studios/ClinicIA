// Optional visual smoke test: PLAYWRIGHT_MODULE and CHROME_BIN may point to local installs.
import assert from 'node:assert/strict';
import {questions} from '../public/learn/courses.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const {server}=await import('../server.mjs');
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:['--no-sandbox']});
try{
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
const url=process.env.TEST_URL||`http://127.0.0.1:${server.address().port}`;
await page.goto(url);await page.locator('.exam-hero').waitFor();
assert.equal(await page.locator('a[href*="consultorio"]').count(),0);
assert.ok((await page.locator('h1').innerText()).includes('Estudiá para tu residencia'));
await page.locator('header [data-view="points"]').click();await page.getByText('Así ganás tus puntos.').waitFor();assert.equal(await page.locator('.reward-rules article').count(),4);assert.ok((await page.locator('.points-example').innerText()).includes('9 puntos'));
await page.locator('nav a[href$="/plans"]').click();assert.ok((await page.locator('.offer.featured').innerText()).includes('Gratis'));assert.equal(await page.locator('[data-action="buy"]').count(),0);
await page.locator('nav a[href$="/home"]').click();
const noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'horizontal overflow');
await noOverflow();await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(100);await page.screenshot({path:'/tmp/clinicia-home-mobile.png',fullPage:true});
await page.locator('nav a[href$="/theory"]').click();await page.locator('#topic-search').fill('diabetes');await page.locator('[data-action="filter"]').click();assert.ok((await page.locator('.path article').count())>0);
await page.locator('[data-action="theory"]').first().click();await page.locator('[data-action="start"][data-mode="lesson"]').click();
assert.equal(await page.locator('.worked-example,.concept-trap,.feedback').count(),0);await noOverflow();
await page.locator('[data-action="answer"]').first().click();assert.equal(await page.locator('.feedback').count(),1);
await page.locator('nav a[href$="/exams"]').click();await page.locator('[data-action="exam-start"][data-id="sprint"]').click();
const prompt=await page.locator('h1.question').innerText();const q=questions.find(q=>q.prompt===prompt);assert.ok(q);
await page.locator(`[data-action="exam-answer"][data-index="${q.answer}"]`).click();assert.equal(await page.locator('.feedback,.correct').count(),0);
await page.locator('[data-action="exam-flag"]').click();await noOverflow();await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(100);await page.screenshot({path:'/tmp/clinicia-exam-mobile.png',fullPage:true});
await page.reload();assert.equal(await page.locator('h1.question').innerText(),prompt);assert.equal(await page.locator('[data-action="exam-answer"][aria-pressed="true"]').count(),1);
await page.locator('[data-action="exam-submit"]').click();await page.getByText('Tu resultado, tu próximo paso.').waitFor();assert.equal(await page.locator('.result').innerText(),'1/20');
let progress=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinicia-learning-v1')));assert.equal(progress.examHistory.length,1);assert.equal(progress.evidence[q.id].total,1);
await page.reload();progress=await page.evaluate(()=>JSON.parse(localStorage.getItem('clinicia-learning-v1')));assert.equal(progress.evidence[q.id].total,1);
await page.locator('nav a[href$="/market"]').click();await page.locator('.market-grid').waitFor();await page.waitForFunction(()=>[...document.querySelectorAll('.sprite-stage img')].every(i=>i.complete&&i.naturalWidth>0));await noOverflow();await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(100);await page.screenshot({path:'/tmp/clinicia-market-mobile.png',fullPage:true});
assert.equal(await page.locator('.sprite-stage img').count(),4);assert.ok(await page.locator('.sprite-stage img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)));
// Seed an earned ledger to test cosmetic purchase/UI without grinding 80 questions.
await page.evaluate(ids=>{const s=JSON.parse(localStorage.getItem('clinicia-learning-v1'));s.wallet.ledger=Object.fromEntries(ids.map(id=>['first:'+id,1]));localStorage.setItem('clinicia-learning-v1',JSON.stringify(s));},questions.slice(0,100).map(q=>q.id));
await page.reload();await page.locator('[data-action="buy"][data-id="ynara"]').click();assert.equal(await page.locator('.wallet .result').innerText(),'20');assert.equal(await page.locator('.companion img').count(),1);
await page.locator('#nickname').fill('<script>study</script>');await page.locator('[data-action="nickname"]').click();assert.ok((await page.locator('.companion').innerText()).includes('<script>study</script>'));
await page.reload();assert.equal(await page.locator('.wallet .result').innerText(),'20');await noOverflow();
for(const id of ['phtls','atls','acls','pals','fccs']){await page.locator('#course-select').selectOption(id);await page.locator(`nav a[href="#${id}/theory"]`).click();await page.locator('[data-action="theory"]').first().click();await page.locator('[data-action="start"][data-mode="lesson"]').click();assert.equal(await page.locator('.feedback').count(),0);await noOverflow();}
await page.setViewportSize({width:1440,height:1000});await page.locator('#course-select').selectOption('examen-unico');await page.locator('nav a[href$="/home"]').click();await page.locator('.exam-hero').waitFor();await noOverflow();await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(100);await page.screenshot({path:'/tmp/clinicia-home-desktop.png',fullPage:true});
assert.deepEqual(errors,[]);console.log('Browser smoke passed: mobile 390px + desktop, six courses, exam resume/grade, market purchase/persistence, hidden consultorio, no JS errors or horizontal overflow.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
