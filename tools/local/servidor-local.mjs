// Servidor local mínimo de ClinicIA: sirve la carpeta «app» solo en esta computadora (127.0.0.1). Sin dependencias; necesita Node.js 18 o más nuevo.
// Uso: node servidor-local.mjs [--abrir]      Puerto: variable PORT (por defecto 4321).
import http from 'node:http';import {readFile} from 'node:fs/promises';import {resolve,extname,sep,dirname} from 'node:path';import {fileURLToPath} from 'node:url';import {exec} from 'node:child_process';
const raiz=resolve(dirname(fileURLToPath(import.meta.url)),'app'),puerto=Number(process.env.PORT)||4321;
const tipos={'.html':'text/html; charset=utf-8','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
export const servidor=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/.netlify/')){res.writeHead(404,{'Content-Type':'application/json'});return res.end('{"error":"Esta versión local no usa servidor."}');}
  const ruta=resolve(raiz,'.'+decodeURIComponent(url.pathname==='/'?'/consultorio.html':url.pathname));
  if(!ruta.startsWith(raiz+sep)){res.writeHead(403);return res.end();}
  const contenido=await readFile(ruta);
  res.writeHead(200,{'Content-Type':tipos[extname(ruta)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});res.end(contenido);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('No encontrado');}
});
if(process.argv[1]===fileURLToPath(import.meta.url)){
 servidor.listen(puerto,'127.0.0.1',()=>{const dir=`http://127.0.0.1:${puerto}/consultorio.html`;
  console.log('\nMi consultorio está funcionando en: '+dir+'\nDejá esta ventana abierta mientras lo uses. Para cerrar el programa, cerrá esta ventana o apretá Ctrl+C.\n');
  if(process.argv.includes('--abrir'))exec((process.platform==='win32'?'start ""':process.platform==='darwin'?'open':'xdg-open')+' '+dir);});
 servidor.on('error',e=>{console.error(e.code==='EADDRINUSE'?'El puerto '+puerto+' ya está en uso. ¿Ya abriste Mi consultorio? Probá abrir http://127.0.0.1:'+puerto+'/consultorio.html':String(e));process.exit(1);});
}
