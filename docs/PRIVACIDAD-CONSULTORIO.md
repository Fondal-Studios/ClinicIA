# Privacidad de Mi consultorio (2026-10-25)

## Qué vive dónde
| Dato | Dónde | Cómo |
|---|---|---|
| Nombre, apellido, documento, fecha de nacimiento, teléfono, domicilio, obra social, afiliado | **Servidor** (PostgreSQL), tabla `clinic_patient_identity` | Cifrado AES-256-GCM por registro (IV aleatorio, autenticado con id de registro y dueño). Sólo su dueño los recibe. |
| Alias, sexo, año de nacimiento, antecedentes, consultas (motivo, enfermedad actual, plan y tratamiento) | **Dispositivo** (`localStorage`, `clinia_v1`) | Como antes; se respaldan con «Exportar todo». |
| Texto enviado a la IA | Proveedor de IA (Groq/Anthropic) | **Sin datos personales**; se muestra antes de enviar. |

## Qué se envía a la IA
1. El profesional dicta (los datos personales se completan en el formulario con el motor local; ya **no hay IA** para extraerlos).
2. Al organizar la historia, el texto pasa por `/…/deidentify` en nuestro servidor: se quitan los identificadores conocidos del paciente (nombre, documento, teléfono, domicilio, obra social, afiliado, fecha de nacimiento, con variantes de acentos, puntos y formatos) y patrones genéricos (documentos, teléfonos, correos, enlaces, «paciente/esposa/Dr. + nombre»).
3. Una hoja muestra **el texto exacto** que se enviará y permite editarlo; «Sin IA» usa el motor local.
4. `structure-consulta` y `rewrite-field` vuelven a enmascarar patrones genéricos por si el cliente no lo hizo y nunca reciben identificadores: sólo edad, sexo y listas de antecedentes ya limpiadas.
Si el servidor no puede quitar los datos, **no se envía nada** y se usa el motor local.

## Configuración
- `PATIENT_VAULT_KEY`: 32 bytes en hex o base64 (`openssl rand -hex 32`). Sin ella el guardado cifrado queda desactivado y el consultorio funciona con alias. **Si se pierde la clave, los datos personales no se recuperan**: guardala en un gestor aparte de la base de datos.
- `PATIENT_VAULT_KEY_PREVIOUS`: clave anterior mientras se re-cifra (`POST /api/account/patients {action:"rotate"}`).
- Requiere cuentas (`DATABASE_URL`). Sin sesión se pueden crear pacientes sólo con alias.
- Migración: los pacientes locales con nombre se mueven al servidor con el botón «Mover datos personales…» (después se borran del dispositivo).
- Eliminar la cuenta elimina sus identidades (`ON DELETE CASCADE`).

## Límites (no son detalles)
- **No es cifrado de extremo a extremo**: quien opera el servidor y tiene la clave puede descifrar. Protege contra filtraciones de la base y de los respaldos, no contra el operador.
- **El quitado de datos es automático y no infalible**: puede dejar nombres de familiares, lugares de trabajo o datos poco comunes que identifiquen. Por eso hay vista previa y la recomendación de no dictarlos. Un texto sin identificadores directos puede igualmente ser reidentificable por el contexto clínico.
- Los datos clínicos no están cifrados en el dispositivo ni respaldados en el servidor.
- Esto no sustituye consentimiento informado, normas de historia clínica ni la ley de protección de datos aplicable (p. ej. Ley 25.326 en Argentina): son responsabilidad del profesional o la institución; no se evaluaron aquí.
- La búsqueda por nombre se hace en el navegador sobre los datos ya descifrados; con miles de pacientes habría que indexar.

## Pruebas
`test/vault.test.mjs` (cifrado en reposo, aislamiento entre usuarios, autenticación del registro, rotación de claves, borrado), `test/clinical.test.mjs` (el proveedor nunca recibe nombres ni documentos) y `tools/consultorio-browser-smoke.mjs` (flujo completo en navegador real).
