import {fill,add,h,shuffle,httpsOnly,sourceLinks,match,slideshow} from './class-ui.mjs';
const KEY='clinia_classes_v1';
const $=s=>document.querySelector(s);
const load=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[];}catch{return[];}};
const store=list=>{try{localStorage.setItem(KEY,JSON.stringify(list.slice(0,20)));return true;}catch{return false;}};
function quiz(q,byId,label){
 const box=h('div',{class:'worked-example'}),out=h('p',{role:'status'});
 const opts=q.options.map((o,i)=>({o,i}));
 const order=shuffle(opts);
 add(box,h('p',{},h('strong',{},label+' '),q.prompt));
 order.forEach(({o,i})=>{const b=h('button',{type:'button',class:'option',onclick:()=>{box.querySelectorAll('button').forEach(x=>x.disabled=true);
  out.textContent=(i===q.answer?'Correcto. ':'No es la mejor opción. La correcta es: '+q.options[q.answer]+'. ')+q.why;b.setAttribute('aria-pressed','true');add(box,sourceLinks(q.sources,byId));}},o);add(box,b);});
 add(box,out);return box;
}
function render(c){
 const view=$('#class-view');fill(view,);if(!c)return;
 const byId=Object.fromEntries(c.sources.map(s=>[s.id,s]));
 add(view,h('h2',{},c.title),h('p',{class:'chat-status'},c.notice),c.summary&&h('p',{},c.summary));
 if(c.objectives.length)add(view,h('h3',{},'Objetivos'),h('ul',{},c.objectives.map(o=>h('li',{},o))));
 add(view,h('h3',{},'Teoría'));c.sections.forEach(s=>add(view,h('details',{class:'worked-example',open:true},h('summary',{},s.heading),h('p',{},s.body),sourceLinks(s.sources,byId))));
 if(c.slides?.length)add(view,h('h3',{},'Presentación'),slideshow(c.slides,byId));
 add(view,h('h3',{},'Preguntas'));c.questions.forEach((q,i)=>add(view,quiz(q,byId,(i+1)+'.')));
 if(c.case){add(view,h('h3',{},'Caso ficticio'),h('p',{},c.case.scenario),quiz(c.case.question,byId,'Caso:'));}
 if(c.game)add(view,match(c.game));
 add(view,h('h3',{},'Fuentes consultadas'),h('ul',{},c.sources.map(s=>h('li',{},h('strong',{},s.id),' · '+s.provider+' · ',httpsOnly(s.url)?h('a',{href:s.url,target:'_blank',rel:'noopener'},s.title):s.title))));
 add(view,h('div',{class:'actions'},h('button',{type:'button',onclick:()=>{const l=load().filter(x=>x.generatedAt!==c.generatedAt);l.unshift(c);$('#class-status').textContent=store(l)?'Clase guardada en este dispositivo.':'No se pudo guardar en este navegador.';renderSaved();}},'Guardar en este dispositivo'),h('button',{type:'button',onclick:()=>{const a=h('a',{href:URL.createObjectURL(new Blob([JSON.stringify(c,null,2)],{type:'application/json'})),download:'clase-clinicia.json'});a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}},'Descargar (JSON)')));
 view.scrollIntoView?.({behavior:'smooth'});
}
function renderSaved(){const box=$('#saved'),list=load();fill(box,list.length?h('ul',{},list.map(c=>h('li',{},h('button',{type:'button',onclick:()=>render(c)},c.title),' ',h('small',{},new Date(c.generatedAt).toLocaleDateString('es-AR')),' ',h('button',{type:'button',onclick:()=>{store(load().filter(x=>x.generatedAt!==c.generatedAt));renderSaved();}},'Borrar')))):h('p',{class:'muted'},'Todavía no guardaste clases.'));}
$('#class-form').addEventListener('submit',async e=>{
 e.preventDefault();const status=$('#class-status'),btn=$('#make');
 const minutes=Number($('#minutes').value);
 btn.disabled=true;status.textContent='Buscando fuentes en la web y armando la clase… puede tardar hasta un minuto.';
 try{
  const resp=await fetch('/api/tutor-class',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({brief:$('#brief').value,audience:$('#audience').value,level:$('#level').value,minutes:Number.isInteger(minutes)&&minutes>0?minutes:undefined}),signal:AbortSignal.timeout(120000)});
  const data=await resp.json();
  if(resp.ok&&data.class){status.textContent='Clase lista. Revisala antes de usarla.';render(data.class);}else{status.textContent=data.error||'No se pudo crear la clase.';}
 }catch{status.textContent='No hay conexión con el servicio de IA o tardó demasiado. Probá de nuevo.';}
 finally{btn.disabled=false;}
});
renderSaved();
