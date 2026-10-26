// Global area bar shared by every page, so it is always clear which part of ClinicIA you are in.
// Formación: estudiar y practicar · Aulas: clases con código · Mi consultorio: pacientes · Tutor IA: consultas con IA.
const AREAS=[
 ['formacion','Formación','./#formacion'],
 ['aulas','Aulas','./aulas.html'],
 ['consultorio','Mi consultorio','./consultorio.html'],
 ['tutor','Tutor IA','./#tutor']
];
export function activeArea(path=location.pathname,hash=location.hash){
 if(/\/(aulas|clase)\.html$/.test(path))return 'aulas';
 if(/\/consultorio\.html$/.test(path))return 'consultorio';
 if(/\/(guardia|salas)\.html$/.test(path))return 'formacion';
 if(/\/admin\.html$/.test(path))return 'admin';
 if(/\/(pagos|privacidad|lanzamiento|formacion-admin)\.html$/.test(path))return '';
 const parts=hash.replace(/^#/,'').split('/'),last=parts[parts.length-1];
 if(parts[0]==='tutor'||last==='tutor'||last==='guard')return 'tutor';
 if(parts[0]==='hub'||parts[0]==='')return '';
 return 'formacion';
}
const MODE_LABEL={student:'Estudiante',teacher:'Profesor',institution:'Institución',admin:'Administrador'};
const MODE_AREAS={
 student:AREAS,
 teacher:[['aulas','Mis clases','./aulas.html'],['biblioteca','Biblioteca','./aulas.html#biblioteca'],['formacion','Formación','./#formacion'],['tutor','Tutor IA','./#tutor'],['consultorio','Mi consultorio','./consultorio.html']],
 institution:[['aulas','Aulas','./aulas.html'],['formacion','Formación','./#formacion'],['tutor','Tutor IA','./#tutor']],
 admin:[['admin','Telemetría','./admin.html'],['formacion','Formación','./#formacion'],['aulas','Aulas','./aulas.html']]
};
let session={user:null,mode:'student'};
const storedMode=()=>{try{return localStorage.getItem('clinia_mode')||'';}catch{return '';}};
export const currentMode=()=>{const m=storedMode(),ok=session.user?.modes||['student'];return ok.includes(m)?m:'student';};
export function areasBarHtml(active=activeArea()){
 const mode=currentMode(),list=MODE_AREAS[mode]||AREAS,here=location.hash==='#biblioteca'&&/aulas\.html$/.test(location.pathname)?'biblioteca':active;
 return `<a class="areas-home" href="./#hub" aria-label="Inicio de ClinicIA"><span aria-hidden="true">✚</span><span class="areas-name"> Clinic<b>IA</b></span></a>${list.map(([id,label,href])=>`<a href="${href}" ${id===here?'aria-current="page"':''}>${label}</a>`).join('')}<button type="button" class="areas-mode" aria-haspopup="dialog" id="areas-mode">Modo: ${MODE_LABEL[mode]} ▾</button>`;
}
function openModes(bar){
 const user=session.user,have=user?.modes||['student'];
 const box=document.createElement('div');box.className='areas-sheet';box.setAttribute('role','dialog');box.setAttribute('aria-label','Elegir modo');
 const row=(m,desc,on)=>`<button type="button" data-mode="${m}" ${on?'':'disabled'} ${m===currentMode()?'aria-current="true"':''}><strong>${MODE_LABEL[m]}</strong><small>${desc}</small></button>`;
 box.innerHTML=`<h2>¿Cómo querés usar ClinicIA?</h2>${row('student','Estudiar, practicar y rendir exámenes.',true)}${row('teacher',have.includes('teacher')?'Crear clases con el tutor, usar la biblioteca y evaluar.':'Crear clases con el tutor, usar la biblioteca y evaluar. Hay que activarlo.',Boolean(user))}${row('institution','Próximamente: grupos de docentes y alumnos con resultados agregados.',false)}${have.includes('admin')?row('admin','Telemetría y administración.',true):''}${!user?'<p>Para usar el modo Profesor tenés que <a href="./#hub">ingresar con tu cuenta</a>.</p>':''}<button type="button" class="areas-close">Cerrar</button>`;
 document.body.append(box);
 const close=()=>box.remove();box.querySelector('.areas-close').onclick=close;
 box.addEventListener('click',async e=>{const b=e.target.closest('[data-mode]');if(!b||b.disabled)return;const m=b.dataset.mode;
  if(m==='teacher'&&!have.includes('teacher')){
   if(!confirm('Modo Profesor: vas a crear clases con ayuda de IA y ver los resultados de tus alumnos. Te hacés responsable del contenido que publicás: es educativo, puede contener errores y no sirve para decidir sobre pacientes. ¿Activar?'))return;
   try{const r=await fetch('/api/account/modes',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'teacher',accepted:true})});const d=await r.json();if(!r.ok)throw new Error(d.error||'No se pudo activar');session.user=d.user;}catch(err){alert(err.message);return;}
  }
  try{localStorage.setItem('clinia_mode',m);}catch{}close();bar.innerHTML=areasBarHtml();wire(bar);window.dispatchEvent(new Event('clinia-mode'));
  if(m==='teacher'&&!/aulas\.html$/.test(location.pathname))location.href='./aulas.html';else if(m==='admin'&&!/admin\.html$/.test(location.pathname))location.href='./admin.html';else if(m==='student'&&/aulas\.html|admin\.html/.test(location.pathname)){}
 });
}
function wire(bar){bar.querySelector('#areas-mode')?.addEventListener('click',()=>openModes(bar));}
const css=`.areas-bar{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:6px;padding:8px 14px;background:#fff;border-bottom:2px solid #176b59;overflow-x:auto;scrollbar-width:thin;font-family:inherit}
.areas-bar a{flex:0 0 auto;padding:10px 14px;border-radius:999px;color:#20483e;text-decoration:none;font-weight:700;font-size:14px;min-height:20px;white-space:nowrap}
.areas-bar a:hover{background:#e8f1ee}.areas-bar a[aria-current=page]{background:#176b59;color:#fff}
.areas-bar .areas-home{margin-right:6px;font-size:16px;color:#132c35}.areas-bar .areas-home b{color:#176b59}
@media(min-width:1000px){.has-areas aside{padding-top:78px}}
.areas-mode{flex:0 0 auto;margin-left:auto;border:1px solid #176b59;background:#fff;color:#176b59;border-radius:999px;padding:9px 12px;font:700 13px/1 inherit;cursor:pointer;white-space:nowrap}
.areas-sheet{position:fixed;inset:0;z-index:60;background:#fff;padding:20px 16px;overflow:auto;display:flex;flex-direction:column;gap:10px;max-width:520px;margin:0 auto}
.areas-sheet h2{margin:0 0 6px;font-size:20px}.areas-sheet button{display:flex;flex-direction:column;align-items:flex-start;gap:4px;text-align:left;border:1px solid #ccdad4;background:#fff;border-radius:12px;padding:14px;font:inherit;cursor:pointer}
.areas-sheet button[aria-current=true]{border-color:#176b59;background:#e8f1ee}.areas-sheet button:disabled{opacity:.55;cursor:not-allowed}.areas-sheet small{color:#4a625a}.areas-sheet .areas-close{align-items:center;margin-top:6px}
@media(max-width:520px){.areas-bar{gap:2px;padding:6px 8px}.areas-bar a{padding:9px 10px;font-size:13px}.areas-name{display:none}}`;
function mount(){
 if(document.querySelector('.areas-bar'))return;
 const style=document.createElement('style');style.textContent=css;document.head.append(style);
 const bar=document.createElement('nav');bar.className='areas-bar';bar.setAttribute('aria-label','Áreas de ClinicIA');bar.innerHTML=areasBarHtml();
 document.body.prepend(bar);document.body.classList.add('has-areas');
 const refresh=()=>{bar.innerHTML=areasBarHtml();wire(bar);window.dispatchEvent(new Event('clinia-mode'));};window.addEventListener('hashchange',refresh);wire(bar);
 fetch('/api/account/me',{credentials:'same-origin'}).then(r=>r.ok?r.json():null).then(d=>{if(d?.user){session.user=d.user;refresh();}}).catch(()=>{});
}
if(typeof document!=='undefined'&&document.body)mount();
