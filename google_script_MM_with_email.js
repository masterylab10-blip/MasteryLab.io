// ============================================
// MasteryLab — Unified Registration + Stripe Webhook Script
// Paste this into your Apps Script project linked to the MaychealMayra Registrations spreadsheet
// ============================================

function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        // Check if this is a Stripe webhook event (JSON body)
        var postData = e.postData;
        if (postData && postData.type === 'application/json') {
            return handleStripeWebhook(JSON.parse(postData.contents));
        }

        // Otherwise it's a registration form submission
        return handleRegistration(e.parameter);

    } catch (err) {
        return ContentService
            .createTextOutput(JSON.stringify({ "result": "error", "error": err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

// ============================================
// PART 1: HANDLE FORM REGISTRATION
// ============================================

function handleRegistration(data) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = data.type === 'MM' ? 'M&M' : 'BSL';
    var targetSheet = sheet.getSheetByName(sheetName);

    if (!targetSheet) {
        targetSheet = sheet.insertSheet(sheetName);
        targetSheet.appendRow(['Date', 'Time', 'Full Name', 'City', 'Phone', 'Email', 'Role', 'Status', 'Amount', 'Payment Time']);
    }

    var timestamp = new Date();
    var fullName = data.first_name + " " + data.last_name;

    targetSheet.appendRow([
        timestamp.toLocaleDateString(),
        timestamp.toLocaleTimeString(),
        fullName,
        data.city || 'Not Provided',
        data.whatsapp || 'Not Provided',
        data.email,
        data.role || 'N/A',
        'Pending'
    ]);

    // Email to YOU (admin) — registration received
    MailApp.sendEmail({
        to: 'labmastery@outlook.com',
        subject: '📋 New Registration: ' + fullName + ' (' + sheetName + ')',
        htmlBody: '<div style="font-family: Arial; max-width: 600px;">' +
            '<h2 style="color: #D6001C;">New Registration - ' + sheetName + '</h2>' +
            '<p><strong>Name:</strong> ' + fullName + '</p>' +
            '<p><strong>Email:</strong> ' + data.email + '</p>' +
            '<p><strong>City:</strong> ' + (data.city || 'N/A') + '</p>' +
            '<p><strong>Role:</strong> ' + (data.role || 'N/A') + '</p>' +
            '<p><strong>WhatsApp:</strong> ' + (data.whatsapp || 'N/A') + '</p>' +
            '<p style="color: orange;">⏳ Status: Pending Payment</p>' +
            '</div>'
    });

    return ContentService
        .createTextOutput(JSON.stringify({ "result": "success" }))
        .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// PART 2: HANDLE STRIPE WEBHOOK
// ============================================

function handleStripeWebhook(event) {
    // Only process successful payments
    if (event.type !== 'checkout.session.completed') {
        return ContentService
            .createTextOutput(JSON.stringify({ "received": true }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    var session = event.data.object;
    var customerEmail = (session.customer_details && session.customer_details.email) || session.customer_email;
    var customerName = (session.customer_details && session.customer_details.name) || 'Valued Customer';
    var amountPaid = (session.amount_total / 100).toFixed(2);
    var currency = (session.currency || 'chf').toUpperCase();

    if (!customerEmail) {
        return ContentService
            .createTextOutput(JSON.stringify({ "error": "No email found" }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    // Search ALL sheets for this email and update status
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = spreadsheet.getSheets();
    var found = false;
    var sheetName = '';

    for (var s = 0; s < sheets.length; s++) {
        var sheet = sheets[s];
        var data = sheet.getDataRange().getValues();

        for (var i = data.length - 1; i >= 1; i--) { // Search from bottom (newest first)
            var rowEmail = data[i][5]; // Column F = Email (index 5)
            var rowStatus = data[i][7]; // Column H = Status (index 7)

            if (rowEmail && rowEmail.toString().toLowerCase() === customerEmail.toLowerCase()
                && rowStatus === 'Pending') {
                // ✅ Found matching registration — update to Paid!
                sheet.getRange(i + 1, 8).setValue('✅ Paid');
                sheet.getRange(i + 1, 9).setValue(currency + ' ' + amountPaid);
                sheet.getRange(i + 1, 10).setValue(new Date().toLocaleString());
                found = true;
                sheetName = sheet.getName();
                customerName = data[i][2] || customerName; // Use name from sheet
                break;
            }
        }
        if (found) break;
    }

    // ================================================
    // 📧 SEND CONFIRMATION EMAILS (only after payment)
    // ================================================

    if (found) {
        // Email to YOU (admin) — payment confirmed
        MailApp.sendEmail({
            to: 'labmastery@outlook.com',
            subject: '💰 Payment Confirmed: ' + customerName + ' (' + sheetName + ')',
            htmlBody: '<div style="font-family: Arial; max-width: 600px;">' +
                '<h2 style="color: #4CAF50;">✅ Payment Confirmed!</h2>' +
                '<p><strong>Event:</strong> ' + sheetName + '</p>' +
                '<p><strong>Name:</strong> ' + customerName + '</p>' +
                '<p><strong>Email:</strong> ' + customerEmail + '</p>' +
                '<p><strong>Amount:</strong> ' + currency + ' ' + amountPaid + '</p>' +
                '<p style="color: #4CAF50; font-weight: bold;">Status: PAID ✅</p>' +
                '</div>'
        });

        // Email to CUSTOMER — booking confirmation
        MailApp.sendEmail({
            to: customerEmail,
            subject: '🎉 MasteryLab - Payment Confirmed!',
            htmlBody: '<div style="font-family: Arial; max-width: 600px; background: #0a0a0a; color: #fff; padding: 40px; border-radius: 12px;">' +
                '<h1 style="color: #D6001C; font-size: 28px;">MasteryLab</h1>' +
                '<h2 style="color: #4CAF50;">Payment Confirmed ✅</h2>' +
                '<hr style="border: 1px solid #333;">' +
                '<p style="font-size: 16px;">Hi <strong>' + customerName.split(' ')[0] + '</strong>,</p>' +
                '<p style="font-size: 16px;">Your payment of <strong>' + currency + ' ' + amountPaid + '</strong> has been received!</p>' +
                '<p style="font-size: 16px;">Your spot for <strong>' + sheetName + '</strong> is now confirmed. 🎟️</p>' +
                '<hr style="border: 1px solid #333;">' +
                '<p style="color: #888;">We will send you more details closer to the event date.</p>' +
                '<p style="color: #888;">Questions? Reply to this email or reach us on WhatsApp.</p>' +
                '<p style="color: #666; margin-top: 30px;">© 2026 MasteryLab. All rights reserved.</p>' +
                '</div>'
        });
    }

    return ContentService
        .createTextOutput(JSON.stringify({ "received": true, "found": found }))
        .setMimeType(ContentService.MimeType.JSON);
}
