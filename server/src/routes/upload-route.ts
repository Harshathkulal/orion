import express from "express";
import { upload } from "../utils/fileUpload";
import { uploadController } from "../controller/upload/index";
import { protectPath } from "../middleware/protect-path";

const router = express.Router();

router.post("/", upload.single("file"), protectPath, uploadController);

export default router;
