// Prints questions of the given courses for human/agent review: node tools/review-batch.mjs <courseId> [<courseId>...]
// Marks the keyed answer with "★". Output is JSON lines grouped by course.
import {questions,courses} from '../public/learn/courses.mjs';
const ids=process.argv.slice(2);
for(const id of ids){
 const c=courses.find(x=>x.id===id);if(!c){console.error('unknown course',id);continue;}
 console.log(`## COURSE ${id} · ${c.title} · ${questions.filter(q=>q.courseId===id).length} preguntas`);
 for(const q of questions.filter(q=>q.courseId===id))console.log(JSON.stringify({id:q.id,tema:q.area||q.skill,fuente:q.source,enunciado:q.prompt,opciones:q.options.map((o,i)=>(i===q.answer?'★ ':'  ')+o),clave:q.answer,porque:q.why}));
}
