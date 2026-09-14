class ApiResponse {
  constructor(statusCode, data = null, message = "Success", meta = null) {
    this.success = statusCode >= 200 && statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;

    if (meta) {
      this.meta = meta;
    }
  }

  static success(
    data = null,
    message = "Success",
    statusCode = 200,
    meta = null,
  ) {
    return new ApiResponse(statusCode, data, message, meta);
  }
}

module.exports = ApiResponse;
