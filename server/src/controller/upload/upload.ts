import { Request, Response } from "express";
import { ALLOWED_MIME_TYPES } from "../../constants/allowedMimeTypes";
import { processPdfAndEmbed } from "../../services/pdfProcessor";

export const directUploadController = async (req: Request, res: Response) => {
  try {
    if (!req.file || !ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
      res.status(400).json({ message: "Invalid file type" });
      return;
    }

    const buffer = req.file.buffer;
    const originalName = req.file.originalname;

    const result = await processPdfAndEmbed(buffer, originalName);

    res.status(200).json({
      message: "File processed Successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({ message: "Processing failed", error: String(error) });
  }
};
