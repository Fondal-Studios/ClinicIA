import {randomUUID} from 'node:crypto';
import {validateClass} from './class-validation.mjs';
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
export const editorialSchema=`CREATE TABLE IF NOT EXISTS clinic_instructor_credentials(user_id text PRIMARY KEY REFERENCES clinic_users(id) ON DELETE CASCADE,profession text NOT NULL,specialty text NOT NULL,registration text NOT NULL,jurisdiction text NOT NULL,evidence_url text,verification_status text NOT NULL DEFAULT 'pending',verified_by text REFERENCES clinic_users(id),verified_at timestamptz,updated_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE clinic_instructor_credentials ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;
CREATE TABLE IF NOT EXISTS clinic_library_submissions(id text PRIMARY KEY,class_id text NOT NULL REFERENCES clinic_classes(id) ON DELETE CASCADE,submitted_by text NOT NULL REFERENCES clinic_users(id),content_digest text NOT NULL,status text NOT NULL DEFAULT 'pending',specialty text NOT NULL,module text NOT NULL,review_notes text NOT NULL DEFAULT '',reviewed_by text REFERENCES clinic_users(id),reviewed_at timestamptz,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS clinic_library_submissions_status ON clinic_library_submissions(status,created_at);`;
const str=(v,n)=>typeof v==='string'?v.trim().slice(0,n):'';
const uuid=/^[a-f0-9-]{36}$/;
const projected=c=>({title:c.title,summary:c.summary,objectives:c.objectives,sections:c.sections,slides:c.slides,sources:c.sources,game:c.game,case:c.case?{scenario:c.case.scenario}:null,questionCount:(c.questions?.length||0)+(c.case?.question?1:0)});
export function createEditorial({db}){
 async function credentials(u,method,b={}){
  if(method==='GET')return {credential:(await db.query('SELECT profession,specialty,registration,jurisdiction,evidence_url,verification_status,verified_at,version FROM clinic_instructor_credentials WHERE user_id=$1',[u.id])).rows[0]||null};
  if(method!=='POST')fail(405,'Método no permitido.');
  const profession=str(b.profession,80),specialty=str(b.specialty,100),registration=str(b.registration,80),jurisdiction=str(b.jurisdiction,100);
  if(!profession||!specialty||!registration||!jurisdiction)fail(400,'Completá profesión, especialidad, matrícula y jurisdicción.');
  const evidence=str(b.evidenceUrl,400);if(evidence){try{if(new URL(evidence).protocol!=='https:')throw Error();}catch{fail(400,'La evidencia debe usar HTTPS.');}}
  await db.query(`INSERT INTO clinic_instructor_credentials(user_id,profession,specialty,registration,jurisdiction,evidence_url) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(user_id) DO UPDATE SET profession=EXCLUDED.profession,specialty=EXCLUDED.specialty,registration=EXCLUDED.registration,jurisdiction=EXCLUDED.jurisdiction,evidence_url=EXCLUDED.evidence_url,verification_status='pending',verified_by=NULL,verified_at=NULL,version=clinic_instructor_credentials.version+1,updated_at=now()`,[u.id,profession,specialty,registration,jurisdiction,evidence||null]);
  return {status:'pending'};
 }
 async function own(u){
  const rows=(await db.query('SELECT s.*,c.title,c.content FROM clinic_library_submissions s JOIN clinic_classes c ON c.id=s.class_id WHERE s.submitted_by=$1 ORDER BY s.created_at DESC LIMIT 100',[u.id])).rows;
  return {submissions:rows.map(({content,...s})=>({...s,stale:validateClass(content).digest!==s.content_digest}))};
 }
 async function submit(u,b){
  const id=str(b.classId,50),specialty=str(b.specialty,100),module=str(b.module,100);
  if(!uuid.test(id)||!specialty||!module)fail(400,'Indicá clase, especialidad y módulo.');
  if(b.consentPublic!==true)fail(400,'Confirmá que querés aportar esta versión a la biblioteca pública para revisión administrativa.');
  const row=(await db.query('SELECT id,content,version FROM clinic_classes WHERE id=$1 AND owner_id=$2',[id,u.id])).rows[0];
  if(!row)fail(404,'Clase no encontrada o sin permiso.');
  const report=validateClass(row.content);if(!report.passed||b.digest!==report.digest)fail(409,'La clase cambió o tiene observaciones. Comprobá y revisá la versión guardada.');
  const prior=(await db.query("SELECT id,status FROM clinic_library_submissions WHERE class_id=$1 AND content_digest=$2 AND status IN ('pending','approved') ORDER BY created_at DESC LIMIT 1",[id,report.digest])).rows[0];
  if(prior)return {submissionId:prior.id,status:prior.status};
  const submissionId=randomUUID();
  // The author, exact saved version, human attestation and professional check
  // are required in the insertion itself, not only in an earlier UI check.
  const r=await db.query(`WITH eligible AS (SELECT c.id FROM clinic_classes c JOIN clinic_instructor_credentials k ON k.user_id=c.owner_id
   WHERE c.id=$1 AND c.owner_id=$2 AND c.version=$7 AND k.verification_status='verified' AND k.verified_by IS NOT NULL AND k.verified_by<>k.user_id
   AND EXISTS(SELECT 1 FROM clinic_class_reviews r WHERE r.class_id=c.id AND r.content_digest=$4) FOR UPDATE OF c,k)
   INSERT INTO clinic_library_submissions(id,class_id,submitted_by,content_digest,specialty,module) SELECT $3,id,$2,$4,$5,$6 FROM eligible RETURNING id`,[id,u.id,submissionId,report.digest,specialty,module,row.version]);
  if(!r.rows.length)fail(409,'Se requiere credencial verificada y revisión docente vigente. Si hubo cambios, comprobá nuevamente.');
  return {submissionId,status:'pending'};
 }
 async function publicRows(query='',classId=''){
  const rows=(await db.query(`SELECT s.id,s.class_id,c.title,c.category,s.specialty,s.module,u.username AS author,s.reviewed_at,s.content_digest,c.content,c.version FROM clinic_library_submissions s JOIN clinic_classes c ON c.id=s.class_id JOIN clinic_users u ON u.id=s.submitted_by JOIN clinic_instructor_credentials k ON k.user_id=s.submitted_by WHERE s.status='approved' AND s.reviewed_by IS NOT NULL AND s.reviewed_by<>s.submitted_by AND c.status='published' AND c.is_public=true AND k.verification_status='verified' AND k.verified_by IS NOT NULL AND k.verified_by<>k.user_id AND ($2='' OR c.id=$2) AND ($1='' OR c.title ILIKE '%'||$1||'%' OR s.specialty ILIKE '%'||$1||'%') ORDER BY s.reviewed_at DESC LIMIT 100`,[str(query,100),classId])).rows;
  const seen=new Set();return rows.filter(r=>{if(seen.has(r.class_id)||validateClass(r.content).digest!==r.content_digest)return false;seen.add(r.class_id);return true;});
 }
 async function catalog(query=''){return {classes:(await publicRows(query)).map(({content,content_digest,version,...r})=>r)};}
 async function publicClass(id){if(!uuid.test(id||''))fail(404,'Clase pública no encontrada.');const row=(await publicRows('',id))[0];if(!row)fail(404,'Clase pública no encontrada.');return {class:{id:row.class_id,title:row.title,author:row.author,category:row.category,specialty:row.specialty,module:row.module,reviewed_at:row.reviewed_at,content:projected(row.content)}};}
 async function approvedRow(id){return (await publicRows('',id))[0]||null;}
 async function admin(u,method,b={}){
  if(u.role!=='admin')fail(403,'Acceso exclusivo para administración.');
  if(method==='GET'){
   const credentials=(await db.query('SELECT c.*,u.username FROM clinic_instructor_credentials c JOIN clinic_users u ON u.id=c.user_id ORDER BY c.updated_at DESC LIMIT 100')).rows;
   const rows=(await db.query('SELECT s.*,c.title,c.content,c.version,u.username AS author FROM clinic_library_submissions s JOIN clinic_classes c ON c.id=s.class_id JOIN clinic_users u ON u.id=s.submitted_by ORDER BY s.created_at DESC LIMIT 100')).rows;
   return {credentials:credentials.map(c=>({...c,canVerify:c.user_id!==u.id})),submissions:rows.map(s=>{const report=validateClass(s.content);return {...s,report,canReview:s.submitted_by!==u.id,stale:report.digest!==s.content_digest};})};
  }
  if(method!=='POST')fail(405,'Método no permitido.');
  if(b.action==='verify-credential'){
   if(!['verified','rejected'].includes(b.status))fail(400,'Estado inválido.');
   if(b.userId===u.id)fail(403,'Otra cuenta administradora debe verificar tus credenciales.');
   if(!Number.isInteger(b.credentialVersion))fail(409,'Recargá la solicitud de credenciales antes de decidir.');
   const r=await db.query('UPDATE clinic_instructor_credentials SET verification_status=$1,verified_by=$2,verified_at=now() WHERE user_id=$3 AND version=$4 RETURNING user_id',[b.status,u.id,str(b.userId,50),b.credentialVersion]);
   if(!r.rows.length)fail(409,'La solicitud cambió o no existe. Recargá antes de verificar.');return {status:b.status};
  }
  if(b.action==='review-submission'){
   if(!['approved','rejected'].includes(b.status))fail(400,'Estado inválido.');
   const s=(await db.query('SELECT s.*,c.content,c.version FROM clinic_library_submissions s JOIN clinic_classes c ON c.id=s.class_id WHERE s.id=$1',[str(b.submissionId,50)])).rows[0];
   if(!s)fail(404,'Solicitud no encontrada.');
   if(s.submitted_by===u.id)fail(403,'Otra cuenta administradora debe revisar tu contribución.');
   if(b.digest!==s.content_digest)fail(409,'La solicitud no coincide con la versión revisada. Recargá.');
   if(b.status==='rejected'){
    if(!str(b.notes,1500))fail(400,'Indicá el motivo del rechazo.');
    // Concurrent/legacy duplicate submissions share the same reviewed content.
    // Revocation is digest-wide so another approved duplicate cannot keep it public.
    const r=await db.query(`UPDATE clinic_library_submissions SET status='rejected',review_notes=$1,reviewed_by=$2,reviewed_at=now()
     WHERE class_id=$3 AND content_digest=$4 AND status IN ('pending','approved')
     AND EXISTS(SELECT 1 FROM clinic_library_submissions target WHERE target.id=$5 AND target.status IN ('pending','approved')) RETURNING id`,[str(b.notes,1500),u.id,s.class_id,s.content_digest,s.id]);
    if(!r.rows.length)fail(409,'Esta solicitud ya fue resuelta. Recargá.');return {status:'rejected'};
   }
   const report=validateClass(s.content);
   if(!report.passed||report.digest!==s.content_digest)fail(409,'La clase cambió; solicitá una nueva revisión.');
   if(b.confirmClinicalReview!==true)fail(400,'Confirmá revisión clínica y bibliográfica independiente.');
   // One statement locks the exact class and credential, resolves the pending
   // submission, and integrates only that version. No author visibility flag
   // can substitute for this administrative decision.
   const r=await db.query(`WITH eligible AS (SELECT c.id FROM clinic_classes c JOIN clinic_instructor_credentials k ON k.user_id=c.owner_id WHERE c.id=$1 AND c.version=$2 AND k.verification_status='verified' AND k.verified_by IS NOT NULL AND k.verified_by<>k.user_id AND EXISTS(SELECT 1 FROM clinic_class_reviews r WHERE r.class_id=c.id AND r.content_digest=$3) FOR UPDATE OF c,k), reviewed AS (UPDATE clinic_library_submissions SET status='approved',review_notes=$4,reviewed_by=$5,reviewed_at=now() WHERE id=$6 AND status='pending' AND class_id IN (SELECT id FROM eligible) RETURNING class_id) UPDATE clinic_classes SET status='published',is_public=true,updated_at=now() WHERE id IN (SELECT class_id FROM reviewed) RETURNING id`,[s.class_id,s.version,s.content_digest,str(b.notes,1500),u.id,s.id]);
   if(!r.rows.length)fail(409,'La versión, credencial o solicitud cambió. Recargá antes de aprobar.');
   return {status:'approved'};
  }
  fail(400,'Acción inválida.');
 }
 return {credentials,submit,own,catalog,publicClass,approvedRow,admin};
}
