# Acceso, cobro y devoluciones (actualizado 2026-11-23)

## Modelo
| Qué | Precio de referencia | Cómo se cobra |
|---|---|---|
| **Alumno** | **Gratis** | — |
| Cursos de certificación (ACLS, PALS, FCCS, PHTLS, ATLS, AMLS, EPC) | USD 2,99 por curso | Pago único, acceso permanente (10 años) |
| **Instructor** | USD 5 por mes | 30 días; se renueva pagando de nuevo |
| **Profesional** | USD 10 por mes | 30 días; incluye Instructor y **Mi consultorio** |
Rotantes, curso policial, refuerzos, minicursos, kinesiología, enfermería, nutrición, medicina integral, exámenes de ingreso y reválida: **gratis**.
La lista de cursos de pago y los precios USD están en `public/learn/precios.mjs`; cambiar un curso de pago o un precio de referencia es editar ese archivo (o las variables `CLINICIA_PLAN_<CURSO|INSTRUCTOR|PROFESIONAL>_USD`).

## Variables en Render para cobrar
`MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `CLINICIA_PRICE_CURSO_ARS`, `CLINICIA_PRICE_INSTRUCTOR_ARS`, `CLINICIA_PRICE_PROFESIONAL_ARS` (pesos; actualizar con el tipo de cambio), `CLINICIA_PRODUCT_TITLE`, `CLINICIA_PRODUCT_DESCRIPTION`, `CLINICIA_SELLER_NAME`, `CLINICIA_SUPPORT_EMAIL`, `CLINICIA_PAYMENTS_ENABLED=true`. Bloqueo: `CLINICIA_PAYMENTS_ENABLED` activa el cobro y `CLINICIA_PAYWALL=true` activa el bloqueo (apagado por defecto = piloto abierto).

## Qué se bloquea de verdad y qué no
- **Servidor (real):** crear grupos, aulas y clases con IA → Instructor o Profesional. El administrador nunca se bloquea.
- **Pantalla (blando):** los cursos de pago muestran una pantalla de compra; **la teoría y las preguntas igual viajan al navegador**, y las preguntas de esos cursos también están en la práctica general. Un usuario técnico puede saltarse el bloqueo. Para cerrarlo de verdad hay que servir esos cursos desde el servidor tras comprobar la compra (trabajo aparte).
- **Mi consultorio:** el bloqueo es del navegador; los datos son locales, así que no hay un secreto que proteger del servidor.

## Cobro mensual
«Mensual» hoy es un pase de 30 días que se renueva pagando otra vez. El cobro automático requiere **Suscripciones de Mercado Pago** (otro flujo y otros avisos de pago): pendiente, y hay que probarlo en modo de pruebas antes de activarlo.

## Panel de cuentas (`/admin-cuentas.html`)
Lista y busca cuentas, muestra Instructor, Profesional y cursos comprados, **libera sin cobro** un producto (Instructor, Profesional o un curso de pago) por 30 días a 10 años con una nota, lo quita cuando quieras y activa o quita los modos instructor e institución. Las liberaciones quedan en `clinic_grants`.

## Devoluciones
`/devoluciones.html`: botón de arrepentimiento (10 días corridos desde la aprobación). Registra el pedido (`clinic_withdrawals`); el administrador lo ve en `GET /api/admin/withdrawals` y devuelve el dinero a mano desde Mercado Pago.

## Pendiente
Revisión legal de términos y privacidad, facturación electrónica, prueba en el modo de pruebas de Mercado Pago, suscripciones automáticas, servir los cursos de pago desde el servidor.
