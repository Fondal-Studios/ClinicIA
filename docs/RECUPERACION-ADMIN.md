# Recuperación operativa de una cuenta administradora

Se autoriza desde la configuración privada del servicio, nunca desde un endpoint público. `ADMIN_RECOVERY_GRANT` contiene JSON con `username`, `tokenHash` (SHA-256 de 24 bytes aleatorios expresados en hexadecimal) y `expiresAt` (ISO, futuro y máximo 48 horas). Solo una cuenta administradora ya existente puede recibirlo; no se crean ni ascienden usuarios. No guardar el código original en Git, registros o variables del servidor.

Al inicializar cuentas, se registra el hash con el ID de usuario y el estado actual de su contraseña. La operación es idempotente: reiniciar no renueva el vencimiento ni permite reutilizar el código. El código original se entrega privadamente a su dueño, quien abre `/recuperar-cuenta.html`, indica usuario/código y escribe personalmente la contraseña nueva.

El canje usa una única sentencia transaccional: consume el permiso, cambia la contraseña y el código permanente de recuperación, y revoca sesiones previas. Conserva el ID, rol, cursos y datos. Un cambio de contraseña invalida los permisos temporales anteriores. El usuario recibe un nuevo código permanente en la pantalla de éxito. Los códigos temporales tienen límite de intentos del endpoint de autenticación.

Tras entregar el permiso, limpiar `ADMIN_RECOVERY_GRANT` de la configuración cuando ya esté registrado. El permiso almacenado en PostgreSQL continúa hasta su vencimiento o uso. Nunca exponer el código mediante una ruta pública, query string, commit o log. El mensaje de arranque `administrator_recovery_ready` confirma una concesión válida sin revelar el código ni datos personales.

Validación: prueba de concurrencia/un solo uso, vencimiento, restricciones por rol, conservación del progreso, revocación de sesiones y no renovación al reiniciar. QA de navegador con datos ficticios: formulario móvil, cambio de contraseña, rol administrador conservado, sesión en cursos y rechazo al reutilizar el código.
