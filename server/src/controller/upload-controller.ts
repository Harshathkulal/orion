import { Request, Response } from "express";
import { processPdfAndEmbed } from "../services/pdfProcessor";

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

    const result = await processPdfAndEmbed(buffer, originalName);

    res.status(200).json({
      message: "PDF uploaded, parsed, and embedded successfully",
      ...result,
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: String(error) });
  }
};
