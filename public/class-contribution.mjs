import {h,fill} from './class-ui.mjs';

export function classContribution({cls,dirty,request,isCurrent}){
 const box=h('section',{class:'card'}),message=h('p',{role:'status'}),body=h('div');
 fill(box,h('h3',{},'Aportar esta clase a la biblioteca compartida'),h('p',{},'Tu aula privada y sus alumnos siguen separados de la biblioteca pública. Enviar un aporte no lo publica: queda pendiente de revisión administrativa. Solo una persona administradora distinta del autor puede aprobarlo e integrarlo.'),body,message);
 if(cls.role!=='owner'){fill(body,h('p',{},'Solo el dueño del aula puede enviar esta contribución.'));return box;}
 if(dirty){fill(body,h('p',{},'Guardá los cambios antes de enviar una versión a revisión.'));return box;}
 let busy=false,consent=false;
 const specialty=h('input',{maxlength:'100',required:true,'aria-label':'Especialidad del aporte'}),module=h('input',{maxlength:'100',required:true,'aria-label':'Módulo del aporte'});
 const check=h('input',{type:'checkbox','aria-label':'Autorizar integración pública tras revisión administrativa'});
 const submit=h('button',{type:'button',disabled:true},'Enviar aporte a revisión administrativa');
 check.addEventListener('change',()=>{consent=check.checked;submit.disabled=busy||!consent;});
 async function load(){
  const [credentials,own,report]=await Promise.all([request('/api/account/instructor-credentials'),request('/api/account/library-submit'),request('/api/account/classes/'+cls.id,{action:'validate'})]);
  if(!isCurrent())return;
  const rows=own.submissions.filter(s=>s.class_id===cls.id),credential=credentials.credential;
  fill(body,h('p',{},'Credencial profesional: '+(credential?.verification_status||'sin presentar')),h('a',{href:'/credenciales.html'},'Presentar o consultar mis credenciales profesionales'),
   h('h4',{},'Mis envíos de esta clase'),rows.length?h('ul',{},rows.map(s=>h('li',{},`${s.status}${s.stale?' · versión anterior':''}${s.review_notes?' · '+s.review_notes:''}`))):h('p',{},'Todavía no enviaste esta clase.'));
  if(report.version!==cls.version){body.append(h('p',{},'La versión guardada cambió. Recargá el aula y revisala antes de enviar.'));return;}
  if(credential?.verification_status!=='verified'){body.append(h('p',{},'El administrador debe verificar tu profesión antes de que puedas enviar aportes. Podés seguir trabajando en aulas privadas.'));return;}
  if(!report.passed||!report.approved){body.append(h('p',{},'Primero completá los controles y tu revisión docente en «Revisión y publicación». Esa revisión del autor no sustituye la verificación del administrador.'));return;}
  if(rows.some(s=>s.status==='approved'&&!s.stale)){body.append(h('p',{},'Esta versión ya tiene una revisión administrativa aprobada. No hace falta reenviarla.'),h('a',{href:'/biblioteca.html#instructor/todos/clases'},'Consultar biblioteca compartida'));return;}
  if(rows.some(s=>s.status==='pending'&&!s.stale)){body.append(h('p',{},'Esta versión ya está pendiente. No hace falta volver a enviarla.'));return;}
  body.append(h('label',{},'Especialidad',specialty),h('label',{},'Módulo',module),h('label',{},check,' Autorizo al administrador a publicar e integrar esta versión en la biblioteca abierta si la aprueba. Confirmo que puedo compartir el material y que no contiene datos identificatorios de pacientes.'),submit);
  submit.addEventListener('click',async()=>{
   if(busy||!consent||!isCurrent())return;
   if(!specialty.value.trim()||!module.value.trim()){message.textContent='Indicá especialidad y módulo.';return;}
   busy=true;submit.disabled=true;check.disabled=true;message.textContent='Enviando…';
   try{await request('/api/account/library-submit',{classId:cls.id,specialty:specialty.value,module:module.value,digest:report.digest,consentPublic:true});if(!isCurrent())return;consent=false;check.checked=false;message.textContent='Aporte enviado: pendiente de verificación administrativa. Aún no se integró a la biblioteca.';await load();}
   catch(e){if(isCurrent())message.textContent=e.message;}
   finally{busy=false;if(isCurrent()){check.disabled=false;submit.disabled=!consent;}}
  });
 }
 fill(body,h('p',{},'Consultando credenciales y estado…'));
 load().catch(e=>{if(isCurrent()){fill(body,h('button',{type:'button',onclick:()=>{message.textContent='';load().catch(err=>{if(isCurrent())message.textContent=err.message;});}},'Reintentar'));message.textContent=e.message;}});
 return box;
}
