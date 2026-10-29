import {validateClass,contentDigest} from './class-validation.mjs';
import {randomBytes,randomUUID,randomInt} from 'node:crypto';
export const classSchema=`CREATE TABLE IF NOT EXISTS clinic_classes(id text PRIMARY KEY,owner_id text NOT NULL REFERENCES clinic_users(id) ON DELETE CASCADE,title text NOT NULL,content jsonb NOT NULL,version integer NOT NULL DEFAULT 1,status text NOT NULL DEFAULT 'draft',pass_pct integer NOT NULL DEFAULT 80,due_at timestamptz,student_code text UNIQUE NOT NULL,editor_code text UNIQUE NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE clinic_classes ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;
ALTER TABLE clinic_classes ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'medicina-general';
CREATE TABLE IF NOT EXISTS clinic_class_reviews(class_id text PRIMARY KEY REFERENCES clinic_classes(id) ON DELETE CASCADE,content_digest text NOT NULL,reviewer_id text NOT NULL REFERENCES clinic_users(id),reviewed_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS clinic_class_members(class_id text NOT NULL REFERENCES clinic_classes(id) ON DELETE CASCADE,user_id text NOT NULL REFERENCES clinic_users(id) ON DELETE CASCADE,role text NOT NULL DEFAULT 'student',joined_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(class_id,user_id));
CREATE TABLE IF NOT EXISTS clinic_class_attempts(id text PRIMARY KEY,class_id text NOT NULL REFERENCES clinic_classes(id) ON DELETE CASCADE,user_id text NOT NULL REFERENCES clinic_users(id) ON DELETE CASCADE,kind text NOT NULL,items jsonb NOT NULL,result jsonb,created_at timestamptz NOT NULL DEFAULT now(),submitted_at timestamptz);
CREATE INDEX IF NOT EXISTS clinic_class_attempts_idx ON clinic_class_attempts(class_id,user_id);`;
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const CODE_ALPHABET='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newCode=()=>Array.from({length:8},()=>CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('');
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=randomInt(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
const line=(v,n)=>typeof v==='string'?v.replace(/\s+/g,' ').trim().slice(0,n):'';
const text=(v,n)=>typeof v==='string'?v.replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim().slice(0,n):'';
const https=u=>{try{const x=new URL(u);return x.protocol==='https:'?x.href.slice(0,500):'';}catch{return '';}};
const list=(v,max)=>Array.isArray(v)?v.slice(0,max):[];

// Everything stored goes through here: teachers edit freely, but shape, sizes and links are enforced on the server because students render this content.
export function cleanClass(raw){
 if(!raw||typeof raw!=='object')fail(400,'Contenido de clase inválido.');
 const sources=[],seen=new Set();
 for(const s of list(raw.sources,40)){const id=line(s?.id,8),url=https(s?.url);if(/^W\d{1,3}$/.test(id)&&url&&!seen.has(id)){seen.add(id);sources.push({id,provider:line(s.provider,60),kind:line(s.kind,40),title:line(s.title,200),url,meta:line(s.meta,120)});}}
 const refs=v=>[...new Set(list(v,6).filter(x=>seen.has(x)))];
 const ids=new Set();
 const question=q=>{
  const options=list(q?.options,5).map(o=>line(o,300));
  if(!line(q?.prompt,600)||!line(q?.why,900)||options.length!==5||options.some(o=>!o)||new Set(options.map(o=>o.toLowerCase())).size!==5||!Number.isInteger(q.answer)||q.answer<0||q.answer>4)return null;
  let id=typeof q.id==='string'&&/^q[a-f0-9]{8}$/.test(q.id)&&!ids.has(q.id)?q.id:'q'+randomBytes(4).toString('hex');ids.add(id);
  return {id,prompt:line(q.prompt,600),options,answer:q.answer,why:line(q.why,900),sources:refs(q.sources)};
 };
 const title=line(raw.title,140);if(!title)fail(400,'El aula necesita un título.');
 const caseQ=raw.case&&typeof raw.case==='object'?question(raw.case.question):null,scenario=text(raw.case?.scenario,1500);
 const pairs=list(raw.game?.pairs,12).map(p=>({term:line(p?.term,80),definition:line(p?.definition,200)})).filter(p=>p.term&&p.definition);
 return {
  title,summary:line(raw.summary,500),objectives:list(raw.objectives,8).map(o=>line(o,200)).filter(Boolean),
  sections:list(raw.sections,12).map(s=>({heading:line(s?.heading,120),body:text(s?.body,2500),sources:refs(s?.sources)})).filter(s=>s.heading&&s.body),
  slides:list(raw.slides,30).map(s=>({title:line(s?.title,100),bullets:list(s?.bullets,6).map(b=>line(b,160)).filter(Boolean),notes:text(s?.notes,600),sources:refs(s?.sources)})).filter(s=>s.title&&s.bullets.length),
  questions:list(raw.questions,60).map(question).filter(Boolean),
  case:scenario&&caseQ?{scenario,question:caseQ}:null,
  game:pairs.length>=4&&new Set(pairs.map(p=>p.term.toLowerCase())).size===pairs.length?{type:'match',pairs}:null,
  sources,
  origin:raw.status==='borrador-ia'||raw.origin==='ia'?'ia':'docente',
  notice:line(raw.notice,500)
 };
}
const pool=c=>[...c.questions,...(c.case?[{...c.case.question,prompt:c.case.scenario+' — '+c.case.question.prompt}]:[])];
const forStudent=c=>({...c,questions:undefined,questionCount:pool(c).length,case:c.case?{scenario:c.case.scenario}:null});
const readyToPublish=c=>pool(c).length>=3&&c.sections.length+c.slides.length>=1;
const summary=(r,role,extra={})=>({id:r.id,title:r.title,status:r.status,isPublic:r.is_public,category:r.category,role,passPct:r.pass_pct,dueAt:r.due_at,version:r.version,updatedAt:r.updated_at,...extra});
const uuid=/^[a-f0-9-]{36}$/;

export function createClasses({db,ai}){
 async function load(id){return (await db.query('SELECT * FROM clinic_classes WHERE id=$1',[id])).rows[0]||null;}
 async function roleOf(row,u){if(row.owner_id===u.id)return 'owner';const m=(await db.query('SELECT role FROM clinic_class_members WHERE class_id=$1 AND user_id=$2',[row.id,u.id])).rows[0];return m?.role||null;}
 async function access(id,u,{write=false,owner=false}={}){
  if(!uuid.test(id||''))fail(404,'Aula no encontrada.');const row=await load(id);if(!row)fail(404,'Aula no encontrada.');const role=await roleOf(row,u);if(!role)fail(404,'Aula no encontrada.');
  if(owner&&role!=='owner')fail(403,'Sólo quien creó el aula puede hacerlo.');if(write&&role==='student')fail(403,'Los alumnos no pueden editar el aula.');
  if(role==='student'&&row.status!=='published')fail(409,'El docente todavía no publicó o retiró esta aula.');
  return {row,role};
 }
 async function stats(classId,userId){
  const where=userId?'AND m.user_id=$2':'';const params=userId?[classId,userId]:[classId];
  return (await db.query(`SELECT u.username,m.user_id,m.role,m.joined_at,count(a.id) FILTER(WHERE a.kind='exam') AS exams,count(a.id) FILTER(WHERE a.kind='practice') AS practices,max((a.result->>'pct')::int) FILTER(WHERE a.kind='exam') AS best,coalesce(bool_or((a.result->>'passed')::boolean) FILTER(WHERE a.kind='exam'),false) AS passed,max(a.submitted_at) AS last_at FROM clinic_class_members m JOIN clinic_users u ON u.id=m.user_id LEFT JOIN clinic_class_attempts a ON a.class_id=m.class_id AND a.user_id=m.user_id AND a.result IS NOT NULL WHERE m.class_id=$1 ${where} GROUP BY u.username,m.user_id,m.role,m.joined_at ORDER BY u.username`,params)).rows.map(r=>({name:r.username,userId:r.user_id,role:r.role,joinedAt:r.joined_at,exams:Number(r.exams),practices:Number(r.practices),best:r.best===null?null:Number(r.best),passed:r.passed,lastAt:r.last_at}));
 }
 async function mine(u){
  const rows=(await db.query(`SELECT c.*,CASE WHEN c.owner_id=$1 THEN 'owner' ELSE m.role END AS role FROM clinic_classes c LEFT JOIN clinic_class_members m ON m.class_id=c.id AND m.user_id=$1 WHERE c.owner_id=$1 OR m.user_id=$1 ORDER BY c.updated_at DESC LIMIT 100`,[u.id])).rows;
  const out=[];for(const r of rows){
   if(r.role==='student'){if(r.status!=='published')continue;const me=(await stats(r.id,u.id))[0];out.push(summary(r,'student',{best:me?.best??null,passed:Boolean(me?.passed)}));}
   else out.push(summary(r,r.role,{members:Number((await db.query("SELECT count(*) AS n FROM clinic_class_members WHERE class_id=$1 AND role='student'",[r.id])).rows[0].n)}));
  }
  return {classes:out};
 }
 async function create(u,b){
  if((await db.query('SELECT count(*) AS n FROM clinic_classes WHERE owner_id=$1',[u.id])).rows[0].n>=30)fail(409,'Llegaste al máximo de 30 aulas. Eliminá alguna antes de crear otra.');
  const content=cleanClass(b.content),id=randomUUID();
  for(let i=0;i<5;i++){
   try{await db.query('INSERT INTO clinic_classes(id,owner_id,title,content,student_code,editor_code) VALUES($1,$2,$3,$4,$5,$6)',[id,u.id,content.title,JSON.stringify(content),newCode(),newCode()]);return view(await load(id),'owner');}
   catch(e){if(e.code!=='23505'||i===4)throw e;}
  }
 }
 function view(row,role){const c=row.content;return {...summary(row,role),content:c,studentCode:row.student_code,editorCode:role==='owner'?row.editor_code:undefined,ready:readyToPublish(c)};}
 async function studentView(row,u){const me=(await stats(row.id,u.id))[0]||null;return {...summary(row,'student',{best:me?.best??null,passed:Boolean(me?.passed)}),content:forStudent(row.content),me:me&&{exams:me.exams,practices:me.practices,best:me.best,passed:me.passed}};}
 async function join(u,b){
  const code=line(b.code,12).toUpperCase().replace(/[^A-Z0-9]/g,'');if(code.length!==8)fail(400,'El código tiene 8 letras y números.');
  if(b.accepted!==true)fail(400,'Aceptá que tu docente verá tu nombre de usuario y tus resultados.');
  const row=(await db.query('SELECT * FROM clinic_classes WHERE student_code=$1 OR editor_code=$1',[code])).rows[0];if(!row)fail(404,'No encontramos un aula con ese código.');
  if(row.owner_id===u.id)fail(409,'Sos quien creó esta aula.');
  const asEditor=row.editor_code===code;if(!asEditor&&row.status!=='published')fail(409,'Esta aula todavía no está publicada. Pedile al docente que la publique.');
  if(!asEditor&&Number((await db.query('SELECT count(*) AS n FROM clinic_class_members WHERE class_id=$1',[row.id])).rows[0].n)>=300)fail(409,'El aula alcanzó el máximo de 300 integrantes.');
  await db.query(`INSERT INTO clinic_class_members(class_id,user_id,role) VALUES($1,$2,$3) ON CONFLICT(class_id,user_id) DO UPDATE SET role=CASE WHEN EXCLUDED.role='editor' THEN 'editor' ELSE clinic_class_members.role END`,[row.id,u.id,asEditor?'editor':'student']);
  const role=await roleOf(row,u);return role==='student'?studentView(row,u):view(row,role);
 }
 async function start(u,row,role,b){
  if(!['practice','exam'].includes(b.kind))fail(400,'Tipo de intento inválido.');
  const items=pool(row.content);if(items.length<3)fail(409,'El aula todavía no tiene preguntas suficientes.');
  const snap=shuffle(items).map(q=>({id:q.id,prompt:q.prompt,options:q.options,answer:q.answer,why:q.why,order:shuffle(q.options.map((_,i)=>i))}));
  const id=randomUUID();await db.query('INSERT INTO clinic_class_attempts(id,class_id,user_id,kind,items) VALUES($1,$2,$3,$4,$5)',[id,row.id,u.id,b.kind,JSON.stringify(snap)]);
  return {attemptId:id,kind:b.kind,passPct:row.pass_pct,questions:snap.map(q=>({id:q.id,prompt:q.prompt,options:q.order.map(i=>q.options[i])}))};
 }
 async function submit(u,row,b){
  const a=typeof b.attemptId==='string'&&uuid.test(b.attemptId)?(await db.query('SELECT * FROM clinic_class_attempts WHERE id=$1 AND user_id=$2 AND class_id=$3',[b.attemptId,u.id,row.id])).rows[0]:null;if(!a)fail(404,'Intento no encontrado.');
  if(a.result)return a.result;if(Date.now()-new Date(a.created_at).getTime()>3600000)fail(410,'El intento venció. Iniciá uno nuevo.');
  if(!Array.isArray(b.answers)||b.answers.length!==a.items.length||b.answers.some((v,i)=>!Number.isInteger(v)||v<0||v>=a.items[i].order.length))fail(400,'Respondé todas las preguntas.');
  const rows=a.items.map((q,i)=>{const picked=q.order[b.answers[i]];return {prompt:q.prompt,right:picked===q.answer,selected:q.options[picked],correct:q.options[q.answer],why:q.why};});
  const correct=rows.filter(r=>r.right).length,pct=Math.round(100*correct/rows.length);
  const result={kind:a.kind,correct,total:rows.length,pct,passPct:row.pass_pct,passed:pct>=row.pass_pct,rows};
  const saved=await db.query('UPDATE clinic_class_attempts SET result=$1,submitted_at=now() WHERE id=$2 AND result IS NULL RETURNING result',[JSON.stringify(result),a.id]);
  return saved.rows[0]?.result||(await db.query('SELECT result FROM clinic_class_attempts WHERE id=$1',[a.id])).rows[0].result;
 }
 async function save(u,row,role,b){
  if(!Number.isInteger(b.version))fail(400,'Versión inválida.');
  const content=cleanClass(b.content);let pass=row.pass_pct,due=row.due_at;
  if(role==='owner'){
   if(b.passPct!==undefined){if(!Number.isInteger(b.passPct)||b.passPct<50||b.passPct>100)fail(400,'El porcentaje de aprobación va de 50 a 100.');pass=b.passPct;}
   if(b.dueAt!==undefined){if(b.dueAt===null||b.dueAt==='')due=null;else{const d=new Date(b.dueAt);if(!Number.isFinite(d.getTime()))fail(400,'Fecha límite inválida.');due=d.toISOString();}}
  }
  const r=(await db.query('UPDATE clinic_classes SET title=$1,content=$2,pass_pct=$3,due_at=$4,version=version+1,updated_at=now() WHERE id=$5 AND version=$6 RETURNING *',[content.title,JSON.stringify(content),pass,due,row.id,b.version])).rows[0];
  if(!r)fail(409,'Otra persona modificó el aula. Recargala y repetí tus cambios.');return view(r,role);
 }
 async function handle(u,method,path,b){
  const parts=path.replace('/api/account/classes','').split('/').filter(Boolean),id=parts[0],sub=parts[1];
  if(!id){
   if(method==='GET'&&b.action==='public-list')return {classes:(await db.query("SELECT c.id,c.title,c.category,u.username AS author FROM clinic_classes c JOIN clinic_users u ON u.id=c.owner_id WHERE c.status='published' AND c.is_public=true ORDER BY c.updated_at DESC LIMIT 100")).rows};
   if(method==='POST'&&b.action==='join-public'){const found=(await db.query("SELECT * FROM clinic_classes WHERE id=$1 AND is_public=true AND status='published'",[b.classId])).rows[0];if(!found)fail(404,'Clase pública no encontrada.');if(found.owner_id===u.id)fail(409,'Esta clase ya es tuya.');await db.query("INSERT INTO clinic_class_members(class_id,user_id,role) VALUES($1,$2,'student') ON CONFLICT(class_id,user_id) DO NOTHING",[found.id,u.id]);return studentView(found,u);}
   if(method==='GET')return mine(u);
   if(method==='POST'&&b.action==='create')return create(u,b);
   if(method==='POST'&&b.action==='join')return join(u,b);
   fail(400,'Acción inválida.');
  }
  if(sub==='progress'){
   if(method!=='GET')fail(405,'Método no permitido.');const {row}=await access(id,u,{write:true});
   return {passPct:row.pass_pct,dueAt:row.due_at,members:(await stats(row.id)).map(({userId,...m})=>m)};
  }
  if(method==='GET'){const {row,role}=await access(id,u);return role==='student'?studentView(row,u):view(row,role);}
  if(method!=='POST')fail(405,'Método no permitido.');
  const a=b.action;
  if(a==='start'||a==='submit'){const {row,role}=await access(id,u);return a==='start'?start(u,row,role,b):submit(u,row,b);}
  if(a==='leave'){const {row,role}=await access(id,u);if(role==='owner')fail(409,'Quien creó el aula no puede abandonarla; eliminala si ya no la necesitás.');await db.query('DELETE FROM clinic_class_members WHERE class_id=$1 AND user_id=$2',[row.id,u.id]);return {left:true};}
  if(a==='save'){const {row,role}=await access(id,u,{write:true});return save(u,row,role,b);}
  const {row}=await access(id,u,{owner:true});
  if(a==='publish'){if(!readyToPublish(row.content))fail(409,'Para publicar necesitás al menos 3 preguntas y una sección o diapositiva.');const report=validateClass(row.content);if(!report.passed)fail(409,'La clase no superó los controles automáticos.');const approval=(await db.query('SELECT 1 FROM clinic_class_reviews WHERE class_id=$1 AND content_digest=$2',[row.id,report.digest])).rows[0];if(!approval)fail(409,'La clase requiere aprobación docente para esta versión.');const r=(await db.query("UPDATE clinic_classes SET status='published',updated_at=now() WHERE id=$1 RETURNING *",[row.id])).rows[0];return view(r,'owner');}
  if(a==='validate'){const report=validateClass(row.content);return {...report,approved:!!(await db.query('SELECT 1 FROM clinic_class_reviews WHERE class_id=$1 AND content_digest=$2',[row.id,report.digest])).rows.length};}
  if(a==='approve-review'){const report=validateClass(row.content);if(!report.passed)fail(409,'La clase tiene observaciones. Revisá el informe de validación.');if(b.confirmClinicalReview!==true)fail(400,'Confirmá expresamente la revisión docente de exactitud clínica y bibliografía.');await db.query('INSERT INTO clinic_class_reviews(class_id,content_digest,reviewer_id) VALUES($1,$2,$3) ON CONFLICT(class_id) DO UPDATE SET content_digest=EXCLUDED.content_digest,reviewer_id=EXCLUDED.reviewer_id,reviewed_at=now()',[row.id,report.digest,u.id]);return {approved:true,digest:report.digest};}
  if(a==='set-visibility'){if(typeof b.isPublic!=='boolean')fail(400,'Elegí si la clase será pública o privada.');const cats=['medicina-general','emergencias','cardiologia','pediatria','trauma','cuidados-criticos','primeros-respondedores','rotaciones','otras-especialidades'];const category=String(b.category||row.category||'medicina-general');if(!cats.includes(category))fail(400,'Categoría inválida.');const r=(await db.query('UPDATE clinic_classes SET is_public=$1,category=$2,updated_at=now() WHERE id=$3 RETURNING *',[b.isPublic,category,row.id])).rows[0];return view(r,'owner');}
  if(a==='unpublish'){const r=(await db.query("UPDATE clinic_classes SET status='draft',updated_at=now() WHERE id=$1 RETURNING *",[row.id])).rows[0];return view(r,'owner');}
  if(a==='rotate-codes'){for(let i=0;i<5;i++){try{const r=(await db.query('UPDATE clinic_classes SET student_code=$1,editor_code=$2 WHERE id=$3 RETURNING *',[newCode(),newCode(),row.id])).rows[0];return view(r,'owner');}catch(e){if(e.code!=='23505'||i===4)throw e;}}}
  if(a==='remove-member'){if(typeof b.userId!=='string')fail(400,'Integrante inválido.');await db.query('DELETE FROM clinic_class_members WHERE class_id=$1 AND user_id=$2',[row.id,b.userId]);return {removed:true};}
  if(a==='delete'){if(b.confirm!==true)fail(400,'Confirmá que querés eliminar el aula y los resultados de sus alumnos.');await db.query('DELETE FROM clinic_classes WHERE id=$1',[row.id]);return {deleted:true};}
  fail(400,'Acción inválida.');
 }
 // AI helpers live here so they share the access rules: only signed-in users, and regeneration only on classes they may edit.
 async function generate(u,b){
  if(b.action==='draft'){const c=await ai.buildClass(b);return {class:c};}
  if(b.action==='regenerate'){
   const {row}=await access(b.classId,u,{write:true});
   const nums=[...list(b.sourceIds,60),...row.content.sources.map(s=>s.id)].map(x=>Number(String(x).replace(/^W/,''))).filter(Number.isInteger);
   return ai.regenerateItem({kind:b.kind,item:b.item,instruction:b.instruction,classTitle:row.title,idStart:Math.max(0,...nums)+1});
  }
  fail(400,'Acción inválida.');
 }
 return {handle,generate};
}
