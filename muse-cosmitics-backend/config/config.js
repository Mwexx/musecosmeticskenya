require('dotenv').config();

const isDevelopment = process.env.NODE_ENV !== 'production';
const deploymentFrontendUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
const jwtSecret = process.env.JWT_SECRET || 'dev-only-secret-change-before-production';

if (!isDevelopment && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'default_secret_change_in_production_minimum_32_characters' || jwtSecret.length < 32)) {
    throw new Error('JWT_SECRET must be configured to a unique value with at least 32 characters in production.');
}

module.exports = {
    // Server
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_VERSION: process.env.API_VERSION || 'v1',
    
    // MongoDB
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/muse_cosmetics',
    
    // JWT
    JWT_SECRET: jwtSecret,
    JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
    JWT_COOKIE_EXPIRE: parseInt(process.env.JWT_COOKIE_EXPIRE) || 7,
    
    // Email
    EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    EMAIL_PORT: process.env.EMAIL_PORT || 587,
    EMAIL_USER: process.env.EMAIL_USER || '',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@musecosmetics.co.ke',
    
    // Frontend
    FRONTEND_URL: process.env.FRONTEND_URL || deploymentFrontendUrl || (isDevelopment ? 'http://localhost:5500' : ''),
    
    // M-Pesa
    MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY || '',
    MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET || '',
    MPESA_SHORTCODE: process.env.MPESA_SHORTCODE || '174379',
    MPESA_PASSKEY: process.env.MPESA_PASSKEY || '',
    MPESA_ENVIRONMENT: process.env.MPESA_ENVIRONMENT || 'sandbox',
    
    // Upload
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5242880,
    UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
    
    // Rate Limiting
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 15,
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100
};