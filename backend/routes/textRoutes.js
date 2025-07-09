import { Router } from "express";
const router = Router();
import geminiService from "../services/geminiService.js";

router.post("/process", async (req, res) => {
  try {
    const { text, context } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const result = await geminiService.processWithGemini(text, context);
    res.json({ answer: result });
  } catch (error) {
    console.error("Error processing text:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
