// Niveles de acceso. El bloqueo se activa con CLINICIA_PAYWALL=true; por defecto está apagado (piloto gratuito).
// Alcance real: solo se puede bloquear lo que decide el servidor (exámenes y certificados del catálogo de capacitación, grupos, aulas y clases con IA).
// La teoría y los bancos de preguntas de los cursos de estudio se sirven como archivos estáticos al navegador y no se pueden ocultar sin rediseñarlos.
import {trainingCourses} from '../public/learn/content/capacitacion-catalog.mjs';
export const paywallOn=(env=process.env)=>env.CLINICIA_PAYWALL==='true';
// Gratis: el curso policial y todos los refuerzos y minicursos. De pago (nivel alumno): el resto del catálogo, p. ej. las rotaciones.
export const isFreeCourse=id=>{const c=trainingCourses.find(c=>c.id===id);return !!c&&(c.id==='respuesta-policial'||!!c.refresher||!!c.mini);};
const need=(level,message)=>Object.assign(new Error(message),{status:402,code:'payment_required',plan:level});
export function createAccessGuard({payments,env=process.env}){
 return async function guard(user,level,courseId){
  if(!paywallOn(env)||user?.role==='admin')return;
  if(level==='alumno'&&courseId&&isFreeCourse(courseId))return;
  const a=await payments.access(user.id);
  if(level==='instructor'&&!a.instructor.active)throw need('instructor','Esta función requiere el Acceso instructor (USD 9,99).');
  if(level==='alumno'&&!a.alumno.active)throw need('alumno','Este curso requiere el Acceso alumno (USD 4,99).');
 };
}
