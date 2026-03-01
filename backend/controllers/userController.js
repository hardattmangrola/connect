/**
 * User Controller
 */

import asyncHandler from "../utils/asyncHandler.js";
import * as userService from "../services/userService.js";
import * as uploadService from "../services/uploadService.js";

export const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.userId);
  res.json({
    success: true,
    data: { user },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  if (req.file) {
    updates.avatar = await uploadService.uploadImage(req.file);
  }
  const user = await userService.updateProfile(req.userId, updates);
  res.json({
    success: true,
    message: "Profile updated",
    data: { user },
  });
});

export const searchUsers = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  const result = await userService.searchUsers(req.userId, q, page, limit);
  res.json({
    success: true,
    data: result,
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json({
    success: true,
    data: { user },
  });
});
