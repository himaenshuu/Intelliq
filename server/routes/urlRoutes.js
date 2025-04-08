const express = require('express');
const router = express.Router();
const { processURL } = require('../controllers/urlController');

router.post('/process-url', processURL);

module.exports = router; 