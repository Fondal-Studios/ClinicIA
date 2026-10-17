import {freshWallet,restoreWallet,grant} from './market.mjs';
import {initialState,normalizeState,dayKey} from './fondal-core.mjs';
import {courses,questions} from './courses.mjs';
import {cases,restoreCase} from './cases.mjs';
const knownCourse=id=>courses.some(c=>c.id===id);
const validCount=n=>Number.isInteger(n)&&n>=0&&n<=100000;
export const fresh=()=>({...initialState(),version:3,current:'examen-unico',wallet:freshWallet(),examHistory:[],bookmarks:{},evidence:{},reviews:{},cases:{},caseDrafts:{},theoryRead:{},passedLessons:{}});
export function restore(raw){
 const base=normalizeState(raw&&typeof raw==='object'?{...raw,version:2}:null);
 const out={...fresh(),...base,version:3,current:knownCourse(raw?.current)?raw.current:'examen-unico',evidence:{},reviews:{},cases:{},caseDrafts:{},theoryRead:{},passedLessons:{}};
 for(const q of questions){
  const e=raw?.evidence?.[q.id];
  if(e&&validCount(e.correct)&&validCount(e.total)&&e.total>0&&e.total>=e.correct)out.evidence[q.id]={correct:e.correct,total:e.total};
  const r=raw?.reviews?.[q.id];
  if(r&&Number.isFinite(r.due)&&r.due>=0&&Number.isInteger(r.level)&&r.level>=0&&r.level<=5)out.reviews[q.id]={due:r.due,level:r.level};
 }
 for(const c of courses){
  for(const [i,l] of c.lessons.entries()){
   if(raw?.theoryRead?.[l.id]===true)out.theoryRead[l.id]=true;
   if(raw?.passedLessons?.[l.id]===true||(raw?.version===2&&i<(base.progress[c.id]||0)))out.passedLessons[l.id]=true;
  }
  out.progress[c.id]=c.lessons.filter(l=>out.passedLessons[l.id]).length;
 }
 for(const c of cases){if(raw?.cases?.[c.id]===true)out.cases[c.id]=true;const draft=restoreCase(raw?.caseDrafts?.[c.id]);if(draft&&draft.id===c.id)out.caseDrafts[c.id]=draft;}
 out.wallet=restoreWallet(raw?.wallet);
 out.bookmarks=Object.fromEntries(questions.filter(q=>raw?.bookmarks?.[q.id]===true).map(q=>[q.id,true]));
 out.examHistory=(Array.isArray(raw?.examHistory)?raw.examHistory:[]).filter(e=>e&&Array.isArray(e.rows)&&Array.isArray(e.areas)&&e.rows.every(r=>r&&questions.some(q=>q.id===r.id))&&e.areas.every(a=>a&&typeof a.area==='string'&&Number.isFinite(a.total)&&Number.isFinite(a.correct))&&Number.isFinite(e.elapsedMs)&&typeof e.id==='string'&&Number.isFinite(e.completedAt)&&Number.isInteger(e.correct)&&Number.isInteger(e.total)&&e.correct>=0&&e.correct<=e.total&&e.total>0&&e.total<=questions.length).slice(-30);
 return out;
}
export function answer(state,id,right,now=Date.now()){
 if(!questions.some(q=>q.id===id)||typeof right!=='boolean')return state;
 const old=state.evidence[id]||{correct:0,total:0},level=right?Math.min(5,(state.reviews[id]?.level||0)+1):0;
 let wallet=state.wallet||freshWallet();
 if(right&&!state.evidence[id])wallet=grant(wallet,'first:'+id,1);
 const day=dayKey(new Date(now)),reviewKey=`review:${day}:${id}`;
 if(right&&state.reviews[id]?.level>=1&&state.reviews[id].due<=now&&Object.keys(wallet.ledger).filter(k=>k.startsWith(`review:${day}:`)).length<5)wallet=grant(wallet,reviewKey,1);
 return {...state,wallet,evidence:{...state.evidence,[id]:{correct:old.correct+Number(right),total:old.total+1}},reviews:{...state.reviews,[id]:{level,due:now+(right?[1,3,7,14,30][level-1]*86400000:0)}},days:[...new Set([...state.days,dayKey(new Date(now))])]};
}
export function finishLesson(state,courseId,lessonId,results){
 const course=courses.find(c=>c.id===courseId),lesson=course?.lessons.find(l=>l.id===lessonId);
 if(!lesson||!Array.isArray(results)||results.length!==lesson.questions.length)return state;
 if(new Set(results.map(r=>r.id)).size!==results.length||results.some(r=>typeof r.right!=='boolean'||!lesson.questions.some(q=>q.id===r.id)))return state;
 if(results.filter(r=>r.right).length/results.length<.8)return state;
 const passedLessons={...state.passedLessons,[lessonId]:true};
 let wallet=state.wallet||freshWallet();
 if(results.every(r=>r.right))wallet=grant(wallet,'perfect:'+lessonId,5);
 if(course.lessons.every(l=>passedLessons[l.id]))wallet=grant(wallet,'course:'+courseId,20);
 return {...state,wallet,passedLessons,progress:{...state.progress,[courseId]:course.lessons.filter(l=>passedLessons[l.id]).length}};
}
export function competencies(state,courseId=state.current||'acls'){
 const pool=questions.filter(q=>q.courseId===courseId);
 return [...new Set(pool.map(q=>q.skill))].map(skill=>{const qs=pool.filter(q=>q.skill===skill),scores=qs.map(q=>state.evidence[q.id]),assessed=scores.filter(Boolean).length;
 return {skill,score:assessed?Math.round(scores.reduce((n,e)=>n+(e?e.correct/e.total:0),0)/qs.length*100):0,assessed,total:qs.length};}).sort((a,b)=>b.score-a.score);
}
export const courseQuestions=id=>questions.filter(q=>q.courseId===id);
export const dueQuestions=(state,now=Date.now(),courseId=state.current||'acls')=>courseQuestions(courseId).filter(q=>state.reviews[q.id]?.due<=now);
export const errorQuestions=(state,courseId=state.current||'acls')=>courseQuestions(courseId).filter(q=>state.reviews[q.id]?.level===0);
export const nextQuestions=(state,courseId=state.current||'acls')=>[...courseQuestions(courseId)].sort((a,b)=>(state.evidence[a.id]?.total||0)-(state.evidence[b.id]?.total||0)).slice(0,10);
