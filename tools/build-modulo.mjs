// Arma una versión local autónoma de un módulo (hoy: profesional) a partir de modules.json.
// Uso: node tools/build-modulo.mjs profesional [--out dist/profesional-local]
import {readFileSync,writeFileSync,mkdirSync,copyFileSync,rmSync,existsSync,readdirSync,statSync} from 'node:fs';import {join,dirname,resolve} from 'node:path';
const args=process.argv.slice(2),name=args[0]||'profesional',out=resolve(args.includes('--out')?args[args.indexOf('--out')+1]:'dist/'+name+'-local');
const mods=JSON.parse(readFileSync('modules.json','utf8')),mod=mods[name];
if(!mod?.autonomo){console.error('El módulo «'+name+'» no tiene definida una versión autónoma en modules.json.');process.exit(1);}
const app=join(out,'app'),lista=[...mod.archivos,...mod.autonomo.necesita];
rmSync(out,{recursive:true,force:true});mkdirSync(app,{recursive:true});
for(const f of lista){const dst=join(app,f);mkdirSync(dirname(dst),{recursive:true});copyFileSync(join('public',f),dst);}
// La versión local no tiene barra de áreas ni cuentas: se quita el enlace a esa barra y se ajusta el service worker a los archivos que existen.
const html=join(app,mod.autonomo.entrada);writeFileSync(html,readFileSync(html,'utf8').replace(/<script type="module" src="\/areas\.mjs"><\/script>\s*/,''));
const sw=join(app,'sw.js');writeFileSync(sw,readFileSync(sw,'utf8').replace(/const MODULE=\[[^\]]*\];/,'const MODULE='+JSON.stringify(lista.filter(f=>!['sw.js','offline.html'].includes(f)).map(f=>'/'+f))+';'));
copyFileSync('tools/local/servidor-local.mjs',join(out,'servidor-local.mjs'));
writeFileSync(join(out,'Iniciar-Mi-consultorio.bat'),'@echo off\r\ncd /d "%~dp0"\r\nwhere node >nul 2>nul\r\nif errorlevel 1 (\r\n  echo Falta instalar Node.js. Descargalo de https://nodejs.org ^(version LTS^) y volve a abrir este archivo.\r\n  pause\r\n  exit /b 1\r\n)\r\nnode servidor-local.mjs --abrir\r\npause\r\n');
writeFileSync(join(out,'iniciar.sh'),'#!/bin/sh\ncd "$(dirname "$0")"\nnode servidor-local.mjs --abrir\n',{mode:0o755});
writeFileSync(join(out,'LEEME.txt'),`MI CONSULTORIO · ClinicIA (versión local)
=========================================
Qué es: la parte profesional de ClinicIA (pacientes, turnos, historia clínica resumida, dictado por voz y receta electrónica) funcionando en tu propia computadora.

CÓMO ABRIRLO
 1. Instalá Node.js (versión LTS) desde https://nodejs.org  (una sola vez).
 2. Windows: hacé doble clic en «Iniciar-Mi-consultorio.bat».   Mac/Linux: ejecutá ./iniciar.sh
 3. Se abre el navegador en http://127.0.0.1:4321/consultorio.html. Dejá la ventana negra abierta mientras lo usás.
 4. Opcional: en Chrome o Edge, el botón «Instalar Mi consultorio en este equipo» (o el ícono de instalar en la barra de direcciones) lo deja como una aplicación.

DÓNDE QUEDAN TUS DATOS
 - Los pacientes se guardan en el navegador de esta computadora, no en un servidor ni en la nube. Esta versión local tiene sus propios datos, separados de los del sitio en internet: para pasar pacientes de un lugar a otro usá «Ajustes → Descargar respaldo» y «Restaurar respaldo».
 - HACÉ RESPALDOS SEGUIDO (Ajustes → Descargar respaldo) y guardalos en un pendrive o tu nube. Si se borran los datos del navegador, se pierden.
 - Usá siempre el mismo navegador y la misma dirección (127.0.0.1 y el mismo puerto), porque los datos pertenecen a esa dirección.

DICTADO POR VOZ
 - La primera vez, el programa descarga el modelo de voz (necesita internet, decenas o cientos de MB). Después queda guardado y la transcripción se hace en tu computadora, sin enviar audio ni texto a ningún lado.
 - Siempre revisá y corregí el texto antes de validar la consulta.

RECETA ELECTRÓNICA
 - Esta aplicación no emite recetas: abre tu recetario habilitado (por ejemplo Receto) y copia los datos del paciente para pegarlos. La receta se firma en el recetario. Necesitás una cuenta en ese recetario.

LÍMITES
 - No es una historia clínica electrónica con validez legal (Ley 27.706): no tiene firma digital ni auditoría de accesos.
 - Sin cuentas ni cobro: la versión local no incluye el control de acceso del sitio.
`);
const total=(d=>{let n=0;const w=x=>readdirSync(x).forEach(f=>{const p=join(x,f);statSync(p).isDirectory()?w(p):n++;});w(d);return n;})(out);
console.log('Versión local armada en '+out+' ('+total+' archivos). Entrada: app/'+mod.autonomo.entrada);
