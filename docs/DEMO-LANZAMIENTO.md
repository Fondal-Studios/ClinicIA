# ClinicIA: demo y lanzamiento comercial

## Entregado

- Portada y catálogo por objetivo: Argentina, Revalida, MIR y ENARM, con alcance visible.
- Demo guiado y enlace compartible desde `#examen-unico/demo`.
- Revalida: 5 temas, 20 preguntas originales en español; SUS, red de atención, prioridades, diarrea infantil y orientación de preparación. Es introductorio y requiere revisión docente. Fuentes oficiales enlazadas en cada tema.
- Simulacros en todos los cursos y entrenamiento extendido de 160 preguntas en residencias. Son plantillas propias, sin equivalencia a formatos oficiales.
- Se conservan tutores, corrección editorial y chat de guardia ya integrados. El chat requiere servidor y configuración del proveedor.
- Prueba gratuita abierta; sin cobros, precios inventados, testimonios ni promesas de aprobación.

## Qué probar con médicos

1. Abrir el enlace en un teléfono y explicar en una frase qué ofrece ClinicIA.
2. Resolver tres preguntas, equivocarse en una y revisar la explicación.
3. Guardar una pregunta, abrir errores y comprobar el siguiente repaso.
4. Abrir Revalida, completar el diagnóstico y comprobar el historial al recargar.
5. Entrar en Mi primera guardia y revisar las plantillas. La conversación IA sólo se prueba en el servidor configurado, con casos ficticios.
6. Compartir el enlace. Registrar claridad, utilidad, errores de contenido y preparación por la que pagarían.

No hay analítica central ni formulario de recepción: la devolución se envía a quien compartió el demo. El progreso local no permite calcular retención global.

## Plan de una semana: condiciones para cobrar

Este plan es una secuencia de trabajo, no una promesa de estar comercialmente listo en siete días.

- Día 1: pruebas del demo y revisión de contenido con médicos. Elegir un primer producto: preparación de residencias en Argentina, hoy el banco más desarrollado.
- Día 2: corregir problemas observados y validar editorialmente el contenido que se ofrecerá. Definir alcance y precio reales.
- Días 3–4: cuentas, recuperación, datos por usuario y derechos de acceso en servidor. Revisar privacidad y límites de consumo de IA.
- Día 5: pasarela en entorno de prueba, confirmación por webhook verificado e idempotente; pagos rechazados, cancelaciones y devolución. Nunca conceder acceso por el retorno del navegador solamente.
- Día 6: compra de prueba completa, renovación si corresponde y recuperación de cuenta/progreso; comprobar costos y límites del tutor.
- Día 7: apertura limitada sólo si pasan las verificaciones anteriores. Si no, continuar beta gratuita.

Conectar una pasarela a la aplicación actual no resuelve autenticación, acceso pago ni persistencia. La página de planes sigue indicando que las compras no están disponibles.

## Expansión editorial

Revalida necesita matriz completa, revisión de protocolos brasileños, portugués y entrenamiento práctico evaluado. MIR y ENARM requieren bancos, guías y formatos específicos; los accesos actuales llevan a fundamentos compartidos y están identificados como tales. No comercializar esas categorías como preparación completa.

## Integración y verificación

Base revisada: main cfe458a, que ya incluye active-tutor-guard y clarity-conversion-design. No había PR abiertos al comenzar. Se preservaron los identificadores y el progreso anterior. Pruebas automatizadas cubren los siete cursos y restauración de las nuevas evaluaciones. La revisión visual real en navegador queda pendiente: no hubo una herramienta de navegador habilitada para QA local en este entorno.
