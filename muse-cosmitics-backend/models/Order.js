const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    size: String,
    price: Number,
    quantity: Number,
    image: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user information']
    },
    items: [orderItemSchema],
    total: {
        type: Number,
        required: [true, 'Please provide order total'],
        min: [0, 'Total cannot be negative']
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    deliveryAddress: {
        type: String,
        required: [true, 'Please provide delivery address']
    },
    town: {
        type: String,
        default: 'Nakuru'
    },
    county: {
        type: String,
        default: 'Nakuru'
    },
    phone: {
        type: String,
        required: [true, 'Please provide phone number']
    },
    email: {
        type: String,
        required: [true, 'Please provide email']
    },
    paymentMethod: {
        type: String,
        enum: ['mpesa', 'cash', 'bank'],
        default: 'mpesa'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'completed', 'cancelled'],
        default: 'pending'
    },
    deliveryInstructions: String,
    trackingNumber: String,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
    if (!this.orderNumber) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 5).toUpperCase();
        this.orderNumber = `ORD-${timestamp}-${random}`;
    }
    next();
});

// Calculate total before saving
orderSchema.pre('save', function(next) {
    if (this.items && this.items.length > 0) {
        const subtotal = this.items.reduce((acc, item) => {
            return acc + (item.price * item.quantity);
        }, 0);
        
        // Free delivery for orders over 1000
        this.deliveryFee = subtotal >= 1000 ? 0 : 150;
        this.total = subtotal + this.deliveryFee;
    }
    next();
});

// Static method to get user orders
orderSchema.statics.getUserOrders = async function(userId) {
    return await this.find({ user: userId }).sort({ createdAt: -1 });
};

// Static method to get order stats
orderSchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$total' },
                pendingOrders: {
                    $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                },
                completedOrders: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                }
            }
        }
    ]);
    
    return stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0
    };
};

// Virtual for user details
orderSchema.virtual('userDetails', {
    ref: 'User',
    localField: 'user',
    foreignField: '_id',
    justOne: true
});

// Index for efficient queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);