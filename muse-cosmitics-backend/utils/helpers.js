/* ===== Muse Cosmetics - Helper Functions ===== */

const crypto = require('crypto');

// ===== String Helpers =====

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
exports.generateRandomString = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a unique order number
 * @returns {string} Order number
 */
exports.generateOrderNumber = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `ORD-${timestamp}-${random}`;
};

/**
 * Generate a unique transaction ID
 * @returns {string} Transaction ID
 */
exports.generateTransactionId = () => {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `TXN-${timestamp}-${random}`;
};

/**
 * Format phone number to Kenyan format
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
exports.formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('1'))) {
        return `0${cleaned}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('254')) {
        return `0${cleaned.substring(3)}`;
    } else if (cleaned.length === 10 && cleaned.startsWith('0')) {
        return cleaned;
    }
    
    return phone;
};

/**
 * Format currency to Kenyan Shillings
 * @param {number} amount - Amount in KES
 * @returns {string} Formatted currency
 */
exports.formatCurrency = (amount) => {
    return `Ksh ${parseFloat(amount).toFixed(2)}/=`;
};

/**
 * Format date to readable format
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type (short, long, time)
 * @returns {string} Formatted date
 */
exports.formatDate = (date, format = 'long') => {
    if (!date) return '';
    
    const d = new Date(date);
    
    if (format === 'short') {
        return d.toLocaleDateString('en-KE');
    } else if (format === 'long') {
        return d.toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } else if (format === 'time') {
        return d.toLocaleTimeString('en-KE');
    } else if (format === 'datetime') {
        return d.toLocaleString('en-KE');
    }
    
    return d.toISOString();
};

/**
 * Get time ago from date
 * @param {Date|string} date - Date to compare
 * @returns {string} Time ago string
 */
exports.getTimeAgo = (date) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now - then) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    
    return 'Just now';
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
exports.truncateText = (text, length = 100) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};

/**
 * Convert string to slug
 * @param {string} text - Text to convert
 * @returns {string} Slug
 */
exports.toSlug = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
exports.capitalizeWords = (text) => {
    if (!text) return '';
    return text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

// ===== Number Helpers =====

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage
 */
exports.calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
};

/**
 * Calculate discount price
 * @param {number} originalPrice - Original price
 * @param {number} discountPercent - Discount percentage
 * @returns {number} Discounted price
 */
exports.calculateDiscountPrice = (originalPrice, discountPercent) => {
    return originalPrice - (originalPrice * (discountPercent / 100));
};

/**
 * Calculate delivery fee
 * @param {number} orderTotal - Order total
 * @param {string} location - Delivery location
 * @returns {number} Delivery fee
 */
exports.calculateDeliveryFee = (orderTotal, location = 'Nakuru') => {
    // Free delivery for orders over 1000 KES
    if (orderTotal >= 1000) return 0;
    
    // Different rates for different locations
    const rates = {
        'Nakuru': 150,
        'Nairobi': 250,
        'Mombasa': 350,
        'Kisumu': 300,
        'Other': 400
    };
    
    return rates[location] || rates['Other'];
};

/**
 * Generate random number in range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
exports.randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ===== Object Helpers =====

/**
 * Pick specific fields from object
 * @param {Object} obj - Source object
 * @param {Array} fields - Fields to pick
 * @returns {Object} New object with picked fields
 */
exports.pick = (obj, fields) => {
    return fields.reduce((acc, field) => {
        if (obj[field] !== undefined) {
            acc[field] = obj[field];
        }
        return acc;
    }, {});
};

/**
 * Omit specific fields from object
 * @param {Object} obj - Source object
 * @param {Array} fields - Fields to omit
 * @returns {Object} New object without omitted fields
 */
exports.omit = (obj, fields) => {
    const result = { ...obj };
    fields.forEach(field => delete result[field]);
    return result;
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
exports.deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if empty
 */
exports.isEmpty = (obj) => {
    if (!obj) return true;
    if (typeof obj === 'string') return obj.trim() === '';
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
};

/**
 * Merge objects deeply
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
exports.deepMerge = (target, source) => {
    const output = { ...target };
    
    for (const key in source) {
        if (source[key] instanceof Object && key in target) {
            output[key] = exports.deepMerge(target[key], source[key]);
        } else {
            output[key] = source[key];
        }
    }
    
    return output;
};

// ===== Array Helpers =====

/**
 * Remove duplicates from array
 * @param {Array} arr - Array to process
 * @returns {Array} Array without duplicates
 */
exports.removeDuplicates = (arr) => {
    return [...new Set(arr)];
};

/**
 * Chunk array into smaller arrays
 * @param {Array} arr - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} Chunked array
 */
exports.chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
};

/**
 * Shuffle array randomly
 * @param {Array} arr - Array to shuffle
 * @returns {Array} Shuffled array
 */
exports.shuffleArray = (arr) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

/**
 * Group array by key
 * @param {Array} arr - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
exports.groupBy = (arr, key) => {
    return arr.reduce((result, item) => {
        const groupKey = item[key];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
};

// ===== Pagination Helpers =====

/**
 * Calculate pagination data
 * @param {number} total - Total items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Pagination data
 */
exports.calculatePagination = (total, page = 1, limit = 20) => {
    const totalPages = Math.ceil(total / limit);
    const hasPrev = page > 1;
    const hasNext = page < totalPages;
    
    return {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasPrev,
        hasNext,
        prevPage: hasPrev ? page - 1 : null,
        nextPage: hasNext ? page + 1 : null
    };
};

/**
 * Get pagination query options
 * @param {Object} query - Request query
 * @returns {Object} Pagination options
 */
exports.getPaginationOptions = (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;
    
    return { page, limit, skip };
};

// ===== Sorting Helpers =====

/**
 * Get sort options from query
 * @param {string} sortBy - Sort field
 * @param {string} order - Sort order (asc/desc)
 * @returns {Object} Sort options
 */
exports.getSortOptions = (sortBy = 'createdAt', order = 'desc') => {
    const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;
    return { [sortBy]: sortOrder };
};

// ===== Response Helpers =====

/**
 * Create success response
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Success response
 */
exports.successResponse = (data, message = 'Success', statusCode = 200) => {
    return {
        status: 'success',
        statusCode,
        message,
        data
    };
};

/**
 * Create error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {any} errors - Additional errors
 * @returns {Object} Error response
 */
exports.errorResponse = (message = 'Error', statusCode = 500, errors = null) => {
    return {
        status: 'error',
        statusCode,
        message,
        ...(errors && { errors })
    };
};

// ===== File Helpers =====

/**
 * Get file extension
 * @param {string} filename - File name
 * @returns {string} File extension
 */
exports.getFileExtension = (filename) => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

/**
 * Get file size in readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Readable file size
 */
exports.formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if file type is allowed
 * @param {string} mimetype - File MIME type
 * @param {Array} allowedTypes - Allowed MIME types
 * @returns {boolean} True if allowed
 */
exports.isAllowedFileType = (mimetype, allowedTypes) => {
    return allowedTypes.some(type => mimetype.includes(type));
};

// ===== URL Helpers =====

/**
 * Get domain from URL
 * @param {string} url - Full URL
 * @returns {string} Domain
 */
exports.getDomain = (url) => {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch (error) {
        return '';
    }
};

/**
 * Build URL with query parameters
 * @param {string} baseUrl - Base URL
 * @param {Object} params - Query parameters
 * @returns {string} Full URL
 */
exports.buildUrl = (baseUrl, params) => {
    const url = new URL(baseUrl);
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]);
        }
    });
    return url.toString();
};

/**
 * Sanitize URL
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL
 */
exports.sanitizeUrl = (url) => {
    try {
        const urlObj = new URL(url);
        return urlObj.toString();
    } catch (error) {
        return '';
    }
};

// ===== Cache Helpers =====

/**
 * Generate cache key
 * @param {string} prefix - Key prefix
 * @param {any} identifiers - Key identifiers
 * @returns {string} Cache key
 */
exports.generateCacheKey = (prefix, ...identifiers) => {
    return `${prefix}:${identifiers.join(':')}`;
};

/**
 * Get cache expiry time
 * @param {number} minutes - Minutes until expiry
 * @returns {number} Expiry timestamp
 */
exports.getCacheExpiry = (minutes = 60) => {
    return Date.now() + (minutes * 60 * 1000);
};

// ===== Encryption Helpers =====

/**
 * Hash data
 * @param {string} data - Data to hash
 * @returns {string} Hashed data
 */
exports.hashData = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Generate HMAC signature
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @returns {string} HMAC signature
 */
exports.generateHMAC = (data, secret) => {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

// ===== Environment Helpers =====

/**
 * Check if running in production
 * @returns {boolean} True if production
 */
exports.isProduction = () => {
    return process.env.NODE_ENV === 'production';
};

/**
 * Check if running in development
 * @returns {boolean} True if development
 */
exports.isDevelopment = () => {
    return process.env.NODE_ENV === 'development';
};

/**
 * Get environment variable with default
 * @param {string} key - Environment variable key
 * @param {any} defaultValue - Default value
 * @returns {any} Environment variable value
 */
exports.getEnv = (key, defaultValue = null) => {
    return process.env[key] || defaultValue;
};

// ===== Logging Helpers =====

/**
 * Log info message
 * @param {string} message - Message to log
 * @param {Object} data - Additional data
 */
exports.logInfo = (message, data = {}) => {
    if (!exports.isProduction()) {
        console.log(`\x1b[36m[INFO]\x1b[0m ${new Date().toISOString()} - ${message}`, data);
    }
};

/**
 * Log error message
 * @param {string} message - Message to log
 * @param {Object} error - Error object
 */
exports.logError = (message, error = {}) => {
    console.error(`\x1b[31m[ERROR]\x1b[0m ${new Date().toISOString()} - ${message}`, error);
};

/**
 * Log warning message
 * @param {string} message - Message to log
 * @param {Object} data - Additional data
 */
exports.logWarning = (message, data = {}) => {
    console.warn(`\x1b[33m[WARNING]\x1b[0m ${new Date().toISOString()} - ${message}`, data);
};

/**
 * Log success message
 * @param {string} message - Message to log
 * @param {Object} data - Additional data
 */
exports.logSuccess = (message, data = {}) => {
    if (!exports.isProduction()) {
        console.log(`\x1b[32m[SUCCESS]\x1b[0m ${new Date().toISOString()} - ${message}`, data);
    }
};

// ===== Performance Helpers =====

/**
 * Measure execution time
 * @param {Function} fn - Function to measure
 * @returns {Promise<any>} Function result with timing
 */
exports.measureTime = async (fn) => {
    const start = Date.now();
    const result = await fn();
    const end = Date.now();
    return {
        result,
        duration: end - start
    };
};

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
exports.sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retries
 * @param {number} delay - Initial delay in ms
 * @returns {Promise<any>} Function result
 */
exports.retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            exports.logWarning(`Retry ${i + 1}/${maxRetries} failed`, { error: error.message });
            await exports.sleep(delay * Math.pow(2, i));
        }
    }
    
    throw lastError;
};

// ===== M-Pesa Helpers =====

/**
 * Format M-Pesa phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number (254...)
 */
exports.formatMpesaPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
        return `254${cleaned.substring(1)}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('254')) {
        return cleaned;
    }
    
    return cleaned;
};

/**
 * Generate M-Pesa timestamp
 * @returns {string} Timestamp in YYYYMMDDHHmmss format
 */
exports.getMpesaTimestamp = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hour}${minute}${second}`;
};

/**
 * Generate M-Pesa password
 * @param {string} shortcode - M-Pesa shortcode
 * @param {string} passkey - M-Pesa passkey
 * @param {string} timestamp - Timestamp
 * @returns {string} Base64 encoded password
 */
exports.generateMpesaPassword = (shortcode, passkey, timestamp) => {
    const data = `${shortcode}${passkey}${timestamp}`;
    return Buffer.from(data).toString('base64');
};

// ===== Export all helpers =====
exports.default = {
    // String
    generateRandomString: exports.generateRandomString,
    generateOrderNumber: exports.generateOrderNumber,
    generateTransactionId: exports.generateTransactionId,
    formatPhoneNumber: exports.formatPhoneNumber,
    formatCurrency: exports.formatCurrency,
    formatDate: exports.formatDate,
    getTimeAgo: exports.getTimeAgo,
    truncateText: exports.truncateText,
    toSlug: exports.toSlug,
    capitalizeWords: exports.capitalizeWords,
    
    // Number
    calculatePercentage: exports.calculatePercentage,
    calculateDiscountPrice: exports.calculateDiscountPrice,
    calculateDeliveryFee: exports.calculateDeliveryFee,
    randomNumber: exports.randomNumber,
    
    // Object
    pick: exports.pick,
    omit: exports.omit,
    deepClone: exports.deepClone,
    isEmpty: exports.isEmpty,
    deepMerge: exports.deepMerge,
    
    // Array
    removeDuplicates: exports.removeDuplicates,
    chunkArray: exports.chunkArray,
    shuffleArray: exports.shuffleArray,
    groupBy: exports.groupBy,
    
    // Pagination
    calculatePagination: exports.calculatePagination,
    getPaginationOptions: exports.getPaginationOptions,
    
    // Sorting
    getSortOptions: exports.getSortOptions,
    
    // Response
    successResponse: exports.successResponse,
    errorResponse: exports.errorResponse,
    
    // File
    getFileExtension: exports.getFileExtension,
    formatFileSize: exports.formatFileSize,
    isAllowedFileType: exports.isAllowedFileType,
    
    // URL
    getDomain: exports.getDomain,
    buildUrl: exports.buildUrl,
    sanitizeUrl: exports.sanitizeUrl,
    
    // Cache
    generateCacheKey: exports.generateCacheKey,
    getCacheExpiry: exports.getCacheExpiry,
    
    // Encryption
    hashData: exports.hashData,
    generateHMAC: exports.generateHMAC,
    
    // Environment
    isProduction: exports.isProduction,
    isDevelopment: exports.isDevelopment,
    getEnv: exports.getEnv,
    
    // Logging
    logInfo: exports.logInfo,
    logError: exports.logError,
    logWarning: exports.logWarning,
    logSuccess: exports.logSuccess,
    
    // Performance
    measureTime: exports.measureTime,
    sleep: exports.sleep,
    retryWithBackoff: exports.retryWithBackoff,
    
    // M-Pesa
    formatMpesaPhone: exports.formatMpesaPhone,
    getMpesaTimestamp: exports.getMpesaTimestamp,
    generateMpesaPassword: exports.generateMpesaPassword
};