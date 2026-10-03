const mongoose = require("mongoose");

const alumniRegistrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    batch: { type: Number, required: true, min: 1950, max: 2100 },
    phone: { type: String, required: true, match: /^[6-9]\d{9}$/ },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    occupation: { type: String, trim: true, maxlength: 150 },
    message: { type: String, trim: true, maxlength: 2000 },
    schoolNotified: { type: Boolean, default: false },
    userNotified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AlumniRegistration", alumniRegistrationSchema);
