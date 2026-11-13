# Revisión de preguntas, una por una (ClinicIA)

Contexto: ClinicIA es una app de formación en salud (Argentina, español rioplatense). El dueño **autorizó explícitamente** reescribir distractores y mejorar enunciados. Una versión antigua del sistema rellenó muchas preguntas con distractores genéricos que cualquiera descarta sin saber medicina, por ejemplo: «Posponer las prioridades clínicas hasta la siguiente consulta programada», «Basar la conducta exclusivamente en un dato aislado y no reevaluar», «Omitir la evaluación y asumir estabilidad», «Concluir un diagnóstico definitivo sin corroborar», «No requiere seguimiento», «Considerar el contexto clínico», «Reevaluar resultados»… Hay que reemplazarlos por distractores de **alto nivel**.

## Cómo ver tus preguntas
`cd /home/user/ClinicIA && node tools/review-batch.mjs <cursoId> [<cursoId>...]` imprime cada pregunta (id, tema, enunciado, opciones con ★ en la correcta, `clave` = índice de la correcta, `porque`).

## Qué hacer con CADA pregunta (todas, sin saltear)
1. **Clave**: confirmá que la opción ★ es correcta, completa y vigente. Si dudás, buscá la fuente (WebSearch/WebFetch; si WebSearch no está listado, cargalo con ToolSearch "select:WebSearch"; hosts como AHA/JACC/PubMed pueden estar bloqueados por el proxy: si no podés abrir la fuente, anotalo en `noVerificadas`, no la des por verificada).
2. **Distractores de alto nivel** (reescribí los 4 incorrectos): cada uno debe ser un error plausible que cometería un profesional competente pero incompleto: prioridad equivocada, umbral o dosis equivocada, fármaco/clase/estudio equivocado, sobre- o infratratamiento, cierre diagnóstico prematuro, confundir causa y efecto, dato correcto aplicado al contexto equivocado, regla de otra guía o de otra población. Mismo registro, especificidad, estructura gramatical y longitud aproximada que la correcta. Ninguna opción se descarta por tono («sin evaluar», «ignorar», «únicamente», «siempre», «nunca» solo si son plausibles). Sin «todas/ninguna de las anteriores». Ningún distractor puede ser también correcto ni defendible por un matiz.
3. **Sesgo de longitud**: la correcta NO debe ser sistemáticamente la más larga ni la más detallada; en tu lote debe ser la más larga en como máximo ~25 % de las preguntas.
4. **Enunciado**: si es tan escueto que no admite distractores buenos, o es ambiguo, mejoralo mínimamente (podés agregar datos clínicos del caso) sin cambiar cuál es la respuesta correcta. Si está bien, no lo toques.
5. **Fundamento (`porque`)**: si es pobre (< una frase útil) o dependía de los viejos distractores, reescribilo explicando por qué la correcta lo es y por qué el error más tentador no (sin inventar cifras: sólo las verificables en la fuente ya citada).
6. **NO cambies el texto ni la posición de la opción correcta.** Si la clave está mal, es ambigua o está desactualizada, no la cambies: registrála en `flags` con tu propuesta y la fuente.

## Salida
Escribí `/home/user/ClinicIA/tools/review-out/<LOTE>.json` (guardalo cada ~15 preguntas; el entorno puede reiniciarse; si el archivo ya existe, continuá sin repetir lo hecho):
```json
{"batch":"<LOTE>",
 "upgrades":{"<id>":{"options":["5 textos, mismo orden que el original; la correcta idéntica en su posición"],"prompt":"(solo si lo mejoraste)","why":"(solo si lo mejoraste)"}},
 "flags":[{"id":"","problema":"","propuesta":"","fuente":""}],
 "stats":{"revisadas":0,"reescritas":0,"flags":0,"noVerificadas":[]}}
```
Incluí en `upgrades` TODAS las preguntas cuyos distractores reescribiste (casi todas las de tu lote). Validá con `node tools/validate-upgrades.mjs tools/review-out/<LOTE>.json` hasta que diga OK. No edites ningún otro archivo ni hagas commit.

## Informe final (<250 palabras, español)
Cuántas revisadas y reescritas; flags importantes (claves dudosas, con id); qué no pudiste verificar y por qué; % de preguntas donde la correcta quedó como la más larga.
