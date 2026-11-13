# Simulación de personas y recomendaciones para el lanzamiento (13/11/2026)

**Qué es:** 12 usuarios simulados (bots con navegador real, `tools/simulate-personas.mjs`) con distintos roles, conocimiento (35 % a 92 % de aciertos), teléfonos (Android básico 360×640 con CPU 4× más lenta, iPhone SE, Pixel 7, tablet, notebook) y redes (3G lento, 3G, 4G, wifi). **No son personas reales:** miden tiempos, pasos, errores y legibilidad; no miden comprensión, motivación ni confianza. El servidor es local: la latencia de Render y de internet real se suma a lo que se ve acá.

## Resultados
| Persona | Dispositivo / red | Resultado |
| --- | --- | --- |
| Policía novato (35 %) | Android básico, 3G lento | Entra a la clase en 9 s, ve usuario y código. Examen de 50: **no aprobó en 3 intentos** (13–18/50) |
| Bombero (60 %) | iPhone SE, 3G | Entra en 3 s. Examen: 30–34/50 en 3 intentos, **no aprobó** |
| Policía mayor, poco tecnológico (50 %) | Android básico, 3G | Entra en 3 s. 24–28/50 en 3 intentos, **no aprobó** |
| Paramédico experto (92 %) | Pixel 7, 4G | Todo en 1,5 s. Aprobó en el primer intento (46/50) |
| Residente de medicina (90 %) | Notebook, wifi | Inicio 0,8 s; práctica de 6 preguntas completa |
| Médico con poco tiempo (70 %) | Pixel 7, 4G | Inicio 1,5 s; práctica completa |
| Enfermera de guardia (60 %) | Android básico, 3G | **Inicio 4,8 s**; sección Enfermería 2 s; práctica completa |
| Enfermero novato (35 %) | iPhone SE, 3G lento | **Inicio 17 s**; sección 4,5 s; práctica completa |
| Kinesiólogo (55 %) | Tablet, 4G | Todo fluido; práctica completa |
| Nutricionista (75 %) | Pixel 7, 4G | Todo fluido; práctica completa |
| Instructora primeriza | Android básico, 3G | Panel en 2,5 s, guía por módulo, lista de alumnos: funciona; **el panel mide 9.894 px de alto con 4 alumnos** |
| Instructor con proyector | Notebook, wifi | Todo instantáneo; **7.056 px** de alto con 4 alumnos |

## Un error real que apareció
En conexiones lentas, el formulario de ingreso a la clase se **borraba solo**: la pantalla se mostraba enseguida, el servidor respondía tarde y la pantalla se redibujaba sin lo que la persona ya había escrito; al tocar «Entrar» no pasaba nada. **Corregido** (conserva lo escrito) y cubierto por una prueba (`tools/qa-clase.mjs`, red simulada con respuesta tardía).

## Qué me parece
**Lo mejor:** entrar a una clase sin contraseña en 3 a 9 segundos incluso con 3G lento; usuario y código visibles; el panel del instructor ya guía qué decir por módulo; las secciones por profesión; el servidor aguanta 30 personas simultáneas en las pruebas. **Lo más débil:** el peso de la app en redes malas, el panel de instructor larguísimo, y el contenido sin revisión clínica externa.

## Qué cambiaría antes de salir al mercado (2 meses), por prioridad
1. **Despliegue y operación (semanas 1–2).** Verificar el pipeline de Render (la instancia consultada estaba desactualizada y sin base), staging separado, copias de seguridad probadas de la base, aviso si `/api/health` falla, y una prueba de carga con 20–30 celulares reales en una sala.
2. **Peso de la app (semanas 2–4).** El inicio descarga ~2,2 MB de JavaScript sin comprimir (ahora se envía comprimido con gzip y con ETag, pero sigue siendo mucho): cargar cada curso solo cuando se abre, y cachear lo ya visto en el teléfono. En 3G lento el inicio tarda 17 s; en una zona de señal pobre como la de una comisaría rural es la diferencia entre usar la app o no.
3. **Panel de instructor para el día de clase (semanas 2–5).** Hoy es una página de 7.000 a 10.000 px con 4 alumnos; con 30 será inmanejable. Pasar a pestañas (Guía · Grupo · Alumnos · Prácticas), paginar la lista, y un **«modo observación»** con una cola de una sola mano: tocar un nombre, marcar A/R por práctica. La validación de 270 minutos de observación en 3 horas no se resuelve con diseño: requiere más observadores o una segunda instancia, y el producto debe decirlo.
4. **Examen y apoyo al que sabe poco (semanas 3–6).** Tres personas simuladas con 35–60 % de aciertos no aprobaron en 3 intentos (aprobar exige 40/50 = 80 %). Si el objetivo es que aprendan: tras fallar, mostrar qué módulos reforzar, repetir solo esos, explicar cada error, y considerar si 80 % es el umbral correcto para un curso introductorio de primeros respondientes (decisión del docente).
5. **Contenido (semanas 1–8, en paralelo).** Revisión clínica externa de cada curso (enfermería, nutrición, kinesiología, gerontología, medicina) y de los 6 cursos médicos largos que son 10–14 preguntas repetidas 5 veces: reducirlos o escribir preguntas nuevas. Sin esa revisión no recomiendo anunciar los cursos como formación profesional; hoy están correctamente rotulados «pendientes de validación docente».
6. **Legibilidad y accesibilidad móvil (semanas 4–6).** En las pantallas principales hay entre 7 y 12 botones o enlaces de menos de 40 px y decenas de textos de menos de 13 px (31 en el catálogo). Llevarlos a ≥44 px y ≥14 px, probar con lector de pantalla, y revisar el lenguaje para personas con poca práctica digital.
7. **Legal y confianza (semanas 4–8).** Revisión de la política de privacidad y términos por un profesional (datos de usuarios y resultados de formación; Ley 25.326 en Argentina), claridad de que no hay certificación oficial, y quién es responsable del contenido.
8. **Piloto real (semanas 6–8).** Antes del lanzamiento, 10 personas reales por segmento (policía/bombero, médico, enfermería, nutrición, kinesiología, instructor), observadas mientras usan la app. Esto encuentra lo que ningún bot encuentra.

## Qué no se midió
Comprensión real, motivación y abandono; lectores de pantalla; conexión real de Render; impresión de certificados; pagos; uso del consultorio.
