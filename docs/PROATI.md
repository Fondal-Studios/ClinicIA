# Curso ProATI · Terapia Intensiva (2026-10-26)

Curso `proati` de ClinicIA para estudiar terapia intensiva: **30 temas en 4 bloques, 300 preguntas**, simulacros de 20, 50, 100 y hasta 160 preguntas, tutor y repaso.

## Qué es y qué no es
- **No es el programa PROATI ni el temario de la SATI.** El sumario oficial (4 módulos de ~160 páginas por ciclo, casos clínicos, fundamentos fisiopatológicos, comentarios bibliográficos, novedades terapéuticas, rol profesional y TIC) no es público: no se pudo obtener ni se copió material de la editorial o la sociedad. La organización por temas es propia, por dominios estándar de medicina crítica, basada en guías y consensos públicos. Si tenés el sumario del ciclo, pasalo y se alinean los temas.
- No otorga puntaje de recertificación ni reemplaza el entrenamiento. Todo está marcado «pendiente de validación docente».

## Temas
**Bloque 1 · Evaluación y soporte respiratorio**: evaluación inicial y scores; insuficiencia respiratoria y gasometría; ventilación mecánica invasiva; SDRA; alto flujo y VNI; destete y extubación; asma grave y EPOC; vía aérea.
**Bloque 2 · Hemodinamia, shock y cardiovascular**: shock y lactato; monitoreo hemodinámico y fluidos; fluidos y vasopresores; sepsis; shock cardiogénico y SCA; paro y cuidados posparo; arritmias y TEP; shock hemorrágico.
**Bloque 3 · Neurocrítico, sedación, renal y metabolismo**: sedoanalgesia y ABCDEF; TCE e HTE; ACV y hemorragias; estatus epiléptico y coma; muerte encefálica y donación; lesión renal y TRR; hidroelectrolítico; ácido-base.
**Bloque 4 · Nutrición, endocrino, hematología, infecciones y gestión**: nutrición; emergencias endocrinas; hematología crítica; infecciones asociadas a la atención; hígado, abdomen y obstetricia; seguridad, ética y comunicación (Ley 26.529/26.742, I-PASS).

Cada tema tiene 330–420 palabras de teoría, un «error frecuente», 10 preguntas de 5 opciones (conocimiento, viñetas clínicas y casos difíciles) con explicación y fuente.

## Cómo se hizo (y cómo confiar en ello)
1. Redacción con IA en cinco lotes, con reglas de calidad (distractores plausibles, longitudes parejas, sin pistas).
2. **Verificación independiente** de cada lote por otra IA con búsquedas web: corrigió cifras, atribuciones y preguntas ambiguas (por ejemplo, la regla 3-3-2 de vía aérea, el umbral de bicarbonato en cetoacidosis, la numeración del CAM-ICU, tiempos de la Ley 27.447). Los registros de cambios no se versionan; los puntos que siguen sin confirmar están en `docs/PROATI-REVISION.md`.
3. **Simulaciones de estilo** (`tools/audit-questions.mjs`, 50 rondas): ninguna estrategia sin conocimiento médico supera el azar de forma sistemática en este curso.
4. Generado con `tools/build-proati.mjs` a partir de los lotes revisados → `public/learn/content/proati.mjs`.

## Limitaciones
- Ninguna persona con formación clínica revisó el curso. Las dosis, umbrales y definiciones deben confirmarse antes de usarlo para enseñar o para decisiones reales.
- Las búsquedas de verificación devolvieron resúmenes, no siempre los textos completos de las guías.
- Cuatro lecciones (ácido-base, hidroelectrolítico, y partes de vía aérea y obstetricia) se apoyan en consensos que no están entre las fuentes con enlace del curso.
