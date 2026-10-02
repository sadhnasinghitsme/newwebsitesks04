const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const RESUME_DIR = path.join(__dirname, "..", "uploads", "resumes");
const MAX_BYTES = 2 * 1024 * 1024;
fs.mkdirSync(RESUME_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: RESUME_DIR,
  // Random file name: the uploader's file name is never used on disk.
  filename: (req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.pdf`),
});

const resumeUpload = multer({
  storage,
  limits: { fileSize: MAX_BYTES, files: 1, fields: 20 },
  fileFilter: (req, file, cb) => {
    const isPdf = file.mimetype === "application/pdf" && path.extname(file.originalname).toLowerCase() === ".pdf";
    if (!isPdf) return cb(Object.assign(new Error("Please upload your resume as a PDF file."), { status: 400 }));
    cb(null, true);
  },
}).single("resume");

function removeUpload(req) {
  if (req.file?.path) fs.unlink(req.file.path, () => {});
}

const fail = (res, message) => res.status(400).json({ ok: false, message, errors: { resume: message } });

// Runs Multer, turns its errors into form errors, and checks the file really is a PDF
// (starts with "%PDF-"), since the type the browser reports can be faked.
function uploadResume(req, res, next) {
  resumeUpload(req, res, err => {
    if (err) {
      removeUpload(req);
      if (err.code === "LIMIT_FILE_SIZE") return fail(res, "Your resume must be 2 MB or smaller.");
      if (err.status === 400) return fail(res, err.message);
      if (err instanceof multer.MulterError) return fail(res, "The upload could not be processed. Please try again.");
      return next(err);
    }
    if (!req.file) return fail(res, "Please attach your resume (PDF, max 2 MB).");
    const head = Buffer.alloc(5);
    const fd = fs.openSync(req.file.path, "r");
    fs.readSync(fd, head, 0, 5, 0);
    fs.closeSync(fd);
    if (head.toString("latin1") !== "%PDF-") {
      removeUpload(req);
      return fail(res, "This file is not a valid PDF. Please upload your resume as a PDF.");
    }
    next();
  });
}

module.exports = { uploadResume, removeUpload, RESUME_DIR };
