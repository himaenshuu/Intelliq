import { Router } from "express";
const router = Router();
import geminiService from "../services/geminiService.js";
import { handleError } from "../utils/errorHandler.js";

router.post("/process", async (req, res) => {
  try {
    const { text, context } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "No text provided" });
    }

    // Validate text length (optional safety check)
    if (text.length > 10000) {
      return res.status(400).json({ error: "Text is too long. Please limit to 10,000 characters." });
    }

    const result = await geminiService.processWithGemini(text, context);
    res.json({ answer: result });
  } catch (error) {
    handleError(res, error, "text processing");
  }
});

export default router;
