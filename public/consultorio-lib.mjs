// Mi consultorio · lógica local. Sin red: todo vive en el dispositivo (localStorage) y se puede exportar como respaldo.
export const SECTIONS=[['datos','Datos personales'],['antecedentes','Antecedentes'],['motivo','Motivo de consulta'],['enfermedad','Enfermedad actual'],['examen','Examen físico'],['diagnostico','Diagnóstico'],['tratamiento','Tratamiento']];
const KEYS={datos:['datos personales','datos del paciente','filiacion'],antecedentes:['antecedentes'],motivo:['motivo de consulta','motivo'],enfermedad:['enfermedad actual','historia de la enfermedad actual','historia actual'],examen:['examen fisico','examen clinico'],diagnostico:['diagnostico','impresion diagnostica'],tratamiento:['tratamiento','indicaciones']};
const MAP={'á':'a','é':'e','í':'i','ó':'o','ú':'u','ü':'u','ñ':'n','à':'a','è':'e','ì':'i','ò':'o','ù':'u'};
const fold=s=>[...s.toLowerCase()].map(c=>MAP[c]||c).join('');
// Reparte un dictado en secciones según los títulos que el médico dice en voz alta («motivo de consulta…», «antecedentes…»). El texto previo al primer título queda en «sinClasificar».
export function sectionize(text){
 const raw=String(text||''),f=fold(raw),hits=[];
 for(const [key,words] of Object.entries(KEYS))for(const w of words){const re=new RegExp('(^|[^a-z0-9])('+w+')(?![a-z0-9])','g');let m;while((m=re.exec(f))){const at=m.index+m[1].length;hits.push({key,at,end:at+w.length});}}
 hits.sort((a,b)=>a.at-b.at||b.end-a.end);
 const picked=[];for(const h of hits)if(!picked.length||h.at>=picked.at(-1).end)picked.push(h);
 const out=Object.fromEntries([...SECTIONS.map(([k])=>[k,'']),['sinClasificar','']]);
 const clean=t=>t.replace(/^[\s:.,;-]+/,'').replace(/\s+/g,' ').trim();
 if(!picked.length){out.sinClasificar=clean(raw);return out;}
 out.sinClasificar=clean(raw.slice(0,picked[0].at));
 picked.forEach((h,i)=>{const part=clean(raw.slice(h.end,picked[i+1]?picked[i+1].at:raw.length));out[h.key]=out[h.key]?out[h.key]+' '+part:part;});
 return out;
}
const uid=()=>(globalThis.crypto?.randomUUID?.()||String(Date.now())+Math.random().toString(16).slice(2));
export const emptyState=()=>({version:2,patients:[],visits:[]});
export function createStore(storage,key='clinia_consultorio_v2'){
 let state;
 const load=()=>{try{const s=JSON.parse(storage.getItem(key)||'null');state=s&&s.version===2&&Array.isArray(s.patients)&&Array.isArray(s.visits)?s:emptyState();}catch{state=emptyState();}return state;};
 const save=()=>{storage.setItem(key,JSON.stringify(state));};
 load();
 const api={
  get state(){return state;},reload:load,
  addPatient(p){const name=String(p.name||'').trim();if(name.length<2)throw new Error('Escribí el nombre del paciente.');const x={id:uid(),name,dni:String(p.dni||'').trim(),birth:String(p.birth||''),phone:String(p.phone||'').trim(),coverage:String(p.coverage||'').trim(),notes:String(p.notes||''),createdAt:Date.now()};state.patients.push(x);save();return x;},
  updatePatient(id,patch){const x=state.patients.find(p=>p.id===id);if(!x)throw new Error('Paciente no encontrado.');for(const k of ['name','dni','birth','phone','coverage','notes'])if(k in patch)x[k]=String(patch[k]??'');save();return x;},
  addVisit(patientId,when,reason=''){if(!state.patients.some(p=>p.id===patientId))throw new Error('Elegí un paciente.');const t=new Date(when);if(Number.isNaN(t.getTime()))throw new Error('Fecha y hora inválidas.');const v={id:uid(),patientId,when:t.toISOString(),reason:String(reason).slice(0,300),status:'pendiente',record:null,transcript:'',validatedBy:'',validatedAt:null};state.visits.push(v);save();return v;},
  cancelVisit(id){const v=state.visits.find(v=>v.id===id);if(!v)throw new Error('Turno no encontrado.');if(v.status==='dado')throw new Error('Un turno atendido no se cancela.');v.status='cancelado';save();return v;},
  // Guarda el registro. Solo con validación del médico el turno pasa a «dado»; sin ella queda en borrador.
  saveRecord(id,{sections,transcript='',validated=false,doctor=''}){const v=state.visits.find(v=>v.id===id);if(!v)throw new Error('Turno no encontrado.');if(v.status==='cancelado')throw new Error('El turno está cancelado.');
   if(validated&&String(doctor).trim().length<3)throw new Error('Para validar, escribí el nombre del médico que firma.');
   v.record=Object.fromEntries(SECTIONS.map(([k])=>[k,String(sections?.[k]||'').trim()]));v.transcript=String(transcript);
   if(validated){v.status='dado';v.validatedBy=String(doctor).trim();v.validatedAt=new Date().toISOString();}else if(v.status!=='dado')v.status='pendiente';
   save();return v;},
  pending(){return state.visits.filter(v=>v.status==='pendiente').sort((a,b)=>a.when.localeCompare(b.when));},
  done(){return state.visits.filter(v=>v.status==='dado').sort((a,b)=>b.when.localeCompare(a.when));},
  historyOf(patientId){return state.visits.filter(v=>v.patientId===patientId&&v.status==='dado').sort((a,b)=>b.when.localeCompare(a.when));},
  patient(id){return state.patients.find(p=>p.id===id)||null;},
  search(q){const f=fold(String(q||'').trim());return state.patients.filter(p=>!f||fold(p.name).includes(f)||p.dni.includes(f)).sort((a,b)=>a.name.localeCompare(b.name));},
  exportJSON(){return JSON.stringify(state,null,1);},
  importJSON(text){let s;try{s=JSON.parse(text);}catch{throw new Error('El archivo no es un respaldo válido.');}if(!s||s.version!==2||!Array.isArray(s.patients)||!Array.isArray(s.visits))throw new Error('El archivo no es un respaldo de Mi consultorio.');state=s;save();return {patients:s.patients.length,visits:s.visits.length};},
  // Importa el consultorio anterior (clinia_v1, mismo navegador) sin tocar el original. Los pacientes cuyo nombre está en el servidor cifrado no se pueden importar.
  importLegacy(legacy){let n=0;const map={};for(const [id,p] of Object.entries(legacy?.patients||{})){if(!p?.nombre)continue;const x=api.addPatient({name:p.nombre,dni:p.dni||'',birth:p.nacimiento||'',phone:p.telefono||'',notes:'Importado del consultorio anterior'});map[id]=x.id;n++;}
   for(const e of Object.values(legacy?.encounters||{})){const pid=map[e.patientId];if(!pid)continue;const v=api.addVisit(pid,e.createdAt?new Date(e.createdAt):new Date(),String(e.motivo||'').slice(0,300));const rec={};for(const [k] of SECTIONS)rec[k]='';rec.enfermedad=String(e.resumen||e.enfermedadActual||'');v.record=rec;v.status='dado';v.validatedBy='Importado';v.validatedAt=new Date().toISOString();}
   save();return n;},
  wipe(){state=emptyState();save();}
 };
 return api;
}
export const csvOfVisits=(store,list)=>{const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';return ['Fecha,Paciente,Estado,Motivo,Validado por',...list.map(v=>[v.when,store.patient(v.patientId)?.name,v.status,v.reason,v.validatedBy].map(q).join(','))].join('\n');};
