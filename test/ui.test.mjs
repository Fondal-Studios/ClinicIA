import test from 'node:test';import assert from 'node:assert/strict';
import {courses,questions} from '../public/learn/courses.mjs';
import {cases} from '../public/learn/cases.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
test('theory never appears before a practice answer; all courses, ECG, review and cases remain isolated',async()=>{
 const handlers={},values={},events={};let html='',stored='';
 const app={set innerHTML(v){html=v;},get innerHTML(){return html;},addEventListener:(n,f)=>handlers[n]=f,querySelector:()=>null};
 global.document={querySelector:s=>s==='#app'?app:{value:values[s]||''}};
 global.window={addEventListener:(n,f)=>events[n]=f,scrollTo:()=>{}};
 let hash='';global.location={get hash(){return hash;},set hash(v){hash=v.startsWith('#')?v:'#'+v;queueMicrotask(()=>events.hashchange?.());}};
 global.localStorage={getItem:()=>null,setItem:(_k,v)=>{if(_k==='clinicia-learning-v1')stored=v;}};global.confirm=()=>true;
 await import('../public/app.mjs');
 const click=async(action,data={})=>{await handlers.click({target:{closest:()=>({dataset:{action,...data}})}});await new Promise(r=>setImmediate(r));};
 const currentQuestion=()=>questions.find(q=>html.includes(`<h1 class="question">${esc(q.prompt)}</h1>`));
 assert.ok(html.includes('Tu próxima plaza'));
 for(const c of courses){
  await click('course',{id:c.id});await click('nav',{view:'theory'});await click('theory',{id:c.lessons[0].id});
  assert.ok(html.includes(esc(c.lessons[0].body.split('\n\n')[0])));await click('read',{id:c.lessons[0].id});
  assert.equal(JSON.parse(stored).progress[c.id]||0,0,'reading must not pass an assessment');
  // Exercises can start from theory, but the worked examples must disappear entirely.
  await click('start',{mode:'lesson',id:c.lessons[0].id});
  for(let i=0;i<c.lessons[0].questions.length;i++){
   const q=currentQuestion();assert.ok(q&&q.courseId===c.id);
   assert.ok(!html.includes(esc(c.lessons[0].body)),'theory leaks before answer');
   assert.ok(!html.includes(esc(q.why)),'feedback leaks before answer');
   assert.ok(!html.includes('class="correct"'),'answer highlighted early');
   await click('answer',{index:String(q.answer)});await click('answer',{index:String(q.answer)});
   assert.ok(html.includes(esc(q.why)));assert.equal(JSON.parse(stored).evidence[q.id].total,1);
   await click('next');
  }
  assert.ok(html.includes('Buen trabajo.'));assert.equal(JSON.parse(stored).progress[c.id],1);
  await click('nav',{view:'cases'});const scenario=cases.find(x=>x.courseId===c.id);if(!scenario)continue;await click('case',{id:scenario.id});
  await click('case-answer',{index:String((scenario.steps[0].answer+1)%scenario.steps[0].options.length)});await click('case-next');
  for(const step of scenario.steps){await click('case-answer',{index:String(step.answer)});await click('case-next');}
  assert.ok(html.includes('Recorrido completado'));assert.equal(JSON.parse(stored).cases[scenario.id],true);
 }
 await click('course',{id:'pals'});await click('start',{mode:'ecg'});let q=currentQuestion();assert.ok(q.rhythm&&q.courseId==='pals');assert.ok(html.includes('<svg'));assert.ok(!html.includes(esc(q.why)));
 await click('answer',{index:String((q.answer+1)%q.options.length)});const missedId=q.id;
 await click('nav',{view:'review'});await click('start',{mode:'errors'});assert.equal(currentQuestion().id,missedId);assert.ok(!html.includes(esc(q.why)));
 await click('answer',{index:String(q.answer)});await click('next');await click('nav',{view:'review'});
 assert.ok(html.includes('data-mode="errors" disabled'),'corrected error should leave error queue');
 await click('course',{id:'fccs'});await click('nav',{view:'tutor'});values['#ask']='¿Cómo reevaluar?';values['#access']='test';let body;
 global.fetch=async(_url,args)=>{body=JSON.parse(args.body);return {ok:false,json:async()=>({error:'Configuración pendiente'})};};
 await click('ask');assert.equal(body.courseId,'fccs');assert.ok(html.includes('Configuración pendiente'));
 await click('nav',{view:'catalog'});assert.ok(html.includes('Revalida · Brasil')&&html.includes('NO BANCO MIR'));
 await click('destination',{id:'revalida',view:'home'});assert.ok(html.includes('20 preguntas originales'));
 await click('nav',{view:'demo'});assert.ok(html.includes('Enlace al demo'));
 await click('start',{mode:'demo'});assert.equal(currentQuestion().courseId,'revalida');
 await click('nav',{view:'exams'});assert.ok(html.includes('Revalida · diagnóstico inicial'));
 await click('exam-start',{id:'revalida-integral'});assert.equal(currentQuestion().courseId,'revalida');
 await click('destination',{id:'acls',view:'exams'});assert.ok(html.includes('Tenés un simulacro en curso'));
 await click('destination',{id:'revalida',view:'exams'});await click('exam-submit');assert.ok(html.includes('Tu resultado'));
 const persisted=JSON.parse(stored);assert.equal(persisted.progress.acls,1);assert.equal(persisted.progress.pals,1);assert.equal(persisted.progress.fccs,1);
});
