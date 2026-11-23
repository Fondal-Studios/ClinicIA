// Precios de referencia y cursos de pago. Fuente única para el servidor y para la pantalla.
// Alumno: gratis. De pago: los cursos de preparación de certificaciones (compra por curso, acceso permanente),
// el nivel Instructor (suscripción mensual) y el nivel Profesional (suscripción mensual, incluye Instructor y Mi consultorio).
export const PAID_COURSES=['acls','pals','fccs','phtls','atls','amls-preparacion','epc-preparacion'];
export const PRICES_USD={curso:2.99,instructor:5,profesional:10};
export const isPaidCourse=id=>PAID_COURSES.includes(id);
