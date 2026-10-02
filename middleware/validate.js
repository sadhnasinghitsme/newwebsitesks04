const { validate, schemas } = require("../utils/validators");
const { removeUpload } = require("./upload");

// Validates req.body against a form schema; on success, puts the cleaned values on req.clean.
const validateForm = name => (req, res, next) => {
  const { data, errors } = validate(schemas[name], req.body);
  if (Object.keys(errors).length) {
    removeUpload(req);
    return res.status(400).json({ ok: false, message: "Please correct the highlighted fields.", errors });
  }
  req.clean = data;
  next();
};

module.exports = validateForm;
