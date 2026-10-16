import {courses,questions} from './courses.mjs';
export const marketItems=[
{id:'ynara',kind:'tutor',name:'Ynara',price:80,image:'./assets/tutors/ynara.png',description:'Una compañera de estudio para sostener el ritmo.'},
{id:'aelith',kind:'tutor',name:'Aelith',price:140,image:'./assets/tutors/aelith.png',description:'La custodia del repaso: cada error merece otra vuelta.'},
{id:'morveth',kind:'tutor',name:'Morveth',price:220,image:'./assets/tutors/morveth.png',description:'Un guardián para los bloques de concentración.'},
{id:'veyra',kind:'tutor',name:'Veyra',price:300,image:'./assets/tutors/veyra.png',description:'Una aliada para preparar tu próximo simulacro.'},
{id:'marco-oro',kind:'frame',name:'Marco dorado',price:30,description:'Un marco cálido para tu tutor.'},
{id:'marco-noche',kind:'frame',name:'Marco nocturno',price:45,description:'Un marco violeta para tu rincón de estudio.'}
];
export const freshWallet=()=>({ledger:{},owned:[],equipped:null,frame:null,nickname:''});
export const earned=w=>Object.values(w.ledger).reduce((n,x)=>n+x,0);
export const balance=w=>earned(w)-w.owned.reduce((n,id)=>n+(marketItems.find(i=>i.id===id)?.price||0),0);
export function grant(w,id,amount){if(Object.hasOwn(w.ledger,id))return w;return {...w,ledger:{...w.ledger,[id]:amount}};}
export function restoreWallet(raw){const w=freshWallet();if(!raw||typeof raw!=='object')return w;for(const [key,value] of Object.entries(raw.ledger||{}).slice(0,20000)){
 if(key.startsWith('first:')&&value===1&&questions.some(q=>q.id===key.slice(6)))w.ledger[key]=1;
 if(key.startsWith('perfect:')&&value===5&&courses.some(c=>c.lessons.some(l=>l.id===key.slice(8))))w.ledger[key]=5;
 if(key.startsWith('course:')&&value===20&&courses.some(c=>c.id===key.slice(7)))w.ledger[key]=20;
 const m=/^review:(\d{4}-\d{2}-\d{2}):(.+)$/.exec(key);if(m&&value===1&&questions.some(q=>q.id===m[2])&&Object.keys(w.ledger).filter(k=>k.startsWith(`review:${m[1]}:`)).length<5)w.ledger[key]=1;
 }
 for(const id of Array.isArray(raw.owned)?raw.owned:[]){const item=marketItems.find(i=>i.id===id);if(item&&!w.owned.includes(id)&&balance(w)>=item.price)w.owned.push(id);}
 if(w.owned.includes(raw.equipped)&&marketItems.find(i=>i.id===raw.equipped)?.kind==='tutor')w.equipped=raw.equipped;
 if(w.owned.includes(raw.frame)&&marketItems.find(i=>i.id===raw.frame)?.kind==='frame')w.frame=raw.frame;
 if(typeof raw.nickname==='string')w.nickname=raw.nickname.slice(0,24);return w;
}
export function purchase(w,id){const item=marketItems.find(i=>i.id===id);if(!item)return {wallet:w,error:'Artículo no disponible.'};if(w.owned.includes(id))return {wallet:w,error:'Ya tenés este artículo.'};if(balance(w)<item.price)return {wallet:w,error:'Todavía no alcanzan tus puntos.'};return {wallet:{...w,owned:[...w.owned,id],...(item.kind==='tutor'?{equipped:id}:{frame:id})},error:null};}
export function equip(w,id){if(id===null)return {...w,equipped:null};const item=marketItems.find(i=>i.id===id);if(!item||!w.owned.includes(id))return w;return {...w,[item.kind==='tutor'?'equipped':'frame']:id};}
