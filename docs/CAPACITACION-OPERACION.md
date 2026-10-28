# Capacitación policial: operación y comprobación

## Implementado

- `/capacitacion.html`: teoría, simulaciones en tríos, examen de 50 preguntas (40 correctas), reintentos ilimitados y tres refuerzos de cinco preguntas.
- PostgreSQL: grupos, solicitudes, lectura, respuestas por pregunta, intentos, prácticas, auditoría y certificados. Migraciones aditivas al iniciar el servidor.
- Alumno solicita entrar sin código; solo propietario del grupo acepta y valida sus prácticas. Activar modo Instructor no da permiso para firmar.
- Certificado hospitalario requiere teoría, examen aprobado, prácticas obligatorias y autorización del emisor. Refuerzos emiten certificado teórico con autorización del emisor, sin acreditar práctica presencial.
- Impresión/PDF desde el diálogo de impresión; registro persistente con versión y alcance. Firma electrónica por autorización de cuenta: no se inventa una imagen de firma manuscrita.
- Navegación principal educativa; consultorio conservado pero sin enlace en inicio ni barra de áreas.

## Configuración indispensable

El servidor Node existente requiere `DATABASE_URL` (PostgreSQL), `APP_ORIGIN` con el origen HTTPS exacto y, para certificados, un ID real verificado de la cuenta administradora de Mariano: `HOSPITAL_ISSUER_USER_ID` o la vinculación inicial mediante `HOSPITAL_ISSUER_USERNAME` descrita abajo. No usar un nombre libre enviado por el navegador. Sin un ID autorizado resuelto, la emisión falla de forma cerrada aunque el usuario sea administrador. `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` permiten inicialización administrativa existente; no insertar contraseñas en Git.

La cuenta de Mariano y la identidad del firmante deben verificarse antes de configurar el ID. La API autenticada de capacitación devuelve el ID de la propia cuenta. No se configura un firmante suponiendo que el primer administrador es Mariano. El panel permite probar teoría, exámenes, grupos y prácticas aunque la firma no esté configurada.

No crear un segundo servidor o migrar datos existentes sin identificar la base actual. El 28/10/2026 el endpoint público `https://clinicia-heef.onrender.com/api/account/me` respondió `configured: true`; esto acredita inicialización de PostgreSQL y disponibilidad de la API, no una comprobación de backups ni una prueba de reinicio de producción.

## Pruebas

`npm test` y `npm run check`. `npm test` usa un proceso hijo con entorno de pruebas aislado: no hereda base, claves de proveedores, cuentas administrativas ni cuotas de producción. Las pruebas de integración inyectan PGlite y las pruebas de proveedores usan respuestas simuladas. Se verificaron las 92 pruebas incluso con una URL PostgreSQL señuelo y cuota del entorno padre de 1. Prueba específica `test/capacitacion.test.mjs`: aislamiento, grupos, recuperación de respuestas, versiones concurrentes, 40/50, prácticas obligatorias, autorización exclusiva, emisión idempotente y conservación de aprobación.

`tools/qa-capacitacion.mjs` ofrece una prueba de navegador con PGlite en memoria, datos ficticios y viewport móvil/escritorio. Admite PLAYWRIGHT_MODULE, CHROME_BIN y CHROME_ARGS. Esos datos no van a producción. Capturas en /tmp. El navegador local puede no estar disponible en algunos entornos; no reportar la prueba como aprobada sin ejecución exitosa.

Los módulos siguen sujetos a revisión docente. El tiempo del examen es orientativo (60 minutos), sin bloquear respuestas al vencer: el curso prioriza continuidad y reintentos sin frustración. El guion de Gamma está en RESPUESTA-POLICIAL-GUIA-DOCENTE.md.

## Cuentas y ampliación de evacuación — 28/10/2026

La pantalla `/capacitacion.html` usa las mismas cuentas persistentes que el resto de Clinic IA. Espera la recuperación de sesión antes de iniciar una acción y permite cambiar la contraseña inicial sin abandonar el curso. Mi cuenta muestra el rol del servidor y, para administradores, accesos a los paneles existentes. No se asignan permisos desde el navegador.

`HOSPITAL_ISSUER_USERNAME` permite vincular una cuenta administradora **ya existente** durante el arranque. La aplicación resuelve el nombre en la base y conserva su ID inmutable en `clinic_settings.hospital_issuer`. No crea ni asciende usuarios. Una reutilización posterior del nombre no transfiere la autorización. `HOSPITAL_ISSUER_USER_ID`, si está definido, tiene prioridad y también exige rol administrador. No modificar contraseñas ni copiar credenciales al repositorio. En el servicio existente se configuró el nombre autorizado NanoGM mediante Render, conservando las demás variables.

Se agregan tres minicursos independientes, cada uno con cuatro módulos, 20 preguntas originales con explicación, aprobación 16/20 y reintentos ilimitados:

- Evacuación segura de la escena.
- Preparación y acompañamiento del traslado.
- Coordinación de evacuaciones con múltiples afectados.

Los tres tienen alcance teórico; no acreditan destrezas de rescate, transporte ni triage. Las referencias están vinculadas en cada módulo. Requieren revisión docente y adecuación al protocolo local antes de usarlos institucionalmente. El catálogo compartido evita diferencias entre las preguntas del servidor y la pantalla.

Verificación realizada: 92 pruebas automáticas; base PGlite en disco cerrada/reabierta conservando cuenta, contraseña y respuesta; navegador real en 390 y 1440 px; registro y recuperación del intento al ingresar desde un contexto nuevo; cambio de contraseña inicial del administrador, rol y autorización de certificados; apertura y evaluación de los tres minicursos; sin errores JavaScript. Estas pruebas locales no equivalen a ingresar personalmente con NanoGM en producción.

Infraestructura existente identificada: servicio `srv-db9c4om1egvs73en4i2g`, PostgreSQL `dpg-db9d7ce7bikc73fjs6fg-a`, plan `0.1c-256mb`, disponible y sin conexiones externas habilitadas. No se abrió la base a Internet, no se migraron cuentas y no se creó infraestructura duplicada. La creación de un nuevo espacio llamado Clinic IA sigue siendo una tarea administrativa separada.
