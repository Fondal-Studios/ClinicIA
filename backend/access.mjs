// Niveles de acceso. El bloqueo se activa con CLINICIA_PAYWALL=true; por defecto está apagado (piloto gratuito).
// Alcance real: solo se puede bloquear lo que decide el servidor (exámenes y certificados del catálogo de capacitación, grupos, aulas y clases con IA).
// La teoría y los bancos de preguntas de los cursos de estudio se sirven como archivos estáticos al navegador y no se pueden ocultar sin rediseñarlos.
import {trainingCourses} from '../public/learn/content/capacitacion-catalog.mjs';
export const paywallOn=(env=process.env)=>env.CLINICIA_PAYWALL==='true';
import {isPaidCourse} from '../public/learn/precios.mjs';
// Gratis: todo salvo los cursos de pago (certificaciones; ver public/learn/precios.mjs). Rotantes, curso policial, refuerzos y minicursos son siempre gratis.
export const isFreeCourse=id=>!isPaidCourse(id);
export {isPaidCourse};
const need=(level,message)=>Object.assign(new Error(message),{status:402,code:'payment_required',plan:level});
export function createAccessGuard({payments,env=process.env}){
 return async function guard(user,level,courseId){
  if(!paywallOn(env)||user?.role==='admin')return;
  if(level==='curso'&&!isPaidCourse(courseId))return;
  const a=await payments.access(user.id);
  if(level==='instructor'&&!a.instructor.active)throw need('instructor','Esta función requiere el nivel Instructor (USD 4,99 por mes).');
  if(level==='profesional'&&!a.profesional.active)throw need('profesional','Mi consultorio requiere el nivel Profesional (USD 9,99 por mes).');
  if(level==='curso'&&!a.courses.includes(courseId))throw need('curso','Este curso es de pago.');
 };
}
