// Self-check for authored question files (out-<course>.json or proati batch files): reports surface-cue statistics and the items to rewrite.
// Usage: node tools/check-expansion.mjs <file.json>   (options[0] is the correct answer in these files)
import {readFileSync} from 'node:fs';
const f=process.argv[2];if(!f)throw new Error('file required');
const j=JSON.parse(readFileSync(f,'utf8'));
const lessons=Array.isArray(j.lessons)?Object.fromEntries(j.lessons.map(l=>[l.id,l])):j.lessons;
const STOP=new Set('de la el los las un una unos unas y o u en con por para sin sobre entre al del que se su sus es son ser como mas pero si no lo le les este esta estos estas ese esa eso a e ante bajo desde hasta hacia segun tras mediante durante cuando donde cual cuales debe deben puede pueden paciente pacientes'.split(' '));
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const set=s=>new Set(norm(s).split(/[^a-z0-9]+/).filter(w=>w.length>2&&!STOP.has(w)));
const jac=(a,b)=>{if(!a.size||!b.size)return 0;let n=0;for(const x of a)if(b.has(x))n++;return n/(a.size+b.size-n);};
const overlap=(a,b)=>{let n=0;for(const x of a)if(b.has(x))n++;return n;};
const tie=(vals,i)=>{const m=Math.max(...vals),c=vals.filter(v=>v===m).length;return vals[i]===m?1/c:0;}; // expected hit of a random tie-break on index i
const stats={mas_larga:0,mas_corta:0,mas_parecida:0,comparte_enunciado:0,mas_especifica:0},rows=[];let n=0;
for(const [lid,l] of Object.entries(lessons))l.questions.forEach((q,k)=>{
 n++;const o=q.options,s=o.map(set),p=set(q.prompt);
 const hit={
  mas_larga:tie(o.map(x=>x.length),0),mas_corta:tie(o.map(x=>-x.length),0),
  mas_parecida:tie(s.map((a,i)=>s.reduce((t,b,jx)=>jx===i?t:t+jac(a,b),0)),0),
  comparte_enunciado:tie(s.map(a=>overlap(a,p)),0),
  mas_especifica:tie(o.map(x=>(x.match(/\d/g)||[]).length+(x.match(/[,;()]/g)||[]).length),0)
 };
 for(const key of Object.keys(stats))stats[key]+=hit[key];
 const len=o[0].length,others=o.slice(1).map(x=>x.length),ratio=len/(others.reduce((a,b)=>a+b,0)/others.length);
 const cues=Object.entries(hit).filter(([,v])=>v>=0.99).map(([k])=>k);
 if(ratio>1.25||cues.length>=3||(cues.includes('mas_larga')&&cues.length>=2)||o.some((x,i)=>i&&/\b(todas las anteriores|ninguna de las anteriores|ambas)\b/i.test(x)))rows.push({lesson:lid,index:k+1,ratio:+ratio.toFixed(2),cues});
});
console.log(`${n} preguntas · acierto esperado por estilo (azar = 20%):`);
for(const [k,v] of Object.entries(stats))console.log(`  ${k.padEnd(20)} ${(100*v/n).toFixed(1)}%`);
console.log(`A reescribir: ${rows.length} (${(100*rows.length/n).toFixed(0)}%). Meta: mas_larga ≤ 27%, mas_parecida ≤ 27%, resto ≤ 25%, y menos de 8% a reescribir.`);
for(const r of rows.slice(0,60))console.log(`  ${r.lesson} #${r.index} largo×${r.ratio} ${r.cues.join(',')}`);
