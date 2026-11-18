const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto').webcrypto;
function client(fetch){
 const context={window:{location:{pathname:'/test-event/'}},fetch,crypto,URLSearchParams,FormData,AbortController,setTimeout,clearTimeout};
 vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../site-forms.js'),'utf8'),context);return context.window.SiteForms;
}
test('confirmed Sheet acknowledgement permits continuation',async()=>{
 let calls=0;const api=client(async()=>{calls++;return{ok:true,json:async()=>({result:'success'})}});
 const receipt=await api.submit('https://receiver.example/',{body:new URLSearchParams({name:'Test'}),requireArchive:true});
 assert.equal(receipt.result,'success');assert.equal(calls,1);
});
test('archive-required bookings stop on receiver error without email fallback',async()=>{
 let calls=0;const api=client(async()=>{calls++;return{ok:true,json:async()=>({result:'error'})}});
 await assert.rejects(api.submit('https://receiver.example/',{body:new URLSearchParams(),requireArchive:true}));assert.equal(calls,1);
});
test('old unavailable receivers have an acknowledged email fallback with the same reference',async()=>{
 const requests=[];const api=client(async(url,options)=>{requests.push({url,options});if(requests.length===1)throw new Error('Unavailable');return{ok:true,json:async()=>({success:'true'})}});
 const receipt=await api.submit('https://receiver.example/',{body:new URLSearchParams({email:'test@example.com',submission_id:'test-reference-001'})});
 assert.equal(receipt.archive,false);assert.equal(receipt.delivery,'email');assert.equal(requests[1].options.body.get('submission_id'),'test-reference-001');
});
test('failed email fallback cannot report success',async()=>{
 const api=client(async()=>({ok:false,json:async()=>({})}));await assert.rejects(api.submit('https://receiver.example/',{body:new URLSearchParams()}));
});
function receiver({mailFails=false}={}){
 const rows=[Array(15).fill('Header')];let mails=0;
 const sheet={getLastRow:()=>rows.length,appendRow:row=>rows.push(row),getRange:(row,col)=>({setValue:value=>{rows[row-1][col-1]=value},getValues:()=>[rows[row-1]],setValues:values=>{values[0].forEach((v,i)=>rows[row-1][col-1+i]=v)},createTextFinder:id=>({matchEntireCell:()=>({findNext:()=>{const i=rows.findIndex(r=>r[1]===id);return i>=0?{getRow:()=>i+1}:null}})})})};
 const context={SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet})},LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},MailApp:{sendEmail:()=>{mails++;if(mailFails)throw new Error('Quota')}},ContentService:{MimeType:{JSON:'json'},createTextOutput:value=>({setMimeType:()=>JSON.parse(value)})}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../server/mm-vol3-receiver.gs'),'utf8'),context);return{context,rows,mails:()=>mails};
}
const valid={ticket:'couple',first_name:'Test',last_name:'Participant',partner_name:'Test Partner',partner_first_name:'Test',partner_last_name:'Partner',partner_email:'partner@example.com',partner_phone:'TEST',partner_address:'TEST',partner_dance_role:'Follower',partner_role:'Teacher',dance_role:'Leader',role:'Dancer',address:'TEST',email:'test@example.com',phone:'TEST',submission_id:'test-reference-001',amount:'1'};
test('M&M server owns price and records pending payment',()=>{
 const r=receiver();assert.equal(r.context.doPost({parameter:valid}).result,'success');assert.equal(r.rows[1][10],420);assert.equal(r.rows[1][11],'PENDING — not paid');assert.equal(r.rows[1][13],'SENT');
});
test('duplicate registration reference creates one row and one email',()=>{
 const r=receiver();r.context.doPost({parameter:valid});const receipt=r.context.doPost({parameter:valid});assert.equal(receipt.duplicate,true);assert.equal(r.rows.length,2);assert.equal(r.mails(),1);
});
test('invalid or missing partner and spam submissions are rejected',()=>{
 const r=receiver();assert.equal(r.context.doPost({parameter:{...valid,partner_first_name:''}}).result,'error');assert.equal(r.context.doPost({parameter:{...valid,_honey:'spam'}}).result,'error');assert.equal(r.rows.length,1);
});
test('spreadsheet formulas in names are stored as text',()=>{
 const r=receiver();r.context.doPost({parameter:{...valid,first_name:'=IMPORTXML("bad")'}});assert.equal(r.rows[1][3][0],"'");
});
test('email quota failure remains visible without losing the registration',()=>{
 const r=receiver({mailFails:true});assert.equal(r.context.doPost({parameter:valid}).result,'success');assert.equal(r.rows[1][13],'FAILED — check mail quota');
});
test('public health endpoint never returns participant records',()=>{
 const r=receiver();r.context.doPost({parameter:valid});assert.deepEqual(Object.keys(r.context.doGet()).sort(),['ready','service','version']);
});

test('all required participant fields are enforced',()=>{for(const key of ['first_name','last_name','email','phone','address','dance_role','role','partner_email','partner_phone','partner_address','partner_role']){const r=receiver();assert.equal(r.context.doPost({parameter:{...valid,[key]:''}}).result,'error',key);assert.equal(r.rows.length,1)}});
test('couple needs one Leader and one Follower',()=>{const r=receiver();assert.equal(r.context.doPost({parameter:{...valid,partner_dance_role:'Leader'}}).result,'error')});
test('Dancers solo and couple use the correct archive and prices',()=>{for(const [ticket,amount] of [['solo',220],['couple',420]]){const r=receiver();assert.equal(r.context.doPost({parameter:{...valid,service:'dancers',ticket}}).result,'success');assert.equal(r.rows[1][10],amount);assert.equal(r.rows[1][15],'Leader');assert.equal(r.rows[1][17],'TEST')}});

test('shoe receiver computes price and deduplicates orders',()=>{const r=receiver();const p={service:'shoes',submission_id:'test-shoe-reference',fullName:'Test only',email:'test@example.com',whatsapp:'+41000000000',shoeModel:'Panda',size:'42',qty:'2',paymentMethod:'TWINT 🇨🇭',address:'Test',city:'Test',zipCode:'0400',country:'Test',unitPrice:'1'};const receipt=r.context.doPost({parameter:p});assert.equal(receipt.result,'success');assert.equal(r.rows[1][9],100);assert.equal(r.rows[1][10],200);assert.equal(r.rows[1][17],'PENDING — not paid');assert.equal(r.context.doPost({parameter:p}).duplicate,true);assert.equal(r.rows.length,2)});
test('invalid shoe quantity never writes an order',()=>{const r=receiver();assert.equal(r.context.doPost({parameter:{service:'shoes',qty:'0'}}).result,'error');assert.equal(r.rows.length,1)});

function paymentReceiver(){const r=receiver();vm.runInContext(fs.readFileSync(path.join(__dirname,'../server/stripe-payment-sync.gs'),'utf8'),r.context);r.context.doPost({parameter:valid});return r;}
const paidSession={id:'cs_live_test_example',client_reference_id:'test-reference-001',payment_status:'paid',currency:'chf',amount_total:42000};
const config={sheet:'test-sheet',ticket:'Early Bird Couple',amount:420};
test('Stripe-confirmed session updates paid status once',()=>{const r=paymentReceiver();r.context.markStripePayment(config,paidSession);assert.equal(r.rows[1][11],'PAID — verified by Stripe');assert.equal(r.rows[1][12],paidSession.id);r.context.markStripePayment(config,paidSession);assert.equal(r.mails(),2)});
test('unpaid, wrong amount, wrong currency and unknown references cannot mark paid',()=>{for(const change of [{payment_status:'unpaid'},{amount_total:1},{currency:'eur'},{client_reference_id:'unknown-reference'}]){const r=paymentReceiver();r.context.markStripePayment(config,{...paidSession,...change});assert.equal(r.rows[1][11],'PENDING — not paid')}});
test('public submissions cannot forge a payment confirmation',()=>{const r=paymentReceiver();assert.equal(r.context.doPost({parameter:{...valid,service:'paid',payment_status:'paid'}}).result,'error');assert.equal(r.rows[1][11],'PENDING — not paid')});
