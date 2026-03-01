/**
 * Express Application
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import routes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";
import { applySanitization } from "./middleware/sanitize.js";
import config from "./config/index.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin:
      config.corsOrigin === "*"
        ? (origin, cb) => cb(null, origin || true)
        : config.corsOrigin,
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { success: false, message: "Too many requests. Try again later." },
});
app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

applySanitization(app);

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

export default app;
