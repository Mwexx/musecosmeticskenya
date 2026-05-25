/* ===== Muse Cosmetics - Validation Functions ===== */

const validator = require('validator');

// ===== Email Validation =====

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} Validation result
 */
exports.validateEmail = (email) => {
    if (!email) {
        return { valid: false, message: 'Email is required' };
    }
    
    if (!validator.isEmail(email)) {
        return { valid: false, message: 'Invalid email format' };
    }
    
    if (email.length > 100) {
        return { valid: false, message: 'Email must be less than 100 characters' };
    }
    
    return { valid: true, message: 'Valid email' };
};

/**
 * Validate email domain
 * @param {string} email - Email to validate
 * @param {Array} allowedDomains - Allowed domains
 * @returns {Object} Validation result
 */
exports.validateEmailDomain = (email, allowedDomains = []) => {
    if (!email) {
        return { valid: false, message: 'Email is required' };
    }
    
    const domain = email.split('@')[1];
    
    if (allowedDomains.length > 0 && !allowedDomains.includes(domain)) {
        return { 
            valid: false, 
            message: `Email must be from one of these domains: ${allowedDomains.join(', ')}` 
        };
    }
    
    return { valid: true, message: 'Valid email domain' };
};

/**
 * Check if email is disposable
 * @param {string} email - Email to check
 * @returns {Object} Validation result
 */
exports.isDisposableEmail = (email) => {
    const disposableDomains = [
        'tempmail.com', 'throwaway.com', 'guerrillamail.com',
        'mailinator.com', '10minutemail.com', 'fakeinbox.com'
    ];
    
    const domain = email.split('@')[1];
    
    if (disposableDomains.includes(domain)) {
        return { isDisposable: true, message: 'Disposable email not allowed' };
    }
    
    return { isDisposable: false, message: 'Valid email provider' };
};

// ===== Phone Validation =====

/**
 * Validate Kenyan phone number
 * @param {string} phone - Phone number to validate
 * @returns {Object} Validation result
 */
exports.validateKenyanPhone = (phone) => {
    if (!phone) {
        return { valid: false, message: 'Phone number is required' };
    }
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check length
    if (cleaned.length < 9 || cleaned.length > 12) {
        return { valid: false, message: 'Phone number must be 9-12 digits' };
    }
    
    // Check format (07XX, 01XX, +2547XX, +2541XX)
    const kenyanPhoneRegex = /^(\+254|0)?[17]\d{8}$/;
    
    if (!kenyanPhoneRegex.test(cleaned)) {
        return { 
            valid: false, 
            message: 'Invalid Kenyan phone number format. Use format: 07XX XXX XXX or +2547XX XXX XXX' 
        };
    }
    
    return { valid: true, message: 'Valid Kenyan phone number' };
};

/**
 * Validate international phone number
 * @param {string} phone - Phone number to validate
 * @param {string} countryCode - Country code
 * @returns {Object} Validation result
 */
exports.validateInternationalPhone = (phone, countryCode = 'KE') => {
    if (!phone) {
        return { valid: false, message: 'Phone number is required' };
    }
    
    if (!validator.isMobilePhone(phone, countryCode === 'KE' ? 'any' : countryCode)) {
        return { valid: false, message: 'Invalid phone number format' };
    }
    
    return { valid: true, message: 'Valid phone number' };
};

// ===== Password Validation =====

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with strength score
 */
exports.validatePasswordStrength = (password) => {
    if (!password) {
        return { valid: false, message: 'Password is required', strength: 0 };
    }
    
    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters', strength: 1 };
    }
    
    let strength = 0;
    const feedback = [];
    
    // Length check
    if (password.length >= 8) {
        strength += 25;
    } else {
        feedback.push('Use at least 8 characters');
    }
    
    // Lowercase check
    if (/[a-z]/.test(password)) {
        strength += 15;
    } else {
        feedback.push('Add lowercase letters');
    }
    
    // Uppercase check
    if (/[A-Z]/.test(password)) {
        strength += 15;
    } else {
        feedback.push('Add uppercase letters');
    }
    
    // Number check
    if (/[0-9]/.test(password)) {
        strength += 15;
    } else {
        feedback.push('Add numbers');
    }
    
    // Special character check
    if (/[^a-zA-Z0-9]/.test(password)) {
        strength += 20;
    } else {
        feedback.push('Add special characters');
    }
    
    // Common password check
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (commonPasswords.includes(password.toLowerCase())) {
        strength = 0;
        feedback.push('Avoid common passwords');
    }
    
    const isValid = strength >= 50;
    const strengthLevel = strength < 25 ? 'Weak' : strength < 50 ? 'Fair' : strength < 75 ? 'Good' : 'Strong';
    
    return {
        valid: isValid,
        message: isValid ? 'Valid password' : 'Password is too weak',
        strength,
        strengthLevel,
        feedback
    };
};

/**
 * Validate password match
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {Object} Validation result
 */
exports.validatePasswordMatch = (password, confirmPassword) => {
    if (!confirmPassword) {
        return { valid: false, message: 'Please confirm your password' };
    }
    
    if (password !== confirmPassword) {
        return { valid: false, message: 'Passwords do not match' };
    }
    
    return { valid: true, message: 'Passwords match' };
};

// ===== Name Validation =====

/**
 * Validate name
 * @param {string} name - Name to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {Object} Validation result
 */
exports.validateName = (name, minLength = 2, maxLength = 50) => {
    if (!name) {
        return { valid: false, message: 'Name is required' };
    }
    
    const trimmed = name.trim();
    
    if (trimmed.length < minLength) {
        return { valid: false, message: `Name must be at least ${minLength} characters` };
    }
    
    if (trimmed.length > maxLength) {
        return { valid: false, message: `Name must be less than ${maxLength} characters` };
    }
    
    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(trimmed)) {
        return { valid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    
    return { valid: true, message: 'Valid name' };
};

/**
 * Validate full name (first + last)
 * @param {string} fullName - Full name to validate
 * @returns {Object} Validation result
 */
exports.validateFullName = (fullName) => {
    if (!fullName) {
        return { valid: false, message: 'Full name is required' };
    }
    
    const parts = fullName.trim().split(/\s+/);
    
    if (parts.length < 2) {
        return { valid: false, message: 'Please provide both first and last name' };
    }
    
    if (parts.length > 5) {
        return { valid: false, message: 'Name is too long' };
    }
    
    for (const part of parts) {
        const result = exports.validateName(part);
        if (!result.valid) {
            return result;
        }
    }
    
    return { valid: true, message: 'Valid full name' };
};

// ===== Address Validation =====

/**
 * Validate physical address
 * @param {string} address - Address to validate
 * @returns {Object} Validation result
 */
exports.validateAddress = (address) => {
    if (!address) {
        return { valid: false, message: 'Address is required' };
    }
    
    if (address.trim().length < 10) {
        return { valid: false, message: 'Address is too short' };
    }
    
    if (address.length > 200) {
        return { valid: false, message: 'Address is too long' };
    }
    
    return { valid: true, message: 'Valid address' };
};

/**
 * Validate Kenyan county
 * @param {string} county - County name
 * @returns {Object} Validation result
 */
exports.validateKenyanCounty = (county) => {
    const kenyanCounties = [
        'Nakuru', 'Nairobi', 'Mombasa', 'Kisumu', 'Uasin Gishu',
        'Kiambu', 'Machakos', 'Kajiado', 'Nyeri', 'Meru',
        'Kilifi', 'Kakamega', 'Bungoma', 'Kericho', 'Nandi',
        'Elgeyo Marakwet', 'Bomet', 'Nyamira', 'Kisii', 'Migori',
        'Homa Bay', 'Siaya', 'Busia', 'Vihiga', 'Trans Nzoia',
        'West Pokot', 'Turkana', 'Samburu', 'Laikipia', 'Isiolo',
        'Marsabit', 'Wajir', 'Mandera', 'Garissa', 'Tana River',
        'Lamu', 'Taita Taveta', 'Kwale', 'Kirinyaga', 'Murang\'a',
        'Tharaka Nithi', 'Embu', 'Kitui', 'Makueni', 'Baringo',
        'Nyandarua', 'Narok'
    ];
    
    if (!county) {
        return { valid: false, message: 'County is required' };
    }
    
    const normalizedCounty = county.trim().toLowerCase();
    const isValid = kenyanCounties.some(c => c.toLowerCase() === normalizedCounty);
    
    if (!isValid) {
        return { valid: false, message: 'Invalid Kenyan county' };
    }
    
    return { valid: true, message: 'Valid county' };
};

// ===== URL Validation =====

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @param {Array} allowedProtocols - Allowed protocols
 * @returns {Object} Validation result
 */
exports.validateUrl = (url, allowedProtocols = ['http', 'https']) => {
    if (!url) {
        return { valid: false, message: 'URL is required' };
    }
    
    if (!validator.isURL(url, { protocols: allowedProtocols })) {
        return { valid: false, message: 'Invalid URL format' };
    }
    
    return { valid: true, message: 'Valid URL' };
};

/**
 * Validate image URL
 * @param {string} url - Image URL to validate
 * @returns {Object} Validation result
 */
exports.validateImageUrl = (url) => {
    const result = exports.validateUrl(url);
    
    if (!result.valid) {
        return result;
    }
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext));
    
    if (!hasImageExtension) {
        return { valid: false, message: 'URL must point to an image file' };
    }
    
    return { valid: true, message: 'Valid image URL' };
};

// ===== Number Validation =====

/**
 * Validate positive number
 * @param {number} value - Number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {Object} Validation result
 */
exports.validatePositiveNumber = (value, min = 0, max = Infinity) => {
    if (value === undefined || value === null) {
        return { valid: false, message: 'Number is required' };
    }
    
    const num = parseFloat(value);
    
    if (isNaN(num)) {
        return { valid: false, message: 'Must be a valid number' };
    }
    
    if (num < min) {
        return { valid: false, message: `Must be at least ${min}` };
    }
    
    if (num > max) {
        return { valid: false, message: `Must be at most ${max}` };
    }
    
    return { valid: true, message: 'Valid number' };
};

/**
 * Validate price
 * @param {number} price - Price to validate
 * @returns {Object} Validation result
 */
exports.validatePrice = (price) => {
    return exports.validatePositiveNumber(price, 0, 1000000);
};

/**
 * Validate quantity
 * @param {number} quantity - Quantity to validate
 * @returns {Object} Validation result
 */
exports.validateQuantity = (quantity) => {
    return exports.validatePositiveNumber(quantity, 1, 10000);
};

/**
 * Validate percentage
 * @param {number} percentage - Percentage to validate
 * @returns {Object} Validation result
 */
exports.validatePercentage = (percentage) => {
    return exports.validatePositiveNumber(percentage, 0, 100);
};

// ===== Date Validation =====

/**
 * Validate date
 * @param {string|Date} date - Date to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
exports.validateDate = (date, options = {}) => {
    const { minDate, maxDate, required = true } = options;
    
    if (!date) {
        if (required) {
            return { valid: false, message: 'Date is required' };
        }
        return { valid: true, message: 'Valid date' };
    }
    
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
        return { valid: false, message: 'Invalid date format' };
    }
    
    if (minDate && dateObj < new Date(minDate)) {
        return { valid: false, message: `Date must be after ${minDate}` };
    }
    
    if (maxDate && dateObj > new Date(maxDate)) {
        return { valid: false, message: `Date must be before ${maxDate}` };
    }
    
    return { valid: true, message: 'Valid date' };
};

/**
 * Validate age
 * @param {string|Date} birthDate - Birth date
 * @param {number} minAge - Minimum age
 * @param {number} maxAge - Maximum age
 * @returns {Object} Validation result
 */
exports.validateAge = (birthDate, minAge = 18, maxAge = 120) => {
    if (!birthDate) {
        return { valid: false, message: 'Birth date is required' };
    }
    
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    if (age < minAge) {
        return { valid: false, message: `Must be at least ${minAge} years old` };
    }
    
    if (age > maxAge) {
        return { valid: false, message: `Must be at most ${maxAge} years old` };
    }
    
    return { valid: true, message: 'Valid age', age };
};

// ===== File Validation =====

/**
 * Validate file type
 * @param {string} mimetype - File MIME type
 * @param {Array} allowedTypes - Allowed MIME types
 * @returns {Object} Validation result
 */
exports.validateFileType = (mimetype, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
    if (!mimetype) {
        return { valid: false, message: 'File type is required' };
    }
    
    if (!allowedTypes.includes(mimetype)) {
        return { 
            valid: false, 
            message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` 
        };
    }
    
    return { valid: true, message: 'Valid file type' };
};

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @param {number} maxSize - Maximum size in bytes
 * @returns {Object} Validation result
 */
exports.validateFileSize = (size, maxSize = 5 * 1024 * 1024) => {
    if (size === undefined || size === null) {
        return { valid: false, message: 'File size is required' };
    }
    
    if (size > maxSize) {
        const maxMB = (maxSize / (1024 * 1024)).toFixed(2);
        return { valid: false, message: `File size must be less than ${maxMB}MB` };
    }
    
    if (size === 0) {
        return { valid: false, message: 'File cannot be empty' };
    }
    
    return { valid: true, message: 'Valid file size' };
};

// ===== Business Logic Validation =====

/**
 * Validate product data
 * @param {Object} product - Product data
 * @returns {Object} Validation result
 */
exports.validateProduct = (product) => {
    const errors = [];
    
    // Name validation
    const nameResult = exports.validateName(product.name, 3, 200);
    if (!nameResult.valid) errors.push(nameResult.message);
    
    // Description validation
    if (!product.description || product.description.length < 10) {
        errors.push('Description must be at least 10 characters');
    }
    
    // Category validation
    const validCategories = ['lotions', 'jelly', 'milking', 'shampoo'];
    if (!product.category || !validCategories.includes(product.category)) {
        errors.push('Invalid product category');
    }
    
    // Price validation
    const priceResult = exports.validatePrice(product.price);
    if (!priceResult.valid) errors.push(priceResult.message);
    
    // Stock validation
    const stockResult = exports.validateQuantity(product.stock);
    if (!stockResult.valid) errors.push(stockResult.message);
    
    return {
        valid: errors.length === 0,
        message: errors.length === 0 ? 'Valid product' : 'Product validation failed',
        errors
    };
};

/**
 * Validate order data
 * @param {Object} order - Order data
 * @returns {Object} Validation result
 */
exports.validateOrder = (order) => {
    const errors = [];
    
    // Items validation
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
        errors.push('Order must contain at least one item');
    } else {
        order.items.forEach((item, index) => {
            if (!item.product) {
                errors.push(`Item ${index + 1}: Product is required`);
            }
            if (!item.quantity || item.quantity < 1) {
                errors.push(`Item ${index + 1}: Quantity must be at least 1`);
            }
        });
    }
    
    // Delivery address validation
    const addressResult = exports.validateAddress(order.deliveryAddress);
    if (!addressResult.valid) errors.push(addressResult.message);
    
    // Phone validation
    const phoneResult = exports.validateKenyanPhone(order.phone);
    if (!phoneResult.valid) errors.push(phoneResult.message);
    
    // Payment method validation
    const validPaymentMethods = ['mpesa', 'cash', 'bank'];
    if (!order.paymentMethod || !validPaymentMethods.includes(order.paymentMethod)) {
        errors.push('Invalid payment method');
    }
    
    return {
        valid: errors.length === 0,
        message: errors.length === 0 ? 'Valid order' : 'Order validation failed',
        errors
    };
};

/**
 * Validate review data
 * @param {Object} review - Review data
 * @returns {Object} Validation result
 */
exports.validateReview = (review) => {
    const errors = [];
    
    // Product validation
    if (!review.product) {
        errors.push('Product is required');
    }
    
    // Rating validation
    if (!review.rating || review.rating < 1 || review.rating > 5) {
        errors.push('Rating must be between 1 and 5');
    }
    
    // Comment validation
    if (!review.comment || review.comment.length < 10) {
        errors.push('Comment must be at least 10 characters');
    }
    
    if (review.comment.length > 1000) {
        errors.push('Comment must be less than 1000 characters');
    }
    
    return {
        valid: errors.length === 0,
        message: errors.length === 0 ? 'Valid review' : 'Review validation failed',
        errors
    };
};

/**
 * Validate contact form data
 * @param {Object} contact - Contact data
 * @returns {Object} Validation result
 */
exports.validateContact = (contact) => {
    const errors = [];
    
    // Name validation
    const nameResult = exports.validateName(contact.name, 2, 100);
    if (!nameResult.valid) errors.push(nameResult.message);
    
    // Email validation
    const emailResult = exports.validateEmail(contact.email);
    if (!emailResult.valid) errors.push(emailResult.message);
    
    // Subject validation
    if (!contact.subject || contact.subject.length < 5) {
        errors.push('Subject must be at least 5 characters');
    }
    
    // Message validation
    if (!contact.message || contact.message.length < 10) {
        errors.push('Message must be at least 10 characters');
    }
    
    if (contact.message.length > 2000) {
        errors.push('Message must be less than 2000 characters');
    }
    
    return {
        valid: errors.length === 0,
        message: errors.length === 0 ? 'Valid contact form' : 'Contact form validation failed',
        errors
    };
};

// ===== Security Validation =====

/**
 * Validate against SQL injection
 * @param {string} input - Input to validate
 * @returns {Object} Validation result
 */
exports.validateNoSQLInjection = (input) => {
    if (!input) {
        return { valid: true, message: 'Valid input' };
    }
    
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b)/i,
        /(\b(UNION|JOIN|WHERE|FROM|INTO|VALUES)\b)/i,
        /(--|;|\/\*|\*\/)/,
        /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i
    ];
    
    for (const pattern of sqlPatterns) {
        if (pattern.test(input)) {
            return { valid: false, message: 'Potentially malicious input detected' };
        }
    }
    
    return { valid: true, message: 'Valid input' };
};

/**
 * Validate against XSS
 * @param {string} input - Input to validate
 * @returns {Object} Validation result
 */
exports.validateNoXSS = (input) => {
    if (!input) {
        return { valid: true, message: 'Valid input' };
    }
    
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<[^>]*\s+on\w+\s*=\s*["'][^"']*["'][^>]*>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /on\w+\s*=/gi
    ];
    
    for (const pattern of xssPatterns) {
        if (pattern.test(input)) {
            return { valid: false, message: 'Potentially malicious input detected' };
        }
    }
    
    return { valid: true, message: 'Valid input' };
};

/**
 * Sanitize string input
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
exports.sanitizeInput = (input) => {
    if (!input || typeof input !== 'string') {
        return input;
    }
    
    return input
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
};

// ===== Express Validator Helpers =====

/**
 * Create custom validation middleware
 * @param {Function} validationFn - Validation function
 * @param {string} fieldName - Field name
 * @param {string} message - Error message
 * @returns {Function} Express validator middleware
 */
exports.createCustomValidator = (validationFn, fieldName, message) => {
    return (value, { req }) => {
        const result = validationFn(value);
        if (!result.valid) {
            throw new Error(message || result.message);
        }
        return value;
    };
};

/**
 * Validate request body
 * @param {Object} data - Request data
 * @param {Object} schema - Validation schema
 * @returns {Object} Validation result
 */
exports.validateRequestBody = (data, schema) => {
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
        const value = data[field];
        
        if (rules.required && !value) {
            errors.push(`${field} is required`);
            continue;
        }
        
        if (value && rules.validate) {
            const result = rules.validate(value);
            if (!result.valid) {
                errors.push(`${field}: ${result.message}`);
            }
        }
        
        if (value && rules.minLength && value.length < rules.minLength) {
            errors.push(`${field} must be at least ${rules.minLength} characters`);
        }
        
        if (value && rules.maxLength && value.length > rules.maxLength) {
            errors.push(`${field} must be less than ${rules.maxLength} characters`);
        }
    }
    
    return {
        valid: errors.length === 0,
        message: errors.length === 0 ? 'Validation passed' : 'Validation failed',
        errors
    };
};

// ===== Export all validators =====
exports.default = {
    // Email
    validateEmail: exports.validateEmail,
    validateEmailDomain: exports.validateEmailDomain,
    isDisposableEmail: exports.isDisposableEmail,
    
    // Phone
    validateKenyanPhone: exports.validateKenyanPhone,
    validateInternationalPhone: exports.validateInternationalPhone,
    
    // Password
    validatePasswordStrength: exports.validatePasswordStrength,
    validatePasswordMatch: exports.validatePasswordMatch,
    
    // Name
    validateName: exports.validateName,
    validateFullName: exports.validateFullName,
    
    // Address
    validateAddress: exports.validateAddress,
    validateKenyanCounty: exports.validateKenyanCounty,
    
    // URL
    validateUrl: exports.validateUrl,
    validateImageUrl: exports.validateImageUrl,
    
    // Number
    validatePositiveNumber: exports.validatePositiveNumber,
    validatePrice: exports.validatePrice,
    validateQuantity: exports.validateQuantity,
    validatePercentage: exports.validatePercentage,
    
    // Date
    validateDate: exports.validateDate,
    validateAge: exports.validateAge,
    
    // File
    validateFileType: exports.validateFileType,
    validateFileSize: exports.validateFileSize,
    
    // Business Logic
    validateProduct: exports.validateProduct,
    validateOrder: exports.validateOrder,
    validateReview: exports.validateReview,
    validateContact: exports.validateContact,
    
    // Security
    validateNoSQLInjection: exports.validateNoSQLInjection,
    validateNoXSS: exports.validateNoXSS,
    sanitizeInput: exports.sanitizeInput,
    
    // Express Validator
    createCustomValidator: exports.createCustomValidator,
    validateRequestBody: exports.validateRequestBody
};