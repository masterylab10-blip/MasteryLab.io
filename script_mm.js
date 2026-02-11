// ============================================
// MasteryLab — Michael & Mayra Script
// Paste this into your M&M Spreadsheet Apps Script
// ============================================

var SITE_URL = 'https://masterylab10-blip.github.io/MasteryLab.io';

var EVENT = {
    name: 'Michael & Mayra Intensive',
    date: '23-24 May 2026',
    venue: 'Basel, Switzerland',
    color: '#D6001C',
    image: SITE_URL + '/media/mm_ticket.png'
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
    var fullName = data.first_name + " " + data.last_name;

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
        data.level || 'ADMISSION',
        data.track || ''
    ]);

    MailApp.sendEmail({
        to: 'labmastery@outlook.com',
        subject: '📋 New M&M Registration: ' + fullName,
        htmlBody: '<h2 style="color: #D6001C;">New M&M Registration</h2>' +
            '<p><strong>Name:</strong> ' + fullName + '</p>' +
            '<p><strong>Email:</strong> ' + data.email + '</p>' +
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
            var ticketNumber = 'ML-MM-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);
            sheet.getRange(i + 1, 8).setValue('✅ Paid');
            sheet.getRange(i + 1, 9).setValue(currency + ' ' + amountPaid);
            sheet.getRange(i + 1, 10).setValue(new Date().toLocaleString());
            sheet.getRange(i + 1, 11).setValue(ticketNumber);

            var attendeeName = data[i][2] || customerName;
            var ticketType = data[i][11] || 'ADMISSION';

            MailApp.sendEmail({
                to: customerEmail,
                subject: 'Your MasteryLab Ticket - ' + EVENT.name,
                htmlBody: buildTicketEmail(attendeeName, customerEmail, ticketNumber, amountPaid, currency, ticketType)
            });
            found = true;
            break;
        }
    }
    return ContentService.createTextOutput(JSON.stringify({ "received": true, "found": found })).setMimeType(ContentService.MimeType.JSON);
}

function buildTicketEmail(name, email, ticketNum, amount, currency, ticketType) {
    var accentColor = EVENT.color || '#D6001C';
    var firstName = name.split(' ')[0];

    return '<!DOCTYPE html><html><body style="background:#111; color:#fff; font-family:sans-serif; padding:10px;">' +
        '<div style="max-width:550px; margin:20px auto; background:#181818; border-radius:15px; overflow:hidden; border:1px solid #333; box-shadow:0 20px 50px rgba(0,0,0,0.5);">' +
        '<div style="background:linear-gradient(135deg, ' + accentColor + ' 0%, #000 100%); padding:30px; text-align:center; border-bottom:2px dashed #333;">' +
        '<h2 style="margin:0; color:#fff; font-size:28px; letter-spacing:2px; text-transform:uppercase;">MASTERYLAB</h2>' +
        '<p style="margin:5px 0 0; color:rgba(255,255,255,0.7); font-size:12px; letter-spacing:3px;">OFFICIAL EVENT TICKET</p>' +
        '</div>' +
        '<div style="padding:40px; text-align:center;">' +
        '<h1 style="margin:0 0 10px; font-size:24px; text-transform:uppercase; letter-spacing:1px;">' + EVENT.name + '</h1>' +
        '<p style="color:' + accentColor + '; font-weight:bold; font-size:18px; margin:0 0 30px;">✓ CONFIRMED</p>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; border:1px solid #333; text-align:left; border-radius:10px; overflow:hidden;">' +
        '<div style="padding:15px; border-bottom:1px solid #333; border-right:1px solid #333;"><p style="margin:0; font-size:10px; color:#777; text-transform:uppercase;">Date: 📅</p><p style="margin:5px 0 0; font-weight:bold; font-size:14px;">' + EVENT.date + '</p></div>' +
        '<div style="padding:15px; border-bottom:1px solid #333;"><p style="margin:0; font-size:10px; color:#777; text-transform:uppercase;">Amount Paid: 💰</p><p style="margin:5px 0 0; font-weight:bold; font-size:14px; color:#4CAF50;">' + currency + ' ' + amount + '</p></div>' +
        '<div style="padding:15px; border-bottom:1px solid #333; border-right:1px solid #333;"><p style="margin:0; font-size:10px; color:#777; text-transform:uppercase;">Venue: 📍</p><p style="margin:5px 0 0; font-weight:bold; font-size:13px;">' + EVENT.venue + '</p></div>' +
        '<div style="padding:15px; border-bottom:1px solid #333;"><p style="margin:0; font-size:10px; color:#777; text-transform:uppercase;">Ticket Number: 🎟️</p><p style="margin:5px 0 0; font-weight:bold; font-size:13px; color:' + accentColor + '; font-family:monospace;">' + ticketNum + '</p></div>' +
        '<div style="padding:15px; border-right:1px solid #333;"><p style="margin:0; font-size:10px; color:#777; text-transform:uppercase;">Attendee: 👤</p><p style="margin:5px 0 0; font-weight:bold; font-size:14px;">' + name + '</p></div>' +
        '<div style="padding:15px;"><p style="margin:0; font-size:10px; color:#777; text-transform:uppercase;">Email: ✉️</p><p style="margin:5px 0 0; font-weight:bold; font-size:13px; color:#aaa;">' + email + '</p></div>' +
        '</div>' +
        '<div style="margin-top:30px; background:#111; padding:25px; border-radius:10px; border-left:4px solid ' + accentColor + '; text-align:left;">' +
        '<p style="margin:0 0 10px; font-weight:bold; font-size:16px;">Welcome, ' + firstName + '!</p>' +
        '<p style="margin:0; font-size:14px; line-height:1.6; color:#ccc;">We are thrilled to have you join us for the ' + EVENT.name + '. This ticket confirms your spot at our exclusive dance mastery event. Get ready for an unforgettable experience filled with learning, passion, and community.</p>' +
        '<p style="margin:15px 0 0; font-size:13px; color:#888;">Please present this digital ticket at the registration desk upon arrival. For any questions, contact our support team. Let\'s dance!</p>' +
        '<p style="margin:10px 0 0; font-size:14px; font-style:italic; color:#ccc;">- The MasteryLab Team</p>' +
        '</div>' +
        '</div>' +
        '<div style="text-align:center; padding:20px; color:#555; font-size:12px; border-top:1px solid #222;">© 2026 MasteryLab</div>' +
        '</div></body></html>';
}
