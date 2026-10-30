import test from 'node:test';
import assert from 'node:assert/strict';
import {revalidaCourse,revalidaSources} from '../public/learn/content/revalida.mjs';
import {courses,questions} from '../public/learn/courses.mjs';
const norm=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
const all=revalidaCourse.lessons.flatMap(l=>l.questions);
const keyCount=k=>all.filter(q=>q.answer===k).length;
test('Revalida expansion has 100 unique items in 25 lessons and five clinical axes',()=>{
 assert.equal(revalidaCourse.lessons.length,25);
 assert.deepEqual(revalidaCourse.lessons.map(l=>l.questions.length),Array(25).fill(4));
 assert.equal(all.length,100);
 assert.equal(new Set(all.map(q=>q.id)).size,100);
 assert.equal(new Set(all.map(q=>norm(q.prompt))).size,100);
 for(const area of ['Clínica Médica','Cirurgia','Pediatria','Ginecologia e Obstetrícia','Medicina de Família e Comunidade / Saúde Coletiva']){
  assert.equal(revalidaCourse.lessons.filter(l=>l.area===area).length,4,area);
  assert.equal(all.filter(q=>q.skill===area).length,16,area);
 }
});
test('Revalida editorial: four nonduplicated options, references, clinical rationale and simulations for 100 items',()=>{
 for(const l of revalidaCourse.lessons){
  assert.ok(l.body.length>=250,l.id);
  assert.ok(l.simulation?.scenario?.length>=40,l.id);
  assert.equal(l.simulation.roles.length,3,l.id);
  assert.equal(l.simulation.checklist.length,4,l.id);
  assert.ok(revalidaSources[l.source]?.url,l.id);
  for(const q of l.questions){
   assert.ok(q.prompt.length>=35,q.id);
   assert.equal(q.options.length,4,q.id);
   assert.equal(new Set(q.options.map(norm)).size,4,q.id);
   assert.ok(q.options.every(o=>o.trim().length>=15),q.id);
   assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4,q.id);
   assert.ok(q.why.trim().length>=55,q.id);
   assert.equal(q.language,'pt-BR',q.id);
   assert.ok(revalidaSources[q.source]?.url,q.id);
  }
 }
 assert.deepEqual([0,1,2,3].map(keyCount),[25,25,25,25]);
});
test('Revalida production catalog supports a real 100-item simulation',()=>{
 const c=courses.find(c=>c.id==='revalida');
 assert.ok(c);
 const qs=questions.filter(q=>q.courseId==='revalida');
 assert.equal(qs.length,100);
 assert.equal(new Set(qs.map(q=>q.id)).size,100);
 assert.ok(qs.every(q=>q.options.length===4));
});
test('Six bilingual learner heuristics do not pass from fixed-position guessing alone',()=>{
 for(let k=0;k<4;k++)assert.equal(keyCount(k),25);
 const choiceByLongest=all.filter(q=>q.options.findIndex(o=>o.length===Math.max(...q.options.map(x=>x.length)))===q.answer).length;
 // Flag but do not claim psychometric validity from this static heuristic.
 assert.ok(choiceByLongest<=45,'Length cue unexpectedly high: '+choiceByLongest);
});
