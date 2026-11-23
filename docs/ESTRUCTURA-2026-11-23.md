# Estructura de ClinicIA (23-11-2026)

**Inicio** → tres puertas: **Soy alumno**, **Soy instructor**, **Modo profesional**. Mapa único en `public/entrada.mjs`; `test/entrada.test.mjs` exige que cada curso esté a 4 clics o menos.

## Soy alumno
- **Primeros respondedores**: curso policial, refuerzos, evacuación.
- **Personal sanitario**: **Kinesiología** (4 cursos), **Enfermería** (2 cursos propios + generales), **Nutrición** (2 cursos propios + medicina integral).
- **Médicos**: tres entradas.
  - *Estudiar por especialidad*: Emergentología y trauma · Terapia intensiva · Neurología · Endocrinología y metabolismo · Obstetricia y neonatología · Medicina de guardia (incluye «Guardia en equipo»).
  - *Prepararme para un examen*: Exámenes de ingreso y reválida · Certificaciones de soporte vital y trauma (ACLS, PALS, FCCS, PHTLS, ATLS, AMLS, EPC).
  - *Rotantes* (gratis) y *Práctica rápida* (sección aparte: 10 preguntas y repaso de errores).

## Soy instructor (`/instructor.html`)
1. **Crear curso y contenido** (`/aulas.html#crear`): el tutor con IA arma el curso; se edita teoría, presentación, preguntas, caso y juego, y se pueden poner **imágenes** (propias de ClinicIA o de Wikimedia Commons, OpenStax y Servier; con descripción y crédito obligatorios).
2. **Mis cursos**: aulas y grupos de capacitación. Dentro de cada uno: lista de alumnos (buscar y ordenar), estado, progreso, nota, último ingreso, código de vinculación, aceptar alumnos, descargar CSV. La validación de prácticas y la guía por módulo siguen en `/capacitacion.html?perfil=instructor`.

## Modo profesional · Mi consultorio (`/consultorio.html`)
Función premium (nivel **Profesional**, precio de referencia USD 19,99 **a confirmar**; bloqueo apagado hasta `CLINICIA_PAYWALL=true`).
- Todo **local**: pacientes, turnos (pendientes y dados) e historia clínica breve en el navegador; respaldo en JSON.
- Dictado con **Whisper local** (WebAssembly/WebGPU, `consultorio-whisper.mjs`): el audio y el texto no salen del dispositivo; solo se descarga el modelo la primera vez.
- El texto se reparte en secciones (datos personales, antecedentes, motivo, enfermedad actual, tratamiento…) por los títulos que el médico dice; **nada queda como atendido sin la validación del médico**.
- Reemplaza al consultorio anterior (que mandaba textos a la IA y guardaba identidades en el servidor). Las rutas del servidor del consultorio anterior (`/api/account/patients`, funciones de IA clínica) quedan sin uso desde la página.
- **Limitaciones**: la transcripción real con el modelo no se pudo probar en el entorno de desarrollo (sin descarga de modelos); el bloqueo premium es del lado del navegador; Whisper es preentrenado, no entrenado en vocabulario médico.
