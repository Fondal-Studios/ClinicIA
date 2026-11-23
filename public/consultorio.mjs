import {createStore,sectionize,SECTIONS,csvOfVisits} from './consultorio-lib.mjs';
const $=s=>document.querySelector(s),view=$('#view'),statusEl=$('#status');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store=createStore(localStorage);
let tab='turnos',visitId=null,patientId=null,recorder=null,busy=false,draft={sections:{},transcript:''};
const when=d=>new Date(d).toLocaleString('es-AR',{dateStyle:'short',timeStyle:'short'});
const say=m=>{statusEl.textContent=m||'';};
const model=()=>localStorage.getItem('clinia_whisper_model')||'Xenova/whisper-base';
async function api(path){const r=await fetch(path,{credentials:'same-origin',cache:'no-store'});const j=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(j.error||''),{status:r.status});return j;}
// Acceso premium (nivel Profesional). Con el bloqueo apagado (piloto) queda abierto. Esta verificación es del lado del navegador: protege la comodidad de uso,
// no un secreto, porque los datos y el dictado viven en el propio dispositivo.
async function gate(){
 try{const offer=await api('/api/offer');if(!offer.paywall)return true;
  try{const b=await api('/api/account/billing');if(b.access?.profesional?.active)return true;}catch(e){if(e.status!==401)throw e;}
  $('#gate').innerHTML='<div class="card"><h2>Mi consultorio es una función premium</h2><p>Incluye registro de pacientes, turnos, historia clínica breve y dictado con transcripción local. Activá el <strong>Acceso profesional</strong> o pedile a la administración que libere tu cuenta.</p><p><a class="button primary" href="/pagos.html">Ver acceso profesional →</a> <a href="/">Ingresar a mi cuenta</a></p></div>';$('#gate').hidden=false;return false;
 }catch{return true;} // sin conexión: los datos locales siguen disponibles
}
function patientSelect(){return `<select name="patientId" required aria-label="Paciente"><option value="">Elegir paciente…</option>${store.search('').map(p=>`<option value="${esc(p.id)}"${p.id===patientId?' selected':''}>${esc(p.name)}</option>`).join('')}</select>`;}
function turnos(){
 const pend=store.pending(),done=store.done().slice(0,10);
 return `<div class="card"><h2>Nuevo turno</h2><form id="f-visit"><div class="row">${patientSelect()}<input type="datetime-local" name="when" required aria-label="Fecha y hora"></div><label>Motivo (opcional)<input name="reason" maxlength="300"></label><div class="row"><button class="primary" type="submit">Dar turno</button><button type="button" data-tab="pacientes">+ Paciente nuevo</button></div></form></div>
 <h2>Turnos pendientes (${pend.length})</h2>${pend.map(v=>`<article class="card"><span class="pill">PENDIENTE${v.record?' · borrador':''}</span> <strong>${esc(when(v.when))}</strong> · ${esc(store.patient(v.patientId)?.name||'')}<p class="muted">${esc(v.reason)}</p><div class="row"><button class="primary" data-open="${esc(v.id)}">Atender</button><button data-cancel="${esc(v.id)}">Cancelar turno</button></div></article>`).join('')||'<p class="muted">No hay turnos pendientes.</p>'}
 <h2>Turnos dados (últimos 10)</h2>${done.map(v=>`<article class="card"><span class="pill">ATENDIDO</span> ${esc(when(v.when))} · ${esc(store.patient(v.patientId)?.name||'')}<p class="muted">${esc(v.record?.motivo||v.reason)} · Validó: ${esc(v.validatedBy)}</p><button data-open="${esc(v.id)}">Ver historia</button></article>`).join('')||'<p class="muted">Todavía no hay turnos dados.</p>'}`;
}
function pacientes(){
 const sel=patientId&&store.patient(patientId);
 const list=store.search($('#q')?.value||'');
 if(sel){const p=sel;return `<p><button data-tab="pacientes" data-clear>← Pacientes</button></p><div class="card"><h2>${esc(p.name)}</h2><form id="f-edit"><label>Nombre y apellido<input name="name" value="${esc(p.name)}" required></label><div class="row"><label>DNI<input name="dni" value="${esc(p.dni)}" inputmode="numeric"></label><label>Nacimiento<input type="date" name="birth" value="${esc(p.birth)}"></label></div><div class="row"><label>Teléfono<input name="phone" value="${esc(p.phone)}" inputmode="tel"></label><label>Cobertura<input name="coverage" value="${esc(p.coverage)}"></label></div><label>Notas<textarea name="notes" rows="3">${esc(p.notes)}</textarea></label><button class="primary" type="submit">Guardar datos</button></form></div><h3>Historia clínica breve</h3>${store.historyOf(p.id).map(v=>`<article class="card"><strong>${esc(when(v.when))}</strong> · Validó ${esc(v.validatedBy)}${SECTIONS.filter(([k])=>v.record?.[k]).map(([k,t])=>`<p><strong>${esc(t)}:</strong> ${esc(v.record[k])}</p>`).join('')}</article>`).join('')||'<p class="muted">Sin consultas validadas.</p>'}<button class="primary" data-newvisit="${esc(p.id)}">Dar un turno a este paciente</button>`;}
 return `<div class="card"><h2>Nuevo paciente</h2><form id="f-patient"><label>Nombre y apellido<input name="name" required minlength="2"></label><div class="row"><label>DNI<input name="dni" inputmode="numeric"></label><label>Nacimiento<input type="date" name="birth"></label></div><div class="row"><label>Teléfono<input name="phone" inputmode="tel"></label><label>Cobertura<input name="coverage"></label></div><button class="primary" type="submit">Guardar paciente</button></form></div><label>Buscar por nombre o DNI<input id="q" type="search" value="${esc($('#q')?.value||'')}"></label><div id="plist">${list.map(p=>`<article class="card"><strong>${esc(p.name)}</strong> <span class="muted">${esc(p.dni)}</span><div class="row"><button data-patient="${esc(p.id)}">Abrir ficha</button></div></article>`).join('')||'<p class="muted">No hay pacientes.</p>'}</div>`;
}
function consulta(){
 const v=store.state.visits.find(x=>x.id===visitId),p=store.patient(v.patientId),locked=v.status==='dado';
 return `<p><button data-tab="turnos" data-close>← Turnos</button></p><div class="card"><h2>${esc(p?.name||'')}</h2><p>${esc(when(v.when))} · ${locked?'<span class="pill">ATENDIDO · validó '+esc(v.validatedBy)+'</span>':'<span class="pill">EN CURSO</span>'}</p>
 ${locked?'':`<div class="row"><button id="rec" class="primary">🎙 Dictar</button><span id="rec-state" class="muted">Hablá con calma y nombrá cada sección: «datos personales», «antecedentes», «motivo de consulta», «enfermedad actual», «tratamiento».</span></div><progress id="prog" max="100" value="0" hidden></progress>`}</div>
 <form id="f-record" class="card">${SECTIONS.map(([k,t])=>`<label>${esc(t)}<textarea name="${k}" rows="${k==='enfermedad'||k==='antecedentes'?4:2}" ${locked?'readonly':''}>${esc((draft.sections[k]??v.record?.[k])||'')}</textarea></label>`).join('')}
 ${draft.sections.sinClasificar?`<label>Texto sin clasificar (no se guarda: pasalo a una sección)<textarea name="_x" rows="2" readonly>${esc(draft.sections.sinClasificar)}</textarea></label>`:''}
 <details><summary>Transcripción original</summary><p class="muted">${esc(draft.transcript||v.transcript||'—')}</p></details>
 ${locked?'':`<div class="warn"><strong>Validación del médico.</strong> La transcripción puede tener errores, sobre todo en nombres de fármacos, dosis y números. Leé y corregí todo antes de validar.</div><label>Médico que firma<input name="doctor" value="${esc(localStorage.getItem('clinia_doctor')||'')}" autocomplete="name"></label><label><input type="checkbox" name="ok" style="width:auto;min-height:0"> Revisé el contenido y lo valido como correcto</label><div class="row"><button type="submit" data-act="draft">Guardar borrador</button><button class="primary" type="submit" data-act="validate">Validar y marcar turno como dado</button></div>`}</form>`;
}
function ajustes(){
 return `<div class="card"><h2>Dictado por voz (local)</h2><p>Modelo de transcripción:</p><select id="model">${[['Xenova/whisper-base','Equilibrado (recomendado para celular)'],['Xenova/whisper-small','Más preciso: descarga más grande y más lento']].map(([v,t])=>`<option value="${v}"${model()===v?' selected':''}>${t}</option>`).join('')}</select><p class="muted">La primera vez se descarga el modelo (decenas o cientos de MB); luego queda guardado en el navegador y funciona sin enviar nada a internet. Es Whisper multilingüe preentrenado, no un modelo entrenado en vocabulario médico: por eso siempre pasa por tu validación.</p></div>
 <div class="card"><h2>Respaldo</h2><div class="row"><button data-export>Descargar respaldo (JSON)</button><button data-csv>Descargar turnos (CSV)</button></div><label>Restaurar respaldo<input type="file" id="restore" accept="application/json"></label><p class="muted">Restaurar reemplaza los datos de este dispositivo.</p></div>
 <div class="card"><h2>Consultorio anterior</h2><p class="muted">Si usabas la versión anterior en este navegador, podés importar los pacientes y consultas guardados localmente. No se modifica el original. Los pacientes cuyo nombre se guardaba cifrado en el servidor no se pueden importar.</p><button data-legacy>Importar datos anteriores</button></div>
 <div class="card"><h2>Borrar todo</h2><button data-wipe>Borrar todos los datos de este dispositivo</button></div>`;
}
function render(){
 document.querySelectorAll('[data-tab]').forEach(b=>{if(b.closest('.tabs'))b.setAttribute('aria-selected',String(b.dataset.tab===tab&&!visitId));});
 view.innerHTML=visitId?consulta():tab==='turnos'?turnos():tab==='pacientes'?pacientes():ajustes();
}
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();}
function readSections(form){const f=new FormData(form),s={};for(const [k] of SECTIONS)s[k]=f.get(k)||'';return s;}
async function toggleRecord(btn){
 if(busy)return;const stateEl=$('#rec-state'),prog=$('#prog');
 try{
  if(!recorder){const {Recorder}=await import('./consultorio-whisper.mjs');recorder=new Recorder();await recorder.start();btn.textContent='⏹ Terminar dictado';btn.classList.add('rec');stateEl.textContent='Grabando… tocá para terminar.';return;}
  busy=true;btn.disabled=true;const blob=await recorder.stop();recorder=null;btn.textContent='🎙 Dictar';btn.classList.remove('rec');stateEl.textContent='Transcribiendo en este dispositivo…';
  let text;
  if(typeof globalThis.CLINIA_TRANSCRIBE==='function')text=await globalThis.CLINIA_TRANSCRIBE(blob);
  else{const {transcribe}=await import('./consultorio-whisper.mjs');prog.hidden=false;text=await transcribe(blob,model(),pct=>{prog.value=pct;stateEl.textContent='Descargando el modelo (solo la primera vez)… '+pct+' %';});prog.hidden=true;}
  draft={sections:sectionize(text),transcript:text};render();const after=$('#rec-state');if(after)after.textContent=text?'Listo. Revisá cada sección antes de validar.':'No se entendió nada. Probá de nuevo más cerca del micrófono.';
 }catch(e){recorder=null;btn.textContent='🎙 Dictar';btn.classList.remove('rec');stateEl.textContent=e.name==='NotAllowedError'?'Permitile al navegador usar el micrófono.':'No se pudo transcribir: '+(e.message||e)+' Podés escribir las secciones a mano.';}
 finally{busy=false;btn.disabled=false;}
}
document.addEventListener('click',async e=>{const t=e.target.closest('button');if(!t)return;
 try{
  if(t.id==='rec')return toggleRecord(t);
  if(t.dataset.tab){tab=t.dataset.tab;if('clear' in t.dataset)patientId=null;if('close' in t.dataset){visitId=null;draft={sections:{},transcript:''};}if(t.closest('.tabs')){visitId=null;patientId=null;}return render();}
  if(t.dataset.open){visitId=t.dataset.open;draft={sections:{},transcript:''};return render();}
  if(t.dataset.cancel){if(confirm('¿Cancelar este turno?')){store.cancelVisit(t.dataset.cancel);render();}return;}
  if(t.dataset.patient){patientId=t.dataset.patient;return render();}
  if(t.dataset.newvisit){tab='turnos';patientId=t.dataset.newvisit;return render();}
  if('export' in t.dataset)return download('mi-consultorio-respaldo.json',store.exportJSON(),'application/json');
  if('csv' in t.dataset)return download('turnos.csv','﻿'+csvOfVisits(store,[...store.pending(),...store.done()]),'text/csv');
  if('legacy' in t.dataset){const raw=localStorage.getItem('clinia_v1');if(!raw){say('No se encontraron datos del consultorio anterior en este navegador.');return;}say('Se importaron '+store.importLegacy(JSON.parse(raw))+' pacientes del consultorio anterior.');return render();}
  if('wipe' in t.dataset){if(confirm('Se borrarán todos los pacientes y turnos de este dispositivo. ¿Seguro?')&&confirm('Esta acción no se puede deshacer. ¿Borrar todo?')){store.wipe();say('Datos borrados.');render();}return;}
 }catch(err){say(err.message);}
});
document.addEventListener('submit',e=>{e.preventDefault();const f=e.target;try{
 if(f.id==='f-patient'){const d=Object.fromEntries(new FormData(f));const p=store.addPatient(d);patientId=p.id;say('Paciente guardado.');render();}
 else if(f.id==='f-edit'){store.updatePatient(patientId,Object.fromEntries(new FormData(f)));say('Datos guardados.');render();}
 else if(f.id==='f-visit'){const d=Object.fromEntries(new FormData(f));store.addVisit(d.patientId,d.when,d.reason);patientId=null;say('Turno dado.');render();}
 else if(f.id==='f-record'){const act=e.submitter?.dataset.act,fd=new FormData(f);const validated=act==='validate';
  if(validated&&!fd.get('ok'))throw new Error('Marcá que revisaste el contenido para validar.');
  store.saveRecord(visitId,{sections:readSections(f),transcript:draft.transcript||store.state.visits.find(v=>v.id===visitId).transcript,validated,doctor:fd.get('doctor')});if(fd.get('doctor'))localStorage.setItem('clinia_doctor',String(fd.get('doctor')));
  say(validated?'Turno atendido y validado.':'Borrador guardado.');if(validated){visitId=null;draft={sections:{},transcript:''};tab='turnos';}render();}
}catch(err){say(err.message);}});
document.addEventListener('input',e=>{if(e.target.id==='q'){const l=store.search(e.target.value);$('#plist').innerHTML=l.map(p=>`<article class="card"><strong>${esc(p.name)}</strong> <span class="muted">${esc(p.dni)}</span><div class="row"><button data-patient="${esc(p.id)}">Abrir ficha</button></div></article>`).join('')||'<p class="muted">No hay pacientes.</p>';}});
document.addEventListener('change',e=>{if(e.target.id==='model'){localStorage.setItem('clinia_whisper_model',e.target.value);say('Modelo cambiado.');}
 if(e.target.id==='restore'&&e.target.files[0]){e.target.files[0].text().then(t=>{if(confirm('Esto reemplaza los datos de este dispositivo. ¿Continuar?')){const r=store.importJSON(t);say('Respaldo restaurado: '+r.patients+' pacientes, '+r.visits+' turnos.');render();}}).catch(err=>say(err.message));}});
(async()=>{if(await gate()){$('#app').hidden=false;render();}})();
