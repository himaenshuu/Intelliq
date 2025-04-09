const express = require('express');
const router = express.Router();
const { processWithGemini } = require('../utils/ai');
const { extractTextFromURL } = require('../utils/scraper');

router.post('/process-url', async (req, res) => {
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
        const result = await processWithGemini(prompt, context);

        res.json({ result });
    } catch (error) {
        console.error('Error processing URL:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 