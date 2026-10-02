const path = require("path");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const env = require("./config/env");
const connectDB = require("./config/db");
const { verifyMailer } = require("./config/mailer");
const corsForApi = require("./middleware/cors");
const formRoutes = require("./routes/formRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
app.set("trust proxy", env.trustProxy);   // so rate limiting sees the visitor's real IP behind a proxy
app.disable("x-powered-by");

app.get("/api/health", (req, res) =>
  res.json({ ok: true, db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" }));
app.use("/api", helmet(), corsForApi, formRoutes);
app.use("/api", notFound);

// Optional: serve the website itself, so the site and its forms run from one address.
if (env.staticDir) {
  app.use(express.static(path.resolve(__dirname, env.staticDir), { extensions: ["html"] }));
}

app.use(errorHandler);

connectDB()
  .then(() => {
    verifyMailer();
    app.listen(env.port, () => console.log(`Server running on http://localhost:${env.port}`));
  })
  .catch(err => {
    console.error("Could not connect to MongoDB:", err.message);
    process.exit(1);
  });
