/**
 * Custom API Error class for operational errors.
 * Extends the native Error class with HTTP status codes and
 * an isOperational flag to distinguish expected errors from bugs.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g., 400, 401, 404, 500)
   * @param {string} message - Human-readable error message
   * @param {boolean} [isOperational=true] - Whether this is an expected operational error
   */
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capture stack trace, excluding the constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
