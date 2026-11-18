/*
  Pana Mio Shoes Order Handler (Google Apps Script)
  Connects to Google Sheet: https://docs.google.com/spreadsheets/d/1KhMJRIh6fVAv9Uc4W6KIwto9JPZ0tt7t
  Features:
  - Appends order data directly to Google Sheet
  - Auto-initializes formatted headers if sheet is blank
  - Supports TWINT, Bank Transfer & Card payment methods
  - Sends instant email notification to Admins
  - Sends order confirmation email with TWINT instructions to customer
*/

var SPREADSHEET_ID = '1KhMJRIh6fVAv9Uc4W6KIwto9JPZ0tt7t';
var ADMIN_EMAILS = ['masterylab1.0@gmail.com', 'labmastery@outlook.com'];

function getTargetSheet() {
  try {
    if (SPREADSHEET_ID && SPREADSHEET_ID.length > 10) {
      return SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    }
  } catch (e) {
    Logger.log("Falling back to active spreadsheet: " + e.toString());
  }
  return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
}

function initHeadersIfEmpty(sheet) {
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Timestamp",
      "Order ID",
      "Full Name",
      "Email",
      "WhatsApp",
      "Shoe Model",
      "Size (EU)",
      "Qty",
      "Unit Price (CHF)",
      "Total Price (CHF)",
      "Payment Method",
      "Address",
      "City",
      "Zip Code",
      "Country",
      "Notes",
      "Status"
    ];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#1a1a24");
    headerRange.setFontColor("#ff2a5f");
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var sheet = getTargetSheet();
    initHeadersIfEmpty(sheet);
    
    var data = null;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }
    
    if (!data) {
      return ContentService.createTextOutput(JSON.stringify({ "result": "error", "reason": "No data received" }))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    var timestamp = new Date();
    var orderId = "PM-" + Math.floor(timestamp.getTime() / 1000).toString().substring(4);
    
    var fullName = data.fullName || (data.firstName + " " + data.lastName) || "Customer";
    var email = (data.email || "").trim();
    var whatsapp = data.whatsapp || "";
    var shoeModel = data.shoeModel || "Panda Edition";
    var size = data.size || "";
    var qty = parseInt(data.qty || 1, 10);
    var unitPrice = 100.00; // 100 CHF retail special
    var totalPrice = qty * unitPrice;
    var paymentMethod = data.paymentMethod || "TWINT 🇨🇭";
    
    var address = data.address || "";
    var city = data.city || "";
    var zipCode = data.zipCode || "";
    var country = data.country || "Switzerland";
    var notes = data.notes || "";
    var status = "⏳ PENDING PAYMENT";
    
    // Append row to Google Sheet
    sheet.appendRow([
      timestamp,
      orderId,
      fullName,
      email,
      whatsapp,
      shoeModel,
      size,
      qty,
      unitPrice + " CHF",
      totalPrice + " CHF",
      paymentMethod,
      address,
      city,
      zipCode,
      country,
      notes,
      status
    ]);
    
    // Format pricing columns
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 9).setNumberFormat('#,##0.00 "CHF"');
    sheet.getRange(lastRow, 10).setNumberFormat('#,##0.00 "CHF"');
    
    // 1. Send Admin Email Notification
    var adminSubject = "👟 New Shoe Order [" + orderId + "] - " + shoeModel + " (" + totalPrice + " CHF) | " + fullName;
    var adminBody = "🎉 A new Pana Mio shoe order was placed on MasteryLab!\n\n" +
                    "ORDER DETAILS:\n" +
                    "--------------------------------------------------\n" +
                    "Order ID: " + orderId + "\n" +
                    "Model: " + shoeModel + "\n" +
                    "Size: EU " + size + "\n" +
                    "Quantity: " + qty + "\n" +
                    "Total: " + totalPrice.toFixed(2) + " CHF\n" +
                    "Payment Method: " + paymentMethod + "\n\n" +
                    "CUSTOMER CONTACT:\n" +
                    "--------------------------------------------------\n" +
                    "Name: " + fullName + "\n" +
                    "Email: " + email + "\n" +
                    "WhatsApp: " + whatsapp + "\n\n" +
                    "SHIPPING ADDRESS:\n" +
                    "--------------------------------------------------\n" +
                    address + "\n" +
                    zipCode + " " + city + "\n" +
                    country + "\n\n" +
                    "Notes: " + (notes ? notes : "None") + "\n\n" +
                    "Google Sheet: https://docs.google.com/spreadsheets/d/" + SPREADSHEET_ID;
                    
    ADMIN_EMAILS.forEach(function(adminEmail) {
      try {
        MailApp.sendEmail(adminEmail, adminSubject, adminBody);
      } catch (err) {
        Logger.log("Admin email error: " + err.toString());
      }
    });
    
    // 2. Send Customer Confirmation Email (if valid email provided)
    if (email && email.indexOf("@") > 0) {
      try {
        var customerSubject = "👟 Order Received: Pana Mio " + shoeModel + " [" + orderId + "] | MasteryLab";
        var customerBody = "Hi " + fullName + ",\n\n" +
                           "Thank you for ordering your Pana Mio Dance Shoes with MasteryLab!\n\n" +
                           "YOUR ORDER SUMMARY:\n" +
                           "--------------------------------------------------\n" +
                           "Order ID: " + orderId + "\n" +
                           "Shoe Model: " + shoeModel + "\n" +
                           "Size: EU " + size + "\n" +
                           "Quantity: " + qty + "\n" +
                           "Total Amount: " + totalPrice.toFixed(2) + " CHF\n" +
                           "Payment Method: " + paymentMethod + "\n\n" +
                           (paymentMethod.indexOf("TWINT") !== -1 ? 
                           "📲 TWINT PAYMENT INSTRUCTIONS:\n" +
                           "--------------------------------------------------\n" +
                           "Please send " + totalPrice.toFixed(2) + " CHF via TWINT using our link or app:\n" +
                           "https://go.twint.ch/1/e/tw?tw=acq.GQ4DcpYaS4SHNwL1x4kiZ0rPxdE1493urtldIW4gEM69VxgU6LzF9DpIJUFtzh36\n" +
                           "Include your Order ID: " + orderId + " in the message.\n\n" : 
                           "🏦 BANK TRANSFER INSTRUCTIONS:\n" +
                           "--------------------------------------------------\n" +
                           "IBAN: CH04 0027 8278 1399 6040 T\n" +
                           "Amount: " + totalPrice.toFixed(2) + " CHF\n" +
                           "Payment Reference: " + orderId + " (" + fullName + ")\n\n") +
                           "SHIPPING TO:\n" +
                           "--------------------------------------------------\n" +
                           address + ", " + zipCode + " " + city + ", " + country + "\n\n" +
                           "Best regards,\n" +
                           "MasteryLab Team\n" +
                           "labmastery@outlook.com";
                           
        MailApp.sendEmail(email, customerSubject, customerBody);
      } catch (custErr) {
        Logger.log("Customer email error: " + custErr.toString());
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      "result": "success", 
      "orderId": orderId,
      "totalPrice": totalPrice,
      "currency": "CHF"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      "result": "error", 
      "error": error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
