const {reply}=require('./access');
const {reserve}=require('./quota');
function authorizeTutor(event){
 if(event.httpMethod!=='POST')return reply(405,{error:'Método no permitido'});
 if(typeof event.body!=='string'||Buffer.byteLength(event.body)>16000)return reply(413,{error:'Solicitud demasiado extensa.'});
 return null;
}
const reserveCall=(event,cost=1)=>reserve(event,{scope:'tutor',cost});
module.exports={authorizeTutor,reserveCall};
