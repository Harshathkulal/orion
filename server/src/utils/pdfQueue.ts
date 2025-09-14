import { Queue } from "bullmq";

export const createFileUploadQueue = () => {
  return new Queue("file-queue", {
    connection: process.env.REDIS_URL
      ? { url: process.env.REDIS_URL }
      : {
          host: process.env.REDIS_HOST || "127.0.0.1",
          port: Number(process.env.REDIS_PORT) || 6379,
        },
  });
};
