# ClinicIA

Piloto independiente de entrenamiento clínico para profesionales. Examen Único es el recorrido principal: 40 temas, 160 preguntas originales y ocho áreas, con teoría, tarjetas, repaso y simulacros de 20, 50, 100 y 160 preguntas. Incluye también ACLS, PALS, FCCS, PHTLS y ATLS: ocho temas y 24 preguntas por trayecto. Revalida agrega un módulo introductorio en español de 5 temas y 20 preguntas. Total: siete cursos, 85 temas y 300 preguntas, además de nueve casos y nueve patrones ECG sintéticos.

El mercado permite canjear puntos de estudio por cuatro compañeros de La Horda y dos marcos, equiparlos y darles un nombre. Todo el contenido permanece abierto para pruebas; no hay pagos ni bloqueo tras preguntas.

Teoría, práctica y repaso tienen pantallas separadas. La práctica muestra la explicación y la referencia únicamente después de responder; las opciones cambian de orden. La teoría incluye ejemplos resueltos explícitos. Leer no acredita una evaluación aprobada.

**Mi consultorio** (`public/consultorio.html`) está activo y visible desde el inicio: carga de pacientes por dictado de voz (datos personales, antecedentes, motivo de consulta, enfermedad actual y plan/tratamiento), con IA para ordenar el dictado y revisión del profesional antes de guardar. Antes estaba oculto; se conserva, con la misma clave de almacenamiento `clinia_v1`. El progreso educativo usa otra clave y no lee pacientes.

## Ejecutar

Requiere Node 22 o posterior, sin dependencias de instalación.

```sh
npm start
npm test
npm run check
```

Abrir http://localhost:3000. Las lecciones y los escenarios no requieren proveedor de IA. El servidor local publica exclusivamente `public/` y también sirve `/api/tutor`.

## Publicar en Netlify

El repositorio incluye `netlify.toml`: directorio público `public`, funciones `netlify/functions`, sin paso de compilación. Configurar en el entorno del proveedor, nunca en el repositorio:

- `CLINIC_ACCESS_TOKEN`: permanece requerida para las funciones clínicas heredadas. El tutor de pruebas está abierto sin clave y limita las llamadas al proveedor a 60 por hora por instancia; no es un control distribuido de facturación.
- `ANTHROPIC_API_KEY`: credencial del proveedor.
- `ANTHROPIC_MODEL`: identificador de modelo habilitado en esa cuenta. No se presupone disponibilidad de un modelo específico.
- `PATIENT_VAULT_KEY`: clave de 32 bytes (`openssl rand -hex 32`) para guardar cifrados, sólo en el servidor, los datos personales de los pacientes de Mi consultorio (requiere cuentas). Ver `docs/PRIVACIDAD-CONSULTORIO.md`.
- `LEGACY_CLINICAL_ENABLED=false`: desactiva la IA del consultorio (por defecto está activa). Si `CLINIC_ACCESS_TOKEN` tiene 24+ caracteres, el consultorio pide esa clave; sin ella, la IA queda abierta con un tope de 240 consultas por hora por instancia. Funciona con `GROQ_API_KEY` o con `ANTHROPIC_API_KEY` y `ANTHROPIC_MODEL`.

El tutor responde 503 de forma explícita cuando no está configurado; no simula respuestas de IA. Al enviar una pregunta, su texto se comparte con Anthropic. El tutor recibe material del curso desde el servidor; no acepta bibliografía enviada por el navegador. Sus respuestas son generadas y requieren revisión.

La raíz del repositorio redirige a `public/` para navegación estática. El tutor requiere el servidor Node o Netlify; GitHub Pages por sí solo no ejecuta funciones.

## Estado real

Listo para ejecutar y revisar como **piloto educativo local**. Contenido redactado para esta aplicación con fuentes AHA/AAP 2025, SCCM/SSC 2026 y referencias de cuidados críticos enlazadas, consultadas el 16 de octubre de 2026; **pendiente de validación docente**. No es un curso oficial, certificación AHA, herramienta diagnóstica ni sistema para dirigir una emergencia real.

El progreso es local y exportable; no hay cuentas, sincronización, pagos ni ranking multijugador. El mapa ordena las competencias del propio usuario por evidencia y cobertura, no por horas ni XP. Las simulaciones son recorridos de decisiones con devolución, no un modelo fisiológico ni entrenamiento de destreza manual. El laboratorio ECG usa ilustraciones sintéticas y no analiza archivos clínicos.

Para comercializar: cuentas y aislamiento por usuario, base de datos, control de acceso individual, límites de consumo distribuidos, recuperación/importación de progreso, validación clínica/editorial, controles de privacidad y pagos. Las consultas abiertas del piloto usan un límite por instancia; antes de escalar se necesitan autenticación individual y cuotas distribuidas.

Ver `docs/RESIDENCIAS.md`, `docs/MONETIZACION.md`, `docs/AUDITORIA.md`, `docs/PROVENANCE.md` y `docs/VALIDACION.md`.

## Tutor activo y Tu guardia ahora

El personaje aparece por defecto, corrige prácticas y casos con el contenido editorial y participa en la devolución de simulacros. El botón de explicación abre la conversación dentro de la pregunta. Los cuatro personajes pueden previsualizarse gratis, sin alterar compras o puntos; la selección de prueba dura mientras la página siga abierta.

“Tu guardia ahora” agrega un chat para profesionales, plantillas de consulta/pase y búsqueda local de referencias. La conversación mantiene contexto efímero, se borra al salir de sección o pulsar Borrar conversación y no entra en la exportación ni en el almacenamiento de pacientes. Enviar al proveedor comparte hasta seis mensajes recientes; el proveedor puede aplicar sus propias políticas de retención. No se promete privacidad del proveedor como si fuera almacenamiento exclusivamente local.

La IA necesita servidor Node/Netlify y las variables ANTHROPIC_API_KEY y ANTHROPIC_MODEL. GitHub Pages únicamente sirve la interfaz, las correcciones editoriales y la búsqueda local; no ejecuta /api/tutor. No hay respuesta simulada que se presente como IA. “Tu guardia ahora” es un piloto de apoyo al razonamiento pendiente de validación clínica, no un sistema aprobado para conducir atención.


## Demo para compartir — 16/10/2026

Abrir `public/#examen-unico/demo` en GitHub Pages o `/#examen-unico/demo` en Node/Netlify. El demo guía una sesión de tres preguntas, corrección, repaso y acceso a Mi primera guardia. Compartir utiliza el menú del dispositivo o copia el enlace; no incluye progreso ni conversaciones.

Se conserva el trabajo de `codex/active-tutor-guard`, ya fusionado en main antes de esta intervención. No se duplican los chats ni sus endpoints.

Revalida es un módulo inicial, no preparación integral. MIR y ENARM aparecen como objetivos con acceso explícito a la base común: todavía no tienen bancos propios. No se agregan preguntas clonadas para inflar cifras. Cada curso dispone de una evaluación integral de su banco actual. El simulacro extendido de residencias usa 160 preguntas únicas; no se presenta como formato oficial.

Validación: pruebas de API, aislamiento de cursos, restauración del simulacro, navegación del demo y correcciones. Revisión visual en navegador pendiente en esta ejecución. Ver `docs/DEMO-LANZAMIENTO.md` para los requisitos restantes de venta.
