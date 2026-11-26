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
Tercera puerta del Inicio; premium (nivel **Profesional**, USD 9,99 por mes; bloqueo apagado hasta `CLINICIA_PAYWALL=true`). Cae en **Mis pacientes**: «Agregar nuevo paciente», buscador por apellido o DNI, ficha (datos filiatorios, historia clínica resumida, historial de consultas, planilla imprimible), **Turnos** y **Ajustes**. Guía completa en `docs/MIS-PACIENTES.md`.
- Todo **local**, separado por cuenta en el dispositivo; respaldo en JSON y listado CSV.
- Dictado con **Whisper local** y **validación del médico** obligatoria para marcar una consulta como atendida.
- **Receta electrónica en un clic** (abre el recetario y copia los datos mínimos): `docs/RECETA-ELECTRONICA.md`.
- Reemplaza al consultorio anterior (que mandaba textos a la IA y guardaba identidades en el servidor).
- **Limitaciones**: la transcripción real con el modelo no se probó en el entorno de desarrollo; el bloqueo premium es del lado del navegador; no es una historia clínica electrónica con validez legal.
