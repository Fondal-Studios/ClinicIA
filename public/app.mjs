import {courses,questions,sources} from './learn/courses.mjs';
import {streak} from './learn/fondal-core.mjs';
import {fresh,restore,answer,finishLesson,competencies,courseQuestions,dueQuestions,errorQuestions,nextQuestions} from './learn/engine.mjs';
import {cases,choose,advance} from './learn/cases.mjs';
import {ecg,rhythms} from './learn/ecg.mjs';
const app=document.querySelector('#app'),key='clinicia-learning-v1';
let state=fresh(),storageOk=true,session=null,sim=null,theoryId=null,selectedRhythm='sinus';
let tutorText='',tutorQuestion='',busy=false,tutorRun=0;
try{state=restore(JSON.parse(localStorage.getItem(key)));}catch{storageOk=false;}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const save=()=>{try{localStorage.setItem(key,JSON.stringify(state));storageOk=true;}catch{storageOk=false;}};
const source=id=>`<a href="${sources[id].url}" target="_blank" rel="noopener">${esc(sources[id].title)} ↗</a>`;
const btn=(label,action,data='',cls='')=>`<button class="${cls}" data-action="${action}" ${data}>${label}</button>`;
const nav=[['home','Mi formación'],['theory','Teoría'],['practice','Práctica y preguntas'],['review','Repaso'],['ecg','Biblioteca ECG'],['cases','Simulaciones'],['skills','Competencias'],['tutor','Tutor IA']];
const course=()=>courses.find(c=>c.id===state.current)||courses[0];
const pool=()=>courseQuestions(course().id);
const courseCases=()=>cases.filter(c=>c.courseId===course().id);
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
let view='home';
function readRoute(){
 const parts=location.hash.replace(/^#/,'').split('/');
 if(courses.some(c=>c.id===parts[0])){state.current=parts[0];view=nav.some(([id])=>id===parts[1])?parts[1]:'home';}
 else{const old=parts[0]==='path'?'theory':parts[0];view=nav.some(([id])=>id===old)?old:'home';}
}
function clearActivity(){session=null;sim=null;theoryId=null;tutorRun++;busy=false;tutorText='';tutorQuestion='';}
function navigate(next){clearActivity();const route=`#${course().id}/${next}`;if(location.hash===route){view=next;render(true);}else location.hash=route;}
window.addEventListener('hashchange',()=>{clearActivity();readRoute();save();render(true);});
function home(){const c=course(),count=state.progress[c.id]||0,read=c.lessons.filter(l=>state.theoryRead[l.id]).length;return `
 <div class="eyebrow">TU ESPACIO DE FORMACIÓN CLÍNICA</div><h1>Estudiá. Decidí.<br>Volvé a intentarlo.</h1>
 <p class="lead">Elegí tu curso. La teoría, las preguntas y el repaso tienen su propio espacio.</p>
 <div class="course-grid">${courses.map(x=>`<article class="course-card ${x.id===c.id?'active-course':''}"><span class="pill">${x.audience}</span><h2>${x.title}</h2><p>${x.subtitle}</p><small>8 temas · 24 preguntas · ${cases.filter(k=>k.courseId===x.id).length} casos</small>${btn(x.id===c.id?'Curso seleccionado':'Elegir curso','course',`data-id="${x.id}"`,x.id===c.id?'selected':'')}</article>`).join('')}</div>
 <div class="hero"><div><span class="pill">${c.title} · ${c.audience}</span><h2>${c.subtitle}</h2><p>${c.summary}</p><div class="actions">${btn('Estudiar teoría →','nav','data-view="theory"','primary')}${btn('Practicar ahora','nav','data-view="practice"')}</div></div><div class="hero-ecg">${ecg('sinus')}<small>Comprender antes. Resolver por tu cuenta después.</small></div></div>
 <div class="stats"><article><strong>${read}/8</strong><span>Temas leídos</span></article><article><strong>${count}/8</strong><span>Temas evaluados y superados</span></article><article><strong>${dueQuestions(state).length}</strong><span>Preguntas para repasar</span></article></div>
 <h2>Una forma clara de avanzar</h2><div class="cards">${[['theory','01','Teoría','Conceptos y ejemplos resueltos, a tu ritmo.'],['practice','02','Práctica','Preguntas y trazados sin la explicación a la vista.'],['review','03','Repaso','Volvé a tus errores y a lo que toca recordar.']].map(([id,n,title,desc])=>`<article><span class="number">${n}</span><h3>${title}</h3><p>${desc}</p>${btn('Abrir →','nav',`data-view="${id}"`)}</article>`).join('')}</div>
 <p class="course-scope">${c.scope} Contenido pendiente de revisión docente.</p>`;}
function theory(){const c=course(),l=c.lessons.find(l=>l.id===theoryId);if(!l)return `
 <div class="eyebrow">${c.title} · ESTUDIAR</div><h1>Primero, entender.</h1><p class="lead">Acá están los conceptos y los ejemplos resueltos. Cuando quieras evaluar lo aprendido, pasá a Práctica.</p>
 <div class="path">${c.lessons.map((l,i)=>`<article><span class="number">${String(i+1).padStart(2,'0')}</span><div><h2>${l.title}</h2><p>${state.theoryRead[l.id]?'Leído':'Para estudiar'} · ${state.passedLessons[l.id]?'Evaluación superada':'3 preguntas de práctica'}</p></div>${btn('Leer tema','theory',`data-id="${l.id}"`)}</article>`).join('')}</div>`;
 return `<div class="eyebrow">${c.title} · TEORÍA</div><h1>${l.title}</h1><article class="theory-content"><p class="lead">${l.body}</p>
 <h2>Cómo aplicarlo</h2><p>Relacioná el concepto con el contexto, el pulso y la respuesta del paciente. Estos ejemplos incluyen la solución para estudiar.</p>
 ${l.questions.map(q=>`<details class="worked-example"><summary>${esc(q.prompt)}</summary>${q.rhythm?monitor(q.rhythm):''}<p><strong>${esc(q.options[q.answer])}</strong></p><p>${esc(q.why)}</p>${source(q.source)}</details>`).join('')}
 <p class="source">${source(l.source)}</p><div class="actions">${btn(state.theoryRead[l.id]?'Tema leído ✓':'Marcar como leído','read',`data-id="${l.id}"`)}${btn('Ir a las preguntas de este tema →','start',`data-mode="lesson" data-id="${l.id}"`,'primary')}${btn('Todos los temas','theory-back')}</div></article>`;
}
function practice(){const c=course(),ecgCount=pool().filter(q=>q.rhythm).length;return `
 <div class="eyebrow">${c.title} · RESOLVER</div><h1>Ahora decidís vos.</h1><p class="lead">Respondé sin pistas de teoría. Después de cada respuesta vas a ver el razonamiento y la referencia.</p>
 <div class="cards"><article><h2>Práctica mixta</h2><p>Diez preguntas de este curso, con opciones y orden mezclados.</p>${btn('Empezar práctica','start','data-mode="mixed"','primary')}</article><article><h2>Interpretar ECG</h2><p>${ecgCount?`${ecgCount} ejercicios con trazado, pulso y contexto clínico.`:'Los ejercicios ECG están en ACLS y PALS. En FCCS practicás soporte del paciente crítico.'}</p>${ecgCount?btn('Resolver ECG','start','data-mode="ecg"','primary'):btn('Ir a ECG de ACLS','switch-ecg')}</article><article><h2>Lo menos explorado</h2><p>Diez preguntas priorizadas por tu historial de este curso.</p>${btn('Entrenar mis brechas','start','data-mode="adaptive"')}</article></div>
 <h2>Práctica por tema</h2><div class="path">${c.lessons.map((l,i)=>`<article><span class="number">${String(i+1).padStart(2,'0')}</span><div><h2>${l.title}</h2><p>3 preguntas · ${state.passedLessons[l.id]?'Superado':'Se supera con al menos 80% de aciertos'}</p></div>${btn('Resolver','start',`data-mode="lesson" data-id="${l.id}"`)}</article>`).join('')}</div>`;}
function monitor(rhythm){return `<figure class="ecg-figure"><div class="monitor">${ecg(rhythm)}</div><figcaption>Tira sintética · 6 s · 25 mm/s · 10 mm/mV. Cada marca superior indica un segundo.</figcaption></figure>`;}
function study(){const s=session,c=course();if(s.done){const wrong=s.results.filter(r=>!r.right);return `
 <div class="eyebrow">${c.title} · RESULTADO</div><h1>${s.correct===s.items.length?'Buen trabajo.':'Cada error marca qué repasar.'}</h1>
 <article><strong class="result">${s.correct}/${s.items.length}</strong><p>${s.mode==='lesson'?(s.correct/s.items.length>=.8?'Tema superado.':'Para superar el tema necesitás al menos 80% de aciertos.'):'Sesión completada. Tu evidencia y tu calendario de repaso están actualizados.'}</p>
 ${wrong.length?`<h2>Para volver a mirar</h2><ul>${wrong.map(r=>`<li>${esc(s.items.find(q=>q.id===r.id).prompt)}</li>`).join('')}</ul>`:'<p>No quedaron errores en esta sesión. Los conceptos volverán en el repaso espaciado.</p>'}
 <div class="actions">${wrong.length?btn('Repetir mis errores','retry-session','','primary'):''}${btn('Volver a práctica','nav','data-view="practice"')}${btn('Ver teoría','nav','data-view="theory"')}</div></article>`;}
 const q=s.items[s.position],l=c.lessons[q.li];
 // Before submission: no lesson body, worked example, feedback, source title or answer styling.
 return `<div class="eyebrow">${c.title} · ${s.mode==='review'||s.mode==='errors'?'REPASO':'PRÁCTICA'} · ${s.position+1}/${s.items.length}</div>
 <progress aria-label="Preguntas respondidas" max="${s.items.length}" value="${s.position+(s.feedback?1:0)}"></progress>
 <article class="study"><h1 class="question">${esc(q.prompt)}</h1>${q.rhythm?monitor(q.rhythm):''}
 <div class="options">${s.order.map((index,i)=>btn(`<span class="option-letter">${String.fromCharCode(65+i)}</span><span>${esc(q.options[index])}</span>`,'answer',`data-index="${index}" ${s.feedback?'disabled':''}`,s.feedback?(index===q.answer?'correct':index===s.selected?'incorrect':''):'')).join('')}</div>
 ${s.feedback?`<div class="feedback ${s.feedback.right?'good':'bad'}" role="status"><strong>${s.feedback.right?'Correcto':'Revisemos la decisión'}</strong><p>${esc(q.why)}</p>${!s.feedback.right?`<p>Respuesta: <strong>${esc(q.options[q.answer])}</strong></p>`:''}<details><summary>Revisar el concepto</summary><p>${esc(l.body)}</p></details><p class="source">${source(q.source)}</p>${btn(s.position+1===s.items.length?'Ver resultado →':'Siguiente pregunta →','next','','primary')}</div>`:''}
 <div class="session-exit">${btn('Salir de la práctica','exit')}</div></article>`;
}
function review(){const c=course(),due=dueQuestions(state),wrong=errorQuestions(state),future=pool().map(q=>state.reviews[q.id]?.due).filter(n=>n>Date.now()).sort((a,b)=>a-b)[0];return `
 <div class="eyebrow">${c.title} · RECORDAR</div><h1>Volvé sobre lo importante.</h1><p class="lead">Tus errores vuelven ahora. Después de acertar, el repaso se programa a 1, 3, 7, 14 y 30 días.</p>
 <div class="cards"><article><h2>Repaso pendiente</h2><strong class="result">${due.length}</strong><p>Preguntas de este curso que ya corresponde repasar.</p>${btn('Repasar pendientes','start',`data-mode="review" ${due.length?'':'disabled'}`,'primary')}</article><article><h2>Mis errores</h2><strong class="result">${wrong.length}</strong><p>Preguntas cuya última respuesta fue incorrecta.</p>${btn('Trabajar mis errores','start',`data-mode="errors" ${wrong.length?'':'disabled'}`)}</article><article><h2>Próxima vuelta</h2><p>${future?'Próximo repaso: '+new Date(future).toLocaleDateString('es-AR')+'.':'Cuando respondas preguntas, se organizará tu calendario.'}</p>${btn('Practicar ahora','nav','data-view="practice"')}</article></div>`;}
function ecgView(){const r=rhythms.find(r=>r.id===selectedRhythm);return `<div class="eyebrow">BIBLIOTECA · CON EXPLICACIONES</div><h1>Aprendé a leer el trazado.</h1><p class="lead">Este espacio es de estudio. Para resolver sin ver el nombre, usá los ejercicios ECG de Práctica.</p>${monitor(r.id)}<div class="chips">${rhythms.map(x=>btn(esc(x.name),'rhythm',`data-id="${x.id}"`,x.id===selectedRhythm?'selected':'')).join('')}</div><article><h2>${r.name}</h2><p>${r.hint}</p>${btn('Ir a ejercicios ECG','start-ecg','','primary')}<p>Ilustraciones simplificadas: no analizan ECG reales ni sustituyen un registro de 12 derivaciones.</p></article>`;}
function simulations(){if(!sim)return `<div class="eyebrow">${course().title} · APLICAR</div><h1>Decisiones que se conectan.</h1><p class="lead">Escenarios ficticios por etapas. Los errores reciben devolución y una nueva oportunidad.</p><div class="cards">${courseCases().map(c=>`<article><span class="pill">${state.cases[c.id]?'COMPLETADO':'ESCENARIO FICTICIO'}</span><h2>${c.title}</h2><p>${c.summary}</p>${btn('Entrar al caso','case',`data-id="${c.id}"`,'primary')}</article>`).join('')}</div>`;
 const c=cases.find(c=>c.id===sim.id),s=c.steps[sim.step];if(sim.finished)return `<div class="eyebrow">${course().title} · DEVOLUCIÓN DEL CASO</div><h1>${c.title}</h1><article><h2>Recorrido completado</h2><p>${sim.attempts} decisiones · ${sim.errors} errores corregidos.</p><ol>${c.steps.map(s=>`<li>${s.why}</li>`).join('')}</ol>${source(c.source)}<div class="actions">${btn('Otros casos','nav','data-view="cases"','primary')}</div></article>`;
 return `<div class="eyebrow">${course().title} · CASO · ${sim.step+1}/${c.steps.length}</div><article><h1 class="question">${s.text}</h1>${s.rhythm?monitor(s.rhythm):''}<div class="options">${sim.order.map((index,i)=>btn(`<span class="option-letter">${String.fromCharCode(65+i)}</span><span>${esc(s.options[index])}</span>`,'case-answer',`data-index="${index}" ${sim.feedback?'disabled':''}`)).join('')}</div>${sim.feedback?`<div role="status" class="feedback ${sim.feedback.right?'good':'bad'}"><strong>${sim.feedback.right?'Decisión adecuada':'Revisá la decisión'}</strong><p>${sim.feedback.text}</p>${source(c.source)}<p>${btn(sim.feedback.right?'Avanzar':'Reintentar','case-next','','primary')}</p></div>`:''}${btn('Salir del caso','exit')}</article>`;
}
function skillsView(){return `<div class="eyebrow">${course().title} · EVIDENCIA</div><h1>Tu mapa de competencias</h1><p class="lead">Desempeño y cobertura de este curso. Leer teoría no cuenta como responder correctamente.</p><div class="cards">${competencies(state).map(s=>`<article><span class="eyebrow">${s.assessed?'EN EVALUACIÓN':'SIN EVALUAR'}</span><h2>${s.skill}</h2><strong class="result">${s.score}%</strong><progress aria-label="Desempeño en ${s.skill}" max="100" value="${s.score}"></progress><p>${s.assessed}/${s.total} preguntas exploradas</p></article>`).join('')}</div><p>El porcentaje promedia el historial de cada pregunta. Las preguntas sin evaluar cuentan como cero. El resultado es educativo y no certifica competencia clínica.</p><div class="actions">${btn('Exportar progreso de los tres cursos','export')}${btn('Borrar progreso educativo','reset')}</div>`;}
function tutor(){const ids=[...new Set(course().lessons.flatMap(l=>[l.source,...l.questions.map(q=>q.source)]))];return `<div class="eyebrow">${course().title} · ENTENDER</div><h1>Preguntá por el concepto.</h1><p class="lead">El tutor usa el material del curso seleccionado y sus referencias.</p><article><label for="access">Clave de acceso al piloto</label><input id="access" type="password" autocomplete="off"><label for="ask">Pregunta educativa sobre ${course().title}</label><textarea id="ask" rows="4" maxlength="2000" placeholder="¿Por qué se elige esa intervención?">${esc(tutorQuestion)}</textarea>${btn(busy?'Consultando…':'Consultar al tutor','ask',busy?'disabled':'','primary')}<p>El texto se envía al proveedor configurado. Usá preguntas educativas sin datos de pacientes.</p><div class="tutor-answer" role="status">${esc(tutorText)}</div></article><h2>Referencias del curso</h2>${ids.map(id=>`<p>${source(id)}</p>`).join('')}`;}
function render(focus=false){const c=course(),content=session?study():({home,theory,practice,review,ecg:ecgView,cases:simulations,skills:skillsView,tutor}[view]||home)();app.innerHTML=`
 <aside><a class="brand" href="#${c.id}/home"><span class="mark">✚</span> Clinic<span>IA</span></a><div class="eyebrow">APRENDER PARA CUIDAR</div><nav aria-label="Principal">${nav.map(([id,label])=>`<a href="#${c.id}/${id}" ${id===view?'aria-current="page"':''}>${label}</a>`).join('')}</nav><div class="aside-bottom"><span class="pill">FORMACIÓN INDEPENDIENTE</span><p>${streak(state.days)} días de racha</p><a href="./consultorio.html">Abrir consultorio ↗</a></div></aside>
 <div class="workspace"><header><label for="course-select">Curso</label><select id="course-select">${courses.map(x=>`<option value="${x.id}" ${x.id===c.id?'selected':''}>${x.title} · ${x.subtitle}</option>`).join('')}</select><span class="pill">${c.audience}</span></header><main id="main">${!storageOk?'<p role="alert" class="feedback bad">No se pudo guardar el progreso. Exportalo antes de salir.</p>':''}${content}</main><footer>ClinicIA · Formación independiente con contenido pendiente de validación docente. No certifica ACLS, PALS ni FCCS.</footer></div>`;
 if(focus){window.scrollTo?.(0,0);const h=app.querySelector?.('h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}}
}
function switchCourse(id,next=view){if(!courses.some(c=>c.id===id))return;state.current=id;save();navigate(next);}
function begin(items,mode,lessonId=null){if(!items.length)return;view='practice';theoryId=null;sim=null;const shuffled=shuffle(items);session={items:shuffled,position:0,mode,lessonId,correct:0,selected:null,feedback:null,results:[],order:shuffle(shuffled[0].options.map((_,i)=>i))};render(true);}
function start(mode,id){
 let items;
 if(mode==='lesson')items=pool().filter(q=>q.lessonId===id);
 else if(mode==='ecg')items=pool().filter(q=>q.rhythm);
 else if(mode==='review')items=dueQuestions(state);
 else if(mode==='errors')items=errorQuestions(state);
 else if(mode==='adaptive')items=nextQuestions(state);
 else if(mode==='mixed')items=shuffle(pool()).slice(0,10);
 else return;
 begin(items,mode,mode==='lesson'?id:null);
}
app.addEventListener('change',e=>{if(e.target.id==='course-select'){if(session&&!session.done&&!confirm('¿Salir de esta sesión y cambiar de curso? Las respuestas ya dadas se conservan.')){e.target.value=course().id;return;}switchCourse(e.target.value);}});
app.addEventListener('click',async e=>{
 const b=e.target.closest('[data-action]');if(!b||b.disabled)return;const a=b.dataset.action,i=Number(b.dataset.index);
 if(a==='nav'){navigate(b.dataset.view);return;}
 if(a==='course'){switchCourse(b.dataset.id,'home');return;}
 if(a==='theory'){theoryId=b.dataset.id;render(true);return;}
 if(a==='theory-back'){theoryId=null;render(true);return;}
 if(a==='read'){if(course().lessons.some(l=>l.id===b.dataset.id)){state.theoryRead[b.dataset.id]=true;save();render();}return;}
 if(a==='start'){start(b.dataset.mode,b.dataset.id);return;}
 if(a==='answer'&&session&&!session.feedback&&!session.done){const q=session.items[session.position];if(!Number.isInteger(i)||!q.options[i])return;const right=i===q.answer;state=answer(state,q.id,right);session.correct+=Number(right);session.selected=i;session.results.push({id:q.id,right});session.feedback={right};save();render();app.querySelector?.('.feedback')?.scrollIntoView?.({block:'nearest'});return;}
 if(a==='next'&&session?.feedback&&!session.done){const s=session;if(s.position+1===s.items.length){s.done=true;if(s.mode==='lesson')state=finishLesson(state,course().id,s.lessonId,s.results);save();}else{s.position++;s.feedback=null;s.selected=null;s.order=shuffle(s.items[s.position].options.map((_,i)=>i));}render(true);return;}
 if(a==='retry-session'&&session?.done){const items=session.items.filter(q=>session.results.some(r=>r.id===q.id&&!r.right));begin(items,'errors');return;}
 if(a==='exit'){if(confirm('¿Salir? Las respuestas ya dadas quedan guardadas.'))navigate(view==='cases'?'cases':'practice');return;}
 if(a==='rhythm'){if(rhythms.some(r=>r.id===b.dataset.id))selectedRhythm=b.dataset.id;render();return;}
 if(a==='switch-ecg'||a==='start-ecg'){if(!pool().some(q=>q.rhythm)){switchCourse('acls','practice');return;}start('ecg');return;}
 if(a==='case'){const c=courseCases().find(c=>c.id===b.dataset.id);if(!c)return;sim={id:c.id,step:0,attempts:0,errors:0,feedback:null,finished:false,order:shuffle(c.steps[0].options.map((_,i)=>i))};render(true);return;}
 if(a==='case-answer'&&sim&&!sim.feedback){sim=choose(sim,i);render();return;}
 if(a==='case-next'&&sim?.feedback){sim=advance(sim);if(sim.finished){state.cases[sim.id]=true;save();}else sim.order=shuffle(cases.find(c=>c.id===sim.id).steps[sim.step].options.map((_,i)=>i));render(true);return;}
 if(a==='ask'&&!busy){const question=document.querySelector('#ask').value.trim(),token=document.querySelector('#access').value,courseId=course().id,run=++tutorRun;tutorQuestion=question;if(!question){tutorText='Escribí una pregunta sobre el curso.';render();return;}busy=true;b.disabled=true;b.textContent='Consultando…';let resultText='';try{const resp=await fetch('/api/tutor',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({question,courseId}),signal:AbortSignal.timeout(30000)});const result=await resp.json();resultText=resp.ok?result.answer:result.error;}catch{resultText='No se pudo conectar con el tutor. Podés seguir estudiando y practicando.';}finally{if(run===tutorRun&&courseId===course().id){busy=false;tutorText=resultText;render();}}return;}
 if(a==='export'){const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='clinicia-progreso.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
 if(a==='reset'&&confirm('¿Borrar el progreso educativo de los tres cursos en este navegador?')){state=fresh();save();navigate('home');}
});
readRoute();render();
