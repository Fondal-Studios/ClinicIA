import test from 'node:test';import assert from 'node:assert/strict';
import {progression,reinforcementQuestions} from '../public/learn/progression.mjs';
import {fresh,answer,restore,finishLesson} from '../public/learn/engine.mjs';
import {courses,questions} from '../public/learn/courses.mjs';
import {cases} from '../public/learn/cases.mjs';
import {createExam,restoreExam,gradeExam} from '../public/learn/exams.mjs';

test('learning XP rewards unique concepts and persists without farming retries or spending points',()=>{
 let s=fresh();const qs=questions.filter(q=>q.courseId===s.current),q=qs[0];
 assert.equal(progression(s).level,1);
 s=answer(s,q.id,false,0);assert.equal(progression(s).xp,0);
 s=answer(s,q.id,true,1);assert.equal(progression(s).xp,10);
 for(let i=0;i<20;i++)s=answer(s,q.id,true,i+2);
 assert.equal(progression(s).xp,10);
 for(const q of qs.slice(1,10))s=answer(s,q.id,true,30);
 assert.equal(progression(s).level,2);assert.equal(progression(s).xp,100);
 const before=progression(s);s.wallet.owned=['ynara'];assert.equal(progression(s).xp,before.xp);
 assert.deepEqual(progression(restore(JSON.parse(JSON.stringify(s)))),before);
 assert.equal(progression(s,'pals').xp,0);
});
test('lessons and case completion reward once and missions remain complete after later mistakes',()=>{
 let s=fresh();const c=courses.find(c=>c.id===s.current),l=c.lessons[0],scenario=cases.find(c=>c.courseId===s.current);
 s=finishLesson(s,c.id,l.id,l.questions.map(q=>({id:q.id,right:true})));s.cases[scenario.id]=true;
 assert.equal(progression(s).xp,55);
 s=finishLesson(s,c.id,l.id,l.questions.map(q=>({id:q.id,right:true})));assert.equal(progression(s).xp,55);
 const q=l.questions[0];s=answer(s,q.id,true);s=answer(s,q.id,false);
 assert.equal(progression(s).badges[0].earned,true);assert.equal(progression(s).xp,65);
 assert.ok(progression(s).missions.find(m=>m.id==='case').done);
});
test('adaptive exam prioritizes errors, stays in its course and restores exact question and option order',()=>{
 for(const c of courses){let s=fresh();s.current=c.id;const qs=questions.filter(q=>q.courseId===c.id),q=qs.at(-1);
 s=answer(s,q.id,false,0);const items=reinforcementQuestions(s,c.id,10,()=>.3);
 assert.equal(items[0].id,q.id);assert.equal(new Set(items.map(q=>q.id)).size,10);
 const e=createExam(c.id+'-refuerzo',1000,()=>.3,s);assert.equal(e.ids[0],q.id);
 assert.ok(e.ids.every(id=>qs.some(q=>q.id===id)));assert.deepEqual(restoreExam(JSON.parse(JSON.stringify(e))),e);
 const result=gradeExam(e,e.deadline);assert.equal(result.omitted,10);assert.equal(result.correct,0);
 }
});
test('all progression missions are finite and attainable in every course',()=>{
 const s=fresh();for(const q of questions)s.evidence[q.id]={correct:1,total:1};for(const c of courses)for(const l of c.lessons)s.passedLessons[l.id]=true;for(const c of cases)s.cases[c.id]=true;
 for(const c of courses){const p=progression(s,c.id);assert.ok(p.missions.every(m=>m.done&&m.target>0));assert.ok(p.badges.every(b=>b.earned));assert.ok(p.areas.every(a=>a.accuracy===100));}
});
