import test from 'node:test';import assert from 'node:assert/strict';
import {SECTIONS,MEDICOS_ESPECIALIDADES,MEDICOS_EXAMENES,ENTRY_VIEWS,entryView,clicksTo,courseOf,courseHref} from '../public/entrada.mjs';
import {courses} from '../public/learn/courses.mjs';import {trainingCourses} from '../public/learn/content/capacitacion-catalog.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const links=html=>[...html.matchAll(/class="primary" href="([^"]+)"/g)].map(m=>m[1]);
test('entry map: Inicio offers Alumno, Instructor or Modo profesional; Alumno offers three profiles; sanitario offers kinesiología, enfermería and nutrición',()=>{
 const hub=entryView('hub',{courses,esc});assert.deepEqual(links(hub),['#alumno','/instructor.html','/consultorio.html']);
 assert.deepEqual(links(entryView('alumno',{courses,esc})),['#primeros-respondedores','#personal-sanitario','#medicos']);
 assert.deepEqual(links(entryView('personal-sanitario',{courses,esc})),['#kinesiologia','#enfermeria','#nutricion']);
 assert.deepEqual(links(entryView('medicos',{courses,esc})),[...MEDICOS_ESPECIALIDADES,...MEDICOS_EXAMENES,'medicos-rotantes'].map(a=>'#'+a).concat('#formacion'));
});
test('every course is reachable and within 4 clicks from Inicio; the path is defined by the 3rd click',()=>{
 const refs=Object.values(SECTIONS).flatMap(s=>s.courses);
 for(const r of refs){assert.ok(courseOf(r,courses),'curso inexistente '+JSON.stringify(r));assert.ok(clicksTo(r)<=4,JSON.stringify(r)+' a '+clicksTo(r)+' clics');}
 for(const c of courses)assert.ok(refs.some(r=>r.id===c.id),'curso sin ubicar en el mapa: '+c.id);
 for(const c of trainingCourses)assert.ok(refs.some(r=>r.kind==='training'&&r.id===c.id),'curso de capacitación sin ubicar: '+c.id);
 // al tercer clic (pantalla de área) ya se ve el catálogo de ese perfil
 for(const [k,s] of Object.entries(SECTIONS)){const html=entryView(k,{courses,esc});assert.equal((html.match(/Entrar al curso/g)||[]).length,s.courses.length,k);}
});
test('each profile shows only its own courses and is honest about missing specialties',()=>{
 const pr=entryView('primeros-respondedores',{courses,esc});assert.ok(pr.includes('respuesta-policial')&&!pr.includes('kine-clinica')&&!pr.includes('acls'));
 const k=entryView('kinesiologia',{courses,esc});for(const id of ['kine-clinica','kine-respiratoria','kine-uci','kine-ventilacion'])assert.ok(k.includes('data-id="'+id+'"'));
 for(const v of ['enfermeria','nutricion'])assert.match(entryView(v,{courses,esc}),/en preparación/,v+': debe decir que faltan cursos propios');
 assert.equal(courseHref({kind:'study',id:'acls'}),'#acls/home');assert.equal(courseHref({kind:'training',id:'rot-cirugia'}),'/capacitacion.html?curso=rot-cirugia');
 assert.ok(ENTRY_VIEWS.includes('enfermeria')&&ENTRY_VIEWS.includes('nutricion'));
});
test('no feature is left without a way in: practice and team guard under Médicos, consultorio under Modo profesional, aulas and tutor in the top bar',()=>{
 const med=entryView('medicos',{courses,esc});assert.ok(med.includes('href="#formacion"')&&med.includes('Práctica rápida'),'práctica rápida tiene su sección dentro de Médicos');
 assert.ok(entryView('esp-guardia',{courses,esc}).includes('href="/salas.html"'),'guardia en equipo dentro de Medicina de guardia');
 assert.ok(entryView('hub',{courses,esc}).includes('href="/consultorio.html"'),'Mi consultorio bajo Modo profesional');
 for(const v of ['alumno','medicos'])assert.ok(!entryView(v,{courses,esc}).includes('consultorio'),'el consultorio no se mezcla con el estudio');
});
