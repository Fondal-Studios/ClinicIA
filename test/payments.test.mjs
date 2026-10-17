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
