import { Router } from "express";
import { getPrivacy, getTerms } from "../legalContent.js";

export const legalRouter = Router();

legalRouter.get("/terms", (req, res) => {
  const locale = typeof req.query.locale === "string" ? req.query.locale : undefined;
  const doc = getTerms(locale);

  if (!doc) {
    res.status(404).json({ errorMessage: "Terms of Service not found for the requested locale." });
    return;
  }

  res.json({ content: doc.content, contentType: doc.contentType });
});

legalRouter.get("/privacy", (req, res) => {
  const locale = typeof req.query.locale === "string" ? req.query.locale : undefined;
  const doc = getPrivacy(locale);

  if (!doc) {
    res.status(404).json({ errorMessage: "Privacy Policy not found for the requested locale." });
    return;
  }

  res.json({ content: doc.content, contentType: doc.contentType });
});
