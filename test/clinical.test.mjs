import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const structure=require('../netlify/functions/structure-consulta.js').handler,rewrite=require('../netlify/functions/rewrite-field.js').handler,scrub=require('../netlify/functions/deidentify.js').handler,{deidentify}=require('../netlify/lib/deidentify.js');
const ev=(body,headers={})=>({httpMethod:'POST',headers,body:typeof body==='string'?body:JSON.stringify(body)});
const KEYS=['LEGACY_CLINICAL_ENABLED','CLINIC_ACCESS_TOKEN','TUTOR_PROVIDER','GROQ_API_KEY','ANTHROPIC_API_KEY','ANTHROPIC_MODEL','GROQ_MODEL'];
async function withEnv(env,fn){const backup={...process.env},original=global.fetch;try{for(const k of KEYS)delete process.env[k];Object.assign(process.env,env);await fn();}finally{global.fetch=original;for(const k of KEYS){if(backup[k]===undefined)delete process.env[k];else process.env[k]=backup[k];}}}
const identity={nombre:'Juan Carlos',apellido:'Pérez',dni:'30.111.222',fechaNacimiento:'1970-05-04',telefono:'11 5555-1234',obraSocial:'OSDE',nroAfiliado:'998877',domicilio:'Calle Falsa 123'};
test('deidentify removes known and generic identifiers but keeps the clinical content',()=>{
 const text='Paciente Juan Perez, DNI 30111222, nacido el 4 de mayo de 1970 (04/05/70), vive en calle falsa 123, tel 11-5555-1234 o 1155551234, mail juan@x.com. OSDE afiliado 998877. Su esposa María López dice dolor torácico de 2 horas. Dr. Gómez indicó aspirina 100 mg. Se llama Ana de la Cruz.';
 const r=deidentify(text,identity);
 for(const leak of ['Juan','Perez','Pérez','30111222','1970','04/05/70','Falsa','5555','1155551234','juan@x.com','OSDE','998877','María','López','Gómez','Cruz'])assert.ok(!r.text.includes(leak),'leaked '+leak+' in: '+r.text);
 for(const keep of ['dolor torácico de 2 horas','aspirina 100 mg'])assert.ok(r.text.includes(keep));assert.ok(r.redactions>=10);
 const clinical='Motivo: dolor torácico. 56 años, hipertenso, toma enalapril 10 mg. TA 120/80, FC 88, SpO2 96 %. Padre con infarto, madre hipertensa.';
 assert.equal(deidentify(clinical,identity).text,clinical);assert.equal(deidentify(clinical).redactions,0);
 assert.match(deidentify('DNI 38 34 10 73 y teléfono 11 4444 5555').text,/\[DOCUMENTO\].*\[TELÉFONO\]/);
 assert.match(deidentify('nombre JUAN pérez',{nombre:'Juan',apellido:'Pérez'}).text,/\[NOMBRE\] \[NOMBRE\]/);
 assert.equal(deidentify('Hola',{}).text,'Hola');assert.equal(deidentify(null).text,'');
});
test('the AI provider never receives names or documents, even if the client forgot to scrub',async()=>withEnv({GROQ_API_KEY:'gsk_secret'},async()=>{
 const sent=[];global.fetch=async(url,args)=>{const b=JSON.parse(args.body);sent.push(JSON.stringify(b));return {ok:true,json:async()=>({choices:[{message:{content:b.messages[0].content.includes('Redactás')?'Texto prolijo.':'{"plan":[]}'},finish_reason:'stop'}]})};};
 let r=await structure(ev({transcript:'Paciente Juan Pérez DNI 30111222 refiere dolor torácico. Tratamiento aspirina 100 mg.',patientContext:{edad:50,sexo:'Masculino',nombre:'Juan',dni:'30111222',antecedentes_personales:['HTA','mail juan@x.com'],alergias:[],medicacion_habitual:['enalapril 10 mg']}}));
 assert.equal(r.statusCode,200);const payload=sent.at(-1);for(const leak of ['Juan','Pérez','30111222','juan@x.com'])assert.ok(!payload.includes(leak),'provider received '+leak);for(const keep of ['dolor torácico','aspirina 100 mg','HTA','enalapril 10 mg'])assert.ok(payload.includes(keep));assert.ok(!payload.includes('gsk_secret'));
 assert.ok(payload.includes('"plan\\" reúne el tratamiento'));
 r=await rewrite(ev({texto:'Paciente María López con dolor desde ayer, DNI 28111222'}));assert.equal(r.statusCode,200);assert.ok(!sent.at(-1).includes('López')&&!sent.at(-1).includes('28111222'));
 r=await scrub(ev({text:'Paciente Juan Pérez con dolor',identity}));assert.equal(r.statusCode,200);const out=JSON.parse(r.body);assert.equal(out.text,'Paciente [NOMBRE] [NOMBRE] con dolor');assert.equal(sent.length,2,'de-identification never calls the provider');
}));
test('consultorio validates input, honours the off switch, optional access key and the hourly cap',async()=>{
 await withEnv({GROQ_API_KEY:'k'},async()=>{
  global.fetch=async()=>({ok:true,json:async()=>({choices:[{message:{content:'{}'},finish_reason:'stop'}]})});
  assert.equal((await structure({...ev({}),httpMethod:'GET'})).statusCode,405);assert.equal((await structure(ev('{'))).statusCode,400);assert.equal((await structure(ev({transcript:'  '}))).statusCode,400);assert.equal((await structure(ev({transcript:5}))).statusCode,400);
  assert.equal((await structure(ev({transcript:'x'.repeat(61000)}))).statusCode,413);assert.equal((await scrub(ev({text:''}))).statusCode,400);
  global.fetch=async()=>({ok:true,json:async()=>({choices:[{message:{content:'no es json'},finish_reason:'stop'}]})});assert.equal((await structure(ev({transcript:'hola'}))).statusCode,502);
  global.fetch=async()=>({ok:false,status:429});assert.equal((await structure(ev({transcript:'hola'}))).statusCode,429);
 });
 await withEnv({GROQ_API_KEY:'k',LEGACY_CLINICAL_ENABLED:'false'},async()=>assert.equal((await structure(ev({transcript:'hola'}))).statusCode,503));
 await withEnv({},async()=>{const r=await structure(ev({transcript:'hola'}));assert.equal(r.statusCode,503);assert.match(JSON.parse(r.body).error,/GROQ_API_KEY/);});
 await withEnv({GROQ_API_KEY:'k',CLINIC_ACCESS_TOKEN:'a-token-with-more-than-24-chars'},async()=>{
  global.fetch=async()=>({ok:true,json:async()=>({choices:[{message:{content:'{"plan":[]}'},finish_reason:'stop'}]})});
  assert.equal((await structure(ev({transcript:'hola'}))).statusCode,401);assert.equal((await scrub(ev({text:'hola'},{authorization:'Bearer wrong'}))).statusCode,401);
  assert.equal((await structure(ev({transcript:'hola'},{authorization:'Bearer a-token-with-more-than-24-chars'}))).statusCode,200);
 });
});
