const { removeUpload } = require("./upload");

function notFound(req, res) {
  res.status(404).json({ ok: false, message: "Not found." });
}

// Last stop for unexpected errors: log the detail, show the visitor a friendly message.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  removeUpload(req);
  if (err.type === "entity.too.large") return res.status(413).json({ ok: false, message: "The form is too large to send." });
  if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "The form data could not be read." });
  console.error(err);
  res.status(500).json({ ok: false, message: "Sorry, something went wrong on our side. Please try again, or call us on +91-98910 81270." });
}

module.exports = { notFound, errorHandler };
