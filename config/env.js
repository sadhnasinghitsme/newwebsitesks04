// Reads .env once and exposes typed settings. Everything else imports from here.
require("dotenv").config({ quiet: true });

const list = v => (v || "").split(",").map(s => s.trim()).filter(Boolean);

const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sks_world_school",
  allowedOrigins: list(process.env.ALLOWED_ORIGINS),
  trustProxy: Number(process.env.TRUST_PROXY) || 0,           // 1 when behind Nginx / Render / Railway etc.
  staticDir: process.env.STATIC_DIR || "",                     // optional: serve the website from this server too
  rateLimit: {
    windowMinutes: Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15,
    max: Number(process.env.RATE_LIMIT_MAX) || 5,
  },
  mail: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",                // true for port 465
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.MAIL_FROM || "SKS World School <no-reply@skswsgnw.ac.in>",
    schoolTo: list(process.env.SCHOOL_EMAIL || "contact@skswsgnw.ac.in"),
    careersTo: list(process.env.CAREERS_EMAIL || process.env.SCHOOL_EMAIL || "contact@skswsgnw.ac.in"),
  },
};

module.exports = env;
