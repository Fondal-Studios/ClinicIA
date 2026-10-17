import {distractors} from './distractors.mjs';
const reuse={'fv:0':'recognize','fv:2':'aftershock','aesp:0':'pea','taqui:1':'unstable','p-respiratory:0':'p-airway','p-respiratory:1':'p-chest','p-respiratory:2':'p-reassess','p-slow:0':'p-brady-first','p-slow:1':'p-brady-rcp','p-arrest:1':'p-first-energy','p-arrest:2':'p-aftershock','f-infection:0':'f-antibiotics','f-infection:1':'f-vasopressor','f-infection:2':'f-fluids','f-lung:1':'f-plateau','f-consciousness:0':'f-hypoxia','f-consciousness:1':'f-glucose','f-consciousness:2':'f-handoff'};
const custom={
 'fv:1':['Cardioversión sincronizada','Administrar atropina antes de descargar','Esperar completar otro ciclo pese a desfibrilador listo','Realizar estimulación transcutánea'],
 'aesp:1':['Descargar la actividad organizada','Cardioversión sincronizada','Atropina como sustituto de RCP y adrenalina','Esperar gasometría antes de continuar soporte'],
 'aesp:2':['Priorizar ECG de esfuerzo para aclarar la causa','Esperar ROSC para investigar causas tratables','Repetir descargas por persistencia de actividad organizada','Considerar resuelto el paro al ver ritmo organizado'],
 'taqui:0':['Clasificar como estable por tener pulso','Clasificar como paro por presión baja','Priorizar control oral de frecuencia','Atribuir el deterioro a ansiedad sin valoración'],
 'p-slow:2':['Esperar recuperación para investigar hipoxia','Asumir causa cardíaca primaria sin revisar ventilación','Priorizar una explicación farmacológica sin evaluar ABC','Descartar hipovolemia por una presión previa normal'],
 'p-arrest:0':['No desfibrilable','Cardioversión sincronizada','Estimulación transcutánea','Observación de ritmo de perfusión'],
 'f-lung:0':['600 mL','300 mL','480 mL','500 mL'],
 'f-lung:2':['Sólo saturación para aceptar todos los parámetros','Sólo volumen programado sin comprobar entrega','Una gasometría previa al ajuste','Únicamente el peso real del paciente']
};
export function improveCases(cases){for(const c of cases)for(const [i,s] of c.steps.entries()){const key=c.id+':'+i,wrong=custom[key]||distractors[reuse[key]];if(!wrong)throw Error('Falta revisión de simulación '+key);const correct=s.options[s.answer];s.options=[...wrong];s.options.splice(s.answer,0,correct);}}
