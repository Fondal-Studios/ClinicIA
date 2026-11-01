import {h,fill} from './class-ui.mjs';
import {api} from './training-ui.mjs';
const root=document.querySelector('#credentials'),status=document.querySelector('#credentials-status');let busy=false;
async function load({keepStatus=false}={}){
 try{
  const {credential:c}=await api('/api/account/instructor-credentials');if(!keepStatus)status.textContent='';
  const fields=[['profession','Profesión',80],['specialty','Especialidad',100],['registration','Matrícula',80],['jurisdiction','Jurisdicción',100],['evidenceUrl','Enlace HTTPS de respaldo (opcional)',400]];
  const values={};const form=h('form',{},fields.map(([key,label,max])=>{const input=h('input',{name:key,maxlength:String(max),required:key!=='evidenceUrl',type:key==='evidenceUrl'?'url':'text'});input.value=c?.[key==='evidenceUrl'?'evidence_url':key]||'';values[key]=input;return h('label',{},label,input);}));
  const button=h('button',{type:'submit'},'Enviar para verificación');
  form.append(h('p',{},'Si modificás una credencial verificada, vuelve a revisión; tus aportes públicos dejan de estar disponibles hasta recuperar la verificación.'),button);
  form.addEventListener('submit',async e=>{e.preventDefault();if(busy)return;busy=true;button.disabled=true;status.textContent='Enviando…';try{await api('/api/account/instructor-credentials',Object.fromEntries(Object.entries(values).map(([k,v])=>[k,v.value])));status.textContent='Credencial pendiente de verificación administrativa.';await load({keepStatus:true});}catch(err){status.textContent=err.message;}finally{busy=false;button.disabled=false;}});
  fill(root,h('p',{},'Estado: '+(c?.verification_status||'sin presentar')),form);
 }catch(e){status.textContent=e.message;fill(root,h('p',{},'Ingresá con tu cuenta para presentar o consultar tus credenciales.'),h('a',{href:'/'},'Ir a mi cuenta'),h('button',{type:'button',onclick:load},'Reintentar'));}
}
load();
