// Google Apps Script Code for MasteryLab Registration
// Copy and paste this into a new Google Apps Script project attached to your Sheet.

function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet();
        var data = e.parameter;

        // Default sheet name if not specified
        var sheetName = data.sheetName || 'Sheet1';

        // Mapping logic for Teachers Lab names
        if (data.track === 'teachers') {
            if (data.level === 'silver') sheetName = 'Teachers Perfect Start';
            else if (data.level === 'bronze') sheetName = 'Teachers Almost There';
            else if (data.level === 'gold') sheetName = 'Teachers All In';
        }
        // Mapping logic for Dancers Lab names
        else if (data.track === 'dancers') {
            if (data.level === 'silver') sheetName = 'Dancers Silver';
            else if (data.level === 'bronze') sheetName = 'Dancers Bronze';
            else if (data.level === 'gold') sheetName = 'Dancers Gold';
        }

        // fallback for M&M
        if (data.type === 'MM') {
            sheetName = 'M&M';
        }

        var targetSheet = sheet.getSheetByName(sheetName);

        // If sheet doesn't exist, create it and add headers
        if (!targetSheet) {
            targetSheet = sheet.insertSheet(sheetName);
            targetSheet.appendRow(['Date', 'Time', 'Full Name', 'Address', 'Phone', 'Email', 'Role', 'Status']);
        }

        var timestamp = new Date();

        // Append data
        // Columns: Date, Time, Full Name, Address, Phone, Email, Role, Status (Default: Unpaid/Pending)
        targetSheet.appendRow([
            timestamp.toLocaleDateString(),
            timestamp.toLocaleTimeString(),
            data.first_name + " " + data.last_name,
            data.address || 'Not Provided',
            data.whatsapp || data.phone || 'Not Provided',
            data.email,
            data.role || 'N/A',
            'Pending' // Initial status, to be updated manually or via Stripe webhook later
        ]);

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
