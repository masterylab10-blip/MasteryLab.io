// ============================================
// MasteryLab — BSL Perfect Start Script
// Paste this into your BSL Perfect Start Spreadsheet
// ============================================

var SITE_URL = 'https://masterylab10-blip.github.io/MasteryLab.io';

var EVENT = {
    name: 'Bachata Sensual Lab — Perfect Start',
    date: 'TBD 2026',
    venue: 'Olten, Switzerland',
    color: '#8B5CF6',
    image: SITE_URL + '/media/bsl_ticket.png'
};

function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);
    try {
        var postData = e.postData;
        if (postData && postData.contents) {
            var payload = JSON.parse(postData.contents);
            if (payload && payload.id && payload.object === 'event') {
                return handleStripeWebhook(payload);
            }
        }
        return handleRegistration(e.parameter);
    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": err.toString() })).setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

function handleRegistration(data) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var timestamp = new Date();
    var fullName = data.first_name + " " + (data.last_name || "");

    sheet.appendRow([
        timestamp.toLocaleDateString(),
        timestamp.toLocaleTimeString(),
        fullName,
        data.address || 'Not Provided',
        data.city || 'Not Provided',
        data.whatsapp || 'Not Provided',
        data.email,
        data.role || 'N/A',
        'Pending',
        '', // Amount
        '', // Payment Time
        '', // Ticket #
        'Perfect Start',
        data.track || ''
    ]);

    MailApp.sendEmail({
        to: 'labmastery@outlook.com',
        subject: '📋 New BSL Perfect Start Registration: ' + fullName,
        htmlBody: '<h2 style="color: #8B5CF6;">New BSL Perfect Start Registration</h2>' +
            '<p><strong>Name:</strong> ' + fullName + '</p>' +
            '<p><strong>Email:</strong> ' + data.email + '</p>' +
            '<p><strong>Address:</strong> ' + (data.address || 'N/A') + '</p>' +
            '<p style="color: orange;">⏳ Status: Pending Payment</p>'
    });

    return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);
}

function handleStripeWebhook(event) {
    if (event.type !== 'checkout.session.completed') return ContentService.createTextOutput(JSON.stringify({ "received": true })).setMimeType(ContentService.MimeType.JSON);

    var session = event.data.object;
    var customerEmail = (session.customer_details && session.customer_details.email) || session.customer_email;
    var customerName = (session.customer_details && session.customer_details.name) || 'Valued Customer';
    var amountPaid = (session.amount_total / 100).toFixed(2);
    var currency = (session.currency || 'chf').toUpperCase();

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var found = false;

    // FUZZY SEARCH: Scan all rows to find the email (handles column shifts)
    for (var i = data.length - 1; i >= 1; i--) {
        var row = data[i];
        var emailInRow = "";

        // Find email in current row (looking specifically in typical email columns)
        if (row[6] && row[6].toString().includes('@')) emailInRow = row[6].toString().toLowerCase();
        else if (row[5] && row[5].toString().includes('@')) emailInRow = row[5].toString().toLowerCase();

        if (emailInRow === customerEmail.toLowerCase() && (row[8] === 'Pending' || row[8] === '')) {
            var ticketNumber = 'ML-BSL-PS-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);

            // Update the row (adjusting for the new Address column)
            sheet.getRange(i + 1, 9).setValue('✅ Paid');
            sheet.getRange(i + 1, 10).setValue(currency + ' ' + amountPaid);
            sheet.getRange(i + 1, 11).setValue(new Date().toLocaleString());
            sheet.getRange(i + 1, 12).setValue(ticketNumber);

            var attendeeName = row[2] || customerName;
            var attendeeAddress = row[3] || 'On File';

            MailApp.sendEmail({
                to: customerEmail,
                subject: 'Your MasteryLab Ticket - ' + EVENT.name,
                htmlBody: buildTicketEmail(attendeeName, customerEmail, ticketNumber, amountPaid, currency, 'Perfect Start', attendeeAddress)
            });
            found = true;
            break;
        }
    }

    if (!found) {
        MailApp.sendEmail({
            to: 'labmastery@outlook.com',
            subject: '⚠️ PAYMENT MISMATCH: ' + customerName,
            htmlBody: '<h3>A payment was received but no matching registration was found.</h3>' +
                '<p><strong>Customer:</strong> ' + customerName + '</p>' +
                '<p><strong>Email:</strong> ' + customerEmail + '</p>' +
                '<p><strong>Amount:</strong> ' + currency + ' ' + amountPaid + '</p>' +
                '<p>Please check the spreadsheet manually.</p>'
        });
    }

    return ContentService.createTextOutput(JSON.stringify({ "received": true, "found": found })).setMimeType(ContentService.MimeType.JSON);
}

function buildTicketEmail(name, email, ticketNum, amount, currency, ticketType, address) {
    var accentColor = EVENT.color || '#8B5CF6';
    var firstName = name.split(' ')[0];

    return '<!DOCTYPE html><html><body style="background:#111; color:#fff; font-family:sans-serif; padding:5px;">' +
        '<div style="max-width:500px; margin:10px auto; background:#181818; border-radius:15px; overflow:hidden; border:1px solid #333; box-shadow:0 20px 50px rgba(0,0,0,0.5);">' +
        // Header
        '<div style="background:linear-gradient(135deg, ' + accentColor + ' 0%, #000 100%); padding:25px; text-align:center; border-bottom:2px dashed #333;">' +
        '<h2 style="margin:0; color:#fff; font-size:24px; letter-spacing:2px; text-transform:uppercase;">MASTERYLAB</h2>' +
        '<p style="margin:5px 0 0; color:rgba(255,255,255,0.7); font-size:10px; letter-spacing:3px;">OFFICIAL EVENT TICKET</p>' +
        '</div>' +

        '<div style="padding:20px; text-align:center;">' +
        '<h1 style="margin:0 0 10px; font-size:22px; text-transform:uppercase; letter-spacing:1px;">' + EVENT.name + '</h1>' +
        '<p style="color:' + accentColor + '; font-weight:bold; font-size:16px; margin:0 0 20px;">✓ CONFIRMED</p>' +

        // Details Table (High Compatibility)
        '<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #333; border-radius:10px; border-collapse:separate; overflow:hidden; text-align:left;">' +
        '<tr>' +
        '<td style="padding:12px; border-bottom:1px solid #333; border-right:1px solid #333; width:50%;">' +
        '<p style="margin:0; font-size:9px; color:#777; text-transform:uppercase;">Date: 📅</p>' +
        '<p style="margin:4px 0 0; font-weight:bold; font-size:13px;">' + EVENT.date + '</p>' +
        '</td>' +
        '<td style="padding:12px; border-bottom:1px solid #333;">' +
        '<p style="margin:0; font-size:9px; color:#777; text-transform:uppercase;">Paid: 💰</p>' +
        '<p style="margin:4px 0 0; font-weight:bold; font-size:13px; color:#4CAF50;">' + currency + ' ' + amount + '</p>' +
        '</td>' +
        '</tr>' +
        '<tr>' +
        '<td style="padding:12px; border-bottom:1px solid #333; border-right:1px solid #333;">' +
        '<p style="margin:0; font-size:9px; color:#777; text-transform:uppercase;">Venue: 📍</p>' +
        '<p style="margin:4px 0 0; font-weight:bold; font-size:12px;">' + EVENT.venue + '</p>' +
        '</td>' +
        '<td style="padding:12px; border-bottom:1px solid #333;">' +
        '<p style="margin:0; font-size:9px; color:#777; text-transform:uppercase;">Ticket #: 🎟️</p>' +
        '<p style="margin:4px 0 0; font-weight:bold; font-size:12px; color:' + accentColor + '; font-family:monospace;">' + ticketNum.split('-').pop() + '</p>' +
        '</td>' +
        '</tr>' +
        '<tr>' +
        '<td style="padding:12px; border-right:1px solid #333;">' +
        '<p style="margin:0; font-size:9px; color:#777; text-transform:uppercase;">Attendee: 👤</p>' +
        '<p style="margin:4px 0 0; font-weight:bold; font-size:13px;">' + name + '</p>' +
        '</td>' +
        '<td style="padding:12px;">' +
        '<p style="margin:0; font-size:9px; color:#777; text-transform:uppercase;">Type: ✨</p>' +
        '<p style="margin:4px 0 0; font-weight:bold; font-size:12px; color:#aaa;">' + ticketType + '</p>' +
        '</td>' +
        '</tr>' +
        '<tr>' +
        '<td colspan="2" style="padding:12px; border-top:1px solid #333; background:rgba(255,255,255,0.02);">' +
        '<p style="margin:0; font-size:9px; color:#777; text-transform:uppercase;">Home Address: 🏠</p>' +
        '<p style="margin:4px 0 0; font-size:12px; color:#ccc;">' + (address || 'On File') + '</p>' +
        '</td>' +
        '</tr>' +
        '</table>' +

        // Mobile Note Box
        '<div style="margin-top:20px; background:#111; padding:15px; border-radius:10px; border-left:4px solid ' + accentColor + '; text-align:left;">' +
        '<p style="margin:0 0 8px; font-weight:bold; font-size:15px;">Welcome, ' + firstName + '!</p>' +
        '<p style="margin:0; font-size:13px; line-height:1.5; color:#ccc;">This digital ticket confirms your spot for ' + EVENT.name + '. Present this email at the door.</p>' +
        '<p style="margin:10px 0 0; font-size:12px; color:#888;">- The MasteryLab Team</p>' +
        '</div>' +
        '</div>' +

        '<div style="text-align:center; padding:15px; color:#444; font-size:10px;">© 2026 MasteryLab</div>' +
        '</div></body></html>';
}
