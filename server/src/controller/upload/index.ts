import { env } from "../../config/env";
import { queueUploadController } from "./queue";
import { directUploadController } from "./upload";
import { createFileUploadQueue } from "../../utils/pdfQueue";
import { Request, Response } from "express";

export const uploadController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (env.USE_QUEUE === "true") {
    const fileUploadQueue = createFileUploadQueue();
    await queueUploadController(fileUploadQueue)(req, res);
    return;
  }

  await directUploadController(req, res);
};
