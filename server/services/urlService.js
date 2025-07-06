import axios from 'axios';
import cheerio from 'cheerio';

async function extractTextFromURL(url) {
    try {
        // Validate URL format
        try {
            new URL(url);
        } catch (e) {
            throw new Error('Invalid URL format');
        }

        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Remove script and style elements
        $('script, style').remove();

        // Extract text from body
        const text = $('body').text()
            .replace(/\s+/g, ' ')
            .trim();

        if (!text) {
            throw new Error('No text content found on the webpage');
        }

        return text;
    } catch (error) {
        console.error('Error extracting text from URL:', error);
        if (error.response) {
            throw new Error(`Failed to fetch URL: ${error.response.status} ${error.response.statusText}`);
        }
        throw new Error('Failed to extract text from URL. Please check if the URL is accessible.');
    }
}

export {
    extractTextFromURL
}; 