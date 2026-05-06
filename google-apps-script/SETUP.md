# Contact Form Email Setup
## Using Google Apps Script with info@induscanadacpa.ca

Follow these steps **once** — takes about 5 minutes.

---

## Step 1 — Open Google Apps Script

1. Go to **[script.google.com](https://script.google.com)**
2. Sign in with the Google account that owns **info@induscanadacpa.ca**
3. Click **"New project"**
4. Rename it: click "Untitled project" at the top → type **"Indus Canada CPA Contact Form"**

---

## Step 2 — Paste the Script

1. Delete all existing code in the editor
2. Copy the entire contents of **`form-handler.gs`** (in this folder)
3. Paste it into the editor
4. Click **Save** (💾 icon or Ctrl+S)

---

## Step 3 — Deploy as Web App

1. Click **"Deploy"** → **"New deployment"**
2. Click the ⚙️ gear icon next to "Select type" → choose **"Web app"**
3. Set the following:
   - **Description:** Contact Form v1
   - **Execute as:** Me (info@induscanadacpa.ca)
   - **Who has access:** Anyone
4. Click **"Deploy"**
5. Click **"Authorize access"** → choose your Google account → click **"Allow"**
6. **Copy the Web App URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

---

## Step 4 — Add the URL to the Website

1. Open `/Volumes/Untitled/hymau/contact.html`
2. Find this line near the bottom:
   ```js
   var APPS_SCRIPT_URL = "YOUR_APPS_SCRIPT_URL_HERE";
   ```
3. Replace `YOUR_APPS_SCRIPT_URL_HERE` with the URL you copied above:
   ```js
   var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec";
   ```
4. Save the file

---

## Step 5 — Test It

1. Run the **`testEmail`** function inside the Apps Script editor:
   - Select `testEmail` from the function dropdown
   - Click ▶ Run
   - Check that an email arrives at info@induscanadacpa.ca

2. Then test the live form on your website:
   - Fill in the contact form
   - Submit
   - You should see the ✅ "Message Sent!" confirmation
   - Check info@induscanadacpa.ca inbox

---

## Step 6 — Push the Updated Website to GitHub

```bash
cd /Volumes/Untitled/hymau
git add contact.html
git commit -m "feat: connect contact form to Google Apps Script email handler"
git push
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Email not received | Check Spam folder in Gmail |
| "Authorization required" error | Re-deploy the script and re-authorize |
| CORS error in browser console | Make sure "Who has access" is set to **Anyone** |
| Form shows mail client instead of sending | APPS_SCRIPT_URL is still set to placeholder — replace it |

---

## How It Works

```
User fills form → JS sends POST → Google Apps Script → GmailApp.sendEmail()
                                                              ↓
                                               info@induscanadacpa.ca inbox
```

The email you receive includes:
- Client name, phone, email
- Service of interest
- Their message
- A **"Reply to [Name]"** button that opens a reply directly to the client
