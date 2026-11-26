# Modo profesional · Mis pacientes (guía y límites)

## Cómo se usa
1. Ingresar con la cuenta → Inicio → **Modo profesional** → cae directo en **Mis pacientes**.
2. **Paciente nuevo**: «+ Agregar nuevo paciente». Se carga apellido y nombre, DNI, nacimiento, sexo, domicilio, teléfono, correo, cobertura y nº de afiliado, contacto de emergencia, historia clínica resumida (antecedentes personales y familiares, alergias, medicación habitual) y, si se quiere, el **motivo de la primera consulta** (abre la consulta enseguida).
3. **Paciente que ya tuve**: escribir el **apellido** (con o sin tildes, parcial) o el **DNI** (con o sin puntos, parcial) en el buscador. Si no aparece, el mismo aviso ofrece «Agregar nuevo paciente» ya con lo buscado. Un DNI no se puede cargar dos veces: avisa y ofrece abrir la ficha existente.
4. **Ficha**: datos filiatorios y historia resumida editables, **Historial de consultas** (atendidas y pendientes), «Nueva consulta ahora», «Dar turno» e «Imprimir planilla» (hoja A4 con filiación, historia resumida e historial).
5. **Consulta**: dictado por voz con transcripción local, secciones editables y **validación del médico** (solo así queda «atendida»); botón de receta electrónica en un clic (ver `docs/RECETA-ELECTRONICA.md`).
6. **Turnos**: dar turno buscando al paciente por apellido o DNI; pendientes y dados.
7. **Ajustes**: respaldo (JSON), listado de pacientes (CSV), turnos (CSV), modelo de voz, recetario.

## Dónde quedan los datos
En **este dispositivo**, separados por cuenta (dos médicos que comparten un equipo no se ven los pacientes). No se envían a ningún servidor. Para usarlos en otro equipo: descargar el respaldo y restaurarlo allá. **Hacer respaldos seguido**: si se borran los datos del navegador, se pierden. La primera vez que una cuenta abre esta versión, se copian (sin borrar) los pacientes que estaban guardados antes de separar por cuenta.

## Límites
- No es una historia clínica electrónica con validez legal (Ley 27.706): no hay firma digital, ni resguardo institucional, ni auditoría de accesos.
- El bloqueo premium es del lado del navegador.
- Sin sincronización entre dispositivos. Si se quiere, la opción es un respaldo cifrado en la nube: requiere una decisión de privacidad.
