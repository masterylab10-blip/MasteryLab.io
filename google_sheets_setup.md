# Google Sheets Automation Setup Guide

Follow these steps to link your registration form to a Google Sheet.

## 1. Open Your Sheet
You have provided this specific sheet:
[M&M Registration Sheet](https://docs.google.com/spreadsheets/d/1Pql2BUqT-V_2HWOdRPB-R57z88hRZa1k07I-dcNY_bI/edit?gid=0#gid=0)

1. Open the link above.
2. Ensure the first row has these exact headers:
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

## 4. NEW: Dual Submission Strategy (Highly Recommended)
To ensure 100% reliable email delivery and automatic redirects, we now use **FormSubmit.co** alongside Google Sheets.

### How it works:
1.  **Google Sheets (Background)**: Data is sent silently to your sheet.
2.  **FormSubmit (Foreground)**: The form then submits normally to FormSubmit, which:
    *   Sends a beautifully formatted email to `labmastery@outlook.com`.
    *   Redirects the user to your Stripe payment link.
    *   Handles SPAM protection (CAPTCHA can be disabled).

### Steps to update your HTML:
Ensure your `<form>` tag looks like this:
```html
<form action="https://formsubmit.co/labmastery@outlook.com" method="POST">
  <input type="hidden" name="_next" value="YOUR_STRIPE_URL">
  <!-- ... your inputs ... -->
</form>
```

## 5. Link to the Website
Once you have the URL, please paste it here so I can update the code for you, or you can update the `googleSheetUrl` variable in `script.js` yourself.

## 6. Troubleshooting Emails
- **Check Spam**: The email from `labmastery@outlook.com` might be in your Junk folder.
- **Sent Folder**: Check the **Sent** folder of the Gmail account you used to deploy the script. If the email is there, it means Google sent it successfully.
- **Authorizations**: If prompted, ensure you granted the script permission to **"Send email on your behalf"**.
