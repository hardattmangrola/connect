/**
 * Authentication Middleware
 */

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import config from "../config/index.js";

export const protect = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new ApiError(401, "Not authorized. Please login.");
    }

    const decoded = jwt.verify(token, config.jwt.accessSecret);

    // Optimization: Skip fetching full User document on every API call.
    // Routes that need the full user object (like getMe) can fetch it themselves.
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid token. Please login again."));
    }
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token expired. Please login again."));
    }
    next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) token = authHeader.split(" ")[1];
    if (!token && req.cookies?.accessToken) token = req.cookies.accessToken;

    if (!token) return next();

    const decoded = jwt.verify(token, config.jwt.accessSecret);
    if (decoded && decoded.userId) {
      req.userId = decoded.userId;
    }
    next();
  } catch {
    next();
  }
};
