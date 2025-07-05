import express from "express";
import { upload } from "../utils/fileUpload";
import { uploadController } from "../controller/upload-controller";
import { protectPath } from "../middleware/protect-path";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadController);

export default router;
