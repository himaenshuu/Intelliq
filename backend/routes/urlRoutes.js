import { Router } from "express";
const router = Router();
import geminiService from "../services/geminiService.js";
import { extractTextFromURL } from "../utils/scraper.js";

router.post("/process-url", async (req, res) => {
  try {
    const { url, question, context } = req.body;

    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    if (!question) {
      return res.status(400).json({ error: "No question provided" });
    }

    const webContent = await extractTextFromURL(url);
    const prompt = `Web Content: ${webContent}\n\nQuestion: ${question}`;
    const result = await geminiService.processWithGemini(prompt, context);

    res.json({ answer: result });
  } catch (error) {
    console.error("Error processing URL:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
