const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { verifyToken, isAdmin, requireCsrfToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);

// Protected routes
router.post('/', verifyToken, requireCsrfToken, [
    body('product').isMongoId().withMessage('Valid product id is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').optional().trim().isLength({ max: 200 }),
    body('comment').trim().isLength({ min: 1, max: 2000 }).withMessage('Comment must be 1-2000 characters'),
    validate
], reviewController.createReview);
router.put('/:id', verifyToken, requireCsrfToken, [
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').optional().trim().isLength({ max: 200 }),
    body('comment').optional().trim().isLength({ min: 1, max: 2000 }).withMessage('Comment must be 1-2000 characters'),
    validate
], reviewController.updateReview);
router.delete('/:id', verifyToken, requireCsrfToken, reviewController.deleteReview);
router.post('/:id/helpful', verifyToken, requireCsrfToken, reviewController.markHelpful);

// Admin routes
router.delete('/:id/admin', verifyToken, requireCsrfToken, isAdmin, reviewController.deleteReviewAdmin);

module.exports = router;