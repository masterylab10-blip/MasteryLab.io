# Google Sheets Automation Setup Guide

Follow these steps to link your registration form to a Google Sheet.

## 1. Create the Google Sheet
1. Open [sheets.new](https://sheets.new).
2. Name the sheet (e.g., `M&M Registration 2026`).
3. In the first row, add these exact headers:
| Timestamp | First Name | Last Name | City | Role | Email | WhatsApp |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |

## 2. Add the Automation Script
1. In your Google Sheet, go to **Extensions** > **Apps Script**.
2. Delete any code in the editor and paste the following:

```javascript
/*
  MasteryLab Registration Handler
  Handles POST requests, appends data to the active sheet,
  and sends a confirmation email.
*/

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Create timestamp
    var timestamp = new Date();
    
    // Append the row
    sheet.appendRow([
      timestamp,
      data.firstName,
      data.lastName,
      data.city,
      data.role,
      data.email,
      data.whatsapp
    ]);
    
    // Send automatic email notification
    var adminEmail = "labmastery@outlook.com";
    var subject = "New M&M Registration: " + data.firstName + " " + data.lastName;
    var body = "You have a new registration for the M&M Lab!\n\n" +
               "Name: " + data.firstName + " " + data.lastName + "\n" +
               "Email: " + data.email + "\n" +
               "WhatsApp: " + data.whatsapp + "\n" +
               "City: " + data.city + "\n" +
               "Role: " + data.role + "\n\n" +
               "This data has also been saved to your Google Sheet.";
               
    MailApp.sendEmail(adminEmail, subject, body);
    
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
    
  } catch (error) {
    return ContentService.createTextOutput("Error: " + error.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}
```

## 3. Deploy as a Web App
1. Click the blue **Deploy** button > **New deployment**.
2. Select **Web app**.
3. Description: `MasteryLab Reg System`.
4. Execute as: **Me**.
5. Who has access: **Anyone** (This is critical for the form to work).
6. Click **Deploy** and authorize the script.
7. **Copy the "Web App URL"**.

## 4. Link to the Website
Once you have the URL, please paste it here so I can update the code for you, or you can update the `googleSheetUrl` variable in `script.js` yourself.
