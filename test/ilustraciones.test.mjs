import test from 'node:test';import assert from 'node:assert/strict';
import {illustration,illustrationCount} from '../public/learn/illustrations.mjs';import {policeCourse} from '../public/learn/content/respuesta-policial.mjs';
test('cada módulo policial tiene una ilustración accesible y bien formada',()=>{
 assert.equal(illustrationCount,policeCourse.lessons.length);
 for(let n=1;n<=policeCourse.lessons.length;n++){const s=illustration(n);assert.match(s,/^<svg [^>]*viewBox="0 0 660 270"/);assert.match(s,/<title id="t">[^<]{8,}<\/title>/);assert.match(s,/<desc id="d">[^<]{20,}<\/desc>/);assert.ok((s.match(/<svg/g)||[]).length===1&&s.endsWith('</svg>'));assert.doesNotMatch(s,/undefined|NaN|\[object/);}
});
