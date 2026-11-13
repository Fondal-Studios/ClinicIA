# Personal sanitario: Enfermería y Nutrición (13/11/2026)

Se agregan dos categorías a **Personal sanitario** (junto a Kinesiología): **Enfermería** (emergencias) y **Nutrición** (obesidad, sobrepeso y metabolismo graso). Entradas: `/#personal-sanitario`, `/#enfermeria`, `/#nutricion`, el catálogo de Formación y «Personal sanitario» en `capacitacion.html`. Cada curso: 5 módulos, 20 preguntas de 5 alternativas con fundamento, 1 caso interactivo de 3 pasos, evaluación integral de 20 preguntas (aprueba con 16), bibliografía gratuita con enlace y fecha de contraste. Reusan práctica, repaso, progreso y biblioteca docente existentes; no hay cuentas ni permisos nuevos.

**Kinesiología** ya tenía cuatro cursos (clínica, respiratoria, UCI, soporte ventilatorio); no se duplicó.

## Cómo se verificó
1. Un agente investigó y redactó cada pareja de cursos abriendo las fuentes primarias.
2. Otro agente independiente, sin ver el razonamiento del primero, contrastó cada pregunta y cifra con la fuente. Resultado: **sin errores de clave ni de cifra**. Correcciones: un adjetivo en Nutrición (ESC/EAS dice «major impact»), una numeración de NICE no comprobable (eliminada) y el sesgo de longitud (la opción correcta era la más larga en ~60–75 % de las preguntas; ahora ~20 %).
3. Pruebas automáticas (`test/sanitarios.test.mjs`, `tools/check-sanitarios.mjs`) y recorrido en navegador a 390 px (`tools/qa-sanitarios.mjs`).

## Lo que NO se pudo verificar (no figura como verificado)
- **Enfermería:** AHA/ACC 2021 de dolor torácico (sólo resumen de AAFP; «ECG en 10 min») y AHA/ASA 2026 de ACV (sólo resúmenes); si hay una edición nueva de la guía de anafilaxia del RCUK (prevista para mayo de 2026); BTS 2017 sin revisar actualización; la calificación fuerte/condicional de SSC 2026 viene del resumen de SCCM.
- **Nutrición:** guía OMS GLP-1 (sólo el comunicado oficial); ESC/EAS 2025 (resumen en alemán); Lancet 2025 en copia alojada fuera de la revista; ADA 2026 sección 8 leída parcialmente; AHA 2021 vía resumen.
- Los hosts de AHA, JACC y PubMed estaban bloqueados desde el entorno de trabajo.

## Alcance
Contenido introductorio, **pendiente de revisión docente especializada**. No acredita habilidades ni habilitación; el uso clínico depende de las incumbencias y protocolos locales. Las simulaciones son de razonamiento; no hay dosis de fármacos salvo las citadas de la fuente y marcadas «según protocolo».

### Enfermería (emergencias)

| Curso | Id | Módulos | Preguntas | Caso |
| --- | --- | ---: | ---: | ---: |
| Enfermería en emergencias: triage, evaluación inicial y deterioro clínico | `enf-emergencia-evaluacion` | 5 | 20 | 1 |
| Enfermería en paro cardiorrespiratorio y emergencias tiempo-dependientes | `enf-emergencia-resucitacion` | 5 | 20 | 1 |

Temario:

**Enfermería en emergencias: triage, evaluación inicial y deterioro clínico**

1. Triage y priorización con ESI
2. Evaluación ABCDE y signos vitales
3. Reconocer el deterioro: NEWS2 y comunicación SBAR
4. Sepsis: reconocimiento y primera hora
5. Oxígeno y vía aérea básica con seguridad

**Enfermería en paro cardiorrespiratorio y emergencias tiempo-dependientes**

1. RCP de calidad y rol en el equipo
2. Ritmos desfibrilables, DEA/desfibrilador y seguridad
3. Anafilaxia: reconocer y actuar
4. Dolor torácico, síndrome coronario y ACV: reconocimiento y tiempos
5. Hemorragia grave y seguridad de la escena

Fuentes (contraste 13/11/2026):

- `enf-esi` · ENA · Emergency Severity Index (ESI) Handbook, 5.ª edición (2023) — PDF de la ENA de acceso libre (copia alojada por EMSC Innovation and Improvement Center) — https://media.emscimprovement.center/documents/Emergency_Severity_Index_Handbook.pdf
- `enf-abcde` · Resuscitation Council UK · Enfoque ABCDE (2024) — Texto completo gratuito — https://www.resus.org.uk/library/abcde-approach
- `enf-news2` · Royal College of Physicians · NEWS2: guía adicional de implementación (2020) — Texto completo gratuito — https://www.rcp.ac.uk/media/umzn4ntq/news2_additional-guidance-002-_0.pdf
- `enf-news2-rcp` · Royal College of Physicians · National Early Warning Score (NEWS2) (2017) — Texto completo gratuito — https://www.rcp.ac.uk/improving-care/resources/national-early-warning-score-news-2/
- `enf-sbar` · NHS Institute for Innovation and Improvement · SBAR: guía de implementación y capacitación (2010) — Texto completo gratuito — https://www.england.nhs.uk/improvement-hub/wp-content/uploads/sites/44/2017/11/SBAR-Implementation-and-Training-Guide.pdf
- `enf-ssc` · SCCM · Surviving Sepsis Campaign 2026: sepsis y shock séptico en adultos (2026) — Resumen oficial de recomendaciones gratuito; el texto completo está en Critical Care Medicine — https://www.sccm.org/clinical-resources/guidelines/guidelines/surviving-sepsis-campaign-international-guidelines-for-management-of-sepsis-and-septic-shock-2026
- `enf-bts` · BTS · Guía para el uso de oxígeno en adultos en ámbitos de salud y emergencia (2017) — Texto completo gratuito — https://www.brit-thoracic.org.uk/document-library/guidelines/emergency-oxygen/bts-guideline-for-oxygen-use-in-adults-in-healthcare-and-emergency-settings/
- `enf-rcuk-bls` · Resuscitation Council UK · Guías 2025: soporte vital básico del adulto (2025) — Texto completo gratuito — https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/adult-basic-life-support-guidelines
- `enf-rcuk-als` · Resuscitation Council UK · Guías 2025: soporte vital avanzado del adulto (2025) — Texto completo gratuito — https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/adult-advanced-life-support-guidelines
- `enf-anaph` · Resuscitation Council UK · Tratamiento de emergencia de la anafilaxia (profesionales) (2021) — Texto completo gratuito — https://www.resus.org.uk/media/337/download
- `enf-chest` · AAFP · Resumen de la guía AHA/ACC 2021 de dolor torácico (2023) — Resumen gratuito de una guía cuyo texto completo no se pudo abrir desde este entorno — https://www.aafp.org/pubs/afp/issues/2023/0200/practice-guidelines-chest-pain-evaluation.html
- `enf-cg95` · NICE CG95 · Dolor torácico de inicio reciente de sospecha cardíaca (2016) — Texto completo gratuito — https://www.nice.org.uk/guidance/cg95/chapter/Recommendations
- `enf-ng128` · NICE NG128 · ACV y AIT en mayores de 16 años: diagnóstico y manejo inicial (2019) — Texto completo gratuito — https://www.nice.org.uk/guidance/ng128/chapter/Recommendations
- `enf-firstaid` · Resuscitation Council UK · Guías 2025: primeros auxilios (2025) — Texto completo gratuito — https://www.resus.org.uk/library/2025-resuscitation-guidelines/first-aid-guidelines

### Nutrición (obesidad, sobrepeso y metabolismo graso)

| Curso | Id | Módulos | Preguntas | Caso |
| --- | --- | ---: | ---: | ---: |
| Nutrición clínica en sobrepeso y obesidad del adulto | `nut-obesidad` | 5 | 20 | 1 |
| Metabolismo graso y riesgo cardiometabólico: abordaje nutricional | `nut-metabolismo-graso` | 5 | 20 | 1 |

Temario:

**Nutrición clínica en sobrepeso y obesidad del adulto**

1. Evaluación y diagnóstico nutricional
2. Intervención alimentaria y estilo de vida
3. Consejería, adherencia y lenguaje sin estigma
4. Fármacos y cirugía: el rol del nutricionista
5. Seguimiento, mantenimiento y reganancia

**Metabolismo graso y riesgo cardiometabólico: abordaje nutricional**

1. Resistencia a la insulina y riesgo cardiometabólico
2. Dislipemias e hipertrigliceridemia: intervención alimentaria
3. Enfermedad hepática esteatósica (MASLD): nutrición
4. Patrones alimentarios: mediterráneo, bajo en carbohidratos y ayuno
5. Prediabetes, prevención de diabetes tipo 2 y derivación

Fuentes (contraste 13/11/2026):

- `nut-gpc-ar` · Ministerio de Salud de la Nación · GPC Nacional de Abordaje Integral de la Obesidad en personas adultas (versión breve) (2023) — Texto completo gratuito — https://argentina.gob.ar/sites/default/files/bancos/2023-12/gpc-obesidad-breve.pdf
- `nut-gapa` · Ministerio de Salud de la Nación · Guías Alimentarias para la Población Argentina (resumen ejecutivo) (2015) — Texto completo gratuito — https://iah.msal.gov.ar/doc/Documento110.pdf
- `nut-lancet` · Lancet Diabetes & Endocrinology Commission · Definición y criterios diagnósticos de obesidad clínica (2025) — Resumen gratuito; texto completo en PMC (PMC11870235) — https://pubmed.ncbi.nlm.nih.gov/39824205/
- `nut-who-obesity` · OMS · Hoja informativa: obesidad y sobrepeso (2026) — Texto completo gratuito — https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight
- `nut-who-glp1` · OMS · Guía sobre terapias con agonistas GLP-1 para el tratamiento de la obesidad en adultos (2025) — Comunicado oficial y resumen ejecutivo gratuitos — https://www.who.int/news/item/01-12-2025-who-issues-global-guideline-on-the-use-of-glp-1-medicines-in-treating-obesity
- `nut-who-diet` · OMS · Hoja informativa: alimentación saludable (2026) — Texto completo gratuito — https://www.who.int/news-room/fact-sheets/detail/healthy-diet
- `nut-nice` · NICE NG246 · Manejo del sobrepeso y la obesidad (2025) — Texto completo gratuito; contexto del Reino Unido — https://www.nice.org.uk/guidance/ng246
- `nut-ada8` · ADA · Standards of Care in Diabetes 2026, sección 8: obesidad y manejo del peso (2026) — Texto completo gratuito (PMC) — https://pmc.ncbi.nlm.nih.gov/articles/PMC12690172/
- `nut-glp-joint` · Consenso conjunto ACLM, ASN, OMA y TOS · Prioridades nutricionales para acompañar las terapias GLP-1 (2025) — Página oficial gratuita; el documento completo no fue leído para este curso — https://obesity.org/nutritional-priorities-to-support-glp-1-therapy-for-obesity
- `nut-esc19` · ESC/EAS 2019 · Guía para el manejo de las dislipemias (2019) — Texto completo gratuito — https://doi.org/10.1093/eurheartj/ehz455
- `nut-esc25` · ESC/EAS · Actualización focalizada 2025 de la guía de dislipemias (versión de bolsillo ESC/DGK) (2025) — Resumen oficial gratuito en alemán; el artículo original no fue abierto — https://herzmedizin.de/asset/24839
- `nut-easl` · EASL-EASD-EASO 2024 · Guía de práctica clínica sobre MASLD (2024) — Texto completo gratuito — https://doi.org/10.1016/j.jhep.2024.04.031
- `nut-aha21` · AHA 2021 · Guía alimentaria para mejorar la salud cardiovascular (resumen de ACC) (2021) — Resumen gratuito; el texto original de la AHA no fue abierto — https://www.acc.org/latest-in-cardiology/ten-points-to-remember/2021/11/23/19/45/2021-dietary-guidance-to-improve
- `nut-ph38` · NICE PH38 · Prevención de la diabetes tipo 2 en personas de alto riesgo (2012) — Texto completo gratuito; contexto del Reino Unido — https://www.nice.org.uk/guidance/ph38/chapter/Recommendations

