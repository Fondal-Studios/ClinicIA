import {courses,questions,sources} from '../public/learn/courses.mjs';
// Question and theory library for teachers: browse the whole bank (answers included) and reuse items in classes.
// Only users with the teacher mode (or admins) can read it, because it exposes correct answers.
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const PAGE=30;
const lessonOf=new Map(courses.flatMap(c=>c.lessons.map(l=>[l.id,{lesson:l,course:c}])));
const indexed=questions.map(q=>({q,text:norm(q.prompt+' '+q.options.join(' ')+' '+q.why)}));
export const canUseLibrary=u=>Boolean(u&&(u.role==='admin'||(u.modes||'').split(',').includes('teacher')));
export function facets(){
 return {courses:courses.map(c=>({id:c.id,title:c.title,audience:c.audience,lessons:c.lessons.length,questions:questions.filter(q=>q.courseId===c.id).length,areas:[...new Set(c.lessons.map(l=>l.area||l.title))].length})),totalQuestions:questions.length,totalLessons:courses.reduce((n,c)=>n+c.lessons.length,0)};
}
const view=({q})=>{const {lesson,course}=lessonOf.get(q.lessonId)||{};return {id:q.id,course:q.courseId,courseTitle:course?.title,lessonId:q.lessonId,lessonTitle:lesson?.title,area:q.area,prompt:q.prompt,options:q.options,answer:q.answer,why:q.why,source:sources[q.source]?{id:q.source,title:sources[q.source].title,url:sources[q.source].url}:null};};
export function search(u,{type='questions',course='',lesson='',q='',page=1}={}){
 if(!canUseLibrary(u))fail(403,'La biblioteca está disponible en modo profesor.');
 const terms=norm(q).split(/\s+/).filter(t=>t.length>2).slice(0,6),pg=Math.max(1,Math.min(500,Number(page)||1));
 if(type==='theory'){
  const rows=courses.filter(c=>!course||c.id===course).flatMap(c=>c.lessons.map(l=>({c,l}))).filter(({l})=>!lesson||l.id===lesson).filter(({l})=>terms.every(t=>norm(l.title+' '+l.body).includes(t)));
  return {total:rows.length,page:pg,pageSize:PAGE,items:rows.slice((pg-1)*PAGE,pg*PAGE).map(({c,l})=>({id:l.id,course:c.id,courseTitle:c.title,title:l.title,area:l.area||null,body:l.body,source:sources[l.source]?{id:l.source,title:sources[l.source].title,url:sources[l.source].url}:null}))};
 }
 if(type!=='questions')fail(400,'Tipo inválido.');
 const rows=indexed.filter(({q:x})=>(!course||x.courseId===course)&&(!lesson||x.lessonId===lesson)).filter(r=>terms.every(t=>r.text.includes(t)));
 return {total:rows.length,page:pg,pageSize:PAGE,items:rows.slice((pg-1)*PAGE,pg*PAGE).map(view)};
}
