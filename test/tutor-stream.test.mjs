import test from 'node:test';import assert from 'node:assert/strict';import {server} from '../server.mjs';
import {createRequire} from 'node:module';
const {streamModel}=createRequire(import.meta.url)('../netlify/lib/llm.js');
const sse=lines=>new ReadableStream({start(c){const e=new TextEncoder();for(const l of lines)c.enqueue(e.encode(l));c.close();}});
const anthropic=parts=>[ 'event: message_start\ndata: {"type":"message_start","message":{"usage":{"input_tokens":7}}}\n\n',...parts.map(t=>`event: content_block_delta\ndata: ${JSON.stringify({type:'content_block_delta',delta:{type:'text_delta',text:t}})}\n\n`),'event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":3}}\n\n'];
const env={ANTHROPIC_API_KEY:'k',ANTHROPIC_MODEL:'m'};

test('streamModel yields deltas for Anthropic and Groq, maps http errors up front and flags truncation',async()=>{
 const collect=async it=>{let t='';for await(const d of it)t+=d;return t;};
 // chunks split mid-line to exercise buffering
 const split=anthropic(['Ho','la']).join('').match(/[\s\S]{1,17}/g);
 assert.equal(await collect(await streamModel({system:'s',messages:[],env,fetchImpl:async()=>({ok:true,body:sse(split)})})),'Hola');
 const groq=['data: {"choices":[{"delta":{"content":"Ho"}}]}\n\n','data: {"choices":[{"delta":{"content":"la"},"finish_reason":"stop"}]}\n\n','data: [DONE]\n\n'];
 assert.equal(await collect(await streamModel({system:'s',messages:[],env:{GROQ_API_KEY:'g'},fetchImpl:async()=>({ok:true,body:sse(groq)})})),'Hola');
 await assert.rejects(streamModel({system:'s',messages:[],env,fetchImpl:async()=>({ok:false,status:429})}),e=>e.status===429);
 const cut=anthropic(['x']).slice(0,2);
 await assert.rejects(collect(await streamModel({system:'s',messages:[],env,fetchImpl:async()=>({ok:true,body:sse(cut)})})),e=>e.status===502);
 const trunc=anthropic(['x']).join('').replace('end_turn','max_tokens');
 await assert.rejects(collect(await streamModel({system:'s',messages:[],env,fetchImpl:async()=>({ok:true,body:sse([trunc])})})),e=>e.truncated===true);
});

test('/api/tutor streams SSE (meta, deltas, done) when asked and keeps the JSON reply otherwise',async()=>{
 const backup={...process.env},original=global.fetch;await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 try{
  delete process.env.GROQ_API_KEY;delete process.env.DATABASE_URL;Object.assign(process.env,{TUTOR_PROVIDER:'anthropic',ANTHROPIC_API_KEY:'k',ANTHROPIC_MODEL:'m'});
  global.fetch=async(url,args)=>String(url).startsWith(base)?original(url,args):{ok:true,body:sse(anthropic(['Primera ','parte.'])),json:async()=>({stop_reason:'end_turn',content:[{type:'text',text:'Respuesta completa.'}]})};
  const post=(accept)=>original(base+'/api/tutor',{method:'POST',headers:{'Content-Type':'application/json',Accept:accept},body:JSON.stringify({question:'¿Qué es la RCP?',courseId:'acls'})});
  let r=await post('text/event-stream');assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/text\/event-stream/);
  const text=await r.text();assert.ok(text.indexOf('event: meta')<text.indexOf('event: delta'));assert.ok(text.includes('Primera '));assert.ok(text.trimEnd().endsWith('event: done\ndata: {}'));assert.ok(!text.includes('"k"'));
  // early failures are plain JSON, not a stream
  r=await original(base+'/api/tutor',{method:'POST',headers:{'Content-Type':'application/json',Accept:'text/event-stream'},body:JSON.stringify({question:''})});assert.equal(r.status,400);assert.match(r.headers.get('content-type'),/json/);
  r=await post('application/json');assert.equal(r.status,200);assert.equal((await r.json()).answer,'Respuesta completa.');
 }finally{global.fetch=original;for(const k of ['TUTOR_PROVIDER','ANTHROPIC_API_KEY','ANTHROPIC_MODEL','GROQ_API_KEY','DATABASE_URL']){if(backup[k]===undefined)delete process.env[k];else process.env[k]=backup[k];}await new Promise(r=>server.close(r));}
});
