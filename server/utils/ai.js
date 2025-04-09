const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require("../config/config");

const genAI = new GoogleGenerativeAI(config.googleApiKey);

const SYSTEM_PROMPT = `You are an expert in answering technical quiz questions. Please provide a clear, concise, and well-structured answer to the following question. Avoid unnecessary explanation unless required. Use bullet points or short paragraphs if helpful.`;

async function processWithGemini(text, context = "") {
    try {
        if (!text || typeof text !== "string") {
            throw new Error("Invalid input text");
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const prompt = `${SYSTEM_PROMPT}\n\nContext: ${context}\n\n${text}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error processing with Gemini:", error);
        if (error.message.includes("API key")) {
            throw new Error("Invalid or missing Google API key");
        }
        throw new Error("Failed to process the input. Please try again.");
    }
}

async function processPDFWithGemini(pdfBuffer, context = "") {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

        if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
            throw new Error("Invalid PDF buffer");
        }

        const base64PDF = pdfBuffer.toString("base64");

        if (!base64PDF || base64PDF.length === 0) {
            throw new Error("Failed to convert PDF to base64");
        }

        const prompt = `${SYSTEM_PROMPT}\n\nContext: ${context}\n\nPlease analyze this PDF document and provide relevant information.`;

        console.log("Sending PDF to Gemini...");

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: "application/pdf",
                    data: base64PDF,
                },
            },
        ]);

        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Detailed Gemini PDF processing error:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        throw new Error(`Failed to process the PDF with Gemini: ${error.message}`);
    }
}

async function processImageWithGemini(imageBuffer, context = "") {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const base64Image = imageBuffer.toString("base64");
        const prompt = `${SYSTEM_PROMPT}\n\nContext: ${context}\n\nPlease analyze this image and provide relevant information.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image,
                },
            },
        ]);

        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error processing image with Gemini:", error);
        throw new Error("Failed to process the image with Gemini. Please ensure the image is in a supported format (JPEG, PNG).");
    }
}

module.exports = {
    processWithGemini,
    processPDFWithGemini,
    processImageWithGemini,
    SYSTEM_PROMPT
}; 