const KEY='clinia_classes_v1';
const $=s=>document.querySelector(s);
function h(tag,attrs={},...kids){const e=document.createElement(tag);for(const [k,v] of Object.entries(attrs)){if(k==='class')e.className=v;else if(k.startsWith('on'))e.addEventListener(k.slice(2),v);else if(v!==false&&v!=null)e.setAttribute(k,v);}for(const k of kids.flat())if(k!=null)e.append(k.nodeType?k:document.createTextNode(String(k)));return e;}
const load=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[];}catch{return[];}};
const store=list=>{try{localStorage.setItem(KEY,JSON.stringify(list.slice(0,20)));return true;}catch{return false;}};
const shuffle=a=>{const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;};
const httpsOnly=u=>{try{return new URL(u).protocol==='https:'?u:null;}catch{return null;}};

function sourceLinks(ids,byId){return h('p',{class:'muted'},'Fuentes: ',ids.map((id,i)=>{const s=byId[id];const u=s&&httpsOnly(s.url);return [i?' · ':'',u?h('a',{href:u,target:'_blank',rel:'noopener'},id+' '+s.title):id];}));}

function quiz(q,byId,label){
 const box=h('div',{class:'worked-example'}),out=h('p',{role:'status'});
 const opts=q.options.map((o,i)=>({o,i}));
 const order=shuffle(opts);
 box.append(h('p',{},h('strong',{},label+' '),q.prompt));
 order.forEach(({o,i})=>{const b=h('button',{type:'button',class:'option',onclick:()=>{box.querySelectorAll('button').forEach(x=>x.disabled=true);
  out.textContent=(i===q.answer?'Correcto. ':'No es la mejor opción. La correcta es: '+q.options[q.answer]+'. ')+q.why;b.setAttribute('aria-pressed','true');box.append(sourceLinks(q.sources,byId));}},o);box.append(b);});
 box.append(out);return box;
}
function match(game){
 const box=h('div',{class:'worked-example'}),msg=h('p',{role:'status'},'Elegí un concepto y luego su definición.');let pick=null,done=0;
 const terms=h('div'),defs=h('div');
 shuffle(game.pairs).forEach(p=>terms.append(h('button',{type:'button',class:'option','data-t':p.term,onclick:e=>{if(e.currentTarget.disabled)return;pick=p;terms.querySelectorAll('button').forEach(b=>b.removeAttribute('aria-pressed'));e.currentTarget.setAttribute('aria-pressed','true');}},p.term)));
 shuffle(game.pairs).forEach(p=>defs.append(h('button',{type:'button',class:'option',onclick:e=>{if(!pick||e.currentTarget.disabled)return;if(pick.definition===p.definition){e.currentTarget.disabled=true;terms.querySelector('[data-t="'+CSS.escape(pick.term)+'"]').disabled=true;done++;msg.textContent=done===game.pairs.length?'¡Completaste el juego!':'Bien. Quedan '+(game.pairs.length-done)+'.';}else msg.textContent='Esa definición no corresponde a «'+pick.term+'». Probá otra.';pick=null;terms.querySelectorAll('button').forEach(b=>b.removeAttribute('aria-pressed'));}},p.definition)));
 box.append(h('h3',{},'Juego: unir conceptos'),msg,terms,defs);return box;
}
function render(c){
 const view=$('#class-view');view.replaceChildren();if(!c)return;
 const byId=Object.fromEntries(c.sources.map(s=>[s.id,s]));
 view.append(h('h2',{},c.title),h('p',{class:'chat-status'},c.notice),c.summary&&h('p',{},c.summary));
 if(c.objectives.length)view.append(h('h3',{},'Objetivos'),h('ul',{},c.objectives.map(o=>h('li',{},o))));
 view.append(h('h3',{},'Teoría'));c.sections.forEach(s=>view.append(h('details',{class:'worked-example',open:true},h('summary',{},s.heading),h('p',{},s.body),sourceLinks(s.sources,byId))));
 view.append(h('h3',{},'Preguntas'));c.questions.forEach((q,i)=>view.append(quiz(q,byId,(i+1)+'.')));
 if(c.case){view.append(h('h3',{},'Caso ficticio'),h('p',{},c.case.scenario),quiz(c.case.question,byId,'Caso:'));}
 if(c.game)view.append(match(c.game));
 view.append(h('h3',{},'Fuentes consultadas'),h('ul',{},c.sources.map(s=>h('li',{},h('strong',{},s.id),' · '+s.provider+' · ',httpsOnly(s.url)?h('a',{href:s.url,target:'_blank',rel:'noopener'},s.title):s.title))));
 view.append(h('div',{class:'actions'},h('button',{type:'button',onclick:()=>{const l=load().filter(x=>x.generatedAt!==c.generatedAt);l.unshift(c);$('#class-status').textContent=store(l)?'Clase guardada en este dispositivo.':'No se pudo guardar en este navegador.';renderSaved();}},'Guardar en este dispositivo'),h('button',{type:'button',onclick:()=>{const a=h('a',{href:URL.createObjectURL(new Blob([JSON.stringify(c,null,2)],{type:'application/json'})),download:'clase-clinicia.json'});a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}},'Descargar (JSON)')));
 view.scrollIntoView?.({behavior:'smooth'});
}
function renderSaved(){const box=$('#saved'),list=load();box.replaceChildren(list.length?h('ul',{},list.map(c=>h('li',{},h('button',{type:'button',onclick:()=>render(c)},c.title),' ',h('small',{},new Date(c.generatedAt).toLocaleDateString('es-AR')),' ',h('button',{type:'button',onclick:()=>{store(load().filter(x=>x.generatedAt!==c.generatedAt));renderSaved();}},'Borrar')))):h('p',{class:'muted'},'Todavía no guardaste clases.'));}
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
