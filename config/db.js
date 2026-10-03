const mongoose = require("mongoose");
const env = require("./env");

// One shared connection, opened on first use and reused afterwards. Works both as a normal
// server and on Vercel, where each cold start loads this file again.
let connecting = null;
let lastError = "";

mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));

function connectDB() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (process.env.VERCEL && !process.env.MONGODB_URI) {
    lastError = "MONGODB_URI is not set in the Vercel environment variables";
    return Promise.reject(new Error(lastError));
  }
  if (!connecting) {
    connecting = mongoose
      .connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 })
      .then(() => { lastError = ""; console.log("MongoDB connected"); })
      .catch(err => {
        connecting = null;   // try again on the next request
        lastError = err.message.split("\n")[0].replace(/mongodb(\+srv)?:\/\/\S+/g, "[connection string]");
        console.error("Could not connect to MongoDB:", lastError);
        throw err;
      });
  }
  return connecting;
}

// Why the last connection attempt failed (empty when connected), for /api/health.
const dbError = () => lastError;

module.exports = { connectDB, dbError };
