import {courses,questions} from './courses.mjs';
import {cases} from './cases.mjs';

// Learning XP is descriptive, never spendable and never a clinical qualification.
export function progression(state,courseId=state.current){
 const qs=questions.filter(q=>q.courseId===courseId),course=courses.find(c=>c.id===courseId),scenarios=cases.filter(c=>c.courseId===courseId);
 const seen=qs.filter(q=>state.evidence[q.id]?.total>0).length;
 const correct=qs.filter(q=>state.evidence[q.id]?.correct>0).length;
 const lessons=(course?.lessons||[]).filter(l=>state.passedLessons[l.id]).length;
 const completed=scenarios.filter(c=>state.cases[c.id]).length;
 const xp=correct*10+lessons*25+completed*30,level=1+Math.floor(xp/100),maxXP=qs.length*10+(course?.lessons.length||0)*25+scenarios.length*30;
 const areas=[...new Set(qs.map(q=>q.area))].map(area=>{const items=qs.filter(q=>q.area===area),attempted=items.filter(q=>state.evidence[q.id]),total=attempted.reduce((n,q)=>n+state.evidence[q.id].total,0),hits=attempted.reduce((n,q)=>n+state.evidence[q.id].correct,0);return {area,seen:attempted.length,total:items.length,accuracy:total?Math.round(100*hits/total):null,errors:items.filter(q=>state.reviews[q.id]?.level===0).length};});
 const missions=[
 {id:'explore',title:'Abrí camino',text:'Explorá 10 preguntas diferentes.',value:seen,target:10,action:'smart'},
 {id:'understand',title:'Encontrá el criterio',text:'Acertá 10 preguntas diferentes, también después de corregirte.',value:correct,target:10,action:'smart'},
 {id:'topic',title:'Cerrá un tema',text:'Superá la evaluación completa de un tema.',value:lessons,target:1,action:'practice'},
 ...(scenarios.length?[{id:'case',title:'Conectá decisiones',text:'Completá un caso por etapas.',value:completed,target:1,action:'cases'}]:[]),
 {id:'coverage',title:'Ampliá tu mapa',text:'Explorá al menos una pregunta de cada área.',value:areas.filter(a=>a.seen).length,target:areas.length,action:'exam'},
 {id:'consolidate',title:'Construí una base',text:'Acertá al menos una vez la mitad de las preguntas del curso.',value:correct,target:Math.ceil(qs.length/2),action:'smart'}
 ].map(m=>({...m,value:Math.min(m.value,m.target),done:m.value>=m.target}));
 const badges=[{name:'Primer criterio',earned:correct>=1},{name:'Diez conceptos',earned:correct>=10},{name:'Tema superado',earned:lessons>=1},{name:'Mapa abierto',earned:areas.length>0&&areas.every(a=>a.seen)},{name:'Base en marcha',earned:correct>=Math.ceil(qs.length/2)}];
 const atCap=xp===maxXP;
 return {xp,level,maxXP,atCap,toNext:atCap?0:Math.min(100-xp%100,maxXP-xp),levelProgress:atCap?100:xp%100,seen,correct,lessons,completed,total:qs.length,areas,missions,badges,title:level>=15?'Constancia':level>=8?'Conexiones':level>=4?'Exploración':'Primeros pasos'};
}

// A guided route, without locking experienced learners out of other topics.
// Retention is deliberately separate from a one-time pass or accumulated XP.
export function learningPath(state,courseId=state.current,now=Date.now()){
 const course=courses.find(c=>c.id===courseId);
 if(!course)return {chapters:[],next:null,retained:0,total:0,due:0,errors:0};
 const qs=questions.filter(q=>q.courseId===courseId);
 const errors=qs.filter(q=>state.reviews[q.id]?.level===0);
 const due=qs.filter(q=>state.reviews[q.id]?.level>0&&state.reviews[q.id].due<=now);
 const retained=qs.filter(q=>state.reviews[q.id]?.spaced>=2).length;
 const nodes=course.lessons.map((l,index)=>{
  const passed=!!state.passedLessons[l.id],read=!!state.theoryRead[l.id];
  const consolidated=l.questions.every(q=>state.reviews[q.id]?.spaced>=2);
  return {id:l.id,title:l.title,index:index+1,total:l.questions.length,passed,read,
   retained:l.questions.filter(q=>state.reviews[q.id]?.spaced>=2).length,
   status:passed&&consolidated?'consolidated':passed?'passed':read?'practice':'new'};
 });
 const pending=nodes.find(n=>!n.passed),scenario=cases.find(c=>c.courseId===courseId&&!state.cases[c.id]);
 const next=errors.length?{action:'errors',label:'Corregir mis errores',reason:`${errors.length} conceptos necesitan otra decisión.`}
  :due.length?{action:'review',label:'Hacer mi repaso de hoy',reason:`${due.length} conceptos ya están listos para recuperar de memoria.`}
  :pending?{action:pending.read?'lesson':'theory',id:pending.id,label:pending.read?'Resolver el próximo tema':'Explorar el próximo tema',reason:`Paso ${pending.index}: ${pending.title}.`}
  :scenario?{action:'cases',label:'Conectar con un caso',reason:'Ya superaste los temas. Aplicá sus conceptos a decisiones por etapas.'}
  :{action:'exams',label:'Entrenar con un simulacro',reason:retained<qs.length?'Completaste los temas; los repasos espaciados seguirán apareciendo cuando correspondan.':'Recorrido consolidado en el repaso. Podés practicar un simulacro o elegir otro objetivo.'};
 const chapters=[];for(let i=0;i<nodes.length;i+=4){const items=nodes.slice(i,i+4);chapters.push({number:chapters.length+1,nodes:items,passed:items.filter(n=>n.passed).length,total:items.length});}
 return {chapters,next,retained,total:qs.length,due:due.length,errors:errors.length};
}
export function reinforcementQuestions(state,courseId,count=10,rng=Math.random){
 const all=questions.filter(q=>q.courseId===courseId);
 // Shuffle ties once; errors, unseen questions, then lower lifetime accuracy.
 const ranked=all.map(q=>{const e=state?.evidence?.[q.id];return {q,rank:state?.reviews?.[q.id]?.level===0?0:!e?1:2+e.correct/e.total,tie:rng()};}).sort((a,b)=>a.rank-b.rank||a.tie-b.tie);
 return ranked.slice(0,count).map(x=>x.q);
}
