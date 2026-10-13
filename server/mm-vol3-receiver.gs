/** May 2027 M&M Vol. 3 registrations. Never exposes participant records. */
const MM_SHEET_ID = '1RRQr5cs3DJ0LzrW2w9ZBTU-AyOQAkA3c_39MmbXWSss';
const MM_TICKETS = {couple:{amount:420,label:'Early Bird Couple'},follower:{amount:220,label:'Early Bird Follower'},leader:{amount:220,label:'Early Bird Leader'}};
const DANCERS_SHEET_ID = '1JbEl2qeZDTqTfnhFonCA3XM1dAdYS3u9AiC5w00s9zc';
const SHOES_SHEET_ID = '1G-tRM9FeNTfdj6jv2jSB3jVJ56GnCm9JPeKgiwPSBfw';
function doGet() {return reply({service:'MasteryLab registration receiver',ready:true,version:2});}
function doPost(e) {
 const lock=LockService.getScriptLock();
 if (!lock.tryLock(20000)) return reply({result:'error',message:'Please try later.'});
 try {
  const p=e.parameter || {};
  if (p._honey) return reply({result:'error'});
  if (p.service==='shoes') return saveShoeOrder(p);
  const dancers=p.service==='dancers';
  if (p.service && !['mm','dancers'].includes(p.service)) return reply({result:'error'});
  const ticket=dancers ? ({solo:{amount:220,label:'Early Bird Solo'},couple:{amount:420,label:'Early Bird Couple'}})[p.ticket] : MM_TICKETS[p.ticket];
  const email=String(p.email || '').trim();
  const first=String(p.first_name || '').trim(), last=String(p.last_name || '').trim();
  const partner=[p.partner_first_name,p.partner_last_name].filter(Boolean).join(' ').trim();
  const ref=String(p.submission_id || '');
  if (!ticket || !validPerson(p,'') || !/^[a-zA-Z0-9_-]{12,80}$/.test(ref) || (p.ticket==='couple' && (!validPerson(p,'partner_') || p.dance_role===p.partner_dance_role)) || (!dancers && p.ticket!=='couple' && p.dance_role.toLowerCase()!==p.ticket)) return reply({result:'error',message:'Please check required fields and dance roles.'});
  const sheet=SpreadsheetApp.openById(dancers ? DANCERS_SHEET_ID : MM_SHEET_ID).getSheetByName('Registrations');
  if (sheet.getLastRow()>1) {
   const found=sheet.getRange(2,2,sheet.getLastRow()-1,1).createTextFinder(ref).matchEntireCell(true).findNext();
   if (found) return reply({result:'success',submissionId:ref,duplicate:true});
  }
  const safe=v=> /^[=+\-@]/.test(String(v)) ? "'"+String(v).slice(0,1000) : String(v).slice(0,1000);
  const phone=String(p.phone || '').trim(), partnerEmail=String(p.partner_email || '').trim();
  const event=dancers ? 'Bachata Sensual Dancers Lab Vol. 1 — 6–7 February 2027' : 'M&M Technique Lab Vol. 3 — 8–9 May 2027';
  sheet.appendRow([new Date(),ref,event,safe(first),safe(last),safe(partner),safe(email),safe(partnerEmail),safe(phone),ticket.label,ticket.amount,'PENDING — not paid','','PENDING','Registered before Stripe checkout',...['dance_role','role','address','partner_first_name','partner_last_name','partner_dance_role','partner_role','partner_phone','partner_address'].map(k=>safe(p[k] || ''))]);
  const row=sheet.getLastRow();
  try {
   MailApp.sendEmail({to:'masterylab1.0@gmail.com',subject:event+' registration — '+ticket.label+' — '+ref,body:'Reference: '+ref+'\nEvent: '+event+'\n'+personSummary(p,'')+'\nPartner:\n'+(partner ? personSummary(p,'partner_') : 'None')+'\nTicket: '+ticket.label+'\nAmount: '+ticket.amount+'\nPayment status: NOT VERIFIED. Registration is saved before Stripe checkout.',name:'MasteryLab'});
   sheet.getRange(row,14).setValue('SENT');
  } catch (mailError) {sheet.getRange(row,14).setValue('FAILED — check mail quota');}
  return reply({result:'success',submissionId:ref});
 } catch(error) {return reply({result:'error',message:'Registration could not be confirmed. Please contact MasteryLab.'});}
 finally {lock.releaseLock();}
}
function validPerson(p,prefix) {
 return ['first_name','last_name','phone','address'].every(k=>String(p[prefix+k] || '').trim().length>0 && String(p[prefix+k]).length<=300) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(p[prefix+'email'] || '')) && ['Leader','Follower'].includes(p[prefix+'dance_role']) && ['Teacher','Dancer'].includes(p[prefix+'role']);
}
function personSummary(p,prefix) {return ['first_name','last_name','dance_role','role','phone','email','address'].map(k=>k.replace(/_/g,' ')+': '+(p[prefix+k] || '')).join('\n');}
function saveShoeOrder(p) {
 const ref=String(p.submission_id || ''), qty=Number(p.qty);
 if (!/^[a-zA-Z0-9_-]{12,80}$/.test(ref) || !Number.isInteger(qty) || qty<1 || qty>20 || !['fullName','whatsapp','shoeModel','size','address','city','zipCode','country'].every(k=>String(p[k] || '').trim()) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(p.email || '')) || !['TWINT 🇨🇭','Bank Transfer (IBAN)'].includes(p.paymentMethod)) return reply({result:'error',message:'Please check order details.'});
 const sheet=SpreadsheetApp.openById(SHOES_SHEET_ID).getSheetByName('Website Orders');
 if (sheet.getLastRow()>1 && sheet.getRange(2,2,sheet.getLastRow()-1,1).createTextFinder(ref).matchEntireCell(true).findNext()) return reply({result:'success',orderId:'PM-'+ref,duplicate:true});
 const safe=v=> /^[=+\-@]/.test(String(v)) ? "'"+String(v).slice(0,1000) : String(v).slice(0,1000);
 const orderId='PM-'+ref;
 const row=[new Date(),ref,orderId,...['fullName','email','whatsapp','shoeModel','size'].map(k=>safe(p[k])),qty,100,qty*100,safe(p.paymentMethod),...['address','city','zipCode','country','notes'].map(k=>safe(p[k] || '')),'PENDING — not paid','PENDING'];
 sheet.appendRow(row);const rowNumber=sheet.getLastRow();
 try {MailApp.sendEmail({to:'masterylab1.0@gmail.com',subject:'Shoe order — '+orderId,body:'Order: '+orderId+'\n'+Object.keys(p).filter(k=>k!=='_honey').map(k=>k+': '+p[k]).join('\n')+'\nTotal: CHF '+qty*100+'\nPayment status: NOT VERIFIED.',name:'MasteryLab'});sheet.getRange(rowNumber,19).setValue('SENT');} catch(error){sheet.getRange(rowNumber,19).setValue('FAILED — check mail quota');}
 return reply({result:'success',orderId:orderId,submissionId:ref});
}
function reply(data) {return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);}
