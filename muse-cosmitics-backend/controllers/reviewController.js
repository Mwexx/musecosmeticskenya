const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc    Get product reviews
// @route   GET /api/v1/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        const result = await Review.getProductReviews(productId, parseInt(limit), parseInt(page));
        
        res.json({
            success: true,
            ...result
        });
        
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Create review
// @route   POST /api/v1/reviews
// @access  Private
exports.createReview = async (req, res) => {
    try {
        const { product, rating, title, comment } = req.body;
        
        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            product,
            user: req.user._id
        });
        
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product.'
            });
        }
        
        // Check if user purchased this product
        const order = await Order.findOne({
            user: req.user._id,
            status: 'completed',
            'items.product': product
        });
        
        const review = await Review.create({
            product,
            user: req.user._id,
            rating,
            title,
            comment,
            isVerified: !!order
        });
        
        res.status(201).json({
            success: true,
            message: 'Review added successfully!',
            data: review
        });
        
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
    try {
        const { rating, title, comment } = req.body;
        
        const review = await Review.findOne({
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found.'
            });
        }
        
        review.rating = rating || review.rating;
        review.title = title || review.title;
        review.comment = comment || review.comment;
        await review.save();
        
        res.json({
            success: true,
            message: 'Review updated successfully!',
            data: review
        });
        
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findOne({
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found.'
            });
        }
        
        await review.remove();
        
        res.json({
            success: true,
            message: 'Review deleted successfully!'
        });
        
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Mark review as helpful
// @route   POST /api/v1/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found.'
            });
        }
        
        await review.markHelpful(req.user._id);
        
        res.json({
            success: true,
            message: 'Thank you for your feedback!',
            data: review
        });
        
    } catch (error) {
        console.error('Mark helpful error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Delete review (Admin)
// @route   DELETE /api/v1/reviews/:id/admin
// @access  Private/Admin
exports.deleteReviewAdmin = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found.'
            });
        }
        
        res.json({
            success: true,
            message: 'Review deleted successfully!'
        });
        
    } catch (error) {
        console.error('Delete review admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};