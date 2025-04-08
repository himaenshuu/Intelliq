const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const { createWorker } = require('tesseract.js');
const axios = require('axios');
const cheerio = require('cheerio');
require("dotenv").config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Configure CORS based on environment
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
}

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const SYSTEM_PROMPT = `You are an expert in answering technical quiz questions. Please provide a clear, concise, and well-structured answer to the following question. Avoid unnecessary explanation unless required. Use bullet points or short paragraphs if helpful.`;

// Function to convert PDF to base64
async function convertPDFToBase64(pdfPath) {
    try {
        const pdfBytes = fs.readFileSync(pdfPath);
        return pdfBytes.toString('base64');
    } catch (error) {
        console.error("Error converting PDF to base64:", error);
        return null;
    }
}

// Function to process PDF with Gemini
async function processPDFWithGemini(pdfBuffer, context = '') {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

        // Convert PDF buffer to base64
        const base64PDF = pdfBuffer.toString('base64');

        // Create prompt with context
        const prompt = `${SYSTEM_PROMPT}\n\nContext: ${context}\n\nPlease analyze this PDF document and provide relevant information.`;

        // Generate content with PDF
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: "application/pdf",
                    data: base64PDF
                }
            }
        ]);

        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error processing PDF with Gemini:', error);
        throw new Error('Failed to process the PDF with Gemini');
    }
}

// Function to process with Gemini
async function processWithGemini(text, context = '') {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

        let prompt = SYSTEM_PROMPT + '\n\n';
        if (context) {
            prompt += `Context: ${context}\n\n`;
        }
        prompt += `Question: ${text}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error processing with Gemini:', error);
        throw new Error('Failed to process with Gemini AI');
    }
}

// Function to extract text from URL
async function extractTextFromURL(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Remove script and style elements
        $('script, style').remove();

        // Get text content
        const text = $('body').text()
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim();

        return text;
    } catch (error) {
        console.error("Error extracting text from URL:", error);
        throw error;
    }
}

// Function to process URL with Gemini
async function processURLWithGemini(url, question, context = '') {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Extract text from URL
        const webContent = await extractTextFromURL(url);

        // Create prompt with context and question
        const prompt = `${SYSTEM_PROMPT}\n\nContext: ${context}\n\nWeb Content: ${webContent}\n\nQuestion: ${question}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error processing URL with Gemini:', error);
        throw new Error('Failed to process URL with Gemini');
    }
}

// Function to process image with Gemini
async function processImageWithGemini(imageBuffer, question = "", context = "") {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

        // Convert image buffer to base64
        const base64Image = imageBuffer.toString('base64');

        // Create prompt with image and question
        const prompt = `${SYSTEM_PROMPT}\n\nContext: ${context}\n\nQuestion: ${question || "Please analyze this image and provide relevant information."}`;

        // Generate content with image
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image
                }
            }
        ]);

        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error processing image with Gemini:', error);
        throw new Error('Failed to process the image with Gemini');
    }
}

// Text processing route
app.post('/api/process', async (req, res) => {
    try {
        const { text, context } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const result = await processWithGemini(text, context);
        res.json({ result });
    } catch (error) {
        console.error('Error in text processing:', error);
        res.status(500).json({ error: error.message });
    }
});

// URL processing route
app.post('/api/process-url', async (req, res) => {
    try {
        const { url, question, context } = req.body;
        if (!url || !question) {
            return res.status(400).json({ error: 'URL and question are required' });
        }

        const result = await processURLWithGemini(url, question, context);
        res.json({ result });
    } catch (error) {
        console.error('Error in URL processing:', error);
        res.status(500).json({ error: error.message });
    }
});

// PDF processing route
app.post('/api/process-pdf', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file provided' });
        }

        const { context } = req.body;
        const result = await processPDFWithGemini(req.file.buffer, context);
        res.json({ result });
    } catch (error) {
        console.error('Error in PDF processing:', error);
        res.status(500).json({ error: error.message });
    }
});

// Image processing route
app.post('/api/process-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const { question, context } = req.body;
        const result = await processImageWithGemini(req.file.buffer, question, context);
        res.json({ result });
    } catch (error) {
        console.error('Error in image processing:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
