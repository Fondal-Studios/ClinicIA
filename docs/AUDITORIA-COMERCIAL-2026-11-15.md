# Auditoría completa de ClinicIA para comercializar · 2026-11-15

Alcance: código en `main` (3eb13ee), servicio en vivo `clinicia-heef.onrender.com`, pruebas automáticas y simulaciones. No se hicieron pagos reales ni pruebas con usuarios reales.

## Lo que se verificó y funciona
| Área | Resultado |
|---|---|
| Pruebas automáticas | 108/108 (cuentas, grupos, aulas, pagos, tutor, cursos) |
| `npm run check` · `npm audit --omit=dev` | sin errores · 0 vulnerabilidades |
| Auditoría estructural de contenido | 32 cursos, 1410 preguntas, 0 problemas bloqueantes |
| Simulación de clase | 30 personas ingresan, rinden 50 preguntas y se validan prácticas: p95 162 ms, sin errores |
| Persistencia | cuenta, código, sesión, respuestas del examen, grupo y práctica sobreviven a un reinicio (base local; ver "Pendiente" para producción) |
| Instructor ↔ alumno | grupo con código, aceptación automática o manual, avance, validación de prácticas por instructor, aislamiento entre instructores, aulas con examen calificado en servidor |
| En vivo | servicio responde 200, cuentas en base de datos, tutor IA configurado (Groq), cobros desactivados (correcto hasta configurar) |

## Lo que falta para vender (ordenado por prioridad)
### Bloquea el cobro
1. **Mercado Pago sin configurar en producción**: faltan `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `CLINICIA_PRICE_ALUMNO_ARS`, `CLINICIA_PRICE_INSTRUCTOR_ARS`, vendedor, email de soporte y `CLINICIA_PAYMENTS_ENABLED=true`. El flujo está probado solo con un simulador, nunca contra Mercado Pago real (ni sandbox).
2. **Moneda**: los precios son USD 4,99 y USD 9,99, pero Mercado Pago Argentina cobra en pesos. Hoy el monto en pesos lo fija el dueño y hay que actualizarlo con el tipo de cambio. Para cobrar en dólares a usuarios de otros países haría falta otro proveedor (PayPal, Lemon Squeezy u otro).
3. **Nada se bloquea por nivel de acceso**: se registran los niveles pagos (alumno, instructor), pero todo sigue gratis. Hay que decidir qué es gratis y qué es pago antes de activar el bloqueo.
4. **Legal**: no hay Términos y Condiciones (`/terminos.html` da 404), política de devoluciones ni botón de arrepentimiento (exigido a vendedores online en Argentina), y la política de privacidad es de "piloto". No hay facturación electrónica.
5. **Validación clínica**: todo el contenido figura como "pendiente de validación docente". Sin revisión médica firmada no conviene vender cursos ni certificados.

### Calidad de producto
6. **Preguntas**: 236 de 1410 (16,7 %) marcadas por simulaciones de "examinado sin conocimiento"; en el curso policial 15 de 50 (30 %); 115 explicaciones insuficientes; varios cursos con sesgo "la respuesta más corta".
7. **Imágenes**: 3 módulos policiales con imagen de referencia libre; 7 solo con esquemas simples (instrucciones para Runway listas).
8. **Cuentas**: no hay correo ni verificación; quien pierda su código/contraseña depende de un código de recuperación. El modo Institución y la telemetría de administrador no están hechos.
9. **Instructor "validado"**: hoy se obtiene pagando. No verifica título ni matrícula. Existe un borrador (PR #40) con verificación de credenciales por un administrador.

### Operación
10. **Infraestructura**: no verifiqué backups ni plan de la base (`0.1c-256mb`). El primer pedido al servicio tardó más de 25 s (arranque en frío). No hay endpoint de salud (`/api/health` responde 503), ni alertas, ni registro de errores.
11. **Seguridad de cabeceras**: faltan CSP, HSTS y Permissions-Policy (hay nosniff, X-Frame-Options y referrer-policy).
12. **Descubrimiento**: sin `robots.txt` ni `sitemap.xml`; sin analítica de negocio; sin canal de soporte visible.

## Lo agregado en esta rama
- Dos niveles de acceso: **alumno USD 4,99** e **instructor USD 9,99** (30 días, sin renovación automática). Los montos en pesos salen del servidor; el cliente nunca los define.
- Página `/pagos.html` con las dos opciones. El enlace de pago es el checkout de Mercado Pago que genera la app para cada orden.
- Insignia "Instructor validado" en el panel de instructor cuando el nivel instructor está vigente. Durante el piloto, crear grupos sigue abierto a todos.
- Cobros **desactivados** hasta configurar las variables.
