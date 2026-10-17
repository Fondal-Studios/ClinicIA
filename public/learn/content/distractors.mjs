// Original editorial distractors, reviewed per item rather than sampled from unrelated questions.
// The correct option keeps its index so existing correctness evidence remains interpretable.
const rows=`
eu-hta-1|Diagnosticar hipertensión con esta medición e iniciar tratamiento|Repetir inmediatamente de pie y usar esa cifra como basal|Indicar MAPA después de intensificar el tratamiento|Revisar la presión en un año si continúa sin síntomas
eu-hta-2|La presión sistólica mayor de 200 mmHg por sí sola|La combinación de presión elevada y cefalea sin lesión aguda|La falta de respuesta a un antihipertensivo oral|La presencia de hipertensión crónica mal controlada
eu-hta-3|Descartar resistencia si la creatinina es normal|Agregar medicación antes de verificar las tomas|Solicitar estudio de arterias renales antes de validar las mediciones|Confirmar resistencia con una única cifra en guardia
eu-hta-4|Intensificar según las cifras de consultorio sin validar el equipo domiciliario|Reducir medicación según el promedio referido en casa|Clasificar hipertensión resistente por las tres visitas elevadas|Repetir las mediciones con el mismo dispositivo sin comprobarlo
eu-diabetes-1|Diagnosticar diabetes con esa única determinación|Clasificar como glucemia alterada en ayunas por ser menor de 140|Descartar diabetes si la glucemia capilar del día es normal|Repetir el control en un año sin confirmación cercana
eu-diabetes-2|Glucemia alterada que exige esperar dos ayunos para reconocer diabetes|Intolerancia a la glucosa definida por una medición al azar|Diabetes tipo 1 confirmada por el valor y los síntomas|Cetoacidosis confirmada por la hiperglucemia sintomática
eu-diabetes-3|Índice tobillo-brazo en reposo|Palpación de los pulsos pedios|Tiempo de relleno capilar digital|Inspección de la temperatura y coloración del pie
eu-diabetes-4|Mantener la intensidad y corregir cada hipoglucemia con ingestas extra|Buscar HbA1c menor de 6% para reducir complicaciones a largo plazo|Mantener la pauta porque el promedio glucémico está en objetivo|Cambiar el horario de las tomas sin revisar dosis ni función renal
eu-asma-1|Radiografía de tórax durante un intervalo asintomático|Medición aislada de saturación de oxígeno en reposo|Hemograma con eosinófilos como confirmación funcional|Tomografía de tórax como primer estudio confirmatorio
eu-asma-2|Agonista beta de acción corta|Antimuscarínico inhalado|Agonista beta de acción prolongada en monoterapia|Mucolítico por vía oral
eu-asma-3|Aumentar dosis antes de observar cómo usa el dispositivo|Añadir antibiótico por persistencia de los síntomas|Cambiar a corticoide oral de mantenimiento|Retirar el controlador y reevaluar con rescate a demanda
eu-asma-4|Mejoría del flujo con fatiga residual que permite disminuir vigilancia|Persistencia de broncoespasmo leve que admite manejo ambulatorio|Hiperventilación por ansiedad que explica la somnolencia|Efecto del broncodilatador que debe observarse sin escalar soporte
eu-epoc-1|Radiografía con hiperinsuflación|Gasometría arterial con hipoxemia|Espirometría prebroncodilatador aislada|Tomografía con engrosamiento bronquial
eu-epoc-2|Exposición crónica a polen estacional|Uso habitual de corticoides inhalados|Exposición doméstica a ácaros sin combustión|Actividad física repetida en aire frío
eu-epoc-3|Atribuir el dolor a sobrecarga muscular de la tos|Tratar como exacerbación infecciosa antes de reconsiderar el diagnóstico|Explicar el cambio por progresión crónica de la obstrucción|Clasificar como efecto adverso del broncodilatador de rescate
eu-epoc-4|Hiperinsuflación en una radiografía sin medición de flujos|Reducción aislada de capacidad vital con cociente conservado|Cociente obstructivo sólo antes del broncodilatador|Hipoxemia en reposo con volúmenes pulmonares no medidos
eu-renal-1|Creatinina sérica y urea sin ajuste por características del paciente|Filtrado estimado y tamaño renal sin albuminuria|Albuminuria y presión arterial sin estimar filtrado|Urea y densidad urinaria de una muestra aislada
eu-renal-2|Sí, si la creatinina supera el rango del laboratorio|Sí, si el filtrado estimado resulta menor de 60 en esa muestra|Sí, si coexiste hipertensión arterial conocida|Sí, si la diuresis se encuentra disminuida durante el episodio
eu-renal-3|Urea sérica y ácido úrico|Ecografía renal como único estudio de daño temprano|Repetición aislada de creatinina sin estudio urinario|Densidad urinaria y volumen de la primera micción
eu-renal-4|Clasificar ERC por el primer resultado de albuminuria|Descartar lesión renal porque el filtrado es normal|Iniciar estudio invasivo antes de resolver la infección|Atribuir el hallazgo a nefropatía diabética sin confirmar antecedentes
eu-coronario-1|Ecocardiograma de estrés|Tomografía coronaria programada|Radiografía de tórax como evaluación inicial de isquemia|Troponina seriada antes de registrar el trazado
eu-coronario-2|Permite descartar isquemia si el dolor dura más de veinte minutos|Reduce el riesgo lo suficiente para diferir biomarcadores|Excluye infarto si no hay elevación del ST en ese registro|Indica prueba de esfuerzo inmediata durante el dolor
eu-coronario-3|Infarto tipo 1 confirmado|Trombosis coronaria aguda confirmada|Indicación de fibrinólisis por el biomarcador|Isquemia transmural demostrada
eu-coronario-4|Esperar la primera troponina antes de activar la red|Repetir biomarcadores a las tres horas para decidir reperfusión|Priorizar una prueba funcional para demostrar isquemia|Tratar el dolor y decidir según la desaparición del ST
eu-acv-1|Las 7, cuando se descubrió el déficit|Las 3, como punto medio del período de sueño|La hora de llegada al hospital|La hora del primer examen neurológico documentado
eu-acv-2|Sodio plasmático|Electrocardiograma|Hemoglobina capilar|Saturación periférica de oxígeno
eu-acv-3|La presencia de estenosis carotídea|La localización de una fuente embólica cardíaca|La existencia de lesiones isquémicas antiguas|La extensión de enfermedad de pequeños vasos
eu-acv-4|Seguimiento ambulatorio rutinario por resolución del déficit|Diagnóstico de migraña por la reversibilidad del cuadro|Observación domiciliaria hasta que el episodio dure más de una hora|Descartar isquemia por normalidad del examen actual
eu-anemia-1|Anemia de inflamación sin déficit de hierro|Rasgo talasémico aislado|Déficit de vitamina B12|Hemólisis autoinmune
eu-anemia-2|La normalidad excluye déficit de hierro coexistente|La ferritina demuestra depósitos suficientes pese a la inflamación|La ferritina permite atribuir la anemia exclusivamente a inflamación|El resultado vuelve innecesario evaluar el metabolismo del hierro
eu-anemia-3|Control de hemoglobina tras hierro sin investigar el origen|Suplementación de folato como estudio etiológico inicial|Búsqueda de hemólisis como primera explicación de ferropenia|Atribución a envejecimiento si mejora con hierro
eu-anemia-4|La mejoría permite posponer el estudio hasta una nueva anemia|La respuesta identifica una causa exclusivamente nutricional|La normalización indica que cesó cualquier pérdida digestiva|La respuesta diferencia por sí sola pérdidas benignas de malignas
eu-tiroides-1|Hipotiroidismo subclínico|Hipotiroidismo central típico|Hipertiroidismo primario manifiesto|Hipertiroidismo subclínico
eu-tiroides-2|Hipotiroidismo primario manifiesto|Hipotiroidismo central|Hipertiroidismo subclínico|Eutiroidismo definido por la T4 libre aislada
eu-tiroides-3|Hipotiroidismo subclínico primario|Hipertiroidismo subclínico|Eutiroidismo por TSH dentro de rango|Hipertiroidismo central
eu-tiroides-4|La TSH normal permite excluir insuficiencia tiroidea|La T4 libre baja define hipotiroidismo primario subclínico|La normalidad de TSH implica función hipofisaria conservada|El antecedente quirúrgico obliga a interpretar sólo TSH
eu-digestivo-1|Endoscopia antes de valorar protección de vía aérea|Tomografía contrastada antes de iniciar reanimación|Esperar hemoglobina para definir si existe compromiso circulatorio|Iniciar antisecretor y evaluar respuesta antes de activar ayuda
eu-digestivo-2|La pérdida aún no alcanza relevancia hemodinámica|Descarta necesidad de vigilancia estrecha durante el sangrado|Permite excluir hipovolemia como causa del shock|Es suficiente para diferir la reevaluación de perfusión
eu-digestivo-3|No, la hematoquecia localiza la fuente por debajo de Treitz|No, sin melena previa debe priorizarse exclusivamente colon|Sólo si existe también dolor epigástrico|Sólo si hay antecedente conocido de enfermedad ulcerosa
eu-digestivo-4|El valor aislado de hemoglobina dentro del rango|La magnitud de la última bilirrubina|El grado de anemia del hemograma previo|La ausencia de melena en la primera evaluación
eu-pancreas-1|Confirmación de necrosis pancreática infectada|Criterios suficientes para clasificar pancreatitis grave|Indicación de tomografía urgente en toda presentación|Demostración de etiología biliar
eu-pancreas-2|Valor máximo de amilasa|Magnitud inicial de elevación de lipasa|Persistencia de enzimas elevadas sin falla orgánica|Grado de dolor aislado tras analgesia
eu-pancreas-3|Antibiótico por elevación de lipasa mayor de tres veces|Antibiótico para prevenir infección de cualquier necrosis estéril|Antibiótico hasta normalizar los marcadores inflamatorios|Antibiótico por presencia de dolor persistente sin infección
eu-pancreas-4|Mantener ayuno hasta normalizar lipasa|Indicar nutrición parenteral aunque tolere vía oral|Administrar antibiótico preventivo por elevación enzimática|Solicitar cirugía por persistencia de lipasa elevada
eu-potasio-1|Aumentar eliminación renal de potasio|Desplazar potasio al interior celular|Disminuir absorción intestinal de potasio|Corregir el exceso de potasio corporal total
eu-potasio-2|Aumentar la excreción fecal de potasio|Estabilizar directamente la membrana sin redistribución|Eliminar potasio corporal mediante filtración|Captar potasio en la luz intestinal
eu-potasio-3|Iniciar tratamiento completo sólo por el valor de la muestra|Descartar hiperpotasemia porque el ECG es normal|Confirmar el resultado repitiendo el análisis de la misma muestra hemolizada|Diferir la comprobación hasta el control habitual
eu-potasio-4|Confirmar que el calcio ya eliminó el exceso de potasio|Suspender controles tras la normalización del ECG|Asumir eliminación renal suficiente por la respuesta a insulina|Repetir calcio para producir una caída sostenida del potasio sérico
eu-dengue-1|Inicio de convalecencia por la desaparición de fiebre|Efecto esperable de la fiebre previa sin cambio de riesgo|Cuadro leve mientras no exista trombocitopenia profunda|Deshidratación simple que permite diferir la evaluación
eu-dengue-2|Paracetamol en dosis apropiadas|Acetaminofén ajustado al peso|Medidas físicas de confort sin enfriamiento excesivo|Reposo e hidratación como acompañamiento sintomático
eu-dengue-3|Apetito que retorna al desaparecer la fiebre|Diuresis conservada con ingesta adecuada|Prurito durante la convalecencia sin otros cambios|Mejoría progresiva del estado general
eu-dengue-4|Seguimiento habitual por haber finalizado la fiebre|Decidir internación únicamente por el recuento plaquetario|Antiemético y observación domiciliaria pese a intolerancia oral|Esperar reaparición de fiebre para reevaluar gravedad
eu-tuberculosis-1|Prueba de tuberculina como confirmación etiológica pulmonar|Radiografía de tórax como identificación del microorganismo|Interferón gamma como prueba de actividad pulmonar|Hemograma y reactantes inflamatorios como confirmación
eu-tuberculosis-2|Confirma enfermedad pulmonar activa|Demuestra contagiosidad respiratoria actual|Permite determinar sensibilidad a rifampicina|Diferencia infección reciente de antigua
eu-tuberculosis-3|Evaluar contactos sólo si desarrollan hemoptisis|Indicar el mismo tratamiento a todos sin evaluación|Esperar negativización del caso índice para estudiar convivientes|Limitar la evaluación a convivientes adultos sintomáticos
eu-tuberculosis-4|Iniciar tratamiento de infección sin excluir enfermedad activa|Considerar actividad pulmonar confirmada por la prueba|Atribuir el resultado a vacunación y cerrar el seguimiento|Seleccionar el esquema según el tamaño de reacción exclusivamente
eu-vih-1|Comunicar diagnóstico definitivo con un único tamizaje|Repetir el mismo tamizaje sin completar algoritmo|Interpretar reactividad como infección avanzada|Diferir la evaluación hasta que aparezcan síntomas
eu-vih-2|Descarta la infección por esa exposición|Demuestra respuesta inmune protectora|Excluye necesidad de valorar profilaxis posexposición|Permite prescindir de seguimiento serológico
eu-vih-3|Recuento de linfocitos CD4 como medida directa de viremia|Título de anticuerpos del tamizaje|Velocidad de sedimentación globular|Relación CD4/CD8 como sustituto de carga viral
eu-vih-4|Cerrar seguimiento porque el primer test fue negativo|Repetir pruebas sólo si aparecen síntomas|Considerar el test negativo como inmunidad frente a la exposición|Posponer la valoración preventiva hasta la seroconversión
eu-sepsis-1|Confirmar bacteriemia antes de iniciar soporte|Clasificar infección leve si no hay fiebre elevada|Explicar la confusión por edad sin evaluar perfusión|Esperar lactato elevado para reconocer riesgo orgánico
eu-sepsis-2|Una elevación confirma sepsis bacteriana|Un valor normal excluye hipoperfusión|La caída del lactato prueba control definitivo del foco|El valor aislado determina el volumen necesario
eu-sepsis-3|Repetir bolos iguales hasta alcanzar un volumen fijo|Priorizar diurético sin reevaluar hemodinamia|Atribuir la disnea exclusivamente a progresión infecciosa|Suspender valoración de perfusión si la presión sube
eu-sepsis-4|Completar el volumen previsto sin nueva evaluación|Repetir líquidos hasta normalizar el lactato aislado|Indicar restricción completa por disnea sin valorar circulación|Usar la presión arterial como única medida de respuesta
eu-crecimiento-1|Clasificar como variante normal por una talla aislada conservada|Aumentar suplementos sin comprobar la curva de crecimiento|Cambiar de referencia antropométrica para corregir el descenso|Esperar al siguiente control anual si no hay fiebre
eu-crecimiento-2|Introducir alimentos semisólidos ahora por la edad cronológica|Agregar agua entre tomas como complemento habitual|Reemplazar parte de las tomas por fórmula sin indicación clínica|Limitar las tomas a un horario fijo para aumentar el apetito
eu-crecimiento-3|Sustituir de entrada todas las tomas de leche|Priorizar líquidos azucarados como fuente de energía|Posponer la exposición a texturas hasta completar la dentición|Mantener alimentos diluidos como base para facilitar deglución
eu-crecimiento-4|Fijar un aporte estándar sin explorar el contexto familiar|Indicar un suplemento antes de conocer la alimentación habitual|Centrar la entrevista en el peso de una única visita|Aplicar el mismo horario de alimentación a todas las familias
eu-bronquiolitis-1|La intensidad de sibilancias aislada determina el alta|La ausencia de fiebre permite observación domiciliaria|Una saturación normal aislada compensa el antecedente de apneas|La respuesta a una toma determina por sí sola la gravedad
eu-bronquiolitis-2|Broncodilatador y corticoide sistémico de rutina|Antibiótico por el primer episodio de sibilancias|Antitusivo y restricción de líquidos|Nebulizaciones como sustituto del soporte respiratorio
eu-bronquiolitis-3|Dermatitis atópica leve aislada|Antecedente familiar de rinitis|Asistencia a jardín como único antecedente|Lactancia materna exclusiva con buen crecimiento
eu-bronquiolitis-4|La ausencia de fiebre como indicador de bajo riesgo|El número de días de tos sin considerar apneas|La presencia de sibilancias como requisito de internación|Una medición de saturación normal fuera del episodio
eu-diarrea-1|Agua con jugo de fruta|Bebida deportiva isotónica|Agua sola como reemplazo de pérdidas|Infusión azucarada diluida
eu-diarrea-2|Sed con sensorio conservado y capacidad para beber|Mucosa algo seca con diuresis conservada|Mayor frecuencia de deposiciones sin cambio de perfusión|Disminución leve de apetito con tomas conservadas
eu-diarrea-3|Suspenderla hasta normalizar las deposiciones|Reemplazarla por agua durante las primeras 24 horas|Diluir las tomas para reducir la carga intestinal|Restringirla al período nocturno durante la enfermedad
eu-diarrea-4|Aplicar el mismo plan de un episodio acuoso leve sin evaluación|Indicar antidiarreico para reducir la frecuencia antes de evaluar|Atribuir el sangrado a irritación por las deposiciones|Priorizar dieta astringente y diferir valoración del dolor
eu-neonato-1|Programar control de peso en una semana|Interpretar el cuadro como dificultad de adaptación alimentaria|Indicar abrigo domiciliario y reevaluar si aparece fiebre|Esperar pérdida de peso documentada para ampliar estudios
eu-neonato-2|Corresponde a la ictericia fisiológica habitual|Se explica por lactancia sin necesidad de medir bilirrubina|Permite esperar al control de la primera semana|Es tranquilizadora si el recién nacido tiene buen tono
eu-neonato-3|Baño temprano para retirar secreciones|Exposición descubierta para observar mejor la respiración|Separación rutinaria en ambiente sin control térmico|Secado diferido hasta después de pesar y medir
eu-neonato-4|Indicar consulta únicamente si aparece fiebre elevada|Pautar seguimiento sólo cuando existan dificultades de lactancia|Entregar indicaciones de alimentación sin vías de consulta|Usar el peso de alta como único criterio de vigilancia
eu-itu-1|Cistitis descartada por ausencia de disuria referida|Infección respiratoria confirmada por la fiebre|Otitis diagnosticada sin explorar oídos|Gastroenteritis bacteriana sin síntomas digestivos
eu-itu-2|Cultivo de bolsa interpretado como muestra estéril|Muestra recogida después de varios días de antibiótico|Cultivo de un recipiente doméstico recién enjuagado|Interpretación de cualquier crecimiento como infección
eu-itu-3|Cistitis sin compromiso alto|Bacteriuria asintomática|Vulvovaginitis aislada|Uretritis no febril
eu-itu-4|Confirmar infección usando exclusivamente el cultivo de bolsa|Descartar infección por el riesgo de contaminación de la bolsa|Esperar un nuevo cultivo antes de cualquier soporte o tratamiento|Interpretar el germen de bolsa como prueba suficiente de pielonefritis
eu-abdomen-ped-1|Estenosis hipertrófica de píloro|Reflujo gastroesofágico no complicado|Gastroenteritis viral sin complicaciones|Cólico del lactante sin signos sistémicos
eu-abdomen-ped-2|Prueba de cambio de fórmula antes de investigar|Observación domiciliaria por probable reflujo|Estudio ambulatorio de intolerancia alimentaria|Ayuno domiciliario y control si persiste al día siguiente
eu-abdomen-ped-3|Radiografía de tórax|Tránsito esofagogastroduodenal como primer estudio habitual|Tomografía abdominal sistemática como primera elección|Endoscopia digestiva alta
eu-abdomen-ped-4|Completar observación ambulatoria para localizar el dolor|Esperar respuesta a laxantes antes de escalar atención|Solicitar pruebas de intolerancia alimentaria primero|Priorizar tomografía antes de comenzar estabilización
eu-prenatal-1|Descartar todo riesgo mediante una ecografía inicial|Sustituir controles posteriores si el primer examen es normal|Reservar prevención para cuando surjan síntomas|Predecir con certeza la vía de nacimiento
eu-prenatal-2|Sólo durante el tercer trimestre|A partir del inicio del trabajo de parto|Después del nacimiento durante la lactancia|Una vez detectado el defecto en la ecografía
eu-prenatal-3|Tratar como migraña habitual sin medir presión|Esperar al control prenatal programado|Indicar reposo domiciliario antes de evaluar signos vitales|Solicitar evaluación oftalmológica antes de valoración obstétrica
eu-prenatal-4|Controles guiados exclusivamente por síntomas|Ecografías seriadas como sustituto de evaluación clínica|Una visita inicial y otra al finalizar la gestación|Seguimiento centrado sólo en el crecimiento fetal
eu-preeclampsia-1|Hipertensión gestacional sin datos de gravedad|Hipertensión crónica demostrada por la edad gestacional|Eclampsia en ausencia de convulsiones|Hipertensión de guardapolvo blanco
eu-preeclampsia-2|Reducir la presión mediante vasodilatación como objetivo principal|Acelerar la maduración pulmonar fetal|Corregir directamente la trombocitopenia|Inducir contracciones uterinas
eu-preeclampsia-3|Tratamiento de dispepsia y control ambulatorio de plaquetas|Repetir estudios en una semana si no hay proteinuria|Clasificar como HTA gestacional leve por ausencia de convulsiones|Atribuir las plaquetas bajas a variación fisiológica sin evaluación
eu-preeclampsia-4|La proteinuria es necesaria para reconocer preeclampsia|La cefalea convierte el cuadro en eclampsia sin convulsiones|La trombocitopenia aislada permite descartar enfermedad hipertensiva|La edad gestacional permite clasificarla como hipertensión crónica
eu-sangrado-gest-1|Amenaza de aborto sin repercusión circulatoria|Cólico renal no complicado|Hiperémesis gravídica aislada|Dolor por crecimiento uterino fisiológico
eu-sangrado-gest-2|Embarazo ectópico confirmado por ausencia de saco visible|Aborto completo confirmado con una ecografía aislada|Gestación intrauterina viable demostrada por el test positivo|Falla gestacional demostrada sin seguimiento
eu-sangrado-gest-3|Ecografía inicial no concluyente en paciente estable|Ausencia de saco visible en una gestación muy temprana|Necesidad de repetir un marcador según evolución|Manchado leve sin dolor ni repercusión clínica
eu-sangrado-gest-4|Considerar posible ectópico pese a escaso sangrado externo|Valorar perfusión junto con dolor y edad gestacional|Activar evaluación urgente ante la hipotensión|Reevaluar el estado circulatorio durante la asistencia
eu-hemorragia-posparto-1|Laceración aislada del canal del parto|Coagulopatía como única causa demostrada|Hematoma perineal sin sangrado uterino|Sangrado fisiológico del puerperio inmediato
eu-hemorragia-posparto-2|Atonía como explicación suficiente pese a útero firme|Efecto fisiológico de la involución uterina|Retardo de expulsión de loquios como causa principal|Sólo respuesta insuficiente al masaje uterino
eu-hemorragia-posparto-3|Tono, tensión, temperatura y tiempo|Trauma, trombosis, taquicardia y tejido|Tono, transfusión, temperatura y trombina|Tejido, tensión, trombosis y transporte
eu-hemorragia-posparto-4|Intensificar únicamente masaje uterino sin buscar otra causa|Descartar hemorragia relevante porque el tono es adecuado|Esperar descenso de hemoglobina para reevaluar el sangrado|Atribuir la pérdida a loquios por la contracción uterina
eu-anticoncepcion-1|Elegir el método de mayor eficacia sin explorar preferencias|Aplicar la misma pauta a toda persona de igual edad|Priorizar la experiencia del prescriptor sobre la elegibilidad|Elegir según regularidad menstrual como único criterio
eu-anticoncepcion-2|El DIU reduce el riesgo de ITS por su efecto local|El preservativo sólo agrega protección en el primer mes|El DIU hormonal brinda protección antiviral sostenida|La ausencia de síntomas en la pareja vuelve innecesaria la protección
eu-anticoncepcion-3|DIU de cobre|Implante de progestágeno|Píldora de progestágeno solo|DIU liberador de levonorgestrel
eu-anticoncepcion-4|Protección simultánea frente a infecciones sexuales|Mayor facilidad para ajustar la dosis cada día|Ausencia de necesidad de evaluar elegibilidad|Efectividad dependiente de uso en cada relación
eu-cervix-1|Diagnóstico de cáncer invasor|Confirmación de lesión de alto grado|Indicación de tratamiento excisional por el resultado aislado|Demostración de infección reciente por una pareja específica
eu-cervix-2|Confirmar el origen de un sangrado activo|Estadificar un cáncer ya diagnosticado|Determinar respuesta a quimioterapia|Diagnosticar únicamente lesiones que ya producen dolor
eu-cervix-3|Puede suspenderlo después de la primera dosis|Puede reemplazarlo por control de síntomas|Puede omitirlo si completó vacunación en adolescencia|Puede usar anticuerpos posvacunales como sustituto
eu-cervix-4|Esperar al intervalo de rastreo previamente pautado|Repetir sólo el test de VPH y diferir examen clínico|Atribuirlo a causa benigna por el último rastreo normal|Descartar lesión cervical si recibió vacuna
eu-abdomen-1|Completar tomografía antes de atender la hipotensión|Observar evolución del dolor con control diferido|Solicitar estudio ambulatorio antes de valoración quirúrgica|Esperar laboratorio para reconocer compromiso circulatorio
eu-abdomen-2|Debe esperar hasta confirmar el diagnóstico por imagen|Debe evitarse hasta que termine toda evaluación quirúrgica|Sólo puede usarse si desaparecen los signos peritoneales|Obliga a suspender el examen abdominal posterior
eu-abdomen-3|Posibilidad de gastritis como explicación inicial suficiente|Fecha del último control de colesterol|Antecedente de dispepsia como criterio para excluir causas ginecológicas|Respuesta previa a antiácidos como sustituto del test de embarazo
eu-abdomen-4|Colecistitis aguda|Pancreatitis aguda|Diverticulitis sigmoidea típica|Gastritis erosiva
eu-biliar-1|Cólico biliar no complicado|Colangitis sin datos de obstrucción|Hepatitis aguda como primera explicación|Pancreatitis aguda aislada
eu-biliar-2|Cólico biliar no complicado|Colecistitis crónica sin infección|Síndrome de Gilbert|Dispepsia funcional
eu-biliar-3|Radiografía simple de abdomen|Colangiopancreatografía retrógrada como primer estudio diagnóstico|Tomografía sin contraste para todo dolor biliar|Centellograma óseo
eu-biliar-4|Esperar normalización de bilirrubina con antibiótico|Demorar el control de la obstrucción hasta resolver todo el shock|Priorizar colecistectomía electiva diferida sin evaluar la vía biliar|Repetir antimicrobianos sin reconsiderar control del foco
eu-trauma-1|Canalizar acceso antes de cualquier compresión del sangrado|Medir hemoglobina antes de aplicar medidas hemostáticas|Completar inmovilización de la fractura antes del control vascular|Administrar cristaloides como intervención inicial exclusiva
eu-trauma-2|Permite excluir origen abdominal o pélvico del shock|Demuestra shock neurogénico|Descarta necesidad de reevaluación por hemorragia|Justifica traslado a tomografía sin valorar estabilidad
eu-trauma-3|Reduce la necesidad de evaluar coagulación|Permite usar la presión como único objetivo|Evita que la hemoglobina descienda por hemodilución|Sustituye el control de la fuente de sangrado
eu-trauma-4|Mantener el plan porque hubo respuesta inicial|Esperar al final de la evaluación secundaria|Atribuir el cambio a dolor sin reexaminar|Repetir la intervención previa sin evaluar otras amenazas
eu-quemaduras-1|Calcular superficie corporal antes de valorar vía aérea|Esperar estridor intenso para pedir apoyo de vía aérea|Priorizar curación local antes de soporte respiratorio|Usar saturación normal aislada para descartar lesión por inhalación
eu-quemaduras-2|Retirar ropa no adherida que retenga calor|Enfriar con agua corriente fresca evitando hipotermia|Cubrir con material limpio apropiado|Retirar anillos antes de progresión del edema
eu-quemaduras-3|Eritema superficial pequeño en tronco|Quemadura superficial limitada sin áreas especiales|Dolor local que mejora sin signos de profundidad|Lesión pequeña fuera de articulaciones y sin riesgo de inhalación
eu-quemaduras-4|Mantener la tasa calculada aunque cambie la diuresis|Ajustar líquidos sólo por superficie quemada inicial|Usar la fórmula como medición directa de pérdidas reales|Guiar reposición únicamente por el dolor
eu-epidemiologia-1|Prevalencia puntual|Densidad de incidencia por persona-tiempo|Tasa de letalidad|Riesgo relativo
eu-epidemiologia-2|Incidencia acumulada|Tasa de ataque|Densidad de incidencia|Razón de riesgos
eu-epidemiologia-3|Cohorte prospectiva|Ensayo aleatorizado|Estudio ecológico|Serie de casos sin comparación
eu-epidemiologia-4|Sólo que el valor p sea menor de 0,05|Sólo la magnitud de la asociación sin incertidumbre|Sólo el tamaño de la muestra|Sólo que ambos fenómenos ocurran simultáneamente
eu-pruebas-1|10%|50%|80%|95%
eu-pruebas-2|10%|80%|95%|180%
eu-pruebas-3|70%|43%|23%|77%
eu-pruebas-4|Mayor valor predictivo positivo en la segunda|Menor especificidad pese a mantenerse constante|Mayor sensibilidad pese a mantenerse constante|Igual valor predictivo positivo por usar la misma prueba
eu-prevencion-1|Prevención secundaria|Prevención terciaria|Prevención cuaternaria|Rehabilitación funcional
eu-prevencion-2|Prevención primaria|Prevención terciaria|Prevención cuaternaria|Cuidados paliativos
eu-prevencion-3|Prevención primaria por inmunización|Prevención secundaria por rastreo|Prevención terciaria por rehabilitación|Tratamiento etiológico de enfermedad confirmada
eu-prevencion-4|Mantener turnos sin cambios y repetir educación individual|Clasificarlo como falta de adherencia antes de explorar barreras|Dar altas de seguimiento por ausencias repetidas|Aumentar exigencias administrativas para confirmar compromiso
eu-vacunas-1|Reiniciar todas las series después de una interrupción|Duplicar la próxima dosis para compensar el retraso|Omitir dosis faltantes porque las previas siguen documentadas|Acortar cualquier intervalo mínimo para recuperar tiempo
eu-vacunas-2|Impide aplicar cualquier vacuna hasta ausencia total de síntomas|Obliga a reiniciar el esquema cuando se recupere|Requiere antibióticos antes de vacunar|Contraindica por sí solo todas las vacunas inactivadas
eu-vacunas-3|Vacunas inactivadas como grupo|Toxoides como grupo|Vacunas de subunidades como grupo|Vacunas conjugadas como grupo
eu-vacunas-4|Calendario de otro país con productos similares|Resumen de una convocatoria anterior sin comprobar cambios|Publicidad del fabricante como única referencia|Banco de preguntas sin fecha de actualización
eu-delirium-1|Trastorno neurocognitivo crónico estable|Depresión sin alteración atencional aguda|Trastorno psicótico primario de inicio gradual|Deterioro cognitivo leve sin fluctuación
eu-delirium-2|Demencia estable demostrada por somnolencia|Depresión confirmada por retraimiento|Sedación fisiológica del envejecimiento|Delirium descartado por ausencia de agitación
eu-delirium-3|Sedación para normalizar la conducta sin buscar desencadenantes|Contención como sustituto de investigación etiológica|Antipsicótico como tratamiento exclusivo del síndrome|Atribuir el cambio a demencia sin comparar el estado basal
eu-delirium-4|Progresión esperable de demencia en pocas horas|Depresión mayor confirmada por apatía|Efecto normal del entorno hospitalario|Ausencia de delirium porque no hay agitación
eu-depresion-1|Diagnóstico definitivo con una escala aislada|Clasificación como duelo por presencia de tristeza|Indicación farmacológica sin explorar evolución ni antecedentes|Descartar depresión si conserva alguna actividad laboral
eu-depresion-2|Episodios aislados de cansancio después de guardias|Antecedentes de insomnio transitorio por viaje|Preferencia por horarios nocturnos|Inquietud durante situaciones evaluativas
eu-depresion-3|Confirma el diagnóstico por el puntaje sin entrevista|Diferencia por sí sola depresión unipolar de bipolar|Sustituye la evaluación de riesgo|Determina automáticamente el fármaco indicado
eu-depresion-4|Esperar que el paciente mencione espontáneamente ideas de muerte|Evaluar sólo el puntaje de una escala|Posponer preguntas de seguridad hasta la segunda consulta|Valorar riesgo únicamente si hubo intento previo
eu-consentimiento-1|La firma de un familiar como sustituto de información|La presencia de dos testigos como requisito universal|Una explicación exclusivamente técnica sin comprobar comprensión|La aprobación del equipo en lugar de la decisión del paciente
eu-consentimiento-2|Solicitar a la familia que reemplace su decisión|Considerar el rechazo como incapacidad por sí mismo|Proceder porque la indicación médica es beneficiosa|Exigir autorización judicial para todo rechazo
eu-consentimiento-3|Compartirla por el parentesco aunque no exista autorización|Entregarla si quien la solicita conoce el diagnóstico|Revelarla siempre que se pida verbalmente|Permitir que la familia decida qué puede conocer el paciente
eu-consentimiento-4|Continuar porque la firma inicial mantiene vigencia irrevocable|Pedir al familiar que ratifique el consentimiento anterior|Interpretar el cambio como prueba suficiente de incapacidad|Exigir una nueva firma para reconocer cualquier revocación
eu-paliativos-1|Únicamente cuando se suspenden tratamientos de la enfermedad|Sólo durante los últimos días de vida|Después de agotar toda intervención oncológica|Sólo cuando el paciente ingresa en agonía
eu-paliativos-2|Síntomas físicos y resultados de laboratorio exclusivamente|Dolor y estado funcional sin contexto familiar|Problemas psicológicos como sustituto de evaluación física|Necesidades espirituales sin control de síntomas
eu-paliativos-3|Suspender también tratamientos de confort|Interrumpir seguimiento por ausencia de terapia curativa|Limitar comunicación a familiares sin escuchar al paciente|Retirar medidas de alivio porque no modifican supervivencia
eu-paliativos-4|Preferencias del equipo sin explorar prioridades del paciente|Disponibilidad tecnológica como único criterio|Deseos de familiares como sustituto automático de la voz del paciente|Probabilidad de prolongar vida sin considerar carga del tratamiento
recognize|Administrar oxígeno y comprobar de nuevo el pulso en un minuto|Ventilar como paro respiratorio mientras se espera confirmación del ritmo|Esperar el desfibrilador antes de comenzar compresiones|Registrar un ECG de 12 derivaciones antes de activar la respuesta
pulse|Hasta 5 segundos como límite máximo del algoritmo|Hasta 15 segundos|Hasta 20 segundos|Hasta 30 segundos
apnea|Iniciar compresiones por la apnea pese al pulso definido|Administrar oxígeno sin asistir la ventilación|Esperar el monitor antes de dar respiraciones|Aplicar una descarga antes de reevaluar el pulso
rate|80–100/min|120–140/min|60–80/min|140–160/min
recoil|Mantener presión residual para reducir el tiempo entre compresiones|Aumentar frecuencia por encima de 140/min para mejorar flujo|Pausar cada treinta segundos para valorar perfusión|Reducir profundidad al aumentar la frecuencia
ratio|15:2|20:2|30:1|15:1
shock|Asistolia|Actividad eléctrica sin pulso|Bradicardia sinusal sin pulso|Ritmo idioventricular sin pulso
pea|Fibrilación ventricular fina|Taquicardia ventricular sin pulso|Asistolia|Ritmo de perfusión espontánea recuperada
ecg-vt|Cardioversión sincronizada por tratarse de taquicardia|Adenosina antes de decidir descarga|Atropina y reevaluación del pulso|Estimulación transcutánea como primera intervención
aftershock|Comprobar pulso antes de reiniciar compresiones|Observar el monitor durante treinta segundos|Administrar una segunda descarga sin ciclo de RCP|Obtener ECG de doce derivaciones antes de continuar
nonshock|RCP de alta calidad|Adrenalina según algoritmo|Búsqueda de causas reversibles|Verificación de electrodos y ritmo
ecg-flat|Compresiones torácicas|Administración de adrenalina según protocolo|Ventilación apropiada|Búsqueda de causas reversibles
unstable|Desfibrilación no sincronizada de rutina|Adenosina antes de tratar la inestabilidad|Control de frecuencia oral con observación|Estimulación transcutánea
stable|La frecuencia aislada como criterio suficiente|El diagnóstico previo antes de valorar perfusión|La respuesta a un antiarrítmico usado como prueba diagnóstica|La duración del episodio como único criterio
 ecg-svt|Antecedente remoto de palpitaciones sin compromiso actual|Frecuencia elevada con presión conservada|Inicio súbito sin deterioro de perfusión|Regularidad del ritmo sin signos de shock
brady|Atropina por la frecuencia aislada|Estimulación transcutánea inmediata|Infusión de adrenalina sin evaluar repercusión|Cardioversión sincronizada
pacing|Repetir atropina sin límite hasta recuperar presión|Cardioversión sincronizada de la bradicardia|Adenosina en bolo|Observación sin soporte mientras persista el shock
ecg-brady|Indicar atropina antes de evaluar síntomas o causas|Aplicar marcapasos por la frecuencia de 40/min|Iniciar infusión de adrenalina por el número aislado|Tratar como paro porque la frecuencia es menor de 60/min
ecg-fv|Taquicardia ventricular monomórfica|Fibrilación auricular|Asistolia|Taquicardia supraventricular
ecg-pea|Bradicardia con perfusión conservada|Fibrilación ventricular|Taquicardia ventricular sin pulso|Asistolia
ecg-vt-pulse|Desfibrilación no sincronizada como elección rutinaria|Estimulación transcutánea|Descarga sincronizada con la onda T|Observación del ritmo antes de cualquier soporte
rosc-oxygen|88–92%|92–96%|94–100%|98–100%
rosc-map|55 mmHg|60 mmHg|75 mmHg|85 mmHg
rosc-prognosis|Concluir mal pronóstico por no despertar inmediatamente|Usar la sedación como prueba de lesión irreversible|Definir pronóstico mediante una exploración aislada|Basar la decisión únicamente en duración de la RCP
p-deterioration|Mejoría del esfuerzo respiratorio que permite disminuir soporte|Fatiga esperable que admite reevaluación diferida|Efecto tranquilizador de menor agitación|Cambio atribuible al sueño sin comprobar ventilación
p-pulse|Prolongar búsqueda del pulso por otros veinte segundos|Tratar como apnea con pulso sin iniciar compresiones|Esperar la frecuencia del monitor antes de intervenir|Administrar oxígeno y reevaluar en un minuto
p-newborn|Algoritmo de paro cardíaco adulto|Algoritmo de taquicardia pediátrica con pulso|Algoritmo pediátrico aplicado sin adaptación a la transición|Protocolo de síndrome coronario agudo
p-breaths|10–12/min|12–16/min|30–40/min|40–60/min
p-chest|Aumentar la frecuencia sin corregir fuga|Considerar eficaz por movimiento de la bolsa|Iniciar compresiones sin reevaluar pulso ni ventilación|Mantener la técnica y esperar respuesta de la saturación
p-airway|Administrar oxígeno sin asistir respiraciones ineficaces|Iniciar compresiones por la cianosis aislada|Esperar acceso venoso antes de ventilar|Priorizar gasometría antes de soporte respiratorio
p-ratio-two|30:2|3:1|15:1|20:2
p-ratio-one|15:2|3:1|30:1|20:2
p-depth|Un cuarto del diámetro anteroposterior|La mitad del diámetro anteroposterior|Dos centímetros en todas las edades|Seis centímetros en todo niño prepuberal
p-brady-rcp|Continuar ventilación sin compresiones hasta perder el pulso|Administrar atropina como sustituto de RCP en toda bradicardia|Cardioversión sincronizada|Esperar acceso vascular antes de comenzar compresiones
p-brady-first|Atropina antes de corregir hipoxia|Estimulación transcutánea como primera medida|Expansión con líquidos sin soporte ventilatorio|Adrenalina antes de evaluar ventilación
p-atropine|Bradicardia hipóxica como sustituto del soporte respiratorio|Taquicardia supraventricular por reentrada|Actividad eléctrica sin pulso de cualquier causa|Fibrilación ventricular refractaria
p-svt|Taquicardia sinusal|Fibrilación auricular|Taquicardia ventricular monomórfica|Bradicardia de escape nodal
p-sinus|Cardioversión por la frecuencia aislada|Adenosina para toda taquicardia pediátrica|Tratar como TSV pese a variación de RR|Iniciar antiarrítmico antes de valorar fiebre e hidratación
p-cardioversion|2–4 J|5–10 J|40–80 J|80–100 J
p-vf|Cardioversión sincronizada|Estimulación transcutánea|Adenosina antes de descarga|Atropina antes de descarga
p-pea|Desfibrilable por actividad visible|Cardioversión sincronizada por actividad organizada|Estimulación transcutánea como primera rama|Observación de ritmo con pulso recuperado
p-aftershock|Comprobación prolongada del pulso|Nueva descarga sin intervalo de RCP|ECG de doce derivaciones|Observación de la respuesta durante un minuto
p-first-energy|15 J|45 J|60 J|75 J
p-second-energy|30 J|45 J|75 J|90 J
p-epi|0,1 mL (0,01 mg)|0,5 mL (0,05 mg)|2 mL (0,2 mg)|10 mL (1 mg)
p-fever|Inducir recalentamiento hasta 39 °C|Aceptar la temperatura como objetivo posparo|Esperar el despertar antes de controlar temperatura|Guiarse sólo por temperatura periférica pese al dato central
p-neuro|Una exploración aislada inmediatamente después del paro|La duración de las compresiones como criterio único|La falta de respuesta durante sedación como criterio suficiente|Una sola medición de laboratorio como pronóstico definitivo
p-reassess|Mantener el plan sin controles hasta finalizar el turno|Cerrar la evaluación por la primera respuesta favorable|Repetir automáticamente la misma intervención|Dar por resuelta la causa por normalizarse un signo vital
f-priority|Completar imágenes abdominales antes de intervenir|Obtener laboratorio para caracterizar el deterioro|Esperar la valoración de la especialidad abdominal|Registrar antecedentes antes del soporte respiratorio
f-response|Completar la secuencia previa sin volver atrás|Esperar un nuevo cambio antes de reevaluar|Repetir la maniobra anterior sin evaluación|Solicitar laboratorio como sustituto de examen clínico
f-team|Asignar todas las intervenciones al líder|Distribuir tareas sin confirmar quién las realiza|Cambiar de responsable en cada intervención sin pase|Esperar a completar evaluación antes de pedir apoyo
f-airway|Balance de líquidos acumulado|Dolor como causa suficiente de la respiración|Necesidad de sedación antes de evaluar permeabilidad|Resultado de radiografía antes del examen de vía aérea
f-mask|Volumen que se desplaza dentro de la bolsa|Frecuencia nominal del dispositivo como único criterio|Tiempo desde el inicio como medida de eficacia|Saturación previa a la maniobra como confirmación
f-help|Continuar intentos idénticos sin plan alternativo|Sedación adicional antes de asegurar oxigenación|Esperar gasometría para solicitar ayuda|Priorizar acceso central antes de resolver la amenaza
f-co2|Oxigenación normal como prueba de ventilación adecuada|Hiperventilación con eliminación excesiva de CO₂|Hipocapnia compensada por oxígeno|Alteración exclusivamente metabólica sin compromiso ventilatorio
f-fatigue|Reducir vigilancia por menor esfuerzo visible|Interpretar el cambio como alivio de la disnea|Esperar caída de saturación antes de reevaluar ventilación|Mantener soporte sin cambios hasta obtener imagen
f-oximeter|Ajustar todo el tratamiento según la lectura aislada|Descartar hipoxemia por una cifra aparentemente normal|Usar la saturación como medición directa de ventilación|Ignorar la perfusión al interpretar el sensor
f-pbw|660 mL|300 mL|480 mL|550 mL
f-plateau|Mantener el volumen sin revisar por estar dentro del peso real|Aumentar volumen para reducir frecuencia respiratoria|Interpretar la presión meseta como presión pico sin más evaluación|Guiarse exclusivamente por saturación para mantener ajustes
f-actual|Peso real y edad|Índice de masa corporal y peso real|Perímetro abdominal y peso actual|Balance acumulado y peso de ingreso
f-fluids|Completar bolos iguales pese a congestión nueva|Usar presión venosa central aislada para decidir más volumen|Guiarse únicamente por volumen administrado previamente|Atribuir la congestión a infección sin reevaluar líquidos
f-dynamic|Presión venosa central aislada|Diámetro venoso aislado sin contexto|Frecuencia cardíaca de una única medición|Valor absoluto de hemoglobina
f-vasopressor|Dopamina como elección habitual inicial|Dobutamina como vasopresor inicial único|Vasopresina como primera monoterapia habitual|Fenilefrina como primera elección sistemática
f-antibiotics|Esperar resultados de hemocultivos|Diferir hasta completar todas las imágenes|Observar durante seis horas antes de decidir|Esperar normalización hemodinámica para administrarlos
f-possible|Antimicrobianos en toda sospecha sin evaluación inicial|Esperar hemocultivos definitivos antes de decidir|Diferir veinticuatro horas en ausencia de shock|Usar procalcitonina como único criterio de inicio
f-source|Prolongar antibiótico sin valorar drenaje|Esperar esterilización del foco antes de evaluar intervención|Postergar evaluación del foco hasta normalizar todos los signos|Cambiar antibiótico como sustituto de controlar la colección
f-glucose|Hemoglobina glicosilada|Cetonuria como única medición inicial|Colesterol capilar|Urea antes de medir glucemia
f-hypoxia|Completar examen neurológico antes de tratar ABC|Realizar neuroimagen antes de corregir hipoxemia|Administrar sedación antes de valorar circulación|Esperar interconsulta sin soporte inicial
f-drugs|Atribuirlo a lesión neurológica irreversible|Considerar esperable sin comprobar ventilación|Esperar eliminación del fármaco sin reevaluar ABC|Usar la dosis administrada como prueba de seguridad
f-handoff|Diagnóstico probable y lista de estudios sin situación actual|Cronología completa sin problema ni pedido concreto|Signos vitales aislados sin antecedentes relevantes|Tratamiento indicado sin informar la respuesta
f-change|Únicamente el diagnóstico al ingreso|Sólo los resultados previos al cambio|La intervención sin describir su efecto|El último valor normal sin informar deterioro
f-recheck|Sólo la intervención realizada, sin respuesta|El diagnóstico presuntivo sin cambios clínicos|Los valores previos como estado actual|La mejoría subjetiva sin hallazgos ni tratamiento
phtls-1-1|Iniciar evaluación primaria dentro del área de derrame|Trasladar al primer lesionado antes de coordinar seguridad vial|Priorizar acceso venoso antes de controlar el riesgo ambiental|Ingresar con protección personal sin valorar riesgos de la escena
phtls-1-2|Clasificar bajo riesgo por mantener conversación coherente|Descartar lesión torácica si puede hablar en frases completas|Usar el mecanismo como único criterio de gravedad|Priorizar evaluación secundaria sin completar la primaria
phtls-1-3|Completar la atención de la primera víctima antes de pedir recursos|Priorizar por orden de llegada al lugar del incidente|Asignar ambos rescatistas a una lesión llamativa sin triage|Obtener antecedentes completos antes de comunicar múltiples víctimas
phtls-2-1|Mantener únicamente elevación del miembro|Agregar vendaje flojo para conservar circulación distal|Esperar respuesta a líquidos antes del control mecánico|Realizar compresión venosa distal a la herida
phtls-2-2|Considerar suficiente la colocación aunque persista el sangrado|Aflojar el dispositivo para reducir dolor|Priorizar expansión sin corregir la hemorragia|Mantenerlo sin revisión hasta llegar al hospital
phtls-2-3|Aflojarlo cada diez minutos para recuperar perfusión distal|Retirarlo si disminuye el dolor del miembro|Cambiarlo de sitio durante cada control de signos vitales|Liberarlo cuando la presión arterial se normalice
phtls-3-1|Aumentar únicamente el flujo de oxígeno|Esperar aumento de saturación sin asistir respiraciones|Priorizar la inmovilización sobre la ventilación ineficaz|Dar por resuelto el problema al colocar reservorio
phtls-3-2|Ventilar sin retirar secreciones aunque impidan el paso de aire|Esperar el traslado para despejar la vía aérea|Considerar protegida la vía aérea si conserva pulso|Administrar oxígeno como sustituto de desobstrucción
phtls-3-3|Completar inmovilización antes de cualquier soporte respiratorio|Evitar maniobras de apertura por el riesgo cervical|Esperar imagen cervical antes de asegurar oxigenación|Retirar toda protección para facilitar cualquier maniobra
phtls-4-1|Confirmar con tomografía antes de tratar la sospecha inestable|Esperar radiografía aunque retrase el soporte necesario|Tratar como exacerbación asmática antes de reevaluar trauma|Trasladar sin reevaluación por ausencia de confirmación radiológica
phtls-4-2|Registrar la intervención y diferir controles hasta destino|Considerar resuelto el shock por mejoría respiratoria inicial|Completar antecedentes antes de verificar respuesta|Repetir la intervención de rutina sin evaluar su efecto
phtls-4-3|Atribuir el deterioro exclusivamente al dolor|Mantener la cobertura sin valorar su efecto|Esperar al receptor por haber realizado una intervención|Aumentar oxígeno sin comprobar ventilación y perfusión
phtls-5-1|La presión normal excluye shock hemorrágico|La taquicardia demuestra una respuesta exclusiva al dolor|La confusión permite atribuirlo sólo a trauma craneal|El shock sólo se reconoce tras caída de hemoglobina
phtls-5-2|Mantener exposición completa durante todo el traslado|Administrar líquidos fríos para reducir consumo metabólico|Posponer cobertura térmica hasta descartar fracturas|Evitar monitorización de temperatura si la presión es normal
phtls-5-3|Normalizar presión con líquidos sin controlar sangrado|Completar todos los procedimientos antes de iniciar traslado|Decidir respuesta únicamente por frecuencia cardíaca|Prolongar la escena hasta disponer de todos los estudios
phtls-6-1|Atribuir el cambio al movimiento del vehículo|Mantener evaluación inicial si no aparecen convulsiones|Priorizar analgesia sin comprobar ventilación y perfusión|Esperar llegada para comunicar el cambio neurológico
phtls-6-2|Hiperglucemia leve y taquicardia aislada como principales objetivos inmediatos|Dolor localizado y ansiedad sin alteración de ABC|Fiebre previa y sed como únicas causas de deterioro secundario|Hipertensión crónica estable y normoxemia
phtls-6-3|La intoxicación explica suficientemente la confusión|Un olor alcohólico permite diferir examen neurológico|La ausencia de herida externa excluye lesión intracraneal|La mejoría parcial con estímulo descarta otra causa
phtls-7-1|La presión normal excluye pérdida importante de volumen|La taquicardia sólo informa sobre dolor|La hipotensión aparece antes de cambios de perfusión|La presión aislada define mejor gravedad que la tendencia clínica
phtls-7-2|Uso de antihistamínico tópico|Tratamiento con vitamina D|Uso de lubricante ocular|Suplementación con calcio sin otros fármacos
phtls-7-3|Completar evaluación fetal antes de corregir hipoxia materna|Priorizar ecografía obstétrica antes de tratar shock|Evitar intervenciones maternas hasta conocer vitalidad fetal|Usar frecuencia fetal como sustituto de perfusión materna
phtls-8-1|Elegir siempre el menor tiempo de viaje sin considerar capacidad|Elegir siempre el centro de mayor complejidad sin considerar estabilidad|Priorizar preferencia del acompañante sobre la necesidad clínica|Usar únicamente la distancia kilométrica
phtls-8-2|Diagnóstico presuntivo sin signos vitales ni respuesta|Edad y mecanismo sin estado actual|Lista de insumos utilizados sin hallazgos clínicos|Datos administrativos antes de informar gravedad
phtls-8-3|Mantener las medidas porque fueron adecuadas al inicio|Esperar al ingreso para registrar el cambio|Repetir automáticamente la última intervención|Informar sólo si aparece paro cardíaco
atls-1-1|Exploración neurológica ampliada|Exposición completa antes de toda intervención|Examen radiológico inicial|Evaluación de lesiones de extremidades no sangrantes
atls-1-2|Completar la secundaria para evitar perder lesiones|Esperar estudios solicitados antes de volver al ABC|Repetir analgesia como única medida inicial|Mantener la prioridad previa porque la primaria ya se realizó
atls-1-3|Intervenciones simultáneas sin responsables definidos|Concentrar cada procedimiento en el líder|Asignar tareas sin confirmar ejecución|Comunicar sólo al terminar toda la reanimación
atls-2-1|Usar mejoría del color como confirmación suficiente|Esperar radiografía antes de vigilar ventilación|Dar por correcta la posición por visualizar el paso del tubo|Retirar controles al fijar el dispositivo
atls-2-2|La oxigenación arterial directa|El volumen circulante exacto|La presión intracraneal|La saturación venosa central
atls-2-3|Esperar exclusión radiológica de lesión cervical|Mantener inmovilización aunque impida oxigenar|Priorizar colocación de collar sobre cualquier soporte|Realizar maniobras sin precaución cervical por urgencia
atls-3-1|Solicitar apoyo del equipo de trauma|Reevaluar ventilación durante el tratamiento|Preparar intervención por personal capacitado|Valorar respuesta circulatoria posterior
atls-3-2|Hipovolémico por pérdida sanguínea como mecanismo de la tensión|Distributivo por vasoplejía primaria|Cardiogénico por necrosis miocárdica como mecanismo habitual|Neurogénico por pérdida de tono simpático
atls-3-3|Atribuir todo el shock al episodio torácico ya tratado|Esperar recuperación circulatoria sin nueva evaluación|Clasificar como respuesta completa por mejor ventilación|Repetir la intervención torácica sin buscar otras fuentes
atls-4-1|Descarta pérdida relevante en las primeras horas|Permite atribuir el shock a causa no hemorrágica|Excluye necesidad de activar evaluación del sangrado|Demuestra volumen circulante conservado
atls-4-2|Respuesta completa que permite bajar la vigilancia|Efecto esperado de la analgesia como explicación suficiente|Resolución de la causa por la primera mejoría|Ausencia de hemorragia porque hubo respuesta a volumen
atls-4-3|Enfriar activamente para disminuir metabolismo|Guiar reanimación sólo por hemoglobina inicial|Mantener exposición completa sin protección térmica|Diferir vigilancia de coagulación hasta finalizar traslado
atls-5-1|Completar tomografía corporal antes de decidir intervención|Esperar estudios anatómicos exhaustivos aunque persista shock|Repetir imágenes seriadas como sustituto de controlar la fuente|Basar la decisión sólo en disponibilidad del tomógrafo
atls-5-2|Gran hemopericardio claramente visualizado en ventana adecuada|Líquido libre abundante ya identificado en el mismo examen|Derrame peritoneal que el estudio acaba de demostrar|Hemoperitoneo masivo documentado en todas las ventanas
atls-5-3|Descartar futuras complicaciones por una imagen normal|Sustituir reevaluación hemodinámica durante observación|Garantizar que no hará falta intervención posterior|Determinar estabilidad sin usar datos clínicos
atls-6-1|Confirmación automática de lesión irreversible|Evolución esperable que no modifica la prioridad|Indicación de esperar una nueva medición sin reevaluar ABC|Efecto atribuible al dolor hasta demostrar otra causa
atls-6-2|Reducir perfusión sistémica para controlar edema|Aceptar hipoxemia si la presión es normal|Guiarse sólo por Glasgow sin revisar ABC|Inducir hipotensión como objetivo general
atls-6-3|Esperar resolución espontánea antes de documentar|Atribuir déficit a dolor sin comparar fuerza y sensibilidad|Retirar precauciones si no hay dolor cervical|Completar trámites antes de informar el cambio
atls-7-1|Antes de tratar una amenaza de vía aérea|Inmediatamente después de una única presión normal|Tras completar todas las imágenes aunque persista shock|Al terminar el interrogatorio aun con sangrado activo
atls-7-2|Uso de levotiroxina|Uso de hierro oral|Uso de inhibidor de bomba de protones|Uso de vitamina B12
atls-7-3|Permite excluir fractura sin imágenes|Sustituye la evaluación de compartimentos|Descarta lesión vascular futura con un pulso inicial normal|Define por sí solo ausencia de lesión nerviosa
atls-8-1|Completar todos los estudios locales antes de contactar receptor|Esperar normalización completa antes de organizar traslado|Mantener observación hasta que la lesión sea visible en nuevos estudios|Derivar sin coordinar recursos durante el traslado
atls-8-2|Sólo el nombre del procedimiento|Sólo la hora de ingreso al centro|Sólo los hallazgos anteriores a la intervención|Sólo el diagnóstico supuesto al inicio
atls-8-3|Que cada estudio solicitado esté informado antes de salir|Que ya no exista ninguna incertidumbre diagnóstica|Que todos los signos vitales hayan sido normales una vez|Que el transporte esté disponible, sin revisar soporte
rv-sus-1|Universalidad|Integralidad|Descentralización|Regionalización
rv-sus-2|Universalidad|Equidad|Descentralización administrativa|Participación social
rv-sus-3|Equidad distributiva|Integralidad del cuidado|Regionalización|Control social
rv-sus-4|Si una distribución idéntica asegura equidad por sí misma|Si el número de habitantes puede reemplazar toda evaluación de necesidad|Si conviene asignar según demanda histórica sin revisar barreras|Si la igualdad administrativa debe prevalecer sobre riesgo sanitario
rv-red-1|Concentrar seguimiento sólo en el hospital que dio el alta|Separar rehabilitación de la planificación del egreso|Dejar que cada servicio decida sin transferencia de información|Finalizar el seguimiento del episodio al salir de internación
rv-red-2|Mayor concentración hospitalaria sin acciones comunitarias|Más procedimientos de alta complejidad como único cambio|Seguimiento centrado exclusivamente en episodios agudos|Ampliación administrativa sin intervenciones preventivas
rv-red-3|Hospitalización como puerta de entrada para toda necesidad|Atención primaria aislada de servicios especializados|Servicios especializados sin referencia ni contrarreferencia|Separación de prevención y tratamiento en redes incomunicadas
rv-red-4|Permite estimar integralidad usando producción quirúrgica solamente|Demuestra equidad por el número total de procedimientos|Permite inferir universalidad sin medir acceso|Describe continuidad aunque no mida seguimiento
rv-prioridades-1|Obtener antecedentes completos antes de evaluar respiración|Priorizar glucemia sin comprobar permeabilidad|Solicitar radiografía antes de soporte de vía aérea|Completar examen neurológico antes de corregir la amenaza
rv-prioridades-2|Manteniendo el plan sin nuevos controles|Dando por resuelta la causa de la alteración|Cerrando el episodio por la primera respuesta favorable|Esperando deterioro evidente para repetir el examen
rv-prioridades-3|Diagnóstico probable y resultados sin pedido concreto|Historia cronológica extensa sin estado actual|Signos vitales aislados sin contexto|Lista de intervenciones sin respuesta observada
rv-prioridades-4|Completar la secuencia antes de intervenir|Registrar el hallazgo y esperar estudios confirmatorios|Delegar el problema sin verificar su resolución|Pasar a la evaluación secundaria para precisar diagnóstico
rv-infancia-1|Rehidratación domiciliaria habitual sin reevaluación|Manejo como diarrea leve por no conocer número de deposiciones|Control diferido tras probar alimentos astringentes|Esperar descenso documentado de peso para valorar gravedad
rv-infancia-2|Bebida deportiva|Agua sola como reposición completa|Jugo de fruta diluido|Infusión azucarada
rv-infancia-3|Ayuno hasta desaparición de deposiciones|Suspender lactancia durante un día|Diluir de rutina toda la alimentación|Reemplazar tomas por infusiones
rv-infancia-4|Antibiótico preventivo para todos los convivientes|Restricción alimentaria como principal control de transmisión|Antidiarreicos para disminuir contagiosidad|Aislamiento sin medidas de agua o higiene
rv-preparacion-1|Acceso a una residencia médica específica|Obtención de título de especialista por experiencia|Certificación de un curso de soporte vital|Renovación periódica del diploma de una universidad brasileña
rv-preparacion-2|Equivale a aprobar el examen oficial con ese porcentaje|Permite omitir la preparación práctica|Garantiza igual desempeño en otra convocatoria|Demuestra cobertura completa de la matriz oficial
rv-preparacion-3|En un resumen de una academia sin contrastar la convocatoria|En el calendario de un examen de otro país|En un banco de preguntas de una edición anterior|En comentarios de aspirantes sin documentación oficial
rv-preparacion-4|Permite sustituir toda práctica de comunicación|Acredita ejecución de procedimientos por aciertos teóricos|Demuestra destreza técnica mediante reconocimiento de opciones|Evalúa por completo el desempeño en una estación clínica
`;
export const distractors=Object.fromEntries(rows.trim().split('\n').map(row=>{const [id,...options]=row.split('|');return [id.trim(),options];}));
export const questionEdits={
 'eu-dengue-2':{prompt:'En dengue sospechado, ¿cuál de estos fármacos pertenece a los AINE y debe evitarse por el riesgo de sangrado?',distractors:['Paracetamol','Morfina','Tramadol','Fentanilo'],why:'Ibuprofeno es un AINE. Los distractores no pertenecen a ese grupo; esto no implica que los opioides estén indicados para el dengue. La elección sintomática requiere la guía y el contexto clínico.'},
 'atls-5-2':{prompt:'En trauma, ¿qué localización de sangrado puede pasar inadvertida en un FAST abdominal estándar negativo?',distractors:['Receso hepatorrenal con abundante líquido libre','Receso esplenorrenal con abundante líquido libre','Fondo de saco pélvico con abundante líquido libre','Saco pericárdico con derrame importante'],why:'Un FAST negativo no excluye sangrado retroperitoneal; también puede omitir pequeñas cantidades de líquido u otras lesiones. Las otras opciones son ventanas habituales del examen, sin que una exploración negativa garantice ausencia de lesión.'},
 'eu-itu-1':{prompt:'Lactante febril sin foco respiratorio ni digestivo en la evaluación inicial. ¿Qué infección puede presentarse sin síntomas urinarios referidos y merece investigación dirigida?',distractors:['Otitis media confirmada sólo por fiebre','Neumonía confirmada sin hallazgos respiratorios','Gastroenteritis bacteriana sin síntomas digestivos','Faringitis estreptocócica asumida sin examen de fauces']},
 'p-newborn':{distractors:['PALS sin adaptación al período de transición','RCP pediátrica con relación 15:2 desde el nacimiento','RCP adulta con relación 30:2 por dos reanimadores','Algoritmo de bradicardia infantil sin considerar ventilación neonatal']}
};
export function improveQuestions(courses){for(const c of courses)for(const l of c.lessons)for(const q of l.questions){const edit=questionEdits[q.id]||{},wrong=edit.distractors||distractors[q.id];if(!wrong)continue;if(wrong.length!==4)throw new Error('Se requieren cuatro distractores: '+q.id);if(edit.prompt)q.prompt=edit.prompt;if(edit.why)q.why=edit.why;const correct=q.options[q.answer];q.options=[...wrong];q.options.splice(q.answer,0,correct);q.editorialRevision=2;}}
