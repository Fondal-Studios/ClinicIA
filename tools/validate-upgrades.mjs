// Validates a question-review output file: node tools/validate-upgrades.mjs tools/review-out/<batch>.json
import {readFileSync} from 'node:fs';import {questions} from '../public/learn/courses.mjs';
const file=process.argv[2];const data=JSON.parse(readFileSync(file,'utf8'));const byId=new Map(questions.map(q=>[q.id,q]));
import {existsSync} from 'node:fs';
const stock=new Set(existsSync(new URL('./review-out/_stock.json',import.meta.url))?JSON.parse(readFileSync(new URL('./review-out/_stock.json',import.meta.url),'utf8')):[]);
const bad=[],warn=[];let longest=0,n=0;
for(const [id,u] of Object.entries(data.upgrades||{})){
 const q=byId.get(id);if(!q){bad.push(id+': id inexistente');continue;}
 const o=u.options;if(!Array.isArray(o)||o.length!==q.options.length){bad.push(id+': debe tener '+q.options.length+' opciones');continue;}
 if(o[q.answer]!==q.options[q.answer])bad.push(id+': la opción correcta cambió de texto o posición');
 if(new Set(o.map(x=>x.trim().toLowerCase())).size!==o.length)bad.push(id+': opciones repetidas');
 o.forEach((x,i)=>{if(i!==q.answer&&x.length>20&&stock.has(x))bad.push(id+': distractor de relleno "'+x.slice(0,40)+'"');if(typeof x!=='string'||(i!==q.answer&&x.trim().length<8))bad.push(id+': distractor vacío/corto');if(/ninguna de las anteriores|todas las anteriores|ambas (son )?correctas/i.test(x))bad.push(id+': "todas/ninguna"');});
 const L=o.map(x=>x.length);n++;if(L[q.answer]===Math.max(...L))longest++;
 if(u.why&&u.why.length<60)warn.push(id+': why muy corto');
}
const total=questions.filter(q=>(data.batch||'')&&true).length;
console.log(`${file}: ${n} reescritas, ${(data.flags||[]).length} flags, correcta más larga en ${n?Math.round(100*longest/n):0}%`);
if(warn.length)console.log('AVISOS:\n'+warn.slice(0,10).join('\n'));
if(bad.length){console.log('ERRORES ('+bad.length+'):\n'+bad.slice(0,30).join('\n'));process.exit(1);}console.log('OK');
