import {createCipheriv,createDecipheriv,createHash,randomBytes,randomUUID} from 'node:crypto';
// Patient identity vault. Personal data is encrypted at rest with AES-256-GCM, stored only on the server and returned only to its
// owner. It is never part of what is sent to the AI provider. The key lives in PATIENT_VAULT_KEY (32 bytes, hex or base64); the
// previous key may stay in PATIENT_VAULT_KEY_PREVIOUS while records are re-encrypted. Whoever operates the server and holds the key can
// decrypt: this protects against database leaks and backups, not against the operator.
export const vaultSchema=`CREATE TABLE IF NOT EXISTS clinic_patient_identity(id text PRIMARY KEY,user_id text NOT NULL REFERENCES clinic_users(id) ON DELETE CASCADE,kid text NOT NULL,payload text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS clinic_patient_identity_user ON clinic_patient_identity(user_id);`;
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const FIELDS={nombre:80,apellido:80,dni:20,fechaNacimiento:10,sexo:20,telefono:40,obraSocial:80,nroAfiliado:40,domicilio:200};
export function parseKey(raw){
 if(typeof raw!=='string'||!raw.trim())return null;const v=raw.trim();
 const buf=/^[a-f0-9]{64}$/i.test(v)?Buffer.from(v,'hex'):Buffer.from(v,'base64');
 return buf.length===32?{key:buf,kid:createHash('sha256').update(buf).digest('hex').slice(0,8)}:null;
}
export function cleanIdentity(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))fail(400,'Datos del paciente inválidos.');
 const out={};for(const [k,max] of Object.entries(FIELDS)){const v=raw[k];out[k]=typeof v==='string'?v.replace(/\s+/g,' ').trim().slice(0,max):'';}
 if(out.fechaNacimiento&&!/^\d{4}-\d{2}-\d{2}$/.test(out.fechaNacimiento))out.fechaNacimiento='';
 if(!out.nombre||!out.apellido)fail(400,'Nombre y apellido son obligatorios.');
 return out;
}
export function createVault({db,env=process.env}){
 const keys=()=>[parseKey(env.PATIENT_VAULT_KEY),parseKey(env.PATIENT_VAULT_KEY_PREVIOUS)].filter(Boolean);
 const enabled=()=>keys().length>0&&Boolean(parseKey(env.PATIENT_VAULT_KEY));
 const need=()=>{if(!enabled())fail(503,'El guardado cifrado de datos personales no está configurado en este servidor (falta PATIENT_VAULT_KEY).');return parseKey(env.PATIENT_VAULT_KEY);};
 const seal=(k,id,userId,identity)=>{const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',k.key,iv);c.setAAD(Buffer.from(userId+':'+id));const ct=Buffer.concat([c.update(JSON.stringify(identity),'utf8'),c.final()]);return Buffer.concat([iv,c.getAuthTag(),ct]).toString('base64');};
 const open=(row)=>{
  const k=keys().find(x=>x.kid===row.kid);if(!k)return null;
  try{const b=Buffer.from(row.payload,'base64'),d=createDecipheriv('aes-256-gcm',k.key,b.subarray(0,12));d.setAAD(Buffer.from(row.user_id+':'+row.id));d.setAuthTag(b.subarray(12,28));return JSON.parse(Buffer.concat([d.update(b.subarray(28)),d.final()]).toString('utf8'));}catch{return null;}
 };
 async function list(u){
  if(!enabled())return {enabled:false,patients:[]};
  const rows=(await db.query('SELECT * FROM clinic_patient_identity WHERE user_id=$1 ORDER BY created_at',[u.id])).rows;
  const current=parseKey(env.PATIENT_VAULT_KEY).kid;
  return {enabled:true,patients:rows.map(r=>{const identity=open(r);return identity?{id:r.id,identity}:{id:r.id,identity:null,unreadable:true};}),needsRotation:rows.filter(r=>r.kid!==current).length};
 }
 async function handle(u,method,b){
  if(method==='GET')return list(u);
  if(method!=='POST')fail(405,'Método no permitido.');
  if(b.action==='rotate')return rotate(u);
  const k=need();
  if(b.action==='create'){
   const n=Number((await db.query('SELECT count(*) AS n FROM clinic_patient_identity WHERE user_id=$1',[u.id])).rows[0].n);if(n>=2000)fail(409,'Llegaste al máximo de pacientes guardados.');
   const id=randomUUID(),identity=cleanIdentity(b.identity);
   await db.query('INSERT INTO clinic_patient_identity(id,user_id,kid,payload) VALUES($1,$2,$3,$4)',[id,u.id,k.kid,seal(k,id,u.id,identity)]);return {id,identity};
  }
  if(typeof b.id!=='string'||!/^[a-f0-9-]{36}$/.test(b.id))fail(400,'Paciente inválido.');
  const row=(await db.query('SELECT id FROM clinic_patient_identity WHERE id=$1 AND user_id=$2',[b.id,u.id])).rows[0];if(!row)fail(404,'Paciente no encontrado.');
  if(b.action==='update'){const identity=cleanIdentity(b.identity);await db.query('UPDATE clinic_patient_identity SET kid=$1,payload=$2,updated_at=now() WHERE id=$3 AND user_id=$4',[k.kid,seal(k,b.id,u.id,identity),b.id,u.id]);return {id:b.id,identity};}
  if(b.action==='delete'){await db.query('DELETE FROM clinic_patient_identity WHERE id=$1 AND user_id=$2',[b.id,u.id]);return {deleted:true};}
  fail(400,'Acción inválida.');
 }
 // Re-encrypts every record of the user under the current key (after a key change).
 async function rotate(u){const k=need();let n=0;for(const r of (await db.query('SELECT * FROM clinic_patient_identity WHERE user_id=$1 AND kid<>$2',[u.id,k.kid])).rows){const identity=open(r);if(!identity)continue;await db.query('UPDATE clinic_patient_identity SET kid=$1,payload=$2,updated_at=now() WHERE id=$3',[k.kid,seal(k,r.id,r.user_id,identity),r.id]);n++;}return {rotated:n};}
 return {handle,enabled,rotate};
}
