const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { processImage } = require('../controllers/imageController');

router.post('/process-image', upload.single('file'), processImage);

module.exports = router; 