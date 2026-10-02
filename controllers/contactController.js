const ContactMessage = require("../models/ContactMessage");
const notify = require("../utils/notify");
const env = require("../config/env");

async function createMessage(req, res) {
  const doc = await ContactMessage.create(req.clean);

  res.status(201).json({ ok: true, message: `Thank you, ${doc.name}. We have received your message and will get back to you soon.` });
  notify(doc, "contact", { to: env.mail.schoolTo });
}

module.exports = { createMessage };
