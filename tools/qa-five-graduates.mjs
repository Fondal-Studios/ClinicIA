
import {courses,questions,sources} from '../public/learn/courses.mjs';
const students=[
 {name:'ES1',locale:'es',courses:['acls','sepsis-preparacion-2026'],strategy:'longest'},
 {name:'ES2',locale:'es',courses:['diabetes-integral-2026','salud-cardiometabolica'],strategy:'overlap'},
 {name:'PT1',locale:'pt',courses:['proati','via-aerea-avanzada'],strategy:'generic'},
 {name:'PT2',locale:'pt',courses:['metabolismo-graso-integral','obesidad-integral'],strategy:'longest'},
 {name:'EN1',locale:'en',courses:['pocus-preparacion','trauma-prehospitalario'],strategy:'overlap'}
];
const normalize=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const words=s=>new Set(normalize(s).split(/[^a-z0-9]+/).filter(x=>x.length>4));
const generic=/ignorar|omitir|sin evaluar|sin considerar|sin seguimiento|siempre|nunca|todos|ninguno|unicamente|posponer|retrasar|basar la conducta exclusivamente|intervencion estandarizada/i;
const obvious=/posponer las prioridades clinicas|basar la conducta exclusivamente|aplicar una intervencion estandarizada|omitir la monitorizacion/i;
const answer=(q,mode)=>{
 const options=q.options.map((text,i)=>({text,i}));
 const p=words(q.prompt);
 const score=o=>mode==='longest'?o.text.length:mode==='generic'?(generic.test(normalize(o.text))?-100:100)+o.text.length/100:[...words(o.text)].filter(w=>p.has(w)).length*100+o.text.length/100;
 return options.sort((a,b)=>score(b)-score(a))[0].i;
};
const output=[];
for(const s of students){
 const runs=[];
 for(const id of s.courses){
  const course=courses.find(c=>c.id===id);if(!course)throw new Error('Curso inexistente: '+id);
  const bank=questions.filter(q=>q.courseId===id);if(!bank.length)throw new Error('Banco vacio: '+id);
  const problems={structure:0,source:0,explanation:0,obvious:0,lengthCue:0},samples=[];
  let guessed=0;
  for(const lesson of course.lessons){if(!lesson.body||lesson.body.length<100)problems.explanation++;if(!sources[lesson.source])problems.source++;}
  for(const q of bank){
   if(q.options.length!==5||new Set(q.options.map(normalize)).size!==5||!q.options[q.answer])problems.structure++;
   if(!sources[q.source])problems.source++;
   if(!q.why||q.why.length<80)problems.explanation++;
   const wrong=q.options.filter((_,i)=>i!==q.answer);
   if(wrong.filter(x=>generic.test(normalize(x))).length>=2||wrong.some(x=>obvious.test(normalize(x)))){problems.obvious++;if(samples.length<4)samples.push({id:q.id,prompt:q.prompt.slice(0,110),options:q.options});}
   if(q.options[q.answer].length>Math.max(...wrong.map(x=>x.length))*1.65)problems.lengthCue++;
   guessed+=Number(answer(q,s.strategy)===q.answer);
  }
  runs.push({course:id,lessons:course.lessons.length,questions:bank.length,heuristicCorrect:guessed,heuristicPct:Math.round(100*guessed/bank.length),problems,samples});
 }
 output.push({student:s.name,language:s.locale,courseRuns:runs,
  criticalChecks:[
    {name:'Coherencia clinica',issues:runs.reduce((v,r)=>v+r.problems.structure+r.problems.source+r.problems.explanation,0),caution:'La exactitud medica necesita revision de docentes reales.'},
    {name:'Distractores y respuestas regaladas',issues:runs.reduce((v,r)=>v+r.problems.obvious+r.problems.lengthCue,0),caution:'Acierto de heuristica sin conocimientos, no calificacion de un estudiante real.'},
    {name:'Idioma y accesibilidad',issues:s.locale==='es'?0:runs.reduce((v,r)=>v+r.questions,0),caution:s.locale==='es'?'Contenido predominantemente en espanol.':'Sin traduccion integral verificada del contenido a '+s.locale+'.'}
  ]});
}
const report={kind:'SIMULATED_QA_NOT_REAL_STUDENTS',profiles:output.length,courseRuns:output.reduce((v,s)=>v+s.courseRuns.length,0),questionsAcrossRuns:output.reduce((v,s)=>v+s.courseRuns.reduce((w,r)=>w+r.questions,0),0),students:output};
console.log('QA_FIVE_GRADUATES '+JSON.stringify(report));
if(report.profiles!==5||report.courseRuns!==10)process.exitCode=1;
