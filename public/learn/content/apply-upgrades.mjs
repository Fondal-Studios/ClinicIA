// Applies the reviewed distractor/prompt/why overlay. The keyed correct option (text and position) must match or the entry is skipped.
import {questionUpgrades} from './question-upgrades.mjs';
export function applyQuestionUpgrades(courses){
 let n=0;
 for(const c of courses)for(const l of c.lessons)for(const q of l.questions||[]){
  const u=questionUpgrades[q.id];
  if(!u||!Array.isArray(u.options)||u.options.length!==q.options.length||u.options[q.answer]!==q.options[q.answer])continue;
  q.options=[...u.options];if(u.prompt)q.prompt=u.prompt;if(u.why)q.why=u.why;n++;
 }
 return n;
}
