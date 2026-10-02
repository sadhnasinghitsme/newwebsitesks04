const mongoose = require("mongoose");

const careerApplicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, match: /^[6-9]\d{9}$/ },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    position: { type: String, required: true, trim: true, maxlength: 100 },
    resume: {               // the file itself is not stored; it is emailed to HR
      originalName: String,
      size: Number,
    },
    schoolNotified: { type: Boolean, default: false },
    userNotified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CareerApplication", careerApplicationSchema);
