const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);

// Protected routes
router.post('/', verifyToken, reviewController.createReview);
router.put('/:id', verifyToken, reviewController.updateReview);
router.delete('/:id', verifyToken, reviewController.deleteReview);
router.post('/:id/helpful', verifyToken, reviewController.markHelpful);

// Admin routes
router.delete('/:id/admin', verifyToken, isAdmin, reviewController.deleteReviewAdmin);

module.exports = router;