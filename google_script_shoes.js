/*
  Pana Mio Shoes Order Handler
  Handles POST requests from order-panamio.html,
  appends order data to the active sheet in Google Drive,
  and sends an order notification email to the admin.
*/

// Set your Admin Email addresses here
var ADMIN_EMAILS = ['masterylab1.0@gmail.com', 'labmastery@outlook.com'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 10 seconds for other processes to finish before locking
  lock.tryLock(10000);
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = null;
    
    // Parse JSON request
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
    
    // Generate a unique Order ID based on the timestamp
    var orderId = "SO-" + Math.floor(timestamp.getTime() / 1000).toString().substring(4);
    
    var fullName = data.fullName || (data.firstName + " " + data.lastName);
    var email = data.email || "";
    var whatsapp = data.whatsapp || "";
    var shoeModel = "Pana mio";
    var size = data.size || "";
    var qty = parseInt(data.qty || 1);
    var unitPrice = 99.00; // Flat retail price for Pana Mio
    var totalPrice = qty * unitPrice;
    
    var address = data.address || "";
    var city = data.city || "";
    var zipCode = data.zipCode || "";
    var country = data.country || "";
    var notes = data.notes || "";
    var status = "⏳ PENDING";
    
    // Full Address String
    var fullAddress = address + ", " + zipCode + " " + city + ", " + country;
    
    // Append the row to Google Sheet
    // Headers: Timestamp, Order ID, Full Name, Email, WhatsApp, Shoe Model, Size, Qty, Unit Price, Total Price, Shipping Address, Notes, Status
    sheet.appendRow([
      timestamp,
      orderId,
      fullName,
      email,
      whatsapp,
      shoeModel,
      size,
      qty,
      unitPrice,
      totalPrice,
      fullAddress,
      notes,
      status
    ]);
    
    // Format the newly appended total price column as currency
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 9).setNumberFormat("$#,##0.00");  // Unit Price
    sheet.getRange(lastRow, 10).setNumberFormat("$#,##0.00"); // Total Price
    
    // Send automated email notification to admins
    var subject = "👟 New Pana Mio Shoe Order [" + orderId + "]: " + fullName;
    var body = "You have a new order for Pana Mio Dance Shoes!\n\n" +
               "Order Details:\n" +
               "----------------------------------------------\n" +
               "Order ID: " + orderId + "\n" +
               "Customer Name: " + fullName + "\n" +
               "Email: " + email + "\n" +
               "WhatsApp: " + whatsapp + "\n" +
               "Shoe Model: " + shoeModel + "\n" +
               "Size: " + size + "\n" +
               "Quantity: " + qty + "\n" +
               "Total Price: $" + totalPrice.toFixed(2) + "\n\n" +
               "Shipping Address:\n" +
               "----------------------------------------------\n" +
               fullName + "\n" +
               address + "\n" +
               zipCode + " " + city + "\n" +
               country + "\n\n" +
               "Additional Notes:\n" +
               "----------------------------------------------\n" +
               (notes ? notes : "None") + "\n\n" +
               "This order has been recorded in your Google Sheet.";
               
    ADMIN_EMAILS.forEach(function(recipient) {
      try {
        MailApp.sendEmail(recipient, subject, body);
      } catch(emailErr) {
        // Log email errors but do not block success output
        Logger.log("Email error: " + emailErr.toString());
      }
    });
    
    return ContentService.createTextOutput(JSON.stringify({ 
      "result": "success", 
      "orderId": orderId,
      "totalPrice": totalPrice 
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
