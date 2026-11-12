import test from 'node:test';import assert from 'node:assert/strict';import {existsSync} from 'node:fs';
import {imageCredits,lessonImages,refFigure} from '../public/learn/credits.mjs';import {policeCourse} from '../public/learn/content/respuesta-policial.mjs';
test('toda imagen de terceros tiene autor, licencia con enlace, origen, texto alternativo y archivo',()=>{
 for(const [id,c] of Object.entries(imageCredits)){assert.ok(c.author&&c.title&&c.alt.length>20,id);assert.match(c.license.url,/^https:\/\//);assert.ok(c.license.name);assert.match(c.source,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);assert.ok(existsSync('public'+c.file),id+' falta el archivo');const f=refFigure(id);assert.ok(f.includes(c.author)&&f.includes(c.license.url)&&f.includes(c.source));}
 const lessons=new Set(policeCourse.lessons.map(l=>l.id));for(const [l,ids] of Object.entries(lessonImages)){assert.ok(lessons.has(l));for(const id of ids)assert.ok(imageCredits[id],id);}
});
