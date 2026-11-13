import test from 'node:test';import assert from 'node:assert/strict';
import {nursingCourses,nursingCases,nursingSources} from '../public/learn/content/enfermeria.mjs';
import {nutritionCourses,nutritionCases,nutritionSources} from '../public/learn/content/nutricion.mjs';
import {gerMedCourses,gerMedCases} from '../public/learn/content/gerontologia-medicos.mjs';
import {gerNursingCourses,gerNursingCases} from '../public/learn/content/gerontologia-enfermeria.mjs';
import {gerKineCourses,gerKineCases} from '../public/learn/content/gerontologia-kinesiologia.mjs';
import {gerNutritionCourses,gerNutritionCases} from '../public/learn/content/gerontologia-nutricion.mjs';
import {courses,questions,sources} from '../public/learn/courses.mjs';
import {cases,startCase,choose,advance,restoreCase} from '../public/learn/cases.mjs';
import {fresh,restore,answer,finishLesson,errorQuestions} from '../public/learn/engine.mjs';
import {createExam,restoreExam,selectExamAnswer,gradeExam} from '../public/learn/exams.mjs';
import {cleanProgress} from '../backend/accounts.mjs';
import {search,facets} from '../backend/library.mjs';
import {trainingCourses} from '../public/learn/content/capacitacion-catalog.mjs';
const gerCourses=[...gerMedCourses,...gerNursingCourses,...gerKineCourses,...gerNutritionCourses],gerCases=[...gerMedCases,...gerNursingCases,...gerKineCases,...gerNutritionCases];
const allCourses=[...nursingCourses,...nutritionCourses,...gerCourses],allCases=[...nursingCases,...nutritionCases,...gerCases];
const groups=[['enfermeria',nursingCourses,nursingCases,nursingSources],['nutricionistas',nutritionCourses,nutritionCases,nutritionSources]];
test('nursing (emergencies) and nutrition (obesity, fat metabolism) each have two integrated courses outside first-responder training',()=>{
 for(const [pro,list,cs,src] of groups){
  assert.equal(list.length,2);assert.equal(cs.length,2);
  for(const c of list){
   assert.equal(c.pathway,'personal-sanitario');assert.equal(c.professionalCategory,pro);assert.equal(c.language,'es');
   assert.ok(courses.includes(c));assert.ok(!trainingCourses.some(t=>t.id===c.id));assert.equal(c.lessons.length,5);
   assert.equal(c.lessons.flatMap(l=>l.questions).length,20);assert.ok(c.reviewStatus.includes('pendiente')&&c.scope&&c.prerequisites);
   assert.equal(c.evidenceChecked,'2026-11-13');assert.equal(c.outcomes.length,5);
  }
  for(const id of Object.keys(src))assert.ok(sources[id]&&sources[id].url.startsWith('https://')&&sources[id].checked==='2026-11-13');
 }
});
test('question keys are balanced, prompts unique across the whole bank and every citation resolves',()=>{
 const seen=new Set(questions.map(q=>q.id));assert.equal(seen.size,questions.length,'question ids unique');
 const newOnes=allCourses;
 for(const c of newOnes){const keys=[0,0,0,0,0];for(const l of c.lessons)for(const q of l.questions){keys[q.answer]++;assert.equal(q.options.length,5);assert.equal(new Set(q.options).size,5);assert.ok(q.why.length>=80);for(const r of q.references)assert.ok(sources[r],r);}assert.deepEqual(keys,[4,4,4,4,4],c.id);}
 const prompts=questions.map(q=>q.prompt.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase());
 for(const c of newOnes)for(const q of c.lessons.flatMap(l=>l.questions)){const p=q.prompt.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();assert.equal(prompts.filter(x=>x===p).length,1,'duplicate prompt '+q.id);}
});
test('each new course supports isolated practice, cloud serialization, a full 20-question exam and teacher search',()=>{
 const teacher={role:'student',modes:'student,teacher'};
 for(const c of allCourses){
  let s=fresh();s.current=c.id;const l=c.lessons[0],q=l.questions[0];s=answer(s,q.id,false,0);
  assert.equal(errorQuestions(s,c.id).length,1);assert.equal(errorQuestions(s,'acls').length,0);
  s=answer(s,q.id,true,1);s.theoryRead[l.id]=true;s=finishLesson(s,c.id,l.id,l.questions.map(x=>({id:x.id,right:true})));
  s=restore(cleanProgress({state:s}).state);assert.equal(s.current,c.id);assert.equal(s.progress[c.id],1);
  let e=createExam(c.id+'-integral',1000,()=>.37);assert.equal(e.ids.length,20);assert.equal(new Set(e.ids).size,20);
  assert.equal(new Set(e.ids.map(id=>questions.find(x=>x.id===id).lessonId)).size,5);
  for(const [i,id] of e.ids.entries()){const x=questions.find(y=>y.id===id);assert.equal(x.courseId,c.id);e=selectExamAnswer(e,id,i<16?x.answer:(x.answer+1)%5,1001);}
  e=restoreExam(JSON.parse(JSON.stringify(e)));const r=gradeExam(e,2000);assert.equal(r.correct,16);assert.equal(r.total,20);assert.equal(r.courseId,c.id);
  assert.equal(search(teacher,{course:c.id}).total,20);assert.equal(search(teacher,{course:c.id,type:'theory'}).total,5);assert.equal(facets().courses.find(x=>x.id===c.id).questions,20);
 }
});
test('all four new cases recover from each wrong answer',()=>{
 for(const c of [...nursingCases,...nutritionCases]){
  assert.ok(cases.includes(c));assert.equal(c.steps.length,3);
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
test('five gerontology courses exist: two for physicians, one each for nursing, kinesiology and nutrition, in the right professional tracks',()=>{
 assert.equal(gerMedCourses.length,2);assert.equal(gerNursingCourses.length,1);assert.equal(gerKineCourses.length,1);assert.equal(gerNutritionCourses.length,1);
 assert.deepEqual(gerMedCourses.map(c=>c.professionalCategory),['medicos','medicos']);
 assert.equal(gerNursingCourses[0].category,'enfermeria');assert.equal(gerKineCourses[0].category,'kinesiologia');assert.equal(gerNutritionCourses[0].category,'nutricion');
 for(const c of gerCourses){assert.ok(courses.includes(c));assert.equal(c.lessons.flatMap(l=>l.questions).length,20);assert.ok(c.reviewStatus.includes('pendiente'));}
 assert.equal(gerCases.length,5);
});
