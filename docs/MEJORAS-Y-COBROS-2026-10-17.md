# Simulación, navegación y circuito de pagos

## Publicado en esta iteración
- Tres simulaciones originales de Examen Único, nueve decisiones con cinco opciones: interpretación de pruebas, diseños epidemiológicos y delirium hipoactivo. Cada simulación registra intentos durante la sesión, permite corregir errores y termina con devolución y acceso a teoría.
- Tres temas ampliados con nueve secciones de teoría, fórmulas y criterios de interpretación. Las fuentes se conservan en cada lección; sigue pendiente validación docente.
- Tutor contextual dentro del caso después de responder, sin revelar por adelantado los pasos siguientes en la corrección editorial.
- Plan de cinco preguntas, priorizando errores y repasos; menú principal con seis entradas y herramientas secundarias desplegables.
- Reportes de preguntas autenticados, con motivo predefinido, control de duplicados y panel de administración. Sin texto clínico libre.

## Pagos: preparado, no activado
Nueva pantalla `/pagos.html`, órdenes persistentes, creación de preferencia Checkout Pro y comprobación del pago desde el servidor. Mantiene abierto el piloto. No implementa renovación automática ni bloquea contenido. La vigencia de treinta días se registra en la orden; no se presenta como un permiso que ya limite los cursos.

La configuración requiere exclusivamente en el servidor:
- MERCADOPAGO_ACCESS_TOKEN: credencial del vendedor de ClinicIA.
- CLINICIA_PRICE_ARS: precio decimal en pesos argentinos.
- CLINICIA_PRODUCT_TITLE y CLINICIA_PRODUCT_DESCRIPTION: producto y alcance comercial explícitos.
- CLINICIA_SELLER_NAME y CLINICIA_SUPPORT_EMAIL: responsable y canal de soporte.
- CLINICIA_PAYMENTS_ENABLED=true: activación deliberada, separada de configurar credenciales.

No se configuraron estos valores ni se copió una credencial de otro proyecto. Sin configuración completa el checkout devuelve 503 y la interfaz informa que se puede estudiar gratis. Antes de activarlo: completar oferta y condiciones, probar con credenciales de prueba del vendedor y resolver facturación y tratamiento de registros de compra. No se hicieron pagos reales.

Verificación: sólo se acepta un pago consultado a la API con external_reference, vendedor, moneda e importe coincidentes. Los parámetros de retorno del navegador no prueban pago. La misma requestKey reutiliza la orden y la verificación repetida no extiende vigencia. Un reintegro verificado retira la vigencia registrada.

Limitaciones explícitas: la conciliación es iniciada por el usuario desde «Verificar estado», no hay webhook ni proceso automático; no hay integración de facturación, gestión automática de devoluciones ni control de acceso premium. El piloto permanece abierto. No anunciar estos componentes como terminados para venta masiva.

## Validación
34 pruebas automáticas: cuentas, reportes, aislamiento de órdenes, importe manipulado, vendedor incorrecto, idempotencia, reintegros simulados, planes, simulaciones, fuentes y ausencia de respuestas antes de contestar. Integración de proveedor validada con dobles de prueba; falta prueba con una cuenta de Mercado Pago real en entorno de pruebas.

## Fuentes consultadas
- NICE CG103: https://www.nice.org.uk/guidance/cg103/chapter/Recommendations
- CDC, medidas de frecuencia: https://archive.cdc.gov/www_cdc_gov/csels/dsepd/ss1978/lesson3/section2.html
- CDC, epidemiología analítica: https://archive.cdc.gov/www_cdc_gov/csels/dsepd/ss1978/lesson1/section7.html
- Mercado Pago, creación de preferencia: https://www.mercadopago.com.ar/developers/es/reference/online-payments/checkout-pro-preferences/create-preference/post
- Mercado Pago, consulta por external_reference: https://www.mercadopago.com.ar/developers/es/docs/shopify/how-tos/change-endpoint-to-get-payment-details
