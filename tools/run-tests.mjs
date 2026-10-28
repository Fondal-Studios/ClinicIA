// Render builds inherit production configuration. Tests must never connect to the
// production database, consume live quotas, bootstrap real accounts or use API keys.
import {spawn} from 'node:child_process';
import {readdir} from 'node:fs/promises';
const env={NODE_ENV:'test'};
for(const key of ['PATH','HOME','TMPDIR','TMP','TEMP','LANG','LC_ALL','TZ','SystemRoot','WINDIR'])if(process.env[key]!==undefined)env[key]=process.env[key];
const files=(await readdir(new URL('../test/',import.meta.url))).filter(f=>f.endsWith('.test.mjs')).sort().map(f=>`test/${f}`);
const child=spawn(process.execPath,['--test',...files],{cwd:new URL('../',import.meta.url),env,stdio:'inherit'});
child.on('error',e=>{console.error(e.message);process.exitCode=1;});
child.on('exit',(code,signal)=>{process.exitCode=code??(signal?1:0);});
