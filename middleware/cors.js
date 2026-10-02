const cors = require("cors");
const env = require("../config/env");

// Only pages on the school's own domain(s) may call the API from a browser.
// A page served by this same server is always allowed (same origin).
function isAllowed(origin, req) {
  if (!origin) return true;                                   // not a cross-site browser request
  if (env.allowedOrigins.includes(origin)) return true;
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}

function corsForApi(req, res, next) {
  const origin = req.headers.origin;
  if (!isAllowed(origin, req)) {
    return res.status(403).json({ ok: false, message: "This website is not allowed to send forms to this server." });
  }
  cors({ origin: origin || false, methods: ["POST", "OPTIONS"], maxAge: 86400 })(req, res, next);
}

module.exports = corsForApi;
