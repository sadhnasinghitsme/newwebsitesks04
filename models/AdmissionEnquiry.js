const mongoose = require("mongoose");

const admissionEnquirySchema = new mongoose.Schema(
  {
    parentName: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, match: /^[6-9]\d{9}$/ },
    email: { type: String, trim: true, lowercase: true, maxlength: 254 },
    grade: { type: String, required: true, trim: true, maxlength: 60 },
    message: { type: String, trim: true, maxlength: 2000 },
    source: { type: String, trim: true, maxlength: 60 },          // which form: popup or contact page
    schoolNotified: { type: Boolean, default: false },
    userNotified: { type: Boolean, default: false },
  },
  { timestamps: true } // createdAt = date and time of the submission
);

module.exports = mongoose.model("AdmissionEnquiry", admissionEnquirySchema);
