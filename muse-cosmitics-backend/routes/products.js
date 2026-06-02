const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isAdmin, requireCsrfToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/stats', verifyToken, isAdmin, productController.getProductStats);
router.get('/:id', productController.getProduct);

// Protected routes (Admin)
router.post('/', verifyToken, requireCsrfToken, isAdmin, upload.single('image'), productController.createProduct);
router.put('/:id', verifyToken, requireCsrfToken, isAdmin, upload.single('image'), productController.updateProduct);
router.delete('/:id', verifyToken, requireCsrfToken, isAdmin, productController.deleteProduct);

module.exports = router;