import { Router } from "express";
const router = Router();
import geminiService from "../services/geminiService.js";
import { extractTextFromURL } from "../utils/scraper.js";
import { handleError } from "../utils/errorHandler.js";

router.post("/process-url", async (req, res) => {
  try {
    const { url, question, context } = req.body;

    if (!url || !url.trim()) {
      return res.status(400).json({ error: "No URL provided" });
    }

    if (!question || !question.trim()) {
      return res.status(400).json({ error: "No question provided" });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch (urlError) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    const webContent = await extractTextFromURL(url);
    const prompt = `Web Content: ${webContent}\n\nQuestion: ${question}`;
    const result = await geminiService.processWithGemini(prompt, context);

    res.json({ answer: result });
  } catch (error) {
    handleError(res, error, "URL processing");
  }
});

export default router;
