const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [true, 'Please provide product information']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user information']
    },
    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: [1, 'Rating cannot be less than 1'],
        max: [5, 'Rating cannot be more than 5']
    },
    title: {
        type: String,
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    comment: {
        type: String,
        required: [true, 'Please provide a comment'],
        trim: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    helpfulCount: {
        type: Number,
        default: 0
    },
    helpfulUsers: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    images: [{
        type: String
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Prevent duplicate reviews from same user
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Update product rating after review is saved
reviewSchema.post('save', async function() {
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.product);
    if (product) {
        await product.updateAverageRating();
    }
});

// Update product rating after review is removed
reviewSchema.post('remove', async function() {
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.product);
    if (product) {
        await product.updateAverageRating();
    }
});

// Method to mark review as helpful
reviewSchema.methods.markHelpful = async function(userId) {
    if (!this.helpfulUsers.includes(userId)) {
        this.helpfulUsers.push(userId);
        this.helpfulCount += 1;
        await this.save();
    }
    return this;
};

// Virtual for user details
reviewSchema.virtual('userDetails', {
    ref: 'User',
    localField: 'user',
    foreignField: '_id',
    justOne: true
});

// Static method to get product reviews
reviewSchema.statics.getProductReviews = async function(productId, limit = 10, page = 1) {
    const skip = (page - 1) * limit;
    
    const reviews = await this.find({ product: productId })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    
    const total = await this.countDocuments({ product: productId });
    
    return {
        reviews,
        total,
        pages: Math.ceil(total / limit),
        page
    };
};

module.exports = mongoose.model('Review', reviewSchema);