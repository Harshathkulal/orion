import { Router } from "express";
import uploadRoute from "./upload-route";

const router = Router();

router.use("/upload", uploadRoute);

export default router;
