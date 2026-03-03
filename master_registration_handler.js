/*
  MASTERYLAB MASTER REGISTRATION HANDLER
  Routes submissions to specific Google Sheets based on the 'type' parameter.
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
        var data = e.parameter;

        // Fallback for JSON body
        if (e.postData && e.postData.contents) {
            try {
                var jsonBody = JSON.parse(e.postData.contents);
                for (var key in jsonBody) {
                    data[key] = jsonBody[key];
                }
            } catch (f) { }
        }

        var type = data.type || 'BSL';
        var spreadsheetId = SHEET_CONFIG[type] || SHEET_CONFIG['BSL'];
        var ss = SpreadsheetApp.openById(spreadsheetId);
        var sheet = ss.getSheets()[0];

        // Data Extraction
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

        // Append to Sheet
        // Headers: Timestamp, Full Name, Address, City, Role, Dance Role, Email, WhatsApp, Track, Level, Notes
        sheet.appendRow([
            timestamp,
            fullName,
            address,
            city,
            role,
            danceRole,
            email,
            whatsapp,
            track,
            level,
            notes
        ]);

        // Email Notifications
        var subject = "🚀 New Registration [" + type + "]: " + fullName;
        var body = "New registration for MasteryLab " + type + "!\n\n" +
            "Name: " + fullName + "\n" +
            "Email: " + email + "\n" +
            "WhatsApp: " + whatsapp + "\n" +
            "Track: " + track + " (" + level + ")\n" +
            "Role: " + role + " (" + danceRole + ")\n" +
            "City: " + city + "\n\n" +
            "Sheet: " + ss.getUrl();

        ADMIN_EMAILS.forEach(function (recipient) {
            MailApp.sendEmail(recipient, subject, body);
        });

        return ContentService
            .createTextOutput(JSON.stringify({ "result": "success", "sheet": ss.getName() }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService
            .createTextOutput(JSON.stringify({ "result": "error", "error": err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}
