/*
  MASTERYLAB MASTER REGISTRATION HANDLER
  Routes submissions and handles Stripe Webhooks for payment confirmation.
*/

var SHEET_CONFIG = {
    'BSL': '1v5ftnQvnjMj1TCV-_I5js3t54u5wO_kWOg_h9rxBXvI',    // Bachata Sensual Dancers
    'BOOSTER': '1ay3MK62yvkgRJ4aMy0h6s3biaB2ltdCVYBJRhHz6-EY', // Dance Booster
    'LM': '1wEjbAy4I5hvqzYHbZFtTAvFdWOwC7FEUCelOeF1tNkE',      // Ladies Mastery
    'TEACHER': '1mq-Y1otp67siZFaHP2M4Wied47sAH4AYtxg0aUM-u-s',  // Education Labs / Teachers
    'MM': '1iGTsDPYnhaHBMRZ42J6nWyz2NFKyiMstWpLdNli5gC8',       // Michael & Mayra
    'MenStyle': '1KqkjtG-hdxDeMxroK9wOMWJuKQ3Qhfm5cEmUklELg7Y',                 // MenStyle Lab
    'DancersLab': '1v5ftnQvnjMj1TCV-_I5js3t54u5wO_kWOg_h9rxBXvI'              // Bachata Sensual Dancers Lab
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

        // --- Validation: Block Empty/Undefined Submissions (e.g. from Webhooks) ---
        var fullName = data.full_name || data.first_name || (data.firstName ? (data.firstName + ' ' + (data.lastName || '')) : '');
        if (!fullName || fullName.trim() === '' || fullName.toLowerCase().indexOf('undefined') !== -1) {
            return ContentService.createTextOutput(JSON.stringify({ "result": "ignored", "reason": "empty name" })).setMimeType(ContentService.MimeType.JSON);
        }

        var type = data.type || 'BSL';
        var level = data.level || 'N/A';
        var spreadsheetId = SHEET_CONFIG[type] || SHEET_CONFIG['BSL'];
        var ss = SpreadsheetApp.openById(spreadsheetId);

        var sheet = ss.getSheets()[0];

        // If type is TEACHER, try to route to the correct tab based on level
        if (type === 'TEACHER' && level && level !== 'N/A') {
            var targetSheet = ss.getSheetByName(level.toUpperCase());
            if (!targetSheet && level.toLowerCase().indexOf('perfect start') !== -1) targetSheet = ss.getSheetByName('PERFECT START');
            if (!targetSheet && level.toLowerCase().indexOf('almost there') !== -1) targetSheet = ss.getSheetByName('ALMOST THERE');
            if (!targetSheet && level.toLowerCase().indexOf('i made it') !== -1) targetSheet = ss.getSheetByName('I MADE IT');

            if (targetSheet) {
                sheet = targetSheet;
            }
        }

        var timestamp = new Date();
        var address = data.address || 'N/A';
        var city = data.city || 'N/A';
        var role = data.role || 'N/A';
        var danceRole = data.dance_role || 'N/A';
        var email = data.email || 'N/A';
        var whatsapp = data.whatsapp || data.phone || 'N/A';
        var track = data.track || 'N/A';
        var notes = data.notes || '';
        var status = "⏳ PENDING";

        // --- MenStyle-specific row format ---
        // Headers: Timestamp, First Name, Last Name, Phone, Email, Role, Ticket Price, Status, Ticket Kind
        if (type === 'MenStyle') {
            var firstName = data.first_name || data.firstName || 'N/A';
            var lastName = data.last_name || data.lastName || 'N/A';
            var ticketType = data.ticket_type || 'N/A';
            var ticketPrice = data.ticket_price || 'N/A';

            sheet.appendRow([timestamp, firstName, lastName, whatsapp, email, role, ticketPrice, status, ticketType]);

        } else {
            // --- Default row format for all other events ---
            // Headers: Timestamp, Full Name, Address, City, Role, Dance Role, Email, WhatsApp, Track, Level, Notes, Status
            sheet.appendRow([timestamp, fullName, address, city, role, danceRole, email, whatsapp, track, level, notes, status]);
        }

        var displayName = (type === 'MenStyle') ? (data.first_name || data.firstName || '') + ' ' + (data.last_name || data.lastName || '') : fullName;
        var subject = "🚀 New Registration [" + type + "]: " + displayName;
        var body = "New registration for MasteryLab " + type + "!\n\n" +
            "Name: " + displayName + "\n" +
            "Email: " + email + "\n" +
            "Phone: " + whatsapp + "\n" +
            "Role: " + role + "\n";
        if (type === 'MenStyle') {
            body += "Ticket: " + (data.ticket_type || 'N/A') + "\n" +
                    "Price: " + (data.ticket_price || 'N/A') + "\n";
        }
        body += "Status: " + status + "\n\n" +
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
            var sheets = ss.getSheets();

            // Loop through all tabs in the spreadsheet
            for (var s = 0; s < sheets.length; s++) {
                var sheet = sheets[s];
                var dataRows = sheet.getDataRange().getValues();

                // Determine email column index based on sheet type
                // MenStyle: Email in Column E (Index 4)
                // Others:   Email in Column G (Index 6)
                var emailColIndex = (key === 'MenStyle') ? 4 : 6;
                // MenStyle: Status in Column H (Index 7)
                // Others:   Status in Column L (Index 11)
                var statusColNumber = (key === 'MenStyle') ? 8 : 12;

                for (var i = 1; i < dataRows.length; i++) {
                    var rowEmail = dataRows[i][emailColIndex];
                    if (rowEmail && rowEmail.toString().toLowerCase().trim() === customerEmail.toLowerCase().trim()) {
                        // Update Status column
                        sheet.getRange(i + 1, statusColNumber).setValue("✅ PAID");

                        // Notify Admin
                        var subject = "💰 PAYMENT CONFIRMED: " + dataRows[i][1];
                        var body = "Stripe payment successful for " + dataRows[i][1] + " (" + customerEmail + ").\n" +
                            "Sheet updated: " + ss.getName() + " (Tab: " + sheet.getName() + ")";

                        ADMIN_EMAILS.forEach(function (recipient) {
                            MailApp.sendEmail(recipient, subject, body);
                        });

                        return ContentService.createTextOutput("Payment marked as PAID").setMimeType(ContentService.MimeType.TEXT);
                    }
                }
            }
        } catch (e) {
            // Continue to next sheet if one fails
        }
    }

    return ContentService.createTextOutput("Email not found in sheets").setMimeType(ContentService.MimeType.TEXT);
}

/**
 * ONE-TIME SETUP: Run this function from the Apps Script editor to create
 * the correct headers in the MenStyle Lab Google Sheet.
 * After running, you can delete this function.
 */
function setupMenStyleHeaders() {
    var sheetId = SHEET_CONFIG['MenStyle'];
    var ss = SpreadsheetApp.openById(sheetId);
    var sheet = ss.getSheets()[0];
    
    var headers = ['Timestamp', 'First Name', 'Last Name', 'Phone', 'Email', 'Role', 'Ticket Price', 'Status', 'Ticket Kind'];
    
    // Check if row 1 already has data
    var existingRow1 = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    var hasData = existingRow1.some(function(cell) { return cell !== ''; });
    
    if (hasData) {
        // Insert a new row at top and add headers
        sheet.insertRowBefore(1);
    }
    
    // Set headers in row 1
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format headers: bold, background color, freeze
    sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#1a1a2e')
        .setFontColor('#e6af15')
        .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    
    // Auto-resize columns
    for (var i = 1; i <= headers.length; i++) {
        sheet.autoResizeColumn(i);
    }
    
    Logger.log('✅ MenStyle headers set up successfully in sheet: ' + ss.getUrl());
}
