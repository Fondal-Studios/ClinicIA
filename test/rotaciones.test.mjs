import test from 'node:test';import assert from 'node:assert/strict';
import {rotationCourses,rotationAudit} from '../public/learn/content/rotaciones.mjs';
test('five rotation courses have accessible and structurally valid banks',()=>{
 assert.equal(rotationCourses.length,5);
 for(const c of rotationCourses){assert.equal(c.lessons.length,5);const ids=new Set();
  for(const l of c.lessons){assert.ok(l.title&&l.body&&l.simulation?.scenario);for(const q of l.questions){assert.ok(q.prompt&&q.why);assert.ok(q.options.length>=3);assert.ok(q.answer>=0&&q.answer<q.options.length);assert.ok(!ids.has(q.id));ids.add(q.id);}}
  assert.ok(ids.size>0,'No questions in '+c.id);
 }
 console.info('Rotation bank coverage:',JSON.stringify(rotationAudit));
});
