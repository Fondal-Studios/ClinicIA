# QA simulado de cinco egresados y tres idiomas

Cinco perfiles sintéticos, dos cursos cada uno: ES1 ACLS/Sepsis, ES2 Diabetes/Cardiometabólica, PT1 ProATI/Vía aérea, PT2 Metabolismo graso/Obesidad, EN1 POCUS/Trauma. Cada perfil recorre las lecciones y todas las preguntas de los dos cursos. Tres verificaciones: coherencia estructural y explicaciones, facilidad de distractores y pistas, acceso lingüístico.

No son personas reales ni completaron interfaz autenticada. La prueba reproduce estrategias superficiales ciegas, no competencia médica. Sus hallazgos requieren evaluación clínica editorial.

Ejecutar: node tools/qa-five-graduates.mjs

## Resultado de la ejecución automatizada (26 de octubre de 2026)

- **5 perfiles sintéticos**, 10 cursos completos, **600 preguntas recorridas**; no son alumnos reales ni se hizo un estudio de usabilidad presencial.
- **223 preguntas señaladas** por al menos dos distractores evidentemente inadecuados o distractores genéricos; **18 señales adicionales** de diferencia excesiva de longitud de la respuesta correcta (pueden superponerse con las anteriores).
- **47 observaciones** sobre brevedad de explicación o teoría según el umbral automatizado de 80/100 caracteres, no necesariamente errores clínicos.
- **0 errores de estructura** en número/unicidad de opciones y **0 referencias ausentes** entre los diez cursos observados.
- **456 exposiciones a preguntas** en recorridos PT/EN sin traducción integral confirmada; esto representa una barrera de accesibilidad, no 456 preguntas necesariamente incorrectas.
- La prueba determina coherencia *formal* y detecta pistas. No establece verdad clínica, validez de guías, ni equivalencia educativa de traducciones.

| Perfil | Preguntas | Distractores obvios | Pistas de longitud | Explicaciones breves | Acierto de heurística ciega |
|---|---:|---:|---:|---:|---|
| ES1 (ACLS y sepsis) | 44 | 20 | 0 | 24 | ACLS 4%, sepsis 0% |
| ES2 (diabetes y cardiometabólica) | 100 | 74 | 7 | 0 | Diabetes 68%, cardiometabólica 18% |
| PT1 (ProATI y vía aérea) | 320 | 22 | 3 | 7 | ProATI 31%, vía aérea 80% |
| PT2 (metabolismo graso y obesidad) | 100 | 71 | 8 | 0 | Metabolismo 0%, obesidad 70% |
| EN1 (POCUS y trauma) | 36 | 36 | 0 | 16 | POCUS 5%, trauma 13% |

Los porcentajes de la última columna son **aciertos de estrategias textuales sin conocimiento médico**. Las diferencias dependen de la estrategia y del curso, por lo que no son puntuaciones comparables entre alumnos ni tasas de aprobación.

### Prioridades de corrección P0

1. **Distractores clínicamente plausibles:** sepsis-preparacion-2026, salud-cardiometabolica, metabolismo-graso-integral, via-aerea-avanzada, pocus-preparacion y trauma-prehospitalario exhiben una elevada proporción de opciones obvias. Ejemplos verificables: sepsis-preparacion-2026-q1, salud-cardiometabolica-m1-q1, vaa-1a, pocus-preparacion-q1 y trp-1a.
2. **Robustez de los exámenes:** preguntas cuyo acierto se puede aproximar por pistas de redacción, especialmente diabetes-integral-2026 y obesidad-integral. Ejemplos: diabetes-integral-2026-q4 y obesidad-integral-q4. Reescribir distractores utilizando errores clínicos frecuentes, no opciones absurdas, y volver a correr auditoría ciega antes de publicarlos como evaluación certificadora.
3. **Idioma real de enseñanza:** añadir traducciones revisadas del programa, preguntas, justificaciones y accesibilidad de interfaz al portugués e inglés; la presencia de tutores capaces de conversar en otros idiomas no traduce los bancos publicados.

### Priorización de QA clínica

Un comité médico docente debe evaluar de forma independiente seguridad, actualización de guías y existencia de una sola mejor respuesta. Si una pregunta no cumple, mantenerla fuera de la evaluación certificadora hasta aprobación editorial. No debe sustituirse la revisión humana por el acierto de la heurística.
