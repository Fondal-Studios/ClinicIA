import {h,fill} from './class-ui.mjs';

// This panel records an explicit owner's attestation; it never performs clinical review.
export function classReview({cls,dirty,request,isCurrent,onPublished}){
 const box=h('section',{class:'card','aria-label':'Revisión docente y publicación'});
 if(cls.role!=='owner')return fill(box,h('p',{},'Solo quien creó el aula puede registrar la revisión docente y publicar.'));
 if(dirty)return fill(box,h('p',{role:'status'},'Guardá los cambios antes de revisar o publicar. Cada cambio de contenido requiere una nueva revisión.'));
 let report=null,busy=false,confirmed=false;
 const message=h('p',{role:'status','aria-live':'polite'}),body=h('div');
 const perform=fn=>async()=>{
  if(busy||!isCurrent())return;
  busy=true;draw();message.textContent='Procesando…';
  try{await fn();if(isCurrent())message.textContent='';}
  catch(e){if(isCurrent()){report=null;confirmed=false;message.textContent=e.message;}}
  finally{busy=false;if(isCurrent())draw();}
 };
 function draw(){
  const validate=h('button',{type:'button',disabled:busy,onclick:perform(async()=>{
   const next=await request({action:'validate'});if(!isCurrent())return;
   if(next.version!==cls.version)throw new Error('Otra persona modificó el aula. Recargá el aula y revisá la versión guardada antes de continuar.');
   report=next;confirmed=false;
  })},report?'Volver a comprobar':'Comprobar versión guardada');
  fill(body,validate);
  if(!report)return;
  body.append(h('p',{},report.passed?'Controles estructurales superados. Esto NO verifica exactitud clínica.':'Hay observaciones que debés corregir y guardar antes de continuar.'),
   h('ul',{},(report.issues||[]).map(i=>h('li',{},`${i.path}: ${i.message}`))),
   h('ul',{},(report.limitations||[]).map(x=>h('li',{},x))));
  if(!report.passed)return;
  if(!report.approved){
   const checkbox=h('input',{type:'checkbox',checked:confirmed,disabled:busy,'aria-label':'Confirmo mi revisión docente',onchange:()=>{confirmed=checkbox.checked;draw();}});
   body.append(h('label',{},checkbox,' Confirmo que revisé personalmente la exactitud clínica, las respuestas y la bibliografía de esta versión guardada. No estoy confirmando solo que pasó el control automático.'),
    h('button',{type:'button',disabled:busy||!confirmed,onclick:perform(async()=>{
     if(!confirmed)return;
     const approval=await request({action:'approve-review',digest:report.digest,confirmClinicalReview:true});if(!isCurrent())return;
     if(!approval.approved||approval.digest!==report.digest)throw new Error('No se pudo confirmar la revisión de esta versión. Volvé a comprobarla.');
     report={...report,approved:true};confirmed=false;
    })},'Registrar mi revisión docente'));
  }else{
   body.append(h('p',{},'Revisión docente registrada para este contenido. No es una certificación ni una revisión independiente.'),
    h('button',{type:'button',disabled:busy,onclick:perform(async()=>{
     const published=await request({action:'publish',digest:report.digest});if(isCurrent())onPublished(published);
    })},'Publicar versión revisada'));
  }
 }
 fill(box,h('h3',{},'Revisión docente antes de publicar'),h('p',{},'Como responsable del aula, vos registrás tu propia revisión. ClinicIA no verifica tus credenciales profesionales ni sustituye una revisión clínica independiente. Revisá teoría, preguntas, respuestas y fuentes antes de confirmar.'),body,message);draw();return box;
}
