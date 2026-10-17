// Original revised items. CDC definitions; faculty validation remains pending.
export const editorialRevisions={
  "eu-pruebas-1": {
    "prompt": "Una prueba se evalúa en 300 personas con referencia diagnóstica independiente. Entre 100 enfermos hay 90 positivos y 10 negativos; entre 200 no enfermos hay 20 positivos y 180 negativos. ¿Cuál es la sensibilidad?",
    "options": [
      "90%",
      "81,8%",
      "94,7%",
      "33,3%",
      "10%"
    ],
    "answer": 0,
    "why": "90/(90+10): la sensibilidad parte de quienes tienen enfermedad.",
    "optionFeedback": [
      "90/(90+10): la sensibilidad parte de quienes tienen enfermedad.",
      "90/(90+20) es el valor predictivo positivo, no la sensibilidad.",
      "180/(180+10) es el valor predictivo negativo.",
      "100/300 es la proporción de enfermos en esta muestra.",
      "10/100 es la proporción de falsos negativos entre enfermos."
    ]
  },
  "eu-pruebas-2": {
    "prompt": "En una validación hay 60 verdaderos positivos, 20 falsos negativos, 20 falsos positivos y 180 verdaderos negativos. ¿Cuál es la especificidad?",
    "options": [
      "90%",
      "75%",
      "85,7%",
      "28,6%",
      "10%"
    ],
    "answer": 0,
    "why": "180/(180+20): el denominador son los 200 no enfermos.",
    "optionFeedback": [
      "180/(180+20): el denominador son los 200 no enfermos.",
      "60/(60+20) corresponde aquí tanto a sensibilidad como a VPP.",
      "240/280 es la proporción total de clasificaciones correctas.",
      "80/280 es la proporción de enfermos de esta muestra.",
      "20/200 es la tasa de falsos positivos; es el complemento de especificidad."
    ]
  },
  "eu-pruebas-3": {
    "prompt": "Una campaña evalúa 1.000 personas. Hay 30 verdaderos positivos, 70 falsos positivos, 10 falsos negativos y 890 verdaderos negativos. Una persona recibe un resultado positivo. ¿Qué proporción de los positivos tiene la enfermedad?",
    "options": [
      "30%",
      "75%",
      "92,7%",
      "98,9%",
      "4%"
    ],
    "answer": 0,
    "why": "30/(30+70): el VPP usa todos los resultados positivos como denominador.",
    "optionFeedback": [
      "30/(30+70): el VPP usa todos los resultados positivos como denominador.",
      "30/(30+10) es la sensibilidad.",
      "890/(890+70) es la especificidad.",
      "890/(890+10) es el valor predictivo negativo.",
      "40/1000 es la prevalencia en la muestra, antes de conocer el resultado."
    ]
  },
  "eu-pruebas-4": {
    "prompt": "La misma prueba se aplica a dos poblaciones. Su sensibilidad y especificidad se mantienen iguales; en la segunda, la prevalencia es menor. ¿Qué combinación de cambios se espera en la segunda?",
    "options": [
      "Menor valor predictivo positivo y mayor valor predictivo negativo",
      "Mayor valor predictivo positivo y menor valor predictivo negativo",
      "Menor valor predictivo positivo y menor valor predictivo negativo",
      "Mayor valor predictivo positivo y mayor valor predictivo negativo",
      "Ambos valores predictivos permanecen iguales"
    ],
    "answer": 0,
    "why": "Con menor probabilidad previa, un positivo es menos convincente y un negativo más convincente, manteniendo sensibilidad y especificidad.",
    "optionFeedback": [
      "Con menor probabilidad previa, un positivo es menos convincente y un negativo más convincente, manteniendo sensibilidad y especificidad.",
      "Es el patrón esperado cuando aumenta la prevalencia.",
      "El VPP disminuye, pero el VPN aumenta bajo estos supuestos.",
      "El VPN aumenta, pero el VPP disminuye bajo estos supuestos.",
      "Los valores predictivos dependen de la prevalencia, aunque la sensibilidad y especificidad no cambien."
    ]
  },
  "eu-epidemiologia-1": {
    "prompt": "Una cohorte cerrada de 1.000 personas sin enfermedad se sigue durante un año, sin pérdidas. Se registran 20 primeros casos. No se dispone de los tiempos individuales hasta el evento. ¿Qué medida puede calcularse directamente como 20/1.000?",
    "options": [
      "Incidencia acumulada anual",
      "Prevalencia al comienzo del seguimiento",
      "Densidad de incidencia anual",
      "Letalidad entre los enfermos",
      "Razón de incidencia entre grupos"
    ],
    "answer": 0,
    "why": "La incidencia acumulada es 20/1.000 = 2%. La densidad requiere persona-tiempo; la letalidad requiere fallecidos y la razón de incidencia requiere un grupo de comparación."
  },
  "eu-epidemiologia-2": {
    "prompt": "El 1 de junio se evalúa a 800 habitantes. Ochenta tienen asma diagnosticada, de los cuales veinte recibieron el diagnóstico durante el último año. ¿Qué representa 80/800?",
    "options": [
      "Prevalencia puntual",
      "Incidencia acumulada anual",
      "Prevalencia de período anual",
      "Densidad de incidencia",
      "Proporción de casos nuevos"
    ],
    "answer": 0,
    "why": "Incluye todos los casos existentes en la fecha del corte: prevalencia puntual del 10%. Los veinte diagnósticos recientes no transforman ese cociente en incidencia; tampoco se registraron todos los casos de un período."
  },
  "eu-epidemiologia-3": {
    "prompt": "Se seleccionan 120 personas con una enfermedad y 120 sin ella del mismo ámbito de referencia. En ambos grupos se revisan registros de una exposición previa. ¿Qué diseño describe la selección utilizada?",
    "options": [
      "Casos y controles",
      "Cohorte retrospectiva",
      "Cohorte prospectiva",
      "Estudio transversal analítico",
      "Estudio ecológico"
    ],
    "answer": 0,
    "why": "La selección parte del desenlace y después compara exposición. Revisar registros antiguos no basta para llamarlo cohorte retrospectiva: en una cohorte se parte de grupos definidos por exposición."
  },
  "eu-epidemiologia-4": {
    "prompt": "Una asociación cruda entre exposición y enfermedad se atenúa al ajustar por edad. La edad precede a la exposición, se asocia con ambas variables y no forma parte del mecanismo causal propuesto. ¿Qué explicación es más compatible?",
    "options": [
      "Confusión por edad",
      "Mediación por edad",
      "Sesgo de recuerdo diferencial",
      "Causalidad inversa",
      "Modificación del efecto demostrada"
    ],
    "answer": 0,
    "why": "El patrón es compatible con confusión, aunque no la demuestra por sí solo. La edad no es un mediador bajo los supuestos dados. Para evaluar modificación del efecto se necesitan estimaciones por estratos, no sólo comparar el resultado crudo y el ajustado."
  }
};
export function reviseQuestions(courses){for(const c of courses)for(const l of c.lessons)for(const q of l.questions)if(editorialRevisions[q.id])Object.assign(q,editorialRevisions[q.id]);}
