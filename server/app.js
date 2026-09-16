const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const apiRouter = require("./routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

// Trust proxy is required since we will be deploying to Railway (a reverse proxy)
// This ensures express-rate-limit correctly identifies the client IP instead of the proxy IP
app.set("trust proxy", 1);

// Standard Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true, // Allow cookies to be sent cross-origin
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base route
app.get("/", (req, res) => {
  res.json({ status: "success", message: "API is running" });
});


const { apiLimiter } = require("./middleware/rateLimiter.middleware");

// ─── Route Mounting ──────────────────────────────────────────────
// Apply standard rate limiting to all API routes
app.use("/api", apiLimiter, apiRouter);

// ─── Global Error Handler ────────────────────────────────────────
// Must be defined AFTER all routes — Express uses the 4-param signature
// to identify error-handling middleware.
app.use(errorHandler);

module.exports = app;
