# Instrucciones para generar con Runway las imágenes que faltan

Módulos sin imagen de referencia: **1, 2, 4, 5, 6, 8 y 10**. (Ya tienen imagen real con licencia libre: 3, 7 y 9.)

## Antes de empezar
- Usá **Gen-4 Image** (o el modelo de imagen más nuevo disponible). Resolución 1080p, relación **16:9**, de 3 a 4 variantes por prompt.
- Runway **no escribe texto bien**: todos los prompts piden «sin texto». Los rótulos se agregan después en la app.
- Una IA puede dibujar mal una técnica (manos, torniquetes, posiciones). **Ninguna imagen se usa sin revisión de un médico o instructor** con la lista de abajo.
- Confirmá en los términos de Runway que tu plan permite uso comercial/educativo (no lo pude verificar desde acá).

## Estilo común (pegalo al final de cada prompt)
> Ilustración vectorial plana tipo manual médico, líneas limpias, paleta verde azulado y gris, fondo blanco liso, personas adultas con proporciones realistas, uniforme policial genérico sin escudos ni insignias legibles, sin texto, sin letras, sin números, sin marcas, sin sangre exagerada, composición centrada, 16:9.

## Prompts por módulo
1. **Seguridad de la escena.** Vista aérea de una ruta con un auto chocado y cables caídos sobre el techo; un policía a unos metros detrás de una zona demarcada con conos, hablando por radio; patrullero con luces atrás. Nadie toca el auto.
2. **Evaluación inicial (hemorragia masiva y ABCDE).** Un policía arrodillado junto a una persona acostada boca arriba; el policía mira su rostro y su pecho; se aprecia una herida con sangrado en un muslo cubierta parcialmente por la mano del policía. Postura neutra, escena tranquila.
4. **Hemorragia grave.** Primer plano de dos manos enguantadas presionando firmemente una gasa blanca sobre un muslo con herida; al lado, un torniquete comercial de cinta con tensor (de los modernos, con varilla giratoria dentro de una carcasa y cinta ancha) colocado en el muslo por encima de la herida, nunca sobre una articulación. Sin cuerda ni palo.
5. **Politrauma y cuello.** Persona sentada en un auto chocado con la cabeza en posición neutra; un policía en la ventana del lado del conductor sosteniendo con las dos manos el cuello y la cabeza de forma suave, sin tirar ni girar. Sin collar.
6. **Fracturas y heridas.** Un antebrazo lesionado apoyado sobre una almohadilla, sostenido por la mano de un socorrista en la posición en que se encontró (sin enderezar); en el otro brazo se controlan la mano y los dedos (color y relleno capilar). Sin hueso expuesto.
8. **Convulsión y persona agitada.** Persona acostada de lado sobre el piso con una campera doblada bajo la cabeza; un policía arrodillado a un metro, con las manos visibles y abiertas, sin sujetar a la persona y sin tocar su boca; otro policía mira el reloj.
10. **Comunicación Policía–Hospital.** Un policía con radio en la mano parado junto a un patrullero y, a su lado, una enfermera con tablet; ambos se miran. En una pared al fondo, el cartel del hospital sin texto legible.

## Lista de revisión (marcar todas antes de usarla)
- [ ] La técnica mostrada coincide con lo que dice el módulo (no agrega pasos).
- [ ] Manos y dedos con anatomía normal; sin dedos de más ni extremidades fundidas.
- [ ] Torniquete moderno, sobre el miembro y no sobre una articulación; nada de palo y cuerda.
- [ ] Ningún objeto peligroso, arma apuntando a alguien ni gesto de reducción.
- [ ] Sin texto ni logos inventados; sin parecido a una persona real.
- [ ] Quien revisó: nombre, fecha, y aprobada / rechazada.

## Cómo se cargan en la app
1. Guardá cada imagen elegida como `public/learn/img/ref/<id>.png` (por ejemplo `escena-segura.png`).
2. Agregá su entrada en `public/learn/credits.mjs` con: `author: 'Generada con Runway (Gen-4 Image), <fecha>'`, `license` con el enlace a los términos de Runway y `source` con el enlace a esos términos. Anotá en el campo `title` que es una ilustración generada por IA.
3. Asignala a su módulo en `lessonImages` del mismo archivo (por ejemplo `'rtpp-1':['escena-segura']`).
4. Corré `npm test`: el test de créditos falla si falta autor, licencia o archivo.
Nota: el test actual exige que `source` sea una página de Wikimedia; al cargar la primera imagen de Runway hay que ajustarlo (puedo hacerlo cuando las tengas).
