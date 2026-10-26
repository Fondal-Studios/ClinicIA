import {fill,add,h,httpsOnly,sourceLinks,match,slideshow,attemptRunner} from './class-ui.mjs';
import {api} from './training-ui.mjs';
const root=document.querySelector('#aula'),statusEl=document.querySelector('#aula-status');
const say=m=>{statusEl.textContent=m||'';};
const B='/api/account/classes';
const fmt=d=>d?new Date(d).toLocaleString('es-AR',{dateStyle:'medium',timeStyle:'short'}):'';
let cls=null,draft=null,tab='datos',dirty=false;
const run=fn=>async(...a)=>{try{say('');await fn(...a);}catch(e){say(e.message);}};


/* Tutor creador: a natural-language and optional voice entry point.
   Uses the existing authenticated class-ai endpoint and the same drafts,
   editorial review, publishing and student-code flow. */
function tutorCreator(brief,make,audience){
 const chat=h('div',{class:'tutor-creator-log','aria-live':'polite'},
  h('p',{class:'tutor-creator-bubble'},'Hola, soy tu tutor creador. Contame qué querés enseñar, para quién y qué deberían aprender. Puede ser una clase, un taller o un curso introductorio.'),
  h('p',{class:'muted'},'Ejemplo: «Armame una clase de 45 minutos sobre sepsis para enfermeros, con teoría, casos y evaluación».'));
 const text=h('textarea',{rows:'4',maxlength:'1500',placeholder:'Escribí como le hablarías al tutor…','aria-label':'Contale al tutor qué curso o clase necesitás'});
 const reply=h('p',{role:'status',class:'muted'});
 const talk=h('button',{type:'button'},'Dictar con voz');
 const compose=h('button',{type:'button',class:'primary',onclick:()=>{
  const idea=text.value.trim();
  if(idea.length<15){reply.textContent='Contame un poco más sobre el tema y el público.';text.focus();return;}
  brief.value=idea;
  chat.append(h('p',{class:'tutor-creator-bubble user'},idea));
  reply.textContent='Estoy preparando un borrador con fuentes y preguntas. Lo vas a poder revisar y después publicar para tus alumnos.';
  make.click();
 }},'Crear borrador con mi tutor');
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Recognition){talk.disabled=true;talk.title='Este navegador no ofrece dictado desde la aplicación. Podés usar el micrófono del teclado.';}
 else talk.addEventListener('click',()=>{
  const rec=new Recognition();rec.lang='es-AR';rec.interimResults=false;rec.maxAlternatives=1;
  talk.disabled=true;reply.textContent='Escuchando…';
  rec.onresult=e=>{text.value=[text.value,e.results[0][0].transcript].filter(Boolean).join(' ').slice(0,1500);reply.textContent='Dictado listo. Podés editarlo antes de enviarlo.';};
  rec.onerror=()=>{reply.textContent='No se pudo usar el micrófono. Podés escribir o usar el dictado del teclado.';};
  rec.onend=()=>{talk.disabled=false;};
  try{rec.start();}catch{talk.disabled=false;reply.textContent='No se pudo iniciar el micrófono.';}
 });
 const copy=h('div',{class:'card tutor-creator'},h('span',{class:'eyebrow'},'TUTOR IA · CREAR CURSOS'),h('h2',{},'Pedile una clase al tutor, hablando o escribiendo'),chat,text,h('div',{class:'actions'},talk,compose),reply,
  h('p',{class:'muted'},'1. El tutor prepara un borrador con teoría y preguntas. 2. Vos revisás y guardás. 3. Publicás y compartís el código con alumnos. Tus creaciones quedan en Mis clases. No se incorporan automáticamente al catálogo público de ClinicIA.'));
 return copy;
}

/* ---------- home ---------- */
async function home(){
 cls=null;draft=null;dirty=false;location.hash='';
 const data=await api(B).catch(e=>{say(e.message+' Ingresá desde Mi cuenta para usar las aulas.');return null;});if(!data){fill(root,h('p',{},h('a',{href:'/'},'Ir a Mi cuenta')));return;}
 const mine=data.classes.filter(c=>c.role!=='student'),learning=data.classes.filter(c=>c.role==='student');
 const code=h('input',{maxlength:'12',placeholder:'Código de 8 caracteres',autocapitalize:'characters',autocomplete:'off','aria-label':'Código del aula'}),ok=h('input',{type:'checkbox'});
 const brief=h('textarea',{rows:'5',maxlength:'1500',placeholder:'Ej.: Clase de glomerulopatías para residentes de clínica médica: síndrome nefrítico vs nefrótico, diagnóstico diferencial y cuándo derivar a nefrología. 30 minutos.'}),aud=h('input',{maxlength:'120',placeholder:'Audiencia (opcional)'}),min=h('input',{type:'number',min:'10',max:'120',step:'5',placeholder:'Minutos (opcional)'});
 const make=h('button',{type:'button',onclick:run(async()=>{make.disabled=true;say('El tutor está buscando fuentes y armando el aula… puede tardar hasta un minuto.');try{const d=await api('/api/account/class-ai',{action:'draft',brief:brief.value,audience:aud.value,minutes:Number(min.value)>0?Number(min.value):undefined});const c=await api(B,{action:'create',content:d.class});say('Aula creada como borrador. Revisala y editala antes de publicar.');open(c);}finally{make.disabled=false;}})},'Crear con el tutor');
 const teacher=localStorage.getItem('clinia_mode')==='teacher';
 const activate=h('section',{class:'card'},h('h2',{},'¿Querés crear clases?'),h('p',{},'Activá el modo Profesor: creás clases con el tutor, usás la biblioteca de preguntas y teoría, y ves los resultados de tus alumnos.'),h('button',{type:'button',onclick:()=>document.querySelector('#areas-mode')?.click()},'Cambiar a modo Profesor'));
 const library=h('section',{class:'card'},h('h2',{},'Biblioteca de preguntas y teoría'),h('p',{},'Buscá en todo el banco de ClinicIA y agregá preguntas o teoría a tus clases.'),h('button',{type:'button',onclick:()=>{location.hash='biblioteca';libraryView();}},'Abrir la biblioteca'));
 const parts={create:[tutorCreator(brief,make,aud),h('section',{class:'card'},h('h2',{},'Crear un aula con el tutor'),h('p',{},'Describí el tema, la audiencia y lo que querés lograr. El tutor busca en la web, arma teoría, presentación, preguntas, un caso y un juego, y vos lo editás antes de compartir.'),brief,aud,min,h('div',{class:'actions'},make,h('button',{type:'button',onclick:run(async()=>{open(await api(B,{action:'create',content:{title:'Aula nueva',sections:[],slides:[],questions:[],sources:[]}}));})},'Empezar en blanco')))],mine:[h('h2',{},'Mi biblioteca de clases y cursos creados'),mine.length?mine.map(c=>row(c,`${c.role==='owner'?'Dueño':'Colaborador'} · ${c.status==='published'?'Publicada':'Borrador'}${c.members!==undefined?' · '+c.members+' alumnos':''}`)):h('p',{class:'muted'},'Todavía no creaste clases. Pedile al tutor un curso arriba para comenzar.')],join:[h('section',{class:'card'},h('h2',{},'Unirme con un código'),code,h('label',{class:'option-row'},ok,' Acepto que el docente verá mi nombre de usuario y mis resultados en esta aula.'),h('button',{type:'button',onclick:run(async()=>{open(await api(B,{action:'join',code:code.value,accepted:ok.checked}));})},'Unirme'))],learn:[h('h2',{},'Mis cursos como alumno'),learning.length?learning.map(c=>row(c,(c.passed?'✔ Aprobado':c.best!==null?'Mejor resultado '+c.best+'% (necesitás '+c.passPct+'%)':'Sin evaluar')+(c.dueAt?' · Fecha límite '+fmt(c.dueAt):''))):h('p',{class:'muted'},'Todavía no te uniste a ningún aula.')]};
 fill(root,...(teacher?[...parts.create,library,...parts.mine,...parts.join,...parts.learn]:[...parts.join,...parts.learn,activate]));
 function row(c,info){return h('div',{class:'card row'},h('button',{type:'button',onclick:run(async()=>open(await api(B+'/'+c.id)))},c.title),h('small',{},info));}
}
function open(c){cls=c;dirty=false;tab=c.role==='student'?'presentacion':'datos';draft=c.role==='student'?null:structuredClone(c.content);location.hash=c.id;render();}

/* ---------- shared pieces ---------- */
const byId=c=>Object.fromEntries((c.sources||[]).map(s=>[s.id,s]));
function tabs(list){return h('div',{class:'tabs',role:'tablist'},list.map(([id,label])=>h('button',{type:'button',role:'tab','aria-selected':String(tab===id),onclick:()=>{tab=id;render();}},label)));}
function studentTabs(c){
 const t=[];if(c.slides?.length)t.push(['presentacion','Presentación']);if(c.sections?.length)t.push(['teoria','Teoría']);if(c.game)t.push(['juego','Juego']);if(c.case)t.push(['caso','Caso']);t.push(['practica','Practicar'],['evaluacion','Evaluación']);
 return t;
}
function studentBody(c,classId,sources){
 const map=byId({sources});
 if(tab==='presentacion')return slideshow(c.slides,map);
 if(tab==='teoria')return h('div',{},c.objectives?.length?[h('h3',{},'Objetivos'),h('ul',{},c.objectives.map(o=>h('li',{},o)))]:null,c.sections.map(s=>h('details',{class:'worked-example',open:true},h('summary',{},s.heading),s.body.split('\n\n').map(p=>h('p',{},p)),sourceLinks(s.sources,map))));
 if(tab==='juego')return match(c.game);
 if(tab==='caso')return h('div',{},h('h3',{},'Caso ficticio'),h('p',{},c.case.scenario),h('p',{class:'muted'},'La pregunta de este caso forma parte de la práctica y de la evaluación.'));
 const kind=tab==='practica'?'practice':'exam';
 return h('div',{},h('p',{},kind==='exam'?'Las preguntas se mezclan en cada intento y se corrigen en el servidor. Podés repetir; cuenta tu mejor resultado.':'Practicá sin que cuente para la aprobación. Al entregar ves la corrección con explicación.'),
  attemptRunner({label:kind==='exam'?'Comenzar evaluación':'Comenzar práctica',start:()=>api(B+'/'+classId,{action:'start',kind}),submit:(a,answers)=>api(B+'/'+classId,{action:'submit',attemptId:a.attemptId,answers}),onDone:()=>{if(cls.role==='student')api(B+'/'+classId).then(x=>{cls={...cls,...x};head();}).catch(()=>{});}}));
}
let headEl;
function head(){if(!headEl)return;fill(headEl,h('h2',{},cls.title),h('p',{},cls.role==='student'?(cls.passed?'✔ Aprobado · mejor resultado '+cls.best+'%':'Necesitás '+cls.passPct+'% en la evaluación'+(cls.best!==null?' · mejor resultado '+cls.best+'%':'')):'Estado: '+(cls.status==='published'?'publicada':'borrador')+' · aprobación '+cls.passPct+'%'),cls.dueAt?h('p',{},'Fecha límite: '+fmt(cls.dueAt)):null,cls.content?.notice&&cls.role!=='student'?h('p',{class:'chat-status'},cls.content.notice):null);}

/* ---------- editor ---------- */
const bind=(obj,key,{area,type,max}={})=>{const e=h(area?'textarea':'input',{...(area?{rows:String(area)}:{}),...(type?{type}:{}),maxlength:String(max||300)});e.value=obj[key]??'';e.addEventListener('input',()=>{obj[key]=type==='number'?Number(e.value):e.value;dirty=true;});return e;};
const labeled=(text,el)=>h('label',{},text,el);
function move(arr,i,d){const j=i+d;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];dirty=true;render();}
function itemTools(arr,i,kind,fresh){return h('div',{class:'row'},h('button',{type:'button',onclick:()=>move(arr,i,-1)},'↑'),h('button',{type:'button',onclick:()=>move(arr,i,1)},'↓'),h('button',{type:'button',onclick:()=>{if(confirm('¿Eliminar este elemento?')){arr.splice(i,1);dirty=true;render();}}},'Eliminar'),
 kind?h('button',{type:'button',onclick:run(async()=>{const ins=prompt('¿Qué querés que cambie el tutor? (por ejemplo: más difícil, más corto, enfocado en niños)');if(ins===null)return;say('El tutor está buscando fuentes y reescribiendo…');const r=await api('/api/account/class-ai',{action:'regenerate',classId:cls.id,kind,item:arr[i],instruction:ins,sourceIds:draft.sources.map(s=>s.id)});arr[i]=r.item;draft.sources.push(...r.sources);dirty=true;say('Elemento regenerado. Revisalo y guardá.');render();})},'Regenerar con IA'):null);}
function adder(arr,fresh,label){return h('button',{type:'button',onclick:()=>{arr.push(fresh());dirty=true;render();}},'+ '+label);}
const newQ=()=>({prompt:'',options:['','','','',''],answer:0,why:'',sources:[]});
function questionEditor(q,arr,i,kind){
 const card=h('div',{class:'card'},labeled('Pregunta',bind(q,'prompt',{area:2,max:600})));
 q.options.forEach((_,oi)=>add(card,h('div',{class:'row'},h('input',{type:'radio',name:'ans'+(kind||'')+i,checked:q.answer===oi,'aria-label':'Opción correcta '+(oi+1),onchange:()=>{q.answer=oi;dirty=true;}}),labeled('Opción '+(oi+1)+' ',bind(q.options,oi)))));
 add(card,labeled('Por qué es correcta',bind(q,'why',{area:2,max:900})),q.sources?.length?sourceLinks(q.sources,byId(draft)):null);return card;
}
function editor(){
 const t=[['datos','Datos'],['teoria','Teoría'],['presentacion','Presentación'],['preguntas','Preguntas'],['caso','Caso y juego'],['alumnos','Alumnos y códigos'],['vista','Vista alumno']];
 const body=h('div');
 if(tab==='datos')add(body,labeled('Título',bind(draft,'title',{max:140})),labeled('Resumen',bind(draft,'summary',{area:3,max:500})),h('h3',{},'Objetivos'),...draft.objectives.map((_,i)=>h('div',{class:'card'},bind(draft.objectives,i,{area:2,max:200}),itemTools(draft.objectives,i))),adder(draft.objectives,()=>'','Agregar objetivo'),
  cls.role==='owner'?h('div',{class:'card'},h('h3',{},'Aprobación'),labeled('Porcentaje para aprobar (50–100)',(()=>{const e=bind(cls,'passPct',{type:'number'});e.min='50';e.max='100';return e;})()),labeled('Fecha límite (opcional)',(()=>{const e=h('input',{type:'datetime-local'});if(cls.dueAt){const d=new Date(cls.dueAt);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());e.value=d.toISOString().slice(0,16);}e.addEventListener('input',()=>{cls.dueAt=e.value?new Date(e.value).toISOString():null;dirty=true;});return e;})())):h('p',{class:'muted'},'Sólo quien creó el aula cambia el porcentaje de aprobación y la fecha límite.'));
 else if(tab==='teoria')add(body,...draft.sections.map((s,i)=>h('div',{class:'card'},labeled('Título de la sección',bind(s,'heading',{max:120})),labeled('Contenido',bind(s,'body',{area:8,max:2500})),sourceLinks(s.sources,byId(draft)),itemTools(draft.sections,i,'section'))),adder(draft.sections,()=>({heading:'',body:'',sources:[]}),'Agregar sección'));
 else if(tab==='presentacion')add(body,...draft.slides.map((s,i)=>h('div',{class:'card'},labeled('Título de la diapositiva',bind(s,'title',{max:100})),h('p',{class:'muted'},'Viñetas (una por línea, hasta 6)'),(()=>{const e=h('textarea',{rows:'5',maxlength:'1000'});e.value=s.bullets.join('\n');e.addEventListener('input',()=>{s.bullets=e.value.split('\n').slice(0,6);dirty=true;});return e;})(),labeled('Notas para quien presenta',bind(s,'notes',{area:2,max:600})),sourceLinks(s.sources,byId(draft)),itemTools(draft.slides,i,'slide'))),adder(draft.slides,()=>({title:'',bullets:[''],notes:'',sources:[]}),'Agregar diapositiva'));
 else if(tab==='preguntas')add(body,h('p',{},'Cada intento mezcla estas preguntas y las opciones. Marcá la opción correcta. Hacen falta al menos 3 para publicar.'),...draft.questions.map((q,i)=>h('div',{},h('strong',{},'Pregunta '+(i+1)),questionEditor(q,draft.questions,i,'q'),itemTools(draft.questions,i,'question'))),adder(draft.questions,newQ,'Agregar pregunta'));
 else if(tab==='caso'){
  add(body,h('h3',{},'Caso ficticio'),draft.case?h('div',{class:'card'},labeled('Escenario',bind(draft.case,'scenario',{area:4,max:1500})),questionEditor(draft.case.question,null,0,'c'),h('button',{type:'button',onclick:()=>{draft.case=null;dirty=true;render();}},'Quitar caso')):h('button',{type:'button',onclick:()=>{draft.case={scenario:'',question:newQ()};dirty=true;render();}},'+ Agregar caso'),
   h('h3',{},'Juego de unir conceptos (mínimo 4 pares)'));
  const pairs=draft.game?.pairs||[];add(body,...pairs.map((p,i)=>h('div',{class:'card'},labeled('Concepto',bind(p,'term',{max:80})),labeled('Definición',bind(p,'definition',{max:200})),itemTools(pairs,i))),h('button',{type:'button',onclick:()=>{draft.game=draft.game||{type:'match',pairs:[]};draft.game.pairs.push({term:'',definition:''});dirty=true;render();}},'+ Agregar par'));
 }else if(tab==='alumnos')return people();
 else if(tab==='vista'){add(body,dirty?h('p',{class:'chat-status'},'Guardá los cambios para verlos acá.'):null);const sv=studentSnapshot();const ts=studentTabs(sv);if(!ts.some(([id])=>id===tab2))tab2=ts[0][0];add(body,h('p',{class:'muted'},'Así lo ve un alumno. Podés hacer prácticas y evaluaciones de prueba (no aparecen como alumnos).'),h('div',{class:'tabs'},ts.map(([id,l])=>h('button',{type:'button','aria-selected':String(tab2===id),onclick:()=>{tab2=id;render();}},l))),(()=>{const keep=tab;tab=tab2;const el=studentBody(sv,cls.id,cls.content.sources);tab=keep;return el;})());}
 return body;
}
let tab2='';
function studentSnapshot(){const c=cls.content;return {...c,case:c.case?{scenario:c.case.scenario}:null};}
async function people(){
 const box=h('div');const owner=cls.role==='owner';
 add(box,h('div',{class:'card'},h('h3',{},'Cómo invitar'),cls.status!=='published'?h('p',{class:'chat-status'},'Publicá el aula para que los alumnos puedan unirse. Los colaboradores sí pueden unirse ahora.'):null,
  h('p',{},'Código para alumnos'),h('p',{class:'code'},cls.studentCode),owner?[h('p',{},'Código para colaboradores (pueden editar, no publicar)'),h('p',{class:'code'},cls.editorCode)]:null,
  h('p',{},'Indicación para el grupo: «Entren a ClinicIA → Aulas → Unirme con un código, e ingresen '+cls.studentCode+'».'+(cls.dueAt?' Fecha límite: '+fmt(cls.dueAt)+'. Aprobación: '+cls.passPct+'%.':' Aprobación: '+cls.passPct+'%.')),
  owner?h('div',{class:'row'},h('button',{type:'button',onclick:run(async()=>{if(!confirm('Los códigos actuales dejarán de funcionar. ¿Generar nuevos?'))return;const r=await api(B+'/'+cls.id,{action:'rotate-codes'});cls={...cls,...r};render();})},'Generar códigos nuevos')):null));
 const holder=h('div',{},h('p',{},'Cargando progreso…'));add(box,h('h3',{},'Progreso'),holder);
 try{const p=await api(B+'/'+cls.id+'/progress');
  const students=p.members.filter(m=>m.role==='student'),pass=students.filter(m=>m.passed).length;
  fill(holder,h('p',{},students.length+(students.length===1?' alumno · ':' alumnos · ')+pass+' aprobados ('+(students.length?Math.round(100*pass/students.length):0)+'%) · aprobación '+p.passPct+'%'),
   h('div',{class:'scroll'},h('table',{},h('thead',{},h('tr',{},['Integrante','Rol','Evaluaciones','Mejor','Estado','Última actividad',''].map(x=>h('th',{},x)))),h('tbody',{},p.members.map(m=>h('tr',{},h('td',{},m.name),h('td',{},m.role==='editor'?'Colaborador':'Alumno'),h('td',{},m.exams+(m.practices?' (+'+m.practices+' prácticas)':'')),h('td',{},m.best===null?'—':m.best+'%'),h('td',{},m.passed?'✔ Aprobado':m.exams?'Sin aprobar':'Sin evaluar'),h('td',{},fmt(m.lastAt)||'—'),h('td',{},owner?h('button',{type:'button',onclick:run(async()=>{if(!confirm('¿Quitar a '+m.name+' del aula? Se conservan sus intentos si vuelve a unirse.'))return;await api(B+'/'+cls.id,{action:'remove-member',userId:m.userId});render();})},'Quitar'):null)))))));
  if(!p.members.length)add(holder,h('p',{class:'muted'},'Todavía no se unió nadie.'));
 }catch(e){fill(holder,h('p',{},e.message));}
 return box;
}
async function save(){
 const r=await api(B+'/'+cls.id,{action:'save',version:cls.version,content:draft,...(cls.role==='owner'?{passPct:cls.passPct,dueAt:cls.dueAt||null}:{})});
 cls=r;draft=structuredClone(r.content);dirty=false;say('Cambios guardados.');render();
}
function render(){
 headEl=h('div');head();
 if(cls.role==='student'){const c=cls.content,ts=studentTabs(c);if(!ts.some(([id])=>id===tab))tab=ts[0][0];fill(root,h('p',{},h('button',{type:'button',onclick:run(home)},'← Mis aulas')),headEl,tabs(ts),studentBody(c,cls.id,c.sources),h('p',{class:'muted'},'Contenido educativo creado por tu docente con ayuda de IA y fuentes de la web; no reemplaza protocolos locales ni sirve para decidir sobre pacientes reales.'),h('div',{class:'actions'},h('button',{type:'button',onclick:run(async()=>{if(!confirm('¿Salir del aula?'))return;await api(B+'/'+cls.id,{action:'leave'});home();})},'Salir del aula'),h('button',{type:'button',onclick:()=>print()},'Imprimir / guardar PDF')));return;}
 const t=[['datos','Datos'],['teoria','Teoría'],['presentacion','Presentación'],['preguntas','Preguntas'],['caso','Caso y juego'],['alumnos','Alumnos y códigos'],['vista','Vista alumno']];
 const owner=cls.role==='owner';
 const bar=h('div',{class:'row'},h('button',{type:'button',onclick:run(async()=>{if(dirty&&!confirm('Tenés cambios sin guardar. ¿Salir igual?'))return;home();})},'← Mis aulas'),h('button',{type:'button',onclick:run(save)},'Guardar cambios'),
  owner?(cls.status==='published'?h('button',{type:'button',onclick:run(async()=>{if(dirty)throw new Error('Guardá los cambios antes de cambiar la publicación.');cls={...cls,...await api(B+'/'+cls.id,{action:'unpublish'})};render();})},'Retirar publicación'):h('button',{type:'button',onclick:run(async()=>{if(dirty)throw new Error('Guardá los cambios antes de publicar.');cls={...cls,...await api(B+'/'+cls.id,{action:'publish'})};say('Publicada. Compartí el código con tus alumnos.');tab='alumnos';render();})},'Publicar')):null,
  owner?h('button',{type:'button',onclick:run(async()=>{if(!confirm('Se elimina el aula con todos los intentos de sus alumnos. ¿Continuar?'))return;await api(B+'/'+cls.id,{action:'delete',confirm:true});home();})},'Eliminar aula'):null);
 const holder=h('div');fill(root,bar,headEl,tabs(t),holder);
 const content=editor();Promise.resolve(content).then(el=>fill(holder,el));
}
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});

/* ---------- biblioteca (modo profesor) ---------- */
const LIB='/api/account/library';
const srcFor=(content,src)=>{if(!src)return null;const hit=content.sources.find(x=>x.url===src.url);if(hit)return hit.id;if(content.sources.length>=40)return null;const n=Math.max(0,...content.sources.map(x=>Number(String(x.id).replace('W',''))||0))+1;content.sources.push({id:'W'+n,provider:'Biblioteca ClinicIA',kind:'biblioteca',title:src.title,url:src.url,meta:''});return 'W'+n;};
async function addToClass(classId,items){
 const c=await api(B+'/'+classId),content=structuredClone(c.content);let q=0,t=0;
 for(const it of items){
  if(it.kind==='question'){if(content.questions.length>=60)throw new Error('El aula ya tiene 60 preguntas.');const id=srcFor(content,it.source);content.questions.push({prompt:it.prompt,options:it.options,answer:it.answer,why:it.why,sources:id?[id]:[]});q++;}
  else{if(content.sections.length>=12)throw new Error('El aula ya tiene 12 secciones de teoría.');const id=srcFor(content,it.source);content.sections.push({heading:it.title,body:it.body.slice(0,2500),sources:id?[id]:[]});t++;}
 }
 await api(B+'/'+classId,{action:'save',version:c.version,content});return {q,t};
}
async function libraryView(){
 cls=null;draft=null;dirty=false;location.hash='biblioteca';
 const facets=await api(LIB+'?facets=1').catch(e=>{say(e.message);return null;});
 if(!facets){fill(root,h('p',{},'La biblioteca está disponible en modo Profesor. ',h('button',{type:'button',onclick:()=>document.querySelector('#areas-mode')?.click()},'Cambiar de modo'),' ',h('button',{type:'button',onclick:run(home)},'← Volver')));return;}
 const mineData=await api(B).catch(()=>({classes:[]})),mine=mineData.classes.filter(c=>c.role!=='student');
 const type=h('select',{'aria-label':'Tipo'},h('option',{value:'questions'},'Preguntas'),h('option',{value:'theory'},'Teoría'));
 const course=h('select',{'aria-label':'Curso'},h('option',{value:''},'Todos los cursos ('+facets.totalQuestions+' preguntas)'),facets.courses.map(c=>h('option',{value:c.id},c.title+' · '+c.questions+' preg.')));
 const text=h('input',{placeholder:'Buscar por palabra (ej.: sepsis, vía aérea)','aria-label':'Buscar'});
 const target=h('select',{'aria-label':'Aula destino'},mine.map(c=>h('option',{value:c.id},c.title+(c.status==='published'?' (publicada)':' (borrador)'))));
 const list=h('div'),info=h('p',{role:'status'}),bar=h('div',{class:'actions'});
 let page=1,picked=new Map();
 const update=()=>{fill(bar,h('button',{type:'button',disabled:!picked.size||!mine.length,onclick:run(async()=>{const r=await addToClass(target.value,[...picked.values()]);picked=new Map();update();await search();say('Agregado al aula: '+r.q+' pregunta(s) y '+r.t+' sección(es) de teoría. Abrila para revisarlas.');})},'Agregar '+picked.size+' al aula'),mine.length?target:h('span',{class:'muted'},'Primero creá un aula para poder agregar contenido.'));};
 const search=run(async()=>{
  const q=new URLSearchParams({type:type.value,course:course.value,q:text.value,page:String(page)});const d=await api(LIB+'?'+q);
  info.textContent=d.total+' resultado(s)'+(d.total>d.pageSize?' · página '+d.page+' de '+Math.ceil(d.total/d.pageSize):'');
  const cards=d.items.map(it=>{
   const key=it.id,item=type.value==='questions'?{kind:'question',...it}:{kind:'theory',...it};
   const box=h('input',{type:'checkbox',checked:picked.has(key),'aria-label':'Elegir',onchange:e=>{if(e.target.checked)picked.set(key,item);else picked.delete(key);update();}});
   return type.value==='questions'
    ?h('details',{class:'card'},h('summary',{},box,' ',it.prompt),h('ol',{type:'A'},it.options.map((o,i)=>h('li',{},i===it.answer?h('strong',{},o+' ✔'):o))),h('p',{},it.why),h('small',{},it.courseTitle+' · '+(it.lessonTitle||'')),it.source&&httpsOnly(it.source.url)?h('p',{},h('a',{href:it.source.url,target:'_blank',rel:'noopener'},it.source.title+' ↗')):null)
    :h('details',{class:'card'},h('summary',{},box,' ',it.title,' · ',it.courseTitle),h('p',{},it.body.slice(0,900)+(it.body.length>900?'…':'')));
  });
  fill(list,cards,d.total>d.pageSize?h('div',{class:'actions'},h('button',{type:'button',disabled:page<=1,onclick:()=>{page--;search();}},'← Anterior'),h('button',{type:'button',disabled:page*d.pageSize>=d.total,onclick:()=>{page++;search();}},'Siguiente →')):null);
 });
 const go=()=>{page=1;search();};
 fill(root,h('p',{},h('button',{type:'button',onclick:run(()=>{location.hash='';home();})},'← Mis clases')),h('h2',{},'Biblioteca'),h('p',{},'Todo el banco de ClinicIA con sus respuestas y fuentes. Elegí preguntas o teoría y agregalas a una de tus aulas: se copian y podés editarlas sin cambiar el banco. El contenido está pendiente de validación docente: revisalo antes de usarlo.'),h('div',{class:'card'},h('div',{class:'row'},type,course),text,h('button',{type:'button',onclick:go},'Buscar')),info,list,h('div',{class:'card'},bar));
 type.addEventListener('change',go);course.addEventListener('change',go);text.addEventListener('keydown',e=>{if(e.key==='Enter')go();});update();search();
}
window.addEventListener('hashchange',()=>{if(location.hash==='#biblioteca')libraryView();else if(!location.hash&&!cls)home();});
window.addEventListener('clinia-mode',()=>{if(!cls&&location.hash!=='#biblioteca')home();});
(async()=>{const id=location.hash.slice(1);if(id==='biblioteca'){libraryView();return;}if(/^[a-f0-9-]{36}$/.test(id)){try{open(await api(B+'/'+id));return;}catch(e){say(e.message);}}home();})();
