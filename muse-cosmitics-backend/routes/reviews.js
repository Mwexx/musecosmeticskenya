const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken, isAdmin, requireCsrfToken } = require('../middleware/auth');

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);

// Protected routes
router.post('/', verifyToken, requireCsrfToken, reviewController.createReview);
router.put('/:id', verifyToken, requireCsrfToken, reviewController.updateReview);
router.delete('/:id', verifyToken, requireCsrfToken, reviewController.deleteReview);
router.post('/:id/helpful', verifyToken, requireCsrfToken, reviewController.markHelpful);

// Admin routes
router.delete('/:id/admin', verifyToken, requireCsrfToken, isAdmin, reviewController.deleteReviewAdmin);

module.exports = router;