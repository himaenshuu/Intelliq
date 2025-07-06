import express from "express";
import cors from "cors";
import path from "path";
import config from "../config/config.js";

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

// Serve static files in production
if (config.nodeEnv === "production") {
    app.use(express.static(path.join(__dirname, "../../client/build")));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
    });
}

export default app; 