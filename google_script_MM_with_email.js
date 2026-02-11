// Google Apps Script for M&M Registration
// WITH email notifications to admin + customer
// Paste this into your Apps Script project linked to the MaychealMayra Registrations spreadsheet

function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet();
        var data = e.parameter;

        var sheetName = 'M&M';
        var targetSheet = sheet.getSheetByName(sheetName);

        // If sheet doesn't exist, create it and add headers
        if (!targetSheet) {
            targetSheet = sheet.insertSheet(sheetName);
            targetSheet.appendRow(['Date', 'Time', 'Full Name', 'City', 'Phone', 'Email', 'Role', 'Status']);
        }

        var timestamp = new Date();
        var fullName = data.first_name + " " + data.last_name;

        // Save to spreadsheet
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

        // --- EMAIL TO YOU (ADMIN) ---
        MailApp.sendEmail({
            to: 'labmastery@outlook.com',
            subject: '🎟️ New M&M Registration: ' + fullName,
            htmlBody: '<div style="font-family: Arial, sans-serif; max-width: 600px;">' +
                '<h2 style="color: #D6001C;">New Registration - Michael & Mayra Intensive</h2>' +
                '<table style="width: 100%; border-collapse: collapse;">' +
                '<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Name</td><td style="padding: 8px; border-bottom: 1px solid #eee;">' + fullName + '</td></tr>' +
                '<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email</td><td style="padding: 8px; border-bottom: 1px solid #eee;">' + data.email + '</td></tr>' +
                '<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">City</td><td style="padding: 8px; border-bottom: 1px solid #eee;">' + (data.city || 'N/A') + '</td></tr>' +
                '<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Role</td><td style="padding: 8px; border-bottom: 1px solid #eee;">' + (data.role || 'N/A') + '</td></tr>' +
                '<tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">WhatsApp</td><td style="padding: 8px; border-bottom: 1px solid #eee;">' + (data.whatsapp || 'N/A') + '</td></tr>' +
                '<tr><td style="padding: 8px; font-weight: bold;">Status</td><td style="padding: 8px; color: orange;">⏳ Pending Payment</td></tr>' +
                '</table>' +
                '<p style="color: #888; margin-top: 20px;">Check your spreadsheet for the full list.</p>' +
                '</div>'
        });

        // --- CONFIRMATION EMAIL TO CUSTOMER ---
        MailApp.sendEmail({
            to: data.email,
            subject: 'MasteryLab - Registration Received! 🎉',
            htmlBody: '<div style="font-family: Arial, sans-serif; max-width: 600px; background: #0a0a0a; color: #fff; padding: 40px; border-radius: 12px;">' +
                '<h1 style="color: #D6001C; font-size: 28px; margin-bottom: 5px;">MasteryLab</h1>' +
                '<h2 style="color: #fff; margin-top: 0;">Michael & Mayra Intensive - Basel 2026</h2>' +
                '<hr style="border: 1px solid #333; margin: 20px 0;">' +
                '<p style="font-size: 16px;">Hi <strong>' + data.first_name + '</strong>,</p>' +
                '<p style="font-size: 16px; line-height: 1.6;">Thank you for registering for the <strong>Bachata Technique Lab</strong> with Michael & Mayra!</p>' +
                '<p style="font-size: 16px; line-height: 1.6;">Please complete your payment via Stripe to secure your spot. If you have not been redirected to the payment page, please contact us.</p>' +
                '<hr style="border: 1px solid #333; margin: 20px 0;">' +
                '<p style="font-size: 14px; color: #888;">📅 23-24 May 2026 | 📍 Basel, Switzerland</p>' +
                '<p style="font-size: 14px; color: #888;">Questions? Reply to this email or reach us on WhatsApp.</p>' +
                '<p style="font-size: 14px; color: #666; margin-top: 30px;">© 2026 MasteryLab. All rights reserved.</p>' +
                '</div>'
        });

        return ContentService
            .createTextOutput(JSON.stringify({ "result": "success", "sheet": sheetName }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (e) {
        return ContentService
            .createTextOutput(JSON.stringify({ "result": "error", "error": e.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}
