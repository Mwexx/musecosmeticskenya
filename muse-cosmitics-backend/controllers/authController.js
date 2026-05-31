const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/config');
const User = require('../models/User');
const Cart = require('../models/Cart');
const { sendEmail } = require('../config/email');
const { welcomeEmailTemplate, resetPasswordEmailTemplate } = require('../utils/emailTemplates');

function generateSocialPhone() {
    const randomDigits = crypto.randomInt(10000000, 100000000).toString();
    return `07${randomDigits}`;
}

function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}

function normalizeLoginIdentifier(value) {
    const identifier = String(value || '').trim();
    return identifier.includes('@') ? identifier.toLowerCase() : identifier;
}

async function createSocialUser(provider, email, name) {
    let phone = generateSocialPhone();

    while (await User.findOne({ phone })) {
        phone = generateSocialPhone();
    }

    const user = await User.create({
        name,
        email,
        phone,
        password: crypto.randomBytes(32).toString('hex'),
        isVerified: true,
        avatar: 'default-avatar.jpg'
    });

    await Cart.create({ user: user._id });

    return user;
}

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const normalizedEmail = normalizeEmail(email);
        
        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { phone }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or phone already exists.'
            });
        }
        
        // Create user
        const user = await User.create({ name, email: normalizedEmail, phone, password });
        
        // Create empty cart for user
        await Cart.create({ user: user._id });
        
        // Generate verification token
        const verificationToken = user.getEmailVerificationToken();
        await user.save({ validateBeforeSave: false });
        
        // Send welcome email
        try {
            const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${verificationToken}`;
            await sendEmail({
                to: normalizedEmail,
                subject: 'Welcome to Muse Cosmetics!',
                html: welcomeEmailTemplate(name, verificationUrl)
            });
        } catch (error) {
            console.error('Email send failed:', error);
            user.verifyEmailToken = undefined;
            user.verifyEmailExpire = undefined;
            await user.save({ validateBeforeSave: false });
        }
        
        // Generate auth token
        const token = user.getSignedJwtToken();
        
        res.status(201).json({
            success: true,
            message: 'Account created successfully!',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    avatar: user.avatar
                }
            }
        });
        
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.',
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = normalizeLoginIdentifier(email);
        
        // Validate email & password
        if (!normalizedEmail || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }
        
        // Check for user (include password for comparison)
        const user = await User.findOne({ $or: [{ email: normalizedEmail }, { phone: normalizedEmail }] }).select('+password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }

        if (user.isActive === false) {
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated.'
            });
        }
        
        // Check if password matches
        const isMatch = await user.matchPassword(password);
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }
        
        // Generate token
        const token = user.getSignedJwtToken();
        
        res.json({
            success: true,
            message: 'Login successful!',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    avatar: user.avatar,
                    isVerified: user.isVerified
                }
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.',
            error: error.message
        });
    }
};

// @desc    Social login user
// @route   GET /api/v1/auth/google
// @route   GET /api/v1/auth/facebook
// @access  Public
exports.socialLogin = async (req, res) => {
    try {
        const provider = req.path.includes('facebook') ? 'facebook' : 'google';
        const { email, name, redirect } = req.query;

        if (!email || !name) {
            const fallbackRedirect = `${config.FRONTEND_URL}/login.html?error=social_login_required`;
            return res.redirect(redirect || fallbackRedirect);
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const normalizedName = String(name).trim();

        let user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            user = await createSocialUser(provider, normalizedEmail, normalizedName);
        } else if (user.isActive === false) {
            return res.redirect(`${config.FRONTEND_URL}/login.html?error=account_deactivated`);
        }

        const token = user.getSignedJwtToken();
        const userPayload = encodeURIComponent(JSON.stringify({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            isVerified: user.isVerified
        }));

        const targetUrl = redirect || `${config.FRONTEND_URL}/dashboard.html`;
        const joiner = targetUrl.includes('?') ? '&' : '?';

        return res.redirect(`${targetUrl}${joiner}token=${token}&user=${userPayload}`);
    } catch (error) {
        console.error('Social login error:', error);
        return res.redirect(`${config.FRONTEND_URL}/login.html?error=social_login_failed`);
    }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
                isVerified: user.isVerified,
                createdAt: user.createdAt
            }
        });
        
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        
        // Check if email or phone already exists
        if (email || phone) {
            const existingUser = await User.findOne({
                $or: [
                    { email: email, _id: { $ne: req.user.id } },
                    { phone: phone, _id: { $ne: req.user.id } }
                ]
            });
            
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email or phone already in use.'
                });
            }
        }
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email, phone },
            { new: true, runValidators: true }
        );
        
        res.json({
            success: true,
            message: 'Profile updated successfully!',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });
        
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Change password
// @route   POST /api/v1/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Get user with password
        const user = await User.findById(req.user.id).select('+password');
        
        // Check current password
        const isMatch = await user.matchPassword(currentPassword);
        
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect.'
            });
        }
        
        // Update password
        user.password = newPassword;
        await user.save();
        
        // Generate new token
        const token = user.getSignedJwtToken();
        
        res.json({
            success: true,
            message: 'Password changed successfully!',
            data: { token }
        });
        
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Resend verification email
// @route   POST /api/v1/auth/resend-verification
// @access  Private
exports.resendVerificationEmail = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified.'
            });
        }

        const verificationToken = user.getEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${verificationToken}`;

        try {
            await sendEmail({
                to: user.email,
                subject: 'Verify your Muse Cosmetics account',
                html: welcomeEmailTemplate(user.name, verificationUrl)
            });

            res.json({
                success: true,
                message: 'Verification email sent successfully.'
            });
        } catch (error) {
            console.error('Verification resend failed:', error);
            user.verifyEmailToken = undefined;
            user.verifyEmailExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: 'Verification email could not be sent.'
            });
        }
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Delete account
// @route   DELETE /api/v1/auth/delete-account
// @access  Private
exports.deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        user.isActive = false;
        await user.save({ validateBeforeSave: false });

        await Cart.deleteMany({ user: req.user.id });

        res.json({
            success: true,
            message: 'Account deleted successfully.'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = normalizeEmail(email);
        
        const user = await User.findOne({ email: normalizedEmail });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }
        
        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });
        
        // Create reset URL
        const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;
        
        // Send reset email
        try {
            await sendEmail({
                to: user.email,
                subject: 'Password Reset - Muse Cosmetics',
                html: resetPasswordEmailTemplate(user.name, resetUrl)
            });
            
            res.json({
                success: true,
                message: 'Password reset link sent to your email.'
            });
        } catch (error) {
            console.error('Email send failed:', error);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            
            return res.status(500).json({
                success: false,
                message: 'Email could not be sent.'
            });
        }
        
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        
        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token.'
            });
        }
        
        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        
        // Generate new token
        const authToken = user.getSignedJwtToken();
        
        res.json({
            success: true,
            message: 'Password reset successfully!',
            data: { token: authToken }
        });
        
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Verify email
// @route   GET /api/v1/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token required.'
            });
        }
        
        // Get hashed token
        const verifyEmailToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        
        // Find user with valid token
        const user = await User.findOne({
            verifyEmailToken,
            verifyEmailExpire: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token.'
            });
        }
        
        // Verify user
        user.isVerified = true;
        user.verifyEmailToken = undefined;
        user.verifyEmailExpire = undefined;
        await user.save();
        
        res.json({
            success: true,
            message: 'Email verified successfully!'
        });
        
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully!'
    });
};