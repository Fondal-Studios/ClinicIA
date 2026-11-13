# Auditoría de la aplicación (13/11/2026)

Método: servidor real con base temporal; navegador (Chromium) a 390 px y 1280 px; scripts reproducibles `tools/audit-app.mjs` (todas las páginas), `tools/audit-flows.mjs` (cuentas, aulas, progreso, salas, invitado, seguridad), `tools/qa-clase.mjs`, `tools/qa-sanitarios.mjs`, simulación de 30 participantes. No se probó con celulares reales ni con el servidor de producción.

## Resultado
- 41 pruebas funcionales (cuentas, aulas, progreso, seguridad): sin fallas de la aplicación. Cubren registro, contraseñas débiles, duplicados, aula crear/publicar/unirse/examen/reenvío/progreso/edición concurrente/eliminación, CSRF por Origin, 401 sin sesión y que el alumno no recibe las claves de respuesta.
- 20 páginas × 2 tamaños: sin errores de JavaScript ni recursos rotos.

## Corregido en esta pasada
1. **El ingreso con código bloqueaba a todo el salón**: límite de 40 ingresos por IP cada 15 minutos; 30 personas en un mismo Wi-Fi, al reingresar dos veces, quedaban bloqueadas. Ahora 400 por IP para ingresos y 10 por cuenta (la adivinanza sigue limitada). Con test.
2. Desborde horizontal en `salas.html` y en la planilla de prácticas en celular.
3. Páginas de la clase sin título `h1`.
4. Nuevo `/api/health`: informa si las cuentas están configuradas y qué commit corre.

## 5 puntos críticos
1. **El despliegue no es verificable.** La instancia pública consultada tenía una versión anterior a la clase y respondía «cuentas se están habilitando» (sin base). Hay que confirmar el último deploy de Render, la rama y las variables (`DATABASE_URL`, `APP_ORIGIN`, `ADMIN_*`) y mirar `/api/health` antes de cada clase.
2. **Nada del contenido clínico tiene revisión docente.** Los cursos nuevos se contrastaron con fuentes, pero ningún clínico los revisó; además el auditor académico marca 115 explicaciones heredadas muy breves en bancos anteriores.
3. **El panel de instructor es una sola página muy larga** (unos 8.500 px en celular con un alumno) y validar 3 prácticas con 30 alumnos y 2 observadores no entra en 3 horas (unos 270 min de observación contra ~110). Hace falta paginar/colapsar por módulo y más observadores o un modo de validación por estaciones.
4. **Funciones visibles que no funcionan sin configuración**: Tutor IA y la generación de aulas con IA devuelven «pendiente de configuración» (503/4xx). Conviene ocultarlas o rotularlas hasta configurar el proveedor.
5. **Accesibilidad y táctil en celular**: varias páginas con más de 3 objetivos táctiles menores de 32 px (creditos, lanzamiento, index, clase-policial), dos `h1` y un campo sin etiqueta en `index.html`.

## No probado
Carga real con decenas de celulares; copias de seguridad y reinicio de la base de producción; emisión de certificados con la cuenta autorizada; pagos; módulos de consultorio y biblioteca con datos reales.
