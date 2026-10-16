# Validación de esta entrega

- `npm test`: diez pruebas de motor/API/servidor y un recorrido del controlador de interfaz con DOM simulado.
- `npm run check`: sintaxis de módulos educativos, interfaz y funciones.
- Recorridos del controlador: navegación, completar lección, persistencia, protección ante doble respuesta, caso con error y reintento hasta el debriefing, repaso, identificación ECG y error de configuración del tutor.
- Servidor: entrada principal y consultorio accesibles, módulos con MIME correcto, funciones y ZIP fuera del directorio público.
- API: autenticación, métodos, formato, límites, falta de configuración, corpus elegido en servidor y errores del proveedor sin detalles internos. El proveedor se simuló; no hubo consulta facturada ni validación de un modelo real.

**No se completó la validación visual en navegador.** Playwright está instalado en el entorno pero no tiene binario de navegador. La descarga de Chromium devolvió un archivo inválido y no pudo instalarse. Por lo tanto no se afirma haber comprobado visualmente Safari/iPhone ni ausencia de desbordes. Hay CSS adaptable para móvil, pero requiere revisión visual real.

No se verificó despliegue en Netlify ni se configuraron credenciales. Las pruebas locales no acreditan disponibilidad del hosting ni validez clínica de los contenidos.
