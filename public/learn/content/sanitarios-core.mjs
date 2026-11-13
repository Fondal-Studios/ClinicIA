// Shared builders for the allied-health curricula (nursing, nutrition). Same shape and quality rules as kinesiologia.mjs.
// Every course: 5 modules x 4 five-option questions (answer keys balanced 4/4/4/4/4), one 3-step case, bibliography checked on `checked`.
export const checked='2026-11-13';
export const ref=(title,url,year,type,section,access='Texto completo gratuito')=>({title,url,year,type,section,access,checked});
// Options are authored together (correct first); the key position is distributed deterministically by `index`.
export function question(id,source,skill,index,[prompt,correct,a,b,c,d,why]){
 const options=[correct,a,b,c,d],answer=index%5;
 options.unshift(...options.splice(options.length-answer,answer));
 return {id,source,skill,prompt,options,answer,why};
}
export function lesson(course,n,title,refs,objective,body,trap,evidence,activity,rows,roles=['Profesional','Paciente simulado o responsable del pase','Observador/a']){
 const id=`${course}-m${n}`;
 return {id,title,area:title,minutes:25,source:refs[0],references:refs,objective,body,trap,evidence,
  simulation:{required:false,scenario:activity.scenario,roles,rotation:'Rotar roles. Explicar la decisión y repetir el pase después de la devolución.',checklist:activity.checklist,validation:'Actividad de razonamiento con caso ficticio. Las maniobras, la administración de fármacos y el manejo de equipos requieren entrenamiento presencial supervisado; este ejercicio no acredita destreza.'},
  questions:rows.map((row,i)=>question(`${id}-q${i+1}`,refs[0],title,(n-1)*4+i,row))};
}
export function makeCourse({id,title,summary,prerequisites,lessons,category,professionalCategory,audience,subtitle,pathway='personal-sanitario'}){
 return {id,title,summary,category,professionalCategory,pathway,audience,subtitle,prerequisites,language:'es',evidenceChecked:checked,examMinutes:40,
  scope:'Formación continua independiente para adultos. No equivale a título, certificación oficial ni habilitación para procedimientos. Aplicación clínica según incumbencias legales, capacitación presencial y protocolos locales.',
  reviewStatus:`Bibliografía contrastada el ${checked.split('-').reverse().join('/')}; revisión docente especializada pendiente.`,
  completion:'Leer los cinco módulos y aprobar la evaluación integral con al menos 80% (16/20). Casos y simulaciones para practicar razonamiento; no acreditan destreza presencial.',
  studyMinutes:165,studyTimeNote:'Estimación orientativa: 125 min de estudio y actividades + 40 min de evaluación; no son horas acreditadas.',
  outcomes:lessons.map(l=>l.objective),references:[...new Set(lessons.flatMap(l=>l.references))],lessons};
}
// A 3-step branching case (wrong answers repeat the step; the last step ends the case).
export function scenario(courseId,title,summary,source,lessonId,rows){
 const id=`${courseId}-caso`;
 return {id,courseId,title,summary,source,lessonId,steps:rows.map((row,i)=>{
  const q=question(`${id}-s${i+1}`,source,title,i,row);
  return {...q,text:q.prompt,next:i===rows.length-1?null:i+1,wrong:i};
 })};
}
// Point each question's citation at its lesson references (first = primary) and finish integration.
export function finalize(courses){
 for(const c of courses)for(const l of c.lessons)for(const q of l.questions)q.references=[q.source,...l.references.filter(id=>id!==q.source)];
}
