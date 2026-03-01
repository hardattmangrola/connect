/**
 * Application Configuration
 * Loads .env from backend folder and exports config
 */

import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env") });

const config = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || "development",

  // CORS - restrict in production
  corsOrigin: process.env.CORS_ORIGIN || "*",

  // JWT Authentication
  jwt: {
    accessSecret: process.env.ACCESS_TOKEN_SECRET || "access-secret-change-in-production",
    accessExpiry: process.env.ACCESS_TOKEN_EXPIRY || "1d",
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || "refresh-secret-change-in-production",
    refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || "10d",
  },

  // MongoDB
  mongodbUrl: process.env.MONGODB_URL || "mongodb://localhost:27017/connect",

  // Cloudinary (for avatar uploads)
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max requests per window
  },
};

export default config;
