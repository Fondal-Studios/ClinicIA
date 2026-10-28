# Calidad del banco de preguntas (2026-10-26)

`tools/audit-questions.mjs` ejecuta **50 simulaciones por curso**. En cada ronda reordena las alternativas, como la aplicación, y un panel de «examinados sin conocimiento médico» responde todo el banco usando un solo indicio de estilo: la más larga, la más corta, la que comparte palabras con el enunciado, la más parecida a las otras, la distinta, la más específica (cifras y paréntesis), descartar absolutos, y —como dato informativo— copiar de la teoría.
- **Sesgo del banco**: un indicio que supera claramente el 20 % del azar en todo el curso.
- **Pregunta deducible**: varios indicios independientes coinciden en la misma respuesta.
- **Incoherencia estructural**: alternativas duplicadas o vacías, clave inválida, fundamento ausente o que habla de otra alternativa, respuesta escrita en el enunciado, una alternativa contenida en otra, longitudes 3×, «todas/ninguna», pistas cruzadas entre preguntas, preguntas casi duplicadas.
Uso: `node tools/audit-questions.mjs [--course id] [--rounds 50] [--json salida.json] [--strict]` (`npm run audit:questions` falla ante errores estructurales). `tools/check-expansion.mjs` hace la misma comprobación sobre archivos de preguntas nuevos antes de incorporarlos.

## Resultado inicial del banco previo (378 preguntas, 11 cursos)
- 65 preguntas marcadas (17 %): 32 deducibles por estilo y 34 con alguna incoherencia estructural (fundamento breve o que no sustenta la alternativa correcta, longitudes dispares).
- Sesgos de curso: la alternativa **más corta** supera el azar en Examen Único, ACLS, PALS, FCCS y Revalida; **la más larga** en las guardias (46 % y 40 %) y neonatal (48 %); **la más parecida a las demás** en Examen Único y FCCS (34–43 %), señal de distractores escritos como variaciones de la correcta.
- ProATI (300 preguntas): sin sesgo de curso; 28 preguntas marcadas (9 %), la mayoría por dos o tres indicios coincidentes.

## Límites
Son heurísticas de **estilo**, no validación clínica: detectan preguntas fáciles de deducir o mal formadas, no medicina incorrecta. Una pregunta marcada puede ser correcta; una no marcada puede estar mal.
