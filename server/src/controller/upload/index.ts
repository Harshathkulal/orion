import { env } from "../../config/env";
import { queueUploadController } from "./queue";
import { directUploadController } from "./upload";
import { Request, Response } from "express";

export const uploadController = (req: Request, res: Response) => {
  if (env.USE_QUEUE) {
    return queueUploadController(req, res);
  }
  return directUploadController(req, res);
};
