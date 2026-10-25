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
 if(/\/(pagos|privacidad|admin|lanzamiento|formacion-admin)\.html$/.test(path))return '';
 const parts=hash.replace(/^#/,'').split('/'),last=parts[parts.length-1];
 if(parts[0]==='tutor'||last==='tutor'||last==='guard')return 'tutor';
 if(parts[0]==='hub'||parts[0]==='')return '';
 return 'formacion';
}
export function areasBarHtml(active=activeArea()){
 return `<a class="areas-home" href="./#hub" aria-label="Inicio de ClinicIA"><span aria-hidden="true">✚</span><span class="areas-name"> Clinic<b>IA</b></span></a>${AREAS.map(([id,label,href])=>`<a href="${href}" ${id===active?'aria-current="page"':''}>${label}</a>`).join('')}`;
}
const css=`.areas-bar{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:6px;padding:8px 14px;background:#fff;border-bottom:2px solid #176b59;overflow-x:auto;scrollbar-width:thin;font-family:inherit}
.areas-bar a{flex:0 0 auto;padding:10px 14px;border-radius:999px;color:#20483e;text-decoration:none;font-weight:700;font-size:14px;min-height:20px;white-space:nowrap}
.areas-bar a:hover{background:#e8f1ee}.areas-bar a[aria-current=page]{background:#176b59;color:#fff}
.areas-bar .areas-home{margin-right:6px;font-size:16px;color:#132c35}.areas-bar .areas-home b{color:#176b59}
@media(min-width:1000px){.has-areas aside{padding-top:78px}}
@media(max-width:520px){.areas-bar{gap:2px;padding:6px 8px}.areas-bar a{padding:9px 10px;font-size:13px}.areas-name{display:none}}`;
function mount(){
 if(document.querySelector('.areas-bar'))return;
 const style=document.createElement('style');style.textContent=css;document.head.append(style);
 const bar=document.createElement('nav');bar.className='areas-bar';bar.setAttribute('aria-label','Áreas de ClinicIA');bar.innerHTML=areasBarHtml();
 document.body.prepend(bar);document.body.classList.add('has-areas');
 const refresh=()=>{bar.innerHTML=areasBarHtml();};window.addEventListener('hashchange',refresh);
}
if(typeof document!=='undefined'&&document.body)mount();
