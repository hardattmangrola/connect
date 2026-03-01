/**
 * Upload Service - Cloudinary (avatars)
 */

import { v2 as cloudinary } from "cloudinary";
import config from "../config/index.js";
import ApiError from "../utils/ApiError.js";

if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

export const uploadImage = async (file, folder = "connect/avatars") => {
  if (!config.cloudinary.cloudName) {
    throw new ApiError(500, "Cloudinary not configured");
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { width: 400, height: 400, crop: "fill" },
            { quality: "auto" },
          ],
        },
        (error, result) => {
          if (error) {
            reject(new ApiError(500, `Upload failed: ${error.message}`));
          } else {
            resolve(result.secure_url);
          }
        }
      )
      .end(file.buffer);
  });
};
