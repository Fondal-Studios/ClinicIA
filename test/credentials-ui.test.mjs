import test from 'node:test';
import assert from 'node:assert/strict';
// Tiny DOM: preserve text nodes and event semantics without a browser dependency.
class Node {
 constructor(tag,text=''){this.tag=tag;this.nodeType=tag==='#text'?3:1;this.children=[];this.attrs={};this.events={};this.value=text;this.disabled=false;this.checked=false;}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=nodes;}
 setAttribute(name,value){this.attrs[name]=value;if(name==='disabled'||name==='checked')this[name]=true;}
 addEventListener(name,fn){(this.events[name]??=[]).push(fn);}
 get textContent(){return this.tag==='#text'?this.value:this.children.map(x=>x.textContent).join('');}
 set textContent(value){this.children=[new Node('#text',String(value))];}
 async fire(name){if(name==='click'&&this.disabled)return;for(const fn of this.events[name]||[])await fn({currentTarget:this,target:this,preventDefault(){}});}
}
const all=(root,tag)=>[...(root.tag===tag?[root]:[]),...root.children.flatMap(x=>all(x,tag))];
const button=(box,label)=>all(box,'button').find(x=>x.textContent===label);
const tick=()=>new Promise(r=>setImmediate(r));
const deferred=()=>{let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};};
let imports=0;
const original={profession:'Médica',specialty:'Clínica',registration:'MP 123',jurisdiction:'Salta',evidence_url:'https://example.org/registro',verification_status:'verified'};
async function setup(reply=async()=>({credential:original})){
 const root=new Node('main'),status=new Node('p'),calls=[];
 global.document={createElement:tag=>new Node(tag),createTextNode:text=>new Node('#text',text),querySelector:selector=>selector==='#credentials'?root:selector==='#credentials-status'?status:null};
 global.fetch=async(url,options)=>{const body=options?.body?JSON.parse(options.body):null;calls.push({url,body});const data=await reply(body);return {ok:true,json:async()=>structuredClone(data)};};
 await import('../public/credenciales.mjs?test='+ ++imports);await tick();return {root,status,calls};
}
const form=s=>all(s.root,'form')[0];
const fields=s=>Object.fromEntries(all(s.root,'input').map(n=>[n.attrs.name,n]));

test('credentials GET populates verified fields and warns of reset and public contribution suspension',async()=>{
 const s=await setup(),f=fields(s);assert.match(s.root.textContent,/Estado: verified/);
 for(const key of ['profession','specialty','registration','jurisdiction'])assert.equal(f[key].value,original[key]);
 assert.equal(f.evidenceUrl.value,original.evidence_url);assert.equal(f.evidenceUrl.attrs.type,'url');assert.equal(f.evidenceUrl.attrs.required,undefined);
 assert.match(s.root.textContent,/vuelve a revisión/);assert.match(s.root.textContent,/aportes públicos dejan de estar disponibles/);
 assert.deepEqual(s.calls,[{url:'/api/account/instructor-credentials',body:null}]);
});

test('explicit form submission posts only credential field values without privilege claims',async()=>{
 let submitted=false;const s=await setup(async body=>{if(body){submitted=true;return {pending:true};}return {credential:submitted?{...original,verification_status:'pending'}:original};});
 const values={profession:'Kinesiólogo',specialty:'Respiratoria',registration:'MP 456',jurisdiction:'Jujuy',evidenceUrl:'https://example.org/new'};
 for(const [key,value] of Object.entries(values))fields(s)[key].value=value;
 assert.equal(s.calls.filter(c=>c.body).length,0);await form(s).fire('submit');
 assert.deepEqual(s.calls.find(c=>c.body),{url:'/api/account/instructor-credentials',body:values});
 assert.equal(s.calls.find(c=>c.body).body.role,undefined);assert.equal(s.calls.find(c=>c.body).body.verification_status,undefined);
 assert.match(s.status.textContent,/pendiente de verificación administrativa/);assert.match(s.root.textContent,/Estado: pending/);
});

test('pending duplicate submits are suppressed and failed submit can be retried',async()=>{
 const pending=deferred();let fail=true;const s=await setup(async body=>{if(body){if(fail)throw new Error('No se pudo guardar');await pending.promise;return {pending:true};}return {credential:null};});
 await form(s).fire('submit');assert.match(s.status.textContent,/No se pudo guardar/);assert.equal(button(s.root,'Enviar para verificación').disabled,false);
 fail=false;const old=form(s),first=old.fire('submit');await old.fire('submit');assert.equal(s.calls.filter(c=>c.body).length,2,'failed attempt plus one pending retry');assert.equal(button(s.root,'Enviar para verificación').disabled,true);
 pending.resolve();await first;assert.match(s.status.textContent,/pendiente de verificación/);assert.equal(button(s.root,'Enviar para verificación').disabled,false);
});

test('failed credential GET offers retry and recovers the form without submitting',async()=>{
 let fail=true;const s=await setup(async()=>{if(fail)throw new Error('Servicio no disponible');return {credential:null};});
 assert.match(s.status.textContent,/Servicio no disponible/);assert.equal(form(s),undefined);assert.ok(all(s.root,'a').some(a=>a.attrs.href==='/'));
 fail=false;await button(s.root,'Reintentar').fire('click');assert.equal(s.status.textContent,'');assert.ok(form(s));assert.match(s.root.textContent,/Estado: sin presentar/);assert.equal(s.calls.filter(c=>c.body).length,0);
});
