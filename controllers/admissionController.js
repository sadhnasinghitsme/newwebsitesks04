const AdmissionEnquiry = require("../models/AdmissionEnquiry");
const notify = require("../utils/notify");
const env = require("../config/env");

const SOURCES = ["popup", "contact-page"];

async function createEnquiry(req, res) {
  const { parent, phone, email, grade, message } = req.clean;
  const source = SOURCES.includes(req.body.source) ? req.body.source : "website";
  const doc = await AdmissionEnquiry.create({ parentName: parent, phone, email, grade, message, source });

  res.status(201).json({ ok: true, message: `Thank you, ${parent}. Our admissions team will call you back shortly.` });
  notify(doc, "admission", { to: env.mail.schoolTo });
}

module.exports = { createEnquiry };
