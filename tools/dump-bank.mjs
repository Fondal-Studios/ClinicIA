// Dumps every course (lessons, theory, existing questions) as JSON files, with the number of new questions each lesson should receive.
// Usage: node tools/dump-bank.mjs <outDir> [perCourse=200]
import {mkdirSync,writeFileSync} from 'node:fs';
import {courses,sources} from '../public/learn/courses.mjs';
const out=process.argv[2],per=Number(process.argv[3]||200);if(!out)throw new Error('outDir required');mkdirSync(out,{recursive:true});
for(const c of courses){
 const n=c.lessons.length,base=Math.floor(per/n),extra=per-base*n;
 const lessons=c.lessons.map((l,i)=>({id:l.id,title:l.title,area:l.area||null,source:l.source,sourceTitle:sources[l.source]?.title,theory:l.body,newQuestionsToWrite:base+(i<extra?1:0),existing:l.questions.map(q=>({prompt:q.prompt,correct:q.options[q.answer]}))}));
 writeFileSync(`${out}/${c.id}.json`,JSON.stringify({course:c.id,title:c.title,subtitle:c.subtitle,audience:c.audience,scope:c.scope,lessons},null,1));
}
console.log(courses.map(c=>c.id+':'+c.lessons.length).join(' '));
