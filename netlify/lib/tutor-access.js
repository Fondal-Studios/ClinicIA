const {reply}=require('./access');
// Open test access. Limits are per warm server instance, not billing-grade protection.
let windowStart=Date.now(),count=0;
function authorizeTutor(event){
 if(event.httpMethod!=='POST')return reply(405,{error:'Método no permitido'});
 if(typeof event.body!=='string'||Buffer.byteLength(event.body)>16000)return reply(413,{error:'Solicitud demasiado extensa.'});
 return null;
}
function reserveCall(cost=1){if(Date.now()-windowStart>=3600000){windowStart=Date.now();count=0;}if(count+cost>60)return false;count+=cost;return true;}
module.exports={authorizeTutor,reserveCall};
