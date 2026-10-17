import test from 'node:test';
import assert from 'node:assert/strict';
import {cases,startCase,choose,advance,restoreCase,caseSummary} from '../public/learn/cases.mjs';
import {fresh,restore} from '../public/learn/engine.mjs';

test('every case survives reload before and after wrong answers, retries and advancement',()=>{
 for(const c of cases){
  let sim=startCase(c.id);
  for(let i=0;i<c.steps.length;i++){
   sim=restoreCase(JSON.parse(JSON.stringify(sim)));
   assert.equal(sim.step,i);
   const step=c.steps[i];
   sim=choose(sim,(step.answer+1)%step.options.length);
   const pending=restoreCase(JSON.parse(JSON.stringify(sim)));
   assert.equal(pending.feedback.right,false);
   assert.equal(pending.errors,i+1);
   assert.equal(choose(pending,step.answer),pending);
   sim=advance(pending);
   sim=restoreCase(sim);
   assert.equal(sim.step,i);
   sim=choose(sim,step.answer);
   assert.equal(restoreCase(sim).feedback.right,true);
   sim=advance(sim);
  }
  assert.equal(sim.finished,true);
  assert.equal(restoreCase(sim),null);
  assert.deepEqual(caseSummary(sim),{total:c.steps.length,firstTry:0,reviewSteps:c.steps.map((_,i)=>i)});
 }
});
test('case restoration rejects invalid paths and rebuilds counts and feedback without trusting stored HTML',()=>{
 const c=cases[0],sim=choose(startCase(c.id),c.steps[0].answer);
 const restored=restoreCase({...sim,attempts:999,errors:999,feedback:{text:'<script>bad</script>'}});
 assert.equal(restored.attempts,1);assert.equal(restored.errors,0);assert.equal(restored.feedback.text,c.steps[0].why);
 for(const raw of [{...sim,revision:0},{...sim,step:99},{...sim,history:[{step:1,selected:0}]},{...sim,history:[{step:0,selected:100}]},{...sim,history:Array(501).fill({step:0,selected:0})}])assert.equal(restoreCase(raw),null);
});
test('account and guest progress retain independent course drafts without tutor conversations',()=>{
 const state=fresh();
 for(const c of cases){state.caseDrafts[c.id]={...choose(startCase(c.id),c.steps[0].answer),tutorOpen:true,chat:'private text'};}
 const loaded=restore(JSON.parse(JSON.stringify(state)));
 assert.equal(Object.keys(loaded.caseDrafts).length,cases.length);
 for(const draft of Object.values(loaded.caseDrafts)){assert.equal(draft.feedback.right,true);assert.equal(draft.chat,undefined);assert.equal(draft.tutorOpen,undefined);}
});
test('case debrief distinguishes first-attempt success from a corrected answer',()=>{
 const c=cases[0];let sim=startCase(c.id);
 for(const step of c.steps)sim=advance(choose(sim,step.answer));
 assert.equal(caseSummary(sim).firstTry,c.steps.length);assert.deepEqual(caseSummary(sim).reviewSteps,[]);
});
