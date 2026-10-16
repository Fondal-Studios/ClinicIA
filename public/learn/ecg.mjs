// Original synthetic strips: exactly 6 seconds / 750 units, 25 mm/s, 10 mm/mV.
// At 5 units per mm, one small square is 0.04 seconds and 0.1 mV.
const g=(x,c,w,a)=>a*Math.exp(-(((x-c)/w)**2));
const rates={sinus:75,tachy:150,brady:40,svt:210,vt:180,'p-sinus':155};
export function sample(type,t){
 if(type==='vf')return .23*Math.sin(2*Math.PI*5.7*t)+.16*Math.sin(2*Math.PI*8.3*t)+.10*Math.sin(2*Math.PI*3.1*t);
 if(type==='asystole')return .006*Math.sin(t*9);
 if(type==='af'){
  const beats=[.20,.72,1.51,1.93,2.67,3.14,3.85,4.26,5.03,5.49,6.2];
  return beats.reduce((v,b)=>v+g(t,b-.025,.010,-.12)+g(t,b,.012,1)+g(t,b+.025,.012,-.25)+g(t,b+.20,.045,.20),.025*Math.sin(t*55)+.018*Math.sin(t*79));
 }
 const rr=60/(rates[type]||75);
 // Mild RR variability only for the illustrative pediatric sinus strip.
 const clock=type==='p-sinus'?t+.015*Math.sin(t*3):t;
 const p=((clock%rr)+rr)%rr;
 if(type==='vt')return g(p,.10,.045,.95)+g(p,.18,.035,-.65)+g(p,.27,.035,.12);
 const qrs=.14;
 return (type==='svt'?0:g(p,qrs-.105,.018,.12))+g(p,qrs-.023,.010,-.16)+g(p,qrs,.012,1)+g(p,qrs+.024,.012,-.27)+g(p,qrs+Math.min(.19,rr*.35),.035,.23);
}
export const rhythms=[
 {id:'sinus',name:'Ritmo sinusal',hint:'Ondas P antes de complejos estrechos. La presencia de pulso se confirma clínicamente.'},
 {id:'vf',name:'Fibrilación ventricular',hint:'Actividad caótica sin complejos organizados.'},
 {id:'asystole',name:'Asistolia',hint:'Sin complejos ventriculares. Confirmá electrodos, ganancia y otra derivación.'},
 {id:'vt',name:'TV monomórfica',hint:'Patrón regular, rápido y ancho. La decisión depende de pulso y estabilidad.'},
 {id:'svt',name:'Taquicardia regular estrecha',hint:'RR fijo y QRS estrecho, sin P claras en esta ilustración. Integrá contexto y ECG completo.'},
 {id:'brady',name:'Bradicardia sinusal',hint:'Patrón sinusal lento. Evaluá perfusión y causas.'},
 {id:'tachy',name:'Taquicardia sinusal',hint:'Patrón sinusal rápido. Buscá su causa.'},
 {id:'af',name:'Fibrilación auricular',hint:'RR irregular sin P consistentes en esta ilustración.'},
 {id:'p-sinus',name:'Taquicardia sinusal pediátrica',hint:'P visibles y ligera variación del RR. No uses solo la frecuencia para clasificar.'}
];
let sequence=0;
export function ecg(type='sinus'){
 const id='strip'+(++sequence),d=Array.from({length:1501},(_,i)=>`${i?'L':'M'}${i/2},${90-sample(type,i/250)*50}`).join(' ');
 return `<svg viewBox="0 0 750 150" role="img" aria-label="ECG sintético de seis segundos. Interpretá el trazado junto con el caso."><defs><pattern id="${id}s" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M5 0H0V5" fill="none" stroke="#26434b" stroke-width=".5"/></pattern><pattern id="${id}b" width="25" height="25" patternUnits="userSpaceOnUse"><rect width="25" height="25" fill="url(#${id}s)"/><path d="M25 0H0V25" fill="none" stroke="#3a5960"/></pattern></defs><rect width="750" height="150" fill="url(#${id}b)"/><path d="${d}" stroke="#7ef0b4" stroke-width="1.8" fill="none"/>${Array.from({length:7},(_,i)=>`<path d="M${i*125} 0v8" stroke="#e5fff0"/>`).join('')}</svg>`;
}
