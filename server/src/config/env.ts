import dotenv from "dotenv";

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: Number(process.env.PORT),
  CLIENT_URL: process.env.CLIENT_URL,
  LOG_LEVEL: process.env.LOG_LEVEL,
  USE_QUEUE: process.env.USE_QUEUE,
};
