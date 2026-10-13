/** Private registration archive. No endpoint returns participant records. */
const REGISTRATION_OWNER = 'masterylab1.0@gmail.com';
const REGISTRATION_COLUMNS = ['Received (Zurich)', 'Reference', 'Event', 'Name', 'Email', 'Phone', 'Ticket', 'Payment status', 'Details'];
function setupRegistrationArchive() {
  const properties = PropertiesService.getScriptProperties();
  if (properties.getProperty('REGISTRATION_SHEET_ID')) return;
  const spreadsheet = SpreadsheetApp.create('MasteryLab — Registrations');
  const sheet = spreadsheet.getSheets()[0]; sheet.setName('Registrations');
  sheet.appendRow(REGISTRATION_COLUMNS); sheet.setFrozenRows(1);
  properties.setProperty('REGISTRATION_SHEET_ID', spreadsheet.getId());
}
function doGet() {
  return registrationReply({service:'MasteryLab registration receiver', ready:!!PropertiesService.getScriptProperties().getProperty('REGISTRATION_SHEET_ID')});
}
function doPost(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return registrationReply({result:'error', message:'Please try later.'});
  try {
    const data = e.parameter || {};
    if (data._honey) return registrationReply({result:'error'});
    const email = String(data.email || '').trim();
    const name = String(data.full_name || data.first_name || data.name || data.firstName || '').trim() + (data.last_name ? ' '+data.last_name : data.lastName ? ' '+data.lastName : '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name.trim()) return registrationReply({result:'error', message:'Name and email are required.'});
    const id = String(data.submission_id || '');
    if (!/^[a-zA-Z0-9_-]{12,80}$/.test(id)) return registrationReply({result:'error',message:'Submission reference required.'});
    const sheetId = PropertiesService.getScriptProperties().getProperty('REGISTRATION_SHEET_ID');
    if (!sheetId) return registrationReply({result:'error',message:'Receiver setup required.'});
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Registrations');
    if (sheet.getLastRow()>1 && sheet.getRange(2,2,sheet.getLastRow()-1,1).createTextFinder(id).matchEntireCell(true).findNext()) return registrationReply({result:'success', submissionId:id, duplicate:true});
    const event = String(data.event || data.event_name || data.page || 'MasteryLab registration').slice(0,200);
    const ticket = String(data.ticket_type || data.amount || data.level || data.track || '').slice(0,200);
    const details = Object.keys(data).filter(key=>!key.startsWith('_')).map(key=>key+': '+String(data[key]).slice(0,2000)).join('\n').slice(0,20000);
    const safe = value => /^[=+\-@]/.test(value) ? "'"+value : value;
    sheet.appendRow([Utilities.formatDate(new Date(),'Europe/Zurich','yyyy-MM-dd HH:mm:ss'),id,safe(event),safe(name.trim()),safe(email),safe(String(data.whatsapp || data.phone || '')),safe(ticket),'PENDING — payment not verified',safe(details)]);
    MailApp.sendEmail({to:REGISTRATION_OWNER,subject:'MasteryLab registration — '+event+' — '+id,body:'Reference: '+id+'\nPayment: NOT verified\n\n'+details,name:'MasteryLab'});
    return registrationReply({result:'success',submissionId:id});
  } catch (error) { return registrationReply({result:'error',message:'Could not confirm submission. Please contact MasteryLab.'}); }
  finally {lock.releaseLock();}
}
function registrationReply(payload) {return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);}
