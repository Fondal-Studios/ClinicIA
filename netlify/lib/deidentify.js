// Best-effort removal of personal identifiers before any text goes to the AI provider.
// 1) Known identifiers (name, document, phone, address, insurance, birth date) are matched accent- and case-insensitively.
// 2) Generic patterns (documents, phones, e-mails, URLs, "paciente Fulano", etc.) are masked even when nothing is known.
// It cannot guarantee anonymity (names of relatives, workplaces or rare details may remain): callers show the result to the
// professional before sending, and the dictation should avoid personal data.
const ACCENTS={a:'aàáâãäå',e:'eèéêë',i:'iìíîï',o:'oòóôõö',u:'uùúûü',n:'nñ',c:'cç'};
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const flex=word=>[...word.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()].map(ch=>ACCENTS[ch]?'['+ACCENTS[ch]+ACCENTS[ch].toUpperCase()+']':esc(ch)).join('');
const WORD=(src)=>new RegExp('(?<![\\p{L}\\p{N}])'+src+'(?![\\p{L}\\p{N}])','giu');
const digits=s=>String(s||'').replace(/\D/g,'');
const MONTHS=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const SMALL=new Set(['de','del','la','las','los','el','y','san','santa','van','von','da','do','dos','das']);
function nameRules(identity,rules){
 for(const field of ['nombre','apellido']){
  const full=String(identity[field]||'').trim();if(!full)continue;
  rules.push([WORD(full.split(/\s+/).map(flex).join('\\s+')),'[NOMBRE]']);
  for(const part of full.split(/\s+/))if(part.length>=3&&!SMALL.has(part.toLowerCase()))rules.push([WORD(flex(part)),'[NOMBRE]']);
 }
}
// A number written with optional dots, dashes or spaces between digit groups.
function numberRule(value,placeholder,rules,min=6){const d=digits(value);if(d.length<min)return;rules.push([new RegExp('(?<!\\d)'+[...d].map(esc).join('[\\s.\\-]?')+'(?!\\d)','g'),placeholder]);}
function buildRules(identity={}){
 const rules=[];
 nameRules(identity,rules);
 numberRule(identity.dni,'[DOCUMENTO]',rules,6);numberRule(identity.telefono,'[TELÉFONO]',rules,6);numberRule(identity.nroAfiliado,'[AFILIADO]',rules,4);
 if(identity.obraSocial&&identity.obraSocial.trim().length>=3)rules.push([WORD(identity.obraSocial.trim().split(/\s+/).map(flex).join('\\s+')),'[OBRA SOCIAL]']);
 if(identity.domicilio){
  rules.push([WORD(identity.domicilio.trim().split(/\s+/).map(flex).join('\\s+')),'[DOMICILIO]']);
  for(const part of identity.domicilio.split(/[\s,]+/))if(part.length>=4&&!SMALL.has(part.toLowerCase())&&!/^\d+$/.test(part))rules.push([WORD(flex(part)),'[DOMICILIO]']);
 }
 const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(identity.fechaNacimiento||'');
 if(m){const [_,y,mo,d]=m,di=String(Number(d)),mi=String(Number(mo));
  rules.push([new RegExp('(?<!\\d)0?'+di+'\\s*[/.\\-]\\s*0?'+mi+'\\s*[/.\\-]\\s*(?:'+y+'|'+y.slice(2)+')(?!\\d)','g'),'[FECHA DE NACIMIENTO]']);
  rules.push([new RegExp('(?<!\\d)'+y+'-'+mo+'-'+d+'(?!\\d)','g'),'[FECHA DE NACIMIENTO]']);
  rules.push([new RegExp('(?<!\\d)0?'+di+'\\s+de\\s+'+flex(MONTHS[Number(mo)-1])+'\\s+de\\s+'+y+'(?!\\d)','giu'),'[FECHA DE NACIMIENTO]']);
 }
 return rules;
}
const GENERIC=[
 [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[EMAIL]'],
 [/\bhttps?:\/\/\S+|\bwww\.\S+/gi,'[ENLACE]'],
 [/\b(?:dni|d\.n\.i\.?|documento|doc\.?|l\.?c\.?|l\.?e\.?|cuil|cuit|pasaporte)\s*(?:n[°ºo.]*\s*)?:?\s*\d[\d.\-\s]{4,}\d/gi,'[DOCUMENTO]'],
 [/(?:\+?54\s?9?\s?)?(?:\(?0?\d{2,4}\)?[\s.\-]?)?\d{3,4}[\s.\-]\d{4}\b/g,'[TELÉFONO]'],
 [/(?<![\d.,])\d{1,2}[.\s]\d{3}[.\s]\d{3}(?![\d])/g,'[DOCUMENTO]'],
 [/(?<![\d.,/-])\d{7,8}(?![\d.,/-])/g,'[NÚMERO]']
];
// "paciente Juan Pérez", "su esposa María", "Dr. López": one to three capitalised words after a title or a family relation.
const TITLES=['paciente','se llama','llamado','llamada','se apellida','apellido','nombre','señor','señora','sr','sra','sres','doctor','doctora','dr','dra','licenciado','licenciada','lic','enfermero','enfermera','esposo','esposa','marido','mujer','hijo','hija','madre','padre','hermano','hermana','abuelo','abuela','tío','tía','sobrino','sobrina','primo','prima','nieto','nieta','pareja','vecino','vecina','amigo','amiga','cuñado','cuñada','suegro','suegra','yerno','nuera','novio','novia'];
const titleSrc=TITLES.map(t=>t.split(' ').map(w=>'['+w[0].toUpperCase()+w[0]+']'+w.slice(1)).join('\\s+')).join('|');
const TITLED=new RegExp('(?<![\\p{L}])('+titleSrc+')\\.?\\s+(?:(?:es|de|del)\\s+)?((?:\\p{Lu}[\\p{L}\'’-]+)(?:\\s+(?:de\\s+(?:la\\s+|los\\s+|las\\s+)?|del\\s+)?\\p{Lu}[\\p{L}\'’-]+){0,2})','gu');
function deidentify(text,identity={}){
 let out=String(text||'');const counts={};
 const bump=(label,n)=>{if(n)counts[label]=(counts[label]||0)+n;};
 const apply=(re,label)=>{out=out.replace(re,()=>{bump(label,1);return label;});};
 for(const [re,label] of GENERIC.slice(0,2))apply(re,label);
 for(const [re,label] of buildRules(identity))apply(re,label);
 out=out.replace(TITLED,(whole,title)=>{bump('[NOMBRE]',1);return title+' [NOMBRE]';});
 for(const [re,label] of GENERIC.slice(2))apply(re,label);
 return {text:out,counts,redactions:Object.values(counts).reduce((a,b)=>a+b,0)};
}

module.exports={deidentify};
