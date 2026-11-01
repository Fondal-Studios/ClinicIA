import test from 'node:test';
import assert from 'node:assert/strict';
import {classReview} from '../public/class-review.mjs';

// Tiny DOM: preserve text nodes and event semantics without a browser dependency.
class Node {
 constructor(tag,text=''){this.tag=tag;this.nodeType=tag==='#text'?3:1;this.children=[];this.attrs={};this.events={};this.value=text;this.disabled=false;this.checked=false;}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=nodes;}
 setAttribute(name,value){this.attrs[name]=value;if(name==='disabled'||name==='checked')this[name]=true;}
 addEventListener(name,fn){(this.events[name]??=[]).push(fn);}
 get textContent(){return this.tag==='#text'?this.value:this.children.map(x=>x.textContent).join('');}
 set textContent(value){this.children=[new Node('#text',String(value))];}
 async fire(name){if(name==='click'&&this.disabled)return;for(const fn of this.events[name]||[])await fn({currentTarget:this,target:this});}
}
const all=(root,tag)=>[...(root.tag===tag?[root]:[]),...root.children.flatMap(x=>all(x,tag))];
const button=(box,label)=>all(box,'button').find(x=>x.textContent===label);
const report=(extra={})=>({version:4,digest:'reviewed-digest',passed:true,approved:false,issues:[],limitations:['No demuestra exactitud clínica.'],...extra});
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
function setup({role='owner',dirty=false,reply=async body=>body.action==='validate'?report():body.action==='approve-review'?{approved:true,digest:'reviewed-digest'}:{status:'published'}}={}){
 global.document={createElement:tag=>new Node(tag),createTextNode:text=>new Node('#text',text)};
 const calls=[],published=[];let current=true;
 const box=classReview({cls:{role,version:4},dirty,request:async body=>{calls.push(body);return reply(body);},isCurrent:()=>current,onPublished:value=>published.push(value)});
 return {box,calls,published,leave:()=>{current=false;}};
}
async function validate(s){await button(s.box,'Comprobar versión guardada').fire('click');}
async function confirm(s){const box=all(s.box,'input')[0];box.checked=true;await box.fire('change');}

test('review panel is owner-only, requires saved content and renders server text safely',async()=>{
 for(const role of ['student','editor']){const s=setup({role});assert.equal(all(s.box,'button').length,0);assert.match(s.box.textContent,/Solo quien creó/);assert.equal(s.calls.length,0);}
 const dirty=setup({dirty:true});assert.equal(all(dirty.box,'button').length,0);assert.match(dirty.box.textContent,/Guardá los cambios/);
 const s=setup({reply:async()=>report({passed:false,issues:[{path:'questions[0]',message:'<script>not HTML</script>'}],limitations:['<img src=x>']})});
 await validate(s);assert.match(s.box.textContent,/questions\[0\]: <script>not HTML<\/script>/);assert.match(s.box.textContent,/<img src=x>/);
 assert.equal(all(s.box,'script').length,0);assert.equal(all(s.box,'img').length,0);assert.equal(all(s.box,'input').length,0);assert.equal(button(s.box,'Publicar versión revisada'),undefined);
});

test('explicit personal attestation and publishing are separate digest-bound actions',async()=>{
 const s=setup();await validate(s);
 assert.match(s.box.textContent,/NO verifica exactitud clínica/);assert.match(s.box.textContent,/propia revisión/);
 assert.equal(all(s.box,'input')[0].checked,false);assert.equal(button(s.box,'Registrar mi revisión docente').disabled,true);
 await button(s.box,'Registrar mi revisión docente').fire('click');assert.equal(s.calls.length,1);
 await confirm(s);await button(s.box,'Registrar mi revisión docente').fire('click');
 assert.deepEqual(s.calls[1],{action:'approve-review',digest:'reviewed-digest',confirmClinicalReview:true});
 assert.equal(s.published.length,0);assert.equal(s.calls.length,2);assert.match(s.box.textContent,/No es una certificación ni una revisión independiente/);
 await button(s.box,'Publicar versión revisada').fire('click');assert.deepEqual(s.calls[2],{action:'publish',digest:'reviewed-digest'});assert.deepEqual(s.published,[{status:'published'}]);
});

test('pending duplicate clicks issue only one request and navigation discards late responses',async()=>{
 for(const stage of ['validate','approve-review','publish']){
  const pending=deferred();const s=setup({reply:async body=>body.action===stage?pending.promise:body.action==='validate'?report({approved:stage==='publish'}):{approved:true,digest:'reviewed-digest'}});
  if(stage!=='validate')await validate(s);if(stage==='approve-review')await confirm(s);
  const label=stage==='validate'?'Comprobar versión guardada':stage==='approve-review'?'Registrar mi revisión docente':'Publicar versión revisada';
  const old=button(s.box,label),first=old.fire('click');await old.fire('click');assert.equal(s.calls.filter(x=>x.action===stage).length,1);
  s.leave();pending.resolve(stage==='validate'?report():stage==='approve-review'?{approved:true,digest:'reviewed-digest'}:{status:'published'});await first;
  assert.equal(s.published.length,0);assert.equal(s.calls.filter(x=>x.action==='publish').length,stage==='publish'?1:0);
  if(stage==='validate')assert.equal(all(s.box,'input').length,0);
  // Returning creates a fresh panel; an abandoned report/checkbox is never reused.
  const fresh=setup();assert.equal(all(fresh.box,'input').length,0);assert.equal(button(fresh.box,'Publicar versión revisada'),undefined);
 }
});

test('stale saved version and rejected approval/publication invalidate panel state',async()=>{
 const stale=setup({reply:async()=>report({version:5})});await validate(stale);assert.match(stale.box.textContent,/Otra persona modificó/);assert.equal(all(stale.box,'input').length,0);
 for(const stage of ['approve-review','publish']){
  const s=setup({reply:async body=>{if(body.action===stage)throw new Error('Contenido modificado: comprobá otra vez.');return report({approved:stage==='publish'});}});
  await validate(s);if(stage==='approve-review')await confirm(s);
  await button(s.box,stage==='approve-review'?'Registrar mi revisión docente':'Publicar versión revisada').fire('click');
  assert.match(s.box.textContent,/Contenido modificado/);assert.equal(all(s.box,'input').length,0);assert.equal(button(s.box,'Publicar versión revisada'),undefined);assert.equal(s.published.length,0);
  assert.ok(button(s.box,'Comprobar versión guardada'));
 }
});

test('revalidation resets explicit confirmation and mismatched approval digest is rejected',async()=>{
 const s=setup({reply:async body=>body.action==='validate'?report():{approved:true,digest:'another-version'}});
 await validate(s);await confirm(s);await button(s.box,'Volver a comprobar').fire('click');assert.equal(all(s.box,'input')[0].checked,false);
 await confirm(s);await button(s.box,'Registrar mi revisión docente').fire('click');assert.match(s.box.textContent,/No se pudo confirmar/);assert.equal(button(s.box,'Publicar versión revisada'),undefined);
});

test('aulas owner navigation wires review, dirty guard, save, tab reset and publication',async()=>{
 const root=new Node('main'),status=new Node('p'),id='11111111-1111-4111-8111-111111111111';
 global.document={createElement:tag=>new Node(tag),createTextNode:text=>new Node('#text',text),querySelector:selector=>selector==='#aula'?root:selector==='#aula-status'?status:null};
 global.window={addEventListener(){}};global.location={hash:'#'+id};global.localStorage={getItem:()=> 'teacher'};
 let saved={id,role:'owner',version:4,status:'draft',title:'Aula de prueba',passPct:80,studentCode:'ABCD1234',editorCode:'EFGH5678',content:{title:'Aula de prueba',summary:'Resumen',objectives:[],sections:[],slides:[],questions:[],sources:[],case:null,game:null}};
 const calls=[];let pendingValidation=null;
 global.fetch=async(url,options)=>{
  const body=options?.body?JSON.parse(options.body):null;calls.push({url,body});
  let data;
  if(body?.action==='validate')data=pendingValidation?await pendingValidation.promise:report({version:saved.version});
  else if(body?.action==='save'){saved={...saved,version:saved.version+1,content:body.content,title:body.content.title};data=saved;}
  else if(body?.action==='approve-review')data={approved:true,digest:'reviewed-digest'};
  else if(body?.action==='publish'){saved={...saved,status:'published'};data=saved;}
  else if(url.endsWith('/progress'))data={members:[],passPct:80};
  else data=saved;
  return {ok:true,json:async()=>structuredClone(data)};
 };
 await import('../public/aulas.mjs');await new Promise(r=>setImmediate(r));
 const click=async label=>{const b=button(root,label);assert.ok(b,'Missing button: '+label);await b.fire('click');await new Promise(r=>setImmediate(r));};
 assert.ok(button(root,'Revisar y publicar'));await click('Revisar y publicar');assert.match(root.textContent,/Revisión docente antes de publicar/);
 await click('Comprobar versión guardada');let checkbox=all(root,'input')[0];checkbox.checked=true;await checkbox.fire('change');
 await click('Datos');await click('Revisión y publicación');assert.equal(all(root,'input').length,0,'returning must require a fresh check');
 await click('Datos');const title=all(root,'input')[0];title.value='Aula editada';await title.fire('input');
 await click('Revisar y publicar');assert.match(root.textContent,/Guardá los cambios antes de revisar/);assert.equal(button(root,'Comprobar versión guardada'),undefined);
 await click('Guardar cambios');assert.ok(button(root,'Comprobar versión guardada'));assert.equal(saved.version,5);
 // A previous validation must not populate a newly opened review panel.
 pendingValidation=deferred();const oldCheck=button(root,'Comprobar versión guardada');const pendingClick=oldCheck.fire('click');
 await click('Datos');await click('Revisión y publicación');pendingValidation.resolve(report({version:5}));await pendingClick;pendingValidation=null;
 assert.equal(all(root,'input').length,0);assert.equal(button(root,'Registrar mi revisión docente'),undefined);
 await click('Comprobar versión guardada');checkbox=all(root,'input')[0];checkbox.checked=true;await checkbox.fire('change');
 await click('Registrar mi revisión docente');assert.equal(calls.filter(x=>x.body?.action==='publish').length,0);
 await click('Publicar versión revisada');assert.match(status.textContent,/Publicada/);assert.ok(button(root,'Retirar publicación'));assert.match(root.textContent,/Cómo invitar/);
 assert.deepEqual(calls.find(x=>x.body?.action==='approve-review').body,{action:'approve-review',digest:'reviewed-digest',confirmClinicalReview:true});
 assert.deepEqual(calls.find(x=>x.body?.action==='publish').body,{action:'publish',digest:'reviewed-digest'});
});
