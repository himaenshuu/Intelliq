const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { processPDF } = require('../controllers/pdfController');

router.post('/process-pdf', upload.single('file'), processPDF);

module.exports = router; 