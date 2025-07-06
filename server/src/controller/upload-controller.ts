import { Request, Response } from "express";
import { pdfQueue } from "../utils/pdfQueue";

export const uploadController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file || req.file.mimetype !== "application/pdf") {
      res.status(400).json({ message: "Only PDF files are allowed" });
      return;
    }

    const buffer = req.file.buffer;
    const originalName = req.file.originalname;

    const job = await pdfQueue.add("process-pdf", {
      buffer: buffer.toString("base64"),
      originalName,
    });

    res.status(202).json({
      message: "PDF upload accepted and processing started",
      jobId: job.id,
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: String(error) });
  }
};
