// Genera una página con las 10 ilustraciones para revisarlas: node tools/preview-ilustraciones.mjs > /tmp/ilustraciones.html
import {illustration} from '../public/learn/illustrations.mjs';
console.log('<meta charset=utf-8><body style="font-family:sans-serif;max-width:700px;margin:auto">'+[1,2,3,4,5,6,7,8,9,10].map(n=>`<h4>Módulo ${n}</h4>${illustration(n)}`).join(''));
