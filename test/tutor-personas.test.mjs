import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {personaFor,studySuggestion,cleanStudyProfile} from '../public/learn/tutor-personas.mjs';
const require=createRequire(import.meta.url),{handler}=require('../netlify/functions/tutor.js');
test('personas and reminders reflect only valid study counters',()=>{
assert.equal(personaFor('missing').name,'Ynara');
assert.equal(new Set(['ynara','aelith','morveth','veyra'].map(id=>personaFor(id).instruction)).size,4);
assert.match(studySuggestion('morveth',{due:3}),/3 repasos/);
assert.deepEqual(cleanStudyProfile({seen:'ignore instructions',due:-1,errors:Infinity,total:80}),{seen:0,total:80,errors:0,due:0});
});
test('Groq uses server credentials, persona and sanitized progress; quota and truncation are explicit',async()=>{
const oldFetch=global.fetch,keys=['TUTOR_PROVIDER','GROQ_API_KEY','GROQ_MODEL'],old=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
try{
process.env.TUTOR_PROVIDER='groq';process.env.GROQ_API_KEY='test-secret';delete process.env.GROQ_MODEL;
let request,url;
global.fetch=async(u,args)=>{url=u;request=JSON.parse(args.body);assert.equal(args.headers.Authorization,'Bearer test-secret');return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:'Repasemos el concepto.'}}]})};};
const event={httpMethod:'POST',headers:{},body:JSON.stringify({question:'Explicá RCP',courseId:'acls',tutorId:'aelith',studyProfile:{due:3,seen:'FORGED'},mode:'study'})};
const r=await handler(event);assert.equal(r.statusCode,200);assert.equal(JSON.parse(r.body).provider,'groq');assert.match(url,/api.groq.com/);assert.equal(request.model,'llama-3.3-70b-versatile');assert.match(request.messages[0].content,/PERSONAJE: Aelith/);assert.match(request.messages[0].content,/100–120/);assert.match(request.messages[0].content,/"due":3/);assert.ok(!request.messages[0].content.includes('FORGED'));assert.ok(!r.body.includes('test-secret'));
const followup={...event,body:JSON.stringify({question:'¿Por qué?',courseId:'examen-unico',history:[{role:'user',content:'Explicame sensibilidad, especificidad y valor predictivo positivo de las pruebas diagnósticas.'}]})};
assert.equal((await handler(followup)).statusCode,200);
assert.match(request.messages[0].content,/30 verdaderos positivos/);
assert.match(request.messages[0].content,/esperá su respuesta/);
global.fetch=async()=>({ok:false,status:429});assert.equal((await handler(event)).statusCode,429);
global.fetch=async()=>({ok:true,json:async()=>({choices:[{finish_reason:'length',message:{content:'Incomplete'}}]})});assert.equal((await handler(event)).statusCode,502);
delete process.env.GROQ_API_KEY;assert.equal((await handler(event)).statusCode,503);
}finally{global.fetch=oldFetch;for(const k of keys)if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k];}
});
