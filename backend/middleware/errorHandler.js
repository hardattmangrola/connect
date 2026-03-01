/**
 * Global Error Handler Middleware
 */

import ApiError from "../utils/ApiError.js";
import config from "../config/index.js";

const errorHandler = (err, req, res, next) => {
  if (config.nodeEnv === "development") {
    console.error("[Error]", err.message, err.stack);
  }

  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    error = new ApiError(400, `${field} already exists`);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    error = new ApiError(400, message);
  }

  if (err.name === "CastError") {
    error = new ApiError(400, "Invalid ID format");
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  const response = {
    success: false,
    message,
  };

  if (config.nodeEnv === "development" && statusCode === 500) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
