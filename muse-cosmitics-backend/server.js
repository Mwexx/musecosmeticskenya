const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const config = require('./config/config');
const { connectDB } = require('./config/database');
const { verifyTransporter } = require('./config/email');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const cartRoutes = require('./routes/cart');
const reviewRoutes = require('./routes/reviews');
const contactRoutes = require('./routes/contact');

const app = express();
const isServerless = Boolean(process.env.VERCEL);
let initializationPromise = null;

async function initializeServices() {
    if (!initializationPromise) {
        initializationPromise = (async () => {
            await connectDB();

            if (!isServerless && config.EMAIL_USER && config.EMAIL_PASSWORD) {
                await verifyTransporter();
            } else if (config.NODE_ENV === 'development') {
                console.warn('Email service skipped: credentials are not configured.');
            }

            return true;
        })().catch(error => {
            initializationPromise = null;
            throw error;
        });
    }

    return initializationPromise;
}

// Security middleware
app.use(helmet());
app.use(cors({
    origin: config.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW * 60 * 1000,
    max: config.RATE_LIMIT_MAX,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// Logging
if (config.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use(`/api/${config.API_VERSION}/auth`, authRoutes);
app.use(`/api/${config.API_VERSION}/products`, productRoutes);
app.use(`/api/${config.API_VERSION}/orders`, orderRoutes);
app.use(`/api/${config.API_VERSION}/users`, userRoutes);
app.use(`/api/${config.API_VERSION}/cart`, cartRoutes);
app.use(`/api/${config.API_VERSION}/reviews`, reviewRoutes);
app.use(`/api/${config.API_VERSION}/contact`, contactRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Muse Cosmetics API is running',
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: messages
        });
    }
    
    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`
        });
    }
    
    // Mongoose cast error
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }
    
    // Default error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Server error',
        ...(config.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
async function startServer() {
    try {
        await initializeServices();

        if (isServerless) {
            return;
        }
        
        // Start server
        app.listen(config.PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎨 Muse Cosmetics API Server (MongoDB)                  ║
║                                                           ║
║   🚀 Server running on port ${config.PORT}                    ║
║   📊 Environment: ${config.NODE_ENV}                              ║
║   📦 API Version: ${config.API_VERSION}                                  ║
║   🌐 Frontend URL: ${config.FRONTEND_URL}                    ║
║   🍃 Database: MongoDB                                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
            `);
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error('Unhandled Rejection:', err);
    // Close server & exit process
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

if (require.main === module && !isServerless) {
    startServer();
} else if (isServerless) {
    initializeServices().catch(error => {
        console.error('Failed to initialize serverless app:', error);
    });
}

module.exports = app;
module.exports.initializeServices = initializeServices;
module.exports.startServer = startServer;