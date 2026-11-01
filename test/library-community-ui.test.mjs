import test from 'node:test';
import assert from 'node:assert/strict';
import {mountLibrary,libraryRoute} from '../public/biblioteca.mjs';
class Node{
 constructor(tag,text=''){this.tag=tag;this.nodeType=tag==='#text'?3:1;this.children=[];this.attrs={};this.events={};this.value=text;this.disabled=false;}
 append(...nodes){this.children.push(...nodes.map(x=>x?.nodeType?x:new Node('#text',String(x))));}
 replaceChildren(...nodes){this.children=[];this.append(...nodes);}
 setAttribute(k,v){this.attrs[k]=v;if(k==='disabled')this.disabled=true;}
 addEventListener(k,v){(this.events[k]??=[]).push(v);}
 get textContent(){return this.tag==='#text'?this.value:this.children.map(x=>x.textContent).join('');}
 set textContent(v){this.children=[new Node('#text',v)];}
 async fire(k){if(k==='click'&&this.disabled)return;for(const fn of this.events[k]||[])await fn({target:this,currentTarget:this});}
}
const find=(n,tag)=>[...(n.tag===tag?[n]:[]),...n.children.flatMap(x=>find(x,tag))];
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
const tick=()=>new Promise(r=>setImmediate(r));
const id='11111111-1111-1111-1111-111111111111';
const approved={class_id:id,title:'Sepsis revisada',author:'Docente',specialty:'Emergencias',module:'Introducción'};
function setup({hash='',user=null,handler=async()=>({classes:[approved]})}={}){
 global.document={createElement:t=>new Node(t),createTextNode:s=>new Node('#text',s)};
 const root=new Node('div'),status=new Node('p'),calls=[],events={};
 const win={location:{hash,href:''},addEventListener:(k,fn)=>events[k]=fn};
 const request=async(url,opts)=>{calls.push({url,...opts});return {ok:true,json:async()=>url==='/api/account/me'?{user}:handler(url,opts)};};
 mountLibrary({root,status,win,request});
 return {root,status,calls,win,go:async(hash)=>{win.location.hash=hash;await events.hashchange();await tick();}};
}
test('library starts with roles and preserves student professions without granting permissions',async()=>{
 const s=setup();await tick();assert.match(s.root.textContent,/Soy alumno/);assert.match(s.root.textContent,/Soy instructor/);
 await s.go('#alumno');for(const label of ['Médico','Primer respondedor','Otro personal sanitario','Rotante'])assert.ok(s.root.textContent.includes(label));
 await s.go('#alumno/sanitario/libros');for(const label of ['Enfermería','Kinesiología','Nutrición'])assert.ok(s.root.textContent.includes(label));
 assert.ok(find(s.root,'a').some(a=>a.attrs.href==='/#tutor'));assert.doesNotMatch(s.root.textContent,/null/);
 await s.go('#instructor/todos/libros');assert.ok(find(s.root,'a').some(a=>a.attrs.href==='/aulas.html'));assert.ok(find(s.root,'a').some(a=>a.attrs.href==='/capacitacion.html?perfil=instructor'));
 assert.equal(s.calls.filter(c=>c.method==='POST').length,0);assert.ok(!find(s.root,'a').some(a=>a.attrs.href==='/editorial-admin.html'));
 await s.go('#alumno');assert.match(s.root.textContent,/¿Cuál es tu recorrido/);await s.go('#');assert.match(s.root.textContent,/Soy instructor/);
 assert.deepEqual(libraryRoute('#alumno/unknown/clases'),{role:'alumno',profile:''});
});
test('books and approved classes have working search and specialty filters, safe text and real admin link',async()=>{
 const s=setup({hash:'#alumno/medico/libros',user:{role:'admin'}});await tick();await tick();assert.match(s.root.textContent,/NCBI Bookshelf/);
 let search=find(s.root,'input')[0];search.value='fisiologia';await search.fire('input');assert.match(s.root.textContent,/Anatomy and Physiology/);assert.doesNotMatch(s.root.textContent,/NCBI Bookshelf/);
 search.value='';await search.fire('input');await s.go('#alumno/medico/clases');assert.match(s.root.textContent,/Sepsis revisada/);assert.ok(find(s.root,'a').some(a=>a.attrs.href.endsWith('/clases/'+id)));
 const select=find(s.root,'select')[0];select.value='Otra';await select.fire('change');assert.doesNotMatch(s.root.textContent,/Sepsis revisada/);assert.match(s.root.textContent,/No se encontraron/);
 select.value='';await select.fire('change');assert.ok(find(s.root,'a').some(a=>a.attrs.href==='/editorial-admin.html'));
 const unsafe=setup({hash:'#alumno/medico/clases',handler:async()=>({classes:[{...approved,title:'<script>no ejecutar</script>'}]})});await tick();assert.match(unsafe.root.textContent,/<script>/);assert.equal(find(unsafe.root,'script').length,0);
});
test('late class loads cannot replace books after back navigation; errors offer retry',async()=>{
 const waiting=deferred(),s=setup({hash:'#alumno/medico/clases',handler:()=>waiting.promise});await tick();await s.go('#alumno/medico/libros');waiting.resolve({classes:[approved]});await tick();assert.match(s.root.textContent,/NCBI Bookshelf/);assert.doesNotMatch(s.root.textContent,/Sepsis revisada/);assert.equal(s.status.textContent,'');
 let failed=true;const bad=setup({hash:'#alumno/medico/clases',handler:async()=>{if(failed)throw new Error('Sin conexión');return {classes:[approved]};}});await tick();assert.match(bad.status.textContent,/Sin conexión/);failed=false;await find(bad.root,'button').find(b=>b.textContent==='Reintentar carga').fire('click');assert.match(bad.root.textContent,/Sepsis revisada/);
});
test('public approved detail is readable anonymously; authenticated enrollment is explicit and de-duplicated',async()=>{
 const detail={class:{id,title:'Sepsis revisada',author:'Docente',content:{summary:'Resumen educativo',objectives:['Estudiar'],sections:[{heading:'Teoría',body:'Contenido',sources:['W1']}],slides:[],sources:[{id:'W1',title:'Fuente',url:'javascript:alert(1)'}]}}};
 const anon=setup({hash:'#alumno/medico/clases/'+id,handler:async()=>detail});await tick();assert.match(anon.root.textContent,/Resumen educativo/);assert.match(anon.root.textContent,/Ingresar para guardar/);assert.ok(!find(anon.root,'a').some(a=>(a.attrs.href||'').startsWith('javascript:')));assert.equal(anon.calls.filter(c=>c.method==='POST').length,0);
 const pending=deferred(),signed=setup({hash:'#alumno/medico/clases/'+id,user:{role:'user'},handler:async(url,opts)=>opts.method==='POST'?pending.promise:detail});await tick();await tick();const button=find(signed.root,'button').find(b=>b.textContent==='Guardar en mis aulas y practicar');const first=button.fire('click');await button.fire('click');assert.equal(signed.calls.filter(c=>c.method==='POST').length,1);assert.deepEqual(JSON.parse(signed.calls.find(c=>c.method==='POST').body),{action:'join-public',classId:id});
 await signed.go('#alumno/medico/libros');pending.resolve({id});await first;assert.equal(signed.win.location.href,'');
 const success=setup({hash:'#alumno/medico/clases/'+id,user:{role:'user'},handler:async(url,opts)=>opts.method==='POST'?{id}:detail});await tick();await tick();await find(success.root,'button')[0].fire('click');assert.equal(success.win.location.href,'/aulas.html#'+id);
});
