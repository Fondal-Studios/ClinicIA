# Clase para primeros respondedores · 9 a 12 · guía de uso

## Qué quedó armado
- **Tres entradas** en la pantalla de inicio y en la capacitación: **Primeros respondedores · Médicos · Instructores**.
- **Entrada sin contraseña para la clase** (acceso rápido): el participante abre el enlace de la clase, escribe nombre y apellido y recibe **un usuario y un código** (`XXXX-XXXX`). Es una cuenta real y persistente en el servidor: si cambia de celular o se cierra el navegador, entra con «Entrar con mi código». Guarda su avance y las respuestas del examen.
- **Grupo con aceptación automática**: el instructor crea el grupo, copia el **enlace de la clase** y quien entra con él queda en el grupo. También puede desactivar la aceptación automática o usar **«Aceptar a todos»**. La validación de prácticas sigue siendo solo del instructor (y de supervisores vinculados).
- **Material para proyectar y usar en la clase** (panel del instructor → «Material de la clase»):
  1. **Tu PowerPoint de apertura (10 a 15 minutos)** abre la clase. `/clase-apertura.html` queda como **respaldo o guion de 10 minutos** (10 diapositivas con tiempos, notas del instructor con tecla N, pantalla completa con F, cronómetro).
  2. `/plan-clase.html`: **plan de 180 minutos** (9:00 a 12:00) con acciones del instructor y de los participantes, lista de preparación, qué decir sobre límites y plan B.
  3. `/clase-policial.html`: diapositivas por módulo y simulaciones.
  4. `/planilla-practicas.html`: **planilla de observación en papel** (A/R por práctica obligatoria, con los criterios de cada una).
- Curso, examen de 50 preguntas (40 para aprobar), tres prácticas obligatorias y certificado: ya existían; no se cambiaron sus reglas.

## Antes de la clase (15 minutos)
1. Confirmar que el servidor publicó esta versión: abrir `/clase-apertura.html` y `/api/account/me` (debe decir `"configured":true`).
2. Entrar con tu cuenta en `/capacitacion.html?perfil=instructor` → «Activar modo instructor» si lo pide.
3. Crear el grupo («Policía · clase 12/11»), dejar tildada la aceptación automática, **copiar el enlace** y probarlo desde otro celular en modo incógnito.
4. Abrir tu PowerPoint con el proyector (y guardar una copia en PDF y en el celular). En la computadora dejar abiertas las pestañas: plan, planilla y la apertura de respaldo. **No dependas de la conexión del salón para las diapositivas**: quedan en el navegador y se pueden guardar como PDF (imprimir). Probar la señal con varias personas y tener un celular con datos de respaldo.
5. Vincular a la ayudante como supervisora (panel → «Vincular supervisor») solo si ya tiene modo instructor.
6. Si va a emitir certificados esa misma cuenta debe ser la autorizada en el servidor (`HOSPITAL_ISSUER_USERNAME`); si no, los certificados quedan pendientes.

## Lo que se simuló y lo que no
- `node tools/simulate-clase.mjs 30`: 30 participantes entran a la vez con nombre y código del grupo, leen los 10 módulos, rinden el examen de 50 preguntas a la vez (uno retoma tras perder la conexión; los que desaprueban reintentan y aprueban; un intento posterior fallido **no** quita una aprobación), piden las tres prácticas, el instructor valida solo parte, y los certificados se autorizan solo a quienes cumplen todo. Resultado de la última corrida: ingreso simultáneo 0,5 s, examen de 30 personas 7,4 s, 2.686 solicitudes, latencia p95 182 ms. **Es en un solo proceso con base en memoria, sin internet real**: no mide una red con 30 celulares ni el arranque en frío del servidor de Render.
- `node tools/qa-clase.mjs` (navegador real, 390 px): las tres puertas, panel del instructor con enlace para compartir, participante que entra con solo su nombre y ve su código, el instructor lo ve sin aceptar nada, entrada desde otro celular con usuario y código, y las páginas de material. Sin errores de JavaScript ni desplazamiento horizontal.
- `test/clase-acceso.test.mjs`: acceso rápido, código como contraseña, aceptación automática y masiva, permisos solo del responsable.
- **No se probó**: con celulares reales, con el servidor de producción, ni a una persona real pasando el examen. Tampoco la base de producción (copias de seguridad, reinicio).

## Límites que conviene decir en voz alta
- La validación individual de las tres prácticas **no alcanza en 3 horas** con 30 personas y dos observadores (unos 270 minutos de observación contra unos 110 disponibles). Se valida lo observado; el resto queda pendiente en el panel para una segunda instancia. No se aprueba en bloque.
- El código del acceso rápido es corto (8 caracteres) y sirve de contraseña: es para cuentas de clase, no para proteger datos sensibles. El instructor ve los nombres que cada persona escribe.
- Contenido introductorio, pendiente de revisión docente y de adecuación a protocolos y canales locales. No hay maniquíes: no se certifica profundidad de compresiones ni ventilación.
