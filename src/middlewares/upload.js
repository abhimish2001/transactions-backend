const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ================= CONFIG ================= */
const UPLOAD_DIR = path.join(__dirname, "../uploads");

// Ensure upload directory exists
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/* ================= STORAGE ================= */
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

/* ================= FILE FILTER ================= */
const fileFilter = (_, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Unsupported file type"), false);
  }

  cb(null, true);
};

/* ================= MULTER ================= */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;
