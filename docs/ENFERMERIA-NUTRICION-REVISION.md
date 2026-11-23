# Cursos propios de enfermería y nutrición · qué falta verificar

Cuatro cursos nuevos (20 preguntas y un caso de 3 pasos cada uno), redactados con ayuda de IA a partir de fuentes públicas gratuitas. Fuente de datos: `docs/contenido-fuente/*.json`; se regeneran con `node tools/build-enfermeria-nutricion.mjs`. **Ninguno fue revisado por una enfermera o un nutricionista**: cada curso lo declara en `reviewStatus`.

| Curso | Fuentes principales |
|---|---|
| Administración segura de medicamentos (`enf-medicacion`) | OMS Medication Without Harm, ISMP (alto riesgo, abreviaturas, doble control), AHRQ PSNet, OMS higiene de manos |
| Prevención y cuidado de lesiones por presión (`enf-lpp`) | Guía EPUAP/NPIAP/PPPIA 2019 (guía rápida), NICE CG179, póster de estadios NPIAP, AHRQ |
| Valoración nutricional del adulto (`nut-valoracion`) | BAPEN MUST, OMS (IMC y cintura), GLIM 2019, ESPEN |
| Guías alimentarias argentinas y educación alimentaria (`nut-gapa`) | GAPA (Ministerio de Salud), Resolución 693/2019, Ley 27.642 y decreto 151/2022, OMS, FAO |

## Datos que no se pudieron confirmar en la fuente primaria (revisar primero)
**Medicación segura:** los cinco momentos de higiene de manos salen de un resumen secundario; las categorías de la lista ISMP de alto riesgo salen de un resumen de la versión 2018; prácticas por vía (deglución, permeabilidad del acceso, identificación) son prácticas generales sin fuente leída; el factor de goteo de 20 gotas/mL es un ejemplo.
**Lesiones por presión:** las definiciones de estadios y las subescalas de Braden se escribieron de conocimiento general (una búsqueda posterior las confirmó en fuentes secundarias: Merck Manuals y el póster NPIAP 2016); NICE no pudo leerse (403) y se usa solo como marco; año de AHRQ (2011) sin confirmar.
**Valoración nutricional:** los cortes de cintura (94/80 y 102/88 cm) vienen de tablas secundarias que citan a la OMS; ESPEN 27–30 kcal/kg/día y ≥1,0 g/kg de proteínas salen de resúmenes de búsqueda de la guía 2023; años de MUST (2003) y de la página OMS (2024) aproximados; la definición «enfermedad aguda con ingesta nula por más de 5 días» viene de una fuente secundaria.
**GAPA:** no se usó ningún corte numérico de los sellos (están en una imagen del decreto); porciones en gramos no verificadas; solo se usan los mensajes verificados (5 porciones de frutas y verduras, 8 vasos de agua segura, 30 minutos de actividad); las estrategias de compra, cocina y consejería son buenas prácticas sin una fuente que las respalde como tales.

## Calidad de las preguntas
Auditoría automática (`node tools/audit-questions.mjs --course <id>`): 0 preguntas marcadas en los cuatro cursos. Se reequilibró la longitud de las opciones: la primera versión de «Valoración nutricional» tenía la respuesta correcta como la más larga en 14 de 20 preguntas. `nut-gapa` conserva un sesgo moderado hacia «la opción con más cifras» propio del tipo de contenido. Eso es un control de estilo, no una validación clínica.
