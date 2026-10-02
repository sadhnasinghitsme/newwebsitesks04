const { sendMail, mailConfigured } = require("../config/mailer");
const templates = require("./emailTemplates");

// Sends the school alert and, if the visitor gave an email, a thank-you email.
// Runs after the visitor already has their success response, so a slow or failing mail server
// never blocks or fails a submission; the result is recorded on the saved document.
async function notify(doc, kind, { to, attachments } = {}) {
  const mail = templates[kind](doc);
  const update = {};
  try {
    await sendMail({ to, ...mail.school, attachments });
    update.schoolNotified = true;
  } catch (err) {
    console.error(`School alert for ${kind} ${doc._id} failed:`, err.message);
  }
  if (doc.email) {
    try {
      await sendMail({ to: doc.email, ...mail.user });
      update.userNotified = true;
    } catch (err) {
      console.error(`Thank-you email for ${kind} ${doc._id} failed:`, err.message);
    }
  }
  // Without SMTP the emails were only printed to the console, so nothing is marked as sent.
  if (mailConfigured && Object.keys(update).length) await doc.updateOne(update).catch(() => {});
}

module.exports = notify;
