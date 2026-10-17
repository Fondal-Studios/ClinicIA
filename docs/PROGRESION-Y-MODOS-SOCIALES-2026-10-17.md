# ClinicIA: progresión y preparación, con propuesta social

## Implementado

- Pantalla «Mi aventura de estudio» y acceso principal. Nivel y XP independientes por curso. Cada 100 XP sube un nivel.
- XP reconstruidos desde progreso persistente: 10 por pregunta distinta acertada al menos una vez, 25 por tema superado y 30 por caso completado. Repetir no multiplica XP. Gastar puntos no reduce niveles. Los niveles son educativos, no acreditaciones clínicas.
- Cinco medallas por curso y cinco o seis misiones alcanzables según disponibilidad de casos. Sin pérdida por días de descanso. Los puntos canjeables conservan sus reglas y no se convierten desde XP.
- Mapa por área con cobertura, aciertos históricos y errores pendientes. El porcentaje es descriptivo, no predictor de examen.
- Nueve plantillas «Misión de refuerzo»: diez preguntas, 18 minutos; priorizan errores actuales, después preguntas no exploradas y luego menor proporción histórica de aciertos. Empates aleatorios; preguntas y opciones quedan fijas al crear el intento y se recuperan tras recargar. Sin pistas ni corrección hasta entregar.
- Retroalimentación de XP tras responder en práctica.

43 pruebas automáticas: no duplicación de XP, aislamiento entre cursos, restauración, misiones alcanzables, selección adaptativa, omisiones, tiempo y recorridos previos. Sin nuevas recomendaciones clínicas ni preguntas generadas en esta entrega.

## Propuestas: todavía no implementadas

### 1. Guardia en equipo (prioridad)
Dos a cuatro participantes en sala privada por código. Cada uno elige su respuesta antes de ver las ajenas. Después se muestran los argumentos, se acuerda una respuesta y aparece la devolución. Roles rotativos: coordinación, valoración, hipótesis y reevaluación. Puntuar precisión inicial y corrección del razonamiento por separado. Un desacuerdo es material para aprender; nunca una penalización social pública.

Primera versión aconsejada: asincrónica, con reanudación y caducidad de sala; evita exigir coincidencia horaria. Requiere nuevas tablas de salas, miembros, votos y fases; autorización por miembro, bloqueo del voto tras revelar y calificación en servidor. Las respuestas ajenas no se envían al cliente antes del cierre. No usar el estado del navegador como autoridad para un ranking.

### 2. Desafío entre colegas
Invitación privada para un mismo conjunto de preguntas y orden individual. Precisión como criterio principal; no premiar rapidez clínica. Resultados visibles tras terminar ambos. Sin oponentes ficticios presentados como personas. Requiere corrección y límites de intentos en servidor antes de competencias o premios económicos.

### 3. Campañas y grupos docentes
Misiones semanales por área, casos de cierre y revisión de errores. Un docente puede asignar un bloque y ver resultados agregados del grupo con consentimiento. La preparación de Examen Único sigue siendo el recorrido principal; ampliar contenido revisado antes de prometer cobertura integral.

## Monetización a validar

- Pase de preparación de duración definida: banco ampliado y revisado, plan de estudio, simulacros y cuota de tutor IA claramente informada.
- Licencias por grupo para docentes o instituciones, con gestión de cohortes y seguimiento.
- Cosméticos del tutor y personalización como compra complementaria. La precisión del tutor, la puntuación y el acceso a explicaciones de errores no mejoran por comprar un personaje.
- Mantener la prueba actual abierta. No se habilitaron cobros, renovaciones, bloqueos ni campañas de publicidad en esta entrega.
- Medir: primera sesión terminada, regreso a siete días, errores revisados, simulacros completados y conversión voluntaria. No prometer ingresos sin usuarios y datos de compra.

## Referentes consultados

Duolingo: desafíos con amigos y metas compartidas (inspiración de mecánica, no copia de contenido).
https://blog.duolingo.com/friends-quests/

AMBOSS: sesiones por objetivo, planes de estudio y vínculo entre preguntas y teoría.
https://support.amboss.com/hc/en-us/articles/360034825692-Platform-overview

Las salas, el versus y las licencias de grupos son propuestas. La versión publicada sigue siendo individual; no simula presencia de otros estudiantes.
