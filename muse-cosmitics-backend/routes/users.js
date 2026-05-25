const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { verifyToken, isAdmin } = require('../middleware/auth');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        
        const users = await User.find()
            .select('-password')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });
        
        const total = await User.countDocuments();
        
        res.json({
            success: true,
            count: users.length,
            pagination: {
                page: parseInt(page),
                total,
                pages: Math.ceil(total / parseInt(limit))
            },
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
});

// @desc    Get user by ID
// @route   GET /api/v1/users/:id
// @access  Private/Admin
router.get('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }
        
        // Get user's orders
        const orders = await Order.find({ user: req.params.id });
        
        res.json({
            success: true,
            data: {
                ...user.toObject(),
                orders: orders.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
});

// @desc    Update user role
// @route   PUT /api/v1/users/:id/role
// @access  Private/Admin
router.put('/:id/role', verifyToken, isAdmin, async (req, res) => {
    try {
        const { role } = req.body;

        if (role === 'admin') {
            const existingAdmin = await User.findOne({
                role: 'admin',
                _id: { $ne: req.params.id }
            });

            if (existingAdmin) {
                return res.status(400).json({
                    success: false,
                    message: 'Only one admin account is allowed.'
                });
            }
        }
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }
        
        res.json({
            success: true,
            message: 'User role updated!',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });

            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    message: 'The only admin account cannot be deleted.'
                });
            }
        }

        await User.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'User deleted successfully!'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
});

module.exports = router;