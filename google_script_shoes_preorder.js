// PANAMIO SHOE PRE-ORDER AUTOMATION SCRIPT
// 1. Paste this into Apps Script (Extensions > Apps Script in your Google Sheet)
// 2. Click "Save"
// 3. Select "initialSetup" from the top dropdown and click "Run" (Important for permissions!)
// 4. Click "Deploy" -> "New Deployment" -> "Web App" (Execute as: Me, Access: Anyone)
// 5. Copy the generated Web App URL and set it as your form action or fetch endpoint.

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Wait up to 10 seconds for other processes to release lock

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = e.parameter || {};

    // Fallback if data is sent as JSON in the body or Content-Type is text/plain but body is JSON
    if (e.postData && e.postData.contents) {
      try {
        var jsonBody = JSON.parse(e.postData.contents);
        for (var key in jsonBody) {
          data[key] = jsonBody[key];
        }
      } catch (jsonErr) {
        // Stick with parameters if parsing fails
      }
    }

    // --- CONFIGURATION ---
    var adminEmail = 'labmastery@outlook.com';
    var sheetName = 'Shoe_Preorders';
    var shoeModel = data.shoeModel || 'Panda Low';
    var shoeSize = data.shoeSize || 'N/A';
    var quantity = parseInt(data.quantity || '1', 10);
    var basePrice = 100.00; // Flat retail price for Pana Mio (CHF)
    var discountedUnitPrice = 100.00; // Special Pre-Order Price
    var subtotal = discountedUnitPrice * quantity;

    // --- SHEET HANDLING ---
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow([
        'Date', 
        'Time', 
        'Full Name', 
        'Email', 
        'WhatsApp', 
        'City', 
        'Shoe Model', 
        'Size', 
        'Quantity', 
        'Total (CHF)', 
        'Status'
      ]);
      sheet.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#f3f3f3').setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }

    var timestamp = new Date();
    var fullName = ((data.first_name || data.firstName || '') + " " + (data.last_name || data.lastName || '')).trim() || 'Anonymous Dancer';
    var contact = data.whatsapp || data.phone || 'Not Provided';
    var city = data.city || 'Not Provided';
    var email = data.email || '';

    // Append Order Row to Spreadsheet
    sheet.appendRow([
      Utilities.formatDate(timestamp, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd"),
      Utilities.formatDate(timestamp, ss.getSpreadsheetTimeZone(), "HH:mm:ss"),
      fullName,
      email || 'No Email',
      contact,
      city,
      shoeModel,
      shoeSize,
      quantity,
      subtotal.toFixed(2),
      'Pending Confirmation'
    ]);

    // --- NOTIFICATIONS ---

    // 1. Admin Email Notification
    MailApp.sendEmail({
      to: adminEmail,
      subject: '👟 New Shoe Pre-Order: ' + shoeModel + ' (Size ' + shoeSize + ')',
      body: 'You received a new shoe pre-order!\n\n' +
        'Name: ' + fullName + '\n' +
        'Email: ' + (email || 'No Email') + '\n' +
        'WhatsApp: ' + contact + '\n' +
        'City: ' + city + '\n\n' +
        '--- Order Details ---\n' +
        'Model: ' + shoeModel + '\n' +
        'Size: ' + shoeSize + '\n' +
        'Quantity: ' + quantity + '\n' +
        'Total Price: ' + subtotal.toFixed(2) + ' CHF (Pre-Order Promo Discount Applied)\n\n' +
        'View Google Sheet Database: ' + ss.getUrl()
    });

    // 2. Customer HTML Confirmation Email
    if (email && email.includes('@')) {
      MailApp.sendEmail({
        to: email,
        subject: '👟 Pre-Order Confirmed - Panamio ' + shoeModel + ' | MasteryLab',
        htmlBody: generateShoeEmailHtml(fullName, shoeModel, shoeSize, quantity, subtotal),
        name: 'MasteryLab'
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success", "sheet": sheetName }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // Log error to Error_Logs tab
    try {
      var errSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Error_Logs') || SpreadsheetApp.getActiveSpreadsheet().insertSheet('Error_Logs');
      errSheet.appendRow([new Date(), 'Shoes Pre-order Error: ' + err.toString()]);
    } catch (e) { }

    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// --- HELPERS ---

function initialSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('Shoe Pre-order Setup complete. Authorized for: ' + ss.getName());
}

function generateShoeEmailHtml(name, model, size, qty, total) {
  var modelColor = "#D6001C"; // MasteryLab signature red
  
  return '<div style="font-family: \'Outfit\', sans-serif, Arial; max-width: 600px; border: 1px solid #1a1a24; background-color: #ffffff; color: #111111; margin: 0 auto; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">' +
    '<div style="background: #050505; color: white; padding: 30px; text-align: center; border-bottom: 3px solid ' + modelColor + ';">' +
    '<img alt="MasteryLab" src="https://lh3.googleusercontent.com/d/1Pql2BUqT-V_2HWOdRPB-R57z88hRZa1k07I-dcNY_bI" style="height: 45px; margin-bottom: 10px; display: inline-block;">' +
    '<h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px;">PRE-ORDER CONFIRMED!</h1>' +
    '<p style="margin: 5px 0 0 0; color: #a0a0a0; font-size: 14px;">Your Panamio Dance Shoes are reserved</p>' +
    '</div>' +
    '<div style="padding: 30px; line-height: 1.6;">' +
    '<p style="font-size: 16px;">Hi <strong>' + name + '</strong>,</p>' +
    '<p>Thank you for pre-ordering your premium **Panamio Dance Shoes** through the MasteryLab collection. Your custom order is now secured at our special promotional price!</p>' +
    
    '<div style="background: #f7f8fa; padding: 20px; border-left: 4px solid ' + modelColor + '; margin: 25px 0; border-radius: 4px;">' +
    '<h3 style="margin-top: 0; color: #000000; font-size: 16px; border-bottom: 1px solid #e1e4e8; padding-bottom: 8px;">Order Details</h3>' +
    '<p style="margin: 6px 0;"><strong>👟 Model:</strong> Panamio ' + model + '</p>' +
    '<p style="margin: 6px 0;"><strong>📏 Size:</strong> EU ' + size + '</p>' +
    '<p style="margin: 6px 0;"><strong>🔢 Quantity:</strong> ' + qty + '</p>' +
    '<p style="margin: 6px 0; font-size: 16px; color: ' + modelColor + ';"><strong>💰 Price:</strong> <strong>' + total.toFixed(2) + ' CHF</strong> <span style="font-size: 12px; color: #777;">(Special Pre-Order Discount Applied!)</span></p>' +
    '</div>' +
    
    '<h3 style="color: #000000; font-size: 16px; margin-top: 25px;">Next Steps:</h3>' +
    '<ol style="padding-left: 20px; margin-bottom: 25px;">' +
    '<li style="margin-bottom: 8px;">Our team will verify your pre-order details in our system database.</li>' +
    '<li style="margin-bottom: 8px;">You will receive a WhatsApp message or Email with a direct Stripe / Twint payment link to finalize the pre-order payment.</li>' +
    '<li style="margin-bottom: 8px;">Your custom shoes will be prepared for delivery or direct pickup at the next MasteryLab workshop!</li>' +
    '</ol>' +
    
    '<p style="margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 20px; text-align: center; color: #777777; font-size: 14px;">' +
    'If you have any questions, feel free to reply directly to this email or WhatsApp us.' +
    '</p>' +
    '<p style="text-align: center; margin-top: 15px; font-weight: 700;">See you on the dance floor!</p>' +
    '<p style="text-align: center; color: ' + modelColor + '; font-weight: 700; margin: 0;">The MasteryLab Team</p>' +
    '</div>' +
    '</div>';
}
