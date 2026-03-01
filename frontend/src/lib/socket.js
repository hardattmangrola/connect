/**
 * Socket.io client - loads env from frontend/.env
 * Empty VITE_API_URL = same origin (Vite proxy) - no CORS
 * Production: set VITE_API_URL to backend URL
 */

import { io as createSocket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL ?? "";

let socket = null;

export const getSocket = () => socket;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  // Same origin when empty = proxy handles /socket.io
  const url = SOCKET_URL || window.location.origin;

  socket = createSocket(url, {
    path: "/socket.io",
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected");
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("[Socket] Connection error:", err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
