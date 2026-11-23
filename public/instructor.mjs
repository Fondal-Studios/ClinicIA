// Panel del instructor: «Mis cursos» (aulas y grupos de capacitación) y, dentro de cada uno, la gestión de alumnos.
const $=s=>document.querySelector(s),status=$('#status'),lista=$('#lista'),detalle=$('#detalle');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(path,body){const r=await fetch(path,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const j=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(j.error||'No se pudo completar la acción.'),{status:r.status});return j;}
const date=d=>d?new Date(d).toLocaleDateString('es-AR'):'—';
const MODULES=10; // el curso policial tiene 10 módulos; los grupos de capacitación se usan sobre ese curso
let sort={key:'name',dir:1},rows=[],kind='',current=null,filter='';
function bestNote(attempts){const done=(attempts||[]).map(a=>a.result).filter(Boolean);if(!done.length)return null;return done.map(r=>({pct:Math.round(100*r.correct/r.total),passed:r.passed,correct:r.correct,total:r.total})).sort((a,b)=>b.pct-a.pct)[0];}
function toRows(k,data){
 if(k==='group')return data.members.map(m=>{const note=bestNote(m.attempts);return {name:m.username,state:m.status==='accepted'?'Aceptado':'Pendiente',userId:m.user_id,pending:m.status!=='accepted',progress:Math.min(100,Math.round(100*(m.read_count||0)/MODULES)),progressText:(m.read_count||0)+' de '+MODULES+' módulos',note:note?note.pct:null,noteText:note?note.correct+'/'+note.total+' ('+note.pct+' %)':'Sin rendir',passed:!!note?.passed,last:m.last_seen};});
 return data.members.filter(m=>m.role==='student').map(m=>({name:m.name,state:m.passed?'Aprobó':'En curso',pending:false,progress:m.exams?100:m.practices?50:10,progressText:m.exams+' exámenes · '+m.practices+' prácticas',note:m.best,noteText:m.best===null?'Sin rendir':m.best+' %',passed:m.passed,last:m.lastAt}));
}
function table(){
 const f=filter.toLowerCase(),list=rows.filter(r=>!f||r.name.toLowerCase().includes(f)).sort((a,b)=>{const x=a[sort.key]??-1,y=b[sort.key]??-1;return (typeof x==='string'?x.localeCompare(y):x-y)*sort.dir;});
 const th=(k,t)=>`<th><button data-sort="${k}">${t}${sort.key===k?(sort.dir>0?' ▲':' ▼'):''}</button></th>`;
 return `<div class="wrap"><table><thead><tr>${th('name','Alumno')}${th('state','Estado')}${th('progress','Progreso')}${th('note','Nota')}${th('last','Último ingreso')}<th>Acción</th></tr></thead><tbody>${list.map(r=>`<tr><td>${esc(r.name)}</td><td>${esc(r.state)}${r.passed?' ✔':''}</td><td><span class="bar" aria-hidden="true"><i style="width:${r.progress}%"></i></span> ${esc(r.progressText)}</td><td>${esc(r.noteText)}</td><td>${esc(date(r.last))}</td><td>${r.pending?`<button data-accept="${esc(r.userId)}">Aceptar</button>`:''}</td></tr>`).join('')||'<tr><td colspan="6">Todavía no hay alumnos.</td></tr>'}</tbody></table></div>`;
}
function stats(){const n=rows.length,done=rows.filter(r=>r.passed).length,avg=rows.filter(r=>r.note!==null);return `<p><strong>${n}</strong> alumnos · <strong>${done}</strong> aprobaron · nota promedio <strong>${avg.length?Math.round(avg.reduce((s,r)=>s+r.note,0)/avg.length)+' %':'—'}</strong></p>`;}
function csv(){const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';return ['Alumno,Estado,Progreso,Nota,Último ingreso',...rows.map(r=>[r.name,r.state,r.progressText,r.noteText,date(r.last)].map(q).join(','))].join('\n');}
function paint(extra=''){detalle.innerHTML=`<p><button data-back>← Mis cursos</button></p><h2>${esc(current.title)}</h2>${extra}${stats()}<div class="row"><input id="buscar" type="search" placeholder="Buscar alumno" value="${esc(filter)}" aria-label="Buscar alumno"><button data-csv>Descargar lista (CSV)</button><button data-refresh>Actualizar</button></div>${table()}`;}
async function openCourse(k,item){kind=k;current=item;filter='';status.textContent='Cargando alumnos…';
 try{
  if(k==='group'){const d=await api('/api/account/capacitacion',{action:'roster',groupId:item.id});current.roster=d;rows=toRows(k,d);
   const share=d.joinCode?`<div class="card"><p>Código de vinculación para tus alumnos:</p><p class="code">${esc(d.joinCode)}</p><p class="muted">Enlace: ${esc(location.origin)}/capacitacion.html?codigo=${esc(d.joinCode)}</p><div class="row"><label><input type="checkbox" data-auto ${d.autoAccept?'checked':''}> Aceptar automáticamente a quien use el código</label><button data-accept-all>Aceptar a todos los pendientes</button></div></div>`:'';
   paint(share+`<p><a href="/capacitacion.html?perfil=instructor">Validar prácticas y ver la guía por módulo →</a></p>`);}
  else{const d=await api('/api/account/classes/'+encodeURIComponent(item.id)+'/progress');current.pass=d.passPct;rows=toRows(k,d);paint(`<p>Aprobación: ${esc(d.passPct)} % · <a href="/aulas.html#${esc(item.id)}">Editar el aula →</a></p>`);}
  $('#mis-cursos').hidden=true;$('.big').hidden=true;detalle.hidden=false;status.textContent='';
 }catch(e){status.textContent=e.message;}
}
async function load(){
 try{
  const me=await api('/api/account/me');if(!me.user){status.innerHTML='Para ver tus cursos, <a href="/">ingresá a tu cuenta</a> desde el botón «Ingresar / crear cuenta».';lista.innerHTML='<p>Todavía no hay sesión iniciada.</p>';return;}
  const [cl,cap]=await Promise.all([api('/api/account/classes').catch(()=>({classes:[]})),api('/api/account/capacitacion').catch(()=>({groups:[],user:{}}))]);
  const aulas=cl.classes.filter(c=>c.role!=='student'),grupos=(cap.groups||[]).filter(g=>g.owner_id===cap.user?.id||g.isInstructor);
  status.textContent='';
  lista.innerHTML=[...aulas.map(c=>`<article class="card"><span class="pill">AULA</span><h3>${esc(c.title)}</h3><p>${esc(c.status==='published'?'Publicada':'Borrador')} · ${esc(c.members??0)} alumnos</p><div class="row"><button class="primary" data-open="class:${esc(c.id)}">Ver alumnos y notas</button><a href="/aulas.html#${esc(c.id)}">Editar</a></div></article>`),...grupos.map(g=>`<article class="card"><span class="pill">GRUPO DE CAPACITACIÓN</span><h3>${esc(g.title)}</h3><div class="row"><button class="primary" data-open="group:${esc(g.id)}">Ver alumnos y notas</button></div></article>`)].join('')||'<p>Todavía no tenés cursos. Empezá con «Crear curso y contenido».</p>';
  window.__mine={aulas,grupos};
 }catch(e){status.textContent=e.message;}
}
document.addEventListener('click',async e=>{const t=e.target.closest('button');if(!t)return;
 if(t.dataset.open){const [k,id]=t.dataset.open.split(':');const item=k==='class'?window.__mine.aulas.find(c=>c.id===id):window.__mine.grupos.find(g=>g.id===id);return openCourse(k==='class'?'class':'group',item);}
 if('back' in t.dataset){detalle.hidden=true;$('#mis-cursos').hidden=false;$('.big').hidden=false;return;}
 if(t.dataset.sort){sort={key:t.dataset.sort,dir:sort.key===t.dataset.sort?-sort.dir:1};return paintKeep();}
 if('csv' in t.dataset){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['﻿'+csv()],{type:'text/csv'}));a.download='alumnos.csv';a.click();return;}
 if('refresh' in t.dataset)return openCourse(kind,current);
 if(t.dataset.accept){await api('/api/account/capacitacion',{action:'accept',groupId:current.id,userId:t.dataset.accept});return openCourse(kind,current);}
 if('acceptAll' in t.dataset){await api('/api/account/capacitacion',{action:'accept-all',groupId:current.id});return openCourse(kind,current);}
});
document.addEventListener('change',async e=>{if('auto' in e.target.dataset){await api('/api/account/capacitacion',{action:'set-auto',groupId:current.id,autoAccept:e.target.checked});}});
document.addEventListener('input',e=>{if(e.target.id==='buscar'){filter=e.target.value;paintKeep();}});
function paintKeep(){const w=detalle.querySelector('.wrap');if(w)w.outerHTML=table();}
load();
