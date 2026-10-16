export const sources = {
 bls: {title:'AHA 2025 · Soporte vital básico adulto',url:'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support'},
 arrest: {title:'AHA 2025 · Algoritmo de paro adulto',url:'https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Accessible/Algorithm-ACLS-CA-LngDscrp-250725-Ed.pdf?sc_lang=en'},
 als: {title:'AHA 2025 · Soporte vital avanzado adulto',url:'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-advanced-life-support'},
 tachy: {title:'AHA 2025 · Taquiarritmia con pulso',url:'https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Accessible/Algorithm-ACLS-Tachyarrhythmia-LngDscrp-250726-Ed.pdf?sc_lang=en'},
 brady: {title:'AHA 2025 · Bradicardia con pulso',url:'https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Accessible/Algorithm-ACLS-Bradycardia-LngDscrp-250725-Ed.pdf?sc_lang=en'}
};
const q=(id,prompt,options,answer,why,skill)=>({id,prompt,options,answer,why,skill});
export const courses=[{id:'acls',title:'Primeros minutos · ACLS',category:'salud',summary:'Reconocer, decidir y reevaluar.',lessons:[
 {title:'Reconocer el paro',minutes:3,source:'bls',body:'En un adulto inconsciente con respiración ausente o agónica, el profesional comprueba el pulso durante no más de 10 segundos. Sin pulso definido, activa ayuda e inicia RCP. El jadeo no equivale a respiración normal.',questions:[
 q('recognize','Adulto inconsciente, jadeo y sin pulso definido. ¿Qué priorizás?',['Activar ayuda e iniciar RCP','Esperar el ECG de 12 derivaciones','Observar cinco minutos'],0,'El jadeo puede acompañar al paro; no retrases las compresiones.','reconocimiento'),
 q('pulse','¿Cuánto puede durar la comprobación inicial del pulso?',['Hasta 10 segundos','Un minuto','Hasta obtener certeza absoluta'],0,'Una comprobación prolongada demora la RCP.','reconocimiento')]},
 {title:'RCP de calidad',minutes:3,source:'bls',body:'En adultos, comprimí a 100–120 por minuto, con profundidad de al menos 5 cm y sin superar 6 cm. Permití el retroceso completo y reducí las interrupciones. Sin vía aérea avanzada, usá una relación 30:2.',questions:[
 q('rate','Frecuencia de compresiones en adulto:',['60–80/min','100–120/min','160–180/min'],1,'La frecuencia y la profundidad deben cuidarse juntas.','rcp'),
 q('recoil','¿Qué favorece una RCP de calidad?',['Apoyarse continuamente en el tórax','Permitir retroceso completo','Interrumpir para cada medición de presión'],1,'El retroceso completo evita mantener el tórax comprimido.','rcp')]},
 {title:'Ritmos de paro',minutes:4,source:'als',body:'La fibrilación ventricular y la taquicardia ventricular sin pulso requieren desfibrilación. La asistolia y la actividad eléctrica sin pulso requieren otro recorrido. El trazado aislado no demuestra circulación: integrá la evaluación clínica.',questions:[
 q('shock','¿Qué ritmo es desfibrilable en un paro?',['Asistolia','Fibrilación ventricular','Actividad eléctrica sin pulso'],1,'La FV pertenece a la rama desfibrilable.','ritmos'),
 q('pea','Hay actividad organizada en el monitor, pero no hay pulso. ¿Cómo lo clasificás?',['Ritmo sinusal con perfusión asegurada','AESP','Fibrilación ventricular'],1,'Actividad eléctrica no garantiza una contracción con perfusión.','ritmos')]},
 {title:'Secuencia de reanimación',minutes:4,source:'arrest',body:'Después de una descarga, reanudá RCP durante dos minutos antes del siguiente análisis programado. En asistolia/AESP, administrá adrenalina lo antes posible y buscá causas reversibles. Reevaluá el ritmo en los ciclos previstos.',questions:[
 q('aftershock','Tras una descarga por FV, ¿qué sigue?',['Reanudar RCP','Esperar un minuto sin tocar','Tomar presión antes de comprimir'],0,'La descarga no sustituye las compresiones.','secuencia'),
 q('nonshock','En asistolia confirmada, ¿qué evitás?',['RCP','Descarga eléctrica','Buscar causas reversibles'],1,'La asistolia no es un ritmo desfibrilable.','secuencia')]},
 {title:'Taquiarritmia con pulso',minutes:4,source:'tachy',body:'Valorá si la taquiarritmia causa hipotensión, alteración mental aguda, shock, dolor isquémico o insuficiencia cardíaca aguda. Ante inestabilidad atribuible al ritmo, la rama del algoritmo conduce a cardioversión sincronizada.',questions:[
 q('unstable','Taquicardia regular con pulso, hipotensión y shock atribuible al ritmo. ¿Qué rama corresponde?',['Observación sin intervención','Cardioversión sincronizada','Tratar como asistolia'],1,'La estabilidad clínica orienta la conducta.','estabilidad'),
 q('stable','Antes de elegir el tratamiento de una taquiarritmia con pulso, ¿qué evaluás?',['Solo la frecuencia','Estabilidad y características del ritmo','Solo la edad'],1,'Un número aislado no alcanza para elegir la rama.','estabilidad')]},
 {title:'Bradicardia y perfusión',minutes:4,source:'brady',body:'Una bradicardia se interpreta junto con la perfusión. Con compromiso cardiopulmonar persistente, el algoritmo incluye atropina; si es ineficaz, estimulación transcutánea y/o infusiones, con apoyo experto. Sin compromiso, observá y buscá la causa.',questions:[
 q('brady','Bradicardia sin compromiso cardiopulmonar. ¿Qué corresponde?',['Desfibrilación inmediata','Evaluar causas y observar','RCP automática por la frecuencia'],1,'La frecuencia baja por sí sola no demuestra inestabilidad.','estabilidad'),
 q('pacing','Persiste el compromiso pese a atropina. ¿Qué contempla el algoritmo?',['Estimulación transcutánea y/o infusiones','Esperar sin monitorización','Descarga no sincronizada de rutina'],0,'El soporte y la consulta experta acompañan la escalada.','estabilidad')]}
]}];
export const catalog=courses;
export const questions=courses.flatMap(c=>c.lessons.flatMap((l,li)=>l.questions.map((q,qi)=>({...q,source:l.source,li,qi}))));
