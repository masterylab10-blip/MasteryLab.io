/*
  ACHATA SENSUAL EDUCATION LABS - Registration Handler
  Handles submissions for both Dancers and Teachers.
  Saves to Google Sheets and works in conjunction with FormSubmit.co.
*/

function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000); // Wait up to 10 seconds for concurrent writes

    try {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheets()[0]; // Use the first sheet
        var data = e.parameter;

        // Fallback if data is sent as JSON in the body
        if (e.postData && e.postData.contents) {
            try {
                var jsonBody = JSON.parse(e.postData.contents);
                for (var key in jsonBody) {
                    data[key] = jsonBody[key];
                }
            } catch (jsonErr) {
                // Not JSON, continue with parameters
            }
        }

        // --- Data Extraction ---
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

        // --- Append to Sheet ---
        // Headers: Timestamp, Full Name, Address, City, Role, Dance Role, Email, WhatsApp, Track, Level
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
            level
        ]);

        // --- Admin Notification ---
        var adminEmail = 'masterylab1.0@gmail.com'; // User's email
        var secondaryAdmin = 'labmastery@outlook.com';

        var subject = "🚀 New Education Lab Registration: " + fullName;
        var body = "New registration for Bachata Sensual Education Labs!\n\n" +
            "Name: " + fullName + "\n" +
            "Email: " + email + "\n" +
            "WhatsApp: " + whatsapp + "\n" +
            "Track: " + track + " (" + level + ")\n" +
            "Role: " + role + " (" + danceRole + ")\n" +
            "City: " + city + "\n" +
            "Address: " + address + "\n\n" +
            "Data saved to Google Sheet: " + ss.getUrl();

        MailApp.sendEmail(adminEmail, subject, body);
        MailApp.sendEmail(secondaryAdmin, subject, body);

        return ContentService
            .createTextOutput(JSON.stringify({ "result": "success" }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService
            .createTextOutput(JSON.stringify({ "result": "error", "error": err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

function initialSetup() {
    SpreadsheetApp.getActiveSpreadsheet();
    Logger.log('Script authorized.');
}
