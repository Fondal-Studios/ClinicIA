# Instalar Mi consultorio en la computadora

Hay dos formas. La primera es la más simple.

## A) Como aplicación desde internet (recomendada)
1. Abrí **Chrome o Edge** en la computadora y entrá a `https://clinicia-heef.onrender.com/consultorio.html`.
2. Tocá **«Instalar Mi consultorio en este equipo»** (o el ícono de instalar que aparece en la barra de direcciones, a la derecha).
3. Se abre como una aplicación aparte y queda en el menú de inicio / escritorio. Funciona también sin internet una vez abierta la primera vez.
- Los datos quedan en ese navegador de esa computadora. Entrá siempre con la misma aplicación o el mismo navegador.

## B) Versión local en la propia computadora (sin depender del sitio)
1. Pedir el paquete (`npm run modulo:profesional` genera la carpeta `dist/profesional-local`).
2. Instalar **Node.js LTS** (nodejs.org), una vez.
3. Doble clic en `Iniciar-Mi-consultorio.bat` (Windows) o `./iniciar.sh` (Mac/Linux). Se abre `http://127.0.0.1:4321/consultorio.html`.
- Esta versión tiene sus propios datos (separados de los del sitio) y no incluye cuentas ni cobro.

## Datos y respaldo
- Todo se guarda **en el navegador de esta computadora**. Hacé un respaldo seguido (Ajustes → Descargar respaldo) y guardalo en un pendrive o tu nube. Para pasar datos de un equipo a otro: respaldo y «Restaurar».
- La aplicación pide al navegador que **proteja el almacenamiento** para que no lo borre por falta de espacio; en Ajustes podés ver si lo concedió.
- Si cierra la sesión o no hay internet, se siguen mostrando los pacientes de la última cuenta de ese equipo.

## Dictado por voz
La primera vez descarga el modelo (necesita internet; decenas o cientos de MB). Después funciona en el equipo. Revisá siempre el texto antes de validar.

## Qué probar primero
1. Agregar un paciente con DNI. 2. Buscarlo por apellido y por DNI. 3. «Nueva consulta ahora» → dictar → validar. 4. «Imprimir planilla». 5. Descargar un respaldo. 6. Cerrar y volver a abrir la aplicación: el paciente sigue.
