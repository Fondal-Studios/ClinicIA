# Auditoría y transformación · 16/10/2026

## Alcance y bases

Destino: `drmarianojimenez94-sudo/ClinicIA`, base `9f7ed4c91907ae8fdc9a7ac44bdfec29fbf44133`. Fuente reutilizada con autorización del propietario: `Fondal-Studios/Fondal-Learn`, commit `d24575f30567b1e93cf1b111d35a63b0cab88f13`. No se modificó Fondal Learn. El destino personal identificado es ClinicIA; no se creó un repositorio adicional.

Decisión recuperada: plataforma médica independiente, ACLS primero, ECG, casos ramificados, reanimación y desempeño por competencias. La propuesta anterior de asistente de consultorio se conserva sin confundirla con el nuevo recorrido educativo.

## Hallazgos comprobados

| Área | Estado inicial | Cambio |
|---|---|---|
| Producto | HTML monolítico para historias clínicas | Entrada educativa modular, consultorio conservado |
| Formación | Sin cursos ni evaluación | 6 lecciones y 12 preguntas con devolución |
| Fondal Learn | Motor genérico, progreso, errores y XP | Motor reutilizado y capa médica de evidencia por pregunta |
| Progreso | Sin evidencia educativa | Cobertura, desempeño, racha, repaso programado y exportación |
| ECG | No existía laboratorio | 5 patrones sintéticos y prueba visual exploratoria |
| Casos | No existían escenarios | 3 recorridos con ramas de recuperación y debriefing |
| IA | 3 funciones sin autenticación; entradas de tipos incorrectos podían fallar fuera del try | Control de acceso, límites de tamaño, validación de entradas y tiempo de espera |
| Modelo | Identificadores fijos en cada función | Modelo configurable en el servidor |
| Errores | Se devolvían respuesta cruda y detalles del proveedor | Errores públicos sin esos detalles |
| Despliegue | Se publicaba la raíz incluyendo ZIP y código de funciones | Se publica solo `public/` |
| Datos | Pacientes en localStorage, sin usuarios | Se mantiene el consultorio previo; aprendizaje usa almacenamiento independiente |
| Pruebas | Ninguna suite visible | Pruebas automatizadas de motor, casos, ECG, API y servidor |

## Verticalización implementada

El flujo principal es aprender → responder → detectar brechas → repasar → explicar con el tutor. El contexto del tutor está acotado al módulo ACLS y sus referencias; no se presenta como chat médico general. La selección del material del tutor ocurre en servidor. Las restricciones de un modelo siguen requiriendo evaluación: un prompt no garantiza por sí solo la seguridad de sus respuestas.

Las lecciones exigen 80% para avanzar. Con dos preguntas por lección, esto implica ambas correctas. La evaluación usa historial y cobertura de preguntas; repetir una única pregunta no completa una competencia. El repaso distingue fallos inmediatos de intervalos crecientes tras aciertos. Los escenarios ofrecen reintentos explicados; su finalización no incrementa automáticamente la competencia de las preguntas.

## Pendientes que impiden llamarlo producción

1. Configurar y verificar el proveedor real del tutor: no se encontraron ni se usaron credenciales del usuario.
2. Validación médica docente de preguntas, simplificaciones de ECG y escenarios. Ampliar contenido, fármacos y simulación solo con revisión.
3. Autenticación individual, persistencia remota, aislamiento por usuario, recuperación y privacidad antes de ingresar datos reales.
4. Cuotas y limitación de consumo distribuidas; el piloto usa clave compartida y no tiene cobro.
5. Tutor con evaluación adversarial, trazabilidad granular de afirmaciones y revisión de referencias. El contexto actual es un corpus pequeño incluido en el código; no es un RAG bibliográfico completo.
6. El consultorio conserva su motor clínico anterior: su salida no cuenta con un esquema exhaustivo validado en servidor. Queda deshabilitado por defecto para IA; usar datos ficticios en el piloto.
7. Publicación y verificación en el hosting real: guardar código en GitHub no demuestra despliegue saludable.
