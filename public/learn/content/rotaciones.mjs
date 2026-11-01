import {revalidaCourse,revalidaSources} from './revalida.mjs';
// Curated rotation banks from ClinicIA's existing original teaching questions.
// Distinct identifiers and no repeated question within a rotation. Faculty validation pending.
import {residencyCourse,residencySources} from './residencias.mjs';
import {neonatalCourse,obstetricCourse,perinatalSources} from './perinatal.mjs';
import {phtlsCourse,atlsCourse,traumaSources} from './trauma.mjs';
import {emergencyCourses,emergencySources} from './emergentologia.mjs';
import {expandedEmergencyCourses,expandedEmergencySources} from './emergentologia-ampliada.mjs';
import {integralCourses,integralSources} from './medicina-integral.mjs';
const pool=[residencyCourse,neonatalCourse,obstetricCourse,phtlsCourse,atlsCourse,...emergencyCourses,...expandedEmergencyCourses,...integralCourses,revalidaCourse];

const ginecoSupplement={
 id:'rotaciones-gineco-supplement',title:'Ginecología: situaciones de atención primaria',area:'Ginecología y obstetricia',
 source:'prenatal',body:'Casos complementarios sobre controles ginecológicos, gestación y comunicación clínica. Revisión docente pendiente.',
 questions:[
  {id:'rot-gyn-s1',prompt:'Gestante con vómitos persistentes, intolerancia oral y signos de deshidratación. ¿Qué priorizás?',options:['Evaluar hidratación y gravedad, indicar manejo y derivación según estado','Continuar seguimiento habitual sin valorar signos vitales','Posponer la evaluación hasta el control ecográfico rutinario','Suponer un síntoma leve por ocurrir en el primer trimestre'],answer:0,why:'La hiperémesis puede generar deshidratación y alteraciones metabólicas; la gravedad define manejo y necesidad de derivación.'},
  {id:'rot-gyn-s2',prompt:'Paciente embarazada presenta pérdida de líquido por vagina antes del término. ¿Qué conducta corresponde?',options:['Considerar fisiológica toda pérdida de líquido claro','Evaluar urgencia obstétrica por posible rotura prematura de membranas','Indicar ducha vaginal y control en una semana','Descartar riesgo fetal si no hay dolor'],answer:1,why:'La sospecha de rotura de membranas necesita evaluación obstétrica sin demoras y prevención de complicaciones.'},
  {id:'rot-gyn-s3',prompt:'Puérpera presenta dolor mamario, eritema local y fiebre. ¿Cuál es la evaluación indicada?',options:['Atribuir todos los síntomas a ingurgitación fisiológica','Interrumpir lactancia definitivamente sin evaluación','Evaluar mastitis y signos sistémicos para indicar manejo adecuado','Solicitar únicamente un examen cervical'],answer:2,why:'Fiebre y eritema focal durante lactancia requieren valorar mastitis e identificar complicaciones o gravedad.'},
  {id:'rot-gyn-s4',prompt:'Paciente con lesión visible en cuello uterino y sangrado de contacto solicita control. ¿Qué corresponde?',options:['Repetir rastreo poblacional sin exploración','Prescribir anticonceptivos como única respuesta','Aguardar el siguiente tamizaje si es joven','Realizar evaluación diagnóstica de la lesión y derivar según hallazgos'],answer:3,why:'Los síntomas y una lesión visible exigen evaluación diagnóstica; el tamizaje no reemplaza la investigación clínica.'}
 ]};

pool.push({lessons:[ginecoSupplement]});

const pediatriaSupplement={id:'rotaciones-pediatria-supplement',title:'Pediatría: urgencias y prevención',area:'Pediatría',
 source:'diarrea',body:'Casos de atención pediátrica que requieren valoración de signos de alarma. Revisión docente pendiente.',
 questions:[
  {id:'rot-ped-s1',prompt:'Lactante con tos, taquipnea y retracciones subcostales. ¿Qué dato requiere valoración prioritaria?',options:['Saturación de oxígeno y esfuerzo respiratorio','Antecedentes de caries sin examen respiratorio','Resultado de colesterol familiar','Preferencia de horario de consulta'],answer:0,why:'Las retracciones y la taquipnea sugieren dificultad respiratoria; medir oxigenación y valorar gravedad orienta soporte y derivación.'},
  {id:'rot-ped-s2',prompt:'Niño previamente sano presenta petequias que no blanquean, fiebre y mal estado general. ¿Qué conducta corresponde?',options:['Observar una semana si la temperatura baja','Evaluar y derivar de urgencia por posible infección invasiva','Indicar solo antipirético sin examinar perfusión','Solicitar controles de rutina sin nueva valoración'],answer:1,why:'Fiebre con lesiones purpúricas y compromiso sistémico exige investigar infección bacteriana invasiva y actuar de urgencia.'}
 ]};

pool.push({lessons:[pediatriaSupplement]});
const cirugiaSupplement={id:'rotaciones-cirugia-supplement',title:'Cirugía: urgencias abdominales y perioperatorio',area:'Cirugía',
source:'abdomen',body:'Casos complementarios de semiología quirúrgica, trauma, infección y seguridad perioperatoria. Revisión docente pendiente.',
questions:[
  {
    "id": "rot-cir-s1",
    "prompt": "Paciente con dolor abdominal progresivo, defensa generalizada e hipotensión. ¿Qué debe priorizarse?",
    "options": [
      "Reanimación y evaluación quirúrgica urgente.",
      "Analgesia y alta sin reevaluación.",
      "Colonoscopia electiva antes de estabilizar.",
      "Control clínico ambulatorio en un mes."
    ],
    "answer": 0,
    "why": "Peritonismo e inestabilidad indican amenaza abdominal aguda y necesidad de soporte inmediato."
  },
  {
    "id": "rot-cir-s2",
    "prompt": "Adulto con dolor en fosa ilíaca derecha y fiebre tiene sospecha de apendicitis. ¿Qué es correcto?",
    "options": [
      "Confirmar diagnóstico por fiebre aislada.",
      "Integrar historia, examen y estudios según riesgo.",
      "Descartar apendicitis si no hay vómitos.",
      "Indicar alta por dolor localizado."
    ],
    "answer": 1,
    "why": "Apendicitis requiere evaluación clínica y, según el contexto, imágenes y consulta quirúrgica."
  },
  {
    "id": "rot-cir-s3",
    "prompt": "Paciente con vómitos, distensión, dolor y ausencia de eliminación de gases. ¿Qué sospechás?",
    "options": [
      "Gastritis como diagnóstico definitivo.",
      "Dispepsia funcional sin examen abdominal.",
      "Obstrucción intestinal y valoración de gravedad.",
      "Alergia alimentaria confirmada."
    ],
    "answer": 2,
    "why": "El conjunto orienta a obstrucción y requiere evaluar estrangulación, deshidratación y necesidad de intervención."
  },
  {
    "id": "rot-cir-s4",
    "prompt": "Dolor súbito muy intenso y abdomen rígido tras antecedente ulceroso. ¿Qué priorizás?",
    "options": [
      "Posponer examen hasta que tolere dieta.",
      "Atribuir a síndrome de intestino irritable.",
      "Considerar diagnóstico cerrado de apendicitis.",
      "Evaluar posible perforación de víscera hueca."
    ],
    "answer": 3,
    "why": "El inicio brusco con signos peritoneales exige investigar perforación y estabilizar."
  },
  {
    "id": "rot-cir-s5",
    "prompt": "Hombre con hernia inguinal dolorosa, irreductible y vómitos. ¿Qué riesgo es urgente?",
    "options": [
      "Incarceración o estrangulación herniaria.",
      "Varicocele sin complicaciones.",
      "Hernia asintomática de rutina.",
      "Infección urinaria como explicación exclusiva."
    ],
    "answer": 0,
    "why": "Irreductibilidad dolorosa con obstrucción exige evaluación cirúrgica rápida."
  },
  {
    "id": "rot-cir-s6",
    "prompt": "Paciente con dolor en hipocondrio derecho, fiebre e ictericia. ¿Qué cuadro debe considerarse?",
    "options": [
      "Colelitiasis simple sin signos sistémicos.",
      "Colangitis aguda y necesidad de evaluación urgente.",
      "Gastritis funcional como única causa.",
      "Hepatitis vírica confirmada clínicamente."
    ],
    "answer": 1,
    "why": "Triada de dolor, fiebre e ictericia exige considerar infección de vía biliar y gravedad."
  },
  {
    "id": "rot-cir-s7",
    "prompt": "Adulto con dolor epigástrico irradiado a espalda y vómitos. ¿Qué diagnóstico investigar?",
    "options": [
      "Reflujo sin necesidad de examen.",
      "Apendicitis confirmada por la irradiación.",
      "Pancreatitis aguda con criterios clínicos y bioquímicos.",
      "Cólico renal sin evaluación clínica."
    ],
    "answer": 2,
    "why": "La presentación es compatible con pancreatitis y requiere confirmar e investigar gravedad."
  },
  {
    "id": "rot-cir-s8",
    "prompt": "Tras cirugía abdominal, aumenta el dolor, aparece fiebre y rigidez. ¿Qué complicación buscar?",
    "options": [
      "Dolor posoperatorio fisiológico sin límites.",
      "Reacción emocional como diagnóstico seguro.",
      "Intolerancia alimentaria leve sin examen.",
      "Infección intraabdominal o dehiscencia de anastomosis."
    ],
    "answer": 3,
    "why": "Fiebre y peritonismo postoperatorios obligan a evaluar complicaciones potencialmente graves."
  },
  {
    "id": "rot-cir-s9",
    "prompt": "Paciente con herida quirúrgica enrojecida, dolor y secreción purulenta. ¿Qué procede?",
    "options": [
      "Evaluar infección de sitio quirúrgico y su extensión.",
      "Cerrar herida superficialmente sin exploración.",
      "Indicar cuidado cosmético exclusivo.",
      "Esperar cicatrización sin valorar fiebre."
    ],
    "answer": 0,
    "why": "Secreción purulenta y signos inflamatorios requieren valoración local y sistémica."
  },
  {
    "id": "rot-cir-s10",
    "prompt": "Adulto con traumatismo abdominal, hipotensión y palidez tras choque. ¿Cuál es la prioridad?",
    "options": [
      "Alta al comprobar que puede caminar.",
      "Control de hemorragia y evaluación de posible sangrado interno.",
      "Inspección de lesiones leves antes de ABCDE.",
      "Inmovilización de dedos como medida principal."
    ],
    "answer": 1,
    "why": "La instabilidad tras trauma puede indicar hemorragia oculta y exige respuesta inmediata."
  },
  {
    "id": "rot-cir-s11",
    "prompt": "Persona con quemadura extensa y dificultad respiratoria tras incendio. ¿Qué preocupación inicial es clave?",
    "options": [
      "Solo hidratación de la piel quemada.",
      "Cambio cosmético de apósitos.",
      "Lesión inhalatoria, via aérea y estabilidad.",
      "Seguimiento electivo sin oxigenación."
    ],
    "answer": 2,
    "why": "La exposición a humo con dificultad respiratoria exige valorar vía aérea y lesión inhalatoria."
  },
  {
    "id": "rot-cir-s12",
    "prompt": "Pierna con dolor desproporcionado, edema intenso y alteraciones de sensibilidad tras fractura. ¿Qué sospechás?",
    "options": [
      "Cicatrización ósea normal.",
      "Distensión muscular leve confirmada.",
      "Neuropatía crónica como única causa.",
      "Síndrome compartimental agudo."
    ],
    "answer": 3,
    "why": "Dolor desproporcionado y signos neurológicos pueden indicar presión compartimental crítica."
  },
  {
    "id": "rot-cir-s13",
    "prompt": "Paciente con infección cutánea, dolor intenso, progresión rápida y toxicidad sistémica. ¿Qué riesgo existe?",
    "options": [
      "Infección necrotizante de tejidos blandos.",
      "Celulitis leve demostrada.",
      "Dermatitis atópica sin gravidade.",
      "Herida limpa por ausencia de pus."
    ],
    "answer": 0,
    "why": "La progresión rápida, dolor desproporcionado y afectación sistémica son signos de alarma."
  },
  {
    "id": "rot-cir-s14",
    "prompt": "Previo a cirurgia, paciente informa alergia grave a antibiótico planificado. ¿Qué acción es segura?",
    "options": [
      "Administrar igual para comprobar reacción.",
      "Verificar el antecedente y adaptar profilaxis según protocolo.",
      "Omitir registro para evitar demoras.",
      "Elegir una dosis mayor por seguridad."
    ],
    "answer": 1,
    "why": "Alergias graves requieren revisión de profilaxis y comunicación del equipo."
  },
  {
    "id": "rot-cir-s15",
    "prompt": "Durante el cierre operatorio, el recuento de gasas no coincide. ¿Qué corresponde?",
    "options": [
      "Finalizar porque no hay sangrado.",
      "Anotar diferencia solo en la alta.",
      "Detener cierre según protocolo y resolver discrepancia.",
      "Suponer error de registro sin comprobación."
    ],
    "answer": 2,
    "why": "La discrepancia de contaje exige conciliación para prevenir objetos retenidos."
  },
  {
    "id": "rot-cir-s16",
    "prompt": "Paciente operado presenta disnea súbita y taquicardia. ¿Qué diagnóstico es importante descartar?",
    "options": [
      "Dolor habitual de incisión sin evaluación.",
      "Hipertensión crónica como única explicación.",
      "Ansiedad sin comprobación de oxigenación.",
      "Tromboembolismo pulmonar y otras urgencias respiratorias."
    ],
    "answer": 3,
    "why": "El posoperatorio aumenta riesgo trombótico; se necesita evaluación oportuna."
  },
  {
    "id": "rot-cir-s17",
    "prompt": "Tras laparotomía, paciente presenta hipotensión persistente, taquicardia y abdomen distendido. ¿Qué se debe sospechar?",
    "options": [
      "Hemorragia posoperatoria y shock.",
      "Íleo simple como causa confirmada.",
      "Efecto normal de cualquier anestesia prolongada.",
      "Molestia digestiva sin repercusión circulatoria."
    ],
    "answer": 0,
    "why": "Inestabilidad hemodinámica con distensión abdominal tras cirugía exige investigar sangrado y actuar prontamente."
  }
]
};
pool.push({lessons:[cirugiaSupplement]});
const tracks=[
 ['rot-ginecologia','Ginecología y obstetricia',/embarazo|obstetric|gineco|prenatal|parto|puerper|eclamp|anticoncep|cervi|gesta/i],
 ['rot-pediatria','Pediatría',/pediatr|niñ|lactante|neonat|recién nacido|infantil|bronquiol|vacun|deshidrat/i],
 ['rot-cirugia','Cirugía',/cirug|abdomen|apendic|colecis|herida|trauma|quemadur|fractura|posoperat|quirúrg/i],
 ['rot-clinica','Clínica médica',/clínica|hipertens|diabet|anemia|renal|tiroid|infecci|respirator|cardiovas|metabólic/i],
 ['rot-emergencias','Emergencias',/emergen|shock|paro|rcp|reanim|acv|trauma|triage|dolor torácico|hemorrag|vía aérea/i]
];
function build(id,title,pattern){
 const relevant=pool.flatMap(c=>c.lessons.map(l=>({c,l}))).filter(({c,l})=>pattern.test([l.title,l.area].join(' ')));
 const selected=[];const used=new Set();
 for(const {c,l} of relevant){if(selected.length>=50)break;for(const q of l.questions||[]){
  const key=String(q.prompt||'').trim().toLowerCase();if(!key||used.has(key)||!Array.isArray(q.options)||q.options.length<3||!Number.isInteger(q.answer)||q.answer>=q.options.length||!q.why)continue;
  used.add(key);selected.push({q,l});if(selected.length===50)break;
 }}
 // Do not pad a course with fabricated or duplicated questions.
 const lessons=[0,1,2,3,4].map(i=>{const rows=selected.slice(i*10,(i+1)*10);const base=rows[0]?.l;return {id:id+'-unidad-'+(i+1),title:base?.title||'Unidad '+(i+1),area:title,source:base?.source||'euportal',minutes:20,objective:'Resolver situaciones clínicas frecuentes con supervisión.',body:base?.body||'Material en revisión docente.',simulation:{required:false,scenario:'Paciente simulado: realizar evaluación inicial, formular hipótesis, comunicar riesgos y justificar la derivación o conducta supervisada.',roles:['Rotante','Paciente simulado','Observador'],rotation:'Intercambiar roles y explicar decisiones.',checklist:['Reconoce signos de alarma','Prioriza seguridad','Explica conducta','Comunica con claridad']},questions:rows.map(({q},j)=>({...q,id:id+'-q-'+(i*10+j+1),options:[...q.options],source:q.source||base?.source}))};});
 return {id,title,category:'rotaciones',summary:'Cinco unidades, casos guiados y banco formativo curado de ClinicIA.',scope:'Práctica supervisada; no reemplaza formación ni evaluación docente. Preguntas adaptadas del banco original de ClinicIA, pendientes de revisión editorial.',reviewStatus:'Pendiente de validación docente',rotation:true,examMinutes:60,lessons};
}
export const rotationCourses=tracks.map(([id,title,pattern])=>build(id,title,pattern));
export const rotationSources={...residencySources,...perinatalSources,...traumaSources,...emergencySources,...expandedEmergencySources,...integralSources,...revalidaSources};
export const rotationAudit=rotationCourses.map(c=>({id:c.id,questions:c.lessons.reduce((n,l)=>n+l.questions.length,0)}));
