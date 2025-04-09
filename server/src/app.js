const express = require("express");
const cors = require("cors");
const path = require("path");
const config = require("../config/config");

// Import routes
const pdfRoutes = require('../routes/pdfRoutes');
const imageRoutes = require('../routes/imageRoutes');
const textRoutes = require('../routes/textRoutes');
const urlRoutes = require('../routes/urlRoutes');

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

module.exports = app; 