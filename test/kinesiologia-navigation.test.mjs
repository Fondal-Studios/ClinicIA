import test from 'node:test';
import assert from 'node:assert/strict';

test('training page sends the student navigation to the single entry map and keeps first-responder courses apart',async()=>{
 const handlers={},nodes=new Map(),assigned=[];
 const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:''});return nodes.get(id);};
 global.document={querySelector:node,querySelectorAll:()=>[],addEventListener:(event,fn)=>{(handlers[event]??=[]).push(fn);}};
 global.location={search:'',assign:u=>assigned.push(u)};
 global.fetch=async()=>({ok:true,json:async()=>({user:null})});
 await import('../public/capacitacion.mjs');
 const click=async action=>{for(const fn of handlers.click||[])fn({target:{closest:()=>({dataset:{action}})}});await new Promise(r=>setImmediate(r));};
 await click('choose-student');assert.ok(assigned.length&&assigned.every(u=>u==='/#alumno'),'Soy alumno lleva al mapa único de entrada');
 await click('track-medical');assert.equal(assigned.at(-1),'/#personal-sanitario');
 await click('track-team');const html=node('#content').innerHTML;
 assert.ok(html.includes('data-id="respuesta-policial"'));assert.ok(!html.includes('kine-clinica'));
 assert.ok(!html.includes('data-id="rot-'),'rotation banks must not be mislabeled as first-responder refreshers');
});
