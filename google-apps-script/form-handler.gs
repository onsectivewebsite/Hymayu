/**
 * Indus Canada CPA — Contact Form Handler
 * Deploy as: Web App → Execute as: Me → Who has access: Anyone
 *
 * This script receives POST requests from the contact form on induscanadacpa.ca
 * and sends a formatted email to info@induscanadacpa.ca
 */

var RECIPIENT = "info@induscanadacpa.ca";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var name    = data.name    || "Not provided";
    var phone   = data.phone   || "Not provided";
    var email   = data.email   || "Not provided";
    var service = data.service || "Not provided";
    var message = data.message || "Not provided";

    var subject = "New Contact Form Submission — " + name + " (" + service + ")";

    var body = [
      "You have a new contact form submission from your website.\n",
      "─────────────────────────────",
      "👤  Name:     " + name,
      "📞  Phone:    " + phone,
      "📧  Email:    " + email,
      "📋  Service:  " + service,
      "─────────────────────────────",
      "💬  Message:\n" + message,
      "─────────────────────────────",
      "\nReply directly to this email to reach the client.",
      "Submitted on: " + new Date().toLocaleString("en-CA", { timeZone: "America/Toronto" })
    ].join("\n");

    var htmlBody = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">'
      + '<div style="background: #1a2744; padding: 24px 32px;">'
      + '<h2 style="color: #c9a84c; margin: 0; font-size: 20px;">New Contact Form Submission</h2>'
      + '<p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 14px;">Indus Canada CPA Website</p>'
      + '</div>'
      + '<div style="padding: 32px;">'
      + '<table style="width: 100%; border-collapse: collapse;">'
      + row("👤 Full Name", name)
      + row("📞 Phone", phone)
      + row("📧 Email", '<a href="mailto:' + email + '" style="color: #1a2744;">' + email + '</a>')
      + row("📋 Service", service)
      + '</table>'
      + '<div style="margin-top: 24px; background: #f8f8f8; border-left: 4px solid #c9a84c; padding: 16px 20px; border-radius: 0 4px 4px 0;">'
      + '<p style="margin: 0 0 6px; font-weight: 600; color: #1a2744;">Message</p>'
      + '<p style="margin: 0; color: #444; line-height: 1.6;">' + message.replace(/\n/g, '<br>') + '</p>'
      + '</div>'
      + '<p style="margin-top: 24px; font-size: 13px; color: #999;">Submitted: ' + new Date().toLocaleString("en-CA", { timeZone: "America/Toronto" }) + ' (ET)</p>'
      + '<a href="mailto:' + email + '" style="display: inline-block; margin-top: 8px; background: #1a2744; color: #c9a84c; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">↩ Reply to ' + name + '</a>'
      + '</div>'
      + '</div>';

    GmailApp.sendEmail(RECIPIENT, subject, body, {
      htmlBody: htmlBody,
      replyTo: email,
      name: "Indus Canada CPA Website"
    });

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function row(label, value) {
  return '<tr>'
    + '<td style="padding: 10px 0; font-weight: 600; color: #555; font-size: 14px; width: 140px; border-bottom: 1px solid #eee;">' + label + '</td>'
    + '<td style="padding: 10px 0; color: #222; font-size: 14px; border-bottom: 1px solid #eee;">' + value + '</td>'
    + '</tr>';
}

// Test this function manually from the Apps Script editor to verify email works
function testEmail() {
  doPost({
    postData: {
      contents: JSON.stringify({
        name: "Test User",
        phone: "+1 (647) 000-0000",
        email: "test@example.com",
        service: "Personal Tax",
        message: "This is a test submission from the Apps Script editor."
      })
    }
  });
  Logger.log("Test email sent to " + RECIPIENT);
}
