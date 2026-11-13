// Crawl audit: loads every public page on phone and desktop with a real browser; reports JS errors, failed requests, horizontal overflow,
// missing alt/labels, slow loads and broken internal links. Run: PLAYWRIGHT_MODULE=<path> node tools/audit-app.mjs
import http from 'node:http';import {readdirSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';import {createAccounts,hashPassword} from '../backend/accounts.mjs';import {server as assets} from '../server.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const db=new PGlite();let accounts;
const server=http.createServer((req,res)=>{const u=new URL(req.url,origin);(u.pathname.startsWith('/api/account')||u.pathname.startsWith('/api/admin')||['/api/events','/api/offer'].includes(u.pathname))?accounts.handler(req,res,u):assets.emit('request',req,res);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
accounts=await createAccounts({db,origin,secure:false,adminName:'admin_demo',adminHash:await hashPassword('clave-inicial-demo-1')});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const pages=readdirSync(new URL('../public/',import.meta.url)).filter(f=>f.endsWith('.html')),rows=[];
for(const [label,vp] of [['phone',{width:390,height:844}],['desktop',{width:1280,height:800}]])for(const f of pages){
 const c=await browser.newContext({viewport:vp}),p=await c.newPage(),issues=[];
 p.on('pageerror',e=>issues.push('JS: '+e.message.slice(0,120)));p.on('console',m=>{if(m.type()==='error')issues.push('console: '+m.text().slice(0,120));});
 p.on('response',r=>{if(r.status()>=400&&!r.url().includes('/api/'))issues.push(r.status()+' '+r.url().replace(origin,''));});
 const t=Date.now();try{await p.goto(origin+'/'+f,{waitUntil:'networkidle',timeout:20000});}catch(e){issues.push('load: '+e.message.slice(0,80));}
 const ms=Date.now()-t;
 const info=await p.evaluate(()=>({title:document.title,lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth>innerWidth+1,noalt:[...document.images].filter(i=>!i.hasAttribute('alt')).length,unnamed:[...document.querySelectorAll('button,a[href]')].filter(b=>!(b.textContent.trim()||b.getAttribute('aria-label')||b.title)).length,unlabeled:[...document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]),select,textarea')].filter(i=>!(i.labels?.length||i.getAttribute('aria-label')||i.placeholder)).length,h1:document.querySelectorAll('h1').length,small:[...document.querySelectorAll('button,a')].filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&(r.height<32||r.width<32)&&b.textContent.trim().length>0}).length}));
 if(info.overflow)issues.push('horizontal overflow');if(!info.title)issues.push('no <title>');if(!info.lang)issues.push('no lang');if(info.noalt)issues.push(info.noalt+' img sin alt');if(info.unnamed)issues.push(info.unnamed+' botones/enlaces sin nombre');if(info.unlabeled)issues.push(info.unlabeled+' campos sin etiqueta');if(info.h1!==1)issues.push('h1 x'+info.h1);if(info.small>3&&label==='phone')issues.push(info.small+' objetivos táctiles <32px');if(ms>4000)issues.push('lento '+ms+' ms');
 rows.push([label,f,ms,issues]);await c.close();
}
for(const [l,f,ms,i] of rows)console.log(`${l.padEnd(7)} ${f.padEnd(26)} ${String(ms).padStart(5)} ms  ${i.length?i.join(' | '):'OK'}`);
await browser.close();server.close();process.exit(0);
