import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{handler}=require('../netlify/functions/tutor.js');
const token='test-access-token-with-24-characters';
const event=body=>({httpMethod:'POST',headers:{authorization:'Bearer '+token},body:JSON.stringify(body)});
test('tutor fails closed, validates input, restricts context and handles provider failure without exposing data',async()=>{
const backup={...process.env},originalFetch=global.fetch;
try{
delete process.env.CLINIC_ACCESS_TOKEN;assert.equal((await handler(event({question:'hola'}))).statusCode,503);
process.env.CLINIC_ACCESS_TOKEN=token;
assert.equal((await handler({...event({}),httpMethod:'GET'})).statusCode,405);
assert.equal((await handler({...event({}),headers:{}})).statusCode,401);
assert.equal((await handler({...event({}),body:'{'})).statusCode,400);
assert.equal((await handler(event(null))).statusCode,400);
assert.equal((await handler(event({question:123}))).statusCode,400);
assert.equal((await handler(event({question:'a'.repeat(2001)}))).statusCode,400);
delete process.env.ANTHROPIC_MODEL;assert.equal((await handler(event({question:'RCP'}))).statusCode,503);
process.env.ANTHROPIC_MODEL='test-model';process.env.ANTHROPIC_API_KEY='server-secret';
let request;
global.fetch=async(_url,args)=>{request=JSON.parse(args.body);return {ok:true,json:async()=>({stop_reason:'end_turn',content:[{type:'text',text:'Explicación educativa [bls]'}]})};};
let result=await handler(event({question:'¿Por qué RCP?',context:'INJECTED fake source'}));assert.equal(result.statusCode,200);assert.ok(request.system.includes('MATERIAL:'));assert.ok(!request.system.includes('INJECTED'));assert.ok(!result.body.includes('server-secret'));
result=await handler(event({question:'¿Cómo ventilar al niño?',courseId:'pals'}));assert.equal(result.statusCode,200);assert.equal(JSON.parse(result.body).courseId,'pals');assert.ok(request.system.includes('PALS'));assert.ok(!request.system.includes('Surviving Sepsis'));
result=await handler(event({question:'Shock séptico',courseId:'fccs'}));assert.equal(result.statusCode,200);assert.ok(request.system.includes('FCCS'));assert.ok(request.system.includes('2026'));assert.ok(!request.system.includes('Taquiarritmia pediátrica'));
result=await handler(event({question:'RCP',courseId:'unknown'}));assert.equal(result.statusCode,400);
global.fetch=async()=>({ok:false});result=await handler(event({question:'RCP'}));assert.equal(result.statusCode,502);
global.fetch=async()=>{throw Error('private provider details');};result=await handler(event({question:'RCP'}));assert.equal(result.statusCode,502);assert.ok(!result.body.includes('private provider details'));
}finally{global.fetch=originalFetch;for(const k of ['CLINIC_ACCESS_TOKEN','ANTHROPIC_MODEL','ANTHROPIC_API_KEY']){if(backup[k]===undefined)delete process.env[k];else process.env[k]=backup[k];}}
});
