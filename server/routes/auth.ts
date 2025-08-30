import { Router } from "express";

export const authRouter = Router();

// Very simple in-memory token map for dev
const validTokens = new Set<string>();

function roleFromEmail(email: string): "ADMIN" | "BUILDER" | "CONTRACTOR" {
  const e = email.toLowerCase();
  if (e.includes("admin")) return "ADMIN";
  if (e.includes("contractor")) return "CONTRACTOR";
  return "BUILDER";
}

authRouter.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const token = `dev-token-${Date.now()}`;
  const refreshToken = `dev-refresh-${Date.now()}`;
  validTokens.add(token);

  const role = roleFromEmail(email);

  return res.json({
    accessToken: token,
    refreshToken,
    type: "Bearer",
    id: 1,
    email,
    firstName: "Demo",
    lastName: "User",
    role,
  });
});

authRouter.post("/refresh-token", (req, res) => {
  const refreshToken = typeof req.body === "string" ? req.body : req.body?.refreshToken;
  if (!refreshToken) return res.status(400).json({ message: "Missing refreshToken" });
  const token = `dev-token-${Date.now()}`;
  validTokens.add(token);
  return res.json({
    accessToken: token,
    refreshToken: `dev-refresh-${Date.now()}`,
    type: "Bearer",
    id: 1,
    email: "demo@constructpro.dev",
    firstName: "Demo",
    lastName: "User",
    role: "BUILDER",
  });
});

authRouter.post("/logout", (_req, res) => {
  return res.json({ message: "Logged out" });
});

authRouter.get("/me", (req, res) => {
  const auth = req.header("authorization") || req.header("Authorization");
  const token = auth?.split(" ")[1];
  if (token && !validTokens.has(token)) {
    // For dev we still allow, but note invalid token
  }
  // For dev return a static user
  return res.json({
    accessToken: token || null,
    refreshToken: null,
    type: "Bearer",
    id: 1,
    email: "demo@constructpro.dev",
    firstName: "Demo",
    lastName: "User",
    role: "BUILDER",
  });
});
