import { Router } from "express";
import { config } from "../config.js";
import { getSession } from "../sessionStore.js";

export const sessionRouter = Router();

const resolveSessionId = (req) =>
  req.cookies?.[config.sessionCookieName] ?? null;

const authStatusHandler = async (req, res) => {
  if (config.authStatusUnavailable) {
    res.status(503).json({ message: "Authentication status is temporarily unavailable." });
    return;
  }

  if (config.authStatusTimeoutMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, config.authStatusTimeoutMs));
    res.status(504).json({
      retryable: true,
      message: "Authentication status request timed out. Please retry.",
    });
    return;
  }

  const sessionId = resolveSessionId(req);
  const session = getSession(sessionId);

  if (!session) {
    res.json({ isAuthenticated: false });
    return;
  }

  res.json({ isAuthenticated: true, userId: session.userId });
};

sessionRouter.get("/auth-status", authStatusHandler);
