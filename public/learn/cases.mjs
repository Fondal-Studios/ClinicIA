// Original fictional scenarios with recoverable decision branches.
export const cases=[
  {
    "id": "fv",
    "title": "Colapso en la guardia",
    "summary": "Adulto con colapso · decisiones secuenciales",
    "source": "arrest",
    "steps": [
      {
        "text": "Escenario ficticio. Adulto inconsciente, sin respiración normal ni pulso definido. Un compañero activa emergencias.",
        "rhythm": "vf",
        "options": [
          "Iniciar RCP y conectar desfibrilador",
          "Esperar laboratorio"
        ],
        "answer": 0,
        "why": "Primero sostené la circulación y obtené el ritmo.",
        "next": 1,
        "wrong": 0
      },
      {
        "text": "RCP en curso. El desfibrilador está listo y el análisis confirma FV.",
        "rhythm": "vf",
        "options": [
          "Dar descarga con seguridad",
          "Cardioversión sincronizada"
        ],
        "answer": 0,
        "why": "La FV en paro requiere desfibrilación.",
        "next": 2,
        "wrong": 1
      },
      {
        "text": "Se administró una descarga. Elegí el siguiente paso inmediato.",
        "rhythm": "vf",
        "options": [
          "Reanudar RCP por dos minutos",
          "Esperar a que el monitor se normalice"
        ],
        "answer": 0,
        "why": "Volvé a comprimir sin demoras innecesarias.",
        "next": null,
        "wrong": 2
      }
    ],
    "courseId": "acls"
  },
  {
    "id": "aesp",
    "title": "Evaluación junto a la cama",
    "summary": "Integrar clínica y monitor",
    "source": "arrest",
    "steps": [
      {
        "text": "Escenario ficticio. Adulto inconsciente, sin pulso, con actividad organizada en el monitor.",
        "rhythm": "sinus",
        "options": [
          "Clasificar como AESP",
          "Declarar recuperación por el trazado"
        ],
        "answer": 0,
        "why": "La circulación debe confirmarse clínicamente.",
        "next": 1,
        "wrong": 0
      },
      {
        "text": "AESP confirmada. RCP en curso y acceso vascular disponible.",
        "rhythm": "sinus",
        "options": [
          "Adrenalina lo antes posible y RCP",
          "Descarga por actividad organizada"
        ],
        "answer": 0,
        "why": "La AESP pertenece a la rama no desfibrilable.",
        "next": 2,
        "wrong": 1
      },
      {
        "text": "El equipo continúa los ciclos. ¿Qué tarea debe acompañarlos?",
        "rhythm": "sinus",
        "options": [
          "Buscar y tratar causas reversibles",
          "Asumir que toda actividad eléctrica implica perfusión"
        ],
        "answer": 0,
        "why": "El tratamiento de la causa integra la reanimación.",
        "next": null,
        "wrong": 2
      }
    ],
    "courseId": "acls"
  },
  {
    "id": "taqui",
    "title": "Pulso rápido, paciente inestable",
    "summary": "Adulto con palpitaciones y deterioro",
    "source": "tachy",
    "steps": [
      {
        "text": "Escenario ficticio. Taquicardia regular de complejo estrecho, pulso presente, confusión y presión 75/40. El equipo atribuye el deterioro al ritmo.",
        "rhythm": "svt",
        "options": [
          "Reconocer inestabilidad",
          "Clasificar como estable porque tiene pulso"
        ],
        "answer": 0,
        "why": "Tener pulso no equivale a estar estable.",
        "next": 1,
        "wrong": 0
      },
      {
        "text": "Monitorización y soporte inicial en curso. La inestabilidad persiste.",
        "rhythm": "svt",
        "options": [
          "Preparar cardioversión sincronizada",
          "Esperar sin intervenir"
        ],
        "answer": 0,
        "why": "La rama inestable requiere tratamiento eléctrico sincronizado.",
        "next": null,
        "wrong": 1
      }
    ],
    "courseId": "acls"
  },
  {
    "id": "p-respiratory",
    "title": "El niño que se agota",
    "summary": "Respiración y reevaluación",
    "source": "pbls",
    "steps": [
      {
        "text": "Niño con pulso de 100/min, apnea y SpO₂ 78%. ¿Qué priorizás?",
        "options": [
          "Ventilación con bolsa-máscara y oxígeno",
          "Descarga eléctrica",
          "Esperar el laboratorio"
        ],
        "answer": 0,
        "why": "El pulso presente y la apnea requieren soporte respiratorio.",
        "next": 1,
        "wrong": 0
      },
      {
        "text": "La primera ventilación no eleva el tórax. ¿Qué hacés?",
        "options": [
          "Revisar apertura, posición y sellado",
          "Continuar sin cambiar nada",
          "Dar por efectiva la ventilación"
        ],
        "answer": 0,
        "why": "La ventilación debe producir una expansión torácica visible.",
        "next": 2,
        "wrong": 1
      },
      {
        "text": "Ahora hay elevación torácica y mejora la saturación. ¿Qué sigue?",
        "options": [
          "Reevaluar respiración, pulso y perfusión",
          "Retirar toda monitorización",
          "Dar por resuelta la causa"
        ],
        "answer": 0,
        "why": "La respuesta inicial no reemplaza la reevaluación.",
        "next": null,
        "wrong": 2
      }
    ],
    "courseId": "pals"
  },
  {
    "id": "p-slow",
    "title": "Perfusión en descenso",
    "summary": "Niño con deterioro progresivo",
    "source": "pbrady",
    "steps": [
      {
        "text": "Niño con respiración ineficaz, hipoxemia, pulso lento y mala perfusión. Todavía no recibió soporte respiratorio. ¿Qué priorizás?",
        "options": [
          "Vía aérea, oxigenación y ventilación",
          "Adenosina",
          "Esperar pérdida de pulso"
        ],
        "answer": 0,
        "why": "El componente respiratorio debe corregirse inicialmente.",
        "rhythm": "brady",
        "next": 1,
        "wrong": 0
      },
      {
        "text": "Pese a oxigenación y ventilación efectivas, persisten FC 45/min y mala perfusión. ¿Qué agregás?",
        "options": [
          "Compresiones según el algoritmo pediátrico",
          "Esperar que llegue a cero",
          "Descarga no sincronizada"
        ],
        "answer": 0,
        "why": "La bradicardia grave con compromiso persistente indica RCP.",
        "rhythm": "brady",
        "next": 2,
        "wrong": 1
      },
      {
        "text": "El equipo continúa RCP y soporte. ¿Qué búsqueda acompaña el tratamiento?",
        "options": [
          "Causas reversibles",
          "Solo un diagnóstico cardíaco primario",
          "Ninguna hasta recuperar el pulso"
        ],
        "answer": 0,
        "why": "Hipoxia, fármacos y otras causas deben considerarse.",
        "next": null,
        "wrong": 2
      }
    ],
    "courseId": "pals"
  },
  {
    "id": "p-arrest",
    "title": "Un colapso pediátrico",
    "summary": "Ritmo y energía por peso",
    "source": "parrest",
    "steps": [
      {
        "text": "Niño de 15 kg sin pulso, RCP en curso y desfibrilador listo. Observá el monitor. ¿Qué rama corresponde?",
        "options": [
          "Desfibrilable",
          "No desfibrilable",
          "Recuperación de circulación"
        ],
        "answer": 0,
        "why": "La actividad caótica es compatible con FV.",
        "rhythm": "vf",
        "next": 1,
        "wrong": 0
      },
      {
        "text": "Se prepara la primera descarga, según 2 J/kg. ¿Qué energía corresponde?",
        "options": [
          "30 J",
          "300 J",
          "3 J"
        ],
        "answer": 0,
        "why": "15 kg × 2 J/kg = 30 J.",
        "rhythm": "vf",
        "next": 2,
        "wrong": 1
      },
      {
        "text": "Ya se dio la descarga. ¿Qué sigue?",
        "options": [
          "Retomar RCP",
          "Esperar un minuto sin compresiones",
          "Administrar otra descarga inmediatamente de rutina"
        ],
        "answer": 0,
        "why": "Se reanudan las compresiones después de descargar.",
        "next": null,
        "wrong": 2
      }
    ],
    "courseId": "pals"
  },
  {
    "id": "f-infection",
    "title": "Fiebre y deterioro",
    "summary": "Primeras decisiones en cuidados críticos",
    "source": "sepsis",
    "steps": [
      {
        "text": "Adulto con probable foco infeccioso, hipotensión y confusión; se reconoce probable shock séptico. ¿Qué priorizás?",
        "options": [
          "Reanimación y antimicrobianos inmediatos",
          "Esperar cultivos positivos",
          "Reevaluación al día siguiente"
        ],
        "answer": 0,
        "why": "El tratamiento comienza al reconocer el shock.",
        "next": 1,
        "wrong": 0
      },
      {
        "text": "Después de la reanimación inicial persiste hipotensión. ¿Qué vasopresor se usa habitualmente primero?",
        "options": [
          "Noradrenalina",
          "Adenosina",
          "Dopamina en todos"
        ],
        "answer": 0,
        "why": "La SSC 2026 recomienda noradrenalina como primera línea habitual.",
        "next": 2,
        "wrong": 1
      },
      {
        "text": "Tras fluidos aparecen signos de congestión. ¿Qué hacés antes de más volumen?",
        "options": [
          "Reevaluar perfusión y tolerancia",
          "Repetir bolos automáticamente",
          "Ignorar la respiración"
        ],
        "answer": 0,
        "why": "La reanimación debe individualizarse y reevaluarse.",
        "next": null,
        "wrong": 2
      }
    ],
    "courseId": "fccs"
  },
  {
    "id": "f-lung",
    "title": "El pulmón bajo soporte",
    "summary": "Aplicación de ventilación protectora",
    "source": "ards",
    "steps": [
      {
        "text": "Adulto con SDRA, peso real 100 kg y predicho 60 kg. Para iniciar 6 mL/kg, ¿qué volumen calculás?",
        "options": [
          "360 mL",
          "600 mL",
          "1000 mL"
        ],
        "answer": 0,
        "why": "Se usa peso predicho: 60 × 6 = 360 mL.",
        "next": 1,
        "wrong": 0
      },
      {
        "text": "La presión meseta resulta 34 cmH₂O. ¿Qué corresponde?",
        "options": [
          "Reevaluar parámetros para protección pulmonar",
          "Aceptar cualquier presión si sube SpO₂",
          "Aumentar volumen corriente de rutina"
        ],
        "answer": 0,
        "why": "La presión meseta debe mantenerse dentro de la estrategia protectora.",
        "next": 2,
        "wrong": 1
      },
      {
        "text": "Después de ajustar, ¿qué verificás?",
        "options": [
          "Respuesta clínica, gasometría y mecánica",
          "Solo el número de volumen programado",
          "Nada hasta el día siguiente"
        ],
        "answer": 0,
        "why": "El ajuste requiere reevaluación del paciente y del soporte.",
        "next": null,
        "wrong": 2
      }
    ],
    "courseId": "fccs"
  },
  {
    "id": "f-consciousness",
    "title": "Cambio de conciencia",
    "summary": "Evaluación ordenada y pase de información",
    "source": "abcde",
    "steps": [
      {
        "text": "Adulto repentinamente confuso. ¿Cómo organizás la primera evaluación?",
        "options": [
          "ABCDE y ayuda temprana",
          "Solo tomografía antes de evaluar ABC",
          "Esperar evolución espontánea"
        ],
        "answer": 0,
        "why": "Primero identificá y tratá amenazas vitales.",
        "next": 1,
        "wrong": 0
      },
      {
        "text": "Tiene antecedente de diabetes, sudoración y menor respuesta. ¿Qué medición rápida agregás?",
        "options": [
          "Glucemia",
          "Colesterol",
          "Vitamina D"
        ],
        "answer": 0,
        "why": "La glucemia permite detectar una causa reversible.",
        "next": 2,
        "wrong": 1
      },
      {
        "text": "Se inicia tratamiento y se pide apoyo. ¿Qué comunicás?",
        "options": [
          "Situación, antecedentes, evaluación, intervención y respuesta",
          "Solo el nombre",
          "Únicamente el diagnóstico anterior"
        ],
        "answer": 0,
        "why": "Un pase estructurado permite continuidad.",
        "next": null,
        "wrong": 2
      }
    ],
    "courseId": "fccs"
  }
];
export function choose(sim,index){if(sim.finished||sim.feedback)return sim;const scenario=cases.find(c=>c.id===sim.id),s=scenario?.steps[sim.step];if(!s||!Number.isInteger(index)||index<0||index>=s.options.length)return sim;return {...sim,attempts:sim.attempts+1,errors:sim.errors+Number(index!==s.answer),feedback:{right:index===s.answer,text:s.why,next:index===s.answer?s.next:s.wrong}};}
export function advance(sim){if(!sim.feedback)return sim;return {...sim,step:sim.feedback.next??sim.step,finished:sim.feedback.next===null,feedback:null};}
