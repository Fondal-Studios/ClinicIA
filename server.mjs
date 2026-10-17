import http from 'node:http';
import {getAccounts} from './backend/accounts.mjs';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),root=resolve('public');
export const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');
 if(url.pathname.startsWith('/api/account')||url.pathname.startsWith('/api/admin')||['/api/events','/api/offer'].includes(url.pathname)){const accounts=await getAccounts();if(!accounts){res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(JSON.stringify({error:'Las cuentas se están habilitando. Podés seguir practicando como invitado.'}));}if(await accounts.handler(req,res,url))return;}
 if(url.pathname==='/api/tutor'){if(req.method!=='POST'){res.writeHead(405);return res.end();}let body='';for await(const chunk of req){body+=chunk;if(body.length>16000){res.writeHead(413);return res.end();}}const result=await require('./netlify/functions/tutor.js').handler({httpMethod:req.method,headers:req.headers,body});res.writeHead(result.statusCode,result.headers);return res.end(result.body);}
 const path=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!path.startsWith(root+sep)){res.writeHead(403);return res.end();}const types={'.html':'text/html; charset=utf-8','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml'};const content=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY','Cache-Control':'no-cache'});res.end(content);
 }catch{const api=req.url.startsWith('/api/');res.writeHead(api?503:404,{'Content-Type':api?'application/json':'text/plain'});res.end(api?JSON.stringify({error:'El servicio no está disponible temporalmente.'}):'No encontrado');}});
if(process.argv[1]===new URL(import.meta.url).pathname)server.listen(Number(process.env.PORT)||3000,'0.0.0.0');
