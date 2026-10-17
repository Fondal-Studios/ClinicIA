import test from 'node:test';import assert from 'node:assert/strict';import {formatTutorText} from '../public/learn/tutor-format.mjs';
test('tutor renders emphasis and elementary fractions without executing model HTML',()=>{
 assert.equal(formatTutorText('**Dato decisivo**'),'<strong>Dato decisivo</strong>');
 assert.equal(formatTutorText(String.raw`\frac{\text{VP}}{\text{VP}+\text{FP}}`),'(VP) / (VP+FP)');
 const html=formatTutorText('**<img src=x onerror=alert(1)>** <script>alert(1)</script>');
 assert.ok(!html.includes('<img'));assert.ok(!html.includes('<script'));assert.ok(html.includes('&lt;script&gt;'));
});
