const Product = require('../models/Product');
const Review = require('../models/Review');

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, limit, page = 1, sort } = req.query;
        
        // Build query
        const query = { isActive: true };
        
        if (category) {
            query.category = category;
        }
        
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }
        
        // Text search
        if (search) {
            query.$text = { $search: search };
        }
        
        // Build sort
        let sortBy = { createdAt: -1 };
        if (sort === 'price_asc') sortBy = { price: 1 };
        if (sort === 'price_desc') sortBy = { price: -1 };
        if (sort === 'rating') sortBy = { ratingAverage: -1 };
        
        // Pagination
        const limitNum = parseInt(limit) || 20;
        const pageNum = parseInt(page) || 1;
        const skip = (pageNum - 1) * limitNum;
        
        // Execute query
        const products = await Product.find(query)
            .sort(sortBy)
            .skip(skip)
            .limit(limitNum);
        
        const total = await Product.countDocuments(query);
        
        res.json({
            success: true,
            count: products.length,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            },
            data: products
        });
        
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.'
            });
        }
        
        // Get reviews for this product
        const reviews = await Review.find({ product: product._id })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(5);
        
        res.json({
            success: true,
            data: {
                ...product.toObject(),
                reviews
            }
        });
        
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Get featured products
// @route   GET /api/v1/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 4;
        const products = await Product.find({ isActive: true, isFeatured: true }).limit(limit);
        
        res.json({
            success: true,
            count: products.length,
            data: products
        });
        
    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Create product
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    try {
        const productData = req.body;
        
        // Handle image upload
        if (req.file) {
            productData.image = process.env.VERCEL
                ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
                : `/uploads/${req.file.filename}`;
        }
        
        // Handle multiple images
        if (req.files) {
            productData.images = req.files.map(file => process.env.VERCEL
                ? `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
                : `/uploads/${file.filename}`);
        }
        
        const product = await Product.create(productData);
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully!',
            data: product
        });
        
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    try {
        const productData = req.body;
        
        // Handle image upload
        if (req.file) {
            productData.image = process.env.VERCEL
                ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
                : `/uploads/${req.file.filename}`;
        }
        
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            productData,
            { new: true, runValidators: true }
        );
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.'
            });
        }
        
        res.json({
            success: true,
            message: 'Product updated successfully!',
            data: product
        });
        
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.'
            });
        }
        
        // Soft delete
        product.isActive = false;
        await product.save();
        
        res.json({
            success: true,
            message: 'Product deleted successfully!'
        });
        
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Get product stats
// @route   GET /api/v1/products/stats
// @access  Private/Admin
exports.getProductStats = async (req, res) => {
    try {
        const stats = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$price' },
                    totalStock: { $sum: '$stock' }
                }
            }
        ]);
        
        const totalProducts = await Product.countDocuments({ isActive: true });
        
        res.json({
            success: true,
            data: {
                totalProducts,
                byCategory: stats
            }
        });
        
    } catch (error) {
        console.error('Get product stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};