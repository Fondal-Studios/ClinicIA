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
const uid=()=>{const c=globalThis.crypto;if(c?.randomUUID)return c.randomUUID();return [...c.getRandomValues(new Uint8Array(16))].map(x=>x.toString(16).padStart(2,'0')).join('');}; // identificadores con aleatoriedad criptográfica
// Recetario electrónico (opción A): ClinicIA no emite recetas. Prepara los datos para pegarlos en un recetario inscripto en el ReNaPDiS y abre ese recetario.
export const RECETARIOS=[{id:'receto',name:'Receto (gratuito)',url:'https://receto.com.ar/app'},{id:'otro',name:'Otro recetario habilitado',url:''}];
export const RECETARIOS_OFICIAL='https://www.argentina.gob.ar/receta-electronica/profesionales';
export function recetarioUrl(cfg){const r=RECETARIOS.find(x=>x.id===cfg?.id)||RECETARIOS[0];const raw=r.id==='otro'?String(cfg?.url||''):r.url;try{const u=new URL(raw);return u.protocol==='https:'?u.href:'';}catch{return '';}}
// Solo los datos mínimos que pide una receta: paciente, diagnóstico e indicaciones. No incluye antecedentes ni la transcripción.
export function prescriptionText(patient,record){
 const L=[['PACIENTE',patient?.name],['DNI',patient?.dni],['FECHA DE NACIMIENTO',patient?.birth],['COBERTURA',patient?.coverage],['TELÉFONO',patient?.phone],['DIAGNÓSTICO',record?.diagnostico||record?.motivo],['INDICACIONES / TRATAMIENTO',record?.tratamiento]];
 return L.filter(([,v])=>String(v||'').trim()).map(([k,v])=>k+': '+String(v).trim()).join('\n');
}
export const emptyState=()=>({version:2,patients:[],visits:[]});
// ---- Pacientes: apellido y nombre por separado, documento normalizado, búsqueda por apellido o DNI ----
export const normDoc=v=>String(v||'').replace(/[.\s-]/g,'').toUpperCase();
export const displayName=p=>p?.lastName?`${p.lastName}, ${p.firstName||''}`.replace(/, $/,''):String(p?.name||'');
export function ageOf(birth,now=new Date()){const b=new Date(birth);if(!birth||Number.isNaN(b.getTime()))return null;let a=now.getFullYear()-b.getFullYear();const m=now.getMonth()-b.getMonth();if(m<0||(m===0&&now.getDate()<b.getDate()))a--;return a>=0&&a<130?a:null;}
const FIELDS=['lastName','firstName','dni','birth','sex','address','phone','email','coverage','affiliate','emergency','background','family','allergies','medication','notes'];
const SEX=['','F','M','X'];
// Pacientes guardados antes de separar apellido y nombre: «María López» → nombre María, apellido López; «López, María» también.
function upgrade(p){if(p.lastName!==undefined)return p;const raw=String(p.name||'').trim();let last=raw,first='';if(raw.includes(',')){[last,first]=raw.split(',').map(x=>x.trim());}else{const t=raw.split(/\s+/);if(t.length>1){last=t.pop();first=t.join(' ');}}
 return {...p,lastName:last,firstName:first,sex:p.sex||'',address:p.address||'',email:p.email||'',affiliate:p.affiliate||'',emergency:p.emergency||'',background:p.background||'',family:p.family||'',allergies:p.allergies||'',medication:p.medication||'',dni:normDoc(p.dni),name:first?`${first} ${last}`:last};}
function clean(input,current={}){
 const x={...current};for(const k of FIELDS)if(k in input)x[k]=String(input[k]??'').trim();
 if('dni' in input)x.dni=normDoc(input.dni);
 const last=String(x.lastName||'').trim(),first=String(x.firstName||'').trim();
 if(last.length<2)throw new Error('Escribí el apellido del paciente.');if(!first)throw new Error('Escribí el nombre del paciente.');
 if(x.dni&&!/^[A-Z0-9]{5,15}$/.test(x.dni))throw new Error('El documento solo puede tener letras y números (de 5 a 15).');
 if(x.birth&&(Number.isNaN(new Date(x.birth).getTime())||new Date(x.birth)>new Date()))throw new Error('La fecha de nacimiento no es válida.');
 if(!SEX.includes(x.sex))x.sex='';
 if(x.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.email))throw new Error('El correo no es válido.');
 x.name=`${first} ${last}`;return x;
}
const sortKey=p=>fold(`${p.lastName||p.name||''} ${p.firstName||''}`);
export function createStore(storage,key='clinia_consultorio_v2'){
 let state;
 const load=()=>{try{const s=JSON.parse(storage.getItem(key)||'null');state=s&&s.version===2&&Array.isArray(s.patients)&&Array.isArray(s.visits)?s:emptyState();}catch{state=emptyState();}state.patients=state.patients.map(upgrade);return state;};
 const save=()=>{storage.setItem(key,JSON.stringify(state));};
 load();
 const dupOf=(dni,exceptId)=>dni?state.patients.find(p=>p.dni===dni&&p.id!==exceptId)||null:null;
 const api={
  get state(){return state;},reload:load,
  // Acepta {lastName,firstName,…} o, por compatibilidad, {name:'Nombre Apellido'}.
  addPatient(input){const inp={...input};if(inp.lastName===undefined&&inp.name){const u=upgrade({name:inp.name});inp.lastName=u.lastName;inp.firstName=u.firstName;}
   const x=clean(inp);const dup=dupOf(x.dni);if(dup){const e=new Error(`Ya existe un paciente con el documento ${x.dni}: ${displayName(dup)}.`);e.duplicate=dup;throw e;}
   const p={id:uid(),...Object.fromEntries(FIELDS.map(k=>[k,''])),...x,createdAt:Date.now(),updatedAt:Date.now()};state.patients.push(p);save();return p;},
  updatePatient(id,patch){const cur=state.patients.find(p=>p.id===id);if(!cur)throw new Error('Paciente no encontrado.');
   const patch2={...patch};if(patch2.lastName===undefined&&patch2.name){const u=upgrade({name:patch2.name});patch2.lastName=u.lastName;patch2.firstName=u.firstName;}
   const x=clean(patch2,cur);const dup=dupOf(x.dni,id);if(dup){const e=new Error(`Ese documento ya pertenece a ${displayName(dup)}.`);e.duplicate=dup;throw e;}
   Object.assign(cur,x,{updatedAt:Date.now()});save();return cur;},
  findByDni(dni){const d=normDoc(dni);return d?state.patients.find(p=>p.dni===d)||null:null;},
  addVisit(patientId,when,reason=''){if(!state.patients.some(p=>p.id===patientId))throw new Error('Elegí un paciente.');const t=new Date(when);if(Number.isNaN(t.getTime()))throw new Error('Fecha y hora inválidas.');const v={id:uid(),patientId,when:t.toISOString(),reason:String(reason).slice(0,300),status:'pendiente',record:null,transcript:'',validatedBy:'',validatedAt:null};state.visits.push(v);save();return v;},
  // Consulta sin turno previo (el paciente está en el consultorio): se crea con la hora actual.
  startVisitNow(patientId,reason=''){return api.addVisit(patientId,new Date(),reason);},
  cancelVisit(id){const v=state.visits.find(v=>v.id===id);if(!v)throw new Error('Turno no encontrado.');if(v.status==='dado')throw new Error('Un turno atendido no se cancela.');v.status='cancelado';save();return v;},
  // Guarda el registro. Solo con validación del médico el turno pasa a «dado»; sin ella queda en borrador.
  saveRecord(id,{sections,transcript='',validated=false,doctor=''}){const v=state.visits.find(v=>v.id===id);if(!v)throw new Error('Turno no encontrado.');if(v.status==='cancelado')throw new Error('El turno está cancelado.');
   if(validated&&String(doctor).trim().length<3)throw new Error('Para validar, escribí el nombre del médico que firma.');
   v.record=Object.fromEntries(SECTIONS.map(([k])=>[k,String(sections?.[k]||'').trim()]));v.transcript=String(transcript);
   if(validated){v.status='dado';v.validatedBy=String(doctor).trim();v.validatedAt=new Date().toISOString();}else if(v.status!=='dado')v.status='pendiente';
   save();return v;},
  // Registra que se emitió una receta en un recetario externo (referencia opcional: código de la receta). No guarda la receta.
  markPrescribed(id,{platform='',ref=''}={}){const v=state.visits.find(v=>v.id===id);if(!v)throw new Error('Turno no encontrado.');(v.prescriptions??=[]).push({platform:String(platform).slice(0,60),ref:String(ref).slice(0,120),at:new Date().toISOString()});save();return v;},
  pending(){return state.visits.filter(v=>v.status==='pendiente').sort((a,b)=>a.when.localeCompare(b.when));},
  done(){return state.visits.filter(v=>v.status==='dado').sort((a,b)=>b.when.localeCompare(a.when));},
  historyOf(patientId){return state.visits.filter(v=>v.patientId===patientId&&v.status==='dado').sort((a,b)=>b.when.localeCompare(a.when));},
  // Historial completo del paciente (atendidas y pendientes; sin las canceladas), de la más reciente a la más antigua.
  visitsOf(patientId){return state.visits.filter(v=>v.patientId===patientId&&v.status!=='cancelado').sort((a,b)=>b.when.localeCompare(a.when));},
  lastVisitOf(patientId){return api.historyOf(patientId)[0]||null;},
  patient(id){return state.patients.find(p=>p.id===id)||null;},
  // Búsqueda por apellido, nombre o documento (sin tildes, sin puntos). Con texto vacío devuelve todos. Orden alfabético por apellido.
  search(q){const text=String(q||'').trim();const tokens=fold(text).split(/\s+/).filter(Boolean);const doc=normDoc(text);
   const list=state.patients.filter(p=>{if(!tokens.length)return true;if(doc.length>=3&&/^\d+$/.test(doc)&&p.dni.includes(doc))return true;const hay=fold(`${p.lastName} ${p.firstName} ${p.name}`);return tokens.every(t=>hay.includes(t)||(t.length>=3&&p.dni.includes(normDoc(t))));});
   return list.sort((a,b)=>sortKey(a).localeCompare(sortKey(b)));},
  exportJSON(){return JSON.stringify(state,null,1);},
  importJSON(text){let s;try{s=JSON.parse(text);}catch{throw new Error('El archivo no es un respaldo válido.');}if(!s||s.version!==2||!Array.isArray(s.patients)||!Array.isArray(s.visits))throw new Error('El archivo no es un respaldo de Mi consultorio.');state={...s,patients:s.patients.map(upgrade)};save();return {patients:s.patients.length,visits:s.visits.length};},
  // Importa el consultorio anterior (clinia_v1, mismo navegador) sin tocar el original. Los pacientes cuyo nombre está en el servidor cifrado no se pueden importar.
  importLegacy(legacy){let n=0;const map={};for(const [id,p] of Object.entries(legacy?.patients||{})){if(!p?.nombre)continue;const u=upgrade({name:p.nombre});let x;try{x=api.addPatient({lastName:u.lastName,firstName:u.firstName||'-',dni:p.dni||'',birth:p.nacimiento||'',phone:p.telefono||'',notes:'Importado del consultorio anterior'});}catch{continue;}map[id]=x.id;n++;}
   for(const e of Object.values(legacy?.encounters||{})){const pid=map[e.patientId];if(!pid)continue;const v=api.addVisit(pid,e.createdAt?new Date(e.createdAt):new Date(),String(e.motivo||'').slice(0,300));const rec={};for(const [k] of SECTIONS)rec[k]='';rec.enfermedad=String(e.resumen||e.enfermedadActual||'');v.record=rec;v.status='dado';v.validatedBy='Importado';v.validatedAt=new Date().toISOString();}
   save();return n;},
  wipe(){state=emptyState();save();}
 };
 return api;
}
// Los datos de pacientes se guardan en el dispositivo, separados por cuenta (así dos médicos que comparten una computadora no mezclan pacientes).
export const storeKeyFor=user=>'clinia_consultorio_v2:'+(user?.id||'local');
// La primera vez que una cuenta abre el consultorio se copian (sin borrar) los datos guardados antes de separar por cuenta.
export function migrateLegacyKey(storage,toKey,fromKey='clinia_consultorio_v2'){try{if(storage.getItem(toKey)===null&&storage.getItem(fromKey)!==null){storage.setItem(toKey,storage.getItem(fromKey));return true;}}catch{}return false;}
export const csvOfVisits=(store,list)=>['Fecha,Paciente,Estado,Motivo,Validado por',...list.map(v=>[v.when,displayName(store.patient(v.patientId)),v.status,v.reason,v.validatedBy].map(csvCell).join(','))].join('\n');

const csvCell=v=>{let t=String(v??'');if(/^[=+\-@\t\r]/.test(t))t="'"+t;return '"'+t.replace(/"/g,'""')+'"';}; // evita fórmulas al abrir en una planilla
export const csvOfPatients=store=>['Apellido,Nombre,Documento,Fecha de nacimiento,Sexo,Teléfono,Correo,Cobertura,Nº de afiliado,Última consulta',...store.search('').map(p=>[p.lastName,p.firstName,p.dni,p.birth,p.sex,p.phone,p.email,p.coverage,p.affiliate,store.lastVisitOf(p.id)?.when?.slice(0,10)||''].map(csvCell).join(','))].join('\n');
// Planilla imprimible del paciente: datos filiatorios, historia clínica resumida e historial de consultas.
const escH=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function planillaHtml(p,visits,{doctor='',now=new Date()}={}){
 const row=(k,v)=>String(v||'').trim()?`<tr><th>${escH(k)}</th><td>${escH(v)}</td></tr>`:'';
 const age=ageOf(p.birth,now),SEXL={F:'Femenino',M:'Masculino',X:'X'};
 const vis=visits.map(v=>`<section class="pl-visit"><h3>${escH(new Date(v.when).toLocaleDateString('es-AR'))} · ${v.status==='dado'?'Atendida':'Pendiente'}${v.validatedBy?' · Validó '+escH(v.validatedBy):''}</h3>${v.record?SECTIONS.filter(([k])=>v.record[k]).map(([k,t])=>`<p><strong>${escH(t)}:</strong> ${escH(v.record[k])}</p>`).join(''):`<p>${escH(v.reason||'Sin registro')}</p>`}</section>`).join('')||'<p>Sin consultas registradas.</p>';
 return `<article class="planilla"><h1>Planilla de paciente</h1><p class="pl-meta">Impresa el ${escH(now.toLocaleDateString('es-AR'))}${doctor?' · '+escH(doctor):''}</p><h2>Datos filiatorios</h2><table>${row('Apellido y nombre',displayName(p))}${row('Documento',p.dni)}${row('Fecha de nacimiento',p.birth?p.birth+(age!==null?' ('+age+' años)':''):'')}${row('Sexo',SEXL[p.sex]||'')}${row('Domicilio',p.address)}${row('Teléfono',p.phone)}${row('Correo',p.email)}${row('Cobertura',[p.coverage,p.affiliate&&'Nº '+p.affiliate].filter(Boolean).join(' · '))}${row('Contacto de emergencia',p.emergency)}</table><h2>Historia clínica resumida</h2><table>${row('Antecedentes personales',p.background)}${row('Antecedentes familiares',p.family)}${row('Alergias',p.allergies)}${row('Medicación habitual',p.medication)}${row('Notas',p.notes)}</table><h2>Historial de consultas</h2>${vis}</article>`;
}
