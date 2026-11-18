// Enhanced Google Apps Script Code for MasteryLab Registration
// This version includes automatic confirmation emails to registrants
// Copy and paste this into your Google Apps Script project

function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet();
        var data = e.parameter;

        // Default sheet name if not specified
        var sheetName = data.sheetName || 'Sheet1';
        var labName = 'MasteryLab'; // Default lab name

        // Mapping logic for Teachers Lab names
        if (data.track === 'teachers') {
            if (data.level === 'silver') {
                sheetName = 'Teachers Perfect Start';
                labName = 'Bachata Sensual Teachers Lab - Perfect Start';
            }
            else if (data.level === 'bronze') {
                sheetName = 'Teachers Almost There';
                labName = 'Bachata Sensual Teachers Lab - Almost There';
            }
            else if (data.level === 'gold') {
                sheetName = 'Teachers All In';
                labName = 'Bachata Sensual Teachers Lab - All In';
            }
        }
        // Mapping logic for Dancers Lab names
        else if (data.track === 'dancers') {
            if (data.level === 'silver') {
                sheetName = 'Dancers Silver';
                labName = 'Bachata Sensual Dancers Lab - Silver';
            }
            else if (data.level === 'bronze') {
                sheetName = 'Dancers Bronze';
                labName = 'Bachata Sensual Dancers Lab - Bronze';
            }
            else if (data.level === 'gold') {
                sheetName = 'Dancers Gold';
                labName = 'Bachata Sensual Dancers Lab - Gold';
            }
        }

        // Fallback for M&M
        if (data.type === 'MM') {
            sheetName = 'M&M';
            labName = 'Michael & Mayra Intensive - Basel 2026';
        }

        // Dance Booster Lab
        if (sheetName === 'Dance Booster') {
            labName = 'Dance Booster Lab with Ismael & Irene';
        }

        var targetSheet = sheet.getSheetByName(sheetName);

        // If sheet doesn't exist, create it and add headers
        if (!targetSheet) {
            targetSheet = sheet.insertSheet(sheetName);
            targetSheet.appendRow(['Date', 'Time', 'Full Name', 'Address', 'Phone', 'Email', 'Role', 'Status']);
        }

        var timestamp = new Date();
        var fullName = data.first_name + " " + data.last_name;

        // Append data to sheet
        targetSheet.appendRow([
            timestamp.toLocaleDateString(),
            timestamp.toLocaleTimeString(),
            fullName,
            data.address || data.city || 'Not Provided',
            data.whatsapp || data.phone || 'Not Provided',
            data.email,
            data.role || 'N/A',
            'Pending' // Initial status
        ]);

        // Send confirmation email to registrant
        sendConfirmationEmail(data.email, fullName, labName, data);

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

function sendConfirmationEmail(email, fullName, labName, data) {
    var subject = "✅ Registration Confirmed - " + labName;

    var htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #FF0033 0%, #D6001C 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 30px; color: #333; }
        .content h2 { color: #FF0033; font-size: 22px; margin-top: 0; }
        .info-box { background: #f9f9f9; border-left: 4px solid #FF0033; padding: 15px; margin: 20px 0; }
        .info-box p { margin: 5px 0; }
        .footer { background: #050505; color: #888; text-align: center; padding: 20px; font-size: 12px; }
        .button { display: inline-block; background: #FF0033; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Registration Confirmed!</h1>
        </div>
        <div class="content">
            <h2>Welcome to ${labName}!</h2>
            <p>Hi <strong>${fullName}</strong>,</p>
            <p>Thank you for registering! We're excited to have you join us.</p>
            
            <div class="info-box">
                <p><strong>📧 Email:</strong> ${email}</p>
                <p><strong>📱 WhatsApp:</strong> ${data.whatsapp || 'Not provided'}</p>
                <p><strong>📍 Location:</strong> ${data.city || data.address || 'Not provided'}</p>
                <p><strong>👤 Role:</strong> ${data.role || 'Dancer'}</p>
            </div>
            
            <h3>Next Steps:</h3>
            <ol>
                <li>Complete your payment via the Stripe link you were redirected to</li>
                <li>You'll receive a payment confirmation from Stripe</li>
                <li>We'll send you more details about the lab closer to the date</li>
            </ol>
            
            <p>If you have any questions, feel free to reply to this email or contact us via WhatsApp.</p>
            
            <p style="margin-top: 30px;">See you on the dance floor! 💃🕺</p>
            <p><strong>The MasteryLab Team</strong></p>
        </div>
        <div class="footer">
            <p>© 2025 MasteryLab. All rights reserved.</p>
            <p>This is an automated confirmation email.</p>
        </div>
    </div>
</body>
</html>
    `;

    // Plain text version for email clients that don't support HTML
    var plainBody = `
Registration Confirmed - ${labName}

Hi ${fullName},

Thank you for registering for ${labName}! We're excited to have you join us.

Your Registration Details:
- Email: ${email}
- WhatsApp: ${data.whatsapp || 'Not provided'}
- Location: ${data.city || data.address || 'Not provided'}
- Role: ${data.role || 'Dancer'}

Next Steps:
1. Complete your payment via the Stripe link
2. You'll receive a payment confirmation from Stripe
3. We'll send you more details closer to the date

If you have any questions, feel free to reply to this email.

See you on the dance floor!
The MasteryLab Team

© 2025 MasteryLab. All rights reserved.
    `;

    // Send the email
    MailApp.sendEmail({
        to: email,
        subject: subject,
        body: plainBody,
        htmlBody: htmlBody,
        name: 'MasteryLab'
    });
}
