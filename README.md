# ClinicIA

Piloto independiente de entrenamiento clínico para profesionales. La ruta inicial es ACLS adulto: seis microlecciones, doce preguntas con devolución, cinco ECG sintéticos explorables, tres escenarios ramificados, repaso espaciado y mapa de competencias.

El consultorio previo se conserva en `public/consultorio.html`, con la misma clave de almacenamiento `clinia_v1`. El progreso educativo usa otra clave y no lee pacientes.

## Ejecutar

Requiere Node 22 o posterior, sin dependencias de instalación.

```sh
npm start
npm test
npm run check
```

Abrir http://localhost:3000. Las lecciones y los escenarios no requieren proveedor de IA. El servidor local publica exclusivamente `public/` y también sirve `/api/tutor`.

## Publicar en Netlify

El repositorio incluye `netlify.toml`: directorio público `public`, funciones `netlify/functions`, sin paso de compilación. Configurar en el entorno del proveedor, nunca en el repositorio:

- `CLINIC_ACCESS_TOKEN`: clave aleatoria de al menos 24 caracteres para un piloto cerrado. Se introduce en el tutor y se usa por solicitud, sin persistir en el navegador.
- `ANTHROPIC_API_KEY`: credencial del proveedor.
- `ANTHROPIC_MODEL`: identificador de modelo habilitado en esa cuenta. No se presupone disponibilidad de un modelo específico.
- `LEGACY_CLINICAL_ENABLED=true`: solo si se habilita explícitamente la IA del consultorio previo. Por defecto permanece bloqueada.

El tutor responde 503 de forma explícita cuando no está configurado; no simula respuestas de IA. Al enviar una pregunta, su texto se comparte con Anthropic. El tutor recibe material del curso desde el servidor; no acepta bibliografía enviada por el navegador. Sus respuestas son generadas y requieren revisión.

La raíz del repositorio redirige a `public/` para navegación estática. El tutor requiere el servidor Node o Netlify; GitHub Pages por sí solo no ejecuta funciones.

## Estado real

Listo para ejecutar y revisar como **piloto educativo local**. Contenido redactado para esta aplicación con fuentes AHA 2025 enlazadas, consultadas el 16 de octubre de 2026; **pendiente de validación docente**. No es un curso oficial, certificación AHA, herramienta diagnóstica ni sistema para dirigir una emergencia real.

El progreso es local y exportable; no hay cuentas, sincronización, pagos ni ranking multijugador. El mapa ordena las competencias del propio usuario por evidencia y cobertura, no por horas ni XP. Las simulaciones son recorridos de decisiones con reloj virtual, no un modelo fisiológico ni entrenamiento de destreza manual. El laboratorio ECG usa ilustraciones sintéticas y no analiza archivos clínicos.

Para comercializar: cuentas y aislamiento por usuario, base de datos, control de acceso individual, límites de consumo distribuidos, recuperación/importación de progreso, validación clínica/editorial, controles de privacidad y pagos. El token compartido habilita un piloto reducido; no reemplaza autenticación individual.

Ver `docs/AUDITORIA.md`, `docs/PROVENANCE.md` y `docs/VALIDACION.md`.
