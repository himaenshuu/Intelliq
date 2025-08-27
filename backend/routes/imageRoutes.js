import { Router } from "express";
const router = Router();
import multer, { memoryStorage } from "multer";
import geminiService from "../services/geminiService.js";
import { handleError } from "../utils/errorHandler.js";

const upload = multer({ 
  storage: memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.post("/process-image", upload.single("file"), async (req, res) => {
  try {
    const { file } = req;
    const context = req.body.context || "";

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!file.buffer) {
      return res.status(400).json({ error: "Invalid file buffer" });
    }

    // Validate file type
    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "Invalid file type. Only image files are allowed for this endpoint." });
    }

    const result = await geminiService.processImageWithGemini(file.buffer, context);
    res.json({ answer: result });
  } catch (error) {
    handleError(res, error, "image processing");
  }
});

export default router;
