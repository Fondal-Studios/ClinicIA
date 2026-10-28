import test from 'node:test';import assert from 'node:assert/strict';import {PGlite} from '@electric-sql/pglite';
import {schema} from '../backend/accounts.mjs';import {vaultSchema,createVault,cleanIdentity,parseKey} from '../backend/vault.mjs';
const KEY='a'.repeat(64),KEY2='b'.repeat(64);
const person={nombre:'Juan',apellido:'Pérez',dni:'30.111.222',fechaNacimiento:'1970-05-04',sexo:'Masculino',telefono:'11 5555-1234',obraSocial:'OSDE',nroAfiliado:'123',domicilio:'Calle Falsa 123',extra:'ignorado'};
test('vault keys and identity validation',()=>{
 assert.ok(parseKey(KEY)&&parseKey(Buffer.alloc(32,1).toString('base64')));assert.equal(parseKey('corta'),null);assert.equal(parseKey(undefined),null);
 const c=cleanIdentity(person);assert.equal(c.extra,undefined);assert.equal(c.nombre,'Juan');assert.equal(cleanIdentity({...person,fechaNacimiento:'04/05/1970'}).fechaNacimiento,'');
 assert.throws(()=>cleanIdentity({nombre:'x'}),e=>e.status===400);assert.throws(()=>cleanIdentity(null),e=>e.status===400);
});
test('identity is encrypted at rest, isolated per user, authenticated and rotatable',async()=>{
 const db=new PGlite();await db.exec(schema+vaultSchema);
 await db.query("INSERT INTO clinic_users(id,username,username_key,password_hash,recovery_hash) VALUES('u1','Doc1','doc1','h','h'),('u2','Doc2','doc2','h','h')");
 const env={PATIENT_VAULT_KEY:KEY},vault=createVault({db,env}),U1={id:'u1'},U2={id:'u2'};
 try{
  const created=await vault.handle(U1,'POST',{action:'create',identity:person});assert.match(created.id,/^[a-f0-9-]{36}$/);
  const raw=(await db.query('SELECT * FROM clinic_patient_identity')).rows[0];
  for(const secret of ['Juan','Pérez','30.111.222','OSDE','Falsa','1970'])assert.ok(!raw.payload.includes(secret)&&!Buffer.from(raw.payload,'base64').toString('latin1').includes(secret),'plaintext leaked: '+secret);
  const listed=await vault.handle(U1,'GET');assert.equal(listed.enabled,true);assert.equal(listed.patients[0].identity.apellido,'Pérez');assert.equal(listed.patients[0].identity.dni,'30.111.222');
  assert.deepEqual((await vault.handle(U2,'GET')).patients,[]);
  await assert.rejects(()=>vault.handle(U2,'POST',{action:'update',id:created.id,identity:person}),e=>e.status===404);await assert.rejects(()=>vault.handle(U2,'POST',{action:'delete',id:created.id}),e=>e.status===404);
  // ciphertext moved to another record or user fails authentication (AAD binds id and owner)
  await db.query("INSERT INTO clinic_patient_identity(id,user_id,kid,payload) VALUES('11111111-1111-1111-1111-111111111111','u2',$1,$2)",[raw.kid,raw.payload]);
  const swapped=(await vault.handle(U2,'GET')).patients[0];assert.equal(swapped.identity,null);assert.equal(swapped.unreadable,true);
  await db.query("DELETE FROM clinic_patient_identity WHERE id='11111111-1111-1111-1111-111111111111'");
  const upd=await vault.handle(U1,'POST',{action:'update',id:created.id,identity:{...person,telefono:'11 0000-0000'}});assert.equal(upd.identity.telefono,'11 0000-0000');
  // key rotation: old key kept as previous, new key current
  const v2=createVault({db,env:{PATIENT_VAULT_KEY:KEY2,PATIENT_VAULT_KEY_PREVIOUS:KEY}});let l=await v2.handle(U1,'GET');assert.equal(l.needsRotation,1);assert.equal(l.patients[0].identity.nombre,'Juan');
  assert.deepEqual(await v2.handle(U1,'POST',{action:'rotate'}),{rotated:1});assert.equal((await v2.handle(U1,'GET')).needsRotation,0);
  const onlyNew=createVault({db,env:{PATIENT_VAULT_KEY:KEY2}});assert.equal((await onlyNew.handle(U1,'GET')).patients[0].identity.nombre,'Juan');
  const oldOnly=createVault({db,env:{PATIENT_VAULT_KEY:KEY}});assert.equal((await oldOnly.handle(U1,'GET')).patients[0].unreadable,true);
  assert.deepEqual(await vault.handle(U1,'POST',{action:'delete',id:created.id}),{deleted:true});assert.deepEqual((await vault.handle(U1,'GET')).patients,[]);
  // without a key nothing is stored and the UI is told why
  const off=createVault({db,env:{}});assert.deepEqual(await off.handle(U1,'GET'),{enabled:false,patients:[]});await assert.rejects(()=>off.handle(U1,'POST',{action:'create',identity:person}),e=>e.status===503&&/PATIENT_VAULT_KEY/.test(e.message));
  // deleting the account erases the vault
  await vault.handle(U1,'POST',{action:'create',identity:person});await db.query("DELETE FROM clinic_users WHERE id='u1'");assert.equal((await db.query('SELECT count(*)::int AS n FROM clinic_patient_identity')).rows[0].n,0);
 }finally{await db.close();}
});
