import test from 'node:test';import assert from 'node:assert/strict';import {server} from '../server.mjs';
test('tutor status reports configuration without secrets and CORS is limited to the static site',async()=>{
 const backup={...process.env};await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port,pages='https://drmarianojimenez94-sudo.github.io';
 try{
  for(const k of ['TUTOR_PROVIDER','GROQ_API_KEY','ANTHROPIC_API_KEY','ANTHROPIC_MODEL','TUTOR_CORS_ORIGINS'])delete process.env[k];
  let r=await fetch(base+'/api/tutor');assert.equal(r.status,200);assert.deepEqual(await r.json(),{configured:false,provider:null,message:'Tutor pendiente de configuración del proveedor y modelo.'});
  process.env.GROQ_API_KEY='gsk_super_secret';r=await fetch(base+'/api/tutor');const txt=await r.text();assert.deepEqual(JSON.parse(txt),{configured:true,provider:'groq',message:null});assert.ok(!txt.includes('gsk_'));
  r=await fetch(base+'/api/tutor',{method:'OPTIONS',headers:{Origin:pages,'Access-Control-Request-Method':'POST'}});assert.equal(r.status,204);assert.equal(r.headers.get('access-control-allow-origin'),pages);
  r=await fetch(base+'/api/tutor',{method:'OPTIONS',headers:{Origin:'https://evil.example'}});assert.equal(r.headers.get('access-control-allow-origin'),null);
  r=await fetch(base+'/api/tutor-class',{method:'OPTIONS',headers:{Origin:pages}});assert.equal(r.headers.get('access-control-allow-origin'),null);
  r=await fetch(base+'/api/tutor',{method:'POST',headers:{Origin:pages,'Content-Type':'application/json'},body:'{}'});assert.equal(r.headers.get('access-control-allow-origin'),pages);assert.equal(r.status,400);
  r=await fetch(base+'/api/tutor',{method:'DELETE'});assert.equal(r.status,405);
 }finally{server.close();for(const k of ['TUTOR_PROVIDER','GROQ_API_KEY','ANTHROPIC_API_KEY','ANTHROPIC_MODEL','TUTOR_CORS_ORIGINS']){if(backup[k]===undefined)delete process.env[k];else process.env[k]=backup[k];}}
});
