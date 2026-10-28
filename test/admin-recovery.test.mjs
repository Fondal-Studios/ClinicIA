import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {schema} from '../backend/accounts.mjs';
import {adminRecoverySchema,provisionAdminRecovery,recoverAdmin} from '../backend/admin-recovery.mjs';
const hash='a'.repeat(64),future=()=>new Date(Date.now()+3600000).toISOString();
test('operator recovery is restricted, expiring, single-use, restart-safe and preserves admin data',async()=>{
 const db=new PGlite();await db.exec(schema+adminRecoverySchema);
 try{
  await db.query("INSERT INTO clinic_users(id,username,username_key,password_hash,recovery_hash,role) VALUES('admin','NanoGM','nanogm','original','old-recovery','admin'),('student','Alumno','alumno','other','other','student')");
  await db.query("INSERT INTO clinic_progress(user_id,payload,version) VALUES('admin','{\"kept\":true}',7)");
  await db.query("INSERT INTO clinic_sessions(token_hash,user_id,expires_at) VALUES('session-a','admin',now()+interval '1 hour'),('session-b','student',now()+interval '1 hour')");
  const grant=JSON.stringify({username:'NanoGM',tokenHash:hash,expiresAt:future()});
  assert.equal(await provisionAdminRecovery(db,JSON.stringify({username:'Alumno',tokenHash:hash,expiresAt:future()})),false);
  assert.equal(await provisionAdminRecovery(db,'{}'),false);
  assert.equal(await provisionAdminRecovery(db,grant),true);
  assert.equal(await provisionAdminRecovery(db,grant),true);
  assert.equal((await db.query("SELECT password_hash FROM clinic_users WHERE id='admin'")).rows[0].password_hash,'original');
  const claim={tokenHash:hash,userId:'admin',passwordHash:'new-hash',recoveryHash:'new-recovery'};
  assert.equal(await recoverAdmin(db,{...claim,userId:'student'}),null);
  assert.equal(await recoverAdmin(db,{...claim,tokenHash:'b'.repeat(64)}),null);
  const answers=await Promise.all([recoverAdmin(db,claim),recoverAdmin(db,claim)]);
  assert.equal(answers.filter(Boolean).length,1);assert.equal(answers.find(Boolean).role,'admin');assert.equal(answers.find(Boolean).id,'admin');
  assert.equal(await provisionAdminRecovery(db,grant),false);assert.equal(await recoverAdmin(db,claim),null);
  assert.deepEqual((await db.query("SELECT payload,version FROM clinic_progress WHERE user_id='admin'")).rows[0],{payload:{kept:true},version:7});
  assert.deepEqual((await db.query('SELECT user_id FROM clinic_sessions')).rows.map(r=>r.user_id),['student']);
  const second=JSON.stringify({username:'NanoGM',tokenHash:'c'.repeat(64),expiresAt:future()});await provisionAdminRecovery(db,second);
  await db.query("UPDATE clinic_admin_recovery SET expires_at=now()-interval '1 minute' WHERE token_hash=$1",['c'.repeat(64)]);
  assert.equal(await recoverAdmin(db,{...claim,tokenHash:'c'.repeat(64)}),null);
  assert.equal(await provisionAdminRecovery(db,second),false); // a restart cannot extend expiry
  await provisionAdminRecovery(db,JSON.stringify({username:'NanoGM',tokenHash:'d'.repeat(64),expiresAt:future()}));
  await db.query("UPDATE clinic_users SET password_hash='changed-elsewhere' WHERE id='admin'");
  assert.equal(await recoverAdmin(db,{...claim,tokenHash:'d'.repeat(64)}),null);
 }finally{await db.close();}
});
