// Structural validator for allied-health course files: node tools/check-sanitarios.mjs enfermeria|nutricion
import assert from 'node:assert/strict';
const which=process.argv[2];
const map={enfermeria:['../public/learn/content/enfermeria.mjs','nursing','enfermeria'],nutricion:['../public/learn/content/nutricion.mjs','nutrition','nutricionistas']};
const [file,prefix,pro]=map[which]||[];assert.ok(file,'usage: enfermeria|nutricion');
const m=await import(file);const courses=m[prefix+'Courses'],cases=m[prefix+'Cases'],sources=m[prefix+'Sources'];
assert.equal(courses.length,2,'2 courses');assert.equal(cases.length,2,'2 cases');
const prompts=new Set(),ids=new Set();let words=0;
for(const c of courses){
 assert.equal(c.pathway,'personal-sanitario');assert.equal(c.professionalCategory,pro);assert.equal(c.language,'es');assert.equal(c.lessons.length,5);
 assert.equal(c.lessons.flatMap(l=>l.questions).length,20);assert.equal(c.outcomes.length,5);assert.ok(c.prerequisites&&c.scope&&c.reviewStatus.includes('pendiente'));
 const keys=[0,0,0,0,0];
 for(const l of c.lessons){
  const w=l.body.split(/\s+/).length;words+=w;assert.ok(w>=130&&l.body.includes('\n\n'),l.id+' body');assert.ok(l.objective&&l.trap&&l.evidence,l.id+' fields');
  assert.equal(l.questions.length,4);assert.ok(l.simulation.scenario&&l.simulation.checklist.length>=4,l.id+' sim');assert.equal(l.simulation.required,false);
  assert.ok(l.references.length>=1);for(const id of l.references)assert.ok(sources[id]?.url?.startsWith('https://')&&c.references.includes(id),l.id+' ref '+id);
  for(const q of l.questions){
   assert.ok(!ids.has(q.id),'dup id '+q.id);ids.add(q.id);const p=q.prompt.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();assert.ok(!prompts.has(p),'dup prompt '+q.id);prompts.add(p);
   assert.equal(q.options.length,5,q.id);assert.equal(new Set(q.options).size,5,q.id+' options');assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<5);
   assert.ok(q.why.length>=80,q.id+' why');assert.ok(q.skill&&l.references.includes(q.source),q.id+' source');keys[q.answer]++;
   assert.ok(!/undefined|NaN|\[object/.test(JSON.stringify(q)),q.id);
  }
 }
 assert.deepEqual(keys,[4,4,4,4,4],c.id+' keys '+keys);
}
for(const k of cases){assert.equal(k.steps.length,3);assert.ok(courses.some(c=>c.id===k.courseId&&c.lessons.some(l=>l.id===k.lessonId)));assert.ok(sources[k.source]);for(const s of k.steps){assert.equal(s.options.length,5);assert.ok(s.why.length>=80);assert.ok(Number.isInteger(s.answer))}}
for(const [id,r] of Object.entries(sources)){assert.ok(r.title&&r.url.startsWith('https://')&&r.type&&r.section&&r.year&&r.access&&r.checked==='2026-11-13',id);}
console.log(`OK ${which}: ${courses.length} cursos, ${ids.size} preguntas, ${cases.length} casos, ${Object.keys(sources).length} fuentes, ${words} palabras de teoría`);
