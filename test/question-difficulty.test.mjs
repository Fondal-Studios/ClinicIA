import test from 'node:test';
import assert from 'node:assert/strict';
import {courses,questions} from '../public/learn/courses.mjs';
import {revisedQuestionIds,isObvious} from '../public/learn/content/question-difficulty-revisions.mjs';
test('all originally flagged distractors receive distinct plausible alternatives',()=>{
 assert.equal(revisedQuestionIds.length,223,'The baseline set of 223 items changed');
 assert.equal(new Set(revisedQuestionIds).size,223);
 for(const id of revisedQuestionIds){
  const q=questions.find(x=>x.id===id);assert.ok(q,id);
  assert.equal(q.options.length,5,id);
  assert.equal(new Set(q.options.map(s=>s.trim().toLowerCase())).size,5,id);
  assert.ok(q.options[q.answer],id);
  assert.equal(q.difficultyRevision,'2026-10-26');
  assert.ok(!isObvious(q),'Flag persists: '+id);
 }
 assert.ok(courses.some(c=>c.id==='proati'));
});
