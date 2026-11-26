# Arquitectura por módulos (26-11-2026)

ClinicIA se organiza en cuatro bloques. El inventario está en `modules.json` y **`test/modulos.test.mjs` lo hace cumplir**: cada archivo de `public/` pertenece a un solo bloque y un módulo solo puede cargar archivos propios o del núcleo compartido.

| Módulo | Qué incluye | Necesita servidor |
|---|---|---|
| **compartido** | cuentas, pagos y precios, barra de áreas, estilos, instalación, administración | sí (cuentas, pagos) |
| **alumno** | inicio y mapa de entrada, cursos, preguntas, simulacros, tutor, capacitación de primeros respondedores, guardia y salas | sí (progreso, exámenes, tutor) |
| **instructor** | crear cursos y contenido con IA (aulas), editor con imágenes, mis cursos, alumnos y notas | sí |
| **profesional** | Mi consultorio: pacientes, turnos, historia resumida, dictado local, receta en un clic | **no**: es 100 % local |

## Reglas
1. Un módulo no importa código de otro (solo del compartido). Los **enlaces** entre páginas son libres.
2. El módulo profesional es **autónomo**: sus 5 archivos más `style.css`, `sw.js`, `offline.html` y los íconos alcanzan para funcionar sin servidor (lo comprueba un test).
3. Los precios y los cursos de pago viven en `public/learn/precios.mjs` (compartido), no en el catálogo de cursos.

## Versión local del módulo profesional
`npm run modulo:profesional` (o `node tools/build-modulo.mjs profesional --out <carpeta>`) arma un paquete con: `app/` (los archivos), `servidor-local.mjs` (servidor mínimo en 127.0.0.1, sin dependencias), `Iniciar-Mi-consultorio.bat`, `iniciar.sh` y `LEEME.txt`. Se prueba en navegador con `tools/modulo-local-smoke.mjs` (celular y computadora, incluido abrir sin conexión). Guía para el usuario: `docs/INSTALAR-PROFESIONAL.md`.

## Qué falta para separar del todo (fase 2, no hecha)
- **Carpetas físicas** `modules/<nombre>/` en vez de un `public/` único (hoy la separación es por inventario y tests).
- **Backend por módulo**: `backend/accounts.mjs` todavía compone a todos (capacitación, aulas, materiales, bóveda). Falta un registro de módulos para que cada uno aporte sus rutas y su esquema y se pueda encender o apagar con una variable (por ejemplo `CLINICIA_MODULES=profesional`).
- **`capacitacion.mjs`** mezcla las vistas de alumno y de instructor (panel de validación de prácticas). Hay que partirlo en dos archivos, uno por módulo.
- `backend/vault.mjs` (bóveda de identidades en el servidor, del consultorio anterior) ya no se usa desde la página.
