// Catalog of legally accessible learning resources. External links are NOT mirrored.
export const medicalResources=[
 {id:'openstax-ap',title:'Anatomy and Physiology',author:'OpenStax',specialty:'Anatomía y fisiología',kind:'libro',language:'en',url:'https://openstax.org/subjects/anatomy-and-physiology',access:'external',license:'Consultar la licencia de la edición antes de redistribuir',verifiedSource:true},
 {id:'ncbi-bookshelf',title:'NCBI Bookshelf',author:'National Library of Medicine',specialty:'Medicina general',kind:'colección',language:'en',url:'https://www.ncbi.nlm.nih.gov/books/',access:'external',license:'Variable por obra; no implica permiso de alojamiento',verifiedSource:true},
 {id:'who-iris',title:'Repositorio de publicaciones de la OMS',author:'Organización Mundial de la Salud',specialty:'Salud pública',kind:'colección',language:'multi',url:'https://iris.who.int/',access:'external',license:'Variable según obra; algunas licencias excluyen uso comercial',verifiedSource:true}
];
export function searchLibrary({query='',specialty='',kind=''}={}){
 const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 return medicalResources.filter(r=>(!specialty||norm(r.specialty).includes(norm(specialty)))&&(!kind||r.kind===kind)&&(!query||norm([r.title,r.author,r.specialty].join(' ')).includes(norm(query))));
}
