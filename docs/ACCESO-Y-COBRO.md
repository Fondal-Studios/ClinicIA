# Acceso, cobro y devoluciones

## Niveles
| Nivel | Referencia | Incluye |
|---|---|---|
| Gratis | USD 0 | Curso policial, refuerzos y minicursos del catálogo de capacitación; estudio en el dispositivo |
| Alumno | USD 4,99 · 30 días | Lo gratis + exámenes y certificados del resto del catálogo (p. ej. rotaciones) |
| Instructor | USD 9,99 · 30 días | Todo lo de alumno + crear grupos, aulas y clases con IA; insignia «Instructor validado» |

## Bloqueo (apagado por defecto)
`CLINICIA_PAYWALL=true` activa el bloqueo en el servidor. Con la variable ausente todo sigue abierto (piloto).
El administrador nunca se bloquea. El servidor responde `402` con el nivel necesario.
**Límite real:** solo se bloquea lo que decide el servidor. La teoría y los 1.410 bancos de preguntas de los cursos de estudio son archivos estáticos del navegador y no se pueden ocultar sin rediseñarlos.

## Variables en Render para cobrar
`MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `CLINICIA_PRICE_ALUMNO_ARS`, `CLINICIA_PRICE_INSTRUCTOR_ARS` (pesos; actualizar con el tipo de cambio), `CLINICIA_PRODUCT_TITLE`, `CLINICIA_PRODUCT_DESCRIPTION`, `CLINICIA_SELLER_NAME`, `CLINICIA_SUPPORT_EMAIL`, `CLINICIA_PAYMENTS_ENABLED=true`. Opcional: `CLINICIA_PLAN_ALUMNO_USD`, `CLINICIA_PLAN_INSTRUCTOR_USD`.
No hay un enlace de pago fijo: cada compra genera su propio checkout de Mercado Pago desde `/pagos.html`.

## Devoluciones
`/devoluciones.html` tiene el botón de arrepentimiento (10 días corridos desde la aprobación). Registra el pedido (`clinic_withdrawals`); el administrador lo ve en `GET /api/admin/withdrawals` y devuelve el dinero a mano desde Mercado Pago.

## Pendiente
Revisión legal de `/terminos.html` y `/privacidad.html`, facturación electrónica, prueba real en el modo de pruebas de Mercado Pago, y decidir si los alumnos de un grupo de un instructor pago acceden gratis.
