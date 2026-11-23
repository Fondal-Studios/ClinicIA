import test from 'node:test';import assert from 'node:assert/strict';import {PGlite} from '@electric-sql/pglite';
import {schema} from '../backend/accounts.mjs';import {paymentSchema,paymentConfig,publicPaymentOffer,createPayments} from '../backend/payments.mjs';
test('payments stay disabled without complete configuration and do not disclose credentials',()=>{
 assert.equal(paymentConfig({}).enabled,false);assert.equal(paymentConfig({CLINICIA_PAYMENTS_ENABLED:'true'}).enabled,false);
 const c=paymentConfig({MERCADOPAGO_ACCESS_TOKEN:'do-not-leak'});assert.ok(!JSON.stringify(publicPaymentOffer(c)).includes('do-not-leak'));
 assert.equal(paymentConfig({CLINICIA_PRICE_ARS:'1e4'}).cents,0);
});
test('checkout stores server price, reuses request identity, isolates orders and verifies amount and merchant',async()=>{
 const db=new PGlite();await db.exec(schema+paymentSchema);await db.query("INSERT INTO clinic_users(id,username,username_key,password_hash,recovery_hash) VALUES('u1','User1','user1','hash','hash'),('u2','User2','user2','hash','hash')");
 const env={MERCADOPAGO_ACCESS_TOKEN:'fake-server-token',CLINICIA_PRICE_ARS:'1234.50',CLINICIA_PRODUCT_TITLE:'Test pass',CLINICIA_PRODUCT_DESCRIPTION:'Test scope',CLINICIA_SELLER_NAME:'Test seller',CLINICIA_SUPPORT_EMAIL:'test@example.com',CLINICIA_PAYMENTS_ENABLED:'true'};
 let preferences=0,orderId,payment={id:99,status:'approved',collector_id:7,currency_id:'ARS',transaction_amount:1234.50,date_approved:'2026-10-17T00:00:00Z'};
 const request=async(url,args)=>{assert.equal(args.headers.Authorization,'Bearer fake-server-token');if(url.endsWith('/checkout/preferences')){preferences++;const b=JSON.parse(args.body);orderId=b.external_reference;assert.equal(b.items[0].unit_price,1234.50);assert.equal(b.items[0].currency_id,'ARS');return {ok:true,json:async()=>({id:'p1',collector_id:7,init_point:'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=p1'})};}return {ok:true,json:async()=>url.includes('/search?')?{results:[{id:99,status:'approved'}]}:{...payment,external_reference:orderId}};};
 const api=createPayments({db,origin:'https://clinic.example',env,request});
 try{
  const body={requestKey:'12345678-1234-1234-1234-123456789012',accepted:true,amount:1};
  const order=await api.checkout('u1',body);assert.equal(order.amount,1234.50);
  assert.equal((await api.checkout('u1',body)).id,order.id);assert.equal(preferences,1);
  assert.equal((await api.orders('u2')).length,0);await assert.rejects(()=>api.verify('u2',order.id),e=>e.status===404);
  payment.transaction_amount=1;await assert.rejects(()=>api.verify('u1',order.id),e=>e.status===409);
  payment.transaction_amount=1234.50;payment.collector_id=8;await assert.rejects(()=>api.verify('u1',order.id),e=>e.status===409);
  payment.collector_id=7;const verified=await api.verify('u1',order.id);assert.equal(verified.status,'approved');assert.equal(new Date(verified.validUntil).toISOString(),'2026-11-16T00:00:00.000Z');
  const again=await api.verify('u1',order.id);assert.equal(new Date(again.validUntil).getTime(),new Date(verified.validUntil).getTime());
  payment.status='refunded';assert.equal((await api.verify('u1',order.id)).validUntil,null);
  env.CLINICIA_PAYMENTS_ENABLED='false';await assert.rejects(()=>api.checkout('u1',body),e=>e.status===503);
 }finally{await db.close();}
});
test('webhook requires a valid signature, re-reads the payment and credits exactly once',async()=>{
 const {createHmac}=await import('node:crypto');
 const db=new PGlite();await db.exec(schema+paymentSchema);await db.query("INSERT INTO clinic_users(id,username,username_key,password_hash,recovery_hash) VALUES('u1','User1','user1','hash','hash')");
 const env={MERCADOPAGO_ACCESS_TOKEN:'fake-server-token',MERCADOPAGO_WEBHOOK_SECRET:'whsec-test',CLINICIA_PRICE_ARS:'1000',CLINICIA_PRODUCT_TITLE:'Pass',CLINICIA_PRODUCT_DESCRIPTION:'Scope',CLINICIA_SELLER_NAME:'Seller',CLINICIA_SUPPORT_EMAIL:'t@example.com',CLINICIA_PAYMENTS_ENABLED:'true'};
 let orderId;const payment={id:55,status:'approved',collector_id:7,currency_id:'ARS',transaction_amount:1000,date_approved:'2026-10-17T00:00:00Z'};
 const request=async(url,args)=>{if(url.endsWith('/checkout/preferences')){orderId=JSON.parse(args.body).external_reference;return {ok:true,json:async()=>({id:'p1',collector_id:7,init_point:'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=p1'})};}return {ok:true,json:async()=>({...payment,external_reference:orderId})};};
 const api=createPayments({db,origin:'https://clinic.example',env,request});
 const sign=(dataId,requestId,ts='1760659200000',secret='whsec-test')=>`ts=${ts},v1=${createHmac('sha256',secret).update(`id:${dataId};request-id:${requestId};ts:${ts};`).digest('hex')}`;
 try{
  await api.checkout('u1',{requestKey:'12345678-1234-1234-1234-123456789012',accepted:true});
  await assert.rejects(()=>api.webhook({signature:sign('55','r1',undefined,'wrong'),requestId:'r1',dataId:'55',type:'payment'}),e=>e.status===401);
  await assert.rejects(()=>api.webhook({signature:undefined,requestId:'r1',dataId:'55',type:'payment'}),e=>e.status===401);
  const ok={signature:sign('55','r1'),requestId:'r1',dataId:'55',type:'payment'};
  const first=await api.webhook(ok);assert.equal(first.order.status,'approved');const until=first.order.validUntil;
  const second=await api.webhook(ok);assert.equal(second.order.validUntil.toString(),until.toString());
  assert.equal((await db.query("SELECT count(*)::int AS n FROM clinic_orders WHERE payment_id='55'")).rows[0].n,1);
  assert.equal((await api.webhook({...ok,type:'merchant_order'})).handled,false);
  payment.status='refunded';assert.equal((await api.webhook(ok)).order.validUntil,null);
  payment.transaction_amount=1;await assert.rejects(()=>api.webhook(ok),e=>e.status===409);
  assert.deepEqual(await api.reconcilePending(),{checked:0,changed:0,errors:0});
 }finally{await db.close();}
});
test('two access levels: alumno USD 4.99 and instructor USD 9.99, server-side amounts, validated instructor includes student access',async()=>{
 const db=new PGlite();await db.exec(schema+paymentSchema);await db.query("INSERT INTO clinic_users(id,username,username_key,password_hash,recovery_hash) VALUES('u1','User1','user1','hash','hash')");
 const env={MERCADOPAGO_ACCESS_TOKEN:'fake-server-token',CLINICIA_PRICE_ALUMNO_ARS:'5000',CLINICIA_PRICE_INSTRUCTOR_ARS:'10000',CLINICIA_PRODUCT_TITLE:'ClinicIA',CLINICIA_PRODUCT_DESCRIPTION:'Acceso',CLINICIA_SELLER_NAME:'Seller',CLINICIA_SUPPORT_EMAIL:'t@example.com',CLINICIA_PAYMENTS_ENABLED:'true'};
 const offer=publicPaymentOffer(paymentConfig(env));assert.deepEqual(offer.plans.map(p=>[p.id,p.usd,p.amount,p.enabled]),[['alumno',4.99,5000,true],['instructor',9.99,10000,true],['profesional',19.99,0,false]]);
 assert.equal(paymentConfig({...env,CLINICIA_PRICE_INSTRUCTOR_ARS:''}).plans.instructor.enabled,false,'sin precio en ARS el nivel no se vende');
 const sent=[];let pay;const request=async(url,args)=>{if(url.endsWith('/checkout/preferences')){const b=JSON.parse(args.body);sent.push(b);return {ok:true,json:async()=>({id:'pref-'+sent.length,collector_id:7,init_point:'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=x'})};}return {ok:true,json:async()=>url.includes('/search')?{results:[pay]}:pay};};
 const api=createPayments({db,origin:'https://clinic.example',env,request});
 try{
  assert.deepEqual((await api.access('u1')).instructor,{active:false,validUntil:null});
  const k1='11111111-1111-1111-1111-111111111111',k2='22222222-2222-2222-2222-222222222222';
  await assert.rejects(()=>api.checkout('u1',{requestKey:k1,accepted:true,plan:'admin'}),e=>e.status===400);
  const o=await api.checkout('u1',{requestKey:k1,accepted:true,plan:'instructor',amount:1,unit_price:1});assert.equal(o.plan,'instructor');assert.equal(o.amount,10000);assert.equal(sent[0].items[0].unit_price,10000);assert.equal(sent[0].items[0].id,'clinicia-instructor');
  const a=await api.checkout('u1',{requestKey:k2,accepted:true,plan:'alumno'});assert.equal(a.amount,5000);assert.equal(a.plan,'alumno');
  pay={id:501,status:'approved',collector_id:7,currency_id:'ARS',transaction_amount:10000,external_reference:o.id,date_approved:new Date().toISOString()};
  assert.equal((await api.verify('u1',o.id)).status,'approved');
  const acc=await api.access('u1');assert.equal(acc.instructor.active,true);assert.equal(acc.alumno.active,true,'instructor incluye alumno');
  await db.query("UPDATE clinic_orders SET valid_until=now()-interval '1 day' WHERE id=$1",[o.id]);
  const exp=await api.access('u1');assert.equal(exp.instructor.active,false);assert.equal(exp.alumno.active,false,'vencido: sin acceso');
 }finally{await db.close();}
});
