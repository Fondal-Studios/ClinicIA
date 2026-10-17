// Free, keyless web retrieval for the tutor. Only fixed, reputable endpoints are called; the query is always URL-encoded.
// Results are external, unreviewed material: callers must label them as such and never present them as validated.
const decode=s=>s.replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#0?39;/g,"'").replace(/&amp;/g,'&');
// MedlinePlus returns entity-escaped HTML, so decode once, remove tags, then drop any stray angle brackets.
const strip=s=>decode(String(s||'')).replace(/<[^>]*>/g,' ').replace(/[<>]/g,' ').replace(/\s+/g,' ').trim();
const clip=(s,n)=>{s=strip(s);return s.length>n?s.slice(0,n-1)+'…':s;};
const safeUrl=u=>{try{const x=new URL(u);return x.protocol==='https:'?x.href:null;}catch{return null;}};
async function getJson(fetchImpl,url,type){const r=await fetchImpl(url,{headers:{Accept:type==='xml'?'application/xml,text/xml':'application/json','User-Agent':'ClinicIA-tutor/1.0 (educational)'},signal:AbortSignal.timeout(8000)});if(!r.ok)throw new Error('status '+r.status);return type==='xml'?r.text():r.json();}

async function europePmc(fetchImpl,query,limit){
 const url='https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&pageSize='+limit+'&sort=RELEVANCE&query='+encodeURIComponent('('+query+') AND (HAS_ABSTRACT:y)');
 const data=await getJson(fetchImpl,url);
 return (data.resultList?.result||[]).map(r=>{const link=r.doi?'https://doi.org/'+r.doi:r.pmid?'https://pubmed.ncbi.nlm.nih.gov/'+r.pmid+'/':null;
  return link&&{provider:'Europe PMC',kind:'literatura',title:clip(r.title,200),url:safeUrl(link),text:clip(r.abstractText,1200),meta:[clip(r.journalTitle,80),r.pubYear].filter(Boolean).join(' · ')};}).filter(x=>x&&x.url&&x.text);
}
async function medlinePlus(fetchImpl,query,limit){
 const xml=await getJson(fetchImpl,'https://wsearch.nlm.nih.gov/ws/query?db=healthTopicsSpanish&retmax='+limit+'&term='+encodeURIComponent(query),'xml');
 const out=[];for(const m of xml.matchAll(/<document\b[^>]*\burl="([^"]+)"[^>]*>([\s\S]*?)<\/document>/g)){
  const field=n=>{const f=m[2].match(new RegExp('<content name="'+n+'">([\\s\\S]*?)</content>'));return f?f[1]:'';};
  const url=safeUrl(m[1].replace(/&amp;/g,'&')),text=clip(field('FullSummary')||field('snippet'),1200);
  if(url&&text)out.push({provider:'MedlinePlus (NLM)',kind:'guía para pacientes',title:clip(field('title'),200),url,text,meta:'Biblioteca Nacional de Medicina de EE. UU.'});
 }
 return out.slice(0,limit);
}
async function wikipedia(fetchImpl,query,limit){
 const url='https://es.wikipedia.org/w/api.php?action=query&format=json&generator=search&prop=extracts%7Cinfo&exintro=1&explaintext=1&exchars=1200&inprop=url&gsrlimit='+limit+'&gsrsearch='+encodeURIComponent(query);
 const data=await getJson(fetchImpl,url);
 return Object.values(data.query?.pages||{}).sort((a,b)=>(a.index||0)-(b.index||0)).map(p=>({provider:'Wikipedia',kind:'enciclopedia',title:clip(p.title,200),url:safeUrl(p.fullurl),text:clip(p.extract,1200),meta:'Contenido colaborativo, no revisado por pares'})).filter(x=>x.url&&x.text);
}
// Returns {results,errors}. Never throws: a failing provider is reported and skipped so one outage does not silence the tutor.
async function searchWeb(query,{fetchImpl=fetch,limit=3}={}){
 const q=String(query||'').replace(/[^\p{L}\p{N}\s\-]/gu,' ').replace(/\s+/g,' ').trim().slice(0,200);
 if(q.length<3)return {results:[],errors:[]};
 const providers=[['Europe PMC',europePmc],['MedlinePlus',medlinePlus],['Wikipedia',wikipedia]];
 const settled=await Promise.allSettled(providers.map(([,fn])=>fn(fetchImpl,q,limit)));
 const results=[],errors=[],seen=new Set();
 settled.forEach((s,i)=>{if(s.status==='fulfilled'){for(const r of s.value)if(!seen.has(r.url)){seen.add(r.url);results.push(r);}}else errors.push(providers[i][0]);});
 // Guidelines-style sources first, encyclopedia last, so a thin Wikipedia entry never outranks literature.
 const rank={'Europe PMC':0,'MedlinePlus (NLM)':1,'Wikipedia':2};results.sort((a,b)=>rank[a.provider]-rank[b.provider]);
 return {results:results.map((r,i)=>({id:'W'+(i+1),...r})),errors};
}
module.exports={searchWeb};
