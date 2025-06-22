import { Router } from "express";
const router = Router();
import { processWithGemini } from "../utils/ai";

router.post("/process", async (req, res) => {
  try {
    const { text, context } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const result = await processWithGemini(text, context);
    res.json({ result });
  } catch (error) {
    console.error("Error processing text:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
