import {h,fill,add,sourceLinks} from './class-ui.mjs';
const resources=[{title:'Anatomy and Physiology',author:'OpenStax',topic:'Anatomía y fisiología',url:'https://openstax.org/subjects/anatomy-and-physiology',license:'Consultar licencia de la edición'},{title:'NCBI Bookshelf',author:'National Library of Medicine',topic:'Medicina general',url:'https://www.ncbi.nlm.nih.gov/books/',license:'Licencia variable por obra'},{title:'Publicaciones OMS',author:'Organización Mundial de la Salud',topic:'Salud pública',url:'https://iris.who.int/',license:'Licencia variable; puede excluir uso comercial'}];
const profiles={medico:'Médico',respondedor:'Primer respondedor',sanitario:'Otro personal sanitario',enfermeria:'Enfermería',kinesiologia:'Kinesiología',nutricion:'Nutrición',rotante:'Rotante / practicante'};
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const link=(label,href)=>h('a',{href},label);
export function libraryRoute(hash=''){
 const [role,profile,section,id]=hash.replace(/^#/,'').split('/');
 if(!['alumno','instructor'].includes(role))return {role:''};
 if(role==='alumno'&&!profiles[profile])return {role,profile:''};
 return {role,profile:role==='instructor'?'todos':profile,section:section==='clases'?'clases':'libros',id:section==='clases'&&/^[a-f0-9-]{36}$/.test(id||'')?id:''};
}
export function mountLibrary({root,status,win=window,request=fetch}={}){
 let user=null,revision=0,query='',category='';
 const path=(r,section=r.section,id='')=>`#${r.role}/${r.profile}/${section}${id?'/'+id:''}`;
 const json=async(url,body)=>{const response=await request(url,{credentials:'same-origin',cache:'no-store',...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});const data=await response.json();if(!response.ok)throw new Error(data.error||'No se pudo cargar la biblioteca.');return data;};
 const card=(title,text,href,label)=>h('article',{},h('h2',{},title),h('p',{},text),link(label,href));
 async function render(){
  const token=++revision,r=libraryRoute(win.location.hash),current=()=>token===revision;status.textContent='';
  if(!r.role){fill(root,h('h2',{},'¿Cómo vas a usar la biblioteca?'),h('div',{class:'library-grid'},card('Soy alumno','Consultar libros y clases, estudiar y unirme a aulas.','#alumno','Entrar como alumno'),card('Soy instructor','Crear clases con el tutor, vincular alumnos y proponer aportes para revisión administrativa.','#instructor/todos/clases','Entrar como instructor')));return;}
  const nav=h('nav',{class:'library-actions','aria-label':'Recorrido de biblioteca'},link('Cambiar alumno / instructor','#'),...(r.role==='alumno'?[link('Cambiar perfil de alumno','#alumno')]:[]));
  if(r.role==='alumno'&&!r.profile){fill(root,nav,h('h2',{},'¿Cuál es tu recorrido como alumno?'),h('div',{class:'library-grid'},card('Médico','Formación médica y clases de especialidades.','#alumno/medico/clases','Entrar como médico'),card('Primer respondedor','Respuesta inicial y coordinación según tu función.','#alumno/respondedor/clases','Entrar como primer respondedor'),card('Otro personal sanitario','Enfermería, kinesiología, nutrición y otras profesiones sanitarias.','#alumno/sanitario/clases','Explorar personal sanitario'),card('Rotante / practicante','Aprendizaje clínico bajo supervisión.','#alumno/rotante/clases','Entrar como rotante')));return;}
  const recommendations=r.role==='instructor'?h('section',{class:'library-panel'},h('h2',{},'Espacio de instructor'),h('p',{},'Creá borradores con el tutor existente, invitá alumnos mediante códigos y enviá tus contribuciones a revisión. Elegir este espacio no cambia los permisos de tu cuenta. Para crear, ingresá y activá el modo Instructor en la barra superior. En cada aula propia encontrarás Aportar a biblioteca.'),h('div',{class:'library-actions'},link('Mis aulas y tutor creador','/aulas.html'),link('Vincular alumnos y supervisar grupos','/capacitacion.html?perfil=instructor'),link('Mis credenciales','/credenciales.html'),link('Aportar una clase desde Mis aulas','/aulas.html'))):h('section',{},h('h2',{},'Alumno · '+profiles[r.profile]),h('div',{class:'library-actions'},link('Tutor para estudiar','/#tutor'),link('Mis aulas y códigos de invitación','/aulas.html'),link(r.profile==='respondedor'?'Capacitación de primeros respondedores':r.profile==='kinesiologia'?'Cursos de kinesiología':r.profile==='rotante'?'Rotaciones supervisadas':'Explorar formación',r.profile==='respondedor'?'/capacitacion.html':r.profile==='kinesiologia'?'/#kinesiologia':r.profile==='rotante'?'/capacitacion.html':'/#formacion')),
   ['sanitario','enfermeria','kinesiologia','nutricion'].includes(r.profile)?h('nav',{class:'library-actions','aria-label':'Profesiones sanitarias'},...['enfermeria','kinesiologia','nutricion','sanitario'].map(p=>link(profiles[p],`#alumno/${p}/${r.section}`))):null);
  const tabs=h('nav',{class:'library-actions','aria-label':'Secciones de biblioteca'},...['libros','clases'].map(section=>h('a',{href:path(r,section),'aria-current':!r.id&&section===r.section?'page':null},section==='libros'?'Libros':'Clases verificadas')));
  const results=h('div'),search=h('input',{type:'search','aria-label':'Buscar por título, autor o especialidad',placeholder:'Título, autor o especialidad'});search.value=query;
  const select=h('select',{'aria-label':'Especialidad de las clases'});select.append(h('option',{value:''},'Todas las especialidades'));
  fill(root,nav,recommendations,user?.role==='admin'?h('p',{},link('Panel de verificación administrativa','/editorial-admin.html')):null,tabs);
  if(r.id){root.append(results);await detail(r,results,current);return;}
  add(root,h('label',{},'Buscar',search),r.section==='clases'?h('label',{},'Especialidad',select):null,results);
  let rows=[];
  const draw=()=>{
   if(!current())return;
   const visible=rows.filter(c=>norm([c.title,c.author,c.topic,c.specialty,c.module].join(' ')).includes(norm(query))&&(!category||r.section==='libros'||c.specialty===category));
   fill(results,...visible.map(c=>r.section==='libros'?h('article',{},h('h2',{},c.title),h('p',{},c.author+' · '+c.topic),h('a',{href:c.url,target:'_blank',rel:'noopener noreferrer'},'Consultar fuente oficial →'),h('small',{},c.license+' · Enlace externo, no alojado en ClinicIA')):h('article',{},h('h2',{},c.title),h('p',{},`${c.author} · ${c.specialty||''} · ${c.module||''}`),h('p',{},'Contribución incorporada tras revisión administrativa.'),link('Consultar clase',path(r,'clases',c.class_id||c.id)))));
   if(!visible.length)fill(results,h('p',{},rows.length?'No se encontraron resultados para esos filtros.':'Todavía no hay clases verificadas disponibles.'));
  };
  search.addEventListener('input',()=>{query=search.value;draw();});select.addEventListener('change',()=>{category=select.value;draw();});
  if(r.section==='libros'){rows=resources;draw();return;}
  status.textContent='Cargando clases verificadas…';
  try{const data=await json('/api/library/classes');if(!current())return;rows=data.classes||[];const specialties=[...new Set(rows.map(c=>c.specialty).filter(Boolean))].sort();select.append(...specialties.map(x=>h('option',{value:x},x)));if(!specialties.includes(category))category='';select.value=category;status.textContent='';draw();}
  catch(e){if(current()){status.textContent=e.message;fill(results,h('button',{type:'button',onclick:render},'Reintentar carga'));}}
 }
 async function detail(r,results,current){
  status.textContent='Cargando clase verificada…';
  try{
   const data=await json('/api/library/classes/'+r.id);if(!current())return;
   const cls=data.class||data,c=cls.content||{},byId=Object.fromEntries((c.sources||[]).map(s=>[s.id,s]));
   fill(results,link('← Volver a clases verificadas',path(r,'clases')),h('h2',{},cls.title||c.title),h('p',{},`${cls.author||''} · ${cls.specialty||''}`),h('p',{},c.summary||''),h('ul',{},(c.objectives||[]).map(x=>h('li',{},x))),...(c.sections||[]).map(s=>h('article',{},h('h3',{},s.heading),h('p',{},s.body),sourceLinks(s.sources,byId))),...(c.slides||[]).map(s=>h('article',{},h('h3',{},s.title),h('ul',{},(s.bullets||[]).map(x=>h('li',{},x))),sourceLinks(s.sources,byId))),h('p',{},'Material educativo. La revisión administrativa no certifica vigencia clínica ni sustituye supervisión profesional.'));
   if(user){const join=h('button',{type:'button',onclick:async()=>{if(join.disabled||!current())return;join.disabled=true;try{const classroom=await json('/api/account/classes',{action:'join-public',classId:r.id});if(current())win.location.href='/aulas.html#'+classroom.id;}catch(e){if(current()){status.textContent=e.message;join.disabled=false;}}}},'Guardar en mis aulas y practicar');results.append(join);}else results.append(h('p',{},link('Ingresar para guardar avance y practicar','/#hub')));
   status.textContent='';
  }catch(e){if(current()){status.textContent=e.message;fill(results,link('Volver a clases verificadas',path(r,'clases')));}}
 }
 win.addEventListener('hashchange',render);render();
 json('/api/account/me').then(data=>{if(data.user){user=data.user;render();}}).catch(()=>{});
 return {render};
}
if(typeof document!=='undefined'&&document.querySelector('#library-root'))mountLibrary({root:document.querySelector('#library-root'),status:document.querySelector('#library-status')});
