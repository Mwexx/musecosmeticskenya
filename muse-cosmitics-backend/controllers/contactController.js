const Contact = require('../models/Contact');
const { sendEmail } = require('../config/email');

// @desc    Submit contact form
// @route   POST /api/v1/contact
// @access  Public
exports.submitContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        
        const contact = await Contact.create({
            name,
            email,
            phone,
            subject,
            message
        });
        
        // Send auto-reply email
        try {
            await sendEmail({
                to: email,
                subject: 'We Received Your Message - Muse Cosmetics',
                html: `
                    <html>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                            <h2>Thank You for Contacting Us!</h2>
                            <p>Dear ${name},</p>
                            <p>We have received your message and will get back to you within 24 hours.</p>
                            <p><strong>Subject:</strong> ${subject}</p>
                            <p><strong>Message:</strong> ${message.substring(0, 100)}...</p>
                            <p>Best regards,<br>Muse Cosmetics Team</p>
                        </body>
                    </html>
                `
            });
        } catch (error) {
            console.error('Auto-reply email failed:', error);
        }
        
        res.status(201).json({
            success: true,
            message: 'Message sent successfully! We will respond soon.',
            data: contact
        });
        
    } catch (error) {
        console.error('Submit contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Get all contact messages
// @route   GET /api/v1/contact
// @access  Private/Admin
exports.getContactMessages = async (req, res) => {
    try {
        const { isRead, page = 1, limit = 50 } = req.query;
        
        const query = {};
        if (isRead !== undefined) query.isRead = isRead === 'true';
        
        const messages = await Contact.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        const total = await Contact.countDocuments(query);
        
        res.json({
            success: true,
            count: messages.length,
            pagination: {
                page: parseInt(page),
                total,
                pages: Math.ceil(total / parseInt(limit))
            },
            data: messages
        });
        
    } catch (error) {
        console.error('Get contact messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Mark message as read
// @route   PUT /api/v1/contact/:id/read
// @access  Private/Admin
exports.markAsRead = async (req, res) => {
    try {
        const message = await Contact.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found.'
            });
        }
        
        res.json({
            success: true,
            message: 'Message marked as read!',
            data: message
        });
        
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};

// @desc    Reply to contact message
// @route   POST /api/v1/contact/:id/reply
// @access  Private/Admin
exports.replyToMessage = async (req, res) => {
    try {
        const { reply } = req.body;
        
        const message = await Contact.findByIdAndUpdate(
            req.params.id,
            { 
                reply,
                isRead: true,
                repliedAt: new Date()
            },
            { new: true }
        );
        
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found.'
            });
        }
        
        // Send reply email
        try {
            await sendEmail({
                to: message.email,
                subject: `Re: ${message.subject}`,
                html: `
                    <html>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                            <h2>Response to Your Inquiry</h2>
                            <p>Dear ${message.name},</p>
                            <p>${reply}</p>
                            <p>Best regards,<br>Muse Cosmetics Team</p>
                        </body>
                    </html>
                `
            });
        } catch (error) {
            console.error('Reply email failed:', error);
        }
        
        res.json({
            success: true,
            message: 'Reply sent successfully!',
            data: message
        });
        
    } catch (error) {
        console.error('Reply to message error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
            error: error.message
        });
    }
};