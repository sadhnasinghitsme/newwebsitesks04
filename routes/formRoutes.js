const express = require("express");
const formLimiter = require("../middleware/rateLimiter");
const honeypot = require("../middleware/honeypot");
const validateForm = require("../middleware/validate");
const { uploadResume } = require("../middleware/upload");
const { createEnquiry } = require("../controllers/admissionController");
const { createMessage } = require("../controllers/contactController");
const { createApplication } = require("../controllers/careerController");

const router = express.Router();
const json = express.json({ limit: "20kb" });

// Order matters: rate limit first (cheapest), then read the body, drop bots, validate, save.
const admission = [formLimiter(), json, honeypot, validateForm("admission"), createEnquiry];
router.post("/admission-enquiry", ...admission);
router.post("/enquiry", ...admission);   // same form, shorter URL used by the admissions popup
router.post("/contact", formLimiter(), json, honeypot, validateForm("contact"), createMessage);
router.post("/careers", formLimiter(), uploadResume, honeypot, validateForm("career"), createApplication);

module.exports = router;
