// ============================================
// MasteryLab — Bachata Sensual Lab Script
// Paste this into your BSL Spreadsheet Apps Script
// ============================================

var SITE_URL = 'https://masterylab10-blip.github.io/MasteryLab.io';

var EVENT = {
    name: 'Bachata Sensual Lab',
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
        if (postData && postData.type === 'application/json') {
            return handleStripeWebhook(JSON.parse(postData.contents));
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
    var fullName = data.first_name + " " + data.last_name;

    // MAP TICKET NAMES (e.g., Perfect Start)
    var ticketTypeDisplay = data.level || '';
    if (data.level === 'silver') ticketTypeDisplay = 'Perfect Start';
    else if (data.level === 'bronze') ticketTypeDisplay = 'Almost There';
    else if (data.level === 'gold') ticketTypeDisplay = 'I Made It';

    sheet.appendRow([
        timestamp.toLocaleDateString(),
        timestamp.toLocaleTimeString(),
        fullName,
        data.city || 'Not Provided',
        data.whatsapp || 'Not Provided',
        data.email,
        data.role || 'N/A',
        'Pending',
        '', // Amount
        '', // Payment Time
        '', // Ticket #
        ticketTypeDisplay,
        data.track || ''
    ]);

    MailApp.sendEmail({
        to: 'labmastery@outlook.com',
        subject: '📋 New BSL Registration: ' + fullName,
        htmlBody: '<h2 style="color: #8B5CF6;">New BSL Registration</h2>' +
            '<p><strong>Name:</strong> ' + fullName + '</p>' +
            '<p><strong>Email:</strong> ' + data.email + '</p>' +
            '<p><strong>Ticket Type:</strong> ' + ticketTypeDisplay + '</p>' +
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

    for (var i = data.length - 1; i >= 1; i--) {
        if (data[i][5] && data[i][5].toString().toLowerCase() === customerEmail.toLowerCase() && data[i][7] === 'Pending') {
            var ticketNumber = 'ML-BSL-' + new Date().getTime();
            sheet.getRange(i + 1, 8).setValue('✅ Paid');
            sheet.getRange(i + 1, 9).setValue(currency + ' ' + amountPaid);
            sheet.getRange(i + 1, 10).setValue(new Date().toLocaleString());
            sheet.getRange(i + 1, 11).setValue(ticketNumber);

            MailApp.sendEmail({
                to: customerEmail,
                subject: 'Your MasteryLab Ticket - ' + EVENT.name,
                htmlBody: buildTicketEmail(data[i][2] || customerName, customerEmail, ticketNumber, amountPaid, currency, data[i][11] || 'ADMISSION')
            });
            found = true;
            break;
        }
    }
    return ContentService.createTextOutput(JSON.stringify({ "received": true, "found": found })).setMimeType(ContentService.MimeType.JSON);
}

function buildTicketEmail(name, email, ticketNum, amount, currency, ticketType) {
    return '<!DOCTYPE html><html><body style="background:#111; color:#fff; font-family:Arial; padding:20px;">' +
        '<div style="max-width:600px; margin:auto; background:#1a1a1a; padding:40px; border-radius:15px; border:1px solid #333;">' +
        '<img src="' + EVENT.image + '" width="100%" style="border-radius:10px; margin-bottom:20px;">' +
        '<h1 style="color:' + EVENT.color + '; margin:0;">' + EVENT.name + '</h1>' +
        '<p style="font-size:20px; font-weight:bold; margin:10px 0;">' + ticketType + '</p>' +
        '<p><strong>Name:</strong> ' + name + '</p>' +
        '<p><strong>Ticket #:</strong> ' + ticketNum + '</p>' +
        '<p><strong>Date:</strong> ' + EVENT.date + '</p>' +
        '<p><strong>Venue:</strong> ' + EVENT.venue + '</p>' +
        '</div></body></html>';
}
