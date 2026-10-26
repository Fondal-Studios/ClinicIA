# Navegación de ClinicIA (2026-10-25)

Una barra de áreas, fija arriba en todas las pantallas, indica dónde estás:

| Área | Para qué sirve | Entrada |
|---|---|---|
| **Formación** | Estudiar y practicar | `/#formacion` |
| **Aulas** | Clases con código: crearlas con el tutor, editarlas, compartirlas y rendir | `/aulas.html` |
| **Mi consultorio** | Llevar la cuenta de pacientes por dictado de voz | `/consultorio.html` |
| **Tutor IA** | Dudas de estudio y consultas clínicas teóricas con IA | `/#tutor` |

El logo lleva a **Inicio** (`/#hub`), que muestra esas cuatro áreas. Abrir la aplicación sin ruta ya no entra directo a un curso.

## Formación
Pantalla `/#formacion` con tres caminos:
1. **Práctica general**: diez preguntas mezcladas de todas las áreas de Examen Único, sin elegir curso; y repaso de errores.
2. **Preparar un curso o examen**: lista agrupada (exámenes de ingreso y reválida, emergencias y cuidados críticos, perinatal, equipo de guardia). Al entrar, las migas de pan muestra `Formación › Curso › Sección` y las pestañas de teoría, práctica, repaso, simulacros y ruta trabajan **sólo con ese curso**.
3. **Mi guardia**: recorridos por rol y guardia en equipo.

## Tutor IA
Dos pestañas visibles: **Dudas de estudio** y **Consulta clínica teórica**. Usan el material del curso elegido arriba. No reciben datos de pacientes.

## Cambios de fondo
- Se quitaron de la portada del curso las tarjetas repetidas (guardia, consultorio, selector de cursos) y un bloque que aparecía duplicado.
- Etiquetas de curso más claras: «Resumen del curso», «Práctica del curso», «Preguntarle al tutor», «Consulta clínica (guardia)».
- Prueba: `test/ui.test.mjs` (inicio, práctica general, Formación y migas de pan).

## Espacio del curso (actualización 2026-10-26)
Dentro de un curso hay **cuatro pestañas fijas** (abajo en el teléfono, a la izquierda en escritorio): **Inicio · Práctica · Preparar examen · Repaso**, más un botón «Tutor» siempre a mano.
- **Práctica**: preguntas del curso con explicación al responder (mixta, brechas, ECG, por tema).
- **Preparar examen** tiene tres subpestañas: **Teoría · Simulacros · Casos clínicos**.
- **Repaso** tiene dos: **Preguntas** (errores y repaso espaciado) y **Casos clínicos** (volver sobre casos ya resueltos o en curso).
- «Más herramientas» agrupa mi ruta, tarjetas, ECG, competencias, puntos, tutores y planes.
- La teoría muestra solo las preguntas originales como ejemplos resueltos; el resto queda para Práctica y Simulacros.
- Los cursos con muchas preguntas ofrecen simulacros de 20, 50, 100 y hasta 160 preguntas; la «evaluación integral» se limita a 160.

## Modos (Estudiante · Profesor · Institución · Administrador)
Un selector «Modo» en la barra superior cambia el menú:
- **Estudiante** (todos): Formación, Aulas, Mi consultorio, Tutor IA.
- **Profesor** (se activa desde el selector, aceptando responsabilidades): Mis clases, **Biblioteca**, Formación, Tutor IA y consultorio. Crea clases con el tutor, las edita, comparte y evalúa; la biblioteca recorre todo el banco (con respuestas y fuentes) y permite copiar preguntas y teoría a una clase.
- **Institución**: aparece como «próximamente».
- **Administrador**: solo para la cuenta provisionada por el servidor; muestra Telemetría.
La biblioteca está protegida en el servidor por modo (los alumnos no pueden pedirla). El modo Profesor se autoactiva: no verifica títulos.
