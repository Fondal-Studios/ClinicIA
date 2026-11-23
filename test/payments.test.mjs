import test from 'node:test';import assert from 'node:assert/strict';import {PGlite} from '@electric-sql/pglite';
import {schema} from '../backend/accounts.mjs';import {paymentSchema,paymentConfig,publicPaymentOffer,createPayments} from '../backend/payments.mjs';
test('payments stay disabled without complete configuration and do not disclose credentials',()=>{
 assert.equal(paymentConfig({}).enabled,false);assert.equal(paymentConfig({CLINICIA_PAYMENTS_ENABLED:'true'}).enabled,false);
 const c=paymentConfig({MERCADOPAGO_ACCESS_TOKEN:'do-not-leak'});assert.ok(!JSON.stringify(publicPaymentOffer(c)).includes('do-not-leak'));
 assert.equal(paymentConfig({CLINICIA_PRICE_INSTRUCTOR_ARS:'1e4'}).plans.instructor.cents,0);
});
test('checkout stores server price, reuses request identity, isolates orders and verifies amount and merchant',async()=>{
 const db=new PGlite();await db.exec(schema+paymentSchema);await db.query("INSERT INTO clinic_users(id,username,username_key,password_hash,recovery_hash) VALUES('u1','User1','user1','hash','hash'),('u2','User2','user2','hash','hash')");
 const env={MERCADOPAGO_ACCESS_TOKEN:'fake-server-token',CLINICIA_PRICE_INSTRUCTOR_ARS:'1234.50',CLINICIA_PRODUCT_TITLE:'Test pass',CLINICIA_PRODUCT_DESCRIPTION:'Test scope',CLINICIA_SELLER_NAME:'Test seller',CLINICIA_SUPPORT_EMAIL:'test@example.com',CLINICIA_PAYMENTS_ENABLED:'true'};
 let preferences=0,orderId,payment={id:99,status:'approved',collector_id:7,currency_id:'ARS',transaction_amount:1234.50,date_approved:'2026-10-17T00:00:00Z'};
 const request=async(url,args)=>{assert.equal(args.headers.Authorization,'Bearer fake-server-token');if(url.endsWith('/checkout/preferences')){preferences++;const b=JSON.parse(args.body);orderId=b.external_reference;assert.equal(b.items[0].unit_price,1234.50);assert.equal(b.items[0].currency_id,'ARS');return {ok:true,json:async()=>({id:'p1',collector_id:7,init_point:'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=p1'})};}return {ok:true,json:async()=>url.includes('/search?')?{results:[{id:99,status:'approved'}]}:{...payment,external_reference:orderId}};};
 const api=createPayments({db,origin:'https://clinic.example',env,request});
 try{
  const body={requestKey:'12345678-1234-1234-1234-123456789012',accepted:true,amount:1,plan:'instructor'};
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
 const env={MERCADOPAGO_ACCESS_TOKEN:'fake-server-token',MERCADOPAGO_WEBHOOK_SECRET:'whsec-test',CLINICIA_PRICE_INSTRUCTOR_ARS:'1000',CLINICIA_PRODUCT_TITLE:'Pass',CLINICIA_PRODUCT_DESCRIPTION:'Scope',CLINICIA_SELLER_NAME:'Seller',CLINICIA_SUPPORT_EMAIL:'t@example.com',CLINICIA_PAYMENTS_ENABLED:'true'};
 let orderId;const payment={id:55,status:'approved',collector_id:7,currency_id:'ARS',transaction_amount:1000,date_approved:'2026-10-17T00:00:00Z'};
 const request=async(url,args)=>{if(url.endsWith('/checkout/preferences')){orderId=JSON.parse(args.body).external_reference;return {ok:true,json:async()=>({id:'p1',collector_id:7,init_point:'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=p1'})};}return {ok:true,json:async()=>({...payment,external_reference:orderId})};};
 const api=createPayments({db,origin:'https://clinic.example',env,request});
 const sign=(dataId,requestId,ts='1760659200000',secret='whsec-test')=>`ts=${ts},v1=${createHmac('sha256',secret).update(`id:${dataId};request-id:${requestId};ts:${ts};`).digest('hex')}`;
 try{
  await api.checkout('u1',{requestKey:'12345678-1234-1234-1234-123456789012',accepted:true,plan:'instructor'});
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
test('precios: alumno gratis; curso de pago (acceso permanente), Instructor y Profesional mensuales; montos del servidor; Profesional incluye Instructor',async()=>{
 const db=new PGlite();await db.exec(schema+paymentSchema);await db.query("INSERT INTO clinic_users(id,username,username_key,password_hash,recovery_hash) VALUES('u1','User1','user1','hash','hash')");
 const env={MERCADOPAGO_ACCESS_TOKEN:'fake-server-token',CLINICIA_PRICE_CURSO_ARS:'3000',CLINICIA_PRICE_PACK_ARS:'9000',CLINICIA_PRICE_INSTRUCTOR_ARS:'5000',CLINICIA_PRICE_PROFESIONAL_ARS:'10000',CLINICIA_PRODUCT_TITLE:'ClinicIA',CLINICIA_PRODUCT_DESCRIPTION:'Acceso',CLINICIA_SELLER_NAME:'Seller',CLINICIA_SUPPORT_EMAIL:'t@example.com',CLINICIA_PAYMENTS_ENABLED:'true'};
 const offer=publicPaymentOffer(paymentConfig(env));assert.deepEqual(offer.plans.map(p=>[p.id,p.usd,p.amount,p.enabled,p.durationDays]),[['instructor',4.99,5000,true,30],['profesional',9.99,10000,true,30],['curso',2.99,3000,true,3650],['pack',9.99,9000,true,3650]]);
 for(const p of offer.plans)assert.match(p.usd.toFixed(2),/\.99$/,'todos los precios de referencia terminan en .99: '+p.id);
 assert.ok(offer.paidCourses.includes('acls')&&offer.paidCourses.includes('pals')&&!offer.paidCourses.includes('rot-cirugia'));
 assert.equal(paymentConfig({...env,CLINICIA_PRICE_PROFESIONAL_ARS:''}).plans.profesional.enabled,false,'sin precio en ARS el producto no se vende');
 assert.equal(paymentConfig({...env,CLINICIA_PLAN_PROFESIONAL_USD:'12'}).plans.profesional.usd,12,'el precio de referencia se puede cambiar');
 const sent=[];let pay;const request=async(url,args)=>{if(url.endsWith('/checkout/preferences')){const b=JSON.parse(args.body);sent.push(b);return {ok:true,json:async()=>({id:'pref-'+sent.length,collector_id:7,init_point:'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=x'})};}return {ok:true,json:async()=>url.includes('/search')?{results:[pay]}:pay};};
 const api=createPayments({db,origin:'https://clinic.example',env,request});
 try{
  const none=await api.access('u1');assert.deepEqual([none.instructor.active,none.profesional.active,none.courses],[false,false,[]]);
  const k=n=>String(n).repeat(8)+'-1111-1111-1111-111111111111';
  await assert.rejects(()=>api.checkout('u1',{requestKey:k(1),accepted:true,plan:'alumno'}),e=>e.status===400,'alumno ya no se vende');
  await assert.rejects(()=>api.checkout('u1',{requestKey:k(1),accepted:true,plan:'curso',courseId:'rot-cirugia'}),e=>e.status===400,'un curso gratis no se compra');
  await assert.rejects(()=>api.checkout('u1',{requestKey:k(1),accepted:true,plan:'curso'}),e=>e.status===400);
  const c=await api.checkout('u1',{requestKey:k(2),accepted:true,plan:'curso',courseId:'acls',amount:1,unit_price:1});assert.equal(c.amount,3000);assert.equal(c.courseId,'acls');assert.equal(sent[0].items[0].unit_price,3000);assert.equal(sent[0].items[0].id,'clinicia-curso-acls');assert.match(sent[0].items[0].title,/ACLS/);
  pay={id:601,status:'approved',collector_id:7,currency_id:'ARS',transaction_amount:3000,external_reference:c.id,date_approved:new Date().toISOString()};
  const v=await api.verify('u1',c.id);assert.equal(v.status,'approved');assert.ok(new Date(v.validUntil)>new Date(Date.now()+3000*86400000),'acceso permanente (10 años)');
  const a1=await api.access('u1');assert.deepEqual(a1.courses,['acls']);assert.equal(a1.instructor.active,false,'comprar un curso no da Instructor');
  const p=await api.checkout('u1',{requestKey:k(3),accepted:true,plan:'profesional'});assert.equal(p.amount,10000);
  pay={id:602,status:'approved',collector_id:7,currency_id:'ARS',transaction_amount:10000,external_reference:p.id,date_approved:new Date().toISOString()};await api.verify('u1',p.id);
  const a2=await api.access('u1');assert.equal(a2.profesional.active,true);assert.equal(a2.instructor.active,true,'Profesional incluye Instructor');
  await db.query("UPDATE clinic_orders SET valid_until=now()-interval '1 day' WHERE id=$1",[p.id]);
  const a3=await api.access('u1');assert.equal(a3.profesional.active,false);assert.equal(a3.instructor.active,false);assert.deepEqual(a3.courses,['acls'],'el curso comprado no vence');
  // pack: los siete cursos de certificación con una sola compra
  const k4=n=>String(n).repeat(8)+'-2222-2222-2222-222222222222';const pk=await api.checkout('u1',{requestKey:k4(4),accepted:true,plan:'pack'});assert.equal(pk.amount,9000);assert.equal(sent.at(-1).items[0].id,'clinicia-pack');
  pay={id:603,status:'approved',collector_id:7,currency_id:'ARS',transaction_amount:9000,external_reference:pk.id,date_approved:new Date().toISOString()};await api.verify('u1',pk.id);
  const a4=await api.access('u1');assert.equal(a4.pack.active,true);assert.deepEqual(a4.courses.sort(),['acls','amls-preparacion','atls','epc-preparacion','fccs','phtls','pals'].sort(),'el pack abre los siete cursos');assert.equal(a4.instructor.active,false,'el pack no da Instructor');
  await db.query("UPDATE clinic_orders SET status='refunded',valid_until=NULL WHERE id=$1",[pk.id]);assert.deepEqual((await api.access('u1')).courses,['acls']);
  // liberación manual de un curso
  const g=await api.grant('u1','u1','curso',null,'Hospital','pals');assert.equal(g.courseId,'pals');await assert.rejects(()=>api.grant('u1','u1','curso',30,'','rot-cirugia'),e=>e.status===400);
  assert.deepEqual((await api.access('u1')).courses.sort(),['acls','pals']);await api.revokeGrant(g.id);assert.deepEqual((await api.access('u1')).courses,['acls']);
 }finally{await db.close();}
});
