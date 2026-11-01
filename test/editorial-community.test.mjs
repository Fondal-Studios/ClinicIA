import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {schema,createAccounts,hashPassword} from '../backend/accounts.mjs';
import http from 'node:http';
import {classSchema,createClasses} from '../backend/classes.mjs';
import {editorialSchema,createEditorial} from '../backend/editorial.mjs';
const content=()=>({title:'Clase educativa',objectives:['Reconocer límites'],sections:[{heading:'Teoría',body:'Contenido educativo con revisión humana pendiente.',sources:['W1']}],questions:[1,2,3].map(n=>({prompt:'Pregunta '+n,options:['A','B','C','D','E'],answer:0,why:'Razón '+n,sources:['W1']})),sources:[{id:'W1',title:'Fuente',url:'https://example.org'}]});
const credential={profession:'Médico',specialty:'Clínica',registration:'TEST123',jurisdiction:'Prueba'};
async function setup(){
 const db=new PGlite();await db.exec(schema+classSchema+editorialSchema);
 for(const [id,role] of [['owner','student'],['student','student'],['editor','student'],['admin','admin'],['otheradmin','admin']])await db.query('INSERT INTO clinic_users(id,username,username_key,password_hash,recovery_hash,role) VALUES($1,$1,$1,\'x\',\'x\',$2)',[id,role]);
 const owner={id:'owner',role:'student'},admin={id:'admin',role:'admin'},student={id:'student',role:'student'},editor={id:'editor',role:'student'};
 const api=createClasses({db}),ed=createEditorial({db});
 const c=await api.handle(owner,'POST','/api/account/classes',{action:'create',content:content()}),path='/api/account/classes/'+c.id;
 const report=await api.handle(owner,'POST',path,{action:'validate'});
 await api.handle(owner,'POST',path,{action:'approve-review',digest:report.digest,confirmClinicalReview:true});
 const submission={classId:c.id,specialty:'Clínica',module:'Introductorio',digest:report.digest,consentPublic:true};
 const verify=async()=>{await ed.credentials(owner,'POST',credential);const version=(await ed.credentials(owner,'GET')).credential.version;await ed.admin(admin,'POST',{action:'verify-credential',userId:owner.id,status:'verified',credentialVersion:version});};
 return {db,api,ed,owner,admin,student,editor,c,path,report,submission,verify};
}
test('contributions require owner consent, verified credentials and real admin review; private classes stay private',async()=>{
 const s=await setup();const {db,ed,api,owner,admin,student,editor,c,path,report,submission}=s;
 try{
  await assert.rejects(()=>ed.submit(owner,submission),e=>e.status===409);
  await s.verify();await assert.rejects(()=>ed.submit(owner,{...submission,consentPublic:false}),e=>e.status===400);
  await assert.rejects(()=>ed.submit(student,submission),e=>e.status===404);
  await api.handle(editor,'POST','/api/account/classes',{action:'join',code:c.editorCode,accepted:true});
  await assert.rejects(()=>ed.submit(editor,submission),e=>e.status===404);
  await assert.rejects(()=>api.handle(owner,'POST',path,{action:'set-visibility',isPublic:true}),e=>e.status===403);
  await api.handle(owner,'POST',path,{action:'publish',digest:report.digest});
  assert.equal((await ed.catalog()).classes.length,0);
  // Code enrollment remains available for private published classes.
  await api.handle(student,'POST','/api/account/classes',{action:'join',code:c.studentCode,accepted:true});
  await assert.rejects(()=>api.handle(student,'POST','/api/account/classes',{action:'join-public',classId:c.id}),e=>e.status===404);
  const sent=await ed.submit(owner,submission);assert.equal(sent.status,'pending');assert.deepEqual(await ed.submit(owner,submission),sent);
  assert.equal((await ed.own(owner)).submissions.length,1);assert.equal((await ed.own(student)).submissions.length,0);
  for(const user of [owner,student,editor])await assert.rejects(()=>ed.admin(user,'GET'),e=>e.status===403);
  const q=(await ed.admin(admin,'GET')).submissions[0];assert.equal(q.content.questions.length,3);assert.equal(q.stale,false);assert.equal(q.canReview,true);
  const review={action:'review-submission',submissionId:sent.submissionId,digest:report.digest,status:'approved'};
  await assert.rejects(()=>ed.admin(admin,'POST',review),e=>e.status===400);
  await assert.rejects(()=>ed.admin(admin,'POST',{...review,digest:'stale',confirmClinicalReview:true}),e=>e.status===409);
  assert.equal((await ed.catalog()).classes.length,0);
  await ed.admin(admin,'POST',{...review,confirmClinicalReview:true});
  assert.equal((await ed.catalog()).classes.length,1);assert.equal((await api.handle(student,'GET','/api/account/classes/public',{})).classes.length,1);
  const detail=(await ed.publicClass(c.id)).class;assert.equal(detail.content.questionCount,3);assert.equal(detail.content.questions,undefined);assert.ok(!JSON.stringify(detail).includes('"answer"'));assert.ok(!JSON.stringify(detail).includes(c.studentCode));
  assert.equal((await api.handle(student,'POST','/api/account/classes',{action:'join-public',classId:c.id})).role,'student');
  await assert.rejects(()=>ed.admin(admin,'POST',{...review,status:'rejected'}),e=>e.status===400);
  await ed.admin(admin,'POST',{...review,status:'rejected',notes:'Requiere correcciones editoriales.'});
  assert.equal((await ed.catalog()).classes.length,0);await assert.rejects(()=>ed.publicClass(c.id),e=>e.status===404);
  await assert.rejects(()=>api.handle(student,'POST','/api/account/classes',{action:'join-public',classId:c.id}),e=>e.status===404);
  assert.equal((await ed.own(owner)).submissions[0].review_notes,'Requiere correcciones editoriales.');
 }finally{await db.close();}
});
test('changed content and credentials invalidate public integration; stale and self admin approval are denied',async()=>{
 const s=await setup();const {db,ed,api,owner,admin,student,c,path,report,submission}=s;
 try{
  await s.verify();let sent=await ed.submit(owner,submission);
  let current=await api.handle(owner,'GET',path,{});current.content.summary='Nueva revisión';
  await api.handle(owner,'POST',path,{action:'save',version:current.version,content:current.content});
  assert.equal((await ed.admin(admin,'GET')).submissions[0].stale,true);
  await assert.rejects(()=>ed.admin(admin,'POST',{action:'review-submission',submissionId:sent.submissionId,digest:report.digest,status:'approved',confirmClinicalReview:true}),e=>e.status===409);
  const r=await api.handle(owner,'POST',path,{action:'validate'});await api.handle(owner,'POST',path,{action:'approve-review',digest:r.digest,confirmClinicalReview:true});
  sent=await ed.submit(owner,{...submission,digest:r.digest});await ed.admin(admin,'POST',{action:'review-submission',submissionId:sent.submissionId,digest:r.digest,status:'approved',confirmClinicalReview:true});
  assert.equal((await ed.catalog()).classes.length,1);
  await ed.credentials(owner,'POST',{...credential,registration:'NEW'});assert.equal((await ed.catalog()).classes.length,0);
  await assert.rejects(()=>ed.admin(admin,'POST',{action:'verify-credential',userId:owner.id,status:'verified',credentialVersion:1}),e=>e.status===409);
  await ed.admin(admin,'POST',{action:'verify-credential',userId:owner.id,status:'verified',credentialVersion:2});assert.equal((await ed.catalog()).classes.length,1);
  current=await api.handle(owner,'GET',path,{});current.content.summary='Otro cambio';const updated=await api.handle(owner,'POST',path,{action:'save',version:current.version,content:current.content});assert.equal(updated.status,'draft');assert.equal(updated.isPublic,false);assert.equal((await ed.catalog()).classes.length,0);
  await assert.rejects(()=>api.handle(student,'POST','/api/account/classes',{action:'join-public',classId:c.id}),e=>e.status===404);
  await ed.credentials(admin,'POST',credential);await assert.rejects(()=>ed.admin(admin,'POST',{action:'verify-credential',userId:admin.id,status:'verified',credentialVersion:1}),e=>e.status===403);
  // A real administrator cannot independently review their own contribution.
  await db.query('UPDATE clinic_library_submissions SET submitted_by=$1 WHERE id=$2',[admin.id,sent.submissionId]);
  const own=(await ed.admin(admin,'GET')).submissions.find(x=>x.id===sent.submissionId);assert.equal(own.canReview,false);
  await assert.rejects(()=>ed.admin(admin,'POST',{action:'review-submission',submissionId:sent.submissionId,digest:r.digest,status:'rejected',notes:'x'}),e=>e.status===403);
 }finally{await db.close();}
});
test('moderation and public enrollment reject concurrent saved-content or revoked-review changes',async()=>{
 const s=await setup();const {db,ed,api,owner,admin,student,c,path,report,submission}=s;
 try{
  await s.verify();const sent=await ed.submit(owner,submission);const query=db.query.bind(db);let raced=false;
  db.query=async(sql,params)=>{if(!raced&&sql.includes('reviewed AS (UPDATE clinic_library_submissions')){raced=true;await query('UPDATE clinic_classes SET version=version+1,content=jsonb_set(content,\'{summary}\',\'"Concurrent change"\'::jsonb) WHERE id=$1',[c.id]);}return query(sql,params);};
  await assert.rejects(()=>ed.admin(admin,'POST',{action:'review-submission',submissionId:sent.submissionId,digest:report.digest,status:'approved',confirmClinicalReview:true}),e=>e.status===409);
  assert.equal((await query('SELECT status FROM clinic_library_submissions WHERE id=$1',[sent.submissionId])).rows[0].status,'pending');assert.equal((await ed.catalog()).classes.length,0);db.query=query;
  const latest=await api.handle(owner,'POST',path,{action:'validate'});await api.handle(owner,'POST',path,{action:'approve-review',digest:latest.digest,confirmClinicalReview:true});
  const second=await ed.submit(owner,{...submission,digest:latest.digest});await ed.admin(admin,'POST',{action:'review-submission',submissionId:second.submissionId,digest:latest.digest,status:'approved',confirmClinicalReview:true});
  raced=false;db.query=async(sql,params)=>{if(!raced&&sql.includes('FOR SHARE OF c,s,k')){raced=true;await query("UPDATE clinic_library_submissions SET status='rejected' WHERE id=$1",[second.submissionId]);}return query(sql,params);};
  await assert.rejects(()=>api.handle(student,'POST','/api/account/classes',{action:'join-public',classId:c.id}),e=>e.status===409);
  assert.equal((await query('SELECT * FROM clinic_class_members WHERE class_id=$1 AND user_id=$2',[c.id,student.id])).rows.length,0);
 }finally{await db.close();}
});
test('HTTP public catalog/detail are anonymous while contributor/admin APIs enforce sessions, roles and CSRF',async()=>{
 const db=new PGlite();const api=await createAccounts({db,origin:'http://clinic.test',secure:false,adminName:'Moderator',adminHash:await hashPassword('initial-test-password')});
 const server=http.createServer((req,res)=>api.handler(req,res,new URL(req.url,'http://clinic.test')));await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const call=async(path,method='GET',body,cookie='',origin='http://clinic.test')=>{const r=await fetch(base+path,{method,headers:{origin,cookie,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,cookie:r.headers.get('set-cookie')?.split(';')[0],body:await r.json()};};
 try{
  assert.deepEqual((await call('/api/library/classes')).body,{classes:[]});assert.equal((await call('/api/library/classes/not-a-uuid')).status,404);
  assert.equal((await call('/api/admin/editorial')).status,401);assert.equal((await call('/api/account/library-submit')).status,401);
  const student=await call('/api/account/register','POST',{username:'Contributor',password:'long-test-password',accepted:true,role:'admin'});assert.equal(student.body.user.role,'student');
  assert.equal((await call('/api/admin/editorial','GET',null,student.cookie)).status,403);
  assert.equal((await call('/api/admin/editorial','POST',{action:'verify-credential',role:'admin'},student.cookie)).status,403);
  assert.equal((await call('/api/account/instructor-credentials','POST',credential,student.cookie,'https://evil.test')).status,403);
  assert.equal((await call('/api/account/instructor-credentials','POST',credential,student.cookie)).status,200);
  assert.equal((await call('/api/account/library-submit','GET',null,student.cookie)).status,200);
  const login=await call('/api/account/login','POST',{username:'Moderator',password:'initial-test-password'});
  assert.equal((await call('/api/admin/editorial','GET',null,login.cookie)).status,403);
  const activated=await call('/api/account/password','POST',{currentPassword:'initial-test-password',password:'changed-test-password'},login.cookie);
  const queue=await call('/api/admin/editorial','GET',null,activated.cookie);assert.equal(queue.status,200);assert.equal(queue.body.credentials.length,1);assert.equal(queue.body.credentials[0].version,1);
  assert.equal((await call('/api/admin/editorial','POST',{action:'verify-credential',userId:student.body.user.id,status:'verified',credentialVersion:1},activated.cookie,'https://evil.test')).status,403);
  assert.equal((await call('/api/admin/editorial','POST',{action:'verify-credential',userId:student.body.user.id,status:'verified',credentialVersion:1},activated.cookie)).status,200);
  const cls=await call('/api/account/classes','POST',{action:'create',content:content()},student.cookie),id=cls.body.id,path='/api/account/classes/'+id;
  const checked=await call(path,'POST',{action:'validate'},student.cookie);await call(path,'POST',{action:'approve-review',digest:checked.body.digest,confirmClinicalReview:true},student.cookie);
  const sent=await call('/api/account/library-submit','POST',{classId:id,specialty:'Clínica',module:'Módulo',digest:checked.body.digest,consentPublic:true},student.cookie);assert.equal(sent.status,200);
  assert.equal((await call('/api/library/classes')).body.classes.length,0);
  const approved=await call('/api/admin/editorial','POST',{action:'review-submission',submissionId:sent.body.submissionId,digest:checked.body.digest,status:'approved',confirmClinicalReview:true},activated.cookie);assert.equal(approved.status,200);
  assert.equal((await call('/api/library/classes?q=educativa')).body.classes.length,1);
  const detail=await call('/api/library/classes/'+id);assert.equal(detail.status,200);assert.equal(detail.body.class.content.questions,undefined);
  assert.equal((await call('/api/account/classes','POST',{action:'join-public',classId:id})).status,401);
 }finally{await new Promise(r=>server.close(r));await db.close();}
});
test('library enrollment does not grant access to later unreviewed private versions; explicit code pupils remain supported',async()=>{
 const s=await setup();const {db,ed,api,owner,admin,student,editor,c,path,report,submission}=s;
 try{
  await s.verify();const sent=await ed.submit(owner,submission);await ed.admin(admin,'POST',{action:'review-submission',submissionId:sent.submissionId,digest:report.digest,status:'approved',confirmClinicalReview:true});
  await api.handle(student,'POST','/api/account/classes',{action:'join-public',classId:c.id});
  await api.handle(editor,'POST','/api/account/classes',{action:'join',code:c.studentCode,accepted:true});
  const attempt=await api.handle(student,'POST',path,{action:'start',kind:'practice'});
  let current=await api.handle(owner,'GET',path,{});current.content.summary='Unreviewed private revision';await api.handle(owner,'POST',path,{action:'save',version:current.version,content:current.content});
  const updated=await api.handle(owner,'POST',path,{action:'validate'});await api.handle(owner,'POST',path,{action:'approve-review',digest:updated.digest,confirmClinicalReview:true});await api.handle(owner,'POST',path,{action:'publish',digest:updated.digest});
  await assert.rejects(()=>api.handle(student,'GET',path,{}),e=>e.status===409);
  await assert.rejects(()=>api.handle(student,'POST',path,{action:'start',kind:'exam'}),e=>e.status===409);
  assert.equal((await api.handle(student,'GET','/api/account/classes',{})).classes.length,0);
  assert.equal((await api.handle(editor,'GET',path,{})).role,'student');
  assert.equal((await api.handle(student,'POST',path,{action:'submit',attemptId:attempt.attemptId,answers:attempt.questions.map(()=>0)})).total,3);
  // Explicit code invitation grants private classroom access; public discovery alone never does.
  await api.handle(student,'POST','/api/account/classes',{action:'join',code:c.studentCode,accepted:true});
  assert.equal((await api.handle(student,'GET',path,{})).role,'student');
  const source=(await db.query('SELECT enrollment_source FROM clinic_class_members WHERE class_id=$1 AND user_id=$2',[c.id,student.id])).rows[0];assert.equal(source.enrollment_source,'code');
 }finally{await db.close();}
});
test('legacy self-verified credentials and self-approved submissions are not grandfathered into public trust',async()=>{
 const s=await setup();const {db,ed,api,owner,admin,student,c,report,submission}=s;
 try{
  await s.verify();await db.query('UPDATE clinic_instructor_credentials SET verified_by=user_id WHERE user_id=$1',[owner.id]);
  await assert.rejects(()=>ed.submit(owner,submission),e=>e.status===409);
  await ed.admin(admin,'POST',{action:'verify-credential',userId:owner.id,status:'verified',credentialVersion:1});
  const sent=await ed.submit(owner,submission);await ed.admin(admin,'POST',{action:'review-submission',submissionId:sent.submissionId,digest:report.digest,status:'approved',confirmClinicalReview:true});
  assert.equal((await ed.catalog()).classes.length,1);
  await db.query('UPDATE clinic_library_submissions SET reviewed_by=submitted_by WHERE id=$1',[sent.submissionId]);assert.equal((await ed.catalog()).classes.length,0);
  await assert.rejects(()=>api.handle(student,'POST','/api/account/classes',{action:'join-public',classId:c.id}),e=>e.status===404);
  await db.query('UPDATE clinic_library_submissions SET reviewed_by=$1 WHERE id=$2',[admin.id,sent.submissionId]);
  await db.query('UPDATE clinic_instructor_credentials SET verified_by=user_id WHERE user_id=$1',[owner.id]);assert.equal((await ed.catalog()).classes.length,0);
  await assert.rejects(()=>ed.publicClass(c.id),e=>e.status===404);
 }finally{await db.close();}
});
test('rejecting a contribution atomically revokes every pending or approved duplicate of its digest',async()=>{
 const s=await setup();const {db,ed,api,owner,admin,student,c,report,submission}=s;
 try{
  await s.verify();const sent=await ed.submit(owner,submission);await ed.admin(admin,'POST',{action:'review-submission',submissionId:sent.submissionId,digest:report.digest,status:'approved',confirmClinicalReview:true});
  // Simulate legacy records or two concurrent submissions that passed the same preflight.
  await db.query(`INSERT INTO clinic_library_submissions(id,class_id,submitted_by,content_digest,status,specialty,module,reviewed_by,reviewed_at)
   SELECT '11111111-1111-4111-8111-111111111111',class_id,submitted_by,content_digest,'approved',specialty,module,reviewed_by,reviewed_at FROM clinic_library_submissions WHERE id=$1`,[sent.submissionId]);
  await db.query(`INSERT INTO clinic_library_submissions(id,class_id,submitted_by,content_digest,status,specialty,module)
   SELECT '22222222-2222-4222-8222-222222222222',class_id,submitted_by,content_digest,'pending',specialty,module FROM clinic_library_submissions WHERE id=$1`,[sent.submissionId]);
  assert.equal((await ed.catalog()).classes.length,1);
  await ed.admin(admin,'POST',{action:'review-submission',submissionId:sent.submissionId,digest:report.digest,status:'rejected',notes:'Retirar esta versión completa.'});
  const rows=(await db.query('SELECT status,review_notes FROM clinic_library_submissions WHERE class_id=$1 AND content_digest=$2',[c.id,report.digest])).rows;
  assert.equal(rows.length,3);assert.ok(rows.every(r=>r.status==='rejected'&&r.review_notes==='Retirar esta versión completa.'));
  assert.equal((await ed.catalog()).classes.length,0);
  await assert.rejects(()=>ed.publicClass(c.id),e=>e.status===404);
  await assert.rejects(()=>api.handle(student,'POST','/api/account/classes',{action:'join-public',classId:c.id}),e=>e.status===404);
  await assert.rejects(()=>ed.admin(admin,'POST',{action:'review-submission',submissionId:'22222222-2222-4222-8222-222222222222',digest:report.digest,status:'approved',confirmClinicalReview:true}),e=>e.status===409);
 }finally{await db.close();}
});
