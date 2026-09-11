// ============================================================
// Google Apps Script — MEN STYLE LAB Registration Handler
// Sheet ID: 1KqkjtG-hdxDeMxroK9wOMWJuKQ3Qhfm5cEmUklELg7Y
//
// HOW TO DEPLOY:
//   1. Open: https://docs.google.com/spreadsheets/d/1KqkjtG-hdxDeMxroK9wOMWJuKQ3Qhfm5cEmUklELg7Y/edit
//   2. Click Extensions -> Apps Script
//   3. Delete any existing code and paste this entire file
//   4. Click Save, then Deploy -> New deployment
//   5. Choose "Web app", set "Who has access" to "Anyone"
//   6. Click Deploy, copy the Web App URL
//   7. Replace GOOGLE_SCRIPT_URL in registration-men-styling.html with that URL
// ============================================================

var SHEET_ID   = '1KqkjtG-hdxDeMxroK9wOMWJuKQ3Qhfm5cEmUklELg7Y';
var SHEET_NAME = 'Registrations';
var LAB_NAME   = 'Men Style Lab';
var ADMIN_EMAILS = ['masterylab1.0@gmail.com', 'labmastery@outlook.com'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss   = SpreadsheetApp.openById(SHEET_ID);
    var data = e.parameter;

    var targetSheet = ss.getSheetByName(SHEET_NAME);
    if (!targetSheet) {
      targetSheet = ss.insertSheet(SHEET_NAME);
      targetSheet.appendRow([
        'Date', 'Time', 'Full Name', 'City',
        'Phone / WhatsApp', 'Email',
        'Role (Scene)', 'Role (Dance)', 'Status'
      ]);
      var header = targetSheet.getRange(1, 1, 1, 9);
      header.setFontWeight('bold');
      header.setBackground('#D6001C');
      header.setFontColor('#FFFFFF');
    }

    var timestamp = new Date();
    var fullName  = ((data.first_name || '') + ' ' + (data.last_name || '')).trim();

    targetSheet.appendRow([
      timestamp.toLocaleDateString('de-CH'),
      timestamp.toLocaleTimeString('de-CH'),
      fullName   || 'Not Provided',
      data.city  || data.address || 'Not Provided',
      data.whatsapp || data.phone || 'Not Provided',
      data.email || 'Not Provided',
      data.role       || 'N/A',
      data.dance_role || 'N/A',
      'Pending'
    ]);

    if (data.email) sendConfirmationEmail(data.email, fullName, data);
    sendAdminNotification(fullName, data, timestamp);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', name: fullName }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function sendConfirmationEmail(email, fullName, data) {
  var subject = 'Registration Confirmed - ' + LAB_NAME;
  var html =
    '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">' +
    '<div style="background:linear-gradient(135deg,#D6001C,#8B0000);color:#fff;padding:36px;text-align:center;border-radius:12px 12px 0 0">' +
    '<h1 style="margin:0;font-size:26px">Registration Confirmed!</h1>' +
    '<p style="margin:8px 0 0;opacity:.9">Men Style Lab</p></div>' +
    '<div style="padding:32px;background:#fff">' +
    '<h2 style="color:#D6001C;margin-top:0">Welcome, ' + fullName + '!</h2>' +
    '<p>Thank you for registering for the <strong>' + LAB_NAME + '</strong>. We are excited to have you join us!</p>' +
    '<div style="background:#f9f9f9;border-left:4px solid #D6001C;padding:16px;margin:20px 0;border-radius:4px">' +
    '<p style="margin:6px 0"><strong>Email:</strong> ' + (data.email || '') + '</p>' +
    '<p style="margin:6px 0"><strong>WhatsApp:</strong> ' + (data.whatsapp || '') + '</p>' +
    '<p style="margin:6px 0"><strong>City:</strong> ' + (data.city || '') + '</p>' +
    '<p style="margin:6px 0"><strong>Role:</strong> ' + (data.role || '') + ' | ' + (data.dance_role || '') + '</p>' +
    '</div>' +
    '<h3>Next Steps</h3><ol>' +
    '<li>Complete your payment via the link you received</li>' +
    '<li>You will receive a payment confirmation</li>' +
    '<li>We will send all details closer to the event</li>' +
    '</ol>' +
    '<p>Questions? Reply to this email or reach us on WhatsApp.</p>' +
    '<p style="margin-top:28px">See you on the dance floor!</p>' +
    '<p><strong>The MasteryLab Team</strong></p></div>' +
    '<div style="background:#050505;color:#666;text-align:center;padding:20px;font-size:12px;border-radius:0 0 12px 12px">' +
    '<p>2025 MasteryLab. Automated confirmation.</p></div></div>';

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: html,
    body: 'Hi ' + fullName + ',\n\nRegistration confirmed for ' + LAB_NAME + '!\n\nThe MasteryLab Team',
    name: 'MasteryLab'
  });
}

function sendAdminNotification(fullName, data, timestamp) {
  var subject = 'New Men Style Lab Registration - ' + fullName;
  var body =
    'NEW REGISTRATION - ' + LAB_NAME + '\n\n' +
    'Date/Time : ' + timestamp.toLocaleString('de-CH') + '\n' +
    'Full Name : ' + fullName + '\n' +
    'Email     : ' + (data.email || '') + '\n' +
    'WhatsApp  : ' + (data.whatsapp || '') + '\n' +
    'City      : ' + (data.city || '') + '\n' +
    'Role      : ' + (data.role || '') + ' | ' + (data.dance_role || '') + '\n\n' +
    'View sheet: https://docs.google.com/spreadsheets/d/' + SHEET_ID;

  ADMIN_EMAILS.forEach(function(adminEmail) {
    MailApp.sendEmail({ to: adminEmail, subject: subject, body: body, name: 'MasteryLab Registrations' });
  });
}
