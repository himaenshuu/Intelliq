import { Router } from "express";
const router = Router();
import multer, { memoryStorage } from "multer";
import { processPDFWithGemini } from "../utils/ai.js";

const upload = multer({ storage: memoryStorage() });

router.post("/process-pdf", upload.single("file"), async (req, res) => {
  try {
    const { file } = req;
    const context = req.body.context || "";

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!file.buffer) {
      return res.status(400).json({ error: "Invalid file buffer" });
    }

    const result = await processPDFWithGemini(file.buffer, context);
    res.json({ result });
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
