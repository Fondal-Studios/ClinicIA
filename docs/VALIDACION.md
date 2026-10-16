# Validación — 16/10/2026

- `npm test`: 21 pruebas del motor, catálogo, API, servidor, interfaz, simulacros y mercado.
- `npm run check`: sintaxis de módulos y funciones. `git diff --check`: sin errores de espacios.
- Catálogo: seis cursos, 80 temas y 280 preguntas; se conservan nueve casos y nueve patrones ECG.
- Simulacros: selección sin duplicados, cobertura de ocho áreas, opciones mezcladas, plazo, respuestas modificables, omisiones, restauración y corrección al entregar.
- Puntos: sin recompensa al repetir inmediatamente, bonificaciones únicas por tema/curso, repaso vencido limitado a cinco puntos diarios, saldo y compras sin duplicados.
- Playwright con Chromium: móvil 390×844 y escritorio 1440×1000. Se verificaron navegación de seis cursos, teoría separada, simulacro guardado tras recarga, corrección única, imágenes del mercado, compra, persistencia y escape del nombre. Sin errores JavaScript ni desborde horizontal en los recorridos comprobados. Capturas revisadas de inicio y mercado; no se afirma prueba en Safari físico.
- Consultorio oculto en navegación; archivo y almacenamiento previo conservados. No se activa ningún muro de pago.
- API: autenticación, límites y corpus por curso; proveedor simulado, sin llamadas facturadas. El tutor selecciona hasta seis temas relevantes en el recorrido amplio.

Prueba de navegador opcional: `node tools/browser-smoke.mjs`, con Playwright y Chromium instalados; admite `PLAYWRIGHT_MODULE` y `CHROME_BIN`.

No se verificó el despliegue público ni se configuraron credenciales. La revisión funcional no sustituye validación clínica/docente. El banco es una primera cobertura amplia, no el temario oficial completo.

## Tutor activo y guardia

21 pruebas actualizadas: API sin clave de piloto, contexto de guardia y continuidad de mensajes, rechazo de modo inválido y errores del proveedor. Chromium: corrección con personaje, consulta dentro de ejercicio, plantillas de guardia, conversación de dos turnos con proveedor simulado, falta de configuración y referencias sin IA; sin persistencia del texto clínico en localStorage. No se realizó consulta a un modelo real.

Se verificó HTTP 200 en la página pública de GitHub Pages antes de esta entrega; esa plataforma no sirve el backend conversacional. La conexión de IA en hosting con servidor sigue pendiente.
