/**
 * User Service
 */

import UserModel from "../models/User.js";
import ApiError from "../utils/ApiError.js";

export const updateProfile = async (userId, updates) => {
  const allowed = ["displayName", "about", "avatar"];
  const filtered = Object.keys(updates)
    .filter((k) => allowed.includes(k))
    .reduce((acc, k) => ({ ...acc, [k]: updates[k] }), {});

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: filtered },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

export const searchUsers = async (userId, query, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const searchRegex = new RegExp(query, "i");

  const users = await UserModel.find({
    _id: { $ne: userId },
    $text: { $search: query },
  })
    .select("-password -refreshToken")
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await UserModel.countDocuments({
    _id: { $ne: userId },
    $text: { $search: query },
  });

  return {
    users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getUserById = async (userId) => {
  const user = await UserModel.findById(userId)
    .select("-password -refreshToken -email")
    .lean();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

export const updateLastSeen = async (userId) => {
  await UserModel.findByIdAndUpdate(userId, {
    lastSeen: new Date(),
    isOnline: true,
  });
};

export const setOffline = async (userId) => {
  await UserModel.findByIdAndUpdate(userId, {
    isOnline: false,
    lastSeen: new Date(),
  });
};
