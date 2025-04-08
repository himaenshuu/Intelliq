const express = require('express');
const router = express.Router();
const googleFormsService = require('../services/googleFormsService');

// Middleware to verify user authentication
const verifyAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

// Verify access to a Google Form
router.post('/verify-access', verifyAuth, async (req, res) => {
    try {
        const { formUrl } = req.body;
        const userEmail = req.user.email;

        const result = await googleFormsService.verifyEmailAccess(formUrl, userEmail);
        res.json(result);
    } catch (error) {
        console.error('Error verifying form access:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get form responses
router.get('/responses/:formId', verifyAuth, async (req, res) => {
    try {
        const { formId } = req.params;
        const userEmail = req.user.email;

        const responses = await googleFormsService.getFormResponses(formId, userEmail);
        res.json({ responses });
    } catch (error) {
        console.error('Error getting form responses:', error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 