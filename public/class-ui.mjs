// Shared by clase.html and aulas.html. Content (which may come from the web or an AI) is only ever inserted as text nodes.
export function h(tag,attrs={},...kids){const e=document.createElement(tag);for(const [k,v] of Object.entries(attrs)){if(k==='class')e.className=v;else if(k.startsWith('on'))e.addEventListener(k.slice(2),v);else if(v!==false&&v!=null)e.setAttribute(k,v===true?'':v);}for(const k of kids.flat(Infinity))if(k!=null&&k!==false)e.append(k.nodeType?k:document.createTextNode(String(k)));return e;}
// Appending null/false/arrays directly would insert the text "null" or "[object]": always flatten and filter.
const nodes=k=>k.flat(Infinity).filter(x=>x!=null&&x!==false).map(x=>x.nodeType?x:document.createTextNode(String(x)));
export const fill=(el,...k)=>{el.replaceChildren(...nodes(k));return el;};
export const add=(el,...k)=>{el.append(...nodes(k));return el;};
export const shuffle=a=>{const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;};
export const httpsOnly=u=>{try{return new URL(u).protocol==='https:'?u:null;}catch{return null;}};
export function sourceLinks(ids,byId){return ids?.length?h('p',{class:'muted'},'Fuentes: ',ids.map((id,i)=>{const s=byId[id],u=s&&httpsOnly(s.url);return [i?' · ':'',u?h('a',{href:u,target:'_blank',rel:'noopener'},id+' '+s.title):id];})):null;}
export function match(game){
 const box=h('div',{class:'worked-example'}),msg=h('p',{role:'status'},'Elegí un concepto y luego su definición.');let pick=null,done=0;
 const terms=h('div'),defs=h('div'),clear=()=>terms.querySelectorAll('button').forEach(b=>b.removeAttribute('aria-pressed'));
 shuffle(game.pairs).forEach(p=>add(terms,h('button',{type:'button',class:'option','data-t':p.term,onclick:e=>{if(e.currentTarget.disabled)return;pick=p;clear();e.currentTarget.setAttribute('aria-pressed','true');}},p.term)));
 shuffle(game.pairs).forEach(p=>add(defs,h('button',{type:'button',class:'option',onclick:e=>{if(!pick||e.currentTarget.disabled)return;if(pick.definition===p.definition){e.currentTarget.disabled=true;terms.querySelector('[data-t="'+CSS.escape(pick.term)+'"]').disabled=true;done++;msg.textContent=done===game.pairs.length?'¡Completaste el juego!':'Bien. Quedan '+(game.pairs.length-done)+'.';}else msg.textContent='Esa definición no corresponde a «'+pick.term+'». Probá otra.';pick=null;clear();}},p.definition)));
 add(box,h('h3',{},'Juego: unir conceptos'),msg,terms,defs);return box;
}
export function slideshow(slides,byId){
 let i=0;const box=h('div',{class:'slideshow',tabindex:'0'}),stage=h('div',{class:'slide','aria-live':'polite'}),count=h('span',{});
 const draw=()=>{const s=slides[i];fill(stage,h('h2',{},s.title),h('ul',{},s.bullets.map(b=>h('li',{},b))),s.notes?h('details',{},h('summary',{},'Notas para quien presenta'),h('p',{},s.notes)):null,sourceLinks(s.sources,byId));count.textContent=(i+1)+' / '+slides.length;};
 const go=d=>{i=Math.min(slides.length-1,Math.max(0,i+d));draw();};
 box.addEventListener('keydown',e=>{if(e.key==='ArrowRight')go(1);else if(e.key==='ArrowLeft')go(-1);});
 add(box,stage,h('div',{class:'actions'},h('button',{type:'button',onclick:()=>go(-1)},'← Anterior'),count,h('button',{type:'button',onclick:()=>go(1)},'Siguiente →'),h('button',{type:'button',onclick:()=>box.requestFullscreen?.()},'Pantalla completa')));
 draw();return box;
}
// Runs a server-graded attempt: `start()` returns {attemptId,questions,...}; `submit(answers)` returns the graded result.
export function attemptRunner({start,submit,label,onDone}){
 const box=h('div',{class:'worked-example'}),msg=h('p',{role:'status'});
 const begin=h('button',{type:'button',onclick:async()=>{begin.disabled=true;msg.textContent='Preparando…';try{show(await start());msg.textContent='';}catch(e){msg.textContent=e.message;begin.disabled=false;}}},label);
 function show(a){
  const answers=a.questions.map(()=>null),form=h('form');
  a.questions.forEach((q,qi)=>add(form,h('fieldset',{},h('legend',{},(qi+1)+'. '+q.prompt),q.options.map((o,oi)=>h('label',{class:'option-row'},h('input',{type:'radio',name:'q'+qi,required:true,onchange:()=>{answers[qi]=oi;}}),' '+o)))));
  add(form,h('button',{type:'submit'},'Entregar'));
  form.addEventListener('submit',async e=>{e.preventDefault();if(answers.some(x=>x===null)){msg.textContent='Respondé todas las preguntas.';return;}form.querySelector('button').disabled=true;try{result(await submit(a,answers));}catch(err){msg.textContent=err.message;form.querySelector('button').disabled=false;}});
  fill(box,h('p',{},a.kind==='exam'?'Evaluación: cuenta para tu aprobación ('+a.passPct+'% o más).':'Práctica: no cuenta para la aprobación.'),form,msg);
 }
 function result(r){
  fill(box,h('h3',{},r.pct+'% · '+r.correct+' de '+r.total),h('p',{role:'status'},r.kind==='exam'?(r.passed?'Aprobado: superaste el '+r.passPct+'% requerido.':'Todavía no alcanzás el '+r.passPct+'%. Revisá las explicaciones y volvé a intentar.'):'Práctica terminada.'),
   r.rows.map(x=>h('div',{class:'worked-example'},h('p',{},h('strong',{},x.right?'✔ ':'✘ '),x.prompt),!x.right?h('p',{},'Tu respuesta: '+x.selected):null,h('p',{},'Correcta: '+x.correct),h('p',{},x.why))),
   h('button',{type:'button',onclick:()=>{fill(box,begin,msg);begin.disabled=false;begin.click();}},'Nuevo intento'));
  onDone?.(r);
 }
 add(box,begin,msg);return box;
}
