# ClinicIA: comparación y mejoras verificadas · 17 de octubre de 2026

## Alcance

Auditoría de código y recorridos locales, con comparación de funciones publicadas por los competidores. No es una prueba de sus aplicaciones pagas ni una demostración de superioridad educativa. Base inicial `1134e2af`; integrada con `45da7d61`, que incorpora guardia por rol y salas privadas. Se preservan esos cambios concurrentes.

Banco integrado: **11 cursos, 378 preguntas, 26 casos y 77 decisiones de simulación**. Preguntas y simulaciones siguen pendientes de validación docente; integridad técnica no equivale a exactitud clínica.

## Qué hacen mejor los referentes y cómo competir

| Referente | Fortaleza publicada | Situación de ClinicIA y decisión |
| --- | --- | --- |
| Duolingo | Ruta visible, sesiones breves, hábitos y repetición espaciada | Había XP y misiones, pero faltaba una secuencia de temas. Se agregó ruta por capítulos, próximo paso y separación entre tema aprobado y concepto recuperado a lo largo del tiempo. No usar pérdida de vidas para bloquear el aprendizaje. |
| AMBOSS | Banco conectado con biblioteca, explicaciones y análisis de conocimientos | ClinicIA es mucho más pequeña; no corresponde equiparar su cobertura. Antes solo 4 preguntas explicaban cada distractor; ahora 11. Prioridad: calidad de las restantes, fuentes específicas y revisión por docentes. |
| Full Code | Simulación de pacientes, dificultad graduable y casos revisados por clínicos | ClinicIA ofrece decisiones por etapas y discusión en salas. No tiene una simulación fisiológica comparable ni debe presentarse como tal. Priorizar consecuencias, decisiones justificadas y debriefing. |

La oportunidad de ClinicIA es combinar entrenamiento de guardia en español, recorridos por rol, práctica breve, tutor y seguimiento en un hospital concreto. Es una propuesta a validar con usuarios: no una ventaja de resultados ya demostrada. El piloto hospitalario puede aportar observaciones que un banco genérico no recoge.

Fuentes primarias consultadas:
- https://blog.duolingo.com/new-duolingo-home-screen-design/
- https://blog.duolingo.com/duolingo-101-how-to-learn-a-language-on-duolingo/
- https://www.amboss.com/us/students/md/clinical
- https://support.amboss.com/hc/en-us/articles/360036038991-Using-Study-Mode-Exam-Mode
- https://fullcodemedical.com/
- https://www.nbme.org/institutions/nbme-item-writing-guide/

## Correcciones de esta entrega

1. Repetir una respuesta antes de su vencimiento ya no aumenta el nivel de repaso ni posterga la fecha pendiente. La retención usa nuevos contadores de repasos realmente vencidos; no atribuye retención demostrada a niveles históricos.
2. El bloque adaptativo reserva espacio para preguntas nuevas cuando existe una cola de repaso. Las simulaciones detectaron que un alumno que regresaba cada pocos días podía quedar estancado.
3. Ruta por capítulos de cuatro temas, con estados por explorar, listo para practicar, superado y consolidado. Próximo paso según errores, repaso pendiente, tema y caso. Todos los temas siguen accesibles. Acceso a la ruta también al terminar una sesión.
4. No se anuncia un próximo nivel imposible cuando se completa el XP disponible del curso. Los XP y los puntos canjeables siguen separados.
5. La sincronización conserva los aciertos históricos de exámenes de versiones anteriores del banco. No vuelve a calificarlos con claves nuevas. Se rechazan filas duplicadas y resultados incompatibles.
6. Siete preguntas originales de comunicación fueron reemplazadas por aplicaciones concretas con cinco explicaciones específicas. Se agregaron fuentes de AHRQ para SBAR, check-back, teach-back y pase. El nuevo feedback también aparece al revisar el simulacro. Banco versión 4: los intentos antiguos sin terminar requieren reinicio; los resultados terminados se conservan.
7. El tutor recibe la pregunta activa y sus alternativas revisadas. Ante ausencia de material recuperado, devuelve un límite explícito sin llamar al modelo. No es un filtro que garantice respuestas clínicas correctas.
8. El cierre de la práctica ya no afirma que todo está guardado si la cuenta aún está sincronizando o falló el almacenamiento local.
9. Auditoría reproducible `npm run audit:learning`, incorporada al flujo de CI: integridad del banco y recorrido de todas las alternativas de los casos.

## Verificación

- 48 pruebas automáticas aprobadas, incluidas cuentas en base de datos, pagos, formación y salas heredadas.
- 44 alumnos sintéticos, cuatro patrones por cada uno de los 11 cursos, 30 días y **7.150 respuestas**. Verifica continuidad, aislamiento entre cursos, guardado/restauración, repetición inmediata y avance. No representa alumnos reales ni mide aprendizaje real.
- **385 combinaciones de decisión**: cada alternativa de las 77 etapas de los casos, incluida reanudación y doble envío.
- Navegador real a 390 y 1280 px: ruta, lectura, evaluación, siguiente paso, recarga y explicación por alternativa. Sin desbordamiento horizontal ni errores de JavaScript en esos recorridos.
- Chequeo de sintaxis aprobado.
- Las llamadas externas al tutor se simularon en tests. No se validó aquí la calidad de respuestas de un proveedor real desplegado.

El informe reproducible está en `docs/audits/learning-quality-2026-10-17.json`. Registra **204 ítems o etapas para revisión editorial heurística**, mayormente por fundamentos breves. Son señales para revisar, no 204 errores clínicos demostrados. No se aumenta dificultad mediante alternativas absurdas o simplemente agregando más opciones.

## Lo que falta para llamarlo terminado

- Revisión médica del banco completo, con registro de revisor, fuente aplicable y fecha. Expandir devoluciones por alternativa: 367 preguntas todavía no las tienen.
- Evaluar el tutor real con escenarios ficticios y una rúbrica: dato decisivo, coherencia, incertidumbre, ausencia de hechos inventados, sustento y transferencia. Una respuesta fluida no basta.
- Pilotear con médicos y personal no médico. Medir primera sesión terminada, retorno a siete días, corrección de errores y recuperación diferida; recoger distractores elegidos por usuarios reales para evaluar dificultad.
- Profundizar consecuencias y debriefing de casos, sin presentar el reintento guiado como competencia demostrada.
- Certificados externos, validación y recompensas físicas continúan en el issue #13; no fueron implementados en esta entrega. La progresión personal no es autoridad suficiente para premios de valor o acreditaciones.

El criterio comercial es que el usuario pueda decir qué aprendió, volver y mejorar de forma verificable. Todavía no hay datos en esta auditoría para pronosticar ventas, retención o ingresos.
