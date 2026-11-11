// Ilustraciones originales (SVG) para los 10 módulos de «Respuesta Táctica Prehospitalaria Policial».
// Son esquemas didácticos, no anatomía a escala. Solo repiten lo que dice cada módulo; no agregan dosis, cifras ni técnicas nuevas.
const G='#17634f',L='#eaf3ed',D='#173b38',R='#b3261e',A='#c77700',B='#ffffff';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const t=(x,y,s,o={})=>`<text x="${x}" y="${y}" fill="${o.c||D}" font-size="${o.s||14}" font-weight="${o.w||400}" text-anchor="${o.a||'middle'}" font-family="system-ui,sans-serif">${esc(s)}</text>`;
const box=(x,y,w,h,f=L,s=G,r=12)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" stroke="${s}" stroke-width="2"/>`;
const arrow=(x1,y1,x2,y2,c=G)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="3" marker-end="url(#ah)"/>`;
const cross=(x,y,c=R)=>`<g stroke="${c}" stroke-width="5" stroke-linecap="round"><line x1="${x-9}" y1="${y-9}" x2="${x+9}" y2="${y+9}"/><line x1="${x+9}" y1="${y-9}" x2="${x-9}" y2="${y+9}"/></g>`;
const person=(x,y,c=G)=>`<g fill="${c}"><circle cx="${x}" cy="${y}" r="9"/><rect x="${x-9}" y="${y+12}" width="18" height="30" rx="8"/></g>`;
const lying=(x,y,c='#6b7f7a')=>`<g fill="${c}"><circle cx="${x}" cy="${y}" r="10"/><rect x="${x+14}" y="${y-9}" width="90" height="18" rx="9"/><rect x="${x+100}" y="${y-8}" width="55" height="16" rx="8"/></g>`;
const wrap=(title,desc,body,cap)=>`<svg viewBox="0 0 660 270" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="t d"><title id="t">${esc(title)}</title><desc id="d">${esc(desc)}</desc><defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${G}"/></marker></defs><rect width="660" height="270" rx="16" fill="${B}" stroke="#cfe0d8"/>${body}${t(330,258,cap,{s:12,c:'#51635f'})}</svg>`;
const chips=(items,x,y,w,gap,h=46)=>items.map((s,i)=>box(x,y+i*(h+gap),w,h)+t(x+w/2,y+i*(h+gap)+h/2+5,s,{s:14,w:600})).join('');
const scenes={
1:()=>wrap('Seguridad de la escena','Un vehículo chocado con cables caídos, una zona aislada con línea punteada y una persona que observa a distancia y avisa.',
 `<rect x="0" y="175" width="660" height="60" fill="#dfe6e3"/><g stroke="#fff" stroke-width="4" stroke-dasharray="26 18"><line x1="10" y1="205" x2="650" y2="205"/></g>`+
 `<rect x="300" y="150" width="130" height="42" rx="10" fill="#8a9a96"/><rect x="325" y="130" width="70" height="30" rx="8" fill="#a7b5b1"/><circle cx="330" cy="195" r="11" fill="${D}"/><circle cx="405" cy="195" r="11" fill="${D}"/>`+
 `<path d="M360 20 L345 80 L372 100 L350 150" stroke="${R}" stroke-width="3" fill="none"/>${cross(372,100)}<rect x="262" y="104" width="204" height="96" rx="14" fill="none" stroke="${R}" stroke-width="3" stroke-dasharray="9 7"/>`+
 t(338,42,'Cables: no tocar',{c:R,w:700,a:'end'})+t(364,225,'Zona aislada',{c:R,w:700})+
 person(90,120)+t(90,185,'Vos: distancia segura',{s:13,w:700})+arrow(125,140,255,150)+
 box(470,30,175,92,'#fff7e6',A)+t(557,52,'AVISO INICIAL',{w:700,c:A,s:13})+t(557,72,'Ubicación y acceso',{s:12})+t(557,88,'Riesgos · Cuántos',{s:12})+t(557,104,'Recursos necesarios',{s:12}),
 'No transformes una víctima en dos: primero controlá el riesgo, después ayudá.'),
2:()=>wrap('Evaluación inicial','Banner rojo para hemorragia masiva y cinco filas A B C D E con su significado.',
 box(20,16,620,40,'#fdecea',R)+t(330,42,'Hemorragia externa masiva: se trata de inmediato',{w:700,c:R,s:16})+
 [['A','Vía aérea'],['B','Respiración'],['C','Circulación y sangrado'],['D','Conciencia'],['E','Exposición limitada · evitar el frío']].map(([a,s],i)=>`<circle cx="60" cy="${88+i*32}" r="13" fill="${G}"/>${t(60,93+i*32,a,{c:B,w:700,s:15})}${t(90,93+i*32,s,{a:'start',s:15})}`).join('')+
 box(380,76,250,150,'#fff7e6',A)+t(505,102,'Reevaluá si cambia',{w:700,c:A})+t(505,126,'No esperes a terminar',{s:13})+t(505,144,'la lista para tratar',{s:13})+t(505,162,'una amenaza vital.',{s:13})+t(505,196,'Pedí ayuda temprano.',{w:700,s:13}),
 'ABCDE ordena la observación; no retrasa el control de una amenaza vital evidente.'),
3:()=>wrap('Paro, RCP y DEA','Cadena de cinco pasos: reconocer, llamar y pedir DEA, RCP, DEA con nadie tocando, continuar hasta que llegue ayuda.',
 ['Reconocer','Llamar + DEA','RCP','DEA','Seguir'].map((s,i)=>box(14+i*128,30,116,70)+`<circle cx="${34+i*128}" cy="46" r="11" fill="${G}"/>${t(34+i*128,51,i+1,{c:B,w:700})}${t(72+i*128,82,s,{w:700,s:14})}`).join('')+
 [0,1,2,3].map(i=>arrow(130+i*128,65,142+i*128,65)).join('')+
 t(72,122,'No responde y',{s:11})+t(72,136,'no respira normal',{s:11})+t(72,150,'(jadeo aislado cuenta)',{s:10})+t(200,122,'Uno llama,',{s:11})+t(200,136,'otro trae el DEA',{s:11})+t(460,122,'Análisis y descarga:',{s:11,c:R,w:700})+t(460,136,'NADIE toca al paciente',{s:11,c:R,w:700})+
 lying(150,195)+box(330,168,310,64,'#fff7e6',A)+t(485,190,'En clase: sin maniquí, sin presión sobre',{s:12})+t(485,208,'compañeros y con el DEA apagado.',{s:12}),
 'En una emergencia real, seguí las indicaciones del DEA y del equipo sanitario.'),
4:()=>wrap('Hemorragia grave y shock','Una pierna con herida, presión directa, torniquete con hora anotada y señales de shock.',
 `<rect x="40" y="95" width="300" height="46" rx="23" fill="#d9c3b0"/><circle cx="215" cy="118" r="11" fill="${R}"/>`+
 `<rect x="238" y="82" width="22" height="72" rx="5" fill="${A}"/>`+box(205,28,96,30,'#fff7e6',A)+t(253,48,'Hora: __:__',{w:700,c:A,s:13})+arrow(253,58,253,80,A)+
 t(253,172,'Torniquete (si indicado y capacitado)',{s:12,c:A,w:700})+
 `<circle cx="150" cy="118" r="24" fill="none" stroke="${G}" stroke-width="3"/>`+t(150,76,'Presión directa',{w:700,s:13})+arrow(150,82,150,92)+
 box(372,22,268,130,'#fdecea',R)+t(506,46,'Señales de alarma',{w:700,c:R})+['Palidez','Sudor frío','Debilidad','Confusión'].map((s,i)=>t(506,70+i*20,'• '+s,{s:13})).join('')+t(506,150-8,'Sin tensiómetro también cuenta',{s:11})+
 t(506,190,'No aflojar el torniquete',{w:700,s:13,c:R})+t(506,208,'periódicamente · controlar y avisar',{s:12}),
 'En clase: material simulado. Nunca ocluyas la circulación de un compañero.'),
5:()=>wrap('Politrauma y cuello','Prioridad a la respiración, sin forzar el cuello; movilización coordinada solo ante peligro inmediato.',
 box(20,24,300,200)+t(170,48,'Choque con dolor cervical',{w:700})+person(170,80)+t(170,150,'Minimizá movimientos',{s:13})+t(170,168,'Pedí asistencia',{s:13})+t(170,186,'Prioridad: respiración',{s:13,w:700})+
 `<g>${cross(90,86)}${t(90,116,'No tirar',{s:12,c:R,w:700})}${cross(250,86)}${t(250,116,'No forzar alineación',{s:11,c:R,w:700})}</g>`+
 box(340,24,300,200,'#fff7e6',A)+t(490,48,'Peligro inmediato (fuego, humo)',{w:700,c:A,s:13})+t(490,80,'Mover SOLO por peligro o necesidad vital',{s:12})+t(490,100,'con ayuda y coordinación',{s:12})+t(490,120,'según entrenamiento.',{s:12})+t(490,160,'Comunicá la decisión y el motivo.',{s:13,w:700})+t(490,190,'Sin collar automático.',{s:12}),
 'En clase no se practican tracciones ni manipulaciones cervicales sobre compañeros.'),
6:()=>wrap('Fracturas y heridas','Sostener la extremidad como se encontró y controlar color, sensibilidad y circulación distal.',
 `<g stroke="#c7a98e" stroke-width="22" stroke-linecap="round" fill="none"><path d="M50 130 L170 110 L210 150 L320 120"/></g>`+
 `<circle cx="170" cy="110" r="8" fill="${R}"/>`+t(170,80,'Deformidad: no enderezar',{w:700,c:R,s:13})+
 `<g fill="${G}"><rect x="80" y="170" width="190" height="28" rx="14"/></g>`+t(175,189,'Sostener como está',{c:B,w:700,s:13})+
 box(380,24,260,170)+t(510,48,'Antes y después de sostener',{w:700,s:13})+['Color','Sensibilidad','Circulación distal'].map((s,i)=>`<circle cx="410" cy="${78+i*32}" r="10" fill="${G}"/>${t(410,83+i*32,i+1,{c:B,w:700,s:12})}${t(432,83+i*32,s,{a:'start',s:14})}`).join('')+
 t(510,184,'Si algo empeora: reevaluar y avisar',{s:12,w:700}),
 'No reintroducir huesos ni retirar objetos incrustados.'),
7:()=>wrap('Reconocer un ACV y dolor torácico','Cuatro pistas para posible ACV: cara, brazos, habla y hora; y aviso ante dolor torácico.',
 `<circle cx="95" cy="92" r="46" fill="#f3e2d0" stroke="${D}" stroke-width="2"/><circle cx="78" cy="80" r="4" fill="${D}"/><circle cx="112" cy="80" r="4" fill="${D}"/><path d="M72 112 Q95 104 118 118" stroke="${R}" stroke-width="3" fill="none"/>`+t(80,160,'CARA: asimetría',{w:700,s:12})+
 `<g stroke="${D}" stroke-width="8" stroke-linecap="round"><line x1="195" y1="85" x2="265" y2="70"/><line x1="195" y1="85" x2="265" y2="115" stroke="${R}"/></g>`+t(215,160,'BRAZOS: uno cae',{w:700,s:12})+
 box(300,50,100,50,'#fff')+t(350,80,'"ta… ta…"',{s:14})+t(345,160,'HABLA: alterada',{w:700,s:12})+
 `<circle cx="500" cy="85" r="34" fill="none" stroke="${G}" stroke-width="4"/><path d="M500 62 V85 L517 95" stroke="${G}" stroke-width="4" fill="none"/>`+t(500,160,'HORA: última vez bien',{w:700,s:12})+
 box(40,185,580,52,'#fdecea',R)+t(330,208,'Dolor torácico nuevo, falta de aire o sudoración: pedir ayuda sin esperar diagnóstico.',{s:13,w:700})+t(330,226,'Sin comida ni bebida si hay alteración de conciencia o al tragar.',{s:12}),
 'Comunicá hallazgos y la última hora conocida sin síntomas; no hace falta un diagnóstico.'),
8:()=>wrap('Convulsión y persona agitada','Convulsión: proteger de golpes y observar; agitación: distancia segura y apoyo sanitario.',
 box(20,24,310,200)+t(175,48,'Convulsión',{w:700})+lying(60,110)+`<rect x="40" y="128" width="30" height="10" rx="5" fill="${A}"/>`+t(175,160,'Proteger de golpes · medir duración',{s:12})+t(175,178,'Mirar la respiración y la recuperación',{s:12})+cross(60,196)+t(175,200,'No sujetar · nada en la boca',{s:12,c:R,w:700})+
 box(350,24,290,200,'#fff7e6',A)+t(495,48,'Agitado o somnoliento',{w:700,c:A})+t(495,80,'Puede ser hipoglucemia, trauma,',{s:12})+t(495,98,'ACV u otra urgencia médica.',{s:12})+t(495,130,'Distancia segura · voz calma',{s:13,w:700})+t(495,152,'Pedir apoyo sanitario',{s:13,w:700})+t(495,184,'En custodia: vigilar conciencia',{s:12})+t(495,202,'y respiración; avisar el deterioro.',{s:12}),
 'Este curso no enseña técnicas de reducción.'),
9:()=>wrap('Atragantamiento','Árbol de decisión: si puede toser o hablar, animar; si no puede, pedir ayuda y aplicar el algoritmo vigente; si pierde la respuesta, iniciar RCP.',
 `<g fill="${G}"><circle cx="60" cy="70" r="14"/><rect x="42" y="88" width="36" height="46" rx="12"/></g>`+t(60,160,'Manos al cuello',{s:12,w:700})+
 box(130,30,160,60,'#fff')+t(210,56,'¿Puede toser o',{w:700,s:13})+t(210,74,'hablar?',{w:700,s:13})+
 box(330,20,300,40,L)+t(480,45,'SÍ: animar a toser y vigilar',{s:13,w:700})+
 box(330,78,300,56,'#fff7e6',A)+t(480,100,'NO: pedir ayuda y seguir el algoritmo',{s:13,w:700})+t(480,120,'vigente, según tu capacitación',{s:12})+
 box(330,152,300,56,'#fdecea',R)+t(480,174,'Pierde la respuesta: iniciar RCP',{s:13,w:700,c:R})+t(480,194,'Sin barrido ciego de la boca',{s:12})+
 arrow(290,50,328,40)+arrow(290,70,328,100)+arrow(480,134,480,150,R),
 'En clase no se practican golpes ni compresiones abdominales reales sobre compañeros.'),
10:()=>wrap('Entrega Policía–Hospital','Estructura del mensaje por radio: ubicación, qué pasó y cuándo, estado observado, medidas, evolución y confirmación de recepción.',
 [['1','Ubicación y acceso'],['2','Qué pasó y a qué hora'],['3','Respuesta · respiración · sangrado'],['4','Medidas realizadas'],['5','Evolución / cambios'],['6','Confirmar recepción y repetir lo crítico']].map(([n,s],i)=>`<circle cx="${50+(i%2)*310}" cy="${52+Math.floor(i/2)*58}" r="14" fill="${G}"/>${t(50+(i%2)*310,57+Math.floor(i/2)*58,n,{c:B,w:700})}${t(74+(i%2)*310,57+Math.floor(i/2)*58,s,{a:'start',s:14})}`).join('')+
 box(40,196,580,44,'#fff7e6',A)+t(330,214,'«Descompensado» no es un dato. Decí lo observado.',{s:13,w:700})+t(330,231,'Si no lo mediste, decí «no medido». Ensayá 30–45 segundos.',{s:12}),
 'Transmití solo lo necesario, por canales autorizados.')
};
export const illustration=n=>(scenes[n]||scenes[1])();
export const illustrationCount=Object.keys(scenes).length;
