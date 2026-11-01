# Biblioteca comunitaria de ClinicIA

## Entradas y funciones

- `/biblioteca.html`: elegir **Alumno** o **Instructor**. Como alumno: **Médico**,
  **Primer respondedor**, **Otro personal sanitario** (enfermería, kinesiología,
  nutrición y otras profesiones) o **Rotante/practicante**. Son recorridos de
  navegación, nunca permisos de cuenta ni credenciales profesionales.
- **Alumno**: consulta libros y teoría de contribuciones aprobadas sin iniciar
  sesión; se identifica para guardar un aula y practicar con progreso persistente.
  El tutor de estudio sigue siendo el existente.
- **Instructor**: activa su modo desde el selector existente, crea aulas con el
  tutor creador y vincula alumnos por código o mediante sus grupos de capacitación.
  En su aula propia aparecen **Revisión y publicación** y **Aportar a biblioteca**.
- `/credenciales.html`: presentar profesión/especialidad/matrícula/jurisdicción y
  respaldo para revisión administrativa. No se concede el rol administrador.
- `/editorial-admin.html`: cola de credenciales y contribuciones; accesible desde
  el panel administrador y la biblioteca solo para cuentas con rol real `admin`.
  El servidor decide el permiso, no el navegador ni la URL.

## Dos circuitos distintos

**Aula privada**: revisión explícita del dueño → publicación para alumnos invitados
por código. No aparece automáticamente en la biblioteca comunitaria.

**Contribución pública**: credencial profesional verificada → revisión docente del
propietario → consentimiento explícito para compartir esa versión → solicitud
pendiente → revisión independiente de un administrador → integración pública.
El administrador puede rechazar con observaciones o retirar una integración.
No se permite verificar la propia credencial ni aprobar la propia contribución.
Una instalación con un único administrador necesitará otro administrador legítimo
para revisar aportes de ese mismo administrador; no se crean privilegios para
sortear esa separación.

La cola muestra contenido completo, respuestas, fundamentos y fuentes; los
controles estructurales se distinguen de la revisión humana. Marcar una casilla no
verifica automáticamente exactitud clínica ni vigencia bibliográfica.

## Versiones, privacidad y límites

Se comprueba la huella de contenido y la versión guardada al enviar y aprobar.
Cambios de contenido invalidan la visibilidad de la revisión anterior y vuelven el
aula a borrador. Las credenciales modificadas vuelven a pendientes. Solo versiones
vigentes, publicadas, con credencial verificada y aprobación administrativa aparecen
en el catálogo público. Una bandera de visibilidad del autor no permite saltarse la
moderación. Las inscripciones públicas y las invitaciones privadas tienen permisos
diferenciados para no mostrar revisiones no aprobadas a alumnos de la biblioteca.

Las operaciones de cuenta y moderación necesitan el servidor Node y PostgreSQL.
Las páginas estáticas o Netlify sin el backend de cuentas no habilitan esos flujos;
se muestra el error real, sin catálogo simulado ni aprobación local. Los libros son
enlaces externos y no se alojan copias ni se presumen licencias de redistribución.

Durante desarrollo solo se usan cuentas/contenidos sintéticos de pruebas. No se
verificó la asignación administrativa de una cuenta real de Mariano ni se aprobaron
credenciales o clases reales. Las pruebas automáticas no son validación clínica.

### Migración de inscripciones anteriores

Las inscripciones creadas con el esquema anterior no guardaban si provenían de un
código o del catálogo público. Se conservan como invitaciones por código para no
retirar accesos privados legítimos. Si se hubiera desplegado previamente la rama
experimental con inscripción pública, sus filas históricas requieren auditoría de
procedencia antes de desplegar esta migración; no se inventa esa información.
Las nuevas inscripciones sí guardan su origen y tienen el control diferenciado.
