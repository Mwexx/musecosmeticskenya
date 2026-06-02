const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { verifyToken, requireCsrfToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const authAttemptLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many authentication attempts. Please try again later.'
});

// Validation rules
const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('phone').matches(/^(\+254|0)?[17]\d{8}$/).withMessage('Valid Kenyan phone number required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate
];

const loginValidation = [
    body('email').notEmpty().withMessage('Email or phone is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
];

const forgotPasswordValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    validate
];

// Routes
router.post('/register', authAttemptLimiter, registerValidation, authController.register);
router.post('/login', authAttemptLimiter, loginValidation, authController.login);
router.get('/google', authAttemptLimiter, authController.socialLogin);
router.get('/facebook', authAttemptLimiter, authController.socialLogin);
router.post('/logout', verifyToken, requireCsrfToken, authController.logout);
router.get('/me', verifyToken, authController.getMe);
router.put('/profile', verifyToken, requireCsrfToken, authController.updateProfile);
router.post('/change-password', verifyToken, requireCsrfToken, authController.changePassword);
router.post('/resend-verification', verifyToken, requireCsrfToken, authAttemptLimiter, authController.resendVerificationEmail);
router.post('/forgot-password', authAttemptLimiter, forgotPasswordValidation, authController.forgotPassword);
router.put('/reset-password', authAttemptLimiter, authController.resetPassword);
router.get('/verify-email', authAttemptLimiter, authController.verifyEmail);
router.delete('/delete-account', verifyToken, requireCsrfToken, authController.deleteAccount);

module.exports = router;