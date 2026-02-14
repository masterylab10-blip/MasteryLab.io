// TEACHERS TRAINING VIDEO SUBMISSION SCRIPT
// 1. Paste this into a NEW Google Apps Script project (associated with your registration Sheet)
// 2. Click "Save" (e.g., call it "Teachers_Video_Handler")
// 3. Select "initialSetup" from the top dropdown and click "Run" (Important for permissions!)
// 4. Click "Deploy" -> "New Deployment" -> "Web App"
//    - Description: "Teachers Video Submission"
//    - Execute as: Me
//    - Access: Anyone (Important!)
// 5. Copy the "Web App URL" and replace the 'teachers' script URLs in your HTML.

function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var data = {};

        // Parse Incoming Data
        if (e.postData && e.postData.contents) {
            if (e.postData.type === "application/json") {
                data = JSON.parse(e.postData.contents);
            } else {
                // Handle URL encoded or multipart
                data = e.parameter;
            }
        } else {
            data = e.parameter;
        }

        // --- CONFIGURATION ---
        var adminEmail = 'labmastery@outlook.com';
        var sheetName = 'Teachers_Submissions';
        var folderName = 'MasteryLab_Teacher_Videos';
        // OPTIONAL: Paste your specific Folder ID here to ensure videos go exactly where you want.
        // Get ID from URL: drive.google.com/drive/folders/YOUR_ID_IS_HERE
        var folderId = '1xZIzFcZUK_qZ3uWbsE5k1Roxa8l6gGbC';

        // --- VIDEO HANDLING ---
        var videoUrl = data.video_link || '';

        // If a physical file was uploaded as base64
        if (data.video_file && data.video_file.length > 0) {
            try {
                var folder;
                if (folderId && folderId.length > 5) {
                    try {
                        folder = DriveApp.getFolderById(folderId);
                    } catch (e) {
                        // Fallback if ID is bad
                        folder = getFolder(folderName);
                    }
                } else {
                    folder = getFolder(folderName);
                }

                var fileName = (data.first_name || 'Teacher') + "_" + (data.level || 'General') + "_" + new Date().getTime();
                var contentType = data.video_file_type || 'video/mp4';

                // Remove the base64 header if present (e.g., data:video/mp4;base64,...)
                var base64Data = data.video_file.split(',')[1] || data.video_file;
                var decodedVideo = Utilities.base64Decode(base64Data);
                var blob = Utilities.newBlob(decodedVideo, contentType, fileName);

                var file = folder.createFile(blob);
                file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
                videoUrl = file.getUrl();
            } catch (uploadErr) {
                Logger.log('Upload Error: ' + uploadErr.toString());
                // Fallback to link if file upload failed
            }
        }

        // --- SHEET HANDLING ---
        var sheet = ss.getSheetByName(sheetName);
        if (!sheet) {
            sheet = ss.insertSheet(sheetName);
            sheet.appendRow(['Date', 'Time', 'Full Name', 'Email', 'WhatsApp', 'Track', 'Level', 'Role', 'Video/Link', 'Status']);
            sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#D6001C').setFontColor('white');
        }

        var timestamp = new Date();
        var fullName = (data.first_name || '') + " " + (data.last_name || '');
        var email = data.email || 'No Email';

        // Append to Sheet
        sheet.appendRow([
            Utilities.formatDate(timestamp, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd"),
            Utilities.formatDate(timestamp, ss.getSpreadsheetTimeZone(), "HH:mm:ss"),
            fullName.trim(),
            email,
            data.whatsapp || 'N/A',
            data.track || 'Teachers',
            data.level || 'Perfect Start',
            data.role || 'Teacher',
            videoUrl,
            'Review Required'
        ]);

        // --- NOTIFICATIONS ---
        MailApp.sendEmail({
            to: adminEmail,
            subject: '🎥 NEW TEACHER APPLICATION: ' + fullName,
            body: 'A new teacher application has been submitted with a video.\n\n' +
                'Name: ' + fullName + '\n' +
                'Level: ' + (data.level || 'Perfect Start') + '\n' +
                'Video Link: ' + videoUrl + '\n\n' +
                'View Sheet: ' + ss.getUrl()
        });

        return ContentService
            .createTextOutput(JSON.stringify({ "result": "success", "video_status": videoUrl ? "saved" : "none" }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService
            .createTextOutput(JSON.stringify({ "result": "error", "error": err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

// Helper to find or create folder
function getFolder(name) {
    var folders = DriveApp.getFoldersByName(name);
    if (folders.hasNext()) {
        return folders.next();
    } else {
        return DriveApp.createFolder(name);
    }
}

function initialSetup() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    DriveApp.getFiles(); // Trigger Drive permissions
    Logger.log('Authorization complete for Sheet and Drive.');
}
