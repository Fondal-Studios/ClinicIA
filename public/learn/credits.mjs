// Registro de imágenes de terceros. Cada imagen debe tener autor, licencia con enlace y página de origen.
// Obtenidas de Wikimedia Commons el 2026-11-12. Solo se redujo el tamaño (máx. 960 px de ancho); no se modificó el contenido.
const CC0={name:'CC0 1.0 (dominio público)',url:'https://creativecommons.org/publicdomain/zero/1.0/'};
const BYSA4={name:'CC BY-SA 4.0',url:'https://creativecommons.org/licenses/by-sa/4.0/'};
const PD={name:'Dominio público (obra de empleados del Gobierno de EE. UU.)',url:'https://commons.wikimedia.org/wiki/Template:PD-USGov'};
export const imageCredits={
 'rcp-manos':{file:'/learn/img/ref/rcp-manos.jpg',title:'Posición de las manos para compresiones torácicas',alt:'Dibujo en blanco y negro de un tórax con las manos entrelazadas sobre la mitad inferior del esternón.',author:'Another-anon-artist-234',license:CC0,source:'https://commons.wikimedia.org/wiki/File:Chest-compression-hand-placement.jpg'},
 'acv-cara':{file:'/learn/img/ref/acv-cara.jpg',title:'Asimetría facial en un ACV',alt:'Dibujo en blanco y negro de una cara con descenso de la comisura de un lado de la boca.',author:'Another-anon-artist-234',license:CC0,source:'https://commons.wikimedia.org/wiki/File:Stroke-facial-droop.jpg'},
 'heimlich':{file:'/learn/img/ref/heimlich.png',title:'Maniobra de Heimlich en adulto y niño',alt:'Ilustración a color de una persona que abraza por detrás a un adulto, con detalle de las manos, y a un niño.',author:'BruceBlaus',license:BYSA4,source:'https://commons.wikimedia.org/wiki/File:Heimlich_Adult_%26_Child.png'},
 'compresion-abdominal':{file:'/learn/img/ref/compresion-abdominal.jpg',title:'Zona de aplicación de compresiones abdominales',alt:'Esquema de las costillas con un óvalo verde entre el esternón y el ombligo y las manos entrelazadas que empujan hacia arriba.',author:'U.S. Army Medical Department Center and School, Fort Sam Houston',license:PD,source:'https://commons.wikimedia.org/wiki/File:Abdominal_thrusts,_point_of_applying.jpg'}
};
// Qué imágenes se muestran en cada módulo del curso policial (además del esquema original).
export const lessonImages={'rtpp-3':['rcp-manos'],'rtpp-7':['acv-cara'],'rtpp-9':['heimlich','compresion-abdominal']};
export const refFigure=(id,esc=s=>s)=>{const c=imageCredits[id];return `<figure class="clinical-visual ref-figure"><img src="${esc(c.file)}" alt="${esc(c.alt)}" loading="lazy" style="display:block;max-width:100%;height:auto;margin:auto"><figcaption><strong>${esc(c.title)}.</strong> Imagen de referencia, no reemplaza la práctica supervisada. Autor: ${esc(c.author)} · Licencia: <a href="${esc(c.license.url)}" target="_blank" rel="noopener">${esc(c.license.name)}</a> · <a href="${esc(c.source)}" target="_blank" rel="noopener">Fuente</a> · Tamaño reducido.</figcaption></figure>`;};
