import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import upload from "./routes/upload-route";

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  })
);

// Health check route
app.get("/", (_req, res) => {
  res.json({ message: "Hello" });
});

app.use("/api", upload);

export default app;
