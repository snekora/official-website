const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const apiRouter = require("./routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

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

// ─── Route Mounting ──────────────────────────────────────────────
app.use("/api", apiRouter);

// ─── Global Error Handler ────────────────────────────────────────
// Must be defined AFTER all routes — Express uses the 4-param signature
// to identify error-handling middleware.
app.use(errorHandler);

module.exports = app;
