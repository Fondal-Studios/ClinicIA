const {reply}=require('../lib/access');
const {gate,parseBody,ask}=require('../lib/clinical');
const {deidentify}=require('../lib/deidentify');
// Función serverless (Netlify Function).
// Recibe la transcripción cruda de una consulta y le pide a la API de Claude
// que la organice en historia clínica. La clave de la API vive en una
// variable de entorno de Netlify (ANTHROPIC_API_KEY) — nunca en el código
// ni en el navegador del médico.

const SYSTEM_PROMPT = `Eres un asistente que estructura, EXCLUSIVAMENTE a partir del texto dado, la transcripción de una consulta médica en formato de historia clínica argentina.

REGLAS ESTRICTAS:
- Nunca inventes datos que no estén dichos explícitamente en la transcripción.
- Si un dato no fue mencionado, usá null (campos de texto) o array vacío (listas). Nunca completes con "no" o "niega" salvo que haya sido dicho explícitamente como negación.
- Distinguí positivo, negado explícitamente, e incierto por mala transcripción (en ese caso, agregalo a "alertas").
- Un diagnóstico va en "confirmado" solo si el médico lo afirmó como tal. Toda sospecha o duda va como "diferencial_o_a_descartar".
- La transcripción NO distingue quién habla. Inferí razonablemente quién dijo cada frase por el contenido (preguntas e indicaciones suelen ser del médico; síntomas y respuestas en primera persona suelen ser del paciente). Si es ambiguo, no asumas con certeza: agregalo a "alertas" pidiendo confirmación, y en "transcripcion_interpretada" marcá esa línea como "INCIERTO".
- "plan" reúne el tratamiento y las indicaciones dichas por el médico: fármacos con dosis y frecuencia si se mencionaron, estudios solicitados, controles y pautas de alarma. La medicación que el paciente ya tomaba antes va en "medicacion_habitual", no en "plan".
- Si el dictado trae datos personales (nombre, documento, teléfono, obra social), ignoralos: se cargan por separado.
- Redactá enfermedad_actual y estudios_complementarios en prosa clínica concisa, sin cambiar el significado de lo dicho.
- Respondé ÚNICAMENTE con JSON válido, sin texto antes ni después, sin bloques de código markdown, sin explicaciones.

Formato EXACTO de salida (todas las claves siempre presentes; null o [] cuando no aplique):
{
  "motivo_consulta": {"texto": string|null, "estado": "registrado"|"no_registrado"},
  "enfermedad_actual": {"fragmentos": string[], "editado": string|null},
  "antecedentes_personales": [{"texto": string, "estado": "positivo"|"negado_explicitamente"}],
  "antecedentes_quirurgicos": [{"texto": string}],
  "internaciones_previas": [{"texto": string}],
  "alergias": [{"texto": string, "estado": "positivo"|"negado_explicitamente"}],
  "medicacion_habitual": [{"texto_original": string, "principio_activo_probable": string, "dosis": string|null, "frecuencia": string|null}],
  "habitos": [{"texto": string, "estado": "positivo"|"negado_explicitamente"}],
  "antecedentes_familiares": [{"texto": string}],
  "examen_fisico": {"TA": string|null, "FC": string|null, "FR": string|null, "SpO2": string|null, "T": string|null, "peso": string|null, "talla": string|null},
  "estudios_complementarios": [{"texto": string}],
  "impresion_diagnostica": [{"texto": string, "tipo": "confirmado"|"diferencial_o_a_descartar"}],
  "plan": [{"texto": string}],
  "alertas": [{"texto": string, "campo": string}],
  "transcripcion_interpretada": [{"hablante": "MEDICO"|"PACIENTE"|"INCIERTO", "texto": string}]
}`;

exports.handler = async function (event) {
  const denied=gate(event);if(denied)return denied;
  const body=parseBody(event);
  if(!body||typeof body.transcript!=="string"||!body.transcript.trim())return reply(400,{error:"Transcripción inválida o vacía"});
  // Defence in depth: the client already sends a de-identified text; generic identifiers are masked again here and no name or document ever reaches the provider.
  const ctx=body.patientContext&&typeof body.patientContext==="object"?body.patientContext:{};
  const patientContext={edad:Number.isFinite(ctx.edad)?ctx.edad:null,sexo:typeof ctx.sexo==="string"?ctx.sexo.slice(0,20):null,
    antecedentes_personales:[],alergias:[],medicacion_habitual:[]};
  for(const k of ["antecedentes_personales","alergias","medicacion_habitual"])if(Array.isArray(ctx[k]))patientContext[k]=ctx[k].slice(0,50).map(x=>deidentify(String(x).slice(0,200)).text);
  const user="Antecedentes ya conocidos del paciente (no los repitas como novedad si reaparecen aquí): " + JSON.stringify(patientContext) + "\n\nTranscripción completa de la consulta (sin marcas de hablante):\n" + deidentify(body.transcript.trim()).text;
  const r=await ask({system:SYSTEM_PROMPT,user,maxTokens:3000,json:true});
  return r.error||reply(200,r.parsed);
};
