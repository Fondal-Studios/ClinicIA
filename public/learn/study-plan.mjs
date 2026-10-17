import {courseQuestions,dueQuestions,errorQuestions} from './engine.mjs';
export function studyPlan(state,courseId=state.current,now=Date.now()){
 const all=courseQuestions(courseId),errors=errorQuestions(state,courseId),due=dueQuestions(state,now,courseId);
 const byDue=(a,b)=>state.reviews[a.id].due-state.reviews[b.id].due;
 const leastPracticed=[...all].sort((a,b)=>(state.evidence[a.id]?.total||0)-(state.evidence[b.id]?.total||0));
 const review=[...new Map([...errors.sort(byDue),...due.sort(byDue)].map(q=>[q.id,q])).values()];
 const unseen=all.filter(q=>!state.evidence[q.id]);
 // Reserve room for discovery so a large review queue cannot trap a returning learner.
 const ids=[...new Set([...review.slice(0,3),...unseen.slice(0,2),...review.slice(3),...leastPracticed].map(q=>q.id))].slice(0,5);
 const areas=[...new Set(all.map(q=>q.area))].map(area=>{const qs=all.filter(q=>q.area===area),seen=qs.filter(q=>state.evidence[q.id]);return {area,seen:seen.length,total:qs.length,errors:errors.filter(q=>q.area===area).length};});
 return {ids,errors:errors.length,due:due.length,seen:all.filter(q=>state.evidence[q.id]).length,total:all.length,areas,reason:review.length&&unseen.length?'Primero errores y repasos pendientes, con espacio para descubrir conceptos nuevos.':errors.length?'Primero tus errores; después, lo que toca repasar.':due.length?'Tu próximo bloque recupera conceptos que ya estudiaste.':'Un bloque de cinco preguntas para avanzar sin perderte.'};
}
