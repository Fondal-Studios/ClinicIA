import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {searchWeb}=require('../netlify/lib/web-search.js'),{validateClass,buildClass,regenerateItem}=require('../netlify/lib/class-builder.js'),{handler:tutor}=require('../netlify/functions/tutor.js'),{handler:classHandler}=require('../netlify/functions/tutor-class.js');
const pmc={resultList:{result:[{title:'Fluid <b>resuscitation</b> in sepsis',abstractText:'Early recognition and fluids.',doi:'10.1/abc',pubYear:'2024',journalTitle:'Crit Care'},{title:'No link',abstractText:'x'}]}};
const medline='<nlmSearchResult><list num="1" start="0"><document url="https://medlineplus.gov/spanish/sepsis.html" rank="0"><content name="title">&lt;span&gt;Sepsis&lt;/span&gt;</content><content name="FullSummary">&lt;p&gt;La sepsis es una respuesta grave a una infección.&lt;/p&gt;</content></document><document url="javascript:alert(1)" rank="1"><content name="title">Malo</content><content name="FullSummary">x</content></document></list></nlmSearchResult>';
const wiki={query:{pages:{1:{index:1,title:'Sepsis',extract:'La sepsis es una disfunción orgánica.',fullurl:'https://es.wikipedia.org/wiki/Sepsis'}}}};
const web=(failing=[])=>async url=>{url=String(url);const f=n=>failing.includes(n);
 if(url.includes('europepmc')){if(f('pmc'))return {ok:false,status:500};return {ok:true,json:async()=>pmc};}
 if(url.includes('nlm.nih.gov')){return {ok:true,text:async()=>medline};}
 if(url.includes('wikipedia')){return {ok:true,json:async()=>wiki};}
 throw new Error('unexpected host '+url);};
test('web search normalises three providers, strips markup, drops unsafe links and survives a provider outage',async()=>{
 const r=await searchWeb('sepsis fluidos',{fetchImpl:web()});
 assert.deepEqual(r.results.map(x=>x.provider),['Europe PMC','MedlinePlus (NLM)','Wikipedia']);assert.deepEqual(r.results.map(x=>x.id),['W1','W2','W3']);
 assert.equal(r.results[0].title,'Fluid resuscitation in sepsis');assert.equal(r.results[0].url,'https://doi.org/10.1/abc');
 assert.ok(r.results.every(x=>x.url.startsWith('https://')&&!x.text.includes('<')));
 const out=await searchWeb('sepsis',{fetchImpl:web(['pmc'])});assert.deepEqual(out.errors,['Europe PMC']);assert.equal(out.results.length,2);
 assert.deepEqual((await searchWeb('a',{fetchImpl:web()})).results,[]);
});
const goodClass=ids=>({title:'Sepsis en guardia',summary:'Resumen',objectives:['Reconocer sepsis'],
 sections:[{heading:'Definición',body:'La sepsis es una respuesta grave.',sources:[ids[0]]},{heading:'Fluidos',body:'Reconocimiento temprano.',sources:[ids[0],'W99']},{heading:'Sin fuente',body:'Inventado',sources:['W99']}],
 questions:[1,2,3,4].map(n=>({prompt:'Pregunta '+n,options:['a'+n,'b'+n,'c'+n,'d'+n,'e'+n],answer:n%5,why:'Porque sí',sources:[ids[1]]})).concat([{prompt:'Mala',options:['x','x','y','z','w'],answer:0,why:'dup',sources:[ids[0]]},{prompt:'Sin cita',options:['a','b','c','d','e'],answer:0,why:'w',sources:[]}]),
 case:{scenario:'Paciente ficticio con fiebre.',question:{prompt:'¿Qué hacer?',options:['1','2','3','4','5'],answer:2,why:'Escalar',sources:[ids[0]]}},
 slides:[{title:'Diapositiva',bullets:['punto 1','punto 2'],notes:'n',sources:[ids[0]]},{title:'Sin fuente',bullets:['x'],sources:['W99']},{title:'Sin viñetas',bullets:[],sources:[ids[0]]}],
 game:{pairs:[{term:'A',definition:'a'},{term:'B',definition:'b'},{term:'C',definition:'c'},{term:'D',definition:'d'}]}});
test('class validation keeps only well-formed, source-backed content',async()=>{
 const {results}=await searchWeb('sepsis',{fetchImpl:web()});
 const c=validateClass(goodClass(['W1','W2']),results);
 assert.equal(c.sections.length,2);assert.equal(c.slides.length,1);assert.equal(c.slides[0].title,'Diapositiva');assert.deepEqual(c.sections[1].sources,['W1']);assert.equal(c.questions.length,4);assert.ok(c.case&&c.game);
 assert.deepEqual(c.sources.map(s=>s.id),['W1','W2']);assert.ok(!('text' in c.sources[0]));
 assert.equal(validateClass({...goodClass(['W1','W2']),questions:[]},results),null);assert.equal(validateClass(null,results),null);
 const noGame=validateClass({...goodClass(['W1','W2']),game:{pairs:[{term:'A',definition:'a'}]}},results);assert.equal(noGame.game,null);
});
const env={TUTOR_PROVIDER:'anthropic',ANTHROPIC_API_KEY:'secret',ANTHROPIC_MODEL:'m'};
const llmWeb=({plan,klass})=>async(url,args)=>{url=String(url);if(url.startsWith('https://api.anthropic.com')){const system=JSON.parse(args.body).system;const text=system.startsWith('Devolvé solo JSON {"queries"')?JSON.stringify(plan):JSON.stringify(klass);return {ok:true,json:async()=>({stop_reason:'end_turn',content:[{type:'text',text}]})};}return web()(url);};
test('class builder researches first, validates output and refuses to build without sources',async()=>{
 const c=await buildClass({brief:'Clase de sepsis para enfermería de guardia, 20 minutos',minutes:20},{env,fetchImpl:llmWeb({plan:{queries:['sepsis nursing']},klass:goodClass(['W1','W2'])})});
 assert.equal(c.status,'borrador-ia');assert.ok(c.notice.includes('No fue revisado'));assert.deepEqual(c.queries,['sepsis nursing']);
 await assert.rejects(()=>buildClass({brief:'corto'},{env}),e=>e.status===400);
 await assert.rejects(()=>buildClass({brief:'Clase sobre un tema cualquiera sin resultados'},{env,fetchImpl:async url=>String(url).startsWith('https://api.anthropic.com')?{ok:true,json:async()=>({content:[{type:'text',text:'{"queries":["x y z"]}'}],stop_reason:'end_turn'})}:{ok:true,json:async()=>({}),text:async()=>''}}),e=>e.status===422);
 await assert.rejects(()=>buildClass({brief:'Clase de sepsis para enfermería de guardia'},{env,fetchImpl:llmWeb({plan:{queries:['sepsis']},klass:{title:'x'}})}),e=>e.status===502);
});
test('tutor uses the web when the bank has nothing, labels it external and keeps secrets server-side',async()=>{
 const backup={...process.env},original=global.fetch;let systems=[];
 try{
  Object.assign(process.env,env);process.env.CLINIC_ACCESS_TOKEN='x'.repeat(30);
  global.fetch=async(url,args)=>{url=String(url);if(url.startsWith('https://api.anthropic.com')){const system=JSON.parse(args.body).system;systems.push(system);const planning=system.startsWith('Devolvé solo JSON');return {ok:true,json:async()=>({stop_reason:'end_turn',content:[{type:'text',text:planning?'{"queries":["sepsis"]}':'Según la web [W1] la sepsis es grave.'}]})};}return web()(url);};
  const ev=body=>({httpMethod:'POST',headers:{},body:JSON.stringify(body)});
  const res=await tutor(ev({question:'Explicame la lactatemia en shock septico en detalle zzzqq',courseId:'acls',web:true}));const data=JSON.parse(res.body);
  assert.equal(res.statusCode,200);assert.equal(data.webSources.length,3);assert.ok(data.webSources.every(w=>w.url.startsWith('https://')&&!('text' in w)));
  const answerSystem=systems.at(-1);assert.ok(answerSystem.includes('FUENTES WEB')&&answerSystem.includes('material externo'));assert.ok(!res.body.includes('secret'));
  // no web flag and a bank match: no web block, no web call
  systems=[];const bank=JSON.parse((await tutor(ev({question:'Soporte vital básico RCP',courseId:'acls'}))).body);assert.deepEqual(bank.webSources,[]);assert.ok(!systems[0].includes('FUENTES WEB:'));
  // nothing anywhere
  global.fetch=async url=>String(url).startsWith('https://api.anthropic.com')?{ok:true,json:async()=>({stop_reason:'end_turn',content:[{type:'text',text:'{"queries":["zzz"]}'}]})}:{ok:true,json:async()=>({}),text:async()=>''};
  const none=JSON.parse((await tutor(ev({question:'Cuántas lunas tiene Júpiter',courseId:'acls'}))).body);assert.equal(none.provider,'bank');assert.deepEqual(none.webSources,[]);
 }finally{global.fetch=original;for(const k of Object.keys({...env,CLINIC_ACCESS_TOKEN:1})){if(backup[k]===undefined)delete process.env[k];else process.env[k]=backup[k];}}
});
test('class endpoint validates input, requires a configured provider and hides errors',async()=>{
 const backup={...process.env};
 try{
  for(const k of ['TUTOR_PROVIDER','GROQ_API_KEY','ANTHROPIC_API_KEY','ANTHROPIC_MODEL'])delete process.env[k];
  const ev=body=>({httpMethod:'POST',headers:{},body:typeof body==='string'?body:JSON.stringify(body)});
  assert.equal((await classHandler({...ev({}),httpMethod:'GET'})).statusCode,405);
  assert.equal((await classHandler(ev('{'))).statusCode,400);assert.equal((await classHandler(ev({brief:5}))).statusCode,400);
  assert.equal((await classHandler(ev({brief:'Una clase suficientemente descriptiva'}))).statusCode,503);
 }finally{for(const k of ['TUTOR_PROVIDER','GROQ_API_KEY','ANTHROPIC_API_KEY','ANTHROPIC_MODEL']){if(backup[k]===undefined)delete process.env[k];else process.env[k]=backup[k];}}
});

test('regenerating one element re-researches, validates and gives new sources collision-free ids',async()=>{
 const item={prompt:'Nueva',options:['1','2','3','4','5'],answer:1,why:'Porque',sources:['W2','W9']};
 const fetchImpl=async(url,args)=>{url=String(url);if(url.startsWith('https://api.anthropic.com')){const system=JSON.parse(args.body).system;const text=system.startsWith('Devolvé solo JSON {"queries"')?'{"queries":["sepsis"]}':JSON.stringify({item});return {ok:true,json:async()=>({stop_reason:'end_turn',content:[{type:'text',text}]})};}return web()(url);};
 const r=await regenerateItem({kind:'question',item:{prompt:'Vieja'},instruction:'más difícil',classTitle:'Sepsis',idStart:5},{env,fetchImpl});
 assert.deepEqual(r.item.sources,['W5']);assert.deepEqual(r.sources.map(s=>s.id),['W5']);assert.ok(r.sources[0].url.startsWith('https://'));
 await assert.rejects(()=>regenerateItem({kind:'nope',classTitle:'x'},{env,fetchImpl}),e=>e.status===400);
 const bad=async(url,args)=>String(url).startsWith('https://api.anthropic.com')?{ok:true,json:async()=>({stop_reason:'end_turn',content:[{type:'text',text:'{"item":{"prompt":"x"}}'}]})}:web()(url);
 await assert.rejects(()=>regenerateItem({kind:'question',classTitle:'Sepsis'},{env,fetchImpl:bad}),e=>e.status===502);
});
