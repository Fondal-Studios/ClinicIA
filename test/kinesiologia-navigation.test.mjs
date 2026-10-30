import test from 'node:test';
import assert from 'node:assert/strict';

test('student entry separates healthcare physiotherapy from first responders and rotation banks',async()=>{
 const handlers={},nodes=new Map();
 const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:''});return nodes.get(id);};
 global.document={querySelector:node,querySelectorAll:()=>[],addEventListener:(event,fn)=>{(handlers[event]??=[]).push(fn);}};
 global.fetch=async()=>({ok:true,json:async()=>({user:null})});
 await import('../public/capacitacion.mjs');
 const click=async action=>{for(const fn of handlers.click||[])fn({target:{closest:()=>({dataset:{action}})}});await new Promise(r=>setImmediate(r));};
 await click('choose-student');let html=node('#content').innerHTML;
 assert.ok(html.includes('<h2>Personal sanitario</h2>'));assert.ok(html.includes('<h2>Primeros respondedores</h2>'));
 await click('track-medical');html=node('#content').innerHTML;
 assert.ok(html.includes('<h1>Personal sanitario</h1>'));assert.ok(html.includes('<h2>Kinesiólogos</h2>'));
 assert.ok(html.includes('href="/#kinesiologia"'));assert.ok(!html.includes('data-id="respuesta-policial"'));
 await click('track-team');html=node('#content').innerHTML;
 assert.ok(html.includes('data-id="respuesta-policial"'));assert.ok(!html.includes('kine-clinica'));
 assert.ok(!html.includes('data-id="rot-'),'rotation banks must not be mislabeled as first-responder refreshers');
});
