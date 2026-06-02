const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

const AUTH_COOKIE_NAME = 'token';
const CSRF_COOKIE_NAME = 'csrfToken';

function getCookieOptions() {
    return {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: config.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    };
}

function getCsrfCookieOptions() {
    return {
        httpOnly: false,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: config.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    };
}

function issueCsrfToken(res) {
    const csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE_NAME, csrfToken, getCsrfCookieOptions());
    return csrfToken;
}

function setAuthCookies(res, token) {
    res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());
    return issueCsrfToken(res);
}

function clearAuthCookies(res) {
    res.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
    res.clearCookie(CSRF_COOKIE_NAME, { path: '/' });
}

function getTokenFromRequest(req) {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        return req.headers.authorization.split(' ')[1];
    }

    if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
        return req.cookies[AUTH_COOKIE_NAME];
    }

    return null;
}

function requestHasUnsafeMethod(req) {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(String(req.method || '').toUpperCase());
}

function requireCsrfToken(req, res, next) {
    if (!requestHasUnsafeMethod(req)) {
        return next();
    }

    const csrfCookie = req.cookies && req.cookies[CSRF_COOKIE_NAME];
    const csrfHeader = req.get('x-csrf-token') || req.get('csrf-token');

    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        return res.status(403).json({
            success: false,
            message: 'Invalid CSRF token.'
        });
    }

    return next();
}

// Verify JWT token
exports.verifyToken = async (req, res, next) => {
    let token = getTokenFromRequest(req);
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }
    
    try {
        // Verify token
        const decoded = jwt.verify(token, config.JWT_SECRET);
        
        // Get user from token
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found.'
            });
        }

        if (user.isActive === false) {
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated.'
            });
        }
        
        // Attach user to request
        req.user = user;

        if (res && req.cookies && !req.cookies[CSRF_COOKIE_NAME]) {
            issueCsrfToken(res);
        }

        next();
        
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
};

// Optional auth (doesn't require login but adds user if logged in)
exports.optionalAuth = async (req, res, next) => {
    let token = getTokenFromRequest(req);
    
    if (token) {
        try {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (user && user.isActive === false) {
                req.user = null;
                return next();
            }
            req.user = user;
        } catch (error) {
            // Token invalid, continue without user
        }
    }
    
    next();
};

exports.setAuthCookies = setAuthCookies;
exports.clearAuthCookies = clearAuthCookies;
exports.requireCsrfToken = requireCsrfToken;
exports.issueCsrfToken = issueCsrfToken;