const {reply}=require('../lib/access');
const {authorizeTutor,reserveCall}=require('../lib/tutor-access');
const {buildClass}=require('../lib/class-builder');
const {providerStatus}=require('../lib/llm');
exports.handler=async event=>{
 const denied=authorizeTutor(event);if(denied)return denied;
 let body;try{body=JSON.parse(event.body);}catch{return reply(400,{error:'JSON inválido.'});}
 if(!body||typeof body!=='object'||typeof body.brief!=='string')return reply(400,{error:'Describí la clase que necesitás.'});
 const st=providerStatus();if(!st.ok)return reply(503,{error:st.error+' Las lecciones y simulaciones funcionan sin IA.'});
 if(!reserveCall(5))return reply(429,{error:'Se alcanzó el límite temporal de consultas de prueba. Intentá más tarde.'});
 try{return reply(200,{class:await buildClass(body)});}
 catch(e){return reply(Number.isInteger(e.status)?e.status:502,{error:e.status?e.message:'No se pudo crear la clase.'});}
};
