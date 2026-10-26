import {expandedEmergencyCourses,expandedEmergencySources} from './content/emergentologia-ampliada.mjs';
import {emergencyCourses,emergencySources} from './content/emergentologia.mjs';
import {communicationSources,reviseCommunication} from './content/communication-revisions.mjs';
import {guardiaCourses,guardiaSources} from './content/guardia.mjs';
import {expandTheory} from './content/theory-expansion.mjs';
import {reviseQuestions} from './content/editorial-revisions.mjs';
import {improveQuestions} from './content/distractors.mjs';
import {neonatalCourse,obstetricCourse,perinatalSources} from './content/perinatal.mjs';
import {revalidaCourse,revalidaSources} from './content/revalida.mjs';
import {residencyCourse,residencySources} from './content/residencias.mjs';
import {phtlsCourse,atlsCourse,traumaSources} from './content/trauma.mjs';
// Original educational content. Sources verified 2026-10-16; instructor validation pending.
export const sources = {
  "bls": {
    "title": "AHA 2025 · Soporte vital básico adulto",
    "url": "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support"
  },
  "arrest": {
    "title": "AHA 2025 · Algoritmo de paro adulto",
    "url": "https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Accessible/Algorithm-ACLS-CA-LngDscrp-250725-Ed.pdf?sc_lang=en"
  },
  "als": {
    "title": "AHA 2025 · Soporte vital avanzado adulto",
    "url": "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-advanced-life-support"
  },
  "tachy": {
    "title": "AHA 2025 · Taquiarritmia con pulso",
    "url": "https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Accessible/Algorithm-ACLS-Tachyarrhythmia-LngDscrp-250726-Ed.pdf?sc_lang=en"
  },
  "brady": {
    "title": "AHA 2025 · Bradicardia con pulso",
    "url": "https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Accessible/Algorithm-ACLS-Bradycardia-LngDscrp-250725-Ed.pdf?sc_lang=en"
  },
  "post": {
    "title": "AHA 2025 · Cuidados posparo adulto",
    "url": "https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Accessible/Algorithm-ACLS-PCAC-LngDscrp-250726-Ed.pdf?sc_lang=en"
  },
  "pbls": {
    "title": "AHA/AAP 2025 · Soporte vital básico pediátrico",
    "url": "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/pediatric-basic-life-support"
  },
  "pals": {
    "title": "AHA/AAP 2025 · Soporte vital avanzado pediátrico",
    "url": "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/pediatric-advanced-life-support"
  },
  "parrest": {
    "title": "AHA/AAP 2025 · Paro pediátrico",
    "url": "https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Accessible/Algorithm-PALS-CA-LngDscrp-250729-Ed.pdf?sc_lang=en"
  },
  "pbrady": {
    "title": "AHA/AAP 2025 · Bradicardia pediátrica",
    "url": "https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Accessible/Algorithm-PALS-Bradycardia-LngDscrp-250729-Ed.pdf?sc_lang=en"
  },
  "ptachy": {
    "title": "AHA/AAP 2025 · Taquiarritmia pediátrica",
    "url": "https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Accessible/Algorithm-PALS-Tachyarrhythmia-LngDscrp-250729-Ed.pdf?sc_lang=en"
  },
  "abcde": {
    "title": "Resuscitation Council UK · ABCDE (2024)",
    "url": "https://www.resus.org.uk/library/abcde-approach"
  },
  "sepsis": {
    "title": "SCCM/ESICM · Surviving Sepsis Campaign 2026",
    "url": "https://sccm.org/survivingsepsiscampaign/guidelines-and-resources/surviving-sepsis-campaign-adult-guidelines"
  },
  "ards": {
    "title": "ATS/ESICM/SCCM · Ventilación protectora en SDRA",
    "url": "https://www.thoracic.org/statements/resources/cc/ards-guidelines.pdf"
  },
  "fccs": {
    "title": "SCCM · Fundamental Critical Care Support",
    "url": "https://www.sccm.org/education-center/educational-programming/fundamentals/fundamental-critical-care-support"
  }
};
export const courses = [
  {
    "id": "acls",
    "title": "ACLS",
    "category": "salud",
    "summary": "Ritmos, decisiones y cuidados después del paro.",
    "lessons": [
      {
        "title": "Reconocer el paro",
        "minutes": 3,
        "source": "bls",
        "body": "En un adulto inconsciente con respiración ausente o agónica, el profesional comprueba el pulso durante no más de 10 segundos. Sin pulso definido, activa ayuda e inicia RCP. El jadeo no equivale a respiración normal. Con pulso y apnea, sostené la ventilación y reevaluá.",
        "questions": [
          {
            "id": "recognize",
            "prompt": "Adulto inconsciente, jadeo y sin pulso definido. ¿Qué priorizás?",
            "options": [
              "Activar ayuda e iniciar RCP",
              "Esperar el ECG de 12 derivaciones",
              "Observar cinco minutos"
            ],
            "answer": 0,
            "why": "El jadeo puede acompañar al paro; no retrases las compresiones.",
            "skill": "reconocimiento",
            "source": "bls"
          },
          {
            "id": "pulse",
            "prompt": "¿Cuánto puede durar la comprobación inicial del pulso?",
            "options": [
              "Hasta 10 segundos",
              "Un minuto",
              "Hasta obtener certeza absoluta"
            ],
            "answer": 0,
            "why": "Una comprobación prolongada demora la RCP.",
            "skill": "reconocimiento",
            "source": "bls"
          },
          {
            "id": "apnea",
            "prompt": "Adulto con pulso definido y apnea. ¿Qué priorizás?",
            "options": [
              "Ventilación de rescate y reevaluación",
              "Descarga inmediata",
              "Compresiones por la apnea aislada"
            ],
            "answer": 0,
            "why": "El pulso presente orienta a sostener la ventilación y vigilar evolución.",
            "skill": "reconocimiento",
            "source": "bls"
          }
        ],
        "id": "acls-1",
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      },
      {
        "title": "RCP de calidad",
        "minutes": 3,
        "source": "bls",
        "body": "En adultos, comprimí a 100–120 por minuto, con profundidad de al menos 5 cm y sin superar 6 cm. Permití el retroceso completo y reducí las interrupciones. Sin vía aérea avanzada, usá una relación 30:2.",
        "questions": [
          {
            "id": "rate",
            "prompt": "Frecuencia de compresiones en adulto:",
            "options": [
              "60–80/min",
              "100–120/min",
              "160–180/min"
            ],
            "answer": 1,
            "why": "La frecuencia y la profundidad deben cuidarse juntas.",
            "skill": "rcp",
            "source": "bls"
          },
          {
            "id": "recoil",
            "prompt": "¿Qué favorece una RCP de calidad?",
            "options": [
              "Apoyarse continuamente en el tórax",
              "Permitir retroceso completo",
              "Interrumpir para cada medición de presión"
            ],
            "answer": 1,
            "why": "El retroceso completo evita mantener el tórax comprimido.",
            "skill": "rcp",
            "source": "bls"
          },
          {
            "id": "ratio",
            "prompt": "Dos profesionales realizan RCP adulta sin vía aérea avanzada. ¿Qué relación corresponde?",
            "options": [
              "15:2",
              "30:2",
              "Compresiones sin ninguna ventilación"
            ],
            "answer": 1,
            "why": "En este contexto adulto se mantiene 30:2.",
            "skill": "rcp",
            "source": "bls"
          }
        ],
        "id": "acls-2",
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      },
      {
        "title": "Ritmos de paro",
        "minutes": 4,
        "source": "als",
        "body": "La fibrilación ventricular y la taquicardia ventricular sin pulso requieren desfibrilación. La asistolia y la actividad eléctrica sin pulso requieren otro recorrido. El trazado aislado no demuestra circulación: integrá la evaluación clínica.",
        "questions": [
          {
            "id": "shock",
            "prompt": "¿Qué ritmo es desfibrilable en un paro?",
            "options": [
              "Asistolia",
              "Fibrilación ventricular",
              "Actividad eléctrica sin pulso"
            ],
            "answer": 1,
            "why": "La FV pertenece a la rama desfibrilable.",
            "skill": "ritmos",
            "source": "als"
          },
          {
            "id": "pea",
            "prompt": "Hay actividad organizada en el monitor, pero no hay pulso. ¿Cómo lo clasificás?",
            "options": [
              "Ritmo sinusal con perfusión asegurada",
              "AESP",
              "Fibrilación ventricular"
            ],
            "answer": 1,
            "why": "Actividad eléctrica no garantiza una contracción con perfusión.",
            "skill": "ritmos",
            "source": "als"
          },
          {
            "id": "ecg-vt",
            "prompt": "Adulto inconsciente, sin pulso. Observá la tira. ¿Qué rama corresponde?",
            "options": [
              "No desfibrilable",
              "Desfibrilación y RCP",
              "Cardioversión sincronizada"
            ],
            "answer": 1,
            "why": "El patrón ancho y rápido es compatible con TV; sin pulso, se desfibrila.",
            "skill": "ritmos",
            "rhythm": "vt",
            "source": "als"
          }
        ],
        "id": "acls-3",
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      },
      {
        "title": "Secuencia de reanimación",
        "minutes": 4,
        "source": "arrest",
        "body": "Después de una descarga, reanudá RCP durante dos minutos antes del siguiente análisis programado. En asistolia/AESP, administrá adrenalina lo antes posible y buscá causas reversibles. Reevaluá el ritmo en los ciclos previstos.",
        "questions": [
          {
            "id": "aftershock",
            "prompt": "Tras una descarga por FV, ¿qué sigue?",
            "options": [
              "Reanudar RCP",
              "Esperar un minuto sin tocar",
              "Tomar presión antes de comprimir"
            ],
            "answer": 0,
            "why": "La descarga no sustituye las compresiones.",
            "skill": "secuencia",
            "source": "arrest"
          },
          {
            "id": "nonshock",
            "prompt": "En asistolia confirmada, ¿qué evitás?",
            "options": [
              "RCP",
              "Descarga eléctrica",
              "Buscar causas reversibles"
            ],
            "answer": 1,
            "why": "La asistolia no es un ritmo desfibrilable.",
            "skill": "secuencia",
            "source": "arrest"
          },
          {
            "id": "ecg-flat",
            "prompt": "Sin pulso. Electrodos conectados; el patrón se confirma en otra derivación. ¿Qué evitás?",
            "options": [
              "RCP",
              "Adrenalina según el algoritmo",
              "Desfibrilación"
            ],
            "answer": 2,
            "why": "La asistolia confirmada no se trata con descarga.",
            "skill": "secuencia",
            "rhythm": "asystole",
            "source": "arrest"
          }
        ],
        "id": "acls-4",
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      },
      {
        "title": "Taquiarritmia con pulso",
        "minutes": 4,
        "source": "tachy",
        "body": "Valorá si la taquiarritmia causa hipotensión, alteración mental aguda, shock, dolor isquémico o insuficiencia cardíaca aguda. Ante inestabilidad atribuible al ritmo, la rama del algoritmo conduce a cardioversión sincronizada.",
        "questions": [
          {
            "id": "unstable",
            "prompt": "Taquicardia regular con pulso, hipotensión y shock atribuible al ritmo. ¿Qué rama corresponde?",
            "options": [
              "Observación sin intervención",
              "Cardioversión sincronizada",
              "Tratar como asistolia"
            ],
            "answer": 1,
            "why": "La estabilidad clínica orienta la conducta.",
            "skill": "estabilidad",
            "source": "tachy"
          },
          {
            "id": "stable",
            "prompt": "Antes de elegir el tratamiento de una taquiarritmia con pulso, ¿qué evaluás?",
            "options": [
              "Solo la frecuencia",
              "Estabilidad y características del ritmo",
              "Solo la edad"
            ],
            "answer": 1,
            "why": "Un número aislado no alcanza para elegir la rama.",
            "skill": "estabilidad",
            "source": "tachy"
          },
          {
            "id": "ecg-svt",
            "prompt": "Adulto con pulso, ritmo regular estrecho y perfusión conservada. ¿Qué dato cambia la prioridad?",
            "options": [
              "Hipotensión atribuible al ritmo",
              "El color de los electrodos",
              "La hora del día"
            ],
            "answer": 0,
            "why": "El deterioro hemodinámico modifica la rama terapéutica.",
            "skill": "estabilidad",
            "rhythm": "svt",
            "source": "tachy"
          }
        ],
        "id": "acls-5",
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      },
      {
        "title": "Bradicardia y perfusión",
        "minutes": 4,
        "source": "brady",
        "body": "Una bradicardia se interpreta junto con la perfusión. Con compromiso cardiopulmonar persistente, el algoritmo incluye atropina; si es ineficaz, estimulación transcutánea y/o infusiones, con apoyo experto. Sin compromiso, observá y buscá la causa.",
        "questions": [
          {
            "id": "brady",
            "prompt": "Bradicardia sin compromiso cardiopulmonar. ¿Qué corresponde?",
            "options": [
              "Desfibrilación inmediata",
              "Evaluar causas y observar",
              "RCP automática por la frecuencia"
            ],
            "answer": 1,
            "why": "La frecuencia baja por sí sola no demuestra inestabilidad.",
            "skill": "estabilidad",
            "source": "brady"
          },
          {
            "id": "pacing",
            "prompt": "Persiste el compromiso pese a atropina. ¿Qué contempla el algoritmo?",
            "options": [
              "Estimulación transcutánea y/o infusiones",
              "Esperar sin monitorización",
              "Descarga no sincronizada de rutina"
            ],
            "answer": 0,
            "why": "El soporte y la consulta experta acompañan la escalada.",
            "skill": "estabilidad",
            "source": "brady"
          },
          {
            "id": "ecg-brady",
            "prompt": "Adulto con pulso, 40/min, lúcido y normotenso. ¿Qué evaluás primero?",
            "options": [
              "Necesidad automática de RCP",
              "Causas y repercusión clínica",
              "Desfibrilación obligatoria"
            ],
            "answer": 1,
            "why": "Una frecuencia baja sin compromiso no equivale a paro.",
            "skill": "estabilidad",
            "rhythm": "brady",
            "source": "brady"
          }
        ],
        "id": "acls-6",
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      },
      {
        "id": "acls-7",
        "title": "ECG: del trazado a la decisión",
        "minutes": 4,
        "source": "als",
        "body": "Leé organización, frecuencia y anchura. Después integrá pulso y perfusión. Una tira organizada puede acompañar AESP; la misma TV cambia de rama según exista pulso.",
        "questions": [
          {
            "id": "ecg-fv",
            "prompt": "Paciente sin pulso. ¿Qué patrón muestra la tira?",
            "options": [
              "Fibrilación ventricular",
              "Ritmo sinusal",
              "Asistolia"
            ],
            "answer": 0,
            "why": "No se reconocen complejos ventriculares organizados.",
            "skill": "ritmos",
            "rhythm": "vf",
            "source": "als"
          },
          {
            "id": "ecg-pea",
            "prompt": "Adulto inconsciente sin pulso palpable. ¿Qué representa este contexto?",
            "options": [
              "Recuperación confirmada",
              "AESP",
              "FV"
            ],
            "answer": 1,
            "why": "La actividad organizada no demuestra perfusión.",
            "skill": "ritmos",
            "rhythm": "sinus",
            "source": "als"
          },
          {
            "id": "ecg-vt-pulse",
            "prompt": "TV monomórfica con pulso, presión 70/40 y confusión atribuibles al ritmo. ¿Qué intervención eléctrica corresponde?",
            "options": [
              "Cardioversión sincronizada",
              "Descarga solo cuando pierda el pulso",
              "Ninguna porque tiene pulso"
            ],
            "answer": 0,
            "why": "La TV monomórfica inestable con pulso requiere sincronización.",
            "skill": "estabilidad",
            "rhythm": "vt",
            "source": "tachy"
          }
        ],
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      },
      {
        "id": "acls-8",
        "title": "Después de recuperar circulación",
        "minutes": 4,
        "source": "post",
        "body": "Tras ROSC, estabilizá oxigenación, ventilación y presión; obtené ECG de 12 derivaciones y tratá la causa. La evaluación neurológica pronóstica es diferida y multimodal.",
        "questions": [
          {
            "id": "rosc-oxygen",
            "prompt": "ROSC con SpO₂ fiable. Según el algoritmo AHA 2025, ¿qué rango se busca?",
            "options": [
              "90–98%",
              "80–85%",
              "100% a cualquier costo"
            ],
            "answer": 0,
            "why": "La medición fiable permite titular oxígeno.",
            "skill": "posparo",
            "source": "post"
          },
          {
            "id": "rosc-map",
            "prompt": "Después de ROSC, ¿qué objetivo mínimo de presión arterial media indica el algoritmo?",
            "options": [
              "45 mmHg",
              "65 mmHg",
              "100 mmHg en todos"
            ],
            "answer": 1,
            "why": "La estabilización hemodinámica sigue después del retorno del pulso.",
            "skill": "posparo",
            "source": "post"
          },
          {
            "id": "rosc-prognosis",
            "prompt": "Paciente comatoso inmediatamente después de ROSC y sedado. ¿Qué conclusión corresponde?",
            "options": [
              "Pronóstico definitivo por el examen inicial",
              "Esperar evaluación diferida y multimodal",
              "Descartar efecto de la sedación"
            ],
            "answer": 1,
            "why": "El examen precoz aislado puede estar confundido.",
            "skill": "posparo",
            "source": "post"
          }
        ],
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      }
    ],
    "subtitle": "Reanimación del adulto",
    "audience": "ADULTO",
    "scope": "Trayecto introductorio de práctica independiente. No equivale al curso oficial ni otorga certificación.",
    "reviewStatus": "Pendiente de validación docente"
  },
  {
    "id": "pals",
    "title": "PALS",
    "subtitle": "Emergencias pediátricas",
    "summary": "Respiración, perfusión, ritmos y cálculos por peso.",
    "audience": "PEDIATRÍA",
    "category": "salud",
    "lessons": [
      {
        "id": "pals-1",
        "title": "Reconocer el deterioro",
        "minutes": 4,
        "source": "pals",
        "body": "En pediatría, la insuficiencia respiratoria y el shock suelen preceder al paro. Detectá el deterioro y reevaluá la respuesta a cada intervención.",
        "questions": [
          {
            "id": "p-deterioration",
            "prompt": "Niño con dificultad respiratoria que se vuelve somnoliento. ¿Cómo interpretás el cambio?",
            "options": [
              "Mejoría porque se mueve menos",
              "Deterioro que exige intervención",
              "Cansancio siempre benigno"
            ],
            "answer": 1,
            "why": "La menor respuesta puede anunciar agotamiento.",
            "skill": "reconocimiento",
            "source": "pals"
          },
          {
            "id": "p-pulse",
            "prompt": "Niño inconsciente, respiración anormal, pulso no definido tras 10 segundos. ¿Qué sigue?",
            "options": [
              "Iniciar RCP y activar ayuda",
              "Esperar radiografía",
              "Observar hasta que desaparezca todo movimiento"
            ],
            "answer": 0,
            "why": "No prolongues la comprobación de pulso.",
            "skill": "reconocimiento",
            "source": "pbls"
          },
          {
            "id": "p-newborn",
            "prompt": "Recién nacido durante la transición al nacimiento. ¿Qué marco corresponde?",
            "options": [
              "Reanimación neonatal",
              "Aplicar sin adaptación el curso adulto",
              "PALS como único protocolo"
            ],
            "answer": 0,
            "why": "La transición al nacimiento tiene un marco neonatal específico.",
            "skill": "reconocimiento",
            "source": "pals"
          }
        ],
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      },
      {
        "id": "pals-2",
        "title": "Ventilación con pulso",
        "minutes": 4,
        "source": "pbls",
        "body": "Con pulso y esfuerzo respiratorio inadecuado, proporcioná ventilación. En lactantes y niños se orienta a 20–30 ventilaciones/min, comprobando expansión torácica.",
        "questions": [
          {
            "id": "p-breaths",
            "prompt": "Niño con pulso y apnea. ¿Qué frecuencia de ventilación corresponde?",
            "options": [
              "6/min",
              "20–30/min",
              "60/min"
            ],
            "answer": 1,
            "why": "Equivale aproximadamente a una ventilación cada 2–3 segundos.",
            "skill": "ventilación",
            "source": "pbls"
          },
          {
            "id": "p-chest",
            "prompt": "No se eleva el tórax al ventilar con bolsa y máscara. ¿Qué hacés?",
            "options": [
              "Revisar posición, apertura y sellado",
              "Mantener la técnica sin cambios",
              "Desfibrilar por la falta de expansión"
            ],
            "answer": 0,
            "why": "Verificá que la ventilación sea efectiva.",
            "skill": "ventilación",
            "source": "pbls"
          },
          {
            "id": "p-airway",
            "prompt": "Niño con pulso, respiraciones ineficaces y cianosis. ¿Qué priorizás?",
            "options": [
              "Apoyo de vía aérea y ventilación",
              "Compresiones solo por la cianosis",
              "Esperar una gasometría para actuar"
            ],
            "answer": 0,
            "why": "El soporte respiratorio no debe esperar estudios.",
            "skill": "ventilación",
            "source": "pbls"
          }
        ],
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      },
      {
        "id": "pals-3",
        "title": "RCP pediátrica",
        "minutes": 4,
        "source": "parrest",
        "body": "En prepuberales, dos reanimadores usan 15:2; uno usa 30:2. Comprimí a 100–120/min y al menos un tercio del diámetro anteroposterior.",
        "questions": [
          {
            "id": "p-ratio-two",
            "prompt": "Niño prepuberal, dos reanimadores, sin vía avanzada. ¿Qué relación usás?",
            "options": [
              "30:1",
              "15:2",
              "5:1"
            ],
            "answer": 1,
            "why": "El contexto de dos reanimadores pediátricos define 15:2.",
            "skill": "rcp",
            "source": "parrest"
          },
          {
            "id": "p-ratio-one",
            "prompt": "Un solo reanimador, niño prepuberal sin vía avanzada. ¿Qué relación corresponde?",
            "options": [
              "30:2",
              "15:1",
              "Compresiones sin ventilación como primera opción"
            ],
            "answer": 0,
            "why": "Con un reanimador se usa 30:2.",
            "skill": "rcp",
            "source": "parrest"
          },
          {
            "id": "p-depth",
            "prompt": "La profundidad pediátrica se orienta a:",
            "options": [
              "Un tercio del diámetro anteroposterior",
              "Un centímetro en cualquier edad",
              "La mitad del tórax siempre"
            ],
            "answer": 0,
            "why": "La referencia anatómica adapta la profundidad al tamaño.",
            "skill": "rcp",
            "source": "parrest"
          }
        ],
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      },
      {
        "id": "pals-4",
        "title": "Bradicardia con compromiso",
        "minutes": 4,
        "source": "pbrady",
        "body": "Asegurá oxigenación y ventilación. Si persisten mala perfusión y frecuencia menor de 60/min pese a soporte respiratorio eficaz, iniciá RCP. La atropina se reserva para indicaciones específicas.",
        "questions": [
          {
            "id": "p-brady-rcp",
            "prompt": "Niño con FC 45/min y mala perfusión que persisten pese a oxigenación y ventilación efectivas. ¿Qué sigue?",
            "options": [
              "Iniciar RCP",
              "Esperar a que desaparezca el pulso",
              "Desfibrilar"
            ],
            "answer": 0,
            "why": "El umbral pediátrico depende también del compromiso persistente.",
            "skill": "estabilidad",
            "rhythm": "brady",
            "source": "pbrady"
          },
          {
            "id": "p-brady-first",
            "prompt": "Niño hipóxico con bradicardia y respiración ineficaz; aún no recibió soporte respiratorio. ¿Qué priorizás?",
            "options": [
              "Ventilación y oxigenación",
              "Atropina como solución de toda bradicardia",
              "Adenosina"
            ],
            "answer": 0,
            "why": "Corregí el componente respiratorio inicial.",
            "skill": "estabilidad",
            "rhythm": "brady",
            "source": "pbrady"
          },
          {
            "id": "p-atropine",
            "prompt": "¿En qué mecanismo contempla atropina el algoritmo pediátrico?",
            "options": [
              "Tono vagal aumentado o bloqueo AV primario",
              "Toda bradicardia hipóxica de forma automática",
              "FV"
            ],
            "answer": 0,
            "why": "No toda bradicardia pediátrica tiene el mismo mecanismo.",
            "skill": "estabilidad",
            "source": "pbrady"
          }
        ],
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      },
      {
        "id": "pals-5",
        "title": "Taquiarritmias pediátricas",
        "minutes": 4,
        "source": "ptachy",
        "body": "Diferenciá taquicardia sinusal de probable TSV por contexto, inicio, ondas P y regularidad; los umbrales de frecuencia orientan, pero no bastan solos.",
        "questions": [
          {
            "id": "p-svt",
            "prompt": "Niño con inicio brusco, 210/min, RR fijo, QRS estrecho y sin P claras. ¿Qué es más probable?",
            "options": [
              "TSV",
              "Taquicardia sinusal fisiológica por definición",
              "Asistolia"
            ],
            "answer": 0,
            "why": "El conjunto favorece TSV.",
            "skill": "ritmos",
            "rhythm": "svt",
            "source": "ptachy"
          },
          {
            "id": "p-sinus",
            "prompt": "Niño febril: comienzo gradual, P visibles y variación de RR. ¿Qué orienta mejor la conducta?",
            "options": [
              "Buscar y tratar la causa",
              "Cardioversión por cualquier taquicardia",
              "Asumir TV por la fiebre"
            ],
            "answer": 0,
            "why": "La taquicardia sinusal exige abordar la causa.",
            "skill": "ritmos",
            "rhythm": "p-sinus",
            "source": "ptachy"
          },
          {
            "id": "p-cardioversion",
            "prompt": "Niño de 20 kg con TSV inestable; se decide cardioversión sincronizada. ¿Qué energía inicial corresponde a 0,5–1 J/kg?",
            "options": [
              "10–20 J",
              "100–200 J",
              "2 J"
            ],
            "answer": 0,
            "why": "20 × 0,5–1 = 10–20 J; la sedación no debe demorar la intervención.",
            "skill": "cálculos",
            "source": "ptachy"
          }
        ],
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      },
      {
        "id": "pals-6",
        "title": "Paro: elegir la rama",
        "minutes": 4,
        "source": "parrest",
        "body": "FV/TV sin pulso se desfibrilan. Asistolia/AESP llevan RCP y adrenalina precoz. Después de cada descarga se retoman las compresiones.",
        "questions": [
          {
            "id": "p-vf",
            "prompt": "Niño sin pulso. Mirá la tira: ¿qué tratamiento eléctrico corresponde?",
            "options": [
              "Desfibrilación",
              "Cardioversión sincronizada",
              "No dar descarga"
            ],
            "answer": 0,
            "why": "El patrón es compatible con FV.",
            "skill": "ritmos",
            "rhythm": "vf",
            "source": "parrest"
          },
          {
            "id": "p-pea",
            "prompt": "Niño sin pulso con actividad organizada. ¿Qué rama corresponde?",
            "options": [
              "No desfibrilable",
              "Desfibrilable por estar organizada",
              "Recuperación de circulación"
            ],
            "answer": 0,
            "why": "AESP no implica perfusión.",
            "skill": "ritmos",
            "rhythm": "sinus",
            "source": "parrest"
          },
          {
            "id": "p-aftershock",
            "prompt": "Tras descargar una FV pediátrica, ¿qué sigue inmediatamente?",
            "options": [
              "RCP",
              "Esperar una presión arterial",
              "Nueva descarga sin ciclo de RCP de rutina"
            ],
            "answer": 0,
            "why": "Retomá las compresiones.",
            "skill": "secuencia",
            "source": "parrest"
          }
        ],
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      },
      {
        "id": "pals-7",
        "title": "Energía y medicación por peso",
        "minutes": 4,
        "source": "parrest",
        "body": "En paro pediátrico: primera descarga 2 J/kg, segunda 4 J/kg. Adrenalina IV/IO: 0,01 mg/kg, máximo 1 mg; verificá concentración y unidades.",
        "questions": [
          {
            "id": "p-first-energy",
            "prompt": "Niño de 15 kg en FV. Primera descarga a 2 J/kg:",
            "options": [
              "15 J",
              "30 J",
              "150 J"
            ],
            "answer": 1,
            "why": "15 × 2 = 30 J.",
            "skill": "cálculos",
            "rhythm": "vf",
            "source": "parrest"
          },
          {
            "id": "p-second-energy",
            "prompt": "Niño de 15 kg, persiste FV. Segunda descarga a 4 J/kg:",
            "options": [
              "60 J",
              "30 J",
              "4 J"
            ],
            "answer": 0,
            "why": "15 × 4 = 60 J.",
            "skill": "cálculos",
            "rhythm": "vf",
            "source": "parrest"
          },
          {
            "id": "p-epi",
            "prompt": "Niño de 10 kg en paro. Adrenalina IV/IO 0,01 mg/kg, solución 0,1 mg/mL. ¿Qué volumen corresponde?",
            "options": [
              "1 mL (0,1 mg)",
              "10 mL (1 mg)",
              "0,1 mL (0,01 mg)"
            ],
            "answer": 0,
            "why": "10 × 0,01 = 0,1 mg; dividido por 0,1 mg/mL = 1 mL.",
            "skill": "cálculos",
            "source": "parrest"
          }
        ],
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      },
      {
        "id": "pals-8",
        "title": "Recuperación y reevaluación",
        "minutes": 4,
        "source": "pals",
        "body": "Después del paro, vigilá presión, oxigenación y temperatura. Evitá hipertermia y evaluá el pronóstico con varias modalidades y momentos, no con un dato aislado.",
        "questions": [
          {
            "id": "p-fever",
            "prompt": "Niño comatoso después de ROSC, temperatura central 38,2 °C. ¿Qué requiere atención?",
            "options": [
              "La hipertermia",
              "Solo el ECG",
              "Esperar sin monitorizar temperatura"
            ],
            "answer": 0,
            "why": "Evitar temperatura central mayor de 37,5 °C integra el cuidado posparo.",
            "skill": "posparo",
            "source": "pals"
          },
          {
            "id": "p-neuro",
            "prompt": "¿Qué enfoque sirve para pronóstico neurológico pediátrico posparo?",
            "options": [
              "Un test aislado inmediato",
              "Evaluación multimodal en distintos momentos",
              "Solo la duración del traslado"
            ],
            "answer": 1,
            "why": "Un hallazgo aislado puede ser engañoso.",
            "skill": "posparo",
            "source": "pals"
          },
          {
            "id": "p-reassess",
            "prompt": "Mejoró la perfusión tras una intervención. ¿Qué sigue?",
            "options": [
              "Reevaluación seriada",
              "Suspender toda vigilancia",
              "Dar por resuelta la causa"
            ],
            "answer": 0,
            "why": "La mejoría inicial exige seguimiento.",
            "skill": "posparo",
            "source": "pals"
          }
        ],
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      }
    ],
    "scope": "Trayecto introductorio de práctica independiente. No equivale al curso oficial ni otorga certificación.",
    "reviewStatus": "Pendiente de validación docente"
  },
  {
    "id": "fccs",
    "title": "FCCS",
    "subtitle": "Fundamentos del paciente crítico",
    "summary": "Evaluación inicial, soporte respiratorio, shock y comunicación.",
    "audience": "CUIDADOS CRÍTICOS",
    "category": "salud",
    "lessons": [
      {
        "id": "fccs-1",
        "title": "Evaluación inicial del paciente crítico",
        "minutes": 4,
        "source": "abcde",
        "body": "El ABCDE ordena prioridades. Tratá amenazas vitales mientras evaluás, pedí ayuda y repetí la valoración tras intervenir.",
        "questions": [
          {
            "id": "f-priority",
            "prompt": "Paciente con obstrucción de vía aérea y estudio abdominal pendiente. ¿Qué priorizás?",
            "options": [
              "Resolver la amenaza de vía aérea",
              "Completar primero la historia digestiva",
              "Trasladarlo al estudio sin intervención"
            ],
            "answer": 0,
            "why": "Una amenaza vital se atiende antes de continuar la secuencia.",
            "skill": "evaluación",
            "source": "abcde"
          },
          {
            "id": "f-response",
            "prompt": "Tras una intervención cambia el estado del paciente. ¿Qué hacés?",
            "options": [
              "Reevaluar ABCDE",
              "Continuar el listado sin revisar",
              "Esperar al próximo turno"
            ],
            "answer": 0,
            "why": "El ABCDE es cíclico.",
            "skill": "evaluación",
            "source": "abcde"
          },
          {
            "id": "f-team",
            "prompt": "Paciente deteriorándose y varias tareas simultáneas. ¿Qué organización ayuda?",
            "options": [
              "Pedir ayuda y asignar tareas claras",
              "Que todos hagan la misma tarea",
              "Postergar la monitorización hasta terminar la entrevista"
            ],
            "answer": 0,
            "why": "Distribuir tareas permite soporte simultáneo.",
            "skill": "evaluación",
            "source": "abcde"
          }
        ],
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      },
      {
        "id": "fccs-2",
        "title": "Vía aérea y ventilación efectiva",
        "minutes": 4,
        "source": "abcde",
        "body": "Comprobá permeabilidad y ventilación. La obstrucción o el esfuerzo ineficaz requieren ayuda temprana; verificá respuesta clínica a las maniobras.",
        "questions": [
          {
            "id": "f-airway",
            "prompt": "Paciente con respiración ruidosa, tiraje y dificultad para hablar. ¿Qué evaluás de inmediato?",
            "options": [
              "Permeabilidad de vía aérea",
              "Solo el balance hídrico de ayer",
              "Solo la temperatura"
            ],
            "answer": 0,
            "why": "Los hallazgos plantean amenaza respiratoria.",
            "skill": "vía aérea",
            "source": "abcde"
          },
          {
            "id": "f-mask",
            "prompt": "Ventilación con bolsa sin elevación torácica. ¿Qué revisás antes de darla por eficaz?",
            "options": [
              "Apertura, sellado y obstrucción",
              "Únicamente el color de la bolsa",
              "Solo la presión arterial"
            ],
            "answer": 0,
            "why": "El equipo conectado no garantiza ventilación.",
            "skill": "vía aérea",
            "source": "abcde"
          },
          {
            "id": "f-help",
            "prompt": "Las maniobras iniciales no mantienen la vía aérea. ¿Qué corresponde?",
            "options": [
              "Solicitar apoyo experto y continuar soporte",
              "Repetir indefinidamente sin ayuda",
              "Dejar de monitorizar para concentrarse"
            ],
            "answer": 0,
            "why": "La dificultad persistente requiere escalada.",
            "skill": "vía aérea",
            "source": "abcde"
          }
        ],
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      },
      {
        "id": "fccs-3",
        "title": "Oxigenación y ventilación no son iguales",
        "minutes": 4,
        "source": "sepsis",
        "body": "Interpretá la oximetría junto con clínica y gasometría. Una saturación conservada con oxígeno no descarta hipoventilación ni hipercapnia.",
        "questions": [
          {
            "id": "f-co2",
            "prompt": "Somnolencia, oxígeno suplementario, SpO₂ 97%, PaCO₂ 70 mmHg. ¿Qué problema sigue presente?",
            "options": [
              "Retención de CO₂",
              "Ventilación normal demostrada por SpO₂",
              "Hipoglucemia demostrada por SpO₂"
            ],
            "answer": 0,
            "why": "La oximetría no mide eliminación de CO₂.",
            "skill": "respiratorio",
            "source": "sepsis"
          },
          {
            "id": "f-fatigue",
            "prompt": "Paciente con gran esfuerzo respiratorio que se agota y reduce su respuesta. ¿Qué hacés?",
            "options": [
              "Reevaluar y escalar soporte",
              "Interpretarlo como mejoría automática",
              "Retirar la vigilancia"
            ],
            "answer": 0,
            "why": "El agotamiento puede preceder al fracaso ventilatorio.",
            "skill": "respiratorio",
            "source": "abcde"
          },
          {
            "id": "f-oximeter",
            "prompt": "Shock con mala señal del oxímetro y lectura inesperada. ¿Qué conducta es mejor?",
            "options": [
              "Integrar clínica y verificar con medición fiable",
              "Tomar el número como certeza absoluta",
              "Excluir hipoxemia sin evaluar"
            ],
            "answer": 0,
            "why": "La señal y el contexto condicionan la interpretación.",
            "skill": "respiratorio",
            "source": "sepsis"
          }
        ],
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      },
      {
        "id": "fccs-4",
        "title": "Ventilación protectora en SDRA",
        "minutes": 4,
        "source": "ards",
        "body": "En SDRA, el volumen corriente se calcula con peso predicho, no con peso real. Se emplean volúmenes bajos y se limita la presión meseta; los ajustes requieren reevaluación.",
        "questions": [
          {
            "id": "f-pbw",
            "prompt": "Paciente con SDRA: peso real 110 kg y predicho 60 kg. Para 6 mL/kg, ¿qué volumen calculás?",
            "options": [
              "660 mL",
              "360 mL",
              "1100 mL"
            ],
            "answer": 1,
            "why": "6 × 60 = 360 mL; se usa peso predicho.",
            "skill": "ventilación mecánica",
            "source": "ards"
          },
          {
            "id": "f-plateau",
            "prompt": "SDRA con presión meseta 34 cmH₂O. ¿Qué corresponde?",
            "options": [
              "Revisar la estrategia protectora",
              "Dar por aceptable cualquier presión",
              "Aumentar volumen corriente de rutina"
            ],
            "answer": 0,
            "why": "La meta protectora limita la meseta alrededor de 30 cmH₂O.",
            "skill": "ventilación mecánica",
            "source": "ards"
          },
          {
            "id": "f-actual",
            "prompt": "¿Qué dato necesitás para estimar peso predicho y volumen protector?",
            "options": [
              "Talla y sexo de la fórmula",
              "Solo el peso de balanza",
              "Solo la edad"
            ],
            "answer": 0,
            "why": "El peso predicho aproxima tamaño pulmonar, no masa corporal actual.",
            "skill": "ventilación mecánica",
            "source": "ards"
          }
        ],
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      },
      {
        "id": "fccs-5",
        "title": "Perfusión y respuesta a fluidos",
        "minutes": 4,
        "source": "sepsis",
        "body": "En shock séptico, usá cristaloides y reevaluación frecuente. Guiá fluidos con respuesta dinámica cuando sea posible; evitá repetirlos a ciegas.",
        "questions": [
          {
            "id": "f-fluids",
            "prompt": "Shock séptico tras fluidos, con nuevos signos de congestión. ¿Qué hacés?",
            "options": [
              "Reevaluar perfusión y tolerancia antes de más volumen",
              "Repetir bolos sin reevaluar",
              "Ignorar la evolución respiratoria"
            ],
            "answer": 0,
            "why": "La respuesta y los daños potenciales importan en cada paso.",
            "skill": "hemodinamia",
            "source": "sepsis"
          },
          {
            "id": "f-dynamic",
            "prompt": "¿Qué evaluación dinámica puede orientar respuesta a volumen?",
            "options": [
              "Cambio de volumen sistólico con elevación pasiva de piernas",
              "Presión venosa central aislada como certeza",
              "Color del envase de suero"
            ],
            "answer": 0,
            "why": "Se busca una respuesta funcional al cambio de precarga.",
            "skill": "hemodinamia",
            "source": "sepsis"
          },
          {
            "id": "f-vasopressor",
            "prompt": "Adulto con shock séptico, hipotensión persistente pese a reanimación inicial. ¿Cuál es el vasopresor de primera línea habitual?",
            "options": [
              "Noradrenalina",
              "Dopamina obligatoria para todos",
              "Adenosina"
            ],
            "answer": 0,
            "why": "La SSC 2026 mantiene noradrenalina como primera línea habitual.",
            "skill": "hemodinamia",
            "source": "sepsis"
          }
        ],
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      },
      {
        "id": "fccs-6",
        "title": "Infección: actuar según la probabilidad",
        "minutes": 4,
        "source": "sepsis",
        "body": "El shock séptico exige antimicrobianos inmediatos, idealmente en una hora. La posible sepsis sin shock admite investigación rápida y acotada. Reevaluá diagnóstico, foco y tratamiento.",
        "questions": [
          {
            "id": "f-antibiotics",
            "prompt": "Adulto con probable shock séptico. ¿Cuándo iniciás antimicrobianos?",
            "options": [
              "De inmediato, idealmente dentro de una hora",
              "Al día siguiente",
              "Solo con cultivo positivo"
            ],
            "answer": 0,
            "why": "El tratamiento no espera confirmación microbiológica.",
            "skill": "sepsis",
            "source": "sepsis"
          },
          {
            "id": "f-possible",
            "prompt": "Posible sepsis sin shock y diagnóstico incierto. ¿Qué propone SSC 2026?",
            "options": [
              "Investigación rápida y acotada; si persiste sospecha, antimicrobianos dentro de tres horas",
              "Antibióticos idénticos para cualquier fiebre",
              "Esperar 24 horas sin reevaluar"
            ],
            "answer": 0,
            "why": "La probabilidad y la presencia de shock orientan la urgencia.",
            "skill": "sepsis",
            "source": "sepsis"
          },
          {
            "id": "f-source",
            "prompt": "Absceso identificado en paciente séptico. Además de antimicrobianos, ¿qué planificás?",
            "options": [
              "Evaluación del control del foco",
              "Ignorar el foco si baja la fiebre",
              "Mantener tratamiento sin reevaluación"
            ],
            "answer": 0,
            "why": "La fuente de infección necesita una estrategia específica.",
            "skill": "sepsis",
            "source": "sepsis"
          }
        ],
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      },
      {
        "id": "fccs-7",
        "title": "Conciencia y causas reversibles",
        "minutes": 4,
        "source": "abcde",
        "body": "Ante alteración de conciencia, revisá ABC, glucemia, pupilas y medicación. Un síntoma neurológico no elimina las causas sistémicas reversibles.",
        "questions": [
          {
            "id": "f-glucose",
            "prompt": "Paciente confuso, diabético y sudoroso. ¿Qué medición rápida es prioritaria junto con ABC?",
            "options": [
              "Glucemia",
              "Colesterol",
              "Vitamina D"
            ],
            "answer": 0,
            "why": "La glucemia detecta una causa reversible inmediata.",
            "skill": "neurológico",
            "source": "abcde"
          },
          {
            "id": "f-hypoxia",
            "prompt": "Somnolencia nueva con hipoxemia e hipotensión. ¿Qué priorizás?",
            "options": [
              "Corregir ABC mientras evaluás neurología",
              "Solo puntuar Glasgow sin soporte",
              "Asumir lesión cerebral irreversible"
            ],
            "answer": 0,
            "why": "La oxigenación y la perfusión condicionan la conciencia.",
            "skill": "neurológico",
            "source": "abcde"
          },
          {
            "id": "f-drugs",
            "prompt": "Disminuye la respuesta después de recibir sedantes. ¿Qué revisás?",
            "options": [
              "Medicaciones y causas reversibles",
              "Solo la edad",
              "Solo el tiempo de internación"
            ],
            "answer": 0,
            "why": "La exposición farmacológica forma parte de la evaluación.",
            "skill": "neurológico",
            "source": "abcde"
          }
        ],
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      },
      {
        "id": "fccs-8",
        "title": "Comunicación y continuidad del cuidado",
        "minutes": 4,
        "source": "abcde",
        "body": "Comunicá situación, antecedentes, evaluación y recomendación. El pase debe incluir intervenciones, respuesta y lo que el equipo receptor necesita resolver.",
        "questions": [
          {
            "id": "f-handoff",
            "prompt": "¿Qué pase facilita continuidad?",
            "options": [
              "Situación, antecedentes, evaluación y recomendación",
              "Solo el nombre del paciente",
              "Un listado sin prioridades ni respuesta"
            ],
            "answer": 0,
            "why": "La estructura ordena información accionable.",
            "skill": "comunicación",
            "source": "abcde"
          },
          {
            "id": "f-change",
            "prompt": "Tras un cambio clínico importante, ¿qué informás al equipo receptor?",
            "options": [
              "Intervención, respuesta y problema pendiente",
              "Únicamente el diagnóstico de ingreso",
              "Nada si ya se hizo un pase"
            ],
            "answer": 0,
            "why": "La continuidad requiere información actualizada.",
            "skill": "comunicación",
            "source": "abcde"
          },
          {
            "id": "f-recheck",
            "prompt": "Después de una maniobra el paciente mejora parcialmente. ¿Qué registrás?",
            "options": [
              "Hallazgos, tratamiento y respuesta",
              "Solo la palabra estable",
              "Nada hasta el alta"
            ],
            "answer": 0,
            "why": "Documentar la evolución permite reevaluar y coordinar.",
            "skill": "comunicación",
            "source": "abcde"
          }
        ],
        "objective": "Aplicar el concepto a un escenario y justificar la decisión."
      }
    ],
    "scope": "Trayecto introductorio de práctica independiente. No equivale al curso oficial ni otorga certificación.",
    "reviewStatus": "Pendiente de validación docente"
  }
];
Object.assign(sources,expandedEmergencySources,emergencySources,communicationSources,guardiaSources,residencySources,traumaSources,revalidaSources,perinatalSources);
courses.unshift(residencyCourse);
courses.push(...expandedEmergencyCourses,...emergencyCourses,...guardiaCourses,phtlsCourse,atlsCourse,revalidaCourse,neonatalCourse,obstetricCourse);
improveQuestions(courses);
reviseQuestions(courses);
reviseCommunication(courses);
expandTheory(courses);
export const catalog=courses;
export const questions=courses.flatMap(c=>c.lessons.flatMap((l,li)=>l.questions.map((q,qi)=>({...q,source:q.source||l.source,courseId:c.id,lessonId:l.id,area:l.area||q.skill,li,qi}))));
