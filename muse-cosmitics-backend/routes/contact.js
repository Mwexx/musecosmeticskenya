const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public route
router.post('/', contactController.submitContact);

// Admin routes
router.get('/', verifyToken, isAdmin, contactController.getContactMessages);
router.put('/:id/read', verifyToken, isAdmin, contactController.markAsRead);
router.post('/:id/reply', verifyToken, isAdmin, contactController.replyToMessage);

module.exports = router;