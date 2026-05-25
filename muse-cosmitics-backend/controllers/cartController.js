const Cart = require('../models/Cart');

// @desc    Get user cart
// @route   GET /api/v1/cart
// @access  Private
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        
        if (!cart) {
            return res.json({
                success: true,
                data: { items: [], totalItems: 0, totalPrice: 0 }
            });
        }
        
        res.json({
            success: true,
            data: cart
        });
        
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Add item to cart
// @route   POST /api/v1/cart/items
// @access  Private
exports.addToCart = async (req, res) => {
    try {
        const { product, size, quantity = 1 } = req.body;
        
        let cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart) {
            cart = await Cart.create({ user: req.user._id });
        }
        
        await cart.addItem(product, size, quantity);
        cart = await Cart.findById(cart._id).populate('items.product');
        
        res.json({
            success: true,
            message: 'Item added to cart!',
            data: cart
        });
        
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/items/:productId
// @access  Private
exports.updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { size, quantity } = req.body;
        
        let cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found.'
            });
        }
        
        await cart.updateQuantity(productId, size, quantity);
        cart = await Cart.findById(cart._id).populate('items.product');
        
        res.json({
            success: true,
            message: 'Cart updated!',
            data: cart
        });
        
    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/items/:productId
// @access  Private
exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const { size } = req.query;
        
        let cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found.'
            });
        }
        
        await cart.removeItem(productId, size);
        cart = await Cart.findById(cart._id).populate('items.product');
        
        res.json({
            success: true,
            message: 'Item removed from cart!',
            data: cart
        });
        
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Clear cart
// @route   DELETE /api/v1/cart
// @access  Private
exports.clearCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found.'
            });
        }
        
        await cart.clear();
        
        res.json({
            success: true,
            message: 'Cart cleared!',
            data: cart
        });
        
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};