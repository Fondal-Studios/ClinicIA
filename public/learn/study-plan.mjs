import {courseQuestions,dueQuestions,errorQuestions} from './engine.mjs';
export function studyPlan(state,courseId=state.current,now=Date.now()){
 const all=courseQuestions(courseId),errors=errorQuestions(state,courseId),due=dueQuestions(state,now,courseId);
 const ids=[...new Set([...errors,...due,...all.filter(q=>!state.evidence[q.id]),...all].map(q=>q.id))].slice(0,5);
 const areas=[...new Set(all.map(q=>q.area))].map(area=>{const qs=all.filter(q=>q.area===area),seen=qs.filter(q=>state.evidence[q.id]);return {area,seen:seen.length,total:qs.length,errors:errors.filter(q=>q.area===area).length};});
 return {ids,errors:errors.length,due:due.length,seen:all.filter(q=>state.evidence[q.id]).length,total:all.length,areas,reason:errors.length?'Primero tus errores; después, lo que toca repasar.':due.length?'Tu próximo bloque recupera conceptos que ya estudiaste.':'Un bloque de cinco preguntas para avanzar sin perderte.'};
}
