# Tutores académicos con personalidad

## Implementado

- Ynara: cálida, explicaciones de un concepto por vez y próximos pasos pequeños.
- Aelith: socrática, justificación y comparación de opciones.
- Morveth: metódico, bloques breves y objetivos concretos.
- Veyra: enérgica, retos medibles sin culpabilizar.

Personalidad seleccionada en servidor por un ID conocido. Los estilos no modifican los criterios médicos del banco. El personaje acompaña correcciones editoriales y, cuando hay proveedor conectado, el prompt de conversación. El resumen de estudio incluye solamente cantidades de preguntas exploradas, total, errores y repasos pendientes; se valida y limita en servidor. No hay recuerdos inventados ni notificaciones fuera de la aplicación. Los recordatorios locales funcionan sin IA y se distinguen de respuestas generadas.

## Conexión preparada: Groq Free

Documentación verificada el 16/10/2026: https://console.groq.com/docs/quickstart y https://console.groq.com/docs/billing-faqs . El nivel gratuito requiere cuenta y API key; tiene límites de solicitudes/tokens. No implica acceso ilimitado ni se garantiza que una cuenta previamente paga deje de cobrar.

Variables del servidor:
- TUTOR_PROVIDER=groq
- GROQ_API_KEY: secreto de la cuenta, solo en servidor.
- GROQ_MODEL=llama-3.3-70b-versatile (predeterminado; verificar disponibilidad de la cuenta).

La API conserva compatibilidad con Anthropic mediante TUTOR_PROVIDER=anthropic, ANTHROPIC_API_KEY y ANTHROPIC_MODEL. No cambia a un proveedor pago automáticamente si falla Groq. Devuelve 429 ante cuota excedida; no presenta respuestas cortadas como completas.

GitHub Pages sigue sin ejecutar funciones. Se necesita desplegar el servidor existente en Node/Netlify y abrir esa dirección, o configurar un backend seguro. La credencial no debe incluirse en el JS público. No se configuró una cuenta Groq ni se verificó inferencia real en esta entrega.

## Alcance

Uso académico, repaso y escenarios ficticios; puede contener errores. Mi primera guardia es práctica de razonamiento, no dirección automatizada de atención real. El aviso no garantiza precisión clínica. Las respuestas requieren contrastación y el contenido sigue pendiente de validación docente.

## Pruebas

Pruebas para cuatro perfiles, conteos inválidos, solicitud Groq, credenciales solo servidor, cuota, truncamiento y proveedor sin configurar. Ejecución mediante GitHub Actions; el entorno local de esta sesión no está disponible.

## Búsqueda web y creador de clases (2026-10-17)
- **Fuentes gratuitas sin clave**: Europe PMC (literatura con resumen), MedlinePlus en español (NLM) y Wikipedia en español. Se consultan en servidor (`netlify/lib/web-search.js`); si una falla, las otras siguen. Son material externo: se muestran con su proveedor y enlace, sin presentarse como validadas. Wikipedia no es revisada por pares y queda al final del orden.
- **Chat del tutor**: usa la web cuando el usuario marca «Buscar también en la web» o cuando el banco no tiene nada relevante (antes respondía que no había material). El tutor cita los IDs `W#` y distingue banco de web. Las consultas de pacientes siguen sujetas a las reglas del modo guardia. Cuando se busca, el texto de la pregunta (reformulado por el proveedor de IA en consultas de búsqueda) sale hacia Europe PMC, MedlinePlus y Wikipedia: no escribir datos de pacientes.
- **Crear una clase** (`/clase.html`, `POST /api/tutor-class`): el pedido se convierte en consultas de búsqueda, se recuperan fuentes y la IA devuelve teoría, preguntas de 5 opciones, un caso ficticio y un juego de unir conceptos. El servidor descarta todo lo mal formado o sin cita a una fuente recuperada y se niega a crear la clase si no hay fuentes. Resultado: «borrador-ia», se guarda en el navegador y se descarga como JSON. Cuenta como 5 consultas del límite de 60 por hora por instancia.
- **Límites conocidos**: la calidad depende de los extractos (resúmenes, no textos completos); no hay búsqueda de guías en PDF ni de sitios institucionales; la generación puede tardar hasta ~1 minuto, por lo que en funciones de Netlify con límite de 10–26 s conviene usar el servidor Node (Render). Ninguna clase está validada por docentes. Los endpoints externos no pudieron probarse en vivo desde el entorno de desarrollo (red restringida): las pruebas usan respuestas simuladas con el formato documentado de cada API.

## Aulas: crear, editar, compartir y evaluar (2026-10-17)
Flujo del docente (`/aulas.html`, requiere cuenta): pide una clase al tutor → el servidor busca en la web, la IA arma teoría, **presentación**, preguntas, caso ficticio y juego → queda como **borrador** que el docente edita (título, objetivos, secciones, diapositivas, preguntas con las 5 opciones, caso, pares del juego; agregar, eliminar, reordenar y **regenerar con IA** cada elemento con una indicación) → fija el porcentaje de aprobación (50–100, por defecto 80) y una fecha límite → **publica** → comparte el **código de 8 caracteres**.
- **Roles**: dueño (todo), colaborador (entra con un segundo código: edita, no publica ni cambia aprobación/códigos) y alumno (entra con el código, tras aceptar que el docente verá su usuario y resultados). Sólo se une a aulas publicadas; retirar la publicación bloquea el acceso; se pueden rotar los códigos y quitar integrantes.
- **Evaluación**: práctica (no cuenta) y evaluación (cuenta). Las preguntas y las opciones se mezclan en cada intento y **se corrigen en el servidor**; el navegador del alumno nunca recibe las respuestas correctas (sí las del juego de unir conceptos, que es una actividad de repaso). Se registra el mejor resultado; «aprobado» = alguna evaluación ≥ porcentaje vigente al momento de entregar. Cada intento guarda una copia de las preguntas, por lo que editar el aula no altera intentos abiertos. Los intentos vencen a la hora.
- **Panel del docente**: alumnos, evaluaciones realizadas, mejor resultado, estado y última actividad, más el porcentaje de aprobados.
- **Presentación**: visor dentro de la aplicación (diapositivas con notas y fuentes, pantalla completa, teclas ← →) e impresión/PDF desde el navegador. No se exporta a .pptx.
- **Límites y controles**: 30 aulas por docente, 300 integrantes por aula, 6 borradores de IA y 40 regeneraciones por hora por usuario, 60 intentos al día. Todo contenido se valida y se limita en el servidor antes de guardarse (enlaces sólo https, tamaños, 5 opciones únicas).
- **Pendiente**: constancia/PDF verificable al aprobar, recordatorios por fecha límite, grupos y asignaciones por curso, exportar notas, y revisión docente de los borradores de IA. Eliminar la cuenta del docente elimina sus aulas.
- **Prueba**: `tools/aulas-browser-smoke.mjs` recorre en un navegador real el flujo completo (crear con el tutor, editar, regenerar, guardar, publicar, unirse, jugar, reprobar y aprobar, ver el progreso) contra una base PostgreSQL en memoria y respuestas simuladas de IA y web: `PLAYWRIGHT_MODULE=... CHROME_BIN=... node tools/aulas-browser-smoke.mjs`.

## Conexión del tutor y diagnóstico (2026-10-18)
- `GET /api/tutor` informa `{configured, provider, message}` sin revelar claves; la pantalla del tutor lo consulta y muestra «La IA no está conectada» con el motivo cuando falta configuración. Para comprobar el servidor a mano: abrir `https://<servidor>/api/tutor`.
- La copia estática de GitHub Pages (`*.github.io`) ya no muestra el chat como «pendiente»: llama al servidor de Render (`https://clinicia-0fft.onrender.com`, según `docs/CUENTAS-Y-LANZAMIENTO.md`) por CORS. Sólo `/api/tutor` admite CORS, sin cookies; las rutas de cuentas y aulas siguen siendo del mismo origen. Orígenes permitidos: `TUTOR_CORS_ORIGINS` (lista separada por comas; por defecto `https://drmarianojimenez94-sudo.github.io`).
- Si la dirección de Render es otra, cambiar `TUTOR_API` en `public/app.mjs`. El plan gratuito de Render duerme el servicio: la primera consulta puede tardar hasta un minuto.
- Configuración mínima de la IA en el servidor: `GROQ_API_KEY` (gratuita) o `ANTHROPIC_API_KEY` + `ANTHROPIC_MODEL`. Las aulas y las cuentas además requieren `DATABASE_URL`.

## Mi consultorio: dictado de pacientes (2026-10-18)
- Activo y visible desde el inicio («Mi consultorio · herramienta del profesional»). Los pacientes se guardan sólo en el navegador del dispositivo (`localStorage`, clave `clinia_v1`); no hay historia clínica en el servidor.
- **Nuevo paciente por voz**: un único dictado alimenta el formulario de datos personales (motor local + IA) y el recuadro «Dictado clínico». «Crear paciente y organizar la historia con IA» crea el paciente y una primera consulta en borrador que pasa por el mismo flujo de revisión: la IA ordena motivo de consulta, enfermedad actual, antecedentes (personales, quirúrgicos, alergias, medicación habitual, familiares, hábitos), estudios y **plan y tratamiento**; el profesional corrige, agrega los antecedentes al perfil («Agregar todos») y guarda. Si la IA falla, se usa el motor local de respaldo con aviso.
- **Servidor**: las tres funciones (`structure-consulta`, `rewrite-field` y `deidentify`; `extract-patient` se retiró: los datos personales ya no pasan por la IA) ahora funcionan con Groq o Anthropic y también bajo el servidor Node (`/.netlify/functions/*`), no sólo en Netlify. Activas por defecto; `LEGACY_CLINICAL_ENABLED=false` las apaga; con `CLINIC_ACCESS_TOKEN` configurado exigen esa clave (el navegador la pide sólo si el servidor responde 401).
- **Límites**: tope de 240 consultas por hora por instancia (no es protección de facturación); dictados de hasta 60.000 caracteres. El dictado depende del reconocimiento de voz del navegador (Chrome/Edge/Safari); no hay transcripción propia. Al usar la IA, el texto dictado —incluidos datos personales del paciente— se envía al proveedor de IA: eso, la política de privacidad y las obligaciones legales de la historia clínica quedan a cargo del profesional/institución y no fueron resueltos en esta entrega.
- Corregido: las alergias que la IA marca como «positivo» ahora se ofrecen para agregar al perfil.
- Prueba: `tools/consultorio-browser-smoke.mjs` (micrófono simulado, IA simulada, servidor real).

> Actualización 2026-10-25: los datos personales de los pacientes se guardan cifrados sólo en el servidor y no se envían a la IA. Ver `docs/PRIVACIDAD-CONSULTORIO.md`.
