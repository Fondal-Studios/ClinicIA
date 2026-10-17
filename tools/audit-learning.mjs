// Structural gates + editorial triage. Heuristics are NOT clinical validation.
import {questions,courses,sources} from '../public/learn/courses.mjs';
import {cases,startCase,choose,advance,restoreCase} from '../public/learn/cases.mjs';
import assert from 'node:assert/strict';
const issues=[],review=[];
const inspect=(q,id,prompt)=>{
 if(!Array.isArray(q.options)||q.options.length!==5||new Set(q.options.map(o=>o.trim().toLowerCase())).size!==5)issues.push({id,reason:'Opciones inválidas o duplicadas'});
 if(!Number.isInteger(q.answer)||!q.options[q.answer])issues.push({id,reason:'Clave inválida'});
 if(!q.why?.trim()||!prompt?.trim())issues.push({id,reason:'Falta enunciado o fundamento'});
 if(q.optionFeedback&&(q.optionFeedback.length!==q.options.length||q.optionFeedback.some(s=>!s?.trim())))issues.push({id,reason:'Devolución incompleta por alternativa'});
 const reasons=[];
 if(q.why?.length<80)reasons.push('Fundamento breve: revisar si explica el dato decisivo');
 if(q.options.some(o=>/\b(siempre|nunca|solamente|únicamente)\b/i.test(o)))reasons.push('Absolutos: revisar si permiten descarte por estilo');
 const lengths=q.options.map(o=>o.length),correct=lengths[q.answer],other=lengths.filter((_,i)=>i!==q.answer);
 if(correct>Math.max(...other)*1.8)reasons.push('Respuesta correcta mucho más extensa que los distractores');
 if(reasons.length)review.push({id,prompt,reasons});
};
for(const q of questions){inspect(q,q.id,q.prompt);if(!sources[q.source]?.url?.startsWith('https://'))issues.push({id:q.id,reason:'Referencia ausente'});}
let branchChecks=0;
for(const c of cases)for(const [stepIndex,step] of c.steps.entries()){
 inspect(step,`${c.id}:${stepIndex}`,step.text);
 for(let selected=0;selected<step.options.length;selected++){
  let sim=startCase(c.id);for(let i=0;i<stepIndex;i++)sim=advance(choose(sim,c.steps[i].answer));
  sim=choose(sim,selected);assert.equal(sim.feedback.right,selected===step.answer);
  const recovered=restoreCase(JSON.parse(JSON.stringify(sim)));assert.ok(recovered);assert.equal(recovered.feedback.right,sim.feedback.right);
  assert.equal(choose(sim,selected),sim,'double submission');
  const next=advance(recovered);assert.equal(next.step,selected===step.answer?Math.min(stepIndex+1,c.steps.length-1):stepIndex);branchChecks++;
 }
}
const longest=questions.filter(q=>q.options[q.answer].length===Math.max(...q.options.map(o=>o.length))).length;
console.log(JSON.stringify({scope:'Integridad y simulaciones deterministas; no prueba de eficacia educativa ni validación clínica.',courses:courses.length,questions:questions.length,cases:cases.length,decisions:cases.reduce((n,c)=>n+c.steps.length,0),branchChecks,optionFeedback:questions.filter(q=>q.optionFeedback).length,longestOptionHeuristic:{correct:longest,total:questions.length,note:'Incluye empates; no mide dificultad real.'},blockingIssues:issues,editorialReview:review},null,2));
if(issues.length)process.exitCode=1;
