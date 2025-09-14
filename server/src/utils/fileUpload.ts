import multer from "multer";
import { ALLOWED_MIME_TYPES } from "../constants/allowedMimeTypes";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        new Error(
          "Invalid file type. Only PDF, Word, and Excel files are allowed."
        )
      );
    }
    cb(null, true);
  },
});
