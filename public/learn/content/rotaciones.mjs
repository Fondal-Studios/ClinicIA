// Curated rotation banks from ClinicIA's existing original teaching questions.
// Distinct identifiers and no repeated question within a rotation. Faculty validation pending.
import {residencyCourse,residencySources} from './residencias.mjs';
import {neonatalCourse,obstetricCourse,perinatalSources} from './perinatal.mjs';
import {phtlsCourse,atlsCourse,traumaSources} from './trauma.mjs';
import {emergencyCourses,emergencySources} from './emergentologia.mjs';
import {expandedEmergencyCourses,expandedEmergencySources} from './emergentologia-ampliada.mjs';
import {integralCourses,integralSources} from './medicina-integral.mjs';
const pool=[residencyCourse,neonatalCourse,obstetricCourse,phtlsCourse,atlsCourse,...emergencyCourses,...expandedEmergencyCourses,...integralCourses];
const tracks=[
 ['rot-ginecologia','Ginecología y obstetricia',/embarazo|obstetric|gineco|prenatal|parto|puerper|eclamp|anticoncep|cervi|gesta/i],
 ['rot-pediatria','Pediatría',/pediatr|niñ|lactante|neonat|recién nacido|infantil|bronquiol|vacun|deshidrat/i],
 ['rot-cirugia','Cirugía',/cirug|abdomen|apendic|colecis|herida|trauma|quemadur|fractura|posoperat|quirúrg/i],
 ['rot-clinica','Clínica médica',/clínica|hipertens|diabet|anemia|renal|tiroid|infecci|respirator|cardiovas|metabólic/i],
 ['rot-emergencias','Emergencias',/emergen|shock|paro|rcp|reanim|acv|trauma|triage|dolor torácico|hemorrag|vía aérea/i]
];
function build(id,title,pattern){
 const relevant=pool.flatMap(c=>c.lessons.map(l=>({c,l}))).filter(({c,l})=>pattern.test([c.title,l.title,l.area,l.body].join(' ')));
 const selected=[];const used=new Set();
 for(const {c,l} of relevant)for(const q of l.questions||[]){
  const key=String(q.prompt||'').trim().toLowerCase();if(!key||used.has(key)||!Array.isArray(q.options)||q.options.length<3||!Number.isInteger(q.answer)||q.answer>=q.options.length||!q.why)continue;
  used.add(key);selected.push({q,l});if(selected.length===50)break;
 }
 // Do not pad a course with fabricated or duplicated questions.
 const lessons=[0,1,2,3,4].map(i=>{const rows=selected.slice(i*10,(i+1)*10);const base=rows[0]?.l;return {id:id+'-unidad-'+(i+1),title:base?.title||'Unidad '+(i+1),area:title,source:base?.source||'euportal',minutes:20,objective:'Resolver situaciones clínicas frecuentes con supervisión.',body:base?.body||'Material en revisión docente.',simulation:{required:false,scenario:'Paciente simulado: realizar evaluación inicial, formular hipótesis, comunicar riesgos y justificar la derivación o conducta supervisada.',roles:['Rotante','Paciente simulado','Observador'],rotation:'Intercambiar roles y explicar decisiones.',checklist:['Reconoce signos de alarma','Prioriza seguridad','Explica conducta','Comunica con claridad']},questions:rows.map(({q},j)=>({...q,id:id+'-q-'+(i*10+j+1),options:[...q.options],source:q.source||base?.source}))};});
 return {id,title,category:'rotaciones',summary:'Cinco unidades, casos guiados y banco formativo curado de ClinicIA.',scope:'Práctica supervisada; no reemplaza formación ni evaluación docente. Preguntas adaptadas del banco original de ClinicIA, pendientes de revisión editorial.',reviewStatus:'Pendiente de validación docente',rotation:true,examMinutes:60,lessons};
}
export const rotationCourses=tracks.map(([id,title,pattern])=>build(id,title,pattern));
export const rotationSources={...residencySources,...perinatalSources,...traumaSources,...emergencySources,...expandedEmergencySources,...integralSources};
export const rotationAudit=rotationCourses.map(c=>({id:c.id,questions:c.lessons.reduce((n,l)=>n+l.questions.length,0)}));
