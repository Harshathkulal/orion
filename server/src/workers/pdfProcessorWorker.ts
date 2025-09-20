import { Worker } from "bullmq";
import { processPdfAndEmbed } from "../services/pdfProcessor";

const worker = new Worker(
  "pdf-queue",
  async (job) => {
    console.log(`Processing job ${job.id}...`);
    const { buffer, originalName } = job.data;

    if (!buffer || !originalName) {
      throw new Error("Invalid job data: missing buffer or originalName");
    }

    // Convert base64 string back to Buffer if needed
    const pdfBuffer = Buffer.isBuffer(buffer)
      ? buffer
      : Buffer.from(buffer, "base64");

    const result = await processPdfAndEmbed(pdfBuffer, originalName);

    console.log(`Job ${job.id} completed:`, result);

    return result;
  },
  {
    connection: {
      url: process.env.REDIS_URL!,
    },
    concurrency: 2,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

export default worker;
