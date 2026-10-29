import {randomUUID,randomBytes} from 'node:crypto';
import {policeCourse} from '../public/learn/content/respuesta-policial.mjs';
import {trainingCourses,trainingLessons} from '../public/learn/content/capacitacion-catalog.mjs';
export {trainingCourses};
export const capacitacionSchema=`
CREATE TABLE IF NOT EXISTS clinic_cohorts(id text PRIMARY KEY,owner_id text NOT NULL REFERENCES clinic_users(id),title text NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE clinic_cohorts ADD COLUMN IF NOT EXISTS join_code text;
CREATE UNIQUE INDEX IF NOT EXISTS clinic_cohort_join_code ON clinic_cohorts(join_code);
CREATE TABLE IF NOT EXISTS clinic_cohort_instructors(cohort_id text NOT NULL REFERENCES clinic_cohorts(id) ON DELETE CASCADE,user_id text NOT NULL REFERENCES clinic_users(id) ON DELETE CASCADE,added_by text NOT NULL REFERENCES clinic_users(id),PRIMARY KEY(cohort_id,user_id));
CREATE TABLE IF NOT EXISTS clinic_cohort_members(cohort_id text NOT NULL REFERENCES clinic_cohorts(id),user_id text NOT NULL REFERENCES clinic_users(id) ON DELETE CASCADE,status text NOT NULL DEFAULT 'pending',PRIMARY KEY(cohort_id,user_id));
CREATE TABLE IF NOT EXISTS clinic_course_reads(user_id text NOT NULL REFERENCES clinic_users(id) ON DELETE CASCADE,lesson_id text NOT NULL,PRIMARY KEY(user_id,lesson_id));
CREATE TABLE IF NOT EXISTS clinic_course_attempts(id text PRIMARY KEY,user_id text NOT NULL REFERENCES clinic_users(id) ON DELETE CASCADE,course_id text NOT NULL,items jsonb NOT NULL,answers jsonb NOT NULL DEFAULT '{}',version integer NOT NULL DEFAULT 0,result jsonb,created_at timestamptz NOT NULL DEFAULT now(),submitted_at timestamptz);
CREATE UNIQUE INDEX IF NOT EXISTS clinic_course_active_attempt ON clinic_course_attempts(user_id,course_id) WHERE result IS NULL;
CREATE TABLE IF NOT EXISTS clinic_practice_reviews(cohort_id text NOT NULL REFERENCES clinic_cohorts(id),user_id text NOT NULL REFERENCES clinic_users(id) ON DELETE CASCADE,lesson_id text NOT NULL,status text NOT NULL,criteria jsonb NOT NULL DEFAULT '[]',feedback text NOT NULL DEFAULT '',reviewer_id text REFERENCES clinic_users(id),updated_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(cohort_id,user_id,lesson_id));
CREATE TABLE IF NOT EXISTS clinic_training_audit(id text PRIMARY KEY,actor_id text NOT NULL REFERENCES clinic_users(id),action text NOT NULL,data jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS clinic_course_certificates(id text PRIMARY KEY,user_id text NOT NULL REFERENCES clinic_users(id),course_id text NOT NULL,issuer_id text NOT NULL REFERENCES clinic_users(id),data jsonb NOT NULL,issued_at timestamptz NOT NULL DEFAULT now(),UNIQUE(user_id,course_id));`;
const fail=(n,m)=>{throw Object.assign(new Error(m),{status:n});};
const txt=(v,max=500)=>typeof v==='string'?v.trim().slice(0,max):'';
export function createCapacitacion({db,issuerId=process.env.HOSPITAL_ISSUER_USER_ID||''}){
 const course=id=>{const c=trainingCourses.find(c=>c.id===id);if(!c)fail(400,'Curso inválido.');return c;};
 const canTeach=u=>u.role==='admin'||String(u.modes).split(',').includes('teacher');
 const audit=(u,action,data)=>db.query('INSERT INTO clinic_training_audit(id,actor_id,action,data) VALUES($1,$2,$3,$4)',[randomUUID(),u.id,action,JSON.stringify(data)]);
 async function canSupervise(u,g){if(g.owner_id===u.id)return true;if(!canTeach(u))return false;return !!(await db.query('SELECT 1 FROM clinic_cohort_instructors WHERE cohort_id=$1 AND user_id=$2',[g.id,u.id])).rows.length;}
 async function cohort(u,id,owner=false){const g=(await db.query('SELECT * FROM clinic_cohorts WHERE id=$1',[id])).rows[0];if(!g)fail(404,'Grupo no encontrado.');if(owner&&!await canSupervise(u,g))fail(403,'No tenés permisos para supervisar este grupo.');return g;}
 async function member(id,userId){const m=(await db.query("SELECT * FROM clinic_cohort_members WHERE cohort_id=$1 AND user_id=$2 AND status='accepted'",[id,userId])).rows[0];if(!m)fail(403,'La solicitud del alumno debe estar aceptada.');}
 async function state(u){
  return {user:{id:u.id,username:u.username,role:u.role||'student',canTeach:canTeach(u),canIssue:!!issuerId&&u.id===issuerId&&u.role==='admin'},issuerConfigured:!!issuerId,
   groups:(await db.query('SELECT g.id,g.title,g.owner_id,u.username AS instructor,m.status,EXISTS(SELECT 1 FROM clinic_cohort_instructors ci WHERE ci.cohort_id=g.id AND ci.user_id=$1) AS \"isInstructor\" FROM clinic_cohorts g JOIN clinic_users u ON u.id=g.owner_id LEFT JOIN clinic_cohort_members m ON m.cohort_id=g.id AND m.user_id=$1 ORDER BY g.created_at DESC',[u.id])).rows,
   read:(await db.query('SELECT lesson_id FROM clinic_course_reads WHERE user_id=$1',[u.id])).rows.map(x=>x.lesson_id),
   attempts:(await db.query('SELECT id,course_id,result,created_at,submitted_at FROM clinic_course_attempts WHERE user_id=$1 ORDER BY created_at DESC',[u.id])).rows,
   practices:(await db.query('SELECT * FROM clinic_practice_reviews WHERE user_id=$1',[u.id])).rows,
   certificates:(await db.query('SELECT * FROM clinic_course_certificates WHERE user_id=$1',[u.id])).rows};
 }
 async function handle(u,method,b={}){
  if(method==='GET')return state(u);if(method!=='POST')fail(405,'Método no permitido.');
  const a=b.action;
  if(a==='read'){if(!trainingLessons.some(l=>l.id===b.lessonId))fail(400,'Tema inválido.');await db.query('INSERT INTO clinic_course_reads VALUES($1,$2) ON CONFLICT DO NOTHING',[u.id,b.lessonId]);return {saved:true};}
  if(a==='create-group'){if(!canTeach(u))fail(403,'Activá el modo instructor para crear un grupo.');const title=txt(b.title,120);if(title.length<3)fail(400,'Escribí un nombre para el grupo.');const id=randomUUID(),joinCode=randomBytes(6).toString('hex').toUpperCase();await db.query('INSERT INTO clinic_cohorts(id,owner_id,title,join_code) VALUES($1,$2,$3,$4)',[id,u.id,title,joinCode]);return {id,joinCode};}
  if(a==='add-instructor'){const g=await cohort(u,b.groupId);if(g.owner_id!==u.id)fail(403,'Solo el responsable puede invitar instructores.');const target=(await db.query('SELECT id,role,modes FROM clinic_users WHERE lower(username)=$1',[String(b.username||'').trim().toLowerCase()])).rows[0];if(!target||!canTeach(target))fail(400,'El usuario debe tener modo instructor activo.');await db.query('INSERT INTO clinic_cohort_instructors(cohort_id,user_id,added_by) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[g.id,target.id,u.id]);await audit(u,a,{groupId:g.id,userId:target.id});return {added:true};}
  if(a==='join'){const code=String(b.joinCode||'').trim().toUpperCase();const g=(await db.query('SELECT id FROM clinic_cohorts WHERE join_code=$1',[code])).rows[0];if(!g)fail(404,'Código de grupo inválido. Consultá a tu instructor.');await db.query('INSERT INTO clinic_cohort_members(cohort_id,user_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[g.id,u.id]);return {requested:true};}
  if(a==='accept'){await cohort(u,b.groupId,true);const r=await db.query("UPDATE clinic_cohort_members SET status='accepted' WHERE cohort_id=$1 AND user_id=$2 RETURNING user_id",[b.groupId,b.userId]);if(!r.rows.length)fail(404,'Solicitud no encontrada.');await audit(u,a,{groupId:b.groupId,userId:b.userId});return {accepted:true};}
  if(a==='roster'){
   const g=await cohort(u,b.groupId);if(!await canSupervise(u,g))fail(403,'No tenés acceso a este grupo.');
   return {joinCode:g.owner_id===u.id?g.join_code:null,instructors:(await db.query('SELECT u.username FROM clinic_cohort_instructors ci JOIN clinic_users u ON u.id=ci.user_id WHERE ci.cohort_id=$1 ORDER BY u.username',[g.id])).rows,members:(await db.query(`SELECT m.user_id,m.status,u.username,(SELECT count(*) FROM clinic_course_reads r WHERE r.user_id=u.id) AS read_count,(SELECT jsonb_agg(jsonb_build_object('courseId',a.course_id,'result',a.result)) FROM clinic_course_attempts a WHERE a.user_id=u.id AND a.result IS NOT NULL) AS attempts FROM clinic_cohort_members m JOIN clinic_users u ON u.id=m.user_id WHERE m.cohort_id=$1 ORDER BY u.username`,[g.id])).rows,practices:(await db.query('SELECT * FROM clinic_practice_reviews WHERE cohort_id=$1',[g.id])).rows};
  }
  if(a==='practice'||a==='review'){
   await cohort(u,b.groupId,a==='review');const target=a==='review'?b.userId:u.id;await member(b.groupId,target);
   const l=trainingLessons.find(l=>l.id===b.lessonId);if(!l)fail(400,'Práctica inválida.');
   if(a==='practice'){
    await db.query("INSERT INTO clinic_practice_reviews(cohort_id,user_id,lesson_id,status) VALUES($1,$2,$3,'pending') ON CONFLICT(cohort_id,user_id,lesson_id) DO UPDATE SET status='pending',updated_at=now() WHERE clinic_practice_reviews.status!='approved'",[b.groupId,target,l.id]);return {pending:true};
   }
   if(!['approved','repeat'].includes(b.status))fail(400,'Estado inválido.');
   if(!Array.isArray(b.criteria)||b.criteria.length!==l.simulation.checklist.length||b.criteria.some(x=>typeof x!=='boolean'))fail(400,'Completá la lista de observación.');
   if(b.status==='approved'&&!b.criteria.every(Boolean))fail(400,'Para aprobar deben cumplirse todos los criterios.');
   if(b.status==='repeat'&&!txt(b.feedback))fail(400,'Indicá qué necesita repetir.');
   await db.query(`INSERT INTO clinic_practice_reviews(cohort_id,user_id,lesson_id,status,criteria,feedback,reviewer_id) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(cohort_id,user_id,lesson_id) DO UPDATE SET status=EXCLUDED.status,criteria=EXCLUDED.criteria,feedback=EXCLUDED.feedback,reviewer_id=EXCLUDED.reviewer_id,updated_at=now()`,[b.groupId,target,l.id,b.status,JSON.stringify(b.criteria),txt(b.feedback),u.id]);
   await audit(u,a,{groupId:b.groupId,userId:target,lessonId:l.id,status:b.status,criteria:b.criteria,feedback:txt(b.feedback)});return {saved:true};
  }
  if(a==='start'){
   const c=course(b.courseId);const qs=c.lessons.flatMap(l=>l.questions).map(q=>({id:q.id,prompt:q.prompt,options:q.options,answer:q.answer,why:q.why}));
   await db.query('INSERT INTO clinic_course_attempts(id,user_id,course_id,items) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',[randomUUID(),u.id,c.id,JSON.stringify(qs)]);
   const row=(await db.query('SELECT * FROM clinic_course_attempts WHERE user_id=$1 AND course_id=$2 AND result IS NULL',[u.id,c.id])).rows[0];return publicAttempt(row);
  }
  if(a==='save-answer'||a==='submit'){
   const row=(await db.query('SELECT * FROM clinic_course_attempts WHERE id=$1 AND user_id=$2',[b.attemptId,u.id])).rows[0];if(!row)fail(404,'Intento no encontrado.');if(row.result)return {result:row.result};
   if(a==='save-answer'){
    const q=row.items.find(q=>q.id===b.questionId);if(!q||!Number.isInteger(b.answer)||b.answer<0||b.answer>=q.options.length)fail(400,'Respuesta inválida.');
    const r=await db.query('UPDATE clinic_course_attempts SET answers=answers || $1::jsonb,version=version+1 WHERE id=$2 AND version=$3 AND result IS NULL RETURNING *',[JSON.stringify({[q.id]:b.answer}),row.id,b.version]);if(!r.rows.length)fail(409,'Otro dispositivo actualizó el intento. Reabrí la evaluación.');return {version:r.rows[0].version};
   }
   if(row.items.some(q=>!Number.isInteger(row.answers[q.id])))fail(400,'Respondé todas las preguntas antes de entregar.');
   const rows=row.items.map(q=>({id:q.id,prompt:q.prompt,selected:q.options[row.answers[q.id]],correct:q.options[q.answer],right:row.answers[q.id]===q.answer,why:q.why}));const correct=rows.filter(r=>r.right).length,result={correct,total:rows.length,passed:correct/rows.length>=0.8,rows};
   const saved=await db.query('UPDATE clinic_course_attempts SET result=$1,submitted_at=now(),version=version+1 WHERE id=$2 AND version=$3 AND result IS NULL RETURNING result',[JSON.stringify(result),row.id,row.version]);if(!saved.rows.length)fail(409,'El intento cambió. Reabrí la evaluación.');return {result};
  }
  if(a==='issue'){
   if(!issuerId||u.id!==issuerId||u.role!=='admin')fail(403,'Solo la cuenta autorizada del Dr. Mariano Jiménez puede emitir certificados hospitalarios.');
   const c=course(b.courseId);await cohort(u,b.groupId);await member(b.groupId,b.userId);
   const read=(await db.query('SELECT lesson_id FROM clinic_course_reads WHERE user_id=$1',[b.userId])).rows.map(r=>r.lesson_id);if(c.lessons.some(l=>!read.includes(l.id)))fail(409,'Falta completar teoría.');
   const passed=(await db.query("SELECT id,result FROM clinic_course_attempts WHERE user_id=$1 AND course_id=$2 AND result->>'passed'='true' ORDER BY submitted_at LIMIT 1",[b.userId,c.id])).rows[0];if(!passed)fail(409,'Falta aprobar la evaluación.');
   const practice=(await db.query("SELECT lesson_id FROM clinic_practice_reviews WHERE user_id=$1 AND cohort_id=$2 AND status='approved'",[b.userId,b.groupId])).rows.map(r=>r.lesson_id);
   if(!c.refresher&&c.lessons.some(l=>l.simulation.required&&!practice.includes(l.id)))fail(409,'Faltan prácticas obligatorias aprobadas.');
   const fullName=txt(b.fullName,120);if(fullName.length<5||b.confirm!==true)fail(400,'Confirmá nombre completo y autorización institucional.');
   const data={fullName,title:c.title,courseVersion:'2026-10-28',issuer:'Dr. Mariano Jiménez',position:'Jefe de Programa Clínica Básica y Urgencias',institution:'Hospital Nuestra Señora del Rosario · Cafayate',scope:c.refresher?'Evaluación teórica de refuerzo. No acredita destrezas presenciales.':'Teoría, evaluación y simulaciones presenciales de respuesta al paro/DEA apagado, protección cervical y hemorragia. No acredita profundidad ni calidad de compresiones.',result:{correct:passed.result.correct,total:passed.result.total},authorization:'Autorizado electrónicamente por la cuenta del emisor; sin reproducción de firma manuscrita.',groupId:b.groupId,attemptId:passed.id};
   await db.query('INSERT INTO clinic_course_certificates(id,user_id,course_id,issuer_id,data) VALUES($1,$2,$3,$4,$5) ON CONFLICT(user_id,course_id) DO NOTHING',[randomUUID(),b.userId,c.id,u.id,JSON.stringify(data)]);await audit(u,a,{userId:b.userId,courseId:c.id,groupId:b.groupId});return {issued:true};
  }
  fail(400,'Acción inválida.');
 }
 return {handle};
}
function publicAttempt(r){return {id:r.id,courseId:r.course_id,version:r.version,answers:r.answers,questions:r.items.map(({answer,why,...q})=>q)};}
