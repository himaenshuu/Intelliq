import { processPDFWithGemini } from '../services/geminiService';
import { handleError } from '../utils/errorHandler';

const processPDF = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        const context = req.body.context || '';
        const result = await processPDFWithGemini(req.file.buffer, context);
        res.json({ result });
    } catch (error) {
        handleError(res, error, 'PDF processing');
    }
};

export default {
    processPDF
}; 
