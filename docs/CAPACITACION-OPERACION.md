# Capacitación policial: operación y comprobación

## Implementado

- `/capacitacion.html`: teoría, simulaciones en tríos, examen de 50 preguntas (40 correctas), reintentos ilimitados y tres refuerzos de cinco preguntas.
- PostgreSQL: grupos, solicitudes, lectura, respuestas por pregunta, intentos, prácticas, auditoría y certificados. Migraciones aditivas al iniciar el servidor.
- Alumno solicita entrar sin código; solo propietario del grupo acepta y valida sus prácticas. Activar modo Instructor no da permiso para firmar.
- Certificado hospitalario requiere teoría, examen aprobado, prácticas obligatorias y autorización del emisor. Refuerzos emiten certificado teórico con autorización del emisor, sin acreditar práctica presencial.
- Impresión/PDF desde el diálogo de impresión; registro persistente con versión y alcance. Firma electrónica por autorización de cuenta: no se inventa una imagen de firma manuscrita.
- Navegación principal educativa; consultorio conservado pero sin enlace en inicio ni barra de áreas.

## Configuración indispensable

El servidor Node existente requiere `DATABASE_URL` (PostgreSQL), `APP_ORIGIN` con el origen HTTPS exacto y, para certificados, `HOSPITAL_ISSUER_USER_ID` con el ID real verificado de la cuenta de Mariano. No usar un nombre libre enviado por el navegador. Sin ese ID, la emisión falla de forma cerrada aunque el usuario sea administrador. `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` permiten inicialización administrativa existente; no insertar contraseñas en Git.

La cuenta de Mariano y la identidad del firmante deben verificarse antes de configurar el ID. La API autenticada de capacitación devuelve el ID de la propia cuenta. No se configura un firmante suponiendo que el primer administrador es Mariano. El panel permite probar teoría, exámenes, grupos y prácticas aunque la firma no esté configurada.

No crear un segundo servidor o migrar datos existentes sin identificar la base actual. El 28/10/2026 el endpoint público `https://clinicia-heef.onrender.com/api/account/me` respondió `configured: true`; esto acredita inicialización de PostgreSQL y disponibilidad de la API, no una comprobación de backups ni una prueba de reinicio de producción.

## Pruebas

`node --test test/*.test.mjs` y `npm run check`. Prueba específica `test/capacitacion.test.mjs`: aislamiento, grupos, recuperación de respuestas, versiones concurrentes, 40/50, prácticas obligatorias, autorización exclusiva, emisión idempotente y conservación de aprobación.

`tools/qa-capacitacion.mjs` ofrece una prueba de navegador con PGlite en memoria, datos ficticios y viewport móvil/escritorio. Admite PLAYWRIGHT_MODULE, CHROME_BIN y CHROME_ARGS. Esos datos no van a producción. Capturas en /tmp. El navegador local puede no estar disponible en algunos entornos; no reportar la prueba como aprobada sin ejecución exitosa.

Los módulos siguen sujetos a revisión docente. El tiempo del examen es orientativo (60 minutos), sin bloquear respuestas al vencer: el curso prioriza continuidad y reintentos sin frustración. El guion de Gamma está en RESPUESTA-POLICIAL-GUIA-DOCENTE.md.
