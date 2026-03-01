/**
 * Socket.io Handler
 * Real-time: messaging, typing, presence (online/last seen)
 */

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config/index.js";

const userSockets = new Map();
const socketToUser = new Map();

const authenticateSocket = (token) => {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    return decoded.userId;
  } catch {
    return null;
  }
};

export const getRoomName = (conversationId) => `conv:${conversationId}`;

export const initSocket = (io) => {
  io.use(async (socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    const userId = authenticateSocket(token);
    if (!userId) {
      return next(new Error("Authentication required"));
    }

    socket.userId = userId;
    next();
  });

  io.on("connection", async (socket) => {
    const userId = socket.userId;

    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);
    socketToUser.set(socket.id, userId);

    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: new Date(),
    });

    socket.join(`user:${userId}`);
    io.to(`user:${userId}`).emit("user:online", { userId });

    socket.on("join-conversation", async ({ conversationId }) => {
      if (!conversationId) return;
      socket.join(getRoomName(conversationId));
    });

    socket.on("leave-conversation", ({ conversationId }) => {
      if (!conversationId) return;
      socket.leave(getRoomName(conversationId));
    });

    socket.on("typing:start", ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(getRoomName(conversationId)).emit("typing:start", {
        userId,
        conversationId,
      });
    });

    socket.on("typing:stop", ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(getRoomName(conversationId)).emit("typing:stop", {
        userId,
        conversationId,
      });
    });

    socket.on("message:new", (message) => {
      if (!message?.conversation) return;
      socket.to(getRoomName(message.conversation)).emit("message:new", message);
    });

    socket.on("message:read", ({ conversationId, messageIds }) => {
      if (!conversationId) return;
      socket.to(getRoomName(conversationId)).emit("message:read", {
        userId,
        conversationId,
        messageIds,
      });
    });

    socket.on("disconnect", async () => {
      socketToUser.delete(socket.id);
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
          });
          io.emit("user:offline", { userId });
        }
      }
    });
  });

  return io;
};

/**
 * Emit new message to conversation room (called from REST after persist)
 */
export const emitNewMessage = (io, message) => {
  const convId = message.conversation?._id || message.conversation;
  if (!convId) return;
  io.to(getRoomName(convId)).emit("message:new", message);
};

export const emitMessageRead = (io, userId, conversationId, messageIds) => {
  io.to(getRoomName(conversationId)).emit("message:read", {
    userId,
    conversationId,
    messageIds,
  });
};
