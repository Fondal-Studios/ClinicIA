// Original application items. TeamSTEPPS sources support the communication concepts;
// these are not official examination items or faculty-validated assessments.
export const communicationSources={
 sbar:{title:'AHRQ TeamSTEPPS · SBAR',url:'https://www.ahrq.gov/teamstepps-program/curriculum/communication/tools/sbar.html'},
 checkback:{title:'AHRQ TeamSTEPPS · Check-back',url:'https://www.ahrq.gov/teamstepps-program/curriculum/communication/tools/checkback.html'},
 teachback:{title:'AHRQ TeamSTEPPS · Teach-back',url:'https://www.ahrq.gov/teamstepps-program/curriculum/communication/tools/teachback.html'},
 handoff:{title:'AHRQ TeamSTEPPS · Handoff',url:'https://www.ahrq.gov/teamstepps-program/curriculum/communication/tools/handoff.html'}
};
export const communicationRevisions={
 'f-handoff':{
  prompt:'En un pase SBAR ya se comunicaron la situación, los antecedentes y la valoración. ¿Qué frase completa específicamente la recomendación o solicitud?',
  options:['Solicito valoración presencial ahora para acordar el siguiente paso.','La paciente ingresó esta mañana por un cuadro respiratorio.','Desde la última valoración aumentó su trabajo respiratorio.','Mi impresión es que el soporte actual resulta insuficiente.','La última intervención produjo una mejoría parcial.'],answer:0,source:'sbar',
  why:'El pedido debe indicar qué ayuda se necesita y cuándo. Los otros datos son útiles, pero cumplen otras funciones dentro del pase.',
  optionFeedback:['Es una solicitud concreta con una urgencia explícita.','Aporta antecedentes del episodio.','Describe la situación actual y su evolución.','Expresa la valoración del emisor.','Informa la respuesta observada, pero no pide una acción.']
 },
 'f-change':{
  prompt:'Durante un pase, el receptor repite una hora de intervención distinta de la que acabás de informar. ¿Qué respuesta cierra mejor el circuito de comunicación?',
  options:['Aclarar la hora y pedir que repita el dato corregido.','Reenviar la hoja completa y continuar con el siguiente tema.','Anotar la discrepancia para incluirla en el próximo pase.','Repetir el dato correcto y finalizar la llamada.','Pedir a otro compañero que revise luego el registro.'],answer:0,source:'checkback',
  why:'La discrepancia exige corregir y confirmar lo recibido. Transmitir un dato correcto no demuestra que se haya entendido.',
  optionFeedback:['Permite corregir y comprobar que ambos usan el mismo dato.','Aporta documentación, pero no confirma que se corrigió el malentendido.','Difiere la resolución de una discrepancia ya detectada.','Corrige lo enviado sin verificar lo que recibió la otra persona.','Delega una revisión futura sin cerrar el intercambio actual.']
 },
 'f-recheck':{
  prompt:'Una nota dice «mejoró tras la intervención». En el pase querés evaluar la respuesta, no reconstruir antecedentes. ¿Qué dato adicional responde más directamente a ese objetivo?',
  options:['Hallazgos antes y después, con hora de reevaluación.','Diagnóstico de ingreso y antecedentes familiares.','Nombre del profesional y servicio que indicó la intervención.','Listado de estudios solicitados al ingreso.','Destino previsto y medio de traslado disponible.'],answer:0,source:'handoff',
  why:'Para interpretar una respuesta parcial se necesita una comparación temporal. Los demás datos pueden ser relevantes, pero no describen ese cambio.',
  optionFeedback:['Permite comparar el estado previo con la respuesta observada.','Contextualiza al paciente, pero no mide el cambio tras la intervención.','Identifica al responsable de la indicación, no el efecto observado.','Describe el plan diagnóstico inicial, no su evolución.','Ayuda a organizar la continuidad, no a valorar la respuesta.']
 },
 'rv-prioridades-3':{
  prompt:'En un pase SBAR, ¿cuál de estas frases expresa una valoración del emisor, en lugar de un antecedente o una solicitud?',
  options:['Me preocupa que la respuesta al soporte siga siendo insuficiente.','Solicito que lo valoremos juntos en este momento.','Ingresó hace dos horas por dificultad respiratoria.','Tiene antecedentes de enfermedad respiratoria crónica.','Necesito que confirmes quién recibirá al paciente.'],answer:0,source:'sbar',
  why:'La valoración integra lo observado y comunica la interpretación clínica. Se distingue de describir antecedentes o pedir una acción.',
  optionFeedback:['Expresa la interpretación del emisor acerca de la respuesta.','Es una solicitud de evaluación conjunta.','Aporta el momento y motivo del ingreso.','Aporta un antecedente relevante.','Solicita definir la recepción y responsabilidad.']
 },
 'eu-neonato-4':{
  prompt:'Al preparar el alta de un recién nacido, explicaste los signos de alarma y cómo consultar. ¿Qué intervención permite comprobar mejor si la familia entendió el plan?',
  options:['Pedir que describan con sus palabras qué harían ante un signo de alarma.','Preguntar si la explicación fue clara antes de entregar el resumen.','Entregar una copia del plan y destacar el teléfono de contacto.','Repetir la explicación usando las mismas palabras del resumen.','Preguntar si desean recibir información adicional sobre el seguimiento.'],answer:0,source:'teachback',
  why:'La devolución con palabras propias permite detectar malentendidos. Es una comprobación de cómo explicamos, no un examen a la familia.',
  optionFeedback:['Muestra cómo interpretaron el plan y permite aclarar dificultades.','Una confirmación de sí o no no demuestra comprensión del plan.','Es un apoyo útil, pero no comprueba cómo se interpreta la información.','Repetir información no verifica que haya sido comprendida.','Invita a preguntar, pero no demuestra que puedan aplicar el plan.']
 },
 'neo-seguimiento-2':{
  prompt:'El equipo receptor de un recién nacido escucha el pase y dice «recibido». Querés comprobar que comprendió el plan pendiente. ¿Qué respuesta aporta la mejor evidencia?',
  options:['Resume las tareas pendientes y quién se hará cargo de cada una.','Confirma que recibió el documento con los datos del traslado.','Repite el nombre del servicio que envió al recién nacido.','Indica que el puesto de recepción ya está preparado.','Confirma que anotó la hora en que terminó la llamada.'],answer:0,source:'handoff',
  why:'Reconocer que llegó un mensaje no equivale a comprender qué queda por hacer. El pase incluye continuidad de tareas y responsabilidad.',
  optionFeedback:['Hace explícitos el plan entendido y la responsabilidad de continuarlo.','Confirma recepción de documentación, no interpretación del plan.','Identifica al emisor, pero no las tareas pendientes.','Confirma preparación logística, no comprensión clínica del pase.','Registra un momento del intercambio, no su contenido accionable.']
 },
 'obs-entrega-1':{
  prompt:'En el pase de una paciente se enumeran situación actual, intervenciones, respuesta y un estudio pendiente. Para asegurar continuidad, ¿qué pregunta del receptor cierra mejor ese pendiente?',
  options:['¿Quién revisará el resultado y cómo se comunicará la conducta acordada?','¿En qué orden se solicitaron los estudios durante la atención?','¿Qué otros diagnósticos se consideraron al ingresar?','¿Qué profesional completó el primer registro del episodio?','¿Cuántas personas participaron en la atención inicial?'],answer:0,source:'handoff',
  why:'Una tarea pendiente necesita responsable y comunicación del siguiente paso. El resto de las preguntas puede ampliar antecedentes sin resolver esa responsabilidad.',
  optionFeedback:['Define seguimiento del resultado y transmisión de la decisión.','Reconstruye la secuencia, pero no asigna seguimiento.','Amplía el razonamiento inicial, pero no cierra la tarea pendiente.','Identifica autoría del registro, no responsabilidad futura.','Describe la composición del equipo, no quién continuará la tarea.']
 }
};
export function reviseCommunication(courses){
 const lesson=courses.find(c=>c.id==='fccs')?.lessons.find(l=>l.id==='fccs-8');
 if(lesson){lesson.source='handoff';lesson.body+='\n\nEn SBAR, diferenciá lo que sucede, los antecedentes, tu valoración y lo que solicitás. Una solicitud concreta expresa qué ayuda necesitás y cuándo. Para describir una respuesta al tratamiento, compará hallazgos antes y después con sus tiempos.\n\nEl check-back cierra un intercambio: el receptor repite el dato o la tarea y el emisor confirma o corrige. Si aparece una discrepancia, verificá la versión corregida. En un pase, aclarar pendientes incluye quién los continuará y cómo se comunicará el resultado.';}

 for(const c of courses)for(const l of c.lessons)for(const q of l.questions){const revision=communicationRevisions[q.id];if(revision)Object.assign(q,revision,{editorialRevision:4,difficulty:'Aplicación'});}
}
