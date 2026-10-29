import test from 'node:test';import assert from 'node:assert/strict';
import {rotationCourses,rotationAudit} from '../public/learn/content/rotaciones.mjs';
test('five rotation courses have accessible and structurally valid banks',()=>{
 assert.equal(rotationCourses.length,5);
 for(const c of rotationCourses){assert.equal(c.lessons.length,5);const ids=new Set();
  for(const l of c.lessons){assert.ok(l.title&&l.body&&l.simulation?.scenario);for(const q of l.questions){assert.ok(q.prompt&&q.why);assert.ok(q.options.length>=3);assert.equal(new Set(q.options.map(o=>o.trim().toLowerCase())).size,q.options.length,'Duplicate distractors '+q.id);assert.ok(q.options.every(o=>o.trim().length>=8),'Short or blank option '+q.id);assert.ok(q.answer>=0&&q.answer<q.options.length);assert.ok(!ids.has(q.id));ids.add(q.id);}}
  assert.equal(ids.size,50,'Expected exactly 50 questions in '+c.id);assert.equal(new Set(c.lessons.flatMap(l=>l.questions.map(q=>q.prompt.trim().toLowerCase()))).size,50,'Duplicate prompts in '+c.id);
 }
 console.info('Rotation bank coverage:',JSON.stringify(rotationAudit));
});
