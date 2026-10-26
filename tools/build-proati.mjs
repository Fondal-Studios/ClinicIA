// Builds public/learn/content/proati.mjs from the authored batch files (JSON). Usage: node tools/build-proati.mjs <batchDir>
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
const dir=process.argv[2];if(!dir)throw new Error('batchDir required');
const lessons=readdirSync(dir).filter(f=>/^batch-\d+\.json$/.test(f)).sort().flatMap(f=>JSON.parse(readFileSync(`${dir}/${f}`,'utf8')).lessons).sort((a,b)=>a.id.localeCompare(b.id));
const problems=[];
lessons.forEach((l,i)=>{
 if(l.id!=='proati-'+String(i+1).padStart(2,'0'))problems.push('orden/id inesperado '+l.id);
 if(l.questions.length!==10)problems.push(l.id+': '+l.questions.length+' preguntas');
 if(!l.body||l.body.split(/\s+/).length<200)problems.push(l.id+': teoría breve');
 l.questions.forEach((q,k)=>{if(q.options.length!==5||new Set(q.options.map(o=>o.trim().toLowerCase())).size!==5)problems.push(`${l.id}-${k+1}: opciones inválidas`);if(!q.why||q.why.length<40)problems.push(`${l.id}-${k+1}: fundamento breve`);});
});
if(lessons.length!==30)problems.push('lecciones: '+lessons.length);
if(problems.length){console.error(problems.join('\n'));process.exit(1);}
const sources={
 sepsis3:['Singer et al. · Sepsis-3 (JAMA 2016)','https://doi.org/10.1001/jama.2016.0287'],
 ardsglobal:['Matthay et al. · Nueva definición global de SDRA (AJRCCM 2024)','https://doi.org/10.1164/rccm.202303-0558WS'],
 padis:['SCCM · Guía PADIS 2018: dolor, agitación, delirium, inmovilidad y sueño','https://doi.org/10.1097/CCM.0000000000003299'],
 liberation:['ATS/CHEST · Liberación de la ventilación mecánica 2017 (resumen)','https://www.thoracic.org/statements/resources/cc/weaning-exec-summary.pdf'],
 niv:['ERS/ATS · Ventilación no invasiva en insuficiencia respiratoria aguda 2017','https://doi.org/10.1183/13993003.02426-2016'],
 oxygen:['BTS · Oxigenoterapia de emergencia','https://www.brit-thoracic.org.uk/quality-improvement/guidelines/emergency-oxygen/'],
 kdigo:['KDIGO · Lesión renal aguda','https://kdigo.org/guidelines/acute-kidney-injury/'],
 btf4:['Brain Trauma Foundation · TCE grave, 4.ª edición (resumen)','https://braintrauma.org/s/Management_of_Severe_TBI_ExecSmry_4th_Edition.pdf'],
 ich2022:['AHA/ASA · Hemorragia intracerebral espontánea 2022','https://doi.org/10.1161/STR.0000000000000407'],
 sah2023:['AHA/ASA · Hemorragia subaracnoidea aneurismática 2023','https://doi.org/10.1161/STR.0000000000000436'],
 ais2019:['AHA/ASA · ACV isquémico agudo 2019','https://doi.org/10.1161/STR.0000000000000211'],
 estatus:['AES · Estatus epiléptico 2016','https://doi.org/10.5698/1535-7597-16.1.48'],
 deathAAN:['AAN/AAP/CNS/SCCM · Determinación de muerte cerebral 2023','https://doi.org/10.1212/WNL.0000000000207740'],
 ley27447:['Decreto 16/2019 · Reglamentación de la Ley 27.447 de trasplante','https://www.argentina.gob.ar/normativa/nacional/norma-318537/texto'],
 espen:['ESPEN · Nutrición en cuidados intensivos 2019','https://doi.org/10.1016/j.clnu.2018.08.037'],
 aspen:['ASPEN/SCCM · Nutrición en el paciente crítico 2016','https://doi.org/10.1177/0148607115621863'],
 pe2019:['ESC · Embolia pulmonar aguda 2019','https://doi.org/10.1093/eurheartj/ehz405'],
 scai:['SCAI · Clasificación del shock cardiogénico','https://doi.org/10.1002/ccd.28329'],
 ttm2:['TTM2 · Hipotermia versus normotermia tras paro cardíaco','https://doi.org/10.1056/NEJMoa2100591'],
 aabb:['AABB · Transfusión de glóbulos rojos 2023','https://doi.org/10.1001/jama.2023.12914'],
 hit:['ASH · Trombocitopenia inducida por heparina 2018','https://doi.org/10.1182/bloodadvances.2018024489'],
 wsacs:['WSACS · Hipertensión intraabdominal y síndrome compartimental 2013','https://doi.org/10.1007/s00134-013-2906-z'],
 hapvap:['IDSA/ATS · Neumonía hospitalaria y asociada a ventilador 2016','https://doi.org/10.1093/cid/ciw353'],
 shea:['SHEA/IDSA · Estrategias para prevenir infecciones asociadas a la atención','https://www.shea-online.org/practice-resources/priority-topics/compendium-of-strategies-to-prevent-hais'],
 iculib:['SCCM · ICU Liberation (paquete ABCDEF)','https://www.sccm.org/clinical-resources/iculiberation-bundle'],
 ipass:['Starmer et al. · I-PASS y eventos adversos','https://doi.org/10.1056/NEJMsa1405556'],
 sati:['SATI · Sociedad Argentina de Terapia Intensiva','https://www.sati.org.ar/'],
 proatiProgram:['Editorial Médica Panamericana · PROATI, información del programa','https://www.medicapanamericana.com/es-AR/formacion/proati']
};
const own=new Set(Object.keys(sources)),shared=new Set(['sepsis','ards','post','als','arrest','tachy','brady','delirium','derechos','paliativos','trauma','atls11','burns','hda','pancreatitis','potasio','acv','abcde','fccs','handoff','sbar']);
for(const l of lessons)for(const id of [l.source,...(l.extraSources||[])])if(!own.has(id)&&!shared.has(id))problems.push(l.id+': fuente no permitida '+id);
if(problems.length){console.error(problems.join('\n'));process.exit(1);}
const course={id:'proati',title:'ProATI · Terapia Intensiva',subtitle:'Preparación en medicina crítica',audience:'Terapia intensiva',category:'salud',summary:'Treinta temas de terapia intensiva en cuatro bloques —respiratorio, hemodinamia, neurocrítico y metabólico, e infecciones y gestión— con teoría, 300 preguntas y simulacros.',scope:'Preparación independiente organizada por dominios de la medicina crítica a partir de guías públicas. No reproduce ni reemplaza el programa PROATI ni el temario de la SATI, no es material oficial y no otorga puntaje de recertificación. El sumario oficial no es público: la organización por temas es propia.',officialSource:'proatiProgram',reviewStatus:'Pendiente de validación docente',
 lessons:lessons.map(l=>({id:l.id,title:l.title,module:l.module,source:l.source,extraSources:l.extraSources||[],area:l.area,objective:l.objective,trap:l.trap,minutes:12,workedExamples:2,body:l.body,questions:l.questions.map((q,k)=>({id:`${l.id}-${k+1}`,prompt:q.prompt,options:q.options,answer:0,why:q.why,skill:q.skill||l.area,source:l.source}))}))};
const out=`// ProATI · Terapia Intensiva. Original educational material generated from public guidelines; pending clinical/faculty validation.
// Generated by tools/build-proati.mjs from reviewed batches. Not the official PROATI/SATI curriculum.
export const proatiSources=${JSON.stringify(Object.fromEntries(Object.entries(sources).map(([k,[title,url]])=>[k,{title,url}])),null,1)};
export const proatiCourse=${JSON.stringify(course,null,1)};
export const proatiReviewNotes=${JSON.stringify(lessons.map(l=>({lesson:l.id,notes:l.reviewNotes||[]})),null,1)};
`;
writeFileSync('public/learn/content/proati.mjs',out);
console.log('proati.mjs escrito:',lessons.length,'lecciones,',lessons.reduce((n,l)=>n+l.questions.length,0),'preguntas,',Math.round(out.length/1024),'KB');
