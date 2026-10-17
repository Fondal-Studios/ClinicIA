import {randomBytes,randomUUID,randomInt} from 'node:crypto';
import {guardiaCourses} from '../public/learn/content/guardia.mjs';
import {sources} from '../public/learn/courses.mjs';
import {cases} from '../public/learn/cases.mjs';
export const trainingSchema=`CREATE TABLE IF NOT EXISTS clinic_training_attempts(id text PRIMARY KEY,user_id text NOT NULL REFERENCES clinic_users(id) ON DELETE CASCADE,course_id text NOT NULL,lesson_id text NOT NULL,items jsonb NOT NULL,result jsonb,created_at timestamptz NOT NULL DEFAULT now(),submitted_at timestamptz);
CREATE TABLE IF NOT EXISTS clinic_rooms(code text PRIMARY KEY,owner_id text NOT NULL REFERENCES clinic_users(id) ON DELETE CASCADE,data jsonb NOT NULL,version integer NOT NULL DEFAULT 0,expires_at timestamptz NOT NULL DEFAULT now()+interval '24 hours');`;
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=randomInt(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
const qs=guardiaCourses.flatMap(c=>c.lessons.flatMap(l=>l.questions));
export function createTraining({db}){
 async function assessment(u,method,b){
  if(method==='GET')return {attempts:(await db.query('SELECT id,course_id,lesson_id,result,submitted_at FROM clinic_training_attempts WHERE user_id=$1 AND result IS NOT NULL ORDER BY submitted_at DESC LIMIT 200',[u.id])).rows,approved:(await db.query("SELECT DISTINCT course_id,lesson_id FROM clinic_training_attempts WHERE user_id=$1 AND result->>'passed'='true'",[u.id])).rows};
  if(method!=='POST')fail(405,'Método no permitido.');
  if(b.action==='start'){
   if(b.accepted!==true)fail(400,'Aceptá el registro educativo y su visibilidad para administración.');
   const c=guardiaCourses.find(c=>c.id===b.courseId),l=c?.lessons.find(l=>l.id===b.lessonId);if(!l)fail(400,'Tema inválido.');
   const id=randomUUID(),items=shuffle(l.questions).map(q=>({id:q.id,order:shuffle(q.options.map((_,i)=>i))}));
   await db.query('INSERT INTO clinic_training_attempts(id,user_id,course_id,lesson_id,items) VALUES($1,$2,$3,$4,$5)',[id,u.id,c.id,l.id,JSON.stringify(items)]);
   return {id,title:l.title,required:items.length,questions:items.map(it=>{const q=qs.find(q=>q.id===it.id);return {id:q.id,prompt:q.prompt,options:it.order.map(i=>q.options[i]),rhythm:q.rhythm};})};
  }
  if(b.action!=='submit'||typeof b.id!=='string')fail(400,'Acción inválida.');
  const a=(await db.query('SELECT * FROM clinic_training_attempts WHERE id=$1 AND user_id=$2',[b.id,u.id])).rows[0];if(!a)fail(404,'Intento no encontrado.');if(a.result)return a.result;
  if(Date.now()-new Date(a.created_at).getTime()>3600000)fail(410,'El intento venció. Iniciá uno nuevo.');
  if(!Array.isArray(b.answers)||b.answers.length!==a.items.length||b.answers.some((v,i)=>!Number.isInteger(v)||v<0||v>=a.items[i].order.length))fail(400,'Respondé todas las preguntas.');
  const rows=a.items.map((it,i)=>{const q=qs.find(q=>q.id===it.id),selected=it.order[b.answers[i]];return {id:q.id,right:selected===q.answer,selected:q.options[selected],correct:q.options[q.answer],why:q.why,source:sources[q.source]};});
  const correct=rows.filter(r=>r.right).length,result={correct,total:rows.length,passed:correct===rows.length,rows};
  const saved=await db.query('UPDATE clinic_training_attempts SET result=$1,submitted_at=now() WHERE id=$2 AND result IS NULL RETURNING result',[JSON.stringify(result),a.id]);return saved.rows[0]?.result||(await db.query('SELECT result FROM clinic_training_attempts WHERE id=$1',[a.id])).rows[0].result;
 }
 async function roster(){return {rows:(await db.query(`SELECT DISTINCT ON (u.username,a.course_id,a.lesson_id) u.username,a.course_id,a.lesson_id,a.result,a.submitted_at,bool_or((a.result->>'passed')::boolean) OVER(PARTITION BY a.user_id,a.course_id,a.lesson_id) AS approved FROM clinic_training_attempts a JOIN clinic_users u ON u.id=a.user_id WHERE a.result IS NOT NULL ORDER BY u.username,a.course_id,a.lesson_id,a.submitted_at DESC`)).rows};}
 function visible(row,u){const d=row.data,c=cases.find(c=>c.id===d.caseId),s=c.steps[d.step],reveal=['discussion','feedback','finished'].includes(d.phase);return {code:row.code,version:row.version,expiresAt:row.expires_at,title:c.title,mode:d.mode,phase:d.phase,owner:d.owner===u.id,step:d.step,total:c.steps.length,members:d.members.map(m=>({name:m.name,self:m.id===u.id,voted:Object.hasOwn(d.votes,m.id),choice:reveal&&Object.hasOwn(d.votes,m.id)?s.options[d.votes[m.id]]:null,score:d.scores[m.id]||0})),question:['vote','discussion','feedback'].includes(d.phase)?{text:s.text,rhythm:s.rhythm,options:d.order.map((i,index)=>({index,text:s.options[i]}))}:null,messages:d.messages,feedback:d.phase==='feedback'?{why:s.why,correct:s.options[s.answer],source:sources[c.source]}:null,teamScore:d.teamScore};}
 async function rooms(u,method,b,code){
  if(!code&&method==='GET'){const rows=(await db.query("SELECT * FROM clinic_rooms WHERE expires_at>now() AND data->'members' @> $1::jsonb ORDER BY expires_at DESC",[JSON.stringify([{id:u.id}])])).rows;return {rooms:rows.map(r=>visible(r,u))};}
  if(!code&&method==='POST'){
   const c=cases.find(c=>c.id===b.caseId);if(!c||!['coop','versus'].includes(b.mode)||b.accepted!==true)fail(400,'Elegí un caso, modalidad y aceptá compartir tu actividad.');
   const data={owner:u.id,caseId:c.id,mode:b.mode,phase:'lobby',step:0,members:[{id:u.id,name:u.username}],votes:{},scores:{},teamScore:0,messages:[],order:shuffle(c.steps[0].options.map((_,i)=>i))};
   const r=(await db.query('INSERT INTO clinic_rooms(code,owner_id,data) VALUES($1,$2,$3) RETURNING *',[randomBytes(6).toString('hex'),u.id,JSON.stringify(data)])).rows[0];return visible(r,u);
  }
  if(!/^[a-f0-9]{12}$/.test(code||''))fail(404,'Sala no encontrada.');
  const row=(await db.query('SELECT * FROM clinic_rooms WHERE code=$1 AND expires_at>now()',[code])).rows[0];if(!row)fail(404,'Sala vencida o inexistente.');
  const d=row.data,c=cases.find(c=>c.id===d.caseId),s=c.steps[d.step];let member=d.members.some(m=>m.id===u.id);
  if(method==='POST'&&b.action==='join'){
   if(b.accepted!==true)fail(400,'Aceptá compartir tu actividad con la sala.');
   if(member)return visible(row,u);if(d.phase!=='lobby'||d.members.length>=4)fail(409,'La sala comenzó o está completa.');d.members.push({id:u.id,name:u.username});
  }else{
   if(!member)fail(403,'Ingresá con el código de invitación.');if(method==='GET')return visible(row,u);if(method!=='POST')fail(405,'Método no permitido.');
   if(b.version!==row.version)fail(409,'La sala cambió. Actualizala y repetí la acción.');
   if(['start','consensus','next','close'].includes(b.action)&&d.owner!==u.id)fail(403,'Sólo puede hacerlo quien coordina la sala.');
   if(b.action==='start'){if(d.phase!=='lobby'||d.members.length<2)fail(409,'Se necesitan entre dos y cuatro participantes.');d.phase='vote';}
   else if(b.action==='vote'){
    if(d.phase!=='vote'||Object.hasOwn(d.votes,u.id))fail(409,'Tu decisión ya quedó registrada o terminó la votación.');if(!Number.isInteger(b.choice)||!Number.isInteger(d.order[b.choice]))fail(400,'Opción inválida.');d.votes[u.id]=d.order[b.choice];
    if(d.members.every(m=>Object.hasOwn(d.votes,m.id))){for(const m of d.members)d.scores[m.id]=(d.scores[m.id]||0)+Number(d.votes[m.id]===s.answer);d.phase=d.mode==='coop'?'discussion':'feedback';}
   }else if(b.action==='chat'){
    if(!['discussion','feedback'].includes(d.phase))fail(409,'El chat se abre cuando todos eligieron.');if(typeof b.text!=='string'||!b.text.trim()||b.text.length>500)fail(400,'Escribí entre 1 y 500 caracteres.');if(d.messages.length>=60)fail(429,'La sala alcanzó 60 mensajes.');d.messages.push({name:u.username,text:b.text.trim(),at:Date.now()});
   }else if(b.action==='consensus'){
    if(d.phase!=='discussion'||d.mode!=='coop')fail(409,'No hay un acuerdo pendiente.');if(!Number.isInteger(b.choice)||!Number.isInteger(d.order[b.choice]))fail(400,'Elegí la decisión acordada.');d.teamScore+=Number(d.order[b.choice]===s.answer);d.phase='feedback';
   }else if(b.action==='next'){
    if(d.phase!=='feedback')fail(409,'Primero revisen la devolución.');if(d.step+1===c.steps.length)d.phase='finished';else{d.step++;d.votes={};d.order=shuffle(c.steps[d.step].options.map((_,i)=>i));d.phase='vote';}
   }else if(b.action==='close'){d.phase='closed';}
   else fail(400,'Acción inválida.');
  }
  const saved=(await db.query('UPDATE clinic_rooms SET data=$1,version=version+1 WHERE code=$2 AND version=$3 RETURNING *',[JSON.stringify(d),code,row.version])).rows[0];if(!saved)fail(409,'Otra persona actualizó la sala. Recargá y reintentá.');return visible(saved,u);
 }
 return {assessment,roster,rooms};
}
