const express = require('express');
const router = express.Router();
const { processText } = require('../controllers/textController');

router.post('/process', processText);

module.exports = router; 