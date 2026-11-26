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
import {prescriptionText,recetarioUrl,RECETARIOS} from '../public/consultorio-lib.mjs';
test('recetario: texto con los datos mínimos, dirección https válida y registro opcional de la receta emitida',()=>{
 const t=prescriptionText({name:'Ana Pérez',dni:'30111222',birth:'1970-05-01',coverage:'OSDE',phone:'',notes:'no se copia'},{diagnostico:'Hipertensión arterial',tratamiento:'Enalapril según indicación',antecedentes:'privado',enfermedad:'privado'});
 assert.equal(t,'PACIENTE: Ana Pérez\nDNI: 30111222\nFECHA DE NACIMIENTO: 1970-05-01\nCOBERTURA: OSDE\nDIAGNÓSTICO: Hipertensión arterial\nINDICACIONES / TRATAMIENTO: Enalapril según indicación');
 assert.ok(!/privado|no se copia|TELÉFONO/.test(t),'no se copian antecedentes, notas ni campos vacíos');
 assert.equal(prescriptionText({name:'Luis'},{motivo:'Control'}),'PACIENTE: Luis\nDIAGNÓSTICO: Control','sin diagnóstico usa el motivo');
 assert.equal(recetarioUrl(),RECETARIOS[0].url);assert.equal(recetarioUrl({id:'receto'}),'https://receto.com.ar/app');
 assert.equal(recetarioUrl({id:'otro',url:'https://mi-recetario.example/app'}),'https://mi-recetario.example/app');
 for(const bad of ['http://inseguro.example','javascript:alert(1)','no es url',''])assert.equal(recetarioUrl({id:'otro',url:bad}),'','rechaza '+bad);
 const st=createStore(mem());const p=st.addPatient({name:'Ana Pérez'});const v=st.addVisit(p.id,'2026-12-01T10:00:00Z');
 st.markPrescribed(v.id,{platform:'Receto',ref:'ABC-123'});assert.equal(st.state.visits[0].prescriptions[0].ref,'ABC-123');assert.throws(()=>st.markPrescribed('no'),/no encontrado/);
 assert.equal(createStore(Object.assign(mem(),{}) ).state.visits.length,0);
});
import {normDoc,displayName,ageOf,csvOfPatients,csvOfVisits,planillaHtml,storeKeyFor,migrateLegacyKey} from '../public/consultorio-lib.mjs';
const person=(o={})=>({lastName:'López',firstName:'María',dni:'30.111.222',birth:'1970-05-01',sex:'F',phone:'3875551234',coverage:'OSDE',affiliate:'123',background:'HTA',allergies:'Penicilina',...o});
test('Mis pacientes: alta con datos filiatorios e historia resumida; el DNI se normaliza y no se puede repetir',()=>{
 const st=createStore(mem());
 assert.throws(()=>st.addPatient({lastName:'L',firstName:'María'}),/apellido/);assert.throws(()=>st.addPatient({lastName:'López',firstName:''}),/nombre/);
 assert.throws(()=>st.addPatient(person({dni:'12'})),/documento/);assert.throws(()=>st.addPatient(person({birth:'2999-01-01'})),/nacimiento/);assert.throws(()=>st.addPatient(person({email:'no'})),/correo/);
 const p=st.addPatient(person());assert.equal(p.dni,'30111222');assert.equal(p.name,'María López');assert.equal(displayName(p),'López, María');assert.equal(p.allergies,'Penicilina');assert.equal(p.affiliate,'123');
 const dup=(()=>{try{st.addPatient(person({firstName:'Otra',dni:'30111222'}));}catch(e){return e;}})();assert.match(dup.message,/Ya existe un paciente con el documento 30111222/);assert.equal(dup.duplicate.id,p.id);
 const q=st.addPatient(person({lastName:'Pérez',firstName:'Juan',dni:'25000111'}));assert.throws(()=>st.updatePatient(q.id,{dni:'30.111.222'}),/ya pertenece a López, María/);
 st.updatePatient(q.id,{phone:'3875000000',allergies:'Ninguna'});assert.equal(st.patient(q.id).phone,'3875000000');assert.equal(st.patient(q.id).lastName,'Pérez','editar un campo no pierde los demás');
 assert.equal(st.addPatient({lastName:'Gil',firstName:'Rosa'}).dni,'','el documento es opcional');assert.equal(st.addPatient({lastName:'Gil',firstName:'Ana'}).dni,'','sin documento no hay duplicado');
 assert.equal(st.addPatient({name:'Luis Díaz'}).lastName,'Díaz','compatibilidad con «Nombre Apellido»');assert.equal(st.addPatient({name:'Soto, Ema'}).firstName,'Ema');
});
test('búsqueda por apellido o documento: sin tildes, parcial, con puntos; orden alfabético por apellido',()=>{
 const st=createStore(mem());for(const [l,f,d] of [['Pérez','Juan','25000111'],['López','María','30111222'],['Álvarez','Zoe','27333444'],['Lopez','Hugo','']])st.addPatient({lastName:l,firstName:f,dni:d});
 assert.deepEqual(st.search('').map(displayName),['Álvarez, Zoe','Lopez, Hugo','López, María','Pérez, Juan'],'todos, por apellido');
 assert.deepEqual(st.search('lopez').map(displayName),['Lopez, Hugo','López, María'],'sin tildes');assert.deepEqual(st.search('LÓP').map(displayName),['Lopez, Hugo','López, María'],'parcial y en mayúsculas');
 assert.deepEqual(st.search('30111222').map(displayName),['López, María']);assert.deepEqual(st.search('30.111.222').map(displayName),['López, María'],'con puntos');assert.deepEqual(st.search('3011').map(displayName),['López, María'],'documento parcial');
 assert.deepEqual(st.search('maría lópez').map(displayName),['López, María'],'nombre y apellido juntos');assert.deepEqual(st.search('alvarez').map(displayName),['Álvarez, Zoe']);
 assert.deepEqual(st.search('zzz'),[]);assert.equal(st.findByDni('30.111.222').lastName,'López');assert.equal(st.findByDni('99999999'),null);assert.equal(normDoc(' 30.111-222 '),'30111222');
});
test('historial: consultas atendidas y pendientes por paciente; consulta sin turno; edad',()=>{
 const st=createStore(mem());const p=st.addPatient(person()),o=st.addPatient(person({lastName:'Otro',dni:'11222333'}));
 const a=st.addVisit(p.id,'2026-01-10T10:00:00Z','Control'),b=st.startVisitNow(p.id,'Dolor de cabeza');st.addVisit(o.id,'2026-01-11T10:00:00Z');
 st.saveRecord(a.id,{sections:{motivo:'Control',diagnostico:'HTA'},validated:true,doctor:'Dra. Gómez'});
 assert.equal(st.visitsOf(p.id).length,2);assert.equal(st.historyOf(p.id).length,1);assert.equal(st.lastVisitOf(p.id).id,a.id);assert.equal(st.lastVisitOf(o.id),null,'sin atendidas no hay última consulta');
 assert.equal(st.visitsOf(p.id)[0].id,b.id,'la más reciente primero');st.cancelVisit(b.id);assert.equal(st.visitsOf(p.id).length,1,'las canceladas no figuran');
 assert.equal(ageOf('1970-05-01',new Date('2026-05-01')),56);assert.equal(ageOf('1970-05-02',new Date('2026-05-01')),55);assert.equal(ageOf(''),null);
});
test('los pacientes se guardan separados por cuenta en el dispositivo y no se mezclan; los datos anteriores se copian a la primera cuenta',()=>{
 const m=mem();const old=createStore(m);old.addPatient({name:'Ana Pérez',dni:'1111111'});
 const k1=storeKeyFor({id:'u1'}),k2=storeKeyFor({id:'u2'});assert.notEqual(k1,k2);assert.equal(storeKeyFor(null),'clinia_consultorio_v2:local');
 assert.equal(migrateLegacyKey(m,k1),true);assert.equal(migrateLegacyKey(m,k1),false,'no pisa lo ya migrado');
 const a=createStore(m,k1),b=createStore(m,k2);assert.equal(a.state.patients.length,1);assert.equal(a.state.patients[0].lastName,'Pérez','el paciente antiguo se actualiza al formato nuevo');assert.equal(b.state.patients.length,0,'otra cuenta no ve esos pacientes');
 b.addPatient(person());assert.equal(createStore(m,k1).state.patients.length,1);assert.equal(createStore(m,k2).state.patients.length,1);assert.notEqual(createStore(m,k1).state.patients[0].id,createStore(m,k2).state.patients[0].id);
});
test('listado CSV y planilla imprimible: sin fórmulas peligrosas y con todo escapado',()=>{
 const st=createStore(mem());const p=st.addPatient(person({lastName:'=cmd',firstName:'<b>X</b>',notes:'</p><script>alert(1)</script>'}));const v=st.addVisit(p.id,'2026-01-10T10:00:00Z');st.saveRecord(v.id,{sections:{motivo:'<img src=x onerror=alert(1)>',tratamiento:'Reposo'},validated:true,doctor:'Dra. Gómez'});
 const csv=csvOfPatients(st);assert.match(csv,/"'=cmd"/,'una celda que empieza con = se neutraliza');assert.match(csv.split('\n')[0],/^Apellido,Nombre,Documento/);assert.match(csvOfVisits(st,st.done()),/Dra\. Gómez/);
 const html=planillaHtml(st.patient(p.id),st.visitsOf(p.id),{doctor:'Dra. Gómez',now:new Date('2026-06-01')});
 assert.match(html,/Planilla de paciente/);assert.match(html,/Datos filiatorios/);assert.match(html,/Historia clínica resumida/);assert.match(html,/Historial de consultas/);assert.match(html,/Penicilina/);assert.match(html,/Reposo/);assert.match(html,/Validó Dra\. Gómez/);
 assert.ok(!html.includes('<script>')&&!html.includes('<img src=x')&&!html.includes('<b>X</b>'),'todo el contenido va escapado');
});
