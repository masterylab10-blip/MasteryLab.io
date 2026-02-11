// SIMPLE EMAIL CONFIRMATION SCRIPT
// Just copy this entire code and paste it into your Google Apps Script

function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet();
        var data = e.parameter;

        // Figure out which sheet to use
        var sheetName = data.sheetName || 'Sheet1';
        var labName = 'MasteryLab';

        if (data.track === 'teachers') {
            if (data.level === 'silver') {
                sheetName = 'Teachers Perfect Start';
                labName = 'Bachata Teachers Lab - Perfect Start';
            }
            else if (data.level === 'bronze') {
                sheetName = 'Teachers Almost There';
                labName = 'Bachata Teachers Lab - Almost There';
            }
            else if (data.level === 'gold') {
                sheetName = 'Teachers All In';
                labName = 'Bachata Teachers Lab - All In';
            }
        }
        else if (data.track === 'dancers') {
            if (data.level === 'silver') {
                sheetName = 'Dancers Silver';
                labName = 'Bachata Dancers Lab - Silver';
            }
            else if (data.level === 'bronze') {
                sheetName = 'Dancers Bronze';
                labName = 'Bachata Dancers Lab - Bronze';
            }
            else if (data.level === 'gold') {
                sheetName = 'Dancers Gold';
                labName = 'Bachata Dancers Lab - Gold';
            }
        }

        if (data.type === 'MM') {
            sheetName = 'M&M';
            labName = 'Michael & Mayra Intensive';
        }

        if (sheetName === 'Dance Booster') {
            labName = 'Dance Booster Lab - Ismael & Irene';
        }

        var targetSheet = sheet.getSheetByName(sheetName);

        if (!targetSheet) {
            targetSheet = sheet.insertSheet(sheetName);
            targetSheet.appendRow(['Date', 'Time', 'Full Name', 'Address', 'Phone', 'Email', 'Role', 'Status']);
        }

        var timestamp = new Date();
        var fullName = data.first_name + " " + data.last_name;

        // Save to Google Sheet
        targetSheet.appendRow([
            timestamp.toLocaleDateString(),
            timestamp.toLocaleTimeString(),
            fullName,
            data.address || data.city || 'Not Provided',
            data.whatsapp || data.phone || 'Not Provided',
            data.email,
            data.role || 'N/A',
            'Pending'
        ]);

        // SEND EMAIL TO YOU (the admin)
        MailApp.sendEmail({
            to: 'labmastery@outlook.com',  // YOUR EMAIL
            subject: '🎉 New Registration: ' + labName,
            body: 'New registration received!\n\n' +
                'Name: ' + fullName + '\n' +
                'Email: ' + data.email + '\n' +
                'Phone: ' + (data.whatsapp || 'Not provided') + '\n' +
                'City: ' + (data.city || data.address || 'Not provided') + '\n' +
                'Role: ' + (data.role || 'N/A') + '\n' +
                'Lab: ' + labName + '\n\n' +
                'Check your Google Sheet for details.'
        });

        // SEND EMAIL TO CLIENT (the person who registered)
        MailApp.sendEmail({
            to: data.email,  // CLIENT'S EMAIL
            subject: '✅ Registration Confirmed - ' + labName,
            htmlBody: '<div style="font-family: Arial; max-width: 600px; margin: 0 auto;">' +
                '<div style="background: linear-gradient(135deg, #FF0033, #D6001C); color: white; padding: 30px; text-align: center;">' +
                '<h1>🎉 Registration Confirmed!</h1>' +
                '</div>' +
                '<div style="padding: 30px; background: white;">' +
                '<h2 style="color: #FF0033;">Welcome to ' + labName + '!</h2>' +
                '<p>Hi <strong>' + fullName + '</strong>,</p>' +
                '<p>Thank you for registering! We\'re excited to have you join us.</p>' +
                '<div style="background: #f9f9f9; border-left: 4px solid #FF0033; padding: 15px; margin: 20px 0;">' +
                '<p><strong>📧 Email:</strong> ' + data.email + '</p>' +
                '<p><strong>📱 WhatsApp:</strong> ' + (data.whatsapp || 'Not provided') + '</p>' +
                '<p><strong>📍 Location:</strong> ' + (data.city || data.address || 'Not provided') + '</p>' +
                '</div>' +
                '<h3>Next Steps:</h3>' +
                '<ol>' +
                '<li>Complete your payment via Stripe</li>' +
                '<li>You\'ll receive a payment confirmation</li>' +
                '<li>We\'ll send you more details closer to the date</li>' +
                '</ol>' +
                '<p style="margin-top: 30px;">See you on the dance floor! 💃🕺</p>' +
                '<p><strong>The MasteryLab Team</strong></p>' +
                '</div>' +
                '<div style="background: #050505; color: #888; text-align: center; padding: 20px; font-size: 12px;">' +
                '<p>© 2025 MasteryLab. All rights reserved.</p>' +
                '</div>' +
                '</div>',
            name: 'MasteryLab'
        });

        return ContentService
            .createTextOutput(JSON.stringify({ "result": "success", "sheet": sheetName }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (e) {
        return ContentService
            .createTextOutput(JSON.stringify({ "result": "error", "error": e }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}
