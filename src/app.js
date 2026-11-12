import cookieParser from "cookie-parser";
import express from "express";
import { authRouter } from "./routes/auth.js";
import { legalRouter } from "./routes/legal.js";
import { sessionRouter } from "./routes/session.js";

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.use("/session", sessionRouter);
  app.use("/auth", authRouter);
  app.use("/legal", legalRouter);

  return app;
};
