// Server-side validation of model JSON for the consultorio. The model is untrusted: output is rebuilt field by field,
// unknown keys are dropped, enums and types are coerced, and anything unusable becomes null / [] (never invented).
const str=(v,max=4000)=>typeof v==='string'&&v.trim()?v.trim().slice(0,max):null;
const pick=(v,allowed,fallback)=>allowed.includes(v)?v:fallback;
const list=(v,n=60)=>Array.isArray(v)?v.slice(0,n).filter(x=>x&&typeof x==='object'):[];
const texts=(v,extra=()=>({}))=>list(v).map(x=>{const texto=str(x.texto);return texto?{texto,...extra(x)}:null;}).filter(Boolean);
const estado=x=>({estado:pick(x.estado,['positivo','negado_explicitamente'],'positivo')});
const VITALS=['TA','FC','FR','SpO2','T','peso','talla'];

function normalizeConsulta(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const motivo=raw.motivo_consulta&&typeof raw.motivo_consulta==='object'?raw.motivo_consulta:{},mt=str(motivo.texto);
 const ea=raw.enfermedad_actual&&typeof raw.enfermedad_actual==='object'?raw.enfermedad_actual:{};
 const fisico=raw.examen_fisico&&typeof raw.examen_fisico==='object'?raw.examen_fisico:{};
 return {
  motivo_consulta:{texto:mt,estado:mt?'registrado':'no_registrado'},
  enfermedad_actual:{fragmentos:(Array.isArray(ea.fragmentos)?ea.fragmentos:[]).map(f=>str(f)).filter(Boolean).slice(0,60),editado:str(ea.editado,8000)},
  antecedentes_personales:texts(raw.antecedentes_personales,estado),
  antecedentes_quirurgicos:texts(raw.antecedentes_quirurgicos),
  internaciones_previas:texts(raw.internaciones_previas),
  alergias:texts(raw.alergias,estado),
  medicacion_habitual:list(raw.medicacion_habitual).map(m=>{const o=str(m.texto_original);return o?{texto_original:o,principio_activo_probable:str(m.principio_activo_probable,200)||'',dosis:str(m.dosis,200),frecuencia:str(m.frecuencia,200)}:null;}).filter(Boolean),
  habitos:texts(raw.habitos,estado),
  antecedentes_familiares:texts(raw.antecedentes_familiares),
  examen_fisico:Object.fromEntries(VITALS.map(k=>[k,str(fisico[k],60)])),
  estudios_complementarios:texts(raw.estudios_complementarios),
  impresion_diagnostica:texts(raw.impresion_diagnostica,x=>({tipo:pick(x.tipo,['confirmado','diferencial_o_a_descartar'],'diferencial_o_a_descartar')})),
  plan:texts(raw.plan),
  alertas:list(raw.alertas).map(a=>{const texto=str(a.texto);return texto?{texto,campo:str(a.campo,80)||''}:null;}).filter(Boolean),
  transcripcion_interpretada:list(raw.transcripcion_interpretada).map(t=>{const texto=str(t.texto);return texto?{hablante:pick(t.hablante,['MEDICO','PACIENTE','INCIERTO'],'INCIERTO'),texto}:null;}).filter(Boolean)
 };
}

function normalizePatient(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const date=str(raw.fechaNacimiento,10);
 return {
  nombre:str(raw.nombre,100),apellido:str(raw.apellido,100),dni:str(raw.dni,20),telefono:str(raw.telefono,40),
  sexo:pick(raw.sexo,['Masculino','Femenino'],null),obraSocial:str(raw.obraSocial,120),nroAfiliado:str(raw.nroAfiliado,60),domicilio:str(raw.domicilio,200),
  fechaNacimiento:date&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&!Number.isNaN(Date.parse(date))?date:null,
  fechaEsAproximada:raw.fechaEsAproximada===true
 };
}
module.exports={normalizeConsulta,normalizePatient};
