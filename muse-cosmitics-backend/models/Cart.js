const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    size: String,
    price: Number,
    quantity: {
        type: Number,
        default: 1,
        min: [1, 'Quantity cannot be less than 1']
    },
    image: String
}, { _id: false });

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user information'],
        unique: true
    },
    items: [cartItemSchema],
    totalItems: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
    if (this.items && this.items.length > 0) {
        this.totalItems = this.items.reduce((acc, item) => acc + item.quantity, 0);
        this.totalPrice = this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    } else {
        this.totalItems = 0;
        this.totalPrice = 0;
    }
    next();
});

// Static method to get or create cart for user
cartSchema.statics.getOrCreateCart = async function(userId) {
    let cart = await this.findOne({ user: userId }).populate('items.product');
    
    if (!cart) {
        cart = await this.create({ user: userId, items: [] });
        cart = await this.findById(cart._id).populate('items.product');
    }
    
    return cart;
};

// Method to add item to cart
cartSchema.methods.addItem = async function(productId, size, quantity = 1) {
    const Product = mongoose.model('Product');
    const product = await Product.findById(productId);
    
    if (!product) {
        throw new Error('Product not found');
    }
    
    // Check if item already exists
    const existingItem = this.items.find(
        item => item.product.toString() === productId.toString() && item.size === size
    );
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        this.items.push({
            product: productId,
            name: product.name,
            size,
            price: product.price,
            quantity,
            image: product.image
        });
    }
    
    await this.save();
    return this;
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function(productId, size) {
    this.items = this.items.filter(
        item => !(item.product.toString() === productId.toString() && item.size === size)
    );
    await this.save();
    return this;
};

// Method to update item quantity
cartSchema.methods.updateQuantity = async function(productId, size, quantity) {
    const item = this.items.find(
        item => item.product.toString() === productId.toString() && item.size === size
    );
    
    if (item) {
        if (quantity <= 0) {
            return await this.removeItem(productId, size);
        }
        item.quantity = quantity;
        await this.save();
    }
    
    return this;
};

// Method to clear cart
cartSchema.methods.clear = async function() {
    this.items = [];
    await this.save();
    return this;
};

// Index for efficient queries
cartSchema.index({ user: 1 });

module.exports = mongoose.model('Cart', cartSchema);