import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import mediaDbRoutes from "./routes/media-db";
import { authRouter } from "./routes/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "60mb" })); // Increased for base64 encoded files
  app.use(express.urlencoded({ extended: true, limit: "60mb" }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes (mock/dev)
  app.use("/api/auth", authRouter);

  // Database-based media routes
  app.post("/api/media/upload", mediaDbRoutes.uploadSingleFile);
  app.post("/api/media/upload-multiple", mediaDbRoutes.uploadMultipleFiles);
  app.get("/api/media/view/:mediaId", mediaDbRoutes.serveMedia);
  app.delete("/api/media/:mediaId", mediaDbRoutes.deleteMedia);
  app.get("/api/media/info/:mediaId", mediaDbRoutes.getMediaInfo);
  app.get("/api/media/list", mediaDbRoutes.listMedia);
  app.get("/api/media/stats", mediaDbRoutes.getStorageStats);
  app.get("/api/media/health", mediaDbRoutes.healthCheck);

  return app;
}
