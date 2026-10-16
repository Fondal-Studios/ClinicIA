const {timingSafeEqual}=require('node:crypto');
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'};
const reply=(statusCode,value)=>({statusCode,headers,body:JSON.stringify(value)});
function authorize(event){
 if(event.httpMethod!=='POST')return reply(405,{error:'Método no permitido'});
 const configured=process.env.CLINIC_ACCESS_TOKEN;
 if(!configured||configured.length<24)return reply(503,{error:'Piloto sin configurar. Falta una clave de acceso de al menos 24 caracteres en el servidor.'});
 const given=(event.headers?.authorization||event.headers?.Authorization||'').replace(/^Bearer /,'');
 const a=Buffer.from(given),b=Buffer.from(configured);
 if(a.length!==b.length||!timingSafeEqual(a,b))return reply(401,{error:'Clave de acceso inválida.'});
 if(typeof event.body!=='string'||Buffer.byteLength(event.body)>16000)return reply(413,{error:'Solicitud demasiado extensa.'});
 return null;
}
module.exports={authorize,reply};
