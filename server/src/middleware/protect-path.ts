import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const protectPath = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
   const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ message: "No token" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired token" });
    return;
  }
};
