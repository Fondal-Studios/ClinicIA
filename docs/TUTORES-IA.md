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

## Búsqueda web y creador de clases (2026-10-17)
- **Fuentes gratuitas sin clave**: Europe PMC (literatura con resumen), MedlinePlus en español (NLM) y Wikipedia en español. Se consultan en servidor (`netlify/lib/web-search.js`); si una falla, las otras siguen. Son material externo: se muestran con su proveedor y enlace, sin presentarse como validadas. Wikipedia no es revisada por pares y queda al final del orden.
- **Chat del tutor**: usa la web cuando el usuario marca «Buscar también en la web» o cuando el banco no tiene nada relevante (antes respondía que no había material). El tutor cita los IDs `W#` y distingue banco de web. Las consultas de pacientes siguen sujetas a las reglas del modo guardia. Cuando se busca, el texto de la pregunta (reformulado por el proveedor de IA en consultas de búsqueda) sale hacia Europe PMC, MedlinePlus y Wikipedia: no escribir datos de pacientes.
- **Crear una clase** (`/clase.html`, `POST /api/tutor-class`): el pedido se convierte en consultas de búsqueda, se recuperan fuentes y la IA devuelve teoría, preguntas de 5 opciones, un caso ficticio y un juego de unir conceptos. El servidor descarta todo lo mal formado o sin cita a una fuente recuperada y se niega a crear la clase si no hay fuentes. Resultado: «borrador-ia», se guarda en el navegador y se descarga como JSON. Cuenta como 5 consultas del límite de 60 por hora por instancia.
- **Límites conocidos**: la calidad depende de los extractos (resúmenes, no textos completos); no hay búsqueda de guías en PDF ni de sitios institucionales; la generación puede tardar hasta ~1 minuto, por lo que en funciones de Netlify con límite de 10–26 s conviene usar el servidor Node (Render). Ninguna clase está validada por docentes. Los endpoints externos no pudieron probarse en vivo desde el entorno de desarrollo (red restringida): las pruebas usan respuestas simuladas con el formato documentado de cada API.
