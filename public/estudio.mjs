import {fill,h,shuffle} from './class-ui.mjs';
import {api} from './training-ui.mjs';
const root=document.querySelector('#app'),statusEl=document.querySelector('#status');
const say=m=>{statusEl.textContent=m||'';};
const run=fn=>async(...a)=>{try{say('');await fn(...a);}catch(e){say(e.message||'No se pudo completar la operación.');}};
const M='/api/account/materials',C='/api/account/courses';

/* ---------- home: upload + materials ---------- */
async function home(){
 location.hash='';
 const data=await api(M).catch(e=>{say(e.message+' Ingresá desde Mi cuenta para usar esta sección.');return null;});
 if(!data){fill(root,h('p',{},h('a',{href:'/'},'Ir a Mi cuenta')));return;}
 const title=h('input',{type:'text',maxlength:'120',placeholder:'Ej.: Anatomía II — Miembro superior','aria-label':'Nombre del material'});
 const file=h('input',{type:'file',accept:'application/pdf,.pdf','aria-label':'Archivo PDF'});
 const ok=h('input',{type:'checkbox'});
 const send=h('button',{type:'button',class:'big',onclick:run(async()=>{
  const f=file.files[0];
  if(!f)throw new Error('Elegí un PDF.');
  if(f.size>15*1024*1024)throw new Error('El PDF supera los 15 MB. Dividilo en partes.');
  if(!ok.checked)throw new Error('Confirmá que tenés derecho a usar este material.');
  send.disabled=true;say('Leyendo el PDF…');
  try{
   const r=await fetch(M+'/upload?title='+encodeURIComponent(title.value||f.name.replace(/\.pdf$/i,'')),{method:'POST',headers:{'Content-Type':'application/pdf'},body:f});
   const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'No se pudo subir el PDF.');
   await courseView(d.material.id);
  }finally{send.disabled=false;}
 })},'Subir y empezar');
 fill(root,
  h('section',{class:'card'},h('h2',{},'Subí tu material'),
   h('p',{},'Cargá los apuntes o capítulos de una materia en PDF. La app arma lecciones cortas con ejercicios, y cada ejercicio cita la página de tu material para que puedas verificarlo.'),
   title,h('p',{},file),
   h('label',{class:'check'},ok,' Es material propio o tengo derecho a usarlo.'),
   h('div',{class:'notice'},'El texto de tu PDF se envía al proveedor de IA (Anthropic) para generar las lecciones. Guardamos solo el texto extraído en tu cuenta, no el archivo, y podés eliminarlo cuando quieras. Las lecciones las genera una IA: verificá siempre con tu material o con tu docente.'),
   send),
  h('h2',{},'Mis materiales'),
  data.materials.length?data.materials.map(m=>h('div',{class:'card row'},
   h('div',{},h('strong',{},m.title),h('div',{class:'muted'},m.pageCount+' páginas · '+(m.lessons?m.lessons+' lecciones':'sin lecciones todavía'))),
   h('div',{class:'row'},
    h('button',{type:'button',onclick:run(()=>courseView(m.id))},m.lessons?'Seguir':'Generar lecciones'),
    h('button',{type:'button',onclick:run(async()=>{if(!confirm('¿Eliminar este material y sus lecciones?'))return;await api(M,{action:'delete',id:m.id});await home();})},'Eliminar')))):h('p',{class:'muted'},'Todavía no subiste material.'));
}

/* ---------- a material: generate lessons + path ---------- */
async function courseView(materialId){
 location.hash=materialId;
 const [mats,{course}]=await Promise.all([api(M),api(C+'?material='+encodeURIComponent(materialId))]);
 const m=mats.materials.find(x=>x.id===materialId);if(!m){await home();return;}
 const lessons=course?.lessons||[],progress=course?.progress||{};
 const from=h('input',{type:'number',min:'1',max:String(m.pageCount),value:'1','aria-label':'Desde la página'}),to=h('input',{type:'number',min:'1',max:String(m.pageCount),value:String(Math.min(m.pageCount,12)),'aria-label':'Hasta la página'});
 const gen=h('button',{type:'button',class:'big',onclick:run(async()=>{
  gen.disabled=true;say('Armando las lecciones y verificando cada cita contra tu material… puede tardar un minuto.');
  try{
   const d=await api(C,{action:'generate',materialId,from:Number(from.value),to:Number(to.value)});
   await courseView(materialId);
   say(`Listo: ${d.added} ${d.added===1?'lección nueva':'lecciones nuevas'}.`+(d.failedRanges.length?` No pude verificar las páginas ${d.failedRanges.map(r=>r[0]===r[1]?r[0]:r.join('–')).join(', ')}.`:''));
  }finally{gen.disabled=false;}
 })},lessons.length?'Generar más lecciones':'Generar lecciones');
 fill(root,
  h('p',{},h('button',{type:'button',onclick:run(home)},'← Mis materiales')),
  h('h2',{},m.title),
  h('section',{class:'card'},h('h3',{},'Elegí qué páginas estudiar'),
   h('div',{class:'range'},'Páginas',from,'a',to,h('span',{class:'muted'},'de '+m.pageCount+' (hasta 30 por vez)')),
   h('p',{class:'muted'},'Cada lección cubre unas 4 páginas. Los ejercicios que no se pueden respaldar con una cita textual de tu material se descartan.'),gen),
  lessons.length?h('div',{class:'path'},lessons.map((l,i)=>{const p=progress[l.id];return h('button',{type:'button',class:'node'+(p?.best>=80?' done':''),onclick:run(()=>play(course,l,m))},h('span',{},h('strong',{},(i+1)+'. '+l.title),h('span',{class:'muted'},'Páginas '+l.pages[0]+(l.pages[1]!==l.pages[0]?'–'+l.pages[1]:'')+' · '+l.exercises.length+' ejercicios')),h('span',{},p?(p.best>=80?'✔ ':'')+p.best+'%':'Empezar'));})):h('p',{class:'muted'},'Todavía no hay lecciones. Elegí un rango de páginas y generalas.'));
}

/* ---------- lesson player ---------- */
function play(course,lesson,material){
 const queue=shuffle(lesson.exercises).map(e=>({e,retry:false}));
 let i=0,right=0,attempts=0;
 const total=()=>queue.length;
 function step(){
  if(i>=queue.length)return finish();
  const {e,retry}=queue[i];let picked=null,checked=false;
  const options=e.type==='tf'?[{label:'Verdadero',value:true},{label:'Falso',value:false}]:shuffle(e.options.map((label,idx)=>({label,value:idx})));
  const feedback=h('div',{'aria-live':'polite'});
  const btns=options.map(o=>h('button',{type:'button',class:'choice','aria-pressed':'false',onclick:()=>{if(checked)return;picked=o;btns.forEach(b=>b.setAttribute('aria-pressed',String(b===btn(o))));main.disabled=false;}},o.label));
  const btn=o=>btns[options.indexOf(o)];
  const main=h('button',{type:'button',class:'big',disabled:true,onclick:()=>{
   if(!checked){
    checked=true;attempts++;const ok=picked.value===e.answer;if(ok)right++;
    btns.forEach((b,k)=>{b.disabled=true;if(options[k].value===e.answer)b.classList.add('right');else if(b===btn(picked)&&!ok)b.classList.add('wrong');});
    if(!ok&&!retry)queue.push({e,retry:true});
    fill(feedback,h('div',{class:'feedback '+(ok?'ok':'no')},h('h2',{},ok?'¡Correcto!':'No era esa'),h('p',{},e.explanation),h('div',{class:'evidence'},'Tu material, página '+e.evidence.page+': «'+e.evidence.quote+'»'),!ok&&!retry?h('p',{class:'muted'},'Vas a volver a ver este ejercicio al final.'):null));
    main.textContent=i+1>=queue.length?'Terminar':'Continuar';return;
   }
   i++;step();
  }},'Comprobar');
  const prompt=h('p',{class:'q'},...e.prompt.split('____').flatMap((t,k,a)=>k<a.length-1?[t,h('span',{class:'blank'})]:[t]));
  fill(root,h('div',{class:'player'},
   h('div',{class:'topbar'},h('button',{type:'button','aria-label':'Salir de la lección',onclick:run(()=>courseView(material.id))},'✕'),h('progress',{max:String(total()),value:String(i)})),
   prompt,h('div',{class:'choices'},btns),feedback,main));
 }
 async function finish(){
  const xp=right*10;
  let saved='';try{await api(C,{action:'complete',courseId:course.id,lessonId:lesson.id,correct:right,total:attempts});}catch{saved='No se pudo guardar tu progreso, pero la lección está completa.';}
  fill(root,h('div',{class:'player summary'},h('h2',{},'Lección completa'),h('p',{class:'xp'},'+'+xp+' XP'),h('p',{},right+' de '+attempts+' respuestas correctas'),saved?h('p',{class:'muted'},saved):null,
   h('button',{type:'button',class:'big',onclick:run(()=>courseView(material.id))},'Volver a la ruta'),
   h('button',{type:'button',class:'big secondary',onclick:()=>play(course,lesson,material)},'Repetir la lección')));
 }
 step();
}

if(location.hash.length>1)courseView(decodeURIComponent(location.hash.slice(1))).catch(()=>home());else home();
