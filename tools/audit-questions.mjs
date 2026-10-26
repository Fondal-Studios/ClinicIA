// Question-bank simulations: finds items that can be answered WITHOUT medical knowledge (test-wiseness cues) or that are incoherent.
// For every course it runs N simulated rounds (default 50): option order is reshuffled each round, as in the app, and a panel of
// "zero-knowledge examinees" answers every question using one surface cue each. A question is *deducible* when several independent cues
// agree on its correct option; a course is *biased* when a cue beats chance bank-wide. Structural lint catches incoherent items.
// Heuristics are NOT clinical validation: they find style problems, not wrong medicine.
// Usage: node tools/audit-questions.mjs [--rounds 50] [--course acls] [--json out.json] [--strict]
import {writeFileSync} from 'node:fs';
import {questions,courses,sources} from '../public/learn/courses.mjs';
const args=process.argv.slice(2),flag=n=>args.includes('--'+n),opt=(n,d)=>{const i=args.indexOf('--'+n);return i>=0?args[i+1]:d;};
const ROUNDS=Number(opt('rounds',50)),ONLY=opt('course',''),OUT=opt('json','');
let seed=20261026;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const STOP=new Set('de la el los las un una unos unas y o u en con por para sin sobre entre al del que se su sus es son ser como mas pero si no lo le les este esta estos estas ese esa eso a e ante bajo desde hasta hacia segun tras mediante durante cuando donde cual cuales debe deben puede pueden paciente pacientes'.split(' '));
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const tokens=s=>norm(s).split(/[^a-z0-9]+/).filter(w=>w.length>2&&!STOP.has(w));
const set=s=>new Set(tokens(s));
const jac=(a,b)=>{if(!a.size||!b.size)return 0;let n=0;for(const x of a)if(b.has(x))n++;return n/(a.size+b.size-n);};
const overlap=(a,b)=>{let n=0;for(const x of a)if(b.has(x))n++;return n;};
const argmaxTies=(vals)=>{const m=Math.max(...vals),idx=vals.map((v,i)=>v===m?i:-1).filter(i=>i>=0);return idx[Math.floor(rnd()*idx.length)];};
const ABSOLUTE=/\b(siempre|nunca|todos|todas|ninguno|ninguna|solo|solamente|unicamente|exclusivamente|jamas)\b/;
// Zero-knowledge strategies. Each returns the index it would choose among shuffled options.
const STRATEGIES={
 azar:(q,o)=>Math.floor(rnd()*o.length),
 mas_larga:(q,o)=>argmaxTies(o.map(x=>x.text.length)),
 mas_corta:(q,o)=>argmaxTies(o.map(x=>-x.text.length)),
 comparte_con_enunciado:(q,o)=>{const p=set(q.prompt);return argmaxTies(o.map(x=>overlap(set(x.text),p)));},
 mas_parecida_a_las_demas:(q,o)=>{const s=o.map(x=>set(x.text));return argmaxTies(s.map((a,i)=>s.reduce((n,b,j)=>j===i?n:n+jac(a,b),0)));},
 la_distinta:(q,o)=>{const s=o.map(x=>set(x.text));return argmaxTies(s.map((a,i)=>-s.reduce((n,b,j)=>j===i?n:n+jac(a,b),0)));},
 mas_especifica:(q,o)=>argmaxTies(o.map(x=>(x.text.match(/\d/g)||[]).length+(x.text.match(/[,;()]/g)||[]).length)),
 descarta_absolutos:(q,o)=>{const ok=o.map((x,i)=>ABSOLUTE.test(norm(x.text))?-1:i).filter(i=>i>=0),pool=ok.length?ok:o.map((_,i)=>i);return pool[Math.floor(rnd()*pool.length)];},
 copia_de_la_teoria:(q,o)=>{const b=set(q.body);return argmaxTies(o.map(x=>overlap(set(x.text),b)));}
};
const CUES=Object.keys(STRATEGIES).filter(k=>k!=='azar'&&k!=='copia_de_la_teoria'); // copia_de_la_teoria is informative: a good item is answerable from the lesson
const lessonBody=new Map(courses.flatMap(c=>c.lessons.map(l=>[l.id,l.body||''])));
const report={generatedAt:new Date().toISOString(),rounds:ROUNDS,courses:{}};
const hardErrors=[];
for(const c of courses){
 if(ONLY&&c.id!==ONLY)continue;
 const qs=questions.filter(q=>q.courseId===c.id);
 const hits=Object.fromEntries(Object.keys(STRATEGIES).map(k=>[k,new Map(qs.map(q=>[q.id,0]))]));
 const perRound=Object.fromEntries(Object.keys(STRATEGIES).map(k=>[k,[]]));
 for(let r=0;r<ROUNDS;r++){
  const round=Object.fromEntries(Object.keys(STRATEGIES).map(k=>[k,0]));
  for(const q of qs){
   const o=shuffle(q.options.map((text,i)=>({text,correct:i===q.answer}))),ctx={prompt:q.prompt,body:lessonBody.get(q.lessonId)};
   for(const [k,fn] of Object.entries(STRATEGIES)){const pick=fn(ctx,o);if(o[pick]?.correct){hits[k].set(q.id,hits[k].get(q.id)+1);round[k]++;}}
  }
  for(const k of Object.keys(STRATEGIES))perRound[k].push(round[k]/qs.length);
 }
 const stat=a=>{const m=a.reduce((x,y)=>x+y,0)/a.length,sd=Math.sqrt(a.reduce((x,y)=>x+(y-m)**2,0)/a.length);return {mean:+m.toFixed(3),sd:+sd.toFixed(3),max:+Math.max(...a).toFixed(3)};};
 const strategies=Object.fromEntries(Object.keys(STRATEGIES).map(k=>[k,stat(perRound[k])]));
 // course-level bias: a cue beats the 20% chance level by more than 8 points and by more than 3 sd of binomial noise
 const noise=Math.sqrt(0.2*0.8/Math.max(qs.length,1));
 const biased=CUES.filter(k=>strategies[k].mean>0.2+Math.max(0.08,3*noise));
 const items=[];
 for(const q of qs){
  const ok=q.options[q.answer],others=q.options.filter((_,i)=>i!==q.answer),problems=[],cues=CUES.filter(k=>hits[k].get(q.id)/ROUNDS>=0.7);
  // structural / coherence lint
  if(!Array.isArray(q.options)||q.options.length!==5)problems.push('no tiene 5 alternativas');
  if(new Set(q.options.map(x=>norm(x).trim())).size!==q.options.length)problems.push('alternativas duplicadas');
  if(!Number.isInteger(q.answer)||!q.options[q.answer])problems.push('clave inválida');
  if(!q.why||q.why.trim().length<40)problems.push('fundamento ausente o muy breve');
  if(q.options.some(x=>!x||(x.trim().length<2&&!/^\d$/.test(x.trim()))))problems.push('alternativa vacía o mínima');
  if(!sources[q.source]?.url?.startsWith('https://'))problems.push('fuente sin enlace https');
  for(let i=0;i<q.options.length;i++)for(let j=0;j<q.options.length;j++)if(i!==j&&q.options[i]&&q.options[j]&&norm(q.options[j]).includes(norm(q.options[i]))&&norm(q.options[i]).length>12)problems.push('una alternativa contiene a otra');
  const lens=q.options.map(x=>x.length);if(Math.max(...lens)>Math.min(...lens)*3&&Math.max(...lens)>60)problems.push('longitudes muy dispares (3×)');
  if(q.options.some(x=>/\b(todas las anteriores|ninguna de las anteriores|ambas)\b/i.test(x)))problems.push('alternativa "todas/ninguna/ambas"');
  if(norm(ok).length>15&&norm(q.prompt).includes(norm(ok)))problems.push('la respuesta correcta está escrita en el enunciado');
  const whyT=set(q.why),okT=set(ok);if(okT.size>=4&&overlap(okT,whyT)===0&&others.some(x=>overlap(set(x),whyT)>=3))problems.push('el fundamento no menciona la respuesta correcta pero sí una alternativa incorrecta (posible incoherencia)');
  const quality=[];
  if(cues.length>=3)quality.push('deducible por estilo: '+cues.join(', '));
  else if(cues.length===2&&cues.includes('mas_larga'))quality.push('deducible por estilo: '+cues.join(', '));
  if(problems.length||quality.length)items.push({id:q.id,lesson:q.lessonId,problems,deducible:quality,cues});
  if(problems.some(p=>/5 alternativas|duplicadas|clave inválida|vacía/.test(p)))hardErrors.push(q.id);
 }
 // near-duplicate prompts within the course
 const sets=qs.map(q=>set(q.prompt));const dups=[];
 for(let i=0;i<qs.length;i++)for(let j=i+1;j<qs.length;j++)if(jac(sets[i],sets[j])>=0.8&&norm(qs[i].options[qs[i].answer])===norm(qs[j].options[qs[j].answer]))dups.push([qs[i].id,qs[j].id]);
 // answer text of one question quoted in another stem of the same lesson (leak)
 const leaks=[];
 for(const q of qs){const ok=norm(q.options[q.answer]);if(ok.length<20)continue;for(const p of qs)if(p.lessonId===q.lessonId&&p.id!==q.id&&norm(p.prompt).includes(ok))leaks.push([q.id,p.id]);}
 report.courses[c.id]={questions:qs.length,strategies,sesgoDelBanco:biased,preguntasMarcadas:items.length,items,duplicadas:dups,pistasEntrePreguntas:leaks};
}
const total=Object.values(report.courses).reduce((n,c)=>n+c.questions,0),flagged=Object.values(report.courses).reduce((n,c)=>n+c.preguntasMarcadas,0);
report.resumen={preguntas:total,marcadas:flagged,porcentaje:+(100*flagged/Math.max(total,1)).toFixed(1)};
for(const [id,c] of Object.entries(report.courses)){
 const s=c.strategies;console.log(`${id.padEnd(16)} ${String(c.questions).padStart(4)} preg · marcadas ${String(c.preguntasMarcadas).padStart(3)} · duplicadas ${c.duplicadas.length} · pistas ${c.pistasEntrePreguntas.length} · mas_larga ${s.mas_larga.mean} · enunciado ${s.comparte_con_enunciado.mean} · parecida ${s.mas_parecida_a_las_demas.mean}${c.sesgoDelBanco.length?' · SESGO: '+c.sesgoDelBanco.join(','):''}`);
}
console.log(`Total ${total} preguntas, ${flagged} marcadas (${report.resumen.porcentaje}%), ${ROUNDS} simulaciones por curso.`);
if(OUT)writeFileSync(OUT,JSON.stringify(report,null,1));
if(flag('strict')&&hardErrors.length){console.error('Errores estructurales:',hardErrors.slice(0,20).join(', '));process.exit(1);}
