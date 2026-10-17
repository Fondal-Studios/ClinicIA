# Segunda ronda de pruebas de ClinicIA — 17/10/2026

## Fallos reproducidos y cambios

- En la página pública, responder mal en «El niño que se agota» y recargar perdía el recorrido. Ahora los casos guardan un borrador independiente con decisiones, paso y orden de opciones. «Retomar caso» reconstruye la corrección; el guardado usa el progreso existente de invitado o cuenta.
- La restauración valida versión y secuencia de decisiones. Recalcula errores y explicaciones desde el banco, descarta estados inválidos y no restaura conversaciones IA.
- El resumen distingue aciertos al primer intento de errores corregidos y muestra los pasos que conviene reforzar. Se aclara que los casos no otorgan puntos.
- La respuesta asíncrona de un reporte ya no modifica otra pregunta ni accede a una sesión cerrada. Se evita enviar duplicados mientras espera.
- El botón de ECG desde un curso sin preguntas ECG entra directamente al ejercicio ACLS, en lugar de dejar al estudiante en el listado.
- Durante una consulta IA el campo queda deshabilitado para evitar que una respuesta tardía borre un nuevo mensaje escrito mientras esperaba.

## Verificación

39 pruebas automáticas aprobadas y comprobaciones de sintaxis aprobadas. La batería incluye los 12 casos: error, corrección, avance, recuperación por serialización en cada paso, rechazo de datos inválidos y fin del recorrido. Las pruebas de interfaz cubren cambio de curso, ida y vuelta a un caso, reportes demorados al avanzar/salir y entrada directa a ECG.

No se agregaron preguntas ni se modificaron recomendaciones clínicas en esta ronda. Estas pruebas funcionales no equivalen a revisión docente del banco. Los cobros siguen desactivados.
