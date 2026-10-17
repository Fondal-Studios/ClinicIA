import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,restore,answer,finishLesson} from '../public/learn/engine.mjs';
import {progression,learningPath} from '../public/learn/progression.mjs';
import {studyPlan} from '../public/learn/study-plan.mjs';
import {courses,questions} from '../public/learn/courses.mjs';
import {cleanProgress} from '../backend/accounts.mjs';
import {BANK_REVISION,createExam,gradeExam} from '../public/learn/exams.mjs';
import {cases} from '../public/learn/cases.mjs';
const DAY=86400000;

test('immediate retries cannot move a review date, inflate retention, or earn spaced credit',()=>{
 const id=questions[0].id;let s=answer(fresh(),id,true,0);
 for(let i=1;i<100;i++)s=answer(s,id,true,i);
 assert.deepEqual(s.reviews[id],{level:1,due:DAY,spaced:0});
 s=answer(s,id,true,DAY);assert.deepEqual(s.reviews[id],{level:2,due:4*DAY,spaced:1});
 s=answer(s,id,true,2*DAY);assert.equal(s.reviews[id].due,4*DAY);
 s=answer(s,id,true,4*DAY);assert.equal(learningPath(s).retained,1);
 s=answer(s,id,false,4*DAY+1);assert.equal(learningPath(s).retained,0);
 s=answer(s,id,true,4*DAY+2);assert.equal(s.reviews[id].spaced,0);
 assert.deepEqual(restore(s).reviews,s.reviews);
 assert.equal(answer(s,id,true,NaN),s);
 const legacy=restore({...fresh(),reviews:{[id]:{level:5,due:DAY}}});
 assert.equal(learningPath(legacy).retained,0,'legacy review levels do not prove spaced retention');
});

test('a complete guided route is achievable in every course and has no impossible XP target',()=>{
 for(const c of courses){let s=fresh();s.current=c.id;
  for(const l of c.lessons){let next=learningPath(s,c.id,0).next;assert.equal(next.id,l.id);assert.equal(next.action,'theory');
   s.theoryRead[l.id]=true;assert.equal(learningPath(s,c.id,0).next.action,'lesson');
   for(const q of l.questions)s=answer(s,q.id,true,0);
   s=finishLesson(s,c.id,l.id,l.questions.map(q=>({id:q.id,right:true})));
   s=cleanProgress({state:s}).state;
  }
  const path=learningPath(s,c.id,0);assert.ok(path.chapters.every(c=>c.passed===c.total));assert.equal(path.retained,0);
  assert.equal(learningPath(s,c.id,DAY).next.action,'review');
  for(const scenario of cases.filter(x=>x.courseId===c.id))s.cases[scenario.id]=true;
  const p=progression(s);assert.equal(p.atCap,true);assert.equal(p.toNext,0);assert.equal(p.xp,p.maxXP);
 }
});

test('44 synthetic learners across eleven courses complete 30 days without duplicate XP or cross-course progress',()=>{
 let responses=0;
 for(const c of courses)for(const profile of ['steady','struggling','retry','returning']){
  let s=fresh();s.current=c.id;let oldXP=0;
  for(let day=0;day<30;day++){
   if(profile==='returning'&&day%3!==0)continue;
   const now=day*DAY,plan=studyPlan(s,c.id,now);
   assert.equal(new Set(plan.ids).size,plan.ids.length);
   for(const [i,id] of plan.ids.entries()){
    assert.equal(questions.find(q=>q.id===id).courseId,c.id);
    const right=profile!=='struggling'||(day+i)%3===0;
    s=answer(s,id,right,now);responses++;
    if(profile==='retry'){const before={...s.reviews[id]},xp=progression(s).xp;s=answer(s,id,true,now+1);responses++;assert.deepEqual(s.reviews[id],before);assert.equal(progression(s).xp,xp);}
   }
   const xp=progression(s).xp;assert.ok(xp>=oldXP);oldXP=xp;
   const cloud=cleanProgress({state:s}).state;assert.deepEqual(cloud.evidence,s.evidence);assert.deepEqual(cloud.reviews,s.reviews);s=cloud;
   assert.equal(progression(s,courses.find(other=>other.id!==c.id).id).xp,0);
  }
  assert.ok(Object.keys(s.evidence).length>=10);
 }
 assert.equal(responses,courses.length*650);
});

test('cloud sync keeps old exam scores when answer keys change and rejects duplicate history rows',()=>{
 const exam=createExam('sprint',1000,()=>.5),result=gradeExam(exam,2000),q=questions.find(q=>q.id===result.rows[0].id);
 result.bankRevision=BANK_REVISION-1;
 // The current correct option was marked wrong in the historical bank.
 result.rows[0]={...result.rows[0],selected:q.answer,right:false,omitted:false};
 let s=fresh();s.examHistory=[result];
 let saved=cleanProgress({state:s}).state;assert.equal(saved.examHistory[0].correct,0);assert.equal(saved.examHistory[0].rows[0].right,false);
 saved=cleanProgress({state:saved}).state;assert.equal(saved.examHistory[0].correct,0);
 s.examHistory=[{...result,bankRevision:BANK_REVISION}];assert.equal(cleanProgress({state:s}).state.examHistory[0].correct,1);
 s.examHistory=[{...result,rows:result.rows.map(()=>result.rows[0])}];assert.equal(cleanProgress({state:s}).state.examHistory.length,0);
});
