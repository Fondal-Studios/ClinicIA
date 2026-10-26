import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {PGlite} from '@electric-sql/pglite';
import {createAccounts} from '../backend/accounts.mjs';
const require=createRequire(import.meta.url),{reserve,clientKey,_resetForTests}=require('../netlify/lib/quota.js'),{callModel}=require('../netlify/lib/llm.js');
const ev=(extra={})=>({headers:{},ip:'1.1.1.1',...extra});

test('quota: per-caller and global buckets, signed-in users get their own key, cost is weighted',async()=>{
 _resetForTests();const env={AI_TUTOR_ANON_LIMIT_HOUR:'3',AI_TUTOR_GLOBAL_LIMIT_HOUR:'5'};
 for(let i=0;i<3;i++)assert.ok((await reserve(ev(),{scope:'tutor',env})).ok);
 assert.deepEqual(await reserve(ev(),{scope:'tutor',env}),{ok:false,reason:'user'});
 assert.ok((await reserve(ev({ip:'2.2.2.2'}),{scope:'tutor',env})).ok);
 assert.deepEqual(await reserve(ev({ip:'3.3.3.3'}),{scope:'tutor',cost:2,env}),{ok:false,reason:'global'});
 assert.equal(clientKey(ev({userId:'abc'})),'u:abc');assert.equal(clientKey({headers:{'x-forwarded-for':'9.9.9.9, 10.0.0.1'}}),'ip:9.9.9.9');
});

test('quota: persistent counter in the database is shared and resets with the window',async()=>{
 const db=new PGlite(),api=await createAccounts({db,origin:'http://x.test',secure:false});
 assert.equal((await api.consume('k',2,3600,1)).allowed,true);
 assert.equal((await api.consume('k',2,3600,1)).allowed,true);
 assert.equal((await api.consume('k',2,3600,1)).allowed,false);
 await db.query("UPDATE clinic_limits SET expires_at=now()-interval '1 second'");
 assert.deepEqual(await api.consume('k',2,3600,2),{allowed:true,count:2});
});

test('callModel retries transient failures once, never retries 429/4xx, and maps provider statuses',async()=>{
 const env={ANTHROPIC_API_KEY:'k',ANTHROPIC_MODEL:'m'},ok={ok:true,json:async()=>({stop_reason:'end_turn',content:[{type:'text',text:'hola'}],usage:{input_tokens:3,output_tokens:1}})};
 let n=0;assert.equal(await callModel({system:'s',messages:[],env,fetchImpl:async()=>++n===1?{ok:false,status:503}:ok}),'hola');assert.equal(n,2);
 n=0;await assert.rejects(callModel({system:'s',messages:[],env,fetchImpl:async()=>{n++;return {ok:false,status:429};}}),e=>e.status===429);assert.equal(n,1);
 n=0;await assert.rejects(callModel({system:'s',messages:[],env,fetchImpl:async()=>{n++;return {ok:false,status:401};}}),e=>e.status===502&&/clave de API/.test(e.message));assert.equal(n,1);
 n=0;await assert.rejects(callModel({system:'s',messages:[],env,fetchImpl:async()=>{n++;throw new Error('secret');}}),e=>e.status===502&&!e.message.includes('secret'));assert.equal(n,2);
});

test('provider credentials pasted with surrounding whitespace are cleaned before they reach the HTTP header',async()=>{
 let sent;const ok={ok:true,json:async()=>({stop_reason:'end_turn',content:[{type:'text',text:'ok'}]})};
 const env={ANTHROPIC_API_KEY:'sk-ant-key \n',ANTHROPIC_MODEL:' claude-haiku-5-5\n',TUTOR_PROVIDER:'anthropic '};
 assert.equal(await callModel({system:'s',messages:[],env,fetchImpl:async(url,a)=>{sent=a;return ok;}}),'ok');
 assert.equal(sent.headers['x-api-key'],'sk-ant-key');assert.equal(JSON.parse(sent.body).model,'claude-haiku-5-5');
});

test('a key pasted from a multi-line curl command is reduced to the key itself',async()=>{
 let sent;const ok={ok:true,json:async()=>({stop_reason:'end_turn',content:[{type:'text',text:'ok'}]})};
 const env={ANTHROPIC_API_KEY:'x-api-key: sk-ant-usr-AbC_123-xyz" \\\n  --header',ANTHROPIC_MODEL:'m'};
 await callModel({system:'s',messages:[],env,fetchImpl:async(url,a)=>{sent=a;return ok;}});
 assert.equal(sent.headers['x-api-key'],'sk-ant-usr-AbC_123-xyz');
 await callModel({system:'s',messages:[],env:{ANTHROPIC_API_KEY:'sk-ant-ab​cd\ne',ANTHROPIC_MODEL:'m'},fetchImpl:async(url,a)=>{sent=a;return ok;}});
 assert.equal(sent.headers['x-api-key'],'sk-ant-ab');
});
