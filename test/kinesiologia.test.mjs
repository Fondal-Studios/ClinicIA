import test from 'node:test';
import assert from 'node:assert/strict';
import {kinesiologyCourses,kinesiologyCases,kinesiologySources} from '../public/learn/content/kinesiologia.mjs';
import {courses,questions,sources} from '../public/learn/courses.mjs';
import {cases,startCase,choose,advance,restoreCase} from '../public/learn/cases.mjs';
import {fresh,restore,answer,finishLesson,errorQuestions} from '../public/learn/engine.mjs';
import {createExam,restoreExam,selectExamAnswer,gradeExam} from '../public/learn/exams.mjs';
import {cleanProgress} from '../backend/accounts.mjs';
import {search,facets} from '../backend/library.mjs';
import {trainingCourses} from '../public/learn/content/capacitacion-catalog.mjs';

test('four adult physiotherapy courses are in healthcare, never in first-responder training',()=>{
 assert.equal(kinesiologyCourses.length,4);
 for(const c of kinesiologyCourses){
  assert.equal(c.category,'kinesiologia');assert.equal(c.pathway,'personal-sanitario');
  assert.equal(c.professionalCategory,'kinesiologos');assert.equal(c.language,'es');
  assert.ok(courses.includes(c));assert.ok(!trainingCourses.some(t=>t.id===c.id));
  assert.equal(c.lessons.length,5);assert.equal(c.lessons.flatMap(l=>l.questions).length,20);
  assert.ok(c.prerequisites&&c.scope&&c.reviewStatus.includes('pendiente'));
  assert.equal(c.outcomes.length,5);assert.equal(c.evidenceChecked,'2026-10-29');
 }
});

test('authored lessons, source citations and balanced question keys survive catalog integration',()=>{
 const prompts=new Set(),ids=new Set();
 for(const c of kinesiologyCourses){
  const keys=[0,0,0,0,0];
  for(const l of c.lessons){
   assert.ok(l.body.split(/\s+/).length>=130,l.id);assert.ok(l.body.includes('\n\n'));
   assert.ok(l.objective&&l.trap&&l.evidence);assert.equal(l.questions.length,4);
   assert.ok(l.simulation.scenario&&l.simulation.checklist.length>=4);
   assert.equal(l.simulation.required,false);
   for(const id of l.references)assert.ok(c.references.includes(id)&&sources[id]?.url.startsWith('https://'));
   for(const q of l.questions){
    assert.ok(!ids.has(q.id));ids.add(q.id);const p=q.prompt.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    assert.ok(!prompts.has(p));prompts.add(p);assert.equal(q.options.length,5);
    assert.equal(new Set(q.options).size,5);assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<5);
    assert.ok(q.why.length>=80,q.id);assert.ok(q.skill&&l.references.includes(q.source));
    assert.deepEqual(questions.find(item=>item.id===q.id).options,q.options);keys[q.answer]++;
   }
  }
  assert.deepEqual(keys,[4,4,4,4,4]);
 }
 assert.equal(ids.size,80);
 for(const r of Object.values(kinesiologySources)){assert.equal(r.checked,'2026-10-29');assert.ok(r.type&&r.section&&r.access&&r.year);}
});

test('clinical safety answer keys and citations preserve the intended distinctions',()=>{
 const expected={
  'kine-clinica-m2-q1':'Activar evaluación urgente por posible cauda equina',
  'kine-respiratoria-m3-q2':'Integra beneficios e incertidumbre para decidir',
  'kine-respiratoria-m5-q2':'Conservación de energía y pacing individualizado',
  'kine-uci-m1-q1':'Prueba voluntaria no interpretable en este momento',
  'kine-uci-m4-q2':'Aumentar esa estrategia no mejoró el desenlace principal',
  'kine-ventilacion-m2-q1':'360 mL por respiración',
  'kine-ventilacion-m2-q2':'El peso predicho de 65 kg',
  'kine-ventilacion-m4-q2':'Evitar en general la instilación rutinaria de salina',
  'kine-ventilacion-m4-q3':'Es un límite y puede requerirse interrumpir antes',
  'kine-ventilacion-m5-q1':'Requiere valorar seguridad de extubación además de la PRE',
  'kine-ventilacion-m5-q3':'Evaluar intolerancia y restituir soporte según protocolo'
 };
 for(const [id,expectedAnswer] of Object.entries(expected)){const q=questions.find(q=>q.id===id);assert.equal(q.options[q.answer],expectedAnswer,id);}
 assert.equal(questions.find(q=>q.id==='kine-uci-m4-q2').source,'kin-team');
 assert.equal(questions.find(q=>q.id==='kine-clinica-m1-q4').source,'kin-whodas');
});

test('each course supports isolated practice, cloud serialization, full examination and teacher search',()=>{
 const teacher={role:'student',modes:'student,teacher'};
 for(const c of kinesiologyCourses){
  let s=fresh();s.current=c.id;
  const l=c.lessons[0],q=l.questions[0];s=answer(s,q.id,false,0);
  assert.equal(errorQuestions(s,c.id).length,1);assert.equal(errorQuestions(s,'acls').length,0);
  s=answer(s,q.id,true,1);s.theoryRead[l.id]=true;
  s=finishLesson(s,c.id,l.id,l.questions.map(q=>({id:q.id,right:true})));
  s=restore(cleanProgress({state:s}).state);assert.equal(s.current,c.id);assert.equal(s.progress[c.id],1);assert.equal(s.theoryRead[l.id],true);
  let e=createExam(c.id+'-integral',1000,()=>.37);assert.equal(e.ids.length,20);assert.equal(new Set(e.ids).size,20);
  assert.equal(new Set(e.ids.map(id=>questions.find(q=>q.id===id).lessonId)).size,5);
  for(const [i,id] of e.ids.entries()){const q=questions.find(q=>q.id===id);assert.equal(q.courseId,c.id);e=selectExamAnswer(e,id,i<16?q.answer:(q.answer+1)%5,1001);}
  e=restoreExam(JSON.parse(JSON.stringify(e)));const r=gradeExam(e,2000);
  assert.equal(r.correct,16);assert.equal(r.total,20);assert.equal(r.omitted,0);assert.equal(r.courseId,c.id);
  s.examHistory=[r];s=cleanProgress({state:s}).state;assert.equal(s.examHistory[0].correct,16);
  assert.equal(search(teacher,{course:c.id}).total,20);assert.equal(search(teacher,{course:c.id,type:'theory'}).total,5);
  assert.equal(facets().courses.find(x=>x.id===c.id).questions,20);
 }
});

test('all four cases recover from each wrong answer and retain drafts',()=>{
 assert.equal(kinesiologyCases.length,4);
 for(const c of kinesiologyCases){
  assert.ok(cases.includes(c));assert.equal(c.steps.length,3);assert.ok(kinesiologyCourses.some(x=>x.id===c.courseId));
  for(const [n,step] of c.steps.entries()){
   assert.ok(sources[step.source]);assert.equal(step.options.length,5);
   for(let option=0;option<5;option++){
    let s=startCase(c.id);for(let i=0;i<n;i++)s=advance(choose(s,c.steps[i].answer));
    s=restoreCase(JSON.parse(JSON.stringify(choose(s,option))));assert.ok(s);assert.equal(s.feedback.right,option===step.answer);
    const next=advance(s);assert.equal(next.step,option===step.answer?Math.min(n+1,2):n);
   }
  }
 }
});
