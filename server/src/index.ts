import { env } from "./config/env";
import { logger } from "./config/logger";
import app from "./app";

const server = app.listen(env.PORT, () => {
  console.log(`Server running on Port: ${env.PORT} in ${env.NODE_ENV}`);
});

process.on("SIGINT", () => {
  logger.info("Shutting down gracefully...");
  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
});