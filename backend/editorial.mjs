import {randomUUID} from 'node:crypto';
import {validateClass} from './class-validation.mjs';
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
export const editorialSchema=`CREATE TABLE IF NOT EXISTS clinic_instructor_credentials(user_id text PRIMARY KEY REFERENCES clinic_users(id) ON DELETE CASCADE,profession text NOT NULL,specialty text NOT NULL,registration text NOT NULL,jurisdiction text NOT NULL,evidence_url text,verification_status text NOT NULL DEFAULT 'pending',verified_by text REFERENCES clinic_users(id),verified_at timestamptz,updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS clinic_library_submissions(id text PRIMARY KEY,class_id text NOT NULL REFERENCES clinic_classes(id) ON DELETE CASCADE,submitted_by text NOT NULL REFERENCES clinic_users(id),content_digest text NOT NULL,status text NOT NULL DEFAULT 'pending',specialty text NOT NULL,module text NOT NULL,review_notes text NOT NULL DEFAULT '',reviewed_by text REFERENCES clinic_users(id),reviewed_at timestamptz,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS clinic_library_submissions_status ON clinic_library_submissions(status,created_at);`;
const str=(v,n)=>typeof v==='string'?v.trim().slice(0,n):'';
export function createEditorial({db}){
 async function credentials(u,method,b={}){
  if(method==='GET')return {credential:(await db.query('SELECT profession,specialty,registration,jurisdiction,evidence_url,verification_status,verified_at FROM clinic_instructor_credentials WHERE user_id=$1',[u.id])).rows[0]||null};
  if(method!=='POST')fail(405,'Método no permitido.');
  const profession=str(b.profession,80),specialty=str(b.specialty,100),registration=str(b.registration,80),jurisdiction=str(b.jurisdiction,100);
  if(!profession||!specialty||!registration||!jurisdiction)fail(400,'Completá profesión, especialidad, matrícula y jurisdicción.');
  const evidence=str(b.evidenceUrl,400);if(evidence&&(!evidence.startsWith('https://')))fail(400,'La evidencia debe usar HTTPS.');
  await db.query(`INSERT INTO clinic_instructor_credentials(user_id,profession,specialty,registration,jurisdiction,evidence_url) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(user_id) DO UPDATE SET profession=EXCLUDED.profession,specialty=EXCLUDED.specialty,registration=EXCLUDED.registration,jurisdiction=EXCLUDED.jurisdiction,evidence_url=EXCLUDED.evidence_url,verification_status='pending',verified_by=NULL,verified_at=NULL,updated_at=now()`,[u.id,profession,specialty,registration,jurisdiction,evidence||null]);
  return {status:'pending'};
 }
 async function submit(u,b){
  const id=str(b.classId,50),specialty=str(b.specialty,100),module=str(b.module,100);
  if(!specialty||!module)fail(400,'Indicá especialidad y módulo.');
  const credential=(await db.query("SELECT 1 FROM clinic_instructor_credentials WHERE user_id=$1 AND verification_status='verified'",[u.id])).rows[0];
  if(!credential)fail(403,'Tu profesión y especialidad deben estar verificadas.');
  const row=(await db.query("SELECT id,content,status FROM clinic_classes WHERE id=$1 AND owner_id=$2",[id,u.id])).rows[0];
  if(!row)fail(404,'Clase no encontrada o sin permiso.');
  const report=validateClass(row.content);if(!report.passed)fail(409,'La clase tiene observaciones de validación.');
  const approval=(await db.query('SELECT 1 FROM clinic_class_reviews WHERE class_id=$1 AND content_digest=$2',[id,report.digest])).rows[0];
  if(!approval)fail(409,'Falta aprobación docente para esta versión.');
  const submissionId=randomUUID();
  await db.query("INSERT INTO clinic_library_submissions(id,class_id,submitted_by,content_digest,specialty,module) VALUES($1,$2,$3,$4,$5,$6)",[submissionId,id,u.id,report.digest,specialty,module]);
  return {submissionId,status:'pending'};
 }
 async function catalog(query=''){
  const rows=(await db.query(`SELECT s.id,s.class_id,c.title,s.specialty,s.module,u.username AS author,s.reviewed_at,s.content_digest,c.content FROM clinic_library_submissions s JOIN clinic_classes c ON c.id=s.class_id JOIN clinic_users u ON u.id=s.submitted_by WHERE s.status='approved' AND ($1='' OR c.title ILIKE '%'||$1||'%' OR s.specialty ILIKE '%'||$1||'%') ORDER BY s.reviewed_at DESC LIMIT 100`,[str(query,100)])).rows;
  return {classes:rows.filter(r=>validateClass(r.content).digest===r.content_digest).map(({content,content_digest,...r})=>r)};
 }
 async function admin(u,method,b={},query={}){
  if(u.role!=='admin')fail(403,'Acceso exclusivo para administración.');
  if(method==='GET'){
   const credentials=(await db.query("SELECT c.user_id,u.username,c.profession,c.specialty,c.registration,c.jurisdiction,c.evidence_url,c.verification_status FROM clinic_instructor_credentials c JOIN clinic_users u ON u.id=c.user_id ORDER BY c.updated_at DESC LIMIT 100")).rows;
   const submissions=(await db.query("SELECT s.*,c.title,u.username AS author FROM clinic_library_submissions s JOIN clinic_classes c ON c.id=s.class_id JOIN clinic_users u ON u.id=s.submitted_by ORDER BY s.created_at DESC LIMIT 100")).rows;
   return {credentials,submissions};
  }
  if(method!=='POST')fail(405,'Método no permitido.');
  if(b.action==='verify-credential'){
   if(!['verified','rejected'].includes(b.status))fail(400,'Estado inválido.');
   const r=await db.query('UPDATE clinic_instructor_credentials SET verification_status=$1,verified_by=$2,verified_at=now() WHERE user_id=$3 RETURNING user_id',[b.status,u.id,str(b.userId,50)]);
   if(!r.rows.length)fail(404,'Solicitud no encontrada.');return {status:b.status};
  }
  if(b.action==='review-submission'){
   if(!['approved','rejected'].includes(b.status))fail(400,'Estado inválido.');
   const submission=(await db.query('SELECT s.*,c.content FROM clinic_library_submissions s JOIN clinic_classes c ON c.id=s.class_id WHERE s.id=$1',[str(b.submissionId,50)])).rows[0];
   if(!submission)fail(404,'Solicitud no encontrada.');
   if(b.status==='approved'){
    if(validateClass(submission.content).digest!==submission.content_digest)fail(409,'La clase cambió; solicitá una nueva revisión.');
    const credential=(await db.query("SELECT 1 FROM clinic_instructor_credentials WHERE user_id=$1 AND verification_status='verified'",[submission.submitted_by])).rows[0];
    if(!credential)fail(409,'Credencial no verificada.');
    if(b.confirmClinicalReview!==true)fail(400,'Confirmá revisión clínica y bibliográfica independiente.');
   }
   await db.query('UPDATE clinic_library_submissions SET status=$1,review_notes=$2,reviewed_by=$3,reviewed_at=now() WHERE id=$4',[b.status,str(b.notes,1500),u.id,submission.id]);
   return {status:b.status};
  }
  fail(400,'Acción inválida.');
 }
 return {credentials,submit,catalog,admin};
}
