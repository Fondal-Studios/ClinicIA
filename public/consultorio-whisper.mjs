// Dictado con transcripción LOCAL: el audio se graba y se transcribe dentro del navegador (Whisper por WebAssembly/WebGPU).
// El audio y el texto no se envían a ningún servidor. Solo se descargan, una vez, el programa y los pesos del modelo (no contienen datos de pacientes);
// después quedan en la caché del navegador. El modelo es Whisper multilingüe preentrenado: no está entrenado específicamente con vocabulario médico,
// por eso el texto siempre pasa por la validación del médico.
const LIB='https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3/+esm';
export const MODELS=[['Xenova/whisper-base','Equilibrado (recomendado para celular)'],['Xenova/whisper-small','Más preciso (descarga más grande, más lento)']];
let asr=null,loadedModel='';
export async function loadModel(model,onProgress){
 if(asr&&loadedModel===model)return asr;
 const {pipeline,env}=await import(LIB);env.allowLocalModels=false;
 const device=globalThis.navigator?.gpu?'webgpu':'wasm';
 asr=await pipeline('automatic-speech-recognition',model,{dtype:'q8',device,progress_callback:p=>{if(p?.status==='progress'&&onProgress)onProgress(Math.round(p.progress||0),p.file);}});
 loadedModel=model;return asr;
}
export async function blobToFloat32(blob){
 const buf=await blob.arrayBuffer();const ctx=new (globalThis.AudioContext||globalThis.webkitAudioContext)({sampleRate:16000});
 try{const audio=await ctx.decodeAudioData(buf);return audio.getChannelData(0).slice();}finally{ctx.close?.();}
}
export async function transcribe(blob,model,onProgress){
 const engine=await loadModel(model,onProgress),samples=await blobToFloat32(blob);
 const out=await engine(samples,{language:'spanish',task:'transcribe',chunk_length_s:30,stride_length_s:5});
 return String(out?.text||'').trim();
}
export class Recorder{
 constructor(){this.chunks=[];this.rec=null;this.stream=null;}
 async start(){this.stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true}});this.chunks=[];this.rec=new MediaRecorder(this.stream);this.rec.ondataavailable=e=>{if(e.data.size)this.chunks.push(e.data);};this.rec.start(1000);}
 stop(){return new Promise(res=>{if(!this.rec||this.rec.state==='inactive')return res(null);this.rec.onstop=()=>{this.stream?.getTracks().forEach(t=>t.stop());res(new Blob(this.chunks,{type:this.rec.mimeType||'audio/webm'}));};this.rec.stop();});}
}
