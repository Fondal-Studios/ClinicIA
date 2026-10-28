# Tutor creador de clases — flujo guiado

La interfaz de Aulas en modo Profesor incorpora una entrada conversacional y dictado por voz cuando el navegador lo soporta. La instrucción natural se transforma en el parámetro `brief` del generador existente y conserva la búsqueda de fuentes, validación de JSON, persistencia en la cuenta, revisión editorial, publicación y código de invitación.

## Alcance y limitaciones
- Guarda las clases y talleres en «Mi biblioteca de clases y cursos creados» (las mismas cuentas y clases persistentes de siempre).
- Compartir con alumnos requiere publicar el aula y facilitar su código.
- No publica automáticamente cursos en el catálogo global, ni genera certificados oficiales.
- El dictado depende de SpeechRecognition del navegador, con alternativa de texto.
- La prueba real del proveedor exige servidor configurado, cuenta de profesor y API activa. No se ha ejecutado una prueba de llamada autenticada de generación con credenciales reales.
