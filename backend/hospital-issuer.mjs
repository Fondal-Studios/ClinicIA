// Bootstrap only an existing administrator, then pin its immutable account ID.
// Never promote an account or replace credentials based on a public username.
export async function resolveHospitalIssuer(db,{issuerId=process.env.HOSPITAL_ISSUER_USER_ID||'',issuerUsername=process.env.HOSPITAL_ISSUER_USERNAME||''}={}){
 const key='hospital_issuer';
 if(issuerId){
  const u=(await db.query("SELECT id FROM clinic_users WHERE id=$1 AND role='admin'",[issuerId])).rows[0];
  return u?.id||'';
 }
 const pinned=(await db.query('SELECT value FROM clinic_settings WHERE key=$1',[key])).rows[0]?.value;
 if(pinned){
  const u=(await db.query("SELECT id FROM clinic_users WHERE id=$1 AND role='admin'",[pinned.userId])).rows[0];
  return u?.id||'';
 }
 if(!issuerUsername)return '';
 const u=(await db.query("SELECT id FROM clinic_users WHERE username_key=$1 AND role='admin'",[issuerUsername.trim().toLowerCase()])).rows[0];
 if(!u)return '';
 await db.query('INSERT INTO clinic_settings(key,value) VALUES($1,$2) ON CONFLICT DO NOTHING',[key,JSON.stringify({userId:u.id})]);
 // Read the winner in case two instances initialized concurrently.
 const saved=(await db.query('SELECT value FROM clinic_settings WHERE key=$1',[key])).rows[0].value;
 return saved.userId;
}
