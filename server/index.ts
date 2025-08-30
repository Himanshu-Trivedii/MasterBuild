import "dotenv/config";
import express from "express";
import cors from "cors";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "60mb" }));
  app.use(express.urlencoded({ extended: true, limit: "60mb" }));

  // Proxy all API requests to Spring Boot backend
  const SPRING_API = process.env.SPRING_API_URL || "http://localhost:8081";

  app.use("/api", async (req, res) => {
    try {
      const targetUrl = `${SPRING_API}${req.originalUrl}`;
      const headers: Record<string, string> = {};
      for (const [k, v] of Object.entries(req.headers)) {
        if (typeof v === "string") headers[k] = v;
      }
      delete headers.host;

      const method = req.method.toUpperCase();
      const hasBody = !["GET", "HEAD"].includes(method);

      const response = await fetch(targetUrl, {
        method,
        headers,
        // @ts-expect-error duplex is needed for Node fetch streaming
        duplex: hasBody ? "half" : undefined,
        body: hasBody ? (req as any) : undefined,
      } as any);

      res.status(response.status);
      response.headers.forEach((value, key) => {
        // Avoid setting forbidden headers in Node
        if (!key.toLowerCase().startsWith("transfer-encoding")) {
          res.setHeader(key, value);
        }
      });

      if (!response.body) {
        const text = await response.text();
        res.send(text);
        return;
      }

      for await (const chunk of response.body as any) {
        res.write(chunk);
      }
      res.end();
    } catch (err: any) {
      console.error("API proxy error:", err?.message || err);
      res.status(502).json({ message: "Bad Gateway: API proxy failed" });
    }
  });

  return app;
}
