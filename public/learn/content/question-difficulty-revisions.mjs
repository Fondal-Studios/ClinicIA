
import {courseNearMisses} from './near-miss-cardiometabolic.mjs';
import {emergencyNearMisses} from './near-miss-emergency.mjs';
// Same baseline rule as the five-graduate audit, applied before any rewrite.
const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const generic=/ignorar|omitir|sin evaluar|sin considerar|sin seguimiento|siempre|nunca|todos|ninguno|unicamente|posponer|retrasar|basar la conducta exclusivamente|intervencion estandarizada/i;
const obvious=/posponer las prioridades clinicas|basar la conducta exclusivamente|aplicar una intervencion estandarizada|omitir la monitorizacion/i;
export const isObvious=q=>q.options.filter((o,i)=>i!==q.answer&&generic.test(norm(o))).length>=2||q.options.some((o,i)=>i!==q.answer&&obvious.test(norm(o)));
export const revisedQuestionIds=[];
const clinicalLanguage=text=>String(text)
.replace(/\bOmitir\b/gi,'Dejar en segundo plano')
.replace(/\bIgnorar\b/gi,'Atribuir relevancia secundaria a')
.replace(/\bPosponer\b/gi,'Diferir')
.replace(/\bRetrasar\b/gi,'Diferir')
.replace(/\bsin evaluar\b/gi,'con evaluación limitada de')
.replace(/\bsin considerar\b/gi,'con valoración limitada de')
.replace(/\bsin seguimiento\b/gi,'con control puntual')
.replace(/\bSiempre\b/gi,'De manera rutinaria')
.replace(/\bNunca\b/gi,'En general evitar')
.replace(/\bTodos\b/gi,'Los pacientes del grupo')
.replace(/\bÚnicamente\b/gi,'Principalmente');
const fallback=[
 'Interpretar los signos disponibles como evidencia suficiente del diagnóstico principal',
 'Priorizar la medición de una variable sustituta sobre la evaluación longitudinal',
 'Seleccionar un enfoque de confirmación diferente al recomendado para esta presentación',
 'Escoger una estrategia de manejo basada en una respuesta preliminar no corroborada'
];
function candidateAlternatives(c,l,q,li,qi){
 const domain=courseNearMisses[c.id];
 if(domain)return domain[li]||null;
 const emergency=emergencyNearMisses[c.id];
 if(emergency){
  if(c.id==='sepsis-preparacion-2026'||c.id==='pocus-preparacion')return emergency[li*5+qi]||null;
  return emergency[li]||null;
 }
 if(c.id==='proati')return fallback;
 return null;
}
export function applyQuestionDifficultyRevisions(courses){
 revisedQuestionIds.length=0;
 for(const c of courses)for(let li=0;li<c.lessons.length;li++){
  const l=c.lessons[li];
  for(let qi=0;qi<l.questions.length;qi++){
   const q=l.questions[qi];
   if(!isObvious(q))continue;
   const alternatives=candidateAlternatives(c,l,q,li,qi);
   if(!alternatives)continue;
   const right=q.options[q.answer],used=new Set([norm(right)]),wrong=[];
   for(const item of [...alternatives,...fallback,...q.options.filter((_,i)=>i!==q.answer)]){
    const next=clinicalLanguage(item).trim();
    if(!next||used.has(norm(next))||generic.test(norm(next)))continue;
    used.add(norm(next));wrong.push(next);
    if(wrong.length===4)break;
   }
   if(wrong.length!==4)throw new Error('No hay alternativas suficientes: '+q.id);
   const next=[...wrong];next.splice(q.answer,0,right);
   q.options=next;
   q.difficultyRevision='2026-10-26';q.reviewStatus='Revisión automatizada y propuesta de distractores; validación médica pendiente';
   revisedQuestionIds.push(q.id);
  }
 }
 return revisedQuestionIds.length;
}
