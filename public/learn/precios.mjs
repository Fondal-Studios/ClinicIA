// Precios de referencia y cursos de pago. Fuente única para el servidor y para la pantalla.
// Alumno: gratis. De pago: los cursos de preparación de certificaciones (por curso o en pack, acceso permanente),
// el nivel Instructor (suscripción mensual) y el nivel Profesional (suscripción mensual, incluye Instructor y Mi consultorio).
export const PAID_COURSES=['acls','pals','fccs','phtls','atls','amls-preparacion','epc-preparacion'];
// Todos los precios terminan en .99 (precio psicológico). Ver docs/PRECIOS-INVESTIGACION.md.
export const PRICES_USD={curso:2.99,pack:9.99,instructor:4.99,profesional:9.99};
export const PAID_COURSE_TITLES={acls:'ACLS',pals:'PALS',fccs:'FCCS',phtls:'PHTLS',atls:'ATLS','amls-preparacion':'Preparación para AMLS','epc-preparacion':'Preparación para EPC'};
export const isPaidCourse=id=>PAID_COURSES.includes(id);
