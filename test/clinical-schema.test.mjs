import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const {normalizeConsulta,normalizePatient}=createRequire(import.meta.url)('../netlify/lib/clinical-schema.js');
test('consulta output is rebuilt to the exact schema: no unknown keys, coerced enums, nothing invented',()=>{
 assert.equal(normalizeConsulta(null),null);assert.equal(normalizeConsulta([]),null);
 const empty=normalizeConsulta({});assert.deepEqual(empty.motivo_consulta,{texto:null,estado:'no_registrado'});assert.deepEqual(empty.plan,[]);assert.equal(empty.examen_fisico.TA,null);assert.deepEqual(Object.keys(empty).length,15);
 const out=normalizeConsulta({evil:'x',motivo_consulta:{texto:' dolor ',estado:'raro'},alergias:[{texto:'penicilina',estado:'inventado'},{texto:'  '},'x'],impresion_diagnostica:[{texto:'IAM',tipo:'confirmado'},{texto:'EPOC',tipo:'??'}],
  examen_fisico:{TA:'120/80',FC:90,extra:'z'},transcripcion_interpretada:[{hablante:'ROBOT',texto:'hola'}],medicacion_habitual:[{texto_original:'ibu',dosis:5}],enfermedad_actual:{fragmentos:['a',5,''],editado:''}});
 assert.equal(out.evil,undefined);assert.deepEqual(out.motivo_consulta,{texto:'dolor',estado:'registrado'});assert.deepEqual(out.alergias,[{texto:'penicilina',estado:'positivo'}]);
 assert.deepEqual(out.impresion_diagnostica.map(x=>x.tipo),['confirmado','diferencial_o_a_descartar']);assert.equal(out.examen_fisico.FC,null);assert.equal(out.examen_fisico.extra,undefined);
 assert.equal(out.transcripcion_interpretada[0].hablante,'INCIERTO');assert.deepEqual(out.medicacion_habitual[0],{texto_original:'ibu',principio_activo_probable:'',dosis:null,frecuencia:null});assert.deepEqual(out.enfermedad_actual,{fragmentos:['a'],editado:null});
});
test('patient output keeps only valid fields',()=>{
 assert.deepEqual(normalizePatient({nombre:'Ana',sexo:'X',fechaNacimiento:'1980-13-45',fechaEsAproximada:'si',x:1}),{nombre:'Ana',apellido:null,dni:null,telefono:null,sexo:null,obraSocial:null,nroAfiliado:null,domicilio:null,fechaNacimiento:null,fechaEsAproximada:false});
 assert.equal(normalizePatient({fechaNacimiento:'1980-05-02',sexo:'Femenino',fechaEsAproximada:true}).fechaNacimiento,'1980-05-02');
});
