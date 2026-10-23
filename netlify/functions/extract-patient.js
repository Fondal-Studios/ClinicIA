const {reply}=require('../lib/access');
const {gate,parseBody,ask}=require('../lib/clinical');
// Función serverless (Netlify Function) para el dictado de datos del paciente
// en la pantalla "Nuevo paciente". Misma lógica que structure-consulta.js:
// la clave de API vive solo en la variable de entorno de Netlify.

const SYSTEM_PROMPT = `Extraés datos de un paciente a partir de un dictado libre en español rioplatense, para precargar un formulario. Nunca inventes un dato que no esté dicho. Si algo no se mencionó, usá null.
No separes nombre/apellido adivinando si el dictado es ambiguo: hacelo solo cuando sea razonablemente claro.
La fecha de nacimiento: si se dice una fecha explícita, usala tal cual (YYYY-MM-DD). Si solo se dice la edad, calculá una fecha aproximada usando la fecha de hoy que te paso, y marcá fechaEsAproximada true.
Respondé ÚNICAMENTE con este JSON, sin texto adicional ni markdown:
{
  "nombre": string|null,
  "apellido": string|null,
  "dni": string|null,
  "telefono": string|null,
  "sexo": "Masculino"|"Femenino"|null,
  "obraSocial": string|null,
  "nroAfiliado": string|null,
  "domicilio": string|null,
  "fechaNacimiento": string|null,
  "fechaEsAproximada": boolean
}`;

exports.handler = async function (event) {
  const denied=await gate(event);if(denied)return denied;
  const body=parseBody(event);
  if(!body||typeof body.transcript!=="string"||!body.transcript.trim())return reply(400,{error:"Transcripción inválida o vacía"});
  const hoy = new Date().toISOString().slice(0, 10);
  const r=await ask({system:SYSTEM_PROMPT,user:"Fecha de hoy: " + hoy + "\nDictado: " + body.transcript.trim(),maxTokens:500,json:true});
  return r.error||reply(200,r.parsed);
};
