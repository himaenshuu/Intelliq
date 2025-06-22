import { processWithGemini } from '../services/geminiService';
import { handleError } from '../utils/errorHandler';

const processText = async (req, res) => {
    try {
        const { text, context } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const result = await processWithGemini(text, context);
        res.json({ result });
    } catch (error) {
        handleError(res, error, 'Text processing');
    }
};

export default {
    processText
}; 