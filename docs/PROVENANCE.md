# Procedencia y bibliografía

El archivo `public/learn/fondal-core.mjs` deriva de `public/core.js` de Fondal Learn, commit `d24575f30567b1e93cf1b111d35a63b0cab88f13`. Se conservó el motor de lecciones, normalización, progreso y calendario; se adaptó la importación al catálogo médico. Reutilización autorizada por el usuario el 15/10/2026 y solicitada nuevamente el 16/10. No se copió el catálogo general de cien cursos ni se modificó el repositorio fuente.

La interfaz, el contenido médico original, el motor de evidencia, la planificación del repaso, los escenarios y las ilustraciones ECG se crearon para ClinicIA. Las tiras no proceden de pacientes.

Referencias consultadas el 16/10/2026:

- AHA 2025, Adult Basic Life Support: https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support
- AHA 2025, Adult Advanced Life Support: https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-advanced-life-support
- AHA 2025, algoritmo de paro adulto: https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Accessible/Algorithm-ACLS-CA-LngDscrp-250725-Ed.pdf?sc_lang=en
- AHA 2025, algoritmo de taquiarritmia con pulso: https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Accessible/Algorithm-ACLS-Tachyarrhythmia-LngDscrp-250726-Ed.pdf?sc_lang=en
- AHA 2025, algoritmo de bradicardia con pulso: https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Accessible/Algorithm-ACLS-Bradycardia-LngDscrp-250725-Ed.pdf?sc_lang=en

No se reproducen gráficos oficiales ni se afirma afiliación. Los contenidos son resúmenes y ejercicios originales pendientes de revisión docente; las fuentes están enlazadas por lección y escenario.

## Ampliación ACLS, PALS y FCCS

Referencias adicionales consultadas el 16/10/2026:

- AHA/AAP 2025, Pediatric Basic Life Support: https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/pediatric-basic-life-support
- AHA/AAP 2025, Pediatric Advanced Life Support: https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/pediatric-advanced-life-support
- SCCM, alcance público de FCCS: https://www.sccm.org/education-center/educational-programming/fundamentals/fundamental-critical-care-support
- Surviving Sepsis Campaign, guía adulta 2026: https://sccm.org/survivingsepsiscampaign/guidelines-and-resources/surviving-sepsis-campaign-adult-guidelines
- Resuscitation Council UK, ABCDE: https://www.resus.org.uk/library/abcde-approach
- ATS/ESICM/SCCM, ventilación en ARDS: https://www.thoracic.org/statements/resources/cc/ards-guidelines.pdf

Los enlaces específicos a los algoritmos de paro, bradicardia y taquicardia pediátrica y cuidados posparo adultos están en `sources` de `public/learn/courses.mjs`. FCCS se presenta como introducción independiente: no reproduce el manual ni cubre todo el programa oficial. Se interpretó «FCSS» de la solicitud como FCCS.

## Residencias, trauma y compañeros

Contenido original con referencias específicas en `public/learn/content/residencias.mjs` y `trauma.mjs`, consultadas el 16/10/2026: MSAL (temario nacional 2026 y guías clínicas), OMS, NICE, CDC, ACS ATLS 11 y NAEMT PHTLS. No se copiaron preguntas oficiales ni manuales comerciales. Pendiente revisión docente.

Los cuatro PNG de `public/assets/tutors/` se copiaron sin modificación, con autorización expresa del usuario, de `drmarianojimenez94-sudo/La-Horda`, commit `1c1671b8c0247d4783848086a09c79386edd8ad8`, rutas `assets/sprites/champions/{ynara,aelith,morveth,veyra}/preview.png`. No se alteró el repositorio fuente.

SHA-256 de los archivos importados:

- `aelith.png`: `757d49f7dfaaca0262b0cfd0a264ff969d53851541b54a2a222cb9a42d52ca28`
- `morveth.png`: `9e90281d369543c1e9d1d58025c6c402e38e4b11fff329e89dea91d24165f666`
- `veyra.png`: `ece99f7c11cf806e7f9f6d8e918d7f90d32d79ccb1db3f1359b061284e952be5`
- `ynara.png`: `a22feff964c5c544b0cd7f869a09d672f441a0e757047d497fa38505ede2a89a`
