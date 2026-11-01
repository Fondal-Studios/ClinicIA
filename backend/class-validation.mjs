import {createHash} from 'node:crypto';

// Structural and editorial safety checks only. This is NOT clinical fact verification.
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
export const contentDigest=content=>createHash('sha256').update(JSON.stringify(content)).digest('hex');
export function validateClass(content){
 const issues=[],add=(code,path,message)=>issues.push({code,path,message});
 const sources=new Set((content.sources||[]).map(s=>s.id));
 const questions=[...(content.questions||[]),...(content.case?.question?[content.case.question]:[])];
 if(questions.length<3)add('MIN_QUESTIONS','questions','Se requieren al menos tres preguntas.');
 if(!(content.sections?.length||content.slides?.length))add('NO_THEORY','sections','Agregá teoría o diapositivas.');
 if(!content.objectives?.length)add('NO_OBJECTIVES','objectives','Definí objetivos de aprendizaje.');
 if(!sources.size)add('NO_SOURCES','sources','Agregá bibliografía identificable.');
 const seen=new Set();
 for(const [i,q] of questions.entries()){
  const path=i<content.questions.length?'questions['+i+']':'case.question';
  const key=norm(q.prompt);
  if(seen.has(key))add('DUPLICATE_QUESTION',path,'Enunciado duplicado.');seen.add(key);
  if(!Array.isArray(q.options)||q.options.length!==5||new Set(q.options.map(norm)).size!==5)add('INVALID_OPTIONS',path,'Deben existir cinco opciones distintas.');
  if(!Number.isInteger(q.answer)||q.answer<0||q.answer>4)add('INVALID_ANSWER',path,'La respuesta correcta no está definida.');
  if(!q.why?.trim())add('NO_RATIONALE',path,'Falta justificación.');
  if(!q.sources?.length)add('NO_QUESTION_SOURCE',path,'La pregunta no tiene referencia vinculada.');
  if(q.sources?.some(s=>!sources.has(s)))add('UNKNOWN_REFERENCE',path,'Hay referencias inexistentes.');
 }
 for(const [i,s] of (content.sections||[]).entries())if(!s.sources?.length)add('NO_SECTION_SOURCE','sections['+i+']','Esta sección no tiene referencia.');
 for(const [i,s] of (content.slides||[]).entries())if(!s.sources?.length)add('NO_SLIDE_SOURCE','slides['+i+']','Esta diapositiva no tiene referencia.');
 return {passed:issues.length===0,issues,checks:{questions:questions.length,sources:sources.size,sections:content.sections?.length||0,slides:content.slides?.length||0},limitations:['No se verifica automáticamente la vigencia ni el contenido real de las fuentes.','No se demuestra la exactitud clínica, la unicidad semántica de la respuesta ni la calidad de los distractores. Requiere revisión docente.'],digest:contentDigest(content)};
}
