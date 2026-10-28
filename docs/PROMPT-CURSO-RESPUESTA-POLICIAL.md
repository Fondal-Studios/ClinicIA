# Prompt de implementación · Clinic IA · 28/10/2026

Actuá como desarrollador responsable de Fondal-Studios/ClinicIA. Auditá y ampliá lo existente; no reconstruyas la aplicación ni presentes como implementado lo que solo está definido. Trabajá en una rama y dejá un PR borrador para que el Dr. Mariano Jiménez pueda realizar todo el curso antes de aprobar su publicación. No desplegar ni fusionar automáticamente.

## Objetivo y decisiones acordadas

Centrar la interfaz visible en formación teórica y práctica. Ocultar temporalmente consultorio y atención profesional conservando código y datos. Separar alumno, instructor y administración. Cambiar las etiquetas Profesor por Instructor sin romper roles persistidos. No convertir automáticamente a profesionales en instructores con permisos de validación.

Crear la sección «Primeros auxilios y respuesta a emergencias», inclusiva para policías, bomberos, enfermería, paramédicos y otros equipos de respuesta; cada curso indica destinatarios y requisitos. Acceso gratuito, sin códigos para leer o rendir. No exigir IA: contenido, explicaciones, evaluaciones y simulaciones deben funcionar sin proveedor conectado.

Curso inicial: «Respuesta Táctica Prehospitalaria Policial», subtítulo «Curso introductorio de primeros auxilios». Curso propio, sin presentarlo como PHTLS, ATLS ni acreditación oficial de esas entidades. Usar preguntas originales y guías primarias actuales. Prioridades del trauma adaptadas al primer respondiente, sin procedimientos avanzados ni técnicas de reducción.

Treinta participantes. Encuentro presencial de 8 a 12 (cuatro horas), con aproximadamente dos horas de actividad sentada que incluyen teoría/casos en celulares y examen; el resto para demostraciones y práctica. Lo deben poder completar ese día. Internet confirmado. Computadora y proyector del instructor; app responsive en celulares. Presentación externa en Gamma preparada por Mariano: aportar guion visual por módulo y referencias para sincronizar manualmente la clase; no afirmar que existe integración automática con Gamma.

Examen final de exactamente 50 preguntas originales, aprobación con 40/50 (80%), intentos ilimitados sin penalización, explicación después de entregar y repaso. Conservar aprobación previa aunque un intento posterior falle. Guardar respuestas, progreso e historial, recuperar tras recarga, pérdida de conexión o cambio de dispositivo. Distinguir borrador local de confirmación del servidor. No otorgar certificado institucional a partir de datos manipulables del navegador.

## Temario

1. Seguridad de escena, tránsito, violencia, electricidad, protección personal y activación.
2. Hemorragia exanguinante y evaluación inicial ABCDE; reevaluación y protección térmica.
3. Reconocimiento del paro, RCP y DEA; distinguir infarto de paro.
4. Hemorragia grave, presión directa, torniquete según entrenamiento y signos de shock sin exigir medición de presión.
5. Politrauma, accidentes, protección cervical y movilización por necesidad; no collar automático ni maniobras cervicales forzadas.
6. Fracturas y fracturas expuestas, sostén inicial, vigilancia distal, heridas, lesiones de cabeza/tórax/ojos y errores que evitar.
7. Dolor torácico y posible ACV; reconocimiento, última vez bien y comunicación.
8. Confusión, hipoglucemia, convulsiones, intoxicación aparente y persona agitada; vigilancia sanitaria en custodia.
9. Atragantamiento, dificultad respiratoria, alergia grave, golpe de calor y otras urgencias de reconocimiento.
10. Comunicación por radio y enlace Policía–Hospital transversal a todos los módulos.

Reemplazar «descompensado» y «politrauma» como únicos avisos por ubicación/acceso, riesgos, número de pacientes, mecanismo/tiempo, respuesta, respiración, sangrado, medidas, evolución y solicitud. Confirmación de recepción y actualización ante deterioro. No inventar signos vitales ni diagnósticos. Protocolos y contactos locales pendientes de definición institucional: no inventarlos.

## Simulaciones y validación

Cada módulo tiene escenario, materiales, instrucciones, roles en tríos y lista breve de observación. Rotar roles hasta que todos participen. Los 45 segundos pueden servir para un aviso por radio; no comprimir todas las prácticas a ese tiempo.

Tres prácticas obligatorias individuales: secuencia simulada de RCP/DEA; politrauma con protección cervical; hemorragia con sospecha de shock y uso simulado de torniquete. ACV y conducta alterada como casos grupales. Mariano tendrá una rotante/ayuda, pero no asumir que está habilitada para validar: permisos asignados explícitamente. Diez tríos simultáneos no permiten observar individualmente todo con un solo instructor; medir el tiempo del piloto y dejar pendientes reales, nunca aprobar en bloque sin observación.

No hay maniquíes. Participantes representan víctimas. RCP con gestos sin presión sobre compañeros; DEA real apagado, sin descargas. No certificar profundidad, calidad de compresiones ni ventilación. No tracciones cervicales, levantamientos inseguros, reducciones ni compresión oclusiva de torniquetes sobre compañeros. Usar soporte inanimado para ajuste. Diferenciar claramente ensayo de clase de conducta en emergencia real.

Flujo: alumno ve instrucciones → marca «Realizada, pendiente de validación» → instructor observa y registra «Aprobada» o «Necesita repetir» con criterios y devolución → guarda alumno, actividad, instructor, fecha y auditoría. Repeticiones ilimitadas. Una marca del alumno nunca prueba competencia ni habilita certificado.

## Cuentas, grupos y permisos

Auditar backend/accounts.mjs, backend/classes.mjs y backend/training.mjs, endpoints y despliegue real. Ya hay implementación PostgreSQL: verificar DATABASE_URL, migraciones, sesiones seguras, backups y persistencia tras reinicio. No confundir localStorage con cuenta persistente. No exponer secretos.

Mariano tendrá cuenta administradora e instructora; identificar su ID de usuario de forma verificable, sin inventar correo ni contraseña. Acceso libre a cursos; botón «Unirme a una capacitación con instructor», solicitud a grupo de Mariano y aceptación desde su panel. No código obligatorio. Aislar grupos y alumnos: un instructor ve y valida solo grupos asignados. Permisos comprobados en servidor.

Panel instructor: grupos, solicitudes, lista de alumnos, progreso, intentos, prácticas pendientes, criterios, devolución y validaciones. Administración separada para gestión de contenidos y cuentas. Solo la cuenta específica de Mariano puede autorizar certificados con su firma y aval del Hospital Nuestra Señora del Rosario, incluso si hay otros administradores o instructores. Usar una identidad estable configurada en servidor, denegar por defecto si falta. No permitir que el cliente elija quién firma.

## Certificados y continuidad

Todos los cursos, incluidos los breves de refuerzo, deben ofrecer certificado al cumplir sus requisitos. Distinguir certificado educativo de certificado hospitalario. No insertar firma inventada ni emitir aval hospitalario por autovalidación. Incorporar la firma autorizada y recursos institucionales cuando estén disponibles.

Para este curso: teoría completada + examen aprobado + tres prácticas validadas + autorización exclusiva de Mariano. «Mis cursos terminados»: nombre, fecha, ver certificado, descargar PDF e imprimir. Registro persistente con identidad del alumno, versión del curso, resultado, alcance exacto, emisor, fecha e identificador verificable. Emisión idempotente; control de autorización en servidor; prueba contra falsificación y accesos cruzados.

Catálogo posterior de cursos cortos gratuitos de refuerzo, también con certificado según sus requisitos. No inventar que se acreditaron destrezas presenciales en un curso autónomo.

## Auditoría de interfaz y aceptación

Evaluar recorrido entrar → continuar curso → simulaciones → examen → prácticas pendientes → certificado. Reducir opciones y jerga, priorizar móvil, navegación accesible y estados vacíos/errores claros. No mostrar creación con IA como disponible si está desconectada. Conservar cursos y progreso previos.

Probar: 50 preguntas únicas; 39/50 falla y 40/50 aprueba; reintentos sin pérdida de aprobación; reanudación; persistencia en otro dispositivo; solicitud/aceptación; aislamiento; alumno no valida; instructor ajeno no valida; otro administrador no firma; falta de configuración deniega emisión; impresión fiel; funcionamiento sin IA; compatibilidad móvil y escritorio. Documentar qué se comprobó y qué sigue pendiente.

Entregar PR borrador, ruta exacta para probar, cambios y pruebas. No prometer trabajo en segundo plano ni una notificación futura si no existe una tarea real configurada.
