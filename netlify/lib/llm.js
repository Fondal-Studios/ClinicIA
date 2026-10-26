// Shared provider call for server features that need a single completion (class builder, query planner).
// The chat tutor keeps its own inline call so its error mapping stays untouched.
const clean=v=>typeof v==='string'?v.trim():v;
// Values pasted into a dashboard often carry a trailing space/newline, which makes the HTTP header invalid.
// API keys are plain printable ASCII: keep only the key itself so stray newlines, quotes or zero-width characters from a paste cannot break the header.
const apiKey=v=>typeof v==='string'?(v.match(/sk-ant-[A-Za-z0-9_-]+/)?.[0]||v.replace(/[^\x21-\x7E]/g,'')):v;
function cleanEnv(env){return {...env,GROQ_API_KEY:apiKey(env.GROQ_API_KEY),GROQ_MODEL:clean(env.GROQ_MODEL),ANTHROPIC_API_KEY:apiKey(env.ANTHROPIC_API_KEY),ANTHROPIC_MODEL:clean(env.ANTHROPIC_MODEL),TUTOR_PROVIDER:clean(env.TUTOR_PROVIDER)};}
function providerStatus(rawEnv=process.env){const env=cleanEnv(rawEnv);
 const provider=env.TUTOR_PROVIDER||(env.GROQ_API_KEY?'groq':'anthropic');
 if(!['groq','anthropic'].includes(provider))return {ok:false,error:'Proveedor de tutor no configurado correctamente.'};
 if(provider==='groq'?!env.GROQ_API_KEY:(!env.ANTHROPIC_API_KEY||!env.ANTHROPIC_MODEL))return {ok:false,error:'Tutor pendiente de configuración del proveedor y modelo.'};
 return {ok:true,provider};
}
// Claude 5 models reject temperature/top_p/top_k (400) and think adaptively by default; thinking tokens count against max_tokens,
// so Anthropic requests get headroom. It is only a ceiling: unused headroom is not billed.
const THINKING_HEADROOM=1024;
function buildRequest(st,env,{system,messages,maxTokens,json=false,stream=false}){
 const groq=st.provider==='groq';
 return groq?{url:'https://api.groq.com/openai/v1/chat/completions',headers:{'Content-Type':'application/json',Authorization:'Bearer '+env.GROQ_API_KEY},body:{model:env.GROQ_MODEL||'llama-3.3-70b-versatile',max_tokens:maxTokens,temperature:0.2,messages:[{role:'system',content:system},...messages],...(json?{response_format:{type:'json_object'}}:{}),...(stream?{stream:true}:{})}}
  :{url:'https://api.anthropic.com/v1/messages',headers:{'Content-Type':'application/json','x-api-key':env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},body:{model:env.ANTHROPIC_MODEL,max_tokens:maxTokens+THINKING_HEADROOM,system,messages,...(stream?{stream:true}:{})}};
}
const STATUS_MESSAGES={401:'El proveedor rechazó la clave de API. Revisá la credencial en el servidor.',403:'El proveedor no habilitó el acceso a este modelo o cuenta.',404:'El modelo configurado no está disponible.',413:'El contexto excede el límite del proveedor. Intentá una consulta más breve.',429:'La IA alcanzó su cuota temporal. Intentá más tarde.'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// One retry for transient failures only (network error, 5xx). 429 and 4xx are never retried: they would burn quota or repeat a bad request.
async function callModel({system,messages,maxTokens=1200,json=false,timeoutMs=20000,retries=1,label='llm',env:rawEnv=process.env,fetchImpl=fetch}){
 const env=cleanEnv(rawEnv),st=providerStatus(env);if(!st.ok)throw Object.assign(new Error(st.error),{status:503});
 const groq=st.provider==='groq';
 const req=buildRequest(st,env,{system,messages,maxTokens,json});
 const model=req.body.model,started=Date.now();
 for(let attempt=0;;attempt++){
  let r;
  try{r=await fetchImpl(req.url,{method:'POST',headers:req.headers,body:JSON.stringify(req.body),signal:AbortSignal.timeout(timeoutMs)});}
  catch(e){
   if(attempt<retries){await sleep(400*(attempt+1));continue;}
   console.error('llm_call',JSON.stringify({label,provider:st.provider,model,ok:false,error:'network',errName:e?.name,errCode:e?.cause?.code||e?.code,attempt,ms:Date.now()-started}));
   throw Object.assign(new Error('No se pudo conectar con el proveedor de IA.'),{status:502});
  }
  if(!r.ok){
   if(r.status>=500&&attempt<retries){await sleep(400*(attempt+1));continue;}
   console.error('llm_call',JSON.stringify({label,provider:st.provider,model,ok:false,status:r.status,attempt,ms:Date.now()-started}));
   throw Object.assign(new Error(STATUS_MESSAGES[r.status]||'El proveedor no pudo responder. Revisá la configuración del servidor.'),{status:r.status===429?429:502});
  }
  const data=await r.json();
  const text=groq?data.choices?.[0]?.message?.content:data.content?.filter(b=>b.type==='text').map(b=>b.text).join('\n');
  const truncated=groq?data.choices?.[0]?.finish_reason==='length':data.stop_reason==='max_tokens';
  const usage=groq?{in:data.usage?.prompt_tokens,out:data.usage?.completion_tokens}:{in:data.usage?.input_tokens,out:data.usage?.output_tokens};
  const good=!truncated&&typeof text==='string'&&text.trim();
  // Metrics only: no prompt, answer or user text is ever logged.
  console.log('llm_call',JSON.stringify({label,provider:st.provider,model,ok:!!good,truncated,tokensIn:usage.in,tokensOut:usage.out,attempt,ms:Date.now()-started}));
  if(!good)throw Object.assign(new Error('El proveedor devolvió una respuesta incompleta. Intentá una pregunta más breve.'),{status:502});
  return text;
 }
}

// Streaming variant: an async generator of text deltas. The connection is opened (and its HTTP status checked) before the
// first delta, so callers can still answer with a normal error reply; a failure mid-stream throws from the iterator.
async function streamModel({system,messages,maxTokens=1200,timeoutMs=60000,label='llm-stream',env:rawEnv=process.env,fetchImpl=fetch}){
 const env=cleanEnv(rawEnv),st=providerStatus(env);if(!st.ok)throw Object.assign(new Error(st.error),{status:503});
 const groq=st.provider==='groq',req=buildRequest(st,env,{system,messages,maxTokens,stream:true}),started=Date.now();
 let r;
 for(let attempt=0;;attempt++){
  try{r=await fetchImpl(req.url,{method:'POST',headers:req.headers,body:JSON.stringify(req.body),signal:AbortSignal.timeout(timeoutMs)});}
  catch(e){if(attempt<1){await sleep(400);continue;}console.error('llm_call',JSON.stringify({label,provider:st.provider,model:req.body.model,ok:false,stream:true,error:'network',errName:e?.name,errCode:e?.cause?.code||e?.code}));throw Object.assign(new Error('No se pudo conectar con el proveedor de IA.'),{status:502});}
  if(!r.ok&&r.status>=500&&attempt<1){await sleep(400);continue;}
  break;
 }
 if(!r.ok){console.error('llm_call',JSON.stringify({label,provider:st.provider,model:req.body.model,ok:false,status:r.status,stream:true,ms:Date.now()-started}));throw Object.assign(new Error(STATUS_MESSAGES[r.status]||'El proveedor no pudo responder. Revisá la configuración del servidor.'),{status:r.status===429?429:502});}
 if(!r.body)throw Object.assign(new Error('El proveedor devolvió una respuesta incompleta.'),{status:502});
 return (async function*(){
  const decoder=new TextDecoder();let buf='',chars=0,truncated=false,done=false,usage={};
  try{
   for await(const chunk of r.body){
    buf+=typeof chunk==='string'?chunk:decoder.decode(chunk,{stream:true});
    let i;
    while((i=buf.indexOf('\n'))>=0){
     const line=buf.slice(0,i).trim();buf=buf.slice(i+1);
     if(!line.startsWith('data:'))continue;
     const data=line.slice(5).trim();if(!data)continue;
     if(data==='[DONE]'){done=true;continue;}
     let ev;try{ev=JSON.parse(data);}catch{continue;}
     if(groq){
      const c=ev.choices?.[0];if(c?.delta?.content){chars+=c.delta.content.length;yield c.delta.content;}
      if(c?.finish_reason){done=true;truncated=c.finish_reason==='length';}
      if(ev.x_groq?.usage)usage={in:ev.x_groq.usage.prompt_tokens,out:ev.x_groq.usage.completion_tokens};
     }else{
      if(ev.type==='content_block_delta'&&ev.delta?.type==='text_delta'&&ev.delta.text){chars+=ev.delta.text.length;yield ev.delta.text;}
      else if(ev.type==='message_start')usage.in=ev.message?.usage?.input_tokens;
      else if(ev.type==='message_delta'){usage.out=ev.usage?.output_tokens;if(ev.delta?.stop_reason){done=true;truncated=ev.delta.stop_reason==='max_tokens';}}
      else if(ev.type==='error')throw new Error('provider_stream_error');
     }
    }
   }
  }catch{
   console.error('llm_call',JSON.stringify({label,provider:st.provider,model:req.body.model,ok:false,stream:true,error:'interrupted',ms:Date.now()-started}));
   throw Object.assign(new Error('Se interrumpió la conexión con el proveedor de IA.'),{status:502});
  }
  console.log('llm_call',JSON.stringify({label,provider:st.provider,model:req.body.model,ok:done&&!truncated&&chars>0,truncated,stream:true,tokensIn:usage.in,tokensOut:usage.out,ms:Date.now()-started}));
  if(!done||!chars)throw Object.assign(new Error('El proveedor devolvió una respuesta incompleta. Intentá una pregunta más breve.'),{status:502});
  if(truncated)throw Object.assign(new Error('La respuesta quedó incompleta. Intentá una pregunta más breve.'),{status:502,truncated:true});
 })();
}
function parseJson(text){const a=text.indexOf('{'),b=text.lastIndexOf('}');if(a<0||b<=a)return null;try{return JSON.parse(text.slice(a,b+1));}catch{return null;}}
module.exports={callModel,streamModel,parseJson,providerStatus};
