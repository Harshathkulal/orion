import { Request, Response } from "express";
import { fileUploadQueue } from "../../utils/pdfQueue";
import { ALLOWED_MIME_TYPES } from "../../constants/allowedMimeTypes";

export const queueUploadController = async (req: Request, res: Response) => {
  try {
    if (!req.file || !ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
      res.status(400).json({ message: "Invalid file type" });
      return;
    }

    const buffer = req.file.buffer;
    const originalName = req.file.originalname;

    const job = await fileUploadQueue.add("process-file", {
      buffer: buffer.toString("base64"),
      originalName,
    });

    res.status(202).json({
      message: "Upload accepted and processing started",
      jobId: job.id,
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: String(error) });
  }
};
