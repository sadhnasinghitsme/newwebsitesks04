const path = require("path");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const env = require("./config/env");
const { connectDB, dbError } = require("./config/db");
const { verifyMailer } = require("./config/mailer");
const corsForApi = require("./middleware/cors");
const formRoutes = require("./routes/formRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
app.set("trust proxy", env.trustProxy);   // so rate limiting sees the visitor's real IP behind a proxy
app.disable("x-powered-by");

// Forms need the database: connect on first use; if that fails, answer with a friendly error.
async function ensureDB(req, res, next) {
  try { await connectDB(); next(); }
  catch { res.status(503).json({ ok: false, message: "Sorry, we could not save your form right now. Please try again in a few minutes, or call us on +91-98910 81270." }); }
}

app.get("/api/health", async (req, res) => {
  await connectDB().catch(() => {});
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ ok: connected, db: connected ? "connected" : "disconnected", ...(connected ? {} : { reason: dbError() }) });
});
app.use("/api", helmet(), corsForApi, ensureDB, formRoutes);
app.use("/api", notFound);

// Optional: serve the website itself, so the site and its forms run from one address.
if (env.staticDir) {
  app.use(express.static(path.resolve(__dirname, env.staticDir), { extensions: ["html"] }));
}

app.use(errorHandler);

// On Vercel the platform runs the exported app; elsewhere (npm start) this file starts the server.
if (!process.env.VERCEL) {
  connectDB().catch(() => {});   // connect early; requests retry if this fails
  verifyMailer();
  app.listen(env.port, () => console.log(`Server running on http://localhost:${env.port}`));
}

module.exports = app;
