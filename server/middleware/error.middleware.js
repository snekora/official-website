const ApiError = require("../utils/ApiError");

/**
 * Mongoose Validation Error Handler
 */
const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((el) => el.message);
  return new ApiError(400, `Invalid input data: ${messages.join(". ")}`);
};

/**
 * Mongoose Bad ObjectId Cast Error Handler
 */
const handleCastError = (err) => {
  return new ApiError(400, `Invalid ${err.path}: ${err.value}`);
};

/**
 * MongoDB Duplicate Key Error Handler (Code 11000)
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new ApiError(
    400,
    `Duplicate field value: "${value}" for field: "${field}". Please use another value.`
  );
};

/**
 * JSON Web Token Error Handlers
 */
const handleJWTError = () => new ApiError(401, "Invalid token. Please log in again.");
const handleJWTExpiredError = () => new ApiError(401, "Your token has expired. Please log in again.");

/**
 * Global Error Handling Middleware
 * Must have exactly 4 parameters so Express registers it as error handling middleware.
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.isOperational = err.isOperational !== false; // Default to true unless explicitly false

  // Handle specific database and auth library errors
  if (err.name === "ValidationError") error = handleValidationError(err);
  if (err.name === "CastError") error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKeyError(err);
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

  // Log unexpected server errors
  if (!error.isOperational) {
    console.error("[Unexpected Error]", err);
  }

  // Response configuration
  const response = {
    success: false,
    message: error.message || "Internal Server Error",
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
