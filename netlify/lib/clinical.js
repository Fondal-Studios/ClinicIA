const {timingSafeEqual}=require('node:crypto');
const {reply}=require('./access');
const {callModel,parseJson,providerStatus}=require('./llm');
const {reserve}=require('./quota');
// Shared entry for the consultorio functions (dictation -> patient / consultation).
// Enabled by default. Set LEGACY_CLINICAL_ENABLED=false to switch it off. If CLINIC_ACCESS_TOKEN (24+ chars) is set the
// caller must send it as a Bearer token; without it the endpoints are open but limited per user/IP plus a global cap (see quota.js).
// `count:false` skips the quota for local-only steps that never call the provider (de-identification).
async function gate(event,{env=process.env,count:counts=true}={}){
 if(event.httpMethod!=='POST')return reply(405,{error:'Método no permitido'});
 if(env.LEGACY_CLINICAL_ENABLED==='false')return reply(503,{error:'El consultorio con IA está desactivado en este servidor.'});
 if(typeof event.body!=='string'||Buffer.byteLength(event.body)>60000)return reply(413,{error:'El dictado es demasiado extenso. Dividilo en partes.'});
 const token=env.CLINIC_ACCESS_TOKEN;
 if(token&&token.length>=24){
  const given=Buffer.from((event.headers?.authorization||event.headers?.Authorization||'').replace(/^Bearer /,'')),want=Buffer.from(token);
  if(given.length!==want.length||!timingSafeEqual(given,want))return reply(401,{error:'Clave de acceso inválida.'});
 }
 if(counts){
  const q=await reserve(event,{scope:'clinical',env});
  if(!q.ok)return reply(429,{error:'Se alcanzó el límite horario de consultas de IA. Probá más tarde.'});
 }
 return null;
}
function parseBody(event){try{const b=JSON.parse(event.body||'{}');return b&&typeof b==='object'?b:null;}catch{return null;}}
// Runs one model call; errors become readable replies and never include the provider's raw detail.
async function ask({system,user,maxTokens,json=false,env=process.env,fetchImpl=fetch}){
 const st=providerStatus(env);if(!st.ok)return {error:reply(503,{error:st.error+' Configurá GROQ_API_KEY (gratuita) o ANTHROPIC_API_KEY y ANTHROPIC_MODEL en el servidor.'})};
 try{
  const text=await callModel({system,messages:[{role:'user',content:user}],maxTokens,json,timeoutMs:40000,label:'clinical',env,fetchImpl});
  if(!json)return {text:text.trim()};
  const parsed=parseJson(text);
  return parsed?{parsed}:{error:reply(502,{error:'La IA no devolvió un resultado válido. Reintentá.'})};
 }catch(e){return {error:reply(Number.isInteger(e.status)?e.status:502,{error:e.message||'No se pudo conectar con el proveedor de IA.'})};}
}
module.exports={gate,parseBody,ask};
