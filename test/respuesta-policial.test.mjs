import test from 'node:test';
import assert from 'node:assert/strict';
import {courses,questions,sources} from '../public/learn/courses.mjs';
import {createExam,gradeExam,restoreExam,selectExamAnswer,examTemplates} from '../public/learn/exams.mjs';
import {fresh,restore} from '../public/learn/engine.mjs';
const c=courses.find(c=>c.id==='respuesta-policial');
test('police course has fifty unique original questions and simulations for all modules',()=>{
 assert.equal(c.lessons.length,10);
 const qs=questions.filter(q=>q.courseId===c.id);assert.equal(qs.length,50);assert.equal(new Set(qs.map(q=>q.prompt)).size,50);
 assert.equal(c.lessons.filter(l=>l.simulation.required).length,3);
 for(const l of c.lessons){assert.equal(l.simulation.roles.length,3);assert.ok(l.simulation.checklist.length);assert.ok(sources[l.source]);}
 assert.equal(c.institutionalCertificate,true);
});
test('police final is 50 questions in 60 minutes, restores answers and grades threshold correctly',()=>{
 const template=examTemplates.find(t=>t.id===c.id+'-integral');assert.equal(template.count,50);assert.equal(template.minutes,60);
 for(const correct of [39,40,50]){
  let e=createExam(template.id,1000);
  for(const [i,id] of e.ids.entries()){const q=questions.find(q=>q.id===id);e=selectExamAnswer(e,id,i<correct?q.answer:(q.answer+1)%5,2000);}
  e=restoreExam(JSON.parse(JSON.stringify(e)));const r=gradeExam(e,3000);
  assert.equal(r.correct,correct);assert.equal(r.omitted,0);assert.equal(r.correct/r.total>=0.8,correct>=40);
 }
});
test('subsequent failed attempts preserve prior academic approval in restored history',()=>{
 let e=createExam(c.id+'-integral',1000);for(const id of e.ids)e=selectExamAnswer(e,id,questions.find(q=>q.id===id).answer,2000);
 const pass=gradeExam(e,3000),fail=gradeExam(createExam(c.id+'-integral',4000),5000);
 const state=restore({...fresh(),current:c.id,examHistory:[fail,pass]});
 assert.equal(state.current,c.id);assert.ok(state.examHistory.some(r=>r.correct/r.total>=0.8));assert.equal(state.examHistory.length,2);
});
