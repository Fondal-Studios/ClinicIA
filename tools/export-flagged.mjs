// Exports the questions flagged by tools/audit-questions.mjs so they can be rewritten. Usage: node tools/export-flagged.mjs <audit.json> <out.json> [courseId...]
import {readFileSync,writeFileSync} from 'node:fs';
import {questions,courses} from '../public/learn/courses.mjs';
const [audit,out,...only]=process.argv.slice(2);if(!audit||!out)throw new Error('audit.json and out.json required');
const report=JSON.parse(readFileSync(audit,'utf8')),items=[];
for(const [course,c] of Object.entries(report.courses)){if(only.length&&!only.includes(course))continue;
 for(const i of c.items){const q=questions.find(x=>x.id===i.id);if(!q)continue;const l=courses.find(x=>x.id===course).lessons.find(x=>x.id===q.lessonId);
  items.push({id:q.id,course,lesson:l.title,theory:(l.body||'').slice(0,1200),prompt:q.prompt,options:[q.options[q.answer],...q.options.filter((_,k)=>k!==q.answer)],why:q.why,flags:[...i.problems,...i.deducible]});}}
writeFileSync(out,JSON.stringify({count:items.length,items},null,1));console.log(items.length,'preguntas exportadas');
