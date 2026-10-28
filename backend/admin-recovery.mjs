// Operator-provisioned recovery grants contain only a SHA-256 hash server-side.
// No public endpoint can create a grant or promote an account.
export const adminRecoverySchema=`CREATE TABLE IF NOT EXISTS clinic_admin_recovery(
 token_hash text PRIMARY KEY,user_id text NOT NULL REFERENCES clinic_users(id) ON DELETE CASCADE,
 credential_hash text NOT NULL,expires_at timestamptz NOT NULL,used_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now());`;
export async function provisionAdminRecovery(db,raw=process.env.ADMIN_RECOVERY_GRANT||''){
 if(!raw)return false;
 let g;try{g=JSON.parse(raw);}catch{return false;}
 const expiry=Date.parse(g.expiresAt);
 if(!/^[a-f0-9]{64}$/.test(g.tokenHash||'')||typeof g.username!=='string'||!Number.isFinite(expiry)||expiry<=Date.now()||expiry>Date.now()+48*3600000)return false;
 const u=(await db.query("SELECT id,password_hash FROM clinic_users WHERE username_key=$1 AND role='admin'",[g.username.trim().toLowerCase()])).rows[0];
 if(!u)return false;
 await db.query('INSERT INTO clinic_admin_recovery(token_hash,user_id,credential_hash,expires_at) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',[g.tokenHash,u.id,u.password_hash,new Date(expiry).toISOString()]);
 const r=await db.query('SELECT 1 FROM clinic_admin_recovery WHERE token_hash=$1 AND user_id=$2 AND credential_hash=$3 AND used_at IS NULL AND expires_at>now()',[g.tokenHash,u.id,u.password_hash]);
 return r.rows.length===1;
}
export async function recoverAdmin(db,{tokenHash,userId,passwordHash,recoveryHash}){
 // One statement is atomic even with the production connection pool. Concurrent
 // claims cannot reuse a grant; password changes invalidate outstanding grants.
 const r=await db.query(`WITH claimed AS (
 UPDATE clinic_admin_recovery g SET used_at=now() FROM clinic_users u
 WHERE g.token_hash=$1 AND g.user_id=$2 AND g.user_id=u.id AND u.role='admin'
 AND g.credential_hash=u.password_hash AND g.used_at IS NULL AND g.expires_at>now()
 RETURNING g.user_id,g.credential_hash), changed AS (
 UPDATE clinic_users u SET password_hash=$3,recovery_hash=$4,must_change=false
 FROM claimed c WHERE u.id=c.user_id AND u.password_hash=c.credential_hash
 RETURNING u.*), revoked AS (
 DELETE FROM clinic_sessions WHERE user_id IN (SELECT id FROM changed) RETURNING user_id)
 SELECT * FROM changed`,[tokenHash,userId,passwordHash,recoveryHash]);
 return r.rows[0]||null;
}
