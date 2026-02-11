// ROBUST REGISTRATION SCRIPT V2
// 1. Paste this into Apps Script
// 2. Click "Save"
// 3. Select "initialSetup" from the top dropdown and click "Run" (Important for permissions!)
// 4. Click "Deploy" -> "New Deployment" -> "Web App" (Execute as: Me, Access: Anyone)

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Wait up to 10 seconds for other processes to finish

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = e.parameter;
    
    // Fallback if data is sent as JSON in the body
    if (!data || Object.keys(data).length === 0) {
      if (e.postData && e.postData.contents) {
        data = JSON.parse(e.postData.contents);
      }
    }

    // --- CONFIGURATION ---
    var adminEmail = 'labmastery@outlook.com';
    var sheetName = 'MasteryLab_General';
    var labName = 'MasteryLab Event';
    
    // --- ROUTING LOGIC ---
    // Michael & Mayra
    if (data.type === 'MM') {
      sheetName = 'M&M';
      labName = 'Michael & Mayra Intensive';
    } 
    // Dance Booster (Ismael & Irene)
    else if (data.sheetName === 'Dance Booster' || data.type === 'Booster') {
      sheetName = 'Dance Booster';
      labName = 'Dance Booster Lab - Ismael & Irene';
    }
    // Bachata Labs (Dancers/Teachers)
    else if (data.track) {
      var trackPrefix = data.track.charAt(0).toUpperCase() + data.track.slice(1); // "Teachers" or "Dancers"
      var levelName = "";
      
      if (data.track === 'teachers') {
        if (data.level === 'silver') levelName = 'Perfect Start';
        else if (data.level === 'bronze') levelName = 'Almost There';
        else if (data.level === 'gold') levelName = 'All In';
        sheetName = 'Teachers ' + levelName;
        labName = 'Bachata Teachers Lab - ' + levelName;
      } else if (data.track === 'dancers') {
        levelName = data.level ? (data.level.charAt(0).toUpperCase() + data.level.slice(1)) : 'General';
        sheetName = 'Dancers ' + levelName;
        labName = 'Bachata Dancers Lab - ' + levelName;
      }
    }

    // --- SHEET HANDLING ---
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(['Date', 'Time', 'Full Name', 'Address/City', 'Phone', 'Email', 'Role', 'Status']);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#f3f3f3');
    }

    var timestamp = new Date();
    var fullName = (data.first_name || '') + " " + (data.last_name || '');
    var contact = data.whatsapp || data.phone || 'Not Provided';
    var location = data.address || data.city || 'Not Provided';
    var email = data.email || 'No Email';
    var role = data.role || 'N/A';

    // Append to Sheet
    sheet.appendRow([
      Utilities.formatDate(timestamp, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd"),
      Utilities.formatDate(timestamp, ss.getSpreadsheetTimeZone(), "HH:mm:ss"),
      fullName.trim(),
      location,
      contact,
      email,
      role,
      'Pending'
    ]);

    // --- NOTIFICATIONS ---
    
    // 1. Admin Notification
    MailApp.sendEmail({
      to: adminEmail,
      subject: '🎉 New Registration: ' + labName,
      body: 'New registration received!\n\n' +
            'Name: ' + fullName + '\n' +
            'Email: ' + email + '\n' +
            'Phone: ' + contact + '\n' +
            'Location: ' + location + '\n' +
            'Lab: ' + labName + '\n\n' +
            'View Sheet: ' + ss.getUrl()
    });

    // 2. Client Confirmation (HTML)
    if (email !== 'No Email' && email.includes('@')) {
      MailApp.sendEmail({
        to: email,
        subject: '✅ Registration Confirmed - ' + labName,
        htmlBody: generateEmailHtml(fullName, labName, email, contact, location),
        name: 'MasteryLab'
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success", "sheet": sheetName }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // Log error to a specific sheet for easy debugging
    try {
      var errSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Error_Logs') || SpreadsheetApp.getActiveSpreadsheet().insertSheet('Error_Logs');
      errSheet.appendRow([new Date(), err.toString()]);
    } catch(e) {}
    
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// --- HELPERS ---

function initialSetup() {
  // Run this function once manually to authorize permissions for Sheets and Email
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('Setup complete. Script authorized for: ' + ss.getName());
}

function generateEmailHtml(name, lab, email, phone, loc) {
  return '<div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee;">' +
         '<div style="background: #D6001C; color: white; padding: 20px; text-align: center;">' +
         '<h1>Registration Confirmed!</h1>' +
         '</div>' +
         '<div style="padding: 20px;">' +
         '<p>Hi <strong>' + name + '</strong>,</p>' +
         '<p>We have received your registration for <strong>' + lab + '</strong>. We are thrilled to have you!</p>' +
         '<div style="background: #fdfdfd; padding: 15px; border-left: 4px solid #D6001C; margin: 20px 0;">' +
         '<p><strong>📧 Email:</strong> ' + email + '</p>' +
         '<p><strong>📱 WhatsApp:</strong> ' + phone + '</p>' +
         '<p><strong>📍 Location:</strong> ' + loc + '</p>' +
         '</div>' +
         '<h3>Next Steps:</h3>' +
         '<ul>' +
         '<li>Complete your payment (if you haven\'t already).</li>' +
         '<li>Watch your inbox for more details as we get closer to the date.</li>' +
         '</ul>' +
         '<p style="margin-top: 30px;">See you soon!</p>' +
         '<p><strong>The MasteryLab Team</strong></p>' +
         '</div>' +
         '</div>';
}
