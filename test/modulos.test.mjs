import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,readdirSync,statSync,existsSync} from 'node:fs';import {join,dirname,resolve,relative} from 'node:path';
const root=resolve('public'),mods=JSON.parse(readFileSync('modules.json','utf8')),NAMES=['compartido','alumno','instructor','profesional'];
const walk=d=>readdirSync(d).flatMap(n=>{const p=join(d,n);return statSync(p).isDirectory()?walk(p):[relative(root,p)];});
const match=(pat,f)=>pat.endsWith('/**')?f.startsWith(pat.slice(0,-2)):pat===f;
// Un archivo nombrado exactamente gana sobre una carpeta (p. ej. learn/precios.mjs es compartido aunque learn/** sea del alumno).
const ownerOf=f=>{const hits=NAMES.flatMap(m=>mods[m].archivos.filter(p=>match(p,f)).map(p=>({m,exact:!p.endsWith('/**')})));const exact=hits.filter(h=>h.exact);return [...new Set((exact.length?exact:hits).map(h=>h.m))];};
// Dependencias que carga un archivo del navegador: import estático o dinámico, <script src> y <link href> locales (no los enlaces <a>).
function deps(f){const t=readFileSync(join(root,f),'utf8'),out=new Set();
 if(f.endsWith('.mjs'))for(const m of t.matchAll(/(?:import\s*(?:[^'"()]*?from\s*)?|import\()\s*['"](\.{1,2}\/[^'"]+)['"]/g))out.add(m[1]);
 if(f.endsWith('.html'))for(const m of t.matchAll(/<(?:script|link)\b[^>]*?(?:src|href)=["']([^"'#?]+)/g))out.add(m[1]);
 return [...out].filter(d=>!/^https?:|^data:|^\/\//.test(d)).map(d=>relative(root,d.startsWith('/')?join(root,d):resolve(dirname(join(root,f)),d)));}
test('cada archivo de public/ pertenece exactamente a un módulo',()=>{
 const files=walk(root);assert.ok(files.length>80);
 const sin=files.filter(f=>ownerOf(f).length===0),multi=files.filter(f=>ownerOf(f).length>1);
 assert.deepEqual(sin,[],'archivos sin módulo: agregarlos a modules.json');assert.deepEqual(multi,[],'archivos en más de un módulo');
 for(const m of NAMES)for(const p of mods[m].archivos)if(!p.endsWith('/**'))assert.ok(existsSync(join(root,p)),m+': no existe '+p);
});
test('un módulo solo carga archivos propios o del núcleo compartido (así se puede separar)',()=>{
 const bad=[];
 for(const f of walk(root).filter(f=>/\.(mjs|html)$/.test(f))){const [mod]=ownerOf(f);if(!mod||mod==='compartido'&&false)continue;
  for(const d of deps(f)){const [dm]=ownerOf(d);if(!dm){if(!/\.(css|json|webmanifest|png|jpe?g|svg)$/.test(d)||existsSync(join(root,d)))bad.push(`${f} (${mod}) carga ${d} que no pertenece a ningún módulo`);continue;}
   const opcional=(mods[mod].opcionales||[]).includes(d);if(dm!==mod&&dm!=='compartido'&&!opcional)bad.push(`${f} (${mod}) carga ${d} del módulo ${dm}`);
   if(mod==='compartido'&&dm!=='compartido')bad.push(`${f} (compartido) depende de ${d} del módulo ${dm}`);}}
 assert.deepEqual(bad,[]);
});
test('el módulo profesional es autónomo: sus archivos más lo mínimo del núcleo alcanzan para funcionar sin servidor',()=>{
 const p=mods.profesional,permitidos=new Set([...p.archivos,...p.opcionales,...p.autonomo.necesita]);
 const closure=new Set(),pend=[p.autonomo.entrada];while(pend.length){const f=pend.pop();if(closure.has(f))continue;closure.add(f);for(const d of deps(f))if(existsSync(join(root,d))&&/\.(mjs|html|css|webmanifest)$/.test(d))pend.push(d);}
 const fuera=[...closure].filter(f=>!permitidos.has(f));assert.deepEqual(fuera,[],'el módulo profesional depende de archivos fuera de su paquete');
 for(const f of p.autonomo.necesita)assert.ok(existsSync(join(root,f)),f);
});
test('ningún otro módulo importa código del módulo profesional ni al revés (solo enlaces entre páginas)',()=>{
 for(const f of walk(root).filter(f=>/\.mjs$/.test(f)&&!mods.profesional.archivos.includes(f)))for(const d of deps(f))assert.ok(!mods.profesional.archivos.includes(d),f+' importa '+d);
});
test('backend: cada archivo está asignado a un módulo',()=>{
 const listed=new Set(['compartido','alumno','instructor','profesional'].flatMap(m=>mods.backend[m]));const real=readdirSync('backend');
 assert.deepEqual(real.filter(f=>!listed.has(f)),[],'archivos de backend sin módulo');assert.deepEqual([...listed].filter(f=>!real.includes(f)),[],'archivos inexistentes en modules.json');
});
