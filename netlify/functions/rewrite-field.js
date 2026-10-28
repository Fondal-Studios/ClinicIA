const {reply}=require('../lib/access');
const {gate,parseBody,ask}=require('../lib/clinical');
const {deidentify}=require('../lib/deidentify');
// Función serverless (Netlify Function) para el botón "Redactar con IA" en la
// revisión de la consulta: toma texto suelto tal como lo escribió el médico
// (o el que dejó la transcripción) y lo devuelve como prosa clínica prolija,
// sin agregar ni inventar nada. Misma clave de API que las otras funciones.

const SYSTEM_PROMPT = `Redactás en español rioplatense, en prosa clínica breve y profesional para una historia clínica, el texto que te pasa un médico.
Reglas estrictas:
- No agregues ningún dato, síntoma, diagnóstico o dato clínico que no esté explícito en el texto original.
- No cambies el significado clínico de lo que está escrito.
- Solo mejorá la redacción, la claridad y la concisión.
- Si el texto ya está bien redactado, devolvelo casi igual.
Respondé ÚNICAMENTE con el texto redactado final, sin comillas, sin explicaciones, sin markdown, sin texto adicional.`;

exports.handler = async function (event) {
  const denied=await gate(event);if(denied)return denied;
  const body=parseBody(event);
  if(!body||typeof body.texto!=="string"||!body.texto.trim())return reply(400,{error:"Texto inválido o vacío"});
  const r=await ask({system:SYSTEM_PROMPT,user:deidentify(body.texto.trim().slice(0,6000)).text,maxTokens:600});
  return r.error||reply(200,{texto:r.text});
};
