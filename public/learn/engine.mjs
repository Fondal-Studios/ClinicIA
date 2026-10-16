import {initialState,normalizeState,dayKey} from './fondal-core.mjs';
import {questions} from './courses.mjs';
export const skills=['reconocimiento','rcp','ritmos','secuencia','estabilidad'];
export const fresh=()=>({...initialState(),version:2,evidence:{},reviews:{},cases:{}});
export function restore(raw){const out={...normalizeState(raw),evidence:{},reviews:{},cases:{}};
 for(const q of questions){const e=raw?.evidence?.[q.id];if(e && Number.isInteger(e.correct)&&Number.isInteger(e.total)&&e.total>=e.correct&&e.correct>=0&&e.total<=100000)out.evidence[q.id]={correct:e.correct,total:e.total};const r=raw?.reviews?.[q.id];if(r&&Number.isFinite(r.due)&&Number.isInteger(r.level)&&r.level>=0&&r.level<=5)out.reviews[q.id]={due:r.due,level:r.level};}
 for(const id of ['fv','aesp','taqui'])if(raw?.cases?.[id]===true)out.cases[id]=true;return out;}
export function answer(state,id,right,now=Date.now()){if(!questions.some(q=>q.id===id)||typeof right!=='boolean')return state;
 const old=state.evidence[id]||{correct:0,total:0},level=right?Math.min(5,(state.reviews[id]?.level||0)+1):0;
 return {...state,evidence:{...state.evidence,[id]:{correct:old.correct+Number(right),total:old.total+1}},reviews:{...state.reviews,[id]:{level,due:now+(right?[1,3,7,14,30][level-1]*86400000:0)}},days:[...new Set([...state.days,dayKey(new Date(now))])]};}
export function competencies(state){return skills.map(skill=>{const qs=questions.filter(q=>q.skill===skill);const scores=qs.map(q=>state.evidence[q.id]);const assessed=scores.filter(Boolean).length;const score=assessed?Math.round(scores.reduce((n,e)=>n+(e?e.correct/e.total:0),0)/qs.length*100):0;return {skill,score,assessed,total:qs.length};}).sort((a,b)=>b.score-a.score);}
export const dueQuestions=(state,now=Date.now())=>questions.filter(q=>state.reviews[q.id]?.due<=now);
export const nextQuestions=state=>[...questions].sort((a,b)=>(state.evidence[a.id]?.total||0)-(state.evidence[b.id]?.total||0)).slice(0,4);
