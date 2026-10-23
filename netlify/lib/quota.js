// AI usage quotas. Persistent in Postgres (clinic_limits) when DATABASE_URL is set, so they survive restarts and are
// shared by every instance; otherwise a per-instance memory counter. Tunable by env, never from the browser.
const mem=new Map();
const num=(v,d)=>{const n=Number(v);return Number.isFinite(n)&&n>0?n:d;};
function clientKey(event){
 if(event.userId)return 'u:'+event.userId;
 const h=event.headers||{},ip=event.ip||h['cf-connecting-ip']||h['x-nf-client-connection-ip']||String(h['x-forwarded-for']||'').split(',')[0].trim();
 return 'ip:'+(ip||'unknown');
}
function memConsume(key,max,seconds,cost){
 const now=Date.now(),e=mem.get(key);
 if(!e||e.expires<=now){mem.set(key,{count:cost,expires:now+seconds*1000});return {allowed:cost<=max};}
 e.count+=cost;return {allowed:e.count<=max};
}
async function consume(key,max,seconds,cost,env){
 if(env.DATABASE_URL){
  try{const {getAccounts}=await import('../../backend/accounts.mjs');const a=await getAccounts();if(a)return await a.consume(key,max,seconds,cost);}
  catch{console.error('quota_store_unavailable');}
 }
 return memConsume(key,max,seconds,cost);
}
// scope: 'tutor' | 'clinical'. Checks the caller's own bucket first, then a global bucket that caps total provider spend.
async function reserve(event,{scope,cost=1,env=process.env}){
 const d=scope==='clinical'?{anon:60,user:240,global:1000}:{anon:30,user:120,global:600};
 const who=clientKey(event),isUser=who.startsWith('u:');
 const per=num(env[`AI_${scope.toUpperCase()}_${isUser?'USER':'ANON'}_LIMIT_HOUR`],isUser?d.user:d.anon);
 const glob=num(env[`AI_${scope.toUpperCase()}_GLOBAL_LIMIT_HOUR`],d.global);
 if(!(await consume(`ai:${scope}:${who}`,per,3600,cost,env)).allowed)return {ok:false,reason:'user'};
 if(!(await consume(`ai:${scope}:global`,glob,3600,cost,env)).allowed)return {ok:false,reason:'global'};
 return {ok:true};
}
module.exports={reserve,clientKey,_resetForTests:()=>mem.clear()};
