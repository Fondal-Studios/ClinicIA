# Precios: qué se cobra, cuánto y por qué (23-11-2026)

Fuentes: búsquedas web del 23-11-2026. Las cifras de terceros no están verificadas contra las páginas oficiales de cada vendedor y cambian seguido; sirven de referencia, no de dato firme.

## Lo que cobran productos parecidos
| Producto | Referencia encontrada | Para qué sirve en la comparación |
|---|---|---|
| Cursos AHA de ACLS/PALS (con certificación y práctica presencial) | Centros de capacitación: USD 140 a 350 por curso; vendedores externos en línea: unos USD 149 | Es el **valor del curso oficial**. ClinicIA no certifica: vende **preparación** previa o complementaria. |
| AMBOSS (banco de preguntas y biblioteca para médicos) | USD 19,99 por mes pagando mensual; USD 12,50 por mes pagando por año; reembolso de 30 días | Ancla para suscripciones médicas en inglés. |
| Lecturio | USD 39,99 por mes según un sitio de terceros (sin confirmar) | Ancla alta. |
| Plataformas para que un docente venda cursos (Teachable, Thinkific, Kajabi) | Desde unos USD 29-39 por mes (Teachable) hasta USD 179 por mes (Kajabi), más comisiones en los planes bajos | El **nivel Instructor** de ClinicIA no vende cursos a terceros ni aloja un negocio: está muy por debajo y no compite con eso. |
| Historia clínica electrónica para consultorio | No se encontró un precio en Argentina | Sin ancla confiable; **no usar** el nivel Profesional como reemplazo de una HCE legal (Ley 27.706 exige requisitos, entre ellos firma digital). |
| Curso online argentino de emergencias cardiovasculares (Médica Panamericana) | ARS 180.000 por 3 meses | Muestra que la capacitación profesional con aval tiene precios mucho más altos que los de ClinicIA. |

## Decisión
| Qué | Precio de referencia | Por qué |
|---|---|---|
| **Alumno** | **Gratis** | Es la puerta de entrada y el motor del boca a boca; los competidores cobran por el banco de preguntas, pero ClinicIA todavía no tiene la validación docente que justifique cobrar el estudio general. |
| **Cursos de certificación** (ACLS, PALS, FCCS, PHTLS, ATLS, AMLS, EPC), por curso | **USD 2,99** | Precio de impulso: son bancos cortos (20-24 preguntas) frente a un curso oficial de USD 140 o más. Subir cuando haya más contenido y revisión docente. |
| **Pack de certificaciones** (los 7) | **USD 9,99** | 52 % menos que comprar los siete por separado (USD 20,93); es el producto que conviene empujar. |
| **Instructor** | **USD 4,99 por mes** | Muy por debajo de las plataformas de cursos; atrae docentes, que traen alumnos. Hoy no hay comisión sobre cursos de terceros. |
| **Profesional** (incluye Instructor y Mi consultorio) | **USD 9,99 por mes** | Ancla en el nivel de una suscripción médica de entrada (USD 12,50 a 19,99 en AMBOSS) pero más baja porque no incluye historia clínica con validez legal. |
| Todo lo demás (rotantes, kinesiología, enfermería, nutrición, medicina integral, exámenes, curso policial, refuerzos) | Gratis | Atrae gente y pruebas institucionales; la venta fuerte está en **licencias a instituciones** (ver `docs/PROMOCION-Y-MONETIZACION.md`). |

## Regla de precios en .99
- Referencia en USD: todo termina en .99 (hay una prueba automática que lo exige).
- Mercado Pago cobra en **pesos**: al cargar `CLINICIA_PRICE_*_ARS` en Render usá números que terminen en 99 y que sigan el tipo de cambio (por ejemplo, 4.999, 9.999 o 12.999: **redondeá hacia arriba al próximo número que termine en 99** y revisalo cada mes).
- Sobre la eficacia del .99: las fuentes encontradas son blogs de proveedores, sin estudios sólidos; para suscripciones el efecto parece menor que en comercio. Es una convención útil, no una garantía de ventas.

## Cosas que recomiendo y todavía no hice
1. **Plan anual** con descuento (AMBOSS cobra 37 % menos por año): por ejemplo Instructor USD 49,99 por año y Profesional USD 99,99 por año.
2. **Descuento institucional** por cupo (ver licencias).
3. Reembolso claro de 30 días (hoy está el botón de arrepentimiento de 10 días).
4. Subir precios cuando los cursos de pago tengan revisión docente y más preguntas.
