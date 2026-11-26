# Receta electrónica en Mi consultorio (opción A) · 23-11-2026

## Qué hace
ClinicIA **no emite recetas**. Desde Mi consultorio, con **un clic** en «Recetar con Receto»:
1. abre el recetario en una pestaña nueva (por defecto Receto, gratuito; configurable en Ajustes → Recetario electrónico, con enlace al listado oficial de recetarios habilitados);
2. copia al portapapeles **solo** los datos mínimos: paciente, DNI, fecha de nacimiento, cobertura, teléfono, diagnóstico (o motivo) e indicaciones/tratamiento. No copia antecedentes, enfermedad actual ni la transcripción;
3. el médico pega en «Crear receta», **firma y emite allá**. Después puede anotar «Ya emití la receta» (con el código opcional) y queda en el turno.
El botón está en cada turno pendiente y dentro de la consulta (toma lo que el médico tiene escrito en pantalla, validado o no). Nada se envía automáticamente: los datos pasan al recetario solo por el portapapeles y por acción del médico.

## Clics
Turno pendiente → «Recetar» (1 clic) → en el recetario: «Crear receta» + pegar. Una sola vez hay que crear la cuenta en el recetario (en Receto: email, matrícula y DNI, que su equipo valida); después la sesión queda abierta en el navegador.

## Qué no se pudo hacer y por qué
- **Precargar la receta** (que el formulario del recetario ya aparezca lleno): Receto no publica una API ni enlaces con datos precargados; solo ofrece su formulario, carga de pacientes por código QR y un perfil público donde el paciente completa sus datos. Se puede pedir a Grupo Cormos (contacto@cormos.com.ar, hola@cormos.com.ar) si existe acceso para terceros. Otras plataformas inscriptas publican estándares (por ejemplo HL7 FHIR o JSON) y podrían ofrecer una integración real.
- No se verificó que Receto figure hoy en el listado oficial del ReNaPDiS: hay que confirmarlo antes de recomendarlo.

## Próximos pasos
1. Preguntar a Cormos por API o enlaces precargados; si existen, el botón pasa de «copiar y pegar» a «abrir con la receta ya cargada».
2. Opción B: firma digital de certificados e informes propios (firma remota del Estado, gratuita; solo PDF).
3. Opción C (más adelante): ser un recetario inscripto en el ReNaPDiS (CUIR, repositorio, archivo de 3 años, fiscalización). Proyecto de meses.
