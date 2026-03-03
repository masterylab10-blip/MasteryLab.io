/*
  MASTERYLAB MASTER REGISTRATION HANDLER
  Routes submissions and handles Stripe Webhooks for payment confirmation.
*/

var SHEET_CONFIG = {
    'BSL': '1v5ftnQvnjMj1TCV-_I5js3t54u5wO_kWOg_h9rxBXvI',    // Bachata Sensual Dancers
    'BOOSTER': '1ay3MK62yvkgRJ4aMy0h6s3biaB2ltdCVYBJRhHz6-EY', // Dance Booster
    'LM': '1wEjbAy4I5hvqzYHbZFtTAvFdWOwC7FEUCelOeF1tNkE',      // Ladies Mastery
    'TEACHER': '1mq-Y1otp67siZFaHP2M4Wied47sAH4AYtxg0aUM-u-s',  // Education Labs / Teachers
    'MM': '1ApTJ1jJNQXIdLKSVDqbeIL6N5K4-lA7a8D0m4mg-sec'        // Michael & Mayra
};

var ADMIN_EMAILS = ['masterylab1.0@gmail.com', 'labmastery@outlook.com'];

function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        var postData = null;
        if (e.postData && e.postData.contents) {
            try {
                postData = JSON.parse(e.postData.contents);
            } catch (f) {
                // Not JSON, continue with parameters
            }
        }

        // --- HANDLE STRIPE WEBHOOK ---
        if (postData && postData.type === 'checkout.session.completed') {
            return handleStripePayment(postData);
        }

        // --- HANDLE NORMAL REGISTRATION ---
        var data = e.parameter || {};
        if (postData) {
            for (var key in postData) { data[key] = postData[key]; }
        }

        var type = data.type || 'BSL';
        var spreadsheetId = SHEET_CONFIG[type] || SHEET_CONFIG['BSL'];
        var ss = SpreadsheetApp.openById(spreadsheetId);
        var sheet = ss.getSheets()[0];

        var timestamp = new Date();
        var fullName = data.full_name || data.first_name || (data.firstName ? (data.firstName + ' ' + (data.lastName || '')) : 'N/A');
        var address = data.address || 'N/A';
        var city = data.city || 'N/A';
        var role = data.role || 'N/A';
        var danceRole = data.dance_role || 'N/A';
        var email = data.email || 'N/A';
        var whatsapp = data.whatsapp || data.phone || 'N/A';
        var track = data.track || 'N/A';
        var level = data.level || 'N/A';
        var notes = data.notes || '';
        var status = "⏳ PENDING";

        // Headers: Timestamp, Full Name, Address, City, Role, Dance Role, Email, WhatsApp, Track, Level, Notes, Status
        sheet.appendRow([timestamp, fullName, address, city, role, danceRole, email, whatsapp, track, level, notes, status]);

        // Email Notification
        var subject = "🚀 New Registration [" + type + "]: " + fullName;
        var body = "New registration for MasteryLab " + type + "!\n\n" +
            "Name: " + fullName + "\n" +
            "Email: " + email + "\n" +
            "Status: " + status + "\n\n" +
            "The sheet will update to PAID automatically when they finish Stripe.";

        ADMIN_EMAILS.forEach(function (recipient) {
            MailApp.sendEmail(recipient, subject, body);
        });

        return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": err.toString() })).setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

function handleStripePayment(event) {
    var session = event.data.object;
    var customerEmail = session.customer_details ? session.customer_details.email : session.customer_email;

    if (!customerEmail) return ContentService.createTextOutput("No email found").setMimeType(ContentService.MimeType.TEXT);

    // Search through all configured sheets to find the registration
    for (var key in SHEET_CONFIG) {
        try {
            var ss = SpreadsheetApp.openById(SHEET_CONFIG[key]);
            var sheet = ss.getSheets()[0];
            var dataRows = sheet.getDataRange().getValues();

            // We expect Email in Column G (Index 6)
            for (var i = 1; i < dataRows.length; i++) {
                var rowEmail = dataRows[i][6];
                if (rowEmail && rowEmail.toString().toLowerCase().trim() === customerEmail.toLowerCase().trim()) {
                    // Update Status in Column L (Index 11)
                    sheet.getRange(i + 1, 12).setValue("✅ PAID");

                    // Notify Admin
                    var subject = "💰 PAYMENT CONFIRMED: " + dataRows[i][1];
                    var body = "Stripe payment successful for " + dataRows[i][1] + " (" + customerEmail + ").\n" +
                        "Sheet updated: " + ss.getName();

                    ADMIN_EMAILS.forEach(function (recipient) {
                        MailApp.sendEmail(recipient, subject, body);
                    });

                    return ContentService.createTextOutput("Payment marked as PAID").setMimeType(ContentService.MimeType.TEXT);
                }
            }
        } catch (e) {
            // Continue to next sheet if one fails
        }
    }

    return ContentService.createTextOutput("Email not found in sheets").setMimeType(ContentService.MimeType.TEXT);
}
