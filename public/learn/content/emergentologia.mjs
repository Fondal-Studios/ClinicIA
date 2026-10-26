// Banco original de preparación académica en Emergentología; revisión docente requerida.
export const emergencySources={
 "airway-das":{title:"Difficult Airway Society · Guías de vía aérea, incluidas recomendaciones 2025",url:"https://das.uk.com/guidelines/"},
 "fccs":{title:"SCCM · Fundamental Critical Care Support (programa y módulos)",url:"https://www.sccm.org/education-center/educational-programming/fundamentals/fundamental-critical-care-support/fundamental-critical-care-support-self-study"},
 "phtls":{title:"NAEMT · PHTLS (temario y competencias públicas)",url:"https://www.naemt.org/education/trauma-education/phtls"}
};
export const emergencyCourses=[
  {
    "id": "via-aerea-avanzada",
    "title": "Manejo avanzado de la vía aérea",
    "subtitle": "Preparación académica en vía aérea difícil y paciente crítico",
    "audience": "Personal sanitario según incumbencias",
    "category": "emergentologia",
    "summary": "Curso original de estudio de la vía aérea avanzada; no habilita para técnicas invasivas ni certifica destreza manual.",
    "scope": "Formación teórica independiente basada en bibliografía pública. No es un curso DAS ni una certificación clínica.",
    "reviewStatus": "Pendiente de revisión por docentes de emergentología y anestesiología.",
    "lessons": [
      {
        "id": "vaa-1",
        "title": "Evaluación de dificultad anatómica y fisiológica",
        "minutes": 12,
        "source": "airway-das",
        "body": "Antes de intervenir, evaluá predictores anatómicos, reserva de oxígeno, shock, acidosis y posibilidad de ventilación difícil. Prepará planes de rescate, roles y equipamiento. La dificultad fisiológica puede ser tan crítica como la anatomía.",
        "objective": "Aplicar la evaluación inicial, anticipar riesgos y justificar cada decisión en un caso simulado.",
        "questions": [
          {
            "id": "vaa-1a",
            "prompt": "Paciente con neumonía grave, SpO₂ 83 % y presión 78/45 mmHg. ¿Qué riesgo adicional al anatómico debés anticipar?",
            "options": [
              "Colapso hemodinámico durante la intervención",
              "Sólo lesión dentaria",
              "Ausencia de riesgo si abre bien la boca"
            ],
            "answer": 0,
            "why": "La hipotensión y la hipoxemia condicionan la tolerancia a la inducción y a la apnea.",
            "source": "airway-das",
            "skill": "evaluacion"
          },
          {
            "id": "vaa-1b",
            "prompt": "¿Cuál es la preparación más segura ante vía aérea potencialmente difícil?",
            "options": [
              "Un intento sin plan alternativo",
              "Plan principal, rescate, roles y límite de intentos",
              "Retrasar toda oxigenación hasta la intubación"
            ],
            "answer": 1,
            "why": "El enfoque escalonado exige preparación y límites para evitar traumatismos y pérdida de oxigenación.",
            "source": "airway-das",
            "skill": "planificacion"
          },
          {
            "id": "vaa-1c",
            "prompt": "¿Qué elemento expresa dificultad fisiológica de vía aérea?",
            "options": [
              "Shock con acidosis metabólica grave",
              "Barba espesa aislada",
              "Movilidad cervical normal"
            ],
            "answer": 0,
            "why": "La acidosis grave exige minimizar interrupciones de ventilación y anticipar deterioro.",
            "source": "airway-das",
            "skill": "evaluacion"
          },
          {
            "id": "vaa-1d",
            "prompt": "Al repartir funciones antes del procedimiento, ¿qué acción tiene mayor valor?",
            "options": [
              "Designar operador, monitorización, fármacos y responsable del plan de rescate",
              "Pedir silencio sin planificar roles",
              "Esperar a necesitar material alternativo"
            ],
            "answer": 0,
            "why": "La comunicación y el reparto explícito de tareas reducen errores evitables.",
            "source": "airway-das",
            "skill": "equipo"
          }
        ]
      },
      {
        "id": "vaa-2",
        "title": "Preoxigenación y seguridad periintubación",
        "minutes": 12,
        "source": "airway-das",
        "body": "La preoxigenación persigue aumentar la reserva de oxígeno antes de la apnea. Requiere vigilar saturación, ventilación, hemodinamia y optimizar la posición. En hipoxemia grave, evaluar soporte no invasivo según escenario y protocolo local.",
        "objective": "Aplicar la evaluación inicial, anticipar riesgos y justificar cada decisión en un caso simulado.",
        "questions": [
          {
            "id": "vaa-2a",
            "prompt": "¿Cuál es el objetivo central de preoxigenar antes de una intervención de vía aérea?",
            "options": [
              "Aumentar reserva de oxígeno y retrasar desaturación",
              "Garantizar intubación al primer intento",
              "Sustituir la vigilancia de capnografía"
            ],
            "answer": 0,
            "why": "La reserva de oxígeno prolonga el margen de seguridad, pero no elimina el riesgo.",
            "source": "airway-das",
            "skill": "oxigenacion"
          },
          {
            "id": "vaa-2b",
            "prompt": "Paciente muy hipoxémico pese a oxígeno convencional. ¿Qué consideración es adecuada?",
            "options": [
              "Escalar estrategia de oxigenación con equipo entrenado y monitorización",
              "Retirar monitor para disminuir alarmas",
              "Asumir que la preoxigenación fue suficiente"
            ],
            "answer": 0,
            "why": "La hipoxemia grave puede precisar otra estrategia; se individualiza según recursos y fisiología.",
            "source": "airway-das",
            "skill": "oxigenacion"
          },
          {
            "id": "vaa-2c",
            "prompt": "¿Qué variable debe seguirse también durante la preparación, además de SpO₂?",
            "options": [
              "Perfusión y presión arterial",
              "Únicamente temperatura ambiental",
              "Sólo número de intentos previos"
            ],
            "answer": 0,
            "why": "La fisiología hemodinámica es determinante durante la inducción y la ventilación.",
            "source": "airway-das",
            "skill": "monitorizacion"
          },
          {
            "id": "vaa-2d",
            "prompt": "¿Qué afirmación sobre oxigenación es correcta?",
            "options": [
              "Una saturación aceptable no garantiza ventilación adecuada",
              "SpO₂ mide directamente el CO₂",
              "La apnea siempre se reconoce de inmediato en pulsioximetría"
            ],
            "answer": 0,
            "why": "La oximetría tiene retraso y no sustituye evaluación ventilatoria ni capnografía.",
            "source": "airway-das",
            "skill": "monitorizacion"
          }
        ]
      },
      {
        "id": "vaa-3",
        "title": "Intubación, dispositivos y confirmación",
        "minutes": 12,
        "source": "airway-das",
        "body": "Repasá laringoscopia directa y videoasistida, uso de introductores, succión y dispositivos supraglóticos de rescate. Los procedimientos prácticos requieren entrenamiento presencial supervisado. La confirmación objetiva del tubo exige capnografía sostenida junto con evaluación clínica.",
        "objective": "Aplicar la evaluación inicial, anticipar riesgos y justificar cada decisión en un caso simulado.",
        "questions": [
          {
            "id": "vaa-3a",
            "prompt": "Tras colocar un tubo endotraqueal, ¿cuál es la herramienta de confirmación objetiva prioritaria?",
            "options": [
              "Capnografía de onda sostenida",
              "Auscultación aislada",
              "Coloración de la cánula"
            ],
            "answer": 0,
            "why": "La capnografía continua es esencial para confirmar y vigilar la posición traqueal.",
            "source": "airway-das",
            "skill": "confirmacion"
          },
          {
            "id": "vaa-3b",
            "prompt": "¿Qué actitud es más segura ante visión laríngea pobre?",
            "options": [
              "Repetir idéntica maniobra sin límite",
              "Reevaluar y cambiar técnica o dispositivo según plan",
              "Continuar aunque la oxigenación empeore"
            ],
            "answer": 1,
            "why": "Los intentos repetitivos sin modificación aumentan daño y empeoran condiciones.",
            "source": "airway-das",
            "skill": "rescate"
          },
          {
            "id": "vaa-3c",
            "prompt": "¿Cuál es el papel de un dispositivo supraglótico de segunda generación?",
            "options": [
              "Puede aportar rescate de oxigenación en el algoritmo",
              "Es equivalente a confirmar tubo traqueal",
              "Elimina siempre el riesgo de aspiración"
            ],
            "answer": 0,
            "why": "Forma parte de estrategias de rescate, con limitaciones clínicas específicas.",
            "source": "airway-das",
            "skill": "dispositivos"
          },
          {
            "id": "vaa-3d",
            "prompt": "¿Qué corresponde a un módulo virtual de preparación?",
            "options": [
              "Elegir dispositivo y justificar estrategia",
              "Acreditar destreza manual con un cuestionario",
              "Autorizar intubaciones sin supervisión"
            ],
            "answer": 0,
            "why": "Una simulación cognitiva no certifica habilidad procedimental práctica.",
            "source": "airway-das",
            "skill": "seguridad"
          }
        ]
      },
      {
        "id": "vaa-4",
        "title": "Fracaso de intubación y CICO",
        "minutes": 12,
        "source": "airway-das",
        "body": "El manejo de intubación fallida prioriza restaurar oxigenación, pedir ayuda precoz, reconocer la situación no intubable/no oxigenable (CICO) y activar protocolos institucionales. Los procedimientos de acceso frontal al cuello exigen formación práctica específica.",
        "objective": "Aplicar la evaluación inicial, anticipar riesgos y justificar cada decisión en un caso simulado.",
        "questions": [
          {
            "id": "vaa-4a",
            "prompt": "Dos intentos fallidos, ventilación posible con bolsa-mascarilla. ¿Qué prioridad mantiene seguridad?",
            "options": [
              "Restaurar oxigenación y replantear plan con el equipo",
              "Mantener laringoscopia prolongada",
              "Evitar pedir ayuda"
            ],
            "answer": 0,
            "why": "El fracaso de intubación no debe convertirse en fracaso de oxigenación.",
            "source": "airway-das",
            "skill": "rescate"
          },
          {
            "id": "vaa-4b",
            "prompt": "¿Qué significa CICO?",
            "options": [
              "No intubable, no oxigenable",
              "CO₂ alto sin otros riesgos",
              "Intubación completada con buena ventilación"
            ],
            "answer": 0,
            "why": "La identificación precoz del escenario CICO es crítica para activar la respuesta prevista.",
            "source": "airway-das",
            "skill": "rescate"
          },
          {
            "id": "vaa-4c",
            "prompt": "¿Cómo se prepara mejor el equipo para una vía aérea difícil?",
            "options": [
              "Verbalizando un disparador claro para cambiar de plan",
              "Sin comunicar el plan alternativo",
              "Dejando los dispositivos de rescate en otro sector"
            ],
            "answer": 0,
            "why": "El disparador compartido favorece decisiones oportunas.",
            "source": "airway-das",
            "skill": "equipo"
          },
          {
            "id": "vaa-4d",
            "prompt": "Tras rescatar la oxigenación, ¿qué debe evitarse?",
            "options": [
              "Intentos repetidos sin cambio de estrategia",
              "Reevaluar fisiología",
              "Documentar el evento"
            ],
            "answer": 0,
            "why": "La perseveración incrementa el daño sin mejorar la probabilidad de éxito.",
            "source": "airway-das",
            "skill": "seguridad"
          }
        ]
      },
      {
        "id": "vaa-5",
        "title": "Escenarios especiales y cuidados posteriores",
        "minutes": 12,
        "source": "airway-das",
        "body": "Integra trauma cervical, gestación, obesidad, hipoxemia grave y shock. Después del procedimiento verificá posición, ventilación, analgesia, sedación y complicaciones. Documentá dispositivos utilizados, dificultad y plan de vigilancia.",
        "objective": "Aplicar la evaluación inicial, anticipar riesgos y justificar cada decisión en un caso simulado.",
        "questions": [
          {
            "id": "vaa-5a",
            "prompt": "Ante trauma con sospecha de lesión cervical, ¿qué conducta es apropiada?",
            "options": [
              "Planificar protección cervical compatible con oxigenación y protocolo",
              "Ignorar la lesión cervical",
              "Suspender toda oxigenación"
            ],
            "answer": 0,
            "why": "Se balancean protección cervical y prioridades vitales, con técnicas entrenadas.",
            "source": "airway-das",
            "skill": "trauma"
          },
          {
            "id": "vaa-5b",
            "prompt": "En un paciente intubado que de pronto desatura, ¿qué primer enfoque es correcto?",
            "options": [
              "Revisar paciente, tubo, circuito y ventilación con monitorización",
              "Suponer ansiedad",
              "Esperar a que se normalice espontáneamente"
            ],
            "answer": 0,
            "why": "El deterioro agudo requiere descartar desplazamiento u obstrucción y otras causas reversibles.",
            "source": "airway-das",
            "skill": "posintubacion"
          },
          {
            "id": "vaa-5c",
            "prompt": "¿Qué vigilancia conviene mantener tras confirmar el tubo?",
            "options": [
              "Capnografía continua y parámetros ventilatorios/hemodinámicos",
              "Sólo mirar el monitor una vez",
              "Retirar los controles porque el tubo ya quedó"
            ],
            "answer": 0,
            "why": "Confirmar una vez no sustituye vigilancia continua del dispositivo y la fisiología.",
            "source": "airway-das",
            "skill": "posintubacion"
          },
          {
            "id": "vaa-5d",
            "prompt": "¿Qué evidencia aporta este curso exclusivamente virtual?",
            "options": [
              "Aprobación de conocimientos evaluados",
              "Competencia manual certificada",
              "Acreditación oficial DAS"
            ],
            "answer": 0,
            "why": "El resultado académico no es habilitación ni certificación presencial de procedimientos.",
            "source": "airway-das",
            "skill": "seguridad"
          }
        ]
      }
    ]
  },
  {
    "id": "shock-critico",
    "title": "Shock y reanimación inicial",
    "subtitle": "Preparación en cuidados críticos basada en competencias FCCS",
    "audience": "Médicos, enfermería y profesionales de emergencias",
    "category": "emergentologia",
    "summary": "Reconocimiento del shock, perfusión, reevaluación y trabajo interdisciplinario en las primeras horas.",
    "scope": "Curso independiente inspirado en competencias públicas FCCS. No equivale a FCCS oficial.",
    "reviewStatus": "Pendiente de validación docente.",
    "lessons": [
      {
        "id": "shk-1",
        "title": "Reconocer hipoperfusión",
        "minutes": 12,
        "source": "fccs",
        "body": "Integra estado mental, piel, diuresis, lactato contextual y signos vitales. La hipotensión es frecuente pero no indispensable para sospechar shock.",
        "objective": "Aplicar la evaluación inicial, anticipar riesgos y justificar cada decisión en un caso simulado.",
        "questions": [
          {
            "id": "shk-1a",
            "prompt": "Paciente confuso, frío y oligúrico con presión arterial aún normal. ¿Qué conclusión es adecuada?",
            "options": [
              "Puede presentar hipoperfusión",
              "Se descarta shock por presión normal",
              "La diuresis no aporta información"
            ],
            "answer": 0,
            "why": "Los signos de perfusión aportan información adicional a la presión.",
            "source": "fccs",
            "skill": "reconocimiento"
          },
          {
            "id": "shk-1b",
            "prompt": "¿Cuál combinación sugiere hipoperfusión sistémica?",
            "options": [
              "Alteración del sensorio y relleno capilar prolongado",
              "Únicamente fiebre baja",
              "Saturación normal aislada"
            ],
            "answer": 0,
            "why": "La perfusión se valora clínicamente con múltiples signos.",
            "source": "fccs",
            "skill": "evaluacion"
          },
          {
            "id": "shk-1c",
            "prompt": "¿Cómo interpretar un lactato elevado?",
            "options": [
              "En contexto clínico y con tendencia de reevaluación",
              "Como diagnóstico etiológico único",
              "Como indicación aislada de un tratamiento fijo"
            ],
            "answer": 0,
            "why": "Es un biomarcador contextual, no sustituye evaluación clínica.",
            "source": "fccs",
            "skill": "evaluacion"
          },
          {
            "id": "shk-1d",
            "prompt": "¿Qué paso favorece seguridad?",
            "options": [
              "Reevaluaciones frecuentes tras cada intervención",
              "Mantener el plan aunque empeore",
              "Considerar suficiente una sola medición"
            ],
            "answer": 0,
            "why": "La reanimación es dinámica y depende de respuesta.",
            "source": "fccs",
            "skill": "seguimiento"
          }
        ]
      },
      {
        "id": "shk-2",
        "title": "Fenotipos de shock",
        "minutes": 12,
        "source": "fccs",
        "body": "Repasá causas distributivas, hipovolémicas, cardiogénicas y obstructivas. Usá historia, examen, ecografía enfocada si está disponible y datos hemodinámicos para orientar hipótesis sin retrasar estabilización.",
        "objective": "Aplicar la evaluación inicial, anticipar riesgos y justificar cada decisión en un caso simulado.",
        "questions": [
          {
            "id": "shk-2a",
            "prompt": "Dolor torácico, crepitantes y signos de hipoperfusión. ¿Qué causa priorizarías investigar?",
            "options": [
              "Disfunción de bomba cardiaca",
              "Sólo deshidratación",
              "Únicamente reacción vagal"
            ],
            "answer": 0,
            "why": "La congestión y el contexto orientan a shock cardiogénico entre diagnósticos diferenciales.",
            "source": "fccs",
            "skill": "fenotipos"
          },
          {
            "id": "shk-2b",
            "prompt": "Hipotensión súbita, ingurgitación yugular y signos de sobrecarga derecha. ¿Qué categoría considerar?",
            "options": [
              "Shock obstructivo",
              "Shock exclusivamente séptico",
              "Ausencia de shock"
            ],
            "answer": 0,
            "why": "Debe evaluarse rápidamente una causa obstructiva potencialmente reversible.",
            "source": "fccs",
            "skill": "fenotipos"
          },
          {
            "id": "shk-2c",
            "prompt": "¿Qué herramienta puede complementar la exploración en shock indiferenciado?",
            "options": [
              "Ecografía clínica enfocada por personal entrenado",
              "Electrocardiograma omitido siempre",
              "Radiografía como única evaluación"
            ],
            "answer": 0,
            "why": "La ecografía puede ayudar en el fenotipado, sin reemplazar reevaluación clínica.",
            "source": "fccs",
            "skill": "diagnostico"
          },
          {
            "id": "shk-2d",
            "prompt": "¿Qué no es correcto?",
            "options": [
              "Administrar siempre igual volumen sin considerar el fenotipo",
              "Buscar una causa",
              "Vigilar respuesta"
            ],
            "answer": 0,
            "why": "La reanimación debe adaptarse a la etiología y tolerancia.",
            "source": "fccs",
            "skill": "seguridad"
          }
        ]
      },
      {
        "id": "shk-3",
        "title": "Fluidos y respuesta",
        "minutes": 12,
        "source": "fccs",
        "body": "Comprendé indicaciones, límites y riesgo de congestión. Elegí medidas dinámicas cuando puedan aplicarse y reconsiderá la estrategia ante deterioro respiratorio.",
        "objective": "Aplicar la evaluación inicial, anticipar riesgos y justificar cada decisión en un caso simulado.",
        "questions": [
          {
            "id": "shk-3a",
            "prompt": "Tras expansión de volumen aparece congestión pulmonar. ¿Cuál es la respuesta prudente?",
            "options": [
              "Reevaluar tolerancia y necesidad de nuevos fluidos",
              "Continuar volumen sin valorar",
              "Descartar dificultad respiratoria"
            ],
            "answer": 0,
            "why": "Los líquidos pueden generar daño si no se ajustan a la respuesta.",
            "source": "fccs",
            "skill": "reanimacion"
          },
          {
            "id": "shk-3b",
            "prompt": "¿Cuál dato aislado predice pobremente respuesta a fluidos?",
            "options": [
              "Una presión venosa central aislada",
              "Una prueba dinámica correctamente realizada",
              "Cambios de volumen sistólico ante maniobra validada"
            ],
            "answer": 0,
            "why": "Las variables estáticas aisladas presentan limitaciones.",
            "source": "fccs",
            "skill": "monitorizacion"
          },
          {
            "id": "shk-3c",
            "prompt": "La elevación pasiva de piernas se usa para:",
            "options": [
              "Explorar respuesta hemodinámica reversible cuando es factible",
              "Diagnosticar sepsis por sí sola",
              "Sustituir todo monitoreo"
            ],
            "answer": 0,
            "why": "Es una prueba dinámica útil en el contexto apropiado.",
            "source": "fccs",
            "skill": "reanimacion"
          },
          {
            "id": "shk-3d",
            "prompt": "¿Qué debe registrarse tras intervenir?",
            "options": [
              "Perfusión, presión, respiración y balance relevante",
              "Solo el volumen infundido",
              "Ningún cambio hasta el alta"
            ],
            "answer": 0,
            "why": "El seguimiento requiere resultados y efectos adversos.",
            "source": "fccs",
            "skill": "seguimiento"
          }
        ]
      },
      {
        "id": "shk-4",
        "title": "Vasopresores y monitorización",
        "minutes": 12,
        "source": "fccs",
        "body": "Repasá indicaciones y objetivos individualizados de sostén hemodinámico, acceso seguro, vigilancia de extravasación y necesidad de reevaluación continua, sin convertir la teoría en prescripción para un caso real.",
        "objective": "Aplicar la evaluación inicial, anticipar riesgos y justificar cada decisión en un caso simulado.",
        "questions": [
          {
            "id": "shk-4a",
            "prompt": "¿Qué concepto rige la elección de soporte vasoactivo?",
            "options": [
              "Etiología del shock y objetivo clínico individualizado",
              "Una droga universal para cualquier cuadro",
              "Sólo la edad"
            ],
            "answer": 0,
            "why": "La selección exige diferenciar mecanismos y efectos adversos.",
            "source": "fccs",
            "skill": "vasopresores"
          },
          {
            "id": "shk-4b",
            "prompt": "¿Qué aspecto de seguridad hay que vigilar si se utiliza infusión vasoactiva?",
            "options": [
              "Acceso vascular, perfusión y extravasación",
              "Solo el color de la bolsa",
              "Evitar controles hemodinámicos"
            ],
            "answer": 0,
            "why": "La administración de vasoactivos requiere supervisión y vigilancia.",
            "source": "fccs",
            "skill": "seguridad"
          },
          {
            "id": "shk-4c",
            "prompt": "Un número de presión mejora pero persiste oliguria y confusión. ¿Qué hacés?",
            "options": [
              "Revalorar perfusión y diagnóstico",
              "Declarar resuelto el shock",
              "Suspender vigilancia"
            ],
            "answer": 0,
            "why": "El objetivo es perfusión tisular, no una cifra aislada.",
            "source": "fccs",
            "skill": "seguimiento"
          },
          {
            "id": "shk-4d",
            "prompt": "¿Qué representa una decisión segura en reanimación?",
            "options": [
              "Solicitar ayuda especializada si el cuadro supera capacidades locales",
              "Mantener manejo aislado",
              "Demorar traslado pese a deterioro"
            ],
            "answer": 0,
            "why": "La escalada oportuna es una competencia central en cuidados críticos.",
            "source": "fccs",
            "skill": "equipo"
          }
        ]
      }
    ]
  },
  {
    "id": "trauma-prehospitalario",
    "title": "Trauma prehospitalario: evaluación y prioridades",
    "subtitle": "Preparación teórica para contenidos PHTLS",
    "audience": "Paramédicos y equipos de emergencias",
    "category": "emergentologia",
    "summary": "Escena, hemorragia, oxigenación, shock, derivación y poblaciones especiales.",
    "scope": "Trayecto de preparación privada. No es PHTLS oficial ni confiere tarjeta de proveedor NAEMT.",
    "reviewStatus": "Pendiente de revisión docente.",
    "lessons": [
      {
        "id": "trp-1",
        "title": "Seguridad de escena y evaluación primaria",
        "minutes": 12,
        "source": "phtls",
        "body": "Antes de intervenir, controlá peligros, recursos disponibles, mecanismo lesional y evaluación primaria estructurada. No exponer al equipo a riesgos evitables.",
        "objective": "Aplicar la evaluación inicial, anticipar riesgos y justificar cada decisión en un caso simulado.",
        "questions": [
          {
            "id": "trp-1a",
            "prompt": "¿Qué antecede al contacto con un accidentado en escena insegura?",
            "options": [
              "Evaluar seguridad y gestionar recursos",
              "Ingresar sin protección",
              "Demorar aviso a emergencias"
            ],
            "answer": 0,
            "why": "La seguridad de escena evita nuevas víctimas y posibilita respuesta eficaz.",
            "source": "phtls",
            "skill": "escena"
          },
          {
            "id": "trp-1b",
            "prompt": "¿Qué define la prioridad inicial en trauma grave?",
            "options": [
              "Amenazas vitales detectadas en evaluación primaria",
              "Orden alfabético de lesiones",
              "Únicamente dolor referido"
            ],
            "answer": 0,
            "why": "Se priorizan amenazas de muerte corregibles.",
            "source": "phtls",
            "skill": "evaluacion"
          },
          {
            "id": "trp-1c",
            "prompt": "¿Por qué comunicar el mecanismo lesional?",
            "options": [
              "Puede orientar sospecha de lesiones no visibles",
              "Sustituye examen físico",
              "Confirma gravedad por sí solo"
            ],
            "answer": 0,
            "why": "El mecanismo complementa, no reemplaza, evaluación clínica.",
            "source": "phtls",
            "skill": "comunicacion"
          },
          {
            "id": "trp-1d",
            "prompt": "¿Qué actitud debe mantenerse en escena?",
            "options": [
              "Reevaluación y coordinación de traslado",
              "Retrasar traslado para historia extensa",
              "Prescindir de información al receptor"
            ],
            "answer": 0,
            "why": "La transferencia segura depende de evaluación, coordinación y comunicación.",
            "source": "phtls",
            "skill": "traslado"
          }
        ]
      },
      {
        "id": "trp-2",
        "title": "Hemorragia y shock traumático",
        "minutes": 12,
        "source": "phtls",
        "body": "Identificá hemorragia externa amenazante, control temprano, sospecha de sangrado oculto y necesidad de derivación a control definitivo de hemorragias.",
        "objective": "Aplicar la evaluación inicial, anticipar riesgos y justificar cada decisión en un caso simulado.",
        "questions": [
          {
            "id": "trp-2a",
            "prompt": "Traumatizado con hemorragia externa intensa. ¿Qué prioridad corresponde?",
            "options": [
              "Control inmediato de hemorragia según protocolo y entrenamiento",
              "Esperar estudios de imágenes",
              "Priorizar historia detallada"
            ],
            "answer": 0,
            "why": "La hemorragia masiva es una causa prevenible de muerte.",
            "source": "phtls",
            "skill": "hemorragia"
          },
          {
            "id": "trp-2b",
            "prompt": "¿Qué debe sospecharse ante shock sin sangrado externo visible?",
            "options": [
              "Hemorragia interna",
              "Ausencia de sangrado por piel intacta",
              "Solo ansiedad"
            ],
            "answer": 0,
            "why": "El sangrado puede ser oculto y requerir control definitivo.",
            "source": "phtls",
            "skill": "shock"
          },
          {
            "id": "trp-2c",
            "prompt": "¿Qué objetivo organiza la atención prehospitalaria?",
            "options": [
              "Identificar amenazas, tratar lo disponible y trasladar oportunamente",
              "Completar todo estudio antes de traslado",
              "Esperar normalización de todos los signos"
            ],
            "answer": 0,
            "why": "La atención prehospitalaria no debe demorar la resolución definitiva.",
            "source": "phtls",
            "skill": "traslado"
          },
          {
            "id": "trp-2d",
            "prompt": "En trauma con shock, ¿qué seguimiento es útil?",
            "options": [
              "Estado mental, perfusión, signos vitales y tendencia",
              "Solo temperatura",
              "Solo escala de dolor"
            ],
            "answer": 0,
            "why": "La evolución clínica orienta respuesta y urgencia.",
            "source": "phtls",
            "skill": "monitorizacion"
          }
        ]
      },
      {
        "id": "trp-3",
        "title": "Vía aérea y ventilación en trauma",
        "minutes": 12,
        "source": "phtls",
        "body": "Reconocé obstrucción, ventilación ineficaz, lesión torácica amenazante y necesidad de soporte respiratorio por personal capacitado.",
        "objective": "Aplicar la evaluación inicial, anticipar riesgos y justificar cada decisión en un caso simulado.",
        "questions": [
          {
            "id": "trp-3a",
            "prompt": "Paciente traumatizado con ronquido respiratorio y conciencia disminuida. ¿Qué priorizás?",
            "options": [
              "Evaluación y permeabilidad de la vía aérea con protección apropiada",
              "Interrogar antecedentes familiares",
              "Administrar alimentación"
            ],
            "answer": 0,
            "why": "La obstrucción de vía aérea es amenaza vital prioritaria.",
            "source": "phtls",
            "skill": "via-aerea"
          },
          {
            "id": "trp-3b",
            "prompt": "¿Qué hallazgo señala amenaza ventilatoria?",
            "options": [
              "Dificultad respiratoria progresiva tras trauma torácico",
              "Fractura aislada de dedo",
              "Pequeña abrasión superficial"
            ],
            "answer": 0,
            "why": "La dificultad respiratoria progresiva demanda reevaluación inmediata.",
            "source": "phtls",
            "skill": "ventilacion"
          },
          {
            "id": "trp-3c",
            "prompt": "En trauma cervical sospechado, ¿qué principio rige?",
            "options": [
              "Equilibrar protección cervical con oxigenación y prioridades vitales",
              "Evitar oxigenación",
              "Descartar lesión con mecanismo únicamente"
            ],
            "answer": 0,
            "why": "La protección espinal no debe eclipsar prioridades vitales.",
            "source": "phtls",
            "skill": "seguridad"
          },
          {
            "id": "trp-3d",
            "prompt": "¿Qué dato comunicar al entregar al paciente?",
            "options": [
              "Oxigenación, evolución respiratoria y medidas efectuadas",
              "Solo hora de llegada",
              "Solo nombre del conductor"
            ],
            "answer": 0,
            "why": "La continuidad de cuidados exige un pase estructurado.",
            "source": "phtls",
            "skill": "comunicacion"
          }
        ]
      },
      {
        "id": "trp-4",
        "title": "Poblaciones especiales y traslado",
        "minutes": 12,
        "source": "phtls",
        "body": "Repasá particularidades de pediatría, embarazo y personas mayores; priorizá reevaluación, escalada y transferencia de información.",
        "objective": "Aplicar la evaluación inicial, anticipar riesgos y justificar cada decisión en un caso simulado.",
        "questions": [
          {
            "id": "trp-4a",
            "prompt": "En un niño traumatizado, ¿qué criterio es correcto?",
            "options": [
              "La compensación puede ocultar deterioro circulatorio",
              "Una presión normal descarta shock",
              "No requiere reevaluación"
            ],
            "answer": 0,
            "why": "Los niños pueden compensar hasta fases avanzadas de hipoperfusión.",
            "source": "phtls",
            "skill": "pediatria"
          },
          {
            "id": "trp-4b",
            "prompt": "En una embarazada lesionada, ¿qué prioridad inicial guía las decisiones?",
            "options": [
              "Estabilización materna y evaluación obstétrica apropiada",
              "Ignorar condición materna",
              "Retrasar valoración de vía aérea"
            ],
            "answer": 0,
            "why": "La atención materna es clave para el pronóstico maternofetal.",
            "source": "phtls",
            "skill": "embarazo"
          },
          {
            "id": "trp-4c",
            "prompt": "¿Qué mejora el traspaso prehospitalario-hospitalario?",
            "options": [
              "Comunicación estructurada con mecanismo, hallazgos y tendencias",
              "Informe sin signos vitales",
              "Evitar describir intervenciones"
            ],
            "answer": 0,
            "why": "El receptor precisa datos clave para continuar la atención.",
            "source": "phtls",
            "skill": "comunicacion"
          },
          {
            "id": "trp-4d",
            "prompt": "¿Qué acredita aprobar este trayecto en ClinicIA?",
            "options": [
              "Aprendizaje teórico evaluado sobre preparación en trauma",
              "Tarjeta oficial de proveedor PHTLS",
              "Habilitación de técnicas invasivas"
            ],
            "answer": 0,
            "why": "La constancia privada de formación no sustituye capacitación oficial.",
            "source": "phtls",
            "skill": "seguridad"
          }
        ]
      }
    ]
  }
];
