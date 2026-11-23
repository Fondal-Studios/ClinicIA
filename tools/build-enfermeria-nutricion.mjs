// Genera public/learn/content/enfermeria-nutricion.mjs a partir de docs/contenido-fuente/*.json.
// Uso: node tools/build-enfermeria-nutricion.mjs
// El contenido fue redactado con ayuda de IA y NO está validado por una enfermera ni un nutricionista: ver reviewStatus de cada curso.
import {readFileSync,writeFileSync} from 'node:fs';
const dir=new URL('../docs/contenido-fuente/',import.meta.url);
const ids=['enf-medicacion','enf-lpp','nut-valoracion','nut-gapa'];
const meta={
 enfermeria:{professionalCategory:'enfermeria',audience:'Enfermeros/as y estudiantes avanzados de enfermería',role:'Enfermero/a'},
 nutricion:{professionalCategory:'nutricion',audience:'Nutricionistas y estudiantes avanzados de nutrición',role:'Nutricionista'}
};
const checked='2026-11-23';
const sources={},courses=[],cases=[];
function question(id,source,skill,index,[prompt,correct,a,b,c,d,why]){
 const options=[correct,a,b,c,d],answer=index%5;options.unshift(...options.splice(options.length-answer,answer));
 return {id,source,skill,prompt,options,answer,why};
}
for(const id of ids){
 const raw=JSON.parse(readFileSync(new URL(id+'.json',dir),'utf8')),area=id.startsWith('enf')?'enfermeria':'nutricion',m=meta[area];
 for(const [k,v] of Object.entries(raw.sources))sources[k]={title:v.title,url:v.url,year:v.year,type:v.type,section:v.section,access:v.access||'Texto completo gratuito',checked};
 const lessons=raw.lessons.map((l,i)=>{const n=i+1,lid=`${id}-m${n}`;
  return {id:lid,title:l.title,area:l.title,minutes:25,source:l.refs[0],references:l.refs,objective:l.objective,body:l.body,trap:l.trap,evidence:l.evidence,
   simulation:{required:false,scenario:l.activity.scenario,roles:[m.role,'Persona simulada o responsable del pase','Observador/a'],rotation:'Rotar roles. Explicar la decisión y repetir el pase después de la devolución.',checklist:l.activity.checklist,validation:'Actividad de razonamiento con caso ficticio. Las técnicas y procedimientos requieren entrenamiento presencial supervisado; este ejercicio no acredita destreza.'},
   questions:l.rows.map((row,j)=>question(`${lid}-q${j+1}`,l.refs[0],l.title,i*4+j,row))};});
 for(const l of lessons)for(const q of l.questions)q.references=[q.source,...l.references.filter(r=>r!==q.source)];
 courses.push({id,title:raw.title,summary:raw.summary,category:area,professionalCategory:m.professionalCategory,pathway:'personal-sanitario',audience:m.audience,subtitle:raw.subtitle,prerequisites:raw.prerequisites,language:'es',evidenceChecked:checked,examMinutes:40,
  scope:'Formación continua independiente. No equivale a título, certificación oficial ni habilitación profesional. Aplicación según incumbencias, protocolos locales y capacitación presencial.',
  reviewStatus:'Curso propio de ClinicIA redactado con ayuda de IA y fuentes públicas. Pendiente de revisión por un profesional de '+(area==='enfermeria'?'enfermería':'nutrición')+' antes de su uso formal.',
  completion:'Leer los cinco módulos y aprobar la evaluación integral con al menos 80 % (16/20). Los casos y actividades practican razonamiento; no acreditan destreza presencial.',
  studyMinutes:165,studyTimeNote:'Estimación orientativa: 125 min de estudio y actividades + 40 min de evaluación; no son horas acreditadas.',
  outcomes:lessons.map(l=>l.objective),references:[...new Set(lessons.flatMap(l=>l.references))],lessons});
 const li=Math.min(Math.max(raw.case.lessonIndex||1,1),5),cid=`${id}-caso`;
 cases.push({id:cid,courseId:id,title:raw.case.title,summary:raw.case.summary,source:raw.case.source,lessonId:`${id}-m${li}`,steps:raw.case.rows.map((row,i,arr)=>{const q=question(`${cid}-s${i+1}`,raw.case.source,raw.case.title,i,row);return {...q,text:q.prompt,next:i===arr.length-1?null:i+1,wrong:i};})});
}
const out=`// GENERADO por tools/build-enfermeria-nutricion.mjs desde docs/contenido-fuente/*.json. No editar a mano.
export const healthSources=${JSON.stringify(sources,null,1)};
export const healthCourses=${JSON.stringify(courses,null,1)};
export const healthCases=${JSON.stringify(cases,null,1)};
`;
writeFileSync(new URL('../public/learn/content/enfermeria-nutricion.mjs',import.meta.url),out);
console.log('cursos',courses.length,'preguntas',courses.reduce((n,c)=>n+c.lessons.reduce((m,l)=>m+l.questions.length,0),0),'casos',cases.length,'fuentes',Object.keys(sources).length);
