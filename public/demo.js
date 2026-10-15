// Demo de flujo ramificado. Las decisiones son de producto, NO indicaciones clínicas.
const steps = {
  start: { title: "Llega un paciente simulado. ¿Qué tipo de ejercicio querés resolver?", choices: [
    { label: "Interpretación de ECG (demo de interfaz)", next: "ecg" },
    { label: "Escenario de decisiones (demo de interfaz)", next: "scenario" }
  ]},
  ecg: { title: "El trazado aún no está validado. ¿Qué debería hacer la plataforma?", choices: [
    {label:"Mostrar un ECG inventado como si fuera real", next:"end",safe:false,why:"No: las imágenes y sus interpretaciones necesitan validación clínica."},
    {label:"Señalar contenido pendiente de revisión",next:"end",safe:true,why:"Correcto: el contenido no validado debe permanecer fuera de los módulos educativos."}
  ]},
  scenario: { title:"La IA generó una recomendación clínica sin fuente. ¿Cómo proceder?",choices:[
    {label:"Publicarla inmediatamente",next:"end",safe:false,why:"No: una respuesta sin respaldo y revisión puede enseñar errores."},
    {label:"Enviarla a revisión profesional con bibliografía",next:"end",safe:true,why:"Correcto: las recomendaciones clínicas requieren fuentes y aprobación."}
  ]},
  end: {title:"Fin de la demostración",choices:[]}
};
let current="start",xp=0,competence=0;
const q=document.querySelector("#question"),opts=document.querySelector("#options"),feed=document.querySelector("#feedback"),next=document.querySelector("#next"),score=document.querySelector("#score"),progress=document.querySelector("#progress");
function render(){const step=steps[current];q.textContent=step.title;opts.replaceChildren();feed.textContent="";next.hidden=true;progress.textContent="Motor de decisiones · prototipo sin datos personales";for(const choice of step.choices){const b=document.createElement("button");b.textContent=choice.label;b.addEventListener("click",()=>{for(const el of opts.querySelectorAll("button"))el.disabled=true;if(choice.safe!==undefined){xp+=10;competence+=choice.safe?100:0;feed.textContent=choice.why;}else{feed.textContent="Elegiste una modalidad de ejercicio.";}next.hidden=false;next.textContent=choice.next==="end"?"Ver resultado":"Continuar";next.onclick=()=>{current=choice.next;render();};});opts.append(b);}if(current==="end"){score.textContent=`XP de demostración: ${xp}. Puntaje de decisiones seguras: ${competence}/100. No es una medición de competencia médica.`;next.hidden=false;next.textContent="Reiniciar";next.onclick=()=>{current="start";xp=0;competence=0;score.textContent="";render();};}}
render();