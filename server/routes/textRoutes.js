const express = require('express');
const router = express.Router();
const { processWithGemini } = require('../utils/ai');

router.post('/process', async (req, res) => {
    try {
        const { text, context } = req.body;

        if (!text) {
            return res.status(400).json({ error: "No text provided" });
        }

        const result = await processWithGemini(text, context);
        res.json({ result });
    } catch (error) {
        console.error('Error processing text:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 