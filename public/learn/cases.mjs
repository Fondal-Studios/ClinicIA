// Original fictional teaching scenarios. Finite branches; no patient inference.
export const cases=[
 {id:'fv',title:'Colapso en la guardia',summary:'Ritmo desfibrilable · tres decisiones',source:'arrest',steps:[
 {text:'Escenario ficticio. Adulto inconsciente, sin respiración normal ni pulso definido. Un compañero activa emergencias.',rhythm:'vf',options:['Iniciar RCP y conectar desfibrilador','Esperar laboratorio'],answer:0,why:'Primero sostené la circulación y obtené el ritmo.',next:1,wrong:0},
 {text:'RCP en curso. El desfibrilador está listo y el análisis confirma FV.',rhythm:'vf',options:['Dar descarga con seguridad','Cardioversión sincronizada'],answer:0,why:'La FV en paro requiere desfibrilación.',next:2,wrong:1},
 {text:'Se administró una descarga. Elegí el siguiente paso inmediato.',rhythm:'vf',options:['Reanudar RCP por dos minutos','Esperar a que el monitor se normalice'],answer:0,why:'Volvé a comprimir sin demoras innecesarias.',next:null,wrong:2}]},
 {id:'aesp',title:'El monitor no es el pulso',summary:'AESP · reevaluación clínica',source:'arrest',steps:[
 {text:'Escenario ficticio. Adulto inconsciente, sin pulso, con actividad organizada en el monitor.',rhythm:'sinus',options:['Clasificar como AESP','Declarar recuperación por el trazado'],answer:0,why:'La circulación debe confirmarse clínicamente.',next:1,wrong:0},
 {text:'AESP confirmada. RCP en curso y acceso vascular disponible.',rhythm:'sinus',options:['Adrenalina lo antes posible y RCP','Descarga por actividad organizada'],answer:0,why:'La AESP pertenece a la rama no desfibrilable.',next:2,wrong:1},
 {text:'El equipo continúa los ciclos. ¿Qué tarea debe acompañarlos?',rhythm:'sinus',options:['Buscar y tratar causas reversibles','Asumir que toda actividad eléctrica implica perfusión'],answer:0,why:'El tratamiento de la causa integra la reanimación.',next:null,wrong:2}]},
 {id:'taqui',title:'Pulso rápido, paciente inestable',summary:'Taquiarritmia regular · perfusión',source:'tachy',steps:[
 {text:'Escenario ficticio. Taquicardia regular de complejo estrecho, pulso presente, confusión y presión 75/40. El equipo atribuye el deterioro al ritmo.',rhythm:'tachy',options:['Reconocer inestabilidad','Clasificar como estable porque tiene pulso'],answer:0,why:'Tener pulso no equivale a estar estable.',next:1,wrong:0},
 {text:'Monitorización y soporte inicial en curso. La inestabilidad persiste.',rhythm:'tachy',options:['Preparar cardioversión sincronizada','Esperar sin intervenir'],answer:0,why:'La rama inestable requiere tratamiento eléctrico sincronizado.',next:null,wrong:1}]}
];
export function choose(sim,index){if(sim.finished||sim.feedback)return sim;const scenario=cases.find(c=>c.id===sim.id),s=scenario?.steps[sim.step];if(!s||!Number.isInteger(index)||index<0||index>=s.options.length)return sim;return {...sim,attempts:sim.attempts+1,errors:sim.errors+Number(index!==s.answer),feedback:{right:index===s.answer,text:s.why,next:index===s.answer?s.next:s.wrong}};}
export function advance(sim){if(!sim.feedback)return sim;return {...sim,step:sim.feedback.next??sim.step,finished:sim.feedback.next===null,feedback:null};}
