# Pana Mio Google Sheets Automation Setup Guide

Follow these simple steps to link your new **Pana Mio Shoe Order Form** on the website directly to a Google Sheet in your Google Drive.

## Step 1: Create Your Google Sheet in Drive
1. Go to your **Google Drive** ([drive.google.com](https://drive.google.com)).
2. Click **New** (+) > **Google Sheets**.
3. Name your spreadsheet: `Pana Mio Shoes Order Tracker`.
4. Name the active tab (bottom tab) to: `Orders` (or keep it as default Sheet1).
5. In the **first row (Row 1)**, create the following headers in columns A through M:

| Column | Header | Description |
| :--- | :--- | :--- |
| **A** | `Timestamp` | Date and time the order was placed |
| **B** | `Order ID` | Automatically generated unique Order ID (e.g. SO-12345) |
| **C** | `Full Name` | Customer's full name |
| **D** | `Email` | Customer's contact email |
| **E** | `WhatsApp` | Customer's WhatsApp phone number |
| **F** | `Shoe Model` | Always set to `Pana mio` |
| **G** | `Size` | Shoe size selected (EU 38 to 45) |
| **H** | `Qty` | Quantity ordered |
| **I** | `Unit Price` | Flat retail price ($99.00) |
| **J** | `Total Price` | Calculated total price ($99.00 * Qty) |
| **K** | `Shipping Address` | Complete shipping address, postal code, and country |
| **L** | `Notes` | Customer delivery remarks or comments |
| **M** | `Status` | Current fulfillment status (starts as `⏳ PENDING`) |

---

## Step 2: Add the Automation Apps Script
1. In your new Google Sheet menu, go to **Extensions** > **Apps Script**.
2. If there is any default code (like `function myFunction() {}`), delete it completely.
3. Open the file [google_script_shoes.js](file:///Users/nawfelmlouki/MasteryLab.io/google_script_shoes.js) on your computer, copy all of its contents, and paste it into the Apps Script editor.
4. If you wish to receive notifications at different emails, modify line 8:
   ```javascript
   var ADMIN_EMAILS = ['masterylab1.0@gmail.com', 'labmastery@outlook.com'];
   ```
5. Click the **Save** icon (floppy disk) or press `Cmd + S` (Mac). Name your Apps Script project `Pana Mio Order Handler`.

---

## Step 3: Deploy the Script as a Web App
To allow your website to securely send orders to this sheet:
1. In the upper-right corner of the Apps Script page, click **Deploy** > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the deployment details:
   *   **Description:** `Pana Mio Web Order Receiver`
   *   **Execute as:** Select **Me (your-email@gmail.com)**
   *   **Who has access:** Select **Anyone** *(Crucial so the website can submit without logging in)*
4. Click **Deploy**.
5. Google will ask you to **Authorize Access**. Click **Authorize access**, log in with your Google account, click **Advanced**, and then click **Go to Pana Mio Order Handler (unsafe)** to approve the permissions.
6. Once deployed, you will see a screen with the **Web app URL**. It looks like this:
   `https://script.google.com/macros/s/AKfycb.../exec`
7. **Copy this Web App URL.**

---

## Step 4: Link Your Website to the Sheet
Now that you have your Web App URL, paste it into the JavaScript configuration:
1. Open [order-panamio.html](file:///Users/nawfelmlouki/MasteryLab.io/order-panamio.html).
2. Go to the bottom script tag and locate the variable `const googleSheetUrl = "...";` (around line 348).
3. Replace the placeholder URL with your **copied Web App URL** from Step 3.
4. Save the file. Your website is now fully connected to your Google Sheet!
