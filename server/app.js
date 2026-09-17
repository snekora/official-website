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
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, server-to-server)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.includes("localhost") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true, // Allow cookies to be sent cross-origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
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
