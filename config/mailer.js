const nodemailer = require("nodemailer");
const env = require("./env");

// Without SMTP settings (local development) emails are printed to the console instead of sent.
const configured = Boolean(env.mail.host);
const transporter = configured
  ? nodemailer.createTransport({
      host: env.mail.host,
      port: env.mail.port,
      secure: env.mail.secure,
      auth: env.mail.user ? { user: env.mail.user, pass: env.mail.pass } : undefined,
    })
  : nodemailer.createTransport({ jsonTransport: true });

async function sendMail(options) {
  const info = await transporter.sendMail({ from: env.mail.from, ...options });
  if (!configured) {
    const attach = (options.attachments || []).map(a => a.filename).join(", ");
    console.log(`[email not sent, SMTP not configured] to: ${options.to} | subject: ${options.subject}${attach ? ` | attachments: ${attach}` : ""}`);
  }
  return info;
}

async function verifyMailer() {
  if (!configured) return console.warn("SMTP not configured: emails will be logged to the console only");
  try { await transporter.verify(); console.log("SMTP ready"); }
  catch (err) { console.error("SMTP check failed:", err.message); }
}

module.exports = { sendMail, verifyMailer, mailConfigured: configured };
