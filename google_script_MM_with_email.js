// ============================================
// MasteryLab — Unified Registration + Stripe Webhook Script
// WITH Premium HTML Ticket Emails
// Paste this into your Apps Script project
// ============================================

// Event details configuration — update dates and images here as needed
// Images are hosted on your GitHub Pages site
var SITE_URL = 'https://masterylab10-blip.github.io/MasteryLab.io';

var EVENT_DETAILS = {
    'M&M': {
        name: 'Michael & Mayra Intensive',
        date: '23-24 May 2026',
        venue: 'Basel, Switzerland',
        color: '#D6001C',
        image: SITE_URL + '/media/michael_mayra_hero_new.jpg'
    },
    'BSL': {
        name: 'Bachata Sensual Lab',
        date: 'TBD 2026',
        venue: 'Olten, Switzerland',
        color: '#8B5CF6',
        image: SITE_URL + '/media/bachata_sensual_cover_new.jpg'
    },
    'I&I': {
        name: 'Dance Booster — Ismael & Irene',
        date: 'TBD 2026',
        venue: 'TBD',
        color: '#F59E0B',
        image: SITE_URL + '/media/ismael-irene-cover.png'
    },
    'LM': {
        name: 'Ladies Mastery Lab',
        date: 'TBD 2026',
        venue: 'Basel, Switzerland',
        color: '#EC4899',
        image: SITE_URL + '/media/logo-wings.png'
    }
};

// ============================================
// MAIN ENTRY POINT
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
        targetSheet.appendRow(['Date', 'Time', 'Full Name', 'City', 'Phone', 'Email', 'Role', 'Status', 'Amount', 'Payment Time', 'Ticket #']);
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
    var rowIndex = -1;

    for (var s = 0; s < sheets.length; s++) {
        var sheet = sheets[s];
        var data = sheet.getDataRange().getValues();

        for (var i = data.length - 1; i >= 1; i--) {
            var rowEmail = data[i][5]; // Column F = Email
            var rowStatus = data[i][7]; // Column H = Status

            if (rowEmail && rowEmail.toString().toLowerCase() === customerEmail.toLowerCase()
                && rowStatus === 'Pending') {
                // Generate ticket number
                var ticketNumber = generateTicketNumber(sheet.getName(), i);

                // Update row
                sheet.getRange(i + 1, 8).setValue('✅ Paid');
                sheet.getRange(i + 1, 9).setValue(currency + ' ' + amountPaid);
                sheet.getRange(i + 1, 10).setValue(new Date().toLocaleString());
                sheet.getRange(i + 1, 11).setValue(ticketNumber);

                found = true;
                sheetName = sheet.getName();
                customerName = data[i][2] || customerName;
                break;
            }
        }
        if (found) break;
    }

    // ================================================
    // 📧 SEND EMAILS AFTER PAYMENT
    // ================================================

    if (found) {
        var eventInfo = EVENT_DETAILS[sheetName] || {
            name: sheetName,
            date: 'TBD',
            venue: 'TBD',
            color: '#D6001C'
        };

        // Email to YOU (admin) — payment confirmed
        MailApp.sendEmail({
            to: 'labmastery@outlook.com',
            subject: '💰 Payment Confirmed: ' + customerName + ' (' + sheetName + ')',
            htmlBody: '<div style="font-family: Arial; max-width: 600px;">' +
                '<h2 style="color: #4CAF50;">✅ Payment Confirmed!</h2>' +
                '<p><strong>Event:</strong> ' + eventInfo.name + '</p>' +
                '<p><strong>Ticket #:</strong> ' + ticketNumber + '</p>' +
                '<p><strong>Name:</strong> ' + customerName + '</p>' +
                '<p><strong>Email:</strong> ' + customerEmail + '</p>' +
                '<p><strong>Amount:</strong> ' + currency + ' ' + amountPaid + '</p>' +
                '<p style="color: #4CAF50; font-weight: bold;">Status: PAID ✅</p>' +
                '</div>'
        });

        // 🎟️ PREMIUM TICKET EMAIL TO CUSTOMER
        var ticketHtml = buildTicketEmail(customerName, customerEmail, ticketNumber, amountPaid, currency, eventInfo);

        MailApp.sendEmail({
            to: customerEmail,
            subject: 'Your MasteryLab Ticket - ' + eventInfo.name,
            htmlBody: ticketHtml
        });
    }

    return ContentService
        .createTextOutput(JSON.stringify({ "received": true, "found": found }))
        .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// PART 3: GENERATE TICKET NUMBER
// ============================================

function generateTicketNumber(sheetCode, rowNum) {
    var now = new Date();
    var dateStr = now.getFullYear().toString() +
        ('0' + (now.getMonth() + 1)).slice(-2) +
        ('0' + now.getDate()).slice(-2);
    var code = sheetCode.replace('&', '').replace(' ', '');
    var seq = ('000' + rowNum).slice(-3);
    return 'ML-' + code + '-' + dateStr + '-' + seq;
}

// ============================================
// PART 4: BUILD PREMIUM TICKET EMAIL
// ============================================

function buildTicketEmail(name, email, ticketNum, amount, currency, eventInfo) {
    var firstName = name.split(' ')[0];
    var accentColor = eventInfo.color || '#D6001C';

    return '<!DOCTYPE html>' +
        '<html><head><meta charset="UTF-8"></head><body style="margin:0; padding:0; background:#111111; font-family: Arial, Helvetica, sans-serif;">' +

        // Wrapper
        '<table width="100%" cellpadding="0" cellspacing="0" style="background:#111111; padding: 30px 0;">' +
        '<tr><td align="center">' +

        // Main Card
        '<table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a1a; border-radius:16px; overflow:hidden; border: 1px solid #333;">' +

        // Header Banner with Logo
        '<tr><td style="background: linear-gradient(135deg, ' + accentColor + ' 0%, #1a1a1a 100%); padding: 30px 40px; text-align:center;">' +
        '<img src="' + SITE_URL + '/media/logo-wings.png" alt="MasteryLab" width="80" style="width:80px; height:auto; display:inline-block; margin-bottom:10px;">' +
        '<h1 style="margin:0; color:#fff; font-size:28px; letter-spacing:2px;">MASTERYLAB</h1>' +
        '<p style="margin:5px 0 0; color:rgba(255,255,255,0.7); font-size:13px; letter-spacing:3px; text-transform:uppercase;">OFFICIAL EVENT TICKET</p>' +
        '</td></tr>' +

        // Ticket Body
        '<tr><td style="padding: 0 40px;">' +

        // Dashed separator (ticket tear line effect)
        '<div style="border-top: 2px dashed #333; margin: 0 0 30px;"></div>' +

        // Event Name
        '<h2 style="color:#fff; font-size:24px; margin:0 0 5px; text-transform:uppercase; letter-spacing:1px;">' + eventInfo.name + '</h2>' +
        '<p style="color:' + accentColor + '; font-size:14px; margin:0 0 25px; letter-spacing:1px;">CONFIRMED ✓</p>' +

        // Details Grid
        '<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;">' +

        // Row 1: Date & Venue
        '<tr>' +
        '<td width="50%" style="padding: 12px 0; border-bottom: 1px solid #2a2a2a;">' +
        '<p style="margin:0; color:#888; font-size:11px; text-transform:uppercase; letter-spacing:1px;">DATE</p>' +
        '<p style="margin:4px 0 0; color:#fff; font-size:16px; font-weight:bold;">📅 ' + eventInfo.date + '</p>' +
        '</td>' +
        '<td width="50%" style="padding: 12px 0; border-bottom: 1px solid #2a2a2a;">' +
        '<p style="margin:0; color:#888; font-size:11px; text-transform:uppercase; letter-spacing:1px;">VENUE</p>' +
        '<p style="margin:4px 0 0; color:#fff; font-size:16px; font-weight:bold;">📍 ' + eventInfo.venue + '</p>' +
        '</td>' +
        '</tr>' +

        // Row 2: Name & Amount
        '<tr>' +
        '<td width="50%" style="padding: 12px 0; border-bottom: 1px solid #2a2a2a;">' +
        '<p style="margin:0; color:#888; font-size:11px; text-transform:uppercase; letter-spacing:1px;">ATTENDEE</p>' +
        '<p style="margin:4px 0 0; color:#fff; font-size:16px; font-weight:bold;">👤 ' + name + '</p>' +
        '</td>' +
        '<td width="50%" style="padding: 12px 0; border-bottom: 1px solid #2a2a2a;">' +
        '<p style="margin:0; color:#888; font-size:11px; text-transform:uppercase; letter-spacing:1px;">AMOUNT PAID</p>' +
        '<p style="margin:4px 0 0; color:#4CAF50; font-size:16px; font-weight:bold;">💰 ' + currency + ' ' + amount + '</p>' +
        '</td>' +
        '</tr>' +

        // Row 3: Ticket # & Email
        '<tr>' +
        '<td width="50%" style="padding: 12px 0;">' +
        '<p style="margin:0; color:#888; font-size:11px; text-transform:uppercase; letter-spacing:1px;">TICKET NUMBER</p>' +
        '<p style="margin:4px 0 0; color:' + accentColor + '; font-size:14px; font-weight:bold; font-family:monospace; letter-spacing:1px;">' + ticketNum + '</p>' +
        '</td>' +
        '<td width="50%" style="padding: 12px 0;">' +
        '<p style="margin:0; color:#888; font-size:11px; text-transform:uppercase; letter-spacing:1px;">EMAIL</p>' +
        '<p style="margin:4px 0 0; color:#fff; font-size:14px;">' + email + '</p>' +
        '</td>' +
        '</tr>' +

        '</table>' +

        // Dashed separator
        '<div style="border-top: 2px dashed #333; margin: 0 0 25px;"></div>' +

        // Message
        '<div style="background:#222; border-radius:10px; padding:20px; margin-bottom:25px; border-left: 4px solid ' + accentColor + ';">' +
        '<p style="margin:0; color:#fff; font-size:15px; line-height:1.6;">Hi <strong>' + firstName + '</strong>,</p>' +
        '<p style="margin:10px 0 0; color:#ccc; font-size:14px; line-height:1.6;">Your payment has been confirmed and your spot is secured! 🎉<br>Please save this email as your ticket. We will send you more details closer to the event.</p>' +
        '</div>' +

        // Important Info
        '<div style="margin-bottom:30px;">' +
        '<p style="color:#888; font-size:12px; line-height:1.6; margin:0;">📱 <strong style="color:#aaa;">Show this email</strong> at the entrance for check-in<br>' +
        '❓ <strong style="color:#aaa;">Questions?</strong> Reply to this email or reach us on WhatsApp</p>' +
        '</div>' +

        '</td></tr>' +

        // Footer
        '<tr><td style="background:#111; padding: 20px 40px; text-align:center; border-top: 1px solid #2a2a2a;">' +
        '<p style="margin:0; color:#444; font-size:12px;">© 2026 MasteryLab. All rights reserved.</p>' +
        '<p style="margin:5px 0 0; color:#333; font-size:11px;">This ticket is non-transferable.</p>' +
        '</td></tr>' +

        '</table>' +

        '</td></tr></table>' +
        '</body></html>';
}
