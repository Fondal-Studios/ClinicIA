// Fixtures shared by the course tests and the browser smoke test.
export const PAGES=[
 ['La hipertension arterial se define como una presion arterial sistolica mayor o igual a 140 mmHg en consultorio.','El tratamiento inicial incluye cambios en el estilo de vida y control del peso corporal en todos los casos.'],
 ['La insuficiencia cardiaca con fraccion de eyeccion reducida se define con una fraccion de eyeccion menor al 40 por ciento.','Los inhibidores de la enzima convertidora mejoran la supervivencia en estos pacientes con disfuncion sistolica.'],
 ['La fibrilacion auricular es la arritmia sostenida mas frecuente en la practica clinica de adultos mayores.','El riesgo de ictus se estima con la escala CHA2DS2-VASc para decidir la anticoagulacion del paciente.']
];
// Minimal valid PDF with one text block per page.
export function makePdf(pages){
 const esc=s=>s.replace(/[\\()]/g,'\\$&'),objs=[];
 objs[1]='<< /Type /Catalog /Pages 2 0 R >>';
 objs[2]=`<< /Type /Pages /Kids [${pages.map((_,i)=>`${4+i*2} 0 R`).join(' ')}] /Count ${pages.length} >>`;
 objs[3]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
 pages.forEach((lines,i)=>{
  const content=['BT','/F1 9 Tf','30 750 Td','14 TL',...lines.map(l=>`(${esc(l)}) Tj T*`),'ET'].join('\n');
  objs[4+i*2]=`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${5+i*2} 0 R >>`;
  objs[5+i*2]=`<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`;
 });
 let out='%PDF-1.4\n';const offsets=[];
 for(let i=1;i<objs.length;i++){offsets[i]=Buffer.byteLength(out);out+=`${i} 0 obj\n${objs[i]}\nendobj\n`;}
 const xref=Buffer.byteLength(out);
 out+=`xref\n0 ${objs.length}\n0000000000 65535 f \n`+offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
 return Buffer.from(out,'latin1');
}

