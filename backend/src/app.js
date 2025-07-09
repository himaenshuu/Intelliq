import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import config from "../config/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import pdfRoutes from '../routes/pdfRoutes.js';
import imageRoutes from '../routes/imageRoutes.js';
import textRoutes from '../routes/textRoutes.js';
import urlRoutes from '../routes/urlRoutes.js';


const app = express();

// Middleware
app.use(cors(config.corsOptions));
app.use(express.json());

// Routes
app.use('/api', pdfRoutes);
app.use('/api', imageRoutes);
app.use('/api', textRoutes);
app.use('/api', urlRoutes);
if (config.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../../client/build")));
}

// Place the catch-all route after all other routes
if (config.NODE_ENV === "production") {
    app.get('*', (_req, res) => {
        res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
    });
}

export default app; 