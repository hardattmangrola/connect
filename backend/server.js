/**
 * Connect - Global Real-time Messaging App
 * Main server entry point
 */

import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./socket/index.js";
import config from "./config/index.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:
      config.corsOrigin === "*"
        ? (origin, cb) => cb(null, origin || true)
        : config.corsOrigin,
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

initSocket(io);
app.set("io", io);

const startServer = async () => {
  await connectDB();

  // attempt to listen on configured port
  server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });

  // handle listen errors (e.g. port already in use)
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${config.port} is already in use. ` +
          "Make sure no other process is listening on that port or change the PORT environment variable."
      );
      process.exit(1);
    }
    // rethrow unknown errors so they bubble to the outer catch
    throw err;
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});
