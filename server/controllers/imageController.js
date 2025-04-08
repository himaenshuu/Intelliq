const { processImageWithGemini } = require('../services/geminiService');
const { handleError } = require('../utils/errorHandler');

const processImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const context = req.body.context || '';
        const result = await processImageWithGemini(req.file.buffer, context);
        res.json({ result });
    } catch (error) {
        handleError(res, error, 'Image processing');
    }
};

module.exports = {
    processImage
}; 