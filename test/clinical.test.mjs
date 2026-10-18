import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const extract=require('../netlify/functions/extract-patient.js').handler,structure=require('../netlify/functions/structure-consulta.js').handler,rewrite=require('../netlify/functions/rewrite-field.js').handler;
const ev=(body,headers={})=>({httpMethod:'POST',headers,body:typeof body==='string'?body:JSON.stringify(body)});
const KEYS=['LEGACY_CLINICAL_ENABLED','CLINIC_ACCESS_TOKEN','TUTOR_PROVIDER','GROQ_API_KEY','ANTHROPIC_API_KEY','ANTHROPIC_MODEL','GROQ_MODEL'];
async function withEnv(env,fn){const backup={...process.env},original=global.fetch;try{for(const k of KEYS)delete process.env[k];Object.assign(process.env,env);await fn();}finally{global.fetch=original;for(const k of KEYS){if(backup[k]===undefined)delete process.env[k];else process.env[k]=backup[k];}}}
test('consultorio functions are enabled by default, work with Groq and keep keys server-side',async()=>withEnv({GROQ_API_KEY:'gsk_secret'},async()=>{
 const calls=[];global.fetch=async(url,args)=>{const b=JSON.parse(args.body);calls.push({url,auth:args.headers.Authorization,system:b.system||b.messages[0].content,json:b.response_format});const content=url.includes('groq')?'```json\n{"nombre":"Juan","apellido":"Pérez","dni":"30111222"}\n```':'x';return {ok:true,json:async()=>({choices:[{message:{content:b.messages[0].content.includes('Redactás')?'Texto prolijo.':content},finish_reason:'stop'}]})};};
 let r=await extract(ev({transcript:'Paciente Juan Pérez documento 30111222'}));assert.equal(r.statusCode,200);assert.equal(JSON.parse(r.body).nombre,'Juan');assert.ok(calls[0].url.includes('groq.com'));assert.equal(calls[0].json.type,'json_object');assert.ok(!r.body.includes('gsk_'));
 r=await structure(ev({transcript:'motivo de consulta dolor torácico. tratamiento aspirina 100 mg cada 24 horas',patientContext:{edad:50}}));assert.equal(r.statusCode,200);assert.ok(calls.at(-1).system.includes('"plan" reúne el tratamiento'));
 r=await rewrite(ev({texto:'dolor toracico desde ayer'}));assert.equal(r.statusCode,200);assert.equal(JSON.parse(r.body).texto,'Texto prolijo.');
}));
test('consultorio validates input, honours the off switch, optional access key and the hourly cap',async()=>{
 await withEnv({GROQ_API_KEY:'k'},async()=>{
  global.fetch=async()=>({ok:true,json:async()=>({choices:[{message:{content:'{}'},finish_reason:'stop'}]})});
  assert.equal((await extract({...ev({}),httpMethod:'GET'})).statusCode,405);assert.equal((await extract(ev('{'))).statusCode,400);assert.equal((await extract(ev({transcript:'  '}))).statusCode,400);assert.equal((await structure(ev({transcript:5}))).statusCode,400);
  assert.equal((await extract(ev({transcript:'x'.repeat(61000)}))).statusCode,413);
  global.fetch=async()=>({ok:true,json:async()=>({choices:[{message:{content:'no es json'},finish_reason:'stop'}]})});assert.equal((await extract(ev({transcript:'hola'}))).statusCode,502);
  global.fetch=async()=>({ok:false,status:429});assert.equal((await structure(ev({transcript:'hola'}))).statusCode,429);
 });
 await withEnv({GROQ_API_KEY:'k',LEGACY_CLINICAL_ENABLED:'false'},async()=>assert.equal((await extract(ev({transcript:'hola'}))).statusCode,503));
 await withEnv({},async()=>{const r=await extract(ev({transcript:'hola'}));assert.equal(r.statusCode,503);assert.match(JSON.parse(r.body).error,/GROQ_API_KEY/);});
 await withEnv({GROQ_API_KEY:'k',CLINIC_ACCESS_TOKEN:'a-token-with-more-than-24-chars'},async()=>{
  global.fetch=async()=>({ok:true,json:async()=>({choices:[{message:{content:'{"nombre":"A"}'},finish_reason:'stop'}]})});
  assert.equal((await extract(ev({transcript:'hola'}))).statusCode,401);assert.equal((await extract(ev({transcript:'hola'},{authorization:'Bearer wrong'}))).statusCode,401);
  assert.equal((await extract(ev({transcript:'hola'},{authorization:'Bearer a-token-with-more-than-24-chars'}))).statusCode,200);
 });
});
