# Kinesiología: programa, integración y auditoría

## Resultado

Nueva categoría **Personal sanitario → Kinesiólogos**, separada de Primeros respondedores. Entrada desde `capacitacion.html` (Alumno → Personal sanitario), desde el inicio, Formación y Cambiar de objetivo. Ruta directa: `/#kinesiologia`; categoría superior: `/#personal-sanitario`.

| Curso | Identificador | Módulos | Preguntas | Caso interactivo |
| --- | --- | ---: | ---: | ---: |
| Evaluación y ejercicio terapéutico | `kine-clinica` | 5 | 20 | 1 |
| Kinesiología respiratoria y rehabilitación pulmonar | `kine-respiratoria` | 5 | 20 | 1 |
| Movilización y recuperación funcional en UCI | `kine-uci` | 5 | 20 | 1 |
| Soporte ventilatorio básico | `kine-ventilacion` | 5 | 20 | 1 |

Cada módulo contiene objetivo, teoría original, error frecuente, alcance de evidencia, ejercicio de simulación con lista de observación y cuatro preguntas de cinco alternativas con fundamento. Cada curso tiene requisitos, objetivos, bibliografía, evaluación de 20 preguntas en 40 minutos y aprobación desde 16/20. Tiempo orientativo: 125 minutos de estudio y actividades más 40 de examen; no son horas acreditadas. Los cuatro casos tienen tres decisiones cada uno y recuperación después de respuestas incorrectas.

Se reutilizan práctica, repaso, progreso local/cuenta, biblioteca docente y exámenes existentes. No se agregan cuentas, permisos ni un segundo sistema de persistencia. La constancia académica privada existente no acredita destreza clínica. Las simulaciones presenciales necesitan instructor y entrenamiento; no se habilitan procedimientos por completar este contenido.

## Temario

1. Clínica: evaluación funcional y CIF; señales de alarma; dolor lumbar; ejercicio en artrosis; caídas y continuidad.
2. Respiratoria: evaluación/marcha; rehabilitación pulmonar; higiene bronquial; monitorización; autocuidado y PESE.
3. UCI: valoración inicial; seguridad; progresión; interpretación de PADIS/TEAM; transición pos-UCI.
4. Ventilación: paciente–ventilador; protección pulmonar/prono; VNI; aspiración; prueba de respiración espontánea y extubación.

## Evidencia y alcance editorial

22 referencias de consulta gratuita, con enlace, tipo, año, sección y fecha de contraste **29/10/2026** en `public/learn/content/kinesiologia.mjs`. Predominan OMS, NICE, ATS/ERS, AARC y SCCM. Los recursos basados en resumen gratuito se identifican como tales; ningún ejercicio requiere comprar un texto. No se alojan manuales ajenos, no se copian figuras y no se atribuye aval de las entidades al curso.

Las preguntas y escenarios son originales. Las recomendaciones clínicas se distinguen de ejemplos pedagógicos y de consensos. Puntos revisados expresamente:

- Cauda equina: reconocer sospecha y activar evaluación urgente; conservar marcha no la descarta.
- Bronquiectasias: ERS 2025; recomendación fuerte de enseñanza de limpieza bronquial con certeza muy baja y sin una técnica universalmente superior.
- Pos-COVID: respuesta diferida y PESE; no progresión fija que ignore empeoramiento.
- UCI: no interpretar falta de cooperación como fuerza cero; evaluación multidominio y de tendencias.
- PADIS 2025: recomendación condicional; TEAM 2022 no justifica maximizar intensidad indiscriminadamente.
- SDRA: peso predicho, unidades, límites protectores y prono con equipo entrenado; cálculo no equivale a indicación.
- VNI: reconocer fracaso, no equiparar SpO₂ mejorada con ventilación resuelta.
- Aspiración: evitar salina rutinaria, máximo de duración como límite y no meta, reevaluación de tolerancia.
- PRE: no exigir RSBI como requisito; no aumentar FiO₂ para ocultar intolerancia; PRE tolerada no equivale a extubación segura.

**Revisión docente especializada pendiente.** La comprobación bibliográfica y las pruebas de software no equivalen a validación clínica independiente ni a evaluación de eficacia educativa con alumnos reales. El estado se muestra en el producto.

## Hallazgos de la auditoría del repositorio

Base inicial revisada: `8c4aa1fbc034caa04d33d455aa09ecdab6c1bced`. Durante el trabajo main avanzó a `d769ffbc3c83f681a7b8caa738390c3a6546324c` con la PR #41. Se incorporó esa actualización y se resolvió el conflicto de catálogo/teoría conservando Revalida y Kinesiología. También se incorporó `0f343fc9cbb542a7d7e2280627c086c789800279` (PR #43), que prioriza el espacio del alumno, conservando el acceso a Personal sanitario.

| Hallazgo | Acción / estado |
| --- | --- |
| Entrada de alumnos mezclaba personal sanitario y primeros respondedores | Separación de rutas y nueva categoría Kinesiólogos |
| `courses.slice(1)` mostraba rotaciones como refuerzos de primeros auxilios y podía repetir el curso policial | Filtro por identificador y propiedad `rotation` |
| Reescrituras editoriales globales podían modificar nuevos cursos | El contenido kinésico se incorpora después de los transformadores heredados |
| Teoría sólo mostraba una referencia | En los módulos nuevos se muestran todas las fuentes, secciones y acceso; referencias específicas en preguntas y decisiones |
| Exámenes/grupos: dos pruebas llaman `join` con `groupId`, aunque la API vigente requiere `joinCode` | Hallazgos iniciales reproducidos sin cambios; corregidos posteriormente por main/PR #41, cuya actualización se conserva |
| Rotación de Ginecología contiene 30 preguntas, mientras su prueba exige 50 | Hallazgo inicial reproducido; main/PR #41 corrigió los bancos de rotaciones y se conserva esa corrección |
| Auditor académico general detecta 115 explicaciones heredadas breves en el main actualizado (132 en la base inicial) | Ninguna corresponde a Kinesiología; pendiente de una revisión del banco anterior |

La actualización de Revalida ya fusionada en main se conserva; la PR abierta de biblioteca no se incorpora.

## Verificación

- 25 pruebas específicas/integración aprobadas: Kinesiología, navegación, lectura/práctica sin filtración de respuestas, motor, casos, claves de seguridad y simulación de recorridos.
- Suite general final, después de incorporar main/PR #41 y #43, ejecutada en serie con entorno sin credenciales: **104 pruebas aprobadas, 0 fallos**. La corrida inicial fue 96/99; los tres fallos previos quedaron resueltos por la actualización de main, sin deshabilitar pruebas.
- `npm run check`, `audit:learning`, `audit:academic`, `audit:questions --strict` y `qa-five-graduates.mjs`: ejecución completada sin errores bloqueantes de esos auditores.
- Auditor heurístico final: 80 preguntas nuevas, cero duplicados, cero preguntas marcadas y ningún sesgo de estrategia detectado en los cuatro cursos. Cada clave A–E aparece cuatro veces por curso. Esto no demuestra dificultad ni validez clínica.
- Serialización de progreso de cuenta, lectura, errores, examen 16/20 y acceso docente verificados mediante funciones existentes; no se usaron cuentas ni datos reales.
- Verificación visual en navegador remoto no completada: el navegador no pudo acceder al servidor local (`ERR_CONNECTION_REFUSED`). Navegación comprobada mediante pruebas de interfaz; no se afirma una revisión visual móvil.

Los resultados resumidos y la matriz de 80 preguntas están en `docs/audits/kinesiologia-2026-10-29.json` para facilitar revisión docente y futuras actualizaciones.
