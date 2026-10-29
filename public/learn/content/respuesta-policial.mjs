// Original draft, 2026-10-28. Instructor review required before use.
export const policeSources = {
  "police-bls": {
    "title": "AHA 2025 · Soporte vital básico adulto",
    "url": "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support"
  },
  "police-first-aid": {
    "title": "AHA / American Red Cross 2024 · Primeros auxilios",
    "url": "https://cpr.heart.org/en/resuscitation-science/2024-first-aid-guidelines"
  }
};
export const policeCourse = {
  "id": "respuesta-policial",
  "title": "Respuesta Táctica Prehospitalaria Policial",
  "category": "primeros-auxilios",
  "summary": "Primeros auxilios y enlace Policía–Hospital: teoría, simulaciones presenciales y 50 preguntas originales.",
  "scope": "Curso introductorio propio para primeros respondientes. No es una certificación PHTLS, ATLS ni de medicina táctica. Revisión docente a cargo del Dr. Mariano Jiménez. La emisión institucional requiere autorización de su cuenta.",
  "reviewStatus": "Pendiente de validación docente",
  "institutionalCertificate": true,
  "examMinutes": 60,
  "lessons": [
    {
      "id": "rtpp-1",
      "title": "Seguridad de la escena y pedido de ayuda",
      "area": "Seguridad de la escena y pedido de ayuda",
      "minutes": 6,
      "source": "police-first-aid",
      "objective": "Reconocer prioridades, actuar dentro del entrenamiento y comunicar hallazgos.",
      "body": "Reconocer riesgos antes del contacto. Ubicación precisa, accesos, tránsito, electricidad, violencia y cantidad de afectados se comunican temprano. Usar protección personal disponible y pedir recursos; no ingresar en una escena insegura.\n\nEscena segura antes de actuar: Observá desde un lugar protegido: tránsito, cables, combustible, armas, humo y personas agresivas. Identificá rutas de acceso y salida. No transformes una víctima en dos por entrar sin control del riesgo.\n\nPara recordar: Aviso inicial: ubicación exacta, acceso, riesgos, número aproximado de víctimas y recursos necesarios.\n\nCaso guiado: Choque en ruta con cables caídos: aislá el área y solicitá apoyo especializado; no toques vehículo ni cables.",
      "questions": [
        {
          "id": "rtpp-1-1",
          "prompt": "Hay cables sobre un vehículo chocado. ¿Qué hacés primero?",
          "options": [
            "Abrir la puerta con guantes comunes",
            "Mover el cable con una rama",
            "Mantener distancia y pedir personal competente",
            "Entrar si la víctima habla",
            "Acercarse hasta el vehículo antes de informar los riesgos"
          ],
          "answer": 2,
          "why": "La seguridad eléctrica requiere personal competente; los guantes comunes no aíslan.",
          "skill": "Seguridad de la escena y pedido de ayuda",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-1-2",
          "prompt": "¿Qué dato permite enviar ayuda al lugar correcto?",
          "options": [
            "Acercarse hasta el vehículo antes de informar los riesgos",
            "Transmitir una referencia aproximada sin confirmar el acceso",
            "Priorizar la identificación de los involucrados antes del pedido de apoyo",
            "Ubicación y acceso precisos",
            "Mantener la primera evaluación aunque cambie el entorno"
          ],
          "answer": 3,
          "why": "El equipo necesita localizar y acceder a la escena.",
          "skill": "Seguridad de la escena y pedido de ayuda",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-1-3",
          "prompt": "Hay varias víctimas. ¿Qué informás temprano?",
          "options": [
            "Acercarse hasta el vehículo antes de informar los riesgos",
            "Una historia completa antes de avisar",
            "Únicamente las matrículas",
            "Que todas tienen politrauma",
            "Cantidad aproximada y riesgos visibles"
          ],
          "answer": 4,
          "why": "La cantidad y los riesgos permiten dimensionar la respuesta.",
          "skill": "Seguridad de la escena y pedido de ayuda",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-1-4",
          "prompt": "Antes de tocar sangre, ¿qué priorizás?",
          "options": [
            "Protección personal disponible sin exponerte",
            "Limpiarte las manos después como única medida",
            "Usar la misma gasa para todos",
            "Tocar la herida para medir profundidad",
            "Acercarse hasta el vehículo antes de informar los riesgos"
          ],
          "answer": 0,
          "why": "Las barreras reducen exposición; evitá contacto desprotegido.",
          "skill": "Seguridad de la escena y pedido de ayuda",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-1-5",
          "prompt": "Una escena inicialmente segura se vuelve violenta. ¿Qué corresponde?",
          "options": [
            "Continuar aunque estés en riesgo",
            "Reevaluar seguridad y pedir apoyo",
            "Discutir para imponer autoridad sanitaria",
            "Dejar de comunicar por radio",
            "Entrar solo para acelerar"
          ],
          "answer": 1,
          "why": "La seguridad se reevalúa durante toda la asistencia.",
          "skill": "Seguridad de la escena y pedido de ayuda",
          "source": "police-first-aid"
        }
      ],
      "simulation": {
        "required": false,
        "radioPractice": true,
        "radioSeconds": 45,
        "radioInstructions": "En la simulación, prepará un aviso por radio de hasta 45 segundos: identificación del móvil, ubicación y acceso, riesgos, cantidad de víctimas, mecanismo, conciencia y respiración, hemorragia grave, medidas realizadas y recursos solicitados. Confirmá recepción. El límite sirve para practicar claridad; nunca omitas datos críticos por el reloj.",
        "scenario": "Choque en una curva con tránsito activo. Un integrante identifica riesgos, otro representa al testigo y otro recibe el aviso al hospital.",
        "roles": [
          "Respondiente: evalúa y verbaliza las acciones.",
          "Víctima o testigo: representa solo los datos del caso.",
          "Observador/enlace: usa la lista y comunica al hospital."
        ],
        "rotation": "Rotar hasta que cada participante complete los tres roles. En estaciones obligatorias: 3 minutos por rol y devolución breve; en microcasos, 1 minuto por rol.",
        "checklist": [
          "Reconoce riesgos y pide ayuda.",
          "Identifica la prioridad del módulo.",
          "Evita maniobras peligrosas.",
          "Comunica en hasta 45 segundos ubicación, riesgos, víctimas, estado, medidas y solicitud; confirma recepción sin inventar datos."
        ],
        "validation": "La actividad no se acredita por leerla. Solicitá validación desde Mis prácticas en la capacitación; tu instructor registra la observación."
      }
    },
    {
      "id": "rtpp-2",
      "title": "Evaluación inicial: hemorragia masiva y ABCDE",
      "area": "Evaluación inicial: hemorragia masiva y ABCDE",
      "minutes": 6,
      "source": "police-first-aid",
      "objective": "Reconocer prioridades, actuar dentro del entrenamiento y comunicar hallazgos.",
      "body": "Atender hemorragia externa masiva de inmediato. A: vía aérea; B: respiración; C: circulación y sangrado; D: conciencia; E: exposición limitada buscando lesiones y evitando frío. Pedir ayuda temprano y reevaluar ante cambios; no esperar a completar una lista para tratar una amenaza vital.\n\nPrioridad vital y reevaluación: En el primer contacto buscá amenazas inmediatas: hemorragia externa masiva, respuesta, vía aérea y respiración. ABCDE ordena la observación, pero no debe retrasar el control de una amenaza vital evidente.\n\nPara recordar: A: vía aérea; B: respiración; C: circulación; D: estado neurológico; E: exposición limitada y protección térmica.\n\nCaso guiado: Paciente que empeora durante la espera: repetí evaluación y actualizá la comunicación.",
      "questions": [
        {
          "id": "rtpp-2-1",
          "prompt": "¿Qué significa A en ABCDE?",
          "options": [
            "Administrar analgésicos",
            "Alinear todas las fracturas",
            "Anotar antecedentes primero",
            "Evaluación de la vía aérea",
            "Aplicar collar a todos"
          ],
          "answer": 3,
          "why": "A busca amenazas de la vía aérea.",
          "skill": "Evaluación inicial: hemorragia masiva y ABCDE",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-2-2",
          "prompt": "¿Qué valorás en B?",
          "options": [
            "Completar primero la valoración neurológica antes de intervenir",
            "Priorizar la toma de signos vitales antes de controlar el sangrado",
            "Considerar suficiente una evaluación inicial sin repetirla",
            "Mantener al paciente descubierto para vigilar todas las lesiones",
            "Respiración y su dificultad"
          ],
          "answer": 4,
          "why": "B identifica problemas respiratorios.",
          "skill": "Evaluación inicial: hemorragia masiva y ABCDE",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-2-3",
          "prompt": "Sangrado externo masivo evidente. ¿Cuándo actuar?",
          "options": [
            "De inmediato junto con activación de ayuda",
            "Después de la historia clínica",
            "Después de medir presión",
            "Completar primero la valoración neurológica antes de intervenir",
            "Cuando llegue el resultado de laboratorio"
          ],
          "answer": 0,
          "why": "La hemorragia amenazante requiere control temprano.",
          "skill": "Evaluación inicial: hemorragia masiva y ABCDE",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-2-4",
          "prompt": "Tras evaluar al paciente empeora la conciencia. ¿Qué hacés?",
          "options": [
            "Mantener el informe anterior",
            "Repetir evaluación inicial y actualizar el aviso",
            "Completar primero el formulario",
            "Asumir que está durmiendo",
            "Completar primero la valoración neurológica antes de intervenir"
          ],
          "answer": 1,
          "why": "La evaluación es dinámica.",
          "skill": "Evaluación inicial: hemorragia masiva y ABCDE",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-2-5",
          "prompt": "Al buscar lesiones, ¿cómo prevenís pérdida de calor?",
          "options": [
            "Dejar toda la ropa retirada",
            "Usar hielo sobre todo el cuerpo",
            "Exponer lo necesario y volver a cubrir",
            "Mantenerlo mojado",
            "Evitar cualquier abrigo por el trauma"
          ],
          "answer": 2,
          "why": "La exposición debe equilibrarse con protección térmica.",
          "skill": "Evaluación inicial: hemorragia masiva y ABCDE",
          "source": "police-first-aid"
        }
      ],
      "simulation": {
        "required": false,
        "scenario": "Víctima de caída que responde al principio y luego deja de responder. El respondiente comunica los cambios; el observador verifica prioridades.",
        "roles": [
          "Respondiente: evalúa y verbaliza las acciones.",
          "Víctima o testigo: representa solo los datos del caso.",
          "Observador/enlace: usa la lista y comunica al hospital."
        ],
        "rotation": "Rotar hasta que cada participante complete los tres roles. En estaciones obligatorias: 3 minutos por rol y devolución breve; en microcasos, 1 minuto por rol.",
        "checklist": [
          "Reconoce riesgos y pide ayuda.",
          "Identifica la prioridad del módulo.",
          "Evita maniobras peligrosas.",
          "Comunica hallazgos, intervención y evolución."
        ],
        "validation": "La actividad no se acredita por leerla. Solicitá validación desde Mis prácticas en la capacitación; tu instructor registra la observación."
      }
    },
    {
      "id": "rtpp-3",
      "title": "Reconocimiento del paro, RCP y DEA",
      "area": "Reconocimiento del paro, RCP y DEA",
      "minutes": 6,
      "source": "police-bls",
      "objective": "Reconocer prioridades, actuar dentro del entrenamiento y comunicar hallazgos.",
      "body": "En adulto que no responde y no respira normalmente, incluido jadeo aislado, presumir paro, activar emergencias y pedir DEA. Iniciar RCP según capacitación y seguir las indicaciones del DEA en una emergencia real. En esta clase no hay maniquí: solo se ensaya la secuencia, con gestos sin presión sobre compañeros y DEA apagado. No se evalúan profundidad ni calidad de compresiones.\n\nReconocer el paro y pedir DEA: Una persona inconsciente que no respira normalmente, incluso con jadeos aislados, requiere activación inmediata de emergencias, RCP según formación y solicitud de DEA. Seguí las instrucciones del equipo.\n\nPara recordar: Durante análisis y descarga nadie debe tocar al paciente. La simulación de esta clase se realiza sin descargas ni compresiones sobre compañeros.\n\nCaso guiado: Dos policías: uno pide ayuda y DEA, otro inicia la secuencia según entrenamiento.",
      "questions": [
        {
          "id": "rtpp-3-1",
          "prompt": "Adulto no responde y jadea de forma aislada. ¿Qué sospechás?",
          "options": [
            "Esperar a distinguir clínicamente la causa antes de activar emergencias",
            "Respiración normal garantizada",
            "Interpretar los jadeos aislados como respiración suficiente",
            "ACV descartado y sin urgencia",
            "Paro cardíaco"
          ],
          "answer": 4,
          "why": "El jadeo no es respiración normal y puede acompañar un paro.",
          "skill": "Reconocimiento del paro, RCP y DEA",
          "source": "police-bls"
        },
        {
          "id": "rtpp-3-2",
          "prompt": "En una emergencia real reconocés un paro. ¿Qué corresponde?",
          "options": [
            "Activar ayuda e iniciar RCP, solicitando DEA",
            "Esperar a distinguir clínicamente la causa antes de activar emergencias",
            "Completar antecedentes antes de actuar",
            "Interpretar los jadeos aislados como respiración suficiente",
            "Continuar contacto físico mientras el DEA analiza el ritmo"
          ],
          "answer": 0,
          "why": "La respuesta debe empezar inmediatamente.",
          "skill": "Reconocimiento del paro, RCP y DEA",
          "source": "police-bls"
        },
        {
          "id": "rtpp-3-3",
          "prompt": "Durante análisis y descarga del DEA real, ¿qué debe hacer el equipo?",
          "options": [
            "Sostenerle los brazos",
            "Evitar tocar al paciente siguiendo las indicaciones",
            "Continuar tocando el tórax",
            "Retirar todos los parches",
            "Esperar a distinguir clínicamente la causa antes de activar emergencias"
          ],
          "answer": 1,
          "why": "El equipo sigue las indicaciones y evita contacto durante análisis y descarga.",
          "skill": "Reconocimiento del paro, RCP y DEA",
          "source": "police-bls"
        },
        {
          "id": "rtpp-3-4",
          "prompt": "En esta clase con compañeros como víctimas, ¿cómo ensayás?",
          "options": [
            "Compresiones suaves sobre el compañero",
            "Descarga de prueba de baja energía",
            "Gestos sin presión y DEA apagado",
            "Compresiones hasta que moleste",
            "Ventilaciones boca a boca entre participantes"
          ],
          "answer": 2,
          "why": "La simulación no debe producir daño ni exposición innecesaria.",
          "skill": "Reconocimiento del paro, RCP y DEA",
          "source": "police-bls"
        },
        {
          "id": "rtpp-3-5",
          "prompt": "¿Qué puede validar este ensayo sin maniquí?",
          "options": [
            "Profundidad real de compresiones",
            "Eficacia de una descarga real",
            "Competencia avanzada en reanimación",
            "Reconocimiento, activación y secuencia simulada",
            "Calidad objetiva de ventilación"
          ],
          "answer": 3,
          "why": "La evaluación debe limitarse a lo observado.",
          "skill": "Reconocimiento del paro, RCP y DEA",
          "source": "police-bls"
        }
      ],
      "simulation": {
        "required": true,
        "scenario": "Obligatoria: una persona representa la víctima, otra reconoce el paro y verbaliza RCP, otra pide ayuda y describe el uso del DEA apagado. Rotar roles sin presionar el tórax ni administrar descargas.",
        "roles": [
          "Respondiente: evalúa y verbaliza las acciones.",
          "Víctima o testigo: representa solo los datos del caso.",
          "Observador/enlace: usa la lista y comunica al hospital."
        ],
        "rotation": "Rotar hasta que cada participante complete los tres roles. En estaciones obligatorias: 3 minutos por rol y devolución breve; en microcasos, 1 minuto por rol.",
        "checklist": [
          "Reconoce riesgos y pide ayuda.",
          "Identifica la prioridad del módulo.",
          "Evita maniobras peligrosas.",
          "Comunica hallazgos, intervención y evolución."
        ],
        "validation": "La actividad no se acredita por leerla. Solicitá validación desde Mis prácticas en la capacitación; tu instructor registra la observación."
      }
    },
    {
      "id": "rtpp-4",
      "title": "Hemorragia grave y signos de shock",
      "area": "Hemorragia grave y signos de shock",
      "minutes": 6,
      "source": "police-first-aid",
      "objective": "Reconocer prioridades, actuar dentro del entrenamiento y comunicar hallazgos.",
      "body": "Reconocer sangrado abundante y deterioro: palidez, sudor frío, debilidad o confusión. Aplicar presión directa; en hemorragia de extremidad amenazante no controlada, usar torniquete apropiado según capacitación. Registrar hora, verificar control y comunicar; no aflojarlo periódicamente. No esperar una cifra de presión para pedir ayuda. En clase usar material simulado: no ocluir la circulación de un compañero.\n\nHemorragia y shock: El sangrado externo amenazante exige control temprano. Usá protección, presión directa y, cuando esté indicado y estés capacitado, un torniquete apropiado para extremidades. Registrá la hora y no lo aflojes periódicamente.\n\nPara recordar: Palidez, sudor frío, confusión y debilidad son señales de alarma aun sin tensiómetro.\n\nCaso guiado: Herida de pierna con sangrado persistente: comunicar gravedad, medidas y respuesta observada.",
      "questions": [
        {
          "id": "rtpp-4-1",
          "prompt": "¿Qué medida inicial corresponde ante hemorragia externa grave?",
          "options": [
            "Presión directa con protección",
            "Lavar durante varios minutos antes de comprimir",
            "Dar bebida azucarada",
            "Retirar la presión cada minuto para verificar la herida",
            "Retirar repetidamente coágulos"
          ],
          "answer": 0,
          "why": "La presión directa es la medida inicial de control.",
          "skill": "Hemorragia grave y signos de shock",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-4-2",
          "prompt": "Sangrado amenazante de extremidad persiste con presión. ¿Qué considerás si estás entrenado?",
          "options": [
            "Torniquete en el cuello",
            "Torniquete apropiado",
            "Retirar la presión cada minuto para verificar la herida",
            "Aflojar la presión para observar",
            "Aplicar torniquete antes de valorar si el sangrado es de extremidad"
          ],
          "answer": 1,
          "why": "El torniquete corresponde a hemorragia grave de extremidad cuando está indicado.",
          "skill": "Hemorragia grave y signos de shock",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-4-3",
          "prompt": "Torniquete eficaz colocado. ¿Qué comunicás?",
          "options": [
            "Retirar la presión cada minuto para verificar la herida",
            "Aplicar torniquete antes de valorar si el sangrado es de extremidad",
            "Hora de colocación y respuesta",
            "Omitir registrar la hora si se controla la hemorragia",
            "Que debe aflojarse cada cinco minutos"
          ],
          "answer": 2,
          "why": "La hora y eficacia ayudan a continuar la atención.",
          "skill": "Hemorragia grave y signos de shock",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-4-4",
          "prompt": "Trauma con palidez, sudor frío y confusión. ¿Qué hacés sin tensiómetro?",
          "options": [
            "Descartar shock por no medir presión",
            "Dar el alta por estar despierto",
            "Atribuirlo siempre a miedo",
            "Sospechar shock y pedir asistencia urgente",
            "Retirar la presión cada minuto para verificar la herida"
          ],
          "answer": 3,
          "why": "No se necesita una cifra de presión para reconocer deterioro.",
          "skill": "Hemorragia grave y signos de shock",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-4-5",
          "prompt": "¿Dónde ensayás el ajuste del torniquete en clase?",
          "options": [
            "En el cuello del compañero",
            "En un brazo hasta perder pulso",
            "En ambas piernas de un participante",
            "Sobre una fractura real",
            "En un soporte inanimado apropiado"
          ],
          "answer": 4,
          "why": "No debe ocluirse la circulación de participantes en esta simulación.",
          "skill": "Hemorragia grave y signos de shock",
          "source": "police-first-aid"
        }
      ],
      "simulation": {
        "required": true,
        "scenario": "Obligatoria: herida de extremidad simulada con palidez y confusión. Respondiente verbaliza control; víctima relata deterioro; observador comunica hora y respuesta. Torniquete sobre soporte inanimado, sin ajuste oclusivo sobre personas.",
        "roles": [
          "Respondiente: evalúa y verbaliza las acciones.",
          "Víctima o testigo: representa solo los datos del caso.",
          "Observador/enlace: usa la lista y comunica al hospital."
        ],
        "rotation": "Rotar hasta que cada participante complete los tres roles. En estaciones obligatorias: 3 minutos por rol y devolución breve; en microcasos, 1 minuto por rol.",
        "checklist": [
          "Reconoce riesgos y pide ayuda.",
          "Identifica la prioridad del módulo.",
          "Evita maniobras peligrosas.",
          "Comunica hallazgos, intervención y evolución."
        ],
        "validation": "La actividad no se acredita por leerla. Solicitá validación desde Mis prácticas en la capacitación; tu instructor registra la observación."
      }
    },
    {
      "id": "rtpp-5",
      "title": "Politrauma y protección cervical",
      "area": "Politrauma y protección cervical",
      "minutes": 6,
      "source": "police-first-aid",
      "objective": "Reconocer prioridades, actuar dentro del entrenamiento y comunicar hallazgos.",
      "body": "En un choque, valorar amenazas vitales antes de lesiones llamativas. Minimizar movimientos y pedir asistencia; no colocar collar rígido automáticamente ni forzar alineación. La vía aérea y respiración tienen prioridad. Mover por peligro inmediato o necesidad vital, con ayuda y coordinación según entrenamiento; no practicar tracciones ni manipulaciones cervicales.\n\nTrauma y protección cervical: No fuerces la alineación del cuello ni apliques collar automáticamente. Minimizá movimientos, pedí asistencia y priorizá la respiración. El peligro inmediato puede obligar a una movilización de emergencia coordinada.\n\nPara recordar: No realizar tracciones cervicales sobre compañeros durante las prácticas.\n\nCaso guiado: Choque con dolor cervical y humo creciente: evaluar seguridad, coordinar ayuda y comunicar la decisión.",
      "questions": [
        {
          "id": "rtpp-5-1",
          "prompt": "Víctima de choque con dolor cervical y escena segura. ¿Qué indicás?",
          "options": [
            "Girar la cabeza para probar movilidad",
            "Permanecer lo más quieta posible y pedir asistencia",
            "Caminar para descartar lesión",
            "Traccionar el cuello",
            "Colocar collar a toda víctima sin evaluación"
          ],
          "answer": 1,
          "why": "Se minimizan movimientos innecesarios.",
          "skill": "Politrauma y protección cervical",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-5-2",
          "prompt": "Sospecha cervical y vía aérea comprometida. ¿Qué prioridad rige?",
          "options": [
            "Dejar la obstrucción para no mover",
            "Comprobar movilidad cervical activa antes de pedir ayuda",
            "Atender la vía aérea minimizando movimientos",
            "Pedir que camine",
            "Atender primero una herida pequeña"
          ],
          "answer": 2,
          "why": "La protección cervical no debe impedir oxigenación.",
          "skill": "Politrauma y protección cervical",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-5-3",
          "prompt": "Hay peligro inmediato de incendio. ¿Qué cambia?",
          "options": [
            "Está prohibido mover bajo cualquier condición",
            "Se debe esperar el examen completo",
            "Hay que buscar pertenencias primero",
            "Puede requerirse movilización de emergencia coordinada",
            "Se suspende el pedido de ayuda"
          ],
          "answer": 3,
          "why": "La seguridad puede obligar a mover al paciente.",
          "skill": "Politrauma y protección cervical",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-5-4",
          "prompt": "¿Qué enseñanza sobre collar corresponde al primer respondiente?",
          "options": [
            "Usarlo antes de valorar respiración",
            "Forzar posición para que cierre",
            "Usarlo como tratamiento de cualquier dolor",
            "Sustituir con él la vigilancia",
            "No aplicarlo automáticamente a todo accidentado"
          ],
          "answer": 4,
          "why": "La restricción de movimiento debe ser razonada y acorde a capacitación.",
          "skill": "Politrauma y protección cervical",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-5-5",
          "prompt": "¿Qué evitamos en la práctica cervical entre compañeros?",
          "options": [
            "Tracciones y movimientos forzados",
            "Comunicación de roles",
            "Evaluación verbal",
            "Pedido simulado de ayuda",
            "Observación de riesgos"
          ],
          "answer": 0,
          "why": "El ensayo no requiere maniobras potencialmente lesivas.",
          "skill": "Politrauma y protección cervical",
          "source": "police-first-aid"
        }
      ],
      "simulation": {
        "required": true,
        "scenario": "Obligatoria: víctima de choque con dolor cervical. Un respondiente dirige, otra persona representa la víctima y la tercera observa y comunica. Verbalizar la decisión de movilizar; sin tracciones, giros forzados ni levantamientos de compañeros.",
        "roles": [
          "Respondiente: evalúa y verbaliza las acciones.",
          "Víctima o testigo: representa solo los datos del caso.",
          "Observador/enlace: usa la lista y comunica al hospital."
        ],
        "rotation": "Rotar hasta que cada participante complete los tres roles. En estaciones obligatorias: 3 minutos por rol y devolución breve; en microcasos, 1 minuto por rol.",
        "checklist": [
          "Reconoce riesgos y pide ayuda.",
          "Identifica la prioridad del módulo.",
          "Evita maniobras peligrosas.",
          "Comunica hallazgos, intervención y evolución."
        ],
        "validation": "La actividad no se acredita por leerla. Solicitá validación desde Mis prácticas en la capacitación; tu instructor registra la observación."
      }
    },
    {
      "id": "rtpp-6",
      "title": "Fracturas, heridas y lesiones asociadas",
      "area": "Fracturas, heridas y lesiones asociadas",
      "minutes": 6,
      "source": "police-first-aid",
      "objective": "Reconocer prioridades, actuar dentro del entrenamiento y comunicar hallazgos.",
      "body": "Sostener una extremidad lesionada en la posición encontrada, sin enderezar deformidades. Proteger heridas y controlar sangrado; no reintroducir huesos ni retirar objetos incrustados. Observar color, sensibilidad y circulación distal antes y después de sostener o colocar una férula conforme a entrenamiento. Dificultad respiratoria tras golpe torácico o deterioro tras golpe en la cabeza requieren aviso urgente.\n\nFracturas y heridas: Protegé heridas, controlá sangrado y sostené la extremidad en la posición encontrada. No reintroduzcas huesos ni retires objetos incrustados. Observá color, sensibilidad y circulación distal.\n\nPara recordar: Dificultad respiratoria tras trauma torácico o deterioro neurológico tras golpe requieren asistencia urgente.\n\nCaso guiado: Pierna deformada y dedos fríos después de sostenerla: reevaluar y avisar.",
      "questions": [
        {
          "id": "rtpp-6-1",
          "prompt": "Fractura expuesta con hueso visible. ¿Qué evitás?",
          "options": [
            "Pedir asistencia",
            "Proteger la herida",
            "Reintroducir el hueso",
            "Controlar sangrado",
            "Informar el mecanismo"
          ],
          "answer": 2,
          "why": "No se debe intentar reducir una fractura expuesta.",
          "skill": "Fracturas, heridas y lesiones asociadas",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-6-2",
          "prompt": "Deformidad dolorosa de una pierna. ¿Cómo la sostenés inicialmente?",
          "options": [
            "Enderezándola hasta que encaje",
            "Haciéndolo caminar",
            "Traccionando enérgicamente",
            "En la posición encontrada sin forzar",
            "Masajeando la deformidad"
          ],
          "answer": 3,
          "why": "La manipulación puede agravar lesiones.",
          "skill": "Fracturas, heridas y lesiones asociadas",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-6-3",
          "prompt": "Tras colocar sostén aparecen dedos fríos y hormigueo. ¿Qué corresponde?",
          "options": [
            "Considerarlo siempre normal",
            "Ajustar más por rutina",
            "Ignorar hasta el hospital",
            "Pedir ejercicio intenso",
            "Reevaluar posible compromiso y pedir ayuda"
          ],
          "answer": 4,
          "why": "Los cambios distales obligan a revisar la medida y comunicar.",
          "skill": "Fracturas, heridas y lesiones asociadas",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-6-4",
          "prompt": "Objeto incrustado en una herida. ¿Qué hacés?",
          "options": [
            "Evitar retirarlo y solicitar asistencia",
            "Extraerlo para medir profundidad",
            "Empujarlo para fijarlo",
            "Moverlo para ver si sangra",
            "Cortarlo sin evaluar riesgos"
          ],
          "answer": 0,
          "why": "Retirarlo puede agravar sangrado y lesiones.",
          "skill": "Fracturas, heridas y lesiones asociadas",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-6-5",
          "prompt": "Tras golpe torácico aparece dificultad respiratoria. ¿Qué priorizás?",
          "options": [
            "Tratar solo el dolor del brazo",
            "Aviso urgente y vigilancia respiratoria",
            "Alinear la deformidad para facilitar el transporte sin evaluación",
            "Hacer una punción sin formación",
            "Retirar el objeto incrustado antes de cubrir la herida"
          ],
          "answer": 1,
          "why": "El deterioro respiratorio es una amenaza vital.",
          "skill": "Fracturas, heridas y lesiones asociadas",
          "source": "police-first-aid"
        }
      ],
      "simulation": {
        "required": false,
        "scenario": "En tríos representar una fractura con material blando. Respondiente describe sostén y vigilancia distal; víctima informa hormigueo; observador detecta si se fuerza la extremidad. No ajustar vendajes que comprometan circulación.",
        "roles": [
          "Respondiente: evalúa y verbaliza las acciones.",
          "Víctima o testigo: representa solo los datos del caso.",
          "Observador/enlace: usa la lista y comunica al hospital."
        ],
        "rotation": "Rotar hasta que cada participante complete los tres roles. En estaciones obligatorias: 3 minutos por rol y devolución breve; en microcasos, 1 minuto por rol.",
        "checklist": [
          "Reconoce riesgos y pide ayuda.",
          "Identifica la prioridad del módulo.",
          "Evita maniobras peligrosas.",
          "Comunica hallazgos, intervención y evolución."
        ],
        "validation": "La actividad no se acredita por leerla. Solicitá validación desde Mis prácticas en la capacitación; tu instructor registra la observación."
      }
    },
    {
      "id": "rtpp-7",
      "title": "Dolor torácico y reconocimiento de ACV",
      "area": "Dolor torácico y reconocimiento de ACV",
      "minutes": 6,
      "source": "police-first-aid",
      "objective": "Reconocer prioridades, actuar dentro del entrenamiento y comunicar hallazgos.",
      "body": "Dolor torácico nuevo, dificultad respiratoria o sudoración requieren activación sanitaria; infarto y paro no son lo mismo. Para posible ACV observar cara, brazos y habla, y averiguar cuándo estuvo bien por última vez. Comunicar hallazgos sin exigir diagnóstico definitivo. No dar comida ni bebida si hay alteración de conciencia o dificultad para tragar.\n\nReconocer ACV y dolor torácico: Ante asimetría facial, debilidad de brazo o alteración brusca del habla, activá asistencia y comunicá la última hora conocida sin síntomas. Ante dolor torácico con sudoración o dificultad respiratoria, pedí ayuda sin esperar diagnóstico.\n\nPara recordar: No dar comida ni bebida si hay alteración de conciencia o deglución.\n\nCaso guiado: Testigo refiere habla normal hace 20 minutos: registrar ese dato y transmitirlo.",
      "questions": [
        {
          "id": "rtpp-7-1",
          "prompt": "Habla súbitamente alterada y debilidad de un brazo. ¿Qué sospechás?",
          "options": [
            "Alcoholización confirmada",
            "Paro confirmado aunque conversa",
            "Fractura aislada",
            "Posible ACV",
            "Cansancio sin urgencia"
          ],
          "answer": 3,
          "why": "Los síntomas focales bruscos requieren respuesta urgente.",
          "skill": "Dolor torácico y reconocimiento de ACV",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-7-2",
          "prompt": "¿Qué tiempo es clave transmitir ante posible ACV?",
          "options": [
            "Esperar confirmación diagnóstica antes de activar emergencias",
            "Tomar como inicio de síntomas la hora de llegada del móvil",
            "Considerar que hablar descarta una emergencia cardiovascular",
            "Ofrecer líquidos para evaluar la capacidad de deglución",
            "Última vez que se lo vio bien"
          ],
          "answer": 4,
          "why": "La última vez bien informa decisiones del equipo sanitario.",
          "skill": "Dolor torácico y reconocimiento de ACV",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-7-3",
          "prompt": "Dolor torácico y sudoración en persona despierta. ¿Qué hacés?",
          "options": [
            "Activar asistencia y vigilar cambios",
            "Comprimir el tórax por el dolor",
            "Hacerlo correr para probar",
            "Esperar confirmación diagnóstica antes de activar emergencias",
            "Trasladarlo sin comunicar nada"
          ],
          "answer": 0,
          "why": "Se solicita ayuda sin esperar diagnóstico definitivo.",
          "skill": "Dolor torácico y reconocimiento de ACV",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-7-4",
          "prompt": "¿Qué distingue el escenario de paro de este caso de ACV despierto?",
          "options": [
            "Dolor de brazo aislado",
            "Ausencia de respuesta y respiración no normal",
            "Antecedente de hipertensión",
            "Edad mayor de 50",
            "Dificultad de pronunciación sola"
          ],
          "answer": 1,
          "why": "El paro se reconoce por respuesta y respiración.",
          "skill": "Dolor torácico y reconocimiento de ACV",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-7-5",
          "prompt": "Posible ACV con dificultad para tragar. ¿Qué evitás?",
          "options": [
            "Pedir ayuda",
            "Registrar tiempos",
            "Dar alimentos o bebidas",
            "Observar respiración",
            "Informar debilidad"
          ],
          "answer": 2,
          "why": "La deglución alterada aumenta riesgo de aspiración.",
          "skill": "Dolor torácico y reconocimiento de ACV",
          "source": "police-first-aid"
        }
      ],
      "simulation": {
        "required": false,
        "scenario": "Caso grupal: persona despierta que empieza a hablar raro y no sostiene un brazo. Un integrante entrevista al testigo, otro hace reconocimiento verbal y otro comunica última vez bien. No confundir con el caso de paro.",
        "roles": [
          "Respondiente: evalúa y verbaliza las acciones.",
          "Víctima o testigo: representa solo los datos del caso.",
          "Observador/enlace: usa la lista y comunica al hospital."
        ],
        "rotation": "Rotar hasta que cada participante complete los tres roles. En estaciones obligatorias: 3 minutos por rol y devolución breve; en microcasos, 1 minuto por rol.",
        "checklist": [
          "Reconoce riesgos y pide ayuda.",
          "Identifica la prioridad del módulo.",
          "Evita maniobras peligrosas.",
          "Comunica hallazgos, intervención y evolución."
        ],
        "validation": "La actividad no se acredita por leerla. Solicitá validación desde Mis prácticas en la capacitación; tu instructor registra la observación."
      }
    },
    {
      "id": "rtpp-8",
      "title": "Confusión, convulsiones y persona agitada",
      "area": "Confusión, convulsiones y persona agitada",
      "minutes": 6,
      "source": "police-first-aid",
      "objective": "Reconocer prioridades, actuar dentro del entrenamiento y comunicar hallazgos.",
      "body": "Una persona que parece intoxicada puede tener hipoglucemia, trauma, ACV u otra urgencia. Mantener distancia segura, hablar con calma y solicitar apoyo sanitario. En convulsiones proteger de golpes, observar duración y respiración; no sujetar ni introducir objetos en la boca. En custodia, vigilar conciencia y respiración y comunicar deterioro; este curso no enseña técnicas de reducción.\n\nConvulsión y deterioro en custodia: Protegé de golpes durante una convulsión; no sujetes a la persona ni introduzcas objetos en su boca. Observá duración, respiración y recuperación. La agitación o somnolencia no excluyen una urgencia médica.\n\nPara recordar: Mantener distancia segura, desescalar y pedir apoyo sanitario. Vigilar especialmente cambios de conciencia y respiración.\n\nCaso guiado: Persona en custodia pasa de agitada a somnolienta: reevaluar respiración y pedir asistencia urgente.",
      "questions": [
        {
          "id": "rtpp-8-1",
          "prompt": "Persona confusa con olor a alcohol. ¿Qué conclusión es correcta?",
          "options": [
            "El olor descarta trauma",
            "No necesita evaluación sanitaria",
            "La confusión prueba mala conducta",
            "El alcohol descarta hipoglucemia",
            "Puede coexistir una emergencia médica"
          ],
          "answer": 4,
          "why": "No debe cerrarse la evaluación por una apariencia.",
          "skill": "Confusión, convulsiones y persona agitada",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-8-2",
          "prompt": "Durante una convulsión, ¿qué hacés?",
          "options": [
            "Proteger de golpes y observar duración",
            "Introducir una cuchara en la boca",
            "Sujetar extremidades con fuerza",
            "Atribuir la confusión al consumo referido sin evaluar otras causas",
            "Sentarla a la fuerza"
          ],
          "answer": 0,
          "why": "Se evita lesión sin sujetar ni colocar objetos en la boca.",
          "skill": "Confusión, convulsiones y persona agitada",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-8-3",
          "prompt": "Después de convulsionar no responde ni respira normalmente. ¿Qué corresponde?",
          "options": [
            "Asumir sueño poscrítico normal",
            "Activar respuesta al paro e iniciar RCP según capacitación",
            "Atribuir la confusión al consumo referido sin evaluar otras causas",
            "Dar bebida azucarada",
            "Hacerla caminar"
          ],
          "answer": 1,
          "why": "La respiración no normal exige evaluar respuesta al paro.",
          "skill": "Confusión, convulsiones y persona agitada",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-8-4",
          "prompt": "Persona bajo custodia pasa de agitada a muy somnolienta. ¿Qué hacés?",
          "options": [
            "Asumir que ya se calmó",
            "Dejarla sin vigilancia",
            "Evaluar respiración y pedir asistencia urgente",
            "Interpretarlo como cooperación",
            "Demorar aviso hasta el relevo"
          ],
          "answer": 2,
          "why": "El cambio puede indicar deterioro médico.",
          "skill": "Confusión, convulsiones y persona agitada",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-8-5",
          "prompt": "¿Qué actitud facilita un contacto seguro con persona agitada?",
          "options": [
            "Confrontarla para obtener diagnóstico",
            "Rodearla todos a la vez",
            "Practicar reducción como ejercicio sanitario",
            "Distancia segura, calma y pedido de apoyo",
            "Ignorar riesgos de la escena"
          ],
          "answer": 3,
          "why": "La contención verbal no reemplaza seguridad ni evaluación sanitaria.",
          "skill": "Confusión, convulsiones y persona agitada",
          "source": "police-first-aid"
        }
      ],
      "simulation": {
        "required": false,
        "scenario": "Caso grupal: aparente alcoholización con confusión y luego somnolencia. Un integrante conversa sin confrontar, otro representa a la persona y otro observa respiración y avisa. Sin sujeciones ni presión sobre cuello, tórax o espalda.",
        "roles": [
          "Respondiente: evalúa y verbaliza las acciones.",
          "Víctima o testigo: representa solo los datos del caso.",
          "Observador/enlace: usa la lista y comunica al hospital."
        ],
        "rotation": "Rotar hasta que cada participante complete los tres roles. En estaciones obligatorias: 3 minutos por rol y devolución breve; en microcasos, 1 minuto por rol.",
        "checklist": [
          "Reconoce riesgos y pide ayuda.",
          "Identifica la prioridad del módulo.",
          "Evita maniobras peligrosas.",
          "Comunica hallazgos, intervención y evolución."
        ],
        "validation": "La actividad no se acredita por leerla. Solicitá validación desde Mis prácticas en la capacitación; tu instructor registra la observación."
      }
    },
    {
      "id": "rtpp-9",
      "title": "Atragantamiento y otras urgencias de reconocimiento",
      "area": "Atragantamiento y otras urgencias de reconocimiento",
      "minutes": 6,
      "source": "police-bls",
      "objective": "Reconocer prioridades, actuar dentro del entrenamiento y comunicar hallazgos.",
      "body": "Reconocer obstrucción grave cuando no puede hablar, toser eficazmente o respirar; pedir ayuda y aplicar la secuencia vigente según entrenamiento. Si pierde respuesta, iniciar secuencia de RCP; no realizar barrido ciego. Dificultad respiratoria, reacción alérgica grave o confusión tras exposición a calor requieren ayuda urgente. En golpe de calor iniciar enfriamiento seguro mientras llega ayuda.\n\nAtragantamiento, anafilaxia y calor: La incapacidad de hablar o toser eficazmente sugiere obstrucción grave. Pedí ayuda y seguí el algoritmo vigente según capacitación; evitá barridos ciegos. Dificultad respiratoria con ronchas o confusión tras calor requieren respuesta urgente.\n\nPara recordar: No practicar golpes ni compresiones abdominales reales sobre compañeros.\n\nCaso guiado: Persona confusa tras operativo bajo calor: solicitar emergencias e iniciar enfriamiento seguro.",
      "questions": [
        {
          "id": "rtpp-9-1",
          "prompt": "Al comer no puede hablar ni toser eficazmente. ¿Qué sospechás?",
          "options": [
            "Obstrucción grave de vía aérea",
            "Tos eficaz que no requiere vigilancia",
            "Infarto confirmado",
            "Fractura costal segura",
            "Esperar una evaluación completa antes de activar asistencia"
          ],
          "answer": 0,
          "why": "La imposibilidad de hablar o toser eficazmente indica gravedad.",
          "skill": "Atragantamiento y otras urgencias de reconocimiento",
          "source": "police-bls"
        },
        {
          "id": "rtpp-9-2",
          "prompt": "¿Qué evitás al revisar la boca en una obstrucción?",
          "options": [
            "Pedir ayuda",
            "Barrido ciego con los dedos",
            "Observar respuesta",
            "Reconocer respiración anormal",
            "Seguir entrenamiento vigente"
          ],
          "answer": 1,
          "why": "El barrido ciego puede empujar el objeto.",
          "skill": "Atragantamiento y otras urgencias de reconocimiento",
          "source": "police-bls"
        },
        {
          "id": "rtpp-9-3",
          "prompt": "Tras exposición a calor aparece confusión intensa. ¿Qué corresponde?",
          "options": [
            "Esperar una evaluación completa antes de activar asistencia",
            "Hacerlo seguir el operativo",
            "Sospechar golpe de calor, pedir ayuda e iniciar enfriamiento seguro",
            "Dar alcohol",
            "Cubrirlo con varias mantas"
          ],
          "answer": 2,
          "why": "El deterioro neurológico con calor requiere respuesta inmediata.",
          "skill": "Atragantamiento y otras urgencias de reconocimiento",
          "source": "police-bls"
        },
        {
          "id": "rtpp-9-4",
          "prompt": "Ronchas y dificultad respiratoria rápidamente progresiva. ¿Qué hacés?",
          "options": [
            "Esperar una evaluación completa antes de activar asistencia",
            "Explorar la boca a ciegas para intentar retirar el cuerpo extraño",
            "Postergar el enfriamiento hasta conocer la temperatura exacta",
            "Solicitar asistencia urgente por posible reacción grave",
            "Considerarlo solo un problema de piel"
          ],
          "answer": 3,
          "why": "La dificultad respiratoria vuelve urgente el cuadro.",
          "skill": "Atragantamiento y otras urgencias de reconocimiento",
          "source": "police-bls"
        },
        {
          "id": "rtpp-9-5",
          "prompt": "En clase, ¿cómo representás maniobras de desobstrucción?",
          "options": [
            "Golpes reales para memorizar",
            "Compresiones abdominales repetidas en todos",
            "Introducir objetos en la boca",
            "Provocar tos con comida",
            "Verbalización y gestos sin fuerza sobre compañeros"
          ],
          "answer": 4,
          "why": "La simulación debe evitar lesiones.",
          "skill": "Atragantamiento y otras urgencias de reconocimiento",
          "source": "police-bls"
        }
      ],
      "simulation": {
        "required": false,
        "scenario": "Microcasos en tríos: persona que no logra hablar al comer y persona confusa tras operativo al sol. Verbalizar respuesta y radio; no aplicar golpes, compresiones abdominales ni medicación sobre compañeros.",
        "roles": [
          "Respondiente: evalúa y verbaliza las acciones.",
          "Víctima o testigo: representa solo los datos del caso.",
          "Observador/enlace: usa la lista y comunica al hospital."
        ],
        "rotation": "Rotar hasta que cada participante complete los tres roles. En estaciones obligatorias: 3 minutos por rol y devolución breve; en microcasos, 1 minuto por rol.",
        "checklist": [
          "Reconoce riesgos y pide ayuda.",
          "Identifica la prioridad del módulo.",
          "Evita maniobras peligrosas.",
          "Comunica hallazgos, intervención y evolución."
        ],
        "validation": "La actividad no se acredita por leerla. Solicitá validación desde Mis prácticas en la capacitación; tu instructor registra la observación."
      }
    },
    {
      "id": "rtpp-10",
      "title": "Comunicación Policía–Hospital y entrega",
      "area": "Comunicación Policía–Hospital y entrega",
      "minutes": 6,
      "source": "police-first-aid",
      "objective": "Reconocer prioridades, actuar dentro del entrenamiento y comunicar hallazgos.",
      "body": "Sustituir “descompensado” por datos observables: ubicación y acceso, riesgos, número de afectados, qué ocurrió y cuándo, respuesta, respiración, sangrado, medidas y evolución. Pedir confirmación de recepción y repetir los datos críticos. Transmitir solo datos necesarios por canales autorizados. En la entrega, comunicar tiempos, cambios y pendientes; no inventar signos vitales no medidos.\n\nEntrega estructurada al hospital: Comunicá datos observables, no diagnósticos inventados: ubicación, mecanismo, hora, respuesta, respiración, sangrado, intervenciones y evolución. Confirmá que el receptor recibió los datos críticos.\n\nPara recordar: Si no mediste un signo vital, decí que no fue medido. Actualizá cualquier deterioro.\n\nCaso guiado: Ensayá un pase radial de 30 a 45 segundos y pedí confirmación de recepción.",
      "questions": [
        {
          "id": "rtpp-10-1",
          "prompt": "¿Qué aviso resulta más útil que “está descompensado”?",
          "options": [
            "Está mal como siempre",
            "No responde, respira con jadeos, ubicación precisa y ayuda solicitada",
            "Tiene algo médico",
            "Necesita que lo vean cuando puedan",
            "Parece un caso difícil"
          ],
          "answer": 1,
          "why": "Los hallazgos concretos permiten preparar recursos.",
          "skill": "Comunicación Policía–Hospital y entrega",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-10-2",
          "prompt": "No mediste la presión. ¿Qué transmitís?",
          "options": [
            "Una cifra estimada como real",
            "Presión normal por estar despierto",
            "Signos observados y que no se midió presión",
            "Hipotensión confirmada por intuición",
            "Enviar primero una interpretación diagnóstica sin datos observables"
          ],
          "answer": 2,
          "why": "Se distingue observación de medición para evitar información falsa.",
          "skill": "Comunicación Policía–Hospital y entrega",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-10-3",
          "prompt": "El hospital recibe tu aviso. ¿Cómo cerrás la comunicación?",
          "options": [
            "Cortar antes de la respuesta",
            "Repetir solo tu nombre",
            "Cambiar la ubicación sin aclarar",
            "Confirmar recepción y datos críticos",
            "Suponer recepción aunque haya interferencia"
          ],
          "answer": 3,
          "why": "La confirmación reduce errores de comunicación.",
          "skill": "Comunicación Policía–Hospital y entrega",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-10-4",
          "prompt": "Mientras llega la ambulancia deja de responder. ¿Qué hacés con el aviso?",
          "options": [
            "Mantener el aviso inicial",
            "Enviar primero una interpretación diagnóstica sin datos observables",
            "Informar solo al terminar papeles",
            "Borrar el registro anterior",
            "Actualizar de inmediato junto con la respuesta asistencial"
          ],
          "answer": 4,
          "why": "El receptor necesita conocer el deterioro.",
          "skill": "Comunicación Policía–Hospital y entrega",
          "source": "police-first-aid"
        },
        {
          "id": "rtpp-10-5",
          "prompt": "Al entregar un paciente con sangrado controlado, ¿qué informás?",
          "options": [
            "Mecanismo, hallazgos, medidas, hora y evolución",
            "Enviar primero una interpretación diagnóstica sin datos observables",
            "Estimar cifras no medidas para completar el reporte",
            "Dar por recibido el aviso sin confirmación radial",
            "Esperar el traslado para comunicar un deterioro nuevo"
          ],
          "answer": 0,
          "why": "La entrega debe permitir continuidad del cuidado.",
          "skill": "Comunicación Policía–Hospital y entrega",
          "source": "police-first-aid"
        }
      ],
      "simulation": {
        "required": false,
        "scenario": "Cierre integrador: un agente transmite, otro representa al hospital y otro observa. Dar aviso inicial de 30–45 segundos, recibir confirmación y actualizar ante deterioro. Ese tiempo corresponde al mensaje, no a toda la práctica. Rotar los tres roles.",
        "roles": [
          "Respondiente: evalúa y verbaliza las acciones.",
          "Víctima o testigo: representa solo los datos del caso.",
          "Observador/enlace: usa la lista y comunica al hospital."
        ],
        "rotation": "Rotar hasta que cada participante complete los tres roles. En estaciones obligatorias: 3 minutos por rol y devolución breve; en microcasos, 1 minuto por rol.",
        "checklist": [
          "Reconoce riesgos y pide ayuda.",
          "Identifica la prioridad del módulo.",
          "Evita maniobras peligrosas.",
          "Comunica hallazgos, intervención y evolución."
        ],
        "validation": "La actividad no se acredita por leerla. Solicitá validación desde Mis prácticas en la capacitación; tu instructor registra la observación."
      }
    }
  ]
};
