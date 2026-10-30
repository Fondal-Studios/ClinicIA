import test from 'node:test';import assert from 'node:assert/strict';
import {courses,questions,sources} from '../public/learn/courses.mjs';
import {cases} from '../public/learn/cases.mjs';
import {distractors} from '../public/learn/content/distractors.mjs';
import {createExam,restoreExam,gradeExam,BANK_REVISION} from '../public/learn/exams.mjs';
test('published questions have unique alternatives matching their exam format',()=>{for(const q of [...questions,...cases.flatMap(c=>c.steps)]){const expected=q.courseId==='revalida'?4:5;assert.equal(q.options.length,expected,q.id||q.text);assert.equal(new Set(q.options.map(s=>s.trim().toLowerCase())).size,expected);assert.ok(q.options.every(s=>typeof s==='string'&&s.length>0));assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<expected);}assert.equal(Object.keys(distractors).length,300);assert.ok(Object.keys(distractors).every(id=>questions.some(q=>q.id===id)));});
test('new independent courses have theory, references, exam coverage and explicit scope',()=>{for(const id of ['neonatal','obstetricia']){const c=courses.find(c=>c.id===id);assert.ok(/(?:no|ni) otorga certificación/.test(c.scope));assert.ok(sources[c.officialSource]);assert.equal(c.lessons.length,6);const e=createExam(id+'-integral',0);assert.equal(e.ids.length,18);assert.ok(e.ids.every(id=>questions.find(q=>q.id===id).courseId===c.id));for(const l of c.lessons){assert.ok(l.body.length>100);assert.ok(sources[l.source]);}}});
test('saved exams never reinterpret choices from a different editorial revision',()=>{const e=createExam('sprint',0);assert.equal(e.bankRevision,BANK_REVISION);assert.equal(restoreExam({...e,bankRevision:undefined}),null);assert.equal(restoreExam({...e,bankRevision:1}),null);assert.equal(gradeExam(e,100).bankRevision,BANK_REVISION);});

test('revised diagnostic calculations use coherent alternatives and feedback for each option',()=>{
 for(const id of ['eu-pruebas-1','eu-pruebas-2','eu-pruebas-3','eu-pruebas-4']){
  const q=questions.find(q=>q.id===id);assert.equal(q.optionFeedback.length,q.options.length);
  assert.ok(q.optionFeedback.every(x=>x.trim().length>0));
  for(const option of q.options){if(/^\d/.test(option))assert.ok(parseFloat(option.replace(',','.'))<=100);}
 }
 assert.equal(questions.find(q=>q.id==='eu-pruebas-1').options[0],(90/100*100)+'%');
 assert.equal(questions.find(q=>q.id==='eu-pruebas-2').options[0],(180/200*100)+'%');
 assert.equal(questions.find(q=>q.id==='eu-pruebas-3').options[0],(30/100*100)+'%');
});
