import test from 'node:test';
import assert from 'node:assert/strict';
import {createEditorialAdmin} from '../public/editorial-admin.mjs';
class Node{
 constructor(tag,text=''){this.tag=tag;this.nodeType=tag==='#text'?3:1;this.children=[];this.attrs={};this.events={};this.value=text;this.checked=false;this.disabled=false;}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=nodes;}
 setAttribute(k,v){this.attrs[k]=v;if(k==='checked'||k==='disabled')this[k]=true;}
 addEventListener(k,fn){(this.events[k]??=[]).push(fn);}
 get textContent(){return this.tag==='#text'?this.value:this.children.map(x=>x.textContent).join('');}
 set textContent(v){this.children=[new Node('#text',String(v))];}
 async fire(name){if(name==='click'&&this.disabled)return;for(const fn of this.events[name]||[])await fn({target:this,currentTarget:this});}
}
const all=(n,tag)=>[...(n.tag===tag?[n]:[]),...n.children.flatMap(x=>all(x,tag))];
const button=(s,label)=>all(s.root,'button').find(x=>x.textContent===label);
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const data=()=>({adminId:'admin',credentials:[{user_id:'author',username:'Docente',profession:'Medicina',specialty:'Clínica',registration:'123',jurisdiction:'Salta',version:2,verification_status:'pending',evidence_url:'javascript:alert(1)'}],submissions:[{id:'s1',submitted_by:'author',author:'Docente',title:'Clase <img>',specialty:'Clínica',module:'Shock',status:'pending',version:3,content_digest:'digest3',stale:false,canReview:true,report:{passed:true,issues:[],limitations:['No verifica exactitud clínica.']},content:{summary:'Resumen',objectives:['Aprender'],sections:[{heading:'Teoría',body:'Contenido <script>',sources:['W1']}],slides:[{title:'Diapositiva',bullets:['Paso'],notes:'Nota',sources:['W1']}],questions:[{prompt:'¿Qué?',options:['A','B'],answer:1,why:'Fundamento',sources:['W1']}],case:{scenario:'Ficticio',question:{prompt:'Caso',options:['Sí','No'],answer:0,why:'Razón',sources:['W1']}},game:{pairs:[{term:'Término',definition:'Definición'}]},sources:[{id:'W1',provider:'Fuente',title:'Referencia',url:'https://example.org'}]}}]});
function setup(reply=async()=>data()){
 global.document={createElement:tag=>new Node(tag),createTextNode:text=>new Node('#text',text),querySelector:()=>null};
 const root=new Node('div'),status=new Node('p'),calls=[];
 const controller=createEditorialAdmin({root,status,request:async body=>{calls.push(body);return reply(body);}});return {root,status,calls,...controller};
}
async function open(s){await s.load();await button(s,'Revisar contribución: Clase <img>').fire('click');}

test('editorial admin denies unauthorized data and safely renders complete review content',async()=>{
 const denied=setup(async()=>{throw Object.assign(new Error('Acceso exclusivo'),{status:403});});await denied.load();assert.match(denied.root.textContent,/cuenta administradora/);assert.doesNotMatch(denied.root.textContent,/Docente|Shock/);
 const s=setup();await open(s);assert.match(s.root.textContent,/Contenido <script>/);assert.equal(all(s.root,'script').length,0);assert.equal(all(s.root,'img').length,0);assert.match(s.root.textContent,/RESPUESTA INDICADA POR EL AUTOR/);assert.match(s.root.textContent,/Fundamento/);assert.match(s.root.textContent,/Ficticio/);assert.match(s.root.textContent,/Definición/);assert.match(s.root.textContent,/no es validación clínica/);
 assert.equal(all(s.root,'input')[0].checked,false);assert.equal(button(s,'Aprobar e integrar en biblioteca pública').disabled,true);assert.equal(button(s,'Rechazar con observaciones').disabled,true);
});

test('independent confirmation and notes are explicit and digest-bound; duplicate decisions blocked',async()=>{
 const pending=deferred(),s=setup(async b=>b?pending.promise:data());await open(s);
 const check=all(s.root,'input')[0];check.checked=true;await check.fire('change');
 const note=all(s.root,'textarea')[0];note.value='Fuentes y respuestas revisadas';await note.fire('input');
 const approve=button(s,'Aprobar e integrar en biblioteca pública'),first=approve.fire('click');await approve.fire('click');
 assert.equal(s.calls.filter(Boolean).length,1);assert.deepEqual(s.calls[1],{action:'review-submission',submissionId:'s1',status:'approved',digest:'digest3',notes:'Fuentes y respuestas revisadas',confirmClinicalReview:true});
 pending.resolve({status:'approved'});await first;assert.match(s.root.textContent,/Contribuciones a la biblioteca/);
 const rejected=setup();await open(rejected);const notes=all(rejected.root,'textarea')[0];notes.value='Corregir fuentes';await notes.fire('input');await button(rejected,'Rechazar con observaciones').fire('click');assert.deepEqual(rejected.calls[1],{action:'review-submission',submissionId:'s1',status:'rejected',digest:'digest3',notes:'Corregir fuentes'});
});

test('stale content, invalid structure and self-submissions cannot be approved; navigation resets confirmation',async()=>{
 for(const patch of [{stale:true},{canReview:false},{submitted_by:'admin'},{report:{passed:false,issues:[{path:'sources',message:'Faltan fuentes'}]}}]){
  const s=setup(async()=>{const d=data();Object.assign(d.submissions[0],patch);return d;});await open(s);assert.equal(button(s,'Aprobar e integrar en biblioteca pública').disabled,true);assert.equal(all(s.root,'input')[0].disabled,true);
 }
 const s=setup();await open(s);const check=all(s.root,'input')[0];check.checked=true;await check.fire('change');await button(s,'← Volver a la cola').fire('click');await button(s,'Revisar contribución: Clase <img>').fire('click');assert.equal(all(s.root,'input')[0].checked,false);
});

test('credential decisions require explicit verification and exact credential version; unsafe evidence is not linked',async()=>{
 const s=setup();await s.load();await button(s,'Revisar credencial de Docente').fire('click');assert.match(s.root.textContent,/Matrícula123/);assert.equal(all(s.root,'a').length,0);assert.equal(button(s,'Registrar credencial verificada').disabled,true);
 const check=all(s.root,'input')[0];check.checked=true;await check.fire('change');await button(s,'Registrar credencial verificada').fire('click');assert.deepEqual(s.calls[1],{action:'verify-credential',userId:'author',status:'verified',credentialVersion:2});
});

test('late requests cannot overwrite newer navigation and permission errors clear cached queue',async()=>{
 const pending=deferred();let count=0;const s=setup(async()=>++count===1?pending.promise:data());const first=s.load();await s.load();await button(s,'Revisar contribución: Clase <img>').fire('click');pending.resolve({credentials:[],submissions:[]});await first;assert.match(s.root.textContent,/Contenido completo enviado/);
 const action=deferred(),nav=setup(async b=>b?action.promise:data());await open(nav);const check=all(nav.root,'input')[0];check.checked=true;await check.fire('change');const save=button(nav,'Aprobar e integrar en biblioteca pública').fire('click');await button(nav,'← Volver a la cola').fire('click');action.resolve({status:'approved'});await save;assert.match(nav.root.textContent,/Contribuciones a la biblioteca/);assert.equal(nav.calls.length,2);
 const denied=setup(async b=>{if(b)throw Object.assign(new Error('Permiso revocado'),{status:403});return data();});await open(denied);const notes=all(denied.root,'textarea')[0];notes.value='No válido';await notes.fire('input');await button(denied,'Rechazar con observaciones').fire('click');assert.match(denied.root.textContent,/cuenta administradora/);assert.doesNotMatch(denied.root.textContent,/Contenido completo enviado/);
});

test('review conflicts force a fresh queue and terminal or self decisions stay disabled',async()=>{
 const s=setup(async b=>{if(b)throw Object.assign(new Error('Versión modificada'),{status:409});return data();});await open(s);const c=all(s.root,'input')[0];c.checked=true;await c.fire('change');await button(s,'Aprobar e integrar en biblioteca pública').fire('click');assert.equal(button(s,'Aprobar e integrar en biblioteca pública'),undefined);assert.ok(button(s,'Actualizar cola'));assert.match(s.status.textContent,/Versión modificada/);
 for(const status of ['approved','rejected']){const terminal=setup(async()=>{const d=data();d.submissions[0].status=status;return d;});await open(terminal);assert.equal(button(terminal,'Aprobar e integrar en biblioteca pública').disabled,true);}
 const self=setup(async()=>{const d=data();d.credentials[0].canVerify=false;return d;});await self.load();await button(self,'Revisar credencial de Docente').fire('click');assert.equal(all(self.root,'input')[0].disabled,true);assert.equal(button(self,'Rechazar o revocar credencial').disabled,true);assert.match(self.root.textContent,/propia credencial/);
});
