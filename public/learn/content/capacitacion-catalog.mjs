import {policeCourse,policeSources} from './respuesta-policial.mjs';
import {evacuationCourses,evacuationSources} from './evacuacion.mjs';
export const trainingCourses=[policeCourse,...evacuationCourses,...[[3,'refuerzo-rcp','Refuerzo: reconocimiento del paro y DEA'],[4,'refuerzo-hemorragias','Refuerzo: hemorragias y comunicación'],[10,'refuerzo-radio','Refuerzo: comunicación Policía–Hospital']].map(([n,id,title])=>({id,title,lessons:[policeCourse.lessons[n-1]],refresher:true,examMinutes:10}))];
export const trainingLessons=[...new Map(trainingCourses.flatMap(c=>c.lessons).map(l=>[l.id,l])).values()];
export const trainingSources={...policeSources,...evacuationSources};
