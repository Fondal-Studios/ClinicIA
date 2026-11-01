import {h,fill,httpsOnly} from './class-ui.mjs';
const endpoint='/api/admin/editorial';
async function requestAdmin(body){
 const r=await fetch(endpoint,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 const data=await r.json();if(!r.ok)throw Object.assign(new Error(data.error||'No se pudo consultar la revisión editorial.'),{status:r.status});return data;
}
const stateLabel=s=>({pending:'Pendiente',approved:'Integrada',rejected:'Rechazada',verified:'Verificada',stale:'Versión modificada'})[s]||s||'Sin estado';
const external=(url,label)=>httpsOnly(url)?h('a',{href:httpsOnly(url),target:'_blank',rel:'noopener noreferrer'},label):h('span',{},label+' (sin enlace HTTPS válido)');

export function createEditorialAdmin({root,status,request=requestAdmin}){
 let epoch=0,data=null;const pending=new Set();
 const error=(e,token)=>{if(token!==epoch)return;status.textContent=e.message;if(e.status===401||e.status===403){data=null;fill(root,h('p',{},'Esta sección requiere una cuenta administradora autorizada. ',h('a',{href:'/'},'Ingresar desde Inicio')));}};
 const act=(key,body,token,redraw)=>async()=>{
  if(token!==epoch||pending.has(key))return;pending.add(key);redraw();status.textContent='Guardando decisión…';
  try{await request(body);if(token===epoch)await load();}
  catch(e){error(e,token);if(token===epoch&&data){data=null;fill(root,h('p',{},'No se confirmó la decisión. Consultá el estado actual antes de volver a decidir.'),h('button',{type:'button',onclick:load},'Actualizar cola'));status.textContent=e.message+' Actualizá la cola antes de reintentar.';}}
  finally{pending.delete(key);if(token===epoch&&data)redraw();}
 };
 function queue(){
  const token=++epoch;status.textContent='Acceso administrativo verificado. No se ha aprobado contenido automáticamente.';
  fill(root,h('button',{type:'button',onclick:load},'Actualizar cola'),h('h2',{},'Credenciales profesionales'),
   (data.credentials||[]).length?data.credentials.map(c=>h('article',{},h('h3',{},c.username),h('p',{},`${c.profession} · ${c.specialty} · ${stateLabel(c.verification_status)}`),h('button',{type:'button',onclick:()=>credential(c)},'Revisar credencial de '+c.username))):h('p',{},'No hay credenciales para revisar.'),
   h('h2',{},'Contribuciones a la biblioteca'),(data.submissions||[]).length?data.submissions.map(s=>h('article',{},h('h3',{},s.title),h('p',{},`${s.author} · ${s.specialty} · ${s.module} · ${stateLabel(s.status)}${s.stale?' · CONTENIDO MODIFICADO':''}`),h('button',{type:'button',onclick:()=>submission(s)},'Revisar contribución: '+s.title))):h('p',{},'No hay contribuciones para revisar.'));
  return token;
 }
 const back=()=>h('button',{type:'button',onclick:queue},'← Volver a la cola');
 function credential(c){
  const token=++epoch,key='credential:'+c.user_id;let confirmed=false;
  status.textContent='Verificá la documentación por medios oficiales. Registrar una decisión no verifica automáticamente la matrícula.';
  function draw(){
   const check=h('input',{type:'checkbox',checked:confirmed,disabled:pending.has(key)||c.canVerify===false,onchange:()=>{confirmed=check.checked;draw();}});
   fill(root,back(),h('h2',{},'Credencial de '+c.username),h('p',{},'Estado: '+stateLabel(c.verification_status)),h('p',{},'Versión de credencial: '+c.version),
    h('dl',{},h('dt',{},'Profesión / especialidad'),h('dd',{},c.profession+' / '+c.specialty),h('dt',{},'Matrícula'),h('dd',{},c.registration),h('dt',{},'Jurisdicción'),h('dd',{},c.jurisdiction)),
    c.evidence_url?external(c.evidence_url,'Abrir evidencia externa'):h('p',{},'Sin enlace de evidencia aportado.'),
    c.canVerify===false?h('p',{role:'alert'},'No podés verificar tu propia credencial. Debe revisarla otra cuenta administradora autorizada.'):null,
    h('label',{},check,' Confirmo que verifiqué personalmente esta credencial y su evidencia.'),
    h('div',{class:'actions'},h('button',{type:'button',disabled:pending.has(key)||!confirmed||c.canVerify===false,onclick:act(key,{action:'verify-credential',userId:c.user_id,status:'verified',credentialVersion:c.version},token,draw)},'Registrar credencial verificada'),
     h('button',{type:'button',disabled:pending.has(key)||c.canVerify===false,onclick:act(key,{action:'verify-credential',userId:c.user_id,status:'rejected',credentialVersion:c.version},token,draw)},'Rechazar o revocar credencial')));
  }draw();
 }
 function submission(s){
  const token=++epoch,key='submission:'+s.id;let confirmed=false,notes='';
  status.textContent='Revisá el contenido completo y las fuentes. La integración será pública solo tras tu decisión explícita.';
  function draw(){
   const report=s.report||{},content=s.content||{},isSelf=s.canReview===false||Boolean(data.adminId&&s.submitted_by===data.adminId);
   const eligible=s.status==='pending'&&!s.stale&&!isSelf&&report.passed===true,canReject=!isSelf&&['pending','approved'].includes(s.status);
   const check=h('input',{type:'checkbox',checked:confirmed,disabled:pending.has(key)||!eligible,onchange:()=>{confirmed=check.checked;draw();}});
   const feedback=h('textarea',{rows:'4',maxlength:'1500','aria-label':'Observaciones de revisión'});feedback.value=notes;feedback.addEventListener('input',()=>{notes=feedback.value;reject.disabled=pending.has(key)||!canReject||!notes.trim();});
   const reject=h('button',{type:'button',disabled:pending.has(key)||!canReject||!notes.trim(),onclick:()=>act(key,{action:'review-submission',submissionId:s.id,status:'rejected',digest:s.content_digest,notes},token,draw)()},s.status==='approved'?'Retirar integración con observaciones':'Rechazar con observaciones');
   fill(root,back(),h('h2',{},s.title),h('p',{},`${s.author} · ${s.specialty} · ${s.module}`),h('p',{},'Estado: '+stateLabel(s.status)+' · versión '+s.version),
    s.stale?h('p',{role:'alert'},'La clase cambió desde su envío. No se puede integrar esta versión. Solicitá una nueva contribución.'):null,
    isSelf?h('p',{role:'alert'},'No podés aprobar tu propia contribución. Debe revisarla otra cuenta administradora autorizada.'):null,
    h('h3',{},'Informe automático — no es validación clínica'),h('p',{},report.passed?'Controles estructurales superados.':'Hay observaciones estructurales.'),h('ul',{},(report.issues||[]).map(i=>h('li',{},i.path+': '+i.message))),h('ul',{},(report.limitations||[]).map(x=>h('li',{},x))),
    classContent(content),h('h3',{},'Decisión administrativa'),s.review_notes?h('p',{},'Observaciones anteriores: '+s.review_notes):null,
    h('label',{},'Observaciones (obligatorias para rechazar)',feedback),
    h('label',{},check,' Confirmo que realicé una revisión clínica y bibliográfica independiente de esta versión, incluidas las respuestas y las fuentes, y autorizo su integración pública.'),
    h('div',{class:'actions'},h('button',{type:'button',disabled:pending.has(key)||!eligible||!confirmed,onclick:()=>act(key,{action:'review-submission',submissionId:s.id,status:'approved',digest:s.content_digest,notes,confirmClinicalReview:true},token,draw)()},'Aprobar e integrar en biblioteca pública'),reject));
  }draw();
 }
 async function load(){const token=++epoch;data=null;fill(root,h('p',{},'Cargando cola autorizada…'));status.textContent='Verificando acceso administrativo…';try{const next=await request();if(token!==epoch)return;data=next;queue();}catch(e){error(e,token);if(token===epoch&&e.status!==401&&e.status!==403)fill(root,h('button',{type:'button',onclick:load},'Reintentar carga'));}}
 return {load,dispose:()=>{epoch++;data=null;fill(root);}};
}

function classContent(c){
 const question=(q,label)=>h('article',{},h('h4',{},label+': '+(q.prompt||'')),h('ol',{},(q.options||[]).map((o,i)=>h('li',{},o+(i===q.answer?' — RESPUESTA INDICADA POR EL AUTOR':'')))),h('p',{},'Fundamento: '+(q.why||'')),h('p',{},'Referencias: '+(q.sources||[]).join(', ')));
 return h('section',{class:'editorial-content'},h('h3',{},'Contenido completo enviado'),h('p',{},c.summary||''),h('h4',{},'Objetivos'),h('ul',{},(c.objectives||[]).map(x=>h('li',{},x))),
  (c.sections||[]).map(s=>h('article',{},h('h4',{},s.heading),h('p',{},s.body),h('p',{},'Referencias: '+(s.sources||[]).join(', ')))),
  (c.slides||[]).map(s=>h('article',{},h('h4',{},s.title),h('ul',{},(s.bullets||[]).map(x=>h('li',{},x))),h('p',{},s.notes||''),h('p',{},'Referencias: '+(s.sources||[]).join(', ')))),
  h('h4',{},'Preguntas y respuestas del autor'),(c.questions||[]).map((q,i)=>question(q,'Pregunta '+(i+1))),
  c.case?h('article',{},h('h4',{},'Caso ficticio'),h('p',{},c.case.scenario),c.case.question?question(c.case.question,'Pregunta del caso'):null):null,
  c.game?h('article',{},h('h4',{},'Juego de conceptos'),h('ul',{},(c.game.pairs||[]).map(p=>h('li',{},p.term+' — '+p.definition)))):null,
  h('h4',{},'Fuentes'),h('ul',{},(c.sources||[]).map(s=>h('li',{},s.id+' · '+(s.provider||'')+' · ',external(s.url,s.title||s.url),s.meta?' · '+s.meta:''))));
}
const root=typeof document!=='undefined'?document.querySelector('#editorial-root'):null;
if(root)createEditorialAdmin({root,status:document.querySelector('#editorial-status')}).load();
