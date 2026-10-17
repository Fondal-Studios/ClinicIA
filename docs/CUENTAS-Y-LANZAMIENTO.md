# Cuentas y lanzamiento

Implementación: PostgreSQL con usuarios, hashes scrypt, sesiones opacas almacenadas como hash, progreso versionado y eventos académicos. Cookies HttpOnly/Secure/SameSite=Strict, origen de escritura verificado, límites persistentes de autenticación y panel validado por rol en servidor. Cuenta inicial de administración creada únicamente mediante variables de entorno; fuerza cambio de contraseña. No hay contraseñas en el repositorio.

## Activación en el servicio existente

- Crear PostgreSQL en Virginia, mismo workspace que ClinicIA. La única instancia gratuita del workspace ya está ocupada por otro proyecto. No reutilizar ni modificar esa base.
- Usar plan básico 256 MB, 1 GB de almacenamiento, sujeto a aprobación del costo. El plan gratuito vence en 30 días; no es la opción de producción.
- Configurar `DATABASE_URL` con la conexión interna de la nueva base. Nunca publicar esa URL.
- Configurar `APP_ORIGIN=https://clinicia-heef.onrender.com`, `ADMIN_USERNAME=NanoGM`, `ADMIN_PASSWORD_HASH` con hash scrypt de la clave inicial autorizada.
- La migración crea tablas con prefijo `clinic_` al atender la primera petición de cuentas. Es idempotente. El bootstrap no restablece contraseñas existentes.
- El build existente ejecuta npm test; pretest instala dependencias con lockfile. prestart instala sólo dependencias de producción. CI instala y ejecuta pruebas con PostgreSQL embebido PGlite.
- Verificar registro de estudiante, ingreso, guardado, segundo navegador, conflictos 409, cierre de sesión, recuperación, eliminación y panel de administrador. No declarar cuentas activas antes de comprobarlos en producción.
- Habilitar y verificar copias de seguridad según el plan contratado. Realizar exportación PostgreSQL regular y prueba de restauración antes de aceptar pagos. Descargar progreso individual no sustituye backup.

## Sincronización

Invitados conservan almacenamiento local. Las cuentas cargan estado remoto; no lo mezclan automáticamente con otro usuario ni con el invitado. Una cuenta nueva puede importar explícitamente el progreso local. Un guardado incluye la versión conocida. Si otra pestaña/dispositivo ya guardó, se rechaza y se ofrece descargar la copia y cargar la versión remota. Los cambios de cuenta se mantienen en memoria hasta confirmar guardado; cerrar sin guardar advierte de posible pérdida. No hay sincronización offline automática ni persistencia local de datos de cuentas.

La restauración valida campos académicos y descarta chat/campos arbitrarios. Historial de simulacros se normaliza con el banco. Puntos, progreso e interacciones siguen siendo evidencia informada por el cliente, no una contabilidad comercial antifraude. No vender canjes ni acceso con base en ese saldo hasta agregar eventos de evaluación autoritativos e idempotencia del ledger.

## Recuperación y administración

Registro y cambio de contraseña muestran un código de recuperación privado una vez; se almacena sólo su hash. Reemplazar contraseña invalida sesiones previas y rota código. No hay correo transaccional ni verificación de email. El administrador ve altas, cuentas activas, acciones agregadas, lista de últimas 100 cuentas y fechas de guardado; no textos de tutor. Eventos se conservan 90 días. El panel no demuestra ingresos ni eficacia educativa.

## Instalación y monetización

Web instalable con manifest, iconos, botón de instalación y guía para Safari. No es un APK ni una publicación en App Store/Play Store. El service worker sólo guarda una pantalla pública sin conexión, no APIs ni páginas privadas. IA y sincronización requieren internet.

`/lanzamiento.html`: bio, textos y tres imágenes descargables para Instagram. Perfil propuesto pendiente de disponibilidad y alta; no afirmar que existe. Se necesita correo/teléfono y validación de Meta.

Cobros intencionalmente desactivados. Para lanzamiento comercial: revisión docente, responsable y soporte, oferta/precio/plazo, condiciones, cuenta Mercado Pago validada y prueba de pago/webhook/reembolso. No hay checkout ficticio, promesa de plaza ni suscripción activa. Mantener abierto el piloto como pidió el usuario hasta validación.
