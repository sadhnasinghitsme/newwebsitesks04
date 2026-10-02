const { rateLimit } = require("express-rate-limit");
const env = require("../config/env");

// One limiter per form, counted per IP address.
const formLimiter = () =>
  rateLimit({
    windowMs: env.rateLimit.windowMinutes * 60 * 1000,
    limit: env.rateLimit.max,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skipFailedRequests: true,   // a rejected (invalid) submission does not use up a real visitor's quota
    handler: (req, res) =>
      res.status(429).json({ ok: false, message: "Too many submissions from your network. Please try again in a few minutes, or call us on +91-98910 81270." }),
  });

module.exports = formLimiter;
