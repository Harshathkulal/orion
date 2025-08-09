import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { apiLimiter } from "./middleware/rateLimiter";
import { notFoundHandler } from "./middleware/notFoundHandler";
import pino from "pino-http";
import { logger } from "./config/logger";
import routes from "./routes";

const app = express();

// Security & middleware
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

app.use(
  pino({
    logger,
  })
);

// Rate limiting for APIs
app.use("/api", apiLimiter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api", routes);

// Error handlers
app.use(notFoundHandler);

export default app;
