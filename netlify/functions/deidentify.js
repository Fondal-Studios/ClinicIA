const {reply}=require('../lib/access');
const {gate,parseBody}=require('../lib/clinical');
const {deidentify}=require('../lib/deidentify');
// Removes personal identifiers from a text so it can be previewed and then sent to the AI. No model is called and nothing is stored or
// logged: the identifiers sent here (to our own server) are used only for this request.
exports.handler=async function(event){
 const denied=gate(event,{count:false});if(denied)return denied;
 const body=parseBody(event);
 if(!body||typeof body.text!=='string'||!body.text.trim())return reply(400,{error:'Texto inválido o vacío'});
 const identity=body.identity&&typeof body.identity==='object'?body.identity:{};
 return reply(200,deidentify(body.text.slice(0,60000),identity));
};
