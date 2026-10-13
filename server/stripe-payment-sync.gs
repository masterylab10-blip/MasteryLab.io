/** Private scheduled payment reconciliation. Keys stay in Apps Script properties. */
const APPROVED_CHECKOUTS = {
 'https://buy.stripe.com/28E3cx7K64K8erM5iOdEs0U':{sheet:MM_SHEET_ID,ticket:'Early Bird Couple',amount:420},
 'https://buy.stripe.com/fZucN70hE3G4bfA8v0dEs0V':{sheet:MM_SHEET_ID,ticket:'Early Bird Follower',amount:220},
 'https://buy.stripe.com/eVq5kF3tQ3G46Zk5iOdEs0W':{sheet:MM_SHEET_ID,ticket:'Early Bird Leader',amount:220},
 'https://buy.stripe.com/aFa4gBaWi1xW97sdPkdEs0X':{sheet:DANCERS_SHEET_ID,ticket:'Early Bird Solo',amount:220},
 'https://buy.stripe.com/3cIbJ3aWi3G4abw26CdEs0Y':{sheet:DANCERS_SHEET_ID,ticket:'Early Bird Couple',amount:420}
};
function stripeRead(path) {
 const key=PropertiesService.getScriptProperties().getProperty('STRIPE_READ_KEY');
 if (!key || !key.startsWith('rk_live_')) throw new Error('A restricted live Stripe read key is required.');
 const response=UrlFetchApp.fetch('https://api.stripe.com/v1/'+path,{headers:{Authorization:'Bearer '+key},muteHttpExceptions:true});
 if(response.getResponseCode()!==200) throw new Error('Stripe read failed: '+response.getResponseCode());
 return JSON.parse(response.getContentText());
}
function setupStripeSync() {
 const links=stripeRead('payment_links?limit=100');
 const mapping={};
 links.data.forEach(link=>{if(APPROVED_CHECKOUTS[link.url]) mapping[link.id]=APPROVED_CHECKOUTS[link.url];});
 if(Object.keys(mapping).length!==5) throw new Error('All five approved payment links must be found in this Stripe account.');
 PropertiesService.getScriptProperties().setProperty('STRIPE_LINK_MAPPING',JSON.stringify(mapping));
 syncStripePayments();
 if(!ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()==='syncStripePayments')) ScriptApp.newTrigger('syncStripePayments').timeBased().everyMinutes(5).create();
 console.log('Stripe read connection verified. Five payment links mapped. Scheduled sync enabled.');
}
function syncStripePayments() {
 const lock=LockService.getScriptLock();if(!lock.tryLock(20000)) return;
 try {
  const properties=PropertiesService.getScriptProperties();
  const mapping=JSON.parse(properties.getProperty('STRIPE_LINK_MAPPING') || '{}');
  if(Object.keys(mapping).length!==5) throw new Error('Payment mapping not configured.');
  const now=Math.floor(Date.now()/1000);
  const since=Math.max(now-29*86400,Number(properties.getProperty('STRIPE_LAST_SYNC') || now-7*86400)-600);
  let cursor='',more=true,pages=0;
  while(more && pages++<20){
   const page=stripeRead('events?limit=100&created[gte]='+since+'&created[lte]='+now+'&types[]=checkout.session.completed&types[]=checkout.session.async_payment_succeeded'+(cursor?'&starting_after='+encodeURIComponent(cursor):''));
   page.data.forEach(event=>{const session=event.data.object,config=mapping[session.payment_link];if(!event.livemode || session.payment_status!=='paid' || !config) return;markStripePayment(config,session);});
   more=page.has_more;cursor=page.data.length?page.data[page.data.length-1].id:'';
  }
  if(more) throw new Error('Payment sync needs another pass; checkpoint preserved.');
  properties.setProperty('STRIPE_LAST_SYNC',String(now));
 } finally {lock.releaseLock();}
}
function markStripePayment(config,session) {
 const reference=String(session.client_reference_id || '');
 if(session.payment_status!=='paid' || !/^[a-zA-Z0-9_-]{12,80}$/.test(reference) || session.currency!=='chf' || session.amount_total!==config.amount*100) return;
 const sheet=SpreadsheetApp.openById(config.sheet).getSheetByName('Registrations');
 if(sheet.getLastRow()<2) return;
 const match=sheet.getRange(2,2,sheet.getLastRow()-1,1).createTextFinder(reference).matchEntireCell(true).findNext();
 if(!match) return;
 const row=match.getRow(),values=sheet.getRange(row,1,1,24).getValues()[0];
 if(values[9]!==config.ticket || Number(values[10])!==config.amount || values[11]==='PAID — verified by Stripe') return;
 if(values[12] && values[12]!==session.id) return;
 sheet.getRange(row,12,1,2).setValues([['PAID — verified by Stripe',session.id]]);
 try {MailApp.sendEmail({to:'masterylab1.0@gmail.com',subject:'Payment confirmed — '+values[2]+' — '+reference,body:'Stripe confirmed CHF '+config.amount+' for '+config.ticket+'.\nRegistration reference: '+reference+'\nStripe session: '+session.id,name:'MasteryLab'});} catch(error){sheet.getRange(row,15).setValue('Paid; payment notification email failed.');}
}
