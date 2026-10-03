const AlumniRegistration = require("../models/AlumniRegistration");
const notify = require("../utils/notify");
const env = require("../config/env");

async function createRegistration(req, res) {
  const doc = await AlumniRegistration.create(req.clean);

  res.status(201).json({ ok: true, message: `Thank you, ${doc.name}. You are now registered with the SKS alumni network.` });
  notify(doc, "alumni", { to: env.mail.schoolTo });
}

module.exports = { createRegistration };
