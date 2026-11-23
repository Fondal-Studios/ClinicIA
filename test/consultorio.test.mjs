import test from 'node:test';import assert from 'node:assert/strict';
import {sectionize,createStore,SECTIONS} from '../public/consultorio-lib.mjs';
const mem=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v))};};
test('el dictado se reparte en secciones según los títulos hablados, con y sin tildes',()=>{
 const s=sectionize('Datos personales. María López, 54 años, jubilada. Antecedentes: hipertensión y diabetes tipo 2. Motivo de consulta, dolor torácico de dos días. Enfermedad actual: dolor opresivo al esfuerzo. Tratamiento: reposo, control en 48 horas.');
 assert.match(s.datos,/^María López/);assert.match(s.antecedentes,/^hipertensión y diabetes/);assert.match(s.motivo,/^dolor torácico/);assert.match(s.enfermedad,/^dolor opresivo/);assert.match(s.tratamiento,/^reposo/);assert.equal(s.sinClasificar,'');
 const t=sectionize('buenas tardes, ANTECEDENTES nada para destacar, Enfermedad actual tos seca');assert.equal(t.sinClasificar,'buenas tardes,');assert.equal(t.antecedentes.replace(/,$/,''),'nada para destacar');assert.equal(t.enfermedad,'tos seca');
 const u=sectionize('texto libre sin títulos');assert.equal(u.sinClasificar,'texto libre sin títulos');assert.ok(SECTIONS.every(([k])=>u[k]===''));
 assert.equal(sectionize('').sinClasificar,'');
});
test('pacientes y turnos: pendientes y dados; solo la validación del médico cierra el turno; no se cancela un turno atendido',()=>{
 const st=createStore(mem());const p=st.addPatient({name:'Ana Pérez',dni:'30111222'});assert.throws(()=>st.addPatient({name:'A'}));
 const v=st.addVisit(p.id,'2026-12-01T10:00:00Z','Control');assert.equal(st.pending().length,1);assert.throws(()=>st.addVisit('no',new Date()),/paciente/);assert.throws(()=>st.addVisit(p.id,'ayer'),/inválidas/);
 const sections={motivo:'Control anual',tratamiento:'Continuar'};
 st.saveRecord(v.id,{sections,transcript:'texto',validated:false});assert.equal(st.pending().length,1,'sin validar sigue pendiente (borrador)');assert.equal(st.done().length,0);
 assert.throws(()=>st.saveRecord(v.id,{sections,validated:true,doctor:''}),/nombre del médico/);
 st.saveRecord(v.id,{sections,transcript:'texto',validated:true,doctor:'Dra. Gómez'});assert.equal(st.pending().length,0);assert.equal(st.done().length,1);assert.equal(st.historyOf(p.id)[0].validatedBy,'Dra. Gómez');
 assert.throws(()=>st.cancelVisit(v.id),/no se cancela/);const w=st.addVisit(p.id,'2026-12-02T10:00:00Z');st.cancelVisit(w.id);assert.equal(st.pending().length,0);assert.throws(()=>st.saveRecord(w.id,{sections,validated:true,doctor:'Dra. Gómez'}),/cancelado/);
 assert.deepEqual(st.search('perez').map(x=>x.name),['Ana Pérez']);assert.deepEqual(st.search('3011').map(x=>x.name),['Ana Pérez']);
});
test('los datos viven solo en el almacenamiento local, se exportan, se importan y se pueden borrar',()=>{
 const m=mem(),a=createStore(m);const p=a.addPatient({name:'Luis Díaz'});a.addVisit(p.id,'2026-12-03T09:00:00Z');
 const backup=a.exportJSON();const b=createStore(mem());assert.deepEqual(b.importJSON(backup),{patients:1,visits:1});assert.equal(b.state.patients[0].name,'Luis Díaz');
 assert.throws(()=>b.importJSON('{"x":1}'),/respaldo/);assert.throws(()=>b.importJSON('no json'),/válido/);
 assert.equal(createStore(m).state.patients.length,1,'persiste al recargar');a.wipe();assert.equal(createStore(m).state.patients.length,0);
 const c=createStore(mem());assert.equal(c.importLegacy({patients:{1:{nombre:'Rosa Gil'},2:{}},encounters:{9:{patientId:'1',motivo:'Tos',createdAt:1700000000000,resumen:'tos seca'}}}),1);assert.equal(c.done().length,1);assert.equal(c.done()[0].record.enfermedad,'tos seca');
});
