const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        trim: true,
        maxlength: [200, 'Name cannot be more than 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description']
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
        enum: ['lotions', 'jelly', 'milking', 'shampoo']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: [0, 'Price cannot be negative']
    },
    stock: {
        type: Number,
        required: [true, 'Please provide stock quantity'],
        min: [0, 'Stock cannot be negative'],
        default: 100
    },
    image: {
        type: String,
        default: 'default-product.jpg'
    },
    images: [{
        type: String
    }],
    ingredients: {
        type: String
    },
    benefits: [{
        type: String
    }],
    sizes: [{
        size: String,
        price: Number,
        stock: Number
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for text search
productSchema.index({ name: 'text', description: 'text' });

// Index for category and price filtering
productSchema.index({ category: 1, price: 1 });

// Virtual for average review rating
productSchema.virtual('averageRating').get(function() {
    return this.ratingAverage || 0;
});

// Virtual for review count
productSchema.virtual('reviewCount').get(function() {
    return this.numReviews || 0;
});

// Static method to get featured products
productSchema.statics.getFeatured = async function(limit = 4) {
    return await this.find({ isActive: true, isFeatured: true }).limit(limit);
};

// Static method to get products by category
productSchema.statics.getByCategory = async function(category, limit = 10) {
    return await this.find({ category, isActive: true }).limit(limit);
};

// Middleware to update rating when review is added/removed
productSchema.methods.updateAverageRating = async function() {
    const Review = mongoose.model('Review');
    const stats = await Review.aggregate([
        { $match: { product: this._id } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                numReviews: { $sum: 1 }
            }
        }
    ]);
    
    try {
        await this.model('Product').findByIdAndUpdate(this._id, {
            ratingAverage: stats[0]?.averageRating || 0,
            numReviews: stats[0]?.numReviews || 0
        });
    } catch (error) {
        console.error('Error updating rating:', error);
    }
};

module.exports = mongoose.model('Product', productSchema);