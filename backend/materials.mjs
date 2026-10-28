import {randomUUID} from 'node:crypto';
// Student material (PDF text) and the courses generated from it. Only extracted text is kept, never the file, and every row is scoped to its owner.
export const materialSchema=`CREATE TABLE IF NOT EXISTS clinic_materials(id text PRIMARY KEY,owner_id text NOT NULL REFERENCES clinic_users(id) ON DELETE CASCADE,title text NOT NULL,page_count integer NOT NULL,pages jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE clinic_materials ADD COLUMN IF NOT EXISTS ocr_pages jsonb NOT NULL DEFAULT '[]';
ALTER TABLE clinic_materials ADD COLUMN IF NOT EXISTS ocr_todo jsonb NOT NULL DEFAULT '[]';
CREATE TABLE IF NOT EXISTS clinic_material_files(material_id text PRIMARY KEY REFERENCES clinic_materials(id) ON DELETE CASCADE,data bytea NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS clinic_materials_owner ON clinic_materials(owner_id);
CREATE TABLE IF NOT EXISTS clinic_courses(id text PRIMARY KEY,owner_id text NOT NULL REFERENCES clinic_users(id) ON DELETE CASCADE,material_id text NOT NULL REFERENCES clinic_materials(id) ON DELETE CASCADE,title text NOT NULL,lessons jsonb NOT NULL DEFAULT '[]',progress jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS clinic_courses_material ON clinic_courses(material_id);`;
export const LIMITS={maxBytes:15*1024*1024,maxPages:400,maxTextChars:3_000_000,maxPageChars:20000,minTextChars:300,maxMaterials:10,maxRangePages:30,maxOcrPages:100,ocrPerCall:16,emptyPageChars:80};
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const line=(v,n)=>typeof v==='string'?v.replace(/\s+/g,' ').trim().slice(0,n):'';

// unpdf wraps pdf.js for server use. Returns one string per page.
export async function extractPages(buffer){
 try{
  const {extractText,getDocumentProxy}=await import('unpdf');
  const pdf=await getDocumentProxy(new Uint8Array(buffer));
  const {text}=await extractText(pdf,{mergePages:false});
  return text;
 }catch{fail(400,'No se pudo leer el PDF. Verificá que no esté dañado ni protegido con contraseña.');}
}
// Joins words split by line-end hyphens and collapses whitespace so quotes can be matched reliably later.
const tidy=s=>String(s??'').replace(/-\s*\n\s*/g,'').replace(/\s+/g,' ').trim().slice(0,LIMITS.maxPageChars);

export function createMaterials({db,ai,quota,ocr,extract=extractPages}){
 async function upload(u,buffer,title){
  if(!buffer?.length||buffer.subarray(0,5).toString('latin1')!=='%PDF-')fail(415,'El archivo no es un PDF.');
  if(buffer.length>LIMITS.maxBytes)fail(413,'El PDF supera los 15 MB. Dividilo en partes.');
  const count=(await db.query('SELECT COUNT(*)::int AS n FROM clinic_materials WHERE owner_id=$1',[u.id])).rows[0].n;
  if(count>=LIMITS.maxMaterials)fail(409,`Ya tenés ${LIMITS.maxMaterials} materiales. Eliminá alguno para subir otro.`);
  const raw=await extract(buffer);
  if(!Array.isArray(raw)||!raw.length)fail(400,'No se encontró texto en el PDF.');
  if(raw.length>LIMITS.maxPages)fail(413,`El PDF tiene más de ${LIMITS.maxPages} páginas. Dividilo en partes.`);
  const pages=raw.map(tidy),chars=pages.reduce((n,p)=>n+p.length,0);
  // Pages without a text layer are scans: they are read later (in small steps) with AI, from the file kept only until then.
  const todo=pages.map((p,i)=>p.length<LIMITS.emptyPageChars?i+1:0).filter(Boolean);
  if(todo.length===pages.length&&!ocr)fail(422,'El PDF casi no tiene texto seleccionable. Si son páginas escaneadas, hace falta pasarlas por OCR antes de subirlas.');
  if(!todo.length&&chars<LIMITS.minTextChars)fail(422,'El PDF casi no tiene texto.');
  if(chars>LIMITS.maxTextChars)fail(413,'El texto del PDF es demasiado extenso. Dividilo en partes.');
  if(todo.length>LIMITS.maxOcrPages)fail(413,`Las páginas escaneadas se leen hasta ${LIMITS.maxOcrPages} por archivo. Dividí el PDF en partes.`);
  if(todo.length){
   const q=await quota.reserve({userId:u.id,headers:{}},{scope:'ocr',cost:todo.length});
   if(!q.ok)fail(429,'Alcanzaste el límite mensual de páginas escaneadas que podemos leer. Probá el mes próximo o subí un PDF con texto.');
  }
  const id=randomUUID(),name=line(title,120)||'Mi material';
  await db.query('INSERT INTO clinic_materials(id,owner_id,title,page_count,pages,ocr_todo) VALUES($1,$2,$3,$4,$5,$6)',[id,u.id,name,pages.length,JSON.stringify(pages),JSON.stringify(todo)]);
  if(todo.length)await db.query('INSERT INTO clinic_material_files(material_id,data) VALUES($1,$2)',[id,buffer]);
  const readable=pages.length-todo.length;
  return {material:{id,title:name,pageCount:pages.length,readablePages:readable,pendingOcr:todo.length}};
 }
 async function list(u){
  const r=await db.query(`SELECT m.id,m.title,m.page_count,m.created_at,jsonb_array_length(m.ocr_todo) AS pending,jsonb_array_length(m.ocr_pages) AS ocr_done,c.id AS course_id,jsonb_array_length(c.lessons) AS lessons FROM clinic_materials m LEFT JOIN clinic_courses c ON c.material_id=m.id WHERE m.owner_id=$1 ORDER BY m.created_at DESC`,[u.id]);
  return {materials:r.rows.map(x=>({id:x.id,title:x.title,pageCount:x.page_count,createdAt:x.created_at,courseId:x.course_id||null,lessons:x.lessons||0,pendingOcr:x.pending,ocrPages:x.ocr_done}))};
 }
 async function remove(u,id){
  if(typeof id!=='string')fail(400,'Material inválido.');
  const r=await db.query('DELETE FROM clinic_materials WHERE id=$1 AND owner_id=$2',[id,u.id]);
  if(!r.rowCount)fail(404,'Material no encontrado.');
  return {deleted:true};
 }
 async function ownMaterial(u,id){
  if(typeof id!=='string')fail(400,'Material inválido.');
  const r=await db.query('SELECT id,title,page_count,pages,ocr_pages,ocr_todo FROM clinic_materials WHERE id=$1 AND owner_id=$2',[id,u.id]);
  if(!r.rows[0])fail(404,'Material no encontrado.');
  return r.rows[0];
 }
 const publicCourse=r=>({id:r.id,materialId:r.material_id,title:r.title,lessons:r.lessons,progress:r.progress});
 async function course(u,materialId){
  await ownMaterial(u,materialId);
  const r=await db.query('SELECT * FROM clinic_courses WHERE material_id=$1 AND owner_id=$2',[materialId,u.id]);
  return {course:r.rows[0]?publicCourse(r.rows[0]):null};
 }
 async function generate(u,{materialId,from,to}){
  const m=await ownMaterial(u,materialId);
  const a=Number(from),b=Number(to);
  if(!Number.isInteger(a)||!Number.isInteger(b)||a<1||b<a||b>m.page_count)fail(400,`Elegí un rango de páginas entre 1 y ${m.page_count}.`);
  if(b-a+1>LIMITS.maxRangePages)fail(400,`Generá hasta ${LIMITS.maxRangePages} páginas por vez.`);
  if(m.ocr_todo.some(n=>n>=a&&n<=b))fail(409,'Esas páginas escaneadas todavía no se leyeron. Terminá la lectura primero.');
  const pages=m.pages.slice(a-1,b).map((text,i)=>({n:a+i,text}));
  const estimate=Math.max(1,Math.ceil(pages.filter(p=>p.text.length>=80).length/4));
  const q=await quota.reserve({userId:u.id,headers:{}},{scope:'course',cost:estimate});
  if(!q.ok)fail(429,'Alcanzaste el límite horario de generación de lecciones. Probá de nuevo más tarde.');
  const built=await ai.buildLessons(pages);
  if(!built.lessons.length)fail(422,'No pude armar lecciones verificables con esas páginas. Probá con otro rango o con páginas que tengan más texto.');
  const existing=(await db.query('SELECT * FROM clinic_courses WHERE material_id=$1 AND owner_id=$2',[materialId,u.id])).rows[0];
  const byId=new Map((existing?.lessons||[]).map(l=>[l.id,l]));
  const read=new Set(m.ocr_pages);
  for(const l of built.lessons){l.ocr=m.ocr_pages.some(n=>n>=l.pages[0]&&n<=l.pages[1]);byId.set(l.id,l);}
  const lessons=[...byId.values()].sort((x,y)=>x.pages[0]-y.pages[0]);
  let row;
  if(existing)row=(await db.query('UPDATE clinic_courses SET lessons=$1,updated_at=now() WHERE id=$2 RETURNING *',[JSON.stringify(lessons),existing.id])).rows[0];
  else row=(await db.query('INSERT INTO clinic_courses(id,owner_id,material_id,title,lessons) VALUES($1,$2,$3,$4,$5) RETURNING *',[randomUUID(),u.id,materialId,m.title,JSON.stringify(lessons)])).rows[0];
  return {course:publicCourse(row),added:built.lessons.length,failedRanges:built.failed};
 }
 // Reads the next few scanned pages. The UI calls this until `remaining` is 0, so no single request runs long.
 async function readScans(u,{materialId}){
  const m=await ownMaterial(u,materialId);
  if(!m.ocr_todo.length)return {remaining:0,read:0};
  if(!ocr)fail(503,'La lectura de páginas escaneadas no está disponible.');
  const f=(await db.query('SELECT data FROM clinic_material_files WHERE material_id=$1',[materialId])).rows[0];
  if(!f)fail(410,'El archivo ya no está disponible. Subí el PDF de nuevo.');
  const step=m.ocr_todo.slice(0,LIMITS.ocrPerCall),texts=await ocr.ocrPages(f.data,step.map(n=>n-1));
  const pages=[...m.pages],done=[];
  for(const n of step)if(texts.has(n-1)){pages[n-1]=tidy(texts.get(n-1));done.push(n);}
  // A page the model returns empty is final (nothing to read); one it never returned stays pending so it can be retried.
  const finished=step.filter(n=>texts.has(n-1)),todo=m.ocr_todo.filter(n=>!finished.includes(n)),ocrPages=[...new Set([...m.ocr_pages,...done])].sort((x,y)=>x-y);
  if(!finished.length)fail(502,'No pude leer esas páginas. Reintentá en un momento.');
  await db.query('UPDATE clinic_materials SET pages=$1,ocr_pages=$2,ocr_todo=$3 WHERE id=$4',[JSON.stringify(pages),JSON.stringify(ocrPages),JSON.stringify(todo),materialId]);
  if(!todo.length)await db.query('DELETE FROM clinic_material_files WHERE material_id=$1',[materialId]);
  return {remaining:todo.length,read:finished.length};
 }
 // Study progress is personal and informed by the client; it is not an assessment.
 async function complete(u,{courseId,lessonId,correct,total}){
  const r=await db.query('SELECT * FROM clinic_courses WHERE id=$1 AND owner_id=$2',[typeof courseId==='string'?courseId:'',u.id]);
  const c=r.rows[0];if(!c)fail(404,'Curso no encontrado.');
  const lesson=c.lessons.find(l=>l.id===lessonId);if(!lesson)fail(404,'Lección no encontrada.');
  const t=Number(total),k=Number(correct);
  if(!Number.isInteger(t)||!Number.isInteger(k)||t<1||t>lesson.exercises.length*2||k<0||k>t)fail(400,'Resultado inválido.');
  const pct=Math.round(100*k/t),prev=c.progress[lessonId]||{best:0,attempts:0};
  const progress={...c.progress,[lessonId]:{best:Math.max(prev.best,pct),attempts:prev.attempts+1,last:pct}};
  await db.query('UPDATE clinic_courses SET progress=$1,updated_at=now() WHERE id=$2',[JSON.stringify(progress),c.id]);
  return {progress};
 }
 return {upload,list,remove,course,generate,complete,readScans};
}
