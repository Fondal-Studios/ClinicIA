import {revalidaCourse,revalidaSources} from './revalida.mjs';
// Curated rotation banks from ClinicIA's existing original teaching questions.
// Distinct identifiers and no repeated question within a rotation. Faculty validation pending.
import {residencyCourse,residencySources} from './residencias.mjs';
import {neonatalCourse,obstetricCourse,perinatalSources} from './perinatal.mjs';
import {phtlsCourse,atlsCourse,traumaSources} from './trauma.mjs';
import {emergencyCourses,emergencySources} from './emergentologia.mjs';
import {expandedEmergencyCourses,expandedEmergencySources} from './emergentologia-ampliada.mjs';
import {integralCourses,integralSources} from './medicina-integral.mjs';
const pool=[residencyCourse,neonatalCourse,obstetricCourse,phtlsCourse,atlsCourse,...emergencyCourses,...expandedEmergencyCourses,...integralCourses,revalidaCourse];

const ginecoSupplement={
 id:'rotaciones-gineco-supplement',title:'Ginecología: situaciones de atención primaria',area:'Ginecología y obstetricia',
 source:'prenatal',body:'Casos complementarios sobre controles ginecológicos, gestación y comunicación clínica. Revisión docente pendiente.',
 questions:[
  {id:'rot-gyn-s1',prompt:'Gestante con vómitos persistentes, intolerancia oral y signos de deshidratación. ¿Qué priorizás?',options:['Evaluar hidratación y gravedad, indicar manejo y derivación según estado','Continuar seguimiento habitual sin valorar signos vitales','Posponer la evaluación hasta el control ecográfico rutinario','Suponer un síntoma leve por ocurrir en el primer trimestre'],answer:0,why:'La hiperémesis puede generar deshidratación y alteraciones metabólicas; la gravedad define manejo y necesidad de derivación.'},
  {id:'rot-gyn-s2',prompt:'Paciente embarazada presenta pérdida de líquido por vagina antes del término. ¿Qué conducta corresponde?',options:['Considerar fisiológica toda pérdida de líquido claro','Evaluar urgencia obstétrica por posible rotura prematura de membranas','Indicar ducha vaginal y control en una semana','Descartar riesgo fetal si no hay dolor'],answer:1,why:'La sospecha de rotura de membranas necesita evaluación obstétrica sin demoras y prevención de complicaciones.'},
  {id:'rot-gyn-s3',prompt:'Puérpera presenta dolor mamario, eritema local y fiebre. ¿Cuál es la evaluación indicada?',options:['Atribuir todos los síntomas a ingurgitación fisiológica','Interrumpir lactancia definitivamente sin evaluación','Evaluar mastitis y signos sistémicos para indicar manejo adecuado','Solicitar únicamente un examen cervical'],answer:2,why:'Fiebre y eritema focal durante lactancia requieren valorar mastitis e identificar complicaciones o gravedad.'},
  {id:'rot-gyn-s4',prompt:'Paciente con lesión visible en cuello uterino y sangrado de contacto solicita control. ¿Qué corresponde?',options:['Repetir rastreo poblacional sin exploración','Prescribir anticonceptivos como única respuesta','Aguardar el siguiente tamizaje si es joven','Realizar evaluación diagnóstica de la lesión y derivar según hallazgos'],answer:3,why:'Los síntomas y una lesión visible exigen evaluación diagnóstica; el tamizaje no reemplaza la investigación clínica.'}
 ]};

pool.push({lessons:[ginecoSupplement]});
const tracks=[
 ['rot-ginecologia','Ginecología y obstetricia',/embarazo|obstetric|gineco|prenatal|parto|puerper|eclamp|anticoncep|cervi|gesta/i],
 ['rot-pediatria','Pediatría',/pediatr|niñ|lactante|neonat|recién nacido|infantil|bronquiol|vacun|deshidrat/i],
 ['rot-cirugia','Cirugía',/cirug|abdomen|apendic|colecis|herida|trauma|quemadur|fractura|posoperat|quirúrg/i],
 ['rot-clinica','Clínica médica',/clínica|hipertens|diabet|anemia|renal|tiroid|infecci|respirator|cardiovas|metabólic/i],
 ['rot-emergencias','Emergencias',/emergen|shock|paro|rcp|reanim|acv|trauma|triage|dolor torácico|hemorrag|vía aérea/i]
];
function build(id,title,pattern){
 const relevant=pool.flatMap(c=>c.lessons.map(l=>({c,l}))).filter(({c,l})=>pattern.test([l.title,l.area].join(' ')));
 const selected=[];const used=new Set();
 for(const {c,l} of relevant){if(selected.length>=50)break;for(const q of l.questions||[]){
  const key=String(q.prompt||'').trim().toLowerCase();if(!key||used.has(key)||!Array.isArray(q.options)||q.options.length<3||!Number.isInteger(q.answer)||q.answer>=q.options.length||!q.why)continue;
  used.add(key);selected.push({q,l});if(selected.length===50)break;
 }}
 // Do not pad a course with fabricated or duplicated questions.
 const lessons=[0,1,2,3,4].map(i=>{const rows=selected.slice(i*10,(i+1)*10);const base=rows[0]?.l;return {id:id+'-unidad-'+(i+1),title:base?.title||'Unidad '+(i+1),area:title,source:base?.source||'euportal',minutes:20,objective:'Resolver situaciones clínicas frecuentes con supervisión.',body:base?.body||'Material en revisión docente.',simulation:{required:false,scenario:'Paciente simulado: realizar evaluación inicial, formular hipótesis, comunicar riesgos y justificar la derivación o conducta supervisada.',roles:['Rotante','Paciente simulado','Observador'],rotation:'Intercambiar roles y explicar decisiones.',checklist:['Reconoce signos de alarma','Prioriza seguridad','Explica conducta','Comunica con claridad']},questions:rows.map(({q},j)=>({...q,id:id+'-q-'+(i*10+j+1),options:[...q.options],source:q.source||base?.source}))};});
 return {id,title,category:'rotaciones',summary:'Cinco unidades, casos guiados y banco formativo curado de ClinicIA.',scope:'Práctica supervisada; no reemplaza formación ni evaluación docente. Preguntas adaptadas del banco original de ClinicIA, pendientes de revisión editorial.',reviewStatus:'Pendiente de validación docente',rotation:true,examMinutes:60,lessons};
}
export const rotationCourses=tracks.map(([id,title,pattern])=>build(id,title,pattern));
export const rotationSources={...residencySources,...perinatalSources,...traumaSources,...emergencySources,...expandedEmergencySources,...integralSources,...revalidaSources};
export const rotationAudit=rotationCourses.map(c=>({id:c.id,questions:c.lessons.reduce((n,l)=>n+l.questions.length,0)}));
