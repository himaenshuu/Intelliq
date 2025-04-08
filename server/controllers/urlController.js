const { processURLWithGemini } = require('../services/geminiService');
const { handleError } = require('../utils/errorHandler');

const processURL = async (req, res) => {
    try {
        const { url, question, context } = req.body;
        if (!url || !question) {
            return res.status(400).json({ error: 'URL and question are required' });
        }

        const result = await processURLWithGemini(url, question, context);
        res.json({ result });
    } catch (error) {
        handleError(res, error, 'URL processing');
    }
};

module.exports = {
    processURL
}; 