const nodemailer = require('nodemailer');
const config = require('./config');

// Create transporter
const transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: false,
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASSWORD
    }
});

// Verify transporter
async function verifyTransporter() {
    try {
        await transporter.verify();
        console.log('✅ Email service ready');
        return true;
    } catch (error) {
        console.error('❌ Email service error:', error.message);
        return false;
    }
}

// Send email
async function sendEmail(options) {
    const mailOptions = {
        from: config.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${options.to}`);
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        throw error;
    }
}

module.exports = {
    transporter,
    verifyTransporter,
    sendEmail
};