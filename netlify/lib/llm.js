// Shared provider call for server features that need a single completion (class builder, query planner).
// The chat tutor keeps its own inline call so its error mapping stays untouched.
function providerStatus(env=process.env){
 const provider=env.TUTOR_PROVIDER||(env.GROQ_API_KEY?'groq':'anthropic');
 if(!['groq','anthropic'].includes(provider))return {ok:false,error:'Proveedor de tutor no configurado correctamente.'};
 if(provider==='groq'?!env.GROQ_API_KEY:(!env.ANTHROPIC_API_KEY||!env.ANTHROPIC_MODEL))return {ok:false,error:'Tutor pendiente de configuración del proveedor y modelo.'};
 return {ok:true,provider};
}
async function callModel({system,messages,maxTokens=1200,json=false,timeoutMs=20000,env=process.env,fetchImpl=fetch}){
 const st=providerStatus(env);if(!st.ok)throw Object.assign(new Error(st.error),{status:503});
 const groq=st.provider==='groq';
 const req=groq?{url:'https://api.groq.com/openai/v1/chat/completions',headers:{'Content-Type':'application/json',Authorization:'Bearer '+env.GROQ_API_KEY},body:{model:env.GROQ_MODEL||'llama-3.3-70b-versatile',max_tokens:maxTokens,temperature:0.2,messages:[{role:'system',content:system},...messages],...(json?{response_format:{type:'json_object'}}:{})}}
  :{url:'https://api.anthropic.com/v1/messages',headers:{'Content-Type':'application/json','x-api-key':env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},body:{model:env.ANTHROPIC_MODEL,max_tokens:maxTokens,temperature:0,system,messages}};
 let r;try{r=await fetchImpl(req.url,{method:'POST',headers:req.headers,body:JSON.stringify(req.body),signal:AbortSignal.timeout(timeoutMs)});}catch{throw Object.assign(new Error('No se pudo conectar con el proveedor de IA.'),{status:502});}
 if(!r.ok){console.error('llm_provider_failure',JSON.stringify({provider:st.provider,status:r.status}));throw Object.assign(new Error(r.status===429?'La IA alcanzó su cuota temporal. Intentá más tarde.':'El proveedor no pudo responder.'),{status:r.status===429?429:502});}
 const data=await r.json();
 const text=groq?data.choices?.[0]?.message?.content:data.content?.filter(b=>b.type==='text').map(b=>b.text).join('\n');
 const truncated=groq?data.choices?.[0]?.finish_reason==='length':data.stop_reason==='max_tokens';
 if(truncated||typeof text!=='string'||!text.trim())throw Object.assign(new Error('El proveedor devolvió una respuesta incompleta.'),{status:502});
 return text;
}
function parseJson(text){const a=text.indexOf('{'),b=text.lastIndexOf('}');if(a<0||b<=a)return null;try{return JSON.parse(text.slice(a,b+1));}catch{return null;}}
module.exports={callModel,parseJson,providerStatus};
