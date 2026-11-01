import test from 'node:test';
import assert from 'node:assert/strict';
import {classContribution} from '../public/class-contribution.mjs';
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
const tick=()=>new Promise(r=>setImmediate(r));
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const id='11111111-1111-4111-8111-111111111111';
const report=(extra={})=>({version:4,digest:'reviewed-digest',passed:true,approved:true,...extra});
function setup({role='owner',dirty=false,credential={verification_status:'verified'},validation=report(),submissions=[],override}={}){
 global.document={createElement:tag=>new Node(tag),createTextNode:text=>new Node('#text',text)};
 const calls=[];let current=true,rows=submissions;
 const defaults=async(path,body)=>{
  if(path.endsWith('instructor-credentials'))return {credential};
  if(path.endsWith('library-submit')){if(body){rows=[{class_id:id,status:'pending',stale:false}];return {submitted:true};}return {submissions:rows};}
  return validation;
 };
 const box=classContribution({cls:{id,role,version:4},dirty,request:async(path,body)=>{calls.push({path,body});return override?override(path,body,defaults):defaults(path,body);},isCurrent:()=>current});
 return {box,calls,leave:()=>{current=false;}};
}
const input=(box,label)=>all(box,'input').find(n=>n.attrs['aria-label']===label);
const submit=s=>button(s.box,'Enviar aporte a revisión administrativa');
async function consent(s){const check=input(s.box,'Autorizar integración pública tras revisión administrativa');check.checked=true;await check.fire('change');}
function details(s){input(s.box,'Especialidad del aporte').value='Emergencias';input(s.box,'Módulo del aporte').value='Sepsis';}

test('contribution restricts owner/saved content and verified credentials with reviewed current version',async()=>{
 for(const role of ['student','editor']){const s=setup({role});await tick();assert.equal(s.calls.length,0);assert.match(s.box.textContent,/Solo el dueño/);}
 const dirty=setup({dirty:true});assert.equal(dirty.calls.length,0);assert.match(dirty.box.textContent,/Guardá los cambios/);
 for(const credential of [null,{verification_status:'pending'},{verification_status:'rejected'}]){
  const s=setup({credential});await tick();assert.match(s.box.textContent,/administrador debe verificar tu profesión/);assert.equal(submit(s),undefined);assert.ok(all(s.box,'a').some(a=>a.attrs.href==='/credenciales.html'));
 }
 for(const validation of [report({approved:false}),report({passed:false})]){const s=setup({validation});await tick();assert.match(s.box.textContent,/Primero completá los controles/);assert.equal(submit(s),undefined);}
 const stale=setup({validation:report({version:5})});await tick();assert.match(stale.box.textContent,/versión guardada cambió/);assert.equal(submit(stale),undefined);
});

test('current pending or approved contribution prevents duplicate while stale/rejected can be resubmitted',async()=>{
 const approved=setup({submissions:[{class_id:id,status:'approved',stale:false}]});await tick();assert.match(approved.box.textContent,/ya tiene una revisión administrativa aprobada/);assert.equal(submit(approved),undefined);
 const pending=setup({submissions:[{class_id:id,status:'pending',stale:false}]});await tick();assert.match(pending.box.textContent,/ya está pendiente/);assert.equal(submit(pending),undefined);
 for(const row of [{class_id:id,status:'pending',stale:true},{class_id:id,status:'rejected',stale:false,review_notes:'<script>Motivo</script>'}]){
  const s=setup({submissions:[row]});await tick();assert.ok(submit(s));if(row.review_notes){assert.match(s.box.textContent,/<script>Motivo<\/script>/);assert.equal(all(s.box,'script').length,0);}
 }
});

test('submission needs consent and categorization, sends exact digest without publishing',async()=>{
 const s=setup();await tick();assert.equal(submit(s).disabled,true);await submit(s).fire('click');assert.equal(s.calls.filter(c=>c.body?.consentPublic).length,0);
 await consent(s);await submit(s).fire('click');assert.match(s.box.textContent,/Indicá especialidad y módulo/);assert.equal(s.calls.filter(c=>c.body?.consentPublic).length,0);
 details(s);await submit(s).fire('click');
 assert.deepEqual(s.calls.find(c=>c.body?.consentPublic),{path:'/api/account/library-submit',body:{classId:id,specialty:'Emergencias',module:'Sepsis',digest:'reviewed-digest',consentPublic:true}});
 assert.match(s.box.textContent,/Aún no se integró/);assert.match(s.box.textContent,/ya está pendiente/);assert.equal(submit(s),undefined);
 assert.equal(s.calls.filter(c=>c.body?.action==='publish'||c.body?.action==='approve-review').length,0);
});

test('network errors expose retry, failed submission retries safely and repeated clicks deduplicate',async()=>{
 let failLoad=true;const s=setup({override:async(path,body,defaults)=>{if(failLoad)throw new Error('Sin conexión');return defaults(path,body);}});await tick();assert.match(s.box.textContent,/Sin conexión/);assert.ok(button(s.box,'Reintentar'));
 failLoad=false;await button(s.box,'Reintentar').fire('click');await tick();assert.ok(submit(s));
 let failSubmit=true;const pending=deferred();const t=setup({override:async(path,body,defaults)=>{if(body?.consentPublic){if(failSubmit)throw new Error('No se pudo enviar');await pending.promise;}return defaults(path,body);}});
 await tick();details(t);await consent(t);await submit(t).fire('click');assert.match(t.box.textContent,/No se pudo enviar/);assert.equal(submit(t).disabled,false);
 failSubmit=false;const old=submit(t),first=old.fire('click');await old.fire('click');assert.equal(t.calls.filter(c=>c.body?.consentPublic).length,2,'one failed attempt and one pending retry');pending.resolve();await first;assert.match(t.box.textContent,/ya está pendiente/);
});

test('navigation ignores stale load and submission responses',async()=>{
 const pending=deferred();const s=setup({override:async(path,body,defaults)=>{await pending.promise;return defaults(path,body);}});s.leave();pending.resolve();await tick();assert.equal(submit(s),undefined);assert.match(s.box.textContent,/Consultando/);
 const send=deferred();const t=setup({override:async(path,body,defaults)=>{if(body?.consentPublic)await send.promise;return defaults(path,body);}});await tick();details(t);await consent(t);const first=submit(t).fire('click');t.leave();send.resolve();await first;assert.doesNotMatch(t.box.textContent,/Aporte enviado/);assert.equal(t.calls.length,4,'no refresh requests after leaving');
});

test('aulas contribution tab wires backend queries and refuses unsaved edits',async()=>{
 const root=new Node('main'),status=new Node('p');
 global.document={createElement:tag=>new Node(tag),createTextNode:text=>new Node('#text',text),querySelector:selector=>selector==='#aula'?root:selector==='#aula-status'?status:null};
 global.window={addEventListener(){}};global.location={hash:'#'+id};global.localStorage={getItem:()=> 'teacher'};
 const saved={id,role:'owner',version:4,status:'draft',title:'Aula de prueba',passPct:80,content:{title:'Aula de prueba',summary:'Resumen',objectives:[],sections:[],slides:[],questions:[],sources:[],case:null,game:null}},calls=[];
 global.fetch=async(url,options)=>{const body=options?.body?JSON.parse(options.body):null;calls.push({url,body});const data=url.endsWith('instructor-credentials')?{credential:{verification_status:'verified'}}:url.endsWith('library-submit')?{submissions:[]}:body?.action==='validate'?report():saved;return {ok:true,json:async()=>structuredClone(data)};};
 await import('../public/aulas.mjs');await tick();
 const click=async label=>{const b=button(root,label);assert.ok(b,'Missing button '+label);await b.fire('click');await tick();};
 await click('Aportar a biblioteca');assert.match(root.textContent,/biblioteca compartida/);assert.ok(input(root,'Especialidad del aporte'));assert.equal(calls.filter(c=>c.body?.action==='publish').length,0);
 await click('Datos');const title=all(root,'input')[0];title.value='Cambio pendiente';await title.fire('input');
 const count=calls.length;await click('Aportar a biblioteca');assert.match(root.textContent,/Guardá los cambios/);assert.equal(calls.length,count);
});
