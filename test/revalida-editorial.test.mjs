import test from 'node:test';
import assert from 'node:assert/strict';
import {revalidaCourse,revalidaSources} from '../public/learn/content/revalida.mjs';
import {courses,questions} from '../public/learn/courses.mjs';
const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/\\s+/g,' ').trim();
test('Revalida: exactly twenty distinct items across five themes',()=>{
 assert.equal(revalidaCourse.lessons.length,5);
 assert.deepEqual(revalidaCourse.lessons.map(l=>l.questions.length),[4,4,4,4,4]);
 assert.equal(revalidaCourse.lessons.flatMap(l=>l.questions).length,20);
 assert.equal(new Set(revalidaCourse.lessons.flatMap(l=>l.questions.map(q=>q.id))).size,20);
 assert.equal(new Set(revalidaCourse.lessons.flatMap(l=>l.questions.map(q=>normalize(q.prompt)))).size,20);
});
test('Revalida: each item has four unique alternatives, a valid key and explanation',()=>{
 const keys=[0,0,0,0];
 for(const l of revalidaCourse.lessons){
  assert.ok(l.body.length>400,l.id);
  assert.ok(l.body.includes('Caso guiado:'),l.id);
  assert.ok(l.body.includes('Glossário:'),l.id);
  assert.ok(l.body.includes('Pergunta de reflexão:'),l.id);
  assert.ok(revalidaSources[l.source]?.url,l.id);
  for(const q of l.questions){
   assert.ok(q.prompt.length>=40,q.id);
   assert.equal(q.options.length,4,q.id);
   assert.equal(new Set(q.options.map(normalize)).size,4,q.id);
   assert.ok(q.options.every(o=>o.trim().length>=18),q.id);
   assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4,q.id);
   assert.ok(q.why.length>=85,q.id);
   assert.equal(q.language,'pt-BR',q.id);
   assert.ok(revalidaSources[q.source]?.url,q.id);
   keys[q.answer]++;
  }
 }
 assert.deepEqual(keys,[5,5,5,5]);
});
test('Revalida: main application catalog retains all twenty items',()=>{
 const c=courses.find(c=>c.id==='revalida');
 assert.ok(c,'Course must appear in catalog');
 const qs=questions.filter(q=>q.courseId==='revalida');
 assert.equal(qs.length,20);
 assert.equal(new Set(qs.map(q=>q.id)).size,20);
 assert.ok(qs.every(q=>q.options.length===4),'Do not silently pad Revalida to five options');
});
test('Revalida: heuristic virtual test-takers do not pass by choosing the first option',()=>{
 const qs=revalidaCourse.lessons.flatMap(l=>l.questions);
 const score=chooser=>qs.filter((q,i)=>chooser(q,i)===q.answer).length;
 assert.equal(score(()=>0),5);
 assert.equal(score(()=>1),5);
 assert.equal(score(()=>2),5);
 assert.equal(score(()=>3),5);
 // Simulated bilingual candidates checking stored explanations (not human performance).
 assert.equal(score(q=>q.answer),20);
});
