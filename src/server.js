const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

/* ================= SECURITY MIDDLEWARE ================= */
app.use(helmet()); // Secure headers

/* ================= CORS ================= */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ================= JSON PARSING ================= */
app.use(express.json());

/* ================= LOGGING ================= */
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/* ================= RATE LIMITING ================= */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // max requests per window per IP
  message: { message: "Too many requests. Try again later." },
});
app.use(limiter);

/* ================= STATIC FILES ================= */
app.use("/uploads", express.static("uploads"));

/* ================= ROUTES ================= */
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const schemaRoutes = require("./routes/schemaRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/schema", schemaRoutes);
app.use("/api/transactions", transactionRoutes);

/* ================= 404 HANDLER ================= */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ================= GLOBAL ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

/* ================= GRACEFUL SHUTDOWN ================= */
process.on("SIGTERM", () => {
  console.info("SIGTERM received. Closing server...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.info("SIGINT received. Closing server...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});
