// Contenido original de Clinic IA. Revisión docente local antes de uso institucional.
export const evacuationSources = {
  "evac-plan": {
    "title": "OSHA · Planificación de evacuaciones (referencia operativa, no normativa argentina)",
    "url": "https://www.osha.gov/etools/evacuation-plans-procedures/eap/elements/"
  },
  "evac-transfer": {
    "title": "OMS · Herramientas de atención prehospitalaria y transferencia",
    "url": "https://www.who.int/teams/integrated-health-services/clinical-services-and-systems/emergency-and-critical-care/prehospital-toolkit"
  },
  "evac-bec": {
    "title": "OMS/CICR · Basic Emergency Care, transferencia y entrega",
    "url": "https://www.who.int/publications/i/item/basic-emergency-care-approach-to-the-acutely-ill-and-injured"
  },
  "evac-aid": {
    "title": "AHA / Cruz Roja 2024 · Primeros auxilios",
    "url": "https://cpr.heart.org/en/resuscitation-science/2024-first-aid-guidelines"
  },
  "evac-coord": {
    "title": "OMS 2025 · Medical evacuation in emergencies",
    "url": "https://www.who.int/publications/b/71393"
  }
};
export const evacuationCourses = [
  {
    "id": "evacuacion-escena",
    "title": "Evacuación segura de la escena",
    "refresher": true,
    "mini": true,
    "examMinutes": 25,
    "audience": "Policías y personal sanitario no médico",
    "summary": "Cuatro módulos breves y evaluación de 20 preguntas. Aprobación: 16/20, intentos ilimitados.",
    "scope": "Evaluación teórica introductoria. No acredita destrezas de rescate, transporte ni triage. Aplicar el protocolo local y el alcance de cada rol.",
    "reviewStatus": "Pendiente de validación docente local",
    "lessons": [
      {
        "id": "evacuacion-escena-1",
        "title": "Reconocer peligros y pedir recursos",
        "objective": "Reconocer decisiones seguras, comunicar y actuar dentro del rol.",
        "body": "Antes de acercarte, observá tránsito, humo, electricidad y violencia. Pedí ayuda con ubicación y acceso precisos. Tu función inicial es proteger, comunicar y facilitar la respuesta dentro de tu entrenamiento. No ingreses en zonas peligrosas ni hagas extricación técnica.\n\nUna persona lesionada no debe moverse por comodidad. Si hay peligro inmediato, pedí ayuda y seguí las indicaciones del sistema de emergencias, priorizando también tu propia seguridad.",
        "source": "evac-aid",
        "questions": [
          {
            "id": "evacuacion-escena-1-q1",
            "prompt": "Un choque ocurrió junto a un cable caído. ¿Qué hacés primero?",
            "options": [
              "Mantenés distancia, impedís el acercamiento y pedís asistencia especializada",
              "Apartás el cable con una rama",
              "Entrás porque usás calzado de goma"
            ],
            "answer": 0,
            "why": "La escena requiere control del riesgo eléctrico antes del contacto."
          },
          {
            "id": "evacuacion-escena-1-q2",
            "prompt": "Hay humo denso dentro de una vivienda. ¿Cuál es tu límite como respondiente sin equipo de rescate?",
            "options": [
              "Entrar con un pañuelo húmedo",
              "Entrar si el recorrido parece corto",
              "No ingresar y comunicar ubicación de posibles atrapados a bomberos"
            ],
            "answer": 2,
            "why": "El rescate en humo exige recursos y entrenamiento específicos."
          },
          {
            "id": "evacuacion-escena-1-q3",
            "prompt": "Un lesionado está en un sitio seguro y pide caminar al móvil. ¿Qué corresponde?",
            "options": [
              "Sentarlo de inmediato en el asiento trasero",
              "Explicar que conviene evitar movimientos y solicitar evaluación sanitaria",
              "Hacerlo caminar para probar las piernas"
            ],
            "answer": 1,
            "why": "No se indica movilización solo para facilitar el traslado."
          },
          {
            "id": "evacuacion-escena-1-q4",
            "prompt": "Para pedir recursos por radio, ¿qué dato enviás primero?",
            "options": [
              "Ubicación, acceso seguro y riesgos observados",
              "El nombre de cada testigo",
              "Una descripción completa de los daños materiales"
            ],
            "answer": 0,
            "why": "Los recursos necesitan encontrar la escena sin exponerse."
          },
          {
            "id": "evacuacion-escena-1-q5",
            "prompt": "Aparece fuego cerca del herido. ¿Qué cambia?",
            "options": [
              "Esperar siempre sin informar cambios",
              "Trasladarlo a cualquier costo",
              "Avisar el peligro inmediato y coordinar ayuda sin exponerse a un rescate imposible"
            ],
            "answer": 2,
            "why": "La urgencia de moverlo se valora frente al riesgo inmediato y la seguridad del equipo."
          }
        ]
      },
      {
        "id": "evacuacion-escena-2",
        "title": "Rutas, punto seguro y accesibilidad",
        "objective": "Reconocer decisiones seguras, comunicar y actuar dentro del rol.",
        "body": "Identificá una salida principal, una alternativa y un punto de reunión que no obstruya ambulancias. Una ruta breve puede ser insegura. Confirmá cambios de ruta al responsable y no permitas el reingreso hasta autorización.\n\nPreguntá a cada persona qué ayuda necesita. Usá instrucciones simples; considerá barreras de movilidad, audición, visión o idioma. No improvises el descenso de una silla de ruedas por escaleras.",
        "source": "evac-plan",
        "questions": [
          {
            "id": "evacuacion-escena-2-q1",
            "prompt": "La salida habitual está bloqueada. ¿Qué indicás?",
            "options": [
              "Que busquen cada uno una salida distinta",
              "La alternativa prevista, después de verificar su seguridad",
              "Que todos esperen junto al bloqueo"
            ],
            "answer": 1,
            "why": "Una ruta común y segura evita dispersión y exposición."
          },
          {
            "id": "evacuacion-escena-2-q2",
            "prompt": "¿Dónde ubicás el punto de reunión?",
            "options": [
              "En un sitio seguro que deje libres los accesos de emergencia",
              "En el portón de entrada de ambulancias",
              "Junto al edificio para regresar rápido"
            ],
            "answer": 0,
            "why": "El punto de reunión debe facilitar el recuento sin bloquear la respuesta."
          },
          {
            "id": "evacuacion-escena-2-q3",
            "prompt": "Una persona con discapacidad motora necesita salir. ¿Cuál es el primer paso?",
            "options": [
              "Levantarla sin avisar",
              "Separarla de su ayuda de movilidad por comodidad",
              "Preguntar cómo ayudar y activar el apoyo previsto"
            ],
            "answer": 2,
            "why": "La asistencia debe considerar sus necesidades y recursos seguros."
          },
          {
            "id": "evacuacion-escena-2-q4",
            "prompt": "Una persona no oye las indicaciones. ¿Cómo ayudás?",
            "options": [
              "Suponés que seguirá al resto",
              "Captás su atención y comunicás con gestos o texto claro",
              "Repetís el mismo grito desde lejos"
            ],
            "answer": 1,
            "why": "La comunicación debe adaptarse para que la instrucción sea comprendida."
          },
          {
            "id": "evacuacion-escena-2-q5",
            "prompt": "Un evacuado quiere volver por su bolso. ¿Qué hacés?",
            "options": [
              "Le indicás permanecer en el punto seguro y avisás al responsable",
              "Lo acompañás sin consultar",
              "Le permitís entrar si promete tardar poco"
            ],
            "answer": 0,
            "why": "El reingreso debe quedar bajo control del responsable de seguridad."
          }
        ]
      },
      {
        "id": "evacuacion-escena-3",
        "title": "Organizar al equipo sin improvisar rescates",
        "objective": "Reconocer decisiones seguras, comunicar y actuar dentro del rol.",
        "body": "Asigná funciones antes de actuar: orientar, comunicar y llevar el recuento. Usá una orden breve y pedí confirmación de lo entendido. Mantené un canal para informar cambios.\n\nLas maniobras de transporte, uso de camillas y rescate requieren entrenamiento presencial y equipos adecuados. En este curso se ensaya la coordinación con objetos livianos, sin cargar compañeros ni practicar arrastres.",
        "source": "evac-plan",
        "questions": [
          {
            "id": "evacuacion-escena-3-q1",
            "prompt": "Dos agentes dan órdenes contrarias. ¿Qué mejora la situación?",
            "options": [
              "Subir ambos la voz",
              "Dejar que cada grupo decida al azar",
              "Acordar un responsable y transmitir una instrucción común"
            ],
            "answer": 2,
            "why": "Un responsable y mensajes consistentes reducen errores."
          },
          {
            "id": "evacuacion-escena-3-q2",
            "prompt": "Un compañero no entendió qué salida usar. ¿Cómo verificás la orden?",
            "options": [
              "Repetís solo la palabra rápido",
              "Le pedís que repita la ruta y aclarás la duda",
              "Interpretás su silencio como aceptación"
            ],
            "answer": 1,
            "why": "La confirmación permite detectar una instrucción mal comprendida."
          },
          {
            "id": "evacuacion-escena-3-q3",
            "prompt": "Para ensayar evacuación en clase, ¿qué opción es adecuada?",
            "options": [
              "Recorrer una ruta segura y simular roles sin cargar personas",
              "Arrastrar a un compañero por el piso",
              "Bajar a un compañero en silla por una escalera"
            ],
            "answer": 0,
            "why": "El objetivo inicial es coordinar decisiones, no ejecutar rescates sin entrenamiento."
          },
          {
            "id": "evacuacion-escena-3-q4",
            "prompt": "Se necesita liberar a alguien atrapado en un vehículo. ¿Qué solicitás?",
            "options": [
              "Que los testigos tiren de los brazos",
              "Herramientas improvisadas sin asegurar la escena",
              "Rescate especializado, informando los peligros y acceso"
            ],
            "answer": 2,
            "why": "La extricación técnica excede el alcance de este minicurso."
          },
          {
            "id": "evacuacion-escena-3-q5",
            "prompt": "La ruta se vuelve insegura mientras guiás al grupo. ¿Qué hacés?",
            "options": [
              "Cambiás de ruta sin avisar a nadie",
              "Detenés el avance seguro, informás y coordinás una alternativa",
              "Seguís para no perder tiempo"
            ],
            "answer": 1,
            "why": "Un cambio de riesgo obliga a actualizar el plan y comunicarlo."
          }
        ]
      },
      {
        "id": "evacuacion-escena-4",
        "title": "Recuento y cierre de la evacuación",
        "objective": "Reconocer decisiones seguras, comunicar y actuar dentro del rol.",
        "body": "En el punto seguro, compará el recuento con la información disponible. Informá quién falta y dónde fue visto por última vez, sin mandar voluntarios a una zona peligrosa. Registrá los traslados para no contar como desaparecida a una persona ya derivada.\n\nCerrá el ejercicio con una revisión de dificultades: órdenes, accesibilidad, rutas y tiempos. Las observaciones sirven para corregir el plan local antes de una emergencia.",
        "source": "evac-plan",
        "questions": [
          {
            "id": "evacuacion-escena-4-q1",
            "prompt": "Falta una persona en el recuento. ¿Qué comunicás?",
            "options": [
              "Su identificación disponible y último lugar conocido al responsable",
              "Que está dentro, aunque no lo sabés",
              "Que todos regresen a buscarla"
            ],
            "answer": 0,
            "why": "Hay que distinguir hechos confirmados de suposiciones y activar búsqueda especializada."
          },
          {
            "id": "evacuacion-escena-4-q2",
            "prompt": "Una persona fue llevada en ambulancia. ¿Cómo evitás un falso faltante?",
            "options": [
              "La borrás sin dejar constancia",
              "La contás como presente en el punto de reunión",
              "Registrás su salida y destino confirmado"
            ],
            "answer": 2,
            "why": "La trazabilidad explica por qué dejó el lugar."
          },
          {
            "id": "evacuacion-escena-4-q3",
            "prompt": "El número de presentes no coincide con la lista. ¿Qué corresponde?",
            "options": [
              "Dar por finalizado el operativo",
              "Revisar duplicados, traslados y personas no registradas",
              "Modificar la lista para que coincida"
            ],
            "answer": 1,
            "why": "Las discrepancias se investigan, no se ocultan."
          },
          {
            "id": "evacuacion-escena-4-q4",
            "prompt": "¿Quién autoriza el reingreso al área evacuada?",
            "options": [
              "La autoridad responsable de declarar la seguridad según el plan",
              "La primera persona que quiera regresar",
              "Cualquier evacuado que no vea humo"
            ],
            "answer": 0,
            "why": "La ausencia de señales visibles no acredita seguridad."
          },
          {
            "id": "evacuacion-escena-4-q5",
            "prompt": "Después del simulacro, ¿qué registro es útil?",
            "options": [
              "Solo una foto grupal",
              "Solo el tiempo del participante más rápido",
              "Problemas observados y acciones concretas de mejora"
            ],
            "answer": 2,
            "why": "El análisis debe traducirse en mejoras del procedimiento."
          }
        ]
      }
    ]
  },
  {
    "id": "evacuacion-traslado",
    "title": "Preparación y acompañamiento del traslado",
    "refresher": true,
    "mini": true,
    "examMinutes": 25,
    "audience": "Policías y personal sanitario no médico",
    "summary": "Cuatro módulos breves y evaluación de 20 preguntas. Aprobación: 16/20, intentos ilimitados.",
    "scope": "Evaluación teórica introductoria. No acredita destrezas de rescate, transporte ni triage. Aplicar el protocolo local y el alcance de cada rol.",
    "reviewStatus": "Pendiente de validación docente local",
    "lessons": [
      {
        "id": "evacuacion-traslado-1",
        "title": "Roles y decisiones antes de salir",
        "objective": "Reconocer decisiones seguras, comunicar y actuar dentro del rol.",
        "body": "Policías y personal sanitario no médico colaboran según su formación, habilitación y protocolo local. La decisión clínica de destino y el soporte necesario se coordinan con el equipo sanitario y la central. No se administran fármacos ni se indican procedimientos fuera del rol.\n\nConfirmá el recurso solicitado, quién acompaña y a quién informar cambios. Un traslado no termina al subir a la persona al vehículo.",
        "source": "evac-transfer",
        "questions": [
          {
            "id": "evacuacion-traslado-1-q1",
            "prompt": "¿Quién define el soporte sanitario que requiere un traslado?",
            "options": [
              "El equipo sanitario responsable según evaluación y protocolo",
              "El conductor por el espacio disponible",
              "La persona que llegó primero, sin evaluar"
            ],
            "answer": 0,
            "why": "Los requerimientos clínicos se coordinan con el personal competente."
          },
          {
            "id": "evacuacion-traslado-1-q2",
            "prompt": "Como policía, te piden aplicar un medicamento que no conocés. ¿Qué hacés?",
            "options": [
              "Lo administrás porque hubo una orden informal",
              "Elegís una dosis menor",
              "Explicás tu límite y pedís intervención sanitaria"
            ],
            "answer": 2,
            "why": "Una indicación informal no sustituye formación ni habilitación."
          },
          {
            "id": "evacuacion-traslado-1-q3",
            "prompt": "¿Qué se debe confirmar sobre el destino?",
            "options": [
              "Solo que la familia lo conozca",
              "Que corresponda a la necesidad y esté coordinado con el sistema receptor",
              "Solo que sea el edificio más cercano"
            ],
            "answer": 1,
            "why": "El destino debe coordinarse con la red sanitaria."
          },
          {
            "id": "evacuacion-traslado-1-q4",
            "prompt": "Falta un acompañante sanitario requerido para el traslado. ¿Qué hacés?",
            "options": [
              "Lo comunicás y coordinás una solución con el responsable",
              "Partís igual sin avisar",
              "Delegás la vigilancia en un testigo sin preparación"
            ],
            "answer": 0,
            "why": "La falta de un recurso necesario debe resolverse con la coordinación."
          },
          {
            "id": "evacuacion-traslado-1-q5",
            "prompt": "La persona pregunta adónde la llevan. ¿Qué respondés?",
            "options": [
              "Que no necesita saberlo",
              "Un destino supuesto para tranquilizarla",
              "El destino y plan confirmados en lenguaje comprensible"
            ],
            "answer": 2,
            "why": "La información debe ser clara y basada en el plan real."
          }
        ]
      },
      {
        "id": "evacuacion-traslado-2",
        "title": "Chequeo del vehículo y preparación",
        "objective": "Reconocer decisiones seguras, comunicar y actuar dentro del rol.",
        "body": "Antes de partir, el equipo confirma vehículo, comunicación, ruta, combustible y material requerido. Camilla, cinturones y elementos sueltos se revisan según el fabricante y el protocolo. Los dispositivos médicos solo los verifica y maneja personal capacitado.\n\nPreservá abrigo, privacidad e identificación. Los documentos acompañan al paciente de manera protegida; no se fotografían ni se difunden por canales públicos.",
        "source": "evac-bec",
        "questions": [
          {
            "id": "evacuacion-traslado-2-q1",
            "prompt": "La radio no funciona antes de salir. ¿Qué corresponde?",
            "options": [
              "Salir sin avisar a la central",
              "Informarlo y establecer una alternativa de comunicación comprobada",
              "Suponer que habrá señal en el camino"
            ],
            "answer": 1,
            "why": "La comunicación debe contar con un medio operativo."
          },
          {
            "id": "evacuacion-traslado-2-q2",
            "prompt": "Hay un bolso pesado suelto junto a la camilla. ¿Qué hacés?",
            "options": [
              "Asegurarlo según el procedimiento antes de iniciar la marcha",
              "Dejarlo porque el trayecto es corto",
              "Pedir al paciente que lo sostenga"
            ],
            "answer": 0,
            "why": "Los objetos sueltos pueden lesionar durante el traslado."
          },
          {
            "id": "evacuacion-traslado-2-q3",
            "prompt": "¿Cómo se verifica la sujeción de una camilla?",
            "options": [
              "Atándola con cualquier cuerda",
              "Por el peso de la persona sobre ella",
              "Con personal entrenado y el sistema previsto por el fabricante"
            ],
            "answer": 2,
            "why": "El uso correcto depende del equipo y de su procedimiento específico."
          },
          {
            "id": "evacuacion-traslado-2-q4",
            "prompt": "¿Qué hacés con los documentos clínicos de traslado?",
            "options": [
              "Dejarlos en el vehículo sin avisar",
              "Entregarlos de forma protegida al equipo receptor",
              "Publicarlos en el grupo vecinal"
            ],
            "answer": 1,
            "why": "La documentación debe acompañar la atención sin divulgar datos."
          },
          {
            "id": "evacuacion-traslado-2-q5",
            "prompt": "¿Qué revisión logística es pertinente antes de salir?",
            "options": [
              "Ruta, combustible y acceso al destino coordinado",
              "Solo la limpieza exterior del vehículo",
              "Solo el volumen de la sirena"
            ],
            "answer": 0,
            "why": "Los problemas logísticos pueden interrumpir el traslado."
          }
        ]
      },
      {
        "id": "evacuacion-traslado-3",
        "title": "Vigilancia y comunicación durante el recorrido",
        "objective": "Reconocer decisiones seguras, comunicar y actuar dentro del rol.",
        "body": "Durante el traslado, el personal capacitado mantiene la vigilancia acordada. Cualquier cambio en conciencia, respiración o sangrado requiere aviso inmediato y actuación según entrenamiento y protocolo; no se espera a la entrega.\n\nQuien conduce debe concentrarse en conducir. Si se necesita intervenir, se coordina una detención segura según la situación. Se registran cambios, medidas y horarios sin inventar datos.",
        "source": "evac-bec",
        "questions": [
          {
            "id": "evacuacion-traslado-3-q1",
            "prompt": "La persona deja de responder durante el traslado. ¿Qué hacés?",
            "options": [
              "Esperás a llegar para informar",
              "Anotás el dato sin comunicarlo",
              "Avisás de inmediato al equipo y activás la respuesta según protocolo"
            ],
            "answer": 2,
            "why": "El deterioro requiere respuesta inmediata del equipo competente."
          },
          {
            "id": "evacuacion-traslado-3-q2",
            "prompt": "Quien conduce intenta evaluar al paciente mientras maneja. ¿Qué corresponde?",
            "options": [
              "Aceptar que conduzca sin mirar la ruta",
              "Mantener la conducción segura y coordinar apoyo o detención segura",
              "Pedirle que mire más tiempo hacia atrás"
            ],
            "answer": 1,
            "why": "La atención no debe crear otro accidente."
          },
          {
            "id": "evacuacion-traslado-3-q3",
            "prompt": "Observás sangrado nuevo en el trayecto. ¿Qué comunicás?",
            "options": [
              "El hallazgo y el momento, solicitando respuesta del equipo sanitario",
              "Solo que todo sigue igual",
              "Una estimación inventada de litros perdidos"
            ],
            "answer": 0,
            "why": "Hay que informar cambios observados con precisión."
          },
          {
            "id": "evacuacion-traslado-3-q4",
            "prompt": "No pudiste medir una variable solicitada. ¿Cómo la registrás?",
            "options": [
              "Con un valor habitual",
              "Copiando el dato de otro paciente",
              "Como no medida, explicando la limitación"
            ],
            "answer": 2,
            "why": "Los registros deben diferenciar lo observado de lo desconocido."
          },
          {
            "id": "evacuacion-traslado-3-q5",
            "prompt": "La central modifica el destino por coordinación sanitaria. ¿Qué hacés?",
            "options": [
              "Elegís un tercer destino por intuición",
              "Confirmás la nueva indicación y actualizás al equipo",
              "Seguís al anterior sin avisar"
            ],
            "answer": 1,
            "why": "La modificación debe comprenderse y comunicarse dentro del equipo."
          }
        ]
      },
      {
        "id": "evacuacion-traslado-4",
        "title": "Entrega y continuidad de la atención",
        "objective": "Reconocer decisiones seguras, comunicar y actuar dentro del rol.",
        "body": "La entrega se hace a una persona receptora identificada. Usá un mensaje ordenado: quién es, qué ocurrió, hallazgos y evolución, medidas realizadas y horarios, necesidades pendientes. No afirmes diagnósticos que no fueron confirmados.\n\nPedí confirmación de la información crítica y registrá hora, destino y receptor según el sistema local. La transferencia incluye el cuidado y la información, no solamente el movimiento físico.",
        "source": "evac-transfer",
        "questions": [
          {
            "id": "evacuacion-traslado-4-q1",
            "prompt": "¿Cuál es una entrega útil?",
            "options": [
              "Hecho, evolución, acciones y horarios, con pendientes claros",
              "Solo decir que viene del accidente",
              "Una conversación centrada en rumores"
            ],
            "answer": 0,
            "why": "La estructura permite continuar el cuidado."
          },
          {
            "id": "evacuacion-traslado-4-q2",
            "prompt": "No conocés el nombre del paciente. ¿Qué decís?",
            "options": [
              "Inventás un nombre temporal sin aclararlo",
              "Usás el nombre del acompañante",
              "Que la identidad no está confirmada y usás el identificador asignado"
            ],
            "answer": 2,
            "why": "La identificación debe evitar confusiones entre personas."
          },
          {
            "id": "evacuacion-traslado-4-q3",
            "prompt": "¿Cuándo completás la transferencia de responsabilidad?",
            "options": [
              "Al bajar la camilla sin avisar",
              "Al entregar al equipo receptor y confirmar recepción según protocolo",
              "Al estacionar en la puerta"
            ],
            "answer": 1,
            "why": "Debe existir continuidad entre quien traslada y quien recibe."
          },
          {
            "id": "evacuacion-traslado-4-q4",
            "prompt": "El receptor no oyó un cambio importante. ¿Qué hacés?",
            "options": [
              "Repetirlo y confirmar que fue comprendido",
              "Dar por hecho que lo leerá luego",
              "Omitirlo para acortar la entrega"
            ],
            "answer": 0,
            "why": "La información crítica necesita una comunicación efectiva."
          },
          {
            "id": "evacuacion-traslado-4-q5",
            "prompt": "¿Qué registrás al terminar?",
            "options": [
              "Solo los kilómetros recorridos",
              "Un diagnóstico no confirmado",
              "Hora, destino y receptor según procedimiento"
            ],
            "answer": 2,
            "why": "El registro permite reconstruir la continuidad del traslado."
          }
        ]
      }
    ]
  },
  {
    "id": "evacuacion-coordinacion",
    "title": "Coordinación de evacuaciones con múltiples afectados",
    "refresher": true,
    "mini": true,
    "examMinutes": 25,
    "audience": "Policías y personal sanitario no médico",
    "summary": "Cuatro módulos breves y evaluación de 20 preguntas. Aprobación: 16/20, intentos ilimitados.",
    "scope": "Evaluación teórica introductoria. No acredita destrezas de rescate, transporte ni triage. Aplicar el protocolo local y el alcance de cada rol.",
    "reviewStatus": "Pendiente de validación docente local",
    "lessons": [
      {
        "id": "evacuacion-coordinacion-1",
        "title": "Activación y organización del incidente",
        "objective": "Reconocer decisiones seguras, comunicar y actuar dentro del rol.",
        "body": "Cuando las necesidades superan los recursos iniciales, avisá temprano y activá la coordinación local. Separá las funciones de seguridad, asistencia sanitaria, comunicación y transporte. La clasificación clínica corresponde a personal entrenado con el protocolo adoptado, no a una regla improvisada.\n\nLos policías pueden controlar accesos y rutas; el personal sanitario actúa dentro de su habilitación. Este módulo no acredita competencia en triage ni rescate técnico.",
        "source": "evac-coord",
        "questions": [
          {
            "id": "evacuacion-coordinacion-1-q1",
            "prompt": "Llegás y hay más afectados que recursos disponibles. ¿Qué hacés?",
            "options": [
              "Informás la magnitud estimada y solicitás coordinación y refuerzos",
              "Esperás a terminar de evaluar a todos para avisar",
              "Trasladás al primero sin comunicar el incidente"
            ],
            "answer": 0,
            "why": "La alerta temprana permite dimensionar la respuesta."
          },
          {
            "id": "evacuacion-coordinacion-1-q2",
            "prompt": "¿Quién debe realizar la clasificación clínica de prioridad?",
            "options": [
              "Quien grita más fuerte",
              "Cualquier persona mediante una regla inventada",
              "Personal entrenado usando el protocolo del sistema"
            ],
            "answer": 2,
            "why": "La clasificación necesita entrenamiento y un criterio compartido."
          },
          {
            "id": "evacuacion-coordinacion-1-q3",
            "prompt": "¿Qué función puede aportar la policía en el acceso?",
            "options": [
              "Dirigir tratamientos fuera de su competencia",
              "Mantener un corredor seguro para los equipos",
              "Permitir estacionamiento en toda la entrada"
            ],
            "answer": 1,
            "why": "La seguridad y el acceso facilitan la asistencia."
          },
          {
            "id": "evacuacion-coordinacion-1-q4",
            "prompt": "Dos equipos solicitan la misma ambulancia para personas distintas. ¿Qué corresponde?",
            "options": [
              "Resolverlo con la coordinación de transporte y prioridad sanitaria",
              "Que gane el que llegó primero al vehículo",
              "Enviar la ambulancia sin informar a nadie"
            ],
            "answer": 0,
            "why": "La asignación necesita una visión común de recursos y prioridades."
          },
          {
            "id": "evacuacion-coordinacion-1-q5",
            "prompt": "La cantidad de afectados todavía es incierta. ¿Cómo informás?",
            "options": [
              "Un número exacto inventado",
              "No informar hasta tener una lista perfecta",
              "Una estimación identificada como provisional y actualizaciones"
            ],
            "answer": 2,
            "why": "La incertidumbre se comunica sin impedir una alerta temprana."
          }
        ]
      },
      {
        "id": "evacuacion-coordinacion-2",
        "title": "Áreas y circulación segura",
        "objective": "Reconocer decisiones seguras, comunicar y actuar dentro del rol.",
        "body": "Ubicá áreas de espera y circulación conforme al mando del incidente y los riesgos. Evitá cruces entre público, vehículos y equipos. El área de asistencia no es un estacionamiento.\n\nUna persona que camina puede necesitar atención y seguimiento: no debe desaparecer del registro. Facilitá apoyo accesible para niños, personas mayores y quienes necesitan ayuda para comprender las instrucciones.",
        "source": "evac-plan",
        "questions": [
          {
            "id": "evacuacion-coordinacion-2-q1",
            "prompt": "Un móvil estaciona en el corredor de ambulancias. ¿Qué hacés?",
            "options": [
              "Desviar a peatones por la calzada sin control",
              "Coordinar su retiro a un sitio que no obstruya",
              "Dejarlo porque pertenece al equipo"
            ],
            "answer": 1,
            "why": "El acceso debe permanecer funcional y seguro."
          },
          {
            "id": "evacuacion-coordinacion-2-q2",
            "prompt": "Una persona puede caminar después del incidente. ¿Qué significa?",
            "options": [
              "Que puede desplazarse, pero aún necesita valoración y registro",
              "Que no tiene ninguna lesión",
              "Que puede retirarse sin avisar"
            ],
            "answer": 0,
            "why": "Caminar no descarta problemas ni sustituye evaluación."
          },
          {
            "id": "evacuacion-coordinacion-2-q3",
            "prompt": "¿Cómo organizás al público que busca información?",
            "options": [
              "Dentro del área de carga de ambulancias",
              "Junto a cada paciente para preguntar",
              "En un punto seguro separado de la circulación asistencial"
            ],
            "answer": 2,
            "why": "Separar la información pública favorece seguridad y privacidad."
          },
          {
            "id": "evacuacion-coordinacion-2-q4",
            "prompt": "Llega un niño sin acompañante identificado. ¿Qué corresponde?",
            "options": [
              "Publicar su foto y ubicación en redes",
              "Mantenerlo protegido, registrar la situación y activar el procedimiento de reunificación",
              "Entregarlo a quien diga conocerlo sin verificar"
            ],
            "answer": 1,
            "why": "La protección y reunificación requieren verificación y coordinación."
          },
          {
            "id": "evacuacion-coordinacion-2-q5",
            "prompt": "Una persona mayor no comprende dónde esperar. ¿Qué hacés?",
            "options": [
              "Explicar con calma y coordinar acompañamiento al punto seguro",
              "Dejarla sola para que siga a otros",
              "Gritar instrucciones más complejas"
            ],
            "answer": 0,
            "why": "La orientación debe ser accesible y verificar comprensión."
          }
        ]
      },
      {
        "id": "evacuacion-coordinacion-3",
        "title": "Registro de salidas y distribución",
        "objective": "Reconocer decisiones seguras, comunicar y actuar dentro del rol.",
        "body": "Cada salida debe quedar vinculada a una persona o identificador, recurso y destino confirmado. Actualizá la coordinación cuando cambie el plan. No concentres traslados por iniciativa propia en un único centro sin conocer su capacidad.\n\nLa información clínica y personal se comunica por los canales del sistema, solo a quienes la necesitan. Las listas públicas no deben exponer detalles de salud.",
        "source": "evac-coord",
        "questions": [
          {
            "id": "evacuacion-coordinacion-3-q1",
            "prompt": "¿Qué dato vincula una salida con su seguimiento?",
            "options": [
              "Solo el color del vehículo",
              "Solo la hora aproximada del accidente",
              "Identificador de persona, recurso y destino confirmado"
            ],
            "answer": 2,
            "why": "El seguimiento exige saber quién salió, con qué recurso y hacia dónde."
          },
          {
            "id": "evacuacion-coordinacion-3-q2",
            "prompt": "No se confirmó capacidad del hospital propuesto. ¿Qué hacés?",
            "options": [
              "Elegir según comentarios de testigos",
              "Pedir coordinación del destino con la red sanitaria",
              "Mandar todos los móviles allí"
            ],
            "answer": 1,
            "why": "La distribución debe considerar la capacidad receptora."
          },
          {
            "id": "evacuacion-coordinacion-3-q3",
            "prompt": "Una ambulancia cambia de destino durante el trayecto. ¿Qué se actualiza?",
            "options": [
              "El registro y la central con el nuevo destino confirmado",
              "Solo el kilometraje",
              "Nada, porque ya había salido"
            ],
            "answer": 0,
            "why": "La trazabilidad debe reflejar los cambios reales."
          },
          {
            "id": "evacuacion-coordinacion-3-q4",
            "prompt": "Te piden la lista de heridos para publicarla en redes. ¿Qué corresponde?",
            "options": [
              "Compartirla completa por rapidez",
              "Enviar fotos de documentos para evitar errores",
              "Derivar la comunicación al responsable y proteger datos personales"
            ],
            "answer": 2,
            "why": "La información pública requiere un canal autorizado y protección de privacidad."
          },
          {
            "id": "evacuacion-coordinacion-3-q5",
            "prompt": "Dos personas tienen el mismo nombre. ¿Cómo prevenís una confusión?",
            "options": [
              "Identificándolas solo por su ropa",
              "Usando los identificadores y verificaciones definidos por el sistema",
              "Dándoles el mismo registro"
            ],
            "answer": 1,
            "why": "El nombre por sí solo puede no distinguir a las personas."
          }
        ]
      },
      {
        "id": "evacuacion-coordinacion-4",
        "title": "Cambios, relevos y evaluación del operativo",
        "objective": "Reconocer decisiones seguras, comunicar y actuar dentro del rol.",
        "body": "En un relevo, entregá situación actual, recursos disponibles, personas pendientes y riesgos que cambiaron. Confirmá quién recibe cada función. Un dato pendiente se informa como pendiente.\n\nAntes de cerrar, conciliá salidas y destinos con los responsables. Revisá las dificultades en un espacio de aprendizaje, sin divulgar información sensible de las personas atendidas.",
        "source": "evac-coord",
        "questions": [
          {
            "id": "evacuacion-coordinacion-4-q1",
            "prompt": "¿Qué transmitís al equipo que te releva?",
            "options": [
              "Pendientes, recursos, riesgos y decisiones vigentes",
              "Solo que está todo controlado",
              "Únicamente la hora de llegada"
            ],
            "answer": 0,
            "why": "El relevo necesita información para continuar sin perder tareas."
          },
          {
            "id": "evacuacion-coordinacion-4-q2",
            "prompt": "Llega información contradictoria sobre un destino. ¿Qué hacés?",
            "options": [
              "Elegir el dato que parece más probable",
              "Borrar ambos registros",
              "Verificarla con la central y marcarla pendiente hasta confirmar"
            ],
            "answer": 2,
            "why": "Una discrepancia debe resolverse con fuentes responsables."
          },
          {
            "id": "evacuacion-coordinacion-4-q3",
            "prompt": "Un área previamente segura pasa a estar en riesgo. ¿Qué corresponde?",
            "options": [
              "Cambiarla sin comunicar a los demás",
              "Avisar, reevaluar y reorganizar áreas con la coordinación",
              "Mantenerla por respeto al plan inicial"
            ],
            "answer": 1,
            "why": "El plan debe adaptarse a los riesgos actuales."
          },
          {
            "id": "evacuacion-coordinacion-4-q4",
            "prompt": "Antes del cierre hay una salida sin destino registrado. ¿Qué hacés?",
            "options": [
              "Conciliarla con el recurso y la coordinación receptora",
              "Dar por supuesto que llegó al hospital cercano",
              "Eliminarla del listado"
            ],
            "answer": 0,
            "why": "El cierre debe resolver la trazabilidad pendiente."
          },
          {
            "id": "evacuacion-coordinacion-4-q5",
            "prompt": "¿Qué aporta una revisión posterior del operativo?",
            "options": [
              "Buscar culpables en redes",
              "Publicar historias clínicas como ejemplo",
              "Acciones para mejorar comunicación y coordinación sin divulgar datos sensibles"
            ],
            "answer": 2,
            "why": "La revisión busca aprender y corregir el sistema."
          }
        ]
      }
    ]
  }
];
