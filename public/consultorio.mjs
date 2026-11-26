// Modo profesional · Mi consultorio: Mis pacientes (alta, búsqueda por apellido o DNI, ficha, historia clínica resumida, historial),
// turnos, consulta con dictado local y validación del médico, receta electrónica en un clic y respaldos.
// Los datos viven en este dispositivo, separados por cuenta; no se envían a ningún servidor.
import {createStore,storeKeyFor,migrateLegacyKey,sectionize,SECTIONS,csvOfVisits,csvOfPatients,displayName,ageOf,planillaHtml,RECETARIOS,RECETARIOS_OFICIAL,recetarioUrl,prescriptionText} from './consultorio-lib.mjs';
const $=s=>document.querySelector(s),view=$('#view'),statusEl=$('#status');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let store=null,account=null,accountNote='',persisted=null,installEvent=null;
let tab='pacientes',visitId=null,patientId=null,adding=null,formError=null,query='',recorder=null,busy=false,draft={sections:{},transcript:''},lastRx=null;
const when=d=>new Date(d).toLocaleString('es-AR',{dateStyle:'short',timeStyle:'short'});
const day=d=>new Date(d).toLocaleDateString('es-AR');
const say=m=>{statusEl.textContent=m||'';};
const model=()=>localStorage.getItem('clinia_whisper_model')||'Xenova/whisper-base';
const recetarioCfg=()=>{try{return JSON.parse(localStorage.getItem('clinia_recetario')||'null')||{id:'receto'};}catch{return {id:'receto'};}};
const recetarioName=()=>RECETARIOS.find(r=>r.id===recetarioCfg().id)?.name.replace(/ \(.*\)/,'')||'recetario';
async function api(path){const r=await fetch(path,{credentials:'same-origin',cache:'no-store'});const j=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(j.error||''),{status:r.status});return j;}
// Acceso premium (nivel Profesional). Con el bloqueo apagado (piloto) queda abierto. La verificación es del lado del navegador:
// los datos y el dictado viven en el propio dispositivo, así que no hay un secreto que proteger del servidor.
async function gate(){
 let offline=false;
 try{account=(await api('/api/account/me')).user||null;if(account)localStorage.setItem('clinia_last_account',JSON.stringify({id:account.id,username:account.username}));}catch{account=null;offline=true;}
 // Sin conexión o con la sesión vencida se siguen mostrando los pacientes de la última cuenta de este equipo (no «desaparecen»).
 if(!account){try{const last=JSON.parse(localStorage.getItem('clinia_last_account')||'null');if(last?.id){account=last;accountNote=offline?'Sin conexión: se usan los datos de '+last.username+' guardados en este equipo.':'No hay sesión iniciada: se usan los datos de '+last.username+' guardados en este equipo. Ingresá desde Inicio para cambiar de cuenta.';}}catch{}}
 try{const offer=await api('/api/offer');if(!offer.paywall)return true;
  try{const b=await api('/api/account/billing');if(b.access?.profesional?.active||b.bypass)return true;}catch(e){if(e.status!==401)throw e;}
  $('#gate').innerHTML='<div class="card"><h2>Mi consultorio es una función premium</h2><p>Incluye registro de pacientes, turnos, historia clínica resumida y dictado con transcripción local. Activá el <strong>Acceso profesional</strong> o pedile a la administración que libere tu cuenta.</p><p><a class="button primary" href="/pagos.html">Ver acceso profesional →</a> <a href="/">Ingresar a mi cuenta</a></p></div>';$('#gate').hidden=false;return false;
 }catch{return true;}
}
const field=(label,name,value='',attrs='')=>`<label>${label}<input name="${name}" value="${esc(value)}" ${attrs}></label>`;
const area=(label,name,value='',rows=3)=>`<label>${label}<textarea name="${name}" rows="${rows}">${esc(value)}</textarea></label>`;
const sexSelect=v=>`<label>Sexo<select name="sex">${[['','—'],['F','Femenino'],['M','Masculino'],['X','X']].map(([k,t])=>`<option value="${k}"${v===k?' selected':''}>${t}</option>`).join('')}</select></label>`;
const filiatorios=p=>`${field('Apellido *','lastName',p.lastName,'required minlength="2" autocomplete="off"')}${field('Nombre *','firstName',p.firstName,'required autocomplete="off"')}<div class="row">${field('DNI','dni',p.dni,'inputmode="numeric" autocomplete="off"')}${field('Fecha de nacimiento','birth',p.birth,'type="date"')}${sexSelect(p.sex||'')}</div>${field('Domicilio','address',p.address)}<div class="row">${field('Teléfono','phone',p.phone,'inputmode="tel"')}${field('Correo','email',p.email,'type="email"')}</div><div class="row">${field('Cobertura / obra social','coverage',p.coverage)}${field('Nº de afiliado','affiliate',p.affiliate)}</div>${field('Contacto de emergencia','emergency',p.emergency)}`;
const historia=p=>`${area('Antecedentes personales','background',p.background)}${area('Antecedentes familiares','family',p.family,2)}${area('Alergias','allergies',p.allergies,2)}${area('Medicación habitual','medication',p.medication,2)}${area('Notas','notes',p.notes,2)}`;
// ---------- Mis pacientes ----------
function patientCard(p){
 const last=store.lastVisitOf(p.id),age=ageOf(p.birth);
 return `<article class="card${p.id===patientId?' sel':''}"><strong>${esc(displayName(p))}</strong> <span class="muted">${p.dni?'DNI '+esc(p.dni):'sin documento'}${age!==null?' · '+age+' años':''}${p.coverage?' · '+esc(p.coverage):''}</span><p class="muted">${last?'Última consulta: '+esc(day(last.when)):'Sin consultas atendidas'}</p><div class="row"><button class="primary" data-patient="${esc(p.id)}">Abrir ficha</button><button data-nowvisit="${esc(p.id)}">Nueva consulta</button></div></article>`;
}
function listHtml(){
 const list=store.search(query),total=store.state.patients.length;
 if(!total)return '<p class="muted">Todavía no cargaste pacientes. Tocá «Agregar nuevo paciente».</p>';
 if(!list.length)return `<div class="card"><p>No encontramos a nadie con «${esc(query)}».</p><p>¿Es un paciente nuevo?</p><button class="primary" data-new>Agregar nuevo paciente</button></div>`;
 return `<p class="muted">${query?list.length+' de '+total+' pacientes':total+(total===1?' paciente':' pacientes')}</p>${list.map(patientCard).join('')}`;
}
function backupKey(){return 'clinia_backup_at:'+storeKeyFor(account);}
function backupWarn(){const n=store.state.patients.length;if(!n)return '';const at=Number(localStorage.getItem(backupKey())||0),days=at?Math.floor((Date.now()-at)/86400000):null;if(at&&days<7)return '';return `<div class="warn">${at?`Hace ${days} días que no hacés un respaldo.`:'Todavía no hiciste ningún respaldo.'} Tus pacientes están solo en este equipo. <button data-export>Descargar respaldo ahora</button></div>`;}
function pacientes(){
 return `${backupWarn()}<div class="row"><button class="primary" data-new>+ Agregar nuevo paciente</button></div><label>Buscar por apellido o número de documento<input id="q" type="search" value="${esc(query)}" placeholder="Ej.: López o 30111222" autocomplete="off"></label><div id="plist" aria-live="polite">${listHtml()}</div>`;
}
function nuevo(){
 const p=adding||{};
 return `<p class="only-narrow"><button data-tab="pacientes" data-clear>← Mis pacientes</button></p><h2>Agregar nuevo paciente</h2>${formError?`<div class="warn" role="alert">${esc(formError.message)}${formError.dup?` <button data-patient="${esc(formError.dup)}">Abrir esa ficha</button>`:''}</div>`:''}<form id="f-patient" class="card"><h3>Datos filiatorios</h3>${filiatorios(p)}<h3>Historia clínica resumida</h3>${historia(p)}<h3>Motivo de consulta</h3>${area('Motivo de la primera consulta (opcional: si lo completás, se abre la consulta)','firstReason',p.firstReason||'',2)}<button class="primary" type="submit">Guardar paciente</button></form>`;
}
function ficha(){
 const p=store.patient(patientId),age=ageOf(p.birth),hist=store.visitsOf(p.id);
 return `<p class="only-narrow"><button data-tab="pacientes" data-clear>← Mis pacientes</button></p><div class="card"><h2>${esc(displayName(p))}</h2><p class="muted">${p.dni?'DNI '+esc(p.dni):'Sin documento'}${age!==null?' · '+age+' años':''}${p.coverage?' · '+esc(p.coverage):''}</p><div class="row"><button class="primary" data-nowvisit="${esc(p.id)}">Nueva consulta ahora</button><button data-print="${esc(p.id)}">Imprimir planilla</button></div>
 <form id="f-turno" class="row"><input type="datetime-local" name="when" required aria-label="Fecha y hora del turno"><input name="reason" placeholder="Motivo del turno (opcional)" maxlength="300"><button type="submit">Dar turno</button></form></div>
 ${formError?`<div class="warn" role="alert">${esc(formError.message)}</div>`:''}
 <form id="f-edit" class="card"><h3>Datos filiatorios</h3>${filiatorios(p)}<button class="primary" type="submit">Guardar datos</button></form>
 <form id="f-hc" class="card"><h3>Historia clínica resumida</h3>${historia(p)}<button class="primary" type="submit">Guardar historia resumida</button></form>
 <h3>Historial de consultas (${hist.length})</h3>${hist.map(v=>`<article class="card"><span class="pill">${v.status==='dado'?'ATENDIDA':'PENDIENTE'}</span> <strong>${esc(when(v.when))}</strong>${v.validatedBy?' · Validó '+esc(v.validatedBy):''}<p><strong>Motivo:</strong> ${esc(v.record?.motivo||v.reason||'—')}</p>${v.record?.diagnostico?`<p><strong>Diagnóstico:</strong> ${esc(v.record.diagnostico)}</p>`:''}${v.record?.tratamiento?`<p><strong>Tratamiento:</strong> ${esc(v.record.tratamiento)}</p>`:''}<button data-open="${esc(v.id)}">${v.status==='dado'?'Ver historia completa':'Continuar'}</button></article>`).join('')||'<p class="muted">Todavía no hay consultas.</p>'}`;
}
// ---------- Turnos ----------
const patientLabel=p=>`${displayName(p)}${p.dni?' — DNI '+p.dni:''}`;
function turnos(){
 const pend=store.pending(),done=store.done().slice(0,10),pre=patientId&&store.patient(patientId);
 return `<div class="card"><h2>Nuevo turno</h2><form id="f-visit"><div class="row"><input name="patient" list="pl" required placeholder="Buscar paciente por apellido o DNI" value="${esc(pre?patientLabel(pre):'')}" aria-label="Paciente" autocomplete="off"><datalist id="pl">${store.search('').map(p=>`<option value="${esc(patientLabel(p))}"></option>`).join('')}</datalist><input type="datetime-local" name="when" required aria-label="Fecha y hora"></div><label>Motivo (opcional)<input name="reason" maxlength="300"></label><div class="row"><button class="primary" type="submit">Dar turno</button><button type="button" data-new>+ Paciente nuevo</button></div></form></div>
 <h2>Turnos pendientes (${pend.length})</h2>${pend.map(v=>`<article class="card"><span class="pill">PENDIENTE${v.record?' · borrador':''}</span> <strong>${esc(when(v.when))}</strong> · ${esc(displayName(store.patient(v.patientId)))}<p class="muted">${esc(v.reason)}</p><div class="row"><button class="primary" data-open="${esc(v.id)}">Atender</button><button data-recetar="${esc(v.id)}">Recetar</button><button data-cancel="${esc(v.id)}">Cancelar turno</button></div></article>`).join('')||'<p class="muted">No hay turnos pendientes.</p>'}
 <h2>Turnos dados (últimos 10)</h2>${done.map(v=>`<article class="card"><span class="pill">ATENDIDO</span> ${esc(when(v.when))} · ${esc(displayName(store.patient(v.patientId)))}<p class="muted">${esc(v.record?.motivo||v.reason)} · Validó: ${esc(v.validatedBy)}</p><button data-open="${esc(v.id)}">Ver historia</button></article>`).join('')||'<p class="muted">Todavía no hay turnos dados.</p>'}`;
}
// ---------- Receta electrónica (un clic: abre el recetario y copia los datos mínimos) ----------
async function recetar(visit){
 const url=recetarioUrl(recetarioCfg());if(!url){say('Elegí tu recetario en Ajustes → Recetario electrónico.');return;}
 const p=store.patient(visit.patientId),form=visit.id===visitId?$('#f-record'):null,text=prescriptionText(p,form?readSections(form):visit.record);
 window.open(url,'_blank','noopener');
 let copied=false;try{await navigator.clipboard.writeText(text);copied=true;}catch{}
 lastRx={visitId:visit.id,text,copied};say(copied?'Datos copiados. En el recetario: «Crear receta» y pegá (Ctrl+V o mantené presionado).':'Se abrió el recetario. Copiá los datos de abajo y pegalos allá.');render();
}
function rxCard(v){
 const done=(v.prescriptions||[]).map(x=>`<p class="muted">✔ Receta emitida en ${esc(x.platform)} · ${esc(when(x.at))}${x.ref?' · '+esc(x.ref):''}</p>`).join('');
 const help=lastRx&&lastRx.visitId===v.id?`<label>Datos para pegar en el recetario<textarea readonly rows="6">${esc(lastRx.text)}</textarea></label><div class="row"><button id="rx-copy">Copiar de nuevo</button></div><label>Código de la receta (opcional, para dejarlo anotado)<input id="rx-ref" maxlength="120"></label><button id="rx-done" class="primary">Ya emití la receta</button>`:'';
 return `<div class="card"><h3>Receta electrónica</h3>${done}<div class="row"><button class="primary" id="rx-open">Recetar con ${esc(recetarioName())} →</button></div><p class="muted">Abre el recetario y copia al portapapeles los datos del paciente y las indicaciones. La receta se firma y emite en el recetario.</p>${help}</div>`;
}
// ---------- Consulta ----------
function consulta(){
 const v=store.state.visits.find(x=>x.id===visitId),p=store.patient(v.patientId),locked=v.status==='dado';
 return `<p><button data-back>← ${patientId?'Ficha del paciente':'Turnos'}</button></p><div class="card"><h2>${esc(displayName(p))}</h2><p>${esc(when(v.when))} · ${locked?'<span class="pill">ATENDIDO · validó '+esc(v.validatedBy)+'</span>':'<span class="pill">EN CURSO</span>'}</p>
 ${locked?'':`<div class="row"><button id="rec" class="primary">🎙 Dictar</button><span id="rec-state" class="muted">Hablá con calma y nombrá cada sección: «datos personales», «antecedentes», «motivo de consulta», «enfermedad actual», «tratamiento».</span></div><progress id="prog" max="100" value="0" hidden></progress>`}</div>
 ${rxCard(v)}<form id="f-record" class="card">${SECTIONS.map(([k,t])=>`<label>${esc(t)}<textarea name="${k}" rows="${k==='enfermedad'||k==='antecedentes'?4:2}" ${locked?'readonly':''}>${esc((draft.sections[k]??v.record?.[k]??(k==='motivo'?v.reason:''))||'')}</textarea></label>`).join('')}
 ${draft.sections.sinClasificar?`<label>Texto sin clasificar (no se guarda: pasalo a una sección)<textarea name="_x" rows="2" readonly>${esc(draft.sections.sinClasificar)}</textarea></label>`:''}
 <details><summary>Transcripción original</summary><p class="muted">${esc(draft.transcript||v.transcript||'—')}</p></details>
 ${locked?'':`<div class="warn"><strong>Validación del médico.</strong> La transcripción puede tener errores, sobre todo en nombres de fármacos, dosis y números. Leé y corregí todo antes de validar.</div><label>Médico que firma<input name="doctor" value="${esc(localStorage.getItem('clinia_doctor')||'')}" autocomplete="name"></label><label><input type="checkbox" name="ok" style="width:auto;min-height:0"> Revisé el contenido y lo valido como correcto</label><div class="row"><button type="submit" data-act="draft">Guardar borrador</button><button class="primary" type="submit" data-act="validate">Validar y marcar turno como dado</button></div>`}</form>`;
}
// ---------- Ajustes ----------
function ajustes(){
 return `<div class="card"><h2>Tus datos</h2><p>Los pacientes, turnos y consultas de la cuenta <strong>${esc(account?.username||'(sin iniciar sesión)')}</strong> se guardan <strong>en este dispositivo</strong>, no en un servidor. Para usarlos en otro equipo, descargá el respaldo y restauralo allá.</p><p class="muted">Almacenamiento protegido del navegador: <strong>${persisted===true?'sí (el navegador no lo borra por falta de espacio)':persisted===false?'no concedido (instalá la aplicación o hacé respaldos seguido)':'sin verificar'}</strong>.</p></div>
 <div class="card"><h2>Respaldo y listados</h2><div class="row"><button data-export>Descargar respaldo (JSON)</button><button data-patients-csv>Listado de pacientes (CSV)</button><button data-csv>Turnos (CSV)</button></div><label>Restaurar respaldo<input type="file" id="restore" accept="application/json"></label><p class="muted">Restaurar reemplaza los datos de este dispositivo para esta cuenta. Hacé un respaldo seguido: si se borran los datos del navegador, se pierden.</p></div>
 <div class="card"><h2>Dictado por voz (local)</h2><p>Modelo de transcripción:</p><select id="model">${[['Xenova/whisper-base','Equilibrado (recomendado para celular)'],['Xenova/whisper-small','Más preciso: descarga más grande y más lento']].map(([v,t])=>`<option value="${v}"${model()===v?' selected':''}>${t}</option>`).join('')}</select><p class="muted">La primera vez se descarga el modelo (decenas o cientos de MB); luego queda guardado en el navegador y funciona sin enviar nada a internet. Es Whisper multilingüe preentrenado, no un modelo entrenado en vocabulario médico: por eso siempre pasa por tu validación.</p></div>
 <div class="card"><h2>Recetario electrónico</h2><p>Mi consultorio <strong>no emite recetas</strong>: te lleva a un recetario inscripto en el Registro Nacional de Plataformas Digitales Sanitarias (ReNaPDiS), con un clic, y copia los datos para pegarlos. La receta la firmás vos en el recetario.</p><label>Mi recetario<select id="rx-id">${RECETARIOS.map(r=>`<option value="${r.id}"${recetarioCfg().id===r.id?' selected':''}>${esc(r.name)}</option>`).join('')}</select></label><label>Dirección del recetario (solo si elegiste «Otro»)<input id="rx-url" type="url" placeholder="https://…" value="${esc(recetarioCfg().url||'')}"></label><p class="muted">Necesitás una cuenta en ese recetario (en Receto: email, matrícula y DNI, que ellos validan). Después queda abierta en tu navegador. <a href="${RECETARIOS_OFICIAL}" target="_blank" rel="noopener">Ver el listado oficial de recetarios habilitados ↗</a>. Verificá que el que uses figure ahí.</p></div>
 <div class="card"><h2>Consultorio anterior</h2><p class="muted">Si usabas la versión anterior en este navegador, podés importar los pacientes y consultas guardados localmente. No se modifica el original. Los pacientes cuyo nombre se guardaba cifrado en el servidor no se pueden importar.</p><button data-legacy>Importar datos anteriores</button></div>
 <div class="card"><h2>Borrar todo</h2><button data-wipe>Borrar todos los datos de este dispositivo</button></div>`;
}
const wide=()=>globalThis.matchMedia?.('(min-width:1000px)').matches===true;
const detalle=()=>visitId?consulta():adding?nuevo():patientId?ficha():'<div class="card"><p class="muted">Elegí un paciente de la lista o agregá uno nuevo.</p></div>';
function render(){
 const split=wide()&&tab==='pacientes';
 document.querySelectorAll('.tabs [data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===tab&&(split||(!visitId&&!adding)))));
 // En pantalla ancha (computadora): lista de pacientes a la izquierda y ficha, alta o consulta a la derecha.
 view.innerHTML=split?`<div class="split"><aside class="pane-list">${pacientes()}</aside><section class="pane-detail">${detalle()}</section></div>`:visitId?consulta():adding?nuevo():tab==='turnos'?turnos():tab==='pacientes'?(patientId?ficha():pacientes()):ajustes();
}
// Al cambiar el tamaño de la ventana se redibuja el diseño, pero lo que el médico ya escribió en un formulario no se pierde.
const snapshotForms=()=>[...view.querySelectorAll('form')].flatMap(f=>[...f.elements].filter(e=>e.name).map(e=>[f.id+':'+e.name,e.type==='checkbox'?e.checked:e.value]));
const restoreForms=snap=>{const m=new Map(snap);for(const f of view.querySelectorAll('form'))for(const e of f.elements){const k=f.id+':'+e.name;if(e.name&&m.has(k)){if(e.type==='checkbox')e.checked=m.get(k);else e.value=m.get(k);}}};
globalThis.matchMedia?.('(min-width:1000px)').addEventListener?.('change',()=>{if(!store)return;const snap=snapshotForms();render();restoreForms(snap);});
const download=(name,text,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();};
const readSections=form=>{const f=new FormData(form),s={};for(const [k] of SECTIONS)s[k]=f.get(k)||'';return s;};
function printPlanilla(id){
 const p=store.patient(id);if(!p)return;
 $('#print-area').innerHTML=planillaHtml(p,store.visitsOf(id),{doctor:localStorage.getItem('clinia_doctor')||''});
 document.body.classList.add('printing');try{window.print();}finally{document.body.classList.remove('printing');}
}
function goConsulta(v,sections){formError=null;visitId=v.id;draft={sections:sections||{},transcript:''};render();}
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
document.addEventListener('click',async e=>{const t=e.target.closest('button');if(!t||!store)return;
 try{
  if(t.id==='rec')return toggleRecord(t);
  if(t.dataset.tab){tab=t.dataset.tab;if('clear' in t.dataset||t.closest('.tabs')){patientId=null;}visitId=null;adding=null;formError=null;draft={sections:{},transcript:''};return render();}
  if('new' in t.dataset){adding={};if(/^[\d.\s]+$/.test(query)&&query.trim())adding.dni=query;else if(query.trim())adding.lastName=query.trim();tab='pacientes';patientId=null;visitId=null;formError=null;return render();}
  if(t.dataset.patient){patientId=t.dataset.patient;tab='pacientes';adding=null;formError=null;visitId=null;return render();}
  if(t.dataset.nowvisit){const v=store.startVisitNow(t.dataset.nowvisit);patientId=t.dataset.nowvisit;tab='pacientes';return goConsulta(v);}
  if(t.dataset.open){const v=store.state.visits.find(x=>x.id===t.dataset.open);if(v&&tab==='pacientes')patientId=v.patientId;return goConsulta(v);}
  if('back' in t.dataset){visitId=null;draft={sections:{},transcript:''};if(!patientId)tab='turnos';return render();}
  if(t.dataset.print)return printPlanilla(t.dataset.print);
  if(t.dataset.recetar){const v=store.state.visits.find(x=>x.id===t.dataset.recetar);if(v)return recetar(v);return;}
  if(t.id==='rx-open'){return recetar(store.state.visits.find(x=>x.id===visitId));}
  if(t.id==='rx-copy'){try{await navigator.clipboard.writeText(lastRx?.text||'');say('Datos copiados.');}catch{say('No se pudo copiar: seleccioná el texto y copialo.');}return;}
  if(t.id==='rx-done'){store.markPrescribed(visitId,{platform:recetarioName(),ref:$('#rx-ref')?.value||''});lastRx=null;say('Receta registrada en el turno.');return render();}
  if(t.dataset.cancel){if(confirm('¿Cancelar este turno?')){store.cancelVisit(t.dataset.cancel);render();}return;}
  if('export' in t.dataset){localStorage.setItem(backupKey(),String(Date.now()));download('mi-consultorio-respaldo.json',store.exportJSON(),'application/json');say('Respaldo descargado. Guardalo en un lugar seguro (por ejemplo, un pendrive o tu nube).');return render();}
  if('patientsCsv' in t.dataset)return download('pacientes.csv','﻿'+csvOfPatients(store),'text/csv');
  if('csv' in t.dataset)return download('turnos.csv','﻿'+csvOfVisits(store,[...store.pending(),...store.done()]),'text/csv');
  if('legacy' in t.dataset){const raw=localStorage.getItem('clinia_v1');if(!raw){say('No se encontraron datos del consultorio anterior en este navegador.');return;}say('Se importaron '+store.importLegacy(JSON.parse(raw))+' pacientes del consultorio anterior.');return render();}
  if('wipe' in t.dataset){if(confirm('Se borrarán todos los pacientes y turnos de este dispositivo. ¿Seguro?')&&confirm('Esta acción no se puede deshacer. ¿Borrar todo?')){store.wipe();patientId=null;say('Datos borrados.');render();}return;}
 }catch(err){say(err.message);}
});
document.addEventListener('submit',e=>{e.preventDefault();const f=e.target;if(!store)return;try{
 const data=Object.fromEntries(new FormData(f));
 if(f.id==='f-patient'){adding={...data};formError=null;const {firstReason,...input}=data;const p=store.addPatient(input);adding=null;patientId=p.id;tab='pacientes';say('Paciente guardado en tu cuenta.');
  if(firstReason&&firstReason.trim()){const v=store.startVisitNow(p.id,firstReason.trim());return goConsulta(v,{motivo:firstReason.trim()});}render();}
 else if(f.id==='f-edit'||f.id==='f-hc'){formError=null;store.updatePatient(patientId,data);say('Datos guardados.');render();}
 else if(f.id==='f-turno'){formError=null;store.addVisit(patientId,data.when,data.reason);say('Turno dado.');render();}
 else if(f.id==='f-visit'){const p=store.search('').find(x=>patientLabel(x)===String(data.patient).trim());if(!p)throw new Error('Elegí un paciente de la lista: escribí el apellido o el DNI y seleccionalo.');store.addVisit(p.id,data.when,data.reason);patientId=null;say('Turno dado.');render();}
 else if(f.id==='f-record'){const act=e.submitter?.dataset.act,fd=new FormData(f);const validated=act==='validate';
  if(validated&&!fd.get('ok'))throw new Error('Marcá que revisaste el contenido para validar.');
  store.saveRecord(visitId,{sections:readSections(f),transcript:draft.transcript||store.state.visits.find(v=>v.id===visitId).transcript,validated,doctor:fd.get('doctor')});if(fd.get('doctor'))localStorage.setItem('clinia_doctor',String(fd.get('doctor')));
  formError=null;say(validated?'Consulta validada y guardada en el historial.':'Borrador guardado.');if(validated){visitId=null;draft={sections:{},transcript:''};}render();}
}catch(err){if(['f-patient','f-edit','f-hc','f-turno'].includes(f.id)){formError={message:err.message,dup:err.duplicate?.id};render();window.scrollTo?.(0,0);}else say(err.message);}});
document.addEventListener('input',e=>{if(e.target.id==='q'){query=e.target.value;const l=$('#plist');if(l)l.innerHTML=listHtml();}});
document.addEventListener('change',e=>{if(e.target.id==='rx-id'||e.target.id==='rx-url'){localStorage.setItem('clinia_recetario',JSON.stringify({id:$('#rx-id').value,url:$('#rx-url').value}));say('Recetario guardado.');}
 if(e.target.id==='model'){localStorage.setItem('clinia_whisper_model',e.target.value);say('Modelo cambiado.');}
 if(e.target.id==='restore'&&e.target.files[0]){e.target.files[0].text().then(t=>{if(confirm('Esto reemplaza los datos de este dispositivo para esta cuenta. ¿Continuar?')){const r=store.importJSON(t);say('Respaldo restaurado: '+r.patients+' pacientes, '+r.visits+' turnos.');render();}}).catch(err=>say(err.message));}});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvent=e;$('#install').hidden=false;});
window.addEventListener('appinstalled',()=>{$('#install').hidden=true;installEvent=null;say('Instalada. Buscá «Mi consultorio» entre tus aplicaciones.');});
document.addEventListener('click',async e=>{if(e.target.id==='btn-install'&&installEvent){installEvent.prompt();await installEvent.userChoice;installEvent=null;$('#install').hidden=true;}});
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
(async()=>{if(!(await gate()))return;const key=storeKeyFor(account);migrateLegacyKey(localStorage,key);store=createStore(localStorage,key);
 // Pedir al navegador que no borre estos datos si falta espacio (las aplicaciones instaladas lo obtienen casi siempre).
 try{persisted=(await navigator.storage?.persisted?.())||(await navigator.storage?.persist?.())||false;}catch{persisted=null;}
 $('#who').textContent=account?'Cuenta: '+account.username+(accountNote?' · '+accountNote:''):'Sin iniciar sesión: los datos quedan en este dispositivo.';$('#app').hidden=false;render();})();
