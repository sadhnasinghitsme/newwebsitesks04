const CareerApplication = require("../models/CareerApplication");
const notify = require("../utils/notify");
const { removeUpload } = require("../middleware/upload");
const env = require("../config/env");

async function createApplication(req, res) {
  const { file } = req;
  // Keep only a safe display name from the uploader's file name (it is shown in the email).
  const originalName = (file.originalname.replace(/[^\w.\- ()]/g, "_").slice(-100)) || "resume.pdf";
  let doc;
  try {
    doc = await CareerApplication.create({ ...req.clean, resume: { originalName, storedName: file.filename, size: file.size } });
  } catch (err) {
    removeUpload(req);
    throw err;
  }

  res.status(201).json({ ok: true, message: `Thank you, ${doc.name}. HR will contact you if your profile matches an opening.` });
  notify(doc, "career", { to: env.mail.careersTo, attachments: [{ filename: originalName, path: file.path, contentType: "application/pdf" }] });
}

module.exports = { createApplication };
