import test from 'node:test';import assert from 'node:assert/strict';import {PGlite} from '@electric-sql/pglite';
import {schema} from '../backend/accounts.mjs';import {classSchema,createClasses,cleanClass} from '../backend/classes.mjs';
const q=n=>({prompt:'Pregunta '+n,options:['a'+n,'b'+n,'c'+n,'d'+n,'e'+n],answer:n%5,why:'Porque '+n,sources:['W1','W9']});
const draft=()=>({title:'Glomerulopatías',summary:'Resumen',objectives:['Distinguir síndrome nefrítico de nefrótico'],status:'borrador-ia',
 sections:[{heading:'Nefrótico',body:'Proteinuria masiva.\n\nEdema.',sources:['W1']}],slides:[{title:'Nefrótico',bullets:['Proteinuria >3,5 g/día'],notes:'Decir',sources:['W1']}],
 questions:[1,2,3,4,5].map(q),case:{scenario:'Paciente ficticio con edema.',question:q(6)},game:{pairs:[1,2,3,4].map(n=>({term:'T'+n,definition:'D'+n}))},
 sources:[{id:'W1',provider:'MedlinePlus (NLM)',kind:'x',title:'Glomerulopatía',url:'https://medlineplus.gov/a',meta:''},{id:'W2',provider:'X',title:'malo',url:'javascript:alert(1)'}]});
test('cleanClass enforces shape, https-only links and valid references',()=>{
 const c=cleanClass(draft());
 assert.equal(c.sources.length,1);assert.deepEqual(c.questions[0].sources,['W1']);assert.ok(c.questions.every(x=>/^q[a-f0-9]{8}$/.test(x.id)));assert.equal(c.origin,'ia');assert.ok(c.case&&c.game);
 const bad=draft();bad.questions=[{...q(1),options:['a','a','b','c','d']},{...q(2),answer:7},{prompt:'x'}];assert.equal(cleanClass(bad).questions.length,0);
 assert.throws(()=>cleanClass({...draft(),title:''}),e=>e.status===400);assert.throws(()=>cleanClass(null),e=>e.status===400);
 const dup=draft();const first=cleanClass(dup);dup.questions=[first.questions[0],first.questions[0]];assert.notEqual(cleanClass(dup).questions[1].id,first.questions[0].id);
});
test('teacher creates, edits, publishes; students join by code, take exams graded on the server and the teacher sees progress',async()=>{
 const db=new PGlite();await db.exec(schema+classSchema);
 await db.query("INSERT INTO clinic_users(id,username,username_key,password_hash,recovery_hash) VALUES('t','Profe','profe','h','h'),('s1','Ana','ana','h','h'),('s2','Beto','beto','h','h'),('c','Colab','colab','h','h'),('x','Otro','otro','h','h')");
 const u=id=>({id,username:id}),calls=[];
 const ai={buildClass:async b=>({title:'IA '+b.brief}),regenerateItem:async a=>{calls.push(a);return {item:{prompt:'nueva'},sources:[]};}};
 const api=createClasses({db,ai}),T=u('t'),S1=u('s1'),S2=u('s2'),C=u('c'),X=u('x');
 try{
  const created=await api.handle(T,'POST','/api/account/classes',{action:'create',content:draft()});
  assert.equal(created.status,'draft');assert.equal(created.passPct,80);assert.match(created.studentCode,/^[A-HJ-NP-Z2-9]{8}$/);assert.notEqual(created.studentCode,created.editorCode);assert.equal(created.ready,true);
  const base='/api/account/classes/'+created.id;
  // students cannot join a draft; outsiders cannot read it
  await assert.rejects(()=>api.handle(S1,'POST','/api/account/classes',{action:'join',code:created.studentCode,accepted:true}),e=>e.status===409);
  await assert.rejects(()=>api.handle(X,'GET',base,{}),e=>e.status===404);
  await assert.rejects(()=>api.handle(S1,'POST','/api/account/classes',{action:'join',code:created.studentCode}),e=>e.status===400);
  // collaborator joins with the editor code and can edit but not publish, rotate or change the pass mark
  const colab=await api.handle(C,'POST','/api/account/classes',{action:'join',code:created.editorCode.toLowerCase(),accepted:true});assert.equal(colab.role,'editor');assert.equal(colab.editorCode,undefined);
  const edited=cleanClass(created.content);edited.title='Glomerulopatías (v2)';
  const saved=await api.handle(C,'POST',base,{action:'save',version:created.version,content:edited,passPct:50});assert.equal(saved.title,'Glomerulopatías (v2)');assert.equal(saved.passPct,80);
  await assert.rejects(()=>api.handle(C,'POST',base,{action:'save',version:created.version,content:edited}),e=>e.status===409);
  await assert.rejects(()=>api.handle(C,'POST',base,{action:'publish'}),e=>e.status===403);
  const owner=await api.handle(T,'POST',base,{action:'save',version:saved.version,content:saved.content,passPct:70,dueAt:'2026-10-20T12:00:00Z'});assert.equal(owner.passPct,70);
  await api.handle(T,'POST',base,{action:'save',version:owner.version,content:saved.content,passPct:80});
  // publish requires enough questions
  const thin=cleanClass(saved.content);thin.questions=thin.questions.slice(0,2);thin.case=null;
  const cur=await api.handle(T,'GET',base,{});const thinSaved=await api.handle(T,'POST',base,{action:'save',version:cur.version,content:thin});
  await assert.rejects(()=>api.handle(T,'POST',base,{action:'publish'}),e=>e.status===409);
  await api.handle(T,'POST',base,{action:'save',version:thinSaved.version,content:saved.content});
  const validation=await api.handle(T,'POST',base,{action:'validate'});assert.equal(validation.passed,true);await assert.rejects(()=>api.handle(T,'POST',base,{action:'publish'}),e=>e.status===409);await api.handle(T,'POST',base,{action:'approve-review',digest:validation.digest,confirmClinicalReview:true});assert.equal((await api.handle(T,'POST',base,{action:'publish',digest:validation.digest})).status,'published');
  // student view hides every answer
  const joined=await api.handle(S1,'POST','/api/account/classes',{action:'join',code:created.studentCode,accepted:true});assert.equal(joined.role,'student');
  const sv=await api.handle(S1,'GET',base,{});assert.equal(sv.content.questions,undefined);assert.equal(sv.content.case.question,undefined);assert.equal(sv.content.questionCount,6);assert.ok(!JSON.stringify(sv).includes('"answer"')&&!JSON.stringify(sv).includes(created.editorCode));
  await assert.rejects(()=>api.handle(S1,'POST',base,{action:'save',version:1,content:edited}),e=>e.status===403);
  await assert.rejects(()=>api.handle(S1,'GET',base+'/progress',{}),e=>e.status===403);
  // exam: all wrong first, then all right
  const answerKey=Object.fromEntries(draft().questions.map(x=>[x.prompt,x.options[x.answer]]));answerKey['Paciente ficticio con edema. — Pregunta 6']=q(6).options[q(6).answer];
  let ex=await api.handle(S1,'POST',base,{action:'start',kind:'exam'});assert.equal(ex.questions.length,6);assert.ok(ex.questions.every(x=>x.options.length===5&&!('answer' in x)));
  await assert.rejects(()=>api.handle(S1,'POST',base,{action:'submit',attemptId:ex.attemptId,answers:[0]}),e=>e.status===400);
  const pick=(attempt,right)=>attempt.questions.map(x=>{const correct=answerKey[x.prompt];const i=x.options.indexOf(correct);return right?i:(i+1)%5;});
  let res=await api.handle(S1,'POST',base,{action:'submit',attemptId:ex.attemptId,answers:pick(ex,false)});assert.equal(res.pct,0);assert.equal(res.passed,false);
  assert.deepEqual(await api.handle(S1,'POST',base,{action:'submit',attemptId:ex.attemptId,answers:pick(ex,true)}),res,'resubmitting never changes a graded attempt');
  ex=await api.handle(S1,'POST',base,{action:'start',kind:'exam'});res=await api.handle(S1,'POST',base,{action:'submit',attemptId:ex.attemptId,answers:pick(ex,true)});assert.equal(res.pct,100);assert.equal(res.passed,true);assert.ok(res.rows.every(r=>r.why));
  // a practice run never counts as approval
  const pr=await api.handle(S2,'POST','/api/account/classes',{action:'join',code:created.studentCode,accepted:true});assert.equal(pr.passed,false);
  const p=await api.handle(S2,'POST',base,{action:'start',kind:'practice'});await api.handle(S2,'POST',base,{action:'submit',attemptId:p.attemptId,answers:pick(p,true)});
  await assert.rejects(()=>api.handle(S1,'POST',base,{action:'submit',attemptId:p.attemptId,answers:pick(p,true)}),e=>e.status===404);
  const prog=await api.handle(T,'GET',base+'/progress',{});const by=Object.fromEntries(prog.members.map(m=>[m.name,m]));
  assert.equal(by.Ana.best,100);assert.equal(by.Ana.passed,true);assert.equal(by.Ana.exams,2);assert.equal(by.Beto.passed,false);assert.equal(by.Beto.practices,1);assert.equal(by.Beto.best,null);
  assert.equal((await api.handle(S1,'GET','/api/account/classes',{})).classes[0].passed,true);
  assert.equal((await api.handle(T,'GET','/api/account/classes',{})).classes[0].members,2);
  // editing questions after publication does not corrupt an open attempt
  const open=await api.handle(S2,'POST',base,{action:'start',kind:'exam'});const live=await api.handle(T,'GET',base,{});const trimmed=cleanClass(live.content);trimmed.questions=trimmed.questions.slice(0,3);
  await api.handle(T,'POST',base,{action:'save',version:live.version,content:trimmed});
  assert.equal((await api.handle(S2,'POST',base,{action:'submit',attemptId:open.attemptId,answers:pick(open,true)})).total,6);
  // unpublish locks students out; owner-only controls
  await assert.rejects(()=>api.handle(S1,'POST',base,{action:'rotate-codes'}),e=>e.status===403);
  const rotated=await api.handle(T,'POST',base,{action:'rotate-codes'});assert.notEqual(rotated.studentCode,created.studentCode);
  await assert.rejects(()=>api.handle(X,'POST','/api/account/classes',{action:'join',code:created.studentCode,accepted:true}),e=>e.status===404);
  await api.handle(T,'POST',base,{action:'unpublish'});await assert.rejects(()=>api.handle(S1,'GET',base,{}),e=>e.status===409);assert.equal((await api.handle(S1,'GET','/api/account/classes',{})).classes.length,0);
  await api.handle(T,'POST',base,{action:'remove-member',userId:'s2'});assert.equal((await api.handle(T,'GET',base+'/progress',{})).members.length,2);
  // AI helpers: drafting needs no class; regeneration only where the user can edit
  assert.equal((await api.generate(T,{action:'draft',brief:'x'})).class.title,'IA x');
  await api.generate(C,{action:'regenerate',classId:created.id,kind:'question',item:{},instruction:'más difícil',sourceIds:['W7']});assert.equal(calls[0].idStart,8);
  await assert.rejects(()=>api.generate(X,{action:'regenerate',classId:created.id,kind:'question'}),e=>e.status===404);
  await assert.rejects(()=>api.handle(T,'POST',base,{action:'delete'}),e=>e.status===400);
  assert.deepEqual(await api.handle(T,'POST',base,{action:'delete',confirm:true}),{deleted:true});assert.equal((await db.query('SELECT count(*)::int AS n FROM clinic_class_attempts')).rows[0].n,0);
 }finally{await db.close();}
});

test('editorial review requires owner attestation of the saved digest and never publishes a stale version',async()=>{
 const db=new PGlite();await db.exec(schema+classSchema);
 await db.query("INSERT INTO clinic_users(id,username,username_key,password_hash,recovery_hash) VALUES('owner','Owner','owner','h','h'),('editor','Editor','editor','h','h'),('student','Student','student','h','h'),('outsider','Outsider','outsider','h','h')");
 let intercept=null;
 const guardedDb={query:async(sql,args)=>{if(intercept&&intercept.match(sql)){const f=intercept;intercept=null;await f.run();}return db.query(sql,args);}};
 const api=createClasses({db:guardedDb,ai:{}}),owner={id:'owner'},editor={id:'editor'},student={id:'student'};
 try{
  const created=await api.handle(owner,'POST','/api/account/classes',{action:'create',content:draft()}),base='/api/account/classes/'+created.id;
  const call=(action,extra={},user=owner)=>api.handle(user,'POST',base,{action,...extra});
  const current=()=>api.handle(owner,'GET',base,{});
  await api.handle(editor,'POST','/api/account/classes',{action:'join',code:created.editorCode,accepted:true});
  let report=await call('validate');assert.equal(report.version,created.version);assert.equal(report.approved,false);
  await assert.rejects(()=>call('approve-review',{confirmClinicalReview:true}),e=>e.status===409);
  await assert.rejects(()=>call('approve-review',{digest:report.digest}),e=>e.status===400);
  await assert.rejects(()=>call('publish',{digest:report.digest}),e=>e.status===409);
  for(const action of ['validate','approve-review','publish']){
   await assert.rejects(()=>call(action,{digest:report.digest,confirmClinicalReview:true},editor),e=>e.status===403);
   await assert.rejects(()=>call(action,{digest:report.digest,confirmClinicalReview:true},{id:'outsider'}),e=>e.status===404);
  }
  await call('approve-review',{digest:report.digest,confirmClinicalReview:true});
  assert.equal((await call('validate')).approved,true);
  // Repeated owner attestation is idempotent and does not publish by itself.
  await call('approve-review',{digest:report.digest,confirmClinicalReview:true});assert.equal((await current()).status,'draft');
  await call('publish',{digest:report.digest});
  await api.handle(student,'POST','/api/account/classes',{action:'join',code:created.studentCode,accepted:true});
  for(const action of ['validate','approve-review','publish'])await assert.rejects(()=>call(action,{digest:report.digest,confirmClinicalReview:true},student),e=>e.status===403);
  // Saving unchanged JSON content does not withdraw an approved published class.
  let c=await current();c=await call('save',{version:c.version,content:c.content,passPct:75});assert.equal(c.status,'published');assert.equal((await call('validate')).approved,true);
  const oldDigest=report.digest,changed=structuredClone(c.content);changed.sections[0].body+=' Nueva explicación.';
  c=await call('save',{version:c.version,content:changed},editor);assert.equal(c.status,'draft');report=await call('validate');assert.equal(report.approved,false);assert.notEqual(report.digest,oldDigest);
  await assert.rejects(()=>call('publish',{digest:oldDigest}),e=>e.status===409);
  await assert.rejects(()=>call('approve-review',{digest:oldDigest,confirmClinicalReview:true}),e=>e.status===409);
  await assert.rejects(()=>call('publish',{digest:report.digest}),e=>e.status===409);
  await assert.rejects(()=>api.handle(student,'GET',base,{}),e=>e.status===409);
  await assert.rejects(()=>call('start',{kind:'exam'},student),e=>e.status===409);
  await assert.rejects(()=>call('submit',{attemptId:'00000000-0000-0000-0000-000000000000',answers:[]},student),e=>e.status===404);
  // Structural failure cannot be acknowledged away.
  const invalid=structuredClone(c.content);invalid.objectives=[];c=await call('save',{version:c.version,content:invalid});report=await call('validate');assert.equal(report.passed,false);
  await assert.rejects(()=>call('approve-review',{digest:report.digest,confirmClinicalReview:true}),e=>e.status===409);
  await assert.rejects(()=>call('publish',{digest:report.digest}),e=>e.status===409);
  c=await call('save',{version:c.version,content:changed});report=await call('validate');
  const concurrentSave=()=>db.query("UPDATE clinic_classes SET content=jsonb_set(content,'{summary}',to_jsonb('Concurrent update'::text)),version=version+1,status='draft' WHERE id=$1",[created.id]);
  // Simulate a save after the handler read but before the review's guarded write.
  intercept={match:sql=>sql.startsWith('WITH reviewed AS'),run:concurrentSave};
  await assert.rejects(()=>call('approve-review',{digest:report.digest,confirmClinicalReview:true}),e=>e.status===409);
  report=await call('validate');assert.equal(report.approved,false);
  await call('approve-review',{digest:report.digest,confirmClinicalReview:true});
  // Same race at publication must leave the changed class as draft.
  intercept={match:sql=>sql.startsWith("UPDATE clinic_classes SET status='published'"),run:()=>db.query("UPDATE clinic_classes SET content=jsonb_set(content,'{summary}',to_jsonb('Another change'::text)),version=version+1,status='draft' WHERE id=$1",[created.id])};
  await assert.rejects(()=>call('publish',{digest:report.digest}),e=>e.status===409);
  assert.equal((await current()).status,'draft');assert.equal((await call('validate')).approved,false);
 }finally{await db.close();}
});
