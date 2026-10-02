const { removeUpload } = require("./upload");

// The website's forms include a hidden "website" field that people never see or fill in.
// If it has a value, a bot filled the form: pretend it worked, but save and send nothing.
function honeypot(req, res, next) {
  if (req.body && typeof req.body.website === "string" && req.body.website.trim() !== "") {
    removeUpload(req);
    return res.status(200).json({ ok: true, message: "Thank you." });
  }
  next();
}

module.exports = honeypot;
