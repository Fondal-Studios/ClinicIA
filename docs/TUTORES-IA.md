# Tutores académicos con personalidad

## Implementado

- Ynara: cálida, explicaciones de un concepto por vez y próximos pasos pequeños.
- Aelith: socrática, justificación y comparación de opciones.
- Morveth: metódico, bloques breves y objetivos concretos.
- Veyra: enérgica, retos medibles sin culpabilizar.

Personalidad seleccionada en servidor por un ID conocido. Los estilos no modifican los criterios médicos del banco. El personaje acompaña correcciones editoriales y, cuando hay proveedor conectado, el prompt de conversación. El resumen de estudio incluye solamente cantidades de preguntas exploradas, total, errores y repasos pendientes; se valida y limita en servidor. No hay recuerdos inventados ni notificaciones fuera de la aplicación. Los recordatorios locales funcionan sin IA y se distinguen de respuestas generadas.

## Conexión preparada: Groq Free

Documentación verificada el 16/10/2026: https://console.groq.com/docs/quickstart y https://console.groq.com/docs/billing-faqs . El nivel gratuito requiere cuenta y API key; tiene límites de solicitudes/tokens. No implica acceso ilimitado ni se garantiza que una cuenta previamente paga deje de cobrar.

Variables del servidor:
- TUTOR_PROVIDER=groq
- GROQ_API_KEY: secreto de la cuenta, solo en servidor.
- GROQ_MODEL=llama-3.3-70b-versatile (predeterminado; verificar disponibilidad de la cuenta).

La API conserva compatibilidad con Anthropic mediante TUTOR_PROVIDER=anthropic, ANTHROPIC_API_KEY y ANTHROPIC_MODEL. No cambia a un proveedor pago automáticamente si falla Groq. Devuelve 429 ante cuota excedida; no presenta respuestas cortadas como completas.

GitHub Pages sigue sin ejecutar funciones. Se necesita desplegar el servidor existente en Node/Netlify y abrir esa dirección, o configurar un backend seguro. La credencial no debe incluirse en el JS público. No se configuró una cuenta Groq ni se verificó inferencia real en esta entrega.

## Alcance

Uso académico, repaso y escenarios ficticios; puede contener errores. Mi primera guardia es práctica de razonamiento, no dirección automatizada de atención real. El aviso no garantiza precisión clínica. Las respuestas requieren contrastación y el contenido sigue pendiente de validación docente.

## Pruebas

Pruebas para cuatro perfiles, conteos inválidos, solicitud Groq, credenciales solo servidor, cuota, truncamiento y proveedor sin configurar. Ejecución mediante GitHub Actions; el entorno local de esta sesión no está disponible.
