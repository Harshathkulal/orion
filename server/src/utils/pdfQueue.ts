import { Queue } from "bullmq";

export const createFileUploadQueue = () => {
  return new Queue("file-queue", {
    connection: {
      url: process.env.REDIS_URL!,
    },
  });
};
