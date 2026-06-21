const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const mongoose = require('mongoose');
const { sendEmail } = require('../config/email');
const { orderConfirmationTemplate, orderStatusUpdateTemplate } = require('../utils/emailTemplates');
const { generateOrderNumber } = require('../utils/helpers');

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { items, deliveryAddress, town, county, phone, paymentMethod, deliveryInstructions } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No items in order.'
            });
        }
        
        // Validate products and calculate total
        const orderItems = [];
        let subtotal = 0;
        
        for (const item of items) {
            let product = null;

            if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
                product = await Product.findById(item.product);
            }

            if (!product && item.name) {
                product = await Product.findOne({
                    name: new RegExp(`^${item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
                });
            }
            
            if (!product || !product.isActive) {
                return res.status(404).json({
                    success: false,
                    message: `Product ${item.name || item.product} not found or inactive.`
                });
            }
            
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }
            
            const selectedSize = item.size || product.sizes?.[0]?.size || 'Standard';
            const sizeEntry = Array.isArray(product.sizes)
                ? product.sizes.find(size => size.size === selectedSize)
                : null;
            const unitPrice = Number(item.price ?? sizeEntry?.price ?? product.price ?? 0);

            orderItems.push({
                product: product._id,
                name: product.name,
                size: selectedSize,
                price: unitPrice,
                quantity: item.quantity,
                image: product.image
            });
            
            subtotal += unitPrice * item.quantity;
            
            // Update product stock
            product.stock -= item.quantity;
            await product.save();
        }
        
        // Calculate delivery fee
        const deliveryFee = subtotal >= 0 ? 0 : 0;
        const total = subtotal + deliveryFee;
        
        // Create order
        const order = await Order.create({
            orderNumber: generateOrderNumber(),
            user: req.user._id,
            items: orderItems,
            deliveryAddress,
            town: town || 'Nakuru',
            county: county || 'Nakuru',
            phone,
            email: req.user.email,
            paymentMethod: paymentMethod || 'mpesa',
            deliveryInstructions,
            total,
            deliveryFee
        });
        
        // Clear user's cart
        await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
        
        // Send confirmation email
        try {
            await sendEmail({
                to: req.user.email,
                subject: 'Order Confirmation - Muse Cosmetics',
                html: orderConfirmationTemplate(req.user.name, order.orderNumber, total)
            });
        } catch (error) {
            console.error('Email send failed:', error);
        }
        
        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                total
            }
        });
        
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Get user orders
// @route   GET /api/v1/orders/my-orders
// @access  Private
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
        
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.'
            });
        }
        
        // Check ownership or admin
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied.'
            });
        }
        
        res.json({
            success: true,
            data: order
        });
        
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 50 } = req.query;
        
        const query = {};
        if (status) query.status = status;
        
        const orders = await Order.find(query)
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        const total = await Order.countDocuments(query);
        
        res.json({
            success: true,
            count: orders.length,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            },
            data: orders
        });
        
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { 
                status,
                ...(status === 'completed' && { deliveredAt: new Date() }),
                ...(status === 'cancelled' && { cancelledAt: new Date() })
            },
            { new: true, runValidators: true }
        ).populate('user', 'name email');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.'
            });
        }

        try {
            const customerName = order.user?.name || 'Customer';
            await sendEmail({
                to: order.email,
                subject: `Muse Cosmetics order ${status}`,
                html: orderStatusUpdateTemplate(customerName, order.orderNumber, status)
            });
        } catch (emailError) {
            console.error('Order status email failed:', emailError);
        }
        
        res.json({
            success: true,
            message: 'Order status updated successfully!',
            data: order
        });
        
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Get order statistics
// @route   GET /api/v1/orders/stats
// @access  Private/Admin
exports.getOrderStats = async (req, res) => {
    try {
        const stats = await Order.getStats();
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('Get order stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};