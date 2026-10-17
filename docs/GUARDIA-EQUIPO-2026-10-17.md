# Manejo básico de guardia y práctica grupal

Piloto académico para adultos. Debe pasar revisión docente y adaptación al protocolo institucional antes de usarse para formación hospitalaria. No determina habilitación laboral.

## Entrada por función

`/guardia.html` ofrece personal médico y personal no médico de guardia. Cada recorrido tiene siete temas, 21 preguntas con cinco opciones y siete secuencias de tres decisiones. Las secuencias reutilizan preguntas del tema; no constituyen catorce historias clínicas independientes. Orden: triage, deshidratación, síncope, arritmias, shock, sepsis, politrauma.

El recorrido no médico trabaja reconocimiento, aviso y coordinación. Enfermería, técnicos y recepción no tienen el mismo alcance. El tutor recibe una instrucción explícita de respetar esa diferencia. La referencia de triage es IITT (OMS); no se intercambia automáticamente con Manchester o ESI. Cada tema contiene fuentes públicas; contenido original, pendiente de validación docente.

La teoría, práctica, repaso, tutor y XP utilizan el motor existente, con progreso separado por curso. Las evaluaciones registradas se corrigen en servidor y son independientes del XP de práctica.

## Evaluaciones registradas

Cuenta y consentimiento antes de cada intento. Tres preguntas por tema, orden aleatorio de preguntas y opciones, corrección al entregar, aprobación 3/3. Un intento vence tras una hora. Entregas duplicadas devuelven el mismo resultado. El historial conserva una aprobación previa aunque otro intento falle. Siete temas aprobados completan el recorrido.

`/formacion-admin.html`: sólo administradores autenticados; muestra usuario, recorrido, aprobación y último resultado por tema. No hay cohorts, supervisión de examen, control de identidad ni acreditación práctica. El banco es público y permite estudiar respuestas: no debe usarse como única prueba de competencia laboral.

## Salas privadas

`/salas.html`: 2–4 cuentas, código aleatorio, vida de 24 horas. Votos ocultos hasta que todos eligen. Cooperación: chat y decisión grupal confirmada por creador. Desafío: comparación de aciertos individuales. No se premia velocidad; no da puntos de compra ni aprobación registrada.

Chat escrito; el dictado depende del teclado del dispositivo, no hay audio integrado. Máximo 500 caracteres por mensaje y 60 mensajes por sala. Usuario, votos y mensajes compartidos sólo con miembros. Mensajes escapados al renderizar. Actualización cada siete segundos, versiones para evitar escrituras simultáneas, reanudación con la misma cuenta. Si alguien abandona antes de votar, el coordinador puede cerrar y crear otra sala; no hay expulsión ni transferencia de coordinador en este piloto.

## Persistencia y privacidad

Dos tablas nuevas con claves foráneas a cuentas, sin borrar datos existentes. No requiere nuevas variables ni servicios. Aprobaciones sólo del propio usuario o administrador; salas sólo para integrantes. La exportación incluye evaluaciones recientes y mensajes propios de salas activas. Eliminar cuenta elimina sus evaluaciones y salas donde participa. Salas vencidas dejan de estar accesibles inmediatamente y se limpian periódicamente; intentos no entregados se limpian después de un día.

## Validación

44 pruebas automáticas: separación de cursos, progreso, permisos, origen/sesiones existentes, calificación servidor, duplicados, conservación de aprobación, votos ocultos, versiones, chat, propietario, capacidad, caducidad, exportación y eliminación. Análisis de sintaxis de backend y frontend. Prueba visual de accesos públicos tras publicación. El flujo multiusuario se verifica con cuentas sintéticas y base local, sin datos reales.

Sin cambios de cobros, campañas ni infraestructura paga.
