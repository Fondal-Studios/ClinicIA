// Supplementary original teaching prose; sources are inherited from each lesson.
export const theoryExpansion={
 'eu-pruebas':[
 ['Elegí primero el denominador','Sensibilidad: VP / (VP + FN). Especificidad: VN / (VN + FP). VPP: VP / (VP + FP). VPN: VN / (VN + FN). VP y VN son verdaderos positivos y negativos; FP y FN, falsos positivos y negativos. Antes de calcular, escribí si la pregunta parte de personas enfermas, no enfermas, positivas o negativas.'],
 ['Ejemplo trabajado','En una muestra con 30 VP, 70 FP, 10 FN y 890 VN, la sensibilidad es 30/40 = 75%, pero el VPP es 30/100 = 30%. Ambas cifras pueden ser correctas porque responden preguntas diferentes.'],
 ['Comprobación rápida','Un porcentaje de sensibilidad o especificidad debe estar entre 0 y 100. La proporción de falsos positivos entre no enfermos es 1 − especificidad; no equivale a la proporción de falsos positivos entre todos los positivos.']
 ],
 'eu-epidemiologia':[
 ['Identificá cómo entraron al estudio','La pregunta decisiva es cómo se seleccionó a los participantes. En casos y controles se parte del desenlace; en una cohorte se forman grupos por exposición y se estudian desenlaces. Que un registro sea antiguo no convierte por sí solo un estudio en cohorte retrospectiva.'],
 ['Un denominador con tiempo','La incidencia acumulada expresa nuevos casos sobre población inicialmente en riesgo durante un período. La densidad de incidencia utiliza persona-tiempo. La prevalencia puntual cuenta casos existentes en una fecha. No intercambies esas medidas aunque el enunciado use la palabra «tasa» de manera informal.'],
 ['Asociación y explicación','Un ajuste que atenúa la asociación puede sugerir confusión. Hay que valorar el diseño y el papel de cada variable. Una muestra grande reduce parte de la incertidumbre aleatoria, pero no elimina automáticamente sesgos ni demuestra causalidad.']
 ],
 'eu-delirium':[
 ['Compará con el estado basal','Reconstruí qué cambió y cuándo, con información del paciente, acompañantes y registros. Un deterioro en horas o días y una atención fluctuante requieren evaluar delirium; no deben atribuirse automáticamente a edad o demencia.'],
 ['La forma silenciosa','El retraimiento, las respuestas lentas y la menor participación pueden aparecer sin agitación. La ausencia de conducta disruptiva no excluye el síndrome. La evaluación estructurada debe acompañarse de juicio clínico y búsqueda de causas.'],
 ['Qué revisar al volver','Registrá evolución, atención, posibles desencadenantes y respuesta a las medidas. La orientación, el entorno y el acompañamiento forman parte del cuidado; no sustituyen la evaluación de causas agudas.']
 ]};
export function expandTheory(courses){for(const c of courses)for(const l of c.lessons){const sections=theoryExpansion[l.id];if(sections){l.deepDive=sections;l.body+='\n\n'+sections.map(([title,text])=>title+': '+text).join('\n\n');}}}
