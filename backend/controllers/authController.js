/**
 * Auth Controller
 */

import asyncHandler from "../utils/asyncHandler.js";
import * as authService from "../services/authService.js";

export const register = asyncHandler(async (req, res) => {
  const { email, password, displayName } = req.body;
  const result = await authService.register(email, password, displayName);
  res.status(201).json({
    success: true,
    message: "Registration successful",
    data: result,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshAccessToken(refreshToken);
  res.json({
    success: true,
    data: result,
  });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.userId);
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});
