const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Protected routes
router.post('/', verifyToken, orderController.createOrder);
router.get('/my-orders', verifyToken, orderController.getUserOrders);

// Admin routes
router.get('/', verifyToken, isAdmin, orderController.getAllOrders);
router.put('/:id/status', verifyToken, isAdmin, orderController.updateOrderStatus);
router.get('/stats', verifyToken, isAdmin, orderController.getOrderStats);
router.get('/:id', verifyToken, orderController.getOrder);

module.exports = router;