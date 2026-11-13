# Revisión de preguntas, una por una (13/11/2026)

## Qué se hizo
El dueño del producto autorizó reescribir distractores. Se revisaron **702 preguntas de 21 cursos** una por una (12 revisores en paralelo). Se detectó que el sistema anterior rellenó unas 450 preguntas con distractores genéricos que cualquiera descarta sin saber medicina («Posponer las prioridades clínicas hasta la siguiente consulta programada», repetido 76 veces; «Basar la conducta exclusivamente en un dato aislado y no reevaluar», 76 veces; etc.). En cada pregunta se reescribieron los 4 distractores como errores plausibles de un profesional competente pero incompleto (prioridad, umbral, fármaco o estudio equivocado, sobre/infratratamiento, cierre prematuro), se igualó el registro y la longitud con la correcta, y donde el enunciado era demasiado escueto se lo convirtió en un caso breve. **El texto y la posición de la opción correcta no cambiaron en ninguna pregunta** (lo exige la validación automática).

Cómo se aplica: `public/learn/content/question-upgrades.mjs` (generado por `tools/build-upgrades.mjs` desde `tools/review-out/R*.json`) se aplica al final de la carga del catálogo, y también al catálogo de capacitación (curso policial). Se puede revertir vaciando ese archivo.

| Lote | Cursos | Preguntas |
| --- | --- | ---: |
| R01 | vía aérea avanzada, shock, trauma prehospitalario | 52 |
| R02 | AMLS, EPC, emergencia neurológica | 60 |
| R03 | salud cardiometabólica | 50 |
| R04 | metabolismo graso integral | 50 |
| R05 | obesidad integral | 50 |
| R06 | diabetes integral 2026 | 50 |
| R07 | medicina funcional | 50 |
| R08 | estilo de vida y remisión DM2 | 50 |
| R09 | UCI crítico integral | 70 |
| R10 | ACLS, PALS, FCCS | 72 (58 reescritas) |
| R11 | sepsis 2026, respuesta policial | 70 |
| R12 | guardia médica, guardia de equipo, neonatal, obstetricia | 78 (77 reescritas) |

Resultado medido: la opción correcta pasó de ser la más larga en hasta 86 % de las preguntas de algunos cursos a ~0–19 %; ya no quedan distractores de relleno en las preguntas revisadas.

## Limitaciones que hay que decir con claridad
1. **Los revisores trabajaron de memoria clínica, no contra las fuentes**: en el lote no se abrieron las guías originales (cada informe lo declara en `noVerificadas`). Las claves se consideraron coherentes con el consenso, pero **no están verificadas contra la fuente**. Hace falta una revisión docente.
2. **Estructura repetitiva**: varios cursos largos son pocas preguntas repetidas con otro prefijo. Salud cardiometabólica, metabolismo graso, obesidad, diabetes, medicina funcional y estilo de vida son 10 preguntas distintas × 5 variantes; UCI crítico integral son 14 escenarios × 5. Se les dieron enunciados con casos distintos, pero el contenido conceptual sigue siendo de 10–14 temas por curso. Conviene reducir el curso o escribir preguntas nuevas.
3. **Opciones correctas genéricas** repetidas («Evaluar beneficios, daños y preferencias.», «Reevaluar resultados y ajustar el plan.»): sirven por descarte. Propuesta: opciones específicas por tema.
4. **No revisadas una por una todavía (~950 preguntas)**: Examen Único (160), PROATI (300; 46 con distractores muy cortos), Revalida PT-BR (100), PHTLS/ATLS (48), POCUS (20), los bancos de rotaciones y evacuación del catálogo de capacitación (unas 370, de las que 123 tienen solo 4 opciones), y las 80 de Kinesiología, 80 de Enfermería/Nutrición y 100 de Gerontología, que ya se redactaron con el estándar nuevo.

## Alertas puntuales (claves o fundamentos a confirmar por un docente)
- **R03 · `salud-cardiometabolica-m6-q1`** — La correcta 'Sustituir grasas trans por insaturadas' es válida pero imprecisa: la recomendación es eliminar las grasas trans industriales y reducir las saturadas reemplazándolas por insaturadas. → Reformular la correcta (en las 5 variantes del m6) como 'Reemplazar grasas saturadas y trans por insaturadas'. (AHA Dietary Guidance to Improve Cardiovascular Health 2021 (no verificada en línea))
- **R04 · `metabolismo-graso-integral-m3-q1..q5`** — La opción correcta 'Lipólisis' tiene 9 caracteres y el validador exige >=12 por opción; no se puede alargar sin cambiar el texto de la correcta. → Cambiar la correcta a 'Lipólisis del tejido adiposo' en todas las variantes, o relajar el validador. (n/a (formato))
- **R04 · `metabolismo-graso-integral (todas)`** — Las 50 preguntas son 10 preguntas repetidas 5 veces con distinto prefijo de contexto ('En una consulta inicial:', etc.) y opciones barajadas; no aportan variedad. → Reemplazar por variantes con casos clínicos distintos o reducir a 10-15 preguntas. (n/a)
- **R06 · `diabetes-integral-2026-q4`** — La opción correcta genérica «Evaluar beneficios, daños y preferencias.» se repite en 10 preguntas y no responde de forma específica a varios enunciados de diagnóstico; la clave es válida solo por descarte. → Reemplazar por opciones correctas específicas por tema en una futura revisión de claves. (ADA Standards of Care in Diabetes (criterio general de atención centrada en la persona))
- **R07 · `medicina-funcional-fundamentos-q4`** — Las preguntas q4, q9, q14, q19, q24, q29, q34, q39, q44, q49 comparten la misma opción correcta genérica ('Evaluar beneficios, daños y preferencias.'): es una práctica válida pero no específica del tema; se mitigó con enunciados contextualizados y distractores propios de cada tema. → Considerar reemplazar la correcta por una conducta específica de cada tema en una próxima revisión. (Atención basada en evidencia / decisiones compartidas (principio general))
- **R07 · `medicina-funcional-fundamentos-q28`** — La opción correcta 'Descartar enfermedad por estrés' (q28) y la frase 'Explorar factores psicosociales' (q27) son ambiguas si se leen aislada; q28 pregunta por el error y la formulación 'descartar enfermedad por estrés' puede interpretarse como 'descartar el estrés'. → Reformular la correcta de q28 como 'Atribuir los síntomas al estrés sin descartar enfermedad orgánica'. (Redacción; sin cambio de clave)
- **R09 · `uci-critico (todo el curso)`** — Las 70 preguntas son 14 escenarios repetidos 5 veces con la misma opción correcta genérica; los enunciados originales eran idénticos entre sí y sin datos clínicos. → Se reescribieron enunciados con viñetas distintas y se rotaron distractores; considerar fusionar o reemplazar variantes redundantes por preguntas con correctas distintas. (Revisión interna; guías de referencia: ARDSNet, Surviving Sepsis Campaign 2021, KDIGO AKI, SCCM PADIS 2018)
- **R10 · `ecg-vt`** — El enunciado depende de una tira ECG que no pude ver; la clave es coherente con el texto (sin pulso: desfibrilar) pero no verifiqué la imagen. → Revisar visualmente que la tira muestre TV/FV. (AHA 2025 Adult Cardiac Arrest Algorithm)
- **R10 · `f-vasopressor`** — El porqué cita SSC 2026; confirmé la guía 2026 (publicada 23-mar-2026) pero no el texto exacto de la recomendación de noradrenalina. → Mantener clave (noradrenalina primera línea en SSC 2021); verificar redacción 2026. (https://www.sccm.org/clinical-resources/guidelines/guidelines/surviving-sepsis-campaign-international-guidelines-for-management-of-sepsis-and-septic-shock-2026)
- **R10 · `p-first-energy`** — Dice 'primera descarga a 2 J/kg'; AHA 2025 pediátrica admite 2–4 J/kg (después ≥4 J/kg). La clave 30 J es correcta con el dato dado, pero conviene aclarar en el fundamento. → Agregar al porqué que 2–4 J/kg es el rango y la pregunta fija 2 J/kg. (AHA 2025 Pediatric Advanced Life Support (no abierto; sin verificar))
- **R11 · `rtpp-7-1`** — La opción correcta 'Posible ACV' (11 caracteres) no pasa el validador (mínimo 12) y no puedo cambiarla por el brief. → Reemplazar la correcta por 'Posible ACV, activar emergencias' (o similar) y ajustar la posición/longitud de los distractores. (Criterio de formato de validate-upgrades.mjs; contenido clínico (déficit focal súbito = sospecha de ACV) correcto.)
